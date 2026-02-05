/**
 * Work Submission System - Frontend JavaScript
 * Uses ResumableUploadForGoogleDrive_js library
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbzR1doYd23O2mBQFXCGdQrJEQZCopRhde3QmZCr9afs56-5U-RB1O5wtfkMCX4IVYQ/exec',

    // Month names in Thai
    MONTHS: [
        ['มกราคม', '01_JAN'], ['กุมภาพันธ์', '02_FEB'], ['มีนาคม', '03_MAR'], ['เมษายน', '04_APR'],
        ['พฤษภาคม', '05_MAY'], ['มิถุนายน', '06_JUN'], ['กรกฎาคม', '07_JUL'], ['สิงหาคม', '08_AUG'],
        ['กันยายน', '09_SEP'], ['ตุลาคม', '10_OCT'], ['พฤศจิกายน', '11_NOV'], ['ธันวาคม', '12_DEC']
    ],

    // Team colors
    TEAM_COLORS: {
        'PM': 'blue',
        'CM': 'green',
        'Pool': 'purple',
        'Admin': 'orange',
        'ECRI': 'red'
    }
};

// Global state
let selectedFiles = [];
let currentUploadIndex = 0;
let folderUrl = '';

// ==================== INITIALIZATION ====================

$(document).ready(function () {
    initializeApp();
});

function initializeApp() {
    console.log('Initializing Work Submission System...');

    // Populate month and year selectors
    populateMonthSelectors();
    populateYearSelectors();

    // Setup event listeners
    setupEventListeners();

    // Load initial dashboard
    loadDashboard();

    console.log('System initialized successfully!');
}

// ==================== UI FUNCTIONS ====================

/**
 * Show specific tab and hide others
 */
function showTab(tabName) {
    // Hide all tab contents
    $('.tab-content').addClass('hidden');

    // Remove active state from all tabs
    $('.tab-btn').removeClass('bg-white text-blue-600 border-b-2 border-blue-600')
        .addClass('text-gray-600');

    // Show selected tab content
    $(`#content-${tabName}`).removeClass('hidden');

    // Add active state to selected tab
    $(`#tab-${tabName}`).removeClass('text-gray-600')
        .addClass('bg-white text-blue-600 border-b-2 border-blue-600');

    // Load data for specific tabs
    if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'history') {
        loadHistory();
    }
}

/**
 * Populate month selectors
 */
function populateMonthSelectors() {
    const selectors = ['#month-selector', '#upload-month', '#history-month-filter'];
    const currentMonth = new Date().getMonth();

    selectors.forEach(selector => {
        const $select = $(selector);
        $select.empty();

        CONFIG.MONTHS.forEach((month, index) => {
            const option = $('<option></option>')
                .val(month[1])
                .text(month[0]);

            if (index === currentMonth) {
                option.attr('selected', 'selected');
            }

            $select.append(option);
        });
    });
}

/**
 * Populate year selectors
 */
function populateYearSelectors() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2;
    const endYear = currentYear + 1;

    const selectors = ['#year-selector', '#upload-year', '#history-year-filter'];

    selectors.forEach(selector => {
        const $select = $(selector);
        $select.empty();

        for (let year = endYear; year >= startYear; year--) {
            const option = $('<option></option>')
                .val(year)
                .text(year + 543); // Convert to Buddhist year

            if (year === currentYear) {
                option.attr('selected', 'selected');
            }

            $select.append(option);
        }
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Team selection change
    $('#team-select').on('change', function () {
        const team = $(this).val();

        if (team === 'ECRI') {
            $('#month-year-section').addClass('hidden');
            $('#week-section').removeClass('hidden');

            // Set to current week
            const today = new Date();
            const weekStr = getWeekString(today);
            $('#upload-week').val(weekStr);
        } else {
            $('#month-year-section').removeClass('hidden');
            $('#week-section').addClass('hidden');
        }

        validateUploadForm();
    });

    // File input change
    $('#file-input').on('change', function (e) {
        handleFilesSelect(e.target.files);
    });

    // Drag and drop
    const dropArea = document.getElementById('drop-area');

    dropArea.addEventListener('click', () => {
        $('#file-input').click();
    });

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        $(dropArea).addClass('dragover');
    });

    dropArea.addEventListener('dragleave', () => {
        $(dropArea).removeClass('dragover');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        $(dropArea).removeClass('dragover');
        handleFilesSelect(e.dataTransfer.files);
    });
}

