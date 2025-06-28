import React, { useState } from 'react';
import { Code2, Download, ExternalLink, Settings, CheckCircle, Copy } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

interface IDEExtension {
  id: string;
  name: string;
  description: string;
  icon: string;
  downloadUrl: string;
  features: string[];
  installation: string[];
  configuration: string[];
  shortcuts: Array<{ key: string; description: string }>;
}

const IDE_EXTENSIONS: IDEExtension[] = [
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    description: 'Agent Coder extension for VS Code with AI-powered coding assistance',
    icon: '🔵',
    downloadUrl: 'https://marketplace.visualstudio.com/items?itemName=agent-coder.vscode-extension',
    features: [
      'Inline AI code suggestions',
      'Code analysis and refactoring',
      'Chat interface in sidebar',
      'Project-wide code generation',
      'Real-time collaboration',
      'Custom snippets and templates'
    ],
    installation: [
      'Open VS Code',
      'Go to Extensions (Ctrl+Shift+X)',
      'Search for "Agent Coder"',
      'Click Install',
      'Reload VS Code'
    ],
    configuration: [
      'Open Command Palette (Ctrl+Shift+P)',
      'Type "Agent Coder: Configure"',
      'Enter your API keys',
      'Select preferred AI model',
      'Customize settings'
    ],
    shortcuts: [
      { key: 'Ctrl+Shift+A', description: 'Open Agent Coder chat' },
      { key: 'Ctrl+Alt+G', description: 'Generate code from comment' },
      { key: 'Ctrl+Alt+R', description: 'Refactor selected code' },
      { key: 'Ctrl+Alt+E', description: 'Explain selected code' },
      { key: 'Ctrl+Alt+T', description: 'Generate tests' }
    ]
  },
  {
    id: 'intellij',
    name: 'IntelliJ IDEA',
    description: 'Agent Coder plugin for IntelliJ IDEA and JetBrains IDEs',
    icon: '🟠',
    downloadUrl: 'https://plugins.jetbrains.com/plugin/agent-coder',
    features: [
      'Smart code completion',
      'Code quality analysis',
      'Integrated AI chat',
      'Automated refactoring',
      'Test generation',
      'Documentation generation'
    ],
    installation: [
      'Open IntelliJ IDEA',
      'Go to File > Settings > Plugins',
      'Search for "Agent Coder"',
      'Click Install',
      'Restart IDE'
    ],
    configuration: [
      'Go to File > Settings > Tools > Agent Coder',
      'Configure API keys',
      'Set AI model preferences',
      'Customize code generation settings',
      'Enable desired features'
    ],
    shortcuts: [
      { key: 'Ctrl+Shift+A', description: 'Open Agent Coder panel' },
      { key: 'Alt+Enter', description: 'Show AI suggestions' },
      { key: 'Ctrl+Alt+G', description: 'Generate code' },
      { key: 'Ctrl+Alt+D', description: 'Generate documentation' },
      { key: 'Ctrl+Alt+U', description: 'Generate unit tests' }
    ]
  },
  {
    id: 'sublime',
    name: 'Sublime Text',
    description: 'Agent Coder package for Sublime Text with AI coding features',
    icon: '🟡',
    downloadUrl: 'https://packagecontrol.io/packages/AgentCoder',
    features: [
      'AI-powered autocomplete',
      'Code analysis tools',
      'Quick AI chat',
      'Code transformation',
      'Snippet generation',
      'Multi-language support'
    ],
    installation: [
      'Install Package Control',
      'Open Command Palette (Ctrl+Shift+P)',
      'Type "Package Control: Install Package"',
      'Search for "Agent Coder"',
      'Press Enter to install'
    ],
    configuration: [
      'Go to Preferences > Package Settings > Agent Coder',
      'Open Settings - User',
      'Add your API configuration',
      'Save the settings file',
      'Restart Sublime Text'
    ],
    shortcuts: [
      { key: 'Ctrl+Alt+A', description: 'Open Agent Coder panel' },
      { key: 'Ctrl+Alt+C', description: 'Generate code from selection' },
      { key: 'Ctrl+Alt+F', description: 'Fix code issues' },
      { key: 'Ctrl+Alt+O', description: 'Optimize code' },
      { key: 'Ctrl+Alt+H', description: 'Get help for selection' }
    ]
  },
  {
    id: 'atom',
    name: 'Atom',
    description: 'Agent Coder package for Atom editor with AI assistance',
    icon: '🟢',
    downloadUrl: 'https://atom.io/packages/agent-coder',
    features: [
      'Real-time code suggestions',
      'AI code review',
      'Integrated chat interface',
      'Code generation tools',
      'Error detection and fixes',
      'Custom AI workflows'
    ],
    installation: [
      'Open Atom',
      'Go to File > Settings > Install',
      'Search for "agent-coder"',
      'Click Install',
      'Restart Atom'
    ],
    configuration: [
      'Go to File > Settings > Packages',
      'Find Agent Coder and click Settings',
      'Configure API keys and preferences',
      'Set up custom keybindings',
      'Enable desired features'
    ],
    shortcuts: [
      { key: 'Ctrl+Alt+A', description: 'Toggle Agent Coder panel' },
      { key: 'Ctrl+Alt+G', description: 'Generate code' },
      { key: 'Ctrl+Alt+R', description: 'Review code' },
      { key: 'Ctrl+Alt+S', description: 'Suggest improvements' },
      { key: 'Ctrl+Alt+Q', description: 'Quick AI query' }
    ]
  }
];

