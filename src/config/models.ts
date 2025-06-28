import { AIModel } from '../types/ai';

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Most capable OpenAI model with latest knowledge'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    description: 'High-quality reasoning and code generation'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and efficient for most coding tasks'
  },
  
  // Google Gemini Models
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    description: 'Google\'s most capable model for complex reasoning'
  },
  {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: 'gemini',
    description: 'Multimodal model with vision capabilities'
  },
  
  // Anthropic Claude Models
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'claude',
    description: 'Most powerful Claude model for complex tasks'
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: 'claude',
    description: 'Balanced performance and speed'
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'claude',
    description: 'Fastest Claude model for quick responses'
  },
  
  // Deepseek Models
  {
    id: 'deepseek-coder',
    name: 'Deepseek Coder',
    provider: 'deepseek',
    description: 'Specialized coding model with excellent performance'
  },
  {
    id: 'deepseek-chat',
    name: 'Deepseek Chat',
    provider: 'deepseek',
    description: 'General purpose conversational model'
  }
];

export const getModelsByProvider = (provider: string) => {
  return AI_MODELS.filter(model => model.provider === provider);
};

export const getModelById = (id: string) => {
  return AI_MODELS.find(model => model.id === id);
};