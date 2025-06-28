import React, { useState } from 'react';
import { Folder, File, Plus, Trash2, Download } from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

export function ProjectExplorer() {
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: '1',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: '2',
          name: 'index.js',
          type: 'file',
          content: 'console.log("Hello, World!");'
        },
        {
          id: '3',
          name: 'utils.js',
          type: 'file',
          content: 'export function helper() {\n  return "Helper function";\n}'
        }
      ]
    },
    {
      id: '4',
      name: 'package.json',
      type: 'file',
      content: '{\n  "name": "my-project",\n  "version": "1.0.0"\n}'
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file);
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;

    const newFile: FileNode = {
      id: Date.now().toString(),
      name: newFileName,
      type: newFileName.includes('.') ? 'file' : 'folder',
      content: newFileName.includes('.') ? '' : undefined,
      children: newFileName.includes('.') ? undefined : []
    };

    setFiles([...files, newFile]);
    setNewFileName('');
    setShowNewFileInput(false);
  };

  const handleDeleteFile = (fileId: string) => {
    const deleteFromTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter(node => {
        if (node.id === fileId) return false;
        if (node.children) {
          node.children = deleteFromTree(node.children);
        }
        return true;
      });
    };

    setFiles(deleteFromTree(files));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const handleDownloadProject = () => {
    const projectData = JSON.stringify(files, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${depth * 20}px` }}>
        <div
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
            selectedFile?.id === node.id ? 'bg-primary-100' : ''
          }`}
          onClick={() => handleFileSelect(node)}
        >
          {node.type === 'folder' ? (
            <Folder className="h-4 w-4 text-blue-600" />
          ) : (
            <File className="h-4 w-4 text-gray-600" />
          )}
          <span className="text-sm">{node.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFile(node.id);
            }}
            className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        {node.children && renderFileTree(node.children, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Project Files</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNewFileInput(true)}
              className="btn-secondary flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
            </button>
            <button
              onClick={handleDownloadProject}
              className="btn-secondary flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showNewFileInput && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter file/folder name"
              className="input-field mb-2"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
            />
            <div className="flex space-x-2">
              <button onClick={handleCreateFile} className="btn-primary text-sm">
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewFileInput(false);
                  setNewFileName('');
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1 max-h-96 overflow-y-auto">
          {renderFileTree(files)}
        </div>
      </div>

      <div className="lg:col-span-2 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedFile ? selectedFile.name : 'Select a file to view'}
        </h3>
        
        {selectedFile ? (
          <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
            <pre className="text-gray-100 text-sm font-mono whitespace-pre-wrap">
              {selectedFile.content || '// Empty file'}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <p>Select a file from the project explorer to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
}