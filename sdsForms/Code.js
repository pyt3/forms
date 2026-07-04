const SHEET_NAMES = {
  inventory: "รวมทุกแผนก",
  catalog: "รายการสาร",
  requests: "Requests",
  users: "Users"
};

const INVENTORY_HEADERS = [
  "แผนก",
  "รหัส SDS",
  "ชื่อผลิตภัณฑ์/สารเคมี",
  "Trade Name",
  "ปริมาณสูงสุดที่มี",
  "พื้นที่/หน่วยงานที่จัดเก็บ",
  "สารออกซิไดซ์",
  "สารไวไฟ",
  "วัตถุระเบิด",
  "วัตถุมีพิษ",
  "สารกัดกร่อน",
  "แก๊ส",
  "อันตรายต่อสุขภาพ",
  "อันตรายต่อสิ่งแวดล้อม",
  "วัตถุระคายเคือง",
  "ประเภทอื่น ๆ",
  "สวมถุงมือ",
  "สวมหน้ากาก",
  "สวมแว่นตา",
  "สวมเสื้อกันสารเคมี",
  "รองเท้าบู๊ท",
  "ต้องประกาศ Code 1",
  "สารเคมีไวไฟในแผนก"
];

const CATALOG_HEADERS = ["รหัส SDS", "ชื่อผลิตภัณฑ์/สารเคมี", "Trade Name", "รูปภาพ", "เอกสารประกอบ"];

const REQUEST_HEADERS = [
  "Request ID",
  "Requested At",
  "Department",
  "Request Type",
  "รหัส SDS เดิม",
  "ชื่อผลิตภัณฑ์/สารเคมี",
  "Trade Name",
  "ปริมาณสูงสุดที่มี",
  "พื้นที่/หน่วยงานที่จัดเก็บ",
  "ประเภทสารเคมี",
  "ประเภทการป้องกัน",
  "ต้องประกาศ Code 1",
  "ไฟล์แนบ Folder ID",
  "ไฟล์แนบ URL",
  "Status",
  "Reviewed At",
  "Reviewer Comment"
];

const USERS_HEADERS = ["Department", "Username", "Password", "Is Active", "Created At", "Updated At", "Role"];
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "Admin@123";
const SESSION_TTL_SECONDS = 7200;
const EXPORT_TEMPLATE_SPREADSHEET_ID = "1gQYEJfcL5KkbVbIAHvJqDsNv7ckMSOoE8rZeNnXdYW4";
const XLSX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const CATEGORY_KEYS = [
  { key: "oxidizer", label: "สารออกซิไดซ์", header: "สารออกซิไดซ์" },
  { key: "flammable", label: "สารไวไฟ", header: "สารไวไฟ" },
  { key: "explosive", label: "วัตถุระเบิด", header: "วัตถุระเบิด" },
  { key: "toxic", label: "วัตถุมีพิษ", header: "วัตถุมีพิษ" },
  { key: "corrosive", label: "สารกัดกร่อน", header: "สารกัดกร่อน" },
  { key: "gas", label: "แก๊ส", header: "แก๊ส" },
  { key: "healthHazard", label: "อันตรายต่อสุขภาพ", header: "อันตรายต่อสุขภาพ" },
  { key: "environmentHazard", label: "อันตรายต่อสิ่งแวดล้อม", header: "อันตรายต่อสิ่งแวดล้อม" },
  { key: "irritant", label: "วัตถุระคายเคือง", header: "วัตถุระคายเคือง" },
  { key: "other", label: "ประเภทอื่น ๆ", header: "ประเภทอื่น ๆ" },
  { key: "code1", label: "ต้องประกาศ Code 1", header: "ต้องประกาศ Code 1" }
];

const PPE_KEYS = [
  { key: "gloves", label: "สวมถุงมือ" },
  { key: "mask", label: "สวมหน้ากาก" },
  { key: "goggles", label: "สวมแว่นตา" },
  { key: "suit", label: "สวมเสื้อกันสารเคมี" },
  { key: "boots", label: "รองเท้าบู๊ท" }
];

