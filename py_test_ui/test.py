import base64
from io import BytesIO
import re
import pandas as pd
import os
from PIL import Image
from html2image import Html2Image
import requests
from bs4 import BeautifulSoup
import threading
from datetime import datetime
import json
from concurrent.futures import ThreadPoolExecutor
import pyfiglet
import tabulate
import urllib3
from queue import Queue
import time
from rich import print, pretty
from rich.progress import track, Progress
from rich.table import Table
from rich.console import Console
import sys
import logging
import shutil
import calendar
import pyperclip
import fitz

# # set cmd to support utf-8
# os.system('chcp 874')
# os.system('$LANG="th_TH.UTF-8"')
# os.system('cls')

# from closePM import closePM
# from closeCAL import closeCAL

from openpyxl import load_workbook
logging.basicConfig(filename='log.txt', filemode='a', format='%(asctime)s - %(levelname)s - %(message)s',
                    level=logging.ERROR)
# logging.basicConfig(level=logging.ERROR)


# pretty.install()
# pretty.pretty_print = True

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

init_text = pyfiglet.figlet_format("BME Assistant", font="slant")
print(init_text)
root_dir = os.path.dirname(os.path.abspath(__file__))

# check if using pyinstaller
if getattr(sys, 'frozen', False):
    root_dir = os.path.dirname(sys.executable)
config = open(os.path.join(root_dir, "CONFIG", "config.json"), "r")
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
    "PHPSESSID": None
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

excel_file_name = 'recordCal_PM.xlsx'
excel_folder = os.path.join(root_dir, 'EXCEL FILE')


def read_excel_file():
    global master_df
    master_df = (pd.read_excel(
        os.path.join(excel_folder, excel_file_name).replace('//', '/'), sheet_name="Sheet1", engine='openpyxl')).dropna(subset=["CODE"])
    # check if dataframe gasattr map
    if not hasattr(master_df, 'map'):
        master_df.map = master_df.applymap
    return master_df.map(str)


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

    except Exception as e:
        print(e)
        print("[red]No Internet Connection[/red]")
        # wait 5 sec
        time.sleep(5)
        set_login()


def formatDate(date):
    if date != 'nan':
        # date is dd/mm/yyyy
        date = date.split('/')
        date[0] = '0' + date[0] if len(date[0]) == 1 else date[0]
        date[1] = '0' + date[1] if len(date[1]) == 1 else date[1]
        date = '/'.join(date)
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
    css_file = open(os.path.join(root_dir, 'SOURCE/'+css_file), 'r')
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
            row['YEAR'] + '&s_jobdate=' + formatDate(row['START-PLAN']) +
            '&s_to_date=' +
            formatDate(row['END-PLAN']) + '&s_sap_code=' + row['CODE'],
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
        dept_tech = calibrator_list[row['TEAM'].lower()]
    else:
        dept_tech = calibrator_list[row['TEAM'].lower()]
    tool = tools_list[row['TESTER'].lower()]
    selects = [
        {'name': 'job_result',  'value': '1', 'text_contain': False},
        {'name': 'dept_tech',  'value': dept_tech, 'text_contain': False},
        {'name': 'toolid', 'value': tool, 'text_contain': False},
        {'name': 'app_issue_name',
            'value': row['INSPECTOR ID'], 'text_contain': False},
    ]
    date = formatDate(row['DATE-PM'])
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
        global screenshot
        if screenshot:
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
            row['YEAR'] + '&s_jobdate=' + formatDate(row['START-PLAN']) +
            '&s_to_date=' +
            formatDate(row['END-PLAN']) + '&s_sap_code=' + row['CODE'],
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
    date = formatDate(row['DATE-CAL'])
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
    form_data['inspec_app_name'] = row['INSPECTOR NAME']
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
    global screenshot
    if screenshot:
        file_name = get_screen_shot(
            soup, 'close_cal_css.css', result_td.text.strip())
        # move file to folder
        shutil.move(file_name+'.png', os.path.join(
            root_dir, "SCREENSHOT", "CAL", row['CODE']+"_"+job_no+'.png'))
    print('[green]CAL status : {}[/green]'.format(result_td.text.strip()))
    return 'SUCCESS'


