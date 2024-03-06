import os
import shutil
path = os.path.dirname(os.path.realpath(__file__))
folder = os.path.join(path, 'callab')

for subdir, dirs, files in os.walk(folder):
    for file in files:
        print(file)
        file_path = os.path.join(subdir, file)
        shutil.move(file_path, os.path.join(folder, file))
