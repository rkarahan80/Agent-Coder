import sys
import os
import json
import threading
import requests
import subprocess
from datetime import datetime
from typing import Dict, Any, Optional

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QTabWidget, QWidget, QVBoxLayout, 
    QHBoxLayout, QTextEdit, QLineEdit, QPushButton, QLabel, 
    QListWidget, QSplitter, QGroupBox, QFormLayout, QComboBox,
    QProgressBar, QStatusBar, QMenuBar, QToolBar, QFileDialog,
    QMessageBox, QTextBrowser, QScrollArea, QGridLayout,
    QCheckBox, QSpinBox, QSlider, QFrame, QListWidgetItem
)
from PyQt6.QtCore import (
    Qt, QThread, pyqtSignal, QTimer, QSettings, QSize
)
from PyQt6.QtGui import (
    QFont, QIcon, QPixmap, QAction, QTextCursor, QSyntaxHighlighter,
    QTextCharFormat, QColor, QPalette
)

class PythonSyntaxHighlighter(QSyntaxHighlighter):
    """Python syntax highlighter for code editor"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.highlighting_rules = []
        
        # Python keywords
        keyword_format = QTextCharFormat()
        keyword_format.setColor(QColor(85, 85, 255))
        keyword_format.setFontWeight(QFont.Weight.Bold)
        
        keywords = [
            'and', 'as', 'assert', 'break', 'class', 'continue', 'def',
            'del', 'elif', 'else', 'except', 'exec', 'finally', 'for',
            'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
            'not', 'or', 'pass', 'print', 'raise', 'return', 'try',
            'while', 'with', 'yield'
        ]
        
        for keyword in keywords:
            pattern = f'\\b{keyword}\\b'
            self.highlighting_rules.append((pattern, keyword_format))
        
        # String literals
        string_format = QTextCharFormat()
        string_format.setColor(QColor(0, 128, 0))
        self.highlighting_rules.append(('".*"', string_format))
        self.highlighting_rules.append("'.*'", string_format)
        
        # Comments
        comment_format = QTextCharFormat()
        comment_format.setColor(QColor(128, 128, 128))
        comment_format.setFontItalic(True)
        self.highlighting_rules.append(('#.*', comment_format))
    
    def highlightBlock(self, text):
        for pattern, format in self.highlighting_rules:
            import re
            for match in re.finditer(pattern, text):
                start, end = match.span()
                self.setFormat(start, end - start, format)

class BackendWorker(QThread):
    """Worker thread for backend operations"""
    
    status_updated = pyqtSignal(str)
    response_received = pyqtSignal(dict)
    error_occurred = pyqtSignal(str)
    
    def __init__(self, operation, data=None):
        super().__init__()
        self.operation = operation
        self.data = data or {}
        self.backend_url = "http://localhost:8000"
    
    def run(self):
        try:
            if self.operation == "send_message":
                self._send_message()
            elif self.operation == "analyze_code":
                self._analyze_code()
            elif self.operation == "analyze_project":
                self._analyze_project()
            elif self.operation == "check_status":
                self._check_status()
        except Exception as e:
            self.error_occurred.emit(str(e))
    
    def _send_message(self):
        response = requests.post(
            f"{self.backend_url}/api/chat",
            json=self.data,
            timeout=30
        )
        if response.status_code == 200:
            self.response_received.emit(response.json())
        else:
            self.error_occurred.emit(f"API Error: {response.status_code}")
    
    def _analyze_code(self):
        response = requests.post(
            f"{self.backend_url}/api/analyze-code",
            json=self.data,
            timeout=30
        )
        if response.status_code == 200:
            self.response_received.emit(response.json())
        else:
            self.error_occurred.emit(f"Analysis Error: {response.status_code}")
    
    def _analyze_project(self):
        response = requests.post(
            f"{self.backend_url}/api/analyze-project",
            json=self.data,
            timeout=30
        )
        if response.status_code == 200:
            self.response_received.emit(response.json())
        else:
            self.error_occurred.emit(f"Project Analysis Error: {response.status_code}")
    
    def _check_status(self):
        response = requests.get(f"{self.backend_url}/api/health", timeout=5)
        if response.status_code == 200:
            self.status_updated.emit("Backend: Running ✓")
        else:
            self.status_updated.emit("Backend: Error")

class ChatTab(QWidget):
    """AI Chat interface tab"""
    
    def __init__(self, main_window):
        super().__init__()
        self.main_window = main_window
        self.setup_ui()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        
        # Chat display
        self.chat_display = QTextBrowser()
        self.chat_display.setFont(QFont("Consolas", 10))
        self.chat_display.setStyleSheet("""
            QTextBrowser {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 10px;
            }
        """)
        layout.addWidget(self.chat_display)
        
        # Input area
        input_layout = QHBoxLayout()
        
        self.chat_input = QTextEdit()
        self.chat_input.setMaximumHeight(80)
        self.chat_input.setPlaceholderText("Ask me to help you code something...")
        self.chat_input.setStyleSheet("""
            QTextEdit {
                border: 2px solid #007acc;
                border-radius: 8px;
                padding: 8px;
                font-size: 12px;
            }
        """)
        
        self.send_button = QPushButton("Send")
        self.send_button.setStyleSheet("""
            QPushButton {
                background-color: #007acc;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 10px 20px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #005a9e;
            }
            QPushButton:pressed {
                background-color: #004578;
            }
        """)
        self.send_button.clicked.connect(self.send_message)
        
        input_layout.addWidget(self.chat_input)
        input_layout.addWidget(self.send_button)
        
        layout.addLayout(input_layout)
        
        # Status bar
        self.status_label = QLabel("Ready")
        self.status_label.setStyleSheet("color: #6c757d; font-size: 11px;")
        layout.addWidget(self.status_label)
        
        self.setLayout(layout)
    
    def send_message(self):
        message = self.chat_input.toPlainText().strip()
        if not message:
            return
        
        # Clear input
        self.chat_input.clear()
        
        # Display user message
        self.display_message("You", message)
        
        # Get settings from main window
        settings = self.main_window.get_current_settings()
        
        # Prepare request data
        data = {
            "message": message,
            "history": [],
            "provider": settings["provider"],
            "model": settings["model"],
            "api_key": settings["api_key"]
        }
        
        # Send request in background
        self.worker = BackendWorker("send_message", data)
        self.worker.response_received.connect(self.handle_response)
        self.worker.error_occurred.connect(self.handle_error)
        self.worker.start()
        
        self.status_label.setText("Sending message...")
        self.send_button.setEnabled(False)
    
    def display_message(self, sender: str, message: str):
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        if sender == "You":
            color = "#007acc"
        else:
            color = "#28a745"
        
        html = f"""
        <div style="margin-bottom: 15px;">
            <div style="color: {color}; font-weight: bold; margin-bottom: 5px;">
                [{timestamp}] {sender}:
            </div>
            <div style="background-color: white; padding: 10px; border-radius: 8px; 
                        border-left: 4px solid {color}; margin-left: 10px;">
                {message.replace('\n', '<br>')}
            </div>
        </div>
        """
        
        self.chat_display.append(html)
    
    def handle_response(self, response: dict):
        content = response.get("content", "No response")
        self.display_message("AI Assistant", content)
        self.status_label.setText("Ready")
        self.send_button.setEnabled(True)
    
    def handle_error(self, error: str):
        self.display_message("Error", error)
        self.status_label.setText("Error occurred")
        self.send_button.setEnabled(True)

class CodeEditorTab(QWidget):
    """Code editor interface tab"""
    
    def __init__(self, main_window):
        super().__init__()
        self.main_window = main_window
        self.current_file = None
        self.setup_ui()
    
    def setup_ui(self):
        layout = QHBoxLayout()
        
        # Left panel - File list
        left_panel = QVBoxLayout()
        
        # Toolbar
        toolbar_layout = QHBoxLayout()
        
        new_btn = QPushButton("New")
        new_btn.clicked.connect(self.new_file)
        open_btn = QPushButton("Open")
        open_btn.clicked.connect(self.open_file)
        save_btn = QPushButton("Save")
        save_btn.clicked.connect(self.save_file)
        analyze_btn = QPushButton("Analyze")
        analyze_btn.clicked.connect(self.analyze_code)
        
        for btn in [new_btn, open_btn, save_btn, analyze_btn]:
            btn.setStyleSheet("""
                QPushButton {
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    margin: 2px;
                }
                QPushButton:hover {
                    background-color: #5a6268;
                }
            """)
        
        toolbar_layout.addWidget(new_btn)
        toolbar_layout.addWidget(open_btn)
        toolbar_layout.addWidget(save_btn)
        toolbar_layout.addWidget(analyze_btn)
        toolbar_layout.addStretch()
        
        left_panel.addLayout(toolbar_layout)
        
        # File list
        file_group = QGroupBox("Project Files")
        file_layout = QVBoxLayout()
        
        self.file_list = QListWidget()
        self.file_list.setMaximumWidth(250)
        self.file_list.itemClicked.connect(self.on_file_selected)
        self.file_list.setStyleSheet("""
            QListWidget {
                border: 1px solid #dee2e6;
                border-radius: 4px;
                background-color: white;
            }
            QListWidget::item {
                padding: 8px;
                border-bottom: 1px solid #f1f3f4;
            }
            QListWidget::item:selected {
                background-color: #007acc;
                color: white;
            }
        """)
        
        file_layout.addWidget(self.file_list)
        file_group.setLayout(file_layout)
        left_panel.addWidget(file_group)
        
        # Right panel - Editor and analysis
        right_panel = QVBoxLayout()
        
        # Code editor
        editor_group = QGroupBox("Code Editor")
        editor_layout = QVBoxLayout()
        
        self.code_editor = QTextEdit()
        self.code_editor.setFont(QFont("Consolas", 11))
        self.code_editor.setStyleSheet("""
            QTextEdit {
                background-color: #1e1e1e;
                color: #d4d4d4;
                border: 1px solid #3c3c3c;
                border-radius: 4px;
                padding: 10px;
            }
        """)
        
        # Add syntax highlighter
        self.highlighter = PythonSyntaxHighlighter(self.code_editor.document())
        
        editor_layout.addWidget(self.code_editor)
        editor_group.setLayout(editor_layout)
        right_panel.addWidget(editor_group)
        
        # Analysis results
        analysis_group = QGroupBox("Analysis Results")
        analysis_layout = QVBoxLayout()
        
        self.analysis_display = QTextBrowser()
        self.analysis_display.setMaximumHeight(200)
        self.analysis_display.setStyleSheet("""
            QTextBrowser {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 8px;
            }
        """)
        
        analysis_layout.addWidget(self.analysis_display)
        analysis_group.setLayout(analysis_layout)
        right_panel.addWidget(analysis_group)
        
        # Create splitter
        splitter = QSplitter(Qt.Orientation.Horizontal)
        
        left_widget = QWidget()
        left_widget.setLayout(left_panel)
        left_widget.setMaximumWidth(300)
        
        right_widget = QWidget()
        right_widget.setLayout(right_panel)
        
        splitter.addWidget(left_widget)
        splitter.addWidget(right_widget)
        splitter.setSizes([300, 800])
        
        layout.addWidget(splitter)
        self.setLayout(layout)
    
    def new_file(self):
        filename, ok = QFileDialog.getSaveFileName(
            self, "New File", "", "Python Files (*.py);;All Files (*)"
        )
        if ok and filename:
            self.current_file = filename
            self.code_editor.clear()
            self.file_list.addItem(os.path.basename(filename))
    
    def open_file(self):
        filename, _ = QFileDialog.getOpenFileName(
            self, "Open File", "", 
            "Python Files (*.py);;JavaScript Files (*.js);;All Files (*)"
        )
        if filename:
            try:
                with open(filename, 'r', encoding='utf-8') as file:
                    content = file.read()
                    self.code_editor.setPlainText(content)
                    self.current_file = filename
                    
                    # Add to file list if not already there
                    basename = os.path.basename(filename)
                    items = [self.file_list.item(i).text() for i in range(self.file_list.count())]
                    if basename not in items:
                        self.file_list.addItem(basename)
                        
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to open file: {str(e)}")
    
    def save_file(self):
        if not self.current_file:
            self.save_file_as()
            return
        
        try:
            content = self.code_editor.toPlainText()
            with open(self.current_file, 'w', encoding='utf-8') as file:
                file.write(content)
            QMessageBox.information(self, "Success", "File saved successfully!")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to save file: {str(e)}")
    
    def save_file_as(self):
        filename, _ = QFileDialog.getSaveFileName(
            self, "Save File", "", 
            "Python Files (*.py);;JavaScript Files (*.js);;All Files (*)"
        )
        if filename:
            self.current_file = filename
            self.save_file()
    
    def on_file_selected(self, item):
        # In a real implementation, load the file content
        filename = item.text()
        self.analysis_display.append(f"Selected file: {filename}")
    
    def analyze_code(self):
        code = self.code_editor.toPlainText().strip()
        if not code:
            QMessageBox.warning(self, "Warning", "No code to analyze")
            return
        
        data = {
            "code": code,
            "language": "python",
            "analysis_type": "quality"
        }
        
        self.worker = BackendWorker("analyze_code", data)
        self.worker.response_received.connect(self.handle_analysis_result)
        self.worker.error_occurred.connect(self.handle_analysis_error)
        self.worker.start()
        
        self.analysis_display.append("Analyzing code...")
    
    def handle_analysis_result(self, result: dict):
        analysis_text = self.format_analysis_result(result)
        self.analysis_display.setPlainText(analysis_text)
    
    def handle_analysis_error(self, error: str):
        self.analysis_display.append(f"Analysis error: {error}")
    
    def format_analysis_result(self, result: dict) -> str:
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

class AnalyticsTab(QWidget):
    """Project analytics interface tab"""
    
    def __init__(self, main_window):
        super().__init__()
        self.main_window = main_window
        self.setup_ui()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        
        # Control buttons
        control_layout = QHBoxLayout()
        
        analyze_btn = QPushButton("Analyze Project")
        analyze_btn.clicked.connect(self.analyze_project)
        
        report_btn = QPushButton("Generate Report")
        report_btn.clicked.connect(self.generate_report)
        
        for btn in [analyze_btn, report_btn]:
            btn.setStyleSheet("""
                QPushButton {
                    background-color: #28a745;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 20px;
                    font-weight: bold;
                }
                QPushButton:hover {
                    background-color: #218838;
                }
            """)
        
        control_layout.addWidget(analyze_btn)
        control_layout.addWidget(report_btn)
        control_layout.addStretch()
        
        layout.addLayout(control_layout)
        
        # Analytics display
        self.analytics_display = QTextBrowser()
        self.analytics_display.setStyleSheet("""
            QTextBrowser {
                background-color: white;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                font-family: 'Segoe UI', Arial, sans-serif;
            }
        """)
        layout.addWidget(self.analytics_display)
        
        self.setLayout(layout)
    
    def analyze_project(self):
        # Simulate project analysis
        files = {"main.py": "print('Hello, World!')"}
        
        data = {
            "files": files,
            "analysis_type": "structure"
        }
        
        self.worker = BackendWorker("analyze_project", data)
        self.worker.response_received.connect(self.handle_project_analysis)
        self.worker.error_occurred.connect(self.handle_analysis_error)
        self.worker.start()
        
        self.analytics_display.append("Analyzing project...")
    
    def handle_project_analysis(self, result: dict):
        analysis_text = self.format_project_analysis(result)
        self.analytics_display.setHtml(analysis_text)
    
    def handle_analysis_error(self, error: str):
        self.analytics_display.append(f"Analysis error: {error}")
    
    def format_project_analysis(self, result: dict) -> str:
        html = """
        <div style="font-family: 'Segoe UI', Arial, sans-serif;">
            <h2 style="color: #007acc; border-bottom: 2px solid #007acc; padding-bottom: 10px;">
                📊 PROJECT ANALYSIS REPORT
            </h2>
        """
        
        if "structure" in result:
            structure = result["structure"]
            html += f"""
            <h3 style="color: #28a745; margin-top: 20px;">📁 Project Structure</h3>
            <ul style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                <li><strong>Total Files:</strong> {structure.get('total_files', 'N/A')}</li>
                <li><strong>Languages:</strong> {structure.get('languages', {})}</li>
            </ul>
            """
        
        if "metrics" in result:
            metrics = result["metrics"]
            html += f"""
            <h3 style="color: #dc3545; margin-top: 20px;">📈 Project Metrics</h3>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p><strong>Total Lines:</strong> {metrics.get('total_lines', 'N/A')}</p>
                <p><strong>Complexity:</strong> {metrics.get('total_complexity', 'N/A')}</p>
                <p><strong>Test Coverage:</strong> {metrics.get('test_coverage', 'N/A')}%</p>
                <p><strong>Documentation:</strong> {metrics.get('documentation_coverage', 'N/A')}%</p>
            </div>
            """
        
        if "recommendations" in result:
            html += """
            <h3 style="color: #6f42c1; margin-top: 20px;">💡 Recommendations</h3>
            <ul style="background-color: #e7e3ff; padding: 15px; border-radius: 8px;">
            """
            for rec in result["recommendations"]:
                html += f"<li>{rec}</li>"
            html += "</ul>"
        
        health_score = result.get('health_score', 'N/A')
        score_color = "#28a745" if isinstance(health_score, (int, float)) and health_score >= 80 else "#dc3545"
        
        html += f"""
            <div style="background-color: {score_color}; color: white; padding: 20px; 
                        border-radius: 8px; text-align: center; margin-top: 20px;">
                <h2 style="margin: 0;">🏆 Health Score: {health_score}/100</h2>
            </div>
        </div>
        """
        
        return html
    
    def generate_report(self):
        filename, _ = QFileDialog.getSaveFileName(
            self, "Save Report", "project_report.html", 
            "HTML Files (*.html);;Text Files (*.txt)"
        )
        if filename:
            try:
                content = self.analytics_display.toHtml()
                with open(filename, 'w', encoding='utf-8') as file:
                    file.write(content)
                QMessageBox.information(self, "Success", "Report saved successfully!")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to save report: {str(e)}")

class SettingsTab(QWidget):
    """Settings interface tab"""
    
    def __init__(self, main_window):
        super().__init__()
        self.main_window = main_window
        self.setup_ui()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        
        # API Configuration Group
        api_group = QGroupBox("🔑 API Configuration")
        api_group.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 2px solid #007acc;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px 0 5px;
            }
        """)
        
        api_layout = QFormLayout()
        
        # Provider selection
        self.provider_combo = QComboBox()
        self.provider_combo.addItems(["openai", "gemini", "claude"])
        self.provider_combo.setStyleSheet("""
            QComboBox {
                padding: 8px;
                border: 2px solid #dee2e6;
                border-radius: 4px;
                background-color: white;
            }
        """)
        
        # Model selection
        self.model_combo = QComboBox()
        self.model_combo.addItems([
            "gpt-4-turbo-preview", "gpt-4", "gpt-3.5-turbo",
            "gemini-pro", "gemini-pro-vision",
            "claude-3-opus-20240229", "claude-3-sonnet-20240229"
        ])
        self.model_combo.setStyleSheet(self.provider_combo.styleSheet())
        
        # API Key inputs
        self.api_keys = {}
        for provider in ["openai", "gemini", "claude"]:
            key_input = QLineEdit()
            key_input.setEchoMode(QLineEdit.EchoMode.Password)
            key_input.setPlaceholderText(f"Enter {provider.title()} API key...")
            key_input.setStyleSheet("""
                QLineEdit {
                    padding: 8px;
                    border: 2px solid #dee2e6;
                    border-radius: 4px;
                    background-color: white;
                }
                QLineEdit:focus {
                    border-color: #007acc;
                }
            """)
            self.api_keys[provider] = key_input
            api_layout.addRow(f"{provider.title()} API Key:", key_input)
        
        api_layout.addRow("AI Provider:", self.provider_combo)
        api_layout.addRow("Model:", self.model_combo)
        
        # Save button
        save_btn = QPushButton("💾 Save Configuration")
        save_btn.clicked.connect(self.save_config)
        save_btn.setStyleSheet("""
            QPushButton {
                background-color: #007acc;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #005a9e;
            }
        """)
        
        api_layout.addRow("", save_btn)
        api_group.setLayout(api_layout)
        layout.addWidget(api_group)
        
        # Theme Configuration Group
        theme_group = QGroupBox("🎨 Appearance")
        theme_group.setStyleSheet(api_group.styleSheet())
        
        theme_layout = QFormLayout()
        
        self.theme_combo = QComboBox()
        self.theme_combo.addItems(["Light", "Dark", "Auto"])
        self.theme_combo.setStyleSheet(self.provider_combo.styleSheet())
        
        self.font_size_spin = QSpinBox()
        self.font_size_spin.setRange(8, 24)
        self.font_size_spin.setValue(11)
        self.font_size_spin.setStyleSheet(self.provider_combo.styleSheet())
        
        theme_layout.addRow("Theme:", self.theme_combo)
        theme_layout.addRow("Font Size:", self.font_size_spin)
        
        theme_group.setLayout(theme_layout)
        layout.addWidget(theme_group)
        
        # About Section
        about_group = QGroupBox("ℹ️ About Agent Coder")
        about_group.setStyleSheet(api_group.styleSheet())
        
        about_layout = QVBoxLayout()
        
        about_text = QLabel("""
        <div style="padding: 15px; font-family: 'Segoe UI', Arial, sans-serif;">
            <h3 style="color: #007acc;">Agent Coder Pro - Python GUI Edition</h3>
            <p><strong>Version:</strong> 2.0.0</p>
            <p><strong>Framework:</strong> PyQt6 + FastAPI</p>
            <p><strong>Features:</strong></p>
            <ul>
                <li>🤖 Multi-provider AI integration (OpenAI, Gemini, Claude)</li>
                <li>📝 Advanced code editor with syntax highlighting</li>
                <li>📊 Comprehensive project analytics</li>
                <li>🔍 Real-time code analysis</li>
                <li>☁️ Cloud deployment support</li>
                <li>📱 Mobile app generation</li>
            </ul>
            <p style="color: #6c757d; font-size: 12px;">
                Built with Python, PyQt6, and FastAPI for professional development workflows.
            </p>
        </div>
        """)
        about_text.setWordWrap(True)
        about_text.setStyleSheet("""
            QLabel {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 10px;
            }
        """)
        
        about_layout.addWidget(about_text)
        about_group.setLayout(about_layout)
        layout.addWidget(about_group)
        
        layout.addStretch()
        self.setLayout(layout)
    
    def save_config(self):
        config = {
            "provider": self.provider_combo.currentText(),
            "model": self.model_combo.currentText(),
            "api_keys": {
                provider: widget.text()
                for provider, widget in self.api_keys.items()
            },
            "theme": self.theme_combo.currentText(),
            "font_size": self.font_size_spin.value()
        }
        
        try:
            with open("config.json", "w") as f:
                json.dump(config, f, indent=2)
            QMessageBox.information(self, "Success", "Configuration saved successfully!")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to save config: {str(e)}")
    
    def load_config(self):
        try:
            if os.path.exists("config.json"):
                with open("config.json", "r") as f:
                    config = json.load(f)
                
                # Set values
                provider_index = self.provider_combo.findText(config.get("provider", "openai"))
                if provider_index >= 0:
                    self.provider_combo.setCurrentIndex(provider_index)
                
                model_index = self.model_combo.findText(config.get("model", "gpt-4-turbo-preview"))
                if model_index >= 0:
                    self.model_combo.setCurrentIndex(model_index)
                
                # Set API keys
                for provider, key in config.get("api_keys", {}).items():
                    if provider in self.api_keys:
                        self.api_keys[provider].setText(key)
                
                # Set theme settings
                theme_index = self.theme_combo.findText(config.get("theme", "Light"))
                if theme_index >= 0:
                    self.theme_combo.setCurrentIndex(theme_index)
                
                self.font_size_spin.setValue(config.get("font_size", 11))
                
        except Exception as e:
            print(f"Failed to load config: {str(e)}")

