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

login_page_keyword = {
    'nsmart': 'index.php',
    'nsmart+': 'nsmartplus.nhealth-asia.com/login?',
}

# Helper function to handle repetitive navigation and table extraction logic
def navigate_and_extract_table(driver, url, table_xpath, id_xpath, console, config_manager=None):
    driver.execute_script("window.open('');")
    driver.switch_to.window(driver.window_handles[-1])
    driver = go_to_page(driver, url, console, config_manager=config_manager)
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
    import sys
    import os
    browser = webbrowser.get()
    name = getattr(browser, 'name', '').lower()
    print(f"Detected default browser: {name}")
    # Try to detect by webbrowser name
    if 'chrome' in name:
        return 'chrome'
    elif 'firefox' in name:
        return 'firefox'
    elif 'edge' in name:
        return 'edge'
    elif 'brave' in name or 'xdg-open' in name:
        return 'brave'
    # On Windows, try to detect from registry if webbrowser fails
    if sys.platform.startswith('win'):
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice") as key:
                progid = winreg.QueryValueEx(key, 'ProgId')[0].lower()
                print(f"Registry ProgId: {progid}")
                if 'chrome' in progid:
                    return 'chrome'
                elif 'firefox' in progid:
                    return 'firefox'
                elif 'edge' in progid:
                    return 'edge'
                elif 'brave' in progid:
                    return 'brave'
        except Exception as e:
            print(f"Could not detect browser from registry: {e}")
    # Fallback: try to detect from environment
    browser_env = os.environ.get('BROWSER', '').lower()
    if 'chrome' in browser_env:
        return 'chrome'
    elif 'firefox' in browser_env:
        return 'firefox'
    elif 'edge' in browser_env:
        return 'edge'
    elif 'brave' in browser_env or 'brave-browser' in browser_env:
        return 'brave'
    return None
    
def create_browser_driver(browser_name, console, show_browser=False, config_manager=None):
    """Create and return a Selenium WebDriver for the specified browser.
    
    Args:
        browser_name: Name of the browser
        console: Rich console for output
        show_browser: Whether to show the browser window
        config_manager: ConfigManager instance for credentials
    """
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service as ChromeService
    from selenium.webdriver.firefox.service import Service as FirefoxService
    from selenium.webdriver.edge.service import Service as EdgeService
    from selenium.common.exceptions import WebDriverException

    try:
        if browser_name == 'chrome':
            service = ChromeService()
            options = webdriver.ChromeOptions()
            if not show_browser:
                options.add_argument('--headless=new')
            driver = webdriver.Chrome(service=service, options=options)
        elif browser_name == 'firefox':
            service = FirefoxService()
            options = webdriver.FirefoxOptions()
            if not show_browser:
                options.add_argument('--headless')
            driver = webdriver.Firefox(service=service, options=options)
        elif browser_name == 'edge':
            service = EdgeService()
            options = webdriver.EdgeOptions()
            if not show_browser:
                options.add_argument('--headless=new')
            driver = webdriver.Edge(service=service, options=options)
        elif browser_name == 'brave':
            service = ChromeService()
            options = webdriver.ChromeOptions()
            options.binary_location = '/usr/bin/brave-browser'  # Adjust path as necessary
            if not show_browser:
                options.add_argument('--headless=new')
            driver = webdriver.Chrome(service=service, options=options)
        else:
            console.print(f"[red]❌ Unsupported browser: {browser_name}[/red]")
            return None
        return driver
    except WebDriverException as e:
        console.print(f"[red]❌ WebDriver error: {e}[/red]")
        return None
    
