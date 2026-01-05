#!/usr/bin/env python3
"""
Launcher script for NSmart File Management System GUI
"""

if __name__ == "__main__":
    try:
        from main_gui import main
        main()
    except ImportError as e:
        print(f"Error: Missing dependency - {e}")
        print("\nPlease install required packages:")
        print("  pip install -r requirements.txt")
    except Exception as e:
        print(f"Error starting application: {e}")
        import traceback
        traceback.print_exc()
