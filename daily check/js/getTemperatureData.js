const setIspass_temp = function (obj) {
    let isPass = (obj.temp >= obj.min && obj.temp <= obj.max)
    if (obj.temp2) {
        isPass = isPass && (obj.temp2 >= obj.min2 && obj.temp2 <= obj.max2)
    }
    obj.isPass = isPass

    return obj
}

const getResult_temp = function (promises) {
    return promises.map(querySnapshot => {
        let data = querySnapshot.docs.map(function (doc) {
            let obj = setIspass_temp(doc.data())
            return obj
        })
        return data
    })
}
async function getTemperatureTableData(session) {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const baseFilters = [['form', '==', 'temperature']];
    const tempCollections = ['PYT3', 'PYT2', 'PYT1', 'PLP', 'SNH', 'DEMO', 'PLS'];

    const buildQuery = (collection, extraFilters = [], limit) => {
        let ref = firestore.collection(collection);
        [...baseFilters, ...extraFilters].forEach(([field, op, value]) => {
            ref = ref.where(field, op, value);
        });
        ref = ref.where('time', '>=', thirtyDaysAgo).orderBy('time', 'desc');
        return limit ? ref.limit(limit) : ref;
    };

    const directorQueries = () => (
        user.site === 'all'
            ? tempCollections.map(col => buildQuery(col))
            : [buildQuery(client)]
    );

    const managerQueries = () => {
        const uniqueDepts = new Set([user.name, user.name?.toUpperCase?.()].filter(Boolean));
        const deptKeys = ['e_dept', 'rec_dept'];
        const queries = [];
        uniqueDepts.forEach(dept => {
            deptKeys.forEach(key => queries.push(buildQuery(client, [[key, '==', dept]], 40)));
        });
        return queries;
    };

    const queries = user.level === 'director'
        ? directorQueries()
        : user.level === 'manager'
            ? managerQueries()
            : [];

    if (!queries.length) {
        tabledata = [];
        createTemperatureTable([]);
        $('#admin-div').show();
        return;
    }

    const snapshots = await Promise.all(queries.map(q => q.get()));
    let resultData = getResult_temp(snapshots).flat();

    if (user.level === 'manager') {
        const seen = new Set();
        resultData = resultData.filter(row => {
            if (seen.has(row.time)) return false;
            seen.add(row.time);
            return true;
        });
    }

    resultData.sort((a, b) => b.time - a.time);
    tabledata = resultData;
    createTemperatureTable(resultData);
    $('#admin-div').show();
}
function get_id(url) {
    let regex1 = /https:\/\/drive.google.com|\/open|\/uc|\/file|\/d|export|download|\?id|\/view|usp|=sharing/g
    let regex2 = /([\w-]){33}|([\w-]){19}/g
    let url_id = url.replace(regex1, "").match(regex2)[0]
    return url_id
}
var table
function createTemperatureTable(data) {
    $('#temperature-display-approved').change(function () {
        if ($(this).is(':checked')) {
            table
                .columns([9, 15]) // or columns???
                .search('^$', true, false)
                .draw();
        } else {
            table
                .columns([9, 15]) // or columns???
                .search('')
                .draw();
        }
    })
    let notapproved = data.filter(v => {
        if (v.signature_staff_afteruse) return (v.signature_staff_afteruse != '' && !v.signature_manager_afteruse)
        else return (v.signature_staff != '' && !v.signature_manager)
    })
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

            if (data.signature_staff_afteruse && data.signature_staff_afteruse != '' && !data.signature_manager_afteruse) {
                $(row).addClass('bg-warning')
            }
            else if (data.signature_staff && data.signature_staff != '' && !data.signature_manager) {
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
                        return `<img src="https://lh3.googleusercontent.com/${get_id(data)}" height="25px" loading="lazy">`
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
                        return `<img src="https://lh3.googleusercontent.com/${get_id(data)}" height="25px" loading="lazy">`
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
                <ol class="row">`
    if (obj.temp2) {
        detailHtml += `<li class="col-md-6">
                        อุณหภูมิชั้นบน:&nbsp;&nbsp;&nbsp;${obj['temp']}&nbsp;&nbsp;&nbsp;องศาเซลเซียส<br><small class="text-muted">ช่วงอุณหภูมิปกติ ${obj.min}-${obj.max}</small> <span>${renderTemperatureStatus(obj['temp'])}</span>
                    </li>
                    <li class="col-md-6">
                        อุณหภูมิชั้นล่าง:&nbsp;&nbsp;&nbsp;${obj['temp2']}&nbsp;&nbsp;&nbsp;องศาเซลเซียส<br><small class="text-muted">ช่วงอุณหภูมิปกติ ${obj.min2}-${obj.max2}</small> <span>${renderTemperatureStatus(obj['temp2'])}</span>
                    </li>`
    } else {
        detailHtml += `<li class="col-md-6">
                        อุณหภูมิ:&nbsp;&nbsp;&nbsp;${obj['temp']}&nbsp;&nbsp;&nbsp;องศาเซลเซียส<br><small class="text-muted">ช่วงอุณหภูมิปกติ ${obj.min}-${obj.max}</small> <span>${renderTemperatureStatus(obj['temp'])}</span>
                    </li>`
    }


    detailHtml += `</ol>
            </div>
            <div class="col-md-6">
                <p>ผู้ตรวจเช็ค: <span class="text-primary">${obj.rec_name}</span></p>
            </div>
            <div class="col-md-6">
                <p>ลายเซ็นผู้ตรวจเช็ค: <span><img src="https://lh3.googleusercontent.com/${get_id(obj.signature_staff)}" height="30px" loading="lazy"></span></p>     
            </div>`

    if (obj.approve_name) {
        detailHtml += `<div class="col-md-6">
                <p>ผู้อนุมัติ: <span class="text-primary">${obj.approve_name}</span></p>
            </div>
            <div class="col-md-6">
                <p>ลายเซ็นผู้อนุมัติ: <span><img src="https://lh3.googleusercontent.com/${get_id(obj.signature_manager)}" height="30px" loading="lazy"></span></p>
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
                        let object = setIspass_temp(doc)
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
