import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
import threading
import requests
import json
import os
from datetime import datetime
import subprocess
import sys

class AgentCoderGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Agent Coder - Python GUI Interface")
        self.root.geometry("1200x800")
        self.root.configure(bg='#f0f0f0')
        
        # Backend URL
        self.backend_url = "http://localhost:8000"
        self.backend_process = None
        
        # Initialize variables
        self.current_provider = tk.StringVar(value="openai")
        self.current_model = tk.StringVar(value="gpt-4-turbo-preview")
        self.api_keys = {
            "openai": tk.StringVar(),
            "gemini": tk.StringVar(),
            "claude": tk.StringVar()
        }
        
        self.setup_ui()
        self.start_backend()
        
    def setup_ui(self):
        # Create main notebook for tabs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Chat Tab
        self.setup_chat_tab()
        
        # Code Editor Tab
        self.setup_editor_tab()
        
        # Project Analytics Tab
        self.setup_analytics_tab()
        
        # Settings Tab
        self.setup_settings_tab()
        
        # Backend Status Tab
        self.setup_backend_tab()
        
    def setup_chat_tab(self):
        chat_frame = ttk.Frame(self.notebook)
        self.notebook.add(chat_frame, text="AI Chat")
        
        # Chat display
        self.chat_display = scrolledtext.ScrolledText(
            chat_frame, 
            wrap=tk.WORD, 
            height=20,
            font=("Consolas", 10)
        )
        self.chat_display.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Input frame
        input_frame = ttk.Frame(chat_frame)
        input_frame.pack(fill=tk.X, padx=10, pady=(0, 10))
        
        self.chat_input = tk.Text(input_frame, height=3, font=("Consolas", 10))
        self.chat_input.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        send_button = ttk.Button(
            input_frame, 
            text="Send", 
            command=self.send_message
        )
        send_button.pack(side=tk.RIGHT, padx=(10, 0))
        
        # Bind Enter key
        self.chat_input.bind("<Control-Return>", lambda e: self.send_message())
        
    def setup_editor_tab(self):
        editor_frame = ttk.Frame(self.notebook)
        self.notebook.add(editor_frame, text="Code Editor")
        
        # Toolbar
        toolbar = ttk.Frame(editor_frame)
        toolbar.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Button(toolbar, text="New File", command=self.new_file).pack(side=tk.LEFT, padx=5)
        ttk.Button(toolbar, text="Open File", command=self.open_file).pack(side=tk.LEFT, padx=5)
        ttk.Button(toolbar, text="Save File", command=self.save_file).pack(side=tk.LEFT, padx=5)
        ttk.Button(toolbar, text="Analyze Code", command=self.analyze_code).pack(side=tk.LEFT, padx=5)
        
        # File list and editor
        content_frame = ttk.Frame(editor_frame)
        content_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # File list
        file_frame = ttk.Frame(content_frame)
        file_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        
        ttk.Label(file_frame, text="Project Files").pack()
        self.file_listbox = tk.Listbox(file_frame, width=30)
        self.file_listbox.pack(fill=tk.BOTH, expand=True)
        self.file_listbox.bind('<<ListboxSelect>>', self.on_file_select)
        
        # Code editor
        editor_container = ttk.Frame(content_frame)
        editor_container.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        ttk.Label(editor_container, text="Code Editor").pack()
        self.code_editor = scrolledtext.ScrolledText(
            editor_container,
            wrap=tk.NONE,
            font=("Consolas", 11),
            bg="white",
            fg="black"
        )
        self.code_editor.pack(fill=tk.BOTH, expand=True)
        
        # Analysis results
        analysis_frame = ttk.LabelFrame(editor_frame, text="Code Analysis Results")
        analysis_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.analysis_display = scrolledtext.ScrolledText(
            analysis_frame,
            height=8,
            font=("Consolas", 9)
        )
        self.analysis_display.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
    def setup_analytics_tab(self):
        analytics_frame = ttk.Frame(self.notebook)
        self.notebook.add(analytics_frame, text="Project Analytics")
        
        # Control buttons
        control_frame = ttk.Frame(analytics_frame)
        control_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Button(
            control_frame, 
            text="Analyze Project", 
            command=self.analyze_project
        ).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(
            control_frame, 
            text="Generate Report", 
            command=self.generate_report
        ).pack(side=tk.LEFT, padx=5)
        
        # Analytics display
        self.analytics_display = scrolledtext.ScrolledText(
            analytics_frame,
            wrap=tk.WORD,
            font=("Consolas", 10)
        )
        self.analytics_display.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
    def setup_settings_tab(self):
        settings_frame = ttk.Frame(self.notebook)
        self.notebook.add(settings_frame, text="Settings")
        
        # API Configuration
        api_frame = ttk.LabelFrame(settings_frame, text="API Configuration")
        api_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Provider selection
        provider_frame = ttk.Frame(api_frame)
        provider_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(provider_frame, text="AI Provider:").pack(side=tk.LEFT)
        provider_combo = ttk.Combobox(
            provider_frame,
            textvariable=self.current_provider,
            values=["openai", "gemini", "claude"],
            state="readonly"
        )
        provider_combo.pack(side=tk.LEFT, padx=10)
        
        # Model selection
        model_frame = ttk.Frame(api_frame)
        model_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(model_frame, text="Model:").pack(side=tk.LEFT)
        model_combo = ttk.Combobox(
            model_frame,
            textvariable=self.current_model,
            values=[
                "gpt-4-turbo-preview", "gpt-4", "gpt-3.5-turbo",
                "gemini-pro", "gemini-pro-vision",
                "claude-3-opus-20240229", "claude-3-sonnet-20240229"
            ],
            state="readonly"
        )
        model_combo.pack(side=tk.LEFT, padx=10)
        
        # API Keys
        for provider in ["openai", "gemini", "claude"]:
            key_frame = ttk.Frame(api_frame)
            key_frame.pack(fill=tk.X, padx=10, pady=5)
            
            ttk.Label(key_frame, text=f"{provider.title()} API Key:").pack(side=tk.LEFT)
            key_entry = ttk.Entry(
                key_frame,
                textvariable=self.api_keys[provider],
                show="*",
                width=50
            )
            key_entry.pack(side=tk.LEFT, padx=10, fill=tk.X, expand=True)
        
        # Save button
        ttk.Button(
            api_frame,
            text="Save Configuration",
            command=self.save_config
        ).pack(pady=10)
        
    def setup_backend_tab(self):
        backend_frame = ttk.Frame(self.notebook)
        self.notebook.add(backend_frame, text="Backend Status")
        
        # Status display
        status_frame = ttk.LabelFrame(backend_frame, text="Backend Status")
        status_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.status_label = ttk.Label(status_frame, text="Backend: Starting...")
        self.status_label.pack(pady=10)
        
        # Control buttons
        control_frame = ttk.Frame(status_frame)
        control_frame.pack(pady=10)
        
        ttk.Button(
            control_frame,
            text="Start Backend",
            command=self.start_backend
        ).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(
            control_frame,
            text="Stop Backend",
            command=self.stop_backend
        ).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(
            control_frame,
            text="Check Status",
            command=self.check_backend_status
        ).pack(side=tk.LEFT, padx=5)
        
        # Backend logs
        logs_frame = ttk.LabelFrame(backend_frame, text="Backend Logs")
        logs_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.logs_display = scrolledtext.ScrolledText(
            logs_frame,
            wrap=tk.WORD,
            font=("Consolas", 9)
        )
        self.logs_display.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
    def start_backend(self):
        """Start the Python backend server"""
        try:
            self.log_message("Starting Python backend server...")
            
            # Start the backend process
            self.backend_process = subprocess.Popen(
                [sys.executable, "main.py"],
                cwd="python-backend",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            self.status_label.config(text="Backend: Starting...")
            
            # Check status after a delay
            self.root.after(3000, self.check_backend_status)
            
        except Exception as e:
            self.log_message(f"Error starting backend: {str(e)}")
            messagebox.showerror("Error", f"Failed to start backend: {str(e)}")
    
    def stop_backend(self):
        """Stop the Python backend server"""
        if self.backend_process:
            self.backend_process.terminate()
            self.backend_process = None
            self.status_label.config(text="Backend: Stopped")
            self.log_message("Backend server stopped")
    
    def check_backend_status(self):
        """Check if the backend is running"""
        try:
            response = requests.get(f"{self.backend_url}/api/health", timeout=5)
            if response.status_code == 200:
                self.status_label.config(text="Backend: Running ✓")
                self.log_message("Backend is running and healthy")
            else:
                self.status_label.config(text="Backend: Error")
                self.log_message(f"Backend returned status: {response.status_code}")
        except requests.exceptions.RequestException:
            self.status_label.config(text="Backend: Not Running ✗")
            self.log_message("Backend is not responding")
    
    def send_message(self):
        """Send a message to the AI"""
        message = self.chat_input.get("1.0", tk.END).strip()
        if not message:
            return
        
        # Clear input
        self.chat_input.delete("1.0", tk.END)
        
        # Display user message
        self.display_message("You", message)
        
        # Send to backend in a separate thread
        threading.Thread(
            target=self._send_message_thread,
            args=(message,),
            daemon=True
        ).start()
    
    def _send_message_thread(self, message):
        """Send message to backend (runs in separate thread)"""
        try:
            payload = {
                "message": message,
                "history": [],
                "provider": self.current_provider.get(),
                "model": self.current_model.get(),
                "api_key": self.api_keys[self.current_provider.get()].get()
            }
            
            response = requests.post(
                f"{self.backend_url}/api/chat",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                self.root.after(0, self.display_message, "AI", result.get("content", "No response"))
            else:
                error_msg = f"Error: {response.status_code} - {response.text}"
                self.root.after(0, self.display_message, "Error", error_msg)
                
        except Exception as e:
            error_msg = f"Connection error: {str(e)}"
            self.root.after(0, self.display_message, "Error", error_msg)
    
    def display_message(self, sender, message):
        """Display a message in the chat"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.chat_display.insert(tk.END, f"[{timestamp}] {sender}: {message}\n\n")
        self.chat_display.see(tk.END)
    
    def new_file(self):
        """Create a new file"""
        filename = tk.simpledialog.askstring("New File", "Enter filename:")
        if filename:
            self.file_listbox.insert(tk.END, filename)
            self.code_editor.delete("1.0", tk.END)
    
    def open_file(self):
        """Open a file"""
        filename = filedialog.askopenfilename(
            title="Open File",
            filetypes=[
                ("Python files", "*.py"),
                ("JavaScript files", "*.js"),
                ("All files", "*.*")
            ]
        )
        if filename:
            try:
                with open(filename, 'r', encoding='utf-8') as file:
                    content = file.read()
                    self.code_editor.delete("1.0", tk.END)
                    self.code_editor.insert("1.0", content)
                    
                # Add to file list
                basename = os.path.basename(filename)
                self.file_listbox.insert(tk.END, basename)
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to open file: {str(e)}")
    
    def save_file(self):
        """Save the current file"""
        filename = filedialog.asksaveasfilename(
            title="Save File",
            defaultextension=".py",
            filetypes=[
                ("Python files", "*.py"),
                ("JavaScript files", "*.js"),
                ("All files", "*.*")
            ]
        )
        if filename:
            try:
                content = self.code_editor.get("1.0", tk.END)
                with open(filename, 'w', encoding='utf-8') as file:
                    file.write(content)
                messagebox.showinfo("Success", "File saved successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save file: {str(e)}")
    
    def on_file_select(self, event):
        """Handle file selection"""
        selection = self.file_listbox.curselection()
        if selection:
            filename = self.file_listbox.get(selection[0])
            # In a real implementation, load the file content
            self.log_message(f"Selected file: {filename}")
    
    def analyze_code(self):
        """Analyze the current code"""
        code = self.code_editor.get("1.0", tk.END).strip()
        if not code:
            messagebox.showwarning("Warning", "No code to analyze")
            return
        
        threading.Thread(
            target=self._analyze_code_thread,
            args=(code,),
            daemon=True
        ).start()
    
    def _analyze_code_thread(self, code):
        """Analyze code (runs in separate thread)"""
        try:
            payload = {
                "code": code,
                "language": "python",
                "analysis_type": "quality"
            }
            
            response = requests.post(
                f"{self.backend_url}/api/analyze-code",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                analysis_text = self.format_analysis_result(result)
                self.root.after(0, self.display_analysis, analysis_text)
            else:
                error_msg = f"Analysis failed: {response.status_code}"
                self.root.after(0, self.display_analysis, error_msg)
                
        except Exception as e:
            error_msg = f"Analysis error: {str(e)}"
            self.root.after(0, self.display_analysis, error_msg)
    
    def format_analysis_result(self, result):
        """Format analysis result for display"""
        text = "=== CODE ANALYSIS RESULTS ===\n\n"
        
        if "metrics" in result:
            metrics = result["metrics"]
            text += f"Lines of Code: {metrics.get('lines_of_code', 'N/A')}\n"
            text += f"Complexity: {metrics.get('complexity', 'N/A')}\n"
            text += f"Maintainability Index: {metrics.get('maintainability_index', 'N/A'):.2f}\n\n"
        
        if "issues" in result and result["issues"]:
            text += "ISSUES FOUND:\n"
            for issue in result["issues"]:
                text += f"- {issue.get('type', 'Unknown')}: {issue.get('message', 'No message')}\n"
                if issue.get('suggestion'):
                    text += f"  Suggestion: {issue['suggestion']}\n"
            text += "\n"
        
        if "suggestions" in result and result["suggestions"]:
            text += "SUGGESTIONS:\n"
            for suggestion in result["suggestions"]:
                text += f"- {suggestion}\n"
        
        text += f"\nQuality Score: {result.get('quality_score', 'N/A')}/100\n"
        text += f"Security Score: {result.get('security_score', 'N/A')}/100\n"
        
        return text
    
    def display_analysis(self, analysis_text):
        """Display analysis results"""
        self.analysis_display.delete("1.0", tk.END)
        self.analysis_display.insert("1.0", analysis_text)
    
    def analyze_project(self):
        """Analyze the entire project"""
        threading.Thread(
            target=self._analyze_project_thread,
            daemon=True
        ).start()
    
    def _analyze_project_thread(self):
        """Analyze project (runs in separate thread)"""
        try:
            # Collect all files (simplified for demo)
            files = {"main.py": "print('Hello, World!')"}
            
            payload = {
                "files": files,
                "analysis_type": "structure"
            }
            
            response = requests.post(
                f"{self.backend_url}/api/analyze-project",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                analytics_text = self.format_project_analysis(result)
                self.root.after(0, self.display_analytics, analytics_text)
            else:
                error_msg = f"Project analysis failed: {response.status_code}"
                self.root.after(0, self.display_analytics, error_msg)
                
        except Exception as e:
            error_msg = f"Project analysis error: {str(e)}"
            self.root.after(0, self.display_analytics, error_msg)
    
    def format_project_analysis(self, result):
        """Format project analysis result"""
        text = "=== PROJECT ANALYSIS ===\n\n"
        
        if "structure" in result:
            structure = result["structure"]
            text += f"Total Files: {structure.get('total_files', 'N/A')}\n"
            text += f"Languages: {structure.get('languages', {})}\n\n"
        
        if "metrics" in result:
            metrics = result["metrics"]
            text += f"Total Lines: {metrics.get('total_lines', 'N/A')}\n"
            text += f"Total Complexity: {metrics.get('total_complexity', 'N/A')}\n"
            text += f"Test Coverage: {metrics.get('test_coverage', 'N/A')}%\n"
            text += f"Documentation Coverage: {metrics.get('documentation_coverage', 'N/A')}%\n\n"
        
        if "recommendations" in result:
            text += "RECOMMENDATIONS:\n"
            for rec in result["recommendations"]:
                text += f"- {rec}\n"
            text += "\n"
        
        text += f"Health Score: {result.get('health_score', 'N/A')}/100\n"
        
        return text
    
    def display_analytics(self, analytics_text):
        """Display analytics results"""
        self.analytics_display.delete("1.0", tk.END)
        self.analytics_display.insert("1.0", analytics_text)
    
    def generate_report(self):
        """Generate a project report"""
        filename = filedialog.asksaveasfilename(
            title="Save Report",
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if filename:
            try:
                report_content = self.analytics_display.get("1.0", tk.END)
                with open(filename, 'w', encoding='utf-8') as file:
                    file.write(report_content)
                messagebox.showinfo("Success", "Report saved successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save report: {str(e)}")
    
    def save_config(self):
        """Save configuration"""
        config = {
            "provider": self.current_provider.get(),
            "model": self.current_model.get(),
            "api_keys": {
                provider: var.get() 
                for provider, var in self.api_keys.items()
            }
        }
        
        try:
            with open("config.json", "w") as f:
                json.dump(config, f, indent=2)
            messagebox.showinfo("Success", "Configuration saved!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save config: {str(e)}")
    
    def load_config(self):
        """Load configuration"""
        try:
            if os.path.exists("config.json"):
                with open("config.json", "r") as f:
                    config = json.load(f)
                
                self.current_provider.set(config.get("provider", "openai"))
                self.current_model.set(config.get("model", "gpt-4-turbo-preview"))
                
                for provider, key in config.get("api_keys", {}).items():
                    if provider in self.api_keys:
                        self.api_keys[provider].set(key)
        except Exception as e:
            self.log_message(f"Failed to load config: {str(e)}")
    
    def log_message(self, message):
        """Log a message to the backend logs"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        self.logs_display.insert(tk.END, log_entry)
        self.logs_display.see(tk.END)
    
    def on_closing(self):
        """Handle application closing"""
        if self.backend_process:
            self.stop_backend()
        self.root.destroy()

def main():
    root = tk.Tk()
    app = AgentCoderGUI(root)
    
    # Load configuration on startup
    app.load_config()
    
    # Handle window closing
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    
    # Start the GUI
    root.mainloop()

if __name__ == "__main__":
    main()