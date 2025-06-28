import React from 'react';
import { Copy, Download, Play } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: Array<{
    language: string;
    code: string;
    filename?: string;
  }>;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl ${isUser ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'} rounded-lg p-4 shadow-sm`}>
        <div className="prose prose-sm max-w-none">
          <p className={`${isUser ? 'text-white' : 'text-gray-800'} whitespace-pre-wrap`}>
            {message.content}
          </p>
        </div>
        
        {message.codeBlocks && message.codeBlocks.length > 0 && (
          <div className="mt-4 space-y-4">
            {message.codeBlocks.map((block, index) => (
              <CodeBlock
                key={index}
                language={block.language}
                code={block.code}
                filename={block.filename}
              />
            ))}
          </div>
        )}
        
        <div className={`text-xs ${isUser ? 'text-primary-100' : 'text-gray-500'} mt-2`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}