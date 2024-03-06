import os
import fitz

dir_path = os.path.dirname(os.path.realpath(__file__))
path = os.path.join(dir_path, 'callab')
dir_list = os.listdir(path)
name_arr = []
file = fitz.open(path + '\CH23073654 PYT3-PHA.pdf')
for page in file:
    code = [t for t in page.get_text().split('\n') if t.find('PYT3') > -1]
    print(code)
    