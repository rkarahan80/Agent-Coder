import React, { useState } from 'react';
import { Cloud, Server, Globe, Settings, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { deployToCloud } from '../services/deploymentService';

interface DeploymentProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  pricing: string;
  setupSteps: string[];
}

interface DeploymentConfig {
  provider: string;
  projectName: string;
  environment: 'development' | 'staging' | 'production';
  region: string;
  buildCommand: string;
  outputDirectory: string;
  environmentVariables: Record<string, string>;
}

const DEPLOYMENT_PROVIDERS: DeploymentProvider[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Frontend deployment platform with global CDN',
    icon: '▲',
    features: ['Automatic deployments', 'Global CDN', 'Serverless functions', 'Custom domains'],
    pricing: 'Free tier available',
    setupSteps: [
      'Connect your Git repository',
      'Configure build settings',
      'Deploy with automatic CI/CD'
    ]
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'All-in-one platform for modern web projects',
    icon: '🌐',
    features: ['Continuous deployment', 'Form handling', 'Edge functions', 'Split testing'],
    pricing: 'Free tier available',
    setupSteps: [
      'Link Git repository',
      'Set build command and publish directory',
      'Configure domain and SSL'
    ]
  },
  {
    id: 'aws',
    name: 'AWS',
    description: 'Amazon Web Services cloud platform',
    icon: '☁️',
    features: ['S3 static hosting', 'CloudFront CDN', 'Lambda functions', 'RDS databases'],
    pricing: 'Pay-as-you-go',
    setupSteps: [
      'Create AWS account',
      'Set up S3 bucket for static hosting',
      'Configure CloudFront distribution',
      'Set up Route 53 for custom domain'
    ]
  },
  {
    id: 'heroku',
    name: 'Heroku',
    description: 'Platform as a Service for full-stack applications',
    icon: '🟣',
    features: ['Git-based deployment', 'Add-ons marketplace', 'Automatic scaling', 'Multiple languages'],
    pricing: 'Free tier available',
    setupSteps: [
      'Create Heroku app',
      'Connect Git repository',
      'Configure buildpacks',
      'Set environment variables'
    ]
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    description: 'Simple cloud hosting for developers',
    icon: '🌊',
    features: ['App Platform', 'Droplets (VPS)', 'Managed databases', 'Load balancers'],
    pricing: 'Starting at $5/month',
    setupSteps: [
      'Create DigitalOcean account',
      'Set up App Platform or Droplet',
      'Configure deployment pipeline',
      'Set up monitoring and alerts'
    ]
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google\'s mobile and web application platform',
    icon: '🔥',
    features: ['Hosting', 'Real-time database', 'Authentication', 'Cloud functions'],
    pricing: 'Free tier available',
    setupSteps: [
      'Create Firebase project',
      'Install Firebase CLI',
      'Initialize hosting',
      'Deploy with firebase deploy'
    ]
  }
];

export function CloudDeployment() {
  const { state } = useAgent();
  const [selectedProvider, setSelectedProvider] = useState<DeploymentProvider>(DEPLOYMENT_PROVIDERS[0]);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    provider: 'vercel',
    projectName: '',
    environment: 'production',
    region: 'us-east-1',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    environmentVariables: {}
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');

  const handleDeploy = async () => {
    if (!deploymentConfig.projectName.trim()) return;

    setIsDeploying(true);
    setDeploymentStatus('deploying');

    try {
      const result = await deployToCloud(deploymentConfig, state.projectFiles);
      setDeploymentStatus('success');
      setDeploymentUrl(result.url);
    } catch (error) {
      setDeploymentStatus('error');
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleAddEnvironmentVariable = () => {
    if (newEnvKey.trim() && newEnvValue.trim()) {
      setDeploymentConfig({
        ...deploymentConfig,
        environmentVariables: {
          ...deploymentConfig.environmentVariables,
          [newEnvKey]: newEnvValue
        }
      });
      setNewEnvKey('');
      setNewEnvValue('');
    }
  };

  const handleRemoveEnvironmentVariable = (key: string) => {
    const newEnvVars = { ...deploymentConfig.environmentVariables };
    delete newEnvVars[key];
    setDeploymentConfig({
      ...deploymentConfig,
      environmentVariables: newEnvVars
    });
  };

  const getStatusIcon = () => {
    switch (deploymentStatus) {
      case 'deploying':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Cloud className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (deploymentStatus) {
      case 'deploying':
        return 'Deploying your application...';
      case 'success':
        return 'Deployment successful!';
      case 'error':
        return 'Deployment failed. Please check your configuration.';
      default:
        return 'Ready to deploy';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cloud className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Cloud Deployment</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm text-gray-600">{getStatusMessage()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Selection */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Provider</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {DEPLOYMENT_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                  selectedProvider.id === provider.id
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedProvider(provider);
                  setDeploymentConfig({ ...deploymentConfig, provider: provider.id });
                }}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{provider.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                    <p className="text-xs text-green-600 mt-1">{provider.pricing}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {provider.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={deploymentConfig.projectName}
                onChange={(e) => setDeploymentConfig({ ...deploymentConfig, projectName: e.target.value })}
                placeholder="my-awesome-app"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
              <select
                value={deploymentConfig.environment}
                onChange={(e) => setDeploymentConfig({ ...deploymentConfig, environment: e.target.value as any })}
                className="input-field"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Build Command</label>
              <input
                type="text"
                value={deploymentConfig.buildCommand}
                onChange={(e) => setDeploymentConfig({ ...deploymentConfig, buildCommand: e.target.value })}
                placeholder="npm run build"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output Directory</label>
              <input
                type="text"
                value={deploymentConfig.outputDirectory}
                onChange={(e) => setDeploymentConfig({ ...deploymentConfig, outputDirectory: e.target.value })}
                placeholder="dist"
                className="input-field"
              />
            </div>

            {/* Environment Variables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Environment Variables</label>
              
              <div className="space-y-2 mb-3">
                {Object.entries(deploymentConfig.environmentVariables).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded flex-1">
                      {key}={value}
                    </span>
                    <button
                      onClick={() => handleRemoveEnvironmentVariable(key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value)}
                  placeholder="KEY"
                  className="input-field flex-1"
                />
                <input
                  type="text"
                  value={newEnvValue}
                  onChange={(e) => setNewEnvValue(e.target.value)}
                  placeholder="value"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddEnvironmentVariable}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            <button
              onClick={handleDeploy}
              disabled={isDeploying || !deploymentConfig.projectName.trim()}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Server className="h-4 w-4" />
              <span>{isDeploying ? 'Deploying...' : 'Deploy Now'}</span>
            </button>

            {deploymentStatus === 'success' && deploymentUrl && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Deployment Successful!</span>
                </div>
                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700 mt-1"
                >
                  <span>{deploymentUrl}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Setup Guide */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Guide</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{selectedProvider.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{selectedProvider.name}</h4>
                <p className="text-sm text-gray-600">{selectedProvider.description}</p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Features</h5>
              <ul className="space-y-1">
                {selectedProvider.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Setup Steps</h5>
              <ol className="space-y-2">
                {selectedProvider.setupSteps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-1">Pricing</h5>
              <p className="text-sm text-blue-700">{selectedProvider.pricing}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}