def go_to_page(driver, url, console, login_key=None, config_manager=None):
    """Navigate the driver to the specified URL.
    
    Args:
        driver: Selenium WebDriver instance
        url: Target URL
        console: Rich console for output
        login_key: Key to identify login type ('nsmart' or 'nsmart+')
        config_manager: ConfigManager instance for credentials
    """
    try:
        driver.get(url)
        
        # Wait until the page has fully loaded
        WebDriverWait(driver, 3000).until(
            EC.presence_of_element_located((By.TAG_NAME, 'body'))
        )
        console.print(f"[cryan]Page loaded: {driver.current_url}[/cryan]")
        
        # check if page redirect to login
        if login_key and login_page_keyword.get(login_key) in driver.current_url:
            console.print("[yellow]⚠️  Redirected to login page[/yellow]")
            if login_key == 'nsmart':
                # Get credentials from config manager or use defaults
                if config_manager:
                    creds = config_manager.get_nsmart_credentials()
                    username = creds['username'] or 'PYT34DARANPHOP'
                    password = creds['password'] or '577199'
                else:
                    username = 'PYT34DARANPHOP'
                    password = '577199'
                
                # Wait for page to load
                WebDriverWait(driver, 3000).until(
                    EC.presence_of_element_located((By.NAME, 'user'))
                )
                
                # fill login form
                driver.find_element(By.NAME, 'user').send_keys(username)
                driver.find_element(By.NAME, 'pass').send_keys(password)
                driver.find_element(By.NAME, 'pass').send_keys('\n')  # Press Enter to submit
                WebDriverWait(driver, 3000).until(
                    EC.url_changes("https://nsmart.nhealth-asia.com/mtdpdb01/index.php")
                )
                print("Logged in, current URL:", driver.current_url)
                
                return go_to_page(driver, url, console, login_key, config_manager)
            elif login_key == 'nsmart+':
                # Get credentials from config manager or use defaults
                if config_manager:
                    creds = config_manager.get_nsmart_plus_credentials()
                    username = creds['username'] or 'nhbml.pyt3@nhealth-asia.com'
                    password = creds['password'] or 'Nhlabpt3*'
                else:
                    username = 'nhbml.pyt3@nhealth-asia.com'
                    password = 'Nhlabpt3*'
                
                # Wait for page to load
                WebDriverWait(driver, 10000).until(
                    EC.presence_of_element_located((By.XPATH,'//*[@id="nhealth-sidebar-layout"]/div[2]/div/div[1]/div/div/div/div/form/div/div[2]/div/div/span/input'))
                )
                
                # fill login form
                driver.find_element(By.XPATH,'//*[@id="nhealth-sidebar-layout"]/div[2]/div/div[1]/div/div/div/div/form/div/div[2]/div/div/span/input').send_keys(username)
                
                driver.find_element(By.XPATH,'//*[@id="nhealth-sidebar-layout"]/div[2]/div/div[1]/div/div/div/div/form/div/div[3]/div/div/span/div/input').send_keys(password)
                driver.find_element(By.XPATH,'//*[@id="nhealth-sidebar-layout"]/div[2]/div/div[1]/div/div/div/div/form/div/div[3]/div/div/span/div/input').send_keys('\n')  # Press Enter to submit
                WebDriverWait(driver, 5000).until(
                    EC.presence_of_all_elements_located((By.XPATH, '//*[@id="nhealth-sidebar-layout"]/div[1]/div/div[3]/div[2]/button[2]'))
                )
                print("Logged in, current URL:", driver.current_url)
                if driver.current_url != url:
                    return go_to_page(driver, url, console, login_key)
                return driver
        elif driver.current_url != url:
            console.print(f"[yellow]⚠️ Redirected to unexpected page: {driver.current_url}[/yellow]")
            return go_to_page(driver, url, console, login_key)
        return driver
    except Exception as e:
        console.print(f"[red]❌ Failed to navigate to {url}: {e}[/red]")
        return None

    
