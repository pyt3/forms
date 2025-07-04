// var vConsole = new VConsole();
AOS.init();
document.addEventListener("DOMContentLoaded", function () {
    NProgress.start();
    NProgress.inc()
});
window.addEventListener("load", function () {
    NProgress.done();
});
// const liff_id = '1655873446-3xe866Ql'
const liff_id = '1661543046-a1pJexbX' // use
// const liff_id = '1661543046-86kpRl4E' // test
const scriptUrl = 'https://script.google.com/macros/s/AKfycbxG4JJ2Y2tHvmA-sBOF0voSGzQq4Fx1Q1j10HqGq1duL4eX53s248A4llUDY8GE7bO1/exec'

const ngrok_url = 'https://bursting-fox-mostly.ngrok-free.app/'
var job_detail
let update_data, tg_thread_id
let chat_id = '-1002300341036'
$(document).ready(async () => {
    // $('.load-bar').fadeOut(500)
    moment.locale('th')
    liff.init({
        liffId: liff_id,
    })
    liff.ready.then(async () => {
        // if (!liff.isInClient()) {
        //     if (liff.getOS() != 'ios') {
        //         if (liff.getContext().type != 'group') {
        //             $('.mobile').addClass('d-none')
        //         }
        //         let url = new URL(window.location.href)
        //         if (url.searchParams.get('action') != 'summary') {
        //             // add parameter
        //             url.searchParams.set('action', 'summary')
        //             window.open(url, '_self')
        //         }
        //         if (!liff.isLoggedIn()) return liff.login({ redirectUri: window.location.href })
        //     } else {
        //         if (liff.getContext().type == 'external') {
        //             let url = new URL(window.location.href)
        //             let action = url.searchParams.get('action')
        //             let jobid = url.searchParams.get('jobid')
        //             let new_url = 'line://app/' + liff_id
        //             let param = []
        //             if (action != null && action != undefined && action != '') {
        //                 param.push('action=' + action)
        //             }
        //             if (jobid != null && jobid != undefined && jobid != '') {
        //                 param.push('jobid=' + jobid)
        //             }
        //             if (param.length > 0) {
        //                 new_url += '?' + param.join('&')
        //             }

        //             window.open(new_url, '_self')
        //             return
        //         }
        //     }
        // }
        if (liff.getOS() == 'ios' && liff.getContext().type == 'external') {
            let url = new URL(window.location.href)
            console.log("🚀 !! url:", url);
            let action = url.searchParams.get('action')
            let jobid = url.searchParams.get('jobid')
            let new_url = 'line://app/' + liff_id
            let param = []
            if (action != null && action != undefined && action != '') {
                param.push('action=' + action)
            }
            if (jobid != null && jobid != undefined && jobid != '') {
                param.push('jobid=' + jobid)
            }
            if (param.length > 0) {
                new_url += '?' + param.join('&')
            }

            // return console.log("🚀 !! new_url:", new_url)
            
            return window.open(new_url, '_self')
        }

        // if(!liff.isInClient()) {
        //     if (liff.getContext().type != 'group') {
        //         $('.mobile').addClass('d-none')
        //     }
        //     let url = new URL(window.location.href)
        //     if (url.searchParams.get('action') != 'summary') {
        //         // add parameter
        //         url.searchParams.set('action', 'summary')
        //         return window.open(url, '_self')
        //     }
        // }

        if (!liff.isLoggedIn()) {
            return liff.login({ redirectUri: window.location.href })
        }

        if (await getUID() == 'U798fc2c46a2efd7013b12eac4dac408a') {
            $('#developer').removeClass('d-none')
        } else {
            $('#developer').addClass('d-none')
        }
        const defaultProject = firebase.initializeApp(await $.getJSON('service-account.json'));
        firestore = defaultProject.firestore();
        auth = defaultProject.auth();
        if (!auth.currentUser) {
            // await getAuth()
            await getAuth(await getUID())
        }
        initialData();
    })
    $('.unicode-charactor').click(function () {
        let msg = document.getElementById('update').value;
        let g = document.createElement('div');
        g.innerHTML = '\u25B6';
        let z = g.innerHTML;
        document.getElementById('update').value = msg + z;
    })

    $('#signatureModal').on('shown.bs.modal', function () {
        setTimeout(() => {
            // trig window resize
            window.dispatchEvent(new Event('resize'));
        }, 100);
    })

    $('#open-sign').click(function () {
        $('#signatureModal').modal('show')
        $('#signatureparent').removeClass('d-none')
    })
    // let alert_height = $('#image').parents('.alert').height()
    // console.log("🚀 !! alert_height:", alert_height)
    // $('#image').css('max-height', alert_height + 'px').css('max-width', alert_height + 'px')
})
var jobid, wo, current_user
async function initialData() {

    let url = new URL(window.location.href);
    jobid = url.searchParams.get("jobid");
    if (!jobid || jobid == '' || jobid == undefined || jobid == null) {
        $('.load-bar').fadeOut(500)
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบข้อมูล',
            customClass: {

                popup: 'rounded-4'
            },
        })
        return liff.closeWindow()
    }
    current_user = await firestore.collection('user').doc(await getUID()).get().then(doc => doc.data())
    let user_site = current_user?.site
    if (!user_site || user_site == '' || user_site == undefined || user_site == null) {
        let l = localStorage.getItem('name')
        if (l != null) {
            let n = $('#name option').toArray().find(o => o.value == l)
            if (n) {
                // current_user = { site: n.parentElement.label }
                return firestore.collection('user').doc(await getUID()).set({
                    site: n.parentElement.label
                }, { merge: true }).then(() => {
                    $.LoadingOverlay("show");
                    initialData()
                })
            }
        }
        $('.load-bar').fadeOut(500)
        $.LoadingOverlay("hide");
        return Swal.fire({
            title: 'กรุณาเลือก Site ของคุณ',
            input: 'select',
            inputOptions: $('#name optgroup').toArray().reduce((a, c) => {
                a[c.label] = c.label
                return a
            }, {}),
            inputPlaceholder: 'เลือก Site',
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: 'ยืนยัน',
            customClass: {

                popup: 'rounded-4'
            },
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value) {
                        resolve()
                    } else {
                        resolve('กรุณาเลือก Site')
                    }
                })
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                let profile = await liff.getProfile()
                firestore.collection('user').doc(await getUID()).set({
                    site: result.value,
                    line: profile.userId,
                }, { merge: true }).then(() => {
                    $.LoadingOverlay("show");
                    initialData()
                })
            }
        })
    }
    $('.load-bar').fadeOut(500)
    $.LoadingOverlay("hide");
    $('#name optgroup').not('[label="' + user_site + '"]').remove()
    $('#name').select2({
        theme: 'bootstrap-5',
        width: '100%'
    })
    let code = url.searchParams.get("code");
    console.log("🚀 !! code:", code)
    let action = url.searchParams.get("action");
    let updateText = localStorage.getItem('updateText' + jobid)
    if (updateText != null) {
        $('#update').val(updateText)
        updateCount(updateText)
    }
    $("#code").val(code);
    $("#request-no").val(jobid);
    $(".has-code").removeClass("d-none")
    $('#name').val(localStorage.getItem('name') || '').trigger('change')
    $('#name').change(function () {
        console.log($(this).val());
        localStorage.setItem('name', $(this).val())
    })
    if (code) {
        $('#history-btn').removeClass('d-none')
        $('#history-btn').prop('href', 'https://nsmart.nhealth-asia.com/MTDPDB01/jobs/BJOBA_01A.php?s_sap_code=' + code.toUpperCase() + '&openExternalBrowser=1').prop('target', '_blank')
    } else {
        $('#history-btn').addClass('d-none')
    }
    if (action == 'summary') {
        $('.mobile').addClass('d-none')
        $('#update-section').addClass('d-none')
        $('button[id="submit"]').addClass('d-none')
        $('button[id="summary-btn"]').addClass('d-none')
        $('#edit-request').hide()
        $('input').attr('readonly', true)
        $('#summary').parent().removeClass('d-none')
        $('#summary').parents('.row').find('.col-md-4').first().removeClass('d-none').addClass('d-none')
        $('#summary').parents('.container').removeClass('d-none')
        $('#request-no').parents('.container').removeClass('d-none')
        if (!liff.isInClient()) {
            $('#more-update-btn').addClass('d-none')
            $('#mobile-only-warning').removeClass('d-none')
        }
        firestore.collection('jobdata/').doc(jobid).collection('update').get().then(data => {
            data = data.docs.map(doc => doc.data()).sort((a, b) => a.timestamp - b.timestamp)
            let msg
            if (data.length == 0) msg = 'ยังไม่มีการอัพเดทงาน'
            else msg = data.map(r => {
                r.timestamp = moment(r.timestamp.toDate()).format('DD/MM/YYYY HH:mm (dddd)')
                return r
            }).map(d => {
                return `${d.timestamp}<br>${d.update.replace(/\n\n/g, '\n').replace(/\n/g, '<br>')}<br>#${d.name}`
            }).join('<br><br>-----------------------------------<br>')
            $('#summary').html(msg)
            $('#summary').parent().removeClass('d-none').focus()
            $.LoadingOverlay("hide");
            $('.load-bar').fadeOut(500)
        })
        firestore.collection('jobdata/').doc(jobid).get().then(data => {
            data = data.data()
            console.log("🚀 ~ firestore.collection ~ data:", data)
            if (data.signature) {
                $('#user-sign').attr('src', data.signature).parent().removeClass('d-none')
                $('#open-sign')
                    .find('.text-primary')
                    .removeClass('text-primary fs-5 fw-bold')
                    .addClass('text-danger')
                    .html('<i class="bi bi-arrow-counterclockwise"></i>&nbsp;แก้ไขลายเซ็น')
            }
            $('#open-sign').parent().removeClass('d-none')
            if (data.status) {
                switch (data.status) {
                    case "Waiting":
                        $('#work-status').html('<i class="bi bi-hourglass-split"></i>&nbsp;กำลังดำเนินการ')
                        break
                    case "Return equipment back":
                        $('#work-status').html('<i class="bi bi-check-circle-fill"></i>&nbsp;Return equipment back')
                        break
                    default:
                        $('#work-status').html('ยังไม่รับงาน')
                }
                $('#work-status').parent().removeClass('d-none')
            }
            $('#code').val(data.code)
            if (!data.name && !data.reciever) {
                $('#reciever').html = '&nbsp;ยังไม่มีคนรับงาน'
                $('#reciever').parent().find('i').removeClass('bi-check-circle-fill').addClass('bi-x-circle-fill')
                $('#reciever').parent().removeClass('alert-success').addClass('alert-danger')
            }
            else $('#reciever').html("&nbsp;รับงานโดย:<br>" + (data.name || data.reciever))
            $('#code').val(data.code)
            wo = data.wo || data.workorder
            $('#workorder').html(data.wo || data.workorder || 'ยังไม่มี').parents('.col-12').removeClass('d-none')
            if (data.image) {
                $('#image').attr('src', data.image).css('opacity', 1)
            } else {
                $('#image').attr('src', 'https://img.icons8.com/fluency/96/image--v1.png').css('opacity', 0.5)
            }
        })
        // $.ajax({
        //     url: scriptUrl,
        //     method: 'POST',
        //     data: {
        //         jobid: jobid,
        //         opt: 'summary'
        //     },
        //     success: (res) => {
        //         $.LoadingOverlay("hide");
        //         if (res.status == 'success') {
        //             if (res.result.replace(/\n/g, '<br>') == '') res = 'ยังไม่มีสรุปงาน'
        //             else res = res.result.replace(/\n/g, '<br>')
        //             $('#summary').html(res)
        //             $('#summary').parent().removeClass('d-none').focus()
        //         } else {
        //             Swal.fire({
        //                 icon: 'error',
        //                 title: 'สรุปงานไม่สำเร็จ',
        //                 text: 'สรุปงานไม่สำเร็จ',
        //             })
        //         }
        //     },
        // })
        $('#more-update-btn').click(() => {
            let url = new URL('line://app/' + liff_id)
            url.searchParams.set('code', code)
            url.searchParams.set('jobid', jobid)
            url.searchParams.set('action', 'update')
            window.open(url, '_self')
        })
        $.LoadingOverlay("hide");
    }
    else if (action == 'shared') {
        $('#edit-request').hide()
        Swal.fire({
            title: 'Share งาน',
            text: 'กำลังดึงข้อมูลรายชื่อห้องแชท',
            showConfirmButton: false,
            allowOutsideClick: false,
            customClass: {

                popup: 'rounded-4'
            },
            didOpen: () => {
                Swal.showLoading()
            }
        })
        let job_data = await firestore.collection('jobdata/').doc(jobid).get().then(doc => doc.data())
        firestore.collection('jobdata/').doc(jobid).collection('update').get().then(data => {
            // get doc_ref of last update
            let doc_ref
            data = data.docs.map(doc => {
                let d = doc.data()
                d.doc_ref = doc.ref
                return d
            }).sort((a, b) => b.timestamp - a.timestamp)
            let update_data = data.shift()
            doc_ref = update_data.doc_ref
            let flex = {
                "type": "bubble",
                "size": "giga",
                "body": {
                    "type": "box",
                    "spacing": "md",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "image",
                                            "url": job_data.image,
                                            "aspectMode": "fit",
                                            "size": "full",
                                            "action": {
                                                "type": "uri",
                                                "label": "action",
                                                "uri": job_data.image
                                            }
                                        }
                                    ],
                                    "width": "72px",
                                    "height": "72px",
                                    "cornerRadius": "md"
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "Update",
                                                    "weight": "bold",
                                                    "flex": 3,
                                                    "color": "#000000",
                                                    "adjustMode": "shrink-to-fit",
                                                    "scaling": true
                                                },
                                                {
                                                    "type": "text",
                                                    "text": job_data.workorder || '---',
                                                    "flex": 5,
                                                    "adjustMode": "shrink-to-fit",
                                                    "scaling": true,
                                                    "align": "end"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "รหัส",
                                                    "weight": "bold",
                                                    "flex": 3,
                                                    "color": "#000000",
                                                    "adjustMode": "shrink-to-fit",
                                                    "scaling": true
                                                },
                                                {
                                                    "type": "text",
                                                    "text": job_data.code == '' ? 'Component' : job_data.code,
                                                    "flex": 5,
                                                    "adjustMode": "shrink-to-fit",
                                                    "scaling": true,
                                                    "align": "end"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "baseline",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": 'req no. ' + job_data.job_no + ' ' + moment(update_data.timestamp.toDate()).format('DD/MM/YYYY HH:mm (dddd)'),
                                                    "size": "sm",
                                                    "color": "#bcbcbc",
                                                    "adjustMode": "shrink-to-fit",
                                                    "scaling": true,
                                                    "align": "end"
                                                }
                                            ],
                                            "spacing": "sm"
                                        },
                                    ],
                                    "justifyContent": "space-between"
                                }
                            ],
                            "spacing": "xl",
                            "paddingAll": "20px"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "spacing": 'lg',
                            "flex": 10,
                            "contents": [
                                {
                                    "type": "text",
                                    "text": update_data.update,
                                    "wrap": true,
                                    "scaling": true,
                                }
                            ],
                            "paddingAll": "lg",
                            "borderColor": "#bcbcbc",
                            "backgroundColor": "#f4f6f9",
                            "borderWidth": "light",
                            "cornerRadius": "md"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "spacing": "md",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type": "image",
                                            "url": "https://img.icons8.com/fluency-systems-filled/48/share-3.png",
                                            "size": "xxs",
                                            "aspectMode": "fit"
                                        }
                                    ],
                                    "width": "20px",
                                    "justifyContent": "center",
                                    "alignItems": "center",
                                    "action": {
                                        "type": "uri",
                                        "label": "action",
                                        "uri": "https://liff.line.me/1661543046-a1pJexbX?action=shared&jobid=" + job_data.job_no
                                    }
                                }
                            ],
                            "paddingAll": "lg",
                            "paddingEnd": "xxl",
                            "paddingStart": "xxl",
                            "alignItems": "center",
                            "justifyContent": "center"
                        },
                        {
                            "type": "separator"
                        }
                    ],
                    "paddingTop": "none",
                    "paddingBottom": "none",
                    "paddingStart": "md",
                    "paddingEnd": "md"
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": update_data.name,
                                    "size": "xs",
                                    "color": "#bcbcbc",
                                    "align": "start",
                                    "scaling": true,
                                    "adjustMode": "shrink-to-fit"
                                },
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "copy",
                                            "size": "xs",
                                            "flex": 5,
                                            "align": "end",
                                            "color": "#bcbcbc",
                                        },
                                        {
                                            "type": "image",
                                            "url": "https://img.icons8.com/fluency-systems-regular/48/copy--v1.png",
                                            "size": "20px",
                                            "flex": 1
                                        }
                                    ],
                                    "justifyContent": "flex-end",
                                    "action": {
                                        "type": "uri",
                                        "label": "copy",
                                        "uri": "https://liff.line.me/1661543046-YWbxeK8Q?doc_path=" + doc_ref.path
                                    }
                                }
                            ],
                            "spacing": "sm",
                            "justifyContent": "space-between",
                            "alignItems": "center"
                        }
                    ]
                }
            }
            let detail = job_data.detail
            if (detail && detail != '') {
                flex.body.contents.splice(1, 0, {
                    "type": "box",
                    "layout": "vertical",
                    "flex": 10,
                    "spacing": "md",
                    "contents": [
                        {
                            "type": "text",
                            "text": "อาการเสีย",
                            "wrap": true,
                            "scaling": true,
                            "color": "#777777",
                            "size": "xs"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": detail,
                                    "color": "#052c65",
                                    "wrap": true,
                                    "scaling": true,
                                    "maxLines": 3
                                }
                            ],
                            "spacing": "xl"
                        }
                    ],
                    "paddingAll": "lg",
                    "borderColor": "#9ec5fe",
                    "borderWidth": "normal",
                    "cornerRadius": "md",
                    "backgroundColor": "#cfe2ff"
                })
            }
            if (update_data.vendor_phone && update_data && update_data.vendor_phone.replace(/\s/g, '') != '') {
                flex.body.contents[2].contents.push({
                    "type": "text",
                    "text": "📞ติดต่อ " + update_data.vendor_phone,
                    "action": {
                        "type": "uri",
                        "label": "ติดต่อ " + update_data.vendor_phone,
                        "uri": "tel:" + update_data.vendor_phone.replace(/-/g, '').replace(/ /g, '')
                    },
                    "contents": [
                        {
                            "type": "span",
                            "text": "📞ติดต่อ"
                        },
                        {
                            "type": "span",
                            "text": " " + update_data.vendor_phone,
                            "color": "#006aff",
                            "decoration": "underline"
                        }
                    ],
                    "scaling": true,
                    "wrap": true
                })
            }
            let carousel = {
                type: 'carousel',
                contents: [flex]
            }
            if (data.length >= 1) {
                data = data.slice(0, 10)
                data.forEach(r => {
                    r.timestamp = moment(r.timestamp.toDate()).format('DD/MM/YYYY HH:mm (dddd)')
                    let his_flex = {
                        "type": "bubble",
                        "size": "giga",
                        "header": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "📅 " + r.timestamp,
                                    "weight": "bold",
                                    "color": "#ffffff"
                                },
                                {
                                    "type": "text",
                                    "text": "# " + r.name,
                                    "color": "#ffffff",
                                    "size": "sm"
                                }
                            ]
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "lg",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": r.update,
                                            "wrap": true,
                                            "scaling": true
                                        }
                                    ],
                                    "paddingAll": "lg",
                                    "borderColor": "#bcbcbc",
                                    "borderWidth": "light",
                                    "cornerRadius": "md",
                                    "backgroundColor": "#f4f6f9",
                                    "flex": 10,
                                }
                            ]
                        },
                        "styles": {
                            "header": {
                                "backgroundColor": "#0367d3"
                            }
                        }
                    }
                    console.log(r)
                    if (r.vendor_phone && r.vendor_phone != '' && r.vendor_phone.replace(/\s/g, '') != '') {
                        his_flex.body.contents[0].contents.push({
                            "type": "text",
                            "text": "📞ติดต่อ " + r.vendor_phone,
                            "action": {
                                "type": "uri",
                                "label": "ติดต่อ " + r.vendor_phone,
                                "uri": "tel:" + r.vendor_phone.replace(/-/g, '').replace(/ /g, '')
                            },
                            "contents": [
                                {
                                    "type": "span",
                                    "text": "📞ติดต่อ"
                                },
                                {
                                    "type": "span",
                                    "text": " " + r.vendor_phone,
                                    "color": "#006aff",
                                    "decoration": "underline"
                                }
                            ],
                            "scaling": true,
                            "wrap": true
                        })
                    }
                    carousel.contents.push(his_flex)
                })
            }
            liff.shareTargetPicker([{
                type: 'flex',
                altText: 'สรุปงาน ' + job_data.workorder + ' ' + job_data.code,
                contents: carousel
            }]).then(() => {
                $.LoadingOverlay("hide");
                $('.load-bar').fadeOut(500)
                Swal.fire({
                    icon: 'success',
                    title: 'แชร์สรุปงานสำเร็จ',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {

                        popup: 'rounded-4'
                    },
                }).then(() => {
                    liff.closeWindow()
                })
            }).catch((err) => {
                $.LoadingOverlay("hide");
                Swal.fire({
                    icon: 'error',
                    title: 'แชร์สรุปงานไม่สำเร็จ',
                    text: 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
                    customClass: {

                        popup: 'rounded-4'
                    },
                })
            })
        })
    }
    else {
        firestore.collection('jobdata/').doc(jobid).get().then(async data => {
            $('.load-bar').fadeOut(500)
            // if(!data.exists) {
            //     $.LoadingOverlay("hide");
            //     Swal.fire({
            //         icon: 'error',
            //         title: 'ไม่พบข้อมูล',
            //         text: 'ไม่พบข้อมูล',
            //     }).then(() => {
            //        liff.closeWindow()
            //     })
            // }
            if (!data.exists) {
                return Swal.fire({
                    icon: 'error',
                    title: 'ไม่พบข้อมูล',
                    input: 'text',
                    inputLabel: 'ระบุชื่อคนรับงาน',
                    inputPlaceholder: 'ระบุชื่อคนรับงาน',
                    showCancelButton: true,
                    confirmButtonText: 'ยืนยัน',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: {

                        popup: 'rounded-4'
                    },
                    inputValidator: (value) => {
                        return new Promise((resolve) => {
                            if (value) {
                                resolve()
                            } else {
                                resolve('กรุณาระบุชื่อคนรับงาน')
                            }
                        })
                    },
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        let reciever = result.value
                        Swal.fire({
                            title: 'หากมี WO กรุณากรอก',
                            input: 'text',
                            inputLabel: 'ระบุ WO',
                            inputPlaceholder: 'ระบุ WO',
                            showCancelButton: true,
                            confirmButtonText: 'ยืนยัน',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            customClass: {

                                popup: 'rounded-4'
                            },
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                let wo = result.value
                                firestore.collection('jobdata/').doc(jobid).set({
                                    reciever: reciever,
                                    timestamp: new Date(),
                                    wo: wo
                                }, { merge: true }).then(() => {
                                    $.LoadingOverlay("show");
                                    initialData()
                                })
                            }
                        })
                    }
                })
            }
            data = data.data()
            if (data.signature && data.workorder) {
                $('#user-sign').attr('src', data.signature).parent().removeClass('d-none')
                $('#open-sign')
                    .find('.text-primary')
                    .removeClass('text-primary fs-5 fw-bold')
                    .addClass('text-danger')
                    .html('<i class="bi bi-arrow-counterclockwise"></i>&nbsp;แก้ไขลายเซ็น')
            }
            if (liff.isInClient() && data.workorder) {
                $('#open-sign').parent().removeClass('d-none')
            }
            if (data.status) {
                switch (data.status) {
                    case "Waiting":
                        $('#work-status').html('<i class="bi bi-hourglass-split"></i>&nbsp;กำลังดำเนินการ')
                        break
                    case "Return equipment back":
                        $('#work-status').html('<i class="bi bi-check-circle-fill"></i>&nbsp;Return equipment back')
                        break
                    default:
                        $('#work-status').html('ยังไม่รับงาน')
                }
                $('#work-status').parent().removeClass('d-none')
            }
            job_detail = data.detail
            tg_thread_id = data.thread_id
            if (!data.name && !data.reciever) {
                $('#reciever').html('&nbsp;ยังไม่มีคนรับงาน')
                $('#reciever').parent().find('i').removeClass('bi-check-circle-fill').addClass('bi-x-circle-fill')
                $('#reciever').parent().removeClass('alert-success').addClass('alert-danger')
                if (current_user.site == 'PYT3') {
                    Swal.fire({
                        icon: 'warning',
                        title: "กรุณารับงานก่อน",
                        html: (!current_user.isAuthen || current_user.isOnCall) ? (`
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-12">
                                    <div class="alert alert-warning">
                                        ${current_user.isOnCall ? "เนื่องจากเป็น On Call กรุณาระบุชื่อ" : "กรุณาระบุชื่อ และกดปุ่มยืนยันตัวตน"}
                                        <small class="text-danger fw-bold">สามารถยืนยันตัวตนได้เพียง 1 คน/บัญชีไลน์</small>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <select name="receive-name" id="receive-name" class="form-select">
                                        ${$('#name').html()}
                                    </select>
                                </div>
                            </div>    
                        </div>
                        `) : "",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        confirmButtonText: 'ยืนยันตัวตน',
                        denyButtonText: 'รับงาน',
                        cancelButtonText: 'ยกเลิก',
                        confirmButtonColor: '#3085d6',
                        denyButtonColor: '#d33',
                        cancelButtonColor: "#777",
                        showCancelButton: true,
                        showDenyButton: current_user.isAuthen ? true : false,
                        showConfirmButton: current_user.isAuthen ? false : true,
                        customClass: {

                            popup: 'rounded-4'
                        },
                        preConfirm: async (result) => {
                            return current_user.isAuthen ? "" : $('#receive-name').val()
                        }
                    }).then(async res => {
                        if (res.isConfirmed) {
                            await register(res.value)
                        } else if (res.isDenied) {
                            await receivejob()
                        }
                    })
                }
            }
            else {
                $('#reciever').html("&nbsp;รับงานโดย:<br> " + (data.name || data.reciever))
            }
            if (!data.code) $('#code').removeAttr('readonly').attr('placeholder', 'ระบุรหัส').attr('required', true)
            else $('#code').val(data.code)
            console.log("🚀 !! data.code:", data.code)
            $('#vendor_phone').val(data.vendor_phone || '')
            wo = data.wo || data.workorder
            $('#workorder').html(data.wo || data.workorder || 'ยังไม่มี').parents('.col-12').removeClass('d-none')
            if (data.image) {
                $('#image').attr('src', data.image).css('opacity', 1)
            } else {
                $('#image').attr('src', 'https://img.icons8.com/fluency/96/image--v1.png').css('opacity', 0.5)
            }
            if (data.code) {
                $('#history-btn').removeClass('d-none')
                $('#history-btn').prop('href', 'https://nsmart.nhealth-asia.com/MTDPDB01/jobs/BJOBA_01A.php?s_sap_code=' + data.code.toUpperCase() + '&openExternalBrowser=1').prop('target', '_blank')
            } else {
                $('#history-btn').addClass('d-none')
            }
        })
        $('.container-fluid, .container').removeClass('d-none')
        $('#more-update-btn').addClass('d-none')
        $.LoadingOverlay("hide");
    }

    $('#share-line-btn').click(async() => {
        let work_detail = await firestore.collection('jobdata/').doc(jobid).get().then(doc => doc.data())
        if (work_detail && work_detail != null){
            let flex = {
                "type": "carousel",
                "contents": [
                    {
                        "type": "bubble",
                        "size": "giga",
                        "header": {
                            "type": "box",
                            "layout": "vertical",
                            "backgroundColor": "#DCE8F4",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "⚠️ งานแจ้งซ่อม ⚠️",
                                    "weight": "bold",
                                    "align": "center",
                                    "gravity": "center",
                                    "scaling": true,
                                    "size": "lg",
                                    "color": "#333333"
                                }
                            ]
                        },
                        "hero": {
                            "type": "image",
                            "url": work_detail.image && work_detail.image != null && work_detail.image != '' ? work_detail.image : $('#image').attr('src'),
                            "size": "3xl",
                            "action": {
                                "type": "uri",
                                "label": "action",
                                "uri": work_detail.image && work_detail.image != null && work_detail.image != '' ? work_detail.image : $('#image').attr('src'),
                            }
                        },
                        "body": {
                            "type": "box",
                            "spacing": "md",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "เครื่อง",
                                                            "flex": 3,
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true,
                                                            "color": "#aaaaaa"
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": work_detail.ename || '-',
                                                            "scaling": true,
                                                            "align": "start",
                                                            "color": "#666666",
                                                            "wrap": true
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "horizontal",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "รหัส",
                                                            "flex": 3,
                                                            "color": "#aaaaaa",
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": work_detail.code || '-',
                                                            "flex": 5,
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true,
                                                            "align": "end",
                                                            "color": "#666666"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "horizontal",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "แผนก(เครื่อง)",
                                                            "flex": 3,
                                                            "color": "#aaaaaa",
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": work_detail.dept || '-',
                                                            "flex": 5,
                                                            "scaling": true,
                                                            "align": "end",
                                                            "color": "#666666",
                                                            "wrap": true
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "horizontal",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "แผนก(ผู้แจ้ง)",
                                                            "flex": 3,
                                                            "color": "#aaaaaa",
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": (work_detail.sender || '-') + (work_detail.coop || ''),
                                                            "flex": 5,
                                                            "scaling": true,
                                                            "align": "end",
                                                            "color": "#666666",
                                                            "wrap": true
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "horizontal",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "ผู้แจ้ง",
                                                            "flex": 3,
                                                            "color": "#aaaaaa",
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": work_detail.sender || '-',
                                                            "flex": 5,
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true,
                                                            "align": "end",
                                                            "color": "#666666",
                                                            "wrap": true
                                                        }
                                                    ]
                                                }
                                            ],
                                            "justifyContent": "space-between",
                                            "spacing": "md"
                                        }
                                    ],
                                    "paddingAll": "5px",
                                    "spacing": "md"
                                }
                            ],
                            "paddingTop": "none",
                            "paddingBottom": "none",
                            "paddingStart": "md",
                            "paddingEnd": "md"
                        },
                        "footer": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "button",
                                    "action": {
                                        "type": "uri",
                                        "label": "อัพเดทงาน",
                                        "uri": "https://liff.line.me/1661543046-a1pJexbX?jobid=" + work_detail.job_no
                                    },
                                    "style": "primary",
                                    "color": "#0367d3"
                                },
                                {
                                    "type": "text",
                                    "text": work_detail.date || '-',
                                    "size": "xs",
                                    "color": "#bcbcbc",
                                    "adjustMode": "shrink-to-fit",
                                    "scaling": true,
                                    "align": "center",
                                    "margin": "md"
                                }
                            ],
                            "spacing": "sm"
                        }
                    },
                    {
                        "type": "bubble",
                        "size": "giga",
                        "header": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "รายละเอียดอาการเสีย",
                                    "color": "#ffffff",
                                    "size": "lg",
                                    "align": "center"
                                }
                            ]
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "lg",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": work_detail.detail || 'ยังไม่มีการอัพเดท',
                                            "wrap": true,
                                            "scaling": true
                                        }
                                    ],
                                    "paddingAll": "lg",
                                    "borderColor": "#bcbcbc",
                                    "borderWidth": "light",
                                    "cornerRadius": "md",
                                    "backgroundColor": "#f4f6f9",
                                    "flex": 10
                                }
                            ]
                        },
                        "footer": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "button",
                                    "action": {
                                        "type": "uri",
                                        "label": "ดูสรุปงาน",
                                        "uri": "https://liff.line.me/1661543046-a1pJexbX?action=summary&jobid=" + work_detail.job_no
                                    },
                                    "style": "secondary"
                                }
                            ]
                        },
                        "styles": {
                            "header": {
                                "backgroundColor": "#0367d3"
                            }
                        }
                    }
                ]
            }
            liff.shareTargetPicker([{
                type: 'flex',
                altText: 'สรุปงาน ' + work_detail.workorder + ' ' + work_detail.code,
                contents: flex
            }]).then(() => {
                $.LoadingOverlay("hide");
                $('.load-bar').fadeOut(500)
                firestore.collection('jobdata/').doc(jobid).update({
                    has_sent_init_msg: true
                }).then(() => {
                    console.log('update success');
                })
                Swal.fire({
                    icon: 'success',
                    title: 'แชร์สรุปงานสำเร็จ',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {

                        popup: 'rounded-4'
                    },
                })
            }).catch((err) => {
                $.LoadingOverlay("hide");
                Swal.fire({
                    icon: 'error',
                    title: 'แชร์สรุปงานไม่สำเร็จ',
                    text: 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
                    customClass: {

                        popup: 'rounded-4'
                    },
                })
            })
        }
    })

    $("#submit").click(() => {
        let update = $("#update").val().split(/[\n]/).map(x => x.trim()).filter(x => x.length > 0).map(x => {
            if (x[0] === '-') return "- " + x.slice(1).trim();
            return x;
        }).join('\n').replace(/\n-/g, '\n\n-');
        console.log("🚀 !! update001:", update)
        let name = $("#name").val();
        let code = $("#code").val();
        update_data = {
            wo: wo ? ('WO.' + wo) : '------',
            code: code,
            jobid: jobid,
            update: update,
            name: name,
            vendor_phone: $('#vendor_phone').val(),
            image: $('#image').attr('src'),
            date: new Date().toLocaleString('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false }),
            // thread_id: tg_thread_id
        }
        if (update == "") {
            Swal.fire({
                icon: 'error',
                title: 'กรุณากรอกข้อมูลอัพเดท',
                text: 'กรุณากรอกข้อมูลอัพเดท',
                customClass: {

                    popup: 'rounded-4'
                },
            })
        } else if (name == null || name == '') {
            Swal.fire({
                icon: 'error',
                title: 'กรุณาเลือกชื่อผู้กรอก',
                text: 'กรุณาเลือกชื่อผู้กรอก',
                customClass: {

                    popup: 'rounded-4'
                },
            })
        } else {
            let text = `UPDATE<br>${wo ? ('WO.' + wo) : ''}<br>รหัส ${code}<br>วันที่ ${update_data.date} น.<br><br>${update}<br><br>#${name}`
            update_data.text = text.replace(/<br>/g, '\n')
            update_data.tg_html = `<b>UPDATE</b>
<b>วันที่</b> ${update_data.date} น.

<b>รายละเอียด</b>
${update}

#${name}`
            Swal.fire({
                title: 'ตรวจสอบข้อมูล',
                html: text,
                showCancelButton: true,
                confirmButtonText: 'ยืนยัน',
                cancelButtonText: 'ยกเลิก',
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {

                    popup: 'rounded-4'
                },
            }).then(result => {
                if (result.isConfirmed) {
                    updateData(update_data);
                }
            })
        }
    })
    $('#summary-btn').click(function () {
        let url
        if (liff.getOS() == 'ios' && liff.getContext().type == 'external') {
           url = new URL('line://app/' + liff_id)
        }else{
              url = new URL('https://liff.line.me/' + liff_id)
        }
        url.searchParams.set('code', code)
        url.searchParams.set('jobid', jobid)
        url.searchParams.set('action', 'summary')
        window.open(url, '_self')
    })
    // listen on user finish typing on update field
    let typingTimer;
    let doneTypingInterval = 800;
    $('#update').on('input', function () {
        clearTimeout(typingTimer);
        if ($('#update').val()) {
            updateCount($('#update').val())
            typingTimer = setTimeout(doneTyping, doneTypingInterval);
        }
    });
}
$('#edit-request').click(() => {
    Swal.fire({
        input: 'text',
        inputLabel: 'request no.',
        inputPlaceholder: 'request no.',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        customClass: {

            popup: 'rounded-4'
        },
    }).then(result => {
        if (result.isConfirmed) {
            let url = new URL(window.location.href)
            url.searchParams.set('jobid', result.value)
            window.open(url, '_self')
        }
    })
})
function doneTyping() {
    console.log(jobid);
    let update = $("#update").val();
    localStorage.setItem('updateText' + jobid, update)
}
function updateCount(updateText) {
    $('#char-count').html(updateText.length + '/5000')
    if (updateText.length > 5000) $('#char-count').css('color', 'red')
    else $('#char-count').css('color', '#7777')
}
async function updateData(update_data) {
    Swal.fire({
        title: 'กำลังอัพเดทข้อมูล',
        html: 'รอสักครู่ กรุณาอย่าปิดหน้านี้',
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {

            popup: 'rounded-4'
        },
        didOpen: () => {
            Swal.showLoading()
        }
    })
    let doc_ref
    await firestore.collection('jobdata/').doc(update_data.jobid).collection('update').add({
        update: update_data.update,
        name: update_data.name,
        vendor_phone: update_data.vendor_phone,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        code: update_data.code,
    }).then(async (docRef) => {
        doc_ref = docRef
        console.log('update success');
    }).catch(err => {
        console.log(err);
    })
    // if (current_user.site == 'PYT3') {
    //     let tg_api = '7681265177:AAFVGgh5lAzXRRfiole5ywOlY-CoEIOjEz4'

    //     let tg_url = 'https://api.telegram.org/bot' + tg_api + '/sendMessage'
    //     let tg_data = {
    //         chat_id: chat_id,
    //         text: update_data.tg_html,
    //         message_thread_id: update_data.thread_id,
    //         parse_mode: 'HTML',
    //         reply_markup: JSON.stringify({
    //             inline_keyboard: [
    //                 [{ text: '🔊 อัพเดทงาน', url: 'https://liff.line.me/1661543046-a1pJexbX?jobid=' + update_data.jobid }]
    //             ]
    //         })
    //     }
    //     $.ajax({
    //         url: tg_url,
    //         method: 'POST',
    //         data: tg_data,
    //         success: (res) => {
    //             console.log(res)
    //         },
    //         error: (err) => {
    //             console.log(err)
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'ส่งข้อมูล telegram ไม่สำเร็จ',
    //                 html: 'ส่งข้อความนี้ให้ผู้พัฒนาเพื่อแก้ไขปัญหา<br>' + JSON.stringify(err),
    //             })
    //         }
    //     })
    // }

    let work_detail = await firestore.collection('jobdata/').doc(update_data.jobid).get().then(doc => doc.data())
    let detail = work_detail.detail
    localStorage.removeItem('updateText' + update_data.jobid)
    let flex = {
        "type": "bubble",
        "size": "giga",
        "body": {
            "type": "box",
            "spacing": "md",
            "layout": "vertical",
            "contents": [
                {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "image",
                                    "url": update_data.image,
                                    "aspectMode": "fit",
                                    "size": "full",
                                    "action": {
                                        "type": "uri",
                                        "label": "action",
                                        "uri": update_data.image
                                    }
                                }
                            ],
                            "width": "72px",
                            "height": "72px",
                            "cornerRadius": "md"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "Update",
                                            "weight": "bold",
                                            "flex": 3,
                                            "color": "#000000",
                                            "adjustMode": "shrink-to-fit",
                                            "scaling": true
                                        },
                                        {
                                            "type": "text",
                                            "text": update_data.wo,
                                            "flex": 5,
                                            "adjustMode": "shrink-to-fit",
                                            "scaling": true,
                                            "align": "end"
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "รหัส",
                                            "weight": "bold",
                                            "flex": 3,
                                            "color": "#000000",
                                            "adjustMode": "shrink-to-fit",
                                            "scaling": true
                                        },
                                        {
                                            "type": "text",
                                            "text": update_data.code == '' ? 'Component' : update_data.code,
                                            "flex": 5,
                                            "adjustMode": "shrink-to-fit",
                                            "scaling": true,
                                            "align": "end"
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": 'req no. ' + update_data.jobid + ' ' + update_data.date,
                                            "size": "sm",
                                            "color": "#bcbcbc",
                                            "adjustMode": "shrink-to-fit",
                                            "scaling": true,
                                            "align": "end"
                                        }
                                    ],
                                    "spacing": "sm"
                                },
                            ],
                            "justifyContent": "space-between"
                        }
                    ],
                    "spacing": "xl",
                    "paddingAll": "20px"
                },
                {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": 'lg',
                    "flex": 10,
                    "contents": [
                        {
                            "type": "text",
                            "text": update_data.update,
                            "wrap": true,
                            "scaling": true,
                        }
                    ],
                    "paddingAll": "lg",
                    "borderColor": "#bcbcbc",
                    "borderWidth": "light",
                    "cornerRadius": "md",
                    "backgroundColor": "#f4f6f9"
                },
                {
                    "type": "box",
                    "layout": "horizontal",
                    "spacing": "md",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "ดูสรุปงาน 👆",
                                "uri": "https://liff.line.me/1661543046-a1pJexbX?action=summary&jobid=" + update_data.jobid
                            },
                            "style": "primary",
                            "height": "sm",
                            "scaling": true,
                            "adjustMode": "shrink-to-fit",
                            "flex": 4
                        },
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "อัพเดท 📋",
                                "uri": "https://liff.line.me/1661543046-a1pJexbX?jobid=" + update_data.jobid
                            },
                            "style": "primary",
                            "height": "sm",
                            "scaling": true,
                            "adjustMode": "shrink-to-fit",
                            "flex": 4
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "image",
                                    "url": "https://img.icons8.com/fluency-systems-filled/48/share-3.png",
                                    "size": "xxs",
                                    "aspectMode": "fit"
                                }
                            ],
                            "width": "20px",
                            "justifyContent": "center",
                            "alignItems": "center",
                            "action": {
                                "type": "uri",
                                "label": "action",
                                "uri": "https://liff.line.me/1661543046-a1pJexbX?action=shared&jobid=" + update_data.jobid
                            }
                        }
                    ],
                    "paddingAll": "lg",
                    "paddingEnd": "xs",
                    "paddingStart": "xs"
                },
                {
                    "type": "separator"
                }
            ],
            "paddingTop": "none",
            "paddingBottom": "none",
            "paddingStart": "md",
            "paddingEnd": "md"
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                        {
                            "type": "text",
                            "text": update_data.name,
                            "size": "xs",
                            "color": "#bcbcbc",
                            "align": "start",
                            "scaling": true,
                            "adjustMode": "shrink-to-fit"
                        },
                        {
                            "type": "box",
                            "layout": "horizontal",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "copy",
                                    "size": "xs",
                                    "flex": 5,
                                    "align": "end",
                                    "color": "#bcbcbc",
                                },
                                {
                                    "type": "image",
                                    "url": "https://img.icons8.com/fluency-systems-regular/48/copy--v1.png",
                                    "size": "20px",
                                    "flex": 1
                                }
                            ],
                            "justifyContent": "flex-end",
                            "action": {
                                "type": "uri",
                                "label": "copy",
                                "uri": "https://liff.line.me/1661543046-YWbxeK8Q?doc_path=" + doc_ref.path
                            }
                        }
                    ],
                    "spacing": "sm",
                    "justifyContent": "space-between",
                    "alignItems": "center"
                }
            ]
        }
    }
    if (!detail || detail == '') detail = '-'
    if (detail && detail != '') {
        flex.body.contents.splice(1, 0, {
            "type": "box",
            "layout": "vertical",
            "flex": 10,
            "spacing": "md",
            "contents": [
                {
                    "type": "text",
                    "text": "อาการเสีย",
                    "wrap": true,
                    "scaling": true,
                    "color": "#777777",
                    "size": "xs"
                },
                {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": detail,
                            "color": "#052c65",
                            "wrap": true,
                            "scaling": true,
                            "maxLines": 3
                        }
                    ],
                    "spacing": "xl"
                }
            ],
            "paddingAll": "lg",
            "borderColor": "#9ec5fe",
            "borderWidth": "normal",
            "cornerRadius": "md",
            "backgroundColor": "#cfe2ff"
        })
    }
    // if (update_data.update.length <= 995) {
    //     flex.footer.contents[0].contents[1].actions = [{
    //         "type": "clipboard",
    //         "label": "copy",
    //         "clipboardText": update_data.update
    //     }]
    // } else {
    //     flex.footer.contents[0].contents[1].action = {
    //         "type": "uri",
    //         "label": "copy",
    //         "uri": "https://liff.line.me/1661543046-YWbxeK8Q?doc_path=" + doc_ref.path
    //     }
    // }
    if (update_data.vendor_phone && update_data && update_data.vendor_phone.replace(/\s/g, '') != '') {
        flex.body.contents[2].contents.push({
            "type": "text",
            "text": "📞ติดต่อ " + update_data.vendor_phone,
            "action": {
                "type": "uri",
                "label": "ติดต่อ " + update_data.vendor_phone,
                "uri": "tel:" + update_data.vendor_phone.replace(/-/g, '').replace(/ /g, '')
            },
            "contents": [
                {
                    "type": "span",
                    "text": "📞ติดต่อ"
                },
                {
                    "type": "span",
                    "text": " " + update_data.vendor_phone,
                    "color": "#006aff",
                    "decoration": "underline"
                }
            ],
            "scaling": true,
            "wrap": true
        })
    }
    firestore.collection('jobdata/').doc(update_data.jobid).collection('update').get().then(async data => {
        data = data.docs.map(doc => doc.data()).sort((a, b) => b.timestamp - a.timestamp)
        let carousel = {
            type: 'carousel',
            contents: [flex]
        }
        let hasMoreThan10 = data.length - 1 > 10
        if (data.length > 1) {
            data = data.slice(1, 11)
            data.forEach(r => {
                r.timestamp = moment(r.timestamp.toDate()).format('DD/MM/YYYY HH:mm (dddd)')
                let his_flex = {
                    "type": "bubble",
                    "size": "giga",
                    "header": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "text": "📅 " + r.timestamp,
                                "weight": "bold",
                                "color": "#ffffff"
                            },
                            {
                                "type": "text",
                                "text": "# " + r.name,
                                "color": "#ffffff",
                                "size": "sm"
                            }
                        ]
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "lg",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": r.update,
                                        "wrap": true,
                                        "scaling": true
                                    }
                                ],
                                "paddingAll": "lg",
                                "borderColor": "#bcbcbc",
                                "borderWidth": "light",
                                "cornerRadius": "md",
                                "backgroundColor": "#f4f6f9",
                                "flex": 10,
                            }
                        ]
                    },
                    "styles": {
                        "header": {
                            "backgroundColor": "#0367d3"
                        }
                    }
                }
                console.log(r)
                if (r.vendor_phone && r.vendor_phone != '' && r.vendor_phone.replace(/\s/g, '') != '') {
                    his_flex.body.contents[0].contents.push({
                        "type": "text",
                        "text": "📞ติดต่อ " + r.vendor_phone,
                        "action": {
                            "type": "uri",
                            "label": "ติดต่อ " + r.vendor_phone,
                            "uri": "tel:" + r.vendor_phone.replace(/-/g, '').replace(/ /g, '')
                        },
                        "contents": [
                            {
                                "type": "span",
                                "text": "📞ติดต่อ"
                            },
                            {
                                "type": "span",
                                "text": " " + r.vendor_phone,
                                "color": "#006aff",
                                "decoration": "underline"
                            }
                        ],
                        "scaling": true,
                        "wrap": true
                    })
                }
                carousel.contents.push(his_flex)
            })
        }
        if (hasMoreThan10) {
            let all_flex = {
                "type": "bubble",
                "size": "giga",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "uri",
                                "label": "ดูอัพเดททั้งหมด",
                                "uri": "https://liff.line.me/1661543046-a1pJexbX?action=summary&jobid=" + update_data.jobid
                            },
                            "style": "link"
                        }
                    ],
                    "spacing": "sm",
                    "paddingAll": "13px",
                    "justifyContent": "center",
                    "alignItems": "center"
                }
            }
            carousel.contents.push(all_flex)
        }
        let messages = [
            {
                type: 'flex',
                altText: 'Update ' + update_data.code + ' ' + update_data.jobid + ' ' + update_data.wo,
                contents: carousel
            }
        ]
        console.log(messages);
        if (!work_detail.has_sent_init_msg && liff.getContext().type != 'group') {
            Object.keys(work_detail).forEach(key => {
                if (!work_detail[key] && work_detail[key] == '') work_detail[key] = '-'
            })
            // {
            //     "code": "PYT3_06068",
            //     "workorder": "1349079",
            //     "timestamp": {
            //         "seconds": 1743045590,
            //         "nanoseconds": 512000000
            //     },
            //     "status": "Return equipment back",
            //     "signature": "https://nsmart.nhealth-asia.com/MTDPDB01/files/sign_images/67e4c3d51f87b.png",
            //     "detail": "CARBON DIOXIDE ด้านซ้ายหมด",
            //     "image": "https://nsmart.nhealth-asia.com/MTDPDB01/img.php?files=202309211730580.TRI-TECH%20MEDICAL-GENESYS%20MANIFOLD%20SYSTEM.jpg",
            //     "site": "PYT3",
            //     "message_id": 185,
            //     "need_sent_signature": false,
            //     "thread_id": 9635,
            //     "reciever": "SERMKEAT HADJANG",
            //     "job_no": "1331416"
            // }
            let init_msg = {
                "type": "carousel",
                "contents": [
                    {
                        "type": "bubble",
                        "size": "giga",
                        "header": {
                            "type": "box",
                            "layout": "vertical",
                            "backgroundColor": "#DCE8F4",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "⚠️ งานแจ้งซ่อม ⚠️",
                                    "weight": "bold",
                                    "align": "center",
                                    "gravity": "center",
                                    "scaling": true,
                                    "size": "lg",
                                    "color": "#333333"
                                }
                            ]
                        },
                        "hero": {
                            "type": "image",
                            "url": work_detail.image && work_detail.image != null && work_detail.image != '' ? work_detail.image : $('#image').attr('src'),
                            "size": "3xl",
                            "action": {
                                "type": "uri",
                                "label": "action",
                                "uri": work_detail.image && work_detail.image != null && work_detail.image != '' ? work_detail.image : $('#image').attr('src'),
                            }
                        },
                        "body": {
                            "type": "box",
                            "spacing": "md",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "เครื่อง",
                                                            "flex": 3,
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true,
                                                            "color": "#aaaaaa"
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": work_detail.ename || '-',
                                                            "scaling": true,
                                                            "align": "start",
                                                            "color": "#666666",
                                                            "wrap": true
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "horizontal",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "รหัส",
                                                            "flex": 3,
                                                            "color": "#aaaaaa",
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": work_detail.code || '-',
                                                            "flex": 5,
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true,
                                                            "align": "end",
                                                            "color": "#666666"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "horizontal",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "แผนก(เครื่อง)",
                                                            "flex": 3,
                                                            "color": "#aaaaaa",
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": work_detail.dept || '-',
                                                            "flex": 5,
                                                            "scaling": true,
                                                            "align": "end",
                                                            "color": "#666666",
                                                            "wrap": true
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "horizontal",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "แผนก(ผู้แจ้ง)",
                                                            "flex": 3,
                                                            "color": "#aaaaaa",
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": (work_detail.sender || '-') + (work_detail.coop || ''),
                                                            "flex": 5,
                                                            "scaling": true,
                                                            "align": "end",
                                                            "color": "#666666",
                                                            "wrap": true
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "box",
                                                    "layout": "horizontal",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "ผู้แจ้ง",
                                                            "flex": 3,
                                                            "color": "#aaaaaa",
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": work_detail.sender || '-',
                                                            "flex": 5,
                                                            "adjustMode": "shrink-to-fit",
                                                            "scaling": true,
                                                            "align": "end",
                                                            "color": "#666666",
                                                            "wrap": true
                                                        }
                                                    ]
                                                }
                                            ],
                                            "justifyContent": "space-between",
                                            "spacing": "md"
                                        }
                                    ],
                                    "paddingAll": "5px",
                                    "spacing": "md"
                                }
                            ],
                            "paddingTop": "none",
                            "paddingBottom": "none",
                            "paddingStart": "md",
                            "paddingEnd": "md"
                        },
                        "footer": {
                            "type": "box",
                            "layout": "baseline",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": work_detail.date || '-',
                                    "size": "xs",
                                    "color": "#bcbcbc",
                                    "adjustMode": "shrink-to-fit",
                                    "scaling": true,
                                    "align": "center"
                                }
                            ],
                            "spacing": "sm"
                        }
                    },
                    {
                        "type": "bubble",
                        "size": "giga",
                        "header": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "รายละเอียดอาการเสีย",
                                    "color": "#ffffff",
                                    "size": "lg",
                                    "align": "center"
                                }
                            ]
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "lg",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": work_detail.detail,
                                            "wrap": true,
                                            "scaling": true
                                        }
                                    ],
                                    "paddingAll": "lg",
                                    "borderColor": "#bcbcbc",
                                    "borderWidth": "light",
                                    "cornerRadius": "md",
                                    "backgroundColor": "#f4f6f9",
                                    "flex": 10
                                }
                            ]
                        },
                        "styles": {
                            "header": {
                                "backgroundColor": "#0367d3"
                            }
                        }
                    }
                ]
            }
            messages.unshift({
                type: 'flex',
                altText: 'Job ' + work_detail.code + ' ' + work_detail.job_no + ' ' + work_detail.workorder,
                contents: init_msg
            })
        }
        let method = 'sendMessages'

        if (liff.getContext().type != 'group' && liff.getContext().type != 'utou') {
            method = 'shareTargetPicker'
            // let { value: confirm } = await Swal.fire({
            //     iconHtml: '<i class="bi bi-line text-success"></i>',
            //     title: 'กรุณาเลือกกลุ่มไลน์เพื่อแชร์อัพเดท',
            //     confirmButtonText: `ตกลง`,
            //     allowOutsideClick: false,
            //     customClass: {
            //         popup: 'rounded-4',
            //         icon: 'border-0'
            //     },
            // })
            // if (confirm) {
            // }
            Swal.fire({
                iconHtml: '<i class="bi bi-line text-success"></i>',
                title: 'กำลังดึงรายชื่อกลุ่มไลน์',
                text: 'กำลังส่งข้อความ',
                didOpen: () => {
                    Swal.showLoading()
                },
                customClass: {
                    popup: 'rounded-4',
                    icon: 'border-0'
                },
                allowOutsideClick: false,
            })
        }
        const send_to_group = function (a, b) {
            liff[a](b).then((res) => {
                if (method == 'sendMessages' || (method == 'shareTargetPicker' && res)) {
                    firestore.collection('jobdata/').doc(update_data.jobid).set({
                        has_sent_init_msg: true
                    }, { merge: true })
                    Swal.fire({
                        icon: 'success',
                        title: 'อัพเดทสำเร็จ',
                        text: 'อัพเดทสำเร็จ',
                        customClass: {

                            popup: 'rounded-4'
                        },
                        timer: 1500,
                    }).then(() => {
                        // if (liff.getDecodedIDToken().sub == 'U798fc2c46a2efd7013b12eac4dac408a') return
                        liff.closeWindow();
                    })
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'เลือกกลุ่มไลน์เพื่อแชร์อัพเดท',
                        text: 'กรุณาลองใหม่อีกครั้ง',
                        customClass: {
                            popup: 'rounded-4'
                        },
                        confirmButtonText: 'เลือกกลุ่ม',
                        showCancelButton: true,
                        cancelButtonText: 'ยกเลิก การอัพเดท',
                    }).then((res) => {
                        if (res.isConfirmed) {
                            send_to_group(a, b)
                        }
                    })
                }
            }).catch(err => {
                console.log(err);
                Swal.fire({
                    icon: 'error',
                    title: 'มีข้อผิดพลาด',
                    html: 'มีข้อผิดพลาด<br>' + JSON.stringify(err) + '<br><small class="text-muted">โปรดส่งข้อความนี้ให้ผู้พัฒนา</small><br><br>' + JSON.stringify(carousel),
                    confirmButtonText: "ตกลง",
                    customClass: {

                        popup: 'rounded-4'
                    },
                    //showConfirmButton: false,
                })
            })
        }
        send_to_group(method, messages)
    })
}
$('.user-select-all').click(function () {
    // copy to clipboard
    var $temp = $("<textarea>");
    var brRegex = /<br\s*[\/]?>/gi;
    $("body").append($temp);
    $temp.val($(this).html().replace(brRegex, "\r\n")).select();
    document.execCommand("copy");
    $temp.remove();
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000
    })
    Toast.fire({
        icon: 'success',
        title: 'คัดลอกสำเร็จ'
    })
})

