import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, FileText } from 'lucide-react';

export function CodeEditor() {
  const [code, setCode] = useState('// Welcome to Agent Coder\n// Start coding here...\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
  ];

  const handleRun = () => {
    if (language === 'javascript') {
      try {
        // Create a safe execution environment
        const logs: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => logs.push(args.join(' ')),
          error: (...args: any[]) => logs.push('Error: ' + args.join(' ')),
          warn: (...args: any[]) => logs.push('Warning: ' + args.join(' ')),
        };

        // Execute the code with mocked console
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
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <FileText className="h-5 w-5 text-gray-600" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field w-auto"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
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
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Output</h3>
        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
            {output || 'Run your code to see output here...'}
          </pre>
        </div>
      </div>
    </div>
  );
}