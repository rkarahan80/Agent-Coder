import openai
import google.generativeai as genai
from anthropic import Anthropic
from typing import List, Dict, Any, Optional
import re
import asyncio
from dataclasses import dataclass

@dataclass
class CodeBlock:
    language: str
    code: str
    filename: Optional[str] = None

@dataclass
class AIResponse:
    content: str
    code_blocks: List[CodeBlock]
    metadata: Dict[str, Any]

class AIProviderManager:
    def __init__(self):
        self.providers = {
            "openai": self._openai_chat,
            "gemini": self._gemini_chat,
            "claude": self._claude_chat
        }
        
        self.models = {
            "openai": [
                "gpt-4-turbo-preview",
                "gpt-4",
                "gpt-3.5-turbo"
            ],
            "gemini": [
                "gemini-pro",
                "gemini-pro-vision"
            ],
            "claude": [
                "claude-3-opus-20240229",
                "claude-3-sonnet-20240229",
                "claude-3-haiku-20240307"
            ]
        }

    async def send_message(
        self,
        message: str,
        history: List[Dict[str, str]],
        provider: str,
        model: str,
        api_key: str
    ) -> AIResponse:
        if provider not in self.providers:
            raise ValueError(f"Unsupported provider: {provider}")
        
        return await self.providers[provider](message, history, model, api_key)

    async def _openai_chat(
        self,
        message: str,
        history: List[Dict[str, str]],
        model: str,
        api_key: str
    ) -> AIResponse:
        client = openai.OpenAI(api_key=api_key)
        
        system_prompt = self._get_system_prompt()
        
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history[-10:])  # Keep last 10 messages
        messages.append({"role": "user", "content": message})
        
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            code_blocks = self._extract_code_blocks(content)
            
            return AIResponse(
                content=content,
                code_blocks=code_blocks,
                metadata={
                    "provider": "openai",
                    "model": model,
                    "tokens_used": response.usage.total_tokens if response.usage else 0
                }
            )
        except Exception as e:
            raise Exception(f"OpenAI API Error: {str(e)}")

    async def _gemini_chat(
        self,
        message: str,
        history: List[Dict[str, str]],
        model: str,
        api_key: str
    ) -> AIResponse:
        genai.configure(api_key=api_key)
        model_instance = genai.GenerativeModel(model)
        
        # Convert history to Gemini format
        chat_history = []
        for msg in history[-10:]:
            role = "user" if msg["role"] == "user" else "model"
            chat_history.append({"role": role, "parts": [msg["content"]]})
        
        try:
            chat = model_instance.start_chat(history=chat_history)
            response = chat.send_message(message)
            
            content = response.text
            code_blocks = self._extract_code_blocks(content)
            
            return AIResponse(
                content=content,
                code_blocks=code_blocks,
                metadata={
                    "provider": "gemini",
                    "model": model,
                    "safety_ratings": response.candidates[0].safety_ratings if response.candidates else []
                }
            )
        except Exception as e:
            raise Exception(f"Gemini API Error: {str(e)}")

    async def _claude_chat(
        self,
        message: str,
        history: List[Dict[str, str]],
        model: str,
        api_key: str
    ) -> AIResponse:
        client = Anthropic(api_key=api_key)
        
        system_prompt = self._get_system_prompt()
        
        # Convert history to Claude format
        messages = []
        for msg in history[-10:]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        messages.append({"role": "user", "content": message})
        
        try:
            response = client.messages.create(
                model=model,
                max_tokens=2000,
                temperature=0.7,
                system=system_prompt,
                messages=messages
            )
            
            content = response.content[0].text
            code_blocks = self._extract_code_blocks(content)
            
            return AIResponse(
                content=content,
                code_blocks=code_blocks,
                metadata={
                    "provider": "claude",
                    "model": model,
                    "tokens_used": response.usage.input_tokens + response.usage.output_tokens
                }
            )
        except Exception as e:
            raise Exception(f"Claude API Error: {str(e)}")

    def _get_system_prompt(self) -> str:
        return """You are Agent Coder, an expert AI coding assistant. You help users with:
- Writing clean, efficient code in multiple programming languages
- Debugging and fixing code issues
- Explaining complex programming concepts
- Code reviews and optimization suggestions
- Best practices and design patterns
- Architecture and system design

When providing code examples:
1. Always specify the programming language
2. Include helpful comments
3. Follow best practices for the language
4. Provide complete, runnable examples when possible
5. Explain your reasoning
6. Consider security, performance, and maintainability

Format code blocks using triple backticks with language specification:
```python
# Your code here
```

Be concise but thorough in your explanations. Focus on practical, actionable advice."""

    def _extract_code_blocks(self, content: str) -> List[CodeBlock]:
        code_block_pattern = r'```(\w+)?\n(.*?)```'
        matches = re.findall(code_block_pattern, content, re.DOTALL)
        
        blocks = []
        for language, code in matches:
            language = language or 'text'
            filename = self._get_filename_from_language(language)
            blocks.append(CodeBlock(
                language=language,
                code=code.strip(),
                filename=filename
            ))
        
        return blocks

    def _get_filename_from_language(self, language: str) -> str:
        extensions = {
            'python': 'py',
            'javascript': 'js',
            'typescript': 'ts',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'yaml': 'yml',
            'sql': 'sql',
            'bash': 'sh',
            'shell': 'sh',
            'go': 'go',
            'rust': 'rs',
            'php': 'php',
            'ruby': 'rb'
        }
        
        ext = extensions.get(language.lower(), 'txt')
        return f"example.{ext}"

    def get_available_models(self) -> Dict[str, List[str]]:
        return self.models