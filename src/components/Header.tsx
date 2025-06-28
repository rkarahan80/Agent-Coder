import React from 'react';
import { Bot, Code, FolderOpen, Settings, MessageSquare } from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'editor' | 'explorer' | 'settings';
  onTabChange: (tab: 'chat' | 'editor' | 'explorer' | 'settings') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'editor' as const, label: 'Code Editor', icon: Code },
    { id: 'explorer' as const, label: 'Project Explorer', icon: FolderOpen },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Agent Coder</h1>
          </div>
          
          <nav className="flex space-x-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}