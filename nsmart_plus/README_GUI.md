# NSmart File Management System - GUI

A graphical user interface for managing file downloads from NSmart and file uploads to NSmart+.

## Features

- **Configuration Menu**: Store and manage credentials for NSmart and NSmart+ systems
- **Download Files Menu**: Download files from NSmart with real-time logging
- **Upload Files Menu**: Upload files to NSmart+ with real-time logging
- Browser visibility toggle for debugging

## Installation

1. Install required dependencies:
```bash
pip install -r requirements.txt
```

2. Activate your virtual environment (if using one):
```bash
source .venv/bin/activate  # On Linux/Mac
# or
.venv\Scripts\activate  # On Windows
```

## Usage

### Running the GUI

```bash
python main_gui.py
```

### Configuration Tab

1. Click on the "⚙️ Configuration" tab
2. Enter your NSmart credentials:
   - Username
   - Password
3. Enter your NSmart+ credentials:
   - Username
   - Password
4. Click "💾 Save Configuration" to store your credentials

The credentials are saved in `config/config.json` and will be used automatically for downloads and uploads.

### Download Files Tab

1. Click on the "⬇️ Download Files" tab
2. (Optional) Check "Show Browser" to see the browser automation in action
3. Click "▶️ Start Download"
4. Monitor the progress in the log window
5. Use "🗑️ Clear Logs" to clear the log window

### Upload Files Tab

1. Click on the "⬆️ Upload Files" tab
2. (Optional) Check "Show Browser" to see the browser automation in action
3. Click "▶️ Start Upload"
4. Monitor the progress in the log window
5. Use "🗑️ Clear Logs" to clear the log window

## Running Original Scripts

You can still run the original scripts from the command line:

```bash
# Download files
python download_files.py

# Upload files
python upload_file.py
```

These scripts will prompt you to show/hide the browser window.

## File Structure

```
nsmart_plus/
├── main_gui.py           # Main GUI application
├── config_manager.py     # Configuration management
├── download_files.py     # Download functionality
├── upload_file.py        # Upload functionality
├── browser.py           # Browser automation utilities
├── utils.py             # Utility functions
├── requirements.txt     # Python dependencies
├── config/
│   └── config.json     # Configuration file (auto-generated)
└── invent/             # Downloaded/uploaded files directory
```

## Notes

- The GUI runs download and upload operations in separate threads to prevent freezing
- All logs from the console are redirected to the GUI log windows
- Credentials are stored in plain text in `config/config.json` - keep this file secure
- The system maintains a log of uploaded IDs in `uploaded_ids.log` to prevent duplicate uploads

## Troubleshooting

If you encounter issues:

1. **Browser driver errors**: Make sure you have Chrome, Firefox, Edge, or Brave installed
2. **Import errors**: Ensure all dependencies are installed with `pip install -r requirements.txt`
3. **Login failures**: Check your credentials in the Configuration tab
4. **GUI freezing**: The operations run in background threads; wait for completion

## Algorithm Preservation

The core algorithms for downloading and uploading files remain unchanged. The refactoring only:
- Added GUI support
- Separated configuration management
- Added credential parameter passing
- Maintained all original functionality
