import React, { useState } from 'react';
import { Key, Brain, Save, AlertCircle } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

export function SettingsPanel() {
  const { state, dispatch } = useAgent();
  const [apiKey, setApiKey] = useState(state.apiKey || '');
  const [model, setModel] = useState(state.model);
  const [saved, setSaved] = useState(false);

  const models = [
    { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo (Recommended)' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ];

  const handleSave = () => {
    dispatch({ type: 'SET_API_KEY', payload: apiKey });
    dispatch({ type: 'SET_MODEL', payload: model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Key className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="input-field"
            />
            <p className="text-sm text-gray-500 mt-1">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-field"
            >
              {models.map((modelOption) => (
                <option key={modelOption.value} value={modelOption.value}>
                  {modelOption.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSave}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{saved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Agent Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Clear Chat History</h3>
                <p className="text-sm text-yellow-700">This will remove all chat messages.</p>
              </div>
            </div>
            <button
              onClick={handleClearMessages}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About Agent Coder</h2>
        <div className="prose prose-sm text-gray-600">
          <p>
            Agent Coder is a powerful AI-powered coding assistant that helps you write, debug, and understand code.
            It uses OpenAI's GPT-4 model to provide intelligent code suggestions and explanations.
          </p>
          <ul className="mt-4 space-y-2">
            <li>• Chat with AI about coding problems</li>
            <li>• Generate code in multiple programming languages</li>
            <li>• Debug and optimize existing code</li>
            <li>• Explore and manage project files</li>
            <li>• Built-in code editor with syntax highlighting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}