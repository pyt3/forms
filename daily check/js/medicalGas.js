var script_url = 'https://script.google.com/macros/s/AKfycbzPuTnTlfVlsAQofqZh9yxvwhZfCyssa2SvePnwiW_AsgfIcSXAGHm2QlXv0Urqijeubw/exec'
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
})

$(document).ready(() => {

    // let comp = Compress({
    //     inputSelector: '#liquid-o2-volume-img',
    //     downloadSelector: '#compressing',
    //     rate: 40,
    //     imagePrefix: 'compressed-',
    //     dimen: null,
    // });
    // comp.on('compressed', (files) => {
    //     console.group('compressed images data url');
    //     console.log('this array contains the url for the compressed images');
    //     console.log(files);
    //     console.log('listen to the compressed event to get the array');
    //     console.groupEnd();
    //     // log dataurl size in kb
    //     console.log('dataurl size', files[0].length / 1024, 'kb')
    //     $('#liquid-o2-volume-img-preview').removeClass('animate__animated animate__flipInY')
    //     $('#liquid-o2-volume-img-preview').attr('src', files[0]).show()
    //     // scroll image to center of screen
    //     $('html, body').animate({
    //         scrollTop: $('#liquid-o2-volume-img-preview').offset().top - 150
    //     }, 100)

    //     $('#liquid-o2-volume-img-preview').addClass('animate__animated animate__flipInY')

    //     img_file = files[0]
    //     console.log("🚀 ~ img_file:", img_file)
    // });

    // comp.on('compressing', () => console.log('compressing'))

    $('#liquid-o2-volume-img').change(function () {
        if (this.files.length == 0) return
        // compress file
        Swal.fire({
            icon: 'info',
            title: 'กำลังบีบอัดไฟล์ภาพ',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })
        const files = this.files;
        let length = files.length
        let conversionResult = []
        Array.from(files).forEach((file, i) => {
            let mime = file.type == "" ? file.name.split('.')[1] : file.type.split('/')[1]
            const quality = 0.2
            if (mime == 'heic') {
                let reader = new FileReader();
                reader.onload = function (e) {
                    let blob = new Blob([e.target.result], { type: file.type });

                    heic2any({
                        blob,
                        toType: "image/jpeg",
                        quality: quality
                    }).then((conversionResult) => {
                        showConversionPreview(conversionResult)
                    }).catch((e) => {
                        console.log("🚀 ~ e:", e)
                    });
                }
                reader.readAsArrayBuffer(file);
            } else {
                new Compressor(file, {
                    quality: quality,
                    success(result) {
                        let reader = new FileReader();
                        reader.onload = function (e) {
                            showConversionPreview(e.target.result)
                        }
                        reader.readAsDataURL(result);
                    },
                    error(err) {
                        console.log(err.message);
                    },
                });
            }
        })
    })


    setInterval(function () {
        let timenow = moment().format('DD MMMM YYYY HH:mm:ss')
        $('.timenow').html(timenow);
    }, 1000);

    $.when(getHistory()).done(function () {
        $.LoadingOverlay("hide");
        $('#header-text').addClass('animate__animated animate__rubberBand')
        $('#main-form').addClass('animate__animated animate__backInUp').show()
        $('#remark-div').addClass('animate__animated animate__fadeInRight').show()
        $('iframe').first().attr('src', "https://lookerstudio.google.com/embed/reporting/81637f83-130e-4b83-84c4-db7497b631c0/page/V9LZD").attr('width', '100%')
        let width = $('iframe').width()
        let height = width * 1.4167
        $('iframe').height(height)
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
        $.LoadingOverlay("show");
        console.log('liff init success');
        let profile = await liff.getProfile()
        console.log("🚀 ~ profile:", profile)
        console.log(liff.getDecodedIDToken().sub);
        $('#line-display').attr('src', profile.pictureUrl).show(200)
        $.when(getLastSaved()).done(function () {
            $.LoadingOverlay("hide");
        })
    })
        .catch((err) => {
            console.log(err.code, err.message);
        });

})

