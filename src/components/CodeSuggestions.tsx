import React, { useState, useEffect } from 'react';
import { Lightbulb, Zap, Shield, Gauge, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { getCodeSuggestions } from '../services/suggestionService';

interface CodeSuggestion {
  id: string;
  type: 'performance' | 'security' | 'style' | 'refactor' | 'bug';
  title: string;
  description: string;
  originalCode: string;
  suggestedCode: string;
  line: number;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  applied: boolean;
}

export function CodeSuggestions() {
  const { state, dispatch } = useAgent();
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CodeSuggestion | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const activeFile = state.projectFiles.find(f => f.id === state.activeFile);

  useEffect(() => {
    if (activeFile && state.apiKey) {
      handleGetSuggestions();
    }
  }, [activeFile?.content, state.apiKey]);

  const handleGetSuggestions = async () => {
    if (!activeFile || !state.apiKey) return;

    setIsLoading(true);
    try {
      const newSuggestions = await getCodeSuggestions(
        activeFile.content,
        activeFile.language,
        state.apiKey,
        state.provider
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: CodeSuggestion) => {
    if (!activeFile) return;

    const lines = activeFile.content.split('\n');
    lines[suggestion.line - 1] = suggestion.suggestedCode;
    const newContent = lines.join('\n');

    dispatch({
      type: 'UPDATE_PROJECT_FILE',
      payload: { id: activeFile.id, content: newContent }
    });

    setSuggestions(suggestions.map(s =>
      s.id === suggestion.id ? { ...s, applied: true } : s
    ));
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions(suggestions.filter(s => s.id !== suggestionId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <Gauge className="h-4 w-4 text-blue-600" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'style':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case 'refactor':
        return <RefreshCw className="h-4 w-4 text-purple-600" />;
      case 'bug':
        return <XCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'style':
        return 'bg-yellow-100 text-yellow-800';
      case 'refactor':
        return 'bg-purple-100 text-purple-800';
      case 'bug':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filterType === 'all') return true;
    return suggestion.type === filterType;
  });

  const suggestionTypes = [
    { value: 'all', label: 'All Suggestions' },
    { value: 'performance', label: 'Performance' },
    { value: 'security', label: 'Security' },
    { value: 'style', label: 'Style' },
    { value: 'refactor', label: 'Refactor' },
    { value: 'bug', label: 'Bug Fixes' }
  ];

  if (!state.apiKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Lightbulb className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Key Required</h3>
          <p className="text-gray-600">Configure your API key in Settings to get code suggestions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Suggestions List */}
      <div className="lg:col-span-2 card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Lightbulb className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Code Suggestions</h3>
            {!isLoading && (
              <span className="text-sm text-gray-500">
                ({filteredSuggestions.length} suggestions)
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field text-sm"
            >
              {suggestionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleGetSuggestions}
              disabled={isLoading || !activeFile}
              className="btn-primary flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>{isLoading ? 'Analyzing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Analyzing code...</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 ${
                  selectedSuggestion?.id === suggestion.id
                    ? 'border-primary-300 bg-primary-50'
                    : suggestion.applied
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedSuggestion(suggestion)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(suggestion.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(suggestion.type)}`}>
                      {suggestion.type}
                    </span>
                    <span className="text-xs text-gray-500">Line {suggestion.line}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                      {suggestion.impact} impact
                    </span>
                    <span className="text-xs text-gray-500">
                      {suggestion.confidence}% confidence
                    </span>
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                <p className="text-sm text-gray-600">{suggestion.description}</p>
                
                {suggestion.applied && (
                  <div className="flex items-center space-x-1 mt-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Applied</span>
                  </div>
                )}
              </div>
            ))}
            
            {filteredSuggestions.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No suggestions found for the current file.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggestion Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestion Details</h3>
        
        {selectedSuggestion ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {getTypeIcon(selectedSuggestion.type)}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedSuggestion.type)}`}>
                {selectedSuggestion.type}
              </span>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{selectedSuggestion.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{selectedSuggestion.description}</p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Current Code:</h5>
              <div className="bg-gray-900 rounded p-3">
                <code className="text-green-400 text-sm font-mono">
                  {selectedSuggestion.originalCode}
                </code>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Suggested Code:</h5>
              <div className="bg-gray-900 rounded p-3">
                <code className="text-blue-400 text-sm font-mono">
                  {selectedSuggestion.suggestedCode}
                </code>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${getImpactColor(selectedSuggestion.impact)}`}>
                {selectedSuggestion.impact.toUpperCase()} IMPACT
              </span>
              <span className="text-gray-500">
                {selectedSuggestion.confidence}% confidence
              </span>
            </div>
            
            {!selectedSuggestion.applied && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApplySuggestion(selectedSuggestion)}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Apply</span>
                </button>
                <button
                  onClick={() => handleDismissSuggestion(selectedSuggestion.id)}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Dismiss</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Select a suggestion to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}