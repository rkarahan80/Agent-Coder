import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AIInlineCompletionProps {
  position: { line: number; column: number };
  suggestion: string;
  onAccept: () => void;
  onReject: () => void;
}

export function AIInlineCompletion({ 
  position, 
  suggestion, 
  onAccept, 
  onReject 
}: AIInlineCompletionProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        onAccept();
      } else if (e.key === 'Escape') {
        onReject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAccept, onReject]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg max-w-md"
      style={{
        top: `${position.line * 20}px`,
        left: `${position.column * 8}px`,
      }}
    >
      <div className="text-sm text-gray-300 mb-2">AI Suggestion</div>
      <pre className="text-xs text-green-400 bg-gray-900 p-2 rounded mb-3 whitespace-pre-wrap">
        {suggestion}
      </pre>
      <div className="flex items-center justify-between text-xs">
        <div className="text-gray-500">
          Press <kbd className="bg-gray-700 px-1 rounded">Tab</kbd> to accept, 
          <kbd className="bg-gray-700 px-1 rounded ml-1">Esc</kbd> to dismiss
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onAccept}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}