let url = new URL(window.location.href);
let searchParams = new URLSearchParams(url.search);
let page = searchParams.get('page');
let previousDate = localStorage.getItem('previousDate') || '';
console.log("🚀 !! previousDate:", previousDate)
if (page == 'pm-form') {
    // PM DATA
    let arr = [
        "",
        "tr55ace183101-recheck-pass",
        "tr55ace183102-recheck-pass",
        "tr55ace183103-recheck-pass",
        "tr55ace183104-recheck-pass",
        "tr55ace183105-recheck-pass",
        "tr55ace183106-recheck-pass",
        "tr55ace183107-recheck-pass",
        "tr55ace183108-recheck-pass",
        "tr55ace183109-recheck-pass",
        "tr55ace183110-recheck-pass",
        "tr55ace183111-recheck-pass",
        "tr55ace183112-recheck-pass",
        "tr55ace183113-recheck-pass",
        "tr55ace183114-recheck-none",
        "tr55ace183115-recheck-none",
        "tr55ace183116-recheck-pass",
        "tr55ace183117-recheck-pass",
        "tr60f698fc1-recheck-pass",
        "tr55ace1a5101-recheck-pass",
        "tr55ace1a5102-recheck-pass",
        "tr55ace1a5103-recheck-pass",
        "tr55ace1a5104-recheck-pass",
        "tr55ace1a5105-recheck-pass",
        "tr62d76eea1-recheck-pass",
        "tr55ace1b9101-recheck-pass",
        "tr55ace1b9102-recheck-none",
        "tr55ace1b9103-recheck-none",
        "tr55ace1b9104-recheck-none"
    ]
    arr.forEach(id => {
        $('#' + id).click();
    })
    setSameValue();
} else if (page == 'cal-form') {
    // CALIBRATOION DATA
    $('#work_temperature').val(25);
    $('#work_humidity').val(55);
    $('select')
    // get select that id include '_standard_code
    let select = $('select').filter(function () {
        if(this.id == 'table614af466_standard_code') return false;
        return this.id.match(/_standard_code/);
    });

    select.select2("val", "G5-BMEPYT3-013")
    let ids = [
        "tr55af3c661_col2",
        "tr55af3c882_col2",
        "tr55af3c8e3_col2",
        "tr55af3cb14_col2",
        "tr55af3cc55_col2",
        "tr55af3ccb6_col2",
        "tr55af417b25_col2",
        "tr55af41a326_col2",
        "tr55af41a527_col2",
        "tr55b0b53e1_col2",
        "tr55b0b55d2_col2",
        "tr55b0b55f3_col2",
        "tr614af4671_col2",
        "tr614af4942_col2",
        "tr614af4963_col2"
    ]
    ids.forEach(id => {
        $('#' + id).off('input').on('keyup', copyValue);
    })
   
    function copyValue() {
        // if enter key is pressed move cursor to next row
        if (event.keyCode == 13) {
            let row = $(this).closest('tr');
            let id = row.attr('id').split('_')[0] + '_col2';
            let id_index = ids.findIndex(x => x == id);
            let nextRowInput = $('#' + ids[id_index + 1])
            $(nextRowInput).click();
            $(nextRowInput).focus();

            return
        }

        let id = this.id.split('_')[0];
        let values = generateThreeValuesWithSameMean(value);
        $('#' + id + '_col3').val(values[1]);
        $('#' + id + '_col4').val(values[2]);
        $('#' + id + '_col5').val(values[3]);


    }
    setSameValue();
} else if (page == 'plan-equipments') {
    async function waitForEle(selector) {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (document.querySelector(selector)) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
    $('#QuickSearchResultBox').on('shown.bs.modal', async function () {
        await waitForEle('#SelectWorkForm');
        if ($('#SelectWorkForm option[value="130"]').length > 0) {
            $('#select_work_form_id').select2("val", "130");
        } else {
            $('#select_work_form_id').select2("val", "298");
        }
        $('#select_work_form_id').closest('form').find('.btn-primary').click();
    })
}

function generateThreeValuesWithSameMean(initialValue) {
    initialValue = Number(initialValue);
    if (typeof initialValue !== 'number') {
      throw new Error('Initial value must be a number.');
    }
  
    // Calculate the sum of four values to have the same mean.
    const sum = initialValue * 4;
  
    // Generate random values for value2, value3, and value4 within the range [initialValue - 0.08, initialValue + 0.08].
    const value2 = (initialValue - 0.08 + Math.random() * 0.16).toFixed(2);
    const value3 = (initialValue - 0.08 + Math.random() * 0.16).toFixed(2);
    const value4 = (initialValue - 0.08 + Math.random() * 0.16).toFixed(2);
  
    // Calculate the fourth value to ensure the mean is the same as the initial value.
    const value1 = ((sum - value2 - value3 - value4) / 4).toFixed(2);
   
    return [value1, value2, value3, value4];
  }

function setSameValue() {
    document.getElementById('work_temperature').value = 25;
    document.getElementById('work_humidity').value = 55;
    document.getElementById('work_date').focus()
    document.getElementById('work_date').value = previousDate;
    $('#work_date').datepicker
("destroy");
    $('#work_date').datepicker({
        dateFormat: 'yy-mm-dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
        //defaultDate: '2015-01-15',
        onSelect: function (selectedDate) {
            console.log("🚀 !! selectedDate:", selectedDate)
            updateDate(selectedDate)
            ChangeStandardDate();
        }
    });
    $('#work_date').datepicker("setDate", new Date(previousDate));
    updateDate(previousDate)
}
function updateDate(selectedDate) {
    let date = new Date(selectedDate);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    $('#work_due').datepicker("setDate", lastDay);
    localStorage.setItem('previousDate', selectedDate);
}

// let aaa = []
// $('input').on('focus', function () {
//     aaa.push(this.id)
//     console.log(aaa)
// })