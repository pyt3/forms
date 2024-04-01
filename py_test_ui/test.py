import base64
from io import BytesIO
import re
import pandas as pd
import csv
import os
from pprint import pprint
import datetime
from PIL import Image
from html2image import Html2Image
import requests
from bs4 import BeautifulSoup
import threading
from datetime import datetime
import json
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
import pyfiglet
import urllib3
import emoji
from queue import Queue
from alive_progress import alive_bar
import time
from rich import print, pretty
from rich.progress import track
import traceback
import sys
import logging
import pandas as pd
import shutil
import os
import sys
import pyautogui
from html2image import Html2Image
import calendar
import fitz
import pyperclip
# from closePM import closePM
# from closeCAL import closeCAL

from openpyxl import load_workbook
logging.basicConfig(filename='log.txt', filemode='a', format='%(asctime)s - %(levelname)s - %(message)s',
                    level=logging.ERROR)
# logging.basicConfig(level=logging.ERROR)


pretty.install()

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

init_text = pyfiglet.figlet_format("BME Assistant", font="slant")
print(init_text)

root_dir = os.path.dirname(os.path.abspath(__file__))

# check if using pyinstaller
if getattr(sys, 'frozen', False):
    root_dir = os.path.dirname(sys.executable)
config = open(os.path.join(root_dir, "CONFIG/config.json"), "r")
confdata = json.load(config)
login_site = confdata["SITE"]

lock = threading.Lock()
data = {
    "user": confdata["USERNAME"],
    "pass": confdata["PASSWORD"],
    "Submit": "Submit",
    "Submit.x": "79",
    "Submit.y": "30",
}

cookies = {
    "_ga": "GA1.1.409909798.1624509466",
    "_ga_L9CPT990SV": "GS1.1.1629863162.2.0.1629863162.0",
    "PHPSESSID": confdata["SESSION_ID"],
}


headers = {
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Referer": "http://nsmart.nhealth-asia.com/mtdpdb01/default.php",
    "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
}
emp_list = {}
tools_list = {}
calibrator_list = {}
temp_emp_list = {}

file_name = 'recordCal_PM.xlsx'
excel_folder = os.path.join(root_dir, 'EXCEL FILE')
master_df = (pd.read_excel(
    os.path.join(excel_folder, file_name).replace('//', '/'), sheet_name="Sheet1", engine='openpyxl')).dropna(subset=["CODE"])
df = master_df.map(str)


def internet_connection():
    try:
        requests.get('https://www.google.com/', verify=False)
        return True
    except requests.exceptions.RequestException as e:
        return False


def set_login():
    global confdata
    global cookies
    try:
        with requests.Session() as s:
            r = s.post("https://nsmart.nhealth-asia.com/MTDPDB01/index.php",
                       data=data,
                       headers=headers,
                       verify=False)
            confdata["SESSION_ID"] = s.cookies['PHPSESSID']
            cookies['PHPSESSID'] = s.cookies['PHPSESSID']
            # write over file to clear old data
            with open(os.path.join(root_dir, "CONFIG/config.json"), "w") as json_file:
                json.dump(confdata, json_file)
            print(confdata)

    except Exception as e:
        print(e)
        print("[red]No Internet Connection[/red]")
        # wait 5 sec
        time.sleep(5)
        set_login()


def formatDate(date):
    if date != 'nan':
        # date is dd/mm/yyyy
        date = date.split(' ')[0].split('-')[2]+'/'+date.split(
            ' ')[0].split('-')[1]+'/'+date.split(' ')[0].split('-')[0]
    return date


def save_empList(emp_list=None):
    # write over file to clear old data
    if emp_list is None:
        return
    with open(os.path.join(root_dir, 'CONFIG/emp_list.json'), 'w') as json_file:
        json.dump(emp_list, json_file)


def save_calibrator_list(calibrator_list=None):
    # write over file to clear old data
    if calibrator_list is None:
        return
    with open(os.path.join(root_dir, 'CONFIG/calibrator_list.json'), 'w') as json_file:
        json.dump(calibrator_list, json_file)


def load_empList():
    global emp_list
    # handle if file not found
    try:
        with open(os.path.join(root_dir, 'CONFIG/emp_list.json'), 'r') as json_file:
            emp_list = json.load(json_file)
        if emp_list is None or len(emp_list) == 0:
            get_emp_list()
    except Exception as e:
        print(e)
        get_emp_list()


