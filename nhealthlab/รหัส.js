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
  'operatorSignatureJson',
  'supervisorSignatureJson',
  'createdAt',
  'updatedAt'
];

const TempUploadFolderId = '17qyfta4jObGgXL4NkR5YaCvaKSoKcnq4';

// doGet removed: Frontend is hosted externally on GitHub. Only doPost is used for API.

Logger = BetterLog.useSpreadsheet()

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(APP_TITLE)
    .addItem('SetUp database', 'SetUp')
    .addToUi();
}

function SetUp() {
  return setupDatabase_();
}

function setupDatabase_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('This script must be bound to a Google Spreadsheet');
  }

  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }

  sh.clear();
  sh.clearFormats();
  sh.clearNotes();
  if (sh.getMaxColumns() < HEADER.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), HEADER.length - sh.getMaxColumns());
  }
  sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
  sh.getRange(1, 1, 1, HEADER.length).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 140);
  sh.setColumnWidth(2, 90);
  sh.setColumnWidth(3, 110);
  sh.setColumnWidth(4, 220);
  sh.setColumnWidth(5, 150);
  sh.setColumnWidth(6, 120);
  sh.setColumnWidth(7, 320);
  sh.setColumnWidth(8, 220);
  sh.setColumnWidth(9, 220);
  sh.setColumnWidth(10, 220);
  sh.setColumnWidth(11, 140);
  sh.setColumnWidth(12, 140);

  return {
    sheetName: SHEET_NAME,
    headers: HEADER.slice()
  };
}

function doPost(e) {
  Logger.log("aaaa")
  try {
    const body = parseBody_(e);
    const action = (body.action || '').toLowerCase();


    if (action === 'upsertrecord') {
      return jsonOut({ ok: true, data: upsertRecord_(body.record || {}) });
    }

    if (action === 'setupdatabase' || action === 'setup') {
      return jsonOut({ ok: true, data: setupDatabase_() });
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

    if (action === 'movefilestorecordfolder') {
      const recordId = body.recordId;
      const type = body.type || 'MISC';
      const attachments = body.attachments || [];
      const fileIds = attachments.map(f => f.id);
      batchMoveFiles_(fileIds, recordId, type);
      return jsonOut({ ok: true });
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

function normalizeSignaturePayload_(record) {
  const direct = record || {};
  const operatorSource = Array.isArray(direct.operatorSignatureData)
    ? direct.operatorSignatureData
    : (Array.isArray(direct.signatureData) ? direct.signatureData : []);
  const supervisorSource = Array.isArray(direct.supervisorSignatureData)
    ? direct.supervisorSignatureData
    : (direct.signatureData && !Array.isArray(direct.signatureData) && Array.isArray(direct.signatureData.supervisor)
      ? direct.signatureData.supervisor
      : []);

  return {
    operator: operatorSource,
    supervisor: supervisorSource
  };
}

function upsertRecord_(record) {
  if (!record || !record.type) {
    throw new Error('Invalid record payload');
  }
  let lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Could not acquire lock after 30 seconds. Please try again.');
  }

  const sh = getSheet_();
  const now = new Date();
  const id = record.id || generateNewId_(record.type);
  const rowIndex = findRowById_(id);

  const signaturePayload = normalizeSignaturePayload_(record);

  // Only save file id for attachments (EQA/IQC)
  const attachmentsIds = (record.attachments || []).map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType, size: f.size }));
  const payload = [
    id,
    String(record.type || '').toUpperCase(),
    normalizeDate_(record.recordDate),
    String(record.title || ''),
    String(record.department || ''),
    String(record.status || ''),
    JSON.stringify(record.data || {}),
    JSON.stringify(attachmentsIds),
    JSON.stringify(signaturePayload.operator),
    JSON.stringify(signaturePayload.supervisor),
    rowIndex ? sh.getRange(rowIndex, 11).getValue() || now : now,
    now,
  ];

  if (rowIndex) {
    sh.getRange(rowIndex, 1, 1, HEADER.length).setValues([payload]);
  } else {
    sh.appendRow(payload);
  }
  let recordObj = toRecordObject_(payload);

  lock.releaseLock();
  return recordObj;
}

function batchRemoveFiles_(fileIds) {
  var requests = {
    batchPath: "batch/drive/v3", // batch path. This will be introduced in the near future.
    requests: fileIds.map(id => ({
      method: "DELETE",
      endpoint: "files/" + id
    })),
    accessToken: ScriptApp.getOAuthToken()
  };
  var result = BatchRequest.Do(requests); // Using this library
  Logger.log(result);
}

function batchMoveFiles_(fileIds, recordId, type) {
  let sourceFolderId = DriveApp.getFolderById(TempUploadFolderId).getParents().next().getId();
  let folderId = getRecordFolder_(sourceFolderId, recordId, type).getId()
  var requests = fileIds.map(id => ({
    method: "PATCH",
    endpoint: 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id) + '?addParents=' + encodeURIComponent(folderId) + '&removeParents=' + encodeURIComponent(sourceFolderId),
    requestBody: {}
  }));

  const responses = BatchRequest.EDo({
    batchPath: "batch/drive/v3",
    requests: requests,
    useFetchAll: true,
    accessToken: ScriptApp.getOAuthToken()
  });

  responses.forEach(function (item) {
    if (!item || typeof item !== 'object' || item.error) {
      Logger.log('Unable to ' + actionLabel + ': ' + JSON.stringify(item));
    }
  });
  return responses;
}

function generateNewId_(type) {
  const prefix = (type || 'REC').toUpperCase().substring(0, 3);
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  return `${prefix}-${timestamp}`;
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
  const attachments = parseJsonSafe_(row[7], []);
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
  const operatorSignatureData = parseJsonSafe_(row[8], []);
  const supervisorSignatureData = parseJsonSafe_(row[9], []);
  const obj = {
    id: row[0],
    type: row[1],
    recordDate: normalizeDate_(row[2]),
    title: row[3] || '',
    department: row[4] || '',
    status: row[5] || '',
    data: parseJsonSafe_(row[6], {}),
    attachments: parseJsonSafe_(row[7], []),
    operatorSignatureData,
    supervisorSignatureData,
    createdAt: toIsoString_(row[10]),
    updatedAt: toIsoString_(row[11]),
    signatureData: supervisorSignatureData.length > 0
      ? {
          operator: operatorSignatureData,
          supervisor: supervisorSignatureData
        }
      : operatorSignatureData
  };
  return obj;
}


function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('This script must be bound to a Google Spreadsheet');
  }
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    setupDatabase_();
    sh = ss.getSheetByName(SHEET_NAME);
  }
  const headerRow = sh.getRange(1, 1, 1, HEADER.length).getValues()[0];
  const headerMatches = HEADER.every((value, idx) => headerRow[idx] === value);
  if (!headerMatches) {
    setupDatabase_();
    sh = ss.getSheetByName(SHEET_NAME);
  }
  return sh;
}

function getRecordFolder_(sourceFolderId, recordId, type) {
  const rootFolder = DriveApp.getFolderById(sourceFolderId);
  const typeFolderName = (type || 'MISC').toUpperCase();

  // Get or create type folder
  let typeFolderIter = rootFolder.getFoldersByName(typeFolderName);
  let typeFolder = typeFolderIter.hasNext() ? typeFolderIter.next() : rootFolder.createFolder(typeFolderName);

  // Get or create record folder
  let recordFolderIter = typeFolder.getFoldersByName(recordId);
  return recordFolderIter.hasNext() ? recordFolderIter.next() : typeFolder.createFolder(recordId);
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
