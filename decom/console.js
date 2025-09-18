
console.clear();
console.group("Equipment Data Extractor - START");

const currentPage = location.origin + location.pathname;
console.log("🚀 Current page:", currentPage);


const AppState = {
  data: {},
  completedTasks: 0,
  totalTasks: 3
};


const Utils = {
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        console.log("✅ Copied using modern clipboard API");
      } else {
        this.fallbackCopy(text);
        console.log("✅ Copied using legacy method");
      }
      return true;
    } catch (err) {
      
      this.createCopyButton(text);
      return false;
    }
  },

  createCopyButton(text) {
    
    const existingModal = document.getElementById('copy-modal');
    if (existingModal) {
      existingModal.remove();
    }

    
    this.showCopyModal(text);
    console.log("📋 Copy modal displayed with copy button");
  },



  showCopyModal(text) {
    
    const modal = document.createElement('div');
    modal.id = 'copy-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 25px;
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      max-height: 80%;
      overflow: auto;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      position: relative;
    `;

    modalContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">📋 Copy Your Data</h2>
        <p style="color: #666; margin: 0; font-size: 14px;">Automatic clipboard access failed. Use the button below to copy your data:</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
        <textarea id="copy-data-textarea" readonly style="width: 100%; height: 150px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 11px; resize: vertical; background: white;">${text}</textarea>
      </div>
      
      <div style="text-align: center; margin: 20px 0;">
        <button id="copy-data-btn" style="
          padding: 12px 30px; 
          background: #4CAF50; 
          color: white; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 16px; 
          font-weight: bold; 
          margin-right: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">📋 Copy to Clipboard</button>
        
        <button id="select-all-btn" style="
          padding: 12px 25px; 
          background: #2196F3; 
          color: white; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 16px; 
          font-weight: bold; 
          margin-right: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">📝 Select All</button>
      </div>
      
      <div style="text-align: center; padding-top: 15px; border-top: 1px solid #eee;">
        <button id="close-modal" style="
          padding: 8px 20px; 
          background: #6c757d; 
          color: white; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 14px;
          transition: all 0.3s ease;
        ">✖️ Close</button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    
    const textarea = document.getElementById('copy-data-textarea');
    const copyBtn = document.getElementById('copy-data-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const closeBtn = document.getElementById('close-modal');

    
    copyBtn.onclick = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          copyBtn.innerHTML = '✅ Copied!';
          copyBtn.style.background = '#28a745';
          setTimeout(() => {
            modal.remove();
          }, 1500);
          console.log("✅ Data copied successfully from modal");
        } else {
          
          textarea.select();
          const success = document.execCommand('copy');
          if (success) {
            copyBtn.innerHTML = '✅ Copied!';
            copyBtn.style.background = '#28a745';
            setTimeout(() => {
              modal.remove();
            }, 1500);
            console.log("✅ Data copied successfully using fallback method");
          } else {
            copyBtn.innerHTML = '❌ Copy Failed';
            copyBtn.style.background = '#dc3545';
            setTimeout(() => {
              copyBtn.innerHTML = '📋 Copy to Clipboard';
              copyBtn.style.background = '#4CAF50';
            }, 2000);
          }
        }
      } catch (error) {
        console.error("❌ Copy operation failed:", error);
        copyBtn.innerHTML = '❌ Copy Failed';
        copyBtn.style.background = '#dc3545';
        setTimeout(() => {
          copyBtn.innerHTML = '📋 Copy to Clipboard';
          copyBtn.style.background = '#4CAF50';
        }, 2000);
      }
    };

    
    selectAllBtn.onclick = () => {
      textarea.focus();
      textarea.select();
      selectAllBtn.innerHTML = '✅ Selected';
      selectAllBtn.style.background = '#17a2b8';
      setTimeout(() => {
        selectAllBtn.innerHTML = '📝 Select All';
        selectAllBtn.style.background = '#2196F3';
      }, 1500);
      console.log("📝 Text selected - You can now press Ctrl+C to copy");
    };

    
    const closeModal = () => {
      modal.remove();
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    
    [copyBtn, selectAllBtn, closeBtn].forEach(btn => {
      btn.onmouseover = () => {
        btn.style.transform = 'translateY(-1px)';
        btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
      };
      btn.onmouseout = () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      };
    });

    
    setTimeout(() => {
      textarea.focus();
      textarea.select();
    }, 100);

    
    setTimeout(() => {
      if (document.getElementById('copy-modal')) {
        modal.remove();
        console.log("⏰ Copy modal auto-closed after timeout");
      }
    }, 120000);

    console.log("� Copy modal displayed with interactive copy button");
  },

  fallbackCopy(text) {
    const input = document.createElement("input");
    input.value = text;
    input.style.position = "fixed";
    input.style.left = "-999999px";
    input.style.top = "-999999px";
    document.body.appendChild(input);
    input.focus();
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  },

  getSelectedText(element) {
    return element.options[element.selectedIndex].innerText;
  },

  formatDate(date) {
    return date.toLocaleString("en-GB", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(",", "");
  },

  addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }
};


const PageHandlers = {
  isAssetMasterPage() {
    return currentPage.toLowerCase().includes("//nsmart.nhealth-asia.com/mtdpdb01/asset_mast_record.php");
  },

  isJobPage() {
    return currentPage.toLowerCase().includes("//nsmart.nhealth-asia.com/mtdpdb01/jobs/bjoba_05.php");
  }
};

const AssetDataExtractor = {
  async extractData() {
    const parameter = location.href.split("?")[1];
    console.log("📊 Starting data extraction...");
    window.name = "main";
    
    const windows = {};
    
    try {
      await Promise.all([
        this.extractJobHistory(parameter, windows),
        this.extractImages(parameter, windows),
        this.extractDepreciation(parameter, windows)
      ]);
      
      await this.finalizeExtraction(windows);
    } catch (error) {
      console.error("❌ Data extraction failed:", error);
      this.closeWindows(windows);
    }
  },

  async extractJobHistory(parameter, windows) {
    if(!parameter) return
    return new Promise((resolve) => {
      windows.history = window.open(
        `//nsmart.nhealth-asia.com/MTDPDB01/asset_jobs_hist.php?${parameter}&jobs_m_dept_tech_job_statPage=50`,
        "_blank",
        "width=400,height=400, top=0, left=0"
      );
      
      windows.history.onload = async () => {
        try {
          const totalElement = windows.history.document.querySelectorAll(".Total")[0]?.querySelectorAll("td")[5];
          let total = totalElement?.innerText.replace(/,/g, "") || "-";
          total = isNaN(total) ? "-" : Number(total);

          AppState.data = {
            id: document.getElementsByName("sap_code")[0].value,
            name: Utils.getSelectedText(document.getElementsByName("catagory")[0]),
            brand: document.getElementsByName("brand")[0].value,
            model: document.getElementsByName("model")[0].value,
            sn_no: document.getElementsByName("serial_no")[0].value,
            dept: Utils.getSelectedText(document.getElementsByName("sub_dept")[0]),
            recieve_date: document.getElementsByName("receive_date")[0].value,
            warranty_end: document.getElementsByName("w_finish_date_repair_part")[0].value,
            price: document.getElementsByName("price")[0].value,
            hos_id: document.getElementsByName("code_equip")[0].value,
            sup_sale: Utils.getSelectedText(document.getElementsByName("sup_sale")[0]),
            total_jobs: total
          };

          this.checkCompletion(windows);
          resolve();
        } catch (error) {
          console.error("❌ Job history extraction failed:", error);
          resolve();
        }
      };
    });
  },

  async extractImages(parameter, windows) {
    if(!parameter) return
    return new Promise((resolve) => {
      windows.images = window.open(
        `//nsmart.nhealth-asia.com/MTDPDB01/asset_picture.php?${parameter}`,
        "_blank",
        "width=400,height=400, top=0, left=400"
      );
      
      windows.images.onload = async () => {
        try {
          const table = windows.images.document.querySelectorAll("table.Grid")[0];
          const imgs = table?.querySelectorAll("img") || [];
          AppState.data.imgs = [];

          for (let i = 0; i < imgs.length; i++) {
            console.log(`📸 Processing image ${i + 1} of ${imgs.length}`);
            const rect = imgs[i].getBoundingClientRect();
            windows.images.scrollTo(0, rect.top);
            
            const dataBlob = await fetch(imgs[i].src).then(r => r.blob());
            const dataUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(dataBlob);
            });
            
            AppState.data.imgs.push(dataUrl);
          }

          AppState.data.imgs = JSON.stringify(AppState.data.imgs);
          this.checkCompletion(windows);
          resolve();
        } catch (error) {
          console.error("❌ Image extraction failed:", error);
          AppState.data.imgs = JSON.stringify([]);
          this.checkCompletion(windows);
          resolve();
        }
      };
    });
  },

  async extractDepreciation(parameter, windows) {
    if(!parameter) return
    return new Promise((resolve) => {
      windows.depreciation = window.open(
        `//nsmart.nhealth-asia.com/MTDPDB01/asset_mast_depre.php?${parameter}`,
        "_blank",
        "width=400,height=400, top=0, left=800"
      );
      
      windows.depreciation.onload = async () => {
        try {
          await this.processDepreciationData(windows.depreciation);
          this.checkCompletion(windows);
          resolve();
        } catch (error) {
          console.error("❌ Depreciation extraction failed:", error);
          AppState.data.e_deprication = "";
          this.checkCompletion(windows);
          resolve();
        }
      };
    });
  },

  async processDepreciationData(depreciationWindow) {
    let noRecordTr = depreciationWindow.document.querySelectorAll("tr.NoRecords")[0];
    let clicked = false;
    const links = depreciationWindow.document.querySelectorAll("a");
    const updateBtn = [...links].find(e => e.innerText === "Reprocess");
    
    const MAX_RETRY = 10;
    let retry = 0;
    
    while (noRecordTr && retry < MAX_RETRY) {
      if (!clicked && updateBtn) {
        updateBtn.click();
        clicked = true;
      }
      
      await new Promise((resolve) => {
        console.log("⏳ Waiting for depreciation update...");
        setTimeout(() => {
          noRecordTr = depreciationWindow.document?.querySelectorAll("tr.NoRecords")[0];
          retry++;
          resolve();
        }, 1000);
      });
    }

    if (!noRecordTr) {
      const depreciationTable = depreciationWindow.document.querySelectorAll("table.Record tbody")[0];
      AppState.data.e_deprication = depreciationTable?.querySelectorAll("tr")[11]?.querySelectorAll("td")[0]?.innerText || "";
    } else {
      AppState.data.e_deprication = "";
    }
  },

  checkCompletion(windows) {
    AppState.completedTasks++;
    console.log(`✅ Task completed: ${AppState.completedTasks}/${AppState.totalTasks}`);
    
    
    if (AppState.completedTasks === AppState.totalTasks) {
      console.log("🎯 All tasks completed, finalizing extraction...");
      this.finalizeExtraction(windows);
    }
  },

  async finalizeExtraction(windows) {
    try {
      const success = await Utils.copyToClipboard(JSON.stringify(AppState.data));
      if (success) {
        console.log("%c🎉 EXTRACTION COMPLETE - Data copied successfully!", "font-size: 20px; color: green;");
        
        if (AppState.data && AppState.data.job_no && AppState.data.page === "closejob") {
          const idCode = document.querySelectorAll("th").length > 0 ? Array.from(document.querySelectorAll("th")).find(header => header.innerText === "ID CODE").nextElementSibling.innerText.trim() : null;
          if (idCode) {
            window.open(
              `https://nsmart.nhealth-asia.com/MTDPDB01/asset_mast_list_new.php?s_code=&s_sap_code=${idCode}`,
              "_self"
            );
          }
        }
      } else {
        console.log("%c⚠️ EXTRACTION COMPLETE - Click the copy button to get your data!", "font-size: 18px; color: orange;");
        if (AppState.data && AppState.data.job_no && AppState.data.page === "closejob") {
          const idCode = document.querySelectorAll("th").length > 0 ? Array.from(document.querySelectorAll("th")).find(header => header.innerText === "ID CODE").nextElementSibling.innerText.trim() : null;
          if (idCode) {
            console.log(`🔗 Navigation link: https://nsmart.nhealth-asia.com/MTDPDB01/asset_mast_list_new.php?s_code=&s_sap_code=${idCode}`);
          }
        }
      }
    } catch (error) {
      console.error("❌ Final copy failed:", error);
      console.log("📋 Data ready:", JSON.stringify(AppState.data));
    } finally {
      console.groupEnd();
      setTimeout(() => this.closeWindows(windows), 200);
    }
  },

  closeWindows(windows) {
    Object.values(windows).forEach(win => {
      if (win && !win.closed) {
        win.close();
      }
    });
  }
};


