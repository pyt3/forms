# คู่มือการติดตั้ง Google Apps Script

## ขั้นตอนที่ 1: เตรียม Google Drive

1. เข้า [Google Drive](https://drive.google.com/)
2. สร้างโฟลเดอร์ใหม่ชื่อ "Work Submissions" (หรือชื่ออื่นตามต้องการ)
3. เปิดโฟลเดอร์และคัดลอก Folder ID จาก URL
   ```
   URL: https://drive.google.com/drive/folders/1abc123xyz...
   Folder ID: 1abc123xyz...
   ```
4. บันทึก Folder ID ไว้

## ขั้นตอนที่ 2: เตรียม Google Sheets

1. เข้า [Google Sheets](https://sheets.google.com/)
2. สร้าง Spreadsheet ใหม่ชื่อ "Work Submission Tracker"
3. คัดลอก Spreadsheet ID จาก URL
   ```
   URL: https://docs.google.com/spreadsheets/d/1abc123xyz.../edit
   Spreadsheet ID: 1abc123xyz...
   ```
4. บันทึก Spreadsheet ID ไว้

**หมายเหตุ:** ไม่ต้องสร้าง headers เอง ระบบจะสร้างอัตโนมัติ

## ขั้นตอนที่ 3: สร้าง Google Apps Script Project

1. เข้า [Google Apps Script](https://script.google.com/)
2. คลิก **"โปรเจ็กต์ใหม่"** (New Project)
3. เปลี่ยนชื่อโปรเจ็กต์เป็น "Work Submission API"

## ขั้นตอนที่ 4: เพิ่มโค้ด

1. ลบโค้ดเริ่มต้นทั้งหมดใน `Code.gs`
2. คัดลอกโค้ดทั้งหมดจากไฟล์ `google-apps-script.js`
3. วางลงใน `Code.gs`

## ขั้นตอนที่ 5: ตั้งค่า Configuration

แก้ไขค่าใน Code.gs ดังนี้:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // วาง Spreadsheet ID ที่คัดลอกไว้
const ROOT_FOLDER_ID = 'YOUR_ROOT_FOLDER_ID_HERE'; // วาง Folder ID ที่คัดลอกไว้
```

**ตัวอย่าง:**
```javascript
const SPREADSHEET_ID = '1abc123XYZ-456def789GHI';
const ROOT_FOLDER_ID = '1xyz789ABC-123def456JKL';
```

## ขั้นตอนที่ 6: ทดสอบ Setup

1. เลือก function `testSetup` จาก dropdown
2. คลิก **Run** (▶️)
3. ครั้งแรกจะขออนุญาต:
   - คลิก **"Review permissions"**
   - เลือกบัญชี Google
   - คลิก **"Advanced"** > **"Go to Work Submission API (unsafe)"**
   - คลิก **"Allow"**
4. ตรวจสอบ Log (View > Logs) ควรเห็น:
   ```
   Sheet created/found: Submissions
   Root folder found: Work Submissions
   Setup test completed successfully!
   ```

## ขั้นตอนที่ 7: Deploy Web App

### 1. เริ่มต้น Deploy

1. คลิก **Deploy** > **New deployment**
2. คลิกไอคอนเกียร์ ⚙️ > เลือก **Web app**

### 2. กำหนดค่า Deployment

- **Description**: Work Submission API v1
- **Execute as**: Me (ตัวคุณเอง)
- **Who has access**: Anyone

⚠️ **สำคัญ:** ต้องเลือก "Anyone" เพื่อให้ระบบทำงานได้

### 3. Deploy

1. คลิก **Deploy**
2. คัดลอก **Web app URL**
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```
3. บันทึก URL นี้ไว้

### 4. ทดสอบ API

เปิด URL ใน browser ควรเห็น:
```json
{
  "success": false,
  "message": "Invalid action",
  "data": null,
  "timestamp": "2026-02-05T..."
}
```

## ขั้นตอนที่ 8: อัพเดท Frontend Configuration

1. เปิดไฟล์ `index.js` ในโปรเจ็กต์
2. แก้ไขค่า `API_URL`:

```javascript
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbz.../exec',
    ...
}
```

## ขั้นตอนที่ 9: ทดสอบระบบ

1. เปิดเว็บไซต์ (index.html)
2. ไปที่แท็บ "อัพโหลดงาน"
3. ทดสอบอัพโหลดไฟล์
4. ตรวจสอบใน Google Drive และ Google Sheets

## การอัพเดทโค้ด

เมื่อต้องการแก้ไขโค้ด:

1. แก้ไขโค้ดใน Code.gs
2. คลิก **Deploy** > **Manage deployments**
3. คลิกไอคอนดินสอ ✏️ ที่ deployment
4. เปลี่ยน **Version** เป็น "New version"
5. คลิก **Deploy**

**หมายเหตุ:** URL จะยังคงเหมือนเดิม ไม่ต้องเปลี่ยนใน frontend

## การตรวจสอบ Permissions

หาก deploy แล้วไม่ทำงาน:

1. **ตรวจสอบ Permissions:**
   - เข้า [Google Account Permissions](https://myaccount.google.com/permissions)
   - หา "Work Submission API"
   - ตรวจสอบว่ามีสิทธิ์:
     - Google Drive
     - Google Sheets

2. **ตรวจสอบ Execution Log:**
   - ใน Apps Script: View > Executions
   - ดู error messages

3. **Re-authorize:**
   - รัน `testSetup()` อีกครั้ง
   - Allow permissions ใหม่

## Troubleshooting

### Error: "Exception: You do not have permission to call..."

**แก้ไข:**
- รัน `testSetup()` และ authorize permissions
- ตรวจสอบว่า execute as "Me"

### Error: "Script function not found"

**แก้ไข:**
- ตรวจสอบว่า deploy เป็น "Web app"
- ตรวจสอบว่ามี `doGet()` และ `doPost()` functions

### ไม่สามารถสร้างโฟลเดอร์ใน Drive

**แก้ไข:**
- ตรวจสอบ ROOT_FOLDER_ID ถูกต้อง
- ตรวจสอบว่าบัญชีที่ execute มีสิทธิ์เขียนใน folder

### Google Sheets ไม่อัพเดท

**แก้ไข:**
- ตรวจสอบ SPREADSHEET_ID ถูกต้อง
- ตรวจสอบว่าบัญชีที่ execute มีสิทธิ์แก้ไข sheet

## Security Best Practices

1. **จำกัดการเข้าถึง:**
   - ใช้ "Anyone with the link" แทน "Anyone" ถ้าเป็นไปได้
   - เพิ่ม authentication layer

2. **Backup:**
   - สำรอง Google Sheet เป็นประจำ
   - Export เป็น CSV เพื่อความปลอดภัย

3. **Monitor:**
   - ตรวจสอบ Execution log เป็นประจำ
   - ดูว่ามี unauthorized access หรือไม่

## ข้อจำกัด

- **Quota limits:**
  - URL Fetch calls: 20,000/day
  - Script runtime: 6 min/execution
  - Triggers: 90 min/day

- **File size:**
  - อัพโหลดผ่าน POST: ~50MB max
  - แนะนำ: < 10MB ต่อไฟล์

## การช่วยเหลือเพิ่มเติม

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Drive API Reference](https://developers.google.com/drive/api/reference/rest/v3)
- [Sheets API Reference](https://developers.google.com/sheets/api/reference/rest)

---

**สร้างโดย:** Work Submission System  
**อัพเดท:** 5 กุมภาพันธ์ 2026
