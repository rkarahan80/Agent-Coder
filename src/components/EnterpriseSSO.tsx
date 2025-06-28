import React, { useState } from 'react';
import { Shield, Key, Users, Settings, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth' | 'oidc';
  status: 'active' | 'inactive' | 'pending';
  domain: string;
  users: number;
  lastSync: Date;
  config: {
    entityId?: string;
    ssoUrl?: string;
    certificate?: string;
    clientId?: string;
    clientSecret?: string;
    issuer?: string;
  };
}

interface SSOSettings {
  enforceSSO: boolean;
  allowLocalAuth: boolean;
  autoProvision: boolean;
  defaultRole: string;
  sessionTimeout: number;
  requireMFA: boolean;
}

export function EnterpriseSSO() {
  const [providers, setProviders] = useState<SSOProvider[]>([
    {
      id: '1',
      name: 'Microsoft Azure AD',
      type: 'oidc',
      status: 'active',
      domain: 'company.com',
      users: 245,
      lastSync: new Date(Date.now() - 3600000),
      config: {
        clientId: 'abc123-def456-ghi789',
        issuer: 'https://login.microsoftonline.com/tenant-id'
      }
    },
    {
      id: '2',
      name: 'Google Workspace',
      type: 'oauth',
      status: 'active',
      domain: 'company.com',
      users: 89,
      lastSync: new Date(Date.now() - 1800000),
      config: {
        clientId: 'google-client-id',
        clientSecret: '***hidden***'
      }
    },
    {
      id: '3',
      name: 'Okta SAML',
      type: 'saml',
      status: 'pending',
      domain: 'company.okta.com',
      users: 0,
      lastSync: new Date(),
      config: {
        entityId: 'http://www.okta.com/exk1234567890',
        ssoUrl: 'https://company.okta.com/app/company_app/exk1234567890/sso/saml'
      }
    }
  ]);

  const [settings, setSettings] = useState<SSOSettings>({
    enforceSSO: true,
    allowLocalAuth: false,
    autoProvision: true,
    defaultRole: 'developer',
    sessionTimeout: 8,
    requireMFA: true
  });

  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(providers[0]);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    type: 'oidc' as const,
    domain: ''
  });

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'saml': return Shield;
      case 'oauth': return Key;
      case 'oidc': return Users;
      default: return Shield;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-100';
      case 'inactive': return 'text-gray-500 bg-gray-100';
      case 'pending': return 'text-yellow-500 bg-yellow-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const handleAddProvider = () => {
    if (!newProvider.name || !newProvider.domain) return;

    const provider: SSOProvider = {
      id: Date.now().toString(),
      name: newProvider.name,
      type: newProvider.type,
      status: 'pending',
      domain: newProvider.domain,
      users: 0,
      lastSync: new Date(),
      config: {}
    };

    setProviders([...providers, provider]);
    setNewProvider({ name: '', type: 'oidc', domain: '' });
    setShowAddProvider(false);
  };

  const handleToggleProvider = (providerId: string) => {
    setProviders(providers.map(p =>
      p.id === providerId
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ));
  };

  const handleTestConnection = async (provider: SSOProvider) => {
    // Simulate connection test
    console.log(`Testing connection for ${provider.name}...`);
    // In real implementation, this would test the SSO configuration
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Providers List */}
      <div className="w-1/2 p-4 border-r border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">SSO Providers</h2>
            <p className="text-gray-400 text-sm">Manage enterprise authentication</p>
          </div>
          
          <button
            onClick={() => setShowAddProvider(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Add Provider</span>
          </button>
        </div>

        {/* Global Settings */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-white mb-3">Global SSO Settings</h3>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.enforceSSO}
                onChange={(e) => setSettings({ ...settings, enforceSSO: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700 text-blue-600"
              />
              <span className="text-gray-300">Enforce SSO for all users</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.allowLocalAuth}
                onChange={(e) => setSettings({ ...settings, allowLocalAuth: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700 text-blue-600"
              />
              <span className="text-gray-300">Allow local authentication fallback</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.autoProvision}
                onChange={(e) => setSettings({ ...settings, autoProvision: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700 text-blue-600"
              />
              <span className="text-gray-300">Auto-provision new users</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.requireMFA}
                onChange={(e) => setSettings({ ...settings, requireMFA: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700 text-blue-600"
              />
              <span className="text-gray-300">Require multi-factor authentication</span>
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Default Role</label>
              <select
                value={settings.defaultRole}
                onChange={(e) => setSettings({ ...settings, defaultRole: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Session Timeout (hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Providers List */}
        <div className="space-y-3">
          {providers.map((provider) => {
            const ProviderIcon = getProviderIcon(provider.type);
            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedProvider?.id === provider.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                }`}
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <ProviderIcon className="h-5 w-5 text-blue-400" />
                    <div>
                      <h3 className="font-medium text-white">{provider.name}</h3>
                      <p className="text-sm text-gray-400">{provider.domain}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(provider.status)}`}>
                      {provider.status}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">{provider.type}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{provider.users} users</span>
                  <span className="text-gray-500">Last sync: {formatLastSync(provider.lastSync)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Provider Configuration */}
      <div className="w-1/2 p-4">
        {selectedProvider ? (
          <div className="space-y-6">
            {/* Provider Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedProvider.name}</h3>
                <p className="text-gray-400">{selectedProvider.type.toUpperCase()} Provider</p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTestConnection(selectedProvider)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                >
                  Test Connection
                </button>
                <button
                  onClick={() => handleToggleProvider(selectedProvider.id)}
                  className={`px-3 py-2 rounded text-sm ${
                    selectedProvider.status === 'active'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {selectedProvider.status === 'active' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{selectedProvider.users}</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    selectedProvider.status === 'active' ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {selectedProvider.status === 'active' ? '✓' : '○'}
                  </div>
                  <div className="text-sm text-gray-400">Status</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {formatLastSync(selectedProvider.lastSync)}
                  </div>
                  <div className="text-sm text-gray-400">Last Sync</div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div>
              <h4 className="font-medium text-white mb-4">Configuration</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Domain</label>
                  <input
                    type="text"
                    value={selectedProvider.domain}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>

                {selectedProvider.type === 'oidc' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Client ID</label>
                      <input
                        type="text"
                        value={selectedProvider.config.clientId || ''}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Issuer URL</label>
                      <input
                        type="url"
                        value={selectedProvider.config.issuer || ''}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </>
                )}

                {selectedProvider.type === 'saml' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Entity ID</label>
                      <input
                        type="text"
                        value={selectedProvider.config.entityId || ''}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">SSO URL</label>
                      <input
                        type="url"
                        value={selectedProvider.config.ssoUrl || ''}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </>
                )}

                {selectedProvider.type === 'oauth' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Client ID</label>
                      <input
                        type="text"
                        value={selectedProvider.config.clientId || ''}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Client Secret</label>
                      <input
                        type="password"
                        value={selectedProvider.config.clientSecret || ''}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Documentation Links */}
            <div>
              <h4 className="font-medium text-white mb-3">Documentation</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Setup Guide for {selectedProvider.name}</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Troubleshooting {selectedProvider.type.toUpperCase()}</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select an SSO provider to configure</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      {showAddProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Add SSO Provider</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Provider Name</label>
                <input
                  type="text"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  placeholder="e.g., Company Azure AD"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Protocol</label>
                <select
                  value={newProvider.type}
                  onChange={(e) => setNewProvider({ ...newProvider, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="oidc">OpenID Connect</option>
                  <option value="saml">SAML 2.0</option>
                  <option value="oauth">OAuth 2.0</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Domain</label>
                <input
                  type="text"
                  value={newProvider.domain}
                  onChange={(e) => setNewProvider({ ...newProvider, domain: e.target.value })}
                  placeholder="company.com"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddProvider(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProvider}
                disabled={!newProvider.name || !newProvider.domain}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded"
              >
                Add Provider
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}