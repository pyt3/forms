"""Configuration manager for storing and retrieving credentials."""
import json
import os
from pathlib import Path


class ConfigManager:
    """Manages configuration settings for the application."""
    
    def __init__(self, config_file='config/config.json'):
        """Initialize the config manager with a config file path."""
        self.config_file = config_file
        self.config_dir = os.path.dirname(config_file)
        self._ensure_config_dir()
        self.config = self._load_config()
    
    def _ensure_config_dir(self):
        """Ensure the config directory exists."""
        if self.config_dir and not os.path.exists(self.config_dir):
            os.makedirs(self.config_dir, exist_ok=True)
    
    def _load_config(self):
        """Load configuration from file."""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading config: {e}")
                return self._default_config()
        return self._default_config()
    
    def _default_config(self):
        """Return default configuration."""
        return {
            "SITE": "PYT3",
            "NSMART_USERNAME": "",
            "NSMART_PASSWORD": "",
            "NSMART_PLUS_USERNAME": "",
            "NSMART_PLUS_PASSWORD": "",
            "SUP_NAME": "",
            "SUP_ID": "",
            "SESSION_ID": "",
            "Last run": "",
            "PHPSESSID_Ecert": "",
            "SOURCE_FOLDER": "",
            "FILTER_URL": ""
        }
    
    def save_config(self):
        """Save configuration to file."""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error saving config: {e}")
            return False
    
    def get(self, key, default=None):
        """Get a configuration value."""
        return self.config.get(key, default)
    
    def set(self, key, value):
        """Set a configuration value."""
        self.config[key] = value
    
    def get_nsmart_credentials(self):
        """Get nsmart credentials."""
        return {
            'username': self.config.get('NSMART_USERNAME', ''),
            'password': self.config.get('NSMART_PASSWORD', '')
        }
    
    def get_nsmart_plus_credentials(self):
        """Get nsmart+ credentials."""
        return {
            'username': self.config.get('NSMART_PLUS_USERNAME', ''),
            'password': self.config.get('NSMART_PLUS_PASSWORD', '')
        }
    
    def set_nsmart_credentials(self, username, password):
        """Set nsmart credentials."""
        self.config['NSMART_USERNAME'] = username
        self.config['NSMART_PASSWORD'] = password
    
    def set_nsmart_plus_credentials(self, username, password):
        """Set nsmart+ credentials."""
        self.config['NSMART_PLUS_USERNAME'] = username
        self.config['NSMART_PLUS_PASSWORD'] = password
    
    def get_source_folder(self):
        """Get source folder path."""
        return self.config.get('SOURCE_FOLDER', '')
    
    def set_source_folder(self, folder_path):
        """Set source folder path."""
        self.config['SOURCE_FOLDER'] = folder_path

    def get_filter_url(self):
        """Get filter URL."""
        return self.config.get('FILTER_URL', '')
    
    def set_filter_url(self, url):
        """Set filter URL."""
        self.config['FILTER_URL'] = url