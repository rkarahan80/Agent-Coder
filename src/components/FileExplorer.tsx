import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { 
  Folder, 
  FolderOpen, 
  File, 
  Plus, 
  Search,
  MoreHorizontal,
  FileText,
  Code,
  Image,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  language?: string;
}

const sampleFiles: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        path: '/src/components',
        children: [
          { id: '3', name: 'App.tsx', type: 'file', path: '/src/components/App.tsx', language: 'typescript' },
          { id: '4', name: 'Header.tsx', type: 'file', path: '/src/components/Header.tsx', language: 'typescript' },
        ]
      },
      { id: '5', name: 'index.ts', type: 'file', path: '/src/index.ts', language: 'typescript' },
      { id: '6', name: 'styles.css', type: 'file', path: '/src/styles.css', language: 'css' },
    ]
  },
  {
    id: '7',
    name: 'public',
    type: 'folder',
    path: '/public',
    children: [
      { id: '8', name: 'index.html', type: 'file', path: '/public/index.html', language: 'html' },
    ]
  },
  { id: '9', name: 'package.json', type: 'file', path: '/package.json', language: 'json' },
  { id: '10', name: 'README.md', type: 'file', path: '/README.md', language: 'markdown' },
];

export function FileExplorer() {
  const { dispatch } = useEditor();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1', '2']));
  const [searchTerm, setSearchTerm] = useState('');

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.id) ? FolderOpen : Folder;
    }
    
    switch (file.language) {
      case 'typescript':
      case 'javascript':
        return Code;
      case 'html':
      case 'css':
        return FileText;
      case 'json':
        return Settings;
      default:
        return File;
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const openFile = (file: FileNode) => {
    if (file.type === 'file') {
      const editorFile = {
        id: file.id,
        name: file.name,
        path: file.path,
        content: `// ${file.name}\n// This is a sample file\n\nfunction example() {\n  console.log("Hello from ${file.name}");\n}`,
        language: file.language || 'text',
        isDirty: false,
        isActive: true,
      };
      dispatch({ type: 'OPEN_FILE', payload: editorFile });
    } else {
      toggleFolder(file.id);
    }
  };

  const renderFileTree = (files: FileNode[], depth = 0) => {
    return files
      .filter(file => 
        searchTerm === '' || 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((file) => {
        const Icon = getFileIcon(file);
        const isExpanded = expandedFolders.has(file.id);
        
        return (
          <div key={file.id}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center space-x-2 px-2 py-1 hover:bg-gray-700 cursor-pointer group`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => openFile(file)}
            >
              <Icon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-200 truncate">{file.name}</span>
              {file.type === 'folder' && (
                <MoreHorizontal className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 ml-auto" />
              )}
            </motion.div>
            
            {file.type === 'folder' && isExpanded && file.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {renderFileTree(file.children, depth + 1)}
              </motion.div>
            )}
          </div>
        );
      });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-200">Explorer</h3>
          <button className="p-1 hover:bg-gray-700 rounded">
            <Plus className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {renderFileTree(sampleFiles)}
      </div>
    </div>
  );
}