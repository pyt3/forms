import pygame
from PIL import Image
from io import BytesIO
from datetime import datetime
import urllib3
from rich.progress import track
from rich import print
import concurrent.futures
from flask import Flask, redirect, request, jsonify, send_file, url_for
import requests
from bs4 import BeautifulSoup
import calendar
from html2image import Html2Image
import logging
import os
import csv
import re
import json
import threading
import time
import base64
import sys
import urllib.parse
from typing import Dict, List, Optional, Union, Any
from pathlib import Path
import polars as pl

# Disable keyring password prompts on Linux
os.environ['PYTHON_KEYRING_BACKEND'] = 'keyring.backends.null.Keyring'

# Third-party imports

# Configure encodings
sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Initialize Flask application
app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
app.app_context().push()

# Global variables with type hints
cookies: Dict[str, str] = {
    "_ga": "GA1.1.409909798.1624509466",
    "_ga_L9CPT990SV": "GS1.1.1629863162.2.0.1629863162.0",
    "PHPSESSID": None,
}

login_lock = threading.Lock()
emp_list: Optional[List[List[str]]] = None
alarm: bool = False
status_printed: str = 'No internet connection'
alert_start: Optional[float] = None

headers = {
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Referer": "https://nsmart.nhealth-asia.com/mtdpdb01/default.php",
    "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
}


def set_login(username=None, password=None):
    """Authenticate with the server and get a session ID.

    Args:
        username: Optional username, uses default if None
        password: Optional password, uses default if None

    Returns:
        bool: True if login successful, False otherwise
    """
    global cookies
    with login_lock:
        logging.info('Setting up login session')

        # Use provided credentials or defaults
        data = {
            "user": username or "PYT34DARANPHOP",
            "pass": password or "577199",
            "Submit": "Submit",
            "Submit.x": "79",
            "Submit.y": "30"
        }

        try:
            with requests.Session() as s:
                r = s.post(
                    "https://nsmart.nhealth-asia.com/MTDPDB01/index.php",
                    data=data,
                    headers=headers,
                    verify=False,
                    timeout=10
                )
                r.raise_for_status()
                cookies['PHPSESSID'] = s.cookies['PHPSESSID']
                return True
        except requests.exceptions.RequestException as e:
            logging.error(f"Login error: {str(e)}")
            print(f"[red]Connection error: {str(e)}[/red]")
            time.sleep(5)
            return False


def save_empList(emp_list=None):
    print('save employee')
    # write over file to clear old data
    if emp_list is None:
        return
    with open('emp_list.csv', encoding="TIS-620", mode='w', newline='') as csvfile:
        writer = csv.writer(csvfile, delimiter=',')
        writer.writerows(emp_list)


def load_empList():
    print('load employee list')
    global emp_list
    # handle if file not found
    if emp_list is None:
        try:
            with open('emp_list.csv', encoding="TIS-620", mode='r') as csvfile:
                reader = csv.reader(csvfile, delimiter=',')
                emp_list = list(reader)
                # close file
                csvfile.close()
        except:
            emp_list = [['', '']]
    return emp_list


temp_emp_list = []


