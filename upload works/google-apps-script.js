// ==================== CONFIGURATION ====================
const ROOT_FOLDER_ID = '1L7FoZ2SVt71Ku0MFakCXv-JtXS2jk74q'; // Replace with your Google Drive root folder ID
const SHEET_NAME = 'Submissions'; // Name of the sheet to store data

// Cache for sheet instance
let _sheetCache = null;
let _headerCache = null;

// ==================== MAIN FUNCTIONS ====================

/**
 * Handle GET requests - Retrieve submission data
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    switch (action) {
      case 'getSubmissions':
        return getSubmissions(e.parameter);
      case 'getMonthData':
        return getMonthData(e.parameter);
      case 'getAllData':
        return getAllSubmissionData();
      default:
        return createResponse(false, 'Invalid action', null);
    }
  } catch (error) {
    return createResponse(false, error.toString(), null);
  }
}

/**
 * Handle POST requests - Upload files and save data
 */
function doPost(e) {
  try {
    const action = e.parameter.action;

    switch (action) {
      case 'upload':
        return handleFileUpload(e);
      case 'saveSubmission':
        return saveSubmissionData(e);
      case 'getUploadToken':
        return getUploadToken(e);
      default:
        return createResponse(false, 'Invalid action', null);
    }
  } catch (error) {
    return createResponse(false, error.toString(), null);
  }
}

// ==================== FILE UPLOAD FUNCTIONS ====================

/**
 * Handle file upload using resumable upload
 */
function handleFileUpload(e) {
  try {
    const team = e.parameter.team;
    const year = e.parameter.year;
    const month = e.parameter.month;
    const week = e.parameter.week;
    const fileName = e.parameter.fileName;
    const fileData = e.parameter.fileData;
    const mimeType = e.parameter.mimeType;

    // Validate required parameters
    if (!team || !fileName || !fileData) {
      return createResponse(false, 'Missing required parameters', null);
    }

    // Get or create folder structure
    const targetFolder = getOrCreateFolderStructure(team, year, month, week);

    // Decode base64 file data
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData),
      mimeType || 'application/octet-stream',
      fileName
    );

    // Upload file
    const file = targetFolder.createFile(blob);

    return createResponse(true, 'File uploaded successfully', {
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      folderId: targetFolder.getId(),
      folderUrl: targetFolder.getUrl()
    });

  } catch (error) {
    return createResponse(false, error.toString(), null);
  }
}

/**
 * Save submission metadata to Google Sheets
 */
function saveSubmissionData(e) {
  try {
    const team = e.parameter.team;
    const year = e.parameter.year;
    const month = e.parameter.month;
    const week = e.parameter.week;
    const folderUrl = e.parameter.folderUrl;

    if (!team || (!year && !week)) {
      return createResponse(false, 'Missing required parameters', null);
    }

    const sheet = getOrCreateSheet();
    const timestamp = new Date();
    // For monthly reports
    const row = findOrCreateRow(sheet, year, month);
    updateRow(sheet, row, team, timestamp, folderUrl);

    return createResponse(true, 'Submission saved successfully', {
      timestamp: timestamp.toISOString()
    });

  } catch (error) {
    return createResponse(false, error.toString(), null);
  }
}

// ==================== DATA RETRIEVAL FUNCTIONS ====================

/**
 * Get submission data filtered by parameters (optimized)
 */
function getSubmissions(params) {
  try {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      return createResponse(true, 'Data retrieved successfully', []);
    }

    const headers = getHeaders(sheet);
    const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

    const results = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Apply filters if provided
      if (params.year && row[1] != params.year) continue;
      if (params.month && row[2] != params.month) continue;
      if (params.team && !hasTeamDataFromRow(row, headers, params.team)) continue;

      const record = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j];
      }
      results.push(record);
    }

    return createResponse(true, 'Data retrieved successfully', results);

  } catch (error) {
    return createResponse(false, error.toString(), null);
  }
}

/**
 * Check if row has data for specific team (from row array)
 */
function hasTeamDataFromRow(row, headers, team) {
  const timeColName = `เวลาอัพโหลด Team ${team}`;
  const timeCol = headers.indexOf(timeColName);

  return timeCol >= 0 && row[timeCol] && row[timeCol] !== '';
}

/**
 * Get month data for a specific month
 */
