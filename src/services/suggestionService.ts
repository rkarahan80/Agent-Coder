import { AIProvider } from '../types/ai';
import { sendMessage } from './aiService';

interface CodeSuggestion {
  id: string;
  type: 'performance' | 'security' | 'style' | 'refactor' | 'bug';
  title: string;
  description: string;
  originalCode: string;
  suggestedCode: string;
  line: number;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  applied: boolean;
}

export async function getCodeSuggestions(
  code: string,
  language: string,
  apiKey: string,
  provider: AIProvider = 'openai'
): Promise<CodeSuggestion[]> {
  const prompt = `Analyze the following ${language} code and provide specific improvement suggestions. 
For each suggestion, provide:
1. Type (performance, security, style, refactor, bug)
2. Title (brief description)
3. Description (detailed explanation)
4. Original code snippet
5. Suggested code snippet
6. Line number
7. Confidence (0-100)
8. Impact (low, medium, high)

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with a JSON array of suggestions.`;

  try {
    const response = await sendMessage(prompt, [], apiKey, 'gpt-4-turbo-preview', provider);
    
    // Try to extract JSON from the response
    const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[1]);
      return suggestions.map((suggestion: any, index: number) => ({
        id: `suggestion-${Date.now()}-${index}`,
        applied: false,
        ...suggestion
      }));
    }
    
    // Fallback to simulated suggestions
    return generateFallbackSuggestions(code, language);
  } catch (error) {
    console.error('Failed to get AI suggestions:', error);
    return generateFallbackSuggestions(code, language);
  }
}

function generateFallbackSuggestions(code: string, language: string): CodeSuggestion[] {
  const suggestions: CodeSuggestion[] = [];
  const lines = code.split('\n');

  // Check for common patterns
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // JavaScript/TypeScript specific suggestions
    if (language === 'javascript' || language === 'typescript') {
      if (line.includes('var ')) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${index}`,
          type: 'style',
          title: 'Use const/let instead of var',
          description: 'Using const or let provides better scoping and prevents hoisting issues.',
          originalCode: line.trim(),
          suggestedCode: line.replace('var ', 'const '),
          line: lineNumber,
          confidence: 95,
          impact: 'medium',
          applied: false
        });
      }
      
      if (line.includes('== ') && !line.includes('=== ')) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${index}-eq`,
          type: 'bug',
          title: 'Use strict equality (===)',
          description: 'Strict equality prevents type coercion and potential bugs.',
          originalCode: line.trim(),
          suggestedCode: line.replace('== ', '=== '),
          line: lineNumber,
          confidence: 90,
          impact: 'medium',
          applied: false
        });
      }
    }
    
    // Python specific suggestions
    if (language === 'python') {
      if (line.includes('range(len(')) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${index}`,
          type: 'performance',
          title: 'Use enumerate() instead of range(len())',
          description: 'enumerate() is more Pythonic and efficient for iterating with indices.',
          originalCode: line.trim(),
          suggestedCode: line.replace(/range\(len\(([^)]+)\)\)/, 'enumerate($1)'),
          line: lineNumber,
          confidence: 85,
          impact: 'low',
          applied: false
        });
      }
    }
    
    // General suggestions
    if (line.length > 100) {
      suggestions.push({
        id: `suggestion-${Date.now()}-${index}-length`,
        type: 'style',
        title: 'Line too long',
        description: 'Consider breaking this line for better readability.',
        originalCode: line.trim(),
        suggestedCode: '// Consider breaking this line into multiple lines',
        line: lineNumber,
        confidence: 70,
        impact: 'low',
        applied: false
      });
    }
  });

  return suggestions.slice(0, 10); // Limit to 10 suggestions
}