def get_emp_list(page='1'):
    print(page)
    global emp_list
    global cookies
    # https://nsmart.nhealth-asia.com/MTDPDB01/pm/maintain_list.php?s_byear=2023&s_jobdate=&s_to_date=&s_pay=&s_job_status=&s_job_result=&s_branchid=&s_dept=&s_sub_dept=&s_code=&s_sap_code=&s_classno=&s_groupid=&s_catagory=&s_tpriority=&s_brand=&s_model=&s_serial_no=&s_inplan=&s_pmok=&maintain_list_vPageSize=&s_dept_tech=M09&s_sup_serv=&s_jobno=&s_docok=
    try:
        response = requests.get(
            "https://nsmart.nhealth-asia.com/MTDPDB01/reftable/employee_branch.php?dept_tech=M09&dept_control=1&employeePage=" +
            str(page),
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(e)
        # wait 5 sec
        time.sleep(5)
        return get_emp_list(page)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    form = soup.find('form', {'name': 'employee'})
    if form is None:
        print("No form found, re-login...")
        set_login(None, None)
        return get_emp_list(page)

    tr = form.find_all('tr', {'class': 'Row'})
    max_emp = int(tr[0].find('td').text.strip().split('\xa0')[1])
    print('max emp: ' + str(max_emp))
    # delete first tr
    tr.pop(0)
    if len(temp_emp_list) < max_emp:
        for row in tr:
            input = row.find_all('input')
            if input[0]['value'] == '' or input[1]['value'] == '':
                continue
            temp_emp_list.append([input[0]['value'], input[1]['value']])
        # get next page
        page = int(page) + 1
        return get_emp_list(str(page))

    # get all option value and text
    emp_list = temp_emp_list
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
    css_file = open(css_file, 'r')
    css = css_file.read()

    # get screenshot as blob

    # get file path
    __location__ = os.getcwd()
    hti = Html2Image(temp_path=__location__, size=(
        1000, 1000), disable_logging=True)
    file_name = str(datetime.timestamp(datetime.now())*1000)
    try:
        hti.screenshot(html_str=str(soup), css_str=css,
                       save_as=file_name+'.png')
    except Exception as e:
        print(e)
        pass
    return_json = {'status': 'ok',
                   'status_text': text, 'screenshot': file_name}
    removeTempFile()
    return return_json


def closePM(id, vender, date, safety, self_call=False):
    global cookies
    if cookies['PHPSESSID'] is None:
        set_login(None, None)
        return closePM(id, vender, date, safety, self_call)
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
        print("connection problem, wait 5 sec")
        time.sleep(5)
        return closePM(id, vender, date, safety, self_call)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    # print(soup)
    table = soup.find("table", {"class", "Grid"})
    if table == None:
        print("No table found, re-login...")
        set_login(None, None)
        return closePM(id, vender, date, safety, self_call)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        return_json = get_screen_shot(
            soup, 'close_pm_css.css', 'PM Work not found')
        return json.dumps({'status': 'fail', 'status_text': 'PM Work not found', 'screenshot': return_json['screenshot']}, ensure_ascii=False)
    a_href = tr.find('a')['href'].split('?')[1]
    dept_tech = ''
    # check if vender start with [[CAL]]
    if vender.startswith('[[CAL]]'):
        dept_tech = 'M02'
    else:
        dept_tech = 'M09'
    selects = [
        {'name': 'job_result',  'value': '1', 'text_contain': False},
        {'name': 'dept_tech',  'value': dept_tech, 'text_contain': False},
        {'name': 'toolid', 'value': '61', 'text_contain': False},
        {'name': 'app_issue_name', 'value': '566152', 'text_contain': False},
    ]

    if date is not None:
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
    if emp_list is None:
        load_empList()
    emp_id = ''
    if vender.startswith('[[CAL]]'):
        form_data['emp_id'] = 'ฺB005'.encode('tis-620')
    else:
        emp_id = list(filter(lambda x: vender.lower()
                      in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            get_emp_list(1)
            emp_id = list(filter(lambda x: vender.lower()
                          in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            return json.dumps({'status': 'fail', 'status_text': 'Vender not found'}, ensure_ascii=False)
        form_data['emp_id'] = emp_id[0][0]
    form_data['pass_status'] = '1'
    if safety is not None and safety.lower() in 'Electrical Safety Analyzer'.lower():
        form_data['toolid'] = '24'
    response = requests.post('https://nsmart.nhealth-asia.com/MTDPDB01/pm/maintain07.php?' + a_href +
                             '&ccsForm=main_jobs%3AEdit', headers=headers, cookies=cookies, data=form_data, verify=False)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    status = re.findall(
        r'PM status : Completed-send equipment back', soup.text)
    print("{}, {}".format(id, status[0]))
    if len(status) > 0:
        return_json = get_screen_shot(
            soup, 'close_pm_css.css', 'PM status : Completed-send equipment back')
        if self_call:
            return return_json
        return json.dumps(return_json, ensure_ascii=False)
    print(soup)
    result_table = soup.find('table', {'class': 'Record'})
    if result_table == None:
        result_json = get_screen_shot(
            soup, 'close_pm_css.css', 'Fail to Close PM job')
        return json.dumps({'status': 'fail', 'status_text': 'Fail to Close PM job', 'screenshot': result_json['screenshot']}, ensure_ascii=False)
    result_tr = result_table.find('tr', {'class': 'Total'})
    result_td = result_tr.find('td')
    if result_td.text.strip() == 'PM status : Completed-send equipment back':
        return_json = get_screen_shot(
            soup, 'close_pm_css.css', result_td.text.strip())
        if self_call:
            return return_json
        return json.dumps(return_json, ensure_ascii=False)


def closeCAL(id, vender, date, safety, self_call=False):
    global cookies
    if cookies['PHPSESSID'] is None:
        set_login(None, None)
        return closeCAL(id, vender, date, safety, self_call)
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
        return closeCAL(id, vender, date, safety, self_call)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    # print(soup)
    table = soup.find("table", {"class", "Grid"})
    if table == None:
        print("No table found, re-login...")
        set_login(None, None)
        return closeCAL(id, vender, date, safety, self_call)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        result_json = get_screen_shot(
            soup, 'close_cal_css.css', 'CAL Work not found')
        return json.dumps({'status': 'fail', 'status_text': 'CAL Work not found', 'screenshot': result_json['screenshot']}, ensure_ascii=False)
    a_href = tr.find('a')['href'].split('?')[1]
    dept_caliber = ''
    # check if vender start with [[CAL]]
    if vender.startswith('[[CAL]]'):
        dept_caliber = 'M02'
    else:
        dept_caliber = 'M09'
    selects = [
        {'name': 'tech_idea_stat',  'value': '4', 'text_contain': False},
        {'name': 'dept_caliber',  'value': dept_caliber, 'text_contain': False},
    ]
    if date is not None:
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
    if emp_list is None:
        load_empList()
    emp_id = ''
    if vender.startswith('[[CAL]]'):
        form_data['emp_id'] = 'ฺB005'.encode('tis-620')
    else:
        emp_id = list(filter(lambda x: vender.lower()
                      in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            get_emp_list(1)
            emp_id = list(filter(lambda x: vender.lower()
                                 in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            return json.dumps({'status': 'fail', 'status_text': 'Vender not found'}, ensure_ascii=False)
        form_data['emp_id'] = emp_id[0][0]
    form_data['inspec_app_name'] = 'Ittipat Iemdee'
    form_data['CheckBox2'] = '1'
    for input in inputs:
        form_data[input['name']] = input['value']
    for select in selects:
        form_data[select['name']] = select['value']
    response = requests.post('https://nsmart.nhealth-asia.com/MTDPDB01/caliber/caliber03_1.php?' + a_href +
                             '&ccsForm=caliber_jobs_tech%3AEdit', headers=headers, cookies=cookies, data=form_data, verify=False)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    status = re.findall(r'Completed-send equipment back', soup.text)
    print(status)
    if len(status) > 0:
        return_json = get_screen_shot(
            soup, 'close_cal_css.css', 'Completed-send equipment back')
        if self_call:
            return return_json
        return json.dumps(return_json, ensure_ascii=False)
    result_td = list(filter(lambda x: 'Completed-send equipment back' in x.text.strip(), soup.find_all(
        'table', {'class': 'Record'})[1].find_all('tr', {'class': 'Controls'})[0].find_all('td')))
    if result_td == None or len(result_td) == 0:
        result_json = get_screen_shot(
            soup, 'close_cal_css.css', 'Fail to Close CAL job')
        return json.dumps({'status': 'fail', 'status_text': 'Fail to Close CAL job', 'screenshot': result_json['screenshot']}, ensure_ascii=False)
    result_td = result_td[0]
    # get css file from local
    return_json = get_screen_shot(
        soup, 'close_cal_css.css', result_td.text.strip())

    if self_call:
        return return_json
    return json.dumps(return_json, ensure_ascii=False)


def closePMCAL(id, vender, date, safety):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Submit the functions for execution
        future1 = executor.submit(closePM, *(id, vender, date, safety, True))
        future2 = executor.submit(closeCAL, *(id, vender, date, safety, True))

        # Wait for all functions to complete
        concurrent.futures.wait([future1, future2])
        result_json = {
            'pm': future1.result(),
            'cal': future2.result()
        }
        removeTempFile()
        return json.dumps(result_json)


def removeTempFile():
    # get all pdf file in root folder
    __location__ = os.getcwd()
    files = os.listdir(__location__)
    if len(files) <= 0 or len(files) > 50:
        return
    file_names = [f for f in files if f.endswith(".png")]
    # remove file extension , convert name to int and sort min to max
    file_names = sorted([int(f.split('.')[0]) for f in file_names])
    # remove first 25 file
    for i in range(0, 25):
        try:
            os.remove(os.path.join(__location__, str(file_names[i]) + '.png'))
        except:
            pass


def attachFile(id, vender, date, dataurl):
    global cookies
    # print type of dataurl
    if cookies['PHPSESSID'] is None:
        set_login(None, None)
        return attachFile(id, vender, date, dataurl)
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
        return attachFile(id, vender, date, dataurl)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    # print(soup)
    table = soup.find("table", {"class", "Grid"})
    if table == None:
        print("No table found, re-login...")
        set_login(None, None)
        return attachFile(id, vender, date, dataurl)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        return_json = get_screen_shot(
            soup, 'close_pm_css.css', 'PM Work not found')
        return json.dumps({'status': 'fail', 'status_text': 'PM Work not found', 'screenshot': return_json['screenshot']}, ensure_ascii=False)
    a_href = tr.find('a')['href'].split('?')[1]
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
    print(find_count_Header)
    if find_count_Header is not None and len(find_count_Header) > 0:
        file_th = find_count_Header.find('th').text.strip().split(' ')[2]
        file_count = int(file_th)
    form_data = {}
    inputs = form.find_all('input')
    emp_name = ''
    for input in inputs:
        try:
            form_data[input['name']] = input['value']
        except:
            print(input)
    if vender is not None and vender != '':
        if emp_list is None:
            load_empList()
        emp_id = list(filter(lambda x: vender.lower()
                      in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            get_emp_list(1)
            emp_id = list(filter(lambda x: vender.lower()
                          in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            return json.dumps({'status': 'fail', 'status_text': 'Vender not found'}, ensure_ascii=False)
        emp_name = emp_id[0][1]

    inputs = [
        {'name': 'docno', 'value': file_count+1},
        {'name': 'description_doc', 'value': 'Report PM ' + emp_name.upper()},
        {'name': 'jobno', 'value': a_href.split('jobno=')[1].split('&')[0]}
    ]
    #  create formdata foor post request
    for input in inputs:
        form_data[input['name']] = input['value']
    # create file from dataurl
    # parse json string to json object
    dataurl = json.loads(dataurl)
    if dataurl.get('isImage') == True:
        dataurl = base64_image_to_base64_pdf(dataurl['base64'])
    else:
        dataurl = dataurl['base64']
    file = base64.b64decode(dataurl)
    files = {'document_File': ('report.pdf', file, 'application/pdf')}

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
        return json.dumps({'status': 'fail', 'status_text': 'Fail to Attach PM file'}, ensure_ascii=False)
    result_th = result_table.find('th')
    if result_th.text.strip() != 'Total : 0 records':
        return_json = get_screen_shot(
            soup, 'close_pm_css.css', result_th.text.strip())
        return json.dumps(return_json, ensure_ascii=False)


def attachFileCAL(id, vender, date, dataurl):
    global cookies
    if cookies['PHPSESSID'] is None:
        set_login(None, None)
        return attachFileCAL(id, vender, date, dataurl)
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
        return attachFileCAL(id, vender, date, dataurl)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    # print(soup)
    table = soup.find("table", {"class", "Grid"})
    if table == None:
        print("No table found, re-login...")
        set_login(None, None)
        return attachFileCAL(id, vender, date, dataurl)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        return_json = get_screen_shot(
            soup, 'close_cal_css.css', 'CAL Work not found')
        return json.dumps({'status': 'fail', 'status_text': 'CAL Work not found', 'screenshot': return_json['screenshot']}, ensure_ascii=False)
    a_href = tr.find('a')['href'].split('?')[1]
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
    inputs = form.find_all('input')
    emp_name = ''
    for input in inputs:
        try:
            form_data[input['name']] = input['value']
        except:
            print(input)
    if vender is not None and vender != '':
        if emp_list is None:
            load_empList()
        emp_id = list(filter(lambda x: vender.lower()
                      in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            get_emp_list(1)
            emp_id = list(filter(lambda x: vender.lower()
                          in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            return json.dumps({'status': 'fail', 'status_text': 'Vender not found'}, ensure_ascii=False)
        emp_name = emp_id[0][1]
    inputs = [{'name': 'docno', 'value': file_count+1}, {'name': 'description_doc', 'value': 'Report CAL ' +
                                                         emp_name.upper()}, {'name': 'jobno', 'value': a_href.split('jobno=')[1].split('&')[0]}]
    #  create formdata foor post request
    for input in inputs:
        form_data[input['name']] = input['value']
    # create file from dataurl
    dataurl = json.loads(dataurl)
    if dataurl.get('isImage') == True:
        dataurl = base64_image_to_base64_pdf(dataurl['base64'])
    else:
        dataurl = dataurl['base64']
    file = base64.b64decode(dataurl)
    files = {'document_File': ('report.pdf', file, 'application/pdf')}

    # set form multipart/form-data
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
        return json.dumps({'status': 'fail', 'status_text': 'Fail to Attach CAL file'}, ensure_ascii=False)
    result_th = result_table.find('th')
    if result_th.text.strip() != 'Total : 0 records':
        return_json = get_screen_shot(
            soup, 'close_cal_css.css', result_th.text.strip())
        return json.dumps(return_json, ensure_ascii=False)


global t_s


def print_process_time(name):
    global t_s
    print(name + ' time : ' + str(time.time()-t_s))
    t_s = time.time()


def receivejob(name, jobid, detail):
    global t_s
    t_s = time.time()
    global cookies
    while cookies['PHPSESSID'] is None:
        set_login(None, None)
        print(cookies)
        print_process_time('set_login')
    # if cookies['PHPSESSID'] is None:
    #     set_login()
    #     return receivejob(name, jobid, detail)
    response = False
    staff = {
        "teerawat sukkit": "514909",
        "chaiwat salaiwong": "516694",
        "passawan toanun": "516704",
        "panalee ueasunthonnop": "530200",
        "sermkeat hadjang": "534799",
        "wuttichai chinnawong": "539703",
        "kitsana buapheat": "541441-1",
        "rattikarn reantongwattana": "546554",
        "jirawat makarapirom": "549497-1",
        "sarawut manchethuan": "554279",
        "kanistha chinrasri": "563131",
        "saran thammathorn": "563775",
        "pornphop luangpon    ": "563776",
        "pukarin tongkliang": "563778-1",
        "boonyawat aiemphang   ": "563780",
        "anuphab chanto": "563844-1",
        "naruecha chaiyaphan": "563848-1",
        "khwankhae subda": "566151",
        "ittipat iemdee": "566152",
        "phanuporn pengpun": "566262",
        "rattanalak sakulchareanporn": "568370",
        "ratchata tawasri": "568858",
        "sasimaporn khanthahome": "571500",
        "chatmanee mongkoltananon": "576470",
        "daranphop yimyam": "577199",
        "chatvipa kaewpresert": "579520",
        "phimrapeeporn phrasopol": "586202",
        "rapiphan khamsuwan": "593014",
        "som konkaew": "593031",
        "patcharaporn jornsamer": "596445",
        "ratchata piriyakitsakul": "597337",
        "ilada buapralat": "598982",
        "chanchai sae-lee": "599984",
        "thanipong phiewkhlam": "600002",
        "jirassaya chuenyoo": "602630",
        "chalermporn sabua": "608269",
        "option_name": "BME"
    }
    dept_tech = 'M07'
    employee = staff.get(name.lower())
    try:
        response = requests.get(
            "https://nsmart.nhealth-asia.com/MTDPDB01/jobs/REQ_02.php?req_no="+str(jobid), headers=headers, cookies=cookies, verify=False)
        response.encoding = "tis-620"
        print_process_time('get')
        soup = BeautifulSoup(response.text, "lxml")
        form = soup.find('form', {'name': 'jobs'})
        if form is None:
            print("No form found, re-login...")
            set_login(None, None)
            return receivejob(name, jobid, detail)
        # find td contain "Job status"
        status = form.find('td', string='Job status')
        # find td next
        status = status.find_next('td').text.strip()
        if status != 'Received request order':
            print('already received')
            return json.dumps({'status': 'ok', 'status_text': 'already recieved'}, ensure_ascii=False)

        # serializeArray form to json
        form_data = {}
        inputs = form.find_all('input')
        for input in inputs:
            form_data[input['name']] = input['value']
        selects = form.find_all('select')
        for select in selects:
            form_data[select['name']] = select.find(
                'option', {'selected': True})['value']
        form_data['description'] = detail
        form_data['jobtype'] = form.find(
            'input', {'name': 'jobtype', 'checked': True})['value']
        form_data['jobdate'] = time.strftime("%d/%m/%Y %R %p")
        form_data['nowdate'] = time.strftime("%d/%m/%Y")
        form_data['emp_name'] = name.upper()
        form_data['job_status'] = 9
        form_data['dept_tech'] = dept_tech
        form_data['employee'] = employee
        # encode form_data
        # Encode form data in TIS-620
        encoded_form_data = {k: urllib.parse.quote_plus(v.encode(
            'TIS-620', errors='xmlcharrefreplace')) if isinstance(v, str) else v for k, v in form_data.items()}
        # Convert encoded form data to query string format
        encoded_form_data_str = '&'.join(
            f"{k}={v}" for k, v in encoded_form_data.items())

        use_headers = headers.copy()
        use_headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=TIS-620'
        # encode form data to compatible with thai language
        print_process_time('encode')
        url = f"https://nsmart.nhealth-asia.com/MTDPDB01/jobs/REQ_02.php?req_no=" + \
            str(jobid)+"&ccsForm=jobs"
        response = requests.post(
            url,
            data=encoded_form_data_str,
            headers=use_headers,
            cookies=cookies, verify=False)
        print_process_time('post')
        # print request form data payload
        response.encoding = "tis-620"
        soup = BeautifulSoup(response.text, "lxml")
        form = soup.find('form', {'name': 'jobs'})
        status = form.find('td', string='Job status')
        # find td next
        status = status.find_next('td').text.strip()
        if status.lower() == 'waiting':
            # find td contain "Work order no"
            result_table = soup.find('table', {'class': 'Record'})
            tb = result_table.find('table')
            td = list(
                filter(lambda x: 'Work order no' in x.text.strip(), tb.find_all('td')))
            if len(td) == 0:
                print('Fail to Receive Job')
                return json.dumps({'status': 'fail', 'status_text': 'Fail to Receive Job'}, ensure_ascii=False)
            wo = td[0].text.split('*')[0].split('.')[1].strip()
            print(wo)
            print('Receive Job Success')
            return json.dumps({'status': 'ok', 'status_text': 'success', 'wo': wo}, ensure_ascii=False)
        else:
            print('Fail to Receive Job')
            return json.dumps({'status': 'fail', 'status_text': 'Fail to Receive Job'}, ensure_ascii=False)

    except requests.exceptions.RequestException as e:
        print(e)
        return json.dumps({'status': 'fail', 'status_text': 'Fail to Receive Job: ' + str(e)}, ensure_ascii=False)


def saveJobConsult(text, dept, code):
    global cookies
    while cookies['PHPSESSID'] is None:
        set_login(None, None)
        return saveJobConsult(text, dept, code)
    response = False
    try:
        response = requests.get(
            "https://nsmart.nhealth-asia.com/MTDPDB01/jobs/jobconsult_asset_add.php",
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(e)
        # wait 5 sec
        time.sleep(5)
        return saveJobConsult(text, dept, code)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    form = soup.find('form', {'name': 'kpi_consult'})
    if form is None:
        print("No form found, re-login...")
        set_login(None, None)
        return saveJobConsult(text, dept, code)
    # serializeArray form to json
    form_data = {}
    inputs = form.find_all('input')
    for input in inputs:
        form_data[input['name']] = input['value']
    selects = form.find_all('select')
    for select in selects:
        form_data[select['name']] = select.find(
            'option', {'selected': True})['value']
    textareas = form.find_all('textarea')
    for textarea in textareas:
        form_data[textarea['name']] = textarea.text.strip()
    sub_dept_dict = {
        "selectvalue": "",
        "ambulance(รถพยาบาล)": "00052010431",
        "anesthesia(วิสัญญี)": "00052010244",
        "art-lab(ศูนย์ผู้มีบุตรยาก)": "00052010162",
        "bct(เจาะเลือด)": "00052010434",
        "bme-pyt3": "00052010313",
        "cath-lab": "00052010233",
        "check-up(ตรวจสุขภาพ)": "00052010151",
        "corporatecustomerservice": "00052010425",
        "corporatecustomerservice(ลูกค้าองค์กร)": "00052010433",
        "cssd(จ่ายกลาง)": "00052010245",
        "dental(ทันตกรรม)": "00052010291",
        "diabetic&metabolic(เบาหวาน)": "00052010411",
        "eent(หูตาคอจมูก)": "00052010271",
        "emergency(ฉุกเฉิน)": "00052010101",
        "gastrointestinallaboratory(gi)": "00052010351",
        "hemodialysis(ไตเทียม)": "00052010002",
        "hopdcenter(ศุนย์มะเร็ง)": "00052010201",
        "housekeeping": "00052010427",
        "infectioncontrol(ic)": "00052010423",
        "intensivecareunit(ผู้ป่วยหนัก)": "00052010241",
        "laborroom(ห้องคลอด)": "00052010163",
        "laboratory": "00052010311",
        "marketing": "00052010424",
        "nursery(เด็กอ่อน)": "00052010167",
        "nursingdepartment": "00052010426",
        "observe(สังเกตอาการ)": "00052010330",
        "opdcardio(ศูนย์หัวใจ)": "00052010231",
        "opdcounternurse(cnคัดกรอง)": "00052010381",
        "opdheadneckbreast(ศุนย์เต้านม)": "00052010181",
        "opdmedicine(อายุกรรม)": "00052010111",
        "opdneuro(ศูนย์สมอง)": "00052010422",
        "opdob/gyn(ศุนย์สุขภาพหญิง)": "00052010161",
        "opdorthopaedics(ศูนย์กล้ามเนื้อและกระดูก)": "00052010430",
        "opdpediatric(แผนกเด็ก)": "00052010171",
        "opdsurgery(ศัลยกรรม)": "00052010131",
        "opdurology(ทางเดินปัสสาวะ)": "00052010133",
        "operatingroom(ห้องผ่าตัด)": "00052010243",
        "pharmacy(เภสัชกรรมห้องยา)": "00052010321",
        "pharmacy-store(คลังยา)": "00052010432",
        "phyathaibeautycenter(pbcความงาม)": "00052010191",
        "physicaltherapy(กายภาพ)": "00052010331",
        "picu": "00052010003",
        "pwalifecenter": "00052010421",
        "pwaชะลอวัย": "00052010134",
        "vehicle": "00052010428",
        "ward10": "00052010254",
        "ward11": "00052010174",
        "ward12": "00052010175",
        "ward14": "00052010178",
        "ward15": "00052010255",
        "ward17": "00052010246",
        "ward7": "00052010164",
        "ward8": "00052010238",
        "ward9": "00052010185",
        "warehouse": "00052010429",
        "x-ray": "00052010301",
        "รับส่ง": "00052010001",
        "ห้องเก็บของชั้น19": "00052010313"
    }
    dept = sub_dept_dict.get(dept.lower().replace(' ', ''))
    form_data['sub_dept'] = dept
    form_data['branchid'] = '00052'
    form_data['dept'] = '0005201'
    form_data['sap_code'] = code
    form_data['request_detail'] = text
    form_data['consult_detail'] = text

    print(form_data)
    # encode form data
    encoded_form_data = {k: urllib.parse.quote_plus(v.encode(
        'TIS-620', errors='xmlcharrefreplace')) if isinstance(v, str) else v for k, v in form_data.items()}
    # Convert encoded form data to query string format
    encoded_form_data_str = '&'.join(
        f"{k}={v}" for k, v in encoded_form_data.items())
    use_headers = headers.copy()
    use_headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=TIS-620'
    response = requests.post(
        "https://nsmart.nhealth-asia.com/MTDPDB01/jobs/jobconsult_asset_add.php?ccsForm=kpi_consult",
        data=encoded_form_data_str,
        headers=use_headers,
        cookies=cookies, verify=False)
    if response.status_code == 200:
        print('save job consult success {}'.format(code))
        return json.dumps({'status': 'ok', 'status_text': 'success'}, ensure_ascii=False)
    else:
        print('save job consult fail {}'.format(code))
        return json.dumps({'status': 'fail', 'status_text': 'fail'}, ensure_ascii=False)


def saveSignature(id, dataurl):
    global cookies
    while cookies['PHPSESSID'] is None:
        set_login(None, None)
        return saveSignature(id, dataurl)
    response = False
    print('https://nsmart.nhealth-asia.com/MTDPDB01/save_image.php?jobno=' + id)

    form_data = {
        "jobno": id,
        "test02": dataurl
    }
    try:
        response = requests.post(
            "https://nsmart.nhealth-asia.com/MTDPDB01/save_image.php?jobno=" + id,
            headers=headers,
            cookies=cookies,
            data=form_data,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(e)
        # wait 5 sec
        time.sleep(5)
        return saveSignature(id, dataurl)
    response.raise_for_status()
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    if response.status_code == 200:
        try:
            response = requests.get("https://nsmart.nhealth-asia.com/MTDPDB01/signature_edit.php?jobno=" +
                                    id, headers=headers, cookies=cookies, verify=False)
            response.raise_for_status()
            if response.status_code == 200:
                response.encoding = "tis-620"
                soup = BeautifulSoup(response.text, "lxml")
                print(soup.find_all('img'))
                sign = soup.find_all('img')[0]['src']
                sign = 'https://nsmart.nhealth-asia.com/MTDPDB01/' + sign
                print(sign)
                print('save signature success {}'.format(id))
                return json.dumps({'status': 'ok', 'status_text': 'success', 'url': sign}, ensure_ascii=False)
        except requests.exceptions.RequestException as e:
            print(e)
            # wait 5 sec
            time.sleep(5)
            return saveSignature(id, dataurl)
    else:
        print('save signature fail {}'.format(id))
        return json.dumps({'status': 'fail', 'status_text': 'fail'}, ensure_ascii=False)


stocks = {}

tr_obj = {}
max_elements = 0


def getStockBalance(page):
    url = "https://nsmart.nhealth-asia.com/MTDPDB01/stock/stock01.php"
    if page is not None:
        url = url + "?partPage=" + str(page)
    else:
        return "page is None"

    try:
        response = requests.get(
            url,
            # data={"USER": "PYT34DARANPHOP", "PASS": "577199", "Submit": "Submit", "Submit.x": "79", "Submit.y": "30"}
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(e)
        # wait 5 sec
        time.sleep(5)
        return getStockBalance(page)

    print(" .")
    print("Checking STOCK...")
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    table = soup.find("table", {"class", "Grid"})
    if (table == None):
        print("No table found, re-login...")
        set_login(None, None)
        return getStockBalance(page)
    tr = table.findAll("tr",  {"class", "Row"})
    # get max elements
    max_elements = tr[0].findAll("td")[0].text.strip()
    # get only number from max elements text
    max_elements = int("".join(filter(lambda x: x.isdigit(), max_elements)))
    tr.pop(0)
    for row in tr:
        td = row.findAll("td")
        id = td[0].text.strip()
        code = td[1].find("a").text.strip()
        name = td[2].text.strip()
        balance = td[9].text.strip()
        tr_obj[id] = {"code": code, "name": name, "balance": balance, "id": id}
    # check if tr_obj is not equal to max_elements
    if len(tr_obj) < max_elements:
        return getStockBalance(page=page+1)

    else:
        return json.dumps({'status': 'ok', 'stock_count': len(tr_obj), 'stock_data': tr_obj}, ensure_ascii=False)


def handleRequest(request):
    """Handle all API requests based on the 'mode' parameter.

    Centralizes request processing for the various API endpoints.
    Ensures consistent error handling and response formats.
    """
    global cookies

    # Ensure we have a valid session
    if cookies['PHPSESSID'] is None:
        set_login(None, None)
        return handleRequest(request)

    # Extract common parameters
    mode = request.args.get('mode')
    id = request.args.get('id')
    date = request.args.get('date')
    vender = request.args.get('vender')

    try:
        if mode == 'stock':
            return getStockBalance(1)
        elif mode == 'closepm':
            safety = request.args.get('safety')
            return closePM(id, vender, date, safety)
        elif mode == 'closecal':
            safety = request.args.get('safety')
            return closeCAL(id, vender, date, safety)
        elif mode == 'closepmcal':
            safety = request.args.get('safety')
            return closePMCAL(id, vender, date, safety)
        elif mode == 'attachfile':
            dataurl = request.form.get('dataurl')
            return attachFile(id, vender, date, dataurl)
        elif mode == 'attachfilecal':
            dataurl = request.form.get('dataurl')
            return attachFileCAL(id, vender, date, dataurl)
        elif mode == 'screenshot':
            screenshot = request.args.get('screenshot')
            return send_file(str(screenshot)+'.png', mimetype='image/png')
        elif mode == 'receivejob':
            name = request.args.get('name')
            jobid = request.args.get('jobid')
            detail = request.args.get('detail')
            return receivejob(name, jobid, detail)
        elif mode == 'savejobconsult':
            text = request.args.get('text')
            dept = request.args.get('dept')
            code = request.args.get('code')
            return saveJobConsult(text, dept, code)
        elif mode == 'signature':
            jobno = request.args.get('jobno')
            dataurl = request.form.get('dataurl')
            return saveSignature(jobno, dataurl)
        else:
            return json.dumps({'status': 'error', 'message': 'Mode not found or not specified'}, ensure_ascii=False)
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        return json.dumps({'status': 'error', 'message': f'Error: {str(e)}'}, ensure_ascii=False)


@app.route('/', methods=['GET', 'POST'])
def index():
    """Main API endpoint that dispatches to specific handlers based on the mode."""
    mode = request.args.get('mode')
    if mode is not None:
        return handleRequest(request)
    return json.dumps({'status': 'ok', 'message': 'API is running'}, ensure_ascii=False)


@app.route('/status', methods=['GET'])
def status():
    """Check internet connection status."""
    return checkInternet()


def checkInternet():
    """Verify internet connectivity by pinging Google."""
    try:
        requests.get("https://www.google.com", timeout=5)
        return json.dumps({'status': 'ok'}, ensure_ascii=False)
    except requests.exceptions.RequestException:
        return json.dumps({'status': 'fail', 'message': 'No internet connection'}, ensure_ascii=False)


@app.route('/startbot', methods=['GET', 'POST'])
def startbot():
    """Start the test.py script in a new window, compatible with both Windows and Linux."""
    try:
        # Use the appropriate command based on the OS
        if os.name == 'nt':  # Windows
            os.system('start python test.py')
        else:  # Linux/Unix
            os.system('gnome-terminal -- python3 test.py')
        return json.dumps({'status': 'ok'}, ensure_ascii=False)
    except Exception as e:
        logging.error(f"Failed to start bot: {str(e)}")
        return json.dumps({'status': 'fail', 'message': str(e)}, ensure_ascii=False)


def play_sound():
    """Play alert sound when internet connection is lost.

    Uses pygame to play an alert sound and properly handles initialization,
    file existence checks, and cleanup.
    """
    try:
        # Initialize pygame mixer if not already initialized
        if not pygame.mixer.get_init():
            pygame.mixer.init()

        sound_file = os.path.join(os.getcwd(), 'alert.mp3')

        # Check if file exists before trying to play it
        if not os.path.exists(sound_file):
            logging.error(f"Alert sound file not found: {sound_file}")
            return

        # Load and play the sound with proper cleanup
        pygame.mixer.music.load(sound_file)
        pygame.mixer.music.play()

        # Wait for playback to finish or timeout after 8 seconds
        start_time = time.time()
        while pygame.mixer.music.get_busy() and time.time() - start_time < 8:
            time.sleep(0.1)

        pygame.mixer.music.stop()
    except Exception as e:
        logging.error(f"Error playing sound: {e}")


def status_checking():
    """Monitor internet connectivity in a background thread.

    Periodically checks internet connection and plays alert sound when connectivity is lost.
    Implements a cooldown period to avoid constant alerts.
    """
    global alarm
    global status_printed
    global alert_start

    # Configuration
    CHECK_INTERVAL = 10  # seconds between checks when online
    ALERT_COOLDOWN = 300  # seconds (5 minutes) between repeated alerts

    while True:
        try:
            # Set a timeout to avoid blocking the thread for too long
            requests.get("https://www.google.com", timeout=5)

            # Connection is good
            if status_printed == 'No internet connection':
                logging.info("Internet connection restored")
                print("[green]Internet connection is back[/green]")
                status_printed = 'Internet connected successfully'
                # Reset alert timer when connection is restored
                alert_start = None

            alarm = False
            time.sleep(CHECK_INTERVAL)

        except (requests.ConnectionError, requests.Timeout):
            # Initialize alert start time if this is the first alert
            if alert_start is None:
                alert_start = time.time()

            status_printed = 'No internet connection'
            current_time = time.time()

            # Only play sound if it's the first alert or if enough time has passed
            if not alarm or (current_time - alert_start >= ALERT_COOLDOWN):
                logging.warning("No internet connection detected")
                print("[red]No internet connection[/red]")
                alarm = True
                play_sound()

            # Check more frequently during outage
            time.sleep(5)


# Start the status checking thread
status_checking_thread = threading.Thread(target=status_checking, daemon=True)
status_checking_thread.start()


@app.route('/get_new_equipments_list', methods=['GET'])
def get_equipment_file(url='https://nsmart.nhealth-asia.com/MTDPDB01/asset_mast_list_new.php?asset_masterPageSize=100', page='1'):
    global equipments_arr
    global cookies
    current_last_id = request.args.get('id')

    if current_last_id is None or current_last_id == '':
        return json.dumps({'status': 'fail', 'status_text': 'ID not found'}, ensure_ascii=False)
    current_last_id = str(current_last_id).strip()
    if page == '1':
        equipments_arr = []
        print("[green]Fetching Equipments...[/green]")
    page_url = url + "&asset_masterPage=" + str(page)

    # Ensure we have a valid session
    if cookies['PHPSESSID'] is None:
        set_login(None, None)
        return get_equipment_file(url, page)
    try:
        response = requests.get(
            page_url,
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(f"An error occurred on line {sys.exc_info()[-1].tb_lineno}: {e}")
        time.sleep(5)
        return get_equipment_file(url, page)
    response.encoding = "tis-620"
    # find table with regex
    res = re.findall(
        r'<table\s+[^>]*class=["\']Grid["\'][^>]*>', response.text, re.DOTALL)
    if len(res) == 0:
        print("No table found, re-login...")
        set_login()
        return get_equipment_file(url, page)
    # print attr class of each table
    # find index of '<table class="Grid" cellspacing="0" cellpadding="0">'
    # index = response.text.find('<table class="Grid" cellspacing="0" cellpadding="0">')
    tmp = response.text.split(
        '<table class="Grid" cellspacing="0" cellpadding="0">')
    tmp2 = tmp[1].split('</table>')
    table = '<table class="Grid" cellspacing="0" cellpadding="0">' + \
        tmp2[0] + '</table>'
    soup = BeautifulSoup(table, "lxml")
    max_page = soup.find_all('tr', {'class': 'Footer'})[
        0].text.split('of')[1].strip().split(' ')[0]
    print('[yellow]Fetching page[/yellow] [blue]{}[/blue] [yellow]out of[/yellow] [blue]{}[/blue]' .format(page, max_page))
    rows = soup.find_all('tr')
    if page == 1:
        rows = rows[1:-1]
    else:
        rows = rows[2:-1]
    for row in rows:
        cols = row.find_all('td')
        if cols[3].text.strip() == current_last_id:
            print(
                '[yellow]Total Equipments fetched[/yellow] [blue]{}[/blue]' .format(len(equipments_arr)))
            return json.dumps({'status': 'ok', 'status_text': 'success', 'equipments': equipments_arr}, ensure_ascii=False)
            break
        if cols[3].text.strip() == '':
            continue
        img = ('https://nsmart.nhealth-asia.com/MTDPDB01/' +
               cols[1].find('a').get('href')) if cols[1].find('a') is not None else ''
        cols = [ele.text.strip() if ele.text.strip() !=
                'Click' else '' for ele in cols]
        cols[1] = img
        equipments_arr.append(cols)

    if int(page) >= int(max_page):
        # # if int(page) == 2:
        # df = pd.DataFrame(equipments_arr, columns=header)
        # df.to_excel(os.path.join(root_dir, 'EXCEL FILE',
        #             'equipment_list.xlsx'), index=False)
        # # print file path to let user to click
        # print('[yellow]The equipment list file has been saved at[/yellow] [blue]{}[/blue]' .format(
        #     os.path.join(root_dir, 'EXCEL FILE', 'equipment_list.xlsx')))
        # # open file
        # file_path = os.path.join(root_dir, 'EXCEL FILE', 'equipment_list.xlsx')
        # auto_adjust_column_width_from_df(file_path, 'Sheet1')
        # os.system('start excel.exe "' + file_path + '"')

        return equipments_arr
    else:

        page = int(page) + 1
        return get_equipment_file(url, str(page))


def get_repairWorks_file(url='https://nsmart.nhealth-asia.com/MTDPDB01/jobs/BJOBA_01A.php', page='974'):
    global equipments_arr
    global cookies
    # current_last_id = request.args.get('id')
    # Get current_last_id from the last row of the csv file
    current_last_id = None
    csv_path = os.path.join(os.getcwd(), 'work_order.csv')
    try:
        # csv_path = os.path.join(os.getcwd(), 'work_order.csv')
        # with open(csv_path, 'r', encoding='utf-8') as f:
        #     if os.path.exists(csv_path):
        #         df = pl.read_csv(csv_path, encoding='utf-8')
        #         last_row = df[-1]
        #         current_last_id = last_row[1]
        #         print (f"[yellow]Current last ID: {current_last_id}[/yellow]")
        #     else:
        #         print("[yellow]No existing work order CSV found, starting from the beginning[/yellow]")
        #         if current_last_id is None or current_last_id == '':
        #             current_last_id = ''
        mode = 'r'
        
        with open(csv_path, mode=mode, encoding='utf-8', newline='') as csvfile:
            reader = csv.reader(csvfile)
            if reader != []:
                # Read the last row from the CSV file
                for row in reader:
                    current_last_id = row[1]
                print(f"[yellow]Current last ID: {current_last_id}[/yellow]")
    except Exception as e:
        print(f"[red]Error reading last ID from CSV: {str(e)}[/red]")
    
    if current_last_id is None or current_last_id == '':
        current_last_id = '000000'
    current_last_id = str(current_last_id).strip()
    if page == '1':
        equipments_arr = []
        print("[green]Fetching Equipments...[/green]")
    page_url = url + "?jobsPage=" + str(page)

    # Ensure we have a valid session
    if cookies['PHPSESSID'] is None:
        set_login(None, None)
        return get_repairWorks_file(url, page)
    response = False
    try:
        response = requests.get(
            page_url,
            headers=headers,
            cookies=cookies,
            verify=False,
        )
    except requests.exceptions.RequestException as e:
        print(f"An error occurred on line {sys.exc_info()[-1].tb_lineno}: {e}")
        time.sleep(5)
        return get_repairWorks_file(url, page)
    response.encoding = "tis-620"
    # find table with regex
    res = re.findall(
        r'<table\s+[^>]*class=["\']Grid["\'][^>]*>', response.text, re.DOTALL)
    if len(res) == 0:
        print("No table found, re-login...")
        set_login()
        return get_repairWorks_file(url, page)
    # print attr class of each table
    # find index of '<table class="Grid" cellspacing="0" cellpadding="0">'
    # index = response.text.find('<table class="Grid" cellspacing="0" cellpadding="0">')
    tmp = response.text.split('<table class="Grid"')
    tmp2 = tmp[1].split('</table>')
    table = '<table class="Grid"' + tmp2[0] + '</table>'
    soup = BeautifulSoup(table, "lxml")
    rows = soup.find_all('tr',{'class': 'RowAsset'})
    max_page = soup.find_all('tr', {'class': 'Footer'})[
        0].text.split('of')[1].strip().split(' ')[0]
    print('[yellow]Fetching page[/yellow] [blue]{}[/blue] [yellow]out of[/yellow] [blue]{}[/blue]' .format(page, max_page))
    header = [ele.text.strip() for ele in soup.find('tr', {'class': 'Caption'}).find_all('th')]
    if page == 1:
        rows = rows[1:-1]
    else:
        rows = rows[2:-1]
    work_arr = []
    for row in rows:
        cols = row.find_all('td')
        # if cols[1].text.strip() != current_last_id:
        #     print(
        #         '[yellow]Total Work Order fetched[/yellow] [blue]{}[/blue]' .format(len(equipments_arr)))
        #     return json.dumps({'status': 'ok', 'status_text': 'success', 'equipments': equipments_arr}, ensure_ascii=False)
        #     break
        # if cols[1].text.strip() == '':
        #     continue
        cols = [ele.text.strip() if ele.text.strip() !=
                'Click' else '' for ele in cols]
        work_arr.append(cols)

    # Save to CSV after processing each page to avoid data loss in case of interruption
    try:
        csv_path = os.path.join(os.getcwd(), 'work_order.csv')
        mode = 'w' if page == '1' else 'a'
        write_header = (page == '1')
        
        with open(csv_path, mode=mode, encoding='utf-8-sig', newline='') as csvfile:
            writer = csv.writer(csvfile)
            if write_header:
                writer.writerow(header)
            for row in work_arr:
                # Convert any possible Thai characters properly
                encoded_row = []
                for cell in row:
                    if isinstance(cell, str):
                        # Ensure string is properly encoded for Thai characters
                        encoded_row.append(cell)
                    else:
                        encoded_row.append(cell)
                writer.writerow(encoded_row)
        
        print(f"[green]Work orders saved to {csv_path}[/green]")
    except Exception as e:
        print(f"[red]Error saving to CSV: {str(e)}[/red]")
    
    # Calculate max pages based on max data and rows per page (typically 25)
    if int(page) >= int(max_page):
        # # if int(page) == 2:
        # df = pd.DataFrame(equipments_arr, columns=header)
        # df.to_excel(os.path.join(root_dir, 'EXCEL FILE',
        #             'equipment_list.xlsx'), index=False)
        # # print file path to let user to click
        # print('[yellow]The equipment list file has been saved at[/yellow] [blue]{}[/blue]' .format(
        #     os.path.join(root_dir, 'EXCEL FILE', 'equipment_list.xlsx')))
        # # open file
        # file_path = os.path.join(root_dir, 'EXCEL FILE', 'equipment_list.xlsx')
        # auto_adjust_column_width_from_df(file_path, 'Sheet1')
        # os.system('start excel.exe "' + file_path + '"')

        return equipments_arr
    else:

        page = int(page) + 1
        return get_repairWorks_file(url, str(page))

equipments_arr = []


if __name__ == '__main__':
    # from waitress import serve
    # print("Starting server on port 5050...")
    # serve(app, port=5050, threads=20, cleanup_interval=30)
    get_repairWorks_file()
else:
    # This code only runs when imported as a module, not when run directly
    # Useful for development/testing scenarios
    app.run(port=5050, threaded=True)
# saveJobConsult("PYT34PUKARIN", "t997",
#   "test consult job", "AMBULANCE (รถพยาบาล)", 'PYT3_04920')
