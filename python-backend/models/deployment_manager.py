import asyncio
import uuid
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from datetime import datetime
import json
import os

@dataclass
class DeploymentConfig:
    provider: str
    project_name: str
    build_command: str
    output_directory: str
    environment_variables: Dict[str, str]
    custom_domain: Optional[str] = None

@dataclass
class DeploymentStatus:
    deployment_id: str
    status: str  # pending, building, deploying, success, failed
    progress: int  # 0-100
    logs: List[str]
    url: Optional[str] = None
    error_message: Optional[str] = None
    started_at: datetime = None
    completed_at: Optional[datetime] = None

class DeploymentManager:
    def __init__(self):
        self.deployments: Dict[str, DeploymentStatus] = {}
        self.supported_providers = {
            "vercel": {
                "name": "Vercel",
                "supports_domains": True,
                "build_timeout": 600,  # 10 minutes
                "url_pattern": "https://{project}.vercel.app"
            },
            "netlify": {
                "name": "Netlify",
                "supports_domains": True,
                "build_timeout": 900,  # 15 minutes
                "url_pattern": "https://{project}.netlify.app"
            },
            "aws": {
                "name": "AWS S3",
                "supports_domains": True,
                "build_timeout": 1200,  # 20 minutes
                "url_pattern": "https://{project}.s3-website.amazonaws.com"
            },
            "heroku": {
                "name": "Heroku",
                "supports_domains": True,
                "build_timeout": 900,  # 15 minutes
                "url_pattern": "https://{project}.herokuapp.com"
            },
            "digitalocean": {
                "name": "DigitalOcean",
                "supports_domains": True,
                "build_timeout": 600,  # 10 minutes
                "url_pattern": "https://{project}.ondigitalocean.app"
            },
            "firebase": {
                "name": "Firebase",
                "supports_domains": True,
                "build_timeout": 600,  # 10 minutes
                "url_pattern": "https://{project}.web.app"
            }
        }
    
    async def start_deployment(
        self,
        provider: str,
        project_name: str,
        files: Dict[str, str],
        config: Dict[str, Any]
    ) -> str:
        """Start a new deployment"""
        if provider not in self.supported_providers:
            raise ValueError(f"Unsupported deployment provider: {provider}")
        
        deployment_id = str(uuid.uuid4())
        
        # Create deployment status
        deployment_status = DeploymentStatus(
            deployment_id=deployment_id,
            status="pending",
            progress=0,
            logs=[],
            started_at=datetime.now()
        )
        
        self.deployments[deployment_id] = deployment_status
        
        # Start deployment process in background
        asyncio.create_task(self._execute_deployment(
            deployment_id, provider, project_name, files, config
        ))
        
        return deployment_id
    
    async def _execute_deployment(
        self,
        deployment_id: str,
        provider: str,
        project_name: str,
        files: Dict[str, str],
        config: Dict[str, Any]
    ):
        """Execute the deployment process"""
        deployment = self.deployments[deployment_id]
        
        try:
            # Step 1: Validate files and configuration
            await self._update_deployment_status(
                deployment_id, "building", 10, ["Validating project files..."]
            )
            
            validation_result = await self._validate_deployment(files, config)
            if not validation_result["valid"]:
                raise Exception(f"Validation failed: {validation_result['error']}")
            
            # Step 2: Prepare build environment
            await self._update_deployment_status(
                deployment_id, "building", 25, ["Preparing build environment..."]
            )
            await asyncio.sleep(2)  # Simulate preparation time
            
            # Step 3: Build project
            await self._update_deployment_status(
                deployment_id, "building", 50, ["Building project..."]
            )
            
            build_result = await self._build_project(files, config)
            if not build_result["success"]:
                raise Exception(f"Build failed: {build_result['error']}")
            
            # Step 4: Deploy to provider
            await self._update_deployment_status(
                deployment_id, "deploying", 75, ["Deploying to " + provider + "..."]
            )
            
            deploy_result = await self._deploy_to_provider(
                provider, project_name, build_result["artifacts"], config
            )
            
            # Step 5: Configure domain and finalize
            await self._update_deployment_status(
                deployment_id, "deploying", 90, ["Configuring domain and CDN..."]
            )
            await asyncio.sleep(2)  # Simulate domain configuration
            
            # Step 6: Complete deployment
            provider_info = self.supported_providers[provider]
            project_slug = project_name.lower().replace(" ", "-").replace("_", "-")
            deployment_url = provider_info["url_pattern"].format(project=project_slug)
            
            deployment.status = "success"
            deployment.progress = 100
            deployment.url = deployment_url
            deployment.completed_at = datetime.now()
            deployment.logs.append("Deployment completed successfully!")
            deployment.logs.append(f"Your app is live at: {deployment_url}")
            
        except Exception as e:
            deployment.status = "failed"
            deployment.error_message = str(e)
            deployment.completed_at = datetime.now()
            deployment.logs.append(f"Deployment failed: {str(e)}")
    
    async def _update_deployment_status(
        self,
        deployment_id: str,
        status: str,
        progress: int,
        new_logs: List[str]
    ):
        """Update deployment status"""
        if deployment_id in self.deployments:
            deployment = self.deployments[deployment_id]
            deployment.status = status
            deployment.progress = progress
            deployment.logs.extend(new_logs)
    
    async def _validate_deployment(self, files: Dict[str, str], config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate deployment files and configuration"""
        # Basic validation
        if not files:
            return {"valid": False, "error": "No files provided"}
        
        # Check for required files based on project type
        has_html = any(filename.endswith('.html') for filename in files.keys())
        has_js = any(filename.endswith('.js') for filename in files.keys())
        has_package_json = 'package.json' in files
        
        if not (has_html or has_js or has_package_json):
            return {"valid": False, "error": "No recognizable web project files found"}
        
        return {"valid": True}
    
    async def _build_project(self, files: Dict[str, str], config: Dict[str, Any]) -> Dict[str, Any]:
        """Build the project"""
        # Simulate build process
        await asyncio.sleep(3)
        
        # Check if build command is provided
        build_command = config.get("build_command", "")
        
        if build_command:
            # Simulate running build command
            build_logs = [
                f"Running: {build_command}",
                "Installing dependencies...",
                "Compiling assets...",
                "Optimizing for production...",
                "Build completed successfully!"
            ]
        else:
            build_logs = [
                "No build command specified, using static files",
                "Preparing static assets...",
                "Static build completed!"
            ]
        
        # Simulate build artifacts
        artifacts = {
            "index.html": files.get("index.html", "<html><body><h1>Hello World</h1></body></html>"),
            "style.css": "body { font-family: Arial, sans-serif; }",
            "script.js": "console.log('App loaded');"
        }
        
        return {
            "success": True,
            "artifacts": artifacts,
            "logs": build_logs
        }
    
    async def _deploy_to_provider(
        self,
        provider: str,
        project_name: str,
        artifacts: Dict[str, str],
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Deploy to the specified provider"""
        # Simulate deployment to provider
        await asyncio.sleep(4)
        
        provider_info = self.supported_providers[provider]
        
        deploy_logs = [
            f"Connecting to {provider_info['name']}...",
            "Uploading files...",
            f"Uploaded {len(artifacts)} files",
            "Configuring CDN...",
            "Setting up SSL certificate...",
            f"Deployment to {provider_info['name']} completed!"
        ]
        
        return {
            "success": True,
            "logs": deploy_logs,
            "provider": provider
        }
    
    async def get_deployment_status(self, deployment_id: str) -> Dict[str, Any]:
        """Get deployment status"""
        if deployment_id not in self.deployments:
            raise ValueError(f"Deployment {deployment_id} not found")
        
        deployment = self.deployments[deployment_id]
        return asdict(deployment)
    
    async def get_deployment_logs(self, deployment_id: str) -> List[str]:
        """Get deployment logs"""
        if deployment_id not in self.deployments:
            raise ValueError(f"Deployment {deployment_id} not found")
        
        return self.deployments[deployment_id].logs
    
    async def cancel_deployment(self, deployment_id: str) -> bool:
        """Cancel a deployment"""
        if deployment_id not in self.deployments:
            return False
        
        deployment = self.deployments[deployment_id]
        if deployment.status in ["pending", "building", "deploying"]:
            deployment.status = "cancelled"
            deployment.completed_at = datetime.now()
            deployment.logs.append("Deployment cancelled by user")
            return True
        
        return False
    
    async def list_deployments(self, limit: int = 50) -> List[Dict[str, Any]]:
        """List recent deployments"""
        deployments = list(self.deployments.values())
        deployments.sort(key=lambda d: d.started_at, reverse=True)
        
        return [asdict(d) for d in deployments[:limit]]
    
    def get_supported_providers(self) -> Dict[str, Dict[str, Any]]:
        """Get list of supported deployment providers"""
        return self.supported_providers
    
    async def generate_deployment_script(self, provider: str, config: Dict[str, Any]) -> str:
        """Generate deployment script for manual deployment"""
        if provider not in self.supported_providers:
            raise ValueError(f"Unsupported provider: {provider}")
        
        scripts = {
            "vercel": f"""# Vercel Deployment Script
npm install -g vercel
vercel --prod --name {config.get('project_name', 'my-project')}

# Environment Variables
{self._format_env_vars(config.get('environment_variables', {}))}
""",
            "netlify": f"""# Netlify Deployment Script
npm install -g netlify-cli
netlify deploy --prod --dir {config.get('output_directory', 'dist')}

# Build Command: {config.get('build_command', 'npm run build')}
""",
            "aws": f"""# AWS S3 Deployment Script
aws s3 sync {config.get('output_directory', 'dist')} s3://{config.get('project_name', 'my-project')}
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
""",
            "heroku": f"""# Heroku Deployment Script
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Set environment variables:
{self._format_heroku_env_vars(config.get('environment_variables', {}))}
""",
            "digitalocean": f"""# DigitalOcean App Platform
doctl apps create --spec app.yaml

# Project: {config.get('project_name', 'my-project')}
# Build Command: {config.get('build_command', 'npm run build')}
""",
            "firebase": f"""# Firebase Deployment Script
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy --project {config.get('project_name', 'my-project')}
"""
        }
        
        return scripts.get(provider, "# Deployment script not available")
    
    def _format_env_vars(self, env_vars: Dict[str, str]) -> str:
        """Format environment variables for shell scripts"""
        if not env_vars:
            return "# No environment variables"
        
        lines = []
        for key, value in env_vars.items():
            lines.append(f"export {key}={value}")
        
        return "\n".join(lines)
    
    def _format_heroku_env_vars(self, env_vars: Dict[str, str]) -> str:
        """Format environment variables for Heroku"""
        if not env_vars:
            return "# No environment variables"
        
        lines = []
        for key, value in env_vars.items():
            lines.append(f"heroku config:set {key}={value}")
        
        return "\n".join(lines)