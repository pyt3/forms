import tkinter as tk
from tkinter import ttk

import pandas as pd
from file_dialog import select_file

app = tk.Tk()
app.title("Auto Attach Files")
app.geometry("700x500")

# set app icon
app.iconbitmap("app-icon.ico")

# set app background color
app.configure(bg="#1f1f1f")       
        
def read_file(file_path_entry):
    select_file(file_path_entry)
    if file_path_entry.get() == "":
        return
    try:
        # show progress bar
        app.update_idletasks()
        app.update()
        pb = ttk.Progressbar(app, orient="horizontal", length=200, mode="indeterminate")
        pb.pack(fill="x", expand=False, side="left", padx=10, pady=10)
        pb.start(10)
        # read file
        print(file_path_entry.get())
        master_df = (pd.read_excel(file_path_entry.get(), sheet_name="Sheet1")).dropna(subset=["CODE"])
        df = master_df.applymap(str)
        # tk.messagebox.showinfo("กำลังอ่านไฟล์", "กำลังอ่านไฟล์ กรุณารอสักครู่", parent=app)
        with pd.ExcelWriter(file_path_entry.get(), mode='a', engine='openpyxl', if_sheet_exists='replace') as writer:
            # count row['PM-STATUS] to lower case = 'pass'
            pass_pm = 0
            pass_cal = 0
            attach_pm = 0
            attach_cal = 0
            for index, row in df.iterrows():
                if row['PM-STATUS'].lower() == 'pass':
                    pass_pm += 1
                if row['CAL-STATUS'].lower() == 'pass':
                    pass_cal += 1
                if row['ATTACH-FILE-PM'].lower() == 'yes':
                    attach_pm += 1
                if row['ATTACH-FILE-CAL'].lower() == 'yes':
                    attach_cal += 1
            # row_summary_label.config(text="ตรวจพบเครื่องมือแพทย์ทั้งหมด: " + str(len(df)) + " เครื่อง\n"+ "ตรวจพบเครื่องมือแพทย์ที่ผ่าน PM: " + str(pass_pm) + " เครื่อง\n" + "ตรวจพบเครื่องมือแพทย์ที่ผ่าน CAL: " + str(pass_cal) + " เครื่อง\n" + "ตรวจพบเครื่องมือแพทย์ที่ต้องแนบไฟล์ PM: " + str(attach_pm) + " เครื่อง\n" + "ตรวจพบเครื่องมือแพทย์ที่ต้องแนบไฟล์ CAL: " + str(attach_cal) + " เครื่อง\n", font=("Arial", 12), bg="#1f1f1f", fg="white")
            row_summary_label.config(text=f'''ตรวจพบเครื่องมือแพทย์ทั้งหมด: {len(df)} เครื่อง
ตรวจพบเครื่องมือแพทย์ที่ผ่าน PM: {pass_pm} เครื่อง
ตรวจพบเครื่องมือแพทย์ที่ผ่าน CAL: {pass_cal} เครื่อง
ตรวจพบเครื่องมือแพทย์ที่ต้องแนบไฟล์ PM: {attach_pm} เครื่อง
ตรวจพบเครื่องมือแพทย์ที่ต้องแนบไฟล์ CAL: {attach_cal} เครื่อง
''', font=("Arial", 12), bg="#1f1f1f", fg="white")
            row_summary_label.pack(fill="x", expand=False, side="left", padx=10, pady=10)
            # remove progress bar
            pb.stop()
            pb.pack_forget()
            pb.destroy()
            # show message box
            tk.messagebox.showinfo("อ่านไฟล์สำเร็จ", "อ่านไฟล์สำเร็จ กรุณาตรวจสอบข้อมูล", parent=app)
            
                    
                    
                
        return
    except Exception as e:
        # close message box
        app.update_idletasks()
        app.update()
        
        print('error')
        print(e)
        # if exception is permission denied
        if "PermissionError" in str(e):
            tk.messagebox.showerror("ไม่สามารถเข้าถึงได้", "ไฟล์ที่เลือกอาจถูกโปรแกรมอื่นใช้งานอยู่ กรุณาปิดโปรแกรมที่เปิดไฟล์นี้อยู่ก่อน", parent=app)
        else:     
            tk.messagebox.showerror("ไฟล์ไม่ถูกต้อง", "ไฟล์ที่เลือกไม่ถูกต้อง กรุณาเลือกไฟล์ใหม่อีกครั้ง", parent=app)
        file_path_entry.config(state="normal")
        file_path_entry.delete(0, "end")
        file_path_entry.config(state="readonly")
        return
        
    
    


# file path label at top left
file_path_label = tk.Label(app, text="Data File", font=("Arial", 12), bg="#1f1f1f", fg="white")
file_path_label.pack(fill="x", expand=False, side="left", padx=10, pady=10)

# file path entry at top center
file_path_entry = tk.Entry(app, state="readonly", font=("Arial", 12))
file_path_entry.pack(fill="x", expand=True, side="left" , padx=10, pady=10)

# open file button at top right with rounded corner
open_file_button = tk.Button(app, text="Select File", command=lambda: read_file(file_path_entry), bg="#0b5ed7", fg="white", font=("Arial", 12), activebackground="#d3d4d5", activeforeground="black", cursor="hand2")
open_file_button.pack(fill="x", expand=False, side="left", padx=10, pady=10)

# row summary label at row 1 left
row_summary_label = tk.Label(app, font=("Arial", 12), bg="#1f1f1f", fg="white")


# run app
app.mainloop()
