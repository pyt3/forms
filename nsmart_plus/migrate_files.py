import os
import re
import sys
import requests
import pyperclip
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

def nsmartPlus_FileUpload():
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

    driver = create_browser_driver(default_browser, console)
    if not driver:
        console.print("[red]❌ Failed to create browser driver. Copying script to clipboard instead.[/red]")
        input("\nPress Enter to continue...")
        return False

    try:
        domain = "https://nsmart.nhealth-asia.com"
        page_size = 100
        master_page = 1
        extra_path = "s_branchid=00052&s_dept=0005202&s_sub_dept=000520200002"
        driver = go_to_page(driver, f"{domain}/mtdpdb01/asset_mast_list_new.php?asset_masterPage=&asset_masterPageSize={page_size}&{extra_path}", console)
        if not driver:
            console.print("[red]❌ Browser driver is not available. Exiting.[/red]")
            return False

        last_page = get_last_page(driver, console)
        if last_page is None:
            return False

        console.print(f"[green]✅ Detected total pages: {last_page}[/green]")

        for i in range(1, last_page + 1):
            # driver = go_to_page(driver, f"{domain}/mtdpdb01/asset_mast_list_new.php?asset_masterPage={i}&asset_masterPageSize={page_size}&{extra_path}", console)
            # if not driver:
            #     console.print("[red]❌ Browser driver is not available. Exiting.[/red]")
            #     return False
            # process_table(driver, domain, console)
            if i > 1:
                driver = go_to_page(driver, f"{domain}/mtdpdb01/asset_mast_list_new.php?asset_masterPage={i}&asset_masterPageSize={page_size}&{extra_path}", console)
            process_table(driver, domain, console)

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


def process_table(driver, domain, console):
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
            asset_url = cols[3].find_element(By.TAG_NAME, "a").get_attribute("href")
            get_asset_files(domain, asset_code, asset_url, console, driver)
    except TimeoutException:
        console.print("[red]❌ Timeout while processing the table.[/red]")

def __main__():
    nsmartPlus_FileUpload()
    
if __name__ == "__main__":
    __main__()