function showConversionPreview(dataurl){
    $('#liquid-o2-volume-img-preview').removeClass('animate__animated animate__flipInY')
    $('#liquid-o2-volume-img-preview').attr('src', dataurl).show()
    // scroll image to center of screen
    $('html, body').animate({
        scrollTop: $('#liquid-o2-volume-img-preview').offset().top - 150
    }, 100)

    $('#liquid-o2-volume-img-preview').addClass('animate__animated animate__flipInY')
    Swal.close()
    let datatransfrer = new DataTransfer();
    datatransfrer.items.add(img_file.file);
    $('#liquid-o2-volume-img').prop('files', datatransfrer.files)
    console.log($('#liquid-o2-volume-img').prop('files')[0].size / 1024);
    console.log($('#liquid-o2-volume-img').prop('files')[0].type);
}

let img_file
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
            if ($(`[name="${key}"]`).is(':checkbox')) {
                if (obj[key] == '✓') {
                    $(`[name="${key}"]`).prop('checked', true)
                } else {
                    $(`[name="${key}"]`).prop('checked', false)
                }
                return
            } else {
                $(`[name="${key}"]`).val(obj[key])
            }
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

async function formSubmit() {
    // check if not attach image
    if ($('#liquid-o2-volume-img').val() == '') {
        return Swal.fire({
            icon: 'error',
            title: 'กรุณาแนบรูปภาพก่อนกดบันทึก',
            showConfirmButton: false,
            customClass: {
                popup: 'rounded-4'
            },
            timer: 1500
        }).then(() => {
            $('#liquid-o2-volume-img').focus()
        })
    }
    if (Number($('#pump-room-temp').val()) < 30) {
        await Swal.fire({
            icon: 'warning',
            title: 'อย่าลืมตรวจสอบปั๊ม dissicant air dryer',
            html: '<span class="fw-bold text-danger">ปั๊ม dissicant air dryer อาจะหยุดทำงาน</span><br>กรุณาตรวจสอบ<br><img src="https://nsmart.nhealth-asia.com/MTDPDB01/img.php?files=202005260826590.friulair.jpg" class="img-fluid" style="max-height: 400px">',
            confirmButtonText: 'ตกลง',
            customClass: {
                popup: 'rounded-4'
            }
        })
    }
    let form = $('#main-form')
    let data = form.serializeArray()
    let obj = {}
    data.forEach(a => {
        obj[a.name] = a.value.toString()
    })
    // obj['liquid-o2-volume-img'] = await uploadFiles()[0].id
    obj.opt = 'submit'
    localStorage.setItem('user', obj.name)
    console.log(obj)
    let saveData = new Promise((resolve, reject) => {
        $.ajax({
            url: script_url,
            data: obj,
            type: 'POST',
            success: function (res) {
                console.log(res)
                if (res.status == 'success') {
                    resolve(res)
                } else {
                    reject(res)
                }
            }
        })
    })
    Promise.all([saveData, uploadFiles()])
        .then((res) => {
            console.log(res)
            Swal.close()
            sendMessage(obj, res[1][0].id)
        })

}

