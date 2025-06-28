import { Message, ApiResponse, AIProvider } from '../types/ai';
import { sendOpenAIMessage } from './providers/openai';
import { sendGeminiMessage } from './providers/gemini';
import { sendClaudeMessage } from './providers/claude';

export async function sendMessage(
  message: string,
  history: Message[],
  apiKey: string,
  model: string,
  provider: AIProvider = 'openai'
): Promise<ApiResponse> {
  switch (provider) {
    case 'openai':
      return sendOpenAIMessage(message, history, apiKey, model);
    case 'gemini':
      return sendGeminiMessage(message, history, apiKey, model);
    case 'claude':
      return sendClaudeMessage(message, history, apiKey, model);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

export async function analyzeCode(
  code: string,
  language: string,
  apiKey: string,
  provider: AIProvider = 'openai'
): Promise<{
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    line?: number;
    message: string;
    suggestion?: string;
  }>;
  suggestions: string[];
  score: number;
}> {
  const analysisPrompt = `Analyze the following ${language} code for:
1. Code quality issues
2. Security vulnerabilities
3. Performance problems
4. Best practice violations
5. Potential bugs

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a JSON response with:
- issues: array of {type, severity, line, message, suggestion}
- suggestions: array of improvement suggestions
- score: overall quality score (0-100)`;

  try {
    const response = await sendMessage(analysisPrompt, [], apiKey, 'gpt-4-turbo-preview', provider);
    
    // Try to extract JSON from the response
    const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Fallback to basic analysis
    return {
      issues: [],
      suggestions: ['Consider using a dedicated linter for detailed analysis'],
      score: 75
    };
  } catch (error) {
    console.error('Code analysis error:', error);
    return {
      issues: [],
      suggestions: ['Analysis failed - please check your API configuration'],
      score: 0
    };
  }
}