# Session State: SDS Online to Power Apps Migration

## 📌 ภาพรวมโครงการ (Project Overview)
ย้ายระบบ **SDS Online** จากเดิมที่พัฒนาด้วย **Google Apps Script (GAS) + Google Sheets** ไปเป็น **Microsoft Power Apps + SharePoint Online Lists** เพื่อเพิ่มความปลอดภัยและผสานรวมกับระบบขององค์กร

---

## 🕒 สถานะงานล่าสุด (Current Progress)

### 🟢 1. สิ่งที่ทำเสร็จแล้ว (Completed Tasks)
- [x] **วิเคราะห์โครงสร้างเดิม (Legacy Code Analysis)**
  - สำรวจและวิเคราะห์ข้อมูลจาก [Code.js](file:///D:/github/forms-1/sdsForms/Code.js) และหน้าตารางเดิม (`SHEET_NAMES`, `INVENTORY_HEADERS`, `CATALOG_HEADERS`, `REQUEST_HEADERS`, `USERS_HEADERS`)
- [x] **ออกแบบ Data Schema (Data Source Architecture)**
  - กำหนดโครงสร้างตารางใหม่บน **SharePoint Online Lists**:
    1. `SDS_Catalog` (รายการสารเคมีหลัก)
    2. `SDS_Inventory` (รายการจัดเก็บสารเคมีประจำแผนก)
    3. `SDS_Requests` (รายการคำร้องขอเพิ่ม/แก้ไข/ลบ)
  - ปรับการจัดการ **Authentication/Users**: ยกเลิกตาราง Users เดิม โดยเปลี่ยนไปใช้ Microsoft 365 User Profiles / Azure AD สิทธิ์อัตโนมัติ
  - ปรับปรุงโครงสร้าง **Multiple Attachments**: ปรับฟิลด์แนบไฟล์ให้รองรับหลายไฟล์ต่อ 1 รายการโดยใช้ SharePoint Built-in Attachments Control
- [x] **สร้าง PowerShell Script สำหรับ Setup SharePoint Lists**
  - สร้างสคริปต์ [create_sharepoint_lists.ps1](file:///D:/github/forms-1/sdsForms/scratch/create_sharepoint_lists.ps1) สำหรับใช้ PnP PowerShell ในการสร้างทั้ง 3 Lists พร้อม Column และ Choice Types โดยอัตโนมัติ

---

### 🟡 2. งานที่กำลังค้างอยู่ / รอดำเนินการ (In Progress / Pending)
- [ ] **การสร้าง SharePoint Lists บน Environment จริง** (ผู้ใช้นำสคริปต์ไปรันบน SharePoint Site หรือสร้างผ่าน UI)
- [ ] **ออกแบบ UI / Screens Architecture ใน Power Apps (Canvas App)**
  - กำหนดโครงสร้างหน้าจอหลัก (`HomeScreen`, `CatalogGallery`, `RequestForm`, `AdminApproval`)
- [ ] **การพัฒนาสูตร Power Fx**
  - กรองข้อมูลสารเคมีตามแผนกผู้ใช้
  - ฟังก์ชั่นค้นหา (Search / Filter ตามประเภทอันตราย Hazards และ PPE)
  - การจัดการแนบไฟล์หลายไฟล์ (`Attachments.Attachments`) และบันทึกข้อมูล (`Patch`)

---

## 🎯 ขั้นตอนถัดไป (Next Steps)

1. **ออกแบบโครงสร้างหน้าจอ Canvas App (UI & Screen Layouts)**
   - สรุปรายละเอียด Controls และ Layout ของแต่ละหน้าจอ
2. **การเขียนสูตร Power Fx (Core Power Fx Logic)**
   - จัดทำชุดสูตร Power Fx สำหรับ Search, Filter, Patch และ Multiple Attachments Management
3. **การทำ Approval Workflow ด้วย Power Automate**
   - ออกแบบ Flow ส่งแจ้งเตือนคำขอไปยังผู้พิจารณาอนุมัติผ่าน Email / Teams เมื่อมี Request ใหม่
