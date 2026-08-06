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
  'updatedAt',
  'summaryOperatorName',
  'summaryOperatorPosition',
  'summarySupervisorName',
  'summarySupervisorPosition',
  'attachmentsFolderId',
  'attachmentsFolderUrl'
];

const UPLOAD_STAGING_FOLDER_ID = '17qyfta4jObGgXL4NkR5YaCvaKSoKcnq4';
const RECORD_ROOT_FOLDER_ID = '1--lgBw5_XGuLw8_v7dqAS7n2d-N1hXdg';

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
  sh.setColumnWidth(13, 180);
  sh.setColumnWidth(14, 180);
  sh.setColumnWidth(15, 180);
  sh.setColumnWidth(16, 180);
  sh.setColumnWidth(17, 180);
  sh.setColumnWidth(18, 320);

  return {
    sheetName: SHEET_NAME,
    headers: HEADER.slice()
  };
}

function doPost(e) {
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
          folderId: UPLOAD_STAGING_FOLDER_ID
        }
      });
    }

    if (action === 'movefilestorecordfolder') {
      const recordId = body.recordId;
      const type = body.type || 'MISC';
      const attachments = body.attachments || [];
      const fileIds = attachments.map(f => f.id);
      const moveResult = batchMoveFiles_(fileIds, recordId, type);
      updateRecordFolderLink_(recordId, moveResult.folderId, moveResult.folderUrl);
      return jsonOut({ ok: true, data: moveResult });
    }

    if (action === 'uploadbase64') {
      const res = uploadBase64File_(body.fileName, body.mimeType, body.base64, UPLOAD_STAGING_FOLDER_ID);
      return jsonOut({ ok: true, data: res });
    }

    if (action === 'deletefiles') {
      const fileIds = Array.isArray(body.fileIds) ? body.fileIds : [];
      const deletedCount = batchRemoveFiles_(fileIds);
      return jsonOut({ ok: true, data: { deletedCount } });
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

function validateRecordPayload_(record) {
  if (!record || typeof record !== 'object') {
    throw new Error('ไม่พบข้อมูลรายการที่ต้องการบันทึก');
  }
  const type = String(record.type || '').trim().toUpperCase();
  if (type !== 'EQA' && type !== 'IQC') {
    throw new Error('ประเภทรายการไม่ถูกต้อง');
  }
  const data = record.data && typeof record.data === 'object' ? record.data : {};
  const requiredText = (value, label, maxLength) => {
    const text = String(value == null ? '' : value).trim();
    if (!text) {
      throw new Error('กรุณาระบุ' + label);
    }
    if (maxLength && text.length > maxLength) {
      throw new Error(label + 'ยาวเกิน ' + maxLength + ' ตัวอักษร');
    }
    return text;
  };
  const requiredDate = (value, label) => {
    const text = requiredText(value, label, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      throw new Error(label + 'ไม่อยู่ในรูปแบบวันที่ที่ถูกต้อง');
    }
    return text;
  };
  const signature = normalizeSignaturePayload_(record);
  if (!Array.isArray(signature.operator) || !signature.operator.length) {
    throw new Error(type === 'EQA' ? 'กรุณาเซ็นชื่อผู้ทบทวนก่อนบันทึก' : 'กรุณาเซ็นชื่อผู้ปฏิบัติก่อนบันทึก');
  }

  if (type === 'EQA') {
    requiredText(data.dept, 'หน่วยงาน', 100);
    requiredText(data.project, 'ชื่อโครงการ', 200);
    requiredText(data.round, 'รอบการประเมิน', 50);
    requiredDate(data.dateRec, 'วันที่ได้รับตัวอย่าง');
    requiredText(data.cond, 'สภาพตัวอย่าง', 20);
    requiredDate(data.testDate, 'วันที่ทดสอบ');
    requiredText(data.preparer, 'ผู้เตรียมหรือละลายตัวอย่าง', 150);
    requiredText(data.reporter, 'ผู้รายงานหรือส่งผล', 150);
    requiredDate(data.reportDate, 'วันที่รายงานผล');
    requiredText(data.testItem, 'รายการทดสอบ', 200);
    const evaluationResult = requiredText(data.evalResult, 'ผลการประเมิน', 20);
    requiredText(data.evalCriteria, 'เกณฑ์การประเมิน', 500);
    requiredDate(data.evalDate, 'วันที่ได้รับผลประเมิน');
    if (evaluationResult === 'fail') {
      requiredText(data.cause, 'สาเหตุที่ไม่ผ่าน', 2000);
      requiredText(data.correctiveAction, 'วิธีการแก้ไขและผลการแก้ไข', 2000);
      requiredText(data.preventiveAction, 'แนวทางป้องกันการเกิดซ้ำ', 2000);
    }
  } else {
    requiredDate(data.date, 'วันที่ตรวจสอบ');
    requiredText(data.dept, 'หน่วยงานหรือแผนก', 100);
    requiredText(data.controlName, 'ชื่อ Control', 150);
    requiredText(data.lot, 'Lot Number', 100);
    requiredDate(data.exp, 'วันหมดอายุ');
    const lowValue = requiredText(data.iqcLow && data.iqcLow.value, 'ผล IQC ระดับ Low', 30);
    const highValue = requiredText(data.iqcHigh && data.iqcHigh.value, 'ผล IQC ระดับ High', 30);
    if (!isFinite(Number(lowValue)) || !isFinite(Number(highValue))) {
      throw new Error('ผล IQC ระดับ Low และ High ต้องเป็นตัวเลข');
    }
  }

  const attachments = Array.isArray(record.attachments) ? record.attachments : [];
  if (attachments.length > 10) {
    throw new Error('แนบไฟล์ได้ไม่เกิน 10 ไฟล์ต่อรายการ');
  }
  attachments.forEach(function (file) {
    if (!file || !String(file.id || '').trim()) {
      throw new Error('พบไฟล์แนบที่อัปโหลดไม่สมบูรณ์');
    }
  });
}

function upsertRecord_(record) {
  validateRecordPayload_(record);
  let lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Could not acquire lock after 30 seconds. Please try again.');
  }

  try {
  const sh = getSheet_();
  const now = new Date();
  const id = record.id || generateNewId_(record.type);
  const rowIndex = findRowById_(id);

  const signaturePayload = normalizeSignaturePayload_(record);
  const summaryOperatorName = String(record.summaryOperatorName || record.data?.summaryOperatorName || record.data?.operatorName || '').trim();
  const summaryOperatorPosition = String(record.summaryOperatorPosition || record.data?.summaryOperatorPosition || record.data?.operatorPosition || '').trim();
  const summarySupervisorName = String(record.summarySupervisorName || record.data?.summarySupervisorName || record.data?.supervisorName || '').trim();
  const summarySupervisorPosition = String(record.summarySupervisorPosition || record.data?.summarySupervisorPosition || record.data?.supervisorPosition || '').trim();
  const attachmentsFolderId = String(record.attachmentsFolderId || record.data?.attachmentsFolderId || record.data?.folderId || '').trim();
  const attachmentsFolderUrl = String(record.attachmentsFolderUrl || record.data?.attachmentsFolderUrl || record.data?.folderUrl || '').trim();

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
    summaryOperatorName,
    summaryOperatorPosition,
    summarySupervisorName,
    summarySupervisorPosition,
    attachmentsFolderId,
    attachmentsFolderUrl,
  ];

  if (rowIndex) {
    sh.getRange(rowIndex, 1, 1, HEADER.length).setValues([payload]);
  } else {
    sh.appendRow(payload);
  }
  let recordObj = toRecordObject_(payload);

  return recordObj;
  } finally {
    lock.releaseLock();
  }
}

