import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, FileText, Plus, Trash2, Download } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { CodeAnalyzer } from './CodeAnalyzer';
import { getLanguageFromExtension, formatFileSize } from '../services/utils';

export function CodeEditor() {
  const { state, dispatch } = useAgent();
  const [code, setCode] = useState('// Welcome to Agent Coder\n// Start coding here...\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();');
  const [output, setOutput] = useState('');
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);

  const activeFile = state.projectFiles.find(f => f.id === state.activeFile);
  const language = activeFile ? activeFile.language : 'javascript';

  useEffect(() => {
    if (activeFile) {
      setCode(activeFile.content);
    }
  }, [activeFile]);

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    
    if (activeFile) {
      dispatch({
        type: 'UPDATE_PROJECT_FILE',
        payload: { id: activeFile.id, content: newCode }
      });
    }
  };

  const handleRun = () => {
    if (language === 'javascript') {
      try {
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => logs.push(args.join(' ')),
          error: (...args: any[]) => logs.push('Error: ' + args.join(' ')),
          warn: (...args: any[]) => logs.push('Warning: ' + args.join(' ')),
        };

        const func = new Function('console', code);
        func(mockConsole);
        
        setOutput(logs.join('\n') || 'Code executed successfully (no output)');
      } catch (error) {
        setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      setOutput(`Code execution is currently only supported for JavaScript. Your ${language} code looks good!`);
    }
  };

  const handleSave = () => {
    const filename = activeFile?.name || `code.${language === 'javascript' ? 'js' : language}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;

    const newFile = {
      id: Date.now().toString(),
      name: newFileName,
      path: newFileName,
      content: '',
      language: getLanguageFromExtension(newFileName),
      size: 0,
      lastModified: new Date()
    };

    dispatch({ type: 'ADD_PROJECT_FILE', payload: newFile });
    dispatch({ type: 'SET_ACTIVE_FILE', payload: newFile.id });
    setNewFileName('');
    setShowNewFileDialog(false);
  };

  const handleDeleteFile = (fileId: string) => {
    dispatch({ type: 'DELETE_PROJECT_FILE', payload: fileId });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
      {/* File Explorer */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Files</h3>
          <button
            onClick={() => setShowNewFileDialog(true)}
            className="btn-secondary flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>New</span>
          </button>
        </div>

        {showNewFileDialog && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.js"
              className="input-field mb-2"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
            />
            <div className="flex space-x-2">
              <button onClick={handleCreateFile} className="btn-primary text-sm">
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewFileDialog(false);
                  setNewFileName('');
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {state.projectFiles.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100 ${
                state.activeFile === file.id ? 'bg-primary-100' : ''
              }`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_FILE', payload: file.id })}
            >
              <div className="flex items-center space-x-2 flex-1">
                <FileText className="h-4 w-4 text-gray-600" />
                <div>
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-gray-500">{formatFileSize(file.content.length)}</div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="lg:col-span-2 card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <FileText className="h-5 w-5 text-gray-600" />
            <span className="font-medium">
              {activeFile?.name || 'Untitled'}
            </span>
            <span className="text-sm text-gray-500">
              {language}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAnalyzer(!showAnalyzer)}
              className={`btn-secondary flex items-center space-x-2 ${showAnalyzer ? 'bg-primary-100' : ''}`}
            >
              <span>Analyze</span>
            </button>
            <button onClick={handleRun} className="btn-primary flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Run</span>
            </button>
            <button onClick={handleSave} className="btn-secondary flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
        <Editor
          height="calc(100% - 73px)"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
          }}
        />
      </div>

      {/* Output and Analysis */}
      <div className="space-y-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Output</h3>
          <div className="bg-gray-900 rounded-lg p-4 h-32 overflow-y-auto">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
              {output || 'Run your code to see output here...'}
            </pre>
          </div>
        </div>

        {showAnalyzer && (
          <CodeAnalyzer code={code} filename={activeFile?.name} />
        )}
      </div>
    </div>
  );
}