import React, { useState } from 'react';
import { Brain, Plus, Settings, Trash2, TestTube, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

interface CustomModel {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  apiKey: string;
  headers: Record<string, string>;
  requestFormat: 'openai' | 'custom';
  isActive: boolean;
  lastTested?: Date;
  testStatus?: 'success' | 'error' | 'pending';
  testMessage?: string;
}

interface ModelTemplate {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  headers: Record<string, string>;
  requestFormat: 'openai' | 'custom';
  documentation: string;
}

const MODEL_TEMPLATES: ModelTemplate[] = [
  {
    id: 'ollama',
    name: 'Ollama Local',
    description: 'Local Ollama instance for privacy-focused AI',
    endpoint: 'http://localhost:11434/api/generate',
    headers: { 'Content-Type': 'application/json' },
    requestFormat: 'custom',
    documentation: 'https://ollama.ai/docs'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Inference',
    description: 'Hugging Face hosted models',
    endpoint: 'https://api-inference.huggingface.co/models/{model}',
    headers: { 'Authorization': 'Bearer {api_key}' },
    requestFormat: 'custom',
    documentation: 'https://huggingface.co/docs/api-inference'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Cohere language models',
    endpoint: 'https://api.cohere.ai/v1/generate',
    headers: { 'Authorization': 'Bearer {api_key}', 'Content-Type': 'application/json' },
    requestFormat: 'custom',
    documentation: 'https://docs.cohere.ai'
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Together AI hosted models',
    endpoint: 'https://api.together.xyz/inference',
    headers: { 'Authorization': 'Bearer {api_key}' },
    requestFormat: 'openai',
    documentation: 'https://docs.together.ai'
  }
];

export function CustomAIIntegration() {
  const { state, dispatch } = useAgent();
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ModelTemplate | null>(null);
  const [newModel, setNewModel] = useState<Partial<CustomModel>>({
    name: '',
    description: '',
    endpoint: '',
    apiKey: '',
    headers: {},
    requestFormat: 'openai'
  });
  const [testingModel, setTestingModel] = useState<string | null>(null);

  const handleAddModel = () => {
    if (!newModel.name || !newModel.endpoint) return;

    const model: CustomModel = {
      id: `custom-${Date.now()}`,
      name: newModel.name,
      description: newModel.description || '',
      endpoint: newModel.endpoint,
      apiKey: newModel.apiKey || '',
      headers: newModel.headers || {},
      requestFormat: newModel.requestFormat || 'openai',
      isActive: false
    };

    setCustomModels([...customModels, model]);
    setNewModel({
      name: '',
      description: '',
      endpoint: '',
      apiKey: '',
      headers: {},
      requestFormat: 'openai'
    });
    setShowAddForm(false);
    setSelectedTemplate(null);
  };

  const handleTestModel = async (modelId: string) => {
    setTestingModel(modelId);
    
    // Simulate API test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      
      setCustomModels(models => models.map(model =>
        model.id === modelId
          ? {
              ...model,
              lastTested: new Date(),
              testStatus: success ? 'success' : 'error',
              testMessage: success 
                ? 'Connection successful' 
                : 'Failed to connect: Invalid endpoint or API key'
            }
          : model
      ));
      
      setTestingModel(null);
    }, 2000);
  };

  const handleToggleModel = (modelId: string) => {
    setCustomModels(models => models.map(model =>
      model.id === modelId
        ? { ...model, isActive: !model.isActive }
        : model
    ));
  };

  const handleDeleteModel = (modelId: string) => {
    setCustomModels(models => models.filter(model => model.id !== modelId));
  };

  const handleUseTemplate = (template: ModelTemplate) => {
    setSelectedTemplate(template);
    setNewModel({
      name: template.name,
      description: template.description,
      endpoint: template.endpoint,
      headers: template.headers,
      requestFormat: template.requestFormat
    });
    setShowAddForm(true);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (Array.isArray(config)) {
          setCustomModels([...customModels, ...config]);
        } else {
          setCustomModels([...customModels, config]);
        }
      } catch (error) {
        console.error('Failed to import config:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleExportConfig = () => {
    const config = JSON.stringify(customModels, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-ai-models.json';
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
          <Brain className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Custom AI Integration</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="btn-secondary flex items-center space-x-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleExportConfig}
            disabled={customModels.length === 0}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>Export</span>
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Model</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Templates */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Templates</h3>
          
          <div className="space-y-3">
            {MODEL_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Use
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.requestFormat === 'openai'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {template.requestFormat}
                  </span>
                  <a
                    href={template.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Docs
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Models List */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Custom Models ({customModels.length})
          </h3>
          
          {customModels.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No custom models configured</p>
              <p className="text-sm">Add a model or use a template to get started</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {customModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 border rounded-lg ${
                    model.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{model.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          model.requestFormat === 'openai'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {model.requestFormat}
                        </span>
                        {model.isActive && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{model.endpoint}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestModel(model.id)}
                        disabled={testingModel === model.id}
                        className="btn-secondary text-sm flex items-center space-x-1"
                      >
                        <TestTube className="h-3 w-3" />
                        <span>{testingModel === model.id ? 'Testing...' : 'Test'}</span>
                      </button>
                      
                      <button
                        onClick={() => handleToggleModel(model.id)}
                        className={`btn-secondary text-sm ${
                          model.isActive ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {model.isActive ? 'Disable' : 'Enable'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteModel(model.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {model.lastTested && (
                    <div className="flex items-center space-x-2 mt-2">
                      {model.testStatus === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-gray-600">
                        Last tested: {model.lastTested.toLocaleString()}
                      </span>
                      {model.testMessage && (
                        <span className={`text-xs ${
                          model.testStatus === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          - {model.testMessage}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Model Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedTemplate ? `Add ${selectedTemplate.name}` : 'Add Custom Model'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedTemplate(null);
                  setNewModel({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Name
                </label>
                <input
                  type="text"
                  value={newModel.name || ''}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  placeholder="My Custom Model"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newModel.description || ''}
                  onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                  placeholder="Description of the model..."
                  className="input-field resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Endpoint
                </label>
                <input
                  type="url"
                  value={newModel.endpoint || ''}
                  onChange={(e) => setNewModel({ ...newModel, endpoint: e.target.value })}
                  placeholder="https://api.example.com/v1/chat/completions"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key (Optional)
                </label>
                <input
                  type="password"
                  value={newModel.apiKey || ''}
                  onChange={(e) => setNewModel({ ...newModel, apiKey: e.target.value })}
                  placeholder="Your API key"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Format
                </label>
                <select
                  value={newModel.requestFormat || 'openai'}
                  onChange={(e) => setNewModel({ ...newModel, requestFormat: e.target.value as 'openai' | 'custom' })}
                  className="input-field"
                >
                  <option value="openai">OpenAI Compatible</option>
                  <option value="custom">Custom Format</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedTemplate(null);
                    setNewModel({});
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddModel}
                  disabled={!newModel.name || !newModel.endpoint}
                  className="btn-primary"
                >
                  Add Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}