if (PageHandlers.isAssetMasterPage()) {
  AssetDataExtractor.extractData();
} else if (PageHandlers.isJobPage()) {
  JobManager.handleJobPage();
}


const JobManager = {
  async handleJobPage() {
    const jobStatus = document.getElementsByName("job_status")[0].value;
    console.log("🔧 Job status:", jobStatus);
    
    if (jobStatus == "12") {
      await this.processCompletedJob();
    } else {
      this.setupJobForm();
    }
  },

  async processCompletedJob() {
    try {
      const noteContent = document.getElementsByName("note")[0].value;
      const headers = document.querySelectorAll("th");
      let workOrderNo = "";
      let idCode = "";
      
      headers.forEach(header => {
        if (header.innerText === "Work order no.") {
          workOrderNo = header.nextElementSibling.innerText.trim();
        }
      });
      
      headers.forEach(header => {
        if (header.innerText === "ID CODE") {
          idCode = header.nextElementSibling.innerText.trim();
        }
      });
      
      const priceText = noteContent.split("\n")[4].split(" ")[2].trim().replace(",", "");
      const totalPrice = Number(priceText);
      const basePrice = (totalPrice / 1.07).toFixed(2);
      const vatAmount = (totalPrice - basePrice).toFixed(2);
      const jobData = {
        page: "closejob",
        quatation: noteContent.split("\n")[1].split(":")[1].trim(),
        month: noteContent.split("\n")[3].split("- ")[1].trim(),
        price: totalPrice.toFixed(2),
        vat: vatAmount,
        base_price: basePrice,
        job_no: workOrderNo,
      };
      
      AppState.data = jobData;
      
      await AssetDataExtractor.finalizeExtraction({});
      
      
    } catch (error) {
      console.error("❌ Failed to process completed job:", error);
    }
  },

  setupJobForm() {
    try {
      
      this.selectOption('select[name="bec_id"] option', "12-Service contract");
      
      
      this.setRadioButton('input[name="jobout_type"]', "2");
      
      
      this.setupJobDates();
      
      
      this.selectOption('select[name="job_result"] option', "Self repair");
      
      
      document.getElementsByName("note")[0].value = 
        "- \n- ใบเสนอราคาเลขที่: \n- จำนวน  ครั้ง ระยะวลา   ปี\n- เข้าทำเดือน: \n- ราคาทั้งสิ้น  บาท";
        
      console.log("✅ Job form setup completed");
      
    } catch (error) {
      console.error("❌ Failed to setup job form:", error);
    }
  },

  selectOption(selector, targetText) {
    const options = document.querySelectorAll(selector);
    options.forEach(option => {
      if (option.innerText === targetText) {
        option.selected = true;
      }
    });
  },

  setRadioButton(selector, targetValue) {
    const radios = document.querySelectorAll(selector);
    radios.forEach(radio => {
      if (radio.value === targetValue) {
        radio.checked = true;
      }
    });
  },

  setupJobDates() {
    const reqDateValue = document.querySelectorAll('input[name="req_date1"]')[0].value;
    let dateArray = reqDateValue.includes(", ") ? reqDateValue.split(", ") : reqDateValue.split(" ");
    
    const dateParts = dateArray[0].split("/").map(Number);
    const timeParts = dateArray[1].split(":");
    const baseDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
    
    
    document.querySelectorAll('input[name="jobdate"]')[0].value = reqDateValue;
    document.querySelectorAll('input[name="assign_date"]')[0].value = reqDateValue;
    
    
    const arrivalDate = Utils.addMinutes(baseDate, 2);
    document.querySelectorAll('input[name="arrive_date"]')[0].value = Utils.formatDate(arrivalDate);
    
    
    document.querySelectorAll('input[name="act_dstart"]')[0].value = Utils.formatDate(arrivalDate);
    
    
    const finishDate = Utils.addMinutes(baseDate, 4);
    document.querySelectorAll('input[name="act_dfin"]')[0].value = Utils.formatDate(finishDate);
  }
};
