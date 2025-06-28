// Page routing
const url = new URL(window.location.href);
const page = new URLSearchParams(url.search).get('page');

// Main routing logic
if (page === 'pm-form') {
    handlePMForm();
} else if (page === 'cal-form') {
    handleCalForm();
} else if (page === 'plan-equipments') {
    setupQuickSearchModal();
}

// Form handlers
function handlePMForm() {
    const form_name = $('#show-form-name').text().trim();
    const standard_select = $('select[id$="std_code"]');
    
    const pmHandlers = {
        "FLOW METER": setPMFlowMeter,
        "ASPIRATOR, EMERGENCY (SUCTION PUMP)": setPMAspirator,
        "EKG RECORDER": setPMEKG,
        "NIBP MONITOR": () => {
            $(standard_select[0]).select2("val", "G5-BMEPYT3-027");
            setPMNIBP();
        },
        "PM MODULE": setPMModule,
        "PULSE OXIMETER": setPMSpO2,
        "SUCTION REGULATOR": setPMSuctionRegulator,
        "SPHYGMOMANOMETER": setPMSphygmomanometer
    };

    if (pmHandlers[form_name]) {
        pmHandlers[form_name]();
    } else {
        alert('ไม่พบข้อมูลการสอบเทียบของ ' + form_name + ' ในระบบ กรุณาตรวจสอบอีกครั้ง');
    }
}

function handleCalForm() {
    const form_name = $('#show-form-name').text().trim();
    const standard_select = $('select[id$="_standard_code"]');
    
    const calHandlers = {
        "FLOW METER": () => {
            $(standard_select[0]).select2("val", "G5-BMEPYT3-023");
            setCalFlowMeter();
        },
        "ASPIRATOR, EMERGENCY (SUCTION PUMP)": () => {
            $(standard_select[0]).select2("val", "G5-BMEPYT3-022");
            setCalAspirator();
        },
        "EKG RECORDER": () => {
            $(standard_select[0]).select2("val", "G5-BMEPYT3-013");
            setCalEKG();
        },
        "NIBP MONITOR": () => {
            standard_select.toArray().slice(0, 4).forEach(select => {
                $(select).select2("val", "G5-BMEPYT3-013");
            });
            setCalNIBP();
        },
        "PULSE OXIMETER": () => {
            standard_select.select2("val", "G5-BMEPYT3-013");
            setCalSpO2();
        },
        "SUCTION REGULATOR": () => {
            standard_select.select2("val", "G5-BMEPYT3-022");
            setCalSuctionRegulator();
        },
        "SPHYGMOMANOMETER": () => {
            standard_select.select2("val", "G5-BMEPYT3-013");
            setCalSphygmomanometer();
        }
    };

    if (calHandlers[form_name]) {
        calHandlers[form_name]();
    } else {
        alert('ไม่พบข้อมูลการสอบเทียบของ ' + form_name + ' ในระบบ กรุณาตรวจสอบอีกครั้ง');
    }
}

// Helper functions
function processDeviceCode(code) {
    console.log('Original device code:', code);
    code = code.replace('PYT3D_', '').replace('PYT3T_', '').replace('PYT3_', '').replace('D_', '').replace('T_', '').trim()
    console.log('Processing device code:', code);
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
            if (calData[candidate].date && calData[candidate].date !== '') {
                return { processedCode: candidate, data: calData[candidate] || {} };
            }
            alert('พบข้อมูลการสอบเทียบของ ' + candidate + ' แต่ไม่มีวันที่สอบเทียบ กรุณาตรวจสอบอีกครั้ง');
            return { processedCode: null, data: {} };
        }
    }
    alert('ไม่พบข้อมูลการสอบเทียบของ ' + code + ' ในข้อมูลการสอบเทียบ กรุณาตรวจสอบอีกครั้ง');
    return { processedCode: null, data: {} };
}