function getMonthData(params) {
  try {
    const year = params.year;
    const month = params.month;

    if (!year || !month) {
      return createResponse(false, 'Year and month are required', null);
    }

    const sheet = getOrCreateSheet();
    const headers = getHeaders(sheet);
    
    // Search year and month columns only (columns 2 and 3)
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return createResponse(true, 'No data found', null);
    }

    const yearMonthData = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
    
    // Find matching row
    for (let i = 0; i < yearMonthData.length; i++) {
      if (yearMonthData[i][0] == year && yearMonthData[i][1] == month) {
        // Found the row, get full row data
        const rowData = sheet.getRange(i + 2, 1, 1, headers.length).getValues()[0];
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = rowData[j];
        }
        if (String(params.team || '').trim().toUpperCase() === 'ECRI') {
          const ecriStatus = getEcriWeeklyStatus(year, month);
          record[`ลิ้งค์โฟลเดอร์ที่อัพโหลด Team ECRI`] = ecriStatus.exists ? record[`ลิ้งค์โฟลเดอร์ที่อัพโหลด Team ECRI`] : null;
        }

        return createResponse(true, 'Month data retrieved', record);
      }
    }

    // No data found for this month
    return createResponse(true, 'No data found', null);

  } catch (error) {
    return createResponse(false, error.toString(), null);
  }
}

/**
 * Check ECRI weekly folder for the current week and return percentage.
 */
function getEcriWeeklyStatus(year, month) {
  const result = {
    weekLabel: null,
    exists: false
  };

  if (!year || !month) {
    return result;
  }

  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentMonth = String(now.getMonth() + 1);

  if (String(year).trim() !== currentYear || String(month).trim() !== currentMonth) {
    return result;
  }

  const weekLabel = getWeekFolderName(now);
  result.weekLabel = weekLabel;

  const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const yearFolder = getFolderByName(rootFolder, String(year));
  if (!yearFolder) return result;

  const monthFolder = getFolderByName(yearFolder, String(month));
  if (!monthFolder) return result;

  const teamFolder = getFolderByName(monthFolder, 'ECRI');
  if (!teamFolder) return result;

  const weekFolder = getFolderByName(teamFolder, weekLabel);
  if (!weekFolder) return result;

  result.exists = true;
  return result;
}

/**
 * Get all submission data
 */
function getAllSubmissionData() {
  try {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      return createResponse(true, 'All data retrieved', []);
    }

    const headers = getHeaders(sheet);
    const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

    const results = data.map(row => {
      const record = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j];
      }
      return record;
    });

    return createResponse(true, 'All data retrieved', results);

  } catch (error) {
    return createResponse(false, error.toString(), null);
  }
}

