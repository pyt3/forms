const APP_TITLE = 'QualityLabHub';
const SHEET_NAME = 'QualityLabHubRecords';
const HEADER = [
  'id',
  'type',
  'recordDate',
  'title',
  'department',
  'status',
  'payloadJson',
  'attachmentsJson',
  'createdAt',
  'updatedAt',
  'signatureDataJson' // new: raw signaturePad.toData() JSON
];

const TempUploadFolderId = '17qyfta4jObGgXL4NkR5YaCvaKSoKcnq4';

// doGet removed: Frontend is hosted externally on GitHub. Only doPost is used for API.

Logger = BetterLog.useSpreadsheet()
function doPost(e) {
  Logger.log("aaaa")
  try {
    const body = parseBody_(e);
    const action = (body.action || '').toLowerCase();


    if (action === 'upsertrecord') {
      return jsonOut({ ok: true, data: upsertRecord_(body.record || {}) });
    }

    if (action === 'deleterecord') {
      deleteRecord_(body.id);
      return jsonOut({ ok: true });
    }

    if (action === 'getuploadauth') {
      return jsonOut({
        ok: true,
        data: {
          accessToken: ScriptApp.getOAuthToken(),
          folderId: TempUploadFolderId
        }
      });
    }

    if (action === 'uploadbase64') {
      const res = uploadBase64File_(body.fileName, body.mimeType, body.base64, TempUploadFolderId);
      return jsonOut({ ok: true, data: res });
    }

    // เพิ่มรองรับ listRecords (mode: 'records')
    if (action === 'listrecords' || body.mode === 'records') {
      const startDate = (body.startDate || '').trim();
      const endDate = (body.endDate || '').trim();
      const type = (body.type || '').trim();
      return jsonOut({ ok: true, data: listRecords_(startDate, endDate, type) });
    }

    return jsonOut({ ok: false, message: 'Unknown action' });
  }
  catch (e) { //with stack tracing if your exceptions bubble up to here
    e = (typeof e === 'string') ? new Error(e) : e;
    Logger.severe('%s: %s (line %s, file "%s"). Stack: "%s" .', e.name || '',
      e.message || '', e.lineNumber || '', e.fileName || '', e.stack || '');
    return jsonOut({ ok: false, message: e.message || String(e) });
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function upsertRecord_(record) {
  if (!record || !record.type) {
    throw new Error('Invalid record payload');
  }

  const sh = getSheet_();
  const now = new Date();
  const id = record.id || Utilities.getUuid();
  const rowIndex = findRowById_(id);

  let signatureDataJson = '';
  if (record.signatureData && Array.isArray(record.signatureData)) {
    signatureDataJson = JSON.stringify(record.signatureData);
  } 

  // Only save file id for attachments (EQA/IQC)
  const attachmentsIds = (record.attachments || []).map(f => ({id: f.id, name: f.name, mimeType: f.mimeType}));
  const payload = [
    id,
    String(record.type || '').toUpperCase(),
    normalizeDate_(record.recordDate),
    String(record.title || ''),
    String(record.department || ''),
    String(record.status || ''),
    JSON.stringify(record.data || {}),
    JSON.stringify(attachmentsIds),
    rowIndex ? sh.getRange(rowIndex, 11).getValue() || now : now,
    now,
    signatureDataJson // new: save signaturePad.toData() array
  ];

  if (rowIndex) {
    sh.getRange(rowIndex, 1, 1, HEADER.length).setValues([payload]);
  } else {
    sh.appendRow(payload);
  }

  return toRecordObject_(payload);
}

function deleteRecord_(id) {
  if (!id) {
    throw new Error('Missing id');
  }

  const sh = getSheet_();
  const rowIndex = findRowById_(id);
  if (!rowIndex) {
    return;
  }

  const row = sh.getRange(rowIndex, 1, 1, HEADER.length).getValues()[0];
  const signatureFileId = row[7];
  const attachments = parseJsonSafe_(row[9], []);

  trashFileIfExists_(signatureFileId);
  attachments.forEach((f) => trashFileIfExists_(f.id));
  sh.deleteRow(rowIndex);
}

function listRecords_(startDate, endDate, type) {
  const sh = getSheet_();
  const lr = sh.getLastRow();
  if (lr < 2) {
    return [];
  }

  const rows = sh.getRange(2, 1, lr - 1, HEADER.length).getValues();
  const start = startDate ? new Date(startDate + 'T00:00:00') : null;
  const end = endDate ? new Date(endDate + 'T23:59:59') : null;
  const typeUpper = (type || '').toUpperCase();

  return rows
    .map(toRecordObject_)
    .filter((r) => {
      if (typeUpper && typeUpper !== 'ALL' && r.type !== typeUpper) {
        return false;
      }
      if (!start && !end) {
        return true;
      }
      if (!r.recordDate) {
        return false;
      }
      const d = new Date(r.recordDate + 'T12:00:00');
      if (start && d < start) {
        return false;
      }
      if (end && d > end) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

function toRecordObject_(row) {
  const obj = {
    id: row[0],
    type: row[1],
    recordDate: normalizeDate_(row[2]),
    title: row[3] || '',
    department: row[4] || '',
    status: row[5] || '',
    data: parseJsonSafe_(row[6], {}),
    attachments: parseJsonSafe_(row[7], []),
    createdAt: toIsoString_(row[8]),
    updatedAt: toIsoString_(row[9]),
    signatureData: parseJsonSafe_(row[10], []) // new: return signaturePad.toData() array
  };
  return obj;
}

function saveSignature_(dataUrl, recordId) {
  const mt = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!mt) {
    throw new Error('Invalid signature data URL');
  }
  const mimeType = mt[1] || 'image/png';
  const bytes = Utilities.base64Decode(mt[2]);
  const ext = mimeType.split('/')[1] || 'png';
  const blob = Utilities.newBlob(bytes, mimeType, 'signature_' + recordId + '.' + ext);
  const file = getUploadFolder_().createFile(blob);
  return {
    fileId: file.getId(),
    url: file.getUrl()
  };
}

function uploadBase64File_(fileName, mimeType, base64, folderId) {
  if (!fileName || !base64) {
    throw new Error('Missing file content');
  }
  const folder = folderId ? DriveApp.getFolderById(folderId) : getUploadFolder_();
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mimeType || 'application/octet-stream', fileName);
  const file = folder.createFile(blob);
  return {
    id: file.getId(),
    name: file.getName(),
    mimeType: file.getMimeType(),
    url: file.getUrl(),
    size: file.getSize()
  };
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('This script must be bound to a Google Spreadsheet');
  }
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
    sh.getRange(1, 1, 1, HEADER.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  // Ensure new column exists if sheet was created before
  if (sh.getLastColumn() < HEADER.length) {
    sh.insertColumnAfter(sh.getLastColumn());
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
  }
  return sh;
}

function getUploadFolder_() {
  const props = PropertiesService.getScriptProperties();
  const key = 'QUALITYLAB_UPLOAD_FOLDER_ID';
  const folderId = props.getProperty(key);
  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (err) {
      // ignore and recreate folder
    }
  }

  const folder = DriveApp.createFolder('QualityLabHub Uploads');
  props.setProperty(key, folder.getId());
  return folder;
}

function findRowById_(id) {
  const sh = getSheet_();
  const lr = sh.getLastRow();
  if (lr < 2) {
    return 0;
  }
  const ids = sh.getRange(2, 1, lr - 1, 1).getValues().flat();
  const idx = ids.indexOf(id);
  return idx >= 0 ? idx + 2 : 0;
}

function trashFileIfExists_(fileId) {
  if (!fileId) {
    return;
  }
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
  } catch (err) {
    // Ignore not found/permission errors to keep delete flow resilient.
  }
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }
  return JSON.parse(e.postData.contents);
}

function parseJsonSafe_(text, fallback) {
  if (!text) {
    return fallback;
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    return fallback;
  }
}

function normalizeDate_(d) {
  if (!d) {
    return '';
  }
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) {
    return '';
  }
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function toIsoString_(d) {
  if (!d) {
    return '';
  }
  const date = d instanceof Date ? d : new Date(d);
  return isNaN(date.getTime()) ? '' : date.toISOString();
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
