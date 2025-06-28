import React, { useState, useEffect } from 'react';
import { EditorProvider } from './context/EditorContext';
import { AIProvider } from './context/AIContext';
import { FileExplorer } from './components/FileExplorer';
import { CodeEditor } from './components/CodeEditor';
import { AIChat } from './components/AIChat';
import { StatusBar } from './components/StatusBar';
import { CommandPalette } from './components/CommandPalette';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';
import { ProjectTemplates } from './components/ProjectTemplates';
import { CodeReviewAutomation } from './components/CodeReviewAutomation';
import { PerformanceProfiler } from './components/PerformanceProfiler';
import { TeamManagement } from './components/TeamManagement';
import { EnterpriseSSO } from './components/EnterpriseSSO';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { DocumentationGenerator } from './components/DocumentationGenerator';
import { TestingFramework } from './components/TestingFramework';
import { SecurityScanner } from './components/SecurityScanner';
import { APIDocGenerator } from './components/APIDocGenerator';
import { APIKeyManager } from './components/APIKeyManager';
import { GitHubIntegration } from './components/GitHubIntegration';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion } from 'framer-motion';

function App() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'files' | 'search' | 'git' | 'extensions'>('files');
  const [showAIChat, setShowAIChat] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string>('editor');
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  // Global hotkeys
  useHotkeys('ctrl+shift+p', () => setShowCommandPalette(true));
  useHotkeys('ctrl+,', () => setShowSettings(true));
  useHotkeys('ctrl+shift+`', () => setShowAIChat(!showAIChat));
  useHotkeys('ctrl+b', () => setSidebarTab(sidebarTab === 'files' ? 'files' : 'files'));

  // Check if API keys are set
  useEffect(() => {
    const openaiKey = localStorage.getItem('openai_key');
    const geminiKey = localStorage.getItem('gemini_key');
    const claudeKey = localStorage.getItem('claude_key');
    
    if (openaiKey || geminiKey || claudeKey) {
      setShowWelcomeScreen(false);
    }
  }, []);

  const handleActivateComponent = (component: string) => {
    setActiveComponent(component);
    setShowWelcomeScreen(false);
  };

  return (
    <EditorProvider>
      <AIProvider>
        <div className="h-screen bg-gray-900 text-gray-100 flex flex-col overflow-hidden">
          {/* Title Bar */}
          <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-sm text-gray-400">CoderAgent</div>
            <div className="w-16"></div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar 
              activeTab={sidebarTab} 
              onTabChange={setSidebarTab}
            />

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex">
                {/* File Explorer */}
                {sidebarTab === 'files' && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 280 }}
                    exit={{ width: 0 }}
                    className="bg-gray-800 border-r border-gray-700"
                  >
                    <FileExplorer />
                  </motion.div>
                )}

                {/* GitHub Integration */}
                {sidebarTab === 'git' && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 280 }}
                    exit={{ width: 0 }}
                    className="bg-gray-800 border-r border-gray-700"
                  >
                    <GitHubIntegration />
                  </motion.div>
                )}

                {/* Welcome Screen or Main Component */}
                <div className="flex-1 flex flex-col">
                  {showWelcomeScreen ? (
                    <div className="flex-1 flex items-center justify-center bg-gray-900">
                      <div className="max-w-2xl p-8 bg-gray-800 rounded-xl shadow-lg">
                        <h1 className="text-3xl font-bold text-white mb-6 text-center">Welcome to CoderAgent</h1>
                        <p className="text-gray-300 mb-8 text-center">
                          To get started, please set up your AI provider API keys and GitHub integration.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div 
                            className="p-6 bg-blue-900/30 border border-blue-700 rounded-lg cursor-pointer hover:bg-blue-900/50 transition-colors"
                            onClick={() => handleActivateComponent('apikeys')}
                          >
                            <h2 className="text-xl font-semibold text-white mb-3">API Key Setup</h2>
                            <p className="text-gray-300 mb-4">Configure your OpenAI, Google Gemini, or Anthropic Claude API keys to enable AI features.</p>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                              Set Up API Keys
                            </button>
                          </div>
                          
                          <div 
                            className="p-6 bg-purple-900/30 border border-purple-700 rounded-lg cursor-pointer hover:bg-purple-900/50 transition-colors"
                            onClick={() => handleActivateComponent('github')}
                          >
                            <h2 className="text-xl font-semibold text-white mb-3">GitHub Integration</h2>
                            <p className="text-gray-300 mb-4">Connect your GitHub account to access repositories, manage code, and collaborate.</p>
                            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                              Connect GitHub
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-8 text-center">
                          <button 
                            className="text-gray-400 hover:text-white"
                            onClick={() => setShowWelcomeScreen(false)}
                          >
                            Skip for now
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {activeComponent === 'editor' && <CodeEditor />}
                      {activeComponent === 'templates' && <ProjectTemplates />}
                      {activeComponent === 'codeReview' && <CodeReviewAutomation />}
                      {activeComponent === 'profiler' && <PerformanceProfiler />}
                      {activeComponent === 'team' && <TeamManagement />}
                      {activeComponent === 'sso' && <EnterpriseSSO />}
                      {activeComponent === 'analytics' && <AdvancedAnalytics />}
                      {activeComponent === 'documentation' && <DocumentationGenerator />}
                      {activeComponent === 'testing' && <TestingFramework />}
                      {activeComponent === 'security' && <SecurityScanner />}
                      {activeComponent === 'apiDocs' && <APIDocGenerator />}
                      {activeComponent === 'apikeys' && <APIKeyManager onSetupComplete={() => setActiveComponent('editor')} />}
                      {activeComponent === 'github' && <GitHubIntegration fullScreen={true} onSetupComplete={() => setActiveComponent('editor')} />}
                    </>
                  )}
                </div>

                {/* AI Chat Panel */}
                {showAIChat && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 400 }}
                    exit={{ width: 0 }}
                    className="bg-gray-800 border-l border-gray-700"
                  >
                    <AIChat onClose={() => setShowAIChat(false)} />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <StatusBar />

          {/* Modals */}
          {showCommandPalette && (
            <CommandPalette onClose={() => setShowCommandPalette(false)} />
          )}

          {showSettings && (
            <SettingsModal onClose={() => setShowSettings(false)} />
          )}
        </div>
      </AIProvider>
    </EditorProvider>
  );
}

export default App;