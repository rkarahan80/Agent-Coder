import React, { useState, useEffect } from 'react';
import { useEditor } from '../context/EditorContext';
import { Activity, Clock, Cpu, MemoryStick, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

interface ProfileSession {
  id: string;
  name: string;
  startTime: Date;
  duration: number;
  status: 'running' | 'completed' | 'failed';
  metrics: PerformanceMetric[];
  hotspots: Array<{
    function: string;
    file: string;
    line: number;
    executionTime: number;
    callCount: number;
    percentage: number;
  }>;
  memoryUsage: Array<{
    timestamp: number;
    heap: number;
    used: number;
  }>;
}

export function PerformanceProfiler() {
  const { state: editorState } = useEditor();
  const [sessions, setSessions] = useState<ProfileSession[]>([]);
  const [activeSession, setActiveSession] = useState<ProfileSession | null>(null);
  const [isProfilering, setIsProfilering] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'hotspots' | 'memory' | 'timeline'>('overview');

  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId);

  useEffect(() => {
    // Load sample profiling data
    const sampleSession: ProfileSession = {
      id: '1',
      name: 'Main Application Profile',
      startTime: new Date(Date.now() - 300000),
      duration: 5000,
      status: 'completed',
      metrics: [
        {
          id: 'execution-time',
          name: 'Total Execution Time',
          value: 1250,
          unit: 'ms',
          trend: 'down',
          threshold: 2000,
          status: 'good'
        },
        {
          id: 'memory-peak',
          name: 'Peak Memory Usage',
          value: 45.2,
          unit: 'MB',
          trend: 'up',
          threshold: 50,
          status: 'warning'
        },
        {
          id: 'cpu-usage',
          name: 'CPU Usage',
          value: 78,
          unit: '%',
          trend: 'stable',
          threshold: 80,
          status: 'warning'
        },
        {
          id: 'function-calls',
          name: 'Function Calls',
          value: 15420,
          unit: 'calls',
          trend: 'up',
          threshold: 20000,
          status: 'good'
        }
      ],
      hotspots: [
        {
          function: 'processData',
          file: 'data-processor.js',
          line: 45,
          executionTime: 450,
          callCount: 1250,
          percentage: 36.2
        },
        {
          function: 'renderComponent',
          file: 'component.jsx',
          line: 23,
          executionTime: 320,
          callCount: 890,
          percentage: 25.6
        },
        {
          function: 'validateInput',
          file: 'validator.js',
          line: 12,
          executionTime: 180,
          callCount: 2340,
          percentage: 14.4
        }
      ],
      memoryUsage: Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() - (50 - i) * 1000,
        heap: 40 + Math.sin(i * 0.1) * 10 + Math.random() * 5,
        used: 30 + Math.sin(i * 0.1) * 8 + Math.random() * 3
      }))
    };

    setSessions([sampleSession]);
    setActiveSession(sampleSession);
  }, []);

  const startProfiling = async () => {
    if (!activeFile) return;

    setIsProfilering(true);

    // Simulate profiling process
    const newSession: ProfileSession = {
      id: Date.now().toString(),
      name: `Profile: ${activeFile.name}`,
      startTime: new Date(),
      duration: 0,
      status: 'running',
      metrics: [],
      hotspots: [],
      memoryUsage: []
    };

    setSessions([newSession, ...sessions]);
    setActiveSession(newSession);

    // Simulate profiling completion
    setTimeout(() => {
      const completedSession: ProfileSession = {
        ...newSession,
        status: 'completed',
        duration: 3000,
        metrics: [
          {
            id: 'execution-time',
            name: 'Total Execution Time',
            value: Math.random() * 2000 + 500,
            unit: 'ms',
            trend: Math.random() > 0.5 ? 'up' : 'down',
            threshold: 2000,
            status: Math.random() > 0.7 ? 'warning' : 'good'
          },
          {
            id: 'memory-peak',
            name: 'Peak Memory Usage',
            value: Math.random() * 30 + 20,
            unit: 'MB',
            trend: 'up',
            threshold: 50,
            status: 'good'
          }
        ],
        hotspots: [
          {
            function: 'mainFunction',
            file: activeFile.name,
            line: Math.floor(Math.random() * 50) + 1,
            executionTime: Math.random() * 500 + 100,
            callCount: Math.floor(Math.random() * 1000) + 100,
            percentage: Math.random() * 40 + 20
          }
        ]
      };

      setSessions(sessions.map(s => s.id === newSession.id ? completedSession : s));
      setActiveSession(completedSession);
      setIsProfilering(false);
    }, 3000);
  };

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'execution-time': return Clock;
      case 'memory-peak': return MemoryStick;
      case 'cpu-usage': return Cpu;
      case 'function-calls': return Activity;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500 bg-green-100';
      case 'warning': return 'text-yellow-500 bg-yellow-100';
      case 'critical': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Performance Profiler</h2>
          </div>
          
          <button
            onClick={startProfiling}
            disabled={isProfilering || !activeFile}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            {isProfilering ? 'Profiling...' : 'Start Profiling'}
          </button>
        </div>

        {/* Session Tabs */}
        <div className="flex space-x-2">
          {sessions.slice(0, 5).map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeSession?.id === session.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {session.name}
              {session.status === 'running' && (
                <span className="ml-1 inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeSession ? (
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'hotspots', label: 'Hotspots', icon: Zap },
              { id: 'memory', label: 'Memory', icon: MemoryStick },
              { id: 'timeline', label: 'Timeline', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Session Info */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-3">Session Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        activeSession.status === 'completed' ? 'bg-green-600 text-white' :
                        activeSession.status === 'running' ? 'bg-blue-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {activeSession.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <span className="ml-2 text-white">{activeSession.duration}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Started:</span>
                      <span className="ml-2 text-white">{activeSession.startTime.toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Hotspots:</span>
                      <span className="ml-2 text-white">{activeSession.hotspots.length}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {activeSession.metrics.map((metric) => {
                    const MetricIcon = getMetricIcon(metric.id);
                    return (
                      <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 p-4 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <MetricIcon className="h-5 w-5 text-blue-400" />
                          <span className="text-lg">{getTrendIcon(metric.trend)}</span>
                        </div>
                        
                        <div className="mb-2">
                          <div className="text-2xl font-bold text-white">
                            {metric.value.toLocaleString()}
                            <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>
                          </div>
                          <div className="text-sm text-gray-400">{metric.name}</div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(metric.status)}`}>
                            {metric.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Threshold: {metric.threshold}{metric.unit}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTab === 'hotspots' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Performance Hotspots</h3>
                
                {activeSession.hotspots.length > 0 ? (
                  <div className="space-y-3">
                    {activeSession.hotspots.map((hotspot, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800 p-4 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium text-white">{hotspot.function}</span>
                            <span className="text-sm text-gray-400">
                              {hotspot.file}:{hotspot.line}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-yellow-500">
                            {hotspot.percentage.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Execution Time:</span>
                            <span className="ml-2 text-white">{hotspot.executionTime}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Call Count:</span>
                            <span className="ml-2 text-white">{hotspot.callCount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Avg per Call:</span>
                            <span className="ml-2 text-white">
                              {(hotspot.executionTime / hotspot.callCount).toFixed(2)}ms
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${hotspot.percentage}%` }}
                          ></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No performance hotspots detected</p>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'memory' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Memory Usage</h3>
                
                {activeSession.memoryUsage.length > 0 ? (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="h-64 relative">
                      <svg className="w-full h-full">
                        <defs>
                          <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
                          </linearGradient>
                        </defs>
                        
                        {/* Memory usage chart */}
                        <polyline
                          fill="url(#memoryGradient)"
                          stroke="#3B82F6"
                          strokeWidth="2"
                          points={activeSession.memoryUsage.map((point, index) => 
                            `${(index / (activeSession.memoryUsage.length - 1)) * 100}%,${100 - (point.used / 60) * 100}%`
                          ).join(' ')}
                        />
                        
                        {/* Heap size chart */}
                        <polyline
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          points={activeSession.memoryUsage.map((point, index) => 
                            `${(index / (activeSession.memoryUsage.length - 1)) * 100}%,${100 - (point.heap / 60) * 100}%`
                          ).join(' ')}
                        />
                      </svg>
                      
                      <div className="absolute top-2 right-2 space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span className="text-gray-300">Used Memory</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-1 bg-green-500 rounded"></div>
                          <span className="text-gray-300">Heap Size</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-gray-400">Peak Usage:</span>
                        <span className="ml-2 text-white">
                          {Math.max(...activeSession.memoryUsage.map(m => m.used)).toFixed(1)} MB
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Average:</span>
                        <span className="ml-2 text-white">
                          {(activeSession.memoryUsage.reduce((sum, m) => sum + m.used, 0) / activeSession.memoryUsage.length).toFixed(1)} MB
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Current:</span>
                        <span className="ml-2 text-white">
                          {activeSession.memoryUsage[activeSession.memoryUsage.length - 1]?.used.toFixed(1)} MB
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MemoryStick className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No memory usage data available</p>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'timeline' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Execution Timeline</h3>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="space-y-3">
                    {activeSession.hotspots.map((hotspot, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-24 text-sm text-gray-400">
                          {(index * 100).toFixed(0)}ms
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
                          <div
                            className="bg-blue-500 h-6 rounded-full flex items-center px-2"
                            style={{ width: `${hotspot.percentage}%` }}
                          >
                            <span className="text-xs text-white font-medium truncate">
                              {hotspot.function}
                            </span>
                          </div>
                        </div>
                        <div className="w-16 text-sm text-gray-400 text-right">
                          {hotspot.executionTime}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No profiling session selected</p>
            <p className="text-sm mt-1">Start a new profiling session to analyze performance</p>
          </div>
        </div>
      )}
    </div>
  );
}