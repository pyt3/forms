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

def nsmartFileDownload(show_browser=False, config_manager=None):
    """
    Download files from NSmart system.
    
    Args:
        show_browser (bool): Whether to show the browser window
        config_manager: ConfigManager instance for credentials
    """
    console = Console()
    dir_path = get_script_directory()

    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.common.exceptions import TimeoutException
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
        domain = "https://nsmart.nhealth-asia.com"
        page_size = 100
        
        # Get filter URL from config
        filter_url = config_manager.get_filter_url() if config_manager else ""
        if not filter_url:
            console.print("[yellow]⚠️ No filter URL configured. Please configure it in the settings.[/yellow]")
            return
        
        # Add pagination parameters to the filter URL
        separator = "&" if "?" in filter_url else "?"
        first_page_url = f"{filter_url}{separator}asset_masterPage=&asset_masterPageSize={page_size}&s_a_status=1"
        
        driver = go_to_page(driver, first_page_url, console, 'nsmart', config_manager)
        if not driver:
            console.print("[red]❌ Browser driver is not available. Exiting.[/red]")
            return False

        last_page = get_last_page(driver, console)
        if last_page is None:
            return False

        console.print(f"[green]✅ Detected total pages: {last_page}[/green]")

        for i in range(1, last_page + 1):
            if i >= 1:
                page_url = f"{filter_url}{separator}asset_masterPage={i}&asset_masterPageSize={page_size}"
                driver = go_to_page(driver, page_url, console, 'nsmart', config_manager)
            process_table(driver, domain, console, config_manager)

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
        table = WebDriverWait(driver, 2000).until(
            EC.presence_of_element_located((By.XPATH, "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table"))
        )
        footer = table.find_element(By.CLASS_NAME, "Footer")
        td = footer.find_element(By.TAG_NAME, "td")
        last_page_element = td.text.strip()
        match = re.search(r"\d{1,}\s{1,}ท้าย", last_page_element)
        console.print(last_page_element)
        if match:
            return int(match.group(0).split()[0])
        console.print("[red]❌ Could not determine the last page number using the provided regex.[/red]")
    except TimeoutException:
        console.print("[red]❌ Timeout while fetching the last page number.[/red]")
    except Exception as e:
        console.print(f"[red]❌ Error while determining last page: {e}[/red]")
    return None

global isstart
isstart = False
def process_table(driver, domain, console, config_manager=None):
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
            if config_manager.getAssetIDType() == "ASSET_SN":
                asset_code = cols[11].text.strip()
            # if asset_code == "353584" and not isstart:
            #     isstart = True
            # if not isstart:
            #     continue
            asset_url = cols[3].find_element(By.TAG_NAME, "a").get_attribute("href")
            get_asset_files(domain, asset_code, asset_url, console, driver, config_manager)
            # wait a bit between assets to avoid overwhelming the server
            time.sleep(2)
    except TimeoutException:
        console.print("[red]❌ Timeout while processing the table.[/red]")

def __main__():
    # When run standalone, ask for browser visibility
    show_browser_input = input("\nShow Browser (y/n)? ")
    show_browser = show_browser_input.lower() == 'y'
    nsmartFileDownload(show_browser=show_browser)
    
if __name__ == "__main__":
    __main__()