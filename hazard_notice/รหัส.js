/**
 * Constants for configuration
 */
const CONFIG = {
    MERGE_COLUMN: 14,
    HEADER_BACKGROUND_COLOR: '#FFFF00',
    FIRST_DATA_ROW: 2,
    OUTPUT_SHEET_NAME: 'Analyze Data'
};

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Analyst File')
        .addItem('Start Processing', 'analyzeFiles')
        .addToUi();
}

/**
 * Main function to analyze and process merged cells in the active sheet
 * Consolidates merged cell data and saves to "Analyze Data" sheet
 */
function analyzeFiles() {
    try {
        const sourceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('hazard_notices')
        
        // Validate sheet has data
        if (sourceSheet.getLastRow() < 2) {
            SpreadsheetApp.getUi().alert('Sheet must contain header row and data rows');
            return;
        }

        const header = getHeaderRow(sourceSheet);
        const mergedCellRanges = getMergedCellRanges(sourceSheet);
        
        if (mergedCellRanges.length === 0) {
            SpreadsheetApp.getUi().alert('No merged cells found in column N');
            return;
        }

        const processedData = processeMergedRanges(sourceSheet, mergedCellRanges);
        
        // Get or create output sheet
        const outputSheet = getOrCreateOutputSheet();
        
        // Update output sheet with processed data
        updateSheet(outputSheet, header, processedData);
        
        // Switch to output sheet
        SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(outputSheet);
        
        SpreadsheetApp.getUi().alert(`Successfully processed ${processedData.length} merged cell groups\nData saved to "${CONFIG.OUTPUT_SHEET_NAME}" sheet`);
        
    } catch (error) {
        Logger.log(`Error in analyzeFiles: ${error.message}`);
        SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
    }
}

/**
 * Gets or creates the output sheet for analyzed data
 * @return {Sheet} The output sheet
 */
function getOrCreateOutputSheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let outputSheet = spreadsheet.getSheetByName(CONFIG.OUTPUT_SHEET_NAME);
    
    if (!outputSheet) {
        outputSheet = spreadsheet.insertSheet(CONFIG.OUTPUT_SHEET_NAME);
        Logger.log(`Created new sheet: ${CONFIG.OUTPUT_SHEET_NAME}`);
    }
    
    return outputSheet;
}

/**
 * Gets the header row from the sheet
 * @param {Sheet} sheet - The active sheet
 * @return {Array} Header row values
 */
function getHeaderRow(sheet) {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

/**
 * Gets all merged cell ranges in the specified column, sorted by row
 * @param {Sheet} sheet - The active sheet
 * @return {Array} Array of merged range objects with row/column info
 */
function getMergedCellRanges(sheet) {
    const startRow = CONFIG.FIRST_DATA_ROW;
    const lastRow = sheet.getLastRow();
    
    if (lastRow < startRow) return [];
    
    const mergeColumn = CONFIG.MERGE_COLUMN;
    const numRows = lastRow - startRow + 1;
    
    return sheet.getRange(startRow, mergeColumn, numRows, 1)
        .getMergedRanges()
        .map(range => ({
            startRow: range.getRow(),
            endRow: range.getLastRow(),
            startCol: range.getColumn(),
            endCol: range.getLastColumn()
        }))
        .sort((a, b) => a.startRow - b.startRow);
}

/**
 * Processes all merged cell ranges and consolidates their data
 * @param {Sheet} sheet - The active sheet
 * @param {Array} mergedRanges - Array of merged range objects
 * @return {Array} Processed data array
 */
function processeMergedRanges(sheet, mergedRanges) {
    const lastColumn = sheet.getLastColumn();
    const processedData = [];

    mergedRanges.forEach(range => {
        const consolidatedRow = consolidateMergedCells(sheet, range, lastColumn);
        processedData.push(consolidatedRow);
    });

    return processedData;
}

/**
 * Consolidates data from a merged cell range into a single row
 * Combines multi-row values with newlines
 * @param {Sheet} sheet - The active sheet
 * @param {Object} range - Merged range object
 * @param {number} lastColumn - Last column in the sheet
 * @return {Array} Consolidated row data
 */
function consolidateMergedCells(sheet, range, lastColumn) {
    const numRows = range.endRow - range.startRow + 1;
    const rangeData = sheet.getRange(range.startRow, 1, numRows, lastColumn).getValues();
    const consolidatedRow = [];

    for (let col = 0; col < lastColumn; col++) {
        const columnValues = rangeData
            .map(row => row[col])
            .filter(value => value !== "");
        
        const consolidatedValue = columnValues.join('\n');
        consolidatedRow.push(consolidatedValue);
    }
    consolidatedRow[2] =consolidatedRow[2] != ""? Utilities.parseDate(consolidatedRow[2].split('07:')[0].trim(), 'GMT+7', 'EEE MMM dd yyyy') : "";
    consolidatedRow[3] = consolidatedRow[3] != ""? Utilities.parseDate(consolidatedRow[3].split('07:')[0].trim(), 'GMT+7', 'EEE MMM dd yyyy') : "";
    return consolidatedRow;
}   

/**
 * Updates the sheet with header and processed data
 * @param {Sheet} sheet - The active sheet
 * @param {Array} header - Header row values
 * @param {Array} data - Processed data array
 */
function updateSheet(sheet, header, data) {
    // Clear all content
    sheet.clearContents();
    
    // Set header row with formatting
    sheet.getRange(1, 1, 1, header.length)
        .setValues([header])
        .setBackground(CONFIG.HEADER_BACKGROUND_COLOR)
        .setFontWeight('bold');
    
    // Set data rows
    if (data.length > 0 && data[0].length > 0) {
        sheet.getRange(CONFIG.FIRST_DATA_ROW, 1, data.length, data[0].length)
            .setValues(data);
    }
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use analyzeFiles() instead
 */
function AnalyzeFiles() {
    analyzeFiles();
}