function getDeviceCode() {
    let code = $('#work_equipment_code').val();
    let name = $('#work_equipment_name').val();
    if(name.indexOf('MODULE, ') !== -1) {
        code = code.replace('_1', '');
    }
    return processDeviceCode(code);
}

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
        $(fieldId).val('พบที่ :  ' + data.location_dept + (data.location_detail ? (' (' + data.location_detail + ')') : ''));
    }
}

function setupCalibrationForm(ids, data, toleranceFieldId = null, useSameValue = false) {
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
    
    const decimalMap = {
        'FLOW METER': 2,
        'ASPIRATOR, EMERGENCY (SUCTION PUMP)': 2,
        'EKG RECORDER': 0,
        'NIBP MONITOR': 0,
        'PULSE OXIMETER': 0,
        'SUCTION REGULATOR': 2,
        'SPHYGMOMANOMETER': 1
    };
    
    const decimal = decimalMap[data.form_cal] || 2;
    setupInputHandlers(ids, decimal, useSameValue);
    
    data.checklist.forEach((item, index) => {
        if (index < ids.length) {
            $('#' + ids[index] + '_col2').val(item[1]).trigger('keyup').trigger('blur');
        }
    });
    
    setSameValue();
}

function setupInputHandlers(ids, decimal = 2, useSameValue = false) {
    ids.forEach(id => {
        $('#' + id + '_col2').off('input').on('keyup', function (event) {
            const value = this.value;
            
            if (event.keyCode == 13) {
                let row = $(this).closest('tr');
                let nextRowInput = row.next().next().find('input[id$="_col2"]');
                if (nextRowInput.length > 0) {
                    nextRowInput.click().focus();
                } else {
                    $('#work_temperature').focus();
                }
                return;
            }

            if (value) {
                const values = useSameValue ? 
                    [value, value, value, value] : 
                    generateFourValuesWithSameMean(value, decimal);
                
                $('#' + id + '_col3').val(values[1]).trigger('blur');
                $('#' + id + '_col4').val(values[2]).trigger('blur');
                $('#' + id + '_col5').val(values[3]).trigger('blur');
            }
        });
    });

    setSameValue();
}

// Calibration functions
function setCalFlowMeter() {
    const ids = ["tr55a4d1cd6", "tr55a4d20a7", "tr55a4d2158", "tr55a4d21d9", "tr55a5c9ec1"];
    const { processedCode, data } = getDeviceCode();

    if (processedCode) {
        setupCalibrationForm(ids, data);
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07752_notetext');
    }
}

function setCalAspirator() {
    const ids = ["tr55a4d1cd6", "tr55a4d20a7", "tr55a4d2158", "tr55a71d561", "tr55a71d5c2"];
    const { processedCode, data } = getDeviceCode();

    if (processedCode) {
        setupCalibrationForm(ids, data, '#table55a4d1cc_tolerance_fso_val');
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07e1f_notetext');
    }
}

function setCalEKG() {
    const ids = ["tr55b095995", "tr55b095ad6", "tr55b095af7"];
    const { processedCode, data } = getDeviceCode();

    if (processedCode) {
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
    };

    const { processedCode, data } = getDeviceCode();
    if (!processedCode) return;
    
    data.checklist.sys = data.checklist['sys-dia'].map(item => {
        return item.map(value => Number(value.split('/')[0]));
    });
    
    data.checklist.dia = data.checklist['sys-dia'].map(item => {
        return item.map(value => Number(value.split('/')[1]));
    });
    
    Object.keys(ids).forEach(key => {
        if (data.checklist[key] && data.checklist[key].length > 0) {
            setupCalibrationForm(ids[key], { checklist: data.checklist[key] }, null, true);
        }
    });
    
    setupDatepicker(data);
    setupLocationInfo(data, '#table55c07988_notetext');
}

