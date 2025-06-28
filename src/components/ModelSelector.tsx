import React from 'react';
import { Brain } from 'lucide-react';
import { AI_MODELS } from '../config/models';
import { AIProvider } from '../types/ai';

interface ModelSelectorProps {
  provider: AIProvider;
  model: string;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ provider, model, onProviderChange, onModelChange }: ModelSelectorProps) {
  const providers: { value: AIProvider; label: string }[] = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'claude', label: 'Anthropic Claude' },
  ];

  const availableModels = AI_MODELS.filter(m => m.provider === provider);

  const handleProviderChange = (newProvider: AIProvider) => {
    onProviderChange(newProvider);
    // Set default model for the new provider
    const defaultModel = availableModels[0]?.id || AI_MODELS.find(m => m.provider === newProvider)?.id;
    if (defaultModel) {
      onModelChange(defaultModel);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Provider
        </label>
        <select
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
          className="input-field"
        >
          {providers.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="input-field"
        >
          {availableModels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {availableModels.find(m => m.id === model) && (
          <p className="text-sm text-gray-500 mt-1">
            {availableModels.find(m => m.id === model)?.description}
          </p>
        )}
      </div>
    </div>
  );
}