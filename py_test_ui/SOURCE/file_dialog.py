from tkinter import filedialog

def select_file(file_path_entry):
    # open file dialog for select excel file and not open file
    file = filedialog.askopenfile(filetypes=[("Excel files", "*.xlsx")], title="Select Excel File")
    if file:
        file_path_entry.config(state="normal")
        file_path_entry.delete(0, "end")
        file_path_entry.insert(0, file.name)
        file_path_entry.config(state="readonly")
    else:
        file_path_entry.config(state="normal")
        file_path_entry.delete(0, "end")
        file_path_entry.config(state="readonly")
    