"""Main GUI application for NSmart File Management System."""
import ttkbootstrap as ttk
from ttkbootstrap.constants import *
from tkinter import scrolledtext, messagebox, filedialog, simpledialog
import tkinter as tk
import threading
import sys
import io
import builtins
from config_manager import ConfigManager
from download_files import nsmartFileDownload
from upload_file import nsmartPlusFileUpload


class LogRedirector(io.StringIO):
    """Redirects stdout/stderr to a tkinter text widget."""
    
    def __init__(self, text_widget, tag="stdout"):
        super().__init__()
        self.text_widget = text_widget
        self.tag = tag
    
    def write(self, string):
        if string.strip():  # Only write non-empty strings
            self.text_widget.after(0, self._write, string)
    
    def _write(self, string):
        self.text_widget.insert(tk.END, string)
        self.text_widget.see(tk.END)
        self.text_widget.update_idletasks()
    
    def flush(self):
        pass


class NSmartGUI:
    """Main GUI application for NSmart File Management."""
    
    def __init__(self, root):
        """Initialize the GUI."""
        self.root = root
        self.root.title("🗂️ NSmart File Management System")
        self.root.geometry("1000x750")
        
        # Initialize config manager
        self.config_manager = ConfigManager()
        
        # Create status bar first (needed by other components)
        self.status_bar = ttk.Label(root, text="✓ Ready", bootstyle="inverse-secondary")
        self.status_bar.pack(side=BOTTOM, fill=X, padx=5, pady=5)
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(root, bootstyle="primary")
        self.notebook.pack(fill=BOTH, expand=True, padx=10, pady=10)
        
        # Create tabs
        self.create_config_tab()
        self.create_download_tab()
        self.create_upload_tab()
    
    def create_config_tab(self):
        """Create the configuration tab."""
        config_frame = ttk.Frame(self.notebook, padding=20)
        self.notebook.add(config_frame, text="⚙️  Configuration")
        
        # Main container with padding
        main_container = ttk.Frame(config_frame)
        main_container.pack(fill=BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(
            main_container, 
            text="⚙️ System Configuration", 
            font=("Segoe UI", 18, "bold"),
            bootstyle="primary"
        )
        title_label.pack(pady=(0, 25))
        
        # NSmart credentials section
        nsmart_frame = ttk.Labelframe(
            main_container, 
            text="🔐 NSmart Credentials", 
            padding=20,
            bootstyle="primary"
        )
        nsmart_frame.pack(fill=X, pady=(0, 20))
        
        ttk.Label(nsmart_frame, text="Username:", font=("Segoe UI", 10)).grid(
            row=0, column=0, sticky=W, pady=8, padx=(0, 10)
        )
        self.nsmart_username = ttk.Entry(nsmart_frame, width=45, font=("Segoe UI", 10))
        self.nsmart_username.grid(row=0, column=1, sticky=EW, pady=8)
        
        ttk.Label(nsmart_frame, text="Password:", font=("Segoe UI", 10)).grid(
            row=1, column=0, sticky=W, pady=8, padx=(0, 10)
        )
        self.nsmart_password = ttk.Entry(nsmart_frame, width=45, show="•", font=("Segoe UI", 10))
        self.nsmart_password.grid(row=1, column=1, sticky=EW, pady=8)
        
        self.nsmart_show_pass = tk.BooleanVar(value=False)
        ttk.Checkbutton(
            nsmart_frame, 
            text="👁️ Show", 
            variable=self.nsmart_show_pass,
            command=lambda: self.toggle_password(self.nsmart_password, self.nsmart_show_pass),
            bootstyle="primary-round-toggle"
        ).grid(row=1, column=2, padx=10)
        
        nsmart_frame.columnconfigure(1, weight=1)
        
        # NSmart+ credentials section
        nsmart_plus_frame = ttk.Labelframe(
            main_container, 
            text="🔐 NSmart+ Credentials", 
            padding=20,
            bootstyle="success"
        )
        nsmart_plus_frame.pack(fill=X, pady=(0, 20))
        
        ttk.Label(nsmart_plus_frame, text="Username:", font=("Segoe UI", 10)).grid(
            row=0, column=0, sticky=W, pady=8, padx=(0, 10)
        )
        self.nsmart_plus_username = ttk.Entry(nsmart_plus_frame, width=45, font=("Segoe UI", 10))
        self.nsmart_plus_username.grid(row=0, column=1, sticky=EW, pady=8)
        
        ttk.Label(nsmart_plus_frame, text="Password:", font=("Segoe UI", 10)).grid(
            row=1, column=0, sticky=W, pady=8, padx=(0, 10)
        )
        self.nsmart_plus_password = ttk.Entry(nsmart_plus_frame, width=45, show="•", font=("Segoe UI", 10))
        self.nsmart_plus_password.grid(row=1, column=1, sticky=EW, pady=8)
        
        self.nsmart_plus_show_pass = tk.BooleanVar(value=False)
        ttk.Checkbutton(
            nsmart_plus_frame, 
            text="👁️ Show", 
            variable=self.nsmart_plus_show_pass,
            command=lambda: self.toggle_password(self.nsmart_plus_password, self.nsmart_plus_show_pass),
            bootstyle="success-round-toggle"
        ).grid(row=1, column=2, padx=10)
        
        nsmart_plus_frame.columnconfigure(1, weight=1)
        
        # Source Folder section
        folder_frame = ttk.Labelframe(
            main_container, 
            text="📁 Source Folder", 
            padding=20,
            bootstyle="info"
        )
        folder_frame.pack(fill=X, pady=(0, 20))
        
        ttk.Label(folder_frame, text="Folder Path:", font=("Segoe UI", 10)).grid(
            row=0, column=0, sticky=W, pady=8, padx=(0, 10)
        )
        self.source_folder = ttk.Entry(folder_frame, width=45, font=("Segoe UI", 10))
        self.source_folder.grid(row=0, column=1, sticky=EW, pady=8)
        
        ttk.Button(
            folder_frame,
            text="📂 Browse",
            command=self.browse_folder,
            bootstyle="info-outline",
            width=12
        ).grid(row=0, column=2, padx=10)
        
        folder_frame.columnconfigure(1, weight=1)
        
        # Info label
        info_label = ttk.Label(
            folder_frame,
            text="ℹ️ This folder will be used for downloading and uploading files",
            font=("Segoe UI", 9),
            bootstyle="secondary"
        )
        info_label.grid(row=1, column=0, columnspan=3, sticky=W, pady=(5, 0))
        
        # Buttons frame
        button_frame = ttk.Frame(main_container)
        button_frame.pack(fill=X, pady=(10, 0))
        
        ttk.Button(
            button_frame, 
            text="💾 Save Configuration", 
            command=self.save_config,
            bootstyle="success",
            width=20,
        ).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(
            button_frame, 
            text="🔄 Reload", 
            command=self.load_config,
            bootstyle="info-outline",
            width=15
        ).pack(side=tk.LEFT, padx=5)
        
        # Load existing config
        self.load_config()
    
    def browse_folder(self):
        """Open folder browser dialog."""
        folder_path = filedialog.askdirectory(
            title="Select Source Folder",
            initialdir=self.source_folder.get() or "~"
        )
        if folder_path:
            self.source_folder.delete(0, tk.END)
            self.source_folder.insert(0, folder_path)

    def gui_input(self, prompt=""):
        """Handle input() calls from background threads via a dialog."""
        result = {"value": ""}
        done = threading.Event()

        def ask():
            # Simple dialog to capture user input; empty string if cancelled
            resp = simpledialog.askstring("Input Required", prompt, parent=self.root)
            result["value"] = "" if resp is None else resp
            done.set()

        self.root.after(0, ask)
        done.wait()
        return result["value"]
    
    def toggle_password(self, entry_widget, show_var):
        """Toggle password visibility for an entry widget."""
        if show_var.get():
            entry_widget.config(show="")
        else:
            entry_widget.config(show="•")
    
    def create_download_tab(self):
        """Create the download files tab."""
        download_frame = ttk.Frame(self.notebook, padding=15)
        self.notebook.add(download_frame, text="⬇️  Download Files")
        
        # Main container
        main_container = ttk.Frame(download_frame)
        main_container.pack(fill=BOTH, expand=True)
        
        # Title and controls
        control_frame = ttk.Frame(main_container)
        control_frame.pack(fill=X, pady=(0, 15))
        
        ttk.Label(
            control_frame, 
            text="⬇️ Download Files from NSmart", 
            font=("Segoe UI", 16, "bold"),
            bootstyle="info"
        ).pack(side=LEFT)
        
        # Show browser checkbox
        self.download_show_browser = tk.BooleanVar(value=False)
        ttk.Checkbutton(
            control_frame, 
            text="🌐 Show Browser", 
            variable=self.download_show_browser,
            bootstyle="info-round-toggle"
        ).pack(side=RIGHT, padx=10)
        
        ttk.Button(
            control_frame, 
            text="▶️ Start Download", 
            command=self.start_download,
            bootstyle="success",
            width=18
        ).pack(side=RIGHT, padx=5)
        
        # Log area
        log_frame = ttk.Labelframe(main_container, text="📋 Download Logs", padding=10, bootstyle="info")
        log_frame.pack(fill=BOTH, expand=True)
        
        self.download_log = scrolledtext.ScrolledText(
            log_frame, 
            wrap=tk.WORD, 
            height=20, 
            bg="#1e1e1e", 
            fg="#00ff00",
            font=("Consolas", 9),
            insertbackground="white"
        )
        self.download_log.pack(fill=BOTH, expand=True)
        
        # Clear button
        ttk.Button(
            main_container, 
            text="🗑️ Clear Logs", 
            command=lambda: self.download_log.delete(1.0, tk.END),
            bootstyle="warning-outline"
        ).pack(pady=10)
    
    def create_upload_tab(self):
        """Create the upload files tab."""
        upload_frame = ttk.Frame(self.notebook, padding=15)
        self.notebook.add(upload_frame, text="⬆️  Upload Files")
        
        # Main container
        main_container = ttk.Frame(upload_frame)
        main_container.pack(fill=BOTH, expand=True)
        
        # Title and controls
        control_frame = ttk.Frame(main_container)
        control_frame.pack(fill=X, pady=(0, 15))
        
        ttk.Label(
            control_frame, 
            text="⬆️ Upload Files to NSmart+", 
            font=("Segoe UI", 16, "bold"),
            bootstyle="success"
        ).pack(side=LEFT)
        
        # Note about browser
        ttk.Label(
            control_frame,
            text="🌐 Browser will be shown during upload",
            font=("Segoe UI", 9),
            bootstyle="secondary"
        ).pack(side=RIGHT, padx=10)
        
        ttk.Button(
            control_frame, 
            text="▶️ Start Upload", 
            command=self.start_upload,
            bootstyle="primary",
            width=18
        ).pack(side=RIGHT, padx=5)
        
        # Log area
        log_frame = ttk.Labelframe(main_container, text="📋 Upload Logs", padding=10, bootstyle="success")
        log_frame.pack(fill=BOTH, expand=True)
        
        self.upload_log = scrolledtext.ScrolledText(
            log_frame, 
            wrap=tk.WORD, 
            height=20, 
            bg="#1e1e1e", 
            fg="#00ff00",
            font=("Consolas", 9),
            insertbackground="white"
        )
        self.upload_log.pack(fill=BOTH, expand=True)
        
        # Clear button
        ttk.Button(
            main_container, 
            text="🗑️ Clear Logs", 
            command=lambda: self.upload_log.delete(1.0, tk.END),
            bootstyle="warning-outline"
        ).pack(pady=10)
    
    def save_config(self):
        """Save configuration to file."""
        # Get values from form
        nsmart_user = self.nsmart_username.get()
        nsmart_pass = self.nsmart_password.get()
        nsmart_plus_user = self.nsmart_plus_username.get()
        nsmart_plus_pass = self.nsmart_plus_password.get()
        source_folder = self.source_folder.get()
        
        # Update config manager
        self.config_manager.set_nsmart_credentials(nsmart_user, nsmart_pass)
        self.config_manager.set_nsmart_plus_credentials(nsmart_plus_user, nsmart_plus_pass)
        self.config_manager.set_source_folder(source_folder)
        
        # Save to file
        if self.config_manager.save_config():
            messagebox.showinfo("✓ Success", "Configuration saved successfully!", parent=self.root)
            self.status_bar.config(text="✓ Configuration saved successfully")
        else:
            messagebox.showerror("✗ Error", "Failed to save configuration", parent=self.root)
            self.status_bar.config(text="✗ Failed to save configuration")
    
    def load_config(self):
        """Load configuration from file."""
        # Reload config
        self.config_manager.config = self.config_manager._load_config()
        
        # Get credentials
        nsmart_creds = self.config_manager.get_nsmart_credentials()
        nsmart_plus_creds = self.config_manager.get_nsmart_plus_credentials()
        
        # Update form fields
        self.nsmart_username.delete(0, tk.END)
        self.nsmart_username.insert(0, nsmart_creds['username'])
        
        self.nsmart_password.delete(0, tk.END)
        self.nsmart_password.insert(0, nsmart_creds['password'])
        
        self.nsmart_plus_username.delete(0, tk.END)
        self.nsmart_plus_username.insert(0, nsmart_plus_creds['username'])
        
        self.nsmart_plus_password.delete(0, tk.END)
        self.nsmart_plus_password.insert(0, nsmart_plus_creds['password'])
        
        self.source_folder.delete(0, tk.END)
        self.source_folder.insert(0, self.config_manager.get_source_folder())
        
        self.status_bar.config(text="✓ Configuration loaded successfully")
    
    def start_download(self):
        """Start the download process in a separate thread."""
        def download_thread():
            # Redirect stdout to the log widget
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            old_input = builtins.input
            
            sys.stdout = LogRedirector(self.download_log)
            sys.stderr = LogRedirector(self.download_log)
            builtins.input = self.gui_input
            
            try:
                self.status_bar.config(text="⏳ Downloading files...")
                self.download_log.insert(tk.END, "=== Starting Download Process ===\n")
                
                # Run download with show_browser parameter
                show_browser = self.download_show_browser.get()
                nsmartFileDownload(show_browser=show_browser, 
                                  config_manager=self.config_manager)
                
                self.download_log.insert(tk.END, "\n=== Download Process Completed ===\n")
                self.status_bar.config(text="✓ Download completed successfully")
            except Exception as e:
                self.download_log.insert(tk.END, f"\n❌ Error: {str(e)}\n")
                self.status_bar.config(text="✗ Download failed")
            finally:
                sys.stdout = old_stdout
                sys.stderr = old_stderr
                builtins.input = old_input
        
        # Run in thread to prevent GUI freezing
        thread = threading.Thread(target=download_thread, daemon=True)
        thread.start()
    
    def start_upload(self):
        """Start the upload process in a separate thread."""
        def upload_thread():
            # Redirect stdout to the log widget
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            old_input = builtins.input
            
            sys.stdout = LogRedirector(self.upload_log)
            sys.stderr = LogRedirector(self.upload_log)
            builtins.input = self.gui_input
            
            try:
                self.status_bar.config(text="⏳ Uploading files...")
                self.upload_log.insert(tk.END, "=== Starting Upload Process ===\n")
                
                # Run upload with browser always visible
                nsmartPlusFileUpload(show_browser=True, 
                                    config_manager=self.config_manager)
                
                self.upload_log.insert(tk.END, "\n=== Upload Process Completed ===\n")
                self.status_bar.config(text="✓ Upload completed successfully")
            except Exception as e:
                self.upload_log.insert(tk.END, f"\n❌ Error: {str(e)}\n")
                self.status_bar.config(text="✗ Upload failed")
            finally:
                sys.stdout = old_stdout
                sys.stderr = old_stderr
                builtins.input = old_input
        
        # Run in thread to prevent GUI freezing
        thread = threading.Thread(target=upload_thread, daemon=True)
        thread.start()


def main():
    """Main entry point for the GUI application."""
    root = ttk.Window(
        title="🗂️ NSmart File Management System",
        themename="darkly",  # Modern dark theme
        size=(1000, 750)
    )
    app = NSmartGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()
