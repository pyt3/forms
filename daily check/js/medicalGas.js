var script_url = 'https://script.google.com/macros/s/AKfycbzPuTnTlfVlsAQofqZh9yxvwhZfCyssa2SvePnwiW_AsgfIcSXAGHm2QlXv0Urqijeubw/exec'
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
})
$(document).ready(function () {
    getHistory()
    setInterval(function () {
        let timenow = moment().format('DD MMMM YYYY HH:mm:ss')
        $('.timenow').html(timenow);
    }, 1000);
    $('[data-toggle="tooltip"]').tooltip()
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (event) {
        resizeCanvas();
    })
    // showWeekly()
});

$(document).ready(() => {
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
        if($(this).attr('type') == 'checkbox') parent = $(this).parent().parent()
        let invalid = $('<div>', { class: 'invalid-feedback' }).text('กรุณากรอก ' + $(parent.find('label')[0]).text())
        parent.append(invalid)
    })
    // liff
    //     .init({
    //         liffId: "1657104960-wXQRkQ87", 
    //         withLoginOnExternalBrowser: true,
    //     })
    liff.ready.then(() => {
        if (!liff.isLoggedIn()) {
            return liff.login({ redirectUri: url })
        } else {
            console.log('liff init success');
            $.post(script_url, { opt: 'getconst' }, async function (c) {
                const firebaseConfig = {
                    apiKey: "AIzaSyANRS_sanVDjdunkY8z-F5UD-n3R1rgYKQ",
                    authDomain: "daily-check-form.firebaseapp.com",
                    projectId: "daily-check-form",
                    storageBucket: "daily-check-form.appspot.com",
                    messagingSenderId: "544837049860",
                    appId: "1:544837049860:web:462e6b854290b1dec39f51"
                }
                const defaultProject = firebase.initializeApp(firebaseConfig);
                firestore = defaultProject.firestore();
                auth = defaultProject.auth();
                if (!auth.currentUser) {
                    await getAuth()
                }
                await getDeptList(client)
                getFolderToken()
                $.LoadingOverlay("hide");
            })
        }
    })
        .catch((err) => {
            console.log(err.code, err.message);
        });
})
function autoSave() {
    let form = $('#main-form')
    let data = form.serializeArray()
    let obj = {}
    data.forEach(a => {
        obj[a.name] = a.value
    })
    localStorage.setItem('history', JSON.stringify(obj))
    console.log(obj)
    Toast.fire({
        icon: 'success',
        title: 'Autosaved',
        timer: 700
    })
}
function getHistory() {
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
