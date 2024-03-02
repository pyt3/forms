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
doc_detil_cal = 'Report CAL Team BME'
cal_coordinate = {}


# get directory of this file
dir_path = os.path.dirname(os.path.realpath(__file__))


if getattr(sys, 'frozen', False):
    dir_path = os.path.dirname(sys.executable)


def closeCAL(row, coordinate):
    global cal_coordinate
    if coordinate:
        cal_coordinate = coordinate
    id = str(row['CODE']).replace('.0', '')
    if len(id) == 6:
        id = "DEMO_" + id
    else:
        id = ("00000" + id)[-5:]

    cal_image_path = os.path.join(dir_path, 'imagefile', 'cal')
    cal_url = 'http://nsmart.nhealth-asia.com/mtdpdb01/caliber/caliber03.php'
    cal_screenshot_folder_closed = os.path.join(
        dir_path, 'cal_successed_screenshot', 'closed')
    cal_screenshot_folder_attached = os.path.join(
        dir_path, 'cal_successed_screenshot', 'attached')
    search_address = os.path.join(cal_image_path, 'search_address.JPG')
    search_result_btn = os.path.join(cal_image_path, 'search_result_btn.JPG')
    search_result_btn2 = os.path.join(cal_image_path, 'search_result_btn2.JPG')
    search_result_close = os.path.join(
        cal_image_path, 'search_result_close.JPG')
    cal_general_detail_page = os.path.join(
        cal_image_path, 'cal_general_detail_page.JPG')
    cal_pass_already_click = os.path.join(
        cal_image_path, 'cal_pass_already_click.JPG')
    cal_notpass_already_click = os.path.join(
        cal_image_path, 'cal_notpass_already_click.JPG')
    attach_file_btn = os.path.join(cal_image_path, 'attach_file_btn.JPG')
    attach_file_zone = os.path.join(cal_image_path, 'attach_file_zone.JPG')
    no_file_attach = os.path.join(cal_image_path, 'no_file_attach.JPG')
    attach_file_file_name_input = os.path.join(
        cal_image_path, 'attach_file_file_name_input.JPG')
    attach_file_add_btn = os.path.join(
        cal_image_path, 'attach_file_add_btn.JPG')
    attach_file_success = os.path.join(
        cal_image_path, 'attach_file_success.JPG')
    cal_main_screen = os.path.join(cal_image_path, 'cal_main_screen.JPG')
    close_status = os.path.join(cal_image_path, 'close_status.JPG')
    cursor = os.path.join(dir_path, 'imagefile', 'pm', 'cursor.JPG')
    file_not_found = os.path.join(
        dir_path, 'imagefile', 'pm', 'file_not_found.JPG')

    # cal_screenshot_folder_closed = 'D:\download\close_PMCAL\cal_successed_screenshot\closed\\'
    # cal_screenshot_folder_attached = 'D:\download\close_PMCAL\cal_successed_screenshot\\attached\\'
    # search_address = "D:/download/close_PMCAL/imagefile/cal/search_address.JPG"
    # search_result_btn = "D:/download/close_PMCAL/imagefile/cal/search_result_btn.JPG"
    # search_result_btn2 = "D:/download/close_PMCAL/imagefile/cal/search_result_btn2.JPG"
    # search_result_close = "D:/download/close_PMCAL/imagefile/cal/search_result_close.JPG"
    # cal_general_detail_page = "D:/download/close_PMCAL/imagefile/cal/cal_general_detail_page.JPG"
    # cal_pass_already_click = "D:/download/close_PMCAL/imagefile/cal/cal_pass_already_click.JPG"
    # cal_notpass_already_click = "D:/download/close_PMCAL/imagefile/cal/cal_notpass_already_click.JPG"
    # attach_file_btn = "D:/download/close_PMCAL/imagefile/cal/attach_file_btn.JPG"
    # attach_file_zone = "D:/download/close_PMCAL/imagefile/cal/attach_file_zone.JPG"
    # no_file_attach = "D:/download/close_PMCAL/imagefile/cal/no_file_attach.JPG"
    # attach_file_file_name_input = "D:/download/close_PMCAL/imagefile/cal/attach_file_file_name_input.JPG"
    # attach_file_add_btn = "D:/download/close_PMCAL/imagefile/cal/attach_file_add_btn.JPG"
    # attach_file_success = "D:/download/close_PMCAL/imagefile/cal/attach_file_success.JPG"
    # cal_main_screen = "D:/download/close_PMCAL/imagefile/cal/cal_main_screen.JPG"
    # close_status = "D:/download/close_PMCAL/imagefile/cal/close_status.JPG"
    # cursor = "D:/download/close_PMCAL/imagefile/pm/cursor.JPG"

    def refresh_page(reason, noclose=False, end=False):
        # if(noclose == False):
        #     pyautogui.hotkey("ctrl", "w")
        if end == True:
            return
        # pyautogui.sleep(1)
        if not 'cursor' in cal_coordinate:
            if not onlyfindImage({cursor}, .95):
                pyautogui.keyDown("ctrl")
                pyautogui.keyDown("shift")
                pyautogui.keyDown("i")
                pyautogui.keyUp("ctrl")
                pyautogui.keyUp("shift")
                pyautogui.keyUp("i")

            pyautogui.moveTo(findImage({cursor}, .85))
            pyautogui.move(200, 400)
            cal_coordinate['cursor'] = pyautogui.position()
        else:
            pyautogui.moveTo(cal_coordinate['cursor'])
        pyautogui.click()
        consoleText = '''location.href = "%s"''' % (cal_url)

        clipboard.copy(consoleText)
        pyautogui.keyDown("ctrl")
        pyautogui.keyDown("v")
        pyautogui.keyUp('ctrl')
        pyautogui.keyUp('v')
        pyautogui.press("enter")
        if(findImage({cal_main_screen}, .5)):
            print("CAL main screen")
            print(reason)
            return

    def screenshot(type):
        path = ''
        if type == 'closed':
            path = cal_screenshot_folder_closed
        elif type == 'attached':
            path = cal_screenshot_folder_attached
        else:
            return
        screenshot = pyautogui.screenshot()
        screenshot.save(path + id + '.jpg')

    def cal_fill_result_input():
        if not update and onlyfindImage({close_status}, .8):
            return
        consoleText = '''var opts = document.querySelectorAll('select[name="tech_idea_stat"] option');for (let index = 0; index < opts.length; index++) {let opt = opts[index];if(opt.innerText === "%s") opt.selected= true;};opts = document.querySelectorAll('select[name="dept_caliber"] option');for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.innerText === "%s") opt.selected= true;}
        document.querySelectorAll('select[name="dept_caliber"]')[0].dispatchEvent(new Event('change'));
if("%s" == "pass"){opts = document.querySelectorAll('input[name="CheckBox2"]');for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.value === "1") opt.checked = true;}}else{opts = document.querySelectorAll('input[name="CheckBox2"]');for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.value === "0") opt.checked = true;}};document.querySelector('input[name="assign_date"]').value = "%s";document.querySelector('input[name="act_dstart"]').value = "%s";document.querySelector('input[name="act_dfin"]').value = "%s";document.querySelector('input[name="inspec_app_name"]').value = "%s";  opts = document.querySelectorAll('select[name="emp_id"] option');for (let index = 0; index < opts.length; index++) {let opt = opts[index]; if(opt.innerText.replace(/\s/g,'') === "%s") opt.selected = true;};document.querySelector('input[name="Button_Update"]').click();console.clear()
''' % (row['CAL-RESULT'], row['TEAM'], row['CAL-STATUS'], row['DATE-CAL'], row['DATE-CAL'], row['DATE-CAL'], row['INSPECTOR'], row['NAME'].replace(' ', ''))
        if findImage({cal_general_detail_page}):
            # if not onlyfindImage({cursor}, .85):
            #     pyautogui.keyDown("ctrl")
            #     pyautogui.keyDown("shift")
            #     pyautogui.keyDown("i")
            #     pyautogui.keyUp("ctrl")
            #     pyautogui.keyUp("shift")
            #     pyautogui.keyUp("i")

            if not 'cursor' in cal_coordinate:
                pyautogui.moveTo(findImage({cursor}, .85))
                pyautogui.move(200, 400)
                cal_coordinate['cursor'] = pyautogui.position()
            else:
                pyautogui.moveTo(cal_coordinate['cursor'])

            pyautogui.click()
            clipboard.copy(consoleText)
            pyautogui.keyDown("ctrl")
            pyautogui.keyDown("v")
            pyautogui.keyUp('ctrl')
            pyautogui.keyUp('v')
            pyautogui.press("enter")
            # pyautogui.sleep(1)

        # if onlyfindImage({alert}, .6):
        #     pyautogui.moveTo(
        #         findImage({back_btn}, .9))
        #     pyautogui.click()
        #     return cal_fill_result_input()
        # else:
        # if onlyfindImage({close_status}, .8) != None:
        #     return True
        # else:
        #     pyautogui.moveTo(
        #         findImage({back_btn}, .9))
        #     pyautogui.click()
        #     pyautogui.hotkey("ctrl", "r")
        #     pyautogui.sleep(1)
        #     return cal_approval_record()
        # pyautogui.sleep(3)
            finish = False
            t = time.time()
            while finish == False:
                if time.time()-t >= 8:
                    pyautogui.keyDown("ctrl")
                    pyautogui.keyDown("v")
                    pyautogui.keyUp('ctrl')
                    pyautogui.keyUp('v')
                    pyautogui.press("enter")
                    t = time.time()
                    continue
                finish = onlyfindImage({close_status}, .8)

    def attachFile():
        if(row['ATTACH-FILE-CAL'] != "yes"):
            return refresh_page('no attach file', end=True)
        else:
            if not 'cal_attach_file_btn' in cal_coordinate:
                pyautogui.moveTo(
                    findImage({attach_file_btn}))
                cal_coordinate['cal_attach_file_btn'] = pyautogui.position()
            else:
                pyautogui.moveTo(cal_coordinate['cal_attach_file_btn'])

            pyautogui.click()
            if findImage({attach_file_zone}):
                if onlyfindImage({no_file_attach},.99):
                    # # if 1 == 1:
                    # pyautogui.moveTo(
                    #     findImage({attach_file_number_input}))
                    # pyautogui.click()
                    # pyautogui.typewrite("1", interval=0)

                    # pyautogui.moveTo(
                    #     findImage({attach_file_detail}))
                    # pyautogui.click()
                    # pyautogui.typewrite(
                    #     "REPORT CAL "+row["TEAM"]+" "+row["NAME"], interval=0)

                    consoleText = '''document.querySelector('input[name="docno"]').value = "1";document.querySelector('input[name="description_doc"]').value = "%s";document.querySelector('input[name="document_File"]').click();console.clear();''' % (doc_detil_cal)
                    # if onlyfindImage({cursor}) == False:
                    #     pyautogui.keyDown("ctrl")
                    #     pyautogui.keyDown("shift")
                    #     pyautogui.keyDown("i")
                    #     pyautogui.keyUp("ctrl")
                    #     pyautogui.keyUp("shift")
                    #     pyautogui.keyUp("i")

                    if not 'cursor' in cal_coordinate:
                        pyautogui.moveTo(findImage({cursor}))
                        pyautogui.move(200, 400)
                        cal_coordinate['cursor'] = pyautogui.position()
                    else:
                        pyautogui.moveTo(cal_coordinate['cursor'])

                    pyautogui.click()
                    clipboard.copy(consoleText)
                    pyautogui.keyDown("ctrl")
                    pyautogui.keyDown("v")
                    pyautogui.keyUp('ctrl')
                    pyautogui.keyUp('v')
                    pyautogui.press("enter")
                    

                    # pyautogui.moveTo(
                    #     findImage({attach_file_select_btn}))
                    # pyautogui.click()
                    if findImage({attach_file_file_name_input}):
                        if not 'attach_file_file_name_input' in cal_coordinate:
                            pyautogui.moveTo(
                                findImage({attach_file_file_name_input}))
                            cal_coordinate['attach_file_file_name_input'] = pyautogui.position(
                            )
                        else:
                            pyautogui.moveTo(
                                cal_coordinate['attach_file_file_name_input'])

                        pyautogui.click()
                        pyautogui.typewrite(
                            id+'_cal.pdf', interval=0)
                            # row['SN']+'.pdf', interval=0)
                        pyautogui.press("enter")
                        pyautogui.sleep(.5)

                        if onlyfindImage({file_not_found}):
                            cal_coordinate[row['CODE']] = 'file not found'
                            pyautogui.press("esc")
                            pyautogui.press("esc")
                            return

                        # if not 'cal_attach_file_add_btn' in cal_coordinate:
                        #     pyautogui.moveTo(
                        #         findImage({attach_file_add_btn}))
                        #     cal_coordinate['cal_attach_file_add_btn'] = pyautogui.position(
                        #     )
                        # else:
                        #     pyautogui.moveTo(
                        #         cal_coordinate['cal_attach_file_add_btn'])

                        pyautogui.moveTo(
                            findImage({attach_file_add_btn}))
                        cal_coordinate['cal_attach_file_add_btn'] = pyautogui.position(
                        )
                        pyautogui.click()
                        pyautogui.move(0, 100)
                        # pyautogui.press("enter")
                        finish = None
                        t = time.time()
                        # pyautogui.alert(text='attach file',title='Alert', button='OK')
                        while finish == None:
                            if time.time()-t >= 20:
                                pyautogui.moveTo(
                                    cal_coordinate['cal_attach_file_add_btn'])
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

    def cal_approval_record():
        # pyautogui.sleep(1)
        if not update and onlyfindImage({cal_pass_already_click, cal_notpass_already_click}, .8):
            screenshot('closed')
            attachFile()
        else:
            cal_fill_result_input()
            screenshot('closed')
            attachFile()
        # cal_fill_result_input()
        # screenshot('closed')
        # attachFile()

    def run_cal():
        # pyautogui.sleep(1)
        consoleText = '''document.querySelector('input[name="s_jobdate"]').value="%s";
        document.querySelector('input[name="s_to_date"]').value="%s";
        document.querySelector('select[name="s_byear"]').value="%s";
        document.querySelector('input[name="s_sap_code"]').value="%s";
        var opts = document.querySelectorAll('select[name="s_dept_tech"] option');
        for (let index = 0; index < opts.length; index++) {let opt = opts[index];
        if(opt.innerText === "%s") opt.selected = true;};
        document.querySelector('input[name="Button_DoSearch"]').click();console.clear()
''' % (row['START-PLAN'], row['END-PLAN'], row['YEAR'][:4], id, row['TEAM'])
        if findImage({cal_main_screen}):
            if row['PM-RESULT'] == 'nan':
                if not onlyfindImage({cursor}, .85):
                    pyautogui.keyDown("ctrl")
                    pyautogui.keyDown("shift")
                    pyautogui.keyDown("i")
                    pyautogui.keyUp("ctrl")
                    pyautogui.keyUp("shift")
                    pyautogui.keyUp("i")

            if not 'cursor' in cal_coordinate:
                pyautogui.moveTo(findImage({cursor}, .85))
                pyautogui.move(200, 400)
                cal_coordinate['cursor'] = pyautogui.position()
            else:
                pyautogui.moveTo(cal_coordinate['cursor'])

            pyautogui.click()
            clipboard.copy(consoleText)
            pyautogui.keyDown("ctrl")
            pyautogui.keyDown("v")
            pyautogui.keyUp('ctrl')
            pyautogui.keyUp('v')
            pyautogui.press("enter")

            # wait for search result
            if findImage({search_result_btn, search_result_btn2}, .85):

                # check if already closed then skip
                if not update and onlyfindImage({search_result_close}, .8) and row['ATTACH-FILE-CAL'] != "yes":
                    return True

                # open code in new tab
                if not 'search_result_btn' in cal_coordinate:
                    pyautogui.moveTo(
                        findImage({search_result_btn, search_result_btn2}, .7))
                    pyautogui.move(-30, 0)
                    cal_coordinate['search_result_btn'] = pyautogui.position()
                else:
                    pyautogui.moveTo(
                        cal_coordinate['search_result_btn'])
                # pyautogui.keyDown("ctrl")
                # pyautogui.keyDown("shift")
                # loop for 4 times
                for i in range(6):
                    pyautogui.click()
                    pyautogui.move(15, 0)
                # pyautogui.keyUp("ctrl")
                # pyautogui.keyUp("shift")
            

            if findImage({cal_general_detail_page}):
                if attach_only:
                    attachFile()
                    return
                cal_approval_record()

    if onlyfindImage({cal_main_screen}, .99):
        print("cal main screen")
        run_cal()
    else:
        refresh_page('cal main screen not found', True)
        # pyautogui.sleep(1)
        run_cal()
    return cal_coordinate
