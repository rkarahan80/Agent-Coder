import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../context/AIContext';
import { useEditor } from '../context/EditorContext';
import { Send, X, Bot, User, Code, Lightbulb, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIChatProps {
  onClose: () => void;
}

export function AIChat({ onClose }: AIChatProps) {
  const { state: aiState, dispatch: aiDispatch } = useAI();
  const { state: editorState } = useEditor();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiState.messages]);

  const sendMessage = async () => {
    if (!input.trim() || aiState.isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };

    aiDispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    setInput('');
    aiDispatch({ type: 'SET_LOADING', payload: true });

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `I understand you want help with: "${input}". Here's what I can suggest:\n\n\`\`\`javascript\n// AI-generated code example\nfunction solution() {\n  // Your code here\n  return "AI assistance";\n}\n\`\`\`\n\nWould you like me to explain this further or help with something else?`,
        timestamp: new Date(),
        type: 'code' as const,
      };

      aiDispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      aiDispatch({ type: 'SET_LOADING', payload: false });
    }, 1500);
  };

  const quickActions = [
    { icon: Code, label: 'Explain Code', action: () => setInput('Explain the current code') },
    { icon: Lightbulb, label: 'Suggest Improvements', action: () => setInput('Suggest improvements for this code') },
    { icon: Zap, label: 'Generate Tests', action: () => setInput('Generate unit tests for this function') },
  ];

  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId);

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-200">AI Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Quick Actions */}
      {activeFile && (
        <div className="p-3 border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Quick Actions for {activeFile.name}</div>
          <div className="flex space-x-1">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300"
              >
                <action.icon className="h-3 w-3" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {aiState.messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p className="text-sm">Ask me anything about your code!</p>
            <p className="text-xs mt-1">I can help with explanations, improvements, debugging, and more.</p>
          </div>
        )}

        {aiState.messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex space-x-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <Bot className="h-6 w-6 text-blue-500" />
              </div>
            )}
            
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </motion.div>
        ))}

        {aiState.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex space-x-2"
          >
            <Bot className="h-6 w-6 text-blue-500" />
            <div className="bg-gray-700 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask AI about your code..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || aiState.isLoading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}