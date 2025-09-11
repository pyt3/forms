const style = document.createElement('style');
style.textContent = `
   .custom-btn {
    min-width: 200px;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    background-color: #4CAF50;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    padding: 5px;
    margin: 5px 5px;
    display: flex;
    align-items: center;
    img {
        width: 40px;
        height: 40px;
        margin-right: 5px;
        border-radius: 50%;
    }
}



    .btn-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 30;
    right: 0;
    transform: translate(0%, -10%);
}
    .custom-btn:hover {
        background-color: #45a049;
    }
    .is-selected {
        background-color: #e9b33b !important;
    }
`;
document.head.appendChild(style);
var method_text;
function checkPage() {
    console.log(window.location.href.split("?")[0].toLowerCase());
    switch (window.location.href.split("?")[0].toLowerCase()) {
        case "https://nsmart.nhealth-asia.com/mtdpdb01/default.php":
            borrow()
            break;
        case "https://nsmart.nhealth-asia.com/mtdpdb01/reserve/reserve_rec.php":
            method_text = 'จ่ายเครื่อง'
            initTextArea()
            distributeBaxter();
            break;
        case "https://nsmart.nhealth-asia.com/mtdpdb01/reserve/reserve_ret_barcode.php":
            method_text = 'รับเครื่องคืน'
            initTextArea();
            autoFillCode();
            break;
        case "https://nsmart.nhealth-asia.com/mtdpdb01/jobs/bjoba_05.php":
            closePR_JOB();
            break;
        case "https://nsmart.nhealth-asia.com/mtdpdb01/asset_doc.php":
            tweakPageAssetDoc()
            break;
    }
}

