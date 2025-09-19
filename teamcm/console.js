console.clear();
console.group("START");

const page = location.origin + location.pathname;
console.log("🚀 !! page:", page);

function getAge(dateString) {
    const dateParts = dateString.split("/");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    let years = currentYear - dateParts[2];
    let months = currentMonth - dateParts[1];

    if (months < 0 || (months === 0 && currentDay < dateParts[0])) {
        years--;
        months += 12;
    }

    return years + " ปี " + months + " เดือน";
}

function isAssetMasterRecordPage() {
    return page.toLowerCase().indexOf("//nsmart.nhealth-asia.com/mtdpdb01/asset_mast_record.php") > -1;
}

function isJobPage() {
    return page.toLowerCase().indexOf("//nsmart.nhealth-asia.com/mtdpdb01/jobs/BJOBA_05.php") > -1;
}

function getSelectedText(selectElement) {
    return selectElement.options[selectElement.selectedIndex].innerText;
}

function formatNumber(value) {
    if (isNaN(value)) return '-';
    return Number(value);
}

function copyToClipboard(data, windowObj) {
    const copyInput = windowObj.document.createElement("input");
    windowObj.document.body.appendChild(copyInput);
    copyInput.value = JSON.stringify(data);
    copyInput.select();
    windowObj.document.execCommand("copy");
    return windowObj.navigator.clipboard.writeText(JSON.stringify(data));
}

