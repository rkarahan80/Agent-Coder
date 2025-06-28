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
import { useHotkeys } from 'react-hotkeys-hook';
import { motion } from 'framer-motion';

function App() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'files' | 'search' | 'git' | 'extensions'>('files');
  const [showAIChat, setShowAIChat] = useState(false);

  // Global hotkeys
  useHotkeys('ctrl+shift+p', () => setShowCommandPalette(true));
  useHotkeys('ctrl+,', () => setShowSettings(true));
  useHotkeys('ctrl+shift+`', () => setShowAIChat(!showAIChat));
  useHotkeys('ctrl+b', () => setSidebarTab(sidebarTab === 'files' ? 'files' : 'files'));

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
            <div className="text-sm text-gray-400">Cursor Alternative</div>
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

                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                  <CodeEditor />
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