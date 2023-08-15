var script_url = 'https://script.google.com/macros/s/AKfycbzPuTnTlfVlsAQofqZh9yxvwhZfCyssa2SvePnwiW_AsgfIcSXAGHm2QlXv0Urqijeubw/exec'
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
})

$(document).ready(() => {
    $('iframe').first().attr('src', "https://lookerstudio.google.com/embed/reporting/81637f83-130e-4b83-84c4-db7497b631c0/page/V9LZD").attr('width', '100%')
    let width = $('iframe').width()
    let height = width * 1.4167
    $('iframe').height(height)
    let comp = Compress({
        inputSelector: '#liquid-o2-volume-img',
        downloadSelector: '#compressing',
        rate: 20,
        imagePrefix: 'compressed-',
        dimen: null,
    });
    comp.on('compressed', (files) => {
        console.group('compressed images data url');
        console.log('this array contains the url for the compressed images');
        console.log(files);
        console.log('listen to the compressed event to get the array');
        console.groupEnd();
        // log dataurl size in kb
        console.log('dataurl size', files[0].length / 1024, 'kb')
        $('#liquid-o2-volume-img-preview').removeClass('animate__animated animate__flipInY')
        $('#liquid-o2-volume-img-preview').attr('src', files[0]).show()
        // scroll image to center of screen
        $('html, body').animate({
            scrollTop: $('#liquid-o2-volume-img-preview').offset().top - 150
        }, 100)

        $('#liquid-o2-volume-img-preview').addClass('animate__animated animate__flipInY')

        img_file = files[0]
        console.log("🚀 ~ img_file:", img_file)
    });

    comp.on('compressing', () => console.log('compressing'))

    setInterval(function () {
        let timenow = moment().format('DD MMMM YYYY HH:mm:ss')
        $('.timenow').html(timenow);
    }, 1000);

    $.when(getHistory()).done(function () {
        $.LoadingOverlay("hide");
        $('#header-text').addClass('animate__animated animate__rubberBand')
        $('#main-form').addClass('animate__animated animate__backInUp').show()
        $('#remark-div').addClass('animate__animated animate__fadeInRight').show()
        setTimeout(() => {
            $('#header-text').removeClass('animate__rubberBand animate__delay-1s')

        }, 1000);
    })

    const tabEl = document.querySelector('button[data-bs-toggle="tab"]')
    tabEl.addEventListener('shown.bs.tab', event => {
        event.target // newly activated tab
        event.relatedTarget // previous active tab
        console.log(event.target)
        console.log(event.relatedTarget)
        $('#main-form').removeClass('animate__backInUp').addClass('animate__fadeInLeft').show()
    })

    var typingTimer;
    var doneTypingInterval = 700;
    var $input = $('#main-form input, #main-form select, input[type="checkbox"]')
    $input.on('input', function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    });
    $input.on('keydown', function () {
        clearTimeout(typingTimer);
    });
    function doneTyping() {
        autoSave()
    }
    $('#main-form input, #main-form select, input[type="checkbox"]').attr('required', true).each(function () {
        let parent = $(this).parent()
        if ($(this).attr('type') == 'checkbox') parent = $(this).parent().parent()
        let invalid = $('<div>', { class: 'invalid-feedback' }).text('กรุณากรอก ' + $(parent.find('label')[0]).text())
        parent.append(invalid)
    })
    $('#clear-data-btn').click(() => {
        localStorage.removeItem('history')
        location.reload()
    })
    liff.init({
        liffId: "1657104960-Rn9Z79Ag",
        withLoginOnExternalBrowser: true,
    })
    liff.ready.then(async () => {
        getLastSaved()
        $.LoadingOverlay("show");
        console.log('liff init success');
        let profile = await liff.getProfile()
        console.log("🚀 ~ profile:", profile)
        console.log(liff.getDecodedIDToken().sub);
        $('#line-display').attr('src', profile.pictureUrl).show(200)
        $.LoadingOverlay("hide");
    })
        .catch((err) => {
            console.log(err.code, err.message);
        });

})

let img_file
$('#liquid-o2-volume-img').change(function () {
    let file = this.files[0]
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function (e) {
        // log file size in kb
        console.log('file size', file.size / 1024, 'kb')
        // $('#liquid-o2-volume-img-preview').removeClass('animate__animated animate__flipInY')
        // $('#liquid-o2-volume-img-preview').attr('src', e.target.result).show()
        // // scroll image to center of screen
        // $('html, body').animate({
        //     scrollTop: $('#liquid-o2-volume-img-preview').offset().top - 150
        // }, 100)

        // $('#liquid-o2-volume-img-preview').addClass('animate__animated animate__flipInY')

        // img_file = e.target.result
    }
})

