console.clear();
console.group("START");
let page = location.origin + location.pathname;
console.log("🚀 !! page:", page);
var e, t, isfinish = 0;
var copy = async (e) => {
    console.log("🚀 !! e:", e);
    console.log("Copying to clipboard...");
    let t = document.createElement("input");
    document.body.appendChild(t);
    t.value = e;
    t.setSelectionRange(0, 99999);
    t.select();
    document.execCommand("copy");
    console.log("%c🚀 !! DONE คัดลอกเรียบร้อย", "font-size: 30px;");
    console.groupEnd();
};
if (page.toLowerCase().indexOf("//nsmart.nhealth-asia.com/mtdpdb01/asset_mast_record.php") > -1) {
    let parameter = location.href.split("?")[1];
    console.log("Getting data...");
    window.name = "main";
    let newwindow = window.open("//nsmart.nhealth-asia.com/MTDPDB01/asset_jobs_hist.php?" + parameter, "_blank", "width=400,height=400, top=0, left=0");
    let newwindow2 = window.open("//nsmart.nhealth-asia.com/MTDPDB01/asset_picture.php?" + parameter, "_blank", "width=400,height=400, top=0, left=400");
    new Promise((resolve, reject) => {
        newwindow.onload = () => {
            resolve();
        }
    }).then(async () => {
        let total = newwindow.document.querySelectorAll(".Total")[0].querySelectorAll("td")[5].innerText.replace(/,/g, '');
        if (isNaN(total)) total = '-';
        else total = Number(total);
        t = {
            page: "addupdate",
            e_code: document.getElementsByName("sap_code")[0].value,
            e_name: (e = document.getElementsByName("catagory")[0]).options[e.selectedIndex].innerText,
            e_brand: document.getElementsByName("brand")[0].value,
            e_model: document.getElementsByName("model")[0].value,
            e_sn: document.getElementsByName("serial_no")[0].value,
            e_dept: (e = document.getElementsByName("sub_dept")[0]).options[e.selectedIndex].innerText,
            e_date: document.getElementsByName("receive_date")[0].value,
            warranty_end: document.getElementsByName("w_finish_date_repair_part")[0].value,
            e_price: document.getElementsByName("price")[0].value,
            hos_id: document.getElementsByName("code_equip")[0].value,
            sup_sale: (e = document.getElementsByName("sup_sale")[0]).options[e.selectedIndex].innerText,
            pr_vender: (e = document.getElementsByName("sup_serv")[0]).options[e.selectedIndex].innerText,
            e_repair_price: total,
            e_repair_percent: '-',
        };
        if (t.e_price == '' || t.e_price == 0) t.e_repair_percent = '-';
        else {
            t.e_price = Number(t.e_price.replace(/,/g, ''));
            t.e_repair_percent = ((t.e_repair_price / t.e_price) * 100).toFixed(2);
        }
        t.e_price = t.e_price.toLocaleString();
        t.e_repair_price = t.e_repair_price.toLocaleString();
        t.e_age = getAge(t.e_date);
        isfinish++;
        if (isfinish == 2) {
            let copy = newwindow.document.createElement("input");
            newwindow.document.body.appendChild(copy);
            copy.value = JSON.stringify(t);
            copy.setSelectionRange(0, 99999);
            copy.select();
            newwindow.document.execCommand("copy");
            await newwindow.navigator.clipboard.writeText(JSON.stringify(t));
            console.log("%c🚀 !! DONE คัดลอกเรียบร้อย", "font-size: 30px;");
            console.groupEnd();
            setTimeout(() => {
                newwindow.close();
                newwindow2.close();
            }, 200)
        }
        else {
            setTimeout(() => {
                newwindow.close();
            }, 200)
        }
    });
    new Promise((resolve, reject) => {
        newwindow2.onload = () => {
            resolve();
        }
    }).then(async () => {
        let table = newwindow2.document.querySelectorAll("table.Grid")[0];
        let imgs = table.querySelectorAll("img");
        t.imgs = [];
        for (let i = 0; i < imgs.length; i++) {
            console.log("🚀 !! Getting image", i + 1, "of", imgs.length);
            let rect = imgs[i].getBoundingClientRect();
            newwindow2.scrollTo(0, rect.top);
            let datablob = await fetch(imgs[i].src).then(r => r.blob());
            let dataurl = await new Promise((resolve, reject) => {
                let reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(datablob);
            });
            t.imgs.push(dataurl);
        }
        t.imgs = JSON.stringify(t.imgs);
        isfinish++;
        if (isfinish == 2) {
            let copy = newwindow2.document.createElement("input");
            newwindow2.document.body.appendChild(copy);
            copy.value = JSON.stringify(t);
            copy.select();
            newwindow2.document.execCommand("copy");
            await newwindow2.navigator.clipboard.writeText(JSON.stringify(t));
            console.log("%c🚀 !! DONE คัดลอกเรียบร้อย", "font-size: 30px;");
            console.groupEnd();
            setTimeout(() => {
                newwindow.close();
                newwindow2.close();
            }, 200)
        }
        else {
            setTimeout(() => {
                newwindow2.close();
            }, 200)
        }
    })
}
else if (page.toLowerCase().indexOf("//nsmart.nhealth-asia.com/mtdpdb01/jobs/BJOBA_05.php") > -1) {
    let e = document.getElementsByName("job_status")[0].value;
    if ((console.log("🚀 !! status:", e), 12 == e)) {
        let e, t, l = document.getElementsByName("note")[0].value,
            o = document.querySelectorAll("th");
        for (let t = 0; t < o.length; t++) {
            let n = o[t];
            "Work order no." === n.innerText && (e = n.nextElementSibling.innerText.trim());
        }
        for (let e = 0; e < o.length; e++) {
            let n = o[e];
            "ID CODE" === n.innerText && (t = n.nextElementSibling.innerText.trim());
        } (a = l.split("\n")[4].split(" ")[2].trim().replace(",", "")), (a = Number(a)), (i = (a / 1.07).toFixed(2)), (n = (a - i).toFixed(2)), (a = a.toFixed(2)), copy(JSON.stringify({
            page: "closejob",
            quatation: l.split("\n")[1].split(":")[1].trim(),
            month: l.split("\n")[3].split("- ")[1].trim(),
            price: a,
            vat: n,
            base_price: i,
            job_no: e,
        })), window.open("https://nsmart.nhealth-asia.com/MTDPDB01/asset_mast_list_new.php?s_code=&s_sap_code=" + t, "_self");
    }
    else {
        var r = document.querySelectorAll('select[name="bec_id"] option');
        for (let e = 0; e < r.length; e++) {
            let t = r[e];
            "12-Service contract" === t.innerText && (t.selected = !0);
        }
        r = document.querySelectorAll('input[name="jobout_type"]');
        for (let e = 0; e < r.length; e++) {
            let t = r[e];
            "2" == t.value && (t.checked = !0);
        }
        let e = document.querySelectorAll('input[name="req_date1"]')[0].value,
            t = (e = e.indexOf(", ") > -1 ? e.split(", ") : e.split(" "))[0].split("/").map(Number);
        (e = e[1].split(":")), (e = new Date(t[2], t[1] - 1, t[0], e[0], e[1])), (document.querySelectorAll('input[name="jobdate"]')[0].value = document.querySelectorAll('input[name="req_date1"]')[0].value), (document.querySelectorAll('input[name="assign_date"]')[0].value = document.querySelectorAll('input[name="req_date1"]')[0].value), (document.querySelectorAll('input[name="arrive_date"]')[0].value = new Date(e.setMinutes(e.getMinutes() + 2)).toLocaleString("en-GB", {
            hour12: !1,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).replace(",", "")), (document.querySelectorAll('input[name="act_dstart"]')[0].value = document.querySelectorAll('input[name="arrive_date"]')[0].value), (document.querySelectorAll('input[name="act_dfin"]')[0].value = new Date(e.setMinutes(e.getMinutes() + 2)).toLocaleString("en-GB", {
            hour12: !1,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).replace(",", "")), (r = document.querySelectorAll('select[name="job_result"] option'));
        for (let e = 0; e < r.length; e++) {
            let t = r[e];
            "Self repair" === t.innerText && (t.selected = !0);
        }
        document.getElementsByName("note")[0].value = "- \n- ใบเสนอราคาเลขที่: \n- จำนวน  ครั้ง ระยะวลา   ปี\n- เข้าทำเดือน: \n- ราคาทั้งสิ้น  บาท";
    }
}

function getAge(e) {
    let t = e.split("/"),
        l = new Date(),
        o = l.getFullYear(),
        n = l.getMonth() + 1,
        a = l.getDate(),
        i = o - t[2],
        r = n - t[1];
    return ((r < 0 || (0 == r && a < t[0])) && (i--, (r += 12)), i + " ปี " + r + " เดือน");
}