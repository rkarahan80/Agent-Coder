# Agent Coder Pro - Modern PyQt6 GUI Interface

A professional AI coding assistant with a modern, feature-rich GUI built using PyQt6 and FastAPI backend.

## 🚀 Features

### 🎨 Modern PyQt6 Interface
- **Professional Design**: Modern, clean interface with custom styling
- **Tabbed Layout**: Organized workspace with multiple functional tabs
- **Syntax Highlighting**: Advanced code editor with Python syntax highlighting
- **Responsive Design**: Adaptive layout that works on different screen sizes
- **Dark/Light Themes**: Multiple theme options for comfortable coding

### 🤖 Advanced AI Integration
- **Multi-Provider Support**: OpenAI GPT, Google Gemini, Anthropic Claude
- **Real-time Chat**: Interactive AI conversations with syntax highlighting
- **Context Awareness**: Maintains conversation history and context
- **Code Generation**: AI-powered code generation and completion

### 📝 Professional Code Editor
- **Syntax Highlighting**: Python, JavaScript, and more languages
- **File Management**: Create, open, save, and organize project files
- **Code Analysis**: Real-time quality, security, and performance analysis
- **Auto-completion**: Intelligent code suggestions and completions

### 📊 Comprehensive Analytics
- **Project Health**: Overall project assessment and scoring
- **Code Metrics**: Lines of code, complexity, maintainability
- **Visual Reports**: HTML reports with charts and graphs
- **Trend Analysis**: Track project changes over time

### 🔧 Backend Integration
- **FastAPI Backend**: High-performance async Python backend
- **Real-time Monitoring**: Backend status and health monitoring
- **Log Viewing**: Real-time backend logs and debugging
- **Service Management**: Start/stop backend services from GUI

## 📋 Requirements

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, Linux (Ubuntu 18.04+)
- **Python**: 3.8 or higher
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free space
- **Display**: 1280x720 minimum resolution

### Python Dependencies
- PyQt6 6.6.1+
- FastAPI 0.109.2+
- Python 3.8+

## 🛠️ Installation

### Quick Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd agent-coder/python-backend
```

2. **Install dependencies**:
```bash
pip install -r requirements_pyqt6.txt
```

3. **Start the application**:
```bash
python start_pyqt6_gui.py
```

### Manual Installation

1. **Install PyQt6**:
```bash
pip install PyQt6==6.6.1
```

2. **Install backend dependencies**:
```bash
pip install fastapi uvicorn python-dotenv requests
```

3. **Install AI provider SDKs**:
```bash
pip install openai google-generativeai anthropic
```

4. **Start backend** (Terminal 1):
```bash
python enhanced_main.py
```

5. **Start GUI** (Terminal 2):
```bash
python gui_interface_pyqt6.py
```

### Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv agent_coder_env

# Activate virtual environment
# Windows:
agent_coder_env\Scripts\activate
# macOS/Linux:
source agent_coder_env/bin/activate

# Install dependencies
pip install -r requirements_pyqt6.txt

# Start application
python start_pyqt6_gui.py
```

## ⚙️ Configuration

### API Keys Setup

