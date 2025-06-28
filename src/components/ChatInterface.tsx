import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Download, Play, Sparkles } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { MessageBubble } from './MessageBubble';
import { sendMessage } from '../services/aiService';

const CODING_PROMPTS = [
  "Create a React component for a todo list",
  "Write a Python function to sort a list",
  "Debug this JavaScript code",
  "Explain how async/await works",
  "Create a REST API endpoint",
  "Write unit tests for this function"
];

export function ChatInterface() {
  const { state, dispatch } = useAgent();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || state.isLoading || !state.apiKey) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });
    setInput('');

    try {
      const response = await sendMessage(
        input.trim(), 
        state.messages, 
        state.apiKey, 
        state.model,
        state.provider
      );
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.content,
        timestamp: new Date(),
        codeBlocks: response.codeBlocks
      };

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
        timestamp: new Date()
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  if (!state.apiKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Key Required</h3>
          <p className="text-gray-600 mb-4">Please configure your API key in Settings to start coding with AI.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.messages.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Agent Coder</h3>
            <p className="text-gray-600 mb-6">Ask me to help you with coding tasks, debug issues, or generate code.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {CODING_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
                >
                  <span className="text-sm text-gray-700">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          state.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {state.isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to help you code something..."
            className="flex-1 input-field"
            disabled={state.isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || state.isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Using {state.provider} • {state.model}</span>
          <span>{state.messages.length} messages</span>
        </div>
      </form>
    </div>
  );
}