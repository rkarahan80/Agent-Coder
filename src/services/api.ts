// Legacy API service - kept for backward compatibility
// New services should use aiService.ts

import { sendMessage as sendAIMessage } from './aiService';
import { Message, ApiResponse } from '../types/ai';

export async function sendMessage(
  message: string,
  history: Message[],
  apiKey: string,
  model: string
): Promise<ApiResponse> {
  return sendAIMessage(message, history, apiKey, model, 'openai');
}