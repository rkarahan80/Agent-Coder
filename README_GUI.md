# Agent Coder - Python GUI Interface

A comprehensive Python-based AI coding assistant with a full-featured GUI interface built using Tkinter and FastAPI.

## Features

### 🖥️ GUI Interface
- **Tkinter-based GUI** with tabbed interface
- **Real-time AI Chat** with multiple providers
- **Code Editor** with syntax highlighting
- **Project Analytics** with visual reports
- **Settings Management** with API key configuration
- **Backend Status Monitoring** with logs

### 🤖 AI Integration
- **Multiple AI Providers**: OpenAI, Google Gemini, Anthropic Claude
- **Real-time Chat**: Interactive AI conversations
- **Code Analysis**: Quality, security, and performance analysis
- **Project Analysis**: Structure and health assessment

### 🔧 Development Tools
- **Code Editor**: Built-in editor with file management
- **Mobile App Generation**: React Native, Flutter, Ionic support
- **Cloud Deployment**: Multiple cloud provider support
- **Real-time Collaboration**: Multi-user coding sessions

### 📊 Analytics & Reporting
- **Project Health Scoring**: Comprehensive project assessment
- **Code Quality Metrics**: Lines of code, complexity, coverage
- **Visual Reports**: Generate and export project reports
- **Trend Analysis**: Track project changes over time

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Quick Start

1. **Clone the repository**:
```bash
git clone <repository-url>
cd agent-coder
```

2. **Install Python dependencies**:
```bash
cd python-backend
pip install -r requirements_gui.txt
```

3. **Start the application**:
```bash
python start_gui.py
```

### Manual Setup

1. **Install backend dependencies**:
```bash
cd python-backend
pip install -r requirements.txt
pip install -r requirements_gui.txt
```

2. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Start backend server**:
```bash
python enhanced_main.py
```

4. **Start GUI interface** (in another terminal):
```bash
python gui_interface.py
```

## Configuration

### API Keys
Configure your AI provider API keys in the GUI Settings tab or in the `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Backend Configuration
The backend runs on `http://localhost:8000` by default. You can modify this in the configuration files.

## Usage Guide

### 1. AI Chat Interface
- Open the "AI Chat" tab
- Select your preferred AI provider and model
- Type your coding questions or requests
- Get real-time responses with code examples

### 2. Code Editor
- Use the "Code Editor" tab for file management
- Create, open, and save files
- Analyze code quality and get suggestions
- View analysis results in real-time

### 3. Project Analytics
- Navigate to "Project Analytics" tab
- Click "Analyze Project" to get comprehensive insights
- View health scores, language distribution, and metrics
- Generate and export detailed reports

### 4. Settings Management
- Configure API keys for different AI providers
- Select default AI provider and model
- Save configuration for future sessions

### 5. Backend Monitoring
- Monitor backend server status
- View real-time logs
- Start/stop backend services
- Check system health

## Features in Detail

### AI Chat System
- **Multi-provider support**: Switch between OpenAI, Gemini, and Claude
- **Context awareness**: Maintains conversation history
- **Code highlighting**: Automatic syntax highlighting in responses
- **Error handling**: Robust error handling and user feedback

### Code Analysis Engine
- **Quality Assessment**: Code style, complexity, maintainability
- **Security Scanning**: Vulnerability detection and recommendations
- **Performance Analysis**: Optimization suggestions
- **Best Practices**: Language-specific recommendations

### Project Management
- **File Organization**: Hierarchical file structure
- **Version Tracking**: Track changes and modifications
- **Health Monitoring**: Overall project health assessment
- **Reporting**: Comprehensive project reports

### Mobile Development
- **Framework Support**: React Native, Flutter, Ionic, Xamarin
- **Template Generation**: Pre-built app templates
- **AI-powered Generation**: Describe your app, get complete code
- **Cross-platform**: Build for iOS, Android, and web

### Cloud Deployment
- **Multiple Providers**: Vercel, Netlify, AWS, Heroku, DigitalOcean, Firebase
- **One-click Deployment**: Deploy directly from the GUI
- **Configuration Management**: Environment variables and build settings
- **Status Monitoring**: Real-time deployment progress

## Architecture

### Frontend (GUI)
- **Tkinter**: Native Python GUI framework
- **Threaded Operations**: Non-blocking UI with background tasks
- **Real-time Updates**: Live status updates and progress indicators
- **Modular Design**: Tabbed interface with separate modules

### Backend (FastAPI)
- **RESTful API**: Clean API design with automatic documentation
- **Async Operations**: High-performance async request handling
- **Modular Services**: Separate managers for different functionalities
- **Extensible**: Easy to add new features and providers

### Data Flow
```
GUI Interface → HTTP Requests → FastAPI Backend → AI Providers
     ↑                                ↓
User Interaction ← JSON Responses ← Processing Results
```

## Development

### Adding New Features

1. **Backend**: Add new endpoints in `enhanced_main.py`
2. **Services**: Create new managers in `models/` directory
3. **GUI**: Add new tabs or components in `gui_interface.py`
4. **Integration**: Connect GUI components to backend APIs

### Testing

```bash
# Run backend tests
cd python-backend
python -m pytest

# Test GUI components
python gui_interface.py
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Backend not starting**:
   - Check if port 8000 is available
   - Verify all dependencies are installed
   - Check the backend logs in the GUI

2. **API key errors**:
   - Ensure API keys are correctly configured
   - Check API key validity with the provider
   - Verify network connectivity

3. **GUI not responding**:
   - Check if backend is running
   - Restart the application
   - Check system resources

### Logs and Debugging

- Backend logs are available in the "Backend Status" tab
- Check console output for detailed error messages
- Enable debug mode in the configuration for verbose logging

## System Requirements

- **Operating System**: Windows, macOS, Linux
- **Python**: 3.8 or higher
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 1GB free space
- **Network**: Internet connection for AI providers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review the backend logs
- Submit issues on the project repository

---

**Agent Coder GUI** - Professional AI-powered development environment with comprehensive Python backend integration.