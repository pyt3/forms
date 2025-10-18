# คำแนะนำการตั้งค่า Google Apps Script สำหรับฟอร์มส่งซ่อมภายนอก

## ขั้นตอนการตั้งค่า Google Sheets และ Apps Script

### 1. สร้าง Google Sheets ใหม่
- ไปที่ [Google Sheets](https://sheets.google.com)
- คลิก "สร้างสเปรดชีตเปล่า"
- ตั้งชื่อ "Outsource Repair Records" (หรือชื่อที่ต้องการ)

### 2. สร้าง Apps Script
- ในไฟล์ Google Sheets ที่สร้างใหม่
- ไปที่เมนู **Extensions > Apps Script**
- ลบโค้ดเดิมทั้งหมดใน Code.gs
- คัดลอกโค้ดจากไฟล์ `google-apps-script.js` ไปวาง
- คลิค **Save** (Ctrl+S)

### 3. Deploy Web App
- คลิค **Deploy > New deployment**
- คลิคไอคอน **Settings** (⚙️) และเลือก **Web app**
- ตั้งค่าดังนี้:
  - **Description**: Outsource Repair Form Handler
  - **Execute as**: Me
  - **Who has access**: Anyone
- คลิค **Deploy**
- คัดลอก **Web app URL** ที่ได้

### 4. อัปเดต HTML File
- เปิดไฟล์ `sendoutsourceform.html`
- หาบรรทัดที่มี:
  ```javascript
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
  ```
- แทนที่ `YOUR_SCRIPT_ID` ด้วย URL ที่คัดลอกมาจากขั้นตอนที่ 3

### 5. ทดสอบการทำงาน
- ในหน้า Apps Script
- ไปที่ **Run > testDataSubmission**
- ตรวจสอบใน Google Sheets ว่ามีข้อมูลทดสอบหรือไม่

## โครงสร้างข้อมูลใน Google Sheets

### Sheet 1: OutsourceRepairRecords (ข้อมูลหลัก)
| คอลัมน์ | ข้อมูล |
|---------|--------|
| A | วันที่บันทึก |
| B | เวลา |
| C | ชื่อบริษัทรับซ่อม |
| D | ผู้บันทึก |
| E | บุคคลที่ติดต่อ |
| F | ที่อยู่ |
| G | เบอร์โทรศัพท์ |
| H | จำนวนรายการ |
| I | จำนวนทั้งหมด |
| J | รายการเครื่องมือ (JSON) |

### Sheet 2: EquipmentDetails (รายละเอียดเครื่องมือ)
| คอลัมน์ | ข้อมูล |
|---------|--------|
| A | วันที่บันทึก |
| B | บริษัทรับซ่อม |
| C | ลำดับที่ |
| D | ชื่อเครื่องมือ |
| E | รหัส |
| F | S/N |
| G | สาเหตุการส่งซ่อม |
| H | จำนวน |

## การแก้ไขปัญหาที่อาจเกิดขึ้น

### ปัญหา: CORS Error
- ตรวจสอบว่า Deploy ด้วย "Who has access: Anyone"
- ลองใช้ Incognito/Private Mode

### ปัญหา: Script ไม่ทำงาน
- ตรวจสอบว่า URL ถูกต้อง
- ลองรัน `testDataSubmission()` ใน Apps Script Editor

### ปัญหา: ข้อมูลไม่บันทึก
- เช็ค Console ในเบราว์เซอร์ (F12)
- ตรวจสอบ Network tab ว่ามีการส่ง Request หรือไม่

## ฟีเจอร์ที่เพิ่มขึ้น

### ฟอร์ม HTML
- ✅ ฟิลด์บุคคลที่ติดต่อ
- ✅ ฟิลด์ที่อยู่บริษัท
- ✅ ฟิลด์เบอร์โทรศัพท์
- ✅ การ validation ข้อมูลครบถ้วน
- ✅ Auto-save ข้อมูลใน localStorage
- ✅ การบันทึกข้อมูลไป Google Sheets

### Google Apps Script
- ✅ สร้าง 2 sheets อัตโนมัติ
- ✅ จัดรูปแบบตารางสวยงาม
- ✅ บันทึกข้อมูลหลักและรายละเอียดแยกกัน
- ✅ ระบบจัดการข้อผิดพลาด
- ✅ ฟังก์ชันทดสอบ

## การใช้งาน
1. กรอกข้อมูลบริษัทรับซ่อมและข้อมูลติดต่อ
2. เพิ่มรายการเครื่องมือที่ต้องการส่งซ่อม
3. คลิก "สร้างเอกสารส่งซ่อม"
4. ระบบจะ:
   - บันทึกข้อมูลใน Google Sheets
   - สร้างไฟล์ PDF
   - แสดงสถานะการบันทึกข้อมูล