$('#remark-btn').click(() => {
    let o2 = $('#o2-remark').val()
    let co2 = $('#co2-remark').val()
    let n2o = $('#n2o-remark').val()
    let pump = $('#pump-remark').val()
    if (o2 == '' && co2 == '' && n2o == '' && pupm == '') {
        return Swal.fire({
            icon: 'error',
            title: 'กรุณากรอกข้อมูลก่อนกดบันทึก',
            showConfirmButton: false,
            timer: 1500
        })
    }
    Swal.fire({
        icon: 'info',
        title: 'กำลังบันทึกข้อมูล',
        html: 'กรุณารอสักครู่',
        allowOutsideClick: false,
    })
    Swal.showLoading(Swal.getConfirmButton())

    $.ajax({
        url: script_url,
        method: 'POST',
        data: {
            opt: 'save_remark',
            o2: o2,
            co2: co2,
            n2o: n2o,
            pump: pump
        },
        success: function (res) {
            Swal.close()
            if (res.status == 'success') {

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'บันทึกข้อมูลไม่สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        }

    })
    setTimeout(() => {
        Swal.fire({
            icon: 'success',
            title: 'บันทึกข้อมูลสำเร็จ',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            $('#o2-remark').val('')
            $('#co2-remark').val('')
            $('#n2o-remark').val('')
            $('#pump-remark').val('')
        })
    }, 1500);
})

function getLastSaved() {
    let obj = {
        opt: 'get_last'
    }
    return $.ajax({
        url: script_url,
        data: obj,
        type: 'GET',
        success: function (res) {
            console.log(res)
            if (res.status == 'success') {
                let data = res.data
                Object.keys(data).forEach(key => {
                    if (key.length < 1) return
                    if (!$('#' + key)) return
                    if ($('#' + key).is(':checkbox')) {
                        // if (data[key] == '✓') {
                        //     $('#' + key).prop('checked', true).val('✓')
                        // } else {
                        //     $('#' + key).prop('checked', false).val('')
                        // }
                        return
                    }
                    $('#' + key).attr('placeholder', data[key])
                })
                console.log(localStorage.getItem('user'));
                if (localStorage.getItem('user') != null) {
                    $('#name').val(localStorage.getItem('user') || "")
                } else {
                    $('#name').val("")
                }
            } else {
                Toast.fire({
                    icon: 'error',
                    title: 'ไม่สามารถดึงข้อมูลล่าสุดได้'
                })
            }
        },
    })
}

function autoSave() {
    let form = $('#main-form')
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
    if ($('#name').val() != "") {
        localStorage.setItem('user', $('#name').val())
    }
    localStorage.setItem('history', JSON.stringify(obj))
    console.log(obj)
}
function getHistory() {
    $('#name').val(localStorage.getItem('user'))
    let history = localStorage.getItem('history')
    if (history != null) {
        let obj = JSON.parse(history)
        console.log("🚀 ~ obj:", obj)
        Object.keys(obj).forEach(key => {
            // if (key == 'vaccuum-pressure') {
            //     $(`[name="${key}"]`).prop('checked', true)
            //     return
            // }
            $(`[name="${key}"]`).val(obj[key])
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

function formSubmit() {
    // check if not attach image
    if ($('#liquid-o2-volume-img').val() == '') {
        return Swal.fire({
            icon: 'error',
            title: 'กรุณาแนบรูปภาพก่อนกดบันทึก',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            $('#liquid-o2-volume-img').focus()
        })
    }
    let form = $('#main-form')
    let data = form.serializeArray()
    let obj = {}
    data.forEach(a => {
        obj[a.name] = a.value.toString()
    })
    obj.opt = 'submit'
    obj.img = img_file
    $.LoadingOverlay("show");
    localStorage.setItem('user', obj.name)
    
    $.ajax({
        url: script_url,
        data: obj,
        type: 'POST',
        // success: function (res) {

        //     if (res.status) {

        //     } else {
        //         Toast.fire({
        //             icon: 'error',
        //             title: 'บันทึกข้อมูลไม่สำเร็จ'
        //         })
        //         $.LoadingOverlay("hide");
        //     }
        // },
    })
    setTimeout(() => {
        sendLineNotify(obj)
        $('html, body').animate({
            scrollTop: 0
        }, 500);
        $.LoadingOverlay("hide");
        // sendLineNotify(obj)
        form[0].reset()
        form.removeClass('was-validated')
        // scroll to top
        localStorage.removeItem('history')
        Swal.fire({
            icon: 'success',
            title: 'บันทึกข้อมูลสำเร็จ',
            text: 'กรุณาปิดหน้าต่างนี้',
            confirmButtonText: 'ปิดหน้าต่าง',
        }).then(() => {
            liff.closeWindow()
        })
    }, 2000)
}

function sendLineNotify(obj) {

    let message = `👉 Liquid oxygen 
ปริมาณคงเหลือ  =  ${obj['liquid-o2-volume']} mm
แรงดัน  =   ${obj['liquid-o2-pressure']} bar
-------------------------------

👉 Oxygen Manifold
Left  =  ${obj['oxygen-manifold-left']} psi
Right  =  ${obj['oxygen-manifold-right']} psi
-------------------------------

👉 Carbon Dioxide Manifold
Left  =  ${obj['c02-manifold-left']} psi
Right  =  ${obj['c02-manifold-right']} psi
-------------------------------

👉 Nitrous Manifold
Left  =  ${obj['nitrous-manifold-left']} psi
Right  =  ${obj['nitrous-manifold-right']} psi
-------------------------------

บันทึกโดย
@${obj.name}

🔊 Dashboard สรุปผลการตรวจเช็คแก็ส จะอัพเดทและส่งผลภายใน 15 นาที`
    $.ajax({
        url: script_url,
        type: 'POST',
        data: {
            opt: 'sendLineNotify',
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

function convertBase64ToBlob(base64) {
    let byteString = atob(base64.split(',')[1])
    let mimeString = base64.split(',')[0].split(':')[1].split(';')[0]
    let ab = new ArrayBuffer(byteString.length)
    let ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }
    let blob = new Blob([ab], { type: mimeString })
    return blob
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
                $('#main-form').find(':invalid').first().focus()
            } else {
                formSubmit()
            }
        }, false)
    })
})()
