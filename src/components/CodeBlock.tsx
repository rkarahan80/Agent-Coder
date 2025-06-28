import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
  filename?: string;
}

export function CodeBlock({ language, code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm font-medium">{language}</span>
          {filename && (
            <span className="text-gray-400 text-sm">• {filename}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
            title="Copy code"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
            title="Download file"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-gray-100 text-sm font-mono whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}