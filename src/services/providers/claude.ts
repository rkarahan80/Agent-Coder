import { Message, ApiResponse } from '../../types/ai';
import { extractCodeBlocks } from '../utils';

export async function sendClaudeMessage(
  message: string,
  history: Message[],
  apiKey: string,
  model: string
): Promise<ApiResponse> {
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

  const messages = [
    ...history.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user' as const, content: message }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        temperature: 0.7,
        system: systemPrompt,
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || 'No response generated.';
    const codeBlocks = extractCodeBlocks(content);

    return {
      content,
      codeBlocks
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Claude API Error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while calling Claude API');
  }
}