function sendMessage(obj, img_id) {
    console.log("🚀 ~ sendMessage ~ img_id:", img_id)
    $.getJSON(script_url + '?opt=set_trashed&id=' + img_id, function (res) {
        console.log(res)
    })
    let message = {
        type: "bubble",
        hero: {
            type: "image",
            url: "https://lh3.googleusercontent.com/d/" + img_id,
            size: "full",
            aspectMode: "cover",
            aspectRatio: "3:4",
            action: {
                type: "uri",
                label: "action",
                uri: "https://lh3.googleusercontent.com/d/" + img_id + "?openExternalBrowser=1"
            }
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "🔊 Liquid O2",
                    weight: "bold",
                    size: "xl",
                    scaling: true
                },
                {
                    type: "text",
                    text: `วันที่ ${moment().format('DD/MM/YYYY')} เวลา ${moment().format('HH:mm')} น.`,
                    size: "sm",
                    color: "#aaaaaa",
                    scaling: true
                },
                {
                    type: "separator",
                    margin: "md"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "md",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text",
                            text: "Liquid oxygen",
                            weight: "bold",
                            size: "md",
                            scaling: true
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "ปริมาณคงเหลือ",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 5,
                                    scaling: true
                                },
                                {
                                    type: "text",
                                    text: `${obj['liquid-o2-volume'].toLocaleString()} mm`,
                                    wrap: true,
                                    size: "sm",
                                    flex: 2,
                                    align: "end",
                                    scaling: true
                                }
                            ]
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "แรงดัน",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 5,
                                    scaling: true
                                },
                                {
                                    type: "text",
                                    text: `${obj['liquid-o2-pressure'].toLocaleString()} bar`,
                                    wrap: true,
                                    size: "sm",
                                    flex: 2,
                                    align: "end",
                                    scaling: true
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "separator",
                    margin: "md"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "md",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text",
                            text: "Oxygen Manifold",
                            weight: "bold",
                            size: "md",
                            scaling: true
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "Left",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 5,
                                    scaling: true
                                },
                                {
                                    type: "text",
                                    text: `${obj['oxygen-manifold-left'].toLocaleString()} psi`,
                                    wrap: true,
                                    size: "sm",
                                    flex: 2,
                                    align: "end",
                                    scaling: true
                                }
                            ]
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "Right",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 5,
                                    scaling: true
                                },
                                {
                                    type: "text",
                                    text: `${obj['oxygen-manifold-right'].toLocaleString()} psi`,
                                    wrap: true,
                                    size: "sm",
                                    flex: 2,
                                    align: "end",
                                    scaling: true
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "separator",
                    margin: "md"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "md",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text",
                            text: "Carbon Dioxide Manifold",
                            weight: "bold",
                            size: "md",
                            scaling: true
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "Left",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 5,
                                    scaling: true
                                },
                                {
                                    type: "text",
                                    text: `${obj['c02-manifold-left'].toLocaleString()} psi`,
                                    wrap: true,
                                    size: "sm",
                                    flex: 2,
                                    align: "end",
                                    scaling: true
                                }
                            ]
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "Right",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 5,
                                    scaling: true
                                },
                                {
                                    type: "text",
                                    text: `${obj['c02-manifold-right'].toLocaleString()} psi`,
                                    wrap: true,
                                    size: "sm",
                                    flex: 2,
                                    align: "end",
                                    scaling: true
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "separator",
                    margin: "md"
                },
                {
                    type: "box",
                    layout: "vertical",
                    margin: "md",
                    spacing: "sm",
                    contents: [
                        {
                            type: "text",
                            text: "Nitrous Manifold",
                            weight: "bold",
                            size: "md",
                            scaling: true
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "Left",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 5,
                                    scaling: true
                                },
                                {
                                    type: "text",
                                    text: `${obj['nitrous-manifold-left'].toLocaleString()} psi`,
                                    wrap: true,
                                    size: "sm",
                                    flex: 2,
                                    align: "end",
                                    scaling: true
                                }
                            ]
                        },
                        {
                            type: "box",
                            layout: "baseline",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "text",
                                    text: "Right",
                                    color: "#aaaaaa",
                                    size: "sm",
                                    flex: 5,
                                    scaling: true
                                },
                                {
                                    type: "text",
                                    text: `${obj['nitrous-manifold-right'].toLocaleString()} psi`,
                                    wrap: true,
                                    size: "sm",
                                    flex: 2,
                                    align: "end",
                                    scaling: true
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        footer: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "button",
                    action: {
                        type: "uri",
                        label: "Dashboard",
                        uri: "https://lookerstudio.google.com/embed/reporting/81637f83-130e-4b83-84c4-db7497b631c0/page/V9LZD"
                    }
                },
                {
                    type: "separator"
                },
                {
                    type: "text",
                    text: "บันทึกโดย " + obj.name,
                    size: "xxs",
                    color: "#aaaaaa",
                    margin: "md",
                    align: "center",
                    scaling: true
                }
            ]
        }
    }
    liff.shareTargetPicker([
        {
            type: 'text',
            text: 'ข้อมูลการตรวจเช็คแก็สประจำวัน ' + moment().format('DD/MM/YYYY')
        },
        {
            type: 'flex',
            altText: 'Liquid O2',
            contents: message
        }
    ])
        .then(function (res) {
            if (res) {
                // succeeded in sending a message through TargetPicker
                console.log(`[${res.status}] Message sent!`);
                $('html, body').animate({
                    scrollTop: 0
                }, 500);
                // sendMessage(obj)
                let form = $('#main-form')
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
                Swal.fire({
                    icon: 'error',
                    title: 'คุณจำเป็นต้องส่งข้อมูลเข้ากลุ่ม Medical Gas',
                    cyustomClass: {
                        popup: 'rounded-4'
                    }
                }).then(() => {
                    sendMessage(obj)
                })
            }
        })
        .catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาดในการส่งข้อมูล',
                html: 'กรุณาส่งข้อมูลข้อผิดพลาดให้ผู้พัฒนา<br><br>' + error,
                customClass: {
                    popup: 'rounded-4'
                }
            })
            // something went wrong before sending a message
            console.log("something wrong happen");
        });
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

