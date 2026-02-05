// ==================== CONFIGURATION ====================
const ROOT_FOLDER_ID = '1L7FoZ2SVt71Ku0MFakCXv-JtXS2jk74q'; // Replace with your Google Drive root folder ID
const SHEET_NAME = 'Submissions'; // Name of the sheet to store data

// ==================== MAIN FUNCTIONS ====================

/**
 * Handle GET requests - Retrieve submission data
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch(action) {
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
    
    switch(action) {
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
    
    // For ECRI weekly reports
    if (team === 'ECRI') {
      const weekYear = week.split('-W')[0];
      const weekNum = week.split('-W')[1];
      const row = findOrCreateRow(sheet, weekYear, `สัปดาห์ ${weekNum}`);
      updateRow(sheet, row, 'ECRI', timestamp, folderUrl);
    } else {
      // For monthly reports
      const row = findOrCreateRow(sheet, year, month);
      updateRow(sheet, row, team, timestamp, folderUrl);
    }
    
    return createResponse(true, 'Submission saved successfully', {
      timestamp: timestamp.toISOString()
    });
    
  } catch (error) {
    return createResponse(false, error.toString(), null);
  }
}

// ==================== DATA RETRIEVAL FUNCTIONS ====================

/**
 * Get submission data filtered by parameters
 */
function getSubmissions(params) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const results = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const record = {};
      
      // Apply filters if provided
      if (params.year && row[1] != params.year) continue;
      if (params.month && row[2] != params.month) continue;
      if (params.team && !hasTeamData(row, headers, params.team)) continue;
      
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
 * Get data for a specific month
 */
function getMonthData(params) {
  try {
    const year = params.year;
    const month = params.month;
    
    if (!year || !month) {
      return createResponse(false, 'Year and month are required', null);
    }
    
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find the row for this year/month
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] == year && data[i][2] == month) {
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = data[i][j];
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
 * Get all submission data
 */
function getAllSubmissionData() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const results = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const record = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j];
      }
      results.push(record);
    }
    
    return createResponse(true, 'All data retrieved', results);
    
  } catch (error) {
    return createResponse(false, error.toString(), null);
  }
}

function getUploadToken(e) {
    try {
        const {team, year, month, week} = e.parameter;
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
 * Get or create the submissions sheet
 */
function getOrCreateSheet() {
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
      'เวลาอัพโหลด ECRI',
      'ลิ้งค์โฟลเดอร์ที่อัพโหลด ECRI'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  
  return sheet;
}

/**
 * Get or create folder structure: Year > Month > Team
 */
function getOrCreateFolderStructure(team, year, month, week) {
  const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  
  // For ECRI weekly reports
  if (team === 'ECRI' && week) {
    const weekYear = week.split('-W')[0];
    const weekNum = week.split('-W')[1];
    
    const yearFolder = getOrCreateFolder(rootFolder, weekYear);
    const weekFolder = getOrCreateFolder(yearFolder, `Week_${weekNum}`);
    const teamFolder = getOrCreateFolder(weekFolder, team);
    
    return teamFolder;
  }
  
  // For monthly reports
  const yearFolder = getOrCreateFolder(rootFolder, year);
  const monthFolder = getOrCreateFolder(yearFolder, month);
  const teamFolder = getOrCreateFolder(monthFolder, team);
  
  return teamFolder;
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
 * Find or create a row for the given year/month
 */
function findOrCreateRow(sheet, year, month) {
  const data = sheet.getDataRange().getValues();
  
  // Normalize check values to strings for robust comparison
  const searchYear = String(year).trim();
  const searchMonth = String(month).trim();
  
  // Search for existing row
  for (let i = 1; i < data.length; i++) {
    const rowYear = String(data[i][1]).trim();
    const rowMonth = String(data[i][2]).trim();
    
    if (rowYear === searchYear && rowMonth === searchMonth) {
      return i + 1; // Return 1-based row number
    }
  }
  
  // Create new row if not found
  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 1).setValue(new Date()); // timestamp
  sheet.getRange(newRow, 2).setValue(year);
  sheet.getRange(newRow, 3).setValue(month);
  
  return newRow;
}

/**
 * Update row with team submission data
 */
function updateRow(sheet, rowNum, team, timestamp, folderUrl) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const timeColName = `เวลาอัพโหลด Team ${team}`;
  const linkColName = `ลิ้งค์โฟลเดอร์ที่อัพโหลด Team ${team}`;
  
  const timeCol = headers.indexOf(timeColName) + 1;
  const linkCol = headers.indexOf(linkColName) + 1;
  
  if (timeCol > 0) {
    sheet.getRange(rowNum, timeCol).setValue(timestamp);
  }
  
  if (linkCol > 0) {
    sheet.getRange(rowNum, linkCol).setValue(folderUrl);
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
