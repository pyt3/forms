import requests
from bs4 import BeautifulSoup
import sys
import logging
import urllib3
from rich import print, pretty
import time

logging.basicConfig(filename='log.txt', filemode='a', format='%(asctime)s - %(levelname)s - %(message)s',
                    level=logging.ERROR)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
url_lists = [
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209033",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209120",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209049",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209065",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209069",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208858",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208261",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209040",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209043",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209044",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209068",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209070",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209039",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209041",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209042",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209052",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209061",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209062",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209064",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209067",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209073",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209081",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209066",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209071",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209090",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208265",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209047",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209048",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209054",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209072",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209074",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209075",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209078",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208857",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208939",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209055",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209056",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209057",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209059",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209076",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209045",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209053",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209060",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209077",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208262",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208263",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209050",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209058",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209063",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208264",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208924",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209117",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209006",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209004",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209005",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209003",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209084",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208859",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208977",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208839",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208984",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208841",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208997",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208868",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209011",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208866",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208925",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208942",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209118",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208923",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209112",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208867",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208870",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208918",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208756",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208974",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208973",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=209032",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208944",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208431",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208941",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208927",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208919",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208865",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208755",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208976",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208975",
    "http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=208928",
]


def test():
    csv_file = open("fda.csv", "w")
    for url in url_lists:
        print(f"Scraping [yellow]{url}[/yellow]")
        try:
            response = requests.get(
                url
            )
        except requests.exceptions.RequestException as e:
            print(
                f"An error occurred on line {sys.exc_info()[-1].tb_lineno}: {e}")

        response.encoding = "tis-620"
        soup = BeautifulSoup(response.text, "lxml")
        hardbreak = soup.find('span', {'class': 'hardbreak'})
        table_rows = hardbreak.findAll('table')[1].find('table').findAll('tr')
        rows = []
        for row in table_rows:
            td = row.find('td')
            rows.append(td.text)
        csv_file.write(','.join(rows) + '\n')
        time.sleep(1)
    csv_file.close()


test()