Swal.fire({
    icon: 'info',
    title: '0%',
    html: 'กำลังสร้างรายงาน',
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
})
var testobj = JSON.parse(localStorage.getItem('report_obj'))
console.log("🚀 ~ testobj", testobj)
var tempkey = Object.keys(testobj['DAY'])[0]



var e_code = testobj['DAY'][tempkey].e_code
var e_brand = testobj['DAY'][tempkey].e_brand
var e_model = testobj['DAY'][tempkey].e_model
var e_dept = testobj['DAY'][tempkey].e_dept
console.log("🚀 ~ e_dept", e_dept)
var month = new Date(testobj['DAY'][tempkey].time).toLocaleString('en-En', { month: 'long' })
var month_num = new Date(testobj['DAY'][tempkey].time).getMonth() + 1
var year = new Date(testobj['DAY'][tempkey].time).getFullYear()
var year_bd = year + 543
var q_key = {
    1: "daily-check-system",
    2: 'daily-check-switch',
    3: 'daily-check-paddle',
    4: 'daily-check-ekg',
    5: 'daily-check-adhesive',
    6: 'daily-check-reddot',
    7: 'daily-check-transmissiongel',
    8: 'daily-check-ekgpaper',
    9: 'daily-check-cord',
    10: 'daily-check-time',
    11: 'daily-check-power',
    12: 'afteruse-check-battery',
    13: 'afteruse-check-clean',
    staff: 'signature_staff',
    manager: 'signature_manager',
    staff_afteruse: 'signature_staff_afteruse',
    manager_afteruse: 'signature_manager_afteruse',
}

$(document).ready(() => {
    $('[name="e_brand"]').text(e_brand + " / " + e_model)
    $('[name="e_code"]').text(e_code)
    $('[name="e_dept"]').text(e_dept.split('(')[0])
    $('[name="month"]').text(month)
    $('[name="year"]').text(year)
    let weeknum = 1
    let week_check = {}
    Object.keys(testobj).forEach(key => {
        console.log("🚀 ~ key", key)
        let paper = '.' + key.toLowerCase()
        for (let i = 1; i <= 13; i++) {
            for (let j = 1; j <= 31; j++) {
                let q = testobj[key][j + '/' + month_num + '/' + year_bd]
                q = q ? mapSign(q[q_key[i]]) : ""
                $(paper + ' [name="defib-' + i + '-' + j + '"]').text(q).css('color', 'blue')
            }
        }

        for (let i = 1; i <= 31; i++) {
            let q = testobj[key][i + '/' + month_num + '/' + year_bd]
            if (q) {
                let day = new Date(q['time'])
                if (day.getDay() == 1) {
                    week_check[i + '/' + month_num + '/' + year_bd] = q
                }
            }
            else q = ''
            $(paper + ' [name="defib-approve' + '-' + i + '"]').replaceWith($('<img>', { src: q[q_key['manager']], class: 'rot270 ' + (q[q_key['manager']] ? 'isloading' : '') }))
            $(paper + ' [name="defib-sign' + '-' + i + '"]').replaceWith($('<img>', { src: q[q_key['staff']], class: 'rot270 ' + (q[q_key['staff']] ? 'isloading' : '') }))
            $(paper + ' [name="defib-afteruse-approve' + '-' + i + '"]').replaceWith($('<img>', { src: q[q_key['manager_afteruse']], class: 'rot270 ' + (q[q_key['manager_afteruse']] ? 'isloading' : '') }))
            $(paper + ' [name="defib-afteruse-sign' + '-' + i + '"]').replaceWith($('<img>', { src: q[q_key['staff_afteruse']], class: 'rot270 ' + (q[q_key['staff_afteruse']] ? 'isloading' : '') }))
        }
        console.log(week_check)





    })
    let keys = Object.keys(week_check).sort((a, b) => a.split('/')[0] - b.split('/')[0])
    console.log("🚀 ~ keys", keys)
    for (let i = 5; i < keys.length; i--) {
        console.log("🚀 ~ i", i)
        $('[name="paper-week-' + i + '"]').remove()
    }
    keys.forEach((key, weeknum) => {
        console.log("🚀 ~ weeknum", weeknum)
        console.log("🚀 ~ key", key)
        let q = week_check[key]
        console.log("🚀 ~ q", q)
        let target = $('[name="paper-week-' + (weeknum + 1) + '"]')
        let img = $('<img>', { src: q.img_url, id: 'paper-week-' + (weeknum + 1), height: 17 * 6.2 }).addClass('paper-week')
        target.replaceWith($('<center>').append(img))
        $('[name="date-week-' + (weeknum + 1) + '"]').text(key)
        $('[name="staff-week-' + (weeknum + 1) + '"]').html($('<span>').text(q.rec_name)).append('&nbsp;&nbsp;&nbsp;')
        $('[name="staff-week-' + (weeknum + 1) + '"]').append($('<img>', { src: q.signature_staff, height: '17pt', class: (q.signature_staff ? 'isloading' : '') }))
        $('[name="approve-week-' + (weeknum + 1) + '"]').html($('<span>').text(q.approve_name)).append('&nbsp;&nbsp;&nbsp;')
        $('[name="approve-week-' + (weeknum + 1) + '"]').append($('<img>', { src: q.signature_manager, height: '17pt', class: (q.signature_manager ? 'isloading' : '') }))

    })

    $('.paper-week').on('load', function () {
        let img = $(this)
        let id = img.attr('id')
        let imgHeight = img.height()
        let imgWidth = img.width()
        if (imgHeight > imgWidth) {
            img.css('width', imgHeight)
            img.css('height', imgHeight / imgWidth * imgHeight)
            img.css('transform', 'rotate(270deg) translate(-' + (imgHeight + 1) + 'px, ' + (-imgHeight / 4) + 'px)')
            img.css('transform-origin', '0 0')
            let parent = img.parent()
            parent.css('max-height', imgWidth)
        }

    })

    let imgs = document.querySelectorAll('.isloading')
    let len = imgs.length
    console.log("🚀 ~ len", len)
    let count = 0
    imgs.forEach(function (img) {
        if (img.complete) incrementCounter();
        else img.addEventListener('load', incrementCounter, false);
    })

    function incrementCounter() {
        count++;
        Swal.update({
            title: Math.floor(count / len * 100) + '%'
        })
        if (count === len) {
            setTimeout(() => {
                Swal.close()
                window.print()
            }, 600);
        }
    }
})

function mapSign(text) {
    switch (text) {
        case "ผ่าน":
            return "✔"
        case "ไม่ผ่าน":
            return "✘"
        case "N/A":
            return "-"
        default:
            return ''
    }
}