function doGet(e) {
  ensureDataModel();
  if (isApiRequest(e)) {
    return handleApiRequest("GET", e);
  }

  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("SDS Online")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function doPost(e) {
  ensureDataModel();
  return handleApiRequest("POST", e);
}

function handleApiRequest(method, e) {
  try {
    const request = parseApiRequest(method, e);
    const action = sanitize(request.action);
    const args = Array.isArray(request.args) ? request.args : [];

    if (!action) {
      throw new Error("ไม่พบ action ของ API");
    }

    let result;
    switch (action) {
      case "login":
        result = login.apply(null, args);
        break;
      case "restoreSession":
        result = restoreSession.apply(null, args);
        break;
      case "getChemicals":
        result = getChemicals.apply(null, args);
        break;
      case "addChemicalToDept":
        result = addChemicalToDept.apply(null, args);
        break;
      case "removeChemicalFromDept":
        result = removeChemicalFromDept.apply(null, args);
        break;
      case "saveRequest":
        result = saveRequest.apply(null, args);
        break;
      case "getUploadContext":
        result = getUploadContext.apply(null, args);
        break;
      case "exportSdsExcel":
        result = exportSdsExcel.apply(null, args);
        break;
      case "getExportTemplate":
        result = getExportTemplate.apply(null, args);
        break;
      case "getUsers":
        result = getUsers.apply(null, args);
        break;
      case "createUser":
        result = createUser.apply(null, args);
        break;
      case "updateUser":
        result = updateUser.apply(null, args);
        break;
      case "resetUserPassword":
        result = resetUserPassword.apply(null, args);
        break;
      case "setUserActive":
        result = setUserActive.apply(null, args);
        break;
      default:
        throw new Error(`ไม่รองรับ action: ${action}`);
    }

    return jsonResponse({ ok: true, result });
  } catch (error) {
    return jsonResponse({ ok: false, error: sanitize(error && error.message) || "API Error" });
  }
}

function parseApiRequest(method, e) {
  if (method === "GET") {
    const argsText = e && e.parameter ? sanitize(e.parameter.args) : "";
    let parsedArgs = [];
    if (argsText) {
      parsedArgs = JSON.parse(argsText);
    }

    return {
      action: e && e.parameter ? e.parameter.action : "",
      args: parsedArgs
    };
  }

  let body = {};
  if (e && e.postData && e.postData.contents) {
    body = JSON.parse(e.postData.contents);
  }

  return {
    action: body.action || (e && e.parameter ? e.parameter.action : ""),
    args: Array.isArray(body.args) ? body.args : []
  };
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function isApiRequest(e) {
  return !!(e && e.parameter && (e.parameter.api === "1" || e.parameter.action));
}

function login(username, password) {
  ensureDataModel();
  const inputUsername = sanitize(username).toLowerCase();
  const inputPassword = sanitize(password);

  if (!inputUsername || !inputPassword) {
    throw new Error("กรุณาระบุ Username และ Password");
  }

  const usersSheet = getSheet(SHEET_NAMES.users, USERS_HEADERS);
  const userRows = readRowsAsObjects(usersSheet, USERS_HEADERS);

  const matchedUser = userRows.find((row) => {
    return sanitize(row.Username).toLowerCase() === inputUsername && isTruthy(row["Is Active"]);
  });

  if (!matchedUser) {
    throw new Error("ไม่พบผู้ใช้งาน หรือบัญชีถูกปิดใช้งาน");
  }

  const expectedPassword = sanitize(matchedUser.Password);
  if (!expectedPassword || expectedPassword !== inputPassword) {
    throw new Error("Password ไม่ถูกต้อง");
  }

  const department = sanitize(matchedUser.Department);
  if (!department) {
    throw new Error("บัญชีนี้ยังไม่ผูกกับแผนก");
  }

  const role = sanitize(matchedUser.Role || "user").toLowerCase() || "user";
  const sessionToken = createSessionToken(matchedUser);

  return {
    ok: true,
    sessionToken,
    user: {
      username: sanitize(matchedUser.Username),
      department,
      role
    },
    data: getChemicals(role === "admin" ? "" : department, role === "admin")
  };
}

function restoreSession(sessionToken) {
  ensureDataModel();
  const session = getSessionFromToken(sessionToken);

  const usersSheet = getSheet(SHEET_NAMES.users, USERS_HEADERS);
  const userRows = readRowsAsObjects(usersSheet, USERS_HEADERS);
  const matchedUser = userRows.find((row) => {
    return sanitize(row.Username).toLowerCase() === sanitize(session.username).toLowerCase();
  });

  if (!matchedUser || !isTruthy(matchedUser["Is Active"])) {
    throw new Error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }

  const role = normalizeRole(matchedUser.Role);
  const department = sanitize(matchedUser.Department);

  return {
    ok: true,
    sessionToken: sanitize(sessionToken),
    user: {
      username: sanitize(matchedUser.Username),
      department,
      role
    },
    data: getChemicals(role === "admin" ? "" : department, role === "admin")
  };
}

function getUsers(sessionToken) {
  ensureDataModel();
  assertAdmin(sessionToken);

  const usersSheet = getSheet(SHEET_NAMES.users, USERS_HEADERS);
  const inventorySheet = getSheet(SHEET_NAMES.inventory, INVENTORY_HEADERS);
  const users = readRowsAsObjects(usersSheet, USERS_HEADERS)
    .filter((row) => sanitize(row.Username))
    .map((row) => ({
      department: sanitize(row.Department),
      username: sanitize(row.Username),
      isActive: isTruthy(row["Is Active"]),
      role: sanitize(row.Role || "user") || "user",
      createdAt: row["Created At"] instanceof Date ? row["Created At"].toISOString() : sanitize(row["Created At"]),
      updatedAt: row["Updated At"] instanceof Date ? row["Updated At"].toISOString() : sanitize(row["Updated At"])
    }))
    .sort((a, b) => a.username.localeCompare(b.username));

  const departments = getDepartmentList(readRowsAsObjects(inventorySheet, INVENTORY_HEADERS));

  return {
    users,
    departments
  };
}

function createUser(sessionToken, payload) {
  ensureDataModel();
  assertAdmin(sessionToken);

  const data = payload || {};
  const username = sanitize(data.username).toLowerCase();
  const password = sanitize(data.password);
  const department = sanitize(data.department);
  const role = normalizeRole(data.role);
  const isActive = data.isActive !== false;

  if (!username || !password || !department) {
    throw new Error("กรอก Username, Password และแผนกให้ครบ");
  }

  const usersSheet = getSheet(SHEET_NAMES.users, USERS_HEADERS);
  const rows = readRowsAsObjects(usersSheet, USERS_HEADERS);
  const duplicated = rows.some((row) => sanitize(row.Username).toLowerCase() === username);
  if (duplicated) {
    throw new Error("Username นี้ถูกใช้แล้ว");
  }

  const now = new Date();
  usersSheet.appendRow([department, username, password, isActive, now, now, role]);
  return { ok: true, message: "สร้างผู้ใช้เรียบร้อย" };
}

function updateUser(sessionToken, payload) {
  ensureDataModel();
  assertAdmin(sessionToken);

  const data = payload || {};
  const username = sanitize(data.username).toLowerCase();
  const department = sanitize(data.department);
  const role = normalizeRole(data.role);
  const isActive = data.isActive !== false;

  if (!username || !department) {
    throw new Error("กรอก Username และแผนกให้ครบ");
  }

  const usersSheet = getSheet(SHEET_NAMES.users, USERS_HEADERS);
  const target = findUserRowByUsername(usersSheet, username);
  if (!target) {
    throw new Error("ไม่พบผู้ใช้ที่ต้องการแก้ไข");
  }

  const rowIndex = target.rowIndex;
  const existing = target.row;
  usersSheet
    .getRange(rowIndex, 1, 1, USERS_HEADERS.length)
    .setValues([[department, sanitize(existing.Username), sanitize(existing.Password), isActive, existing["Created At"] || new Date(), new Date(), role]]);

  return { ok: true, message: "อัปเดตผู้ใช้เรียบร้อย" };
}

function resetUserPassword(sessionToken, username, newPassword) {
  ensureDataModel();
  assertAdmin(sessionToken);

  const targetUsername = sanitize(username).toLowerCase();
  const nextPassword = sanitize(newPassword);

  if (!targetUsername || !nextPassword) {
    throw new Error("ระบุ Username และรหัสผ่านใหม่ให้ครบ");
  }

  const usersSheet = getSheet(SHEET_NAMES.users, USERS_HEADERS);
  const target = findUserRowByUsername(usersSheet, targetUsername);
  if (!target) {
    throw new Error("ไม่พบผู้ใช้");
  }

  const rowIndex = target.rowIndex;
  usersSheet.getRange(rowIndex, 3).setValue(nextPassword);
  usersSheet.getRange(rowIndex, 6).setValue(new Date());

  return { ok: true, message: "รีเซ็ตรหัสผ่านเรียบร้อย" };
}

function setUserActive(sessionToken, username, isActive) {
  ensureDataModel();
  assertAdmin(sessionToken);

  const targetUsername = sanitize(username).toLowerCase();
  if (!targetUsername) {
    throw new Error("ไม่พบ Username");
  }

  const usersSheet = getSheet(SHEET_NAMES.users, USERS_HEADERS);
  const target = findUserRowByUsername(usersSheet, targetUsername);
  if (!target) {
    throw new Error("ไม่พบผู้ใช้");
  }

  const rowIndex = target.rowIndex;
  usersSheet.getRange(rowIndex, 4).setValue(Boolean(isActive));
  usersSheet.getRange(rowIndex, 6).setValue(new Date());
  return { ok: true, message: "อัปเดตสถานะผู้ใช้เรียบร้อย" };
}

function getChemicals(department='ไตเทียม', includeAll) {
  ensureDataModel();
  const dept = sanitize(department);
  const isAllDepartments = includeAll === true;
  const inventorySheet = getSheet(SHEET_NAMES.inventory, INVENTORY_HEADERS);
  const catalogSheet = getSheet(SHEET_NAMES.catalog, CATALOG_HEADERS);

  const inventoryRows = readRowsAsObjects(inventorySheet, INVENTORY_HEADERS);
  const catalogRows = readRowsAsObjects(catalogSheet, CATALOG_HEADERS);
  const catalogMap = buildCatalogMap(catalogRows);

  const departments = getDepartmentList(inventoryRows);
  const activeDepartment = isAllDepartments ? "ทุกแผนก" : dept || departments[0] || "แผนกทั่วไป";
  const deptRows = isAllDepartments
    ? inventoryRows
    : inventoryRows.filter((row) => sanitize(row["แผนก"]) === activeDepartment);
  const deptSdsSet = new Set(deptRows.map((row) => sanitize(row["รหัส SDS"])));

  const centralChemicals = catalogRows
    .filter((row) => sanitize(row["รหัส SDS"]))
    .map((row) => ({
      sdsCode: sanitize(row["รหัส SDS"]),
      chemicalName: sanitize(row["ชื่อผลิตภัณฑ์/สารเคมี"]),
      tradeName: sanitize(row["Trade Name"]),
      imageUrl: sanitize(row["รูปภาพ"]),
      documentUrls: parseDocumentUrls(row["เอกสารประกอบ"]),
      inDepartment: deptSdsSet.has(sanitize(row["รหัส SDS"]))
    }));

  const deptChemicals = deptRows.map((row) => toChemicalViewModel(row, catalogMap));
  const stats = buildStats(deptRows);
  const requests = isAllDepartments ? getRequests("") : getRequests(activeDepartment);

  return {
    department: activeDepartment,
    isAllDepartments,
    departments,
    centralChemicals,
    deptChemicals,
    stats,
    requests,
    categoryConfig: CATEGORY_KEYS,
    ppeConfig: PPE_KEYS,
    generatedAt: new Date().toISOString()
  };
}

function exportSdsExcel(department, includeAll, thaiNowText) {
  ensureDataModel();

  const data = getChemicals(department, includeAll === true);
  Logger.log(JSON.stringify(data, null, 2));
  return buildSdsXlsxExport(data, thaiNowText);
}

function getExportTemplate() {
  ensureDataModel();
  return fetchTemplateFromSpreadsheet(EXPORT_TEMPLATE_SPREADSHEET_ID);
}

function fetchTemplateFromSpreadsheet(spreadsheetId) {
  const id = sanitize(spreadsheetId);
  if (!id) {
    throw new Error("ไม่พบ Spreadsheet ID ของ Template");
  }

  const exportUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/export?format=xlsx`;
  const response = UrlFetchApp.fetch(exportUrl, {
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    muteHttpExceptions: true,
    followRedirects: true
  });

  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error(`ดึงไฟล์ Template ไม่สำเร็จ (HTTP ${status})`);
  }

  const blob = response.getBlob();
  return {
    ok: true,
    fileName: "list_template.xlsx",
    mimeType: XLSX_MIME_TYPE,
    base64: Utilities.base64Encode(blob.getBytes()),
    sourceSpreadsheetId: id
  };
}

function buildSdsXlsxExport(data, thaiNowText) {
  const templateFile = DriveApp.getFileById(EXPORT_TEMPLATE_SPREADSHEET_ID);
  const copiedFile = templateFile.makeCopy(`SDS Export Temp ${Date.now()}`);
  const tempSpreadsheetId = copiedFile.getId();
  Logger.log(`Temporary spreadsheet created: ${copiedFile.getUrl()}`);
  try {
    const spreadsheet = SpreadsheetApp.openById(tempSpreadsheetId);
    const sheet = spreadsheet.getSheetByName("รายการสารเคมี")
    if (!sheet) {
      throw new Error("ไม่พบชีต รายการสารเคมี ในไฟล์ต้นแบบ");
    }

    const departmentLabel = data.isAllDepartments ? "ทุกแผนก" : sanitize(data.department);
    sheet.getRange("B2").setValue(departmentLabel);
    sheet.getRange("R2").setValue(sanitize(thaiNowText) || buildThaiDateText());
    writeExportRowsToSheet(sheet, data.deptChemicals || []);
    SpreadsheetApp.flush();

    const blob = exportSpreadsheetAsXlsxBlob(tempSpreadsheetId);
    const dateStamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
    const fileName = data.isAllDepartments
      ? `SDS PT3 ทุกแผนก ${dateStamp}.xlsx`
      : `SDS PT3 ${sanitize(data.department || "แผนก")} ${dateStamp}.xlsx`;

    return {
      ok: true,
      fileName,
      mimeType: XLSX_MIME_TYPE,
      dataUri: `data:${XLSX_MIME_TYPE};base64,${Utilities.base64Encode(blob.getBytes())}`,
      base64: Utilities.base64Encode(blob.getBytes())
    };
  } finally {
    try {
      copiedFile.setTrashed(true);
    } catch (_error) {
      // Ignore cleanup failure.
    }
  }
}

function writeExportRowsToSheet(sheet, items) {
  const startRow = 5;
  const startCol = 1;
  const columnCount = 21;
  const maxRows = sheet.getMaxRows();
  const clearRowCount = Math.max(0, maxRows - startRow + 1);

  if (clearRowCount > 0) {
    sheet.getRange(startRow, startCol, clearRowCount, columnCount).clearContent();
  }

  if (!items.length) {
    return;
  }

  const values = items.map((item, index) => {
    const categories = Array.isArray(item.categories) ? item.categories : [];
    const ppe = Array.isArray(item.ppe) ? item.ppe : [];
    return [
      index + 1,
      sanitize(item.chemicalName),
      sanitize(item.tradeName),
      sanitize(item.maxQuantity),
      sanitize(item.storageArea),
      hasLabelInList(categories, "สารออกซิไดซ์") ? "✓" : "",
      hasLabelInList(categories, "สารไวไฟ") ? "✓" : "",
      hasLabelInList(categories, "วัตถุระเบิด") ? "✓" : "",
      hasLabelInList(categories, "วัตถุมีพิษ") ? "✓" : "",
      hasLabelInList(categories, "สารกัดกร่อน") ? "✓" : "",
      hasLabelInList(categories, "แก๊ส") ? "✓" : "",
      hasLabelInList(categories, "อันตรายต่อสุขภาพ") ? "✓" : "",
      hasLabelInList(categories, "อันตรายต่อสิ่งแวดล้อม") ? "✓" : "",
      hasLabelInList(categories, "วัตถุระคายเคือง") ? "✓" : "",
      hasLabelInList(categories, "ประเภทอื่น ๆ") ? "✓" : "",
      hasLabelInList(ppe, "สวมถุงมือ") ? "✓" : "",
      hasLabelInList(ppe, "สวมหน้ากาก") ? "✓" : "",
      hasLabelInList(ppe, "สวมแว่นตา") ? "✓" : "",
      hasLabelInList(ppe, "สวมเสื้อกันสารเคมี") ? "✓" : "",
      hasLabelInList(ppe, "รองเท้าบู๊ท") ? "✓" : "",
      item.code1 ? "✓" : ""
    ];
  });

  const requiredRows = startRow + values.length - 1;
  if (requiredRows > maxRows) {
    sheet.insertRowsAfter(maxRows, requiredRows - maxRows);
  }

  sheet.getRange(startRow, startCol, values.length, columnCount)
  .setValues(values)
  .setWrap(true)
  .setVerticalAlignment("middle")
  .setHorizontalAlignment("center")
  .setBorder(true, true, true, true, true, true)
  .setFontFamily("Cordia New")
  .setFontSize(18)
  .setFontWeight("normal")
  .setFontColor("black")

  // set column B horizontal alignment to left
  sheet.getRange(startRow, 2, values.length, 1).setHorizontalAlignment("left");

  // if code1 is checked, set the background color of the row to light red
  values.forEach((row, index) => {
    if (row[20] === "✓") {
      sheet.getRange(startRow + index, startCol, 1, columnCount).setBackground("#FFCCCC");
    }
  });
}

function hasLabelInList(list, label) {
  return Array.isArray(list) && list.some((item) => sanitize(item) === label);
}

function exportSpreadsheetAsXlsxBlob(spreadsheetId) {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/export?format=xlsx`;
  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    muteHttpExceptions: true,
    followRedirects: true
  });

  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error(`สร้างไฟล์ Export ไม่สำเร็จ (HTTP ${status})`);
  }

  return response.getBlob().setContentType(XLSX_MIME_TYPE);
}