function setCalSpO2() {
    const ids = {
        spo2: ['tr55b0b2a73', 'tr55b0b3024', 'tr55b0b3045'],
        hr: ['tr55b19e591', 'tr55b19e672', 'tr55b19e693']
    };

    const { processedCode, data } = getDeviceCode();

    if (processedCode) {
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
    const ids = ["tr55a4d1cd6", "tr55a4d20a7", "tr55a4d2158", "tr55a71d561", "tr55a71d5c2"];
    const { processedCode, data } = getDeviceCode();

    if (processedCode) {
        setupCalibrationForm(ids, data, '#table55a4d1cc_tolerance_fso_val');
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c07eb5_notetext');
    }
}

function setCalSphygmomanometer() {
    const ids = ["tr55a4d1cd6", "tr55a4d20a7", "tr55a4d2158", "tr55a4d21d9"];
    const { processedCode, data } = getDeviceCode();
    
    if (processedCode) {
        data.checklist = data.checklist.pressure;
        setupCalibrationForm(ids, data);
        setupDatepicker(data);
        setupLocationInfo(data, '#table55a5cab3_notetext');
    }
}

// PM functions
function setPMFlowMeter() {
    const checkboxIds = [
        "tr55acd89d101-recheck-pass", "tr55acd89d102-recheck-pass", "tr55acd89d103-recheck-pass", "tr55acd89d104-recheck-pass",
        "tr55acd89d106-recheck-pass", "tr55acd89d106-recheck-pass", "tr55acd89d107-recheck-pass", "tr55acd89d108-recheck-pass",
        "tr55acd8ae101-recheck-pass", "tr55acd8c0101-recheck-pass", "tr55acd8c0102-recheck-none", "tr55acd8c0103-recheck-none",
        "tr55acd8c0104-recheck-none", "tr55acd89d105-recheck-none"
    ];
    checkboxIds.forEach(id => $('#' + id).click());
    
    const { processedCode, data } = getDeviceCode();
    if (processedCode) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMAspirator() {
    const checkboxIds = [
        "tr55acdb7f101-recheck-pass", "tr55acdb7f102-recheck-pass", "tr55acdb7f103-recheck-none", "tr55acdb7f104-recheck-none",
        "tr55acdb7f105-recheck-none", "tr55acdb7f106-recheck-none", "tr55acdb7f107-recheck-pass", "tr55acdb7f108-recheck-pass",
        "tr55acdb7f109-recheck-pass", "tr55acdb7f110-recheck-pass", "tr55acdb7f111-recheck-pass", "tr55acdb7f112-recheck-pass",
        "tr55acdb7f113-recheck-none", "tr62d778471-recheck-pass", "tr62d778572-recheck-pass", "tr62d778663-recheck-none",
        "tr55acdb91101-recheck-none", "tr55acdb91102-recheck-none", "tr55acdb91103-recheck-none", "tr55acdb91104-recheck-none",
        "tr55acdb91105-recheck-none", "tr55acdba8101-recheck-pass", "tr55acdba8102-recheck-none", "tr55acdba8103-recheck-none",
        "tr55acdba8104-recheck-none"
    ];
    checkboxIds.forEach(id => $('#' + id).click());
    
    const { processedCode, data } = getDeviceCode();
    if (processedCode) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMEKG() {
    const checkboxIds = [
        "tr64bcfc111-recheck-pass", "tr55acd19d102-recheck-pass", "tr55acd19d103-recheck-none", "tr55acd19d104-recheck-none",
        "tr55acd19d105-recheck-none", "tr55acd19d106-recheck-none", "tr55acd19d108-recheck-pass", "tr55acd19d109-recheck-pass",
        "tr55acd19d110-recheck-pass", "tr55acd19d111-recheck-pass", "tr55acd19d112-recheck-pass", "tr55acd19d113-recheck-pass",
        "tr55acd19d114-recheck-pass", "tr55acd19d115-recheck-pass", "tr55acd19d116-recheck-none", "tr55acd19d117-recheck-pass",
        "tr55acd19d118-recheck-pass", "tr55acd19d119-recheck-pass", "tr55acd19d120-recheck-pass", "tr60f697d01-recheck-none",
        "tr55acd19d121-recheck-none", "tr55acd1d6101-recheck-none", "tr55acd1d6102-recheck-none", "tr55acd1d6103-recheck-none",
        "tr62d76f661-recheck-none", "tr55acd1d6104-recheck-none", "tr55acd209101-recheck-pass", "tr55acd209102-recheck-none",
        "tr55acd209103-recheck-none", "tr55acd209104-recheck-none"
    ];
    checkboxIds.forEach(id => $('#' + id).click());
    
    const { processedCode, data } = getDeviceCode();
    if (processedCode) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMNIBP() {
    const checkboxIds = [
        "tr55ace183101-recheck-pass", "tr55ace183102-recheck-pass", "tr55ace183103-recheck-none", "tr55ace183104-recheck-pass",
        "tr55ace183105-recheck-pass", "tr55ace183106-recheck-pass", "tr55ace183107-recheck-none", "tr55ace183108-recheck-none",
        "tr55ace183109-recheck-pass", "tr55ace183110-recheck-pass", "tr55ace183111-recheck-pass", "tr55ace183112-recheck-none",
        "tr55ace183113-recheck-pass", "tr55ace183114-recheck-pass", "tr55ace183115-recheck-none", "tr55ace183116-recheck-pass",
        "tr55ace183117-recheck-pass", "tr60f698fc1-recheck-none", "tr55ace1a5101-recheck-pass", "tr55ace1a5102-recheck-pass",
        "tr55ace1a5103-recheck-none", "tr55ace1a5104-recheck-none", "tr55ace1a5105-recheck-none", "tr62d76eea1-recheck-pass",
        "tr55ace1b9101-recheck-pass", "tr55ace1b9102-recheck-none", "tr55ace1b9103-recheck-none", "tr55ace1b9104-recheck-none"
    ];
    checkboxIds.forEach(id => $('#' + id).click());
    
    const { processedCode, data } = getDeviceCode();
    if (processedCode) {
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
    const checkboxIds = ["tr55acd91e101-recheck-pass"];
    checkboxIds.forEach(id => $('#' + id).click());
    
    const { processedCode, data } = getDeviceCode();
    if (processedCode) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMSpO2() {
    const checkboxIds = [
        "tr55acd41b101-recheck-pass", "tr55acd41b102-recheck-pass", "tr55acd41b103-recheck-none", "tr55acd41b104-recheck-none",
        "tr55acd41b105-recheck-none", "tr55acd41b106-recheck-none", "tr55acd41b107-recheck-none", "tr55acd41b108-recheck-pass",
        "tr55acd41b109-recheck-pass", "tr55acd41b110-recheck-pass", "tr55acd41b111-recheck-pass", "tr55acd41b112-recheck-pass",
        "tr55acd41b113-recheck-pass", "tr55acd41b114-recheck-pass", "tr55acd41b115-recheck-none", "tr55acd41b116-recheck-pass",
        "tr55acd41b117-recheck-pass", "tr55acd41b118-recheck-pass", "tr55acd42f101-recheck-none", "tr55acd42f102-recheck-none",
        "tr55acd441101-recheck-pass", "tr55acd441102-recheck-none", "tr55acd441103-recheck-none", "tr55acd441104-recheck-none"
    ];
    checkboxIds.forEach(id => $('#' + id).click());
    
    const { processedCode, data } = getDeviceCode();
    if (processedCode) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMSuctionRegulator() {
    const checkboxIds = [
        "tr55acdc75101-recheck-pass", "tr55acdc75102-recheck-pass", "tr55acdc75103-recheck-pass", "tr55acdc75104-recheck-none",
        "tr55acdc75105-recheck-pass", "tr55acdc75106-recheck-none", "tr55acdc75107-recheck-none", "tr55acdc75108-recheck-pass",
        "tr55acdc75109-recheck-pass", "tr55acdc75110-recheck-none", "tr55acdcac101-recheck-none", "tr55acdcac102-recheck-none",
        "tr55acdcac103-recheck-pass", "tr55acdcc3101-recheck-pass", "tr55acdcc3102-recheck-none", "tr55acdcc3103-recheck-none",
        "tr55acdcc3104-recheck-none"
    ];
    checkboxIds.forEach(id => $('#' + id).click());
    
    const { processedCode, data } = getDeviceCode();
    if (processedCode) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue();
}

function setPMSphygmomanometer() {
    const checkboxIds = [
        "tr55acdafa101-recheck-pass", "tr55acdafa102-recheck-pass", "tr55acdafa103-recheck-none", "tr55acdafa104-recheck-pass",
        "tr55acdafa105-recheck-pass", "tr55acdafa106-recheck-none", "tr55acdafa107-recheck-pass", "tr55acdafa108-recheck-pass",
        "tr55acdafa109-recheck-none", "tr55acdafa110-recheck-pass", "tr55acdafa111-recheck-pass", "tr55acdafa112-recheck-pass",
        "tr55acdb10101-recheck-pass", "tr55acdb10102-recheck-pass", "tr55acdb25101-recheck-pass", "tr55acdb25102-recheck-none",
        "tr55acdb25103-recheck-none", "tr55acdb25104-recheck-none"
    ];
    checkboxIds.forEach(id => $('#' + id).click());
    
    const { processedCode, data } = getDeviceCode();
    if (processedCode) {
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
    if (isNaN(initialValue)) {
        return [0, 0, 0, 0];
    }

    const differenceMap = {
        0: 1,
        1: 0.5,
        2: 0.08,
        3: 0.008
    };
    
    const difference = differenceMap[preferDecimalPlaces] || 0.08;

    const value2 = (initialValue - difference + Math.random() * (difference * 2)).toFixed(preferDecimalPlaces);
    const value3 = (initialValue - difference + Math.random() * (difference * 2)).toFixed(preferDecimalPlaces);
    const value4 = ((initialValue * 4) - (Number(value2) + Number(value3) + initialValue)).toFixed(preferDecimalPlaces);

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

// Quick search modal setup
function setupQuickSearchModal() {
    async function waitForElement(selector) {
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
            await waitForElement('#QuickSearchResultBox .modal-body div[style*="color:#0000FF"]');
            let code = $('#QuickSearchResultBox .modal-body div[style*="color:#0000FF"]')[0].textContent.trim();
            $('#QuickSearchResultBox').attr('data-code', code);
            let cal_data = processDeviceCode(code);
            console.log('cal_data:', cal_data);
            let selectCalFormBtn = $('#QuickSearchResultBox .modal-footer button:contains("กรอกข้อมูล CAL")');
            let selectPMFormBtn = $('#QuickSearchResultBox .modal-footer button:contains("กรอกข้อมูล PM")');
            
            let [cal_eid,,cal_plan] = selectCalFormBtn.attr('onclick').split('(')[1].split(')')[0].split(',').map(s => Number(s.trim()));
            
            const windowWidth = window.screen.width;
            const windowHeight = window.screen.height;
            const width = Math.floor(windowWidth / 2);
            
            let w1 = window.open(`/?page=cal-form&eid=${cal_eid}&plan=${cal_plan}&form=${cal_data.data.form_cal.split('#')[1]}`, '_blank',
                `width=${width},height=${windowHeight},left=0,top=0`);
            w1.onload = function () {
                let customScript = localStorage.getItem('customScriptEcert');
                if (customScript) {
                    let script = document.createElement('script');
                    script.textContent = customScript;
                    w1.document.body.appendChild(script);
                }
            };
    
            let [pm_eid,,pm_plan] = selectPMFormBtn.attr('onclick').split('(')[1].split(')')[0].split(',').map(s => Number(s.trim()));
            let w2 = window.open(`/?page=pm-form&eid=${pm_eid}&plan=${pm_plan}&form=${cal_data.data.form_pm.split('#')[1]}`, '_blank',
                `width=${width},height=${windowHeight},left=${width},top=0`);
            w2.onload = function () {
                let customScript = localStorage.getItem('customScriptEcert');
                if (customScript) {
                    let script = document.createElement('script');
                    script.textContent = customScript;
                    w2.document.body.appendChild(script);
                }
            };
            
            $('#QuickSearchResultBox').modal('hide');
        }
    });
}

$('.project-context h1').append('     😊 With Custom Script 😁')
