let url = new URL(window.location.href);
let searchParams = new URLSearchParams(url.search);
let page = searchParams.get('page');
let previousDate = localStorage.getItem('previousDate') || '';
console.log("🚀 !! previousDate:", previousDate)
if (page == 'pm-form') {
    // PM DATA
    let arr = [
        "tr55acdafa101-recheck-pass",
        "tr55acdafa102-recheck-pass",
        "tr55acdafa103-recheck-none",
        "tr55acdafa104-recheck-pass",
        "tr55acdafa105-recheck-pass",
        "tr55acdafa106-recheck-none",
        "tr55acdafa107-recheck-pass",
        "tr55acdafa108-recheck-pass",
        "tr55acdafa109-recheck-pass",
        "tr55acdafa110-recheck-pass",
        "tr55acdafa111-recheck-pass",
        "tr55acdafa112-recheck-pass",
        "tr55acdb10101-recheck-pass",
        "tr55acdb10102-recheck-pass",
        "tr55acdb25101-recheck-pass",
        "tr55acdb25101-recheck-pass",
        "tr55acdb25102-recheck-none",
        "tr55acdb25103-recheck-none",
        "tr55acdb25104-recheck-none"
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
        if (this.id == 'table614af466_standard_code') return false;
        return this.id.match(/_standard_code/);
    });

    select.select2("val", "G5-BMEPYT3-013")
    let ids = [
        "tr55a4d1cd6_col2",
        "tr55a4d20a7_col2",
        "tr55a4d2158_col2",
        "tr55a4d21d9_col2"
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
        if ($('#SelectWorkForm option[value="25"]').length > 0) {
            $('#select_work_form_id').select2("val", "25");
        } else {
            $('#select_work_form_id').select2("val", "340");
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
    $('#work_date').datepicker("destroy");
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