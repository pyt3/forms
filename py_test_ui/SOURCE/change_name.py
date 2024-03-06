import os
import fitz

dir_path = os.path.dirname(os.path.realpath(__file__))
path = os.path.join(dir_path, 'PM DEC23')
dir_list = os.listdir(path)
name_arr = []
for file_name in dir_list:
    source = os.path.join(path, file_name)
    filename = file_name.split('_')
    if len(filename) > 1 and len(filename[1]) > 10:
        filename = "_".join(filename[1:])
        name = filename.split('(')[0]
        if(filename.split('(')[-1] != '1).pdf' and filename.split('(')[-1] != '2).pdf'):
            name_arr.append(name)
            if filename.split('(')[1].find('PM') > -1:
                name = name + '_pm.pdf'
            else:
                name = name + '_cal.pdf'
            dest = os.path.join(path, name);
            os.rename(source, dest)
            print(name)
    elif file_name.find('_') == -1:
        file = fitz.open(source)
        page = file[0]
        code = [t for t in page.get_text().split('\n') if t.find('PYT3') == 0]
        cal = [t for t in page.get_text().split('\n') if t.find('Certificate') == 0]
        if len(code) > 0:
            name_arr.append(code[0])
            if len(cal) > 0:
                name = code[0].split('_')[1]+ '_cal.pdf'
            else:
                name = code[0].split('_')[1]+ '_pm.pdf'
            fitz.open(source).save(os.path.join(path, name))
            # dest = os.path.join(path, name);
            # os.rename(source, dest)
            print(name)
        print(code)

# append name_arr to clipboard
unique_arr = []
for name in name_arr:
    if name not in unique_arr:
        unique_arr.append(name)
import pyperclip
pyperclip.copy('\n'.join(unique_arr))
