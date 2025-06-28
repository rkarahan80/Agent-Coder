import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Zap, Key, Wifi, WifiOff } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { AIProvider } from '../types/ai';

interface ProviderStatus {
  provider: AIProvider;
  isActive: boolean;
  isConnected: boolean;
  lastUsed?: Date;
  requestCount: number;
  errorCount: number;
}

export function ActivationStatus() {
  const { state } = useAgent();
  const [providerStatuses, setProviderStatuses] = useState<Record<AIProvider, ProviderStatus>>({
    openai: { provider: 'openai', isActive: false, isConnected: false, requestCount: 0, errorCount: 0 },
    gemini: { provider: 'gemini', isActive: false, isConnected: false, requestCount: 0, errorCount: 0 },
    claude: { provider: 'claude', isActive: false, isConnected: false, requestCount: 0, errorCount: 0 },
    deepseek: { provider: 'deepseek', isActive: false, isConnected: false, requestCount: 0, errorCount: 0 }
  });

  useEffect(() => {
    // Update provider statuses based on API keys
    const newStatuses = { ...providerStatuses };
    
    Object.keys(state.apiKeys).forEach(provider => {
      const key = state.apiKeys[provider as AIProvider];
      newStatuses[provider as AIProvider] = {
        ...newStatuses[provider as AIProvider],
        isActive: Boolean(key && key.length > 0),
        isConnected: Boolean(key && key.length > 0)
      };
    });

    setProviderStatuses(newStatuses);
  }, [state.apiKeys]);

  const getProviderIcon = (provider: AIProvider) => {
    const icons = {
      openai: '🤖',
      gemini: '💎',
      claude: '🧠',
      deepseek: '🔍'
    };
    return icons[provider];
  };

  const getProviderName = (provider: AIProvider) => {
    const names = {
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      claude: 'Anthropic Claude',
      deepseek: 'DeepSeek'
    };
    return names[provider];
  };

  const getStatusColor = (status: ProviderStatus) => {
    if (status.isActive && status.isConnected) return 'text-green-600';
    if (status.isActive) return 'text-yellow-600';
    return 'text-gray-400';
  };

  const getStatusBg = (status: ProviderStatus) => {
    if (status.isActive && status.isConnected) return 'bg-green-100';
    if (status.isActive) return 'bg-yellow-100';
    return 'bg-gray-100';
  };

  const getStatusText = (status: ProviderStatus) => {
    if (status.isActive && status.isConnected) return 'Active';
    if (status.isActive) return 'Configured';
    return 'Inactive';
  };

  const activeProviders = Object.values(providerStatuses).filter(s => s.isActive).length;
  const connectedProviders = Object.values(providerStatuses).filter(s => s.isConnected).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Zap className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Activation Status</h3>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">{connectedProviders} Connected</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">{activeProviders} Configured</span>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Agent Coder Status</h4>
            <p className="text-sm text-gray-600">
              {connectedProviders > 0 
                ? `Ready to code with ${connectedProviders} AI provider${connectedProviders > 1 ? 's' : ''}`
                : 'Configure API keys to get started'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {connectedProviders > 0 ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            )}
          </div>
        </div>
      </div>

      {/* Provider Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(providerStatuses).map((status) => (
          <div
            key={status.provider}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              status.isActive ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getProviderIcon(status.provider)}</span>
                <div>
                  <h5 className="font-medium text-gray-900">
                    {getProviderName(status.provider)}
                  </h5>
                  <p className={`text-sm ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {status.isConnected ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" />
                )}
                
                {status.isActive ? (
                  <div className={`p-1 rounded-full ${getStatusBg(status)}`}>
                    <CheckCircle className={`h-4 w-4 ${getStatusColor(status)}`} />
                  </div>
                ) : (
                  <div className="p-1 rounded-full bg-gray-100">
                    <Key className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">API Key:</span>
                <span className={status.isActive ? 'text-green-600' : 'text-red-600'}>
                  {status.isActive ? 'Configured' : 'Missing'}
                </span>
              </div>
              
              {status.requestCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requests:</span>
                  <span className="text-gray-900">{status.requestCount}</span>
                </div>
              )}
              
              {status.errorCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Errors:</span>
                  <span className="text-red-600">{status.errorCount}</span>
                </div>
              )}
              
              {status.lastUsed && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Used:</span>
                  <span className="text-gray-900">
                    {status.lastUsed.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {/* Current Provider Indicator */}
            {state.provider === status.provider && status.isActive && (
              <div className="mt-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full text-center">
                Currently Active
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {connectedProviders === 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Get Started</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Configure at least one API key to start using Agent Coder's AI features.
              </p>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-yellow-700">Quick setup:</p>
                <ul className="text-sm text-yellow-700 space-y-1 ml-4">
                  <li>• Get an OpenAI API key for GPT models</li>
                  <li>• Or try Google Gemini for free tier access</li>
                  <li>• Configure in Settings → API Configuration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}