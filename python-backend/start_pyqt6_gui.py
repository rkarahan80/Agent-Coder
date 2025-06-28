#!/usr/bin/env python3
"""
Agent Coder PyQt6 GUI Launcher
Starts both the Python backend and modern PyQt6 GUI interface
"""

import sys
import os
import subprocess
import threading
import time
from PyQt6.QtWidgets import QApplication, QMessageBox
from PyQt6.QtCore import QTimer

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'PyQt6',
        'fastapi',
        'uvicorn',
        'requests',
        'python-dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'PyQt6':
                import PyQt6
            else:
                __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("Missing required packages:")
        for package in missing_packages:
            print(f"  - {package}")
        print("\nInstall them with:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    return True

def start_backend():
    """Start the FastAPI backend server"""
    try:
        # Change to the python-backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(backend_dir)
        
        # Start the backend server
        subprocess.run([
            sys.executable, "enhanced_main.py"
        ], check=True)
    except Exception as e:
        print(f"Failed to start backend: {e}")

def start_gui():
    """Start the PyQt6 GUI interface"""
    try:
        # Import and start the GUI
        from gui_interface_pyqt6 import main as gui_main
        gui_main()
    except Exception as e:
        print(f"Failed to start GUI: {e}")
        # Show error dialog if PyQt6 is available
        try:
            app = QApplication(sys.argv)
            QMessageBox.critical(None, "Error", f"Failed to start GUI: {e}")
        except:
            pass

def main():
    """Main launcher function"""
    print("Agent Coder Pro - PyQt6 GUI Launcher")
    print("=" * 45)
    
    # Check dependencies
    if not check_dependencies():
        input("Press Enter to exit...")
        return
    
    print("Starting Agent Coder Pro...")
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    print("Starting backend server...")
    time.sleep(3)
    
    # Start GUI in main thread
    print("Starting PyQt6 GUI interface...")
    start_gui()

if __name__ == "__main__":
    main()