function buildThaiDateText() {
  const now = new Date();
  const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear() + 543;
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} ${hh}:${mm}`;
}

function addChemicalToDept(department, sdsCode) {
  ensureDataModel();
  const dept = sanitize(department);
  const code = sanitize(sdsCode);
  if (!dept || !code) {
    throw new Error("ระบุแผนกและรหัส SDS ให้ครบ");
  }

  const inventorySheet = getSheet(SHEET_NAMES.inventory, INVENTORY_HEADERS);
  const catalogSheet = getSheet(SHEET_NAMES.catalog, CATALOG_HEADERS);

  const catalogRows = readRowsAsObjects(catalogSheet, CATALOG_HEADERS);
  const inventoryRows = readRowsAsObjects(inventorySheet, INVENTORY_HEADERS);

  const alreadyExists = inventoryRows.some((row) => {
    return sanitize(row["แผนก"]) === dept && sanitize(row["รหัส SDS"]) === code;
  });

  if (alreadyExists) {
    return { ok: true, added: false, message: "รายการนี้มีในแผนกแล้ว" };
  }

  const selected = catalogRows.find((row) => sanitize(row["รหัส SDS"]) === code);
  if (!selected) {
    throw new Error("ไม่พบรหัส SDS ในคลังกลาง");
  }

  const template = inventoryRows.find((row) => sanitize(row["รหัส SDS"]) === code) || {};

  const rowToInsert = INVENTORY_HEADERS.map((header) => "");
  rowToInsert[0] = dept;
  rowToInsert[1] = code;
  rowToInsert[2] = sanitize(selected["ชื่อผลิตภัณฑ์/สารเคมี"]);
  rowToInsert[3] = sanitize(selected["Trade Name"]);

  for (let idx = 4; idx < INVENTORY_HEADERS.length; idx += 1) {
    rowToInsert[idx] = sanitize(template[INVENTORY_HEADERS[idx]]);
  }

  inventorySheet.appendRow(rowToInsert);
  return { ok: true, added: true, message: "เพิ่มรายการเข้าหน่วยงานแล้ว" };
}

function removeChemicalFromDept(department, sdsCode) {
  ensureDataModel();
  const dept = sanitize(department);
  const code = sanitize(sdsCode);

  if (!dept || !code) {
    throw new Error("ระบุแผนกและรหัส SDS ให้ครบ");
  }

  const inventorySheet = getSheet(SHEET_NAMES.inventory, INVENTORY_HEADERS);
  const lastRow = inventorySheet.getLastRow();
  if (lastRow < 2) {
    return { ok: true, removed: 0, message: "ยังไม่มีข้อมูลให้ลบ" };
  }

  const values = inventorySheet.getRange(2, 1, lastRow - 1, INVENTORY_HEADERS.length).getValues();
  let removed = 0;

  for (let i = values.length - 1; i >= 0; i -= 1) {
    const row = values[i];
    if (sanitize(row[0]) === dept && sanitize(row[1]) === code) {
      inventorySheet.deleteRow(i + 2);
      removed += 1;
    }
  }

  return { ok: true, removed, message: removed ? "ลบรายการออกจากแผนกแล้ว" : "ไม่พบรายการที่ต้องการลบ" };
}

function saveRequest(payload) {
  ensureDataModel();
  const data = payload || {};
  const department = sanitize(data.department);
  const requestType = sanitize(data.requestType || "Add");
  const existingSdsCode = sanitize(data.existingSdsCode);
  const chemicalName = sanitize(data.chemicalName);
  const tradeName = sanitize(data.tradeName);
  const attachmentFolderId = sanitize(data.attachmentFolderId);
  const uploadedFiles = Array.isArray(data.uploadedFiles) ? data.uploadedFiles : [];

  if (!department) {
    throw new Error("ไม่พบชื่อแผนก");
  }

  if (!["Add", "Edit"].includes(requestType)) {
    throw new Error("ประเภทคำขอไม่ถูกต้อง");
  }

  if (requestType === "Edit" && !existingSdsCode) {
    throw new Error("กรุณาเลือกสารเคมีที่ต้องการแก้ไข");
  }

  if (!chemicalName) {
    throw new Error("กรุณาระบุชื่อผลิตภัณฑ์/สารเคมี");
  }

  if (uploadedFiles.length && !attachmentFolderId) {
    throw new Error("ไม่พบโฟลเดอร์ปลายทางของไฟล์แนบ");
  }

  const attachmentInfos = uploadedFiles
    .map((file) => {
      const id = sanitize(file.id);
      const name = sanitize(file.name);
      const url = sanitize(file.url) || (id ? `https://drive.google.com/file/d/${id}/view` : "");
      return { id, name, url };
    })
    .filter((file) => file.id || file.url || file.name);

  const requestId = `REQ-${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss")}`;

  const requestSheet = getSheet(SHEET_NAMES.requests, REQUEST_HEADERS);

  const row = [
    requestId,
    new Date(),
    department,
    requestType,
    existingSdsCode,
    chemicalName,
    tradeName,
    sanitize(data.maxQuantity),
    sanitize(data.storageArea),
    (data.categories || []).join(", "),
    (data.ppe || []).join(", "),
    data.code1 ? "✓" : "",
    attachmentFolderId,
    attachmentInfos.map((f) => f.url).join("\n"),
    "Pending",
    "",
    ""
  ];

  requestSheet.appendRow(row);

  return {
    ok: true,
    requestId,
    message: "บันทึกคำขอเรียบร้อย",
    attachments: attachmentInfos
  };
}

