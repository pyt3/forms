import csv
import datetime
import emoji
import firebase_admin
import inspect
import json
import logging
import os
import pyfiglet
import random
import requests
import sys
import threading
import time
import traceback
import tracemalloc
import urllib.parse
import urllib3
from alive_progress import alive_bar
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from firebase_admin import credentials, firestore
from google.api_core.exceptions import DeadlineExceeded
from pprint import pprint
from queue import Queue
from rich import print, pretty
from rich.console import Console
from rich.progress import Progress, TextColumn, BarColumn, TimeElapsedColumn, TimeRemainingColumn, track

# Configure logging
logging.basicConfig(
    filename='log.txt',
    filemode='a',
    format='%(asctime)s - %(levelname)s - %(module)s:%(funcName)s:%(lineno)d - %(message)s',
    level=logging.INFO
)

# Increase recursion limit for complex operations
sys.setrecursionlimit(50000)

# Start memory tracking
tracemalloc.start()

# Initialize Rich pretty printing
pretty.install()

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Get current directory path
__location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))

# Initialize global variables and constants
MAX_WORKORDER = 1000
TG_API = '7681265177:AAFVGgh5lAzXRRfiole5ywOlY-CoEIOjEz4'
REQUEST_TIMEOUT = 10
RETRY_DELAY_BASE = 2

# Create a session for reusing connections
session = requests.Session()
session.verify = False

# Load configuration
try:
    with open(os.path.join(__location__, "configTG.json")) as config:
        confdata = json.load(config)
        
    TG_CHAT_ID = confdata["TG_CHAT_ID"]
    cssd_chatid = TG_CHAT_ID.get("PYT3_CSSD", "")
    lab_chatid = TG_CHAT_ID.get("PYT3_LAB", "")
    repair_chatid = TG_CHAT_ID.get("REPAIR_CENTER", "")
    site_session_id = confdata["SESSION_ID"]
    sleep = confdata["SLEEP"]
except Exception as e:
    logging.error(f"Failed to load config: {e}")
    raise

# Thread locking
lock = threading.Lock()

# Initialize Firebase
try:
    cred = credentials.Certificate(os.path.join(__location__, "Admin_SDK.json"))
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    logging.error(f"Failed to initialize Firebase: {e}")
    raise

# Initialize state variables
current_site = ''
tg_site_chatid = ''
isCheckStock = False
lost_connection = False
cant_login = 0
skip_site = []
snaps = []
workorder_already_update = []
temp_waiting_update = []
enter_by_bme = []
remainWorks = []
alreadySent = {}
start_time = datetime.timestamp(datetime.now())

# Cache for results
connection_status_cache = {'time': 0, 'status': False}
sender_cache = {}
urgent_status_cache = {}

# HTTP headers
headers = {
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Referer": "https://nsmart.nhealth-asia.com/mtdpdb01/default.php",
    "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
}

# HTTP cookies
cookies = {
    "_ga": "GA1.1.409909798.1624509466",
    "_ga_L9CPT990SV": "GS1.1.1629863162.2.0.1629863162.0",
    "PHPSESSID": False
}

# Login data template
data = {
    "user": '',
    "pass": '',
    "Submit": "Submit",
    "Submit.x": "79",
    "Submit.y": "30",
}


def internet_connection():
    """Check if internet connection is available with caching for performance."""
    current_time = time.time()
    # Use cached result if less than 30 seconds old
    if current_time - connection_status_cache['time'] < 30:
        return connection_status_cache['status']
        
    start_check = time.time()
    try:
        session.get('https://www.google.com/', timeout=5)
        end_check = time.time()
        print(f'Internet Connection Time: {end_check - start_check:.2f}s')
        connection_status_cache['time'] = current_time
        connection_status_cache['status'] = True
        return True
    except requests.exceptions.RequestException:
        end_check = time.time()
        print(f'Internet Connection Time: {end_check - start_check:.2f}s')
        connection_status_cache['time'] = current_time
        connection_status_cache['status'] = False
        return False


def make_request(method, url, retries=5, **kwargs):
    """Centralized request function with retry logic and error handling."""
    retry_delay = RETRY_DELAY_BASE
    kwargs.setdefault('timeout', REQUEST_TIMEOUT)
    kwargs.setdefault('verify', False)
    
    if 'cookies' not in kwargs:
        kwargs['cookies'] = cookies
    
    if 'headers' not in kwargs:
        kwargs['headers'] = headers
    
    for attempt in range(retries):
        try:
            if method.lower() == 'get':
                response = session.get(url, **kwargs)
            else:
                response = session.post(url, **kwargs)
            
            response.raise_for_status()
            if url.endswith('.php'):
                response.encoding = "tis-620"
            return response
        except requests.exceptions.RequestException as e:
            if attempt < retries - 1:
                print(f"Request failed (attempt {attempt+1}/{retries}): {str(e)}")
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                print(f"Max retries reached for {url}")
                raise