def get_asset_files(domain, asset_code, asset_url, console, driver, config_manager=None):
    import re
    import requests
    asset_image_page = asset_url.replace("asset_mast_record.php", "asset_picture.php")
    image_table_xpath = "/html/body/p/table/tbody/tr[2]/td[1]/table/tbody/tr/td/table[2]"
    image_id_xpath = "/html/body/p/table/tbody/tr[1]/td/form/table/tbody/tr/td/table[2]/tbody/tr[1]/td[2]"
    def get_doc_url(href):
        # requests the document URL from the href link
        with requests.get(href, allow_redirects=True) as r:
            r.raise_for_status()
            r.encoding = "tis-620"
            html_text = r.text
            match = re.search(r'window\.location\.href\s*=\s*[\'"]([^\'"]+)[\'"]', html_text)
            if match:
                # If the matched URL is relative, join it with the base URL
                return domain + "/mtdpdb01/" + match.group(1)
            if match:
                return match.group(1)
            else:
                return href
    
    driver, table, id_code = navigate_and_extract_table(driver, asset_image_page, image_table_xpath, image_id_xpath, console, config_manager)
    if table is None or id_code is None:
        return
   
    rows = table.find_elements(By.TAG_NAME, "tr")[2:-1]  # Skip header row and last row
    console.print(f"[blue]🔍 Found {len(rows)} image rows for asset {asset_code}[/blue]")
    if not rows:
        console.print(f"[yellow]⚠️ No images found for asset {asset_code}[/yellow]")
        return

    from concurrent.futures import ThreadPoolExecutor, as_completed

    def get_img_info(row):
        try:
            cols = row.find_elements(By.TAG_NAME, "td")
            if len(cols) < 2:
                return None
            img_no = cols[0].text.strip()
            img_element = cols[1].find_element(By.TAG_NAME, "a")
            img_src = img_element.get_attribute("href")
            img_desc = cols[2].text.strip().replace('/', '_').replace('\\', '_')
            return (img_src, f"/invent/{id_code}/images/", f"{img_no}__{img_desc}")
        except Exception as e:
            console.print(f"[red]❌ Error processing image row for asset {asset_code}: {e}[/red]")
            return None

    img_tasks = [get_img_info(row) for row in rows]
    img_tasks = [task for task in img_tasks if task]
    if img_tasks:
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(download_nsmart_files, src, path, name, console, config_manager) for src, path, name in img_tasks]
            for future in as_completed(futures):
                # Optionally handle results or exceptions here
                try:
                    future.result()
                except Exception as e:
                    console.print(f"[red]❌ Error in image download thread: {e}[/red]")

    document_page = asset_url.replace("asset_mast_record.php", "asset_doc.php")
    document_table_xpath = "/html/body/table[4]/tbody/tr[2]/td[1]/table/tbody/tr/td/table[2]"
    document_id_xpath = "/html/body/table[4]/tbody/tr[1]/td/form/table/tbody/tr/td/table[2]/tbody/tr[1]/td[2]"
    driver.close()
    driver.switch_to.window(driver.window_handles[0])
    
    driver, table, id_code = navigate_and_extract_table(driver, document_page, document_table_xpath, document_id_xpath, console, config_manager)
    if table is None or id_code is None:
        return
    footer_tr = table.find_elements(By.TAG_NAME, "tr")[-1]
    last_doc_page_element = footer_tr.find_element(By.TAG_NAME, "td")
    match = re.search(r"of\s{1,}\d{1,}", last_doc_page_element.text.strip()).group(0).split()[1]
    console.print(f"[blue]Total document pages for asset {asset_code}: {match}[/blue]")
    match = int(match) if match else 1
    console.print(f"[blue]match={match}[/blue]")
    from concurrent.futures import ThreadPoolExecutor, as_completed

    def get_doc_info(row):
        try:
            cols = row.find_elements(By.TAG_NAME, "td")
            if len(cols) < 2:
                return None
            doc_no = cols[0].text.strip()
            doc_href = cols[2].find_element(By.TAG_NAME, "a").get_attribute("href")
            doc_url = get_doc_url(doc_href)
            return (doc_url, f"/invent/{id_code}/documents/", doc_no)
        except Exception as e:
            console.print(f"[red]❌ Error processing document row for asset {asset_code}: {e}[/red]")
            return None

    for doc_page in range(1, match + 1):
        if doc_page > 1:
            doc_page_url = f"{document_page}&asset_docPage={doc_page}"
            driver.close()
            driver.switch_to.window(driver.window_handles[0])
            driver, table, id_code = navigate_and_extract_table(driver, doc_page_url, document_table_xpath, document_id_xpath, console, config_manager)
            if table is None or id_code is None:
                return

        rows = table.find_elements(By.TAG_NAME, "tr")[1:-1]  # Skip header row
        if not rows:
            console.print(f"[yellow]⚠️ No documents found for asset {asset_code}[/yellow]")
            return
        console.print(f"[blue]🔍 Found {len(rows)} document rows for asset {asset_code} on page {doc_page}[/blue]")

        doc_tasks = [get_doc_info(row) for row in rows]
        doc_tasks = [task for task in doc_tasks if task]
        if doc_tasks:
            with ThreadPoolExecutor(max_workers=8) as executor:
                futures = [executor.submit(download_nsmart_files, url, path, name, console, config_manager) for url, path, name in doc_tasks]
                for future in as_completed(futures):
                    try:
                        future.result()
                    except Exception as e:
                        console.print(f"[red]❌ Error in document download thread: {e}[/red]")
    driver.close()
    driver.switch_to.window(driver.window_handles[0])
    

