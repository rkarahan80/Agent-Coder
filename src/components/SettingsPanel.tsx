import React, { useState } from 'react';
import { Key, Brain, Save, AlertCircle, Sparkles } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { ModelSelector } from './ModelSelector';
import { AIProvider } from '../types/ai';

export function SettingsPanel() {
  const { state, dispatch } = useAgent();
  const [apiKeys, setApiKeys] = useState(state.apiKeys);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    Object.entries(apiKeys).forEach(([provider, key]) => {
      dispatch({ 
        type: 'SET_API_KEY', 
        payload: { provider: provider as AIProvider, key } 
      });
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const handleClearFiles = () => {
    dispatch({ type: 'LOAD_PROJECT_FILES', payload: [] });
  };

  const getProviderStatus = (provider: AIProvider) => {
    return apiKeys[provider] ? 'Configured' : 'Not configured';
  };

  const getProviderStatusColor = (provider: AIProvider) => {
    return apiKeys[provider] ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
                <span className={`ml-2 text-xs ${getProviderStatusColor('openai')}`}>
                  ({getProviderStatus('openai')})
                </span>
              </label>
              <input
                type="password"
                value={apiKeys.openai}
                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                placeholder="sk-..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Gemini API Key
                <span className={`ml-2 text-xs ${getProviderStatusColor('gemini')}`}>
                  ({getProviderStatus('gemini')})
                </span>
              </label>
              <input
                type="password"
                value={apiKeys.gemini}
                onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                placeholder="AI..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anthropic Claude API Key
                <span className={`ml-2 text-xs ${getProviderStatusColor('claude')}`}>
                  ({getProviderStatus('claude')})
                </span>
              </label>
              <input
                type="password"
                value={apiKeys.claude}
                onChange={(e) => setApiKeys({ ...apiKeys, claude: e.target.value })}
                placeholder="sk-ant-..."
                className="input-field"
              />
            </div>

            <p className="text-sm text-gray-500">
              Your API keys are stored locally and never sent to our servers.
            </p>

            <button
              onClick={handleSave}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saved ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* Model Selection */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <Brain className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Model</h2>
          </div>

          <ModelSelector
            provider={state.provider}
            model={state.model}
            onProviderChange={(provider) => dispatch({ type: 'SET_PROVIDER', payload: provider })}
            onModelChange={(model) => dispatch({ type: 'SET_MODEL', payload: model })}
          />
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <AlertCircle className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <h3 className="font-medium text-yellow-800">Clear Chat History</h3>
              <p className="text-sm text-yellow-700">Remove all chat messages</p>
            </div>
            <button
              onClick={handleClearMessages}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <h3 className="font-medium text-red-800">Clear Project Files</h3>
              <p className="text-sm text-red-700">Remove all project files</p>
            </div>
            <button
              onClick={handleClearFiles}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">About Agent Coder</h2>
        </div>
        
        <div className="prose prose-sm text-gray-600">
          <p>
            Agent Coder is a powerful AI-powered coding assistant that supports multiple AI providers
            and helps you write, debug, and understand code across various programming languages.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Multi-provider AI support (OpenAI, Gemini, Claude)</li>
                <li>• Real-time code analysis and suggestions</li>
                <li>• Project file management</li>
                <li>• Code execution and testing</li>
                <li>• Syntax highlighting and IntelliSense</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Supported Languages</h4>
              <ul className="space-y-1 text-sm">
                <li>• JavaScript/TypeScript</li>
                <li>• Python</li>
                <li>• Java, C/C++</li>
                <li>• HTML/CSS</li>
                <li>• And many more...</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}