class BackendStatusTab(QWidget):
    """Backend status monitoring tab"""
    
    def __init__(self, main_window):
        super().__init__()
        self.main_window = main_window
        self.backend_process = None
        self.setup_ui()
        self.setup_timer()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        
        # Status display
        status_group = QGroupBox("🖥️ Backend Server Status")
        status_group.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 2px solid #28a745;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 10px;
            }
        """)
        
        status_layout = QVBoxLayout()
        
        self.status_label = QLabel("Backend: Checking...")
        self.status_label.setStyleSheet("""
            QLabel {
                font-size: 16px;
                font-weight: bold;
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 6px;
                border: 1px solid #dee2e6;
            }
        """)
        status_layout.addWidget(self.status_label)
        
        # Control buttons
        control_layout = QHBoxLayout()
        
        self.start_btn = QPushButton("🚀 Start Backend")
        self.start_btn.clicked.connect(self.start_backend)
        
        self.stop_btn = QPushButton("⏹️ Stop Backend")
        self.stop_btn.clicked.connect(self.stop_backend)
        
        self.check_btn = QPushButton("🔍 Check Status")
        self.check_btn.clicked.connect(self.check_status)
        
        for btn in [self.start_btn, self.stop_btn, self.check_btn]:
            btn.setStyleSheet("""
                QPushButton {
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 15px;
                    font-weight: bold;
                    margin: 2px;
                }
                QPushButton:hover {
                    background-color: #5a6268;
                }
            """)
        
        control_layout.addWidget(self.start_btn)
        control_layout.addWidget(self.stop_btn)
        control_layout.addWidget(self.check_btn)
        control_layout.addStretch()
        
        status_layout.addLayout(control_layout)
        status_group.setLayout(status_layout)
        layout.addWidget(status_group)
        
        # Logs display
        logs_group = QGroupBox("📋 Backend Logs")
        logs_group.setStyleSheet(status_group.styleSheet())
        
        logs_layout = QVBoxLayout()
        
        self.logs_display = QTextBrowser()
        self.logs_display.setStyleSheet("""
            QTextBrowser {
                background-color: #1e1e1e;
                color: #d4d4d4;
                border: 1px solid #3c3c3c;
                border-radius: 6px;
                padding: 10px;
                font-family: 'Consolas', monospace;
                font-size: 10px;
            }
        """)
        
        logs_layout.addWidget(self.logs_display)
        logs_group.setLayout(logs_layout)
        layout.addWidget(logs_group)
        
        self.setLayout(layout)
    
    def setup_timer(self):
        self.timer = QTimer()
        self.timer.timeout.connect(self.check_status)
        self.timer.start(10000)  # Check every 10 seconds
    
    def start_backend(self):
        try:
            self.log_message("🚀 Starting Python backend server...")
            
            # Start the backend process
            self.backend_process = subprocess.Popen(
                [sys.executable, "enhanced_main.py"],
                cwd=".",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            self.status_label.setText("Backend: Starting... ⏳")
            self.status_label.setStyleSheet(self.status_label.styleSheet().replace("#f8f9fa", "#fff3cd"))
            
            # Check status after delay
            QTimer.singleShot(3000, self.check_status)
            
        except Exception as e:
            self.log_message(f"❌ Error starting backend: {str(e)}")
            QMessageBox.critical(self, "Error", f"Failed to start backend: {str(e)}")
    
    def stop_backend(self):
        if self.backend_process:
            self.backend_process.terminate()
            self.backend_process = None
            self.status_label.setText("Backend: Stopped ⏹️")
            self.status_label.setStyleSheet(self.status_label.styleSheet().replace("#fff3cd", "#f8d7da"))
            self.log_message("⏹️ Backend server stopped")
    
    def check_status(self):
        worker = BackendWorker("check_status")
        worker.status_updated.connect(self.update_status)
        worker.error_occurred.connect(self.handle_status_error)
        worker.start()
    
    def update_status(self, status: str):
        self.status_label.setText(status)
        if "Running" in status:
            self.status_label.setStyleSheet(self.status_label.styleSheet().replace("#f8d7da", "#d4edda"))
            self.log_message("✅ Backend is running and healthy")
        else:
            self.status_label.setStyleSheet(self.status_label.styleSheet().replace("#d4edda", "#f8d7da"))
    
    def handle_status_error(self, error: str):
        self.status_label.setText("Backend: Not Running ❌")
        self.status_label.setStyleSheet(self.status_label.styleSheet().replace("#d4edda", "#f8d7da"))
        self.log_message("❌ Backend is not responding")
    
    def log_message(self, message: str):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.logs_display.append(log_entry)

class AgentCoderMainWindow(QMainWindow):
    """Main application window"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Agent Coder Pro - Python GUI Edition")
        self.setGeometry(100, 100, 1400, 900)
        self.setMinimumSize(1200, 800)
        
        # Set application icon (if available)
        self.setWindowIcon(QIcon("icon.png") if os.path.exists("icon.png") else QIcon())
        
        self.setup_ui()
        self.setup_menu_bar()
        self.setup_status_bar()
        self.apply_modern_style()
        
        # Load settings
        self.load_settings()
    
    def setup_ui(self):
        # Create central widget and tab widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        layout = QVBoxLayout()
        central_widget.setLayout(layout)
        
        # Create tab widget
        self.tab_widget = QTabWidget()
        self.tab_widget.setTabPosition(QTabWidget.TabPosition.North)
        self.tab_widget.setMovable(True)
        
        # Create tabs
        self.chat_tab = ChatTab(self)
        self.editor_tab = CodeEditorTab(self)
        self.analytics_tab = AnalyticsTab(self)
        self.settings_tab = SettingsTab(self)
        self.backend_tab = BackendStatusTab(self)
        
        # Add tabs
        self.tab_widget.addTab(self.chat_tab, "🤖 AI Chat")
        self.tab_widget.addTab(self.editor_tab, "📝 Code Editor")
        self.tab_widget.addTab(self.analytics_tab, "📊 Analytics")
        self.tab_widget.addTab(self.backend_tab, "🖥️ Backend")
        self.tab_widget.addTab(self.settings_tab, "⚙️ Settings")
        
        layout.addWidget(self.tab_widget)
    
    def setup_menu_bar(self):
        menubar = self.menuBar()
        
        # File menu
        file_menu = menubar.addMenu("File")
        
        new_action = QAction("New Project", self)
        new_action.setShortcut("Ctrl+N")
        file_menu.addAction(new_action)
        
        open_action = QAction("Open Project", self)
        open_action.setShortcut("Ctrl+O")
        file_menu.addAction(open_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction("Exit", self)
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # Tools menu
        tools_menu = menubar.addMenu("Tools")
        
        analyze_action = QAction("Analyze Code", self)
        analyze_action.setShortcut("F5")
        tools_menu.addAction(analyze_action)
        
        # Help menu
        help_menu = menubar.addMenu("Help")
        
        about_action = QAction("About", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)
    
    def setup_status_bar(self):
        self.status_bar = self.statusBar()
        self.status_bar.showMessage("Ready")
        
        # Add permanent widgets
        self.backend_status_label = QLabel("Backend: Checking...")
        self.status_bar.addPermanentWidget(self.backend_status_label)
    
    def apply_modern_style(self):
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f8f9fa;
            }
            
            QTabWidget::pane {
                border: 1px solid #dee2e6;
                background-color: white;
                border-radius: 8px;
            }
            
            QTabWidget::tab-bar {
                alignment: left;
            }
            
            QTabBar::tab {
                background-color: #e9ecef;
                color: #495057;
                padding: 12px 20px;
                margin-right: 2px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                font-weight: bold;
            }
            
            QTabBar::tab:selected {
                background-color: #007acc;
                color: white;
            }
            
            QTabBar::tab:hover {
                background-color: #6c757d;
                color: white;
            }
            
            QMenuBar {
                background-color: #343a40;
                color: white;
                padding: 4px;
            }
            
            QMenuBar::item {
                background-color: transparent;
                padding: 8px 12px;
                border-radius: 4px;
            }
            
            QMenuBar::item:selected {
                background-color: #495057;
            }
            
            QMenu {
                background-color: white;
                border: 1px solid #dee2e6;
                border-radius: 4px;
            }
            
            QMenu::item {
                padding: 8px 20px;
            }
            
            QMenu::item:selected {
                background-color: #007acc;
                color: white;
            }
            
            QStatusBar {
                background-color: #e9ecef;
                border-top: 1px solid #dee2e6;
                padding: 4px;
            }
        """)
    
    def get_current_settings(self) -> Dict[str, Any]:
        """Get current settings from the settings tab"""
        return {
            "provider": self.settings_tab.provider_combo.currentText(),
            "model": self.settings_tab.model_combo.currentText(),
            "api_key": self.settings_tab.api_keys[self.settings_tab.provider_combo.currentText()].text()
        }
    
    def load_settings(self):
        """Load settings on startup"""
        self.settings_tab.load_config()
    
    def show_about(self):
        QMessageBox.about(self, "About Agent Coder Pro", """
        <h2>Agent Coder Pro - Python GUI Edition</h2>
        <p><b>Version:</b> 2.0.0</p>
        <p><b>Framework:</b> PyQt6 + FastAPI</p>
        <p><b>Author:</b> Agent Coder Team</p>
        
        <p>A professional AI-powered coding assistant with modern GUI interface.</p>
        
        <p><b>Features:</b></p>
        <ul>
            <li>Multi-provider AI integration</li>
            <li>Advanced code editor</li>
            <li>Project analytics</li>
            <li>Real-time collaboration</li>
            <li>Cloud deployment</li>
        </ul>
        
        <p>Built with Python, PyQt6, and FastAPI.</p>
        """)
    
    def closeEvent(self, event):
        """Handle application closing"""
        if self.backend_tab.backend_process:
            reply = QMessageBox.question(
                self, "Exit Application",
                "Backend server is running. Stop it before exiting?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No | QMessageBox.StandardButton.Cancel
            )
            
            if reply == QMessageBox.StandardButton.Yes:
                self.backend_tab.stop_backend()
                event.accept()
            elif reply == QMessageBox.StandardButton.No:
                event.accept()
            else:
                event.ignore()
        else:
            event.accept()

def main():
    """Main application entry point"""
    app = QApplication(sys.argv)
    
    # Set application properties
    app.setApplicationName("Agent Coder Pro")
    app.setApplicationVersion("2.0.0")
    app.setOrganizationName("Agent Coder Team")
    
    # Apply modern style
    app.setStyle("Fusion")
    
    # Create and show main window
    window = AgentCoderMainWindow()
    window.show()
    
    # Start the application
    sys.exit(app.exec())

if __name__ == "__main__":
    main()