def download_nsmart_files(url, folder_path, filename, console, config_manager=None):
    import requests
    import os
    import sys
    from urllib.parse import quote
    import csv
    from datetime import datetime
    import time
    import re
    from urllib.parse import urljoin

    filename = time.time().__str__() + "__" + filename
    encoded_url = url.replace(" ", "%20")
    
    # Use source folder from config if available
    if config_manager:
        base_dir = config_manager.get_source_folder()
        if not base_dir:
            base_dir = get_script_directory()
    else:
        base_dir = get_script_directory()
    
    folder_path = os.path.join(base_dir, folder_path.lstrip('/'))

    if not os.path.exists(folder_path):
        try:
            os.makedirs(folder_path, exist_ok=True)
        except Exception as e:
            if not os.path.exists(folder_path):
                console.print(f"[red]❌ Failed to create directory {folder_path}: {e}[/red]")
                return

    local_filename = os.path.join(folder_path, filename if filename else url.split('/')[-1])
    log_path = os.path.join(base_dir, 'download_log.csv')
    log_fields = ['timestamp', 'url', 'local_filename', 'status', 'error']
    log_row = {
        'timestamp': datetime.now().isoformat(),
        'url': url,
        'local_filename': local_filename,
        'status': '',
        'error': ''
    }
    try:
        with requests.get(encoded_url, allow_redirects=True, stream=True) as r:
            r.raise_for_status()
            if r.status_code != 200:
                console.print(f"[red]❌ Failed to download {encoded_url}: Status code {r.status_code}[/red]")
                log_row['status'] = f"Failed: Status code {r.status_code}"
                with open(log_path, 'a', newline='', encoding='utf-8') as log_file:
                    writer = csv.DictWriter(log_file, fieldnames=log_fields)
                    if log_file.tell() == 0:
                        writer.writeheader()
                    writer.writerow(log_row)
                return
            # iftype is html
            file_ext = get_file_extension(r.headers.get('Content-Type', ''))
            if file_ext and not local_filename.endswith(file_ext):
                local_filename += file_ext
            with open(local_filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            # Compress PDF if larger than 3MB
            print(file_ext)
            if 'pdf' in file_ext.lower():
                try:
                    import os
                    import fitz  # PyMuPDF
                    size_mb = os.path.getsize(local_filename) / (1024 * 1024)
                    print(size_mb)
                    if size_mb > 2.5:
                        limit_bytes = int(2.5 * 1024 * 1024)
                        console.print(f"[yellow]⚠️ PDF {local_filename} is {size_mb:.2f}MB, splitting into chunks < 2.5MB...[/yellow]")
                        doc = fitz.open(local_filename)
                        total_pages = len(doc)
                        chunk_idx = 1
                        start_page = 0
                        while start_page < total_pages:
                            end_page = min(start_page + 1, total_pages)
                            # Find max pages that fit in 2.95MB
                            while end_page <= total_pages:
                                chunk_doc = fitz.open()
                                for i in range(start_page, end_page):
                                    chunk_doc.insert_pdf(doc, from_page=i, to_page=i)
                                chunk_name = local_filename.replace('.pdf', f'_part{chunk_idx}.pdf')
                                chunk_doc.save(chunk_name, garbage=4, deflate=True, clean=True)
                                chunk_doc.close()
                                chunk_size = os.path.getsize(chunk_name)
                                if chunk_size > limit_bytes:
                                    os.remove(chunk_name)
                                    if end_page - 1 == start_page:
                                        # Single page too large, keep as is
                                        break
                                    end_page -= 1
                                    break
                                else:
                                    os.remove(chunk_name)
                                    end_page += 1
                            # Save the chunk with the found page range
                            if end_page > start_page:
                                chunk_doc = fitz.open()
                                for i in range(start_page, end_page):
                                    chunk_doc.insert_pdf(doc, from_page=i, to_page=i)
                                chunk_name = local_filename.replace('.pdf', f'_part{chunk_idx}.pdf')
                                chunk_doc.save(chunk_name, garbage=4, deflate=True, clean=True)
                                chunk_doc.close()
                                chunk_size = os.path.getsize(chunk_name)
                                if chunk_size > limit_bytes:
                                    console.print(f"[yellow]⚠️ Chunk {chunk_name} is still over {limit_bytes/(1024*1024):.2f}MB, attempting image compression...[/yellow]")
                                    try:
                                        import io
                                        from PIL import Image
                                        # Rasterize each page to image, recompress, and save as new PDF
                                        orig_doc = fitz.open(chunk_name)
                                        img_pdf = fitz.open()
                                        for page in orig_doc:
                                            pix = page.get_pixmap(dpi=120)
                                            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                                            buf = io.BytesIO()
                                            img.save(buf, format="JPEG", quality=60, optimize=True)
                                            img_bytes = buf.getvalue()
                                            img_pdf.insert_page(-1, width=pix.width, height=pix.height)
                                            img_pdf[-1].insert_image(fitz.Rect(0, 0, pix.width, pix.height), stream=img_bytes)
                                        orig_doc.close()
                                        img_pdf.save(chunk_name, garbage=4, deflate=True, clean=True)
                                        img_pdf.close()
                                        chunk_size2 = os.path.getsize(chunk_name)
                                        if chunk_size2 < chunk_size:
                                            console.print(f"[green]✅ Chunk {chunk_name} reduced to {chunk_size2/(1024*1024):.2f}MB after image compression[/green]")
                                        else:
                                            console.print(f"[yellow]⚠️ Chunk {chunk_name} could not be reduced below {chunk_size2/(1024*1024):.2f}MB[/yellow]")
                                    except Exception as e:
                                        console.print(f"[red]❌ Image compression failed for {chunk_name}: {e}[/red]")
                                else:
                                    console.print(f"[green]✅ Saved chunk: {chunk_name} ({chunk_size/(1024*1024):.2f}MB)[/green]")
                                chunk_idx += 1
                            start_page = end_page
                        doc.close()
                        os.remove(local_filename)
                        console.print(f"[yellow]⚠️ Original large PDF removed after splitting.[/yellow]")
                except Exception as e:
                    console.print(f"[red]❌ PDF split failed: {e}[/red]")
        console.print(f"[green]✅ Downloaded: {local_filename}[/green]")
        log_row['status'] = 'Success'
    except Exception as e:
        console.print(f"[red]❌ Failed to download {url}: {e}[/red]")
        log_row['status'] = 'Failed'
        log_row['error'] = str(e)
    finally:
        with open(log_path, 'a', newline='', encoding='utf-8') as log_file:
            writer = csv.DictWriter(log_file, fieldnames=log_fields)
            if log_file.tell() == 0:
                writer.writeheader()
            writer.writerow(log_row)