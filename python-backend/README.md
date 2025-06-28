# Agent Coder Python Backend

A powerful Python backend service for the Agent Coder AI coding assistant, providing advanced AI model integration, code analysis, and project management capabilities.

## Features

- **Multi-Provider AI Support**: OpenAI GPT, Google Gemini, and Anthropic Claude
- **Advanced Code Analysis**: Quality, security, performance, and complexity analysis
- **Project Management**: Structure analysis, dependency mapping, and health scoring
- **RESTful API**: FastAPI-based service with automatic documentation
- **Extensible Architecture**: Easy to add new AI providers and analysis tools

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

## Usage

### Start the server:
```bash
python run.py
```

### API Endpoints

- `POST /api/chat` - Chat with AI models
- `POST /api/analyze-code` - Analyze code quality and security
- `POST /api/analyze-project` - Analyze entire project structure
- `GET /api/models` - Get available AI models
- `GET /api/health` - Health check

### API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Supported AI Providers

### OpenAI
- GPT-4 Turbo Preview
- GPT-4
- GPT-3.5 Turbo

### Google Gemini
- Gemini Pro
- Gemini Pro Vision

### Anthropic Claude
- Claude 3 Opus
- Claude 3 Sonnet
- Claude 3 Haiku

## Code Analysis Features

### Python Analysis
- Syntax validation
- Style checking (PEP 8)
- Security vulnerability detection
- Performance optimization suggestions
- Complexity metrics
- Type hint recommendations

### Multi-Language Support
- JavaScript/TypeScript
- Java
- C/C++
- And more...

## Project Analysis

- File structure analysis
- Dependency mapping
- Test coverage estimation
- Documentation coverage
- Health scoring
- Architecture recommendations

## Development

### Adding New AI Providers

1. Extend `AIProviderManager` in `models/ai_providers.py`
2. Add provider-specific chat method
3. Update model configuration

### Adding New Analysis Tools

1. Extend `CodeAnalyzer` in `models/code_analyzer.py`
2. Implement language-specific analysis
3. Add new analysis types

## Configuration

Environment variables:
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_API_KEY` - Google Gemini API key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)
- `DEBUG` - Debug mode (default: True)

## License

MIT License - see LICENSE file for details.