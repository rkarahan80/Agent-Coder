import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { analyzeCode } from '../services/aiService';
import { useAgent } from '../context/AgentContext';
import { getLanguageFromExtension } from '../services/utils';

interface CodeAnalyzerProps {
  code: string;
  filename?: string;
}

export function CodeAnalyzer({ code, filename }: CodeAnalyzerProps) {
  const { state } = useAgent();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const language = filename ? getLanguageFromExtension(filename) : 'javascript';

  const handleAnalyze = async () => {
    if (!state.apiKey || !code.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeCode(code, language, state.apiKey, state.provider);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Code Analysis</h3>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !state.apiKey}
          className="btn-primary flex items-center space-x-2"
        >
          <Search className="h-4 w-4" />
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Code'}</span>
        </button>
      </div>

      {!state.apiKey && (
        <div className="text-center py-8 text-gray-500">
          <p>Configure your API key in Settings to analyze code</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Quality Score</h4>
              <p className="text-sm text-gray-600">Overall code quality assessment</p>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}/100
            </div>
          </div>

          {analysis.issues && analysis.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Issues Found</h4>
              <div className="space-y-2">
                {analysis.issues.map((issue: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{issue.type}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {issue.severity}
                        </span>
                        {issue.line && (
                          <span className="text-xs text-gray-500">Line {issue.line}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{issue.message}</p>
                      {issue.suggestion && (
                        <p className="text-sm text-green-600 mt-1">💡 {issue.suggestion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Suggestions</h4>
              <ul className="space-y-1">
                {analysis.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}