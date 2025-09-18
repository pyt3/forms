class FormAutomation {
    constructor(
        date,
        pressure,
        job_id,
        code
    ) {
        this.stage = localStorage.getItem('stage') || '0';
        this.date = date;
        this.pressure = pressure;
        this.job_id = job_id;
        this.code = code;
    }

    fillValue(data) {
        const { name, value, type } = data;

        if (type === 'radio') {
            document.querySelector(`[name='${name}'][value='${value}']`)?.click();
        } else if (type === 'checkbox') {
            document.querySelector(`[name='${name}']`)?.click();
        } else {
            const element = document.querySelector(`[name='${name}']`);
            if (element) element.value = value;
        }
    }

    fillMultipleFields(dataArray) {
        dataArray.forEach(data => this.fillValue(data));
    }

    clickButton(buttonName) {
        document.querySelector(`[name='${buttonName}']`)?.click();
    }

    findAndClickLink(text) {
        const link = Array.from(document.querySelectorAll('a'))
            .find(el => el.textContent.includes(text));
        return link?.click();
    }

    setStage(stage) {
        localStorage.setItem('stage', stage);
    }

    removeStage() {
        localStorage.removeItem('stage');
        localStorage.removeItem('current_outlet_data');
    }

    executeStage0() {
        console.log('Stage 0');
        this.setStage('1');
        localStorage.setItem('current_outlet_data', JSON.stringify({ date: this.date, pressure: this.pressure, job_id: this.job_id }));
        
        let url = `https://nsmart.nhealth-asia.com/MTDPDB01/pm/maintain07.php?jobno=${this.job_id}&code=${this.code}`;
        window.location.href = url;
    }
    
    executeStage1() {
        console.log('Stage 1');
        
        
        const fillData = [
            { name: 'job_result', value: '1' },
            { name: 'assign_date', value: this.date },
            { name: 'act_dstart', value: this.date },
            { name: 'act_dfin', value: this.date },
            { name: 'approve_date', value: this.date },
            { name: 'emp_id', value: '593031' },
            { name: 'pass_status', value: '1', type: 'radio' },
            { name: 'toolid', value: '61' },
            { name: 'app_issue_name', value: '566152' }
        ];
        this.fillMultipleFields(fillData);
        this.setStage('2');
        this.clickButton('Button_Update');
    }

    executeStage2() {
        console.log('Stage 2');
        this.findAndClickLink('Update check list');
        this.setStage('3');
    }

    executeStage3() {
        console.log('Stage 3');
        const fillData = [
            { name: 'good_check_1', type: 'checkbox' },
            { name: 'good_check_10', type: 'checkbox' },
            { name: 'good_check_18', type: 'checkbox' },
            { name: 'main_note_18', value: this.pressure },
            { name: 'good_check_24', type: 'checkbox' },
            { name: 'good_check_26', type: 'checkbox' },
            { name: 'good_check_30', type: 'checkbox' }
        ];

        this.fillMultipleFields(fillData);
        this.clickButton('Button_Submit');
        this.setStage('4');
    }

    executeStage4() {
        console.log('Stage 4');
        this.findAndClickLink('Attach files');
        this.setStage('5');
    }

    executeStage5() {
        console.log('Stage 5');
        this.findAndClickLink('ยืนยันการแนบเอกสาร')
        this.removeStage();

    }

    nextStage() {
        setTimeout(() => {
            this.run();
        }, 1000);
    }

    run() {
        console.log(`Current Stage: ${this.stage}`);
        const stageMap = {
            '0': () => this.executeStage0(),
            '1': () => this.executeStage1(),
            '2': () => this.executeStage2(),
            '3': () => this.executeStage3(),
            '4': () => this.executeStage4(),
            '5': () => this.executeStage5()
        };

        const handler = stageMap[this.stage];
        if (handler) {
            handler();
        } else {
            console.log('Invalid stage');
        }
    }
}


setTimeout(() => {
    let currentData = localStorage.getItem('current_outlet_data');
    if (currentData) {
        currentData = JSON.parse(currentData.replace(/'/g, '"'));
        console.log('Resuming with current data:', currentData);
        new FormAutomation(currentData.date, currentData.pressure, currentData.job_id, currentData.code).run();
    } else {

        let dataToRun = localStorage.getItem('outlet_data');
        if (dataToRun) {
            dataToRun = JSON.parse(dataToRun.replace(/'/g, '"'));
            if (dataToRun?.length > 0) {
                const nextData = dataToRun.shift();
                localStorage.setItem('outlet_data', JSON.stringify(dataToRun));
                localStorage.setItem('current_outlet_data', JSON.stringify({ date: nextData.date, pressure: nextData.pressure, job_id: nextData.job_id, code: nextData.code }));
                localStorage.setItem('outlet_data_remaining', dataToRun.length);
                new FormAutomation(nextData.date, nextData.pressure, nextData.job_id, nextData.code).run();
            }
        }
    }
}, 2000);