function getRequests(department) {
  ensureDataModel();
  return getRequests(sanitize(department));
}

function getUploadContext(payload) {
  ensureDataModel();

  // This call ensures the script has Drive scope before returning token for resumable upload.
  DriveApp.getRootFolder();

  const data = payload || {};
  const requestType = sanitize(data.requestType || "Add");
  const existingSdsCode = sanitize(data.existingSdsCode);
  const chemicalName = sanitize(data.chemicalName);
  const tradeName = sanitize(data.tradeName);

  if (!chemicalName) {
    throw new Error("กรุณาระบุชื่อสารเคมีก่อนอัปโหลดไฟล์");
  }

  const folder = ensureRequestAttachmentFolder({
    requestType,
    chemicalName,
    tradeName,
    existingSdsCode
  });

  return {
    accessToken: ScriptApp.getOAuthToken(),
    folderId: folder.getId(),
    folderName: folder.getName(),
    folderUrl: folder.getUrl()
  };
}

function getRequests(department) {
  const requestSheet = getSheet(SHEET_NAMES.requests, REQUEST_HEADERS);
  const rows = readRowsAsObjects(requestSheet, REQUEST_HEADERS);

  return rows
    .filter((row) => !department || sanitize(row.Department) === department)
    .map((row) => ({
      requestId: sanitize(row["Request ID"]),
      requestedAt: row["Requested At"] instanceof Date ? row["Requested At"].toISOString() : sanitize(row["Requested At"]),
      department: sanitize(row.Department),
      requestType: sanitize(row["Request Type"]),
      existingSdsCode: sanitize(row["รหัส SDS เดิม"]),
      chemicalName: sanitize(row["ชื่อผลิตภัณฑ์/สารเคมี"]),
      tradeName: sanitize(row["Trade Name"]),
      status: sanitize(row.Status || "Pending"),
      attachmentFolderId: sanitize(row["ไฟล์แนบ Folder ID"]),
      attachmentUrls: sanitize(row["ไฟล์แนบ URL"]).split(/\n+/).filter(Boolean),
      reviewerComment: sanitize(row["Reviewer Comment"])
    }))
    .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
}

