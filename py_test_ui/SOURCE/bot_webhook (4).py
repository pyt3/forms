import os
import csv
from html2image import Html2Image
import calendar
import json
import threading
from bs4 import BeautifulSoup
import time
import requests
from flask import Flask, redirect, request, jsonify, send_file, url_for
import subprocess
import concurrent.futures
from rich import print, pretty
from rich.progress import track
import urllib3
from datetime import datetime
from io import BytesIO
from PIL import Image
import base64
import sys


sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# from selenium.webdriver.chrome.options import Options

app = Flask(__name__)
app.app_context().push()

cookies = {
    "_ga": "GA1.1.409909798.1624509466",
    "_ga_L9CPT990SV": "GS1.1.1629863162.2.0.1629863162.0",
    "PHPSESSID": None,
}


headers = {
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Referer": "http://nsmart.nhealth-asia.com/mtdpdb01/default.php",
    "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
}

emp_list = None


def set_login():
    try:
        with requests.Session() as s:
            r = s.post("https://nsmart.nhealth-asia.com/MTDPDB01/index.php",
                       data={"user": "PYT34DARANPHOP", "pass": "577199", "Submit": "Submit", "Submit.x": "79", "Submit.y": "30", }, headers=headers, verify=False)
            cookies['PHPSESSID'] = s.cookies['PHPSESSID']
            print('Login Success')
    except Exception as e:
        print(e)
        print("[red]No Internet Connection[/red]")
        # wait 5 sec
        time.sleep(5)
        set_login()


def save_empList(emp_list=None):
    # write over file to clear old data
    if emp_list is None:
        return
    with open('emp_list.csv', encoding="TIS-620", mode='w', newline='') as csvfile:
        writer = csv.writer(csvfile, delimiter=',')
        writer.writerows(emp_list)


def load_empList():
    global emp_list
    # handle if file not found
    try:
        with open('emp_list.csv', encoding="TIS-620", mode='r') as csvfile:
            reader = csv.reader(csvfile, delimiter=',')
            emp_list = list(reader)
            # close file
            csvfile.close()
    except:
        emp_list = [['', '']]



temp_emp_list = []
def get_team_list(url, page='1'):
    page_url = url + "&employeePage=" + str(page)
    try:
        response = requests.get(
            url,
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
    max_emp = int(tr[0].find('td').text.strip().split('\xa0')[1])
    tr.pop(0)
    if max_emp > 0:
        for row in tr:
            input = row.find_all('input')
            if input[0]['value'] == '' or input[1]['value'] == '':
                continue
            temp_emp_list.append([input[0]['value'], input[1]['value']])
        # get next page
        page = int(page) + 1
        return get_team_list(url, str(page))
    else:
        return temp_emp_list


def get_emp_list():
    global emp_list
    # https://nsmart.nhealth-asia.com/MTDPDB01/pm/maintain_list.php?s_byear=2023&s_jobdate=&s_to_date=&s_pay=&s_job_status=&s_job_result=&s_branchid=&s_dept=&s_sub_dept=&s_code=&s_sap_code=&s_classno=&s_groupid=&s_catagory=&s_tpriority=&s_brand=&s_model=&s_serial_no=&s_inplan=&s_pmok=&maintain_list_vPageSize=&s_dept_tech=M09&s_sup_serv=&s_jobno=&s_docok=
    try:
        response = requests.get(
            # "https://nsmart.nhealth-asia.com/MTDPDB01/reftable/employee_branch.php?dept_tech=M09&dept_control=1&employeePage=" +
            # str(page),
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
        print('[yellow]กำลังดึงข้อมูลรายชื่อในทีม[/yellow] [blue]{}[/blue]' .format(td[1].text.strip()))
        url = "https://nsmart.nhealth-asia.com/MTDPDB01/reftable/employee_branch.php?ept_control=1&dept_tech={}".format(td[0].text.strip())
        team_list = get_team_list(url)
        print(team_list)
        emp_list[td[1].text.strip()] = team_list
        print(emp_list)
        print('............................')
    print(tr)
    return
    max_emp = int(tr[0].find('td').text.strip().split('\xa0')[1])
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
    hti = Html2Image(temp_path=__location__, size=(1000, 1000))
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


 


def closeCAL(id, vender, date, safety, self_call=False):
    if cookies['PHPSESSID'] is None:
        set_login()
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
        set_login()
        return closeCAL(id, vender, date, safety, self_call)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        result_json = get_screen_shot(
            soup, 'close_cal_css.css', 'CAL Work not found')
        return jsonify({'status': 'fail', 'status_text': 'CAL Work not found', 'screenshot': result_json['screenshot']})
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
            return jsonify({'status': 'fail', 'status_text': 'Vender not found'})
        print(emp_id)
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
    result_td = list(filter(lambda x: 'Completed-send equipment back' in x.text.strip(), soup.find_all(
        'table', {'class': 'Record'})[1].find_all('tr', {'class': 'Controls'})[0].find_all('td')))

    if result_td == None or len(result_td) == 0:
        result_json = get_screen_shot(
            soup, 'close_cal_css.css', 'Fail to Close CAL job')
        return jsonify({'status': 'fail', 'status_text': 'Fail to Close CAL job', 'screenshot': result_json['screenshot']})
    result_td = result_td[0]
    # get css file from local
    return_json = get_screen_shot(
        soup, 'close_cal_css.css', result_td.text.strip())

    if self_call:
        return return_json
    return jsonify(return_json)


def closePMCAL(id, vender, date, safety):
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        # Submit the functions for execution
        future1 = executor.submit(closePM, *(id, vender, date, safety, True))
        future2 = executor.submit(closeCAL, *(id, vender, date, safety, True))

        # Wait for all functions to complete
        concurrent.futures.wait([future1, future2])
        result_json = {
            'pm': future1.result(),
            'cal': future2.result()
        }
        print(result_json)
        removeTempFile()
        return jsonify(result_json)


def removeTempFile():
    # get all pdf file in root folder
    __location__ = os.getcwd()
    files = os.listdir(__location__)
    if len(files) <= 0 or len(files) > 50:
        return
    file_names = [f for f in files if f.endswith(".png")]
    # remove file extension , convert name to int and sort min to max
    file_names = sorted([int(f.split('.')[0]) for f in file_names])
    print(file_names)
    # remove first 25 file
    for i in range(0, 25):
        try:
            os.remove(os.path.join(__location__, str(file_names[i]) + '.png'))
        except:
            pass


def attachFile(id, vender, date, dataurl):
    # print type of dataurl
    if cookies['PHPSESSID'] is None:
        set_login()
        attachFile(id, vender, date, dataurl)
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
        set_login()
        return attachFile(id, vender, date, dataurl)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        return_json = get_screen_shot(
            soup, 'close_pm_css.css', 'PM Work not found')
        return jsonify({'status': 'fail', 'status_text': 'PM Work not found', 'screenshot': return_json['screenshot']})
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
    if find_count_Header is not None and len(find_count_Header) > 0:
        file_th = find_count_Header.find('th').text.strip().split(' ')[2]
        file_count = int(file_th)
    form_data = {}
    inputs = form.findAll('input')
    emp_name = ''
    for input in inputs:
        try:
            print(input['name'], input['value'])
            form_data[input['name']] = input['value']
        except:
            print(input)
    if vender is not None and vender != '':
        load_empList()
        emp_id = list(filter(lambda x: vender.lower()
                      in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            get_emp_list(1)
            emp_id = list(filter(lambda x: vender.lower()
                          in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            return jsonify({'status': 'fail', 'status_text': 'Vender not found'})
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
        return jsonify({'status': 'fail', 'status_text': 'Fail to Attach PM file'})
    result_th = result_table.find('th')
    if result_th.text.strip() != 'Total : 0 records':
        return_json = get_screen_shot(
            soup, 'close_pm_css.css', result_th.text.strip())
        return jsonify(return_json)


def attachFileCAL(id, vender, date, dataurl):
    if cookies['PHPSESSID'] is None:
        set_login()
        attachFileCAL(id, vender, date, dataurl)
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
        set_login()
        return attachFileCAL(id, vender, date, dataurl)
    tr = table.find('tr', {"class", "Row"})
    if tr == None:
        return_json = get_screen_shot(
            soup, 'close_cal_css.css', 'CAL Work not found')
        return jsonify({'status': 'fail', 'status_text': 'CAL Work not found', 'screenshot': return_json['screenshot']})
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
    inputs = form.findAll('input')
    emp_name = ''
    for input in inputs:
        try:
            print(input['name'], input['value'])
            form_data[input['name']] = input['value']
        except:
            print(input)
    if vender is not None and vender != '':
        load_empList()
        emp_id = list(filter(lambda x: vender.lower()
                      in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            get_emp_list(1)
            emp_id = list(filter(lambda x: vender.lower()
                          in x[1].lower(), emp_list))
        if len(emp_id) == 0:
            return jsonify({'status': 'fail', 'status_text': 'Vender not found'})
        emp_name = emp_id[0][1]
        inputs = [
            {'name': 'docno', 'value': file_count+1},
            {'name': 'description_doc', 'value': 'Report CAL ' + emp_name.upper()},
            {'name': 'jobno', 'value': a_href.split('jobno=')[1].split('&')[0]}
        ]
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
        return jsonify({'status': 'fail', 'status_text': 'Fail to Attach CAL file'})
    result_th = result_table.find('th')
    if result_th.text.strip() != 'Total : 0 records':
        return_json = get_screen_shot(
            soup, 'close_cal_css.css', result_th.text.strip())
        return jsonify(return_json)


def handleRequest(request):
    if cookies['PHPSESSID'] is None:
        set_login()
        return handleRequest(request)
    mode = request.args.get('mode')
    id = request.args.get('id')
    date = request.args.get('date')
    vender = request.args.get('vender')
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
        # get dataurl from post request
        dataurl = request.form.get('dataurl')
        return attachFile(id, vender, date, dataurl)
    elif mode == 'attachfilecal':
        # get dataurl from post request
        dataurl = request.form.get('dataurl')
        return attachFileCAL(id, vender, date, dataurl)
    elif mode == 'screenshot':
        screenshot = request.args.get('screenshot')
        return send_file(str(screenshot)+'.png', mimetype='image/png')
    else:
        return jsonify({'status': 'error', 'message': 'mode not found'})


stocks = {}

tr_obj = {}
max_elements = 0


def getStockBalance(page):
    url = "http://nsmart.nhealth-asia.com/MTDPDB01/stock/stock01.php"
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
        set_login()
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


# @app.route('/', methods=['GET', 'POST'])
# def index():
#     # return json {"status": "ok"}
#     # if request.method == 'GET':
#     # extract parameters
#     mode = request.args.get('mode')
#     if mode is not None:
#         return handleRequest(request)


# if __name__ == '__main__':
#     app.run(debug=True, port='5050')
get_emp_list()
