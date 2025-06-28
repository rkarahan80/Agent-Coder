export type AIProvider = 'openai' | 'gemini' | 'claude' | 'deepseek';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
}

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface ApiResponse {
  content: string;
  codeBlocks: CodeBlock[];
}