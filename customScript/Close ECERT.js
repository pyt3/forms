// let url = new URL(window.location.href);
// let searchParams = new URLSearchParams(new URL(window.location.href).search);
// let page = new URLSearchParams(new URL(window.location.href).search).get('page');
// let previousDate = localStorage.getItem('previousDate') || '';

// Page-specific initialization
if (new URLSearchParams(new URL(window.location.href).search).get('page') == 'pm-form') {
    let form_name = $('#show-form-name').text().trim();
    let standard_select = $('select[id$="std_code"]');
    console.log("🚀 ~ form_name:", form_name);
    switch (form_name) {
        case "FLOW METER":
            setPMFlowMeter();
            break;
        case "ASPIRATOR, EMERGENCY (SUCTION PUMP)":
            $(standard_select[0]).select2("val", "G5-BMEPYT3-022");
            setPMAspirator();
            break;
        case "EKG RECORDER":
            setPMEKG();
            break;
        case "NIBP MONITOR":
            $(standard_select[0]).select2("val", "G5-BMEPYT3-027");
            setPMNIBP();
            break;
        case "PM MODULE":
            setPMModule();
            break;
        case "PULSE OXIMETER":
            setPMSpO2();
            break;
        case "SUCTION REGULATOR":
            setPMSuctionRegulator();
            break;
        case "SPHYGMOMANOMETER":
            setPMSphygmomanometer();
            break;
        default:
            alert('ไม่พบข้อมูลการสอบเทียบของ ' + form_name + ' ในระบบ กรุณาตรวจสอบอีกครั้ง');
            break;
    }
} else if (new URLSearchParams(new URL(window.location.href).search).get('page') == 'cal-form') {
    // CALIBRATION DATA
    let form_name = $('#show-form-name').text().trim();
    let standard_select = $('select[id$="_standard_code"]');
    switch (form_name) {
        case "FLOW METER":
            $(standard_select[0]).select2("val", "G5-BMEPYT3-023");
            setCalFlowMeter();
            break;
        case "ASPIRATOR, EMERGENCY (SUCTION PUMP)":
            $(standard_select[0]).select2("val", "G5-BMEPYT3-022");
            setCalAspirator();
            break;
        case "EKG RECORDER":
            $(standard_select[0]).select2("val", "G5-BMEPYT3-013");
            setCalEKG();
            break;
        case "NIBP MONITOR":
            standard_select.toArray().slice(0, 4).forEach(select => {
                $(select).select2("val", "G5-BMEPYT3-013");
            });
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
} else if (new URLSearchParams(new URL(window.location.href).search).get('page') == 'plan-equipments') {
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
            let cal_data = processDeviceCode(code);
            console.log("🚀 ~ cal_data:", cal_data)
            let selectCalFormBtn = $('#QuickSearchResultBox .modal-footer button:contains("กรอกข้อมูล CAL")');
            let selectPMFormBtn = $('#QuickSearchResultBox .modal-footer button:contains("กรอกข้อมูล PM")');
            let [cal_eid,,cal_plan] = selectCalFormBtn.attr('onclick').split('(')[1].split(')')[0].split(',').map(s => Number(s.trim()))
            const windowWidth = window.screen.width;
            const windowHeight = window.screen.height;
            const width = Math.floor(windowWidth / 2);
            const height = windowHeight;
            let w1 = window.open(`/?page=cal-form&eid=${cal_eid}&plan=${cal_plan}&form=${cal_data.data.form_cal.split('#')[1]}`, '_blank',
                `width=${width},height=${height},left=0,top=0`);
            w1.onload = function () {
                let customScript = localStorage.getItem('customScriptEcert');
                if (customScript) {
                    let script = document.createElement('script');
                    script.textContent = customScript;
                    w1.document.body.appendChild(script);
                }
            }
    
            let [pm_eid,,pm_plan] = selectPMFormBtn.attr('onclick').split('(')[1].split(')')[0].split(',').map(s => Number(s.trim()))
           let w2 =  window.open(`/?page=pm-form&eid=${pm_eid}&plan=${pm_plan}&form=${cal_data.data.form_pm.split('#')[1]}`, '_blank',
                `width=${width},height=${height},left=${width},top=0`);
            w2.onload = function () {
                let customScript = localStorage.getItem('customScriptEcert');
                if (customScript) {
                    let script = document.createElement('script');
                    script.textContent = customScript;
                    w2.document.body.appendChild(script);
                }
            }
            $('#QuickSearchResultBox').modal('hide');
        }
        

        // await waitForEle('#SelectWorkForm');
        // let code = $('#QuickSearchResultBox').data('code');
        // let form_category = $('#QuickSearchResultBox .modal-title').text().trim() == 'เลือก Form Cal' ? 'form_cal' : 'form_pm';
        // const { processedCode, data } = processDeviceCode(code);
        // console.log("🚀 ~ data:", data)
        // console.log("🚀 ~ processedCode:", processedCode)
        // if (!processedCode) {
        //     return alert('ไม่พบข้อมูลการสอบเทียบของ ' + code + ' ในระบบ กรุณาตรวจสอบอีกครั้ง');
        // }
        // data.form_cal = data.form_cal.split('#')[0];
        // data.form_pm = data.form_pm.split('#')[0];
        // let option = $('#select_work_form_id option:contains("' + data[form_category] + '")');
        // if (option.length > 0) {
        //     $('#select_work_form_id').select2("val", option.val());
        // } else {
        //     return alert('ไม่พบข้อมูลการสอบเทียบของ ' + code + ' ในระบบ กรุณาตรวจสอบอีกครั้ง');
        // }
        // $('#select_work_form_id').closest('form').find('.btn-primary').click();
    });
}