function ensureRequestAttachmentFolder(meta) {
  const baseFolderId = sanitize(PropertiesService.getScriptProperties().getProperty("UPLOAD_FOLDER_ID"));
  const baseFolder = baseFolderId ? DriveApp.getFolderById(baseFolderId) : DriveApp.getRootFolder();

  const parentFolder = getOrCreateFolder(baseFolder, "SDS_Request_Attachments");
  const folderName = buildRequestAttachmentFolderName(meta || {});

  return getOrCreateFolder(parentFolder, folderName);
}

function getOrCreateFolder(parentFolder, folderName) {
  const name = sanitize(folderName);
  if (!name) {
    throw new Error("ไม่พบชื่อโฟลเดอร์สำหรับไฟล์แนบ");
  }

  const iterator = parentFolder.getFoldersByName(name);
  if (iterator.hasNext()) {
    return iterator.next();
  }

  return parentFolder.createFolder(name);
}

function buildRequestAttachmentFolderName(meta) {
  const requestType = sanitize(meta.requestType || "Add");
  const chemicalName = sanitize(meta.chemicalName);
  const tradeName = sanitize(meta.tradeName);
  const sdsCode = sanitize(meta.existingSdsCode);

  const baseName = [chemicalName, tradeName].filter(Boolean).join(" - ") || "Unknown Chemical";
  const tokens = [baseName];

  if (sdsCode) {
    tokens.push(`SDS ${sdsCode}`);
  }

  tokens.push(requestType === "Edit" ? "EDIT" : "ADD");
  const normalized = tokens.join(" | ").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();

  return normalized || `Chemical Request ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss")}`;
}

