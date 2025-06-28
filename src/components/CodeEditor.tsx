import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useEditor } from '../context/EditorContext';
import { useAI } from '../context/AIContext';
import { TabBar } from './TabBar';
import { AIInlineCompletion } from './AIInlineCompletion';
import { motion } from 'framer-motion';
import { Lightbulb, Zap, Code } from 'lucide-react';

export function CodeEditor() {
  const { state: editorState, dispatch: editorDispatch } = useEditor();
  const { state: aiState, dispatch: aiDispatch } = useAI();
  const editorRef = useRef<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId);

  useEffect(() => {
    if (editorRef.current && activeFile) {
      // Auto-save functionality
      if (editorState.autoSave) {
        const timer = setTimeout(() => {
          editorDispatch({ type: 'SAVE_FILE', payload: activeFile.id });
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [activeFile?.content, editorState.autoSave]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Register AI completion provider
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: async (model: any, position: any) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Trigger AI completion
        if (textUntilPosition.length > 10) {
          // This would call your AI service
          return {
            suggestions: [
              {
                label: 'AI Suggestion',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'console.log("AI generated code");',
                documentation: 'AI-powered code completion'
              }
            ]
          };
        }

        return { suggestions: [] };
      }
    });

    // Track cursor position
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column
      });
    });

    // AI-powered error detection
    editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (model) {
        // Simulate AI-powered error detection
        setTimeout(() => {
          const markers = [
            {
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 1,
              endColumn: 10,
              message: 'AI suggests: Consider using const instead of var',
              severity: monaco.MarkerSeverity.Info,
            }
          ];
          monaco.editor.setModelMarkers(model, 'ai-suggestions', markers);
        }, 1000);
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      editorDispatch({
        type: 'UPDATE_FILE_CONTENT',
        payload: { id: activeFile.id, content: value }
      });
    }
  };

  const generateAICompletion = async () => {
    if (!activeFile || !aiState.apiKeys.openai) return;

    aiDispatch({ type: 'SET_LOADING', payload: true });

    try {
      // This would call your AI service
      const suggestion = {
        id: Date.now().toString(),
        type: 'completion' as const,
        content: '// AI generated code completion\nfunction aiGeneratedFunction() {\n  return "Hello from AI";\n}',
        confidence: 0.85
      };

      aiDispatch({ type: 'ADD_SUGGESTION', payload: suggestion });
      setShowSuggestions(true);
    } catch (error) {
      console.error('AI completion error:', error);
    } finally {
      aiDispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Code className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Welcome to Cursor Alternative</h3>
          <p className="text-gray-500">Open a file to start coding with AI assistance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <TabBar />
      
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={activeFile.language}
          value={activeFile.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={editorState.theme}
          options={{
            fontSize: editorState.fontSize,
            wordWrap: editorState.wordWrap ? 'on' : 'off',
            minimap: { enabled: editorState.minimap },
            lineNumbers: editorState.lineNumbers ? 'on' : 'off',
            tabSize: editorState.tabSize,
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
          }}
        />

        {/* AI Suggestions Overlay */}
        {showSuggestions && aiState.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-sm"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">AI Suggestion</span>
              <button
                onClick={() => setShowSuggestions(false)}
                className="ml-auto text-gray-400 hover:text-gray-200"
              >
                ×
              </button>
            </div>
            {aiState.suggestions.map((suggestion) => (
              <div key={suggestion.id} className="mb-2">
                <div className="text-xs text-gray-400 mb-1">
                  Confidence: {Math.round(suggestion.confidence * 100)}%
                </div>
                <pre className="text-sm bg-gray-900 p-2 rounded text-green-400">
                  {suggestion.content}
                </pre>
                <button
                  onClick={() => {
                    // Apply suggestion
                    const newContent = activeFile.content + '\n' + suggestion.content;
                    editorDispatch({
                      type: 'UPDATE_FILE_CONTENT',
                      payload: { id: activeFile.id, content: newContent }
                    });
                    setShowSuggestions(false);
                  }}
                  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  Apply
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* AI Quick Actions */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={generateAICompletion}
            disabled={aiState.isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
            title="Generate AI completion (Ctrl+Space)"
          >
            <Zap className="h-4 w-4" />
          </button>
        </div>

        {/* Status indicators */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-xs text-gray-400">
          <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
          <span>{activeFile.language}</span>
          {activeFile.isDirty && <span className="text-yellow-500">●</span>}
        </div>
      </div>
    </div>
  );
}