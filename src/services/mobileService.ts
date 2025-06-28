import { AIProvider } from '../types/ai';
import { sendMessage } from './aiService';

export async function generateMobileApp(
  appName: string,
  description: string,
  framework: string,
  apiKey: string,
  provider: AIProvider = 'openai'
): Promise<string> {
  const prompt = `Generate a complete mobile application called "${appName}" using ${framework}.

Description: ${description}

Requirements:
1. Create a fully functional mobile app
2. Include proper navigation and state management
3. Add appropriate styling and UI components
4. Include error handling and loading states
5. Follow ${framework} best practices
6. Add comments explaining key functionality

Please provide the complete code for the main application file.`;

  try {
    const response = await sendMessage(prompt, [], apiKey, 'gpt-4-turbo-preview', provider);
    
    // Extract code from the response
    const codeMatch = response.content.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
    if (codeMatch) {
      return codeMatch[1];
    }
    
    return response.content;
  } catch (error) {
    console.error('Failed to generate mobile app:', error);
    throw new Error('Failed to generate mobile application');
  }
}

export function getMobileFrameworkInfo(framework: string) {
  const frameworks = {
    'react-native': {
      language: 'javascript',
      extension: 'js',
      packageManager: 'npm',
      buildCommand: 'npx react-native run-android',
      dependencies: ['react', 'react-native']
    },
    'flutter': {
      language: 'dart',
      extension: 'dart',
      packageManager: 'pub',
      buildCommand: 'flutter build apk',
      dependencies: ['flutter']
    },
    'ionic': {
      language: 'typescript',
      extension: 'ts',
      packageManager: 'npm',
      buildCommand: 'ionic build',
      dependencies: ['@ionic/angular', '@ionic/core']
    },
    'xamarin': {
      language: 'csharp',
      extension: 'cs',
      packageManager: 'nuget',
      buildCommand: 'msbuild',
      dependencies: ['Xamarin.Forms']
    }
  };

  return frameworks[framework as keyof typeof frameworks] || frameworks['react-native'];
}