async function getUID() {
    return await new Promise(async resolve => {
        if (liff.getDecodedIDToken()) {
            resolve(liff.getDecodedIDToken().sub)
        } else {
            await liff.getProfile().then(profile => {
                resolve(profile.userId)
            }).catch(err => {
                console.log(err)
                Swal.fire({
                    icon: 'error',
                    title: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้',
                    text: 'กรุณาลองใหม่อีกครั้ง',
                    confirmButtonText: 'ตกลง',
                    customClass: {

                        popup: 'rounded-4'
                    },
                })
            })
        }
    })
}

var firestore, auth
async function getAuth(uid = 'test') {
    let email = uid + '@jobdata.com'
    let password = 'jobdata'
    await auth.signInWithEmailAndPassword(email, password).then(function (user) {
        console.log("🚀 !! user:", user)
        console.log('sign in successful')
    }).catch(async function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var credential = error.credential;
        console.log(errorCode)
        console.log(errorMessage)
        console.log(credential)
        await auth.createUserWithEmailAndPassword(email, password).then(function (user) {
            console.log('sign up successful')
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
            console.log(errorCode)
            console.log(errorMessage)
            console.log(email)
            console.log(credential)
        });
    });
}
let publicKey;
function generateRandomBuffer(length) {
    const buffer = new Uint8Array(length);
    window.crypto.getRandomValues(buffer);
    return buffer;
}
async function register(name) {
    try {
        firestore.collection('user').doc(liff.getDecodedIDToken().sub).set({
            name: name,
            isAuthen: true
        }, { merge: true }).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'ยืนยันตัวตนสำเร็จ',
                text: 'คุณสามารถรับงานได้แล้ว',
                confirmButtonText: 'รับงาน',
                customClass: {

                    popup: 'rounded-4'
                },
                allowOutsideClick: false,
            }).then(async res => {
                if (res.isConfirmed) {
                    await receivejob()
                }
            })
        });
    } catch (err) {
        console.error('Error during registration:', err);
        alert('Registration failed.');
    }
}
async function receivejob() {
    const toast = Swal.mixin({
        toast: true,
        iconHtml: '<image src="https://img5.pic.in.th/file/secure-sv1/icons8-loading-infinity.gif" style="width: 50px; height: 50px;margin-start: 5px"/>',
        customClass: {
            icon: 'border-0'
        },
        position: 'top',
        showConfirmButton: false,
        timer: 60000,
        timerProgressBar: true,
    })
    $('#submit').prop('disabled', true)
    try {
        // Swal.fire({
        //     iconHtml: '<image src="https://img5.pic.in.th/file/secure-sv1/icons8-loading-infinity.gif" style="width: 100px; height: 100px;"/>',
        //     customClass: {
        //         icon: 'border-0'
        //     },
        //     title: 'กำลังรับงานในระบบ',
        //     html: 'รอสักครู่ กรุณาอย่าปิดหน้านี้',
        //     allowOutsideClick: false,
        //     showConfirmButton: false,
        // })
        toast.fire({
            title: 'กำลังรับงานในระบบ',
        })
        let endpoint = scriptUrl + '?mode=receivejob'
        console.log("🚀 !! endpoint:", endpoint);
        $.getJSON(endpoint, {
            name: encodeURIComponent(current_user.name.toUpperCase()),
            jobid: jobid,
            detail: encodeURIComponent(job_detail)
        }, function (res) {
            $('#submit').prop('disabled', false)
            console.log("🚀 !! res:", res)
            if (res.status == 'ok') {
                Swal.fire({
                    icon: 'success',
                    title: 'รับงานสำเร็จ',
                    html: 'รับงานสำเร็จ<br>รับงานโดย:<br> ' + current_user.name.toUpperCase(),
                    confirmButtonText: 'ตกลง',
                    customClass: {

                        popup: 'rounded-4'
                    },
                    timer: 2000,
                })
                if (res.status_text == 'success') {
                    firestore.collection('jobdata/').doc(jobid).set({
                        reciever: current_user.name.toUpperCase(),
                        workorder: res.wo
                    }, { merge: true }).then(() => {
                        initialData()
                    })
                }
                else if (res.status_text == 'already received') {
                    // listen for data change on firebase
                    firestore.collection('jobdata/').doc(jobid).onSnapshot(doc => {
                        let data = doc.data()
                        if (data.reciever == current_user.name.toUpperCase()) {
                            $('#reciever').html("&nbsp;รับงานโดย:<br> " + current_user.name.toUpperCase())
                            $('#workorder').html('WO.' + data.wo).parents('.col-12').removeClass('d-none')
                            return
                        }
                    })
                }
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'รับงานไม่สำเร็จ',
                    html: 'รับงานไม่สำเร็จ<br>' + res.status_text,
                    customClass: {

                        popup: 'rounded-4'
                    },
                    confirmButtonText: 'ตกลง',
                    allowOutsideClick: false,
                })
            }
        })
    } catch (err) {
        Swal.fire({
            icon: 'error',
            text: err,
            customClass: {

                popup: 'rounded-4'
            },
            showConfirmButton: false,
            allowOutsideClick: false
        })
    }
}
jQuery(document).ready(function ($) {

    var topics = {};
    $.publish = function (topic, args) {
        if (topics[topic]) {
            var currentTopic = topics[topic],
                args = args || {};

            for (var i = 0, j = currentTopic.length; i < j; i++) {
                currentTopic[i].call($, args);
            }
        }
    };
    $.subscribe = function (topic, callback) {
        if (!topics[topic]) {
            topics[topic] = [];
        }
        topics[topic].push(callback);
        return {
            "topic": topic,
            "callback": callback
        };
    };
    $.unsubscribe = function (handle) {
        var topic = handle.topic;
        if (topics[topic]) {
            var currentTopic = topics[topic];

            for (var i = 0, j = currentTopic.length; i < j; i++) {
                if (currentTopic[i] === handle.callback) {
                    currentTopic.splice(i, 1);
                }
            }
        }
    };

    // This is the part where jSignature is initialized.
    var $sigdiv = $("#signature").jSignature({ 'UndoButton': true })

        // All the code below is just code driving the demo. 
        , $tools = $('#tools')
        , $extraarea = $('#displayarea')
        , pubsubprefix = 'jSignature.demo.'

    var export_plugins = $sigdiv.jSignature('listPlugins', 'export')
        , chops = ['']
        , name
    for (var i in export_plugins) {
        if (export_plugins.hasOwnProperty(i)) {
            name = export_plugins[i]
            chops.push('')
        }
    }
    chops.push('')

    $(chops.join('')).bind('change', function (e) {

        var data = $sigdiv.jSignature('getData', e.target.value)
        $.publish(pubsubprefix + 'formatchanged')
        alert(data)

        window.document.save_image.test02.value = data
        $.publish(pubsubprefix + data[0], data);


    }).appendTo($tools)

    $('<div class="col-6"><button type="button" value="Submit" class="btn btn-sm mt-4 shadow shadow-sm w-100" style="background-color: #00C000; min-width:50px; color:#fff"><i class="bi bi-check-lg"></i> บันทึก</button></div>').bind('click', async function (e) {

        var data = $sigdiv.jSignature('getData', 'image')
        let dataUrl = data[0] + ',' + data[1]

        // confirm signature
        Swal.fire({
            title: 'ยืนยันลายเซ็น',
            text: 'ยืนยันลายเซ็นของคุณ',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            validationMessage: 'กรุณายืนยันลายเซ็น',
            customClass: {

                popup: 'rounded-4'
            },
        }).then(result => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'กำลังบันทึกลายเซ็น',
                    html: 'รอสักครู่ กรุณาอย่าปิดหน้านี้',
                    customClass: {

                        popup: 'rounded-4'
                    },
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                })
                $.ajax({
                    url: scriptUrl,
                    type: 'POST',
                    data: {
                        mode: 'signature',
                        jobid: $('#workorder').html().replace('WO.', ''),
                        data: encodeURIComponent(dataUrl)
                    },
                    success: async function (res) {
                        console.log(res)
                        if (res.status == 'success') {
                            await firestore.collection('jobdata/').doc($('#request-no').val()).set({
                                signature: res.url,
                                need_sent_signature: true
                            }, { merge: true })
                            Swal.fire({
                                icon: 'success',
                                title: 'บันทึกลายเซ็นสำเร็จ',
                                text: 'บันทึกลายเซ็นสำเร็จ',
                                customClass: {

                                    popup: 'rounded-4'
                                },
                                timer: 1500,
                            })
                            $('#open-sign')
                                .find('.text-primary')
                                .removeClass('text-primary fs-5 fw-bold')
                                .addClass('text-danger')
                                .html('<i class="bi bi-arrow-counterclockwise"></i>&nbsp;แก้ไขลายเซ็น')

                            $('#user-sign').attr('src', 'data:' + dataUrl).parent().removeClass('d-none')
                            $('#signature').jSignature('reset')
                            // close modal
                            $('#signatureModal').modal('hide')
                        }
                        else {
                            Swal.fire({
                                icon: 'error',
                                title: 'บันทึกลายเซ็นไม่สำเร็จ',
                                html: 'บันทึกลายเซ็นไม่สำเร็จ<br>' + res.status_text,
                                customClass: {

                                    popup: 'rounded-4'
                                },
                                confirmButtonText: 'ตกลง',
                                allowOutsideClick: false,
                            })
                        }
                    },
                    error: function (err) {
                        console.log(err)
                        Swal.fire({
                            icon: 'error',
                            title: 'บันทึกลายเซ็นไม่สำเร็จ',
                            html: 'บันทึกลายเซ็นไม่สำเร็จ<br>' + JSON.stringify(err),
                            customClass: {

                                popup: 'rounded-4'
                            },
                            confirmButtonText: 'ตกลง',
                            allowOutsideClick: false,
                        })
                    }
                })
            }
        })

        // $.getJSON(scriptUrl + '?mode=signature&jobid=' + $('#workorder').html().replace('WO.', '') + '&data=' + encodeURIComponent(dataUrl), function (res) {
        //     console.log(res)
        //     if (res.status == 'success') {
        //         Swal.fire({
        //             icon: 'success',
        //             title: 'บันทึกลายเซ็นสำเร็จ',
        //             text: 'บันทึกลายเซ็นสำเร็จ',
        //             timer: 1500,
        //         })
        //         $('#open-sign').parent().addClass('d-none')
        //         $('#user-sign').attr('src', 'data:' + dataUrl).parent().removeClass('d-none')
        //         $('#signature').jSignature('reset')
        //         // close modal
        //         $('#signatureModal').modal('hide')
        //     }
        //     else {
        //         Swal.fire({
        //             icon: 'error',
        //             title: 'บันทึกลายเซ็นไม่สำเร็จ',
        //             html: 'บันทึกลายเซ็นไม่สำเร็จ<br>' + res.status_text,
        //             confirmButtonText: 'ตกลง',
        //             allowOutsideClick: false,
        //         })
        //     }
        // })

    }).appendTo($tools)
    $('<div class="col-6"><button type="button" value="" class="btn bg-info-subtle btn-sm mt-4 shadow shadow-sm w-100" style="min-width:50px;"><i class="bi bi-trash3-fill"></i> ล้างทั้งหมด</button></div>').bind('click', function (e) {
        $sigdiv.jSignature('reset')
    }).appendTo($tools)

    $('<div></div>').appendTo($tools)

    $.subscribe(pubsubprefix + 'formatchanged', function () {
        $extraarea.html('')
    })

    $.subscribe(pubsubprefix + 'image/svg+xml', function (data) {

        try {
            var i = new Image()
            i.src = 'data:' + data[0] + ';base64,' + btoa(data[1])
            test02 = 'data:' + data[0] + ';base64,' + btoa(data[1])
            $(i).appendTo($extraarea)
        } catch (ex) {

        }

        var message = [
            "If you don't see an image immediately above, it means your browser is unable to display in-line (data-url-formatted) SVG."
            , "This is NOT an issue with jSignature, as we can export proper SVG document regardless of browser's ability to display it."
            , "Try this page in a modern browser to see the SVG on the page, or export data as plain SVG, save to disk as text file and view in any SVG-capabale viewer."
        ]
        $("<div>" + message.join("<br/>") + "</div>").appendTo($extraarea)
    });

    $.subscribe(pubsubprefix + 'image/svg+xml;base64', function (data) {
        var i = new Image()
        i.src = 'data:' + data[0] + ',' + data[1]
        $sss = 'data:' + data[0] + ',' + data[1]
        $(i).appendTo($extraarea)

        var message = [
            "If you don't see an image immediately above, it means your browser is unable to display in-line (data-url-formatted) SVG."
            , "This is NOT an issue with jSignature, as we can export proper SVG document regardless of browser's ability to display it."
            , "Try this page in a modern browser to see the SVG on the page, or export data as plain SVG, save to disk as text file and view in any SVG-capabale viewer."
        ]
        $("<div>" + message.join("<br/>") + "</div>").appendTo($extraarea)
    });

    $.subscribe(pubsubprefix + 'image/png;base64', function (data) {
        var i = new Image()
        i.src = 'data:' + data[0] + ',' + data[1]
        $sss = 'data:' + data[0] + ',' + data[1]
        $('<span><b></b></span>').appendTo($extraarea)
        $(i).appendTo($extraarea)
    });

    $.subscribe(pubsubprefix + 'image/jsignature;base30', function (data) {
        $('<span><b>This is a vector format not natively render-able by browsers. Format is a compressed "movement coordinates arrays" structure tuned for use server-side. The bonus of this format is its tiny storage footprint and ease of deriving rendering instructions in programmatic, iterative manner.</b></span>').appendTo($extraarea)
    });

    if (Modernizr.touch) {
        $('#scrollgrabber').height($('#content').height())
    }
})

    /** @preserve 
    jSignature v2 "${buildDate}" "${commitID}"
    Copyright (c) 2012 Willow Systems Corp http://willow-systems.com
    Copyright (c) 2010 Brinley Ang http://www.unbolt.net
    MIT License <http://www.opensource.org/licenses/mit-license.php> 
    
    */
    ; (function () {

        var apinamespace = 'jSignature'

        /**
        Allows one to delay certain eventual action by setting up a timer for it and allowing one to delay it
        by "kick"ing it. Sorta like "kick the can down the road"
        
        @public
        @class
        @param
        @returns {Type}
        */
        var KickTimerClass = function (time, callback) {
            var timer
            this.kick = function () {
                clearTimeout(timer)
                timer = setTimeout(
                    callback
                    , time
                )
            }
            this.clear = function () {
                clearTimeout(timer)
            }
            return this
        }

        var PubSubClass = function (context) {
            'use strict'
            /*  @preserve 
            -----------------------------------------------------------------------------------------------
            JavaScript PubSub library
            2012 (c) Willow Systems Corp (www.willow-systems.com)
            based on Peter Higgins (dante@dojotoolkit.org)
            Loosely based on Dojo publish/subscribe API, limited in scope. Rewritten blindly.
            Original is (c) Dojo Foundation 2004-2010. Released under either AFL or new BSD, see:
            http://dojofoundation.org/license for more information.
            -----------------------------------------------------------------------------------------------
            */
            this.topics = {}
            // here we choose what will be "this" for the called events.
            // if context is defined, it's context. Else, 'this' is this instance of PubSub
            this.context = context ? context : this
            /**
             * Allows caller to emit an event and pass arguments to event listeners.
             * @public
             * @function
             * @param topic {String} Name of the channel on which to voice this event
             * @param **arguments Any number of arguments you want to pass to the listeners of this event.
             */
            this.publish = function (topic, arg1, arg2, etc) {
                'use strict'
                if (this.topics[topic]) {
                    var currentTopic = this.topics[topic]
                        , args = Array.prototype.slice.call(arguments, 1)
                        , toremove = []
                        , fn
                        , i, l
                        , pair

                    for (i = 0, l = currentTopic.length; i < l; i++) {
                        pair = currentTopic[i] // this is a [function, once_flag] array
                        fn = pair[0]
                        if (pair[1] /* 'run once' flag set */) {
                            pair[0] = function () { }
                            toremove.push(i)
                        }
                        fn.apply(this.context, args)
                    }
                    for (i = 0, l = toremove.length; i < l; i++) {
                        currentTopic.splice(toremove[i], 1)
                    }
                }
            }
            /**
             * Allows listener code to subscribe to channel and be called when data is available 
             * @public
             * @function
             * @param topic {String} Name of the channel on which to voice this event
             * @param callback {Function} Executable (function pointer) that will be ran when event is voiced on this channel.
             * @param once {Boolean} (optional. False by default) Flag indicating if the function is to be triggered only once.
             * @returns {Object} A token object that cen be used for unsubscribing.  
             */
            this.subscribe = function (topic, callback, once) {
                'use strict'
                if (!this.topics[topic]) {
                    this.topics[topic] = [[callback, once]];
                } else {
                    this.topics[topic].push([callback, once]);
                }
                return {
                    "topic": topic,
                    "callback": callback
                };
            };
            /**
             * Allows listener code to unsubscribe from a channel 
             * @public
             * @function
             * @param token {Object} A token object that was returned by `subscribe` method 
             */
            this.unsubscribe = function (token) {
                if (this.topics[token.topic]) {
                    var currentTopic = this.topics[token.topic]

                    for (var i = 0, l = currentTopic.length; i < l; i++) {
                        if (currentTopic[i][0] === token.callback) {
                            currentTopic.splice(i, 1)
                        }
                    }
                }
            }
        }

        /// Returns front, back and "decor" colors derived from element (as jQuery obj)
        function getColors($e) {
            var tmp
                , undef
                , frontcolor = $e.css('color')
                , backcolor
                , e = $e[0]

            var toOfDOM = false
            while (e && !backcolor && !toOfDOM) {
                try {
                    tmp = $(e).css('background-color')
                } catch (ex) {
                    tmp = 'transparent'
                }
                if (tmp !== 'transparent' && tmp !== 'rgba(0, 0, 0, 0)') {
                    backcolor = tmp
                }
                toOfDOM = e.body
                e = e.parentNode
            }

            var rgbaregex = /rgb[a]*\((\d+),\s*(\d+),\s*(\d+)/ // modern browsers
                , hexregex = /#([AaBbCcDdEeFf\d]{2})([AaBbCcDdEeFf\d]{2})([AaBbCcDdEeFf\d]{2})/ // IE 8 and less.
                , frontcolorcomponents

            // Decomposing Front color into R, G, B ints
            tmp = undef
            tmp = frontcolor.match(rgbaregex)
            if (tmp) {
                frontcolorcomponents = { 'r': parseInt(tmp[1], 10), 'g': parseInt(tmp[2], 10), 'b': parseInt(tmp[3], 10) }
            } else {
                tmp = frontcolor.match(hexregex)
                if (tmp) {
                    frontcolorcomponents = { 'r': parseInt(tmp[1], 16), 'g': parseInt(tmp[2], 16), 'b': parseInt(tmp[3], 16) }
                }
            }
            //		if(!frontcolorcomponents){
            //			frontcolorcomponents = {'r':255,'g':255,'b':255}
            //		}

            var backcolorcomponents
            // Decomposing back color into R, G, B ints
            if (!backcolor) {
                // HIghly unlikely since this means that no background styling was applied to any element from here to top of dom.
                // we'll pick up back color from front color
                if (frontcolorcomponents) {
                    if (Math.max.apply(null, [frontcolorcomponents.r, frontcolorcomponents.g, frontcolorcomponents.b]) > 127) {
                        backcolorcomponents = { 'r': 0, 'g': 0, 'b': 0 }
                    } else {
                        backcolorcomponents = { 'r': 255, 'g': 255, 'b': 255 }
                    }
                } else {
                    // arg!!! front color is in format we don't understand (hsl, named colors)
                    // Let's just go with white background.
                    backcolorcomponents = { 'r': 255, 'g': 255, 'b': 255 }
                }
            } else {
                tmp = undef
                tmp = backcolor.match(rgbaregex)
                if (tmp) {
                    backcolorcomponents = { 'r': parseInt(tmp[1], 10), 'g': parseInt(tmp[2], 10), 'b': parseInt(tmp[3], 10) }
                } else {
                    tmp = backcolor.match(hexregex)
                    if (tmp) {
                        backcolorcomponents = { 'r': parseInt(tmp[1], 16), 'g': parseInt(tmp[2], 16), 'b': parseInt(tmp[3], 16) }
                    }
                }
                //			if(!backcolorcomponents){
                //				backcolorcomponents = {'r':0,'g':0,'b':0}
                //			}
            }

            // Deriving Decor color
            // THis is LAZY!!!! Better way would be to use HSL and adjust luminocity. However, that could be an overkill. 

            var toRGBfn = function (o) { return 'rgb(' + [o.r, o.g, o.b].join(', ') + ')' }
                , decorcolorcomponents
                , frontcolorbrightness
                , adjusted

            if (frontcolorcomponents && backcolorcomponents) {
                var backcolorbrightness = Math.max.apply(null, [frontcolorcomponents.r, frontcolorcomponents.g, frontcolorcomponents.b])

                frontcolorbrightness = Math.max.apply(null, [backcolorcomponents.r, backcolorcomponents.g, backcolorcomponents.b])
                adjusted = Math.round(frontcolorbrightness + (-1 * (frontcolorbrightness - backcolorbrightness) * 0.75)) // "dimming" the difference between pen and back.
                decorcolorcomponents = { 'r': adjusted, 'g': adjusted, 'b': adjusted } // always shade of gray
            } else if (frontcolorcomponents) {
                frontcolorbrightness = Math.max.apply(null, [frontcolorcomponents.r, frontcolorcomponents.g, frontcolorcomponents.b])
                var polarity = +1
                if (frontcolorbrightness > 127) {
                    polarity = -1
                }
                // shifting by 25% (64 points on RGB scale)
                adjusted = Math.round(frontcolorbrightness + (polarity * 96)) // "dimming" the pen's color by 75% to get decor color.
                decorcolorcomponents = { 'r': adjusted, 'g': adjusted, 'b': adjusted } // always shade of gray
            } else {
                decorcolorcomponents = { 'r': 191, 'g': 191, 'b': 191 } // always shade of gray
            }

            return {
                'color': frontcolor
                , 'background-color': backcolorcomponents ? toRGBfn(backcolorcomponents) : backcolor
                , 'decor-color': toRGBfn(decorcolorcomponents)
            }
        }

        function Vector(x, y) {
            this.x = x
            this.y = y
            this.reverse = function () {
                return new this.constructor(
                    this.x * -1
                    , this.y * -1
                )
            }
            this._length = null
            this.getLength = function () {
                if (!this._length) {
                    this._length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
                }
                return this._length
            }

            var polarity = function (e) {
                return Math.round(e / Math.abs(e))
            }
            this.resizeTo = function (length) {
                // proportionally changes x,y such that the hypotenuse (vector length) is = new length
                if (this.x === 0 && this.y === 0) {
                    this._length = 0
                } else if (this.x === 0) {
                    this._length = length
                    this.y = length * polarity(this.y)
                } else if (this.y === 0) {
                    this._length = length
                    this.x = length * polarity(this.x)
                } else {
                    var proportion = Math.abs(this.y / this.x)
                        , x = Math.sqrt(Math.pow(length, 2) / (1 + Math.pow(proportion, 2)))
                        , y = proportion * x
                    this._length = length
                    this.x = x * polarity(this.x)
                    this.y = y * polarity(this.y)
                }
                return this
            }

            /**
             * Calculates the angle between 'this' vector and another.
             * @public
             * @function
             * @returns {Number} The angle between the two vectors as measured in PI. 
             */
            this.angleTo = function (vectorB) {
                var divisor = this.getLength() * vectorB.getLength()
                if (divisor === 0) {
                    return 0
                } else {
                    // JavaScript floating point math is screwed up.
                    // because of it, the core of the formula can, on occasion, have values
                    // over 1.0 and below -1.0.
                    return Math.acos(
                        Math.min(
                            Math.max(
                                (this.x * vectorB.x + this.y * vectorB.y) / divisor
                                , -1.0
                            )
                            , 1.0
                        )
                    ) / Math.PI
                }
            }
        }

        function Point(x, y) {
            this.x = x
            this.y = y

            this.getVectorToCoordinates = function (x, y) {
                return new Vector(x - this.x, y - this.y)
            }
            this.getVectorFromCoordinates = function (x, y) {
                return this.getVectorToCoordinates(x, y).reverse()
            }
            this.getVectorToPoint = function (point) {
                return new Vector(point.x - this.x, point.y - this.y)
            }
            this.getVectorFromPoint = function (point) {
                return this.getVectorToPoint(point).reverse()
            }
        }

        /*
         * About data structure:
         * We don't store / deal with "pictures" this signature capture code captures "vectors"
         * 
         * We don't store bitmaps. We store "strokes" as arrays of arrays. (Actually, arrays of objects containing arrays of coordinates.
         * 
         * Stroke = mousedown + mousemoved * n (+ mouseup but we don't record that as that was the "end / lack of movement" indicator)
         * 
         * Vectors = not classical vectors where numbers indicated shift relative last position. Our vectors are actually coordinates against top left of canvas.
         * 			we could calc the classical vectors, but keeping the the actual coordinates allows us (through Math.max / min) 
         * 			to calc the size of resulting drawing very quickly. If we want classical vectors later, we can always get them in backend code.
         * 
         * So, the data structure:
         * 
         * var data = [
         * 	{ // stroke starts
         * 		x : [101, 98, 57, 43] // x points
         * 		, y : [1, 23, 65, 87] // y points
         * 	} // stroke ends
         * 	, { // stroke starts
         * 		x : [55, 56, 57, 58] // x points
         * 		, y : [101, 97, 54, 4] // y points
         * 	} // stroke ends
         * 	, { // stroke consisting of just a dot
         * 		x : [53] // x points
         * 		, y : [151] // y points
         * 	} // stroke ends
         * ]
         * 
         * we don't care or store stroke width (it's canvas-size-relative), color, shadow values. These can be added / changed on whim post-capture.
         * 
         */
        function DataEngine(storageObject, context, startStrokeFn, addToStrokeFn, endStrokeFn) {
            this.data = storageObject // we expect this to be an instance of Array
            this.context = context

            if (storageObject.length) {
                // we have data to render
                var numofstrokes = storageObject.length
                    , stroke
                    , numofpoints

                for (var i = 0; i < numofstrokes; i++) {
                    stroke = storageObject[i]
                    numofpoints = stroke.x.length
                    startStrokeFn.call(context, stroke)
                    for (var j = 1; j < numofpoints; j++) {
                        addToStrokeFn.call(context, stroke, j)
                    }
                    endStrokeFn.call(context, stroke)
                }
            }

            this.changed = function () { }

            this.startStrokeFn = startStrokeFn
            this.addToStrokeFn = addToStrokeFn
            this.endStrokeFn = endStrokeFn

            this.inStroke = false

            this._lastPoint = null
            this._stroke = null
            this.startStroke = function (point) {
                if (point && typeof (point.x) == "number" && typeof (point.y) == "number") {
                    this._stroke = { 'x': [point.x], 'y': [point.y] }
                    this.data.push(this._stroke)
                    this._lastPoint = point
                    this.inStroke = true
                    // 'this' does not work same inside setTimeout(
                    var stroke = this._stroke
                        , fn = this.startStrokeFn
                        , context = this.context
                    setTimeout(
                        // some IE's don't support passing args per setTimeout API. Have to create closure every time instead.
                        function () { fn.call(context, stroke) }
                        , 3
                    )
                    return point
                } else {
                    return null
                }
            }
            // that "5" at the very end of this if is important to explain.
            // we do NOT render links between two captured points (in the middle of the stroke) if the distance is shorter than that number.
            // not only do we NOT render it, we also do NOT capture (add) these intermediate points to storage.
            // when clustering of these is too tight, it produces noise on the line, which, because of smoothing, makes lines too curvy.
            // maybe, later, we can expose this as a configurable setting of some sort.
            this.addToStroke = function (point) {
                if (this.inStroke &&
                    typeof (point.x) === "number" &&
                    typeof (point.y) === "number" &&
                    // calculates absolute shift in diagonal pixels away from original point
                    (Math.abs(point.x - this._lastPoint.x) + Math.abs(point.y - this._lastPoint.y)) > 4
                ) {
                    var positionInStroke = this._stroke.x.length
                    this._stroke.x.push(point.x)
                    this._stroke.y.push(point.y)
                    this._lastPoint = point

                    var stroke = this._stroke
                        , fn = this.addToStrokeFn
                        , context = this.context
                    setTimeout(
                        // some IE's don't support passing args per setTimeout API. Have to create closure every time instead.
                        function () { fn.call(context, stroke, positionInStroke) }
                        , 3
                    )
                    return point
                } else {
                    return null
                }
            }
            this.endStroke = function () {
                var c = this.inStroke
                this.inStroke = false
                this._lastPoint = null
                if (c) {
                    var stroke = this._stroke
                        , fn = this.endStrokeFn // 'this' does not work same inside setTimeout(
                        , context = this.context
                        , changedfn = this.changed
                    setTimeout(
                        // some IE's don't support passing args per setTimeout API. Have to create closure every time instead.
                        function () {
                            fn.call(context, stroke)
                            changedfn.call(context)
                        }
                        , 3
                    )
                    return true
                } else {
                    return null
                }
            }
        }

        var basicDot = function (ctx, x, y, size) {
            var fillStyle = ctx.fillStyle
            ctx.fillStyle = ctx.strokeStyle
            ctx.fillRect(x + size / -2, y + size / -2, size, size)
            ctx.fillStyle = fillStyle
        }
            , basicLine = function (ctx, startx, starty, endx, endy) {
                ctx.beginPath()
                ctx.moveTo(startx, starty)
                ctx.lineTo(endx, endy)
                ctx.stroke()
            }
            , basicCurve = function (ctx, startx, starty, endx, endy, cp1x, cp1y, cp2x, cp2y) {
                ctx.beginPath()
                ctx.moveTo(startx, starty)
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endx, endy)
                ctx.stroke()
            }
            , strokeStartCallback = function (stroke) {
                // this = jSignatureClass instance
                basicDot(this.canvasContext, stroke.x[0], stroke.y[0], this.settings.lineWidth)
            }
            , strokeAddCallback = function (stroke, positionInStroke) {
                // this = jSignatureClass instance

                // Because we are funky this way, here we draw TWO curves.
                // 1. POSSIBLY "this line" - spanning from point right before us, to this latest point.
                // 2. POSSIBLY "prior curve" - spanning from "latest point" to the one before it.

                // Why you ask?
                // long lines (ones with many pixels between them) do not look good when they are part of a large curvy stroke.
                // You know, the jaggedy crocodile spine instead of a pretty, smooth curve. Yuck!
                // We want to approximate pretty curves in-place of those ugly lines.
                // To approximate a very nice curve we need to know the direction of line before and after.
                // Hence, on long lines we actually wait for another point beyond it to come back from
                // mousemoved before we draw this curve.

                // So for "prior curve" to be calc'ed we need 4 points 
                // 	A, B, C, D (we are on D now, A is 3 points in the past.)
                // and 3 lines:
                //  pre-line (from points A to B), 
                //  this line (from points B to C), (we call it "this" because if it was not yet, it's the only one we can draw for sure.) 
                //  post-line (from points C to D) (even through D point is 'current' we don't know how we can draw it yet)
                //
                // Well, actually, we don't need to *know* the point A, just the vector A->B
                var Cpoint = new Point(stroke.x[positionInStroke - 1], stroke.y[positionInStroke - 1])
                    , Dpoint = new Point(stroke.x[positionInStroke], stroke.y[positionInStroke])
                    , CDvector = Cpoint.getVectorToPoint(Dpoint)

                // Again, we have a chance here to draw TWO things:
                //  BC Curve (only if it's long, because if it was short, it was drawn by previous callback) and 
                //  CD Line (only if it's short)

                // So, let's start with BC curve.
                // if there is only 2 points in stroke array, we don't have "history" long enough to have point B, let alone point A.
                // Falling through to drawing line CD is proper, as that's the only line we have points for.
                if (positionInStroke > 1) {
                    // we are here when there are at least 3 points in stroke array.
                    var Bpoint = new Point(stroke.x[positionInStroke - 2], stroke.y[positionInStroke - 2])
                        , BCvector = Bpoint.getVectorToPoint(Cpoint)
                        , ABvector
                    if (BCvector.getLength() > this.lineCurveThreshold) {
                        // Yey! Pretty curves, here we come!
                        if (positionInStroke > 2) {
                            // we are here when at least 4 points in stroke array.
                            ABvector = (new Point(stroke.x[positionInStroke - 3], stroke.y[positionInStroke - 3])).getVectorToPoint(Bpoint)
                        } else {
                            ABvector = new Vector(0, 0)
                        }

                        var minlenfraction = 0.05
                            , maxlen = BCvector.getLength() * 0.35
                            , ABCangle = BCvector.angleTo(ABvector.reverse())
                            , BCDangle = CDvector.angleTo(BCvector.reverse())
                            , BCP1vector = new Vector(ABvector.x + BCvector.x, ABvector.y + BCvector.y).resizeTo(
                                Math.max(minlenfraction, ABCangle) * maxlen
                            )
                            , CCP2vector = (new Vector(BCvector.x + CDvector.x, BCvector.y + CDvector.y)).reverse().resizeTo(
                                Math.max(minlenfraction, BCDangle) * maxlen
                            )

                        basicCurve(
                            this.canvasContext
                            , Bpoint.x
                            , Bpoint.y
                            , Cpoint.x
                            , Cpoint.y
                            , Bpoint.x + BCP1vector.x
                            , Bpoint.y + BCP1vector.y
                            , Cpoint.x + CCP2vector.x
                            , Cpoint.y + CCP2vector.y
                        )
                    }
                }
                if (CDvector.getLength() <= this.lineCurveThreshold) {
                    basicLine(
                        this.canvasContext
                        , Cpoint.x
                        , Cpoint.y
                        , Dpoint.x
                        , Dpoint.y
                    )
                }
            }
            , strokeEndCallback = function (stroke) {
                // this = jSignatureClass instance

                // Here we tidy up things left unfinished in last strokeAddCallback run.

                // What's POTENTIALLY left unfinished there is the curve between the last points
                // in the stroke, if the len of that line is more than lineCurveThreshold
                // If the last line was shorter than lineCurveThreshold, it was drawn there, and there
                // is nothing for us here to do.
                // We can also be called when there is only one point in the stroke (meaning, the 
                // stroke was just a dot), in which case, again, there is nothing for us to do.

                // So for "this curve" to be calc'ed we need 3 points 
                // 	A, B, C
                // and 2 lines:
                //  pre-line (from points A to B), 
                //  this line (from points B to C) 
                // Well, actually, we don't need to *know* the point A, just the vector A->B
                // so, we really need points B, C and AB vector.
                var positionInStroke = stroke.x.length - 1

                if (positionInStroke > 0) {
                    // there are at least 2 points in the stroke.we are in business.
                    var Cpoint = new Point(stroke.x[positionInStroke], stroke.y[positionInStroke])
                        , Bpoint = new Point(stroke.x[positionInStroke - 1], stroke.y[positionInStroke - 1])
                        , BCvector = Bpoint.getVectorToPoint(Cpoint)
                        , ABvector
                    if (BCvector.getLength() > this.lineCurveThreshold) {
                        // yep. This one was left undrawn in prior callback. Have to draw it now.
                        if (positionInStroke > 1) {
                            // we have at least 3 elems in stroke
                            ABvector = (new Point(stroke.x[positionInStroke - 2], stroke.y[positionInStroke - 2])).getVectorToPoint(Bpoint)
                            var BCP1vector = new Vector(ABvector.x + BCvector.x, ABvector.y + BCvector.y).resizeTo(BCvector.getLength() / 2)
                            basicCurve(
                                this.canvasContext
                                , Bpoint.x
                                , Bpoint.y
                                , Cpoint.x
                                , Cpoint.y
                                , Bpoint.x + BCP1vector.x
                                , Bpoint.y + BCP1vector.y
                                , Cpoint.x
                                , Cpoint.y
                            )
                        } else {
                            // Since there is no AB leg, there is no curve to draw. This line is still "long" but no curve.
                            basicLine(
                                this.canvasContext
                                , Bpoint.x
                                , Bpoint.y
                                , Cpoint.x
                                , Cpoint.y
                            )
                        }
                    }
                }
            }


        /*
        var getDataStats = function(){
            var strokecnt = strokes.length
                , stroke
                , pointid
                , pointcnt
                , x, y
                , maxX = Number.NEGATIVE_INFINITY
                , maxY = Number.NEGATIVE_INFINITY
                , minX = Number.POSITIVE_INFINITY
                , minY = Number.POSITIVE_INFINITY
            for(strokeid = 0; strokeid < strokecnt; strokeid++){
                stroke = strokes[strokeid]
                pointcnt = stroke.length
                for(pointid = 0; pointid < pointcnt; pointid++){
                    x = stroke.x[pointid]
                    y = stroke.y[pointid]
                    if (x > maxX){
                        maxX = x
                    } else if (x < minX) {
                        minX = x
                    }
                    if (y > maxY){
                        maxY = y
                    } else if (y < minY) {
                        minY = y
                    }
                }
            }
            return {'maxX': maxX, 'minX': minX, 'maxY': maxY, 'minY': minY}
        }
        */

        function conditionallyLinkCanvasResizeToWindowResize(jSignatureInstance, settingsWidth, apinamespace, globalEvents) {
            'use strict'
            if (settingsWidth === 'ratio' || settingsWidth.split('')[settingsWidth.length - 1] === '%') {

                this.eventTokens[apinamespace + '.parentresized'] = globalEvents.subscribe(
                    apinamespace + '.parentresized'
                    , (function (eventTokens, $parent, originalParentWidth, sizeRatio) {
                        'use strict'

                        return function () {
                            'use strict'

                            var w = $parent.width()
                            if (w !== originalParentWidth) {

                                // UNsubscribing this particular instance of signature pad only.
                                // there is a separate `eventTokens` per each instance of signature pad 
                                for (var key in eventTokens) {
                                    if (eventTokens.hasOwnProperty(key)) {
                                        globalEvents.unsubscribe(eventTokens[key])
                                        delete eventTokens[key]
                                    }
                                }

                                var settings = jSignatureInstance.settings
                                jSignatureInstance.$parent.children().remove()
                                for (var key in jSignatureInstance) {
                                    if (jSignatureInstance.hasOwnProperty(key)) {
                                        delete jSignatureInstance[key]
                                    }
                                }

                                // scale data to new signature pad size
                                settings.data = (function (data, scale) {
                                    var newData = []
                                    var o, i, l, j, m, stroke
                                    for (i = 0, l = data.length; i < l; i++) {
                                        stroke = data[i]

                                        o = { 'x': [], 'y': [] }

                                        for (j = 0, m = stroke.x.length; j < m; j++) {
                                            o.x.push(stroke.x[j] * scale)
                                            o.y.push(stroke.y[j] * scale)
                                        }

                                        newData.push(o)
                                    }
                                    return newData
                                })(
                                    settings.data
                                    , w * 1.0 / originalParentWidth
                                )

                                $parent[apinamespace](settings)
                            }
                        }
                    })(
                        this.eventTokens
                        , this.$parent
                        , this.$parent.width()
                        , this.canvas.width * 1.0 / this.canvas.height
                    )
                )
            }
        }


        function jSignatureClass(parent, options, instanceExtensions) {

            var $parent = this.$parent = $(parent)
                , eventTokens = this.eventTokens = {}
                , events = this.events = new PubSubClass(this)
                , globalEvents = $.fn[apinamespace]('globalEvents')
                , settings = {
                    'width': 'ratio'
                    , 'height': 'ratio'
                    , 'sizeRatio': 4 // only used when height = 'ratio'
                    , 'color': '#000'
                    , 'background-color': '#fff'
                    , 'decor-color': '#eee'
                    , 'lineWidth': 0
                    , 'minFatFingerCompensation': -10
                    , 'showUndoButton': false
                    , 'data': []
                }

            $.extend(settings, getColors($parent))
            if (options) {
                $.extend(settings, options)
            }
            this.settings = settings

            for (var extensionName in instanceExtensions) {
                if (instanceExtensions.hasOwnProperty(extensionName)) {
                    instanceExtensions[extensionName].call(this, extensionName)
                }
            }

            this.events.publish(apinamespace + '.initializing')

            // these, when enabled, will hover above the sig area. Hence we append them to DOM before canvas.
            this.$controlbarUpper = (function () {
                var controlbarstyle = 'padding:0 !important;margin:0 !important;' +
                    'width: 100% !important; height: 0 !important;' +
                    'margin-top:-1em !important;margin-bottom:1em !important;'
                return $('<div style="' + controlbarstyle + '"></div>').appendTo($parent)
            })();

            this.isCanvasEmulator = false // will be flipped by initializer when needed.
            var canvas = this.canvas = this.initializeCanvas(settings)
                , $canvas = $(canvas)

            this.$controlbarLower = (function () {
                var controlbarstyle = 'padding:0 !important;margin:0 !important;' +
                    'width: 100% !important; height: 0 !important;' +
                    'margin-top:-1.5em !important;margin-bottom:1.5em !important;'
                return $('<div style="' + controlbarstyle + '"></div>').appendTo($parent)
            })();

            this.canvasContext = canvas.getContext("2d")

            // Most of our exposed API will be looking for this:
            $canvas.data(apinamespace + '.this', this)

            settings.lineWidth = (function (defaultLineWidth, canvasWidth) {
                if (!defaultLineWidth) {
                    return Math.max(
                        Math.round(canvasWidth / 400) /*+1 pixel for every extra 300px of width.*/
                        , 2 /* minimum line width */
                    )
                } else {
                    return defaultLineWidth
                }
            })(settings.lineWidth, canvas.width);

            this.lineCurveThreshold = settings.lineWidth * 3

            // Add custom class if defined
            if (settings.cssclass && $.trim(settings.cssclass) != "") {
                $canvas.addClass(settings.cssclass)
            }

            // used for shifting the drawing point up on touch devices, so one can see the drawing above the finger.
            this.fatFingerCompensation = 0

            var movementHandlers = (function (jSignatureInstance) {

                //================================
                // mouse down, move, up handlers:

                // shifts - adjustment values in viewport pixels drived from position of canvas on the page
                var shiftX
                    , shiftY
                    , setStartValues = function () {
                        var tos = $(jSignatureInstance.canvas).offset()
                        shiftX = tos.left * -1
                        shiftY = tos.top * -1
                    }
                    , getPointFromEvent = function (e) {
                        var firstEvent = (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : e)
                        // All devices i tried report correct coordinates in pageX,Y
                        // Android Chrome 2.3.x, 3.1, 3.2., Opera Mobile,  safari iOS 4.x,
                        // Windows: Chrome, FF, IE9, Safari
                        // None of that scroll shift calc vs screenXY other sigs do is needed.
                        // ... oh, yeah, the "fatFinger.." is for tablets so that people see what they draw.
                        return new Point(
                            Math.round(firstEvent.pageX + shiftX)
                            , Math.round(firstEvent.pageY + shiftY) + jSignatureInstance.fatFingerCompensation
                        )
                    }
                    , timer = new KickTimerClass(
                        750
                        , function () { jSignatureInstance.dataEngine.endStroke() }
                    )

                this.drawEndHandler = function (e) {
                    try { e.preventDefault() } catch (ex) { }
                    timer.clear()
                    jSignatureInstance.dataEngine.endStroke()
                }
                this.drawStartHandler = function (e) {
                    e.preventDefault()
                    // for performance we cache the offsets
                    // we recalc these only at the beginning the stroke			
                    setStartValues()
                    jSignatureInstance.dataEngine.startStroke(getPointFromEvent(e))
                    timer.kick()
                }
                this.drawMoveHandler = function (e) {
                    e.preventDefault()
                    if (!jSignatureInstance.dataEngine.inStroke) {
                        return
                    }
                    jSignatureInstance.dataEngine.addToStroke(getPointFromEvent(e))
                    timer.kick()
                }

                return this

            }).call({}, this)

                //
                //================================

                ; (function (drawEndHandler, drawStartHandler, drawMoveHandler) {
                    var canvas = this.canvas
                        , $canvas = $(canvas)
                        , undef
                    if (this.isCanvasEmulator) {
                        $canvas.bind('mousemove.' + apinamespace, drawMoveHandler)
                        $canvas.bind('mouseup.' + apinamespace, drawEndHandler)
                        $canvas.bind('mousedown.' + apinamespace, drawStartHandler)
                    } else {
                        canvas.ontouchstart = function (e) {
                            canvas.onmousedown = undef
                            canvas.onmouseup = undef
                            canvas.onmousemove = undef

                            this.fatFingerCompensation = (
                                settings.minFatFingerCompensation &&
                                settings.lineWidth * -3 > settings.minFatFingerCompensation
                            ) ? settings.lineWidth * -3 : settings.minFatFingerCompensation

                            drawStartHandler(e)

                            canvas.ontouchend = drawEndHandler
                            canvas.ontouchstart = drawStartHandler
                            canvas.ontouchmove = drawMoveHandler
                        }
                        canvas.onmousedown = function (e) {
                            canvas.ontouchstart = undef
                            canvas.ontouchend = undef
                            canvas.ontouchmove = undef

                            drawStartHandler(e)

                            canvas.onmousedown = drawStartHandler
                            canvas.onmouseup = drawEndHandler
                            canvas.onmousemove = drawMoveHandler
                        }
                    }
                }).call(
                    this
                    , movementHandlers.drawEndHandler
                    , movementHandlers.drawStartHandler
                    , movementHandlers.drawMoveHandler
                )

            //=========================================
            // various event handlers

            // on mouseout + mouseup canvas did not know that mouseUP fired. Continued to draw despite mouse UP.
            // it is bettr than
            // $canvas.bind('mouseout', drawEndHandler)
            // because we don't want to break the stroke where user accidentally gets ouside and wants to get back in quickly.
            eventTokens[apinamespace + '.windowmouseup'] = globalEvents.subscribe(
                apinamespace + '.windowmouseup'
                , movementHandlers.drawEndHandler
            )

            this.events.publish(apinamespace + '.attachingEventHandlers')

            // If we have proportional width, we sign up to events broadcasting "window resized" and checking if
            // parent's width changed. If so, we (1) extract settings + data from current signature pad,
            // (2) remove signature pad from parent, and (3) reinit new signature pad at new size with same settings, (rescaled) data.
            conditionallyLinkCanvasResizeToWindowResize.call(
                this
                , this
                , settings.width.toString(10)
                , apinamespace, globalEvents
            )

            // end of event handlers.
            // ===============================

            this.resetCanvas(settings.data)

            // resetCanvas renders the data on the screen and fires ONE "change" event
            // if there is data. If you have controls that rely on "change" firing
            // attach them to something that runs before this.resetCanvas, like
            // apinamespace+'.attachingEventHandlers' that fires a bit higher.
            this.events.publish(apinamespace + '.initialized')

            return this
        } // end of initBase

        //=========================================================================
        // jSignatureClass's methods and supporting fn's

        jSignatureClass.prototype.resetCanvas = function (data) {
            var canvas = this.canvas
                , settings = this.settings
                , ctx = this.canvasContext
                , isCanvasEmulator = this.isCanvasEmulator

                , cw = canvas.width
                , ch = canvas.height

            // preparing colors, drawing area

            ctx.clearRect(0, 0, cw + 30, ch + 30)

            ctx.shadowColor = ctx.fillStyle = settings['background-color']
            if (isCanvasEmulator) {
                // FLashCanvas fills with Black by default, covering up the parent div's background
                // hence we refill 
                ctx.fillRect(0, 0, cw + 30, ch + 30)
            }

            ctx.lineWidth = Math.ceil(parseInt(settings.lineWidth, 10))
            ctx.lineCap = ctx.lineJoin = "round"

            // signature line
            ctx.strokeStyle = settings['decor-color']
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
            var lineoffset = Math.round(ch / 5)
            basicLine(ctx, lineoffset * 1.5, ch - lineoffset, cw - (lineoffset * 1.5), ch - lineoffset)
            ctx.strokeStyle = settings.color

            if (!isCanvasEmulator) {
                ctx.shadowColor = ctx.strokeStyle
                ctx.shadowOffsetX = ctx.lineWidth * 0.5
                ctx.shadowOffsetY = ctx.lineWidth * -0.6
                ctx.shadowBlur = 0
            }

            // setting up new dataEngine

            if (!data) { data = [] }

            var dataEngine = this.dataEngine = new DataEngine(
                data
                , this
                , strokeStartCallback
                , strokeAddCallback
                , strokeEndCallback
            )

            settings.data = data  // onwindowresize handler uses it, i think.
            $(canvas).data(apinamespace + '.data', data)
                .data(apinamespace + '.settings', settings)

            // we fire "change" event on every change in data.
            // setting this up:
            dataEngine.changed = (function (target, events, apinamespace) {
                'use strict'
                return function () {
                    events.publish(apinamespace + '.change')
                    target.trigger('change')
                }
            })(this.$parent, this.events, apinamespace)
            // let's trigger change on all data reloads
            dataEngine.changed()

            // import filters will be passing this back as indication of "we rendered"
            return true
        }

        function initializeCanvasEmulator(canvas) {
            if (canvas.getContext) {
                return false
            } else {
                // for cases when jSignature, FlashCanvas is inserted
                // from one window into another (child iframe)
                // 'window' and 'FlashCanvas' may be stuck behind
                // in that other parent window.
                // we need to find it
                var window = canvas.ownerDocument.parentWindow
                var FC = window.FlashCanvas ?
                    canvas.ownerDocument.parentWindow.FlashCanvas :
                    (
                        typeof FlashCanvas === "undefined" ?
                            undefined :
                            FlashCanvas
                    )

                if (FC) {
                    canvas = FC.initElement(canvas)

                    var zoom = 1
                    // FlashCanvas uses flash which has this annoying habit of NOT scaling with page zoom. 
                    // It matches pixel-to-pixel to screen instead.
                    // Since we are targeting ONLY IE 7, 8 with FlashCanvas, we will test the zoom only the IE8, IE7 way
                    if (window && window.screen && window.screen.deviceXDPI && window.screen.logicalXDPI) {
                        zoom = window.screen.deviceXDPI * 1.0 / window.screen.logicalXDPI
                    }
                    if (zoom !== 1) {
                        try {
                            // We effectively abuse the brokenness of FlashCanvas and force the flash rendering surface to
                            // occupy larger pixel dimensions than the wrapping, scaled up DIV and Canvas elems.
                            $(canvas).children('object').get(0).resize(Math.ceil(canvas.width * zoom), Math.ceil(canvas.height * zoom))
                            // And by applying "scale" transformation we can talk "browser pixels" to FlashCanvas
                            // and have it translate the "browser pixels" to "screen pixels"
                            canvas.getContext('2d').scale(zoom, zoom)
                            // Note to self: don't reuse Canvas element. Repeated "scale" are cumulative.
                        } catch (ex) { }
                    }
                    return true
                } else {
                    throw new Error("Canvas element does not support 2d context. jSignature cannot proceed.")
                }
            }

        }

        jSignatureClass.prototype.initializeCanvas = function (settings) {
            // ===========
            // Init + Sizing code

            var canvas = document.createElement('canvas')
                , $canvas = $(canvas)

            // We cannot work with circular dependency
            if (settings.width === settings.height && settings.height === 'ratio') {
                settings.width = '100%'
            }

            $canvas.css(
                'margin'
                , 0
            ).css(
                'padding'
                , 0
            ).css(
                'border'
                , 'none'
            ).css(
                'height'
                , settings.height === 'ratio' || !settings.height ? 1 : settings.height.toString(10)
            ).css(
                'width'
                , settings.width === 'ratio' || !settings.width ? 1 : settings.width.toString(10)
            )

            $canvas.appendTo(this.$parent)

            // we could not do this until canvas is rendered (appended to DOM)
            if (settings.height === 'ratio') {
                $canvas.css(
                    'height'
                    , Math.round($canvas.width() / settings.sizeRatio)
                )
            } else if (settings.width === 'ratio') {
                $canvas.css(
                    'width'
                    , Math.round($canvas.height() * settings.sizeRatio)
                )
            }

            $canvas.addClass(apinamespace)

            // canvas's drawing area resolution is independent from canvas's size.
            // pixels are just scaled up or down when internal resolution does not
            // match external size. So...

            canvas.width = $canvas.width()
            canvas.height = $canvas.height()

            // Special case Sizing code

            this.isCanvasEmulator = initializeCanvasEmulator(canvas)

            // End of Sizing Code
            // ===========

            // normally select preventer would be short, but
            // Canvas emulator on IE does NOT provide value for Event. Hence this convoluted line.
            canvas.onselectstart = function (e) { if (e && e.preventDefault) { e.preventDefault() }; if (e && e.stopPropagation) { e.stopPropagation() }; return false; }

            return canvas
        }


        var GlobalJSignatureObjectInitializer = function (window) {

            var globalEvents = new PubSubClass()

                // common "window resized" event listener.
                // jSignature instances will subscribe to this chanel.
                // to resize themselves when needed.
                ; (function (globalEvents, apinamespace, $, window) {
                    'use strict'

                    var resizetimer
                        , runner = function () {
                            globalEvents.publish(
                                apinamespace + '.parentresized'
                            )
                        }

                    // jSignature knows how to resize its content when its parent is resized
                    // window resize is the only way we can catch resize events though...
                    $(window).bind('resize.' + apinamespace, function () {
                        if (resizetimer) {
                            clearTimeout(resizetimer)
                        }
                        resizetimer = setTimeout(
                            runner
                            , 500
                        )
                    })
                        // when mouse exists canvas element and "up"s outside, we cannot catch it with
                        // callbacks attached to canvas. This catches it outside.
                        .bind('mouseup.' + apinamespace, function (e) {
                            globalEvents.publish(
                                apinamespace + '.windowmouseup'
                            )
                        })

                })(globalEvents, apinamespace, $, window)

            var jSignatureInstanceExtensions = {
                /*
                'exampleExtension':function(extensionName){
                    // we are called very early in instance's life.
                    // right after the settings are resolved and 
                    // jSignatureInstance.events is created 
                    // and right before first ("jSignature.initializing") event is called.
                    // You don't really need to manupilate 
                    // jSignatureInstance directly, just attach
                    // a bunch of events to jSignatureInstance.events
                    // (look at the source of jSignatureClass to see when these fire)
                    // and your special pieces of code will attach by themselves.
        
                    // this function runs every time a new instance is set up.
                    // this means every var you create will live only for one instance
                    // unless you attach it to something outside, like "window."
                    // and pick it up later from there.
        
                    // when globalEvents' events fire, 'this' is globalEvents object
                    // when jSignatureInstance's events fire, 'this' is jSignatureInstance
        
                    // Here,
                    // this = is new jSignatureClass's instance.
        
                    // The way you COULD approch setting this up is:
                    // if you have multistep set up, attach event to "jSignature.initializing"
                    // that attaches other events to be fired further lower the init stream.
                    // Or, if you know for sure you rely on only one jSignatureInstance's event,
                    // just attach to it directly
        
                    this.events.subscribe(
                        // name of the event
                        apinamespace + '.initializing'
                        // event handlers, can pass args too, but in majority of cases,
                        // 'this' which is jSignatureClass object instance pointer is enough to get by.
                        , function(){
                            if (this.settings.hasOwnProperty('non-existent setting category?')) {
                                console.log(extensionName + ' is here')
                            }
                        }
                    )
                }
                */
            }

            var exportplugins = {
                'default': function (data) { return this.toDataURL() }
                , 'native': function (data) { return data }
                , 'image': function (data) {
                    /*this = canvas elem */
                    var imagestring = this.toDataURL()

                    if (typeof imagestring === 'string' &&
                        imagestring.length > 4 &&
                        imagestring.slice(0, 5) === 'data:' &&
                        imagestring.indexOf(',') !== -1) {

                        var splitterpos = imagestring.indexOf(',')

                        return [
                            imagestring.slice(5, splitterpos)
                            , imagestring.substr(splitterpos + 1)
                        ]
                    }
                    return []
                }
            }

            // will be part of "importplugins"
            function _renderImageOnCanvas(data, formattype, rerendercallable) {
                'use strict'
                // #1. Do NOT rely on this. No worky on IE 
                //   (url max len + lack of base64 decoder + possibly other issues)
                // #2. This does NOT affect what is captured as "signature" as far as vector data is 
                // concerned. This is treated same as "signature line" - i.e. completely ignored
                // the only time you see imported image data exported is if you export as image.

                // we do NOT call rerendercallable here (unlike in other import plugins)
                // because importing image does absolutely nothing to the underlying vector data storage
                // This could be a way to "import" old signatures stored as images
                // This could also be a way to import extra decor into signature area.

                var img = new Image()
                    // this = Canvas DOM elem. Not jQuery object. Not Canvas's parent div.
                    , c = this

                img.onload = function () {
                    var ctx = c.getContext("2d").drawImage(
                        img, 0, 0
                        , (img.width < c.width) ? img.width : c.width
                        , (img.height < c.height) ? img.height : c.height
                    )
                }

                img.src = 'data:' + formattype + ',' + data
            }

            var importplugins = {
                'native': function (data, formattype, rerendercallable) {
                    // we expect data as Array of objects of arrays here - whatever 'default' EXPORT plugin spits out.
                    // returning Truthy to indicate we are good, all updated.
                    rerendercallable(data)
                }
                , 'image': _renderImageOnCanvas
                , 'image/png;base64': _renderImageOnCanvas
                , 'image/jpeg;base64': _renderImageOnCanvas
                , 'image/jpg;base64': _renderImageOnCanvas
            }

            function _clearDrawingArea(data) {
                this.find('canvas.' + apinamespace)
                    .add(this.filter('canvas.' + apinamespace))
                    .data(apinamespace + '.this').resetCanvas(data)
                return this
            }

            function _setDrawingData(data, formattype) {
                var undef

                if (formattype === undef && typeof data === 'string' && data.substr(0, 5) === 'data:') {
                    formattype = data.slice(5).split(',')[0]
                    // 5 chars of "data:" + mimetype len + 1 "," char = all skipped.
                    data = data.slice(6 + formattype.length)
                    if (formattype === data) return
                }

                var $canvas = this.find('canvas.' + apinamespace).add(this.filter('canvas.' + apinamespace))

                if (!importplugins.hasOwnProperty(formattype)) {
                    throw new Error(apinamespace + " is unable to find import plugin with for format '" + String(formattype) + "'")
                } else if ($canvas.length !== 0) {
                    importplugins[formattype].call(
                        $canvas[0]
                        , data
                        , formattype
                        , (function (jSignatureInstance) {
                            return function () { return jSignatureInstance.resetCanvas.apply(jSignatureInstance, arguments) }
                        })($canvas.data(apinamespace + '.this'))
                    )
                }

                return this
            }

            var elementIsOrphan = function (e) {
                var topOfDOM = false
                e = e.parentNode
                while (e && !topOfDOM) {
                    topOfDOM = e.body
                    e = e.parentNode
                }
                return !topOfDOM
            }

            //These are exposed as methods under $obj.jSignature('methodname', *args)
            var plugins = { 'export': exportplugins, 'import': importplugins, 'instance': jSignatureInstanceExtensions }
                , methods = {
                    'init': function (options) {
                        return this.each(function () {
                            if (!elementIsOrphan(this)) {
                                new jSignatureClass(this, options, jSignatureInstanceExtensions)
                            }
                        })
                    }
                    , 'getSettings': function () {
                        return this.find('canvas.' + apinamespace)
                            .add(this.filter('canvas.' + apinamespace))
                            .data(apinamespace + '.this').settings
                    }
                    // around since v1
                    , 'clear': _clearDrawingArea
                    // was mistakenly introduced instead of 'clear' in v2
                    , 'reset': _clearDrawingArea
                    , 'xxx': function (data) {
                        /*this = canvas elem */
                        var imagestring = this.toDataURL()

                        if (typeof imagestring === 'string' &&
                            imagestring.length > 4 &&
                            imagestring.slice(0, 5) === 'data:' &&
                            imagestring.indexOf(',') !== -1) {

                            var splitterpos = imagestring.indexOf(',')

                            return [
                                imagestring.slice(5, splitterpos)
                                , imagestring.substr(splitterpos + 1)
                            ]
                        }
                        return []
                    }
                    , 'addPlugin': function (pluginType, pluginName, callable) {
                        if (plugins.hasOwnProperty(pluginType)) {
                            plugins[pluginType][pluginName] = callable
                        }
                        return this
                    }
                    , 'listPlugins': function (pluginType) {
                        var answer = []
                        if (plugins.hasOwnProperty(pluginType)) {
                            var o = plugins[pluginType]
                            for (var k in o) {
                                if (o.hasOwnProperty(k)) {
                                    answer.push(k)
                                }
                            }
                        }
                        return answer
                    }
                    , 'getData': function (formattype) {
                        var undef, $canvas = this.find('canvas.' + apinamespace).add(this.filter('canvas.' + apinamespace))
                        if (formattype === undef) formattype = 'default'
                        if ($canvas.length !== 0 && exportplugins.hasOwnProperty(formattype)) {
                            return exportplugins[formattype].call(
                                $canvas.get(0) // canvas dom elem
                                , $canvas.data(apinamespace + '.data') // raw signature data as array of objects of arrays
                            )
                        }
                    }
                    // around since v1. Took only one arg - data-url-formatted string with (likely png of) signature image
                    , 'importData': _setDrawingData
                    // was mistakenly introduced instead of 'importData' in v2
                    , 'setData': _setDrawingData
                    // this is one and same instance for all jSignature.
                    , 'globalEvents': function () { return globalEvents }
                    // there will be a separate one for each jSignature instance.
                    , 'events': function () {
                        return this.find('canvas.' + apinamespace)
                            .add(this.filter('canvas.' + apinamespace))
                            .data(apinamespace + '.this').events
                    }
                } // end of methods declaration.

            $.fn[apinamespace] = function (method) {
                'use strict'
                if (!method || typeof method === 'object') {
                    return methods.init.apply(this, arguments)
                } else if (typeof method === 'string' && methods[method]) {
                    return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
                } else {
                    $.error('Method ' + String(method) + ' does not exist on jQuery.' + apinamespace)
                }
            }

        } // end of GlobalJSignatureObjectInitializer

        GlobalJSignatureObjectInitializer(window)

    })();
