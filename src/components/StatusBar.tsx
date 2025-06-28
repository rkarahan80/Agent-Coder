import React from 'react';
import { useEditor } from '../context/EditorContext';
import { useAI } from '../context/AIContext';
import { GitBranch, Zap, AlertCircle, CheckCircle, Github } from 'lucide-react';

export function StatusBar() {
  const { state: editorState } = useEditor();
  const { state: aiState } = useAI();

  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId);
  const isGithubConnected = Boolean(localStorage.getItem('github_token'));

  return (
    <div className="h-6 bg-blue-600 text-white text-xs flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>
        
        {activeFile && (
          <>
            <span>{activeFile.language}</span>
            <span>UTF-8</span>
            <span>LF</span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Zap className="h-3 w-3" />
          <span>AI: {aiState.provider}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {aiState.apiKeys[aiState.provider] ? (
            <CheckCircle className="h-3 w-3 text-green-300" />
          ) : (
            <AlertCircle className="h-3 w-3 text-yellow-300" />
          )}
          <span>
            {aiState.apiKeys[aiState.provider] ? 'Connected' : 'No API Key'}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <Github className="h-3 w-3" />
          <span>
            {isGithubConnected ? 'GitHub Connected' : 'GitHub Not Connected'}
          </span>
        </div>

        <span>Ln 1, Col 1</span>
      </div>
    </div>
  );
}