function uploadFilesToDrive(filePayloads) {
  const files = Array.isArray(filePayloads) ? filePayloads : [];
  if (!files.length) {
    return [];
  }

  const folderId = PropertiesService.getScriptProperties().getProperty("UPLOAD_FOLDER_ID");
  const targetFolder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();

  return files
    .filter((file) => file && file.base64 && file.name)
    .map((file) => {
      const bytes = Utilities.base64Decode(file.base64);
      const blob = Utilities.newBlob(bytes, file.mimeType || MimeType.PLAIN_TEXT, file.name);
      const created = targetFolder.createFile(blob);
      return {
        name: created.getName(),
        id: created.getId(),
        url: created.getUrl()
      };
    });
}

function buildStats(deptRows) {
  const stats = {};
  CATEGORY_KEYS.forEach((entry) => {
    stats[entry.key] = deptRows.reduce((acc, row) => {
      return acc + (isChecked(row[entry.header]) ? 1 : 0);
    }, 0);
  });
  return stats;
}

function toChemicalViewModel(row, catalogMap) {
  const categories = CATEGORY_KEYS.filter((entry) => isChecked(row[entry.header])).map((entry) => entry.label);
  const ppe = PPE_KEYS.filter((entry) => isChecked(row[entry.label])).map((entry) => entry.label);
  const sdsCode = sanitize(row["รหัส SDS"]);
  const catalogItem = (catalogMap && catalogMap[sdsCode]) || {};

  return {
    department: sanitize(row["แผนก"]),
    sdsCode,
    chemicalName: sanitize(row["ชื่อผลิตภัณฑ์/สารเคมี"]),
    tradeName: sanitize(row["Trade Name"]),
    maxQuantity: sanitize(row["ปริมาณสูงสุดที่มี"]),
    storageArea: sanitize(row["พื้นที่/หน่วยงานที่จัดเก็บ"]),
    imageUrl: sanitize(catalogItem.imageUrl),
    documentUrls: Array.isArray(catalogItem.documentUrls) ? catalogItem.documentUrls : [],
    categories,
    ppe,
    code1: isChecked(row["ต้องประกาศ Code 1"])
  };
}