/** @preserve
jSignature v2 jSignature's custom "base30" format export and import plugins.

*/
/**
Copyright (c) 2011 Willow Systems Corp http://willow-systems.com
MIT License <http://www.opensource.org/licenses/mit-license.php>
*/

; (function () {

    var chunkSeparator = '_'
        , charmap = {} // {'1':'g','2':'h','3':'i','4':'j','5':'k','6':'l','7':'m','8':'n','9':'o','a':'p','b':'q','c':'r','d':'s','e':'t','f':'u','0':'v'}
        , charmap_reverse = {} // will be filled by 'uncompress*" function
        // need to split below for IE7 (possibly others), which does not understand string[position] it seems (returns undefined)
        , allchars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX'.split('')
        , bitness = allchars.length / 2
        , minus = 'Z'
        , plus = 'Y'

    for (var i = bitness - 1; i > -1; i--) {
        charmap[allchars[i]] = allchars[i + bitness]
        charmap_reverse[allchars[i + bitness]] = allchars[i]
    }
    var remapTailChars = function (number) {
        // for any given number as string, returning string with trailing chars remapped something like so:
        // '345' -> '3de'
        var chars = number.split('')
            , l = chars.length
        // we are skipping first char. standard hex number char = delimiter
        for (var i = 1; i < l; i++) {
            chars[i] = charmap[chars[i]]
        }
        return chars.join('')
    }
        , compressstrokeleg = function (data) {
            // we convert half-stroke (only 'x' series or only 'y' series of numbers)
            // data is like this:
            // [517,516,514,513,513,513,514,516,519,524,529,537,541,543,544,544,539,536]
            // that is converted into this:
            // "5agm12100p1235584210m53"
            // each number in the chain is converted such:
            // - find diff from previous number
            // - first significant digit is kept as digit char. digit char = start of new number.
            // - consecutive numbers are mapped to letters, where 1 to 9 are A to I, 0 is O
            // Sign changes are denoted by "P" - plus, "M" for minus.
            var answer = []
                , lastwhole = 0
                , last = 0
                , lastpolarity = 1
                , l = data.length
                , nwhole, n, absn

            for (var i = 0; i < l; i++) {
                // we start with whole coordinates for each point
                // coords are converted into series of vectors:
                // [512, 514, 520]
                // [512, +2, +6]
                nwhole = Math.round(data[i])
                n = nwhole - lastwhole
                lastwhole = nwhole

                // inserting sign change when needed.
                if (n < 0 && lastpolarity > 0) {
                    lastpolarity = -1
                    answer.push(minus)
                }
                else if (n > 0 && lastpolarity < 0) {
                    lastpolarity = 1
                    answer.push(plus)
                }

                // since we have dealt with sign. let's absolute the value.
                absn = Math.abs(n)
                // adding number to list  We convert these to Hex before storing on the string.
                if (absn >= bitness) {
                    answer.push(remapTailChars(absn.toString(bitness)))
                } else {
                    answer.push(absn.toString(bitness))
                }
            }
            return answer.join('')
        }
        , uncompressstrokeleg = function (datastring) {
            // we convert half-stroke (only 'x' series or only 'y' series of numbers)
            // datastring like this:
            // "5agm12100p1235584210m53"
            // is converted into this:
            // [517,516,514,513,513,513,514,516,519,524,529,537,541,543,544,544,539,536]
            // each number in the chain is converted such:
            // - digit char = start of new whole number. Alpha chars except "p","m" are numbers in hiding.
            //   These consecutive digist expressed as alphas mapped back to digit char.
            //   resurrected number is the diff between this point and prior coord.
            // - running polaritiy is attached to the number.
            // - we undiff (signed number + prior coord) the number.
            // - if char 'm','p', flip running polarity 
            var answer = []
                , chars = datastring.split('')
                , l = chars.length
                , ch
                , polarity = 1
                , partial = []
                , preprewhole = 0
                , prewhole
            for (var i = 0; i < l; i++) {
                ch = chars[i]
                if (ch in charmap || ch === minus || ch === plus) {
                    // this is new number - start of a new whole number.
                    // before we can deal with it, we need to flush out what we already 
                    // parsed out from string, but keep in limbo, waiting for this sign
                    // that prior number is done.
                    // we deal with 3 numbers here:
                    // 1. start of this number - a diff from previous number to 
                    //    whole, new number, which we cannot do anything with cause
                    //    we don't know its ending yet.
                    // 2. number that we now realize have just finished parsing = prewhole
                    // 3. number we keep around that came before prewhole = preprewhole

                    if (partial.length !== 0) {
                        // yep, we have some number parts in there.
                        prewhole = parseInt(partial.join(''), bitness) * polarity + preprewhole
                        answer.push(prewhole)
                        preprewhole = prewhole
                    }

                    if (ch === minus) {
                        polarity = -1
                        partial = []
                    } else if (ch === plus) {
                        polarity = 1
                        partial = []
                    } else {
                        // now, let's start collecting parts for the new number:
                        partial = [ch]
                    }
                } else /* alphas replacing digits */ {
                    // more parts for the new number
                    partial.push(charmap_reverse[ch])
                }
            }
            // we always will have something stuck in partial
            // because we don't have closing delimiter
            answer.push(parseInt(partial.join(''), bitness) * polarity + preprewhole)

            return answer
        }
        , compressstrokes = function (data) {
            var answer = []
                , l = data.length
                , stroke
            for (var i = 0; i < l; i++) {
                stroke = data[i]
                answer.push(compressstrokeleg(stroke.x))
                answer.push(compressstrokeleg(stroke.y))
            }
            return answer.join(chunkSeparator)
        }
        , uncompressstrokes = function (datastring) {
            var data = []
                , chunks = datastring.split(chunkSeparator)
                , l = chunks.length / 2
            for (var i = 0; i < l; i++) {
                data.push({
                    'x': uncompressstrokeleg(chunks[i * 2])
                    , 'y': uncompressstrokeleg(chunks[i * 2 + 1])
                })
            }
            return data
        }
        , acceptedformat = 'image/jsignature;base30'
        , pluginCompressor = function (data) {
            return [acceptedformat, compressstrokes(data)]
        }
        , pluginDecompressor = function (data, formattype, importcallable) {
            if (typeof data !== 'string') return
            if (data.substring(0, acceptedformat.length).toLowerCase() === acceptedformat) {
                data = data.substring(acceptedformat.length + 1) // chopping off "," there
            }
            importcallable(uncompressstrokes(data))
        }
        , Initializer = function ($) {
            var mothership = $.fn['jSignature']
            mothership(
                'addPlugin'
                , 'export'
                , 'base30' // alias
                , pluginCompressor
            )
            mothership(
                'addPlugin'
                , 'export'
                , acceptedformat // full name
                , pluginCompressor
            )
            mothership(
                'addPlugin'
                , 'import'
                , 'base30' // alias
                , pluginDecompressor
            )
            mothership(
                'addPlugin'
                , 'import'
                , acceptedformat // full name
                , pluginDecompressor
            )
        }


    //  //Because plugins are minified together with jSignature, multiple defines per (minified) file blow up and dont make sense
    //	//Need to revisit this later.

    //	if ( typeof define === "function" && define.amd != null) {
    //		// AMD-loader compatible resource declaration
    //		// you need to call this one with jQuery as argument.
    //		define(function(){return Initializer} )
    //	} else {
    // global-polluting outcome.
    if (this.jQuery == null) { throw new Error("We need jQuery for some of the functionality. jQuery is not detected. Failing to initialize...") }
    Initializer(this.jQuery)
    //	}

    if (this.jSignatureDebug) {
        this.jSignatureDebug['base30'] = {
            'remapTailChars': remapTailChars
            , 'compressstrokeleg': compressstrokeleg
            , 'uncompressstrokeleg': uncompressstrokeleg
            , 'compressstrokes': compressstrokes
            , 'uncompressstrokes': uncompressstrokes
            , 'charmap': charmap
        }
    }

}).call(typeof window !== 'undefined' ? window : this);
/** @license
jSignature v2 SVG export plugin.

*/
/**
Copyright (c) 2012 Willow Systems Corp http://willow-systems.com
MIT License <http://www.opensource.org/licenses/mit-license.php>
*/

