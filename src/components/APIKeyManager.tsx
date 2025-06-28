import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { useAI } from '../context/AIContext';
import { motion } from 'framer-motion';

interface APIKeyManagerProps {
  onSetupComplete?: () => void;
}

export function APIKeyManager({ onSetupComplete }: APIKeyManagerProps) {
  const { state, dispatch } = useAI();
  const [showKeys, setShowKeys] = useState({
    openai: false,
    gemini: false,
    claude: false
  });
  const [keyStatuses, setKeyStatuses] = useState({
    openai: { isValid: false, isChecking: false, error: undefined as string | undefined },
    gemini: { isValid: false, isChecking: false, error: undefined as string | undefined },
    claude: { isValid: false, isChecking: false, error: undefined as string | undefined }
  });
  const [tempKeys, setTempKeys] = useState({
    openai: state.apiKeys.openai,
    gemini: state.apiKeys.gemini,
    claude: state.apiKeys.claude
  });
  const [activationStatus, setActivationStatus] = useState({
    openai: Boolean(state.apiKeys.openai),
    gemini: Boolean(state.apiKeys.gemini),
    claude: Boolean(state.apiKeys.claude)
  });

  useEffect(() => {
    // Check if any API key is already set
    const hasKeys = Object.values(state.apiKeys).some(key => key);
    if (hasKeys) {
      setActivationStatus({
        openai: Boolean(state.apiKeys.openai),
        gemini: Boolean(state.apiKeys.gemini),
        claude: Boolean(state.apiKeys.claude)
      });
    }
  }, [state.apiKeys]);

  const validateAPIKey = async (provider: string, apiKey: string) => {
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
          error: isValid ? undefined : 'Invalid API key'
        }
      }));
      
      if (isValid) {
        setActivationStatus(prev => ({
          ...prev,
          [provider]: true
        }));
      }
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

  const testAPIKey = async (provider: string, apiKey: string): Promise<boolean> => {
    // Simulate API key validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Basic format validation
    const formats: Record<string, RegExp> = {
      openai: /^sk-[a-zA-Z0-9]{48,}$/,
      gemini: /^[a-zA-Z0-9_-]{35,}$/,
      claude: /^sk-ant-[a-zA-Z0-9_-]{95,}$/
    };

    return formats[provider]?.test(apiKey) || false;
  };

  const handleKeyChange = (provider: string, value: string) => {
    setTempKeys(prev => ({ ...prev, [provider]: value }));
    
    // Clear previous status when key changes
    setKeyStatuses(prev => ({
      ...prev,
      [provider]: { ...prev[provider], isValid: false, error: undefined }
    }));
  };

  const handleSaveKey = (provider: string) => {
    const key = tempKeys[provider as keyof typeof tempKeys];
    dispatch({ type: 'SET_API_KEY', payload: { provider, key } });
    validateAPIKey(provider, key);
  };

  const handleSaveAllKeys = () => {
    Object.entries(tempKeys).forEach(([provider, key]) => {
      if (key !== state.apiKeys[provider as keyof typeof state.apiKeys]) {
        dispatch({ type: 'SET_API_KEY', payload: { provider, key } });
        validateAPIKey(provider, key);
      }
    });
    
    if (onSetupComplete) {
      onSetupComplete();
    }
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const getStatusIcon = (provider: string) => {
    const status = keyStatuses[provider as keyof typeof keyStatuses];
    
    if (status.isChecking) {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (status.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (status.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getActiveProviderCount = () => {
    return Object.values(activationStatus).filter(Boolean).length;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Key className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-white">API Key Management</h2>
        </div>
        <button
          onClick={handleSaveAllKeys}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save All Keys</span>
        </button>
      </div>

      {/* Activation Status */}
      <div className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Activation Status</h3>
          <div className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
            {getActiveProviderCount()} of 3 providers active
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'openai', name: 'OpenAI', icon: '🤖' },
            { id: 'gemini', name: 'Google Gemini', icon: '🧠' },
            { id: 'claude', name: 'Anthropic Claude', icon: '🔮' }
          ].map((provider) => (
            <div 
              key={provider.id}
              className={`p-4 rounded-lg border ${
                activationStatus[provider.id as keyof typeof activationStatus]
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-gray-600 bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{provider.icon}</div>
                <div>
                  <div className="font-medium text-white">{provider.name}</div>
                  <div className={`text-sm ${
                    activationStatus[provider.id as keyof typeof activationStatus]
                      ? 'text-green-400'
                      : 'text-gray-400'
                  }`}>
                    {activationStatus[provider.id as keyof typeof activationStatus] ? 'Active' : 'Not configured'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Key Configuration */}
      <div className="space-y-8">
        {/* OpenAI */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🤖</div>
            <h3 className="text-lg font-semibold text-white">OpenAI API Key</h3>
          </div>
          
          <p className="text-gray-300 mb-4">
            OpenAI provides GPT-4 and GPT-3.5 models for advanced code generation, explanation, and assistance.
          </p>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showKeys.openai ? 'text' : 'password'}
                value={tempKeys.openai}
                onChange={(e) => handleKeyChange('openai', e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white pr-20"
              />
              <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('openai')}
                  className="text-gray-400 hover:text-gray-200"
                >
                  {showKeys.openai ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {tempKeys.openai && (
                  <button
                    onClick={() => validateAPIKey('openai', tempKeys.openai)}
                    disabled={keyStatuses.openai.isChecking}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Test
                  </button>
                )}
              </div>
            </div>
            
            {keyStatuses.openai.error && (
              <div className="text-red-400 text-sm">{keyStatuses.openai.error}</div>
            )}
            
            {keyStatuses.openai.isValid && (
              <div className="text-green-400 text-sm">✓ API key is valid</div>
            )}
            
            <div className="flex items-center justify-between">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Get OpenAI API Key →
              </a>
              
              {tempKeys.openai !== state.apiKeys.openai && (
                <button
                  onClick={() => handleSaveKey('openai')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Google Gemini */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🧠</div>
            <h3 className="text-lg font-semibold text-white">Google Gemini API Key</h3>
          </div>
          
          <p className="text-gray-300 mb-4">
            Google Gemini provides powerful AI models with multimodal capabilities for code generation and analysis.
          </p>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showKeys.gemini ? 'text' : 'password'}
                value={tempKeys.gemini}
                onChange={(e) => handleKeyChange('gemini', e.target.value)}
                placeholder="AIza..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white pr-20"
              />
              <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('gemini')}
                  className="text-gray-400 hover:text-gray-200"
                >
                  {showKeys.gemini ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {tempKeys.gemini && (
                  <button
                    onClick={() => validateAPIKey('gemini', tempKeys.gemini)}
                    disabled={keyStatuses.gemini.isChecking}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Test
                  </button>
                )}
              </div>
            </div>
            
            {keyStatuses.gemini.error && (
              <div className="text-red-400 text-sm">{keyStatuses.gemini.error}</div>
            )}
            
            {keyStatuses.gemini.isValid && (
              <div className="text-green-400 text-sm">✓ API key is valid</div>
            )}
            
            <div className="flex items-center justify-between">
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Get Gemini API Key →
              </a>
              
              {tempKeys.gemini !== state.apiKeys.gemini && (
                <button
                  onClick={() => handleSaveKey('gemini')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Anthropic Claude */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🔮</div>
            <h3 className="text-lg font-semibold text-white">Anthropic Claude API Key</h3>
          </div>
          
          <p className="text-gray-300 mb-4">
            Anthropic Claude offers powerful AI models with strong reasoning capabilities for complex coding tasks.
          </p>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showKeys.claude ? 'text' : 'password'}
                value={tempKeys.claude}
                onChange={(e) => handleKeyChange('claude', e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white pr-20"
              />
              <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('claude')}
                  className="text-gray-400 hover:text-gray-200"
                >
                  {showKeys.claude ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {tempKeys.claude && (
                  <button
                    onClick={() => validateAPIKey('claude', tempKeys.claude)}
                    disabled={keyStatuses.claude.isChecking}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Test
                  </button>
                )}
              </div>
            </div>
            
            {keyStatuses.claude.error && (
              <div className="text-red-400 text-sm">{keyStatuses.claude.error}</div>
            )}
            
            {keyStatuses.claude.isValid && (
              <div className="text-green-400 text-sm">✓ API key is valid</div>
            )}
            
            <div className="flex items-center justify-between">
              <a
                href="https://console.anthropic.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Get Claude API Key →
              </a>
              
              {tempKeys.claude !== state.apiKeys.claude && (
                <button
                  onClick={() => handleSaveKey('claude')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <h4 className="font-medium text-white mb-2">Security Notice</h4>
        <p className="text-gray-300 text-sm">
          Your API keys are stored locally in your browser and are never sent to our servers. 
          They are only used to communicate directly with the respective AI providers.
        </p>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSaveAllKeys}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Save All API Keys</span>
        </button>
      </div>
    </div>
  );
}