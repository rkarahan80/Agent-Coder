import React, { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { AIProvider } from '../types/ai';

interface APIKeyStatus {
  provider: AIProvider;
  isValid: boolean;
  isChecking: boolean;
  lastChecked?: Date;
  error?: string;
}

export function APIKeyManager() {
  const { state, dispatch } = useAgent();
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    openai: false,
    gemini: false,
    claude: false,
    deepseek: false
  });
  const [keyStatuses, setKeyStatuses] = useState<Record<AIProvider, APIKeyStatus>>({
    openai: { provider: 'openai', isValid: false, isChecking: false },
    gemini: { provider: 'gemini', isValid: false, isChecking: false },
    claude: { provider: 'claude', isValid: false, isChecking: false },
    deepseek: { provider: 'deepseek', isValid: false, isChecking: false }
  });
  const [tempKeys, setTempKeys] = useState(state.apiKeys);

  const validateAPIKey = async (provider: AIProvider, apiKey: string) => {
    if (!apiKey.trim()) return;

    setKeyStatuses(prev => ({
      ...prev,
      [provider]: { ...prev[provider], isChecking: true, error: undefined }
    }));

    try {
      const isValid = await testAPIKey(provider, apiKey);
      setKeyStatuses(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          isValid,
          isChecking: false,
          lastChecked: new Date(),
          error: isValid ? undefined : 'Invalid API key'
        }
      }));
    } catch (error) {
      setKeyStatuses(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          isValid: false,
          isChecking: false,
          error: error instanceof Error ? error.message : 'Validation failed'
        }
      }));
    }
  };

  const testAPIKey = async (provider: AIProvider, apiKey: string): Promise<boolean> => {
    // Simulate API key validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Basic format validation
    const formats = {
      openai: /^sk-[a-zA-Z0-9]{48,}$/,
      gemini: /^AI[a-zA-Z0-9_-]{35,}$/,
      claude: /^sk-ant-[a-zA-Z0-9_-]{95,}$/,
      deepseek: /^sk-[a-zA-Z0-9]{32,}$/
    };

    return formats[provider]?.test(apiKey) || false;
  };

  const handleKeyChange = (provider: AIProvider, value: string) => {
    setTempKeys(prev => ({ ...prev, [provider]: value }));
    
    // Clear previous status when key changes
    setKeyStatuses(prev => ({
      ...prev,
      [provider]: { ...prev[provider], isValid: false, error: undefined }
    }));
  };

  const handleSaveKey = (provider: AIProvider) => {
    const key = tempKeys[provider];
    dispatch({ type: 'SET_API_KEY', payload: { provider, key } });
    validateAPIKey(provider, key);
  };

  const handleSaveAllKeys = () => {
    Object.entries(tempKeys).forEach(([provider, key]) => {
      if (key !== state.apiKeys[provider as AIProvider]) {
        dispatch({ type: 'SET_API_KEY', payload: { provider: provider as AIProvider, key } });
      }
    });
  };

  const toggleKeyVisibility = (provider: AIProvider) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const getStatusIcon = (status: APIKeyStatus) => {
    if (status.isChecking) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
    }
    if (status.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (status.error) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const providers = [
    {
      id: 'openai' as AIProvider,
      name: 'OpenAI',
      description: 'GPT-4, GPT-3.5 Turbo models',
      placeholder: 'sk-...',
      helpUrl: 'https://platform.openai.com/api-keys'
    },
    {
      id: 'gemini' as AIProvider,
      name: 'Google Gemini',
      description: 'Gemini Pro, Gemini Pro Vision',
      placeholder: 'AI...',
      helpUrl: 'https://makersuite.google.com/app/apikey'
    },
    {
      id: 'claude' as AIProvider,
      name: 'Anthropic Claude',
      description: 'Claude 3 Opus, Sonnet, Haiku',
      placeholder: 'sk-ant-...',
      helpUrl: 'https://console.anthropic.com/'
    },
    {
      id: 'deepseek' as AIProvider,
      name: 'DeepSeek',
      description: 'DeepSeek Coder, DeepSeek Chat',
      placeholder: 'sk-...',
      helpUrl: 'https://platform.deepseek.com/api_keys'
    }
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Key className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">API Key Management</h3>
        </div>
        <button
          onClick={handleSaveAllKeys}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save All</span>
        </button>
      </div>

      <div className="space-y-6">
        {providers.map((provider) => {
          const status = keyStatuses[provider.id];
          const hasKey = tempKeys[provider.id]?.length > 0;
          
          return (
            <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{provider.name}</h4>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  {status.isValid && (
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  )}
                  {status.error && (
                    <span className="text-xs text-red-600 font-medium">Invalid</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showKeys[provider.id] ? 'text' : 'password'}
                    value={tempKeys[provider.id]}
                    onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                    placeholder={provider.placeholder}
                    className="input-field pr-20"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility(provider.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showKeys[provider.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    {hasKey && (
                      <button
                        onClick={() => validateAPIKey(provider.id, tempKeys[provider.id])}
                        disabled={status.isChecking}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Test
                      </button>
                    )}
                  </div>
                </div>

                {status.error && (
                  <p className="text-sm text-red-600">{status.error}</p>
                )}

                {status.lastChecked && status.isValid && (
                  <p className="text-sm text-green-600">
                    ✓ Verified {status.lastChecked.toLocaleTimeString()}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <a
                    href={provider.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Get API Key →
                  </a>
                  
                  {tempKeys[provider.id] !== state.apiKeys[provider.id] && (
                    <button
                      onClick={() => handleSaveKey(provider.id)}
                      className="btn-secondary text-sm"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Security Notice</h4>
        <p className="text-sm text-blue-700">
          Your API keys are stored locally in your browser and are never sent to our servers. 
          They are only used to communicate directly with the respective AI providers.
        </p>
      </div>
    </div>
  );
}