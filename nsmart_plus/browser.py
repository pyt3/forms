import os
import sys
from rich.console import Console
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from utils import get_script_directory
from utils import sanitize_thai_filename
from utils import get_file_extension

# Helper function to handle repetitive navigation and table extraction logic
def navigate_and_extract_table(driver, url, table_xpath, id_xpath, console):
    driver.execute_script("window.open('');")
    driver.switch_to.window(driver.window_handles[-1])
    driver = go_to_page(driver, url, console)
    if driver is None:
        console.print(f"[red]❌ Failed to load page: {url}[/red]")
        driver.close()
        driver.switch_to.window(driver.window_handles[0])
        return driver, None, None
    try:
        id_code = WebDriverWait(driver, 2000).until(
            EC.presence_of_element_located((By.XPATH, id_xpath))
        )
        table = WebDriverWait(driver, 2000).until(
            EC.presence_of_element_located((By.XPATH, table_xpath))
        )
        return driver, table, id_code.text.strip()
    except TimeoutException:
        console.print(f"[red]❌ Timeout while loading page: {url}[/red]")
    except Exception as e:
        console.print(f"[red]❌ Error while processing page {url}: {e}[/red]")
    

def check_default_browser():
    """Check and return the default browser name."""
    import webbrowser
    browser = webbrowser.get()
    name = browser.name.lower()
    print(f"Detected default browser: {name}")
    if 'chrome' in name:
        return 'chrome'
    elif 'firefox' in name:
        return 'firefox'
    elif 'edge' in name:
        return 'edge'
    elif 'xdg-open' in name or 'brave' in name:
        return 'brave'
    else:
        return None
    
def create_browser_driver(browser_name, console):
    """Create and return a Selenium WebDriver for the specified browser."""
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service as ChromeService
    from selenium.webdriver.firefox.service import Service as FirefoxService
    from selenium.webdriver.edge.service import Service as EdgeService
    from selenium.common.exceptions import WebDriverException

    try:
        if browser_name == 'chrome':
            service = ChromeService()
            options = webdriver.ChromeOptions()
            driver = webdriver.Chrome(service=service, options=options)
        elif browser_name == 'firefox':
            service = FirefoxService()
            options = webdriver.FirefoxOptions()
            driver = webdriver.Firefox(service=service, options=options)
        elif browser_name == 'edge':
            service = EdgeService()
            options = webdriver.EdgeOptions()
            driver = webdriver.Edge(service=service, options=options)
        elif browser_name == 'brave':
            service = ChromeService()
            options = webdriver.ChromeOptions()
            options.binary_location = '/usr/bin/brave-browser'  # Adjust path as necessary
            driver = webdriver.Chrome(service=service, options=options)
        else:
            console.print(f"[red]❌ Unsupported browser: {browser_name}[/red]")
            return None
        return driver
    except WebDriverException as e:
        console.print(f"[red]❌ WebDriver error: {e}[/red]")
        return None
    
def go_to_page(driver, url, console):
    """Navigate the driver to the specified URL."""
    try:
        driver.get(url)
        
        # Wait until the page has fully loaded
        WebDriverWait(driver, 3000).until(
            EC.presence_of_element_located((By.TAG_NAME, 'body'))
        )
        print("Page loaded:", driver.current_url)
        
        # check if page redirect to login
        if 'index.php' in driver.current_url:
            console.print("[yellow]⚠️ Redirected to login page[/yellow]")
        
            # Wait for page to load
            WebDriverWait(driver, 3000).until(
                EC.presence_of_element_located((By.NAME, 'user'))
            )
            
            # fill login form
            driver.find_element(By.NAME, 'user').send_keys('PYT34DARANPHOP')
            driver.find_element(By.NAME, 'pass').send_keys('577199')
            driver.find_element(By.NAME, 'pass').send_keys('\n')  # Press Enter to submit
            print("Logged in, current URL:", driver.current_url)
            return go_to_page(driver, url, console)
        return driver
    except Exception as e:
        console.print(f"[red]❌ Failed to navigate to {url}: {e}[/red]")
        return None
    