async function fetchImageAsDataURL(imageSrc) {
    const blob = await fetch(imageSrc).then(r => r.blob());
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

function createWindowPromise(windowObj) {
    return new Promise((resolve) => {
        windowObj.onload = () => resolve();
    });
}

async function processImages(pictureWindow) {
    const table = pictureWindow.document.querySelectorAll("table.Grid")[0];
    const images = table.querySelectorAll("img");

    sharedData.imgs = [];

    for (let i = 0; i < images.length; i++) {
        console.log("🚀 !! Getting image", i + 1, "of", images.length);
        const rect = images[i].getBoundingClientRect();
        pictureWindow.scrollTo(0, rect.top);

        const dataURL = await fetchImageAsDataURL(images[i].src);
        sharedData.imgs.push(dataURL);
    }

    sharedData.imgs = JSON.stringify(sharedData.imgs);
}

async function extractAssetData(mainWindow) {
    const selectElement = document.getElementsByName("catagory")[0];
    const subDeptElement = document.getElementsByName("sub_dept")[0];
    const supSaleElement = document.getElementsByName("sup_sale")[0];
    const supServElement = document.getElementsByName("sup_serv")[0];

    let repairPrice = mainWindow.document.querySelectorAll(".Total")[0]
        .querySelectorAll("td")[5].innerText.replace(/,/g, '');
    repairPrice = formatNumber(repairPrice);

    const assetData = {
        page: "addupdate",
        e_code: document.getElementsByName("sap_code")[0].value,
        e_name: getSelectedText(selectElement),
        e_brand: document.getElementsByName("brand")[0].value,
        e_model: document.getElementsByName("model")[0].value,
        e_sn: document.getElementsByName("serial_no")[0].value,
        e_dept: getSelectedText(subDeptElement),
        e_date: document.getElementsByName("receive_date")[0].value,
        warranty_end: document.getElementsByName("w_finish_date_repair_part")[0].value,
        e_price: document.getElementsByName("price")[0].value,
        hos_id: document.getElementsByName("code_equip")[0].value,
        sup_sale: getSelectedText(supSaleElement),
        pr_vender: getSelectedText(supServElement),
        e_repair_price: repairPrice,
        e_repair_percent: '-',
    };

    if (assetData.e_price === '' || assetData.e_price == 0) {
        assetData.e_repair_percent = '-';
    } else {
        assetData.e_price = Number(assetData.e_price.replace(/,/g, ''));
        assetData.e_repair_percent = ((assetData.e_repair_price / assetData.e_price) * 100).toFixed(2);
    }

    assetData.e_price = assetData.e_price.toLocaleString();
    assetData.e_repair_price = assetData.e_repair_price.toLocaleString();
    assetData.e_age = getAge(assetData.e_date);

    return assetData;
}

async function finalizeData(...windows) {
    const primaryWindow = windows[0];
    const showSuccess = () => {
        const modal = document.createElement('div');
        modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      text-align: center;
      min-width: 350px;
    `;

        modalContent.innerHTML = `
      <div style="color: #4CAF50; font-size: 60px; margin-bottom: 20px;">✓</div>
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 24px;">Success!</h3>
      <p style="margin: 0; color: #666; font-size: 18px;">Data copied to clipboard</p>
    `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        setTimeout(() => {
            document.body.removeChild(modal);
        }, 2000);

        modal.addEventListener('click', () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        });
    };
    await copyToClipboard(sharedData, primaryWindow);
    console.log("%c🚀 !! DONE คัดลอกเรียบร้อย", "font-size: 30px;");
    console.groupEnd();

    setTimeout(() => {
        windows.forEach(window => window && window.close());
        showSuccess();
    }, 200);
}

function findTableCellValue(headerText) {
    const headers = document.querySelectorAll("th");
    for (const header of headers) {
        if (header.innerText === headerText) {
            return header.nextElementSibling.innerText.trim();
        }
    }
    return null;
}

function selectOptionByText(selectName, optionText) {
    const options = document.querySelectorAll(`select[name="${selectName}"] option`);
    for (const option of options) {
        if (option.innerText === optionText) {
            option.selected = true;
            break;
        }
    }
}

function setRadioByValue(inputName, value) {
    const radios = document.querySelectorAll(`input[name="${inputName}"]`);
    for (const radio of radios) {
        if (radio.value === value) {
            radio.checked = true;
            break;
        }
    }
}

function formatDateForInput(date) {
    return date.toLocaleString("en-GB", {
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).replace(",", "");
}

function parseRequestDate(dateString) {
    const parts = dateString.indexOf(", ") > -1 ? dateString.split(", ") : dateString.split(" ");
    const dateParts = parts[0].split("/").map(Number);
    const timeParts = parts[1].split(":");
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
}

function processClosedJob() {
    const noteValue = document.getElementsByName("note")[0].value;
    const workOrderNo = findTableCellValue("Work order no.");
    const idCode = findTableCellValue("ID CODE");

    const totalAmount = Number(noteValue.split("\n")[4].split(" ")[2].trim().replace(",", ""));
    const basePrice = (totalAmount / 1.07).toFixed(2);
    const vat = (totalAmount - basePrice).toFixed(2);

    const jobData = {
        page: "closejob",
        quatation: noteValue.split("\n")[1].split(":")[1].trim(),
        month: noteValue.split("\n")[3].split("- ")[1].trim(),
        price: totalAmount.toFixed(2),
        vat: vat,
        base_price: basePrice,
        job_no: workOrderNo,
    };

    copy(JSON.stringify(jobData));
    window.open("https://nsmart.nhealth-asia.com/MTDPDB01/asset_mast_list_new.php?s_code=&s_sap_code=" + idCode, "_self");
}

function setupJobForm() {
    selectOptionByText("bec_id", "12-Service contract");
    setRadioByValue("jobout_type", "2");

    const requestDateValue = document.querySelectorAll('input[name="req_date1"]')[0].value;
    const requestDate = parseRequestDate(requestDateValue);

    document.querySelectorAll('input[name="jobdate"]')[0].value = requestDateValue;
    document.querySelectorAll('input[name="assign_date"]')[0].value = requestDateValue;

    const arriveDate = new Date(requestDate.getTime() + 2 * 60000);
    const arriveDateFormatted = formatDateForInput(arriveDate);
    document.querySelectorAll('input[name="arrive_date"]')[0].value = arriveDateFormatted;
    document.querySelectorAll('input[name="act_dstart"]')[0].value = arriveDateFormatted;

    const finishDate = new Date(arriveDate.getTime() + 2 * 60000);
    document.querySelectorAll('input[name="act_dfin"]')[0].value = formatDateForInput(finishDate);

    selectOptionByText("job_result", "Self repair");
    document.getElementsByName("note")[0].value = "- \n- ใบเสนอราคาเลขที่: \n- จำนวน  ครั้ง ระยะวลา   ปี\n- เข้าทำเดือน: \n- ราคาทั้งสิ้น  บาท";
}

function handleJobPage() {
    const jobStatus = document.getElementsByName("job_status")[0].value;
    console.log("🚀 !! status:", jobStatus);

    if (jobStatus == 12) {
        processClosedJob();
    } else {
        setupJobForm();
    }
}

let sharedData = {};
let completedTasks = 0;

if (isAssetMasterRecordPage()) {
    const parameter = location.href.split("?")[1];
    console.log("Getting data...");
    window.name = "main";

    const jobHistoryWindow = window.open("//nsmart.nhealth-asia.com/MTDPDB01/asset_jobs_hist.php?" + parameter, "_blank", "width=400,height=400, top=0, left=0");
    const pictureWindow = window.open("//nsmart.nhealth-asia.com/MTDPDB01/asset_picture.php?" + parameter, "_blank", "width=400,height=400, top=0, left=400");

    createWindowPromise(pictureWindow).then(async () => {
        await processImages(pictureWindow);
        completedTasks++;

        if (completedTasks === 2) {
            await finalizeData(pictureWindow, jobHistoryWindow);
        } else {
            setTimeout(() => pictureWindow.close(), 200);
        }
    });

    createWindowPromise(jobHistoryWindow).then(async () => {
        const footerLinks = jobHistoryWindow.document.querySelectorAll('.footer')[0].getElementsByTagName('a');

        if (footerLinks.length > 0) {
            const lastPageUrl = footerLinks[footerLinks.length - 1].href;
            const lastPageWindow = window.open(lastPageUrl, "_blank", "width=400,height=400, top=0, left=0");

            await createWindowPromise(lastPageWindow);
            const assetData = await extractAssetData(lastPageWindow);
            sharedData = Object.assign(sharedData, assetData);
            completedTasks++;

            if (completedTasks === 2) {
                await finalizeData(lastPageWindow, jobHistoryWindow, pictureWindow);
            } else {
                setTimeout(() => lastPageWindow.close(), 200);
            }
            return;
        }

        const assetData = await extractAssetData(jobHistoryWindow);
        sharedData = Object.assign(sharedData, assetData);
        completedTasks++;

        if (completedTasks === 2) {
            await finalizeData(jobHistoryWindow, pictureWindow);
        } else {
            setTimeout(() => jobHistoryWindow.close(), 200);
        }
    });
} else if (isJobPage()) {
    handleJobPage();
}