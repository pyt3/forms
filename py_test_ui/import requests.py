import requests
import emoji
import json
import logging
from io import BytesIO

# Configure logging
logging.basicConfig(filename='log.txt', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

tg_api = '7681265177:AAFVGgh5lAzXRRfiole5ywOlY-CoEIOjEz4'
chat_id = '-4787318536'
tg_photo_url = f'https://api.telegram.org/bot{tg_api}/sendPhoto'
tg_url = f'https://api.telegram.org/bot{tg_api}/sendMessage'
msg = """:warning: ความเร่งด่วน"""
tg_msg = emoji.emojize(msg)
tg_photo_url = 'https://nsmart.nhealth-asia.com/MTDPDB01/img.php?files=201810221445230.DENTAL_XRAY.png'
tg_photo_file = requests.get(tg_photo_url)
if tg_photo_file.status_code == 200:
    # encode photo to utf-8
    tg_photo_file = BytesIO(tg_photo_file.content)
    tg_msg = tg_msg.encode('utf-8')
    tg_inline_button = [
        [{"text": emoji.emojize(":loudspeaker: อัพเดทงาน!!"),
        "url": f"https://liff.line.me/1661543046-a1pJexbX?jobid=xxx"}]
    ]
    try:
        res = requests.post(tg_photo_url, data={
            'chat_id': chat_id,
            'photo': tg_photo_file,
            'caption': tg_msg,
            'parse_mode': 'HTML',
            'reply_markup': json.dumps({'inline_keyboard': tg_inline_button})
        })
        logging.info(res.text)
    except Exception as e:
        logging.error(e)
        pass

else:
    print('Error: Cannot get photo file')
    logging.error('Error: Cannot get photo file')
    pass
# encode msg to utf-8