def get_asset_files(domain, asset_code, asset_url, console, driver):
    import re
    asset_image_page = asset_url.replace("asset_mast_record.php", "asset_picture.php")
    image_table_xpath = "/html/body/p/table/tbody/tr[2]/td[1]/table/tbody/tr/td/table[2]"
    image_id_xpath = "/html/body/p/table/tbody/tr[1]/td/form/table/tbody/tr/td/table[2]/tbody/tr[1]/td[2]"

    driver, table, id_code = navigate_and_extract_table(driver, asset_image_page, image_table_xpath, image_id_xpath, console)
    if table is None or id_code is None:
        return
   
    rows = table.find_elements(By.TAG_NAME, "tr")[2:-1]  # Skip header row and last row
    console.print(f"[blue]🔍 Found {len(rows)} image rows for asset {asset_code}[/blue]")
    if not rows:
        console.print(f"[yellow]⚠️ No images found for asset {asset_code}[/yellow]")
        return

    for row in rows:
        try:
            cols = row.find_elements(By.TAG_NAME, "td")
            if len(cols) < 2:
                continue
            img_no = cols[0].text.strip()
            img_element = cols[1].find_element(By.TAG_NAME, "a")
            img_src = img_element.get_attribute("href")
            img_url = f"{domain}/mtdpdb01/{img_src}"
            img_desc = cols[2].text.strip()
            console.print(f"[green]✅ Found image for asset {asset_code}: {img_src}[/green]")
            download_nsmart_files(img_src, f"/invent/{id_code}/images/", f"{img_no}__{img_desc}", console)
        except Exception as e:
            console.print(f"[red]❌ Error processing image row for asset {asset_code}: {e}[/red]")

    document_page = asset_url.replace("asset_mast_record.php", "asset_doc.php")
    document_table_xpath = "/html/body/table[4]/tbody/tr[2]/td[1]/table/tbody/tr/td/table[2]"
    document_id_xpath = "/html/body/table[4]/tbody/tr[1]/td/form/table/tbody/tr/td/table[2]/tbody/tr[1]/td[2]"
    driver.close()
    driver.switch_to.window(driver.window_handles[0])
    
    driver, table, id_code = navigate_and_extract_table(driver, document_page, document_table_xpath, document_id_xpath, console)
    if table is None or id_code is None:
        return
    footer_tr = table.find_elements(By.TAG_NAME, "tr")[-1]
    last_doc_page_element = footer_tr.find_element(By.TAG_NAME, "td")
    match = re.search(r"of\s{1,}\d{1,}", last_doc_page_element.text.strip()).group(0).split()[1]
    console.print(f"[blue]Total document pages for asset {asset_code}: {match}[/blue]")
    match = int(match) if match else 1
    console.print(f"[blue]match={match}[/blue]")
    for doc_page in range(1, match + 1):
        if doc_page > 1:
            doc_page_url = f"{document_page}&asset_docPage={doc_page}"
            driver.close()
            driver.switch_to.window(driver.window_handles[0])
            driver, table, id_code = navigate_and_extract_table(driver, doc_page_url, document_table_xpath, document_id_xpath, console)
            if table is None or id_code is None:
                return
        
        rows = table.find_elements(By.TAG_NAME, "tr")[1:-1]  # Skip header row
        if not rows:
            console.print(f"[yellow]⚠️ No documents found for asset {asset_code}[/yellow]")
            return
        console.print(f"[blue]🔍 Found {len(rows)} document rows for asset {asset_code} on page {doc_page}[/blue]")
        for row in rows:
            cols = row.find_elements(By.TAG_NAME, "td")
            if len(cols) < 2:
                continue
            doc_no = cols[0].text.strip()
            doc_desc = cols[1].text.strip()
            doc_name = cols[2].text.strip()
            doc_src = cols[2].find_element(By.TAG_NAME, "a").get_attribute("href").split('=')[1].split('.')[0]
            doc_url = f"{domain}/mtdpdb01/ftp_dowload/{doc_src}.{doc_name}"
            if 'inspection form' in doc_desc.lower() or 'assessment form' in doc_desc.lower():
                console.print(f"[yellow]⚠️ inspection/assessment document: {doc_name}[/yellow]")
                doc_url = f"{domain}/mtdpdb01/ftp_dowload/{doc_name}"
            
            download_nsmart_files(doc_url, f"/invent/{id_code}/documents/", f"{doc_no}__{doc_desc}", console)
    driver.close()
    driver.switch_to.window(driver.window_handles[0])
    

def download_nsmart_files(url, folder_path, filename, console):
    import requests
    from urllib.parse import quote
    
    filename = sanitize_thai_filename(filename)
    encoded_url = url.replace(" ", "%20")
    main_dir = get_script_directory()
    folder_path = os.path.join(main_dir, folder_path.lstrip('/'))

    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    local_filename = os.path.join(folder_path, filename if filename else url.split('/')[-1])
    try:
        with requests.get(encoded_url, stream=True) as r:
            r.raise_for_status()
            file_ext = get_file_extension(r.headers.get('Content-Type', ''))
            if file_ext and not local_filename.endswith(file_ext):
                local_filename += file_ext
            with open(local_filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        console.print(f"[green]✅ Downloaded: {local_filename}[/green]")
    except Exception as e:
        console.print(f"[red]❌ Failed to download {url}: {e}[/red]")