function getUploadToken(e) {
  try {
    const { team, year, month, week } = e.parameter;
    const targetFolder = getOrCreateFolderStructure(team, year, month, week);
    const token = ScriptApp.getOAuthToken();

    return createResponse(true, 'Upload token retrieved', {
      folderId: targetFolder.getId(),
      token: token
    });

  } catch (error) {
    return createResponse(false, error.toString(), null);
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get or create the submissions sheet with caching
 */
function getOrCreateSheet() {
  // Return cached sheet if available
  if (_sheetCache !== null) {
    return _sheetCache;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Create headers
    const headers = [
      'timestamp',
      'ปี',
      'เดือน',
      'เวลาอัพโหลด Team PM',
      'ลิ้งค์โฟลเดอร์ที่อัพโหลด Team PM',
      'เวลาอัพโหลด Team CM',
      'ลิ้งค์โฟลเดอร์ที่อัพโหลด Team CM',
      'เวลาอัพโหลด Team Pool',
      'ลิ้งค์โฟลเดอร์ที่อัพโหลด Team Pool',
      'เวลาอัพโหลด Team Admin',
      'ลิ้งค์โฟลเดอร์ที่อัพโหลด Team Admin',
      'เวลาอัพโหลด Team ECRI',
      'ลิ้งค์โฟลเดอร์ที่อัพโหลด Team ECRI'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    _headerCache = headers;
  }

  _sheetCache = sheet;
  return sheet;
}

/**
 * Get headers with caching
 */
function getHeaders(sheet) {
  if (_headerCache !== null) {
    return _headerCache;
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  _headerCache = headers;
  return headers;
}

/**
 * Get or create folder structure: Year > Month > Team
 */
function getOrCreateFolderStructure(team, year, month, week) {
  const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);

  // For monthly reports
  const yearFolder = getOrCreateFolder(rootFolder, year);
  const monthFolder = getOrCreateFolder(yearFolder, month);
  const teamFolder = getOrCreateFolder(monthFolder, team);
  // For ECRI weekly reports
  if (team === 'ECRI' && week) {
    const weekFolder = getOrCreateFolder(teamFolder, week);
    return weekFolder;
  } else {
    return teamFolder;
  }
}

/**
 * Get or create a folder by name
 */
function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

/**
 * Get a folder by name without creating it.
 */
function getFolderByName(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : null;
}

/**
 * Build ECRI weekly folder name like 01FEB_07FEB (Sunday to Saturday).
 */
function getWeekFolderName(date) {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const tz = Session.getScriptTimeZone();
  const startLabel = Utilities.formatDate(start, tz, 'ddMMM').toUpperCase();
  const endLabel = Utilities.formatDate(end, tz, 'ddMMM').toUpperCase();

  return `${startLabel}_${endLabel}`;
}

/**
 * Find or create a row for the given year/month (optimized)
 */
function findOrCreateRow(sheet, year, month) {
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    // No data rows, create first one
    const newRow = 2;
    sheet.getRange(newRow, 1, 1, 3).setValues([[new Date(), year, month]]);
    return newRow;
  }

  // Only get year and month columns for searching
  const yearMonthData = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
  
  // Normalize check values to strings for robust comparison
  const searchYear = String(year).trim();
  const searchMonth = String(month).trim();

  // Search for existing row
  for (let i = 0; i < yearMonthData.length; i++) {
    const rowYear = String(yearMonthData[i][0]).trim();
    const rowMonth = String(yearMonthData[i][1]).trim();

    if (rowYear === searchYear && rowMonth === searchMonth) {
      return i + 2; // Return 1-based row number (i+2 because data starts at row 2)
    }
  }

  // Create new row if not found
  const newRow = lastRow + 1;
  sheet.getRange(newRow, 1, 1, 3).setValues([[new Date(), year, month]]);
  return newRow;
}

/**
 * Update row with team submission data (optimized)
 */
function updateRow(sheet, rowNum, team, timestamp, folderUrl) {
  const headers = getHeaders(sheet);

  const timeColName = `เวลาอัพโหลด Team ${team}`;
  const linkColName = `ลิ้งค์โฟลเดอร์ที่อัพโหลด Team ${team}`;

  const timeCol = headers.indexOf(timeColName) + 1;
  const linkCol = headers.indexOf(linkColName) + 1;

  // Batch update for better performance
  const updates = [];
  
  if (timeCol > 0 && linkCol > 0) {
    // Update both timestamp and link in one operation if columns are adjacent
    if (Math.abs(timeCol - linkCol) === 1) {
      const startCol = Math.min(timeCol, linkCol);
      const values = timeCol < linkCol ? [[timestamp, folderUrl]] : [[folderUrl, timestamp]];
      sheet.getRange(rowNum, startCol, 1, 2).setValues(values);
    } else {
      // Update separately if not adjacent
      sheet.getRange(rowNum, timeCol).setValue(timestamp);
      sheet.getRange(rowNum, linkCol).setValue(folderUrl);
    }
  }

  // Update main timestamp
  sheet.getRange(rowNum, 1).setValue(new Date());
}

/**
 * Check if row has data for specific team
 */
function hasTeamData(row, headers, team) {
  const timeColName = `เวลาอัพโหลด Team ${team}`;
  const timeCol = headers.indexOf(timeColName);

  return timeCol >= 0 && row[timeCol] && row[timeCol] !== '';
}

/**
 * Create standardized JSON response
 */
function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get upload endpoint URL for resumable upload
 */
function getUploadEndpoint() {
  const scriptUrl = ScriptApp.getService().getUrl();
  return createResponse(true, 'Endpoint retrieved', {
    uploadUrl: scriptUrl
  });
}

/**
 * Test function - can be run from Apps Script editor
 */
function testSetup() {
  Logger.log('Testing setup...');

  try {
    const sheet = getOrCreateSheet();
    Logger.log('Sheet created/found: ' + sheet.getName());

    const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    Logger.log('Root folder found: ' + rootFolder.getName());

    Logger.log('Setup test completed successfully!');
    return true;
  } catch (error) {
    Logger.log('Setup test failed: ' + error.toString());
    return false;
  }
}
