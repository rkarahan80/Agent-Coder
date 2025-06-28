import OpenAI from 'openai';
import { Message, ApiResponse } from '../../types/ai';
import { extractCodeBlocks } from '../utils';

export async function sendOpenAIMessage(
  message: string,
  history: Message[],
  apiKey: string,
  model: string
): Promise<ApiResponse> {
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

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

Format code blocks using triple backticks with language specification:
\`\`\`javascript
// Your code here
\`\`\`

Be concise but thorough in your explanations.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user' as const, content: message }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0]?.message?.content || 'No response generated.';
    const codeBlocks = extractCodeBlocks(content);

    return {
      content,
      codeBlocks
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while calling OpenAI API');
  }
}