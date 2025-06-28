import React from 'react';
import { useEditor } from '../context/EditorContext';
import { X, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export function TabBar() {
  const { state, dispatch } = useEditor();

  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'CLOSE_FILE', payload: fileId });
  };

  const handleTabClick = (fileId: string) => {
    dispatch({ type: 'SET_ACTIVE_FILE', payload: fileId });
  };

  if (state.files.length === 0) return null;

  return (
    <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {state.files.map((file) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={`flex items-center space-x-2 px-4 py-2 border-r border-gray-700 cursor-pointer min-w-0 max-w-xs group ${
            file.isActive
              ? 'bg-gray-900 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
          }`}
          onClick={() => handleTabClick(file.id)}
        >
          <span className="truncate text-sm">{file.name}</span>
          {file.isDirty && (
            <Circle className="h-2 w-2 fill-current text-yellow-500" />
          )}
          <button
            onClick={(e) => handleCloseTab(file.id, e)}
            className="opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded p-0.5 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}