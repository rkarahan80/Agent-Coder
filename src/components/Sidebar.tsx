import React from 'react';
import { Files, Search, GitBranch, Package, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: 'files' | 'search' | 'git' | 'extensions';
  onTabChange: (tab: 'files' | 'search' | 'git' | 'extensions') => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'files' as const, icon: Files, label: 'Explorer' },
    { id: 'search' as const, icon: Search, label: 'Search' },
    { id: 'git' as const, icon: GitBranch, label: 'GitHub' },
    { id: 'extensions' as const, icon: Package, label: 'Extensions' },
  ];

  return (
    <div className="w-12 bg-gray-800 border-r border-gray-700 flex flex-col">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`p-3 hover:bg-gray-700 transition-colors ${
            activeTab === tab.id ? 'bg-gray-700 border-r-2 border-blue-500' : ''
          }`}
          title={tab.label}
        >
          <tab.icon className="h-5 w-5 text-gray-400" />
        </button>
      ))}
      
      <div className="flex-1"></div>
      
      <button
        className="p-3 hover:bg-gray-700 transition-colors"
        title="Settings"
      >
        <Settings className="h-5 w-5 text-gray-400" />
      </button>
    </div>
  );
}