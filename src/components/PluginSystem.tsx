import React, { useState } from 'react';
import { Puzzle, Download, Settings, Star, Search, Filter, Package, Code, Zap } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  rating: number;
  downloads: number;
  isInstalled: boolean;
  isEnabled: boolean;
  features: string[];
  permissions: string[];
  size: string;
  lastUpdated: Date;
  homepage?: string;
  repository?: string;
}

interface PluginCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  count: number;
}

const PLUGIN_CATEGORIES: PluginCategory[] = [
  {
    id: 'all',
    name: 'All Plugins',
    description: 'Browse all available plugins',
    icon: Package,
    count: 42
  },
  {
    id: 'ai-tools',
    name: 'AI Tools',
    description: 'AI-powered development tools',
    icon: Zap,
    count: 12
  },
  {
    id: 'code-quality',
    name: 'Code Quality',
    description: 'Linting, formatting, and analysis',
    icon: Code,
    count: 8
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Tools to boost your productivity',
    icon: Settings,
    count: 15
  },
  {
    id: 'themes',
    name: 'Themes',
    description: 'Editor themes and customization',
    icon: Puzzle,
    count: 7
  }
];

const SAMPLE_PLUGINS: Plugin[] = [
  {
    id: 'ai-autocomplete',
    name: 'AI Autocomplete Pro',
    description: 'Advanced AI-powered code completion with context awareness',
    version: '2.1.0',
    author: 'DevTools Inc',
    category: 'ai-tools',
    rating: 4.8,
    downloads: 15420,
    isInstalled: true,
    isEnabled: true,
    features: ['Smart completions', 'Multi-language support', 'Context analysis'],
    permissions: ['Read code', 'Network access'],
    size: '2.3 MB',
    lastUpdated: new Date('2024-01-15'),
    homepage: 'https://example.com/ai-autocomplete',
    repository: 'https://github.com/example/ai-autocomplete'
  },
  {
    id: 'code-formatter',
    name: 'Universal Code Formatter',
    description: 'Format code in 20+ languages with customizable rules',
    version: '1.5.2',
    author: 'CodeStyle Team',
    category: 'code-quality',
    rating: 4.6,
    downloads: 8930,
    isInstalled: false,
    isEnabled: false,
    features: ['Multi-language formatting', 'Custom rules', 'Auto-format on save'],
    permissions: ['Read/write files'],
    size: '1.8 MB',
    lastUpdated: new Date('2024-01-10'),
    repository: 'https://github.com/example/code-formatter'
  },
  {
    id: 'git-assistant',
    name: 'Git Assistant',
    description: 'Intelligent Git operations with AI-powered commit messages',
    version: '3.0.1',
    author: 'GitTools',
    category: 'productivity',
    rating: 4.9,
    downloads: 22100,
    isInstalled: true,
    isEnabled: false,
    features: ['Smart commits', 'Branch management', 'Conflict resolution'],
    permissions: ['Git access', 'File system'],
    size: '3.1 MB',
    lastUpdated: new Date('2024-01-20'),
    homepage: 'https://example.com/git-assistant'
  },
  {
    id: 'dark-theme-pro',
    name: 'Dark Theme Pro',
    description: 'Beautiful dark theme with syntax highlighting optimizations',
    version: '1.2.0',
    author: 'ThemeStudio',
    category: 'themes',
    rating: 4.7,
    downloads: 5670,
    isInstalled: false,
    isEnabled: false,
    features: ['Multiple variants', 'Custom colors', 'Icon themes'],
    permissions: ['UI customization'],
    size: '0.5 MB',
    lastUpdated: new Date('2024-01-08'),
    repository: 'https://github.com/example/dark-theme-pro'
  },
  {
    id: 'api-tester',
    name: 'API Testing Suite',
    description: 'Test REST APIs directly from your editor',
    version: '2.3.1',
    author: 'APITools',
    category: 'productivity',
    rating: 4.5,
    downloads: 12340,
    isInstalled: false,
    isEnabled: false,
    features: ['HTTP client', 'Response visualization', 'Test collections'],
    permissions: ['Network access', 'File storage'],
    size: '4.2 MB',
    lastUpdated: new Date('2024-01-12')
  }
];

