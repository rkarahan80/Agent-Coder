import React, { useState, useEffect } from 'react';
import { useEditor } from '../context/EditorContext';
import { useAI } from '../context/AIContext';
import { Search, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import Fuse from 'fuse.js';

interface CommandPaletteProps {
  onClose: () => void;
}

interface Command {
  id: string;
  title: string;
  description: string;
  category: string;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const { dispatch: editorDispatch } = useEditor();
  const { dispatch: aiDispatch } = useAI();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: 'new-file',
      title: 'New File',
      description: 'Create a new file',
      category: 'File',
      action: () => {
        const newFile = {
          id: Date.now().toString(),
          name: 'untitled.txt',
          path: '/untitled.txt',
          content: '',
          language: 'text',
          isDirty: false,
          isActive: true,
        };
        editorDispatch({ type: 'OPEN_FILE', payload: newFile });
        onClose();
      },
      shortcut: 'Ctrl+N'
    },
    {
      id: 'toggle-word-wrap',
      title: 'Toggle Word Wrap',
      description: 'Toggle word wrapping in the editor',
      category: 'Editor',
      action: () => {
        editorDispatch({ type: 'TOGGLE_WORD_WRAP' });
        onClose();
      },
      shortcut: 'Alt+Z'
    },
    {
      id: 'toggle-minimap',
      title: 'Toggle Minimap',
      description: 'Show or hide the minimap',
      category: 'Editor',
      action: () => {
        editorDispatch({ type: 'TOGGLE_MINIMAP' });
        onClose();
      }
    },
    {
      id: 'ai-explain',
      title: 'AI: Explain Code',
      description: 'Ask AI to explain the current code',
      category: 'AI',
      action: () => {
        const message = {
          id: Date.now().toString(),
          role: 'user' as const,
          content: 'Please explain this code',
          timestamp: new Date(),
        };
        aiDispatch({ type: 'ADD_MESSAGE', payload: message });
        onClose();
      }
    },
    {
      id: 'ai-refactor',
      title: 'AI: Refactor Code',
      description: 'Ask AI to suggest refactoring improvements',
      category: 'AI',
      action: () => {
        const message = {
          id: Date.now().toString(),
          role: 'user' as const,
          content: 'Please suggest refactoring improvements for this code',
          timestamp: new Date(),
        };
        aiDispatch({ type: 'ADD_MESSAGE', payload: message });
        onClose();
      }
    },
    {
      id: 'change-theme',
      title: 'Change Theme',
      description: 'Switch between light and dark themes',
      category: 'Appearance',
      action: () => {
        editorDispatch({ 
          type: 'SET_THEME', 
          payload: 'vs-light' // Toggle between themes
        });
        onClose();
      }
    }
  ];

  const fuse = new Fuse(commands, {
    keys: ['title', 'description', 'category'],
    threshold: 0.3,
  });

  const filteredCommands = query
    ? fuse.search(query).map(result => result.item)
    : commands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center p-4 border-b border-gray-700">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            autoFocus
          />
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Command className="h-3 w-3" />
            <span>+</span>
            <span>P</span>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No commands found
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <motion.div
                key={command.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center justify-between p-3 cursor-pointer ${
                  index === selectedIndex
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-200 hover:bg-gray-700'
                }`}
                onClick={command.action}
              >
                <div className="flex-1">
                  <div className="font-medium">{command.title}</div>
                  <div className={`text-sm ${
                    index === selectedIndex ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {command.description}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    index === selectedIndex ? 'bg-blue-500' : 'bg-gray-600'
                  }`}>
                    {command.category}
                  </span>
                  {command.shortcut && (
                    <span className={`text-xs ${
                      index === selectedIndex ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {command.shortcut}
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}