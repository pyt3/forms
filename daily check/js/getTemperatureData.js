async function getTemperatureTableData(session) {

    // if (session) {
    //     return firestore.collection(client).where('sessionid', '==', session.sessionid).get().then(function (querySnapshot) {
    //         
    //         if (querySnapshot.docs.length > 0) {
    //             user = querySnapshot.docs[0].data()
    //             getTemperatureTableData()
    //         }
    //     });
    // } else {
    let temperatureRef, temperatureRef2, temperatureRef3
    let now = new Date()
    let before30days = now.setDate(now.getDate() - 30)
    if (user.level == 'director') {
        if (user.site == 'all') {
            console.log("🚀 ~ user.site", user.site)
            temperatureRef = firestore.collection('PYT3')
                .where('form', '==', 'temperature')
                .where('time', '>=', before30days)
                .orderBy('time', 'desc')
            temperatureRef2 = firestore.collection("PYT2")
                .where('form', '==', 'temperature')
                .where('time', '>=', before30days)
                .orderBy('time', 'desc')
            temperatureRef3 = firestore.collection("PYT1")
                .where('form', '==', 'temperature')
                .where('time', '>=', before30days)
                .orderBy('time', 'desc')
            temperatureRef4 = firestore.collection("PLP")
                .where('form', '==', 'temperature')
                .where('time', '>=', before30days)
                .orderBy('time', 'desc')
        } else {
            temperatureRef = firestore.collection(client)
                .where('form', '==', 'temperature')
                .where('time', '>=', before30days)
                .orderBy('time', 'desc')
        }

    } else if (user.level == 'manager') {
        temperatureRef = firestore.collection(client)
            .where('form', '==', 'temperature')
            .where('e_dept', '==', user.name)
            .where('time', '>=', before30days)
            .orderBy('time', 'desc')
            .limit(20)
        temperatureRef2 = firestore.collection(client)
            .where('form', '==', 'temperature')
            .where('rec_dept', '==', user.name)
            .where('time', '>=', before30days)
            .orderBy('time', 'desc')
            .limit(20)
        // 
    }
    const setIspass = function (obj) {
        let isPass = obj.temp >= 2 && obj.temp <= 8
        obj.isPass = isPass

        return obj
    }
    let promises = await Promise.all([temperatureRef.get(), temperatureRef2.get()])
    promises = promises.map(querySnapshot => {
        let data = querySnapshot.docs.map(function (doc) {
            let obj = setIspass(doc.data())
            return obj
        })
        return data
    })
    promises = promises.flat()
    if (temperatureRef3 && temperatureRef4) {
        let promises2 = await Promise.all([temperatureRef3.get(), temperatureRef4.get()])
        promises2 = promises2.map(querySnapshot => {
            let data = querySnapshot.docs.map(function (doc) {
                let obj = setIspass(doc.data())
                return obj
            })
            return data
        })
        promises2 = promises2.flat()
        promises = promises.concat(promises2)
        promises = promises.sort((a, b) => b.time - a.time)
        tabledata = promises
        createTemperatureTable(promises)

    } else {
        promises = promises.filter((v, i, a) => a.findIndex(v2 => (v2.time === v.time)) === i)
        promises = promises.sort((a, b) => b.time - a.time)
        tablepromises = promises
        createTemperatureTable(promises)
    }
    $('#admin-div').show()
}
var table
function createTemperatureTable(data) {
    $('#temperature-display-approved').change(function () {
        if ($(this).is(':checked')) {
            table
                .column(9) // or columns???
                .search('^$', true, false)
                .draw();
        } else {
            table
                .column(9) // or columns???
                .search('')
                .draw();
        }
    })
    let notapproved = data.filter(v => v.signature_staff != '' && !v.signature_manager)
    if (notapproved.length > 0) {
        Swal.fire({
            title: 'คุณมี Daily Check ที่ยังไม่อนุมัติ จำนวน ' + notapproved.length + ' รายการ',
            confirmButtonText: 'แสดงรายการที่ไม่อนุมัติ',
            showCancelButton: true,
            cancelButtonText: 'แสดงรายการทั้งหมด',
        }).then(result => {
            if (result.isConfirmed) {
                $('#temperature-display-approved').attr('checked', true).change()
            }
        })
    }
    $('#temperature .table-responsive').html('').append(`<table id="temperature-table-data" class="table table-hover table-bordered" style="width: 100%">
            <thead class="bg-primary text-center text-white text-nowrap"></thead>
            <tbody class="bg-white"></tbody>
        </table>`)
    table = $('#temperature-table-data').DataTable({
        data: data,
        scrollX: true,
        createdRow: function (row, data, dataIndex) {

            if (data.signature_staff != '' && !data.signature_manager) {
                console.log("🚀 ~ data", data)
                $(row).addClass('bg-warning')
            }
        },
        columnDefs: [
            {
                targets: '_all',
                className: 'align-middle text-center'
            },
            {
                targets: [0],
                visible: false,
            }
        ],
        columns: [
            {
                data: 'time',
                title: 'time',
            },
            {
                data: 'date',
                title: 'วันที่',
            },
            {
                data: 'time',
                title: 'รายละเอียด',
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-link" onclick="getTemperatureDetail(`' + JSON.stringify(row).replace(/\"/g, "'") + '`,' + meta.row + ')">Click!</button>'
                }

            },
            {
                data: 'form',
                title: 'ชื่อเครื่อง'
            },
            {
                data: 'temp',
                title: 'อุณหภูมิ',
            },
            {
                data: 'e_code',
                title: 'รหัสเครื่อง'
            },
            {
                data: 'rec_name',
                title: 'ผู้บันทึก',
                render: function (data, type) {
                    if (!data) return ''
                    return data
                }
            },
            {
                data: 'signature_staff',
                title: 'ลายเซ็นผู้บันทึก',
                render: function (data, type) {
                    if (!data) return ''
                    if (typeof data == 'string' && data.indexOf('https') > -1)
                        return `<img src="${data}" height="25px">`
                    return data;
                }
            },
            {
                data: 'isPass',
                title: 'ผลการตรวจเช็ค',
                render: function (data, type) {
                    if (data)
                        return `<span class="badge rounded-pill bg-success status-pill"><i class="bi bi-check-circle-fill"></i>&nbsp;ผ่าน</span>`
                    return `<span class="badge rounded-pill bg-danger status-pill"><i class="bi bi-x-circle-fill"></i>&nbsp;ไม่ผ่าน</span>`;
                }
            },
            {
                data: 'approve_name',
                title: 'ผู้อนุมัติ',
                render: function (data, type) {
                    if (!data) return ''
                    return data
                }
            },
            {
                data: 'signature_manager',
                title: 'ลายเซ็นผู้อนุมัติ',
                render: function (data, type) {
                    if (!data) return ''
                    if (typeof data == 'string' && data.indexOf('https') > -1)
                        return `<img src="${data}" height="25px">`
                    return data;
                }
            },
            // {
            //     data: 'afteruse_rec_name',
            //     title: 'ผู้บันทึกหลังใช้',
            //     render: function (data, type) {
            //         if (!data) return ''
            //         return data
            //     }
            // },
            // {
            //     data: 'signature_staff_afteruse',
            //     title: 'ลายเซ็นผู้บันทึกหลังใช้',
            //     className: 'text-center',
            //     render: function (data, type) {
            //         if (!data) return ''
            //         if (typeof data == 'string' && data.indexOf('https') > -1)
            //             return `<img src="${data}" height="25px">`
            //         return data;
            //     }
            // },
            // {
            //     data: 'isPass_afteruse',
            //     title: 'ผลการตรวจเช็คหลังใช้',
            //     className: 'text-center',
            //     render: function (data, type) {
            //         if (data == undefined) return ''
            //         if (data)
            //             return `<span class="badge rounded-pill bg-success status-pill"><i class="bi bi-check-circle-fill"></i>&nbsp;ผ่าน</span>`
            //         return `<span class="badge rounded-pill bg-danger status-pill"><i class="bi bi-x-circle-fill"></i>&nbsp;ไม่ผ่าน</span>`;
            //     }
            // },
            // {
            //     data: 'afteruse_approve_name',
            //     title: 'ผู้อนุมัติหลังใช้',
            //     render: function (data, type) {
            //         if (!data) return ''
            //         return data
            //     }
            // },
            // {
            //     data: 'signature_manager_afteruse',
            //     title: 'ลายเซ็นผู้อนุมัติหลังใช้',
            //     className: 'text-center',
            //     render: function (data, type) {
            //         if (!data) return ''
            //         if (typeof data == 'string' && data.indexOf('https') > -1)
            //             return `<img src="${data}" height="25px">`
            //         return data;
            //     }
            // },
        ]
    });
    table.draw(false)
}



