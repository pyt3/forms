async function getIncubatorTableData(session) {
    // if (session) {
    //     return firestore.collection(client).where('sessionid', '==', session.sessionid).get().then(function (querySnapshot) {
    //         
    //         if (querySnapshot.docs.length > 0) {
    //             user = querySnapshot.docs[0].data()
    //             getDefibTableData()
    //         }
    //     });
    // } else {
    let ref, ref2, ref3, ref4
    let now = new Date()
    let before30days = now.setDate(now.getDate() - 30)
    let promises, resultData
    const setIspass = function (obj) {
        let isPass = Object.keys(obj).filter(key => key.indexOf('daily-check') > -1).every(key => obj[key] != 'ไม่ผ่าน')
        if (Object.keys(obj).filter(key => key.indexOf('daily-check') > -1).length > 0) obj.isPass = isPass
        else obj.isPass = ''
        let isPass_afteruse = Object.keys(obj).filter(key => key.indexOf('afteruse-check') > -1).every(key => obj[key] != 'ไม่ผ่าน')
        if (Object.keys(obj).filter(key => key.indexOf('afteruse-check') > -1).length > 0) obj.isPass_afteruse = isPass_afteruse
        return obj
    }

    const getResult = function (promises) {
        return promises.map(querySnapshot => {
            let data = querySnapshot.docs.map(function (doc) {
                let obj = setIspass(doc.data())
                return obj
            })
            return data
        })
    }
    if (user.level == 'director') {
        if (user.site == 'all') {
            console.log("🚀 ~ user.site", user.site)
            ref = firestore.collection('PYT3')
                .where('form', '==', 'incubator')
                .where('time', '>=', before30days)
                .orderBy('time', 'desc')
            ref2 = firestore.collection("PYT2")
                .where('form', '==', 'incubator')
                .where('time', '>=', before30days)
                .orderBy('time', 'desc')
            ref3 = firestore.collection("PYT1")
                .where('form', '==', 'incubator')
                .where('time', '>=', before30days)
                .orderBy('time', 'desc')
            ref4 = firestore.collection("PLP")
                .where('form', '==', 'incubator')
                .where('time', '>=', before30days)
                .orderBy('time', 'desc')
            promises = await Promise.all([ref.get(), ref2.get()], ref3.get(), ref4.get())
        } else {
            ref = firestore.collection(client)
                .where('form', '==', 'incubator')
                .where('time', '>=', before30days)
                .orderBy('time', 'desc')
            promises = await Promise.all([ref.get()])
        }
        resultData = getResult(promises).flat()
        resultData = resultData.sort((a, b) => b.time - a.time)
        tabledata = resultData
        createIncubatorTable(resultData)
    } else if (user.level == 'manager') {
        ref = firestore.collection(client)
            .where('form', '==', 'incubator')
            .where('e_dept', '==', user.name)
            .where('time', '>=', before30days)
            .orderBy('time', 'desc')
            .limit(20)
        ref2 = firestore.collection(client)
            .where('form', '==', 'incubator')
            .where('rec_dept', '==', user.name)
            .where('time', '>=', before30days)
            .orderBy('time', 'desc')
            .limit(20)
        promises = await Promise.all([ref.get(), ref2.get()])
        resultData = getResult(promises).flat()
        resultData = resultData.filter((v, i, a) => a.findIndex(v2 => (v2.time === v.time)) === i)
        resultData = resultData.sort((a, b) => b.time - a.time)
        tabledata = resultData
        createIncubatorTable(resultData)
    }
    $('#admin-div').show()
    // }
}
var table
function createIncubatorTable(data) {
    $('#incubator-display-approved').change(function () {
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
                $('#incubator-display-approved').attr('checked', true).change()
            }
        })
    }
    $('#incubator .table-responsive').html('').append(`<table id="incubator-table-data" class="table table-hover table-bordered" style="width: 100%">
            <thead class="bg-primary text-center text-white text-nowrap"></thead>
            <tbody class="bg-white"></tbody>
        </table>`)
    table = $('#incubator-table-data').DataTable({
        data: data,
        scrollX: true,
        order: [[0, 'desc']],
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
                    return '<button class="btn btn-link" onclick="getIncubatorDetail(`' + JSON.stringify(row).replace(/\"/g, "'") + '`,' + meta.row + ')">Click!</button>'
                }
            },
            {
                data: 'form',
                title: 'ชื่อเครื่อง'
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
                data: 'rec_remark',
                title: 'หมายเหตุ',
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
                    if (data == "") return ""
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
            {
                data: 'afteruse_rec_remark',
                title: 'หมายเหตุ(หลังใช้)',
                render: function (data, type) {
                    if (!data) return ''
                    return data
                }
            },
            {
                data: 'afteruse_rec_name',
                title: 'ผู้บันทึกหลังใช้',
                render: function (data, type) {
                    if (!data) return ''
                    return data
                }
            },
            {
                data: 'signature_staff_afteruse',
                title: 'ลายเซ็นผู้บันทึกหลังใช้',
                render: function (data, type) {
                    if (!data) return ''
                    if (typeof data == 'string' && data.indexOf('https') > -1)
                        return `<img src="${data}" height="25px">`
                    return data;
                }
            },
            {
                data: 'isPass_afteruse',
                title: 'ผลการตรวจเช็คหลังใช้',
                render: function (data, type) {
                    if (data == undefined) return ''
                    if (data)
                        return `<span class="badge rounded-pill bg-success status-pill"><i class="bi bi-check-circle-fill"></i>&nbsp;ผ่าน</span>`
                    return `<span class="badge rounded-pill bg-danger status-pill"><i class="bi bi-x-circle-fill"></i>&nbsp;ไม่ผ่าน</span>`;
                }
            },
            {
                data: 'afteruse_approve_name',
                title: 'ผู้อนุมัติหลังใช้',
                render: function (data, type) {
                    if (!data) return ''
                    return data
                }
            },
            {
                data: 'signature_manager_afteruse',
                title: 'ลายเซ็นผู้อนุมัติหลังใช้',
                render: function (data, type) {
                    if (!data) return ''
                    if (typeof data == 'string' && data.indexOf('https') > -1)
                        return `<img src="${data}" height="25px">`
                    return data;
                }
            },
        ]
    });
    table.draw(false)
}
var rowIndex
function getIncubatorDetail(row, index) {
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
                <p>Brand: <span class="text-primary">${obj.e_brand || obj.afteruse_e_brand}</span></p>
            </div>
            <div class="col-md-6">
                <p>Code: <span class="text-primary">${obj.e_code || obj.afteruse_e_code}</span></p>
            </div>
            <div class="col-md-12">
                <p>Department: <span class="text-primary">${obj.e_dept || obj.afteruse_e_dept}</span></p>
            </div>
            <div class="col-md-12" style="display: none" id="ref_time">
                ${obj.time}
            </div>
            <div class="col-md-12" style="display: none" id="row_index">
                ${rowIndex}
            </div>`
    if (!obj.afteruse_rec_name) {
        detailHtml += `<div class="col-md-12">
                <p>รายการตรวจเช็ค: <span class="text-primary"></span></p>
                <ol>
                    <li>
                        สวิทช์เปิด - ปิดเครื่อง: <span>${renderStatus(obj['daily-check-switch'])}</span>
                    </li>
                    <li>
                        ปลั๊กไฟ AC/สายไฟ AC: <span>${renderStatus(obj['daily-check-cord'])}</span>
                    </li>
                    <li>
                        หน้าปัด และจอแสดงผล: <span>${renderStatus(obj['daily-check-display'])}</span>
                    </li>
                    <li>
                        เสียง ALARM: <span>${renderStatus(obj['daily-check-alarm'])}</span>
                    </li>
                    <li>
                        การทำงานของปุ่มปรับต่างๆ: <span>${renderStatus(obj['daily-check-button'])}</span>
                    </li>
                    <li>
                        PATIENT / SKIN PROBE: <span>${renderStatus(obj['daily-check-probe'])}</span>
                    </li>
                </ol>
            </div>
              <div class="col-md-12">
                <p>หมายเหตุ: <span class="text-primary">${obj.rec_remark || ''}</span></p>
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
    } else {
        detailHtml += `<div class="col-md-12 mt-4">
                <p>รายการตรวจเช็ค หลังใช้: <span id="e_dept"></span></p>
                <ol>
                    <li>
                        CHARGE BATTERY หลังใช้ตลอดเวลา: <span>${renderStatus(obj['afteruse-check-battery'])}</span>
                    </li>
                    <li>
                        ทำความสะอาดเครื่อง: <span>${renderStatus(obj['afteruse-check-clean'])}</span>
                    </li>
                </ol>
            </div >
            <div class="col-md-12">
                <p>ผู้ตรวจเช็ค หลังใช้: <span class="text-primary">${obj.afteruse_rec_name}</span></p>
            </div>
            <div class="col-md-6">
                <p>ลายเซ็นผู้ตรวจเช็ค หลังใช้: <span><img src="${obj.signature_staff_afteruse || ''}" height="30px"></span></p>
            </div>`
        if (obj.afteruse_approve_name) {
            detailHtml += `<div class="col-md-6">
                <p>ผู้อนุมัติ หลังใช้: <span class="text-primary">${obj.afteruse_approve_name || ''}</span></p>
            </div>
            <div class="col-md-6">
                <p>ลายเซ็นผู้อนุมัติ หลังใช้: <span ><img src="${obj.signature_manager_afteruse || ''}" height="30px"></span></p>
            </div>`
        } else {
            detailHtml += `  <div class="col-md-12"><input id="afteruse_approve_name" placeholder="ชื่อผู้อนุมัติ หลังใช้" class="form-control"></div>
                <div class="col-md-12 mt-3">
                    <label for="signature_afteruse" class="form-label">เซ็นชื่อรับรองข้อมูล</label>
                                <div class="rounded border border-3">
                                    <canvas id="signature_afteruse" name="signature_afteruse" style="width: 100%; min-height: 200px; max-height: 210px; margin: 0; padding: 0" class="bg-white"></canvas>
                                </div>
                                <div class="col text-end">
                                    <button type="button" class="btn btn-secondary btn-sm clear-signature">clear</button>
                                </div>
                                </div>`
        }
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
async function updateIncubatorData(key, url, time, date = new Date()) {
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
    } else if (key == 'signature_afteruse') {
        // obj = tabledata[1]
        obj.afteruse_approve_name = $('#afteruse_approve_name').val();
        obj.signature_manager_afteruse = url
        obj.afteruse_approve_time = date.getTime()
        tabledata[rowIndex].afteruse_approve_name = $('#afteruse_approve_name').val();
        tabledata[rowIndex].signature_manager_afteruse = url
        tabledata[rowIndex].afteruse_approve_time = date.getTime()
        // tabledata[1] = obj
    }
    firestore.collection(client)
        .where('form', '==', 'incubator')
        .where("time", "==", time)
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.docs.length > 0) {
                querySnapshot.docs[0].ref.update(obj).then(() => {
                    let data = tabledata.map(function (doc) {
                        let obj = setIspass(doc)
                        return obj
                    })
                    createIncubatorTable(data)
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
