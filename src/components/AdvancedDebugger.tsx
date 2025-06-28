import React, { useState, useEffect } from 'react';
import { Bug, Play, Pause, StepForward, RotateCcw, Target, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

interface Breakpoint {
  id: string;
  line: number;
  condition?: string;
  enabled: boolean;
  hitCount: number;
}

interface DebugSession {
  id: string;
  isActive: boolean;
  isPaused: boolean;
  currentLine: number | null;
  callStack: Array<{
    function: string;
    file: string;
    line: number;
  }>;
  variables: Record<string, any>;
  watchExpressions: Array<{
    id: string;
    expression: string;
    value: any;
    error?: string;
  }>;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

export function AdvancedDebugger() {
  const { state } = useAgent();
  const [debugSession, setDebugSession] = useState<DebugSession | null>(null);
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [newWatchExpression, setNewWatchExpression] = useState('');
  const [selectedTab, setSelectedTab] = useState<'variables' | 'watch' | 'callstack' | 'console'>('variables');

  const activeFile = state.projectFiles.find(f => f.id === state.activeFile);

  // Simulate debug session
  useEffect(() => {
    if (debugSession?.isActive) {
      const interval = setInterval(() => {
        // Simulate log entries
        const logLevels: Array<'info' | 'warn' | 'error' | 'debug'> = ['info', 'warn', 'error', 'debug'];
        const messages = [
          'Function executed successfully',
          'Variable updated: count = 42',
          'Warning: Deprecated method used',
          'Error: Cannot read property of undefined',
          'Debug: Entering loop iteration',
          'Info: API request completed'
        ];

        const newLog: LogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date(),
          level: logLevels[Math.floor(Math.random() * logLevels.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          source: activeFile?.name || 'main.js'
        };

        setLogs(prev => [newLog, ...prev].slice(0, 100));

        // Update variables
        if (debugSession && !debugSession.isPaused) {
          setDebugSession(prev => prev ? {
            ...prev,
            variables: {
              ...prev.variables,
              counter: Math.floor(Math.random() * 100),
              timestamp: Date.now(),
              isRunning: true
            }
          } : null);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [debugSession?.isActive, activeFile?.name]);

  const handleStartDebugging = () => {
    const newSession: DebugSession = {
      id: `debug-${Date.now()}`,
      isActive: true,
      isPaused: false,
      currentLine: null,
      callStack: [
        { function: 'main()', file: activeFile?.name || 'main.js', line: 1 },
        { function: 'init()', file: activeFile?.name || 'main.js', line: 15 },
        { function: 'execute()', file: activeFile?.name || 'main.js', line: 23 }
      ],
      variables: {
        x: 42,
        y: 'hello world',
        isDebug: true,
        config: { timeout: 5000, retries: 3 },
        users: ['alice', 'bob', 'charlie']
      },
      watchExpressions: []
    };

    setDebugSession(newSession);
    
    // Add initial log
    setLogs([{
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      level: 'info',
      message: 'Debug session started',
      source: 'debugger'
    }]);
  };

  const handleStopDebugging = () => {
    setDebugSession(null);
    setLogs(prev => [{
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      level: 'info',
      message: 'Debug session ended',
      source: 'debugger'
    }, ...prev]);
  };

  const handlePauseResume = () => {
    if (!debugSession) return;
    
    setDebugSession({
      ...debugSession,
      isPaused: !debugSession.isPaused,
      currentLine: debugSession.isPaused ? null : Math.floor(Math.random() * 50) + 1
    });
  };

  const handleStepOver = () => {
    if (!debugSession) return;
    
    setDebugSession({
      ...debugSession,
      currentLine: (debugSession.currentLine || 0) + 1,
      isPaused: true
    });
  };

  const handleAddBreakpoint = (line: number) => {
    const newBreakpoint: Breakpoint = {
      id: `bp-${Date.now()}`,
      line,
      enabled: true,
      hitCount: 0
    };
    
    setBreakpoints([...breakpoints, newBreakpoint]);
  };

  const handleToggleBreakpoint = (id: string) => {
    setBreakpoints(breakpoints.map(bp =>
      bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
    ));
  };

  const handleRemoveBreakpoint = (id: string) => {
    setBreakpoints(breakpoints.filter(bp => bp.id !== id));
  };

  const handleAddWatchExpression = () => {
    if (!newWatchExpression.trim() || !debugSession) return;

    const newWatch = {
      id: `watch-${Date.now()}`,
      expression: newWatchExpression,
      value: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : 'undefined',
      error: Math.random() > 0.8 ? 'ReferenceError: variable not defined' : undefined
    };

    setDebugSession({
      ...debugSession,
      watchExpressions: [...debugSession.watchExpressions, newWatch]
    });

    setNewWatchExpression('');
  };

  const handleRemoveWatchExpression = (id: string) => {
    if (!debugSession) return;
    
    setDebugSession({
      ...debugSession,
      watchExpressions: debugSession.watchExpressions.filter(w => w.id !== id)
    });
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'debug':
        return <Bug className="h-4 w-4 text-gray-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderVariableValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Debug Controls */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Bug className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Debug Controls</h3>
          <div className={`w-2 h-2 rounded-full ${
            debugSession?.isActive ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
        </div>

        <div className="space-y-4">
          {!debugSession?.isActive ? (
            <button
              onClick={handleStartDebugging}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Start Debugging</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={handlePauseResume}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  {debugSession.isPaused ? (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleStepOver}
                  disabled={!debugSession.isPaused}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <StepForward className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={handleStopDebugging}
                className="btn-secondary w-full flex items-center justify-center space-x-2 text-red-600"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {debugSession?.currentLine && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Paused at line {debugSession.currentLine}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Breakpoints */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Breakpoints</h4>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {breakpoints.map((breakpoint) => (
              <div
                key={breakpoint.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleBreakpoint(breakpoint.id)}
                    className={`w-3 h-3 rounded-full border-2 ${
                      breakpoint.enabled
                        ? 'bg-red-500 border-red-500'
                        : 'bg-gray-300 border-gray-400'
                    }`}
                  ></button>
                  <span className="text-sm">Line {breakpoint.line}</span>
                  {breakpoint.hitCount > 0 && (
                    <span className="text-xs text-gray-500">({breakpoint.hitCount} hits)</span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveBreakpoint(breakpoint.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
            
            {breakpoints.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No breakpoints set
              </div>
            )}
          </div>

          <div className="mt-3">
            <button
              onClick={() => handleAddBreakpoint(Math.floor(Math.random() * 50) + 1)}
              className="btn-secondary w-full text-sm"
            >
              Add Breakpoint
            </button>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      <div className="lg:col-span-2 card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Debug Information</h3>
          
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'variables', label: 'Variables' },
              { id: 'watch', label: 'Watch' },
              { id: 'callstack', label: 'Call Stack' },
              { id: 'console', label: 'Console' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-96 overflow-y-auto">
          {selectedTab === 'variables' && (
            <div className="space-y-2">
              {debugSession?.variables ? (
                Object.entries(debugSession.variables).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-gray-900">{key}</span>
                      <span className="text-xs text-gray-500">{typeof value}</span>
                    </div>
                    <pre className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {renderVariableValue(value)}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Start debugging to view variables
                </div>
              )}
            </div>
          )}

          {selectedTab === 'watch' && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newWatchExpression}
                  onChange={(e) => setNewWatchExpression(e.target.value)}
                  placeholder="Enter expression to watch"
                  className="input-field flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddWatchExpression()}
                />
                <button
                  onClick={handleAddWatchExpression}
                  disabled={!newWatchExpression.trim()}
                  className="btn-primary"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {debugSession?.watchExpressions.map((watch) => (
                  <div key={watch.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{watch.expression}</span>
                      <button
                        onClick={() => handleRemoveWatchExpression(watch.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                    {watch.error ? (
                      <span className="text-sm text-red-600">{watch.error}</span>
                    ) : (
                      <span className="text-sm text-gray-700">{String(watch.value)}</span>
                    )}
                  </div>
                )) || []}
                
                {(!debugSession?.watchExpressions || debugSession.watchExpressions.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No watch expressions
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'callstack' && (
            <div className="space-y-2">
              {debugSession?.callStack.map((frame, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{frame.function}</div>
                  <div className="text-sm text-gray-600">
                    {frame.file}:{frame.line}
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No call stack available
                </div>
              )}
            </div>
          )}

          {selectedTab === 'console' && (
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {getLogIcon(log.level)}
                    <Clock className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      {log.source && (
                        <span className="text-xs text-gray-400">{log.source}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-900 break-words">{log.message}</div>
                  </div>
                </div>
              ))}
              
              {logs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No console output
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}