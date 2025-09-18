import shutil
import os

src = '/home/mdr/forms/py_test_ui/REPORTS'

# files = []
# for file in os.listdir(src):
#     if file.endswith('.pdf'):
#         files.append(file)
# print(files)

# get list of file names in the source directory
change_name_index = {'SK00104949':'PYT3T_07292','SK00104958':'PYT3T_07260','SK00103968':'PYT3T_07232','SK30221763':'DEMO_000358','SK00103932':'PYT3T_07132','SK10112987':'DEMO_000078','SK90904879':'PYT3T_07185','SK00103593':'PYT3T_07255','SK01003140':'DEMO_000295','SK90904816':'PYT3T_07198','SK00104930':'PYT3T_07280','SK00440811':'PYT3T_07369','SK00104948':'PYT3T_07246','SK00440752':'PYT3T_07397','SK00440763':'PYT3T_07361'}
file_dub = ['pm', 'cal']
file_in_folder = os.listdir(src)
for file in file_in_folder:
    print(file)
    if change_name_index.get(file[:-4]):
        for type in file_dub:
            dst = f'/home/mdr/forms/py_test_ui/REPORTS/{change_name_index.get(file[:-4])}_2025_{type}.pdf'
            full_file_path = os.path.join(src, file)
            if os.path.exists(dst):
                print(f"Destination '{dst}' already exists. Skipping copy.")
            else:
                shutil.copy(full_file_path, dst)
                print(f"File duplicated from '{full_file_path}' to '{dst}'")
        os.remove(full_file_path)
        print(f"File '{full_file_path}' has been removed.")
    else:
        print(f"File '{file}' not found in the change_name_index list. Skipping.")