def load_tool_list():
    global tools_list
    # handle if file not found
    try:
        with open(os.path.join(root_dir, 'CONFIG/tools_list.json'), 'r') as json_file:
            tools_list = json.load(json_file)
        if tools_list is None or len(tools_list) == 0:
            print('No tools list found')
            exit()
    except Exception as e:
        print(e)
        print('No tools list found')
        exit()


def load_calibrator_list():
    global calibrator_list
    # handle if file not found
    try:
        with open(os.path.join(root_dir, 'CONFIG/calibrator_list.json'), 'r') as json_file:
            calibrator_list = json.load(json_file)
        if calibrator_list is None or len(calibrator_list) == 0:
            print('No calibrator list found')
            exit()
    except Exception as e:
        print(e)
        get_emp_list()


temp_team_list = {}


def get_team_list(url, page='1'):
    global temp_team_list
    if page == '1':
        temp_team_list = {}
    page_url = url + "&employeePage=" + str(page)
    try:
        response = requests.get(
            page_url,
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(e)
        # wait 5 sec
        time.sleep(5)
        return get_team_list(url, page)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    form = soup.find('form', {'name': 'employee'})
    if form is None:
        print("No form found, re-login...")
        set_login()
        return get_team_list(url, page)

    tr = form.find_all('tr', {'class': 'Row'})
    footer = form.find_all('tr', {'class': 'Footer'})[
        0].text.strip().split('of')[1].strip().split(' ')[0]
    if page > footer:
        return temp_team_list
    max_emp = int(tr[0].find('td').text.strip().split('\xa0')[1])
    if len(temp_team_list) >= max_emp:
        return temp_team_list
    tr.pop(0)
    if max_emp > 0:
        for row in tr:
            input = row.find_all('input')
            if input[0]['value'] == '' or input[1]['value'] == '':
                continue
            # temp_emp_list.append([input[0]['value'], input[1]['value']])
            temp_team_list[input[1]['value'].lower().replace(
                '  ', ' ')] = input[0]['value']
        # get next page
        page = int(page) + 1
        return get_team_list(url, str(page))
    else:
        return temp_team_list


def get_emp_list():
    global emp_list
    try:
        response = requests.get(
            "https://nsmart.nhealth-asia.com/MTDPDB01/reftable/employee_branch.php?dept_control=1",
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(e)
        # wait 5 sec
        time.sleep(5)
        return get_emp_list()
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    form = soup.find('form', {'name': 'm_dept_tech'})
    if form is None:
        print("No form found, re-login...")
        set_login()
        return get_emp_list()

    tr = form.find_all('tr', {'class': 'Row'})
    tr.pop(0)
    for row in tr:
        td = row.find_all('td')
        calibrator_list[td[1].text.strip().lower()] = td[0].text.strip()
        print('[yellow]กำลังดึงข้อมูลรายชื่อในทีม[/yellow] [blue]{}[/blue]' .format(td[1].text.strip()))
        url = "https://nsmart.nhealth-asia.com/MTDPDB01/reftable/employee_branch.php?dept_control=1&dept_tech={}".format(
            td[0].text.strip())
        team_list = get_team_list(url)
        emp_list[td[1].text.strip().lower()] = team_list
    save_calibrator_list(calibrator_list)
    save_empList(emp_list)


def getFirstAndLastDay(date):
    if date is None or date == '':
        date = datetime.now()
    # check if date is string
    if isinstance(date, str):
        date = datetime.strptime(date, '%d/%m/%Y')
    # get first and last day of month
    first_day = date.replace(day=1)
    last_day = date.replace(day=calendar.monthrange(date.year, date.month)[1])
    first_day = first_day.strftime("%d/%m/%Y")
    last_day = last_day.strftime("%d/%m/%Y")
    date_year = first_day.split('/')[2]
    return first_day, last_day, date_year


def base64_image_to_base64_pdf(base64_image_string):
    try:
        # Decode the base64 image string to bytes
        image_data = base64.b64decode(base64_image_string)

        # Create a BytesIO object to open the image with Pillow
        image_buffer = BytesIO(image_data)

        # Open the image using Pillow
        image = Image.open(image_buffer)

        # Create a BytesIO object to save the PDF
        pdf_buffer = BytesIO()
        image.save(pdf_buffer, "PDF", resolution=100.0, save_all=True)

        # Get the content of the PDF as bytes
        pdf_bytes = pdf_buffer.getvalue()

        # Encode the PDF as a base64 string
        pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")

        return pdf_base64

    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def get_screen_shot(soup, css_file, text):
    # open css file from css folder
    css_file = open(os.path.join(root_dir, 'css/'+css_file), 'r')
    css = css_file.read()

    # get file path
    __location__ = os.path.join(root_dir, 'SCREENSHOT')
    hti = Html2Image(temp_path=__location__, size=(
        800, 800), disable_logging=True)
    file_name = str(datetime.timestamp(datetime.now())*1000)
    try:
        hti.screenshot(html_str=str(soup), css_str=css,
                       save_as=file_name+'.png')
    except Exception as e:
        print(e)
        pass
    return_json = {'status': 'ok',
                   'status_text': text, 'screenshot': file_name}

    return file_name


def closePM(row, self_call=False):
    global emp_list
    if cookies['PHPSESSID'] is None:
        set_login()
        return closePM(row, self_call)
    response = False
    try:
        response = requests.get(
            "https://nsmart.nhealth-asia.com/MTDPDB01/pm/maintain_list.php?s_byear=" +
            row['YEAR'] + '&s_jobdate=' + row['START-PLAN'] +
            '&s_to_date=' + row['END-PLAN'] + '&s_sap_code=' + row['CODE'],
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(e)
        # wait 5 sec
        time.sleep(5)
        return closePM(row, self_call)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    # print(soup)
    table = soup.find("table", {"class", "Grid"})
    if table == None:
        print("No table found, re-login...")
        set_login()
        return closePM(row, self_call)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        return 'PM Work not found'
    a_href = tr.find('a')['href'].split('?')[1]
    job_no = a_href.split('jobno=')[1].split('&')[0]
    if emp_list[row['TEAM'].lower()] is None or emp_list[row['TEAM'].lower()][row['ENGINEER'].lower()] is None:
        print('Team not found')
        get_emp_list()
        dept_tech = emp_list[row['TEAM'].lower()][row['ENGINEER'].lower()]
    else:
        dept_tech = emp_list[row['TEAM'].lower()][row['ENGINEER'].lower()]
    tool = tools_list[row['TESTER'].lower()]
    selects = [
        {'name': 'job_result',  'value': '1', 'text_contain': False},
        {'name': 'dept_tech',  'value': dept_tech, 'text_contain': False},
        {'name': 'toolid', 'value': tool, 'text_contain': False},
        {'name': 'app_issue_name', 'value': '566152', 'text_contain': False},
    ]
    date = row['DATE-PM']
    if date is not None and date != 'nan' and date != 'Invalid date' and date != '':
        inputs = [
            {'name': 'assign_date', 'value': date},
            {'name': 'act_dstart', 'value': date},
            {'name': 'act_dfin', 'value': date},
            {'name': 'approve_date', 'value': date}
        ]
    else:
        today = time.strftime("%d/%m/%Y")
        inputs = [
            {'name': 'assign_date', 'value': today},
            {'name': 'act_dstart', 'value': today},
            {'name': 'act_dfin', 'value': today},
            {'name': 'approve_date', 'value': today}
        ]
    #  create formdata foor post request
    form_data = {}
    for input in inputs:
        form_data[input['name']] = input['value']
    for select in selects:
        form_data[select['name']] = select['value']

    # find element in emp_vender that index [1] contain vender
    # if vender.startswith('[[CAL]]'):
    #     form_data['emp_id'] = 'ฺB005'.encode('tis-620')
    # else:
    #     emp_id = list(filter(lambda x: vender.lower()
    #                   in x[1].lower(), emp_list))
    #     if len(emp_id) == 0:
    #         get_emp_list(1)
    #         emp_id = list(filter(lambda x: vender.lower()
    #                       in x[1].lower(), emp_list))
    #     if len(emp_id) == 0:
    #         print('Vender not found')
    #         return
    #     form_data['emp_id'] = emp_id[0][0]
    form_data['emp_id'] = emp_list[row['TEAM'].lower()][row['ENGINEER'].lower()]
    if row['PM-STATUS'].lower() == 'pass':
        form_data['pass_status'] = '1'
    else:
        form_data['pass_status'] = '0'
    # return form_data
    response = requests.post('https://nsmart.nhealth-asia.com/MTDPDB01/pm/maintain07.php?' + a_href +
                             '&ccsForm=main_jobs%3AEdit', headers=headers, cookies=cookies, data=form_data, verify=False)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    result_table = soup.find('table', {'class': 'Record'})
    if result_table == None:
        return 'Fail'
    result_tr = result_table.find('tr', {'class': 'Total'})
    result_td = result_tr.find('td')
    if result_td.text.strip() == 'PM status : Completed-send equipment back':
        return_json = 'SUCCESS'
        file_name = get_screen_shot(
            soup, 'close_pm_css.css', result_td.text.strip())
        # move file to folder
        shutil.move(file_name+'.png', os.path.join(
            root_dir, "SCREENSHOT", "PM", row['CODE']+"_"+job_no+".png"))
        # if self_call:
        #     return return_json
        print('[green]{}[/green]'.format(result_td.text.strip()))
        return return_json


def closeCAL(row, self_call=False):
    if cookies['PHPSESSID'] is None:
        set_login()
        return closeCAL(row, self_call)
    response = False
    try:
        response = requests.get(
            "https://nsmart.nhealth-asia.com/MTDPDB01/caliber/caliber03.php?s_byear=" +
            row['YEAR'] + '&s_jobdate=' + row['START-PLAN'] +
            '&s_to_date=' + row['END-PLAN'] + '&s_sap_code=' + row['CODE'],
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(e)
        # wait 5 sec
        time.sleep(5)
        return closeCAL(row, self_call)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    # print(soup)
    table = soup.find("table", {"class", "Grid"})
    if table == None:
        print("No table found, re-login...")
        set_login()
        return closeCAL(row, self_call)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        return 'CAL Work not found'
    a_href = tr.find('a')['href'].split('?')[1]

    job_no = a_href.split('jobno=')[1].split('&')[0]
    dept_caliber = calibrator_list[row['TEAM'].lower()]
    selects = [
        {'name': 'tech_idea_stat',  'value': '4', 'text_contain': False},
        {'name': 'dept_caliber',  'value': dept_caliber, 'text_contain': False},
    ]
    date = row['DATE-CAL']
    if date is not None and date != 'nan' and date != 'Invalid date' and date != '':
        inputs = [
            {'name': 'assign_date', 'value': date},
            {'name': 'act_dstart', 'value': date},
            {'name': 'act_dfin', 'value': date},
        ]
    else:
        today = time.strftime("%d/%m/%Y")
        inputs = [
            {'name': 'assign_date', 'value': today},
            {'name': 'act_dstart', 'value': today},
            {'name': 'act_dfin', 'value': today},
        ]

    form_data = {}
    emp_id = ''
    form_data['emp_id'] = emp_list[row['TEAM'].lower()][row['ENGINEER'].lower()]
    form_data['inspec_app_name'] = confdata['APPROVE_NAME']
    if row['CAL-STATUS'].lower() == 'pass':
        form_data['CheckBox2'] = '1'
    else:
        form_data['CheckBox2'] = '0'
    for input in inputs:
        form_data[input['name']] = input['value']
    for select in selects:
        form_data[select['name']] = select['value']
    response = requests.post('https://nsmart.nhealth-asia.com/MTDPDB01/caliber/caliber03_1.php?' + a_href +
                             '&ccsForm=caliber_jobs_tech%3AEdit', headers=headers, cookies=cookies, data=form_data, verify=False)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    result_td = list(filter(lambda x: 'Completed-send equipment back' in x.text.strip(), soup.find_all(
        'table', {'class': 'Record'})[1].find_all('tr', {'class': 'Controls'})[0].find_all('td')))

    if result_td == None or len(result_td) == 0:
        return 'Fail'
    result_td = result_td[0]
    file_name = get_screen_shot(
        soup, 'close_cal_css.css', result_td.text.strip())
    # move file to folder
    shutil.move(file_name+'.png', os.path.join(
        root_dir, "SCREENSHOT", "CAL", row['CODE']+"_"+job_no+'.png'))
    print('[green]CAL status : {}[/green]'.format(result_td.text.strip()))
    return 'SUCCESS'


def attachFilePM(id, team, engineer, date):
    # print type of dataurl
    if cookies['PHPSESSID'] is None:
        set_login()
        attachFilePM(id, team, engineer, date)
    response = False
    start_date, end_date, now_year = getFirstAndLastDay(date)
    code = id
    try:
        response = requests.get(
            "https://nsmart.nhealth-asia.com/MTDPDB01/pm/maintain_list.php?s_byear=" +
            str(now_year) + '&s_jobdate=' + start_date +
            '&s_to_date=' + end_date + '&s_sap_code=' + code,
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(e)
        # wait 5 sec
        time.sleep(5)
        return attachFilePM(id, team, engineer, date)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    # print(soup)
    table = soup.find("table", {"class", "Grid"})
    if table == None:
        print("No table found, re-login...")
        set_login()
        return attachFilePM(id, team, engineer, date)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        return 'PM Work not found'
    a_href = tr.find('a')['href'].split('?')[1]
    job_no = a_href.split('jobno=')[1].split('&')[0]
    response = requests.get(
        "https://nsmart.nhealth-asia.com/MTDPDB01/pm/maintain08.php?" +
        a_href + "&ccsForm=Maindocattache1",
        headers=headers,
        cookies=cookies,
        verify=False,
    )
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    form = soup.find('form', {'name': 'Post'})
    file_count = 0
    find_count_Header = soup.find_all('table', {'class': 'Header'})[1]
    if find_count_Header is not None and len(find_count_Header) > 0:
        file_th = find_count_Header.find('th').text.strip().split(' ')[2]
        file_count = int(file_th)
    form_data = {}
    inputs = form.findAll('input')
    emp_name = ''
    for input in inputs:
        try:
            form_data[input['name']] = input['value']
        except:
            continue

    emp_name = team.upper()

    inputs = [
        {'name': 'docno', 'value': file_count+1},
        {'name': 'description_doc', 'value': 'Report PM ' + emp_name},
        {'name': 'jobno', 'value': a_href.split('jobno=')[1].split('&')[0]}
    ]
    #  create formdata foor post request
    for input in inputs:
        form_data[input['name']] = input['value']

    # get file base64 from report folder
    file = open(os.path.join(root_dir, 'REPORTS', id+'_pm.pdf'), 'rb').read()
    files = {'document_File': ('report.pdf', file, 'application/pdf')}

    # dataurl = json.loads(dataurl)
    # if dataurl.get('isImage') == True:
    #     dataurl = base64_image_to_base64_pdf(dataurl['base64'])
    # else:
    #     dataurl = dataurl['base64']
    # file = base64.b64decode(dataurl)
    # files = {'document_File': ('report.pdf', file, 'application/pdf')}

    # set form multipart/form-data
    # copy headers
    use_headers = headers.copy()
    # # use_headers['enctype'] = 'multipart/form-data'
    # use_headers['Content-Type'] = 'multipart/form-data'
    # maintain08.php?s_byear=2023&s_jobdate=&s_to_date=&s_pay=&s_job_status=&s_job_result=&s_branchid=&s_dept=&s_sub_dept=&s_code=&s_sap_code=1235&s_classno=&s_groupid=&s_catagory=&s_tpriority=&s_brand=&s_model=&s_serial_no=&s_inplan=&s_pmok=&maintain_list_vPageSize=&s_dept_tech=&s_sup_serv=&s_jobno=&s_docok=&code=36565&deptco=&jobno=1278631&ccsForm=Maindocattache1

    response2 = requests.post('https://nsmart.nhealth-asia.com/MTDPDB01/pm/maintain08.php?' + a_href +
                              '&ccsForm=Maindocattache1', headers=use_headers, cookies=cookies, data=form_data, files=files, verify=False)
    response2.encoding = "tis-620"
    soup = BeautifulSoup(response2.text, "lxml")
    result_table = soup.find_all('table', {'class': 'Header'})[1]
    if result_table == None:
        return 'Fail to Attach PM file'
    result_th = result_table.find('th')
    if result_th.text.strip() != 'Total : 0 records':
        file_name = get_screen_shot(
            soup, 'close_pm_css.css', result_th.text.strip())
        # move file to folder
        shutil.move(file_name+'.png', os.path.join(
            root_dir, "SCREENSHOT", "PM", "Attach_PM_" + id+"_"+job_no+".png"))
        print('[green]Attach PM file : {}[/green]'.format(result_th.text.strip()))
        return file_name


def attachFileCAL(id, team, engineer, date):
    if cookies['PHPSESSID'] is None:
        set_login()
        attachFileCAL(id, team, engineer, date)
    response = False
    start_date, end_date, now_year = getFirstAndLastDay(date)
    code = id
    try:
        response = requests.get(
            "https://nsmart.nhealth-asia.com/MTDPDB01/caliber/caliber03.php?s_byear=" +
            str(now_year) + '&s_jobdate=' + start_date +
            '&s_to_date=' + end_date + '&s_sap_code=' + code,
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(e)
        # wait 5 sec
        time.sleep(5)
        return attachFileCAL(id, team, engineer, date)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    # print(soup)
    table = soup.find("table", {"class", "Grid"})
    if table == None:
        print("No table found, re-login...")
        set_login()
        return attachFileCAL(id, team, engineer, date)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        return 'CAL Work not found'
    a_href = tr.find('a')['href'].split('?')[1]
    job_no = a_href.split('jobno=')[1].split('&')[0]
    response = requests.get(
        "https://nsmart.nhealth-asia.com/MTDPDB01/caliber/caliber03_5.php?" +
        a_href + "&ccsForm=caliber_jobs_tech%3AEdit",
        headers=headers,
        cookies=cookies,
        verify=False,
    )
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    form = soup.find('form', {'name': 'Post'})
    file_count = 0
    find_count_Header = soup.find_all('table', {'class': 'Header'})[1]
    if find_count_Header is not None and len(find_count_Header) > 0:
        file_th = find_count_Header.find('th').text.strip().split(' ')[2]
        file_count = int(file_th)
    form_data = {}
    inputs = form.findAll('input')

    inputs = [
        {'name': 'docno', 'value': file_count+1},
        {'name': 'description_doc', 'value': 'Report CAL ' + team.upper()},
        {'name': 'jobno', 'value': a_href.split('jobno=')[1].split('&')[0]}
    ]
    #  create formdata foor post request
    for input in inputs:
        form_data[input['name']] = input['value']

    file = open(os.path.join(root_dir, 'REPORTS', id+'_cal.pdf'), 'rb').read()
    files = {'document_File': ('report.pdf', file, 'application/pdf')}
    # copy headers
    use_headers = headers.copy()
    # # use_headers['enctype'] = 'multipart/form-data'
    # use_headers['Content-Type'] = 'multipart/form-data'
    # maintain08.php?s_byear=2023&s_jobdate=&s_to_date=&s_pay=&s_job_status=&s_job_result=&s_branchid=&s_dept=&s_sub_dept=&s_code=&s_sap_code=1235&s_classno=&s_groupid=&s_catagory=&s_tpriority=&s_brand=&s_model=&s_serial_no=&s_inplan=&s_pmok=&maintain_list_vPageSize=&s_dept_tech=&s_sup_serv=&s_jobno=&s_docok=&code=36565&deptco=&jobno=1278631&ccsForm=Maindocattache1

    response2 = requests.post("https://nsmart.nhealth-asia.com/MTDPDB01/caliber/caliber03_5.php?" + a_href +
                              "&ccsForm=Caliberdocattache1", headers=use_headers, cookies=cookies, data=form_data, files=files, verify=False)
    response2.encoding = "tis-620"
    soup = BeautifulSoup(response2.text, "lxml")
    result_table = soup.find_all('table', {'class': 'Header'})[1]
    if result_table == None:
        return 'Fail to Attach CAL file'
    result_th = result_table.find('th')
    if result_th.text.strip() != 'Total : 0 records':
        file_name = get_screen_shot(
            soup, 'close_cal_css.css', result_th.text.strip())
        # move file to folder
        shutil.move(file_name+'.png', os.path.join(
            root_dir, "SCREENSHOT", "CAL", "Attach_CAL_" + id+"_"+job_no+".png"))
        print('[green]Attach CAL file : {}[/green]'.format(result_th.text.strip()))
        return file_name


def read_file():
    try:
        # read file
        print('[red]กำลังอ่านไฟล์...[/red]')

        with pd.ExcelWriter(os.path.join(excel_folder, file_name).replace('//', '/'),
                            mode='a', engine='openpyxl', if_sheet_exists='replace') as writer:
            shutil.copy(os.path.join(excel_folder, file_name).replace('//', '/'),
                        os.path.join(excel_folder, 'backup' + file_name).replace('//', '/'))
            # count row['PM-STATUS] to lower case = 'pass'
            pass_pm = 0
            pass_cal = 0
            attach_pm = 0
            attach_cal = 0

            for index, row in df.iterrows():
                if row['PM-STATUS'].lower() == 'pass':
                    pass_pm += 1
                if row['CAL-STATUS'].lower() == 'pass':
                    pass_cal += 1
                if row['ATTACH-FILE-PM'].lower() == 'yes':
                    attach_pm += 1
                if row['ATTACH-FILE-CAL'].lower() == 'yes':
                    attach_cal += 1
            # row_summary_label.config(text="ตรวจพบเครื่องมือแพทย์ทั้งหมด: " + str(len(df)) + " เครื่อง\n"+ "ตรวจพบเครื่องมือแพทย์ที่ผ่าน PM: " + str(pass_pm) + " เครื่อง\n" + "ตรวจพบเครื่องมือแพทย์ที่ผ่าน CAL: " + str(pass_cal) + " เครื่อง\n" + "ตรวจพบเครื่องมือแพทย์ที่ต้องแนบไฟล์ PM: " + str(attach_pm) + " เครื่อง\n" + "ตรวจพบเครื่องมือแพทย์ที่ต้องแนบไฟล์ CAL: " + str(attach_cal) + " เครื่อง\n", font=("Arial", 12), bg="#1f1f1f", fg="white")
            text = f'''ตรวจพบเครื่องมือแพทย์ทั้งหมด: {len(df)} เครื่อง

ตรวจพบเครื่องมือแพทย์ที่ผ่าน PM: {pass_pm} เครื่อง

ตรวจพบเครื่องมือแพทย์ที่ผ่าน CAL: {pass_cal} เครื่อง

ตรวจพบเครื่องมือแพทย์ที่ต้องแนบไฟล์ PM: {attach_pm} เครื่อง

ตรวจพบเครื่องมือแพทย์ที่ต้องแนบไฟล์ CAL: {attach_cal} เครื่อง
'''
            print(text)
            start = input(
                "\033[1;35;40mเริ่มการแนบไฟล์: \033[1;33;40mใช่(Y) ไม่ใช่(N) : \033[1;36;40m")
            if (start == 'Y' or start == 'y'):
                init_text = pyfiglet.figlet_format("Start Attach File")
                print(init_text)
                for index, row in df.iterrows():
                    # print(row['CODE']+' '+str(index)+'/'+str(len(df)))
                    row['CODE'] = str(row['CODE']).replace('.0', '')
                    if len(row['CODE']) == 6:
                        row['CODE'] = "DEMO_" + row['CODE']
                    else:
                        row['CODE'] = ("00000" + row['CODE'])[-5:]
                    print('[green]{}[/green] / [blue]{}[/blue] [yellow]Close PM JOB[/yellow] [light blue]{}[/light blue]'.format(
                        str(index+1), str(len(df)), row['CODE'])
                    )
                    if row['CODE'] != 'nan' and row['STATUS'] != 'Decommission':
                        issave = False
                        if row['PM-RESULT'] != 'nan' and row['PM-CLOSED'] == 'nan':
                            # process_result = closePM(id, vender, date, safety, self_call=False)
                            process_result = closePM(row)
                            process_attach = ''
                            if process_result == "SUCCESS":
                                if row['ATTACH-FILE-PM'].lower() == 'yes':
                                    process_attach = attachFilePM(
                                        row['CODE'], row['TEAM'], row['ENGINEER'], row['DATE-PM'])
                                    master_df['ATTACH-FILE-PM'] = master_df['ATTACH-FILE-PM'].astype(
                                        str)
                                    if process_attach != 'Fail to Attach PM file':
                                        master_df.at[index,
                                                     'ATTACH-FILE-PM'] = "SUCCESS"
                                        issave = True
                            # continue
                            # master_df.at[index, 'PM-CLOSED'] = process_result
                            master_df['PM-CLOSED'] = master_df['PM-CLOSED'].astype(
                                str)
                            master_df.at[index, 'PM-CLOSED'] = process_result
                            issave = True
                            # master_df.to_excel(writer, sheet_name=sheet_name, 2022    index=False)
                            # writer.save()

                        if row['CAL-RESULT'] != 'nan' and row['CAL-CLOSED'] == 'nan':
                            process_result = closeCAL(row)
                            process_attach = ''
                            if process_result == "SUCCESS":
                                if row['ATTACH-FILE-CAL'].lower() == 'yes':
                                    process_attach = attachFileCAL(
                                        row['CODE'], row['TEAM'], row['ENGINEER'], row['DATE-CAL'])
                                    master_df['ATTACH-FILE-CAL'] = master_df['ATTACH-FILE-CAL'].astype(
                                        str)
                                    if process_attach != 'Fail to Attach PM file':
                                        master_df.at[index,
                                                     'ATTACH-FILE-CAL'] = 'SUCCESS'
                                        issave = True
                            # continue
                            master_df['CAL-CLOSED'] = master_df['CAL-CLOSED'].astype(
                                str)
                            master_df.at[index, 'CAL-CLOSED'] = process_result
                            issave = True

                        if (issave and index != 0 and index % 20 == 0) or index == len(df)-1:
                            # if issave:
                            master_df.to_excel(
                                writer, sheet_name='Sheet1', index=False)
                            writer._save()
                            print('[green]ปิดงานและแนบไฟล์สำเร็จ[/green]')
                            # pyautogui.alert('Close Jobs '+str(index)+' records')
            else:
                print("[red]Cancel[/red]")
                exit()
    except Exception as e:
        print(e)


def change_file_name():
    print('[red]เปลี่ยนชื่อไฟล์[/red]')
    dir_path = os.path.dirname(os.path.realpath(__file__))
    path = os.path.join(dir_path, 'REPORTS')
    dir_list = os.listdir(path)
    name_arr = []
    with alive_bar(len(dir_list)) as bar:
        for file_name in dir_list:
            source = os.path.join(path, file_name)
            
            if file_name.find('_') == -1:
                file = fitz.open(source)
                page = file[0]
                text = page.get_text().split('\n')
                t_arr = []
                for t in text:
                    t = t.split(' ')
                    for tt in t:
                        t_arr.append(tt)
                # text = page.get_text().split('\n')
                code = [t for t in t_arr if t.find(login_site.upper()) == 0]
                cal = [t for t in t_arr if t.find('Certificate') == 0]

                if len(code) > 0:
                    name_arr.append(code[0])
                    if len(cal) > 0:
                        name = code[0].split('_')[1]+ '_cal.pdf'
                    else:
                        name = code[0].split('_')[1]+ '_pm.pdf'
                    fitz.open(source).save(os.path.join(path, name))
                    file.close()
                    print('เปลี่ยนชื่อไฟล์ [yellow]{}[/yellow] เป็น [yellow]{}[/yellow]'.format(
                            file_name, name))
                    
                    os.remove(source)
            else:
                filename = file_name.split('_')
                if len(filename) > 1 and len(filename[1]) > 10:
                    filename = "_".join(filename[1:])
                    filename = re.sub(r'\s\(\d{1,}\)', '', filename)
                    name = filename.split('(')[0]
                    if(filename.split('(')[-1] != '1).pdf' and filename.split('(')[-1] != '2).pdf'):
                        name_arr.append(name)
                        if filename.split('(')[1].find('PM') > -1:
                            name = name + '_pm.pdf'
                        else:
                            name = name + '_cal.pdf'
                        print('เปลี่ยนชื่อไฟล์ [yellow]{}[/yellow] เป็น [yellow]{}[/yellow]'.format(
                            file_name, name))
                        dest = os.path.join(path, name);
                        os.rename(source, dest)
            

            # append name_arr to clipboard
            unique_arr = []
            for name in name_arr:
                if name not in unique_arr:
                    unique_arr.append(name)
        
            pyperclip.copy('\n'.join(unique_arr))
            bar()
    print('[green]เปลี่ยนชื่อไฟล์เสร็จสิ้น[/green]')



def showmenu():
    # menu
    print('[light blue]ยินดีต้อนรับสู่โปรแกรมปิดงาน[/light blue]')
    print('[light blue]โปรดเลือกเมนูที่ต้องการ[/light blue]')
    print('[yellow][1] เปลี่ยนชื่อไฟล์ใบงาน[/yellow]')
    print('[yellow][2] ปิดงาน และแนบไฟล์[/yellow]')
    menu = input('\033[1;35;40mกดเลขเพื่อเลือกเมนูที่ต้องการ : \033[1;35;40m')
    if menu == '1':
        change_file_name()
        showmenu()
    elif menu == '2':
        read_file()
    else:
        print('ไม่พบเมนูที่เลือก')
        exit()


load_empList()
load_tool_list()
load_calibrator_list()
showmenu()