var script_url = 'https://script.google.com/macros/s/AKfycbzPuTnTlfVlsAQofqZh9yxvwhZfCyssa2SvePnwiW_AsgfIcSXAGHm2QlXv0Urqijeubw/exec'
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
})

$(document).ready(() => {
    setInterval(function () {
        let timenow = moment().format('DD MMMM YYYY HH:mm:ss')
        $('.timenow').html(timenow);
    }, 1000);
    $.LoadingOverlay("show");
    $.when(getHistory()).done(function () {
        $.LoadingOverlay("hide");
        $('#header-text').addClass('animate__animated animate__rubberBand animate__delay-1s')
        $('#main-div').addClass(' animate__animated animate__backInUp').show()
    })
    getLastSaved()

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
        $('#liquid-o2-volume-img-preview').attr('src', e.target.result).show()
        // scroll image to center of screen
        $('html, body').animate({
            scrollTop: $('#liquid-o2-volume-img-preview').offset().top - 100
        }, 100)

        $('#liquid-o2-volume-img-preview').addClass('animate__animated animate__flipInY')

        img_file = e.target.result
    }
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
                    $('#' + key).attr('placeholder', data[key])
                })
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
        obj[a.name] = a.value
    })
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
            if (key == 'vaccuum-pressure') {
                $(`[name="${key}"]`).prop('checked', true)
                return
            }
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
    let form = $('#main-form')
    let data = form.serializeArray()
    let obj = {}
    data.forEach(a => {
        obj[a.name] = a.value
    })
    obj.opt = 'submit'
    $.LoadingOverlay("show");
    localStorage.setItem('user', obj.name)
    // sendLineNotify(obj)
    $.ajax({
        url: script_url,
        data: obj,
        type: 'POST',
        success: function (res) {
            console.log(res)
            $('html, body').animate({
                scrollTop: 0
            }, 500);
            $.LoadingOverlay("hide");
            if (res.status) {
                sendLineNotify(obj)
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
            } else {
                Toast.fire({
                    icon: 'error',
                    title: 'บันทึกข้อมูลไม่สำเร็จ'
                })
                $.LoadingOverlay("hide");
            }
        },
    })
}

function sendLineNotify(obj) {
    let today = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Bangkok',
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour12: false,
        hour: "numeric",
        minute: "numeric"
    })
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
@${obj.name}`
    $.ajax({
        url: script_url,
        type: 'POST',
        data: {
            opt: 'sendLineNotify',
            msg: message,
            img: img_file
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
