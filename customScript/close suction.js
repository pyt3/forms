let url = new URL(window.location.href);
let searchParams = new URLSearchParams(url.search);
let page = searchParams.get('page');
let previousDate = localStorage.getItem('previousDate') || '';
console.log("🚀 !! previousDate:", previousDate)
if (page == 'pm-form') {
    // PM DATA
    $('#tr55acdc75101_result_pass').click();
    $('#tr55acdc75102_result_pass').click();
    $('#tr55acdc75103_result_pass').click();
    $('#tr55acdc75104_result_none').click();
    $('#tr55acdc75105_result_pass').click();
    $('#tr55acdc75106_result_none').click();
    $('#tr55acdc75107_result_none').click();
    $('#tr55acdc75108_result_pass').click();
    $('#tr55acdc75109_result_pass').click();
    $('#tr55acdc75110_result_pass').click();
    $('#tr55acdcac101_result_none').click();
    $('#tr55acdcac102_result_none').click();
    $('#tr55acdcac103_result_pass').click();
    $('#tr55acdcc3101_result_pass').click();
    $('#tr55acdcc3102_result_none').click();
    $('#tr55acdcc3103_result_none').click();
    $('#tr55acdcc3104_result_none').click();
    setSameValue();
} else if (page == 'cal-form') {
    // CALIBRATOION DATA
    $('#work_temperature').val(25);
    $('#work_humidity').val(55);
    $('#table55a4d1cc_standard_code').select2("val", "G5-BMEPYT3-022")
    let ids = ['tr55a4d1cd6_col2', 'tr55a4d20a7_col2', 'tr55a4d2158_col2', 'tr55a71d561_col2', 'tr55a71d5c2_col2']
    ids.forEach(id => {
        $('#' + id).off('input').on('keyup', copyValue);
    })
    $('#table55a4d1cc_tolerance_fso_val').on('keyup', function () {
        //  if press enter
        if (event.keyCode == 13){
            $('#'+ids[0]).click();
            $('#'+ids[0]).focus();
        }
    })
    $('#table55a4d1cc_tolerance_fso_val').on('input', function () {
        
        let val = this.value;
        let range = []
        switch (val) {
            case '1000':
                range = [100, 200, 300, 400, 500]
                break;
            case '500':
                range = [100, 200, 300, 400, 500]
                break;
            case '300':
                range = [60, 120, 180, 240, 300]
                break;
            case '200':
                range = [40, 80, 120, 160, 200]
                break;
            case '60':
                range = [20, 30, 40, 50, 60]
                break;
            case '250':
                range = [50, 100, 150, 200, 250]
                break;
            case '400':
                range = [100, 200, 300, 400]
                break;
            case '150':
                range = [30, 60, 90, 120, 150]
                break;
            default:
                break;

        }
        if (range.length > 0) {

            ids.forEach((id, index) => {
                id = id.split('_')[0] + '_col1'
                $('#' + id).val(range[index])
            })
        }

    });
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
        if ($('#SelectWorkForm option[value="492"]').length > 0) {
            $('#select_work_form_id').select2("val", "492");
        } else {
            $('#select_work_form_id').select2("val", "494");
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
console.clear()