// ==================== FILE HANDLING ====================

/**
 * Handle file selection
 */
function handleFilesSelect(files) {
    if (files.length === 0) return;

    selectedFiles = selectedFiles.concat(Array.from(files));
    console.log('Selected files:', selectedFiles);
    displaySelectedFiles();
    validateUploadForm();
}

/**
 * Display selected files
 */
function displaySelectedFiles() {
    const $fileItems = $('#file-items');
    $fileItems.empty();

    if (selectedFiles.length === 0) {
        $('#file-list').addClass('hidden');
        return;
    }

    $('#file-list').removeClass('hidden');

    selectedFiles.forEach((file, index) => {
        const fileSize = formatFileSize(file.size);
        const fileIcon = getFileIcon(file.name);

        const fileItem = $(`
            <div class="file-item flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                    <i class="${fileIcon} text-2xl text-blue-600"></i>
                    <div>
                        <p class="font-medium text-gray-800">${file.name}</p>
                        <p class="text-sm text-gray-600">${fileSize}</p>
                    </div>
                </div>
                <button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);

        $fileItems.append(fileItem);
    });
}

/**
 * Remove file from selection
 */
function removeFile(index) {
    selectedFiles.splice(index, 1);
    displaySelectedFiles();
    validateUploadForm();
}

/**
 * Get file icon based on extension
 */
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();

    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'zip': 'fas fa-file-archive',
        'rar': 'fas fa-file-archive',
        'txt': 'fas fa-file-alt',
    };

    return iconMap[ext] || 'fas fa-file';
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate upload form
 */
function validateUploadForm() {
    const team = $('#team-select').val();
    const hasFiles = selectedFiles.length > 0;

    let isValid = team && hasFiles;

    if (team === 'ECRI') {
        const week = $('#upload-week').val();
        isValid = isValid && week;
    } else {
        const month = $('#upload-month').val();
        const year = $('#upload-year').val();
        isValid = isValid && month && year;
    }

    $('#upload-btn').prop('disabled', !isValid);
}

// ==================== UPLOAD FUNCTIONS ====================

/**
 * Start upload process
 */
async function startUpload() {
    const team = $('#team-select').val();
    const month = $('#upload-month').val();
    const year = $('#upload-year').val();
    const week = $('#upload-week').val();

    if (!team || selectedFiles.length === 0) {
        showAlert('error', 'กรุณาเลือกทีมและไฟล์');
        return;
    }

    // Disable upload button
    $('#upload-btn').prop('disabled', true);

    // Show progress
    $('#upload-progress').removeClass('hidden');
    updateProgress(0, 'กำลังเตรียมอัพโหลด...');

    try {
        const { imageIds, folderId } = await uploadToGoogleDrive(selectedFiles);
        Swal.fire({
            title: 'กำลังบันทึกข้อมูล...',
            allowOutsideClick: false,
            showConfirmButton: false,
            background: '#ffffff',
            customClass: {
                popup: 'rounded-2xl shadow-2xl font-[Prompt]',
                title: 'text-xl font-semibold text-gray-800 pt-6',
                htmlContainer: 'text-gray-600'
            },
            backdrop: `
                rgba(15, 23, 42, 0.4)
                backdrop-blur-sm
            `,
            didOpen: () => {
                Swal.showLoading();
            }
        })
        // Save submission metadata
        updateProgress(95, 'กำลังบันทึกข้อมูล...');
        await saveSubmissionMetadata(team, year, month, week, 'https://drive.google.com/drive/folders/' + folderId);

        // Complete
        updateProgress(100, 'อัพโหลดสำเร็จ!');

        showAlert('success', `อัพโหลดไฟล์สำเร็จ ${selectedFiles.length} ไฟล์`);

        // Reset form
        setTimeout(() => {
            clearForm();
            loadDashboard();
        }, 2000);

    } catch (error) {
        Swal.close();
        console.error('Upload error:', error);
        showAlert('error', 'เกิดข้อผิดพลาดในการอัพโหลด: ' + error.message);
        $('#upload-btn').prop('disabled', false);
    }
}

/**
 * Upload single file using base64 encoding
 */
async function uploadSingleFile(file, team, year, month, week) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async function (e) {
            try {
                const base64Data = e.target.result.split(',')[1];

                const formData = new URLSearchParams();
                formData.append('action', 'upload');
                formData.append('team', team);
                formData.append('fileName', file.name);
                formData.append('fileData', base64Data);
                formData.append('mimeType', file.type);

                if (team === 'ECRI') {
                    formData.append('week', week);
                } else {
                    formData.append('year', year);
                    formData.append('month', month);
                }

                const response = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    if (result.data && result.data.folderUrl) {
                        folderUrl = result.data.folderUrl;
                    }
                    resolve(result);
                } else {
                    reject(new Error(result.message || 'Upload failed'));
                }

            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Save submission metadata to Google Sheets
 */
async function saveSubmissionMetadata(team, year, month, week, folderUrl) {
    const formData = new URLSearchParams();
    formData.append('action', 'saveSubmission');
    formData.append('team', team);
    formData.append('folderUrl', folderUrl);

    if (team === 'ECRI') {
        formData.append('week', week);
    } else {
        formData.append('year', year);
        formData.append('month', month);
    }

    const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || 'Failed to save metadata');
    }

    return result;
}

/**
 * Update upload progress
 */
function updateProgress(percent, text) {
    $('#progress-bar').css('width', percent + '%');
    $('#progress-percent').text(Math.round(percent) + '%');
    $('#progress-text').text(text);
}

/**
 * Clear upload form
 */
function clearForm() {
    $('#team-select').val('');
    $('#file-input').val('');
    selectedFiles = [];
    displaySelectedFiles();
    $('#upload-progress').addClass('hidden');
    $('#alert-container').empty();
    $('#upload-btn').prop('disabled', true);
    updateProgress(0, '');
}

/**
 * Show alert message
 */
function showAlert(type, message) {
    const isSuccess = type === 'success';

    Swal.fire({
        icon: isSuccess ? 'success' : 'error',
        title: isSuccess ? 'ดำเนินการสำเร็จ' : 'พบข้อผิดพลาด',
        text: message,
        confirmButtonText: 'ตกลง',
        customClass: {
            popup: 'rounded-2xl shadow-2xl font-[Prompt]',
            title: 'text-xl font-semibold text-gray-800',
            htmlContainer: 'text-gray-600',
            confirmButton: isSuccess
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200'
                : 'bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-red-500/30 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-200'
        },
        buttonsStyling: false,
        timer: isSuccess ? 2000 : undefined,
        timerProgressBar: isSuccess,
        backdrop: `
            rgba(15, 23, 42, 0.4)
            backdrop-blur-sm
        `
    }).then(() => {
        // Clear any old alerts in the container just in case
        $('#alert-container').empty();
    });
}

// ==================== DASHBOARD FUNCTIONS ====================

/**
 * Load dashboard data
 */
async function loadDashboard() {
    const month = $('#month-selector').val();
    const year = $('#year-selector').val();

    if (!month || !year) return;

    try {
        // Show loading state
        $('.status-info').html('<p class="text-sm text-gray-600">กำลังโหลด...</p>');
        $('.fa-sync-alt').addClass('animate-spin');
        // Fetch data from API
        const result = await $.ajax({
            url: CONFIG.API_URL,
            method: 'GET',
            data: {
                action: 'getMonthData',
                year: year,
                month: month
            }
        }).promise().then(response => response);

        if (result.success && result.data) {
            updateDashboardCards(result.data);
            updateSummaryTable(result.data);
        } else {
            // No data for this month
            updateDashboardCards(null);
            updateSummaryTable(null);
        }

    } catch (error) {
        console.error('Dashboard load error:', error);
        showAlert('error', 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
        $('.fa-sync-alt').removeClass('animate-spin');
    }
}

/**
 * Update dashboard status cards
 */
function updateDashboardCards(data) {
    const teams = ['PM', 'CM', 'Pool', 'Admin', 'ECRI'];

    teams.forEach(team => {
        const $statusDiv = $(`#status-${team.toLowerCase()}`);
        let teamColor = CONFIG.TEAM_COLORS[team] || 'gray';

        if (!data) {
            $statusDiv.html(`
                <div class="flex flex-col h-full justify-between">
                    <div>
                        <p class="text-sm text-gray-500 mb-1">สถานะปัจจุบัน</p>
                        <p class="text-base font-medium text-gray-700">ยังไม่มีการส่งงาน</p>
                    </div>
                    <div class="mt-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <i class="far fa-clock mr-1.5"></i> รอดำเนินการ
                        </span>
                    </div>
                </div>
            `);
            return;
        }

        const timeKey = `เวลาอัพโหลด Team ${team}`;
        const linkKey = `ลิ้งค์โฟลเดอร์ที่อัพโหลด Team ${team}`;

        const uploadTime = data[timeKey];
        const folderLink = data[linkKey];

        if (uploadTime && folderLink) {
            const formattedTime = formatThaiDateTime(uploadTime)?.fromNow || '-';

            $statusDiv.html(`
                <div class="flex flex-col h-full justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                             <p class="text-sm text-gray-500">สถานะล่าสุด</p>
                             <span class="flex h-2 w-2 relative">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                             </span>
                        </div>
                        <p class="text-sm font-medium text-gray-900 mb-1">ส่งงานเรียบร้อยแล้ว</p>
                        <p class="text-xs text-gray-500 flex items-center">
                            <i class="far fa-clock mr-1.5 text-gray-400"></i> ${formattedTime}
                        </p>
                    </div>
                    
                    <div class="mt-4 flex items-center justify-between">
                         <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-green-600/20">
                            <i class="fas fa-check-circle mr-1.5"></i> Completed
                        </span>
                        <a href="${folderLink}" target="_blank" class="text-${teamColor}-600 hover:text-${teamColor}-800 text-sm font-medium flex items-center group">
                            <span>Folder</span>
                            <i class="fas fa-arrow-right ml-1 transform group-hover:translate-x-0.5 transition-transform"></i>
                        </a>
                    </div>
                </div>
            `);
        } else {
            $statusDiv.html(`
                <div class="flex flex-col h-full justify-between">
                    <div>
                        <p class="text-sm text-gray-500 mb-1">สถานะปัจจุบัน</p>
                        <p class="text-base font-medium text-gray-700">รอการส่งงาน</p>
                    </div>
                    <div class="mt-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20">
                            <i class="fas fa-exclamation-circle mr-1.5"></i> Pending
                        </span>
                    </div>
                </div>
            `);
        }
    });
}


/**
 * Update summary table
 */
function updateSummaryTable(data) {
    const $tbody = $('#summary-tbody');
    $tbody.empty();

    const teams = [
        { code: 'PM', name: 'Team PM', icon: 'fa-tools', color: 'blue' },
        { code: 'CM', name: 'Team CM', icon: 'fa-wrench', color: 'green' },
        { code: 'Pool', name: 'Team Pool', icon: 'fa-swimming-pool', color: 'purple' },
        { code: 'Admin', name: 'Admin', icon: 'fa-user-shield', color: 'orange' },
        { code: 'ECRI', name: 'ECRI', icon: 'fa-chart-pie', color: 'red' }
    ];

    teams.forEach(team => {
        let status, statusClass, statusIcon, uploadDate, folderLink, btnClass;

        if (data) {
            const timeKey = `เวลาอัพโหลด Team ${team.code}`;
            const linkKey = `ลิ้งค์โฟลเดอร์ที่อัพโหลด Team ${team.code}`;

            const uploadTime = data[timeKey];
            const folder = data[linkKey];

            if (uploadTime && folder) {
                status = 'ส่งเรียบร้อย';
                statusClass = 'bg-green-50 text-green-700 ring-1 ring-green-600/20';
                statusIcon = 'fa-check-circle';
                uploadDate = formatThaiDateTime(uploadTime)?.dateStr || '-';
                btnClass = 'bg-blue-50 text-blue-600 hover:bg-blue-100';
                folderLink = `<a href="${folder}" target="_blank" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${btnClass}">
                    <i class="fas fa-folder-open mr-2"></i> Open Folder
                </a>`;
            } else {
                status = 'รอการจัดส่ง';
                statusClass = 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20';
                statusIcon = 'fa-clock';
                uploadDate = '<span class="text-gray-400 italic">ยังไม่มีข้อมูล</span>';
                btnClass = 'bg-gray-50 text-gray-400 cursor-not-allowed';
                folderLink = `<button disabled class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg ${btnClass}">
                    <i class="fas fa-folder mr-2"></i> No Files
                </button>`;
            }
        } else {
            status = 'รอการจัดส่ง';
            statusClass = 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/10';
            statusIcon = 'fa-clock';
            uploadDate = '<span class="text-gray-400 italic">-</span>';
            btnClass = 'bg-gray-50 text-gray-400 cursor-not-allowed';
            folderLink = `<button disabled class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg ${btnClass}">
                <i class="fas fa-folder mr-2"></i> No Files
            </button>`;
        }

        const row = $(`
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-${team.color}-50 text-${team.color}-600">
                            <i class="fas ${team.icon}"></i>
                        </div>
                        <span class="font-semibold text-gray-700">${team.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusClass}">
                        <i class="fas ${statusIcon} mr-1.5"></i> ${status}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 font-medium">
                    ${uploadDate}
                </td>
                <td class="px-6 py-4">
                    ${folderLink}
                </td>
            </tr>
        `);

        $tbody.append(row);
    });
}


// ==================== HISTORY FUNCTIONS ====================

/**
 * Load submission history
 */
async function loadHistory() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=getAllData`);
        const result = await response.json();

        if (result.success && result.data) {
            displayHistory(result.data);
        } else {
            $('#history-tbody').html(`
                <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                        ไม่พบข้อมูลประวัติการส่งงาน
                    </td>
                </tr>
            `);
        }

    } catch (error) {
        console.error('History load error:', error);
        showAlert('error', 'ไม่สามารถโหลดประวัติได้');
    }
}

/**
 * Display history table
 */
function displayHistory(data) {
    const $tbody = $('#history-tbody');
    $tbody.empty();

    // Flatten data for history view
    const historyItems = [];

    data.forEach(row => {
        const year = row['ปี'];
        const month = row['เดือน'];

        ['PM', 'CM', 'Pool', 'Admin', 'ECRI'].forEach(team => {
            const timeKey = `เวลาอัพโหลด Team ${team}`;
            const linkKey = `ลิ้งค์โฟลเดอร์ที่อัพโหลด Team ${team}`;

            const uploadTime = row[timeKey];
            const folderLink = row[linkKey];

            if (uploadTime && folderLink) {
                historyItems.push({
                    timestamp: new Date(uploadTime),
                    team: team,
                    year: year,
                    month: month,
                    folderLink: folderLink
                });
            }
        });
    });

    // Sort by timestamp descending
    historyItems.sort((a, b) => b.timestamp - a.timestamp);

    if (historyItems.length === 0) {
        $tbody.html(`
            <tr>
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center">
                        <i class="fas fa-inbox text-gray-300 text-3xl mb-3"></i>
                        <p>ยังไม่มีประวัติการส่งงานในขณะนี้</p>
                    </div>
                </td>
            </tr>
        `);
        return;
    }

    // Display items
    historyItems.forEach(item => {
        let teamColor = CONFIG.TEAM_COLORS[item.team] || 'gray';

        const row = $(`
            <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">
                         ${formatThaiDateTime(item.timestamp)?.dateStr || '-'}
                    </div>
                    <div class="text-xs text-gray-400 mt-0.5">
                        <i class="far fa-clock mr-1"></i> Recorded time
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${teamColor}-50 text-${teamColor}-700 ring-1 ring-${teamColor}-600/20">
                        Team ${item.team}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-700">
                        <i class="far fa-calendar-alt text-gray-400 mr-2"></i>
                        ${item.month} ${parseInt(item.year) + 543}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <a href="${item.folderLink}" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center group">
                        <span class="group-hover:underline">เปิดโฟลเดอร์</span>
                        <i class="fas fa-external-link-alt ml-1.5 text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"></i>
                    </a>
                </td>
            </tr>
        `);

        $tbody.append(row);
    });
}


// ==================== UTILITY FUNCTIONS ====================

/**
 * Format date/time to Thai format
 */
function formatThaiDateTime(dateInput) {
    console.log('Formatting date:', dateInput);
    if (!dateInput) return null;

    // Ensure moment locale is Thai
    moment.locale('th');

    const m = moment(dateInput);
    if (!m.isValid()) return null;

    const dateStr = m.format('D MMMM YYYY HH:mm') + ' น.';
    return { dateStr: dateStr, fromNow: m.fromNow() };
}

/**
 * Get ISO week string from date
 */
function getWeekString(date) {
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

// ==================== GOOGLE DRIVE UPLOAD FUNCTIONS ====================

/**
 * Upload files to Google Drive with progress tracking
 */
async function uploadToGoogleDrive(f) {
    if (f.length == 0) {
        return []
    }
    Swal.fire({
        title: 'กำลังอัพโหลดไฟล์',
        html: `
            <div class="w-full px-2">
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-600">สถานะการอัพโหลด</span>
                        <span id="overallPercent" class="text-sm font-bold text-blue-600">0%</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div id="overallProgress" class="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style="width: 0%"></div>
                    </div>
                    <div class="mt-3 text-xs text-gray-500 text-center">
                        <span id="uploadStatus" class="inline-flex items-center gap-2">
                            <i class="fas fa-circle-notch fa-spin text-blue-500"></i> กำลังเตรียมไฟล์...
                        </span>
                    </div>
                </div>
                <div class="flex flex-col gap-2 text-sm max-h-48 overflow-y-auto custom-scrollbar p-1" id="progress"></div>
            </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: {
            popup: 'rounded-2xl shadow-2xl font-[Prompt]',
            title: 'text-xl font-semibold text-gray-800 pt-6',
            htmlContainer: 'text-gray-600'
        },
        backdrop: `
            rgba(15, 23, 42, 0.4)
            backdrop-blur-sm
        `,
        didOpen: () => {
            // Swal.showLoading() - Removed to use custom loader in HTML
        },
    })
    const team = $('#team-select').val();
    const month = $('#upload-month').val();
    const year = $('#upload-year').val();
    const week = $('#upload-week').val();
    const { token, folderId } = await getUploadToken(team, year, month, week);
    console.log('Upload token and folder ID:', token, folderId);

    let file = await new Promise((resolve, reject) => {
        let length = f.length;
        let count = 0;
        let uploadfiles = [];
        let totalProgress = 0;

        const updateOverallProgress = () => {
            const percent = Math.round(totalProgress / length);
            $('#overallProgress').css('width', percent + '%');
            $('#overallPercent').text(percent + '%');
            $('#uploadStatus').text(`กำลังอัพโหลด ${count} จาก ${length} ไฟล์`);
        };

        [...f].forEach((file, i) => {
            let fr = new FileReader();
            fr.fileName = file.name;
            fr.fileSize = file.size;
            fr.fileType = file.type;
            fr.readAsArrayBuffer(file);
            fr.onload = e => {
                var id = "p" + ++i;
                var div = $("<div>", { class: 'text-xs text-gray-700 truncate px-2 py-1 bg-gray-50 rounded-lg' });
                div.attr("id", id);
                $("#progress").append(div);
                $('#' + id).html('<span class="text-blue-500">กำลังเตรียม...</span> <span class="text-gray-600">' + fr.fileName + '</span>')

                let fileProgress = 0;

                const f = e.target;
                const resource = {
                    fileName: f.fileName,
                    fileSize: f.fileSize,
                    fileType: f.fileType,
                    fileBuffer: f.result,
                    accessToken: token,
                    folderId: folderId,
                    fields: "id",
                };
                const ru = new ResumableUploadToGoogleDrive();
                ru.Do(resource, function (res, err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log(res);
                    let msg = "";
                    if (res.status == 'start' || res.status == 'getLocation' || res.status == 'initialize') {
                        msg = '<i class="fas fa-cloud-upload-alt text-blue-500 text-base"></i> <span class="text-gray-700">กำลังเตรียมอัพโหลด</span> <span class="text-gray-500 truncate">' + f.fileName + '</span>';
                    }
                    else if (res.status == "Uploading") {
                        const percent = Math.round((res.progressNumber.current / res.progressNumber.end) * 100);
                        totalProgress = totalProgress - fileProgress + percent;
                        fileProgress = percent;
                        updateOverallProgress();
                        msg = '<i class="fas fa-hourglass-half text-orange-500 text-base"></i> <span class="text-gray-700">กำลังอัพโหลด</span> <span class="font-semibold text-orange-600 truncate">' + percent + '%</span> <span class="text-gray-500">(' + f.fileName + ')</span>';
                    } else {
                        msg = '<i class="fas fa-check-circle text-green-500 text-base"></i> <span class="text-green-600 font-medium">อัพโหลดสำเร็จ</span> <span class="text-gray-500 truncate">(' + f.fileName + ')</span>';
                    }

                    if (res.status == "Done") {
                        totalProgress = totalProgress - fileProgress + 100;
                        fileProgress = 100;
                        count++;
                        updateOverallProgress();
                        uploadfiles.push(res.result.id);
                        if (uploadfiles.length == length) {
                            $('#uploadStatus').text('อัพโหลดเสร็จสมบูรณ์!').addClass('text-green-600 font-semibold');
                            resolve(uploadfiles);
                        }
                    }

                    $('#' + id).html(msg)
                });
            };
        });
    });
    return { imageIds: file, folderId: folderId };
}

function getUploadToken(team, year, month, week) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: CONFIG.API_URL,
            method: 'POST',
            data: {
                action: 'getUploadToken',
                team: team,
                year: year,
                month: month,
                week: week
            },
            success: function (response) {
                if (response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response.message || 'Failed to get upload token'));
                }
            },
            error: function (xhr, status, error) {
                reject(new Error('AJAX error: ' + error));
            }
        });
    });
}

function generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const randomNum = Math.floor(Math.random() * 1e6).toString(36);
    return `${timestamp}-${randomNum}`;
}

// ==================== EXPORTS ====================
// Functions that need to be called from HTML onclick attributes
window.showTab = showTab;
window.loadDashboard = loadDashboard;
window.startUpload = startUpload;
window.clearForm = clearForm;
window.removeFile = removeFile;
window.loadHistory = loadHistory;
window.getUploadToken = getUploadToken;