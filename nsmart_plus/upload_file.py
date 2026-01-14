import os
import re
import sys
from utils import get_script_directory
from browser import check_default_browser
from browser import create_browser_driver
from browser import go_to_page
from browser import get_asset_files
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from rich.align import Align
from rich.panel import Panel
from rich.console import Console
import time
import pyautogui

def nsmartPlusFileUpload(show_browser=False, config_manager=None):
    """
    Upload files to NSmart+ system.
    
    Args:
        show_browser (bool): Whether to show the browser window
        config_manager: ConfigManager instance for credentials
    """
    def wait_for_all_overlays_gone(driver, timeout=10):
        # Wait until no elements with that class are visible on the entire page
        WebDriverWait(driver, timeout).until(
            lambda d: len([el for el in d.find_elements(By.CLASS_NAME, 'overlay') if el.is_displayed()]) == 0
        )
    console = Console()
    dir_path = get_script_directory()
    
    # Get source folder from config or use default
    if config_manager:
        source_folder = config_manager.get_source_folder()
        if not source_folder:
            source_folder = os.path.join(dir_path, 'invent')
    else:
        source_folder = os.path.join(dir_path, 'invent')
    
    # check if source folder exists
    if not os.path.exists(source_folder):
        console.print(f"[red]❌ Source folder does not exist: {source_folder}[/red]")
        return False
    
    # check if source folder is empty
    if not any(os.scandir(source_folder)):
        console.print(f"[red]❌ Source folder is empty: {source_folder}[/red]")
        return False
    
    
    # Load uploaded IDs from log file
    upload_log_path = os.path.join(dir_path, 'uploaded_ids.log')
    uploaded_ids = set()
    if os.path.exists(upload_log_path):
        with open(upload_log_path, 'r', encoding='utf-8') as f:
            for line in f:
                uploaded_ids.add(line.strip())

    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.common.exceptions import TimeoutException
        from selenium.common.exceptions import StaleElementReferenceException
    except ImportError as e:
        console.print(f"[red]❌ Selenium not installed or import error: {e}[/red]")
        console.print("[yellow]Please install selenium: pip install selenium[/yellow]")
        return False

    default_browser = check_default_browser()
    if not default_browser:
        console.print("[red]❌ Could not determine default browser. Copying script to clipboard instead.[/red]")
        console.print(Panel(
            Align.center("[bold green]✓ Script copied to clipboard! ✓[/bold green]\n"
                         "[italic yellow]Paste it in the browser console on the ECERT page[/italic yellow]"),
            title="[bold white]Download Tool Ready[/bold white]",
            border_style="green",
            padding=(1, 2)
        ))
        input("\nPress Enter to continue...")
        return False

    driver = create_browser_driver(default_browser, console, show_browser=show_browser, config_manager=config_manager)
    if not driver:
        console.print("[red]❌ Failed to create browser driver. Copying script to clipboard instead.[/red]")
        input("\nPress Enter to continue...")
        return False

    try:
        domain = "https://nsmartplus.nhealth-asia.com/"
        driver = go_to_page(driver, "https://nsmartplus.nhealth-asia.com/serviceportal/asset-management-list", console, 'nsmart+', config_manager)
        if not driver:
            console.print("[red]❌ Browser driver is not available. Exiting.[/red]")
            return False

        # open_serch_panel_btn = WebDriverWait(driver, 2000).until(
        #     EC.presence_of_element_located((By.XPATH, '//*[@id="pv_id_3_header"]'))
        # )
        
        # remove Class sticky
        WebDriverWait(driver, 2000).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'nhealth-sidebar-layout-header'))
        )
       
        for root, dirs, files in os.walk(source_folder):
            for dir_name in dirs:
                id = dir_name.strip()
                if id in uploaded_ids:
                    console.print(f"[cyan]Skipping already uploaded asset ID: {id}[/cyan]")
                    continue
                console.print(f"[yellow]Uploading files for asset ID: {id}[/yellow]")
                WebDriverWait(driver, 10000).until(
                    EC.presence_of_element_located((By.XPATH, '//*[@id="nhealth-sidebar-layout"]/div[2]/div/div[1]/div/div[2]/div[1]/div[2]'))
                )
                driver.find_element(By.XPATH, '//*[@id="nhealth-sidebar-layout"]/div[2]/div/div[1]/div/div[2]/div[1]/div[2]').click()
                WebDriverWait(driver, 5000).until(
                    EC.element_to_be_clickable((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[2]/div[2]/div/div/div[1]/div/div/div[2]/div[2]/div/div/input'))
                )
                driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[2]/div[2]/div/div/div[1]/div/div/div[2]/div[2]/div/div/input').clear()
                driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[2]/div[2]/div/div/div[1]/div/div/div[2]/div[2]/div/div/input').send_keys(id)
                driver.execute_script("arguments[0].scrollIntoView(true);", driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[2]/div[2]/div/div/div[1]/div/div/div[4]/div[3]/div/div/input'))
                time.sleep(1)  # wait for a second to ensure the element is in view
                driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[2]/div[2]/div/div/div[2]/div/button[1]').click()
                print("Searching for asset...")
                table_row= WebDriverWait(driver, 2000).until(
                    EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div/div/div/div/div/div[1]/div[2]/table/tbody/tr'))
                )
                if table_row.get_attribute('data-pc-section') == 'emptymessagecell':
                    console.print(f"[red]❌ No results found for {id}[/red]")
                else:
                    for retry in range(3): 
                        try:
                            driver.execute_script("arguments[0].classList.remove('sticky');", driver.find_element(By.CLASS_NAME, 'nhealth-sidebar-layout-header'))
                            # open asset details
                            WebDriverWait(driver, 2000).until(
                                EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div/div/div/div/div/div[1]/div[2]/table/tbody/tr/td[1]/div/button[1]/span[1]'))
                                )
                            
                            # scroll to the element before clicking
                            element = driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div/div/div/div/div/div[1]/div[2]/table/tbody/tr/td[1]/div/button[1]/span[1]')
                            driver.execute_script("arguments[0].scrollIntoView(true);", element)
                            time.sleep(1)  # wait for a second to ensure the element is in view  
                            wait_for_all_overlays_gone(driver, timeout=120)
                            driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div/div/div/div/div/div[1]/div[2]/table/tbody/tr/td[1]/div/button[1]/span[1]').click()
                            time.sleep(1)
                             # change status to Avtive
                            WebDriverWait(driver, 5000).until(
                                EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div/div[5]/div[1]/div/div/div'))
                            )
                            driver.execute_script("arguments[0].classList.remove('sticky');", driver.find_element(By.CLASS_NAME, 'nhealth-sidebar-layout-header'))
                            time.sleep(.2)
                            driver.execute_script("""
                                var element = arguments[0];
                                var headerOffset = 100;
                                var elementPosition = element.getBoundingClientRect().top;
                                var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            
                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: "smooth"
                                });
                            """, driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div/div[5]/div[1]/div/div/div'))
                            wait_for_all_overlays_gone(driver, timeout=120)
                            time.sleep(.5)  # wait for a second to ensure the element is in view
                            driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div/div[5]/div[1]/div/div/div').click()
                            
                            WebDriverWait(driver, 5000).until(
                                EC.presence_of_element_located((By.ID, driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div/div[5]/div[1]/div/div/div').get_attribute('id') + "_0"))
                            )
                            driver.find_element(By.ID, driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div/div[5]/div[1]/div/div/div').get_attribute('id') + "_0").click()
                            time.sleep(.5)  # wait for status change to 
                            
                            # # open attach Image panel
                            # WebDriverWait(driver, 5000).until(
                            #     EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[3]/div[1]/a/span'))
                            # )
                            # driver.execute_script("arguments[0].scrollIntoView(true);", driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[4]/div[1]/a/div/span'))
                            # time.sleep(1)  # wait for a second to ensure the element is in view
                            # WebDriverWait(driver, 5000).until(
                            #     EC.element_to_be_clickable((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[8]/div[1]/a/span'))
                            # )
                            # driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[8]/div[1]/a/span').click()
                            
                            # WebDriverWait(driver, 5000).until(
                            #     EC.visibility_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[8]/div[2]/div/div/div/div/div/div[1]/div/div[1]/button'))
                            # )
                            # WebDriverWait(driver, 5000).until(
                            #     EC.element_to_be_clickable((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[8]/div[2]/div/div/div/div/div/div[1]/div/div[1]/button/span[2]'))
                            # )
                            # driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[8]/div[2]/div/div/div/div/div/div[1]/div/div[1]/button/span[2]').click()
                            # time.sleep(1)  # wait for the file dialog to open
                            # # Use pyautogui to handle the file upload dialog
                            # pyautogui.hotkey('ctrl', 'l') 
                            # time.sleep(0.5)

                            # # 4. Type the custom directory and file name
                            # file_path = f"C:\\Users\\mak_r\\Downloads\\Phone Link\\invent\\invent\\{id.upper()}\\images\\"
                            # pyautogui.hotkey('ctrl', 'a')  # select all text in the address bar
                            # pyautogui.write(file_path)
                            # pyautogui.sleep(.5)
                            # pyautogui.hotkey('backspace')  # to ensure the path is set
                            # pyautogui.press('enter')
                            
                            # pyautogui.sleep(.5)  # wait for the directory to open
                            
                            # if sys.platform.startswith('win'):
                            #     for _ in range(5):
                            #         pyautogui.press('tab')  # navigate to the file list
                            # pyautogui.hotkey('ctrl', 'a') # select all files
                            # pyautogui.sleep(0.5)
                            
                            # pyautogui.press('enter')  # press enter to confirm file selection
                            
                            # print("Waiting for upload to complete...")
                            # time.sleep(.5)  # initial wait before checking for overlay
                            # # wait for overlay to disappear
                            # wait_for_all_overlays_gone(driver, timeout=180)
                                        
                            # #open attach file panel
                            # WebDriverWait(driver, 10).until(
                            #     EC.element_to_be_clickable((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[9]/div[1]/a/span'))
                            # )
                            # driver.execute_script("arguments[0].classList.remove('sticky');", driver.find_element(By.CLASS_NAME, 'nhealth-sidebar-layout-header'))
                            # driver.execute_script("arguments[0].scrollIntoView(true);", driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[9]/div[1]/a/span'))
                            # time.sleep(1)  # wait for a second to ensure the element is in view
                            # driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[9]/div[1]/a/span').click()
                            # print("Opening file upload dialog...")
                            # # WebDriverWait(driver, 5000).until(
                            # #     EC.visibility_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[9]/div[2]/div/div/div/div/div/div[1]/div/div[1]/button'))
                            # # )
                            # WebDriverWait(driver, 10).until(
                            #     EC.element_to_be_clickable((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[9]/div[2]/div/div/div/div/div/div[1]/div/div[1]/button/span[2]'))
                            # )
                            
                            # driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[9]/div[2]/div/div/div/div/div/div[1]/div/div[1]/button/span[2]').click()
                            # time.sleep(2)  # wait for the file dialog to open
                            # # Use pyautogui to handle the file upload dialog
                            # pyautogui.hotkey('ctrl', 'l') 
                            # time.sleep(0.5)
                            # # 4. Type the custom directory and file name
                            # file_path = f"D:\\github\\forms-1\\nsmart_plus\\invent\\{id.upper()}\\documents\\"
                            # pyautogui.hotkey('ctrl', 'a')  # select all text in the address bar
                            # pyautogui.write(file_path)
                            # pyautogui.sleep(.5)
                            # pyautogui.hotkey('backspace')  # to ensure the path is set
                            # pyautogui.press('enter')
                            # pyautogui.sleep(.5)  # wait for the directory to open
                            # if sys.platform.startswith('win'):
                            #     for _ in range(5):
                            #         pyautogui.press('tab')  # navigate to the file list
                            # pyautogui.hotkey('ctrl', 'a') # select all files
                            # pyautogui.sleep(0.5)
                            # pyautogui.press('enter')  # press enter to confirm file selection
                            
                            # print("Files uploaded, processing document descriptions...")
                            # time.sleep(.5)  # initial wait before checking for overlay
                            # wait_for_all_overlays_gone(driver, timeout=180)
                            
                            # # remove scrollable from table container
                            # # driver.find_element(By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[9]/div[2]/div/div/div/div/div/div[2]/div[2]/div/div/div/div[1]').get_attribute('style').replace('max-height: 400px;', '')
                            
                        
                            # driver.execute_script("arguments[0].classList.remove('sticky');", driver.find_element(By.CLASS_NAME, 'nhealth-sidebar-layout-header'))
                            # checklistItems =  { 
                            #     1: "BME Report (FP-BME-NHS-00-026/2)",
                            #     2: "Medical Equipment Assessment Form (FP-BME-NHS-00-033/3)",
                            #     3: "Acceptance Test Reports (FP-BME-NHS-00-026/3)",
                            #     4: "Certificate & License for Device (ใบตรวจรับรองการสอบเทียบเครื่อง)",
                            #     5: "สำเนาหนังสือรับรองประกอบการนำเข้าเครื่องมือแพทย์ เอกสารรับรองการควบคุมมาตรฐาน (FDA, อย., มอก.)",
                            #     6: "ใบเสนอราคา เลขที่ (ระบุเลขที่ของใบเสนอราคา)",
                            #     7: "Spec รุ่น เครื่องมือและอุปกรณ์ครบถ้วนตามใบเสนอราคา",
                            #     8: "Invoice เลขที่ (ระบุเลขที่ของใบแจ้งหนี้)", 
                            #     9: "หนังสือแต่งตั้งตัวแทนจำหน่าย",
                            #     10: "Certificate Engineer (ใบรับรองการอบรมของวิศวกร)",
                            #     11: "Tester's Certificates (ใบรับรองการสอบเทียบเครื่องมือที่ใช้ในการทดสอบ)",
                            #     12: "Schedule of maintenance with detail (แผนสอบเทียบและบำรุงรักษาพร้อมรายละเอียด)",
                            #     13: "Service Manuals (ฉบับภาษาไทย และฉบับภาษาอังกฤษ)",
                            #     14: "Operating Manuals (ฉบับภาษาไทย และฉบับภาษาอังกฤษ)",
                            #     15: "Purchasing contract (สัญญาซื้อขาย) (หมายเหตุ: ใช้ในกรณีที่มีมูลค่าสูงกว่า 1 ล้านบาท)",
                            #     16: "Service contract (สัญญาบริการหลังการขาย)",
                            #     17: "รายงานกรมวิทย์ (เฉพาะเครื่องมือกลุ่มงานรังสี)",
                            #     18: "Air waybill/Bill of Loading (เอกสารการขนส่งสินค้า)",
                            #     19: "เอกสาร Training User (แบบลงทะเบียนเข้ารับการอบรม ฝ่ายแพทย์ FP-BME-NHS-00-026/5 และฝ่ายพยาบาล FP-BME-NHS-00-026/6)",
                            #     20: "Network Document (เอกสาร Network)",
                            #     21: "Value Analysis (เอกสารวิเคราะห์คุณค่าของเครื่อง)",
                            #     22: "เอกสารยินยอมการเก็บรักษาข้อมูล (FP-BME-NHS-00-026/4)",
                            # }
                            # wait_for_all_overlays_gone(driver, timeout=120)
                            # document_upload_table = WebDriverWait(driver, 2000).until(
                            #     EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[3]/div[9]/div[2]/div/div/div/div/div/div[2]/div[2]/div/div/div/div[1]/table/tbody'))
                            # )
                            # row_count = len(document_upload_table.find_elements(By.TAG_NAME, "tr"))
                            # print(f"Total files to process: {row_count}")
                            # if row_count > 0:
                            #     for i in range(row_count):
                            #         # Re-fetch rows each iteration to avoid stale element reference
                            #         rows = document_upload_table.find_elements(By.TAG_NAME, "tr")
                            #         if i >= len(rows):
                            #             break
                            #         row = rows[i]
                            #         cols = row.find_elements(By.TAG_NAME, "td")
                            #         if len(cols) < 2:
                            #             continue
                            #         file_name = cols[3].text.strip()
                            #         file_desc_index = file_name.split("__")[1].split(".")[0].split("_")[0]
                            #         file_desc = checklistItems.get(int(file_desc_index), "Other Document")
                            #         # Re-locate input before sending keys
                            #         input_elem = row.find_element(By.TAG_NAME, "input")
                            #         input_elem.send_keys(file_desc)
                            #         console.print(f"[green]Uploaded file: {file_name}[/green]")
                            #         # Wait until overlay disappears, but check if it still appears and wait longer if needed
                            #         # time.sleep(1)  # wait for a second to ensure the element is in view
                            #         # max_wait_time = 120  # seconds
                            #         # start_time = time.time()
                            #         # while True:
                            #         #     try:
                            #         #         WebDriverWait(driver, 5).until(
                            #         #             EC.invisibility_of_element_located((By.CLASS_NAME, 'overlay'))
                            #         #         )
                            #         #         break  # overlay is gone
                            #         #     except TimeoutException:
                            #         #         if time.time() - start_time > max_wait_time:
                            #         #             raise TimeoutException("Overlay did not disappear in time.")
                            #         #         time.sleep(1)  # wait a bit and check again\
                            #         # Break the loop after processing the first file (or row)
                            break;
                        except StaleElementReferenceException:
                            console.print("[yellow]⚠️ StaleElementReferenceException encountered, retrying...[/yellow]")
                            time.sleep(1)
                    
                  
                    print("All file descriptions processed, saving asset details...")
                # scroll to save button
                WebDriverWait(driver, 5000).until(
                    EC.presence_of_element_located((By.XPATH, '//*[@id="nhealth-sidebar-layout"]/div[2]/div/div[1]/div/div[4]/div/button[1]'))
                )
                
                # click save button
                driver.execute_script("arguments[0].scrollIntoView(true);", driver.find_element(By.XPATH, '//*[@id="nhealth-sidebar-layout"]/div[2]/div/div[1]/div/div[4]/div/button[1]'))
                time.sleep(1)  # wait for a second to ensure the element is in view
                driver.find_element(By.XPATH, '//*[@id="nhealth-sidebar-layout"]/div[2]/div/div[1]/div/div[4]/div/button[1]').click()
                time.sleep(.5)  # wait for save to complete
                
                # click Sweet Alert OK button
                WebDriverWait(driver, 5000).until(
                    EC.presence_of_element_located((By.CLASS_NAME, 'swal2-confirm'))
                )
                driver.find_element(By.CLASS_NAME, 'swal2-confirm').click()
                console.print(f"[green]Save asset details...[/green]")
                WebDriverWait(driver, 5000).until(
                    EC.presence_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div[2]/div/div[1]/div/div[2]/div[1]/div[2]'))
                )
                driver.execute_script("window.scrollTo(0, 0);")
                WebDriverWait(driver, 5000).until(
                    EC.invisibility_of_element_located((By.CLASS_NAME, 'overlay'))
                )
                # Log the uploaded ID after successful upload
                with open(upload_log_path, 'a', encoding='utf-8') as f:
                    f.write(id + '\n')
                time.sleep(1)  # wait for a second to ensure the element is in view

    except TimeoutException:
        console.print("[red]❌ Page load timeout. Please check the website URL.[/red]")
    except Exception as e:
        console.print(f"[red]❌ Error during browser automation: {e}[/red]")
    finally:
        if driver:
            driver.quit()

    return True


def get_last_page(driver, console):
    try:
        last_page_element = WebDriverWait(driver, 2000).until(
            EC.presence_of_element_located((By.XPATH, "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr[103]"))
        )
        match = re.search(r"\d{1,}\s{1,}ท้าย", last_page_element.text.strip())
        if match:
            return int(match.group(0).split()[0])
        console.print("[red]❌ Could not determine the last page number using the provided regex.[/red]")
    except TimeoutException:
        console.print("[red]❌ Timeout while fetching the last page number.[/red]")
    return None

global isstart
isstart = False
def process_table(driver, domain, console):
    import time
    global isstart
    try:
        table = WebDriverWait(driver, 2000).until(
            EC.presence_of_element_located((By.XPATH, "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table"))
        )
        rows = table.find_elements(By.TAG_NAME, "tr")[2:-1]
        for row in rows:
            cols = row.find_elements(By.TAG_NAME, "td")
            if len(cols) < 2:
                continue
            asset_code = cols[3].text.strip()
            if asset_code == "353584" and not isstart:
                isstart = True
            if not isstart:
                continue
            asset_url = cols[3].find_element(By.TAG_NAME, "a").get_attribute("href")
            get_asset_files(domain, asset_code, asset_url, console, driver)
            # wait a bit between assets to avoid overwhelming the server
            time.sleep(2)
    except TimeoutException:
        console.print("[red]❌ Timeout while processing the table.[/red]")

def __main__():
    # When run standalone, ask for browser visibility
    show_browser_input = input("\nShow Browser (y/n)? ")
    show_browser = show_browser_input.lower() == 'y'
    nsmartPlusFileUpload(show_browser=show_browser)
    
if __name__ == "__main__":
    __main__()