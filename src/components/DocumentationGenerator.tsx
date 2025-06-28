import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useAI } from '../context/AIContext';
import { FileText, Book, Code, Languages, Download, Copy, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface DocumentationFormat {
  id: string;
  name: string;
  description: string;
  extension: string;
  icon: React.ComponentType<any>;
}

interface DocumentationLanguage {
  id: string;
  name: string;
  code: string;
  flag: string;
}

export function DocumentationGenerator() {
  const { state: editorState } = useEditor();
  const { state: aiState } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('markdown');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [copied, setCopied] = useState(false);

  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId);

  const formats: DocumentationFormat[] = [
    { id: 'markdown', name: 'Markdown', description: 'Simple, readable format', extension: '.md', icon: FileText },
    { id: 'html', name: 'HTML', description: 'Web-ready documentation', extension: '.html', icon: Code },
    { id: 'jsdoc', name: 'JSDoc', description: 'JavaScript documentation', extension: '.js', icon: Code },
    { id: 'openapi', name: 'OpenAPI', description: 'API documentation', extension: '.yaml', icon: Book }
  ];

  const languages: DocumentationLanguage[] = [
    { id: 'en', name: 'English', code: 'en-US', flag: '🇺🇸' },
    { id: 'es', name: 'Spanish', code: 'es-ES', flag: '🇪🇸' },
    { id: 'fr', name: 'French', code: 'fr-FR', flag: '🇫🇷' },
    { id: 'de', name: 'German', code: 'de-DE', flag: '🇩🇪' },
    { id: 'ja', name: 'Japanese', code: 'ja-JP', flag: '🇯🇵' },
    { id: 'zh', name: 'Chinese', code: 'zh-CN', flag: '🇨🇳' }
  ];

  const handleGenerateDocs = async () => {
    if (!activeFile || !aiState.apiKeys.openai) return;

    setIsGenerating(true);
    setGeneratedDocs(null);

    try {
      // Simulate AI documentation generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const format = formats.find(f => f.id === selectedFormat);
      
      let docs = '';
      if (format?.id === 'markdown') {
        docs = `# ${activeFile.name} Documentation

## Overview
This file contains functionality for handling user authentication and session management.

## Functions

### \`authenticate(username, password)\`
Authenticates a user with the provided credentials.

**Parameters:**
- \`username\` (string): The user's username or email
- \`password\` (string): The user's password

**Returns:**
- \`Promise<User>\`: A promise that resolves to the authenticated user object
- Throws an error if authentication fails

**Example:**
\`\`\`javascript
try {
  const user = await authenticate('john.doe@example.com', 'password123');
  console.log('Authenticated user:', user);
} catch (error) {
  console.error('Authentication failed:', error);
}
\`\`\`

### \`validateToken(token)\`
Validates a JWT token and returns the associated user.

**Parameters:**
- \`token\` (string): The JWT token to validate

**Returns:**
- \`Promise<User>\`: A promise that resolves to the user associated with the token
- Throws an error if the token is invalid or expired

## Error Handling
All functions in this module use a consistent error handling approach:
- Authentication errors throw \`AuthError\`
- Validation errors throw \`ValidationError\`
- Network errors throw \`NetworkError\`

## Security Considerations
- Passwords are hashed using bcrypt before storage
- Tokens expire after 24 hours
- Failed login attempts are rate-limited`;
      } else if (format?.id === 'jsdoc') {
        docs = `/**
 * @module Authentication
 * @description Handles user authentication and session management
 */

/**
 * Authenticates a user with the provided credentials
 * 
 * @param {string} username - The user's username or email
 * @param {string} password - The user's password
 * @returns {Promise<User>} A promise that resolves to the authenticated user object
 * @throws {AuthError} If authentication fails
 * @example
 * try {
 *   const user = await authenticate('john.doe@example.com', 'password123');
 *   console.log('Authenticated user:', user);
 * } catch (error) {
 *   console.error('Authentication failed:', error);
 * }
 */
function authenticate(username, password) {
  // Implementation details
}

/**
 * Validates a JWT token and returns the associated user
 * 
 * @param {string} token - The JWT token to validate
 * @returns {Promise<User>} A promise that resolves to the user associated with the token
 * @throws {AuthError} If the token is invalid or expired
 */
function validateToken(token) {
  // Implementation details
}`;
      } else {
        docs = `Documentation for ${activeFile.name} in ${format?.name} format`;
      }

      setGeneratedDocs(docs);
    } catch (error) {
      console.error('Documentation generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleLanguage = (langId: string) => {
    setSelectedLanguages(prev =>
      prev.includes(langId)
        ? prev.filter(id => id !== langId)
        : [...prev, langId]
    );
  };

  const handleCopyDocs = async () => {
    if (!generatedDocs) return;
    
    await navigator.clipboard.writeText(generatedDocs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocs = () => {
    if (!generatedDocs || !activeFile) return;
    
    const format = formats.find(f => f.id === selectedFormat);
    const blob = new Blob([generatedDocs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeFile.name.split('.')[0]}-docs${format?.extension || '.txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Configuration Panel */}
      <div className="w-1/3 p-4 border-r border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <Book className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-white">Documentation Generator</h2>
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <h3 className="font-medium text-white mb-3">Current File</h3>
          {activeFile ? (
            <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-white">{activeFile.name}</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {activeFile.language} • {activeFile.content.split('\n').length} lines
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-400">
              No file selected. Please open a file to generate documentation.
            </div>
          )}
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <h3 className="font-medium text-white mb-3">Documentation Format</h3>
          <div className="space-y-2">
            {formats.map((format) => {
              const FormatIcon = format.icon;
              return (
                <label
                  key={format.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                    selectedFormat === format.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={selectedFormat === format.id}
                    onChange={() => setSelectedFormat(format.id)}
                    className="hidden"
                  />
                  <FormatIcon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">{format.name}</div>
                    <div className="text-xs opacity-80">{format.description}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white">Languages</h3>
            <Languages className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {languages.map((language) => (
              <label
                key={language.id}
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                  selectedLanguages.includes(language.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(language.id)}
                  onChange={() => handleToggleLanguage(language.id)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600"
                />
                <span>{language.flag} {language.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateDocs}
          disabled={isGenerating || !activeFile || !aiState.apiKeys.openai}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Book className="h-5 w-5" />
              <span>Generate Documentation</span>
            </>
          )}
        </button>
      </div>

      {/* Documentation Preview */}
      <div className="w-2/3 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Documentation Preview</h3>
          
          {generatedDocs && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyDocs}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              
              <button
                onClick={handleDownloadDocs}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {isGenerating ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Generating documentation...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
            </div>
          </div>
        ) : generatedDocs ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 bg-gray-800 rounded-lg p-6 overflow-y-auto"
          >
            <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
              {generatedDocs}
            </pre>
          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a file and click "Generate Documentation"</p>
              <p className="text-sm mt-1">Documentation will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}