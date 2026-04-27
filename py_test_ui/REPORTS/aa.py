# This script reads codes from "code list.txt" and duplicates "report terumo.pdf"
# for each code, renaming the copies to "{id}_2026_pm.pdf" and "{id}_2026_cal.pdf".
import os
import shutil

CODE_LIST_PATH = os.path.join(os.path.dirname(__file__), 'code list.txt')
SOURCE_PDF = os.path.join(os.path.dirname(__file__), 'report terumo.pdf')

def main():
	# Read codes from file
	with open(CODE_LIST_PATH, 'r', encoding='utf-8') as f:
		codes = [line.strip() for line in f if line.strip()]

	for code in codes:
		pm_name = f"{code}_2026_pm.pdf"
		cal_name = f"{code}_2026_cal.pdf"
		pm_path = os.path.join(os.path.dirname(SOURCE_PDF), pm_name)
		cal_path = os.path.join(os.path.dirname(SOURCE_PDF), cal_name)
		shutil.copy2(SOURCE_PDF, pm_path)
		shutil.copy2(SOURCE_PDF, cal_path)
		print(f"Created: {pm_name}, {cal_name}")

if __name__ == "__main__":
	main()
