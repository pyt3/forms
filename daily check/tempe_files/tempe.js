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
// console.log("🚀 ~ testobj", testobj)
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
    $('#month').text(month)
    $('#year').text(year_bd)
    $('#dept').text(e_dept)
    $('#refrig-no').text(e_code)
    let weeknum = 1
    let week_check = {}
    if (testobj['DAY']) {
        let coords =[]
        Object.keys(testobj['DAY']).forEach(key => {
            console.log("🚀 ~ key:", key)
            let date = ('00' + key.split('/')[0]).slice(-2)
            let point = getClostestPoint(testobj['DAY'][key].temp)
            let key_point = `${point}-${date}-d`
            $('[id="'+key_point+'"]').text('✘')
            // get position of point
            // let point_position = getPointPosition($('[id="' + key_point + '"]'))
            // coords.push(point_position)
            coords.push($('[id="' + key_point + '"]')[0])
            $('[id="sign-'+date+'-d"]').attr('src', testobj['DAY'][key].signature_staff).show()
            // console.log("🚀 ~ point_position:", point_position)
        })
        // connect all point
        coords = coords.filter(item => item != undefined)
        connectAllPoint(coords)
    }
    if (testobj['NIGHT']) {
        let coords =[]
        Object.keys(testobj['NIGHT']).forEach(key => {
            console.log("🚀 ~ key:", key)
            let date = ('00' + key.split('/')[0]).slice(-2)
            let point = getClostestPoint(testobj['NIGHT'][key].temp)
            let key_point = `${point}-${date}-n`
            $('[id="'+key_point+'"]').text('✘')
            coords.push($('[id="' + key_point + '"]')[0])
            $('[id="sign-'+date+'-n"]').attr('src', testobj['NIGHT'][key].signature_staff).show()
        })

        coords = coords.filter(item => item != undefined)
        connectAllPoint(coords)
    }


    let imgs = document.querySelectorAll('.isloading')
    let len = imgs.length
    console.log("🚀 ~ len", len)
    let count = 0
    imgs.forEach(function (img) {
        if (img.complete) incrementCounter();
        else img.addEventListener('load', incrementCounter, false);
    })

    function getPointPosition(ele){
        let position = ele.position()
        if(!position) return
        console.log("🚀 ~ position:", position)
        let width = ele.width()
        let height = ele.height()
        let x = position.left + width/2
        let y = position.top + height/2
        return {x, y}
    }

    function connectAllPoint(coords){
        $(window).on('beforeprint', function () {
            let start_point = coords[0]
            console.log("🚀 !! start_point:", $(start_point).position())
            $('.leader-line').each(function(){
                $(this).css('left', ($(this).position().left - 176) + 'px')
                $(this).css('top', ($(this).position().top - 13) + 'px')
            })
        }).on('afterprint', function () {
            $('.leader-line').each(function(){
                $(this).css('left', ($(this).position().left + 176) + 'px')
                $(this).css('top', ($(this).position().top + 14) + 'px')
            })
        });
        for (let i = 0; i < coords.length - 1; i++) {
            if (coords[i + 1] == null || coords[i + 1] == undefined) continue
            new LeaderLine(coords[i], coords[i + 1], {
                path: 'straight',
                startPlug: 'disc',
                endPlug: 'behind',
                startSocket: 'right',
                endSocket: 'left',
                startPlugSize: 0.8,
                
                
                // endPlugSize: 2,
                size: 3,
            })
        }
    }

    function incrementCounter() {
        count++;
        Swal.update({
            title: Math.floor(count / len * 100) + '%'
        })
        if (count === len) {
            setTimeout(() => {
                Swal.close()
                setTimeout(() => { window.print() }, 1000)

            }, 200);
        }
    }
})

function getClostestPoint(temp) {
    let upper = Math.ceil(Number(temp))
    let lower = Math.floor(Number(temp))
    let middle = (upper + lower) / 2
    let closest = 100
    new Array(upper, lower, middle).forEach(a => {
        if (Math.abs(a - temp) <= closest) {
            closest = a
        }
    })
    return closest
}

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
