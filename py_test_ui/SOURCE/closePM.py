from cv2 import find4QuadCornerSubpix
import pyautogui
import os
import time
import clipboard
import requests
from doClose import sendNotify
from doClose import findImage
from doClose import onlyfindImage
import sys

update = False
attach_only = True
pm_by_site = False
doc_detail_pm = "Report PM Team BME"
checklist = {
    'wheelchair': [1, 3, 30, 34],
    'stretcher': [1, 2, 3, 10, 13, 15, 24, 30, 31],
}
pm_coordinate = {}


# get directory of this file
dir_path = os.path.dirname(os.path.realpath(__file__))

if getattr(sys, 'frozen', False):
    dir_path = os.path.dirname(sys.executable)


def closePM(row, coordinate):
    print('coordinate: ', coordinate)
    global pm_coordinate
    if coordinate != False:
        pm_coordinate = coordinate
    id = str(row['CODE']).replace('.0', '')
    if len(id) == 6:
        id = "DEMO_" + id
    else:
        id = ("00000" + id)[-5:]

    pm_image_path = os.path.join(dir_path, 'imagefile', 'pm')
    pm_url = 'http://nsmart.nhealth-asia.com/mtdpdb01/pm/maintain_list.php'
    pm_screenshot_folder_closed = os.path.join(
        dir_path, 'pm_successed_screenshot', 'closed')
    pm_screenshot_folder_attached = os.path.join(
        dir_path, 'pm_successed_screenshot', 'attached')
    search_address = os.path.join(pm_image_path, 'search_address.JPG')
    search_result_btn = os.path.join(pm_image_path, 'search_result_btn.JPG')
    search_result_head = os.path.join(pm_image_path, 'search_result_head.JPG')
    search_result_close = os.path.join(
        pm_image_path, 'search_result_close.JPG')
    pm_general_detail_page = os.path.join(
        pm_image_path, 'pm_general_detail_page.JPG')
    approval_record_btn = os.path.join(
        pm_image_path, 'approval_record_btn.JPG')
    approval_record_page = os.path.join(
        pm_image_path, 'approval_record_page.JPG')
    pm_result_already_select = os.path.join(
        pm_image_path, 'pm_result_already_select.JPG')

    attach_file_btn = os.path.join(pm_image_path, 'attach_file_btn.JPG')
    attach_file_zone = os.path.join(pm_image_path, 'attach_file_zone.JPG')
    no_file_attach = os.path.join(pm_image_path, 'no_file_attach.JPG')
    attach_file_file_name_input = os.path.join(
        pm_image_path, 'attach_file_file_name_input.JPG')
    attach_file_add_btn = os.path.join(
        pm_image_path, 'attach_file_add_btn.JPG')
    attach_file_success = os.path.join(
        pm_image_path, 'attach_file_success.JPG')
    pm_main_screen = os.path.join(pm_image_path, 'pm_main_screen.JPG')
    close_status = os.path.join(pm_image_path, 'close_status.JPG')
    cursor = os.path.join(pm_image_path, 'cursor.JPG')
    cause_of_failure_btn = os.path.join(
        pm_image_path, 'cause_of_failure_btn.JPG')
    cause_of_failure_zone = os.path.join(
        pm_image_path, 'cause_of_failure_zone.JPG')
    cause_of_failure_input = os.path.join(
        pm_image_path, 'cause_of_failure_input.JPG')
    cause_of_failure_submit_btn = os.path.join(
        pm_image_path, 'cause_of_failure_submit_btn.JPG')
    file_not_found = os.path.join(pm_image_path, 'file_not_found.JPG')

    update_check_list_btn = os.path.join(
        pm_image_path, 'update_check_list_btn.JPG')
    checklist_zone = os.path.join(
        pm_image_path, 'checklist_zone.JPG')
    checklist_success = os.path.join(
        pm_image_path, 'checklist_success.JPG')
    checklist_attach_file = os.path.join(
        pm_image_path, 'checklist_attach_file.JPG')
    checklist_attach_file_confirm = os.path.join(
        pm_image_path, 'checklist_attach_file_confirm.JPG')
    error_v = os.path.join(
        pm_image_path, 'error_v.JPG')
    error_checked = os.path.join(
        pm_image_path, 'error_checked.JPG')

    # # search_address = "D:/download/close_PMCAL/imagefile/pm/search_address.JPG"
    # search_result_btn = "D:/download/close_PMCAL/imagefile/pm/search_result_btn.JPG"
    # search_result_head = "D:/download/close_PMCAL/imagefile/pm/search_result_head.JPG"
    # search_result_close = "D:/download/close_PMCAL/imagefile/pm/search_result_close.JPG"
    # pm_general_detail_page = "D:/download/close_PMCAL/imagefile/pm/pm_general_detail_page.JPG"
    # approval_record_btn = "D:/download/close_PMCAL/imagefile/pm/approval_record_btn.JPG"
    # approval_record_page = "D:/download/close_PMCAL/imagefile/pm/approval_record_page.JPG"
    # pm_result_already_select = "D:/download/close_PMCAL/imagefile/pm/pm_result_already_select.JPG"
    # attach_file_btn = "D:/download/close_PMCAL/imagefile/pm/attach_file_btn.JPG"
    # attach_file_zone = "D:/download/close_PMCAL/imagefile/pm/attach_file_zone.JPG"
    # no_file_attach = "D:/download/close_PMCAL/imagefile/pm/no_file_attach.JPG"
    # attach_file_file_name_input = "D:/download/close_PMCAL/imagefile/pm/attach_file_file_name_input.JPG"
    # attach_file_add_btn = "D:/download/close_PMCAL/imagefile/pm/attach_file_add_btn.JPG"
    # attach_file_success = "D:/download/close_PMCAL/imagefile/pm/attach_file_success.JPG"
    # pm_main_screen = "D:/download/close_PMCAL/imagefile/pm/pm_main_screen.JPG"
    # close_status = "D:/download/close_PMCAL/imagefile/pm/close_status.JPG"
    # cursor = "D:/download/close_PMCAL/imagefile/pm/cursor.JPG"

    def refresh_page(reason, noclose=False, end=False):
        # if(noclose == False):
        #     pyautogui.hotkey("ctrl", "w")
        if(end == True):
            return
        # pyautogui.sleep(1)
        if not 'cursor' in pm_coordinate:
            if not onlyfindImage({cursor}, .95):
                pyautogui.keyDown("ctrl")
                pyautogui.keyDown("shift")
                pyautogui.keyDown("i")
                pyautogui.keyUp("ctrl")
                pyautogui.keyUp("shift")
                pyautogui.keyUp("i")
            pyautogui.moveTo(findImage({cursor}, .85))
            pyautogui.move(200,400)
            pm_coordinate['cursor'] = pyautogui.position()
        else:
            pyautogui.moveTo(pm_coordinate['cursor'])

        pyautogui.click()
        consoleText = '''location.href = "%s"''' % (pm_url)

        clipboard.copy(consoleText)
        pyautogui.keyDown("ctrl")
        pyautogui.keyDown("v")
        pyautogui.keyUp('ctrl')
        pyautogui.keyUp('v')
        pyautogui.press("enter")
        pyautogui.sleep(.2)
        if onlyfindImage({error_checked}):
            pyautogui.keyDown("ctrl")
            pyautogui.keyDown("v")
            pyautogui.keyUp('ctrl')
            pyautogui.keyUp('v')
            pyautogui.press("enter")
        if(findImage({pm_main_screen}, .5)):
            print("PM main screen")
            print(reason)
            return

    def screenshot(type):
        path = ''
        if type == 'closed':
            path = pm_screenshot_folder_closed
        elif type == 'attached':
            path = pm_screenshot_folder_attached
        else:
            return
        screenshot = pyautogui.screenshot()
        screenshot.save(path + id + '.jpg')

    def pm_fill_result_input():
        if not update and onlyfindImage({close_status}, .8):
            return
        consoleText = '''var opts = document.querySelectorAll('select[name="job_result"] option');for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.innerText === "%s") opt.selected = true;};
        opts = document.querySelectorAll('select[name="dept_tech"] option');for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.innerText === "%s") opt.selected = true;};
        opts = document.querySelectorAll('select[name="toolid"] option');for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.innerText === "%s") opt.selected = true;};
        opts = document.querySelectorAll('select[name="emp_id"] option');for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.innerText === "%s") opt.selected = true;};
        opts = document.querySelectorAll('select[name="app_issue_name"] option');for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.innerText.replace(/\s/g,'') === "%s") opt.selected = true;};
        if("%s" == "pass"){opts = document.querySelectorAll('input[name="pass_status"]');
        for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.value === "1") opt.checked = true;}}else{opts = document.querySelectorAll('input[name="pass_status"]');
        for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.value === "0") opt.checked = true;}};
        document.querySelector('input[name="assign_date"]').value = "%s";document.querySelector(
            'input[name="act_dstart"]').value = "%s";
        document.querySelector('input[name="act_dfin"]').value = "%s";document.querySelector(
            'input[name="approve_date"]').value = "%s";
        document.querySelector('input[name="Button_Update"]').click();
        console.clear()
''' % (row['PM-RESULT'], row['TEAM'], row['TESTER'], row['NAME'], row['INSPECTOR'].replace(' ', ''), row['PM-STATUS'], row['DATE-PM'], row['DATE-PM'], row['DATE-PM'], row['DATE-PM'])
        if findImage({approval_record_page}):
            # if onlyfindImage({cursor}) == False:
            #     pyautogui.keyDown("ctrl")
            #     pyautogui.keyDown("shift")
            #     pyautogui.keyDown("i")
            #     pyautogui.keyUp("ctrl")
            #     pyautogui.keyUp("shift")
            #     pyautogui.keyUp("i")

            if not 'cursor' in pm_coordinate:
                pyautogui.moveTo(findImage({cursor}))
                pyautogui.move(200,400)
                pm_coordinate['cursor'] = pyautogui.position()
            else:
                pyautogui.moveTo(pm_coordinate['cursor'])

            pyautogui.click()
            clipboard.copy(consoleText)
            pyautogui.keyDown("ctrl")
            pyautogui.keyDown("v")
            pyautogui.keyUp('ctrl')
            pyautogui.keyUp('v')
            pyautogui.press("enter")
            # pyautogui.sleep(1)
        # pyautogui.moveTo(
        #     findImage({pm_submit_btn}, .8))
        # pyautogui.click()
        # if onlyfindImage({alert}, .6):
        #     print(onlyfindImage({alert}, .6))
        #     pyautogui.moveTo(
        #         findImage({back_btn}, .9))
        #     pyautogui.click()
        #     pyautogui.hotkey("ctrl", "r")
        #     pyautogui.sleep(1)
        #     return pm_fill_result_input()
        # else:
            if update:
                pyautogui.sleep(1)
            finish = False
            t = time.time()
            while finish == False:
                if time.time()-t >= 8:
                    # pyautogui.moveTo(
                    #     findImage({back_btn}, .9))
                    # pyautogui.click()
                    # pyautogui.hotkey("ctrl", "r")
                    # pyautogui.sleep(1)
                    # return pm_fill_result_input()
                    pyautogui.keyDown("ctrl")
                    pyautogui.keyDown("v")
                    pyautogui.keyUp('ctrl')
                    pyautogui.keyUp('v')
                    pyautogui.press("enter")
                    t = time.time()
                    continue
                finish = onlyfindImage({close_status}, .8)

            if row['PM-STATUS'] == "fail":
                if not 'cause_of_failure_btn' in pm_coordinate:
                    pyautogui.moveTo(
                        findImage({cause_of_failure_btn}, .8))
                    pyautogui.move(0, -20)
                    pm_coordinate['cause_of_failure_btn'] = pyautogui.position()
                else:
                    pyautogui.moveTo(pm_coordinate['cause_of_failure_btn'])
                for i in range(4):
                    pyautogui.click()
                    pyautogui.move(0, 10)

                if findImage({cause_of_failure_zone}):
                    if not 'cause_of_failure_input' in pm_coordinate:
                        pyautogui.moveTo(
                            findImage({cause_of_failure_input}, .8))
                        pyautogui.move(300, 0)
                        pm_coordinate['cause_of_failure_input'] = pyautogui.position(
                        )
                    else:
                        pyautogui.moveTo(
                            pm_coordinate['cause_of_failure_input'])

                    pyautogui.click()
                    clipboard.copy(row['E-CERT-STATUS'] +
                                   " : " + row['CAUSE-OF-FAIL'])
                    pyautogui.keyDown("ctrl")
                    pyautogui.keyDown("a")
                    pyautogui.keyUp('ctrl')
                    pyautogui.keyUp('a')
                    pyautogui.keyDown("ctrl")
                    pyautogui.keyDown("v")
                    pyautogui.keyUp('ctrl')
                    pyautogui.keyUp('v')

                    if not 'cause_of_failure_submit_btn' in pm_coordinate:
                        pyautogui.moveTo(
                            findImage({cause_of_failure_submit_btn}, .8))
                        pm_coordinate['cause_of_failure_submit_btn'] = pyautogui.position(
                        )
                    else:
                        pyautogui.moveTo(
                            pm_coordinate['cause_of_failure_submit_btn'])

                    pyautogui.click()
                    # pyautogui.sleep(1)

    def fill_checklist_pm():
        pyautogui.moveTo(findImage({update_check_list_btn}))
        pyautogui.click()
        if findImage({checklist_zone}):
            pyautogui.sleep(.5)
            consoleText = ''
            for i in checklist.get(row['KEY']):
                consoleText += '''document.getElementsByName("good_check_%s")[0].checked = true;''' % (
                    i)
            consoleText += 'document.getElementsByName("Button_Submit")[0].click()'
            if not 'cursor' in pm_coordinate:
                pyautogui.moveTo(findImage({cursor}))
                pyautogui.move(200,400)
                pm_coordinate['cursor'] = pyautogui.position()
            else:
                pyautogui.moveTo(pm_coordinate['cursor'])
            pyautogui.click()
            clipboard.copy(consoleText)
            pyautogui.keyDown("ctrl")
            pyautogui.keyDown("v")
            pyautogui.keyUp('ctrl')
            pyautogui.keyUp('v')
            pyautogui.press("enter")
            pyautogui.sleep(.2)
            if onlyfindImage({error_checked}):
                pyautogui.keyDown("ctrl")
                pyautogui.keyDown("v")
                pyautogui.keyUp('ctrl')
                pyautogui.keyUp('v')
                pyautogui.press("enter")
            if findImage({checklist_attach_file},.98):
                pyautogui.moveTo(findImage({checklist_attach_file}, .98))
                pyautogui.click()
                pyautogui.sleep(1)

                if not 'checklist_attach_file_confirm' in pm_coordinate:
                    pyautogui.moveTo(findImage({checklist_attach_file_confirm}))
                    pm_coordinate['checklist_attach_file_confirm'] = pyautogui.position()
                else:
                    pyautogui.moveTo(pm_coordinate['checklist_attach_file_confirm'])
                pyautogui.click()
                pyautogui.sleep(2)
                if(findImage({attach_file_success})):
                    screenshot('attached')
                    refresh_page('attach file success', end=True)

    def attachFile():
        if row['ATTACH-FILE-PM'] != "yes":
            refresh_page('no attach file', end=True)
        else:
            if pm_by_site:
                return fill_checklist_pm()
            if not 'attach_file_btn' in pm_coordinate:
                pyautogui.moveTo(
                    findImage({attach_file_btn}))
                pm_coordinate['attach_file_btn'] = pyautogui.position()
            else:
                pyautogui.moveTo(pm_coordinate['attach_file_btn'])

            pyautogui.click()
            if findImage({attach_file_zone}):
                if onlyfindImage({no_file_attach}, .99):
                    # # if 1 == 1:
                    # pyautogui.moveTo(
                    #     findImage({attach_file_number_input}))
                    # pyautogui.click()
                    # pyautogui.typewrite("1", interval=0)
                    # pyautogui.moveTo(
                    #     findImage({attach_file_detail}))
                    # pyautogui.click()
                    # pyautogui.typewrite(
                    #     "REPORT PM "+row["TEAM"]+" "+row["NAME"], interval=0)

                    consoleText = '''document.querySelector('input[name="docno"]').value = "1";document.querySelector('input[name="description_doc"]').value = "%s";document.querySelector('input[name="document_File"]').click();console.clear()
                    ''' % (doc_detail_pm)

                    # if onlyfindImage({cursor}) == False:
                    #     pyautogui.keyDown("ctrl")
                    #     pyautogui.keyDown("shift")
                    #     pyautogui.keyDown("i")
                    #     pyautogui.keyUp("ctrl")
                    #     pyautogui.keyUp("shift")
                    #     pyautogui.keyUp("i")

                    if not 'cursor' in pm_coordinate:
                        pyautogui.moveTo(findImage({cursor}))
                        pyautogui.move(200,400)
                        pm_coordinate['cursor'] = pyautogui.position()
                    else:
                        pyautogui.moveTo(pm_coordinate['cursor'])

                    pyautogui.click()
                    clipboard.copy(consoleText)
                    pyautogui.keyDown("ctrl")
                    pyautogui.keyDown("v")
                    pyautogui.keyUp('ctrl')
                    pyautogui.keyUp('v')
                    pyautogui.press("enter")
                    pyautogui.sleep(1)

                    # pyautogui.moveTo(
                    #     findImage({attach_file_select_btn}))
                    # pyautogui.click()
                    if(findImage({attach_file_file_name_input})):

                        if not 'attach_file_file_name_input' in pm_coordinate:
                            pyautogui.moveTo(
                                findImage({attach_file_file_name_input}))
                            pm_coordinate['attach_file_file_name_input'] = pyautogui.position(
                            )
                        else:
                            pyautogui.moveTo(
                                pm_coordinate['attach_file_file_name_input'])

                        pyautogui.click()
                        pyautogui.typewrite(
                            # row['SN']+'.pdf', interval=0)
                            id+'_pm.pdf', interval=0)
                        pyautogui.press("enter")
                        pyautogui.sleep(.5)

                        if onlyfindImage({file_not_found}):
                            pm_coordinate[row['CODE']] = 'file not found'
                            pyautogui.press("esc")
                            pyautogui.press("esc")
                            return

                        if not 'attach_file_add_btn' in pm_coordinate:
                            pyautogui.moveTo(
                                findImage({attach_file_add_btn}))
                            pm_coordinate['attach_file_add_btn'] = pyautogui.position(
                            )
                        else:
                            pyautogui.moveTo(
                                pm_coordinate['attach_file_add_btn'])

                        pyautogui.click()
                        pyautogui.move(0, 100)
                        # pyautogui.press("enter")
                        finish = None
                        t = time.time()
                        # pyautogui.alert(text='attach file',title='Alert', button='OK')
                        while finish == None:
                            if time.time()-t >= 20:
                                pyautogui.moveTo(
                                    pm_coordinate['attach_file_add_btn'])
                                pyautogui.click()
                                pyautogui.move(0, 100)
                                t = time.time()
                                continue
                            finish = onlyfindImage({attach_file_success})
                        if(findImage({attach_file_success})):
                            screenshot('attached')
                            refresh_page('attach file success', end=True)
                else:
                    screenshot('attached')
                    refresh_page('attach file success', end=True)

    def pm_approval_record():
        if not 'approval_record_btn' in pm_coordinate:
            pyautogui.moveTo(findImage({approval_record_btn}, .9))
            pm_coordinate['approval_record_btn'] = pyautogui.position()
        else:
            pyautogui.moveTo(pm_coordinate['approval_record_btn'])

        pyautogui.click()
        if findImage({approval_record_page}):
            if not update and onlyfindImage({pm_result_already_select}, .7):
                print("PM Result Already Select")
                screenshot('closed')
                attachFile()
            else:
                pm_fill_result_input()
                screenshot('closed')
                attachFile()
            # pm_fill_result_input()
            # screenshot('closed')
            # attachFile()

    def run_pm():
        # pyautogui.sleep(1)
        consoleText = '''document.querySelector('input[name="s_jobdate"]').value = "%s";
document.querySelector(
    'input[name="s_to_date"]').value = "%s";
document.querySelector('select[name="s_byear"]').value = "%s";
document.querySelector('input[name="s_sap_code"]').value = "%s";
var opts = document.querySelectorAll('select[name="s_dept_tech"] option');
for (let index = 0; index < opts.length; index++) {let opt = opts[index];
if(opt.innerText === "%s") opt.selected = true;};
document.querySelector('input[name="Button_DoSearch"]').click();console.clear()
''' % (row['START-PLAN'], row['END-PLAN'], row['YEAR'][:4], id, row['TEAM'])
        if findImage({pm_main_screen}):
            if not 'cursor' in pm_coordinate:
                if not onlyfindImage({cursor}, .95):
                    pyautogui.keyDown("ctrl")
                    pyautogui.keyDown("shift")
                    pyautogui.keyDown("i")
                    pyautogui.keyUp("ctrl")
                    pyautogui.keyUp("shift")
                    pyautogui.keyUp("i")
                pyautogui.moveTo(findImage({cursor}, .85))
                pyautogui.move(200,400)
                pm_coordinate['cursor'] = pyautogui.position()
            else:
                pyautogui.moveTo(pm_coordinate['cursor'])

            pyautogui.click()
            clipboard.copy(consoleText)
            pyautogui.keyDown("ctrl")
            pyautogui.keyDown("v")
            pyautogui.keyUp('ctrl')
            pyautogui.keyUp('v')
            pyautogui.press("enter")
        # wait for search result
            if findImage({search_result_btn}, .99):
                print("Search Result Found")

                # check if already closed then skip
                if not update and onlyfindImage({search_result_close}, .8) and row['ATTACH-FILE-PM'] != "yes":
                    return True

                # open code in new tab
                if not 'search_result_head' in pm_coordinate:
                    pyautogui.moveTo(
                        findImage({search_result_head}, .8))
                    pyautogui.move(-30, 27)
                    pm_coordinate['search_result_head'] = pyautogui.position()
                else:
                    pyautogui.moveTo(pm_coordinate['search_result_head'])

                # loop for 4 times
                for i in range(5):
                    pyautogui.click()
                    pyautogui.move(15, 0)

                if findImage({pm_general_detail_page}):
                    if attach_only:
                        attachFile()
                        return
                    pm_approval_record()
    if onlyfindImage({pm_main_screen}, .99):
        run_pm()
    else:
        refresh_page('not on pm main screen', noclose=True)
        # pyautogui.sleep(1)
        run_pm()
    return pm_coordinate