function batchRemoveFiles_(fileIds) {
  const ids = Array.from(new Set((fileIds || []).filter(Boolean)));
  if (!ids.length) {
    return 0;
  }

  const requests = {
    batchPath: 'batch/drive/v3',
    requests: ids.map((id) => ({
      method: 'DELETE',
      endpoint: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`,
    })),
    accessToken: ScriptApp.getOAuthToken(),
  };

  const result = BatchRequest.EDo(requests);
  return ids.length;
}

function batchMoveFiles_(fileIds, recordId, type) {
  const sourceFolderId = UPLOAD_STAGING_FOLDER_ID;
  const recordFolder = getOrCreateRecordFolder_(RECORD_ROOT_FOLDER_ID, recordId, type);
  const folderId = recordFolder.getId();
  const folderUrl = recordFolder.getUrl();
  if (!fileIds || !fileIds.length) {
    return {
      folderId,
      folderUrl,
      movedCount: 0,
      responses: []
    };
  }
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
      Logger.log('Unable to move file: ' + JSON.stringify(item));
    }
  });
  return {
    folderId,
    folderUrl,
    movedCount: fileIds.length,
    responses
  };
}

function updateRecordFolderLink_(recordId, folderId, folderUrl) {
  if (!recordId || !folderUrl) {
    return;
  }
  const sh = getSheet_();
  const rowIndex = findRowById_(recordId);
  if (!rowIndex) {
    return;
  }

  const payloadCell = sh.getRange(rowIndex, 7);
  const payload = parseJsonSafe_(payloadCell.getValue(), {});
  const nextPayload = {
    ...(payload && typeof payload === 'object' ? payload : {}),
    attachmentsFolderId: String(folderId || ''),
    attachmentsFolderUrl: String(folderUrl || ''),
    folderId: String(folderId || ''),
    folderUrl: String(folderUrl || '')
  };

  payloadCell.setValue(JSON.stringify(nextPayload));
  sh.getRange(rowIndex, 17).setValue(String(folderId || ''));
  sh.getRange(rowIndex, 18).setValue(String(folderUrl || ''));
}

function generateNewId_(type) {
  const prefix = (type || 'REC').toUpperCase().substring(0, 3);
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy_MM_dd_HHmmss');
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
  const summaryOperatorName = row[12] || '';
  const summaryOperatorPosition = row[13] || '';
  const summarySupervisorName = row[14] || '';
  const summarySupervisorPosition = row[15] || '';
  const attachmentsFolderId = row[16] || '';
  const attachmentsFolderUrl = row[17] || '';
  const data = parseJsonSafe_(row[6], {});
  data.summaryOperatorName = data.summaryOperatorName || summaryOperatorName;
  data.summaryOperatorPosition = data.summaryOperatorPosition || summaryOperatorPosition;
  data.summarySupervisorName = data.summarySupervisorName || summarySupervisorName;
  data.summarySupervisorPosition = data.summarySupervisorPosition || summarySupervisorPosition;
  data.attachmentsFolderId = data.attachmentsFolderId || data.folderId || attachmentsFolderId;
  data.attachmentsFolderUrl = data.attachmentsFolderUrl || data.folderUrl || attachmentsFolderUrl;
  data.folderId = data.folderId || data.attachmentsFolderId;
  data.folderUrl = data.folderUrl || data.attachmentsFolderUrl;
  const obj = {
    id: row[0],
    type: row[1],
    recordDate: normalizeDate_(row[2]),
    title: row[3] || '',
    department: row[4] || '',
    status: row[5] || '',
    data,
    attachments: parseJsonSafe_(row[7], []),
    operatorSignatureData,
    supervisorSignatureData,
    createdAt: toIsoString_(row[10]),
    updatedAt: toIsoString_(row[11]),
    summaryOperatorName,
    summaryOperatorPosition,
    summarySupervisorName,
    summarySupervisorPosition,
    attachmentsFolderId: data.attachmentsFolderId || '',
    attachmentsFolderUrl: data.attachmentsFolderUrl || '',
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

function getOrCreateRecordFolder_(rootFolderId, recordId, type) {
  const rootFolder = DriveApp.getFolderById(rootFolderId);
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