def attachFilePM(id, team, engineer, date, report_name):
    # print type of dataurl
    if cookies['PHPSESSID'] is None:
        set_login()
        attachFilePM(id, team, engineer, date, report_name)
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
        return attachFilePM(id, team, engineer, date, report_name)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    # print(soup)
    table = soup.find("table", {"class", "Grid"})
    if table == None:
        print("No table found, re-login...")
        set_login()
        return attachFilePM(id, team, engineer, date, report_name)
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
        {'name': 'description_doc', 'value': 'Report PM ' + engineer.upper()},
        {'name': 'jobno', 'value': a_href.split('jobno=')[1].split('&')[0]}
    ]
    #  create formdata foor post request
    for input in inputs:
        form_data[input['name']] = input['value']

    # get file base64 from report folder
    file = open(os.path.join(root_dir, 'REPORTS',
                report_name + '.pdf'), 'rb').read()
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
        global screenshot
        if screenshot:
            file_name = get_screen_shot(
                soup, 'close_pm_css.css', result_th.text.strip())
            # move file to folder
            shutil.move(file_name+'.png', os.path.join(
                root_dir, "SCREENSHOT", "PM", "Attach_PM_" + id+"_"+job_no+".png"))
        print('[green]Attach PM file : {}[/green]'.format(result_th.text.strip()))
        return 'SUCCESS'
    else:
        return 'Fail to Attach PM file'


def attachFileCAL(id, team, engineer, date, report_name):
    if cookies['PHPSESSID'] is None:
        set_login()
        attachFileCAL(id, team, engineer, date, report_name)
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
        return attachFileCAL(id, team, engineer, date, report_name)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    # print(soup)
    table = soup.find("table", {"class", "Grid"})
    if table == None:
        print("No table found, re-login...")
        set_login()
        return attachFileCAL(id, team, engineer, date, report_name)
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
        {'name': 'description_doc', 'value': 'Report CAL ' + engineer.upper()},
        {'name': 'jobno', 'value': a_href.split('jobno=')[1].split('&')[0]}
    ]
    #  create formdata foor post request
    for input in inputs:
        form_data[input['name']] = input['value']

    file = open(os.path.join(root_dir, 'REPORTS',
                report_name+'.pdf'), 'rb').read()
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
        global screenshot
        if screenshot:
            file_name = get_screen_shot(
                soup, 'close_cal_css.css', result_th.text.strip())
            # move file to folder
            shutil.move(file_name+'.png', os.path.join(
                root_dir, "SCREENSHOT", "CAL", "Attach_CAL_" + id+"_"+job_no+".png"))
        print('[green]Attach CAL file : {}[/green]'.format(result_th.text.strip()))
        return 'SUCCESS'


screenshot = False


