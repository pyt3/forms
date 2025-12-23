var script_url = 'https://script.google.com/macros/s/AKfycbwew5SoKXY39vXShqtwgL7OAVJle0fLaE3vY6_T5R5pmHeK4fNo8Jjw8pJY2VPQiVLc/exec'
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    customClass: {
        popup: 'rounded-4',
        icon: 'border-0',
    },
})
$(document).ready(() => {
    $('iframe').first().attr('src', "https://lookerstudio.google.com/embed/reporting/c4138b94-68e0-48e5-9021-57d76f7c9348/page/V9LZD").attr('width', '100%')
    let width = $('iframe').width()
    let height = width * 0.5833
    $('iframe').height(height)
    setInterval(function () {
        let timenow = moment().format('DD MMM YY (HH:mm:ss)')
        $('.timenow').html(timenow);
    }, 1000);
    $.when(getHistory()).done(function () {
        $.LoadingOverlay("hide");
        $('#header-text').addClass('animate__animated animate__rubberBand')
        setTimeout(() => {
            $('#header-text').removeClass('animate__rubberBand animate__delay-1s')
        }, 1000);
    })
    $('#offcanvas-menu').find('.nav-link').on('shown.bs.tab', function (e) {
        let target = $(this).attr('data-bs-target')
        $(target).addClass('animate__slideInLeft animate__faster')
        setTimeout(() => {
            $(target).removeClass('animate__slideInLeft animate__faster')
        }, 1000);
        $('#offcanvas-menu').offcanvas('hide')
    })
    var typingTimer;
    var doneTypingInterval = 700;
    var $input = $('form input, form select, input[type="checkbox"]')
    $input.on('input', function () {
        let inp = this
        let form = $(this).closest('form')
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function () {
            doneTyping($(form).attr('id'), inp)
        }, doneTypingInterval);
    });
    $input.on('keydown', function () {
        clearTimeout(typingTimer);
    });
    function doneTyping(id, inp) {
        checkMinMaxLimit(inp)
        autoSave(id)
    }
    $('form').find('input, select, input[type="checkbox"], input[type="radio"]').not('.no-required').attr('required', true).each(function () {
        let parent = $(this).parent()
        if ($(this).attr('type') == 'checkbox') parent = $(this).parent().parent()
        else if ($(this).attr('type') == 'radio') parent = $(this).parent()
        let invalid = $('<div>', { class: 'invalid-feedback' }).text('กรุณากรอก ' + $(parent.find('label')[0]).text())
        parent.append(invalid)
    })
    $('#clear-data-btn').click(() => {
        localStorage.removeItem('history')
        location.reload()
    })
    liff.init({
        liffId: "1657104960-bN4Om4yY",
        // liffId: "1655873446-MpmBPPzl",
        withLoginOnExternalBrowser: true,
    })
    liff.ready.then(async () => {
        getLastSaved()
        $.LoadingOverlay("show");
        console.log('liff init success');
        let profile = await liff.getProfile()
        $('#line-display').attr('src', profile.pictureUrl).show(200)
        $.LoadingOverlay("hide");
        let now = new Date()
        if (now.getHours() >= 6 && now.getHours() < 14) {
            $('label[for="morning"]').click()
        } else {
            $('label[for="evening"]').click()
        }
    })
        .catch((err) => {
            console.log(err.code, err.message);
        });
})
var section_alerts = {}
function checkMinMaxLimit(inp) {
    let min = $(inp).attr('min')
    let max = $(inp).attr('max')
    let recheck = $(inp).attr('data-recheck')
    let sec_id = $(inp).attr('id').split('-').slice(0, -1).join('-')
    if (!min || !max || recheck) return
    if (min != undefined && max != undefined) {
        let label = $(inp).parent().find('label').text().split(' ')[0]
        let val = $(inp).val()
        if (val != '' && Number(val) < Number(min)) {
            if (!section_alerts[sec_id]) section_alerts[sec_id] = {}
            section_alerts[sec_id][$(inp).attr('id')] = {
                label: label,
                min: min,
                max: max,
                val: val,
                html: `<span class="text-decoration-underline">ค่าต่ำกว่า</span> ช่วงที่กำหนด ${min} - ${max} กรุณาตรวจสอบอีกครั้ง`
            }
            // $('#statusroom-alert').append(`<span class="text-danger" style="font-size: 0.7rem">${label} ต่ำกว่า ${min} ไม่ปกติ</span>`)
        } else if (val != '' && Number(val) > Number(max)) {
            if (!section_alerts[sec_id]) section_alerts[sec_id] = {}
            section_alerts[sec_id][$(inp).attr('id')] = {
                label: label,
                min: min,
                max: max,
                val: val,
                html: `<span class="text-decoration-underline">ค่าสูงกว่า</span> ช่วงที่กำหนด ${min} - ${max} กรุณาตรวจสอบอีกครั้ง`
            }
            // $('#statusroom-alert').append(`<span class="text-danger" style="font-size: 0.7rem">${label} สูงกว่า ${max} ไม่ปกติ</span>`)
        } else {
            if (section_alerts[sec_id]) {
                delete section_alerts[sec_id][$(inp).attr('id')]
            }
            $('#' + $(inp).attr('id')).removeClass('border-danger border-2')
        }
    }
    Object.keys(section_alerts).forEach(sec_id => {
        let alert_text = ''
        Object.keys(section_alerts[sec_id]).forEach(id => {
            // alert_text += `<span class="alert alert-danger" style="font-size: 0.9rem">${section_alerts[sec_id][id].label} ${section_alerts[sec_id][id].text}</span>`
            alert_text += `<div class="col-12">
                                        <div class="alert alert-danger p-1 py-2 ps-2 mb-1 d-flex align-items-center justify-content-between" role="alert" style="font-size: 0.8rem">
                                            <div class="col-md-9 col-8 text-start">
                                                <i class="bi bi-exclamation-triangle-fill"></i> 
                                                ${section_alerts[sec_id][id].label} ${section_alerts[sec_id][id].html}
                                            </div>
                                            <div class="col-md-3 col-4 text-end">
                                                <button class="btn btn-danger py-0 px-1 me-2 section-alert-btn" style="font-size: 0.8rem" type="button" data-alert-id=${id}>ตรวจสอบแล้ว</button>    
                                            </div>
                                        </div>
                                    </div>`
            $('#' + id).addClass('border-danger border-2')
        })
        $('#' + sec_id + '-alert').html(alert_text)
        $('.section-alert-btn').click(function () {
            $('#' + $(this).data('alert-id')).removeClass('border-danger border-2').removeAttr('min max')
            $(this).parent().parent().parent().remove()
            let sec_id = $(this).data('alert-id').split('-').slice(0, -1).join('-')
            delete section_alerts[sec_id][$(this).data('alert-id')]
        })
    })
}
function getLastSaved() {
    let forms = $('form').toArray().map(a => {
        return {
            url: script_url + '?opt=get_last&form=' + $(a).attr('id'),
            form: $(a).attr('id')
        }
    })
    Promise.all(forms.map(a => {
        $.ajax(a.url, {
            success: function (res) {
                if (res.status == 'success') {
                    let data = res.data
                    Object.keys(data).forEach(key => {
                        if (key.length < 1) return
                        if (!$('#' + key)) return
                        // if ($('#' + key).is(':checkbox')) {
                        //     if (data[key] == '✓') {
                        //         $('#' + key).prop('checked', true).val('✓')
                        //     } else {
                        //         $('#' + key).prop('checked', false).val('')
                        //     }
                        //     return
                        // } else if ($('#' + key).is(':radio')) {
                        //     if (data[key] == '✓') {
                        //         $('#' + key).prop('checked', true)
                        //     } else {
                        //         $('#' + key).prop('checked', false)
                        //     }
                        //     return
                        // }
                        $('#' + key).attr('placeholder', data[key])
                        if (key.indexOf('-lot') > -1) $('#' + key).val(data[key])
                    })
                    sessionStorage.setItem('dailycheck_app', res['tg'])
                    if (localStorage.getItem('user') != null && localStorage.getItem('user') != 'null') {
                        $('#name').val(localStorage.getItem('user') || "")
                    } else {
                        $('#name').val("")
                    }
                } else {
                    Toast.fire({
                        icon: 'error',
                        title: 'ไม่สามารถดึงข้อมูลล่าสุดของ ' + a.form + ' ได้'
                    })
                }
            },
        })
    }))
    // return $.ajax({
    //     url: script_url,
    //     data: obj,
    //     type: 'GET',
    //     success: function (res) {
    //         console.log(res)
    //         if (res.status == 'success') {
    //             let data = res.data
    //             Object.keys(data).forEach(key => {
    //                 if (key.length < 1) return
    //                 if (!$('#' + key)) return
    //                 // if ($('#' + key).is(':checkbox')) {
    //                 //     if (data[key] == '✓') {
    //                 //         $('#' + key).prop('checked', true).val('✓')
    //                 //     } else {
    //                 //         $('#' + key).prop('checked', false).val('')
    //                 //     }
    //                 //     return
    //                 // } else if ($('#' + key).is(':radio')) {
    //                 //     if (data[key] == '✓') {
    //                 //         $('#' + key).prop('checked', true)
    //                 //     } else {
    //                 //         $('#' + key).prop('checked', false)
    //                 //     }
    //                 //     return
    //                 // }
    //                 $('#' + key).attr('placeholder', data[key])
    //             })
    //             console.log(localStorage.getItem('user'));
    //             if (localStorage.getItem('user') != null) {
    //                 $('#name').val(localStorage.getItem('user') || "")
    //             } else {
    //                 $('#name').val("")
    //             }
    //         } else {
    //             Toast.fire({
    //                 icon: 'error',
    //                 title: 'ไม่สามารถดึงข้อมูลล่าสุดได้'
    //             })
    //         }
    //     },
    // })
}
var atsave = {}
function autoSave(form) {
    form = $('#' + form)
    let data = form.serializeArray()
    let obj = {}
    data.forEach(a => {
        if ($('#' + a.name).is(':checkbox')) {
            if (a.value == '✓') {
                obj[a.name] = '✓'
            } else {
                obj[a.name] = '✗'
            }
            return
        }
        obj[a.name] = a.value
    })
    if ($('.name').toArray().map(a => a.value).filter(a => a != '').length > 0) {
        localStorage.setItem('user', $('.name').toArray().map(a => a.value).filter(a => a != '')[0])
    } else {
        localStorage.removeItem('user')
    }
    atsave[form.attr('id')] = obj
    localStorage.setItem('history', JSON.stringify(atsave))
}
function getHistory() {
    $('.name').val(localStorage.getItem('user') == null ? "" : localStorage.getItem('user'))
    let history = localStorage.getItem('history')
    if (history != null) {
        let obj = JSON.parse(history)
        Object.keys(obj).forEach(key => {
            Object.keys(obj[key]).forEach(k => {
                if ($('[name="' + k + '"]').is(':checkbox')) {
                    if (obj[key][k] == '✓') {
                        $('#' + k).prop('checked', true).val('✓')
                    } else {
                        $('#' + k).prop('checked', false).val('')
                    }
                    return
                } else if ($('[name="' + k + '"]').is(':radio')) {
                    if (obj[key][k] && obj[key][k] != '') {
                        // find radio with value
                        $(`[name="${k}"][value="${obj[key][k]}"]`).click()
                    }
                    return
                } else {
                    $(`[name="${k}"]`).val(obj[key][k])
                }
            })
        })
    }
}
function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}
function sendLineNotify(obj) {
    let message
    switch (obj.form) {
        case "med-gas-checklist":
            message = `👉 ผลการตรวจเช็คแก็สทางการแพทย์
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
👉 Trigas Manifold
Left  =  ${obj['trigas-manifold-left']} psi
Right  =  ${obj['trigas-manifold-right']} psi
-------------------------------
👉 CO2 Manifold
Left  =  ${obj['c02-manifold-left']} psi
Right  =  ${obj['c02-manifold-right']} psi
-------------------------------
👉 N2 Manifold
Left  =  ${obj['n2-manifold-left']} psi
Right  =  ${obj['n2-manifold-right']} psi
-------------------------------
บันทึกโดย
@${obj.name}`
            break
        case "stockroom-checklist":
            message = `👉 ผลการตรวจเช็ค Stock Room
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
👉temperature = ${obj['stockroom-thermo-temp']}  ํC
👉humidity = ${obj['stockroom-thermo-humid']} %RH
-------------------------------
บันทึกโดย
@${obj['stockroom-name']}`
            break
        case "liquid-nitrogen-checklist":
            message = `👉 ผลการตรวจเช็ค Liquid Nitrogen Stock Room
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
👉temperature = ${obj['liquid-nitrogen-thermo-temp']}  ํC
👉humidity = ${obj['liquid-nitrogen-thermo-humid']} %RH
-------------------------------
บันทึกโดย
@${obj['liquid-nitrogen-name']}`
            break
        case "embryology-statusroom-checklist":
            message = `👉 ผลการตรวจเช็ค Status Room Embryology
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
DR-Analyst
👉 temperature = ${obj['embryology-statusroom-dr-temp']}  ํC
👉 humidity = ${obj['embryology-statusroom-dr-humid']} %RH
👉 pressure = ${obj['embryology-statusroom-dr-plessure']} Pa
-------------------------------
Desktop-Meter
👉 temperature = ${obj['embryology-statusroom-desktopmeter-temp']}  ํC
👉 humidity = ${obj['embryology-statusroom-desktopmeter-humid']} %RH
-------------------------------
Alarm System is ${obj['embryology-statusroom-alarm'].toUpperCase()}
บันทึกโดย
@${obj['embryology-statusroom-name']}`
            break
        case "embryology-embryo-checklist":
            message = `👉 ผลการตรวจเช็ค Embryo Culture ห้อง Embryology
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
PLANER A
👉 temperature = ${obj['embryology-embryo-planer-a-temp']}  ํC
-------------------------------
PLANER B
👉 temperature = ${obj['embryology-embryo-planer-b-temp']}  ํC
-------------------------------
PLANER C
👉 temperature = ${obj['embryology-embryo-planer-c-temp']}  ํC
-------------------------------
PLANER D
👉 temperature = ${obj['embryology-embryo-planer-d-temp']}  ํC
-------------------------------
PLANER E
👉 temperature = ${obj['embryology-embryo-planer-e-temp']}  ํC
-------------------------------
EMBRYO PLUS
👉 CO2 = ${obj['embryology-embryo-embryoplus-co2']} %
👉 O2 = ${obj['embryology-embryo-embryoplus-o2']} %
👉 control bar CO2 = ${obj['embryology-embryo-embryoplus-controlbar-co2']} bar
👉 control bar N2 = ${obj['embryology-embryo-embryoplus-controlbar-n2']} bar
👉 temperature = ${obj['embryology-embryo-embryoplus-temp']}  ํC
-------------------------------
EC6S A
👉 CO2 = ${obj['embryology-embryo-ec6s-a-co2']} %
👉 O2 = ${obj['embryology-embryo-ec6s-a-o2']} %
👉 control bar CO2 = ${obj['embryology-embryo-ec6s-a-controlbar_co2']} bar
👉 control bar N2 = ${obj['embryology-embryo-ec6s-a-controlbar_n2']} bar
👉 temperature = ${obj['embryology-embryo-ec6s-a-temp']}  ํC
-------------------------------
EC6S B
👉 CO2 = ${obj['embryology-embryo-ec6s-b-co2']} %
👉 O2 = ${obj['embryology-embryo-ec6s-b-o2']} %
👉 control bar CO2 = ${obj['embryology-embryo-ec6s-b-controlbar_co2']} bar
👉 control bar N2 = ${obj['embryology-embryo-ec6s-b-controlbar_n2']} bar
👉 temperature = ${obj['embryology-embryo-ec6s-b-temp']}  ํC
-------------------------------
EC6S C
👉 CO2 = ${obj['embryology-embryo-ec6s-c-co2']} %
👉 O2 = ${obj['embryology-embryo-ec6s-c-o2']} %
👉 control bar CO2 = ${obj['embryology-embryo-ec6s-c-controlbar_co2']} bar
👉 control bar N2 = ${obj['embryology-embryo-ec6s-c-controlbar_n2']} bar
👉 temperature = ${obj['embryology-embryo-ec6s-c-temp']}  ํC
-------------------------------
EC6S D
👉 CO2 = ${obj['embryology-embryo-ec6s-d-co2']} %
👉 O2 = ${obj['embryology-embryo-ec6s-d-o2']} %
👉 control bar CO2 = ${obj['embryology-embryo-ec6s-d-controlbar_co2']} bar
👉 control bar N2 = ${obj['embryology-embryo-ec6s-d-controlbar_n2']} bar
👉 temperature = ${obj['embryology-embryo-ec6s-d-temp']}  ํC
-------------------------------
บันทึกโดย
@${obj['embryology-embryo-name']}`
            break
        case "embryology-refrigerator-checklist":
            message = `👉 ผลการตรวจเช็ค Refrigerator ห้อง Embryology
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
Refrigerator
👉 temperature = ${obj['embryology-refrigerator-refrig-temp']}  ํC
-------------------------------
DataLogger
👉 temperature = ${obj['embryology-refrigerator-thermo-temp']}  ํC
-------------------------------
บันทึกโดย
@${obj['embryology-refrigerator-name']}`
            break
        case "embryology-incubator-checklist":
            message = `👉 ผลการตรวจเช็ค Incubator ห้อง Embryology
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
ASTEC
👉 CO2 = ${obj['embryology-incubator-astec-co2']} %
👉 temperature = ${obj['embryology-incubator-astec-temp']}  ํC
-------------------------------
MEMMERT
👉 temperature = ${obj['embryology-incubator-memmert-temp']}  ํC
-------------------------------
บันทึกโดย
@${obj['embryology-incubator-name']}`
            break
        case "andrology-statusroom-checklist":
            message = `👉 ผลการตรวจเช็ค Status Room Andrology
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
Temperature
👉 temperature = ${obj['andrology-statusroom-dr-temp']}  ํC
👉 humidity = ${obj['andrology-statusroom-dr-humid']} %RH
👉 pressure = ${obj['andrology-statusroom-dr-pressure']} Pa
-------------------------------
Thermo-Hygrometer
👉 temperature = ${obj['andrology-statusroom-desktopmeter-temp']}  ํC
👉 humidity = ${obj['andrology-statusroom-desktopmeter-humid']} %RH
-------------------------------
บันทึกโดย
@${obj['andrology-statusroom-name']}`
            break
        case "andrology-refrigerator-checklist":
            message = `👉 ผลการตรวจเช็ค Refrigerator ห้อง Andrology
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
Refrigerator
👉 temperature = ${obj['andrology-refrigerator-thermo-temp']}  ํC
-------------------------------
ESCORT
👉 temperature = ${obj['andrology-refrigerator-escort-temp']}  ํC
-------------------------------
บันทึกโดย
@${obj['andrology-refrigerator-name']}`
            break
        case "andrology-incubator-checklist":
            message = `👉 ผลการตรวจเช็ค Incubator ห้อง Andrology
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
ASTEC SCA 165DS
👉 temperature = ${obj['andrology-incubator-astec-temp']}  ํC
👉 CO2 = ${obj['andrology-incubator-astec-co2']} %
-------------------------------
บันทึกโดย
@${obj['andrology-incubator-name']}`
            break
        default: return
    }
    $.ajax({
        url: script_url,
        type: 'POST',
        data: {
            opt: 'sendLineNotifyTest',
            msg: message,
        },
        success: function (res) {
            console.log(res)
        },
        error: function (err) {
            console.log(err)
        }
    })
}
function sendTelegram(obj) {
    let message
    let chat_id = '-1002471345058'
    let message_thread_id
    let parse_mode = 'HTML'
    switch (obj.form) {
        case "med-gas-checklist":
            message_thread_id = 8
            message = `<strong>👉 Medical Gas Daily Check Report</strong>
<strong>📆 Date: </strong> ${moment().format('DD/MM/YYYY')}
<strong>🕑 Shift: </strong> ${obj.shift}
<blockquote>
<b><i>👉 Trigas Manifold</i></b>
Left  =  <b>${obj['trigas-manifold-left']}</b>  psi
Right  =  <b>${obj['trigas-manifold-right']}</b>  psi
</blockquote>
<blockquote>
<b><i>👉 CO2 Manifold</i></b>
Left  =  <b>${obj['c02-manifold-left']}</b>  psi
Right  =  <b>${obj['c02-manifold-right']}</b>  psi
</blockquote>
<blockquote>
<b><i>👉 N2 Manifold</i></b>
Left  =  <b>${obj['n2-manifold-left']}</b>  psi
Right  =  <b>${obj['n2-manifold-right']}</b>  psi
</blockquote>
${obj.name}`
            break
        case "stockroom-checklist":
            message_thread_id = 10
            message = `<strong>👉 Stock Room Daily Check Report</strong>
<strong>📆 Date: </strong> ${moment().format('DD/MM/YYYY')}
<strong>🕑 Shift: </strong> ${obj.shift}
<blockquote>
<b><i>👉 Temperature</i></b>
Temperature =  <b>${obj['stockroom-thermo-temp']}</b>   ํC
Humidity =  <b>${obj['stockroom-thermo-humid']}</b>  %RH
</blockquote>
${obj['stockroom-name']}`
            break
        case "liquid-nitrogen-checklist":
            message_thread_id = 11
            message = `<strong>👉 Liquid Nitrogen Stock Room Daily Check Report</strong>
<strong>📆 Date: </strong> ${moment().format('DD/MM/YYYY')}
<strong>🕑 Shift: </strong> ${obj.shift}
<blockquote>
<b><i>👉 Temperature</i></b>
Temperature =  <b>${obj['liquid-nitrogen-thermo-temp']}</b>   ํC
Humidity =  <b>${obj['liquid-nitrogen-thermo-humid']}</b>  %RH
</blockquote>
${obj['liquid-nitrogen-name']}`
            break
        case "embryology-statusroom-checklist":
            message_thread_id = 12
            message = `<strong>👉 Embryology Status Room Daily Check Report</strong>
<strong>📆 Date: </strong> ${moment().format('DD/MM/YYYY')}
<strong>🕑 Shift: </strong> ${obj.shift}
<blockquote>
<b><i>👉 DR-Analyst</i></b>
Temperature =  <b>${obj['embryology-statusroom-dr-temp']}</b>   ํC
Humidity =  <b>${obj['embryology-statusroom-dr-humid']}</b>  %RH
Pressure =  <b>${obj['embryology-statusroom-dr-plessure']}</b>  Pa
</blockquote>
<blockquote>
<b><i>👉 Desktop-Meter</i></b>
Temperature =  <b>${obj['embryology-statusroom-desktopmeter-temp']}</b>   ํC
Humidity =  <b>${obj['embryology-statusroom-desktopmeter-humid']}</b>  %RH
</blockquote>
<blockquote>
<b><i>👉 Alarm System</i></b>
Status =  <b>${obj['embryology-statusroom-alarm'].toUpperCase()}</b>
</blockquote>
${obj['embryology-statusroom-name']}`
            break
        case "embryology-embryo-checklist":
            message_thread_id = 12
            message = `<strong>👉 Embryo Culture Daily Check Report</strong>
<strong>📆 Date: </strong> ${moment().format('DD/MM/YYYY')}
<strong>🕑 Shift: </strong> ${obj.shift}
<blockquote>
<b><i>👉 PLANER A</i></b>
Temperature =  <b>${obj['embryology-embryo-planer-a-temp']}</b>   ํC
</blockquote>
<blockquote>
<b><i>👉 PLANER B</i></b>
Temperature =  <b>${obj['embryology-embryo-planer-b-temp']}</b>   ํC
</blockquote>
<blockquote>
<b><i>👉 PLANER C</i></b>
Temperature =  <b>${obj['embryology-embryo-planer-c-temp']}</b>   ํC
</blockquote>
<blockquote>
<b><i>👉 PLANER D</i></b>
Temperature =  <b>${obj['embryology-embryo-planer-d-temp']}</b>   ํC
</blockquote>
<blockquote>
<b><i>👉 PLANER E</i></b>
Temperature =  <b>${obj['embryology-embryo-planer-e-temp']}</b>   ํC
</blockquote>
<blockquote>
<b><i>👉 EMBRYO PLUS</i></b>
CO2 =  <b>${obj['embryology-embryo-embryoplus-co2']}</b>  %
O2 =  <b>${obj['embryology-embryo-embryoplus-o2']}</b>  %
Control Bar CO2 =  <b>${obj['embryology-embryo-embryoplus-controlbar_co2']}</b>  bar
Control Bar N2 =  <b>${obj['embryology-embryo-embryoplus-controlbar_n2']}</b>  bar
Temperature =  <b>${obj['embryology-embryo-embryoplus-temp']}</b>   ํC
</blockquote>
<blockquote>
<b><i>👉 EC6S A</i></b>
CO2 =  <b>${obj['embryology-embryo-ec6s-a-co2']}</b>  %
O2 =  <b>${obj['embryology-embryo-ec6s-a-o2']}</b>  %
Control Bar CO2 =  <b>${obj['embryology-embryo-ec6s-a-controlbar_co2']}</b>  bar
Control Bar N2 =  <b>${obj['embryology-embryo-ec6s-a-controlbar_n2']}</b>  bar
Temperature =  <b>${obj['embryology-embryo-ec6s-a-temp']}</b>   ํC
</blockquote>
<blockquote>
<b><i>👉 EC6S B</i></b>
CO2 =  <b>${obj['embryology-embryo-ec6s-b-co2']}</b>  %
O2 =  <b>${obj['embryology-embryo-ec6s-b-o2']}</b>  %
Control Bar CO2 =  <b>${obj['embryology-embryo-ec6s-b-controlbar_co2']}</b>  bar
Control Bar N2 =  <b>${obj['embryology-embryo-ec6s-b-controlbar_n2']}</b>  bar
Temperature =  <b>${obj['embryology-embryo-ec6s-b-temp']}</b>   ํC
</blockquote>
<blockquote>
<b><i>👉 EC6S C</i></b>
CO2 =  <b>${obj['embryology-embryo-ec6s-c-co2']}</b>  %
O2 =  <b>${obj['embryology-embryo-ec6s-c-o2']}</b>  %
Control Bar CO2 =  <b>${obj['embryology-embryo-ec6s-c-controlbar_co2']}</b>  bar
Control Bar N2 =  <b>${obj['embryology-embryo-ec6s-c-controlbar_n2']}</b>  bar
Temperature =  <b>${obj['embryology-embryo-ec6s-c-temp']}</b>   ํC
</blockquote>
<blockquote>
<b><i>👉 EC6S D</i></b>
CO2 =  <b>${obj['embryology-embryo-ec6s-d-co2']}</b>  %
O2 =  <b>${obj['embryology-embryo-ec6s-d-o2']}</b>  %
Control Bar CO2 =  <b>${obj['embryology-embryo-ec6s-d-controlbar_co2']}</b>  bar
Control Bar N2 =  <b>${obj['embryology-embryo-ec6s-d-controlbar_n2']}</b>  bar
Temperature =  <b>${obj['embryology-embryo-ec6s-d-temp']}</b>   ํC
</blockquote>
${obj['embryology-embryo-name']}`
            break
        case "embryology-refrigerator-checklist":
            message_thread_id = 12
            //                     message = `👉 ผลการตรวจเช็ค Refrigerator ห้อง Embryology
            // 📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
            // Refrigerator
            // 👉 temperature = ${obj['embryology-refrigerator-refrig-temp']}  ํC
            // -------------------------------
            // DataLogger
            // 👉 temperature = ${obj['embryology-refrigerator-thermo-temp']}  ํC
            // -------------------------------
            // บันทึกโดย
            // @${obj['embryology-refrigerator-name']}`
            message = `<strong>👉 Embryology Refrigerator Daily Check Report</strong>
<strong>📆 Date: </strong> ${moment().format('DD/MM/YYYY')}
<strong>🕑 Shift: </strong> ${obj.shift}
<blockquote>
<b><i>👉 Refrigerator</i></b>
Temperature =  <b>${obj['embryology-refrigerator-refrig-temp']}</b>   ํC
</blockquote>
<blockquote>
<b><i>👉 DataLogger</i></b>
Temperature =  <b>${obj['embryology-refrigerator-thermo-temp']}</b>   ํC
</blockquote>
${obj['embryology-refrigerator-name']}`
            break
        case "embryology-incubator-checklist":
            message_thread_id = 12
            message = `👉 ผลการตรวจเช็ค Incubator ห้อง Embryology
📆 ประจำวันที่ ${moment().format('DD/MM/YYYY')} รอบ ${obj.shift}
ASTEC
👉 CO2 = ${obj['embryology-incubator-astec-co2']} %
👉 temperature = ${obj['embryology-incubator-astec-temp']}  ํC
-------------------------------
MEMMERT
👉 temperature = ${obj['embryology-incubator-memmert-temp']}  ํC
-------------------------------
บันทึกโดย
@${obj['embryology-incubator-name']}`
            break
        case "andrology-statusroom-checklist":
            message_thread_id = 13
            message = `<strong>👉 Andrology Status Room Daily Check Report</strong>
<strong>📆 Date: </strong> ${moment().format('DD/MM/YYYY')}
<strong>🕑 Shift: </strong> ${obj.shift}
<blockquote>
<b><i>👉 Temperature</i></b>
Temperature =  <b>${obj['andrology-statusroom-dr-temp']}</b>   ํC
Humidity =  <b>${obj['andrology-statusroom-dr-humid']}</b>  %RH
Pressure =  <b>${obj['andrology-statusroom-dr-pressure']}</b>  Pa
</blockquote>
<blockquote>
<b><i>👉 Thermo-Hygrometer</i></b>
Temperature =  <b>${obj['andrology-statusroom-desktopmeter-temp']}</b>   ํC
Humidity =  <b>${obj['andrology-statusroom-desktopmeter-humid']}</b>  %RH
</blockquote>
${obj['andrology-statusroom-name']}`
            break
        case "andrology-incubator-checklist":
            message_thread_id = 13
            message = `<strong>👉 Andrology Incubator Daily Check Report</strong>
<strong>📆 Date: </strong> ${moment().format('DD/MM/YYYY')}
<strong>🕑 Shift: </strong> ${obj.shift}
<blockquote>
<b><i>👉 ASTEC SCA 165DS</i></b>
Temperature =  <b>${obj['andrology-incubator-astec-temp']}</b>   ํC
CO2 =  <b>${obj['andrology-incubator-astec-co2']}</b>  %
</blockquote>
${obj['andrology-incubator-name']}`
            break
        default: return
    }
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'https://api.telegram.org/bot' + sessionStorage.getItem('dailycheck_app') + '/sendMessage',
            type: 'POST',
            data: {
                chat_id: chat_id,
                message_thread_id: message_thread_id,
                text: message,
                parse_mode: parse_mode,
            },
            success: function (res) {
                console.log(res)
                success_all += 1
                checkDone()
                resolve(res)
            },
            error: function (err) {
                reject(err)
            }
        })
    })
}
(() => {
    'use strict'
    const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault()
            if (!form.checkValidity()) {
                event.stopPropagation()
                form.classList.add('was-validated')
                $
                $(form).find(':invalid').first().focus()
            } else {
                ChecklistForm(form)
            }
        }, false)
    })
})()
const retryRequest = async (fn, retries = 3) => {
    // return fn().catch(err => {
    //     if (retries > 0) {
    //         return retryRequest(fn, retries - 1);
    //     } else {
    //         throw err;
    //     }
    // });
    try {
        return await fn()
    } catch (err) {
        if (retries > 0) {
            return retryRequest(fn, retries - 1);
        } else {
            throw err;
        }
    }
};
let success_all = 0
const checkDone = () => {
    if (success_all >= 2) {
        setTimeout(() => {
            $('html, body').animate({
                scrollTop: 0
            }, 200);
            Swal.fire({
                icon: 'success',
                title: 'บันทึกข้อมูลสำเร็จ',
                confirmButtonText: 'ตกลง',
                timer: 800,
                allowOutsideClick: false,
                timerProgressBar: true,
                customClass: {
                    popup: 'rounded-4',
                    icon: 'border-0',
                },
            }).then(() => {
                // localStorage.removeItem('history')
                liff.closeWindow()
            })
        }, 200);
    }
}
function ChecklistForm(form) {
    // check if not attach image
    let data = $(form).serializeArray()
    let obj = {}
    data.forEach(a => {
        obj[a.name] = a.value.toString()
    })
    obj.opt = 'submittest'
    obj.form = $(form).attr('id')
    // $.LoadingOverlay("show");
    localStorage.setItem('user', $(form).find('.name')[0].value)
    Swal.fire({
        iconHtml: '<i class="bi bi-send-fill text-primary fs-2"></i>',
        title: 'กำลังบันทึกข้อมูล',
        html: 'กรุณารอสักครู่',
        didOpen: () => {
            Swal.showLoading()
        },
        customClass: {
            popup: 'rounded-4',
            icon: 'border-0',
        },
        allowOutsideClick: () => !Swal.isLoading(),
    })
    Promise.all([
        retryRequest(() => saveToSheet(obj)),
        retryRequest(() => sendTelegram(obj)),
    ])
}
function saveToSheet(obj) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: script_url,
            data: obj,
            type: 'POST',
            success: function (res) {
                console.log(res)
                if (res.status) {
                    $(obj.form).trigger('reset')
                    $(obj.form).removeClass('was-validated')
                    // scroll to top
                    let history = localStorage.getItem('history')
                    if (history != null) {
                        let obj = JSON.parse(history)
                        delete obj[$(obj.form).attr('id')]
                        localStorage.setItem('history', JSON.stringify(obj))
                    }
                    success_all += 1
                    checkDone()
                    resolve(res)
                } else {
                    reject(res)
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error sending images:", errorThrown);
                reject(errorThrown);
            }
        })
    })
}
function checkMinMax(id) {
    let focusEle = ''
    Object.keys(section_alerts).forEach(key => {
        if (key.indexOf(id) > -1) {
            Object.keys(section_alerts[key]).forEach(alert_id => {
                if (focusEle == '') {
                    focusEle = alert_id
                }
            })
            return false
        }
    })
    if (focusEle != '') {
        $('#' + focusEle).remove.focus()
        return false
    }
    return true
}
