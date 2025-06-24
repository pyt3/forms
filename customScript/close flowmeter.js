let url = new URL(window.location.href);
let searchParams = new URLSearchParams(url.search);
let page = searchParams.get('page');
let previousDate = localStorage.getItem('previousDate') || '';

// Page-specific initialization
if (page == 'pm-form') {
    // PM DATA
    let arr = [
        "tr55acd89d101-recheck-pass",
        "tr55acd89d102-recheck-pass",
        "tr55acd89d103-recheck-pass",
        "tr55acd89d104-recheck-pass",
        "tr55acd89d106-recheck-pass",
        "tr55acd89d106-recheck-pass",
        "tr55acd89d107-recheck-pass",
        "tr55acd89d108-recheck-pass",
        "tr55acd8ae101-recheck-pass",
        "tr55acd8c0101-recheck-pass",
        "tr55acd8c0102-recheck-none",
        "tr55acd8c0103-recheck-none",
        "tr55acd8c0104-recheck-none",
        "tr55acd89d105-recheck-none"
    ];
    arr.forEach(id => {
        $('#' + id).click();
    });
    setSameValue();
} else if (page == 'cal-form') {
    // CALIBRATION DATA
    let form_name = $('#show-form-name').text().trim();
    let standard_select = $('select[id$="_standard_code"]');
    switch (form_name) {
        case "FLOW METER":
            standard_select.select2("val", "G5-BMEPYT3-023");
            setCalFlowMeter();
            break;
        case "ASPIRATOR, EMERGENCY (SUCTION PUMP)":
            standard_select.select2("val", "G5-BMEPYT3-022");
            setCalAspirator();
            break;
        case "EKG RECORDER":
            standard_select.select2("val", "G5-BMEPYT3-013");
            setCalEKG();
            break;
        case "NIBP MONITOR":
            standard_select.select2("val", "G5-BMEPYT3-013");
            setCalNIBP();
            break;
        case "PULSE OXIMETER":
            standard_select.select2("val", "G5-BMEPYT3-013");
            setCalSpO2();
            break;
        case "SUCTION REGULATOR":
            standard_select.select2("val", "G5-BMEPYT3-022");
            setCalSuctionRegulator();
            break;
        case "SPHYGMOMANOMETER":
            standard_select.select2("val", "G5-BMEPYT3-013");
            setCalSphygmomanometer();
            break;
        default:
            alert('ไม่พบข้อมูลการสอบเทียบของ ' + form_name + ' ในระบบ กรุณาตรวจสอบอีกครั้ง');
            break;
    }
} else if (page == 'plan-equipments') {
    async function waitForEle(selector) {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (document.querySelector(selector)) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
    $('#QuickSearchResultBox').on('shown.bs.modal', async function () {
        let title = $('#QuickSearchResultBox .modal-title').text().trim();
        if (title === 'ข้อมูลเครื่องมือแพทย์') {
            await waitForEle('#QuickSearchResultBox .modal-body div[style*="color:#0000FF"]');
            let code = $('#QuickSearchResultBox .modal-body div[style*="color:#0000FF"]')[0].textContent.trim();
            $('#QuickSearchResultBox').attr('data-code', code);
        }

        await waitForEle('#SelectWorkForm');
        let code = $('#QuickSearchResultBox').data('code');
        let form_category = $('#QuickSearchResultBox .modal-title').text().trim() == 'เลือก Form Cal' ? 'form_cal' : 'form_pm';
        console.log("🚀 ~ code:", code);
        console.log("🚀 ~ form_category:", form_category);

        const { processedCode, data } = processDeviceCode(code);
        if (!processedCode) {
            return alert('ไม่พบข้อมูลการสอบเทียบของ ' + code + ' ในระบบ กรุณาตรวจสอบอีกครั้ง');
        }

        let option = $('#select_work_form_id option:contains("' + data[form_category] + '")');
        if (option.length > 0) {
            $('#select_work_form_id').select2("val", option.val());
        } else {
            return alert('ไม่พบข้อมูลการสอบเทียบของ ' + code + ' ในระบบ กรุณาตรวจสอบอีกครั้ง');
        }
        $('#select_work_form_id').closest('form').find('.btn-primary').click();
    });
}

// Helper functions
function processDeviceCode(code) {
    code = code.replace('PYT3D_', '').replace('PYT3_', '').replace('D_', '');
    const hasUnderscore = code.indexOf('_') !== -1;
    let suffix = hasUnderscore ? code.padStart(7, '0') : code.padStart(5, '0');

    const codeCandidates = [
        'PYT3_' + suffix,
        'PYT3D_' + suffix,
        'PYT3T_' + suffix
    ];

    const calData = JSON.parse(localStorage.getItem('calData')) || {};
    for (let candidate of codeCandidates) {
        if (calData[candidate]) {
            return { processedCode: candidate, data: calData[candidate] || {} };
        }
    }

    return { processedCode: null, data: {} };
}

function getDeviceCode() {
    let code = $('#work_equipment_code').val();
    const { processedCode, data } = processDeviceCode(code);
    return { code: processedCode, data };
}

// Setup functions
function setupDatepicker(data) {
    if (data.date) {
        $('#work_date').datepicker("destroy");
        $('#work_date').datepicker({
            dateFormat: 'yy-mm-dd',
            prevText: '<i class="fa fa-chevron-left"></i>',
            nextText: '<i class="fa fa-chevron-right"></i>',
            onSelect: function (selectedDate) {
                updateDate(selectedDate, 12);
                ChangeStandardDate();
            },
        });
        $('#work_date').datepicker("setDate", new Date(data.date));
        updateDate(data.date, 12);
    }
}

function setupLocationInfo(data, fieldId) {
    if (data.location_dept) {
        $(fieldId).val(data.location_dept + (data.dept_detail ? ('(' + data.dept_detail + ')') : ''));
    }
}

function setupCalibrationForm(ids, data, toleranceFieldId = null, noteFieldId = '#table55c07752_notetext') {
    if (data.checklist && data.checklist.length > 0) {
        data.checklist.forEach((item, index) => {
            if (index < ids.length) {
                $('#' + ids[index] + '_col1').val(item[0]);
            }
        });

        if (toleranceFieldId) {
            let max_value = Math.max(...data.checklist.map(item => Number(item[0])));
            if (max_value == 500) max_value = 750;
            $(toleranceFieldId).val(max_value).trigger('keyup');
        }

        $('#' + ids[0] + '_col1').trigger('keyup');
    }

    setupInputHandlers(ids);
    document.activeElement.blur();
    $('#' + ids[0] + '_col2').focus();
    setSameValue();
}

function setupInputHandlers(ids) {
    let timer = null;
    ids.forEach(id => {
        $('#' + id + '_col2').off('input').on('keyup', function (event) {
            clearTimeout(timer);
            if (event.keyCode == 13) {
                let row = $(this).closest('tr');
                let nextRowInput = row.next().next().find('input[id$="_col2"]');
                if (nextRowInput.length > 0) {
                    nextRowInput.click();
                    nextRowInput.focus();
                } else {
                    // If no next row, focus on the first input of the form
                    $('#work_temperature').focus();
                }
                return;
            }

            timer = setTimeout(() => {
                let value = this.value;
                if (value) {
                    let values = generateFourValuesWithSameMean(value, 2);
                    $('#' + id + ('_col3')).val(values[1]);
                    $('#' + id + ('_col4')).val(values[2]);
                    $('#' + id + ('_col5')).val(values[3]);
                }
            }, 500);
        });
    });

    document.activeElement.blur();
    $('#' + ids[0] + '_col2').focus();
    setSameValue();
}

// Calibration form functions
function setCalFlowMeter() {
    const ids = [
        "tr55a4d1cd6",
        "tr55a4d20a7",
        "tr55a4d2158",
        "tr55a4d21d9",
        "tr55a5c9ec1"
    ];

    const { code, data } = getDeviceCode();

    if (code) {
        setupCalibrationForm(ids, data);
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07752_notetext');
    }
}

function setCalAspirator() {
    const ids = [
        "tr55a4d1cd6",
        "tr55a4d20a7",
        "tr55a4d2158",
        "tr55a71d561",
        "tr55a71d5c2"
    ];

    const { code, data } = getDeviceCode();

    if (code) {
        setupCalibrationForm(ids, data, '#table55a4d1cc_tolerance_fso_val', '#table55c07e1f_notetext');
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07e1f_notetext');
    }
}

function setCalEKG() {
    const ids = [
        "tr55a4d1cd6",
        "tr55a4d20a7",
        "tr55a4d2158",
        "tr55a4d21d9",
        "tr55a5c9ec1"
    ];

    const { code, data } = getDeviceCode();

    if (code) {
        setupCalibrationForm(ids, data);
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07752_notetext');
    }
}

function setCalNIBP() {
    const ids = [
        "tr55a4d1cd6",
        "tr55a4d20a7",
        "tr55a4d2158",
        "tr55a4d21d9",
        "tr55a5c9ec1"
    ];

    const { code, data } = getDeviceCode();

    if (code) {
        setupCalibrationForm(ids, data);
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07752_notetext');
    }
}

function setCalSpO2() {
    const ids = [
        "tr55a4d1cd6",
        "tr55a4d20a7",
        "tr55a4d2158",
        "tr55a4d21d9"
    ];

    const { code, data } = getDeviceCode();

    if (code) {
        setupCalibrationForm(ids, data);
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07752_notetext');
    }
}

function setCalSuctionRegulator() {
    const ids = [
        "tr55a4d1cd6",
        "tr55a4d20a7",
        "tr55a4d2158",
        "tr55a4d21d9",
        "tr55a5c9ec1"
    ];

    const { code, data } = getDeviceCode();

    if (code) {
        setupCalibrationForm(ids, data, '#table55a4d1cc_tolerance_fso_val', '#table55c07e1f_notetext');
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07e1f_notetext');
    }
}

function setCalSphygmomanometer() {
    const ids = [
        "tr55a4d1cd6",
        "tr55a4d20a7",
        "tr55a4d2158",
        "tr55a4d21d9",
        "tr55a5c9ec1"
    ];

    const { code, data } = getDeviceCode();

    if (code) {
        setupCalibrationForm(ids, data);
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07752_notetext');
    }
}

// Utility functions
function generateFourValuesWithSameMean(initialValue, preferDecimalPlaces = 2) {
    initialValue = Number(initialValue);
    if (typeof initialValue !== 'number') {
        throw new Error('Initial value must be a number.');
    }

    const sum = initialValue * 4;
    let difference = 0;
    switch (preferDecimalPlaces) {
        case 0:
            difference = 1;
            break;
        case 1:
            difference = 0.5;
            break;
        case 2:
            difference = 0.08;
            break;
        case 3:
            difference = 0.008;
            break;
        default:
            throw new Error('Invalid preferDecimalPlaces value. Use 0, 1, 2, or 3.');
    }

    const value2 = (initialValue - difference + Math.random() * (difference * 2)).toFixed(preferDecimalPlaces);
    const value3 = (initialValue - difference + Math.random() * (difference * 2)).toFixed(preferDecimalPlaces);
    const value4 = ((initialValue * 3) - (Number(value2) + Number(value3))).toFixed(preferDecimalPlaces);

    return [initialValue, value2, value3, value4];
}

function setSameValue() {
    document.getElementById('work_temperature').value = 25;
    document.getElementById('work_humidity').value = 55;
}

function updateDate(selectedDate, month = 6) {
    let date = new Date(selectedDate);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + month + 1, 0);
    $('#work_due').datepicker("setDate", lastDay);
    $('#work_next_date').datepicker("setDate", lastDay);
}