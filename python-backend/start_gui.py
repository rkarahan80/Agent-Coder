#!/usr/bin/env python3
"""
Agent Coder GUI Launcher
Starts both the Python backend and GUI interface
"""

import sys
import os
import subprocess
import threading
import time
import tkinter as tk
from tkinter import messagebox

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'requests',
        'python-dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
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
    """Start the GUI interface"""
    try:
        # Import and start the GUI
        from gui_interface import main as gui_main
        gui_main()
    except Exception as e:
        print(f"Failed to start GUI: {e}")
        messagebox.showerror("Error", f"Failed to start GUI: {e}")

def main():
    """Main launcher function"""
    print("Agent Coder - Python GUI Launcher")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        input("Press Enter to exit...")
        return
    
    print("Starting Agent Coder...")
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    print("Starting backend server...")
    time.sleep(3)
    
    # Start GUI in main thread
    print("Starting GUI interface...")
    start_gui()

if __name__ == "__main__":
    main()