; (function () {
    'use strict'

        /** @preserve
        Simplify.js BSD 
        (c) 2012, Vladimir Agafonkin
        mourner.github.com/simplify-js
        
        */
        ; (function (a, b) { function c(a, b) { var c = a.x - b.x, d = a.y - b.y; return c * c + d * d } function d(a, b, c) { var d = b.x, e = b.y, f = c.x - d, g = c.y - e, h; if (f !== 0 || g !== 0) h = ((a.x - d) * f + (a.y - e) * g) / (f * f + g * g), h > 1 ? (d = c.x, e = c.y) : h > 0 && (d += f * h, e += g * h); return f = a.x - d, g = a.y - e, f * f + g * g } function e(a, b) { var d, e = a.length, f, g = a[0], h = [g]; for (d = 1; d < e; d++)f = a[d], c(f, g) > b && (h.push(f), g = f); return g !== f && h.push(f), h } function f(a, c) { var e = a.length, f = typeof Uint8Array != b + "" ? Uint8Array : Array, g = new f(e), h = 0, i = e - 1, j, k, l, m, n = [], o = [], p = []; g[h] = g[i] = 1; while (i) { k = 0; for (j = h + 1; j < i; j++)l = d(a[j], a[h], a[i]), l > k && (m = j, k = l); k > c && (g[m] = 1, n.push(h), o.push(m), n.push(m), o.push(i)), h = n.pop(), i = o.pop() } for (j = 0; j < e; j++)g[j] && p.push(a[j]); return p } "use strict"; var g = typeof exports != b + "" ? exports : a; g.simplify = function (a, c, d) { var g = c !== b ? c * c : 1; return d || (a = e(a, g)), a = f(a, g), a } })(window);


    /**
    Vector class. Allows us to simplify representation and manipulation of coordinate-pair
    representing shift against (0, 0)
    
    @public
    @class
    @param
    @returns {Type}
    */
    function Vector(x, y) {
        this.x = x
        this.y = y
        this.reverse = function () {
            return new this.constructor(
                this.x * -1
                , this.y * -1
            )
        }
        this._length = null
        this.getLength = function () {
            if (!this._length) {
                this._length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
            }
            return this._length
        }

        var polarity = function (e) {
            return Math.round(e / Math.abs(e))
        }
        this.resizeTo = function (length) {
            // proportionally changes x,y such that the hypotenuse (vector length) is = new length
            if (this.x === 0 && this.y === 0) {
                this._length = 0
            } else if (this.x === 0) {
                this._length = length
                this.y = length * polarity(this.y)
            } else if (this.y === 0) {
                this._length = length
                this.x = length * polarity(this.x)
            } else {
                var proportion = Math.abs(this.y / this.x)
                    , x = Math.sqrt(Math.pow(length, 2) / (1 + Math.pow(proportion, 2)))
                    , y = proportion * x
                this._length = length
                this.x = x * polarity(this.x)
                this.y = y * polarity(this.y)
            }
            return this
        }

        /**
         * Calculates the angle between 'this' vector and another.
         * @public
         * @function
         * @returns {Number} The angle between the two vectors as measured in PI. 
         */
        this.angleTo = function (vectorB) {
            var divisor = this.getLength() * vectorB.getLength()
            if (divisor === 0) {
                return 0
            } else {
                // JavaScript floating point math is screwed up.
                // because of it, the core of the formula can, on occasion, have values
                // over 1.0 and below -1.0.
                return Math.acos(
                    Math.min(
                        Math.max(
                            (this.x * vectorB.x + this.y * vectorB.y) / divisor
                            , -1.0
                        )
                        , 1.0
                    )
                ) / Math.PI
            }
        }
    }

    function Point(x, y) {
        this.x = x
        this.y = y

        this.getVectorToCoordinates = function (x, y) {
            return new Vector(x - this.x, y - this.y)
        }
        this.getVectorFromCoordinates = function (x, y) {
            return this.getVectorToCoordinates(x, y).reverse()
        }
        this.getVectorToPoint = function (point) {
            return new Vector(point.x - this.x, point.y - this.y)
        }
        this.getVectorFromPoint = function (point) {
            return this.getVectorToPoint(point).reverse()
        }
    }

    /**
    Allows one to round a number to arbitrary precision.
    Math.round() rounds to whole only.
    Number.toFixed(precision) returns a string.
    I need float to float, but with arbitrary precision, hence:
    
    @public
    @function
    @param number {Number}
    @param position {Number} number of digits right of decimal point to keep. If negative, rounding to the left of decimal.
    @returns {Type}
    */
    function round(number, position) {
        var tmp = Math.pow(10, position)
        return Math.round(number * tmp) / tmp
    }

    //	/**
    //	 * This is a simple, points-to-lines (not curves) renderer. 
    //	 * Keeping it around so we can activate it from time to time and see
    //	 * if smoothing logic is off much.
    //	 * @public
    //	 * @function
    //	 * @returns {String} Like so "l 1 2 3 5' with stroke as long line chain. 
    //	 */
    //	function compressstroke(stroke, shiftx, shifty){
    //		// we combine strokes data into string like this:
    //		// 'M 53 7 l 1 2 3 4 -5 -6 5 -6'
    //		// see SVG documentation for Path element's 'd' argument.
    //		var lastx = stroke.x[0]
    //		, lasty = stroke.y[0]
    //		, i
    //		, l = stroke.x.length
    //		, answer = ['M', lastx - shiftx, lasty - shifty, 'l']
    //		
    //		if (l === 1){
    //			// meaning this was just a DOT, not a stroke.
    //			// instead of creating a circle, we just create a short line
    //			answer.concat(1, -1)
    //		} else {
    //			for(i = 1; i < l; i++){
    //				answer = answer.concat(stroke.x[i] - lastx, stroke.y[i] - lasty)
    //				lastx = stroke.x[i]
    //				lasty = stroke.y[i]
    //			}
    //		}
    //		return answer.join(' ')
    //	} 

    function segmentToCurve(stroke, positionInStroke, lineCurveThreshold) {
        'use strict'
        // long lines (ones with many pixels between them) do not look good when they are part of a large curvy stroke.
        // You know, the jaggedy crocodile spine instead of a pretty, smooth curve. Yuck!
        // We want to approximate pretty curves in-place of those ugly lines.
        // To approximate a very nice curve we need to know the direction of line before and after.
        // Hence, on long lines we actually wait for another point beyond it to come back from
        // mousemoved before we draw this curve.

        // So for "prior curve" to be calc'ed we need 4 points 
        // 	A, B, C, D (we are on D now, A is 3 points in the past.)
        // and 3 lines:
        //  pre-line (from points A to B), 
        //  this line (from points B to C), (we call it "this" because if it was not yet, it's the only one we can draw for sure.) 
        //  post-line (from points C to D) (even through D point is 'current' we don't know how we can draw it yet)
        //
        // Well, actually, we don't need to *know* the point A, just the vector A->B

        // Again, we can only derive curve between points positionInStroke-1 and positionInStroke
        // Thus, since we can only draw a line if we know one point ahead of it, we need to shift our focus one point ahead.
        positionInStroke += 1
        // Let's hope the code that calls us knows we do that and does not call us with positionInStroke = index of last point.

        var Cpoint = new Point(stroke.x[positionInStroke - 1], stroke.y[positionInStroke - 1])
            , Dpoint = new Point(stroke.x[positionInStroke], stroke.y[positionInStroke])
            , CDvector = Cpoint.getVectorToPoint(Dpoint)
        // Again, we have a chance here to draw only PREVIOUS line segment - BC

        // So, let's start with BC curve.
        // if there is only 2 points in stroke array (C, D), we don't have "history" long enough to have point B, let alone point A.
        // so positionInStroke should start with 2, ie
        // we are here when there are at least 3 points in stroke array.
        var Bpoint = new Point(stroke.x[positionInStroke - 2], stroke.y[positionInStroke - 2])
            , BCvector = Bpoint.getVectorToPoint(Cpoint)
            , ABvector
            , rounding = 2

        if (BCvector.getLength() > lineCurveThreshold) {
            // Yey! Pretty curves, here we come!
            if (positionInStroke > 2) {
                ABvector = (new Point(stroke.x[positionInStroke - 3], stroke.y[positionInStroke - 3])).getVectorToPoint(Bpoint)
            } else {
                ABvector = new Vector(0, 0)
            }
            var minlenfraction = 0.05
                , maxlen = BCvector.getLength() * 0.35
                , ABCangle = BCvector.angleTo(ABvector.reverse())
                , BCDangle = CDvector.angleTo(BCvector.reverse())
                , BtoCP1vector = new Vector(ABvector.x + BCvector.x, ABvector.y + BCvector.y).resizeTo(
                    Math.max(minlenfraction, ABCangle) * maxlen
                )
                , CtoCP2vector = (new Vector(BCvector.x + CDvector.x, BCvector.y + CDvector.y)).reverse().resizeTo(
                    Math.max(minlenfraction, BCDangle) * maxlen
                )
                , BtoCP2vector = new Vector(BCvector.x + CtoCP2vector.x, BCvector.y + CtoCP2vector.y)

            // returing curve for BC segment
            // all coords are vectors against Bpoint
            return [
                'c' // bezier curve
                , round(BtoCP1vector.x, rounding)
                , round(BtoCP1vector.y, rounding)
                , round(BtoCP2vector.x, rounding)
                , round(BtoCP2vector.y, rounding)
                , round(BCvector.x, rounding)
                , round(BCvector.y, rounding)
            ]
        } else {
            return [
                'l' // line
                , round(BCvector.x, rounding)
                , round(BCvector.y, rounding)
            ]
        }
    }

    function lastSegmentToCurve(stroke, lineCurveThreshold) {
        'use strict'
        // Here we tidy up things left unfinished

        // What's left unfinished there is the curve between the last points
        // in the stroke
        // We can also be called when there is only one point in the stroke (meaning, the 
        // stroke was just a dot), in which case there is nothing for us to do.

        // So for "this curve" to be calc'ed we need 3 points 
        // 	A, B, C
        // and 2 lines:
        //  pre-line (from points A to B), 
        //  this line (from points B to C) 
        // Well, actually, we don't need to *know* the point A, just the vector A->B
        // so, we really need points B, C and AB vector.
        var positionInStroke = stroke.x.length - 1

        // there must be at least 2 points in the stroke.for us to work. Hope calling code checks for that.
        var Cpoint = new Point(stroke.x[positionInStroke], stroke.y[positionInStroke])
            , Bpoint = new Point(stroke.x[positionInStroke - 1], stroke.y[positionInStroke - 1])
            , BCvector = Bpoint.getVectorToPoint(Cpoint)
            , rounding = 2

        if (positionInStroke > 1 && BCvector.getLength() > lineCurveThreshold) {
            // we have at least 3 elems in stroke
            var ABvector = (new Point(stroke.x[positionInStroke - 2], stroke.y[positionInStroke - 2])).getVectorToPoint(Bpoint)
                , ABCangle = BCvector.angleTo(ABvector.reverse())
                , minlenfraction = 0.05
                , maxlen = BCvector.getLength() * 0.35
                , BtoCP1vector = new Vector(ABvector.x + BCvector.x, ABvector.y + BCvector.y).resizeTo(
                    Math.max(minlenfraction, ABCangle) * maxlen
                )

            return [
                'c' // bezier curve
                , round(BtoCP1vector.x, rounding)
                , round(BtoCP1vector.y, rounding)
                , round(BCvector.x, rounding) // CP2 is same as Cpoint
                , round(BCvector.y, rounding) // CP2 is same as Cpoint
                , round(BCvector.x, rounding)
                , round(BCvector.y, rounding)
            ]
        } else {
            // Since there is no AB leg, there is no curve to draw. This is just line
            return [
                'l' // simple line
                , round(BCvector.x, rounding)
                , round(BCvector.y, rounding)
            ]
        }
    }

    function addstroke(stroke, shiftx, shifty) {
        'use strict'
        // we combine strokes data into string like this:
        // 'M 53 7 l 1 2 c 3 4 -5 -6 5 -6'
        // see SVG documentation for Path element's 'd' argument.
        var lines = [
            'M' // move to
            , round((stroke.x[0] - shiftx), 2)
            , round((stroke.y[0] - shifty), 2)
        ]
            // processing all points but first and last. 
            , i = 1 // index zero item in there is STARTING point. we already extracted it.
            , l = stroke.x.length - 1 // this is a trick. We are leaving last point coordinates for separate processing.
            , lineCurveThreshold = 1

        for (; i < l; i++) {
            lines.push.apply(lines, segmentToCurve(stroke, i, lineCurveThreshold))
        }
        if (l > 0 /* effectively more than 1, since we "-1" above */) {
            lines.push.apply(lines, lastSegmentToCurve(stroke, i, lineCurveThreshold))
        } else if (l === 0) {
            // meaning we only have ONE point in the stroke (and otherwise refer to the stroke as "dot")
            lines.push.apply(lines, ['l', 1, 1])
        }
        return lines.join(' ')
    }

    function simplifystroke(stroke) {
        var d = []
            , newstroke = { 'x': [], 'y': [] }
            , i, l

        for (i = 0, l = stroke.x.length; i < l; i++) {
            d.push({ 'x': stroke.x[i], 'y': stroke.y[i] })
        }
        d = simplify(d, 0.7, true)
        for (i = 0, l = d.length; i < l; i++) {
            newstroke.x.push(d[i].x)
            newstroke.y.push(d[i].y)
        }
        return newstroke
    }

    function compressstrokes(data) {
        'use strict'
        var answer = [
            '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
            , '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'
        ]
            , i, l = data.length
            , stroke
            , xlimits = []
            , ylimits = []
            , sizex = 0
            , sizey = 0
            , shiftx = 0
            , shifty = 0
            , minx, maxx, miny, maxy, padding = 1
            , simplifieddata = []

        if (l !== 0) {
            for (i = 0; i < l; i++) {
                stroke = simplifystroke(data[i])
                simplifieddata.push(stroke)
                xlimits = xlimits.concat(stroke.x)
                ylimits = ylimits.concat(stroke.y)
            }

            minx = Math.min.apply(null, xlimits) - padding
            maxx = Math.max.apply(null, xlimits) + padding
            miny = Math.min.apply(null, ylimits) - padding
            maxy = Math.max.apply(null, ylimits) + padding
            shiftx = minx < 0 ? 0 : minx
            shifty = miny < 0 ? 0 : miny
            sizex = maxx - minx
            sizey = maxy - miny
        }

        answer.push(
            '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' +
            sizex.toString() +
            '" height="' +
            sizey.toString() +
            '">'
        )

        //		// This is a nice idea: use style declaration on top, and mark the lines with 'class="f"'
        //		// thus saving space in svg... 
        //		// alas, many SVG renderers don't understand "class" and render the strokes in default "fill = black, no stroke" style. Ugh!!!
        //		// TODO: Rewrite ImageMagic / GraphicsMagic, InkScape, http://svg.codeplex.com/ to support style + class. until then, we hardcode the stroke style within the path. 
        //		answer.push(
        //			'<style type="text/css"><![CDATA[.f {fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}]]></style>'
        //		)

        //		// This set is accompaniment to "simple line renderer" - compressstroke
        //		answer.push(
        //			'<style type="text/css"><![CDATA[.t {fill:none;stroke:#FF0000;stroke-width:2}]]></style>'
        //		)
        //		for(i = 0; i < l; i++){
        //			stroke = data[i]
        //			// This one is accompaniment to "simple line renderer"
        //			answer.push('<path class="t" d="'+ compressstroke(stroke, shiftx, shifty) +'"/>')
        //		}

        for (i = 0, l = simplifieddata.length; i < l; i++) {
            stroke = simplifieddata[i]
            answer.push('<path fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="' + addstroke(stroke, shiftx, shifty) + '"/>')
        }
        answer.push('</svg>')
        return answer.join('')
    }

    if (typeof btoa !== 'function') {
        var btoa = function (data) {
            /** @preserve
            base64 encoder
            MIT, GPL
            http://phpjs.org/functions/base64_encode
            +   original by: Tyler Akins (http://rumkin.com)
            +   improved by: Bayron Guevara
            +   improved by: Thunder.m
            +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            +   bugfixed by: Pellentesque Malesuada
            +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            +   improved by: Rafal Kukawski (http://kukawski.pl)
            
            */
            var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
                , b64a = b64.split('')
                , o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                ac = 0,
                enc = "",
                tmp_arr = [];

            do { // pack three octets into four hexets
                o1 = data.charCodeAt(i++);
                o2 = data.charCodeAt(i++);
                o3 = data.charCodeAt(i++);

                bits = o1 << 16 | o2 << 8 | o3;

                h1 = bits >> 18 & 0x3f;
                h2 = bits >> 12 & 0x3f;
                h3 = bits >> 6 & 0x3f;
                h4 = bits & 0x3f;

                // use hexets to index into b64, and append result to encoded string
                tmp_arr[ac++] = b64a[h1] + b64a[h2] + b64a[h3] + b64a[h4];
            } while (i < data.length);

            enc = tmp_arr.join('');
            var r = data.length % 3;
            return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

            // end of base64 encoder MIT, GPL
        }
    }

    var unencodedmime = 'image/svg+xml'
    function getUnencodedSVG(data) {
        return [unencodedmime, compressstrokes(data)]
    }

    var base64encodedmime = 'image/svg+xml;base64'
    function getBase64encodedSVG(data) {
        return [base64encodedmime, btoa(compressstrokes(data))]
    }

    function Initializer($) {
        var mothership = $.fn['jSignature']
        mothership(
            'addPlugin'
            , 'export'
            , 'svg' // alias
            , getUnencodedSVG
        )
        mothership(
            'addPlugin'
            , 'export'
            , unencodedmime // full name
            , getUnencodedSVG
        )
        mothership(
            'addPlugin'
            , 'export'
            , 'svgbase64' // alias
            , getBase64encodedSVG
        )
        mothership(
            'addPlugin'
            , 'export'
            , base64encodedmime // full name
            , getBase64encodedSVG
        )
    }

    //  //Because plugins are minified together with jSignature, multiple defines per (minified) file blow up and dont make sense
    //	//Need to revisit this later.

    if (typeof $ === 'undefined') { throw new Error("We need jQuery for some of the functionality. jQuery is not detected. Failing to initialize...") }
    Initializer($)

})();
/** @license
jSignature v2 jSignature's Undo Button and undo functionality plugin

*/
/**
Copyright (c) 2011 Willow Systems Corp http://willow-systems.com
MIT License <http://www.opensource.org/licenses/mit-license.php>
*/

