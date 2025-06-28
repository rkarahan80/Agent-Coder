import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { analyzeProject } from '../services/projectService';

interface ProjectMetrics {
  totalLines: number;
  totalFiles: number;
  languages: Record<string, number>;
  complexity: number;
  testCoverage: number;
  documentation: number;
  healthScore: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
  }>;
  trends: {
    linesAdded: number;
    linesRemoved: number;
    filesChanged: number;
    period: string;
  };
}

export function ProjectAnalytics() {
  const { state } = useAgent();
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    if (state.projectFiles.length > 0) {
      handleAnalyzeProject();
    }
  }, [state.projectFiles]);

  const handleAnalyzeProject = async () => {
    if (!state.apiKey || state.projectFiles.length === 0) return;

    setIsAnalyzing(true);
    try {
      const projectData = state.projectFiles.reduce((acc, file) => {
        acc[file.path] = file.content;
        return acc;
      }, {} as Record<string, string>);

      const analysis = await analyzeProject(projectData, state.apiKey, state.provider);
      setMetrics(analysis);
    } catch (error) {
      console.error('Project analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!state.apiKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Key Required</h3>
          <p className="text-gray-600">Configure your API key in Settings to analyze your project.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Project Analytics</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="input-field text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={handleAnalyzeProject}
            disabled={isAnalyzing}
            className="btn-primary flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Project'}</span>
          </button>
        </div>
      </div>

      {metrics && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Health Score</p>
                  <p className={`text-2xl font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
                    {metrics.healthScore}/100
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getHealthScoreBg(metrics.healthScore)}`}>
                  <CheckCircle className={`h-6 w-6 ${getHealthScoreColor(metrics.healthScore)}`} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Lines</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.totalLines.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Complexity</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.complexity}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Test Coverage</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.testCoverage}%</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Language Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Distribution</h3>
              <div className="space-y-3">
                {Object.entries(metrics.languages)
                  .sort(([,a], [,b]) => b - a)
                  .map(([language, count]) => {
                    const percentage = (count / metrics.totalFiles) * 100;
                    return (
                      <div key={language} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {language}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Issues Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Summary</h3>
              <div className="space-y-3">
                {metrics.issues.map((issue, index) => {
                  const severityColors = {
                    critical: 'text-red-600 bg-red-100',
                    high: 'text-orange-600 bg-orange-100',
                    medium: 'text-yellow-600 bg-yellow-100',
                    low: 'text-blue-600 bg-blue-100'
                  };

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {issue.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[issue.severity]}`}>
                          {issue.severity}
                        </span>
                        <span className="text-sm text-gray-600">{issue.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trends */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Lines Added</p>
                  <p className="text-lg font-semibold text-green-600">
                    +{metrics.trends.linesAdded}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />
                <div>
                  <p className="text-sm text-gray-600">Lines Removed</p>
                  <p className="text-lg font-semibold text-red-600">
                    -{metrics.trends.linesRemoved}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Files Changed</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {metrics.trends.filesChanged}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}