def set_login(site, site_data):
    """Login to the site and save the session ID."""
    try:
        with requests.Session() as s:
            data = {
                "user": site_data["user"], 
                "pass": site_data["pass"], 
                "Submit": "Submit", 
                "Submit.x": "79", 
                "Submit.y": "30"
            }
            
            r = s.post(
                "https://nsmart.nhealth-asia.com/MTDPDB01/index.php",
                data=data, 
                headers=headers, 
                verify=False, 
                timeout=REQUEST_TIMEOUT
            )

            site_session_id[site] = s.cookies["PHPSESSID"]
            # Save session id to config
            confdata["SESSION_ID"][site] = s.cookies["PHPSESSID"]
            with open(os.path.join(__location__, "configTG.json"), 'w') as f:
                json.dump(confdata, f)

            cookies["PHPSESSID"] = site_session_id[site]
    except Exception as e:
        print(e)
        print("[red]No Internet Connection[/red]")
        time.sleep(5)
        return set_login(site, site_data)


def clean_text(elem):
    """Extract text from HTML elements with proper handling of line breaks."""
    text = ''
    for e in elem.descendants:
        if isinstance(e, str):
            text += e.strip()
        elif e.name == 'br' or e.name == 'p':
            text += '\n'
    return text


def getSender(order):
    """Get sender information with caching for performance."""
    # Check cache first
    if order in sender_cache:
        return sender_cache[order]
        
    try:
        url = f"https://nsmart.nhealth-asia.com/mtdpdb01/jobs/REQ_02.php?req_no={order}"
        response = make_request('get', url)
        detailsoup = BeautifulSoup(response.text, "lxml")
        sender = detailsoup.find("input", {"name": "caller"})["value"]
        # Cache the result
        sender_cache[order] = sender
        return sender
    except Exception as e:
        print(f"Error getting sender: {e}")
        time.sleep(2)
        return getSender(order)


def getUrgentStatus(req_no):
    """Get urgent status information with caching for performance."""
    # Check cache first
    if req_no in urgent_status_cache:
        return urgent_status_cache[req_no]
        
    try:
        url = f"https://nsmart.nhealth-asia.com/mtdpdb01/jobs/REQ_02.php?req_no={req_no}"
        response = make_request('get', url)
        soup = BeautifulSoup(response.text, "lxml")
        
        
        room = soup.find('input', {'name': "roomno"}).get("value", "")
        sender = soup.find('input', {'name': "caller"}).get("value", "")
        coop = soup.find('input', {'name': "coop_name"}).get("value", "")
        position = soup.find('input', {'name': "req_position"}).get("value", "")
        building = soup.find('input', {'name': "bname"}).get("value", "")
        
        if len(room) == 0:
            room = "---"
            
        radio = soup.findAll('input', attrs={'name': 'urgentstat'})
        status = ''
        for r in radio:
            if r.has_attr('checked'):
                val = r.get('value')
                if val == '1':
                    status = 'ปกติ (Normal)'
                elif val == '2':
                    status = 'ด่วน (Urgent)'
                elif val == '3':
                    status = 'ฉุกเฉิน (Emergency)'
                    
        result = {
            'status': status, 
            'room': room, 
            'sender': sender, 
            'coop': coop, 
            'position': position, 
            'building': building
        }
        
        # Cache the result
        urgent_status_cache[req_no] = result
        return result
    except Exception as e:
        print(f"Error getting urgent status: {e}")
        time.sleep(5)
        return getUrgentStatus(req_no)


def sendTelegramDev(msg, isSilent=False):
    """Send a Telegram message to the developer."""
    chatid = '1354847893'
    try:
        tg_url = f'https://api.telegram.org/bot{TG_API}/sendMessage'
        # Convert msg to string if it's not already a string
        if not isinstance(msg, (str, bytes)):
            msg = str(msg)
            
        tg_response = handle_tg_request(
            tg_url,
            params={
                'chat_id': chatid, 
                'text': msg, 
                'parse_mode': 'HTML'
            }
        )
        return True
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")
        time.sleep(5)
        return False


