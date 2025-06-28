import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { CodeEditor } from './components/CodeEditor';
import { ProjectExplorer } from './components/ProjectExplorer';
import { SettingsPanel } from './components/SettingsPanel';
import { CodeCollaboration } from './components/CodeCollaboration';
import { ProjectAnalytics } from './components/ProjectAnalytics';
import { CodeSuggestions } from './components/CodeSuggestions';
import { CodeTemplates } from './components/CodeTemplates';
import { AgentProvider } from './context/AgentContext';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'explorer' | 'settings' | 'collaboration' | 'analytics' | 'suggestions' | 'templates'>('chat');

  return (
    <AgentProvider>
      <div className="min-h-screen bg-gray-50">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="container mx-auto px-4 py-6">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'editor' && <CodeEditor />}
          {activeTab === 'explorer' && <ProjectExplorer />}
          {activeTab === 'collaboration' && <CodeCollaboration />}
          {activeTab === 'analytics' && <ProjectAnalytics />}
          {activeTab === 'suggestions' && <CodeSuggestions />}
          {activeTab === 'templates' && <CodeTemplates />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </AgentProvider>
  );
}

export default App;