export function PluginSystem() {
  const { state } = useAgent();
  const [plugins, setPlugins] = useState<Plugin[]>(SAMPLE_PLUGINS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'downloads' | 'updated'>('rating');
  const [showInstalled, setShowInstalled] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  const filteredPlugins = plugins.filter(plugin => {
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInstalled = !showInstalled || plugin.isInstalled;
    
    return matchesCategory && matchesSearch && matchesInstalled;
  });

  const sortedPlugins = [...filteredPlugins].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      case 'updated':
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      default:
        return 0;
    }
  });

  const handleInstallPlugin = (pluginId: string) => {
    setPlugins(plugins.map(plugin =>
      plugin.id === pluginId
        ? { ...plugin, isInstalled: true, isEnabled: true }
        : plugin
    ));
  };

  const handleUninstallPlugin = (pluginId: string) => {
    setPlugins(plugins.map(plugin =>
      plugin.id === pluginId
        ? { ...plugin, isInstalled: false, isEnabled: false }
        : plugin
    ));
  };

  const handleTogglePlugin = (pluginId: string) => {
    setPlugins(plugins.map(plugin =>
      plugin.id === pluginId
        ? { ...plugin, isEnabled: !plugin.isEnabled }
        : plugin
    ));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getInstalledCount = () => plugins.filter(p => p.isInstalled).length;
  const getEnabledCount = () => plugins.filter(p => p.isEnabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Puzzle className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Plugin System</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{getInstalledCount()} installed</span>
            <span>{getEnabledCount()} enabled</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          
          <div className="space-y-2">
            {PLUGIN_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-600">{category.count} plugins</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInstalled}
                onChange={(e) => setShowInstalled(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Show only installed</span>
            </label>
          </div>
        </div>

        {/* Plugin List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search and Filters */}
          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plugins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input-field"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="downloads">Sort by Downloads</option>
                  <option value="name">Sort by Name</option>
                  <option value="updated">Sort by Updated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plugin Cards */}
          <div className="space-y-4">
            {sortedPlugins.map((plugin) => (
              <div
                key={plugin.id}
                className={`card cursor-pointer transition-all duration-200 ${
                  selectedPlugin?.id === plugin.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPlugin(plugin)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{plugin.name}</h4>
                      <span className="text-sm text-gray-500">v{plugin.version}</span>
                      {plugin.isInstalled && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plugin.isEnabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {plugin.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{plugin.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>by {plugin.author}</span>
                      <div className="flex items-center space-x-1">
                        {renderStars(plugin.rating)}
                        <span className="ml-1">{plugin.rating}</span>
                      </div>
                      <span>{plugin.downloads.toLocaleString()} downloads</span>
                      <span>{plugin.size}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {plugin.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {plugin.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{plugin.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {plugin.isInstalled ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePlugin(plugin.id);
                          }}
                          className={`btn-secondary text-sm ${
                            plugin.isEnabled ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {plugin.isEnabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUninstallPlugin(plugin.id);
                          }}
                          className="btn-secondary text-sm text-red-600"
                        >
                          Uninstall
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstallPlugin(plugin.id);
                        }}
                        className="btn-primary text-sm flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Install</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {sortedPlugins.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Puzzle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No plugins found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plugin Details Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-gray-900">{selectedPlugin.name}</h3>
                <span className="text-sm text-gray-500">v{selectedPlugin.version}</span>
              </div>
              <button
                onClick={() => setSelectedPlugin(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">{selectedPlugin.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Author:</span>
                  <span className="ml-2 text-gray-600">{selectedPlugin.author}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Size:</span>
                  <span className="ml-2 text-gray-600">{selectedPlugin.size}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Downloads:</span>
                  <span className="ml-2 text-gray-600">{selectedPlugin.downloads.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Updated:</span>
                  <span className="ml-2 text-gray-600">{selectedPlugin.lastUpdated.toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                <ul className="space-y-1">
                  {selectedPlugin.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPlugin.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {selectedPlugin.homepage && (
                  <a
                    href={selectedPlugin.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Homepage
                  </a>
                )}
                {selectedPlugin.repository && (
                  <a
                    href={selectedPlugin.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Repository
                  </a>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedPlugin(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                {selectedPlugin.isInstalled ? (
                  <button
                    onClick={() => {
                      handleUninstallPlugin(selectedPlugin.id);
                      setSelectedPlugin(null);
                    }}
                    className="btn-secondary text-red-600"
                  >
                    Uninstall
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleInstallPlugin(selectedPlugin.id);
                      setSelectedPlugin(null);
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Install Plugin</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}