function getDownloadToken() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: script_url + '?opt=token',
            type: 'GET',
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}

var token, folder_id
(async function () {
    let data = await getDownloadToken()
    token = data.token
    folder_id = data.folder_id
}
)()
async function uploadFiles() {
    return new Promise(async main_resolve => {
        Swal.fire({
            iconHtml: '<i class="bi bi-cloud-arrow-up-fill text-danger"></i>',
            title: 'กำลังอัพโหลดไฟล์',
            customClass: {
                icon: 'border-0',
                popup: 'rounded-4'
            },
            allowOutsideClick: false,
            html: '<div class="container-fluid">' +
                '<div class="row"><div class="progress rounded-pill m-0 p-0" role="progressbar" aria-label="Danger striped example" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="height: 1.5rem"><div class="progress-bar progress-bar-striped bg-danger progress-bar-animated fs-5" style="width: 0%"></div></div></div>' +
                '<div class="row mt-3" id="progress"></div></div>',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            },
        })

        const f = document.getElementById("liquid-o2-volume-img");
        if (f.files.length == 0) {
            return false
        }
        let file = await new Promise((resolve, reject) => {
            let length = f.files.length;
            let count = 0;
            let uploadfiles = [];
            let progress_tag = new Array(length).fill(0);
            [...f.files].forEach((file, i) => {
                let fr = new FileReader();
                fr.fileName = file.name;
                fr.fileSize = file.size;
                fr.fileType = file.type;
                fr.readAsArrayBuffer(file);
                fr.onload = e => {
                    var id = "p" + ++i;
                    var div = $("<div>", { class: 'col-12 text-truncate' });
                    div.attr("id", id);
                    $("#progress").append(div);
                    $('#' + id).text('Initialising (' + fr.fileName + ')')
                    const f = e.target;
                    const resource = {
                        fileName: f.fileName,
                        fileSize: f.fileSize,
                        fileType: f.fileType,
                        fileBuffer: f.result,
                        accessToken: token,
                        folderId: folder_id,
                        fields: "id,name",
                    };
                    const ru = new ResumableUploadToGoogleDrive();
                    ru.Do(resource, function (res, err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        let msg = "";
                        if (res.status == 'start' || res.status == 'getLocation' || res.status == 'initialize') {
                            msg = '<i class="bi bi-cloud-arrow-up-fill"></i> กำลังเตรียมอัพโหลด ' + f.fileName;
                        }
                        else if (res.status == "Uploading") {
                            let progress = Math.round((res.progressNumber.current / res.progressNumber.end) * 100);
                            progress_tag[i] = progress;
                            console.log("🚀 ~ progress_tag:", progress_tag)
                            msg =
                                '<i class="bi bi-hourglass-split text-start text-danger"></i> กำลังอัพโหลด ' +
                                progress +
                                "% (" +
                                f.fileName +
                                ")";
                        } else {
                            progress_tag[i] = 100;
                            msg = '<i class="bi bi-check-circle-fill text-start text-success"></i> อัพโหลดสำเร็จ  (' + f.fileName + ")";
                        }

                        // If you want to put the uploaded file information to the active Spreadsheet,
                        // please use the following function.
                        if (res.status == "Done") {
                            uploadfiles.push({ id: res.result.id, name: res.result.name });
                            if (uploadfiles.length == length) {
                                resolve(uploadfiles);
                            }
                        }

                        $('#' + id).html(msg)
                        let progress_num = progress_tag.reduce((a, b) => a + b, 0) / length;
                        console.log("🚀 ~ progress_num:", progress_num)
                        $('.progress').attr('aria-valuenow', progress_num)
                        $('.progress-bar').css('width', progress_num + '%').text(progress_num.toFixed(2) + '%')
                    });
                };
            });
        });
        main_resolve(file);
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