def sendTelegramStart():
    """Send a service start notification via Telegram."""
    chatid = '1354847893'
    try:
        tg_url = f'https://api.telegram.org/bot{TG_API}/sendMessage'
        tg_msg = emoji.emojize(
            ":check_mark_button: Service Starting...\n\n:check_mark_button: Bot is running..."
        )
        handle_tg_request(
            tg_url,
            params={
                'chat_id': chatid, 
                'text': tg_msg, 
                'parse_mode': 'HTML'
            }
        )
        return True
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")
        return False


def sendTelegramRecieve(detail, reciever, code, name):
    """Send a notification that a job has been received."""
    msg = f"""
งานรหัส {code}
เครื่อง {name}

{detail} 

:check_mark_button::check_mark_button: รับงานแล้ว :check_mark_button::check_mark_button:

โดย: {reciever}"""
    
    # First convert to emojis, then to string if needed
    msg_with_emoji = emoji.emojize(msg)
    
    # Make sure we're using a string for the 'text' parameter, not bytes
    if isinstance(msg_with_emoji, bytes):
        msg_with_emoji = msg_with_emoji.decode('utf-8')
    
    chatid = '-1002697367039'
    
    try:
        tg_url = f'https://api.telegram.org/bot{TG_API}/sendMessage'
        # Use handle_tg_request instead of make_request to get consistent type handling
        handle_tg_request(
            tg_url,
            params={
                'chat_id': chatid, 
                'text': msg_with_emoji, 
                'parse_mode': 'HTML'
            }
        )
        return True
    except Exception as e:
        print(f"Failed to send Telegram notification: {e}")
        time.sleep(5)
        return False


