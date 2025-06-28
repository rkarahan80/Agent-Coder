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
import { MobileDevelopment } from './components/MobileDevelopment';
import { CloudDeployment } from './components/CloudDeployment';
import { IDEIntegration } from './components/IDEIntegration';
import { CollaborativeEditor } from './components/CollaborativeEditor';
import { AdvancedDebugger } from './components/AdvancedDebugger';
import { CustomAIIntegration } from './components/CustomAIIntegration';
import { PluginSystem } from './components/PluginSystem';
import { AgentProvider } from './context/AgentContext';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'explorer' | 'settings' | 'collaboration' | 'analytics' | 'suggestions' | 'templates' | 'mobile' | 'deployment' | 'ide' | 'realtime' | 'debugger' | 'custom-ai' | 'plugins'>('chat');

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
          {activeTab === 'mobile' && <MobileDevelopment />}
          {activeTab === 'deployment' && <CloudDeployment />}
          {activeTab === 'ide' && <IDEIntegration />}
          {activeTab === 'realtime' && <CollaborativeEditor />}
          {activeTab === 'debugger' && <AdvancedDebugger />}
          {activeTab === 'custom-ai' && <CustomAIIntegration />}
          {activeTab === 'plugins' && <PluginSystem />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </AgentProvider>
  );
}

export default App;