; (function () {

    var apinamespace = 'jSignature'

    function attachHandlers(buttonRenderer, apinamespace, extensionName) {
        var $undoButton = buttonRenderer.call(this)

            ; (function (jSignatureInstance, $undoButton, apinamespace) {
                jSignatureInstance.events.subscribe(
                    apinamespace + '.change'
                    , function () {
                        if (jSignatureInstance.dataEngine.data.length) {
                            $undoButton.show()
                        } else {
                            $undoButton.hide()
                        }
                    }
                )
            })(this, $undoButton, apinamespace)

            ; (function (jSignatureInstance, $undoButton, apinamespace) {

                var eventName = apinamespace + '.undo'

                $undoButton.bind('click', function () {
                    jSignatureInstance.events.publish(eventName)
                })

                // This one creates new "undo" event listener to jSignature instance
                // It handles the actual undo-ing.
                jSignatureInstance.events.subscribe(
                    eventName
                    , function () {
                        var data = jSignatureInstance.dataEngine.data
                        if (data.length) {
                            data.pop()
                            jSignatureInstance.resetCanvas(data)
                        }
                    }
                )
            })(
                this
                , $undoButton
                , this.events.topics.hasOwnProperty(apinamespace + '.undo') ?
                    // oops, seems some other plugin or code has already claimed "jSignature.undo" event
                    // we will use this extension's name for event name prefix
                    extensionName :
                    // Great! we will use 'jSignature' for event name prefix.
                    apinamespace
            )
    }

    function ExtensionInitializer(extensionName) {
        // we are called very early in instance's life.
        // right after the settings are resolved and 
        // jSignatureInstance.events is created 
        // and right before first ("jSignature.initializing") event is called.
        // You don't really need to manupilate 
        // jSignatureInstance directly, just attach
        // a bunch of events to jSignatureInstance.events
        // (look at the source of jSignatureClass to see when these fire)
        // and your special pieces of code will attach by themselves.

        // this function runs every time a new instance is set up.
        // this means every var you create will live only for one instance
        // unless you attach it to something outside, like "window."
        // and pick it up later from there.

        // when globalEvents' events fire, 'this' is globalEvents object
        // when jSignatureInstance's events fire, 'this' is jSignatureInstance

        // Here,
        // this = is new jSignatureClass's instance.

        // The way you COULD approch setting this up is:
        // if you have multistep set up, attach event to "jSignature.initializing"
        // that attaches other events to be fired further lower the init stream.
        // Or, if you know for sure you rely on only one jSignatureInstance's event,
        // just attach to it directly

        var apinamespace = 'jSignature'

        this.events.subscribe(
            // name of the event
            apinamespace + '.attachingEventHandlers'
            // event handlers, can pass args too, but in majority of cases,
            // 'this' which is jSignatureClass object instance pointer is enough to get by.
            , function () {

                // hooking up "undo" button	to lower edge of Canvas.
                // but only when options passed to jSignature('init', options)
                // contain "undoButton":renderingFunction pair.
                // or "undoButton":true (in which case default, internal rendering fn is used)
                if (this.settings[extensionName]) {
                    var oursettings = this.settings[extensionName]
                    if (typeof oursettings !== 'function') {
                        // we make it a function.

                        // we allow people to override the button rendering code,
                        // but when developler is OK with default look (and just passes "truthy" value)
                        // this defines default look for the button:
                        // centered against canvas, hanging on its lower side.
                        oursettings = function () {
                            // this === jSignatureInstance 
                            var undoButtonSytle = 'position:absolute;display:none;margin:0 !important;top:auto'
                                , $undoButton = $('<button type="button" value="ยกเลิกเส้นสุดท้าย" class="btn btn-sm mb-2" style="' + undoButtonSytle + '"><i class="bi bi-arrow-counterclockwise"></i> ยกเลิกเส้นสุดท้าย</button>')
                                    .appendTo(this.$controlbarLower)

                            // this centers the button against the canvas.
                            var buttonWidth = $undoButton.width()
                            $undoButton.css(
                                'right'
                                , Math.round((this.canvas.width - buttonWidth) / 2)
                            )
                            // IE 7 grows the button. Correcting for that.
                            if (buttonWidth !== $undoButton.width()) {
                                $undoButton.width(buttonWidth)
                            }

                            return $undoButton
                        }
                    }

                    attachHandlers.call(
                        this
                        , oursettings
                        , apinamespace
                        , extensionName
                    )
                }
            }
        )
    }

    var ExtensionAttacher = function () {
        $.fn[apinamespace](
            'addPlugin'
            , 'instance' // type of plugin
            , 'UndoButton' // extension name
            , ExtensionInitializer
        )
    }


    //  //Because plugins are minified together with jSignature, multiple defines per (minified) file blow up and dont make sense
    //	//Need to revisit this later.

    //	if ( typeof define === "function" && define.amd != null) {
    //		// AMD-loader compatible resource declaration
    //		// you need to call this one with jQuery as argument.
    //		define(function(){return Initializer} )
    //	} else {
    ExtensionAttacher()
    //	}

})();