def handle_tg_request(url, params, files=None):
    """Handle Telegram API requests with migration handling and retries."""
    max_retries = 5
    retry_delay = RETRY_DELAY_BASE
    
    # Ensure all values in params are strings (not booleans or other types)
    for key, value in params.items():
        if not isinstance(value, (str, bytes)) and key != 'chat_id':
            params[key] = str(value)
    
    for attempt in range(max_retries):
        try:
            if files:
                response = requests.post(url, data=params, files=files, timeout=REQUEST_TIMEOUT)
            else:
                response = requests.post(url, data=params, timeout=REQUEST_TIMEOUT)
                
            response.raise_for_status()
            
            # Check for chat migration
            if (response.status_code == 400 and 
                'parameters' in response.json() and 
                'migrate_to_chat_id' in response.json()['parameters']):
                
                new_chat_id = response.json()['parameters']['migrate_to_chat_id']
                params['chat_id'] = new_chat_id
                # Update config with new chat_id
                site = params.get('site', '').upper()
                if site:
                    TG_CHAT_ID[site] = new_chat_id
                    confdata["TG_CHAT_ID"][site] = new_chat_id
                    with open(os.path.join(__location__, "configTG.json"), 'w') as f:
                        json.dump(confdata, f)
                        
                # Retry with new chat_id
                if files:
                    response = requests.post(url, data=params, files=files)
                else:
                    response = requests.post(url, data=params)
                response.raise_for_status()
                
            return response
            
        except Exception as e:
            print(f"Request failed (attempt {attempt+1}/{max_retries}): {str(e)}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                raise


def sendTelegramThread(chatid, payload):
    """Send a Telegram message in a separate thread."""
    if chatid == '':
        return
        
    chatid = str(chatid)
    try:
        opt = {'chat_id': chatid, 'parse_mode': 'HTML'}
        if payload['has_inline']:
            opt['reply_markup'] = json.dumps(
                {'inline_keyboard': [
                    [{"text": emoji.emojize(payload['status_text']),
                     "url": f"https://liff.line.me/1661543046-a1pJexbX?jobid={payload['reqOrderNum']}"}]
                ]}
            )

        tg_photo_url = f'https://api.telegram.org/bot{TG_API}/sendPhoto'
        tg_url = f'https://api.telegram.org/bot{TG_API}/sendMessage'
        
        # Send message with appropriate method
        if payload['img'] is not None:
            # Try to send as photo with caption
            try:
                opt['caption'] = payload['message']
                img_response = requests.get(payload['img'])
                img_response.raise_for_status()
                
                tg_response = handle_tg_request(
                    tg_photo_url, 
                    opt, 
                    {'photo': img_response.content}
                )
            except Exception:
                # Fallback to text message if photo fails
                opt.pop('caption', None)
                opt['text'] = payload['message']
                tg_response = handle_tg_request(tg_url, opt)
        else:
            # Send as regular text message
            opt['text'] = payload['message']
            tg_response = handle_tg_request(tg_url, opt)

        if tg_response.status_code == 200:
            message_id = tg_response.json()['result']['message_id']
            if payload['reqOrderNum'] != '':
                doc_ref = db.collection(u'jobdata').document(payload['reqOrderNum'])
                doc = doc_ref.get()
                data_obj = {
                    u'code': payload['ncode'],
                    u'site': payload['site'],
                    u'job_no': payload['reqOrderNum'],
                    u'detail': payload['detail'],
                    u'building': payload['building'],
                    u'room': payload['room'],
                    u'dept': payload['dept'],
                    u'urgent': payload['urgent'],
                    u'sender': payload['sender'],
                    u'coop': payload['coop'],
                    u'ename': payload['ename'],
                    u'date': payload['date'],
                    u'message_id': message_id,
                }
                if payload['img'] != '':
                    data_obj['image'] = payload['img']

                if doc.exists:
                    doc_ref.update(data_obj)
                else:
                    doc_ref.set(data_obj)
    except Exception as e:
        print(f"Error in sendTelegramThread: {e}")
        if 'tg_response' in locals():
            print(tg_response.text)
            sendTelegramDev(tg_response.text)
        if payload.get('img'):
            sendTelegramDev(payload['img'])


def sendNotify(reqOrderNum, date, dept, detail, building, img, urgent, sender, coop, ename, ncode, room, position, site, isReceive=False):
    """Send a notification about a new job."""
    global alreadySent
    
    # Acquire lock with timeout to prevent deadlocks
    if not lock.acquire(timeout=100):
        print("Failed to acquire lock for sendNotify")
        return
        
    try:
        # Get sender if needed
        if not sender or sender == '':
            sender = getSender(reqOrderNum)
            
        # Prepare message based on ncode
        if len(ncode) == 0:
            msg = f"""<b>Request Order: {reqOrderNum}</b>

<b>:backhand_index_pointing_right: อาการเสีย:</b> 
<blockquote expandable>
<b>{detail}</b>

</blockquote>
<b>:office_building: แผนก(เครื่อง):</b> {dept}

<b>:backhand_index_pointing_right: ผู้แจ้ง:</b> {sender}

<b>:backhand_index_pointing_right: ตำแหน่ง:</b> {position}

<b>:backhand_index_pointing_right:</b> แจ้งซ่อมเครื่องมือไม่ระบุรหัส

<b>:backhand_index_pointing_right: ห้อง:</b> {room}

<b>:spiral_calendar: ในวันที่:</b> {date}

<b>:warning: ความเร่งด่วน:</b> {urgent}
"""
        else:
            msg = f"""<b>Request Order: {reqOrderNum}</b>

<b>:backhand_index_pointing_right: อาการเสีย:</b>
<blockquote expandable>
<b>{detail}</b>

</blockquote>
<b>:office_building: แผนก(เครื่อง):</b> {dept}

<b>:backhand_index_pointing_right: ผู้แจ้ง:</b> {sender}  {coop}

<b>:backhand_index_pointing_right: ตำแหน่ง:</b> {position}

<b>:backhand_index_pointing_right: แจ้งซ่อม:</b> {ename}

<b>:backhand_index_pointing_right: รหัส:</b> {ncode}

<b>:backhand_index_pointing_right: ห้อง:</b> {room}

<b>:spiral_calendar: ในวันที่:</b> {date}

<b>:warning: ความเร่งด่วน:</b> {urgent}
"""

        # Determine which chat groups should receive the message
        group_tg_chatid = []
        print(site)
        tg_site_chatid = confdata["TG_CHAT_ID"][site]
        
        status_text = ':hourglass_not_done: รอรับงาน!!' if not isReceive else ':OK_hand: รับงานแล้ว!!'
        
        # Add site prefix for non-PYT3 sites
        if site == 'PYT3':
            dept_lowercase = dept.lower().strip()
            if dept_lowercase == 'central sterile supply (cssd)':
                group_tg_chatid = [tg_site_chatid, cssd_chatid]
            elif dept_lowercase.find('laboratory') > -1 and dept_lowercase.find('gastrointestinal') == -1:
                group_tg_chatid = [tg_site_chatid, lab_chatid]
            else:
                group_tg_chatid = [tg_site_chatid]
        else:
            msg = site + '\n' + msg
            group_tg_chatid = [tg_site_chatid]
            
        # Emojify the message
        tg_msg = emoji.emojize(msg)
        tg_msg = tg_msg.encode('utf-8')

        # Add to repair chat if needed
        if detail.lower().startswith('[repair]'):
            group_tg_chatid.append(repair_chatid)

        # Prepare threads for sending messages
        threads = []
        for idx, chatid in enumerate(group_tg_chatid):
            payload = {
                "message": tg_msg,
                "site": site,
                "status_text": status_text,
                "ncode": ncode,
                "reqOrderNum": reqOrderNum,
                "dept": dept,
                "urgent": urgent,
                "sender": sender,
                "building": building,
                "room": room,
                "coop": coop,
                "ename": ename,
                "date": date,
                "detail": detail
            }
            
            # Add image if available
            if img and img != '':
                payload["img"] = img
            else:
                payload["img"] = None
                
            # Only first recipient (or repair chats) get inline buttons
            payload["has_inline"] = (idx == 0 or detail.lower().startswith('[repair]'))
            
            # Skip test messages
            if coop.lower() != "test":
                t = threading.Thread(target=sendTelegramThread, args=(chatid, payload))
                threads.append(t)
                
        # Start threads with a small delay to avoid rate limiting
        for t in threads:
            t.start()
            time.sleep(0.5)
            
        # Wait for all threads to complete
        for t in threads:
            t.join()
            
        # Update tracking of sent messages
        if site.upper() not in alreadySent:
            alreadySent[site.upper()] = []
            
        alreadySent[site.upper()].append(reqOrderNum)
        alreadySent[site.upper()] = list(set(alreadySent[site.upper()]))

        # Prevent too many stored messages
        if len(alreadySent[site.upper()]) > MAX_WORKORDER:
            alreadySent[site.upper()] = alreadySent[site.upper()][500:]
            
        # Save the updated list to disk
        with open(os.path.join(__location__, "alreadySent.json"), 'w') as f:
            json.dump(alreadySent, f)
            
    finally:
        # Always release the lock
        lock.release()


def updateWorkOrder(jobno, workorder, reciever, code, job_status, signature):
    """Update the status of a work order in Firestore."""
    # Skip if already updated with same status
    global batch 
    global workorder_already_update
    global temp_waiting_update
    if any(d['workorder'] == workorder and d['status'] == job_status and d['signature'] == signature for d in workorder_already_update) or jobno == '':
        return

    try:
        doc_ref = db.collection(u'jobdata').document(jobno)
        doc = doc_ref.get()
        
        # Prepare data to update
        d = {
            u'workorder': workorder,
            u'timestamp': firestore.SERVER_TIMESTAMP,
            u'reciever': reciever,
            u'status': job_status
        }
        
        if signature:
            d['signature'] = signature
            
        # Determine status text and button text for Telegram
        job_status_text = job_status
        inline_keyboard_text = ':hourglass_not_done: รอรับงาน!!'
        
        if job_status == 'Waiting':
            job_status_text = '[gray]Waiting[/gray]'
            inline_keyboard_text = ':OK_hand: รับงานแล้ว!!'
        elif job_status == 'In process':
            job_status_text = '[yellow]In Process[/yellow]'
            inline_keyboard_text = ':hourglass_not_done: In Process!!'
        elif job_status == 'Return equipment back':
            job_status_text = '[green]Return equipment back[/green]'
            inline_keyboard_text = ':check_mark_button: Return equipment back!!'
        elif job_status == 'Cancel':
            job_status_text = '[red]Cancel[/red]'
            inline_keyboard_text = ':cross_mark: Cancel!!'
        elif job_status == 'Waiting Quatation':
            job_status_text = '[blue]Waiting Quatation[/blue]'
            inline_keyboard_text = ':hourglass_not_done: Waiting Quatation!!'
        elif job_status == 'Waiting for spare part':
            job_status_text = '[blue]Waiting for spare parts[/blue]'
            inline_keyboard_text = ':hourglass_not_done: Waiting for spare part!!'
        elif job_status == 'Send Outsource':
            job_status_text = '[blue]Send outsource[/blue]'
            inline_keyboard_text = ':hourglass_not_done: Send outsource!!'
        elif job_status == 'Dispose':
            job_status_text = '[blue]Dispose[/blue]'
            inline_keyboard_text = ':cross_mark: Dispose!!'
            
        if doc.exists:
            fb_data = doc.to_dict()
            message_id = fb_data.get('message_id')
            # Update Telegram message if status changed
            if message_id and (fb_data.get('status') is None or fb_data.get('status') != job_status):
                try:
                    tg_url = f'https://api.telegram.org/bot{TG_API}/editMessageReplyMarkup'
                    chat_id = confdata['TG_CHAT_ID'][current_site]
                    
                    tg_data = {
                        'chat_id': chat_id,
                        'message_id': message_id,
                        'reply_markup': json.dumps(
                            {'inline_keyboard': [
                                [{"text": emoji.emojize(inline_keyboard_text),
                                  "url": f"https://liff.line.me/1661543046-a1pJexbX?jobid={fb_data.get('job_no')}"}]
                            ]}
                        ),
                    }
                    res = requests.post(tg_url, data=tg_data)
                    res.raise_for_status()
                except Exception as e:
                    # Handle message not found errors
                    if 'res' in locals() and hasattr(res, 'json'):
                        response_json = res.json()
                        if 'description' in response_json:
                            description = response_json.get('description')
                            if description == 'Bad Request: message to edit not found':
                                print("Message not found, removing message_id")
                                # If the message was not found, remove the message_id from the document
                                update_data = {u'message_id': firestore.DELETE_FIELD}
                                batch.update(doc_ref, update_data)
                            sendTelegramDev(description)
                    else:
                        sendTelegramDev(str(e))
                        
            # Update the document
            print(f'Updating workorder: {workorder} status: {job_status_text}')
            d['status'] = job_status
            batch.update(doc_ref, d.copy())
            temp_waiting_update.append(
                {'workorder': workorder, 'status': job_status, 'signature': signature})
        else:
            batch.set(doc_ref, d.copy())
            temp_waiting_update.append(
                {'workorder': workorder, 'status': 'New'})

    except Exception as e:
        logging.exception(e)
        err = traceback.format_exc()
        timestamp = datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
        err = timestamp + '\n' + err
        
        # Split long error messages for Telegram
        err_parts = [err[i:i+1000] for i in range(0, len(err), 1000)]
        for er in err_parts:
            sendTelegramDev(er)
        # Re-raise the exception
        raise e


def checkJobsRecieve(site_data):
    """Check and handle jobs that have been received."""
    global batch
    global cookies
    global headers
    global alreadySent
    global workorder_already_update
    global temp_waiting_update
    
    batch = db.batch()
    
    try:
        # Get the list of jobs
        url = "https://nsmart.nhealth-asia.com/MTDPDB01/jobs/BJOBA_01A.php"
        response = make_request('get', url, data=site_data)
        
        soup = BeautifulSoup(response.text, "lxml")
        table = soup.find("table", {"class", "Grid"})
        
        if table is None:
            print("No table found, re-login...")
            site_session_id.pop(current_site)
            set_login(current_site, site_data)
            return False

        # Process each row in the table
        tr = table.findAll("tr")
        for row in tr:
            # Skip header and footer rows
            if not (row.has_attr('class') and len(row["class"]) > 0 and 
                    row["class"][0] != "Caption" and row["class"][0] != "Footer"):
                continue
                
            td = row.findAll("td")
            
            # Extract job information from the row
            link = td[3].find('a').get('href')
            link_params = link.split('?')[1].split('&')
            
            jobno = next((param.split('=')[1] for param in link_params if param.startswith('req_no')), '')
            workorder = next((param.split('=')[1] for param in link_params if param.startswith('jobno')), '')
            
            code = td[4].text.strip()
            name = td[5].text.strip()
            detail = td[10].text.strip()
            reciever = td[14].text.strip()
            enter_by = td[16].text.strip()
            job_status = td[12].text.strip()
            
            # Get signature if available
            signature = None
            if td[15].find('img'):
                signature_src = td[15].find('img').get('src')
                if signature_src != '../images/blank.gif':
                    signature = "https://nsmart.nhealth-asia.com/MTDPDB01" + signature_src.replace('..', '')
            
            # Update work order in database
            updateWorkOrder(jobno, workorder, reciever, code, job_status, signature)
            
            # Send notification if this is in the remaining works list
            if detail in remainWorks:
                t = threading.Thread(target=sendTelegramRecieve, args=(detail, reciever, code, name))
                t.start()
                remainWorks.remove(detail)
                
            # Handle jobs that haven't been sent before
            if current_site.upper() not in alreadySent:
                alreadySent[current_site.upper()] = []
                with open(os.path.join(__location__, "alreadySent.json"), 'w') as f:
                    json.dump(alreadySent, f)
                    
            if jobno not in alreadySent[current_site.upper()]:
                date = td[2].text.strip()
                dept = td[9].text.strip()
                ename = name
                ncode = code
                img = ''
                site = current_site
                building = ''
                room = ''
                urgent = 'key by bme'
                sender = f'BME:{reciever}'
                coop = ''
                position = ''

                # Get image if available
                if td[0].find('img'):
                    img = "https://nsmart.nhealth-asia.com/MTDPDB01/img.php?files=" + \
                          urllib.parse.quote(td[0].find('img')["src"].split("=")[-1])
                          
                # Get additional details if not entered by BME
                if enter_by.lower() != 'bme':
                    status = getUrgentStatus(jobno)
                    room = status["room"]
                    sender = status["sender"]
                    coop = status["coop"]
                    urgent = status["status"]
                    position = status["position"]
                    building = status["building"]
                    
                # Send notification about the job
                t = threading.Thread(target=sendNotify, args=(
                    jobno, date, dept, detail, building, img, urgent, sender, 
                    coop, ename, ncode, room, position, site, True))
                t.start()
                
        # Commit batch updates to Firestore
        batch.commit()
        
        # Update tracking of already processed work orders
        workorder_already_update.extend(temp_waiting_update)
        temp_waiting_update.clear()
        
        return True
        
    except Exception as e:
        temp_waiting_update.clear()
        logging.exception(e)
        err = traceback.format_exc()
        timestamp = datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
        err = timestamp + '\n' + err
        
        # Split long error messages for Telegram
        err_parts = [err[i:i+1000] for i in range(0, len(err), 1000)]
        for er in err_parts:
            sendTelegramDev(er)
            
        return False


def main(site_data):
    """Main function to process jobs for a site."""
    global cookies
    global headers
    global alreadySent
    global cant_login
    global skip_site
    
    # Skip sites that have been marked to skip
    if current_site in skip_site:
        return True
        
    # Check internet connection
    if not internet_connection():
        print("[red]No Internet Connection[/red]")
        time.sleep(10)
        return False
        
    try:
        # Log current time and site
        now = datetime.now()
        current_time = now.strftime("%d/%m/%Y, %H:%M:%S")
        print(f'[bold yellow]{current_site}[/bold yellow]')
        print(f"Current Time = {current_time}")
        print("Checking data...")
        
        # Get the list of jobs
        try:
            url = "https://nsmart.nhealth-asia.com/mtdpdb01/jobs/BJOBA_01online.php"
            response = make_request('get', url, data=site_data)
        except requests.exceptions.RequestException as e:
            print(e)
            time.sleep(5)
            return False

        soup = BeautifulSoup(response.text, "lxml")
        table = soup.find("table", {"class", "Grid"})
        
        # Handle login issues
        if table is None:
            print("No table found, re-login...")
            site_session_id.pop(current_site)
            set_login(current_site, site_data)
            cant_login += 1
            
            # Skip site after too many login failures
            if cant_login > 5:
                cant_login = 0
                skip_site.append(current_site)
                sendTelegramDev(f"Skip site: {current_site}")
                return True
            else:
                sendTelegramDev(f"No table found, re-login... {current_site}")
                return False
                
        # Process each job in the table
        tr = table.findAll("tr")
        iswork = False
        
        for row in tr:
            # Only process asset/general rows
            if not (row.has_attr('class') and len(row["class"]) > 0 and 
                   (row["class"][0] == "RowAsset" or row["class"][0] == "RowGeneral")):
                continue
                
            td = row.findAll("td")
            
            # Extract job information
            reqOrderNum = td[3].text.strip()
            date = td[6].text.strip()
            ncode = td[9].text.strip()
            sender = td[13].text.strip()
            coop = td[14].text.strip()
            dept = td[8].text.strip()
            ename = td[10].text.strip()
            detail = clean_text(td[11])
            building = td[12].text.strip()
            
            # Initialize site's already sent list if needed
            if alreadySent.get(current_site.upper()) is None:
                alreadySent[current_site.upper()] = []
                
            # Skip already processed jobs
            if reqOrderNum in alreadySent[current_site.upper()]:
                print(f"Already sent: {reqOrderNum}")
                continue

            # Get additional details
            img = ""
            getExtra = getUrgentStatus(reqOrderNum)
            room = getExtra["room"]
            position = getExtra["position"]
            urgent = getExtra["status"]
            sender = getExtra["sender"]
            coop = getExtra["coop"]
            
            # Get image if available
            if row["class"][0] == "RowAsset" and td[2] is not None and td[2].find("img") is not None:
                img = (
                    "https://nsmart.nhealth-asia.com/MTDPDB01/img.php?files=" +
                    urllib.parse.quote(td[2].find("img")["src"].split("=")[-1])
                )
                
            # Add to list of jobs to track
            remainWorks.append(detail)
            site = current_site
            
            # Send notification in a separate thread
            t = threading.Thread(target=sendNotify, args=(
                reqOrderNum, date, dept, detail, building, img, urgent, 
                sender, coop, ename, ncode, room, position, site))
            t.start()
            
            iswork = True

        if not iswork:
            print("No New work order...")

        # Check for jobs that have been received
        check_job_result = checkJobsRecieve(site_data)
        retry_count = 0
        while not check_job_result and retry_count < 3:
            print("Re-trying check jobs receive...")
            retry_count += 1
            check_job_result = checkJobsRecieve(site_data)
            
        cant_login = 0
        return True
        
    except Exception as e:
        logging.exception(e)
        err = traceback.format_exc()
        timestamp = datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
        err = timestamp + '\n' + err
        
        # Split long error messages for Telegram
        err_parts = [err[i:i+1000] for i in range(0, len(err), 1000)]
        for er in err_parts:
            sendTelegramDev(er)
            
        # Re-raise the exception
        raise e


def set_interval(sec):
    """Process all sites at regular intervals."""
    global cookies
    global current_site
    global tg_site_chatid

    # Check internet connection
    if not internet_connection():
        print("[red]No Internet Connection[/red]")
        time.sleep(10)
        return set_interval(sec)

    # Process each site
    for site in confdata['AUTHORIZE']:
        print('.')
        print('.')
        data["user"] = confdata['AUTHORIZE'][site]['USERNAME']
        data["pass"] = confdata['AUTHORIZE'][site]['PASSWORD']
        site_data = data
        
        # Set up session
        if site not in site_session_id:
            set_login(site, site_data)
        else:
            cookies["PHPSESSID"] = site_session_id[site]

        tg_site_chatid = confdata['TG_CHAT_ID'][site]
        current_site = site
        
        # Process the site, retrying if needed
        site_result = main(site_data)
        retry_count = 0
        while not site_result and retry_count < 3:
            print("Re-trying site processing...")
            retry_count += 1
            site_result = main(site_data)

    # Clear screen and show countdown timer
    os.system('cls' if os.name == 'nt' else 'clear')
    
    console = Console()
    total_sleep = sleep  # Use the sleep value from config

    print(f"Next scan in {total_sleep} seconds...")
    
    with Progress(
        TextColumn("[bold blue]{task.description}"),
        BarColumn(bar_width=50, complete_style="green", finished_style="bright_green"),
        TextColumn("[bold cyan]{task.completed}/{task.total}"),
        TextColumn("[yellow]•"),
        TimeElapsedColumn(),
        TextColumn("[yellow]•"),
        TimeRemainingColumn(),
        console=console,
        expand=True
    ) as progress:
        task = progress.add_task("[bold white]Waiting for next scan...", total=total_sleep)
        while not progress.finished:
            time.sleep(1)
            progress.update(task, advance=1)


def main_thread():
    """Main thread function."""
    global alreadySent
    
    # Display welcome banner
    init_text = pyfiglet.figlet_format("BME   Bot   Notify")
    print(init_text)
    
    # Load previously sent jobs
    try:
        with open(os.path.join(__location__, "alreadySent.json")) as reader:
            alreadySent = json.load(reader)
    except Exception as e:
        print(f"Error loading alreadySent.json: {e}")
        alreadySent = {}
        with open(os.path.join(__location__, "alreadySent.json"), 'w') as f:
            json.dump(alreadySent, f)
        print("Created new alreadySent.json file")
        
    # Send startup notification
    print("Service Starting...")
    send_start = sendTelegramStart()
    while not send_start:
        time.sleep(5)
        send_start = sendTelegramStart()

    # Main processing loop
    try:
        while True:
            set_interval(sleep)
    except Exception as e:
        # Save state before exiting
        with open(os.path.join(__location__, "alreadySent.json"), 'w') as f:
            json.dump(alreadySent, f)
            
        # Log the error
        logging.exception(e)
        err = traceback.format_exc()
        timestamp = datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
        err = timestamp + '\n' + err
        
        # Split long error messages for Telegram
        err_parts = [err[i:i+1000] for i in range(0, len(err), 1000)]
        for er in err_parts:
            sendTelegramDev(er)
            
        # Re-raise the exception
        raise e


def restart_program():
    """Restart the current program."""
    python = sys.executable
    os.execl(python, python, *sys.argv)


def watchdog():
    """Monitor the main thread and restart if it crashes."""
    while True:
        time.sleep(10)
        if not main_thread_thread.is_alive():
            sendTelegramDev("Service is dead, restarting")
            restart_program()


if __name__ == "__main__":
    # Start the main thread
    main_thread_thread = threading.Thread(target=main_thread)
    main_thread_thread.daemon = True  # Allow the program to exit if only daemon threads remain
    main_thread_thread.start()
    
    # Run the watchdog
    watchdog()
