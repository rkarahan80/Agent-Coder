import React from 'react';
import { Bot, Code, FolderOpen, Settings, MessageSquare, Users, BarChart3, Lightbulb, FileText, Smartphone, Cloud, Code2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'editor' | 'explorer' | 'settings' | 'collaboration' | 'analytics' | 'suggestions' | 'templates' | 'mobile' | 'deployment' | 'ide';
  onTabChange: (tab: 'chat' | 'editor' | 'explorer' | 'settings' | 'collaboration' | 'analytics' | 'suggestions' | 'templates' | 'mobile' | 'deployment' | 'ide') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'editor' as const, label: 'Code Editor', icon: Code },
    { id: 'explorer' as const, label: 'Project Explorer', icon: FolderOpen },
    { id: 'mobile' as const, label: 'Mobile Dev', icon: Smartphone },
    { id: 'deployment' as const, label: 'Cloud Deploy', icon: Cloud },
    { id: 'ide' as const, label: 'IDE Integration', icon: Code2 },
    { id: 'collaboration' as const, label: 'Collaboration', icon: Users },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'suggestions' as const, label: 'Suggestions', icon: Lightbulb },
    { id: 'templates' as const, label: 'Templates', icon: FileText },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Agent Coder</h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Pro</span>
          </div>
          
          <nav className="flex space-x-1 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}