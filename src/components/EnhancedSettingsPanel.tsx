import React, { useState } from 'react';
import { Settings, Key, Github, Zap, Info, Save, Download, Upload } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { APIKeyManager } from './APIKeyManager';
import { GitHubIntegration } from './GitHubIntegration';
import { ActivationStatus } from './ActivationStatus';

export function EnhancedSettingsPanel() {
  const { state, dispatch } = useAgent();
  const [activeSection, setActiveSection] = useState<'api-keys' | 'github' | 'activation' | 'general' | 'about'>('activation');

  const handleExportSettings = () => {
    const settings = {
      provider: state.provider,
      model: state.model,
      apiKeys: state.apiKeys,
      projectFiles: state.projectFiles,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-coder-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        
        if (settings.provider) {
          dispatch({ type: 'SET_PROVIDER', payload: settings.provider });
        }
        if (settings.model) {
          dispatch({ type: 'SET_MODEL', payload: settings.model });
        }
        if (settings.apiKeys) {
          Object.entries(settings.apiKeys).forEach(([provider, key]) => {
            dispatch({ type: 'SET_API_KEY', payload: { provider: provider as any, key: key as string } });
          });
        }
        if (settings.projectFiles) {
          dispatch({ type: 'LOAD_PROJECT_FILES', payload: settings.projectFiles });
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      dispatch({ type: 'CLEAR_MESSAGES' });
      dispatch({ type: 'LOAD_PROJECT_FILES', payload: [] });
      localStorage.clear();
    }
  };

  const sections = [
    { id: 'activation' as const, label: 'Activation Status', icon: Zap },
    { id: 'api-keys' as const, label: 'API Keys', icon: Key },
    { id: 'github' as const, label: 'GitHub Integration', icon: Github },
    { id: 'general' as const, label: 'General Settings', icon: Settings },
    { id: 'about' as const, label: 'About', icon: Info }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="card">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                    activeSection === section.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'activation' && <ActivationStatus />}
          
          {activeSection === 'api-keys' && <APIKeyManager />}
          
          {activeSection === 'github' && <GitHubIntegration />}
          
          {activeSection === 'general' && (
            <div className="space-y-6">
              {/* Model Selection */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Provider
                    </label>
                    <select
                      value={state.provider}
                      onChange={(e) => dispatch({ type: 'SET_PROVIDER', payload: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="claude">Anthropic Claude</option>
                      <option value="deepseek">DeepSeek</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <select
                      value={state.model}
                      onChange={(e) => dispatch({ type: 'SET_MODEL', payload: e.target.value })}
                      className="input-field"
                    >
                      {state.provider === 'openai' && (
                        <>
                          <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </>
                      )}
                      {state.provider === 'gemini' && (
                        <>
                          <option value="gemini-pro">Gemini Pro</option>
                          <option value="gemini-pro-vision">Gemini Pro Vision</option>
                        </>
                      )}
                      {state.provider === 'claude' && (
                        <>
                          <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                          <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                          <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                        </>
                      )}
                      {state.provider === 'deepseek' && (
                        <>
                          <option value="deepseek-coder">DeepSeek Coder</option>
                          <option value="deepseek-chat">DeepSeek Chat</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-blue-900">Export Settings</h4>
                      <p className="text-sm text-blue-700">Download your configuration and project files</p>
                    </div>
                    <button
                      onClick={handleExportSettings}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-green-900">Import Settings</h4>
                      <p className="text-sm text-green-700">Restore configuration from backup file</p>
                    </div>
                    <label className="btn-primary flex items-center space-x-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span>Import</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportSettings}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-900">Clear All Data</h4>
                      <p className="text-sm text-red-700">Remove all messages, files, and settings</p>
                    </div>
                    <button
                      onClick={handleClearAllData}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'about' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Agent Coder</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Version Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <span className="ml-2 font-medium">2.0.0</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Build:</span>
                      <span className="ml-2 font-medium">2024.01.20</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Framework:</span>
                      <span className="ml-2 font-medium">React + TypeScript</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Backend:</span>
                      <span className="ml-2 font-medium">Python FastAPI</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Multi-provider AI integration (OpenAI, Gemini, Claude, DeepSeek)</li>
                    <li>• Real-time collaborative editing</li>
                    <li>• Advanced debugging tools</li>
                    <li>• Custom AI model integration</li>
                    <li>• Plugin system for extensions</li>
                    <li>• GitHub repository integration</li>
                    <li>• Mobile app development tools</li>
                    <li>• Cloud deployment automation</li>
                    <li>• IDE integration support</li>
                    <li>• Project analytics and insights</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Supported Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'TypeScript', 'Python', 'Java', 'C/C++', 'Go', 'Rust', 'PHP', 'Ruby', 'HTML/CSS'].map((lang) => (
                      <span key={lang} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Privacy & Security</h4>
                  <p className="text-sm text-gray-600">
                    Agent Coder prioritizes your privacy. All API keys are stored locally in your browser 
                    and are never transmitted to our servers. Your code and conversations are only sent 
                    directly to your chosen AI providers according to their respective privacy policies.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}