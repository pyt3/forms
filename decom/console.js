console.clear(), console.group("START");
let page = location.origin + location.pathname;
console.log("🚀 !! page:", page);
var e,
  t = {},
  isfinish = 0;
let newwindow, newwindow2, newwindow3, focusWindow;
const copy = async (e) => {
  console.log("Copying to clipboard...");
  const showSuccess = () => {
    // Create modern modal
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

    // Auto close after 2 seconds
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 2000);

    // Close on click
    modal.addEventListener('click', () => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    });
  }
  try {
    // Try modern Clipboard API first
    await navigator.clipboard.writeText(e);
    console.log("Copied to clipboard using Clipboard API");
    showSuccess();
  } catch (err) {
    console.warn("Clipboard API failed, falling back to execCommand", err);
    // Fallback to execCommand method
    let textarea = document.createElement("textarea");
    textarea.value = e;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      console.log("Copied to clipboard using execCommand");
      showSuccess()
    } catch (err) {
      console.error("Failed to copy text", err);
    }
    document.body.removeChild(textarea);
  }
  console.log("END");
  console.groupEnd();
};
if (
  page
    .toLowerCase()
    .indexOf("//nsmart.nhealth-asia.com/mtdpdb01/asset_mast_record.php") > -1
) {
  let parameter = location.href.split("?")[1];
  console.log("Getting data...");
  window.name = "main";
  Promise.all([
    new Promise((resolve, reject) => {
      newwindow = window.open(
        "//nsmart.nhealth-asia.com/MTDPDB01/asset_jobs_hist.php?" +
        parameter +
        "&jobs_m_dept_tech_job_statPage=50",
        "_blank",
        "width=400,height=400, top=0, left=0"
      );
      newwindow.onload = () => {
        focusWindow = newwindow;
        let total = newwindow.document
          .querySelectorAll(".Total")[0]
          .querySelectorAll("td")[5]
          .innerText.replace(/,/g, "");
        if (isNaN(total)) total = "-";
        else total = Number(total);
        Object.assign(t, {
          id: document.getElementsByName("sap_code")[0].value,
          name: ((e) => e.options[e.selectedIndex].innerText)(
            document.getElementsByName("catagory")[0]
          ),
          brand: document.getElementsByName("brand")[0].value,
          model: document.getElementsByName("model")[0].value,
          sn_no: document.getElementsByName("serial_no")[0].value,
          dept: ((e) => e.options[e.selectedIndex].innerText)(
            document.getElementsByName("sub_dept")[0]
          ),
          recieve_date: document.getElementsByName("receive_date")[0].value,
          warranty_end: document.getElementsByName("w_finish_date_repair_part")[0]
            .value,
          price: document.getElementsByName("price")[0].value,
          hos_id: document.getElementsByName("code_equip")[0].value,
          sup_sale: ((e) => e.options[e.selectedIndex].innerText)(
            document.getElementsByName("sup_sale")[0]
          ),
        });
        resolve();
      };
    }),
    new Promise((resolve, reject) => {
      newwindow2 = window.open(
        "//nsmart.nhealth-asia.com/MTDPDB01/asset_picture.php?" + parameter,
        "_blank",
        "width=400,height=400, top=0, left=400"
      );
      newwindow2.onload = async () => {
        focusWindow = newwindow2;
        let table = newwindow2.document.querySelectorAll("table.Grid")[0];
        let imgs = table.querySelectorAll("img");
        Object.assign(t, { imgs: [] });
        for (let i = 0; i < imgs.length; i++) {
          console.log("🚀 !! Getting image", i + 1, "of", imgs.length);
          let rect = imgs[i].getBoundingClientRect();
          newwindow2.scrollTo(0, rect.top);
          let datablob = await fetch(imgs[i].src).then((r) => r.blob());
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
        resolve();
        isfinish++;
      };
    }),
    new Promise((resolve, reject) => {
      newwindow3 = window.open(
        "//nsmart.nhealth-asia.com/MTDPDB01/asset_mast_depre.php?" + parameter,
        "_blank",
        "width=400,height=400, top=0, left=800"
      );
      newwindow3.onload = async () => {
        focusWindow = newwindow3;
        console.log("🚀 !! newwindow3 loaded");
        let no_recored_tr = newwindow3.document.querySelectorAll("tr.NoRecords")[0];
        let clicked = false;
        let a = newwindow3.document.querySelectorAll("a");
        let update_btn = [...a].find((e) => e.innerText == "Reprocess");
        const MAX_RETRY = 10;
        let retry = 0;
        while (no_recored_tr && retry < MAX_RETRY) {
          if (!clicked) update_btn.click();
          clicked = true;
          await new Promise((resolve, reject) => {
            console.log("🚀 !! Waiting for update button to finish");
            setTimeout(() => {
              no_recored_tr =
                newwindow3.document?.querySelectorAll("tr.NoRecords")[0];
              retry++;
              resolve();
            }, 1000);
          });
        }
        console.log(no_recored_tr);
        Object.assign(t, { e_deprication: "" });
        if (!no_recored_tr) {
          t.e_deprication = newwindow3.document
            .querySelectorAll("table.Record tbody")[0]
            .querySelectorAll("tr")[11]
            .querySelectorAll("td")[0].innerText;
        } else {
          t.e_deprication = "";
        }
        resolve();
      };
    })
  ]).then(async () => {
    console.log("All tasks completed");
    console.log("🚀 !! Result:", t);
    newwindow.close();
    newwindow2.close();
    newwindow3.close();
    await copy(JSON.stringify(t));
  });
} 