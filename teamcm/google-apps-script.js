/**
 * Google Apps Script สำหรับรับข้อมูลจากฟอร์มส่งซ่อมภายนอก
 * วิธีใช้:
 * 1. สร้าง Google Sheets ใหม่
 * 2. เปิด Extensions > Apps Script
 * 3. คัดลอกโค้ดนี้ไปใส่
 * 4. Deploy เป็น Web app
 * 5. นำ URL ไปใส่ในตัวแปร GOOGLE_SCRIPT_URL ในไฟล์ HTML
 */

function doPost(e) {
  try {
    // รับข้อมูลจาก POST request
    const data = e.parameter
    
    // เปิด Google Sheets
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('OutsourceRepairRecords');
    // เตรียมข้อมูลที่จะบันทึก
    const timestamp = new Date(data.timestamp);
    const rowData = [
      Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
      Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'HH:mm:ss'),
      data.venderName,
      data.senderName,
      data.contactPerson,
      data.vendorAddress,
      data.contactPhone,
      data.equipmentCount,
      data.totalQuantity,
      data.senderSignatureCoordinates ? JSON.stringify(data.senderSignatureCoordinates) : '',
      data.receiverSignatureCoordinates ? JSON.stringify(data.receiverSignatureCoordinates) : '',
      'รอส่งบริษัท', // สถานะเริ่มต้น
      data.remarks || '', // หมายเหตุ
      JSON.stringify(data.equipments, null, 2)
    ];
    
    // เพิ่มข้อมูลลงใน sheet
    sheet.appendRow(rowData);
    
    // จัดรูปแบบแถวที่เพิ่มใหม่
    const lastRow = sheet.getLastRow();
    const dataRange = sheet.getRange(lastRow, 1, 1, rowData.length);
    
    // สลับสี background สำหรับแถวคู่/คี่
    if (lastRow % 2 === 0) {
      dataRange.setBackground('#f8f9fa');
    }
    
    // ส่งคืนผลลัพธ์
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
        timestamp: data.timestamp,
        recordCount: data.equipmentCount
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // ส่งคืนข้อผิดพลาด
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'เกิดข้อผิดพลาด: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