var rowIndex
function getTemperatureDetail(row, index) {
    rowIndex = index
    let obj = JSON.parse(row.replace(/'/g, '"'))
    let detailHtml = `
             <div class="container-fluid">
        <div class="row">
            <div class="col-md-6">
                <p>Date: <span class="text-primary">${obj.date}</span></p>
            </div>
            <div class="col-md-6">
                <p>Equipment: <span class="text-primary">${obj.form.toUpperCase()}</span></p>
            </div>
            <div class="col-md-6">
                <p>Brand: <span class="text-primary">${obj.e_brand}</span></p>
            </div>
            <div class="col-md-6">
                <p>Code: <span class="text-primary">${obj.e_code}</span></p>
            </div>
            <div class="col-md-12">
                <p>Department: <span class="text-primary">${obj.e_dept}</span></p>
            </div>
            <div class="col-md-12" style="display: none" id="ref_time">
                ${obj.time}
            </div>
            <div class="col-md-12" style="display: none" id="row_index">
                ${rowIndex}
            </div>
            <div class="col-md-12">
                <p>รายการตรวจเช็ค: <span class="text-primary"></span></p>
                <ol>
                    <li>
                        อุณหภูมิ:&nbsp;&nbsp;&nbsp;${obj['temp']}&nbsp;&nbsp;&nbsp;องศาเซลเซียส <span>${renderTemperatureStatus(obj['temp'])}</span>
                    </li>
                   
                </ol>
            </div>
            <div class="col-md-6">
                <p>ผู้ตรวจเช็ค: <span class="text-primary">${obj.rec_name}</span></p>
            </div>
            <div class="col-md-6">
                <p>ลายเซ็นผู้ตรวจเช็ค: <span><img src="${obj.signature_staff}" height="30px"></span></p>
            </div>`

    if (obj.approve_name) {
        detailHtml += `<div class="col-md-6">
                <p>ผู้อนุมัติ: <span class="text-primary">${obj.approve_name}</span></p>
            </div>
            <div class="col-md-6">
                <p>ลายเซ็นผู้อนุมัติ: <span><img src="${obj.signature_manager}" height="30px"></span></p>
            </div>`
    } else {
        detailHtml += `  <div class="col-md-12"><input id="approve_name" placeholder="ชื่อผู้อนุมัติ" class="form-control"></div>
                
                <div class="col-md-12 mt-3">
                    <label for="signature" class="form-label">เซ็นชื่อรับรองข้อมูล</label>
                                <div class="rounded border border-3">
                                    <canvas id="signature" name="signature" style="width: 100%; min-height: 200px; max-height: 210px; margin: 0; padding: 0" class="bg-white"></canvas>
                                </div>
                                <div class="col text-end">
                                    <button type="button" class="btn btn-secondary btn-sm clear-signature">clear</button>
                                </div>
                                </div>`
    }

    detailHtml += ` </div>
    </div>`

    $('#detail-modal .modal-body').html(detailHtml)
    initialSignaturePad(obj.afteruse_rec_name)
    $('#detail-modal').modal('show')
    $('#detail-modal').on('shown.bs.modal', function (e) {
        resizeCanvas()
    })


}
function renderTemperatureStatus(value) {
    let pass = `<br><span class="badge rounded-pill bg-success status-pill-modal"><i class="bi bi-check-circle-fill"></i>&nbsp;ผ่าน</span>`
    let toHight = `<br><span class="badge rounded-pill bg-danger text-warning status-pill-modal"><i class="bi bi-exclamation-triangle"></i>&nbsp;อุณหภูมิสูงเกินไป</span>`
    let toLow = `<br><span class="badge rounded-pill bg-info text-light status-pill-modal"><i class="bi bi-exclamation-triangle"></i>&nbsp;อุณหภูมิต่ำเกินไป</span>`
    switch (true) {
        case parseFloat(value) < 2:
            return toLow
        case parseFloat(value) > 8:
            return toHight
        default:
            return pass
    }
}

async function updateTemperatureData(key, url, time, date = new Date()) {



    let obj = {}
    if (key == "signature") {
        // obj = tabledata[0]
        obj.approve_name = $('#approve_name').val();
        obj.signature_manager = url
        obj.approve_time = date.getTime()
        tabledata[rowIndex].approve_name = $('#approve_name').val();
        tabledata[rowIndex].signature_manager = url
        tabledata[rowIndex].approve_time = date.getTime()
        // tabledata[0] = obj
    }

    firestore.collection(client)
        .where('form', '==', 'temperature')
        .where("time", "==", time)
        .get()
        .then(function (querySnapshot) {

            if (querySnapshot.docs.length > 0) {
                querySnapshot.docs[0].ref.update(obj).then(() => {
                    let data = tabledata.map(function (doc) {
                        let object = doc
                        let isPass = Object.keys(object).filter(key => key.indexOf('daily-check') > -1).every(key => object[key] == 'ผ่าน')
                        if (Object.keys(object).filter(key => key.indexOf('daily-check') > -1).length > 0) object.isPass = isPass
                        let isPass_afteruse = Object.keys(object).filter(key => key.indexOf('afteruse-check') > -1).every(key => object[key] == 'ผ่าน')
                        if (Object.keys(object).filter(key => key.indexOf('afteruse-check') > -1).length > 0) object.isPass_afteruse = isPass_afteruse
                        return object

                    })
                    createTemperatureTable(data)
                    Swal.fire({
                        icon: 'success',
                        title: 'บันทึกข้อมูลเรียบร้อย',
                        text: 'ขอบคุณค่ะ',
                    }).then(() => {
                        $('#detail-modal').modal('hide')
                    })
                })
            }
        });
}