function buildCatalogMap(catalogRows) {
  const map = {};
  (catalogRows || []).forEach((row) => {
    const code = sanitize(row["รหัส SDS"]);
    if (!code) {
      return;
    }

    map[code] = {
      imageUrl: sanitize(row["รูปภาพ"]),
      documentUrls: parseDocumentUrls(row["เอกสารประกอบ"])
    };
  });

  return map;
}

function parseDocumentUrls(value) {
  return sanitize(value)
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getDepartmentList(inventoryRows) {
  const set = new Set();
  inventoryRows.forEach((row) => {
    const dept = sanitize(row["แผนก"]);
    if (dept) {
      set.add(dept);
    }
  });

  return Array.from(set).sort();
}

function readRowsAsObjects(sheet, headers) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("ไม่พบ Spreadsheet ที่ active อยู่ในสคริปต์นี้");
  }

  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    try {
      sheet = ss.insertSheet(name);
    } catch (error) {
      // Handle concurrent creation: if another execution created the sheet first, reuse it.
      sheet = ss.getSheetByName(name);
      if (!sheet) {
        throw error;
      }
    }
  }

  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const isHeaderMismatch = headers.some((header, idx) => sanitize(firstRow[idx]) !== header);

  if (isHeaderMismatch) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function ensureDataModel() {
  const inventorySheet = getSheet(SHEET_NAMES.inventory, INVENTORY_HEADERS);
  getSheet(SHEET_NAMES.catalog, CATALOG_HEADERS);
  getSheet(SHEET_NAMES.requests, REQUEST_HEADERS);
  const inventoryRows = readRowsAsObjects(inventorySheet, INVENTORY_HEADERS);
  const departments = getDepartmentList(inventoryRows);
  ensureUsersByDepartments(departments);
  ensureAdminUser();
}

