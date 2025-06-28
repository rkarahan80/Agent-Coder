from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

from models.ai_providers import AIProviderManager
from models.code_analyzer import CodeAnalyzer
from models.project_manager import ProjectManager

load_dotenv()

app = FastAPI(title="Agent Coder AI Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_manager = AIProviderManager()
code_analyzer = CodeAnalyzer()
project_manager = ProjectManager()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    provider: str = "openai"
    model: str = "gpt-4-turbo-preview"
    api_key: str

class CodeAnalysisRequest(BaseModel):
    code: str
    language: str
    analysis_type: str = "quality"  # quality, security, performance, bugs

class ProjectAnalysisRequest(BaseModel):
    files: Dict[str, str]  # filename -> content
    analysis_type: str = "structure"  # structure, dependencies, complexity

@app.get("/")
async def root():
    return {"message": "Agent Coder AI Backend is running"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = await ai_manager.send_message(
            message=request.message,
            history=request.history,
            provider=request.provider,
            model=request.model,
            api_key=request.api_key
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-code")
async def analyze_code(request: CodeAnalysisRequest):
    try:
        analysis = await code_analyzer.analyze(
            code=request.code,
            language=request.language,
            analysis_type=request.analysis_type
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-project")
async def analyze_project(request: ProjectAnalysisRequest):
    try:
        analysis = await project_manager.analyze_project(
            files=request.files,
            analysis_type=request.analysis_type
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def get_available_models():
    return ai_manager.get_available_models()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "services": ["ai_providers", "code_analyzer", "project_manager"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)