def read_file(option=None):
    df = read_excel_file()
    dir_path = ''
    if getattr(sys, 'frozen', False):
        dir_path = os.path.dirname(sys.executable)
    else:
        dir_path = os.path.dirname(os.path.realpath(__file__))
    path = os.path.join(dir_path, 'REPORTS')
    dir_list = os.listdir(path)
    file_name_list = []
    for file in dir_list:
        if file.endswith('.pdf'):
            file_name_list.append(file.replace('.pdf', ''))
    try:
        # read file
        print('[red]กำลังอ่านไฟล์...[/red]')

        with pd.ExcelWriter(os.path.join(excel_folder, excel_file_name).replace('//', '/'),
                            mode='a', engine='openpyxl', if_sheet_exists='replace') as writer:
            shutil.copy(os.path.join(excel_folder, excel_file_name).replace('//', '/'),
                        os.path.join(excel_folder, 'backup' + excel_file_name).replace('//', '/'))
            # count row['PM-STATUS] to lower case = 'pass'
            pass_pm = 0
            pass_cal = 0
            attach_pm = 0
            attach_cal = 0

            for index, row in df.iterrows():
                if row['PM-CLOSED'].lower() == 'nan':
                    pass_pm += 1
                if row['CAL-CLOSED'].lower() == 'nan':
                    pass_cal += 1
                if row['PM-ATTACH-STATUS'].lower() == 'nan':
                    attach_pm += 1
                if row['CAL-ATTACH-STATUS'].lower() == 'nan':
                    attach_cal += 1
            table = Table(title='ตรวจพบเครื่องมือแพทย์ทั้งหมด: {} เครื่อง'.format(
                len(df)), title_justify='center', title_style='bold magenta')
            table.add_column('#', justify='left', style='cyan', no_wrap=True)
            table.add_column('จำนวนเครื่อง', justify='right',
                             style='green', no_wrap=True)
            if (option == 'close_pm_cal' or option == None):
                table.add_row('PM ที่ยังไม่ปิดงาน', str(pass_pm))
                table.add_row('CAL ที่ยังไม่ปิดงาน', str(pass_cal))

            if (option == 'attach_pm_cal' or option == None):
                table.add_row('PM ที่ยังไม่แนบไฟล์', str(attach_pm))
                table.add_row('CAL ที่ยังไม่แนบไฟล์', str(attach_cal))

            Console().print(table)
            print(f'\n[red]ต้องการเริ่มต้นการทำงานหรือไม่? (Y/N): [/red]', end='')
            start = input()
            if start.lower() == 'y':
                print(
                    f'\n[red]ต้องการบันทึกภาพ Screenshot ด้วยหรือไม่? (Y/N): [/red]', end='')
                global screenshot
                screenshot = input().lower() == 'y'
                init_text = pyfiglet.figlet_format("Start Process...")
                print(init_text)
                start_time = time.time()
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
                    if row['CODE'] != 'nan':
                        issave = False
                        process_result = ''
                        if row['PM-RESULT'] != 'nan':
                            if option == 'close_pm_cal' or option == None:
                                # process_result = closePM(id, vender, date, safety, self_call=False)
                                if row['PM-CLOSED'] == 'nan':
                                    process_result = closePM(row)
                                else:
                                    process_result = row['PM-CLOSED']
                                if process_result == "SUCCESS":

                                    # continue
                                    # master_df.at[index, 'PM-CLOSED'] = process_result
                                    master_df['PM-CLOSED'] = master_df['PM-CLOSED'].astype(
                                        str)
                                    master_df.at[index,
                                                 'PM-CLOSED'] = process_result
                                    issave = True
                                    # master_df.to_excel(writer, sheet_name=sheet_name, 2022    index=False)
                                    # writer.save()
                            if option == 'attach_pm_cal' or option == None:
                                process_attach = ''
                                if row['PM-ATTACH-STATUS'].lower() == 'success':
                                    process_attach = 'SUCCESS'
                                elif row['ATTACH-FILE-PM'].lower() == 'yes' and len([ele for ele in file_name_list if row['CODE']+'_pm' in ele]) > 0:

                                    process_attach = attachFilePM(
                                        row['CODE'], row['TEAM'], row['ENGINEER'], row['DATE-PM'], [ele for ele in file_name_list if row['CODE']+'_pm' in ele][0])
                                    master_df['PM-ATTACH-STATUS'] = master_df['PM-ATTACH-STATUS'].astype(
                                        str)
                                    if process_attach != 'Fail to Attach PM file':
                                        master_df.at[index,
                                                     'PM-ATTACH-STATUS'] = "SUCCESS"
                                        issave = True
                                else:
                                    print('[red]ไม่พบไฟล์ PM[/red]')
                                    master_df['PM-ATTACH-STATUS'] = master_df['PM-ATTACH-STATUS'].astype(
                                        str)
                                    master_df.at[index,
                                                 'PM-ATTACH-STATUS'] = 'No File To Attach'

                        if row['CAL-RESULT'] != 'nan':
                            issave = False
                            process_result = ''
                            if option == 'close_pm_cal' or option == None:
                                if row['CAL-CLOSED'] == 'nan':
                                    process_result = closeCAL(row)
                                else:
                                    process_result = row['CAL-CLOSED']
                                master_df['CAL-CLOSED'] = master_df['CAL-CLOSED'].astype(
                                    str)
                                master_df.at[index,
                                             'CAL-CLOSED'] = process_result
                                issave = True
                            if option == 'attach_pm_cal' or option == None:
                                process_attach = ''
                                if row['CAL-ATTACH-STATUS'].lower() == 'success':
                                    process_attach = 'SUCCESS'
                                elif row['ATTACH-FILE-CAL'].lower() == 'yes' and len([ele for ele in file_name_list if row['CODE']+'_cal' in ele]) > 0:
                                    process_attach = attachFileCAL(
                                        row['CODE'], row['TEAM'], row['ENGINEER'], row['DATE-CAL'], [ele for ele in file_name_list if row['CODE']+'_cal' in ele][0])
                                    master_df['CAL-ATTACH-STATUS'] = master_df['CAL-ATTACH-STATUS'].astype(
                                        str)
                                    if process_attach != 'Fail to Attach PM file':
                                        master_df.at[index,
                                                     'CAL-ATTACH-STATUS'] = 'SUCCESS'
                                        issave = True
                                else:
                                    print('[red]ไม่พบไฟล์ CAL[/red]')
                                    master_df['CAL-ATTACH-STATUS'] = master_df['CAL-ATTACH-STATUS'].astype(
                                        str)
                                    master_df.at[index,
                                                 'CAL-ATTACH-STATUS'] = 'No File To Attach'
                                # continue

                    if (issave and index != 0 and index % 20 == 0) or index == len(df)-1:
                        # if issave:
                        master_df.to_excel(
                            writer, sheet_name='Sheet1', index=False)
                        writer._save()
                end_time = time.time()

                print('\n[green]ปิดงานและแนบไฟล์สำเร็จ[/green]')
                print('[green]เสร็จสิ้นในเวลา[/green] : [yellow]{}[/yellow] วินาที'.format(
                    str(round(end_time-start_time, 2))))
                print('กดปุ่มใดก็ได้เพื่อกลับสู่เมนูหลัก : ', end='')
                input()
                # clear console
                os.system('cls' if os.name == 'nt' else 'clear')
                init_text = pyfiglet.figlet_format(
                    "BME Assistant", font="slant")
                print(init_text)
                showmenu()
                # pyautogui.alert('Close Jobs '+str(index)+' records')
            else:
                print("[red]Cancel[/red]")
                # clear console
                os.system('cls' if os.name == 'nt' else 'clear')
                init_text = pyfiglet.figlet_format(
                    "BME Assistant", font="slant")
                print(init_text)
                showmenu()
            writer.close()
    except Exception as e:
        print(e)


