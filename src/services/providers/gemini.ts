import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message, ApiResponse } from '../../types/ai';
import { extractCodeBlocks } from '../utils';

export async function sendGeminiMessage(
  message: string,
  history: Message[],
  apiKey: string,
  model: string
): Promise<ApiResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelInstance = genAI.getGenerativeModel({ model });

  const systemPrompt = `You are Agent Coder, an expert AI coding assistant. You help users with:
- Writing clean, efficient code in multiple programming languages
- Debugging and fixing code issues
- Explaining complex programming concepts
- Code reviews and optimization suggestions
- Best practices and design patterns

When providing code examples:
1. Always specify the programming language
2. Include helpful comments
3. Follow best practices for the language
4. Provide complete, runnable examples when possible
5. Explain your reasoning

Format code blocks using triple backticks with language specification.
Be concise but thorough in your explanations.`;

  try {
    // Convert history to Gemini format
    const chatHistory = history.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = modelInstance.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const content = response.text();
    const codeBlocks = extractCodeBlocks(content);

    return {
      content,
      codeBlocks
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while calling Gemini API');
  }
}