// Helper functions
function processDeviceCode(code) {
    code = code.replace('PYT3D_', '').replace('PYT3_', '').replace('D_', '').replace('T_', '').replace('PYT3T_', '').trim();
    const hasUnderscore = code.indexOf('_') !== -1;
    let suffix = hasUnderscore ? code.padStart(7, '0') : code.padStart(5, '0');

    const codeCandidates = [
        'PYT3_' + suffix,
        'PYT3D_' + suffix,
        'PYT3T_' + suffix
    ];
    console.log("🚀 ~ processDeviceCode ~ codeCandidates:", codeCandidates)

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
    let name = $('#work_equipment_name').val();
    console.log("🚀 ~ getDeviceCode ~ name:", name)
    if(name.indexOf('MODULE, ') !== -1) {
        code = code.replace('_1', '');
    }
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
    console.log("🚀 ~ setupLocationInfo ~ data:", data)
    if (data.location_dept) {
        $(fieldId).val('พบที่ :  ' + data.location_dept + (data.location_detail ? (' (' + data.location_detail + ')') : ''));
    }
}

function setupCalibrationForm(ids, data, toleranceFieldId = null, useSameValue = false) {
    if (data.checklist && data.checklist.length > 0) {
        data.checklist.forEach((item, index) => {
            console.log("🚀 ~ setupCalibrationForm ~ item:", item);
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
    let decimal = 0
    switch (data.form_cal) {
        case 'FLOW METER':
            decimal = 2;
            break;
        case 'ASPIRATOR, EMERGENCY (SUCTION PUMP)':
            decimal = 2;
            break;
        case 'EKG RECORDER':
            decimal = 0;
            break;
        case 'NIBP MONITOR':
            decimal = 0;
            break;
        case 'PULSE OXIMETER':
            decimal = 0;
            break;
        case 'SUCTION REGULATOR':
            decimal = 2;
            break;
        case 'SPHYGMOMANOMETER':
            decimal = 1;
            break;
        default:
            decimal = 2;
            break;
    }

    setupInputHandlers(ids, decimal, useSameValue);
    data.checklist.forEach((item, index) => {
        if (index < ids.length) {
            $('#' + ids[index] + '_col2').val(item[1]).trigger('keyup').trigger('blur');
        }
    })
    setSameValue();
}

function setupInputHandlers(ids, decimal = 2, useSameValue = false) {
    let timer = null;
    ids.forEach(id => {
        $('#' + id + '_col2').off('input').on('keyup', function (event) {
            clearTimeout(timer);
            if (event.keyCode == 13) {
                let row = $(this).closest('tr');
                let nextRowInput = row.next().next().find('input[id$="_col2"]')
                if (nextRowInput.length > 0) {
                    nextRowInput.click();
                    nextRowInput.focus();
                } else {
                    // If no next row, focus on the first input of the form
                    $('#work_temperature').focus();
                }
                return;
            }

            let value = this.value;
            if (value) {
                let values
                if (useSameValue) {
                    values = [value, value, value, value];
                } else {
                    values = generateFourValuesWithSameMean(value, decimal);
                }
                $('#' + id + ('_col3')).val(values[1]).trigger('blur');
                $('#' + id + ('_col4')).val(values[2]).trigger('blur');
                $('#' + id + ('_col5')).val(values[3]).trigger('blur');
            }
        });
    });

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
        setupCalibrationForm(ids, data, '#table55a4d1cc_tolerance_fso_val');
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07e1f_notetext');
    }
}

function setCalEKG() {
    const ids = [
        "tr55b095995",
        "tr55b095ad6",
        "tr55b095af7",
    ];

    const { code, data } = getDeviceCode();
    console.log("🚀 ~ code:", code);
    console.log("🚀 ~ data:", data);
    if (code) {
        setupCalibrationForm(ids, {checklist: data.checklist.hr}, null, true);
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c0764e_notetext');
    }
}

function setCalNIBP() {
    const ids = {
        sys: ['tr55af3c661', 'tr55af3c882', 'tr55af3c8e3'],
        dia: ['tr55af3cb14', 'tr55af3cc55', 'tr55af3ccb6'],
        hr: ['tr55af417b25', 'tr55af41a326', 'tr55af41a527'],
        spo2: ['tr55b0b53e1', 'tr55b0b55d2', 'tr55b0b55f3']
    }

    const { code, data } = getDeviceCode();
    data.checklist.sys = data.checklist['sys-dia'].map(item => {
        return item.map(value => Number(value.split('/')[0]))
    })
    data.checklist.dia = data.checklist['sys-dia'].map(item => {
        return item.map(value => Number(value.split('/')[1]))
    })
    if (code) {
        Object.keys(ids).forEach(key => {
            if (data.checklist[key] && data.checklist[key].length > 0) {
                setupCalibrationForm(ids[key], { checklist: data.checklist[key] }, null, true);
            }
        });
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07988_notetext');
    }
}

function setCalSpO2() {
    const ids = {
        spo2: ['tr55b0b2a73', 'tr55b0b3024', 'tr55b0b3045'],
        hr: ['tr55b19e591', 'tr55b19e672', 'tr55b19e693']
    }

    const { code, data } = getDeviceCode();

    if (code) {
        Object.keys(ids).forEach(key => {
            if (data.checklist[key] && data.checklist[key].length > 0) {
                setupCalibrationForm(ids[key], { checklist: data.checklist[key] }, null, true);
            }
        });
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07d57_notetext');
    }
}

function setCalSuctionRegulator() {
    const ids = [
        "tr55a4d1cd6",
        "tr55a4d20a7",
        "tr55a4d2158",
        "tr55a71d561",
        "tr55a71d5c2"
    ];

    const { code, data } = getDeviceCode();

    if (code) {
        setupCalibrationForm(ids, data, '#table55a4d1cc_tolerance_fso_val');
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07eb5_notetext');
    }
}

function setCalSphygmomanometer() {
    const ids = [
        "tr55a4d1cd6",
        "tr55a4d20a7",
        "tr55a4d2158",
        "tr55a4d21d9"
    ];

    const { code, data } = getDeviceCode();
    console.log("🚀 ~ code:", code);
    data.checklist = data.checklist.pressure
    if (code) {
        setupCalibrationForm(ids, data);
        setupDatepicker(data);
        setupLocationInfo(data, '#table55a5cab3_notetext');
    }
}

function setPMFlowMeter() {
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
    const { code, data } = getDeviceCode()
    if (code) {
        setupDatepicker(data)
        setupLocationInfo(data, '#table55ac99d7_notetext')
    }
    setSameValue();
}

function setPMAspirator() {
    let arr = [
        "tr55acdb7f101-recheck-pass",
        "tr55acdb7f102-recheck-pass",
        "tr55acdb7f103-recheck-none",
        "tr55acdb7f104-recheck-none",
        "tr55acdb7f105-recheck-none",
        "tr55acdb7f106-recheck-none",
        "tr55acdb7f107-recheck-pass",
        "tr55acdb7f108-recheck-pass",
        "tr55acdb7f109-recheck-pass",
        "tr55acdb7f110-recheck-pass",
        "tr55acdb7f111-recheck-pass",
        "tr55acdb7f112-recheck-pass",
        "tr55acdb7f113-recheck-none",
        "tr62d778471-recheck-pass",
        "tr62d778572-recheck-pass",
        "tr62d778663-recheck-none",
        "tr55acdb91101-recheck-none",
        "tr55acdb91102-recheck-none",
        "tr55acdb91103-recheck-none",
        "tr55acdb91104-recheck-none",
        "tr55acdb91105-recheck-none",
        "tr55acdba8101-recheck-pass",
        "tr55acdba8102-recheck-none",
        "tr55acdba8103-recheck-none",
        "tr55acdba8104-recheck-none"
    ]
    arr.forEach(id => {
        $('#' + id).click();
    });
    const { code, data } = getDeviceCode();
    if (code) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMEKG() {
    let arr = [
        "tr64bcfc111-recheck-pass",
        "tr55acd19d102-recheck-pass",
        "tr55acd19d103-recheck-none",
        "tr55acd19d104-recheck-none",
        "tr55acd19d105-recheck-none",
        "tr55acd19d106-recheck-none",
        "tr55acd19d108-recheck-pass",
        "tr55acd19d109-recheck-pass",
        "tr55acd19d110-recheck-pass",
        "tr55acd19d111-recheck-pass",
        "tr55acd19d112-recheck-pass",
        "tr55acd19d113-recheck-pass",
        "tr55acd19d114-recheck-pass",
        "tr55acd19d115-recheck-pass",
        "tr55acd19d116-recheck-none",
        "tr55acd19d117-recheck-pass",
        "tr55acd19d118-recheck-pass",
        "tr55acd19d119-recheck-pass",
        "tr55acd19d120-recheck-pass",
        "tr60f697d01-recheck-none",
        "tr55acd19d121-recheck-none",
        "tr55acd1d6101-recheck-none",
        "tr55acd1d6102-recheck-none",
        "tr55acd1d6103-recheck-none",
        "tr62d76f661-recheck-none",
        "tr55acd1d6104-recheck-none",
        "tr55acd209101-recheck-pass",
        "tr55acd209102-recheck-none",
        "tr55acd209103-recheck-none",
        "tr55acd209104-recheck-none",
    ]
    arr.forEach(id => {
        $('#' + id).click();
    });
    const { code, data } = getDeviceCode();
    if (code) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMNIBP() {
    let arr = [
        "tr55ace183101-recheck-pass",
        "tr55ace183102-recheck-pass",
        "tr55ace183103-recheck-none",
        "tr55ace183104-recheck-pass",
        "tr55ace183105-recheck-pass",
        "tr55ace183106-recheck-pass",
        "tr55ace183107-recheck-none",
        "tr55ace183108-recheck-none",
        "tr55ace183109-recheck-pass",
        "tr55ace183110-recheck-pass",
        "tr55ace183111-recheck-pass",
        "tr55ace183112-recheck-none",
        "tr55ace183113-recheck-pass",
        "tr55ace183114-recheck-pass",
        "tr55ace183115-recheck-none",
        "tr55ace183116-recheck-pass",
        "tr55ace183117-recheck-pass",
        "tr60f698fc1-recheck-none",
        "tr55ace1a5101-recheck-pass",
        "tr55ace1a5102-recheck-pass",
        "tr55ace1a5103-recheck-none",
        "tr55ace1a5104-recheck-none",
        "tr55ace1a5105-recheck-none",
        "tr62d76eea1-recheck-pass",
        "tr55ace1b9101-recheck-pass",
        "tr55ace1b9102-recheck-none",
        "tr55ace1b9103-recheck-none",
        "tr55ace1b9104-recheck-none"
    ]
    arr.forEach(id => {
        $('#' + id).click();
    })
    const { code, data } = getDeviceCode();
    console.log(data);
    if (code) {
        if (data?.checklist?.ground !== undefined) {
            $('[name=tr55ace1a5101_comment]').val(data.checklist.ground);
        }
        if (data?.checklist?.leakage !== undefined) {
            $('[name=tr55ace1a5102_comment]').val(data.checklist.leakage);
        }
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMModule() {
    let arr = [
        "tr55acd91e101-recheck-pass",
    ]
    arr.forEach(id => {
        $('#' + id).click();
    });
    const { code, data } = getDeviceCode();
    if (code) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMSpO2() {
    let arr = [
        "tr55acd41b101-recheck-pass",
        "tr55acd41b102-recheck-pass",
        "tr55acd41b103-recheck-none",
        "tr55acd41b104-recheck-none",
        "tr55acd41b105-recheck-none",
        "tr55acd41b106-recheck-none",
        "tr55acd41b107-recheck-none",
        "tr55acd41b108-recheck-pass",
        "tr55acd41b109-recheck-pass",
        "tr55acd41b110-recheck-pass",
        "tr55acd41b111-recheck-pass",
        "tr55acd41b112-recheck-pass",
        "tr55acd41b113-recheck-pass",
        "tr55acd41b114-recheck-pass",
        "tr55acd41b115-recheck-none",
        "tr55acd41b116-recheck-pass",
        "tr55acd41b117-recheck-pass",
        "tr55acd41b118-recheck-pass",
        "tr55acd42f101-recheck-none",
        "tr55acd42f102-recheck-none",
        "tr55acd441101-recheck-pass",
        "tr55acd441102-recheck-none",
        "tr55acd441103-recheck-none",
        "tr55acd441104-recheck-none"
    ]
    arr.forEach(id => {
        $('#' + id).click();
    });
    const { code, data } = getDeviceCode();
    if (code) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMSuctionRegulator() {
    let arr = [
  "tr55acdc75101-recheck-pass",
  "tr55acdc75102-recheck-pass",
  "tr55acdc75103-recheck-pass",
  "tr55acdc75104-recheck-none",
  "tr55acdc75105-recheck-pass",
  "tr55acdc75106-recheck-none",
  "tr55acdc75107-recheck-none",
  "tr55acdc75108-recheck-pass",
  "tr55acdc75109-recheck-pass",
  "tr55acdc75110-recheck-none",
  "tr55acdcac101-recheck-none",
  "tr55acdcac102-recheck-none",
  "tr55acdcac103-recheck-pass",
  "tr55acdcc3101-recheck-pass",
  "tr55acdcc3102-recheck-none",
  "tr55acdcc3103-recheck-none",
  "tr55acdcc3104-recheck-none"
]
    arr.forEach(id => {
        $('#' + id).click();
    });
    const { code, data } = getDeviceCode();
    if (code) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMSphygmomanometer() {
    let arr = [
  "tr55acdafa101-recheck-pass",
  "tr55acdafa102-recheck-pass",
  "tr55acdafa103-recheck-none",
  "tr55acdafa104-recheck-pass",
  "tr55acdafa105-recheck-pass",
  "tr55acdafa106-recheck-none",
  "tr55acdafa107-recheck-pass",
  "tr55acdafa108-recheck-pass",
  "tr55acdafa109-recheck-none",
  "tr55acdafa110-recheck-pass",
  "tr55acdafa111-recheck-pass",
  "tr55acdafa112-recheck-pass",
  "tr55acdb10101-recheck-pass",
  "tr55acdb10102-recheck-pass",
  "tr55acdb25101-recheck-pass",
  "tr55acdb25102-recheck-none",
  "tr55acdb25103-recheck-none",
  "tr55acdb25104-recheck-none"
]
    arr.forEach(id => {
        $('#' + id).click();
    });
    const { code, data } = getDeviceCode();
    if (code) {
        if (data?.checklist?.leakage !== undefined) {
            $('[name=tr55acdb10101_comment]').val(data.checklist.leakage);
        }
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
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