function ensureUsersByDepartments(departments) {
  const usersSheet = getSheet(SHEET_NAMES.users, USERS_HEADERS);
  const userRows = readRowsAsObjects(usersSheet, USERS_HEADERS);

  const activeDepartments = new Set(
    userRows
      .filter((row) => sanitize(row.Department))
      .map((row) => sanitize(row.Department))
  );

  const existingUsernames = new Set(
    userRows
      .map((row) => sanitize(row.Username).toLowerCase())
      .filter(Boolean)
  );

  const missing = (departments || []).filter((dept) => !activeDepartments.has(dept));
  if (!missing.length) {
    return;
  }

  const now = new Date();
  const rowsToInsert = missing.map((dept, index) => {
    const username = createUsernameFromDepartment(dept, existingUsernames);
    const password = createDefaultPassword(index + 1);
    existingUsernames.add(username.toLowerCase());
    return [dept, username, password, true, now, now, "user"];
  });

  usersSheet
    .getRange(usersSheet.getLastRow() + 1, 1, rowsToInsert.length, USERS_HEADERS.length)
    .setValues(rowsToInsert);
}

function createUsernameFromDepartment(department, existingUsernames) {
  const asciiBase = sanitize(department)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 8);

  const prefix = asciiBase || "dept";
  let counter = 1;
  let candidate = prefix;

  while (existingUsernames.has(candidate.toLowerCase())) {
    candidate = `${prefix}${String(counter).padStart(2, "0")}`;
    counter += 1;
  }

  return candidate;
}

function createDefaultPassword(seed) {
  return `PT3-${String(seed).padStart(3, "0")}@SDS`;
}

function ensureAdminUser() {
  const usersSheet = getSheet(SHEET_NAMES.users, USERS_HEADERS);
  const rows = readRowsAsObjects(usersSheet, USERS_HEADERS);
  const hasAdmin = rows.some((row) => sanitize(row.Username).toLowerCase() === DEFAULT_ADMIN_USERNAME);
  if (hasAdmin) {
    return;
  }

  const now = new Date();
  usersSheet.appendRow(["ADMIN", DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD, true, now, now, "admin"]);
}

function findUserRowByUsername(usersSheet, usernameLower) {
  const rows = readRowsAsObjects(usersSheet, USERS_HEADERS);
  for (let i = 0; i < rows.length; i += 1) {
    if (sanitize(rows[i].Username).toLowerCase() === usernameLower) {
      return {
        rowIndex: i + 2,
        row: rows[i]
      };
    }
  }
  return null;
}

function normalizeRole(roleValue) {
  const text = sanitize(roleValue).toLowerCase();
  return text === "admin" ? "admin" : "user";
}

function createSessionToken(userRow) {
  const token = Utilities.getUuid();
  const payload = {
    username: sanitize(userRow.Username),
    department: sanitize(userRow.Department),
    role: normalizeRole(userRow.Role)
  };

  CacheService.getScriptCache().put(`session:${token}`, JSON.stringify(payload), SESSION_TTL_SECONDS);
  return token;
}

function getSessionFromToken(sessionToken) {
  const token = sanitize(sessionToken);
  if (!token) {
    throw new Error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }

  const raw = CacheService.getScriptCache().get(`session:${token}`);
  if (!raw) {
    throw new Error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }

  return JSON.parse(raw);
}

function assertAdmin(sessionToken) {
  const session = getSessionFromToken(sessionToken);
  if (sanitize(session.role).toLowerCase() !== "admin") {
    throw new Error("สิทธิ์ไม่เพียงพอสำหรับการจัดการผู้ใช้");
  }
  return session;
}

function isTruthy(value) {
  const text = sanitize(value).toLowerCase();
  return text === "true" || text === "yes" || text === "y" || text === "1" || text === "✓";
}

function isChecked(value) {
  const text = sanitize(value).toLowerCase();
  return text === "✓" || text === "true" || text === "yes" || text === "y" || text === "1";
}

function sanitize(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function normalizeFileName(text) {
  return sanitize(text)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_\-]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "") || "department";
}