1. **Open Settings Tab** in the GUI
2. **Enter API Keys** for your preferred providers:
   - **OpenAI**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Google Gemini**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Anthropic Claude**: Get from [Anthropic Console](https://console.anthropic.com/)

3. **Select Provider and Model**
4. **Save Configuration**

### Environment Variables (Alternative)

Create a `.env` file in the `python-backend` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 🎯 Usage Guide

### 1. AI Chat Interface

- **Open AI Chat Tab**: Click on "🤖 AI Chat"
- **Select Provider**: Choose OpenAI, Gemini, or Claude
- **Ask Questions**: Type coding questions or requests
- **View Responses**: Get formatted responses with syntax highlighting
- **Copy Code**: Click to copy code blocks from responses

### 2. Code Editor

- **Create Files**: Use "New" button to create files
- **Open Files**: Load existing files with "Open"
- **Edit Code**: Use the syntax-highlighted editor
- **Analyze Code**: Click "Analyze" for quality assessment
- **Save Work**: Save files locally or to project

### 3. Project Analytics

- **Analyze Project**: Click "Analyze Project" for comprehensive insights
- **View Metrics**: See health scores, complexity, and coverage
- **Generate Reports**: Create HTML reports for sharing
- **Track Progress**: Monitor project improvements over time

### 4. Backend Management

- **Monitor Status**: Check backend server health
- **View Logs**: Real-time backend logging
- **Control Services**: Start/stop backend from GUI
- **Debug Issues**: Troubleshoot connection problems

### 5. Settings Management

- **Configure APIs**: Set up AI provider credentials
- **Customize Appearance**: Choose themes and fonts
- **Save Preferences**: Persistent configuration storage
- **View About**: Application information and version

## 🎨 Interface Overview

### Main Window Layout

```
┌─────────────────────────────────────────────────────────┐
│ File  Tools  Help                                       │
├─────────────────────────────────────────────────────────┤
│ 🤖 AI Chat │ 📝 Code Editor │ 📊 Analytics │ 🖥️ Backend │ ⚙️ Settings │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    Tab Content Area                     │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Ready                                    Backend: Running ✓ │
└─────────────────────────────────────────────────────────┘
```

### Tab Functions

- **🤖 AI Chat**: Interactive AI conversations
- **📝 Code Editor**: File editing with syntax highlighting
- **📊 Analytics**: Project analysis and reporting
- **🖥️ Backend**: Server monitoring and logs
- **⚙️ Settings**: Configuration and preferences

## 🔧 Advanced Features

### Syntax Highlighting

The code editor supports syntax highlighting for:
- Python
- JavaScript
- TypeScript
- HTML/CSS
- JSON
- And more...

### Code Analysis

Real-time analysis provides:
- **Quality Metrics**: Maintainability, complexity
- **Security Scanning**: Vulnerability detection
- **Performance Tips**: Optimization suggestions
- **Best Practices**: Language-specific recommendations

### Project Reports

Generate comprehensive reports including:
- **Health Scores**: Overall project assessment
- **Language Distribution**: Codebase composition
- **Metrics Dashboard**: Visual charts and graphs
- **Recommendations**: Improvement suggestions

## 🐛 Troubleshooting

### Common Issues

1. **PyQt6 Installation Error**:
   ```bash
   # Try installing with specific version
   pip install PyQt6==6.6.1
   
   # Or use conda
   conda install pyqt
   ```

2. **Backend Connection Error**:
   - Check if backend is running on port 8000
   - Verify firewall settings
   - Check backend logs in GUI

3. **API Key Issues**:
   - Verify API keys are correct
   - Check API key permissions
   - Test with different providers

4. **GUI Not Starting**:
   - Ensure PyQt6 is properly installed
   - Check Python version (3.8+)
   - Try running from command line for error details

### Debug Mode

Start with debug information:
```bash
python gui_interface_pyqt6.py --debug
```

### Log Files

Check log files in:
- `logs/backend.log` - Backend server logs
- `logs/gui.log` - GUI application logs

## 🚀 Performance Tips

### Optimize Performance

1. **Close Unused Tabs**: Reduce memory usage
2. **Limit Log History**: Clear old logs regularly
3. **Use Virtual Environment**: Isolate dependencies
4. **Update Dependencies**: Keep packages current

### System Resources

- **CPU**: Multi-core recommended for AI processing
- **Memory**: 8GB+ for large projects
- **Storage**: SSD recommended for faster file operations
- **Network**: Stable internet for AI API calls

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
# Update all packages
pip install --upgrade -r requirements_pyqt6.txt

# Update specific package
pip install --upgrade PyQt6
```

### Backup Configuration

Your settings are saved in:
- `config.json` - GUI preferences
- `.env` - Environment variables

## 📞 Support

### Getting Help

1. **Check Documentation**: Review this README
2. **View Logs**: Check backend and GUI logs
3. **Test Components**: Use individual tab functions
4. **Report Issues**: Submit detailed bug reports

### Community

- **GitHub Issues**: Report bugs and feature requests
- **Discussions**: Ask questions and share tips
- **Wiki**: Additional documentation and guides

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **PyQt6**: Modern GUI framework
- **FastAPI**: High-performance web framework
- **OpenAI, Google, Anthropic**: AI provider APIs
- **Python Community**: Excellent ecosystem and tools

---

**Agent Coder Pro** - Professional AI-powered development environment with modern PyQt6 interface.