def change_file_name():
    dir_path = ''
    if getattr(sys, 'frozen', False):
        dir_path = os.path.dirname(sys.executable)
    else:
        dir_path = os.path.dirname(os.path.realpath(__file__))
    path = os.path.join(dir_path, 'REPORTS')
    # check if path has subfolder
    subfolder = os.listdir(path)
    if len(subfolder) > 0:
        # move file to root folder
        for file in subfolder:
            if os.path.isdir(os.path.join(path, file)):
                for f in os.listdir(os.path.join(path, file)):
                    shutil.move(os.path.join(path, file, f), path)
                os.rmdir(os.path.join(path, file))

    dir_list = os.listdir(path)
    name_arr = {}
    with Progress() as progress:
        task = progress.add_task(
            "[cyan]เปลี่ยนชื่อไฟล์[/cyan]", total=len(dir_list))
        for file_name in dir_list:
            source = os.path.join(path, file_name)

            # if file_name.find('_') == -1:
            file = fitz.open(source)
            page = file[0]
            # find text with regex /ID CODE.*\n.*$/gm
            page = page.get_text()
            text = re.findall(r'ID CODE.*\n.*$', page, re.MULTILINE)
            if len(text) == 0:
                print(
                    '[red]ไม่พบข้อมูลรหัสเครื่องมือใน PDF[/red] : [yellow]{}[/yellow]'.format(file_name))
                progress.update(task, advance=1)
                continue
            code = text[0].split('\n')[1].replace(':', '').strip()
            if code.find('(') > -1:
                code = code.split('(')[0].strip()
            if name_arr.get(code) is None:
                name_arr[code] = {}
            cal = re.findall(r'Certificate', page, re.MULTILINE)
            if len(cal) > 0:
                caldate = re.findall(
                    r'CALIBRATED DATE.*\n.*$', page, re.MULTILINE)
                name_arr[code]['cal'] = caldate
                name = code + '_cal.pdf'
            else:
                pmdate = re.findall(r'PM. DATE.*\n.*$', page, re.MULTILINE)
                name_arr[code]['pm'] = pmdate
                name = code + '_pm.pdf'
            safety = re.findall(r'Electrical Safety.*\n.*$', page, re.MULTILINE)
            if safety is not None and len(safety) > 0:
                name_arr[code]['safety'] = safety[0].replace('\n', ' ').strip()
            else:
                name_arr[code]['safety'] = '-'
            # file.save(os.path.join(path, name))
            file.close()
            try:
                os.rename(source, os.path.join(path, name))
            except Exception as e:
                # if already exist
                os.remove(os.path.join(path, name))
                os.rename(source, os.path.join(path, name))
            print('[grey42]{}[/grey42] [yellow]>>>>[/yellow] [green]{}[/green]'.format(
                file_name, name))
            progress.update(task, advance=1)
            # else:
            #     filename = file_name.split('_')
            #     if len(filename) > 1 and len(filename[1]) > 10:
            #         filename = "_".join(filename[1:])
            #         filename = re.sub(r'\s\(\d{1,}\)', '', filename)
            #         name = filename.split('(')[0]
            #         if (filename.split('(')[-1] != '1).pdf' and filename.split('(')[-1] != '2).pdf'):
            #             name_arr.append(name)
            #             if filename.split('(')[1].find('PM') > -1:
            #                 name = name + '_pm.pdf'
            #             else:
            #                 name = name + '_cal.pdf'
            #             print('เปลี่ยนชื่อไฟล์ [yellow]{}[/yellow] เป็น [yellow]{}[/yellow]'.format(
            #                 file_name, name))
            #             dest = os.path.join(path, name)
            #             os.rename(source, dest)

            # append name_arr to clipboard

            # convert name_arr to table
        # create array with length is 20 and fill with ''
        unique_arr = []

        def convertDate(date):
            if date is None or len(date) == 0 or date[0] == '':
                return ""
            date = date[0].split(':')[1].strip()
            months_str = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                          'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
            date = date.split(' ')
            if len(date) == 3:
                month = months_str.index(date[1].upper()) + 1
                return date[0] + '/' + str(month) + '/' + date[2]
            return date
        for id, value in name_arr.items():
            if value.get('cal') is None:
                value['cal'] = ['']
            if value.get('pm') is None:
                value['pm'] = ['']
            tmp_arr = [''] * 25
            tmp_arr[1] = id.split('_')[1]
            tmp_arr[8] = convertDate(value['pm'])
            if tmp_arr[8] == '':
                tmp_arr[12] = ''
                tmp_arr[14] = ''
                tmp_arr[17] = ''
            else:
                tmp_arr[12] = 'PM doable'
                tmp_arr[14] = 'pass'
                tmp_arr[17] = 'yes'
            tmp_arr[9] = convertDate(value['cal'])
            if tmp_arr[9] == '':
                tmp_arr[13] = ''
                tmp_arr[15] = ''
                tmp_arr[18] = ''
            else:
                tmp_arr[13] = 'Perform CAL'
                tmp_arr[15] = 'pass'
                tmp_arr[18] = 'yes'
            tmp_arr[16] = value['safety']
            unique_arr.append(tmp_arr)

            # if value.get('cal') is not None and value.get('pm') is not None:
            #     cal = value.get('cal')[0].split('\n')[1].replace(':', '').strip()
            #     pm = value.get('pm')[0].split('\n')[1].replace(':', '').strip()
            #     name_arr[id] = {'cal': cal, 'pm': pm}
            # else:
            #     name_arr[id] = {'cal': 'nan', 'pm': 'nan'}
        # copy to cilpboard to paste in excel
        line_strings = []
        for line in unique_arr:
            line_strings.append('\t'.join(line).replace('\n', ''))
        arr_string = '\r\n'.join(line_strings)
        pyperclip.copy(arr_string)
        print('\n[green]คัดลอกชื่อรหัสเครื่องเรียบร้อย[/green]')
    print('\n[green]เปลี่ยนชื่อไฟล์เสร็จสิ้น[/green]')
    print('\n[purple]กดปุ่มใดก็ได้เพื่อกลับสู่เมนูหลัก : [/purple]', end='')
    input()
    # clear console
    os.system('cls' if os.name == 'nt' else 'clear')
    print(init_text)
    showmenu()