export function IDEIntegration() {
  const { state } = useAgent();
  const [selectedIDE, setSelectedIDE] = useState<IDEExtension>(IDE_EXTENSIONS[0]);
  const [activeTab, setActiveTab] = useState<'features' | 'installation' | 'configuration' | 'shortcuts'>('features');
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);

  const handleCopyShortcut = async (shortcut: string) => {
    await navigator.clipboard.writeText(shortcut);
    setCopiedShortcut(shortcut);
    setTimeout(() => setCopiedShortcut(null), 2000);
  };

  const generateConfigFile = () => {
    const config = {
      "agent-coder": {
        "apiKeys": {
          "openai": state.apiKeys.openai || "your-openai-key",
          "gemini": state.apiKeys.gemini || "your-gemini-key",
          "claude": state.apiKeys.claude || "your-claude-key"
        },
        "defaultProvider": state.provider,
        "defaultModel": state.model,
        "features": {
          "autoComplete": true,
          "codeAnalysis": true,
          "chatInterface": true,
          "codeGeneration": true
        }
      }
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-coder-${selectedIDE.id}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Code2 className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">IDE Integration</h2>
        </div>
        
        <button
          onClick={generateConfigFile}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download Config</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IDE Selection */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your IDE</h3>
          
          <div className="space-y-3">
            {IDE_EXTENSIONS.map((ide) => (
              <div
                key={ide.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                  selectedIDE.id === ide.id
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedIDE(ide)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{ide.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{ide.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{ide.description}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-green-600">Available</span>
                  <a
                    href={ide.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Download</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extension Details */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{selectedIDE.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{selectedIDE.name}</h3>
            </div>
            
            <a
              href={selectedIDE.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Install Extension</span>
            </a>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'features', label: 'Features' },
              { id: 'installation', label: 'Installation' },
              { id: 'configuration', label: 'Configuration' },
              { id: 'shortcuts', label: 'Shortcuts' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'features' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Extension Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedIDE.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'installation' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Installation Steps</h4>
                <ol className="space-y-3">
                  {selectedIDE.installation.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {activeTab === 'configuration' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Configuration Guide</h4>
                <ol className="space-y-3 mb-4">
                  {selectedIDE.configuration.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Current Configuration</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider:</span>
                      <span className="font-medium">{state.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{state.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">API Keys:</span>
                      <span className="font-medium">
                        {Object.values(state.apiKeys).filter(key => key).length} configured
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Keyboard Shortcuts</h4>
                <div className="space-y-2">
                  {selectedIDE.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <div className="flex items-center space-x-2">
                        <code className="px-2 py-1 bg-gray-200 rounded text-sm font-mono">
                          {shortcut.key}
                        </code>
                        <button
                          onClick={() => handleCopyShortcut(shortcut.key)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {copiedShortcut === shortcut.key ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Setup */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Setup</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Download className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-blue-900 mb-1">1. Install Extension</h4>
            <p className="text-sm text-blue-700">Download and install the Agent Coder extension for your IDE</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-900 mb-1">2. Configure API Keys</h4>
            <p className="text-sm text-green-700">Set up your AI provider API keys in the extension settings</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Code2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-purple-900 mb-1">3. Start Coding</h4>
            <p className="text-sm text-purple-700">Use keyboard shortcuts to access AI-powered coding features</p>
          </div>
        </div>
      </div>
    </div>
  );
}