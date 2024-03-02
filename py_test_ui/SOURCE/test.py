import base64
from io import BytesIO
import pandas as pd
import csv
import os
from pprint import pprint
import datetime
# import html2image
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
from closePM import closePM
from closeCAL import closeCAL

from openpyxl import load_workbook
logging.basicConfig(filename='log.txt', filemode='a', format='%(asctime)s - %(levelname)s - %(message)s',
                    level=logging.INFO)


pretty.install()

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

init_text = pyfiglet.figlet_format("BME Assistant", font="slant")
print(init_text)

root_dir = os.path.dirname(os.path.abspath(__file__))

# check if using pyinstaller
if getattr(sys, 'frozen', False):
    root_dir = os.path.dirname(sys.executable)
print(root_dir)
config = open(os.path.join(root_dir, "config.json"), "r")
confdata = json.load(config)

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
temp_emp_list = {}

file_name = 'recordCal_PM.xlsx'
master_df = (pd.read_excel(
    os.path.join(root_dir, file_name), sheet_name='Sheet1')).dropna(subset=["CODE"])
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
            with open(os.path.join(root_dir, "config.json"), "w") as json_file:
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
    with open(os.path.join(root_dir, 'emp_list.json'), 'w') as json_file:
        json.dump(emp_list, json_file)


def load_empList():
    global emp_list
    # handle if file not found
    try:
        with open(os.path.join(root_dir, 'emp_list.json'), 'r') as json_file:
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
        with open(os.path.join(root_dir, 'tools_list.json'), 'r') as json_file:
            tools_list = json.load(json_file)
        if tools_list is None or len(tools_list) == 0:
            print('No tools list found')
            exit()
    except Exception as e:
        print(e)
        print('No tools list found')
        exit()

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
    footer = form.find_all('tr', {'class': 'Footer'})[0].text.strip().split('of')[1].strip().split(' ')[0]
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
            temp_team_list[input[1]['value'].lower()] = input[0]['value']
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
        print('[yellow]กำลังดึงข้อมูลรายชื่อในทีม[/yellow] [blue]{}[/blue]' .format(td[1].text.strip()))
        url = "https://nsmart.nhealth-asia.com/MTDPDB01/reftable/employee_branch.php?dept_control=1&dept_tech={}".format(
            td[0].text.strip())
        team_list = get_team_list(url)
        emp_list[td[1].text.strip().lower()] = team_list
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


def closePM(row, self_call=False):
    global emp_list
    if cookies['PHPSESSID'] is None:
        set_login()
        return closePM(row, self_call)
    response = False
    start_date, end_date, now_year = getFirstAndLastDay(row['DATE-PM'])
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
    if emp_list[row['TEAM'].lower()] is None:
        print('Team not found')
        get_emp_list()
    else:
        dept_tech = emp_list[row['TEAM'].lower()]
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
    print(form_data)
    response = requests.post('https://nsmart.nhealth-asia.com/MTDPDB01/pm/maintain07.php?' + a_href +
                             '&ccsForm=main_jobs%3AEdit', headers=headers, cookies=cookies, data=form_data, verify=False)
    response.encoding = "tis-620"
    soup = BeautifulSoup(response.text, "lxml")
    result_table = soup.find('table', {'class': 'Record'})
    if result_table == None:
        result_json = get_screen_shot(
            soup, 'close_pm_css.css', 'Fail to Close PM job')
        print('Fail to Close PM job')
        return
    result_tr = result_table.find('tr', {'class': 'Total'})
    result_td = result_tr.find('td')
    if result_td.text.strip() == 'PM status : Completed-send equipment back':
        return_json = get_screen_shot(
            soup, 'close_pm_css.css', result_td.text.strip())
        if self_call:
            return return_json
        print(result_td.text.strip())


def read_file():
    try:
        # read file

        with pd.ExcelWriter(os.path.join(root_dir, file_name).replace('//', '/'),
                            mode='a', engine='openpyxl', if_sheet_exists='replace') as writer:
            shutil.copy(os.path.join(root_dir, file_name).replace('//', '/'),
                        os.path.join(root_dir, 'backup' + file_name).replace('//', '/'))
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
            start = input("\033[1;35;40mเริ่มการแนบไฟล์: \033[1;33;40mใช่(Y) ไม่ใช่(N) : \033[1;36;40m")
            if (start == 'Y' or start == 'y'):
                init_text = pyfiglet.figlet_format("Start Attach File")
                print(init_text)
                for index, row in df.iterrows():
                    # print(row['CODE']+' '+str(index)+'/'+str(len(df)))
                    print('[green]{}[/green] / [blue]{}[/blue]'.format(
                        str(index+1),str(len(df)))
                    )
                    if row['CODE'] != 'nan' and row['STATUS'] != 'Decommission':
                        issave = False
                        if row['PM-RESULT'] != 'nan' and row['PM-CLOSED'] == 'nan':
                            print('[yellow]Close PM[/yellow] [blue]{}[/blue]'.format(row['CODE']))
                            # process_result = closePM(id, vender, date, safety, self_call=False)
                            process_result = closePM(row)
                            master_df.at[index, 'PM-CLOSED'] = 'success'
                            issave = True
                            # master_df.to_excel(writer, sheet_name=sheet_name, 2022    index=False)
                            # writer.save()

                        if row['CAL-RESULT'] != 'nan' and row['CAL-CLOSED'] == 'nan':
                            process_result = closeCAL(row)
                            master_df.at[index, 'CAL-CLOSED'] = 'success'
                            issave = True

                        if (issave and index != 0 and index % 20 == 0) or index == len(df)-1:
                            # if issave:
                            master_df.to_excel(
                                writer, sheet_name='Sheet1', index=False)
                            writer._save()
                            print("save success")
                            # pyautogui.alert('Close Jobs '+str(index)+' records')
            else:
                print("[red]Cancel[/red]")
                exit()
    except Exception as e:
        print(e)


load_empList()
load_tool_list()
read_file()
