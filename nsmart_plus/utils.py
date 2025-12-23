import os
import sys

def get_script_directory():
    """Get the directory path for scripts based on whether we're running as exe or script."""
    return os.path.dirname(sys.executable) if getattr(sys, 'frozen', False) else os.path.dirname(os.path.realpath(__file__))


def sanitize_thai_filename(filename):
    import re
    from pythainlp.transliterate import romanize
    
    name, ext = os.path.splitext(filename)
    
    # 1. Convert Thai characters to English phonetics (Romanization)
    # Using 'royin' engine which is the Thai Royal Institute standard
    roman_name = romanize(name, engine="royin")
    
    # 2. Clean up: Replace spaces with underscores and remove special chars
    clean_name = re.sub(r'[^a-zA-Z0-9\-_]', '', roman_name.replace(" ", "_")).lower()
    
    return f"{clean_name}{ext}"

def get_file_extension(content_type):
    import mimetypes
    ext = mimetypes.guess_extension(content_type)
    return ext