def showmenu():
    # menu
    print('[light blue]ยินดีต้อนรับสู่โปรแกรมปิดงาน[/light blue]'.encode('utf-8').decode('utf-8'))
    print('[light blue]โปรดเลือกเมนูที่ต้องการ[/light blue]')
    print('[yellow][1] เปิดสคริปต์สำหรับดาวน์โหลดไฟล์ ECERT[/yellow]')
    print('[yellow][2] เปลี่ยนชื่อไฟล์ใบงาน[/yellow]')
    print('[yellow][3][/yellow]  [red]ปิดงาน[/red] [yellow]PM และ CAL[/yellow]')
    print('[yellow][4][/yellow]  [red]แนบไฟล์[/red] [yellow]PM และ CAL[/yellow]')
    print('[yellow][5][/yellow]  [red]ปิดงาน[/red] [yellow]และ[/yellow] [red]แนบไฟล์[/red] [yellow]PM และ CAL[/yellow]')
    # set input color to blue
    print(f'\n[purple]กดเลขเพื่อเลือกเมนูที่ต้องการ : [/purple]', end='')
    menu = input()
    if menu == '1':
        dir_path = ''
        if getattr(sys, 'frozen', False):
            dir_path = os.path.dirname(sys.executable)
        else:
            dir_path = os.path.dirname(os.path.realpath(__file__))
        # open file "download cert.txt" at SOURCE folder in notepad
        # os.system('notepad.exe "' + os.path.join(dir_path,
        #           'SOURCE', 'download cert.txt') + '"')
        # print('[green]เปิดสคริปต์สำหรับดาวน์โหลดไฟล์ ECERT[/green]')
        script_text = open(os.path.join(dir_path, 'SOURCE',
                           'download cert.txt'), encoding='utf-8').read()
        # copy to clipboard
        pyperclip.copy(script_text)
        print('\n[green]คัดลอกสคริปต์สำหรับดาวน์โหลดไฟล์ ECERT เรียบร้อย[/green]')
        print('\nกดปุ่มใดๆเพื่อกลับสู่เมนูหลัก : ', end='')
        input()
        os.system('cls' if os.name == 'nt' else 'clear')
        print(init_text)
        showmenu()
    elif menu == '2':
        change_file_name()
        showmenu()
    else:
        threading.Thread(target=load_empList).start()
        threading.Thread(target=load_tool_list).start()
        threading.Thread(target=load_calibrator_list).start()
        if menu == '3':
            read_file('close_pm_cal')
        elif menu == '4':
            read_file('attach_pm_cal')
        elif menu == '5':
            read_file()

        else:
            print('ไม่พบเมนูที่เลือก')
            showmenu()


showmenu()
