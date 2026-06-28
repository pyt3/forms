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
        "ASPIRATOR, EMERGENCY (SUCTION PUMP) (MED)": setPMAspirator,
        "EKG RECORDER": setPMEKG,
        "NIBP MONITOR (MED)": () => {
            $(standard_select[0]).select2("val", "G5-BMEPYT3-027");
            setPMNIBP();
        },
        "PM MODULE (MED)": setPMModule,
        "PULSE OXIMETER (MED)": setPMSpO2,
        "SUCTION REGULATOR (MED)": setPMSuctionRegulator,
        "SPHYGMOMANOMETER": setPMSphygmomanometer,
        "THERMOMETER, HYGRO (MED)": setPMThermoHygroMeter, //357
        "THERMOMETER DIGITAL (MED)": setPMThermoDigital, //354
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
        "ASPIRATOR, EMERGENCY (SUCTION PUMP) (MED)": () => {
            $(standard_select[0]).select2("val", "G5-BMEPYT3-022");
            setCalAspirator();
        },
        "EKG RECORDER": () => {
            $(standard_select[0]).select2("val", "G5-BMEPYT3-013");
            setCalEKG();
        },
        "NIBP MONITOR (MED)": () => {
            standard_select.toArray().slice(0, 4).forEach(select => {
                $(select).select2("val", "G5-BMEPYT3-013");
            });
            setCalNIBP();
        },
        "PULSE OXIMETER (MED)": () => {
            standard_select.select2("val", "G5-BMEPYT3-013");
            setCalSpO2();
        },
        "SUCTION REGULATOR (MED)": () => {
            standard_select.select2("val", "G5-BMEPYT3-022");
            setCalSuctionRegulator();
        },
        "SPHYGMOMANOMETER": () => {
            standard_select.select2("val", "G5-BMEPYT3-013");
            setCalSphygmomanometer();
        },
        "THERMOMETER, HYGRO (MED)": () => {
            standard_select.select2("val", "G5-BMEPYT3_025");
            setCalThermoHygroMeter();//24
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
    $("button:contains('" + code + "')").removeClass('btn-info').addClass('btn-warning');
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
    if (name.indexOf('MODULE, ') !== -1) {
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
    console.log('Setting up calibration form with IDs:', ids, 'and data:', data);
    if (data.checklist && data.checklist.length > 0) {
        data.checklist.forEach((item, index) => {
            console.log('item:', item);
            if (index < ids.length) {
                console.log('#' + ids[index] + '_col1');
                console.log('Setting value for:', ids[index] + '_col1', 'with item[0]:', item[0]);
                $('#' + ids[index] + '_col1').val(item[0]).trigger('keyup').trigger('blur').trigger('change');
            }
        });

        if (toleranceFieldId) {
            let max_value = Math.max(...data.checklist.map(item => Number(item[0])));
            if (max_value == 500) max_value = 750;
            $(toleranceFieldId).val(max_value).trigger('keyup').trigger('blur').trigger('change');
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
        'SPHYGMOMANOMETER': 1,
        'THERMOMETER, HYGRO (MED)': 1,
    };

    const decimal = decimalMap[data.form_cal] || 2;
    setupInputHandlers(ids, decimal, useSameValue);

    data.checklist.forEach((item, index) => {
        if (index < ids.length) {
            $('#' + ids[index] + '_col2').val(item[1]).trigger('keyup').trigger('blur');
        }
    });

    setSameValue(data.temp, data.humid);
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
        setupCalibrationForm(ids, { checklist: data.checklist.hr }, null, true);
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

function setCalThermoHygroMeter() {
    const ids = {
        temperature: ["tr55a5fea24"],
        humidity: ["tr55a6215c1"]
    };
    const { processedCode, data } = getDeviceCode();
    data.checklist = {
        temperature: [[data.temp_std, data.temp]],
        humidity: [[data.humid_std, data.humid]]
    }
    if (processedCode) {
        Object.keys(ids).forEach(key => {
            if (data.checklist[key] && data.checklist[key].length > 0) {
                setupCalibrationForm(ids[key], { checklist: data.checklist[key], form_cal: data.form_cal.split('#')[0] }, null, false);
                setSameValue(data.checklist.temperature[0][1], data.checklist.humidity[0][1])
            }
        });
        setupDatepicker(data);
        setupLocationInfo(data, '#table55c0800d_notetext');
    }
}

// PM functions
function setPMFlowMeter() {
    const checkboxIds = [
        "tr55acd89d101_result",
        "tr55acd89d102_result",
        "tr55acd89d103_result",
        "tr55acd89d104_result",
        "tr55acd89d105_result",
        "tr55acd89d106_result",
        "tr55acd89d107_result",
        "tr55acd89d108_result",
        "tr55acd8ae101_result",
        "tr55acd8c0101_result",
        "tr55acd8c0102_result",
        "tr55acd8c0103_result",
        "tr55acd8c0104_result"
    ]
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
        "tr55acdb7f101_result",
        "tr55acdb7f102_result",
        "tr55acdb7f103_result",
        "tr55acdb7f104_result",
        "tr55acdb7f105_result",
        "tr55acdb7f106_result",
        "tr55acdb7f107_result",
        "tr55acdb7f108_result",
        "tr55acdb7f109_result",
        "tr55acdb7f110_result",
        "tr55acdb7f111_result",
        "tr55acdb7f112_result",
        "tr55acdb7f113_result",
        "tr62d778471_result",
        "tr62d778572_result",
        "tr62d778663_result",
        "tr55acdb91101_result",
        "tr55acdb91102_result",
        "tr55acdb91103_result",
        "tr55acdb91104_result",
        "tr55acdb91105_result",
        "tr55acdba8101_result",
        "tr55acdba8102_result",
        "tr55acdba8103_result",
        "tr55acdba8104_result"
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
        "tr64bcfc111_result",
        "tr55acd19d102_result",
        "tr55acd19d103_result",
        "tr55acd19d104_result",
        "tr55acd19d105_result",
        "tr55acd19d106_result",
        "tr55acd19d108_result",
        "tr55acd19d109_result",
        "tr55acd19d110_result",
        "tr55acd19d111_result",
        "tr55acd19d112_result",
        "tr55acd19d113_result",
        "tr55acd19d114_result",
        "tr55acd19d115_result",
        "tr55acd19d116_result",
        "tr55acd19d117_result",
        "tr55acd19d118_result",
        "tr55acd19d119_result",
        "tr55acd19d120_result",
        "tr60f697d01_result",
        "tr55acd19d121_result",
        "tr55acd1d6101_result",
        "tr55acd1d6102_result",
        "tr55acd1d6103_result",
        "tr62d76f661_result",
        "tr55acd1d6104_result",
        "tr55acd209101_result",
        "tr55acd209102_result",
        "tr55acd209103_result",
        "tr55acd209104_result"
    ]
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
        "tr55ace183101_result",
        "tr55ace183102_result",
        "tr55ace183103_result",
        "tr55ace183104_result",
        "tr55ace183105_result",
        "tr55ace183106_result",
        "tr55ace183107_result",
        "tr55ace183108_result",
        "tr55ace183109_result",
        "tr55ace183110_result",
        "tr55ace183111_result",
        "tr55ace183112_result",
        "tr55ace183113_result",
        "tr55ace183114_result",
        "tr55ace183115_result",
        "tr55ace183116_result",
        "tr55ace183117_result",
        "tr60f698fc1_result",
        "tr55ace1a5101_result",
        "tr55ace1a5102_result",
        "tr55ace1a5103_result",
        "tr55ace1a5104_result",
        "tr55ace1a5105_result",
        "tr62d76eea1_result",
        "tr55ace1b9101_result",
        "tr55ace1b9102_result",
        "tr55ace1b9103_result",
        "tr55ace1b9104_result"
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
    [
        "tr55acd41b101_result",
        "tr55acd41b102_result",
        "tr55acd41b103_result",
        "tr55acd41b104_result",
        "tr55acd41b105_result",
        "tr55acd41b106_result",
        "tr55acd41b107_result",
        "tr55acd41b108_result",
        "tr55acd41b109_result",
        "tr55acd41b110_result",
        "tr55acd41b111_result",
        "tr55acd41b112_result",
        "tr55acd41b113_result",
        "tr55acd41b114_result",
        "tr55acd41b115_result",
        "tr55acd41b116_result",
        "tr55acd41b117_result",
        "tr55acd41b118_result",
        "tr55acd42f101_result",
        "tr55acd42f101_result",
        "tr55acd42f102_result",
        "tr55acd441101_result",
        "tr55acd441102_result",
        "tr55acd441103_result",
        "tr55acd441104_result"
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
        "tr55acdc75101_result",
        "tr55acdc75102_result",
        "tr55acdc75103_result",
        "tr55acdc75104_result",
        "tr55acdc75105_result",
        "tr55acdc75106_result",
        "tr55acdc75107_result",
        "tr55acdc75108_result",
        "tr55acdc75109_result",
        "tr55acdc75110_result",
        "tr55acdcac101_result",
        "tr55acdcac102_result",
        "tr55acdcac103_result",
        "tr55acdcc3101_result",
        "tr55acdcc3102_result",
        "tr55acdcc3103_result",
        "tr55acdcc3104_result",
        "tr55acdcac102_result"
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
        "tr55acdafa101_result",
        "tr55acdafa102_result",
        "tr55acdafa103_result",
        "tr55acdafa104_result",
        "tr55acdafa105_result",
        "tr55acdafa106_result",
        "tr55acdafa107_result",
        "tr55acdafa108_result",
        "tr55acdafa109_result",
        "tr55acdafa110_result",
        "tr55acdafa111_result",
        "tr55acdafa112_result",
        "tr55acdb10101_result",
        "tr55acdb10102_result",
        "tr55acdb25101_result",
        "tr55acdb25102_result",
        "tr55acdb25103_result",
        "tr55acdb25104_result"
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

function setPMThermoHygroMeter() {
    const checkboxIds = [
        "tr55ace186102_result",
        "tr55ace186105_result",
        "tr55ace186110_result",
        "tr55ace186112_result",
        "tr55ace186113_result",
        "tr55ace186114_result",
        "tr55ace186115_result",
        "tr55ace1a3103_result",
        "tr599e3d841_result",
        "tr55ace1b2101_result",
        "tr55ace1b2102_result",
        "tr55ace1b2103_result",
        "tr55ace1b2104_result"
    ]
    checkboxIds.forEach(id => $('#' + id).click());
    const { processedCode, data } = getDeviceCode();
    if (processedCode) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue(data.checklist.std_temp, ["", "-"].includes(data.checklist.std_humid) ? undefined : data.checklist.std_humid);
}
function setPMThermoDigital() {
    const checkboxIds = [
        "tr55ace186102_result",
        "tr55ace186103_result",
        "tr55ace186104_result",
        "tr55ace186105_result",
        "tr55ace186106_result",
        "tr55ace186107_result",
        "tr55ace186109_result",
        "tr55ace186111_result",
        "tr55ace186113_result",
        "tr55ace186114_result",
        "tr55ace186115_result",
        "tr60f686ed1_result",
        "tr60f686ed1_result",
        "tr60f686ef2_result",
        "tr62d7875d1_result",
        "tr62d7875f2_result",
        "tr62d787613_result",
        "tr55ae0af9101_result",
        "tr55ae0af9102_result",
        "tr55ae0af9103_result",
        "tr5e2125b41_result",
        "tr55ace1b2101_result"
    ]
    checkboxIds.forEach(id => $('#' + id).click());
    const { processedCode, data } = getDeviceCode();
    if (processedCode) {
        setupDatepicker(data);
        setupLocationInfo(data, '#table55ac99d7_notetext');
    }
    setSameValue(data.checklist.std_temp, ["", "-"].includes(data.checklist.std_humid) ? undefined : data.checklist.std_humid);
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

function setSameValue(temp, humid) {
    document.getElementById('work_temperature').value = temp || 25;
    document.getElementById('work_humidity').value = humid || 50;
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

            let [cal_eid, , cal_plan] = selectCalFormBtn.attr('onclick').split('(')[1].split(')')[0].split(',').map(s => Number(s.trim()));

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

            let [pm_eid, , pm_plan] = selectPMFormBtn.attr('onclick').split('(')[1].split(')')[0].split(',').map(s => Number(s.trim()));
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