const save = async function (waiting_to_distribute) {
    document.getElementsByName("code")[0].value = waiting_to_distribute[waiting_to_distribute.length - 1];
    document.getElementsByName("Button_DoSearch")[0].click();
    waiting_to_distribute.pop()
    localStorage.setItem('waiting_to_' + method_text, JSON.stringify(waiting_to_distribute))
}
function initTextArea() {
    document.activeElement.blur();
    let waiting_to_recieve = localStorage.getItem("waiting_to_" + method_text);
    if (waiting_to_recieve == null) waiting_to_recieve = [];
    else waiting_to_recieve = JSON.parse(waiting_to_recieve);

    // Create modern container with smooth rounded corners
    let wrapper = document.createElement("div");
    wrapper.style = `
        display: flex; 
        flex-direction: column; 
        background-color: #ffffff;
        border-radius: 16px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        padding: 20px;
        margin: 15px 0;
        width: 100%;
        max-width: 650px;
    `;

    // Create title
    let title = document.createElement("h3");
    title.textContent = "รหัสเครื่องที่ต้องการ" + method_text;
    title.style = `
        width: 100%;
        text-align: center;
        margin: 0 0 15px 0;
        color: #333;
        font-size: 1.2rem;
        font-weight: bold;
    `;
    wrapper.appendChild(title);

    let wrapper2 = document.createElement("div");
    wrapper2.style = `
        display: flex; 
        flex-direction: row; 
        justify-content: space-between; 
        align-items: start;
        width: 100%;
        gap: 15px;
    `;

    // Create modern styled textarea
    let textArea = document.createElement("textarea");
    textArea.style = `
        min-width: 300px;
        flex-grow: 1;
        border: 2px solid #e0e0e0;
        margin: 0;
        padding: 12px;
        border-radius: 12px;
        font-size: 1rem;
        font-family: inherit;
        resize: vertical;
        transition: all 0.3s ease;
        outline: none;
        box-sizing: border-box;
        color: #333;
    `;
    textArea.rows = 10;
    textArea.id = 'textArea';
    textArea.placeholder = "รหัสเครื่องที่ต้องการ" + method_text;
    textArea.value = waiting_to_recieve.join("\n");
    textArea.autofocus = true;
    setTimeout(function(){
            document.activeElement.blur();
            textArea.focus()
    },1000)

    // Add focus and blur events for interactive styling
    textArea.addEventListener("focus", function () {
        this.style.borderColor = "#4CAF50";
        this.style.boxShadow = "0 0 0 3px rgba(76, 175, 80, 0.2)";
    });
  
    textArea.addEventListener("blur", function () {
        this.style.borderColor = "#e0e0e0";
        this.style.boxShadow = "none";
    });

    // Style QR image to match rounded design
    let qr_submit_img = document.createElement("img");
    qr_submit_img.src = "https://api.qrserver.com/v1/create-qr-code?data=SAVE%20ALL%20CODES&size=100x100";
    qr_submit_img.style = `
        margin: 0;
        border: 2px solid #e0e0e0;
        padding: 10px;
        border-radius: 12px;
        background-color: white;
        transition: all 0.3s ease;
    `;
    qr_submit_img.addEventListener("mouseover", function () {
        this.style.borderColor = "#4CAF50";
        this.style.transform = "translateY(-2px)";
        this.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    });
    qr_submit_img.addEventListener("mouseout", function () {
        this.style.borderColor = "#e0e0e0";
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "none";
    });

    wrapper2.appendChild(textArea);
    wrapper2.appendChild(qr_submit_img);
    wrapper.appendChild(wrapper2);
    // Create modern button with hover effects
    let btn = document.createElement("button");
    btn.textContent = "บันทึกทั้งหมด 👍";
    btn.style = `
        min-width: 100px;
        width: 100%;
        margin: 15px 0 0 0;
        padding: 12px;
        border-radius: 12px;
        background-color: #4CAF50;
        color: white;
        font-size: 1.1rem;
        font-weight: bold;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(76, 175, 80, 0.2);
    `;
    btn.id = "batch_save_btn";

    // Add hover effects to button
    btn.addEventListener("mouseover", function () {
        this.style.backgroundColor = "#45a049";
        this.style.boxShadow = "0 6px 10px rgba(76, 175, 80, 0.3)";
        this.style.transform = "translateY(-2px)";
    });
    btn.addEventListener("mouseout", function () {
        this.style.backgroundColor = "#4CAF50";
        this.style.boxShadow = "0 4px 6px rgba(76, 175, 80, 0.2)";
        this.style.transform = "translateY(0)";
    });

    wrapper.appendChild(btn);
    document.querySelectorAll('table')[2].parentNode.insertBefore(wrapper, document.querySelectorAll('table')[2]);
    setTimeout(function(){
        document.activeElement.blur()
        document.getElementById('textArea').focus()
        console.log('textarea FOCUS!')
    },500)
    // Existing click handler
    btn.addEventListener("click", function () {
        let codes = textArea.value.split("\n").map(code => code.trim());
        console.log("🚀 ~ codes:", codes)
        waiting_to_recieve = [...new Set(codes.filter(code => code !== ""))]
        document.getElementById('textArea').value = waiting_to_recieve.join("\n");
        if (waiting_to_recieve[waiting_to_recieve.length - 1] === "SAVE ALL CODES") {
            waiting_to_recieve.pop();
            localStorage.setItem("waiting_to_" + method_text, JSON.stringify(waiting_to_recieve));
        }
        if (waiting_to_recieve.length == 0) {
            document.getElementById('textArea').value = "";
            localStorage.setItem("waiting_to_" + method_text, '[]');
        } else {
            save(waiting_to_recieve)
            localStorage.setItem("waiting_to_" + method_text, JSON.stringify(waiting_to_recieve));
        }
    });

    // Existing keypress handler
    textArea.addEventListener("keypress", function (e) {
        console.log(method_text)
        if (e.which === 13) {
            let codes = textArea.value.split("\n").map(code => code.trim());
            let iteim_codes = codes.map(x => x.split('code=')[1]).filter(x => x !== undefined);
            let concerned_codes = ['261002']
            let isConcerned = iteim_codes.filter(x => concerned_codes.includes(x));
            if (isConcerned.length > 0) {
                // Create a modal dialog for calibration warning
                const alertDialog = document.createElement("dialog");
                alertDialog.style = `
                    width: 600px; 
                    background-color: #ffebee; 
                    border: 3px solid #d32f2f; 
                    border-radius: 16px; 
                    padding: 20px; 
                    position: fixed; 
                    top: 50%; 
                    left: 50%; 
                    transform: translate(-50%, -50%);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                    animation: shakeAlert 0.5s ease-in-out;
                    z-index: 9999;
                `;

                // Add animation for the alert
                const alertStyle = document.createElement("style");
                alertStyle.textContent = `
                    @keyframes shakeAlert {
                        0%, 100% { transform: translate(-50%, -50%); }
                        10%, 30%, 50%, 70%, 90% { transform: translate(-52%, -50%); }
                        20%, 40%, 60%, 80% { transform: translate(-48%, -50%); }
                    }
                `;
                document.head.appendChild(alertStyle);

                // Create warning icon
                const warningIcon = document.createElement("div");
                warningIcon.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#d32f2f">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"/>
                    </svg>
                `;
                warningIcon.style = `
                    display: flex;
                    justify-content: center;
                    margin-bottom: 15px;
                `;

                // Create message
                const alertMessage = document.createElement("h2");
                alertMessage.innerHTML = "เครื่องนี้ยังไม่ได้แคล<br>กรุณาตรวจสอบ";
                alertMessage.style = `
                    color: #d32f2f;
                    text-align: center;
                    font-size: 3rem;
                    margin: 0 0 20px 0;
                `;

                // Create close button
                const closeButton = document.createElement("button");
                closeButton.textContent = "รับทราบ";
                closeButton.style = `
                    width: 100%;
                    padding: 12px;
                    background-color: #d32f2f;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s;
                `;
                closeButton.addEventListener("mouseover", () => {
                    closeButton.style.backgroundColor = "#b71c1c";
                });
                closeButton.addEventListener("mouseout", () => {
                    closeButton.style.backgroundColor = "#d32f2f";
                });
                closeButton.addEventListener("click", () => {
                    alertDialog.close();
                    document.body.removeChild(alertDialog);
                    codes = codes.filter(code => concerned_codes.indexOf(code.split('code=')[1]) === -1);
                    textArea.value = codes.join("\n");
                });

                // Assemble the dialog
                alertDialog.appendChild(warningIcon);
                alertDialog.appendChild(alertMessage);
                alertDialog.appendChild(closeButton);

                // Add to body and show
                document.body.appendChild(alertDialog);
                alertDialog.showModal();

                return
            }

            waiting_to_recieve = [...new Set(codes.filter(code => code !== ""))]
            console.log(waiting_to_recieve[waiting_to_recieve.length - 1] === "SAVE ALL CODES")
            if (waiting_to_recieve[waiting_to_recieve.length - 1] === "SAVE ALL CODES") {
                waiting_to_recieve.pop();
                document.getElementById('textArea').value = waiting_to_recieve.join("\n");
                console.log("🚀 ~ waiting_to_recieve:", waiting_to_recieve)
                if (waiting_to_recieve.length == 0) {
                    document.getElementById('textArea').value = "";
                    localStorage.setItem("waiting_to_" + method_text, '[]');
                } else {
                    save(waiting_to_recieve)
                }
                return
            }
        }
    });
    
}
function borrow() {
    if (document.getElementById("stUI68_txt")) return;
    let btn_wrapper = document.createElement("div");
    btn_wrapper.id = "btn_wrapper";
    btn_wrapper.classList.add("btn-wrapper");
    document.body.appendChild(btn_wrapper);
    const buttons = [
        { text: "เบิก Baxter", image: 'https://nsmart.nhealth-asia.com/MTDPDB01/img.php?files=202008310949450.baxter-evo+iq+lvp.jpg', device: 'baxter', handler: req_unit },
        { text: "เบิก HUB", image: 'https://nsmart.nhealth-asia.com/MTDPDB01/img.php?files=202004271637450.baxter-evoiq+hub.jpeg', device: 'hub', handler: req_unit },
        { text: "เบิก Pneumatic Pump", image: 'https://nsmart.nhealth-asia.com/MTDPDB01/img.php?files=201807051147510.PNU+DVT-2600.jpg', device: 'pneu', handler: req_unit },
    ];

    buttons.forEach(({ text, image, device, handler }) => {
        let button = document.createElement("button");
        button.innerHTML = `<img src="${image}"><span>${text}</span>`;
        button.classList.add("custom-btn");
        button.dataset.device = device;
        btn_wrapper.appendChild(button);
        button.addEventListener("click", () => handler(button));
    });
}
function req_unit(e) {
    const dialog = document.createElement("dialog");
    let device = e.dataset.device;
    dialog.style = `
        width: 420px; 
        background-color: #ffffff; 
        border-radius: 16px; 
        padding: 20px; 
        position: fixed; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%);
        border: none;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        animation: fadeIn 0.3s ease-out;
    `;

    // Add animation keyframes
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -48%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes pulseButton {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        dialog::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
        }
    `;
    document.head.appendChild(styleSheet);

    const container = document.createElement("div");
    container.style = `
        display: flex; 
        flex-wrap: wrap; 
        justify-content: center; 
        align-items: start; 
        width: 100%; 
        height: 100%;
        gap: 10px;
    `;
    document.body.appendChild(dialog);

    const title = document.createElement("h3");
    title.textContent = `จำนวน ${device} ที่ต้องการ`;
    title.style = `
        width: 100%; 
        text-align: center; 
        margin: 0 0 15px 0; 
        color: #333;
        font-size: 1.3rem;
    `;
    container.appendChild(title);

    const input = document.createElement("input");
    input.type = "text";
    input.id = "unit";
    input.style = `
        width: 100%; 
        margin: 0 0 15px 0; 
        border-radius: 12px; 
        padding: 12px; 
        border: 2px solid #e0e0e0; 
        outline: none; 
        box-sizing: border-box; 
        font-size: 1.2rem; 
        text-align: center; 
        font-weight: bold; 
        color: #333;
        transition: all 0.3s ease;
    `;
    input.addEventListener("focus", function () {
        this.style.borderColor = "#4CAF50";
        this.style.boxShadow = "0 0 0 3px rgba(76, 175, 80, 0.2)";
    });
    input.addEventListener("blur", function () {
        this.style.borderColor = "#e0e0e0";
        this.style.boxShadow = "none";
    });
    input.addEventListener("keypress", function (e) {
        if (e.which === 13) document.getElementById("confirm").click();
    });
    container.appendChild(input);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.style = `
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        width: 100%;
        margin-bottom: 15px;
    `;

    for (let i = 0; i < 30; i++) {
        const button = document.createElement("button");
        button.textContent = i + 1;
        button.style = `
            margin: 0; 
            width: 45px; 
            height: 45px;
            border-radius: 12px;
            border: 2px solid #e0e0e0;
            background-color: #ffffff;
            color: #333;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        button.addEventListener("mouseover", function () {
            if (!this.classList.contains("is-selected")) {
                this.style.borderColor = "#4CAF50";
                this.style.transform = "translateY(-2px)";
            }
        });
        button.addEventListener("mouseout", function () {
            if (!this.classList.contains("is-selected")) {
                this.style.borderColor = "#e0e0e0";
                this.style.transform = "translateY(0)";
            }
        });
        button.addEventListener("click", function () {
            buttonsContainer.querySelectorAll("button").forEach((btn) => {
                btn.classList.remove("is-selected");
                btn.style.backgroundColor = "#ffffff";
                btn.style.borderColor = "#e0e0e0";
                btn.style.color = "#333";
                btn.style.transform = "translateY(0)";
            });
            this.classList.add("is-selected");
            this.style.backgroundColor = "#4CAF50";
            this.style.borderColor = "#4CAF50";
            this.style.color = "#ffffff";
            input.value = this.textContent;
            input.style.borderColor = "#4CAF50";
            input.style.boxShadow = "0 0 0 3px rgba(76, 175, 80, 0.2)";
        });
        buttonsContainer.appendChild(button);
    }
    container.appendChild(buttonsContainer);

    const confirmButton = document.createElement("button");
    confirmButton.id = "confirm";
    confirmButton.textContent = `ยืนยันเบิก ${device}`;
    confirmButton.style = `
        margin: 5px 0 0 0; 
        width: 100%; 
        border-radius: 12px; 
        background-color: #dc362e;
        color: white;
        font-size: 1.1rem;
        font-weight: bold;
        padding: 12px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(220, 54, 46, 0.2);
    `;
    confirmButton.addEventListener("mouseover", function () {
        this.style.backgroundColor = "#c62828";
        this.style.boxShadow = "0 6px 10px rgba(220, 54, 46, 0.3)";
        this.style.transform = "translateY(-2px)";
    });
    confirmButton.addEventListener("mouseout", function () {
        this.style.backgroundColor = "#dc362e";
        this.style.boxShadow = "0 4px 6px rgba(220, 54, 46, 0.2)";
        this.style.transform = "translateY(0)";
    });
    confirmButton.addEventListener("click", function () {
        this.style.animation = "pulseButton 0.3s";
    });

    confirmButton.addEventListener("click", async function () {
        const unitValue = input.value;
        if (unitValue && !isNaN(unitValue) && Number(unitValue) !== 0) {
            let url
            // const url = "https://nsmart.nhealth-asia.com/MTDPDB01/reserve/request_reserve1.php?s_groupid=156&s_catagory=15601&groupid=156&catagory=15601&brand=&model=";
            switch (device) {
                case 'baxter': url = "https://nsmart.nhealth-asia.com/MTDPDB01/reserve/request_reserve1.php?s_groupid=156&s_catagory=15601&groupid=156&catagory=15601&brand=&model=";
                    break;
                case 'hub': url = "https://nsmart.nhealth-asia.com/MTDPDB01/reserve/request_reserve1.php?s_groupid=567&s_catagory=56701&groupid=567&catagory=56701&brand=&model=";
                    break;
                case 'pneu': url = "https://nsmart.nhealth-asia.com/MTDPDB01/reserve/request_reserve1.php?s_groupid=234&s_catagory=23401&groupid=234&catagory=23401&brand=&model=";
                    break;
            }
            const newWindow = window.open(url, "_blank", "height=500,width=1000", true);
            await new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (newWindow.document.getElementsByName("equip_unit")[0]) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 1000);
            });
            newWindow.document.getElementsByName("equip_unit")[0].value = unitValue;
            newWindow.document.getElementsByName("borrow_tele")[0].value = "-";
            newWindow.document.getElementsByName("tbl_reserve")[0].submit();

            const interval = setInterval(() => {
                if (newWindow.document.getElementsByName("tbl_reserve1").length > 0) {
                    clearInterval(interval);
                    const reserveTable = newWindow.document.getElementsByName("tbl_reserve1")[0];
                    let rows = reserveTable.querySelectorAll(".Grid tbody .Row");
                    const innerInterval = setInterval(() => {
                        if (rows.length === Number(unitValue) + 1) {
                            clearInterval(innerInterval);
                            rows.forEach((row, index) => {
                                if (index > 0) row.querySelectorAll("td input")[0].value = "-";
                            });
                            reserveTable.submit();
                            setInterval(() => {
                                newWindow.close();
                                dialog.close();
                            }, 500);
                        } else {
                            rows = reserveTable.querySelectorAll(".Grid tbody .Row");
                        }
                    }, 300);
                }
            }, 300);

        } else {
            dialog.close();
        }
    });
    container.appendChild(confirmButton);

    // Add close button in corner
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "×";
    closeButton.style = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #f0f0f0;
        border: none;
        font-size: 1.5rem;
        line-height: 1;
        cursor: pointer;
        color: #666;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
        transition: all 0.2s ease;
    `;
    closeButton.addEventListener("mouseover", function () {
        this.style.backgroundColor = "#e0e0e0";
        this.style.color = "#333";
    });
    closeButton.addEventListener("mouseout", function () {
        this.style.backgroundColor = "#f0f0f0";
        this.style.color = "#666";
    });
    closeButton.addEventListener("click", function () {
        dialog.close();
    });

    dialog.appendChild(closeButton);
    dialog.appendChild(container);
    document.body.appendChild(dialog);
    dialog.showModal();

    // Focus on input after modal is shown
    setTimeout(() => {
        input.focus();
    }, 100);
}
async function distributeBaxter() {
    let codeInput = document.getElementsByName("code")[0];
    if (!document.getElementById("stUI68_txt") && codeInput) {
        autoFillCode('จ่ายเครื่อง');
        if (document.querySelectorAll("tr.Error").length > 0) {
            let errorMessage = document.querySelector("tr.Error td").textContent.toLowerCase().replace(/ /g, "");
            if (errorMessage === "theequipmentisusing") {
                await recieveBaxter(codeInput);
            }
        } else {
            let waiting_to_distribute = localStorage.getItem("waiting_to_จ่ายเครื่อง");
            if (waiting_to_distribute != null) {
                waiting_to_distribute = JSON.parse(waiting_to_distribute);
                if (waiting_to_distribute.length == 0) {
                    localStorage.setItem("waiting_to_จ่ายเครื่อง", '[]');
                } else {
                    save(waiting_to_distribute)
                }
            }
        }

    }
}

function autoFillCode() {
    document.getElementsByName("code")[0].addEventListener("keyup", function () {
        let e = document.getElementsByName("code")[0].value;
        if (e.toLowerCase() === "p" || e === "/") {
            this.value = "PYT3T_0";
            // document.getElementsByName("code")[0].removeEventListener("keyup", arguments.callee);
        } else if (e.toLowerCase() === "d" || e === "*") {
            this.value = "DEMO_0";
            // document.getElementsByName("code")[0].removeEventListener("keyup", arguments.callee);
        }
    });
    if (method_text == 'รับเครื่องคืน') {
        let waiting_to_recieve = localStorage.getItem("waiting_to_" + method_text);
        if (waiting_to_recieve == null) return;
        waiting_to_recieve = JSON.parse(waiting_to_recieve);
        console.log("🚀 ~ autoFillCode ~ waiting_to_recieve:", waiting_to_recieve)
        if (waiting_to_recieve.length == 0) {
            localStorage.setItem("waiting_to_" + method_text, '[]');
            return;
        }
        save(waiting_to_recieve)
        localStorage.setItem("waiting_to_" + method_text, JSON.stringify(waiting_to_recieve));
    };
}
async function recieveBaxter(e) {
    return await new Promise(async (resolve) => {
        let t = document.createElement("dialog");
        t.style =
            "width: 600px; background-color: #ffffff; border-radius: 5px; position: fixed; bottom: auto; transform: translate(0%, 10%);display: flex; flex-direction: row; justify-content: center; align-items: center;";
        t.innerHTML =
            '<h1>กำลังรับเครื่องคืน...</h1><img src="https://i.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.webp" style="width: 100px; height: 100px;">';
        document.body.insertBefore(t, document.body.firstChild);
        t.showModal();

        try {
            let response = await fetch(
                "reserve_ret_barcode.php?itemno_hd=2669472&groupid=156&catagory=15601&ccsForm=tbl_reserve2",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({ code: e.value }),
                }
            );

            if (response.ok) {
                t.querySelector("h1").textContent = "รับเครื่องคืนสำเร็จ";
                t.querySelector("img").remove();
                setTimeout(() => {
                    t.close();
                    window.document.getElementsByName("tbl_reserve2")[0].submit();
                    resolve();
                }, 1000);
            }
        } catch (error) {
            console.error("Error:", error);
            resolve();
        }
    })

}
function closePR_JOB() {
    let u = document.querySelector('input[name="Button_Update"]');
    let e = document.createElement("button");
    e.innerHTML = "ปิดงาน PR PM";
    e.type = "button";
    e.style =
        "width: 200px;font-size: 1rem; font-weight: bold; color: white; background-color: #4CAF50; border: none; border-radius: 5px; cursor: pointer; padding: 5px 10px; margin: 10px 10px; ";
    u.parentNode.insertBefore(e, u);
    // document.body.insertBefore(e, u);

    e.addEventListener("click", function () {
        event.preventDefault();
        var options = document.querySelectorAll('select[name="bec_id"] option');
        for (let t = 0; t < options.length; t++) {
            let r = options[t];
            if (r.innerText === "12-Service contract") {
                r.selected = true;
            }
        }

        var inputs = document.querySelectorAll('input[name="jobout_type"]');
        for (let t = 0; t < inputs.length; t++) {
            let r = inputs[t];
            if (r.value == "2") {
                r.checked = true;
            }
        }

        let t = document.querySelectorAll('input[name="req_date1"]')[0].value;
        t = t.indexOf(", ") > -1 ? t.split(", ") : t.split(" ");
        let r = t[0].split("/").map(Number);
        t = t[1].split(":");
        t = new Date(r[2], r[1] - 1, r[0], t[0], t[1]);

        document.querySelectorAll('input[name="jobdate"]')[0].value =
            document.querySelectorAll('input[name="req_date1"]')[0].value;
        document.querySelectorAll('input[name="assign_date"]')[0].value =
            document.querySelectorAll('input[name="req_date1"]')[0].value;
        document.querySelectorAll('input[name="arrive_date"]')[0].value = new Date(
            t.setMinutes(t.getMinutes() + 2)
        )
            .toLocaleString("en-GB", {
                hour12: false,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
            .replace(",", "");

        document.querySelectorAll('input[name="act_dstart"]')[0].value =
            document.querySelectorAll('input[name="arrive_date"]')[0].value;
        document.querySelectorAll('input[name="act_dfin"]')[0].value = new Date(
            t.setMinutes(t.getMinutes() + 2)
        )
            .toLocaleString("en-GB", {
                hour12: false,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
            .replace(",", "");

        options = document.querySelectorAll('select[name="job_result"] option');
        for (let t = 0; t < options.length; t++) {
            let r = options[t];
            if (r.innerText === "Self repair") {
                r.selected = true;
            }
        }

        document.getElementsByName("note")[0].value =
            "- \n- ใบเสนอราคาเลขที่: \n- จำนวน ครั้ง ระยะวลา ปี\n- เข้าทำเดือน: \n- ราคาทั้งสิ้น บาท";
    });
}
function tweakPageAssetDoc() {
    console.log('aaaaaaa');
    let desc_input = document.querySelector('input[name="doc_description"]')
    if (desc_input) {
        // Create a select element to replace the input
        let selectElement = document.createElement('select');
        selectElement.id = "doc_description2";
        selectElement.style = "margin-top: 5px;";
        selectElement.style.width = desc_input.offsetWidth + "px";

        // Add common options
        const options = [
            {
                value: "Purchase order",
                index_no: "0",
            },
            {
                value: "Certificate & License for Device (ใบตรวจรับรองการสอบเทียบเครื่อง)",
                index_no: "4",
            },
            {
                value: "สำเนาหนังสือรับรองประกอบการนาเข้าเครื่องมือแพทย์ เอกสารรับรองการควบคุมมาตรฐาน (FDA,อย.,มอก.)",
                index_no: "5",
            },
            {
                value: "ใบเสนอราคา",
                index_no: "6",
            },
            {
                value: "Spec รุ่น เครื่องมือและอุปกรณ์ครบถ้วนตามใบเสนอราคา",
                index_no: "7",
            },
            {
                value: "Invoice",
                index_no: "8",
            },
            {
                value: "หนังสือรับรองการเป็นตัวแทนจำหน่าย",
                index_no: "9",
            },
            {
                value: "Certificate Engineer",
                index_no: "10",
            },
            {
                value: "Tester’s Certificates ( ใบรับรองการสอบเทียบเครื่องมือที่ใช้ในการทดสอบ )",
                index_no: "11",
            },
            {
                value: "Schedule of maintenance with detail(แผนสอบเทียบและบำรุงรักษาพร้อมรายละเอียด)",
                index_no: "12",
            },
            {
                value: "Service Manual",
                index_no: "13",
            },
            {
                value: "OPERATION MANUAL",
                index_no: "14",
            },
            {
                value: "service contract",
                index_no: "16",
            },
            {
                value: "Air waybill/Bill of Loading (เอกสารการขนส่งสินค้า) ",
                index_no: "18",
            },
            {
                value: " เอกสารยินยอมการเก็บรักษาข้อมูล",
                index_no: "22",
            }
        ]
        options.sort((a, b) => Number(a.index_no) - Number(b.index_no));

        // Add default empty option
        let defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.text = "-- Select Document Detail --";
        selectElement.appendChild(defaultOption);

        // Add the rest of the options
        options.forEach(option => {
            let optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.text = option.value;
            optionElement.dataset.index_no = option.index_no;
            selectElement.appendChild(optionElement);
        });

        // Replace the input with our select
        desc_input.parentNode.appendChild(selectElement);
        document.querySelector('select[id="doc_description2"]').addEventListener('change', function () {
            let selectedOption = this.options[this.selectedIndex];
            let index_no = selectedOption.dataset.index_no;
            if (index_no) {
                // Set the value of the hidden input field
                document.querySelector('input[name="doc_description"]').value = selectedOption.value;
                document.querySelector('input[name="number"]').value = index_no;
            } else {
                // Clear the value of the hidden input field
                document.querySelector('input[name="number"]').value = "";
                document.querySelector('input[name="doc_description"]').value = "";
            }
        }
        );
    }
}

checkPage();
