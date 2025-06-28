from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import asyncio
import uvicorn
from dotenv import load_dotenv
import logging
from datetime import datetime

from models.ai_providers import AIProviderManager
from models.code_analyzer import CodeAnalyzer
from models.project_manager import ProjectManager
from models.collaboration_manager import CollaborationManager
from models.mobile_generator import MobileGenerator
from models.deployment_manager import DeploymentManager

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Agent Coder AI Backend", 
    version="2.0.0",
    description="Enhanced Python backend with GUI support"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_manager = AIProviderManager()
code_analyzer = CodeAnalyzer()
project_manager = ProjectManager()
collaboration_manager = CollaborationManager()
mobile_generator = MobileGenerator()
deployment_manager = DeploymentManager()

# Pydantic models
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
    analysis_type: str = "quality"

class ProjectAnalysisRequest(BaseModel):
    files: Dict[str, str]
    analysis_type: str = "structure"

class MobileAppRequest(BaseModel):
    app_name: str
    description: str
    framework: str
    api_key: str
    provider: str = "openai"

class DeploymentRequest(BaseModel):
    provider: str
    project_name: str
    files: Dict[str, str]
    config: Dict[str, Any]

class CollaborationSessionRequest(BaseModel):
    session_name: str
    initial_code: str = ""

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Agent Coder AI Backend v2.0 is running",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "AI Chat",
            "Code Analysis", 
            "Project Management",
            "Real-time Collaboration",
            "Mobile Development",
            "Cloud Deployment",
            "GUI Interface"
        ]
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "ai_providers": "active",
            "code_analyzer": "active",
            "project_manager": "active",
            "collaboration_manager": "active",
            "mobile_generator": "active",
            "deployment_manager": "active"
        },
        "timestamp": datetime.now().isoformat()
    }

# AI Chat endpoints
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        logger.info(f"Chat request: {request.provider} - {request.model}")
        response = await ai_manager.send_message(
            message=request.message,
            history=request.history,
            provider=request.provider,
            model=request.model,
            api_key=request.api_key
        )
        return response
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def get_available_models():
    return ai_manager.get_available_models()

# Code Analysis endpoints
@app.post("/api/analyze-code")
async def analyze_code(request: CodeAnalysisRequest):
    try:
        logger.info(f"Code analysis: {request.language} - {request.analysis_type}")
        analysis = await code_analyzer.analyze(
            code=request.code,
            language=request.language,
            analysis_type=request.analysis_type
        )
        return analysis
    except Exception as e:
        logger.error(f"Code analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Project Management endpoints
@app.post("/api/analyze-project")
async def analyze_project(request: ProjectAnalysisRequest):
    try:
        logger.info(f"Project analysis: {len(request.files)} files")
        analysis = await project_manager.analyze_project(
            files=request.files,
            analysis_type=request.analysis_type
        )
        return analysis
    except Exception as e:
        logger.error(f"Project analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Mobile Development endpoints
@app.post("/api/generate-mobile-app")
async def generate_mobile_app(request: MobileAppRequest):
    try:
        logger.info(f"Mobile app generation: {request.framework} - {request.app_name}")
        app_code = await mobile_generator.generate_app(
            app_name=request.app_name,
            description=request.description,
            framework=request.framework,
            api_key=request.api_key,
            provider=request.provider
        )
        return {"code": app_code, "framework": request.framework}
    except Exception as e:
        logger.error(f"Mobile app generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Collaboration endpoints
@app.post("/api/collaboration/create-session")
async def create_collaboration_session(request: CollaborationSessionRequest):
    try:
        session = await collaboration_manager.create_session(
            session_name=request.session_name,
            initial_code=request.initial_code
        )
        return session
    except Exception as e:
        logger.error(f"Collaboration session creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/collaboration/sessions")
async def get_collaboration_sessions():
    try:
        sessions = await collaboration_manager.get_active_sessions()
        return sessions
    except Exception as e:
        logger.error(f"Get collaboration sessions error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Deployment endpoints
@app.post("/api/deploy")
async def deploy_project(request: DeploymentRequest, background_tasks: BackgroundTasks):
    try:
        logger.info(f"Deployment request: {request.provider} - {request.project_name}")
        deployment_id = await deployment_manager.start_deployment(
            provider=request.provider,
            project_name=request.project_name,
            files=request.files,
            config=request.config
        )
        return {"deployment_id": deployment_id, "status": "started"}
    except Exception as e:
        logger.error(f"Deployment error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/deploy/{deployment_id}/status")
async def get_deployment_status(deployment_id: str):
    try:
        status = await deployment_manager.get_deployment_status(deployment_id)
        return status
    except Exception as e:
        logger.error(f"Deployment status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# GUI Integration endpoints
@app.get("/api/gui/status")
async def gui_status():
    return {
        "gui_active": True,
        "backend_version": "2.0.0",
        "python_version": "3.8+",
        "features_enabled": [
            "tkinter_gui",
            "real_time_updates",
            "file_management",
            "project_analytics"
        ]
    }

@app.post("/api/gui/execute-code")
async def execute_code(request: Dict[str, Any]):
    """Execute Python code safely (for GUI integration)"""
    try:
        code = request.get("code", "")
        language = request.get("language", "python")
        
        if language == "python":
            # Simple code execution (in production, use proper sandboxing)
            import io
            import sys
            from contextlib import redirect_stdout, redirect_stderr
            
            output = io.StringIO()
            error = io.StringIO()
            
            try:
                with redirect_stdout(output), redirect_stderr(error):
                    exec(code)
                
                return {
                    "success": True,
                    "output": output.getvalue(),
                    "error": error.getvalue()
                }
            except Exception as e:
                return {
                    "success": False,
                    "output": "",
                    "error": str(e)
                }
        else:
            return {
                "success": False,
                "output": "",
                "error": f"Language {language} not supported for execution"
            }
    except Exception as e:
        logger.error(f"Code execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# File management endpoints for GUI
@app.post("/api/files/save")
async def save_file(request: Dict[str, Any]):
    """Save file content"""
    try:
        filename = request.get("filename")
        content = request.get("content")
        
        if not filename or content is None:
            raise HTTPException(status_code=400, detail="Filename and content required")
        
        # Save to a safe directory
        safe_dir = "user_files"
        os.makedirs(safe_dir, exist_ok=True)
        
        filepath = os.path.join(safe_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return {"success": True, "message": f"File {filename} saved successfully"}
    except Exception as e:
        logger.error(f"File save error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/load/{filename}")
async def load_file(filename: str):
    """Load file content"""
    try:
        safe_dir = "user_files"
        filepath = os.path.join(safe_dir, filename)
        
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="File not found")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return {"filename": filename, "content": content}
    except Exception as e:
        logger.error(f"File load error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/list")
async def list_files():
    """List available files"""
    try:
        safe_dir = "user_files"
        if not os.path.exists(safe_dir):
            return {"files": []}
        
        files = []
        for filename in os.listdir(safe_dir):
            filepath = os.path.join(safe_dir, filename)
            if os.path.isfile(filepath):
                stat = os.stat(filepath)
                files.append({
                    "name": filename,
                    "size": stat.st_size,
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                })
        
        return {"files": files}
    except Exception as e:
        logger.error(f"File list error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs("user_files", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    
    # Start the server
    uvicorn.run(
        "enhanced_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )