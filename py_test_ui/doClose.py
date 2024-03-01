from cv2 import find4QuadCornerSubpix
import pyautogui
import os
import time
import clipboard
import requests

dir_path = os.path.dirname(os.path.realpath(__file__))
cal_image_path = os.path.join(dir_path, 'imagefile', 'cal')


def sendNotify(msg):
    notifyUrl = 'https://notify-api.line.me/api/notify'
    token = 'zmuUHA0pcVo4MSikcya267XhtdD6q7BzVaePBqMcsgD'
    headers = {'Authorization': 'Bearer ' + token}
    payload = {'message': msg}
    requests.post(notifyUrl, data=payload, headers=headers)


def findImage(files, conf=.85):
    count = 0
    res = None
    while res == None:
        for file in files:
            filename = file.split('\\')[-1]
            print(filename)
            res = pyautogui.locateOnScreen(
                file, grayscale=True, confidence=conf)
            if res != None:
                break
            else:
                count = count + 1
                if count > 40:
                    if filename == 'cal_general_detail_page.JPG':
                        pyautogui.click(
                            findImage({os.path.join(cal_image_path, 'search_result_btn.JPG')}, .7))
                    else:
                        sendNotify('please check the image: ' +
                                   file.split('/')[-1])
                        pyautogui.confirm(
                            'please check the image: '+file, title='not found', buttons=['OK'])
                    print(file)
                    print(res)
                    count = 0
                    continue
    return res


def onlyfindImage(files, conf=.85):
    res = None
    for file in files:
        res = pyautogui.locateOnScreen(
            file, grayscale=True, confidence=conf)
        if res != None:
            res = True
            break
        else:
            res = False
            continue

    return res


def testfind():
    pyautogui.sleep(3)
    pyautogui.moveTo(onlyfindImage(
        {'D:/download/close_PMCAL/imagefile/pm/no_file_attach.JPG'},.99), duration=0.1)
    # pyautogui.move(-30, 0)
    # pyautogui.move(10, 20)
    # print(onlyfindImage(
    #     {'D:/download/close_PMCAL/imagefile/pm/tester_input.JPG'}, .6))
    # if onlyfindImage({'D:/download/close_PMCAL/imagefile/pm/alert.JPG'}, .6) == True:
    #     print('alert')
    # else:
    #     print('no alert')


# testfind()


# closePMTest({'CODE': '2267', 'YEAR': '2022',
#              'START-PLAN': '01/07/2022', 'END-PLAN': '31/07/2022',})


# closeCAL({'CODE': '08260',
#          'PM-RESULT': 'PM doable',
#           'CAL-RESULT': 'Perform CAL',
#           'TEAM': "BME",
#           'Year': '2022',
#           'START-PLAN': '01/07/2022',
#           'END-PLAN': '31/07/2022',
#           "DATE-PM": "01/07/2022",
#           "DATE-CAL": "01/07/2022",
#           "NAME": 'DARANPHOP YIMYAM',
#           "TESTER": "-",
#           "INSPECTOR": "PUKARIN TONGKLIANG",
#           "ATTACH-FILE": "",
#           })
