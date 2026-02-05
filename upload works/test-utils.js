/**
 * Test Configuration and Utilities
 * สำหรับทดสอบระบบก่อนใช้งานจริง
 */

// Test Configuration
const TEST_CONFIG = {
    // ใส่ API URL ของคุณที่นี่
    API_URL: '',
    
    // ตั้งค่าทีมสำหรับทดสอบ
    TEST_TEAM: 'PM',
    TEST_YEAR: '2026',
    TEST_MONTH: 'กุมภาพันธ์',
    
    // ตั้งค่าสำหรับ ECRI
    TEST_WEEK: '2026-W06'
};

/**
 * ทดสอบการเชื่อมต่อ API
 */
async function testAPIConnection() {
    console.log('Testing API connection...');
    
    if (!TEST_CONFIG.API_URL) {
        console.error('❌ กรุณาใส่ API_URL ใน TEST_CONFIG');
        return false;
    }
    
    try {
        const response = await fetch(`${TEST_CONFIG.API_URL}?action=invalid`);
        const result = await response.json();
        
        if (result.success === false && result.message === 'Invalid action') {
            console.log('✅ API connection successful!');
            console.log('Response:', result);
            return true;
        } else {
            console.error('❌ Unexpected response:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Connection failed:', error);
        return false;
    }
}

/**
 * ทดสอบการดึงข้อมูลทั้งหมด
 */
async function testGetAllData() {
    console.log('Testing getAllData...');
    
    try {
        const response = await fetch(`${TEST_CONFIG.API_URL}?action=getAllData`);
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ getAllData successful!');
            console.log('Data count:', result.data ? result.data.length : 0);
            console.log('Sample data:', result.data);
            return true;
        } else {
            console.error('❌ getAllData failed:', result.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Request failed:', error);
        return false;
    }
}

/**
 * ทดสอบการดึงข้อมูลรายเดือน
 */
async function testGetMonthData() {
    console.log('Testing getMonthData...');
    
    try {
        const url = `${TEST_CONFIG.API_URL}?action=getMonthData&year=${TEST_CONFIG.TEST_YEAR}&month=${TEST_CONFIG.TEST_MONTH}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ getMonthData successful!');
            console.log('Month data:', result.data);
            return true;
        } else {
            console.error('❌ getMonthData failed:', result.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Request failed:', error);
        return false;
    }
}

/**
 * ทดสอบการสร้างไฟล์ทดสอบ
 */
function createTestFile() {
    const content = 'This is a test file for Work Submission System\n';
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], 'test-file.txt', { type: 'text/plain' });
    return file;
}

/**
 * ทดสอบการแปลงไฟล์เป็น Base64
 */
function testBase64Conversion() {
    console.log('Testing Base64 conversion...');
    
    return new Promise((resolve, reject) => {
        const file = createTestFile();
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const base64 = e.target.result.split(',')[1];
            console.log('✅ Base64 conversion successful!');
            console.log('File size:', file.size, 'bytes');
            console.log('Base64 length:', base64.length);
            resolve(base64);
        };
        
        reader.onerror = function(error) {
            console.error('❌ Conversion failed:', error);
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * ทดสอบการอัพโหลดไฟล์ (ต้องเรียกจาก browser console)
 */
async function testFileUpload() {
    console.log('Testing file upload...');
    
    try {
        // สร้างไฟล์ทดสอบ
        const file = createTestFile();
        
        // แปลงเป็น Base64
        const base64Data = await testBase64Conversion();
        
        // สร้าง form data
        const formData = new URLSearchParams();
        formData.append('action', 'upload');
        formData.append('team', TEST_CONFIG.TEST_TEAM);
        formData.append('year', TEST_CONFIG.TEST_YEAR);
        formData.append('month', TEST_CONFIG.TEST_MONTH);
        formData.append('fileName', file.name);
        formData.append('fileData', base64Data);
        formData.append('mimeType', file.type);
        
        // อัพโหลด
        const response = await fetch(TEST_CONFIG.API_URL, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ File upload successful!');
            console.log('File URL:', result.data.fileUrl);
            console.log('Folder URL:', result.data.folderUrl);
            return result.data;
        } else {
            console.error('❌ Upload failed:', result.message);
            return null;
        }
        
    } catch (error) {
        console.error('❌ Upload test failed:', error);
        return null;
    }
}

/**
 * ทดสอบการบันทึก metadata
 */
async function testSaveSubmission(folderUrl) {
    console.log('Testing save submission...');
    
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'saveSubmission');
        formData.append('team', TEST_CONFIG.TEST_TEAM);
        formData.append('year', TEST_CONFIG.TEST_YEAR);
        formData.append('month', TEST_CONFIG.TEST_MONTH);
        formData.append('folderUrl', folderUrl || 'https://drive.google.com/test');
        
        const response = await fetch(TEST_CONFIG.API_URL, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Save submission successful!');
            console.log('Timestamp:', result.data.timestamp);
            return true;
        } else {
            console.error('❌ Save failed:', result.message);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Save test failed:', error);
        return false;
    }
}

/**
 * รันการทดสอบทั้งหมด
 */
async function runAllTests() {
    console.log('🚀 Starting all tests...\n');
    
    const results = {
        connection: false,
        getAllData: false,
        getMonthData: false,
        base64: false,
        upload: false,
        save: false
    };
    
    // Test 1: API Connection
    console.log('\n📡 Test 1: API Connection');
    results.connection = await testAPIConnection();
    
    if (!results.connection) {
        console.error('\n❌ Cannot proceed without API connection');
        return results;
    }
    
    // Test 2: Get All Data
    console.log('\n📊 Test 2: Get All Data');
    results.getAllData = await testGetAllData();
    
    // Test 3: Get Month Data
    console.log('\n📅 Test 3: Get Month Data');
    results.getMonthData = await testGetMonthData();
    
    // Test 4: Base64 Conversion
    console.log('\n🔄 Test 4: Base64 Conversion');
    try {
        await testBase64Conversion();
        results.base64 = true;
    } catch (error) {
        results.base64 = false;
    }
    
    // Test 5: File Upload
    console.log('\n📤 Test 5: File Upload');
    const uploadData = await testFileUpload();
    results.upload = uploadData !== null;
    
    // Test 6: Save Submission
    if (uploadData && uploadData.folderUrl) {
        console.log('\n💾 Test 6: Save Submission');
        results.save = await testSaveSubmission(uploadData.folderUrl);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 Test Summary:');
    console.log('='.repeat(50));
    
    const passed = Object.values(results).filter(r => r === true).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, result]) => {
        const icon = result ? '✅' : '❌';
        console.log(`${icon} ${test}: ${result ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log('='.repeat(50));
    console.log(`Total: ${passed}/${total} tests passed`);
    console.log('='.repeat(50));
    
    return results;
}

/**
 * วิธีใช้งาน:
 * 
 * 1. เปิดเว็บไซต์ในบราเซอร์
 * 2. เปิด Console (F12)
 * 3. ตั้งค่า API URL:
 *    TEST_CONFIG.API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
 * 
 * 4. รันการทดสอบ:
 *    runAllTests();
 * 
 * หรือทดสอบทีละส่วน:
 *    testAPIConnection();
 *    testGetAllData();
 *    testGetMonthData();
 *    testFileUpload();
 */

// Export for use in console
if (typeof window !== 'undefined') {
    window.TEST_CONFIG = TEST_CONFIG;
    window.testAPIConnection = testAPIConnection;
    window.testGetAllData = testGetAllData;
    window.testGetMonthData = testGetMonthData;
    window.testBase64Conversion = testBase64Conversion;
    window.testFileUpload = testFileUpload;
    window.testSaveSubmission = testSaveSubmission;
    window.runAllTests = runAllTests;
    window.createTestFile = createTestFile;
}
