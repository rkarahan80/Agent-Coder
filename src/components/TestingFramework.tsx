import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useAI } from '../context/AIContext';
import { Play, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, FileText, Code } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestCase {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'skipped' | 'running' | 'pending';
  duration?: number;
  error?: string;
  code: string;
}

interface TestSuite {
  id: string;
  name: string;
  file: string;
  testCases: TestCase[];
  status: 'passed' | 'failed' | 'running' | 'pending';
  coverage: number;
}

export function TestingFramework() {
  const { state: editorState } = useEditor();
  const { state: aiState } = useAI();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showGeneratedCode, setShowGeneratedCode] = useState(false);

  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId);

  const generateTests = async () => {
    if (!activeFile || !aiState.apiKeys.openai) return;

    setIsGenerating(true);
    setTestSuites([]);
    setSelectedSuite(null);
    setSelectedTest(null);

    try {
      // Simulate AI test generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newTestSuite: TestSuite = {
        id: Date.now().toString(),
        name: `${activeFile.name.split('.')[0]}Test`,
        file: `${activeFile.name.split('.')[0]}.test.${activeFile.name.split('.').pop()}`,
        testCases: [
          {
            id: '1',
            name: 'should initialize correctly',
            description: 'Tests that the component initializes with the correct default state',
            status: 'pending',
            code: `test('should initialize correctly', () => {
  const component = new Component();
  expect(component.state).toBeDefined();
  expect(component.isInitialized).toBe(true);
});`
          },
          {
            id: '2',
            name: 'should handle input validation',
            description: 'Tests input validation for edge cases',
            status: 'pending',
            code: `test('should handle input validation', () => {
  const component = new Component();
  expect(component.validate('')).toBe(false);
  expect(component.validate(null)).toBe(false);
  expect(component.validate('valid')).toBe(true);
});`
          },
          {
            id: '3',
            name: 'should process data correctly',
            description: 'Tests the data processing functionality',
            status: 'pending',
            code: `test('should process data correctly', () => {
  const component = new Component();
  const input = { name: 'test', value: 42 };
  const result = component.processData(input);
  expect(result).toEqual({ name: 'TEST', value: 84 });
});`
          }
        ],
        status: 'pending',
        coverage: 0
      };

      setTestSuites([newTestSuite]);
      setSelectedSuite(newTestSuite);
    } catch (error) {
      console.error('Test generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const runTests = async () => {
    if (!testSuites.length) return;

    setIsRunning(true);

    // Update all test suites to running
    setTestSuites(suites =>
      suites.map(suite => ({
        ...suite,
        status: 'running',
        testCases: suite.testCases.map(test => ({
          ...test,
          status: 'running'
        }))
      }))
    );

    // Simulate test execution with random results
    await new Promise(resolve => setTimeout(resolve, 2000));

    setTestSuites(suites =>
      suites.map(suite => {
        const updatedTests = suite.testCases.map(test => {
          const random = Math.random();
          return {
            ...test,
            status: random > 0.2 ? 'passed' : 'failed',
            duration: Math.random() * 100 + 10,
            error: random <= 0.2 ? 'Expected true to be false' : undefined
          };
        });

        const passedCount = updatedTests.filter(t => t.status === 'passed').length;
        const coverage = Math.floor(Math.random() * 30) + 70; // 70-100% coverage

        return {
          ...suite,
          testCases: updatedTests,
          status: passedCount === updatedTests.length ? 'passed' : 'failed',
          coverage
        };
      })
    );

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-500 bg-green-100';
      case 'failed': return 'text-red-500 bg-red-100';
      case 'skipped': return 'text-yellow-500 bg-yellow-100';
      case 'running': return 'text-blue-500 bg-blue-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return 'text-green-500';
    if (coverage >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold text-white">Testing Framework</h2>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={generateTests}
              disabled={isGenerating || !activeFile || !aiState.apiKeys.openai}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Code className="h-4 w-4" />
                  <span>Generate Tests</span>
                </>
              )}
            </button>
            
            <button
              onClick={runTests}
              disabled={isRunning || !testSuites.length}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Run Tests</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Test Suites */}
        <div className="w-1/3 p-4 border-r border-gray-700 overflow-y-auto">
          <h3 className="font-medium text-white mb-3">Test Suites</h3>
          
          {testSuites.length > 0 ? (
            <div className="space-y-3">
              {testSuites.map((suite) => (
                <motion.div
                  key={suite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSuite?.id === suite.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                  }`}
                  onClick={() => {
                    setSelectedSuite(suite);
                    setSelectedTest(null);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <h4 className="font-medium text-white">{suite.name}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(suite.status)}
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(suite.status)}`}>
                        {suite.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{suite.file}</span>
                    <span className="text-gray-400">{suite.testCases.length} tests</span>
                  </div>
                  
                  {suite.status !== 'pending' && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">
                          {suite.testCases.filter(t => t.status === 'passed').length} passed
                        </span>
                        <span className="text-red-500">
                          {suite.testCases.filter(t => t.status === 'failed').length} failed
                        </span>
                      </div>
                      <div className={`font-medium ${getCoverageColor(suite.coverage)}`}>
                        {suite.coverage}% coverage
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No test suites available</p>
              <p className="text-sm mt-1">Generate tests for your code</p>
            </div>
          )}
        </div>

        {/* Test Cases */}
        <div className="w-2/3 flex flex-col">
          {selectedSuite ? (
            <>
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{selectedSuite.name} Tests</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowGeneratedCode(!showGeneratedCode)}
                      className={`px-3 py-1 rounded text-sm ${
                        showGeneratedCode
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {showGeneratedCode ? 'Hide Code' : 'Show Code'}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-gray-400">
                      {selectedSuite.testCases.filter(t => t.status === 'passed').length} passed
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span className="text-gray-400">
                      {selectedSuite.testCases.filter(t => t.status === 'failed').length} failed
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <span className="text-gray-400">
                      {selectedSuite.testCases.filter(t => t.status === 'skipped').length} skipped
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {selectedSuite.testCases.map((test) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTest?.id === test.id
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                      }`}
                      onClick={() => setSelectedTest(test)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(test.status)}
                          <h4 className="font-medium text-white">{test.name}</h4>
                        </div>
                        {test.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">{test.duration.toFixed(2)}ms</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-3">{test.description}</p>
                      
                      {test.error && (
                        <div className="p-3 bg-red-900/20 border border-red-700 rounded text-sm text-red-400">
                          {test.error}
                        </div>
                      )}
                      
                      {showGeneratedCode && (
                        <div className="mt-3 p-3 bg-gray-900 rounded-lg">
                          <pre className="text-xs text-green-400 font-mono">
                            {test.code}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a test suite to view tests</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}