import React, { useState, useEffect } from 'react';
import { Github, GitBranch, Download, Upload, Folder, File, Star, GitFork, RefreshCw, Search, X } from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { motion } from 'framer-motion';

interface GitHubIntegrationProps {
  fullScreen?: boolean;
  onSetupComplete?: () => void;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  owner: string;
  html_url: string;
  clone_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
}

export function GitHubIntegration({ fullScreen = false, onSetupComplete }: GitHubIntegrationProps) {
  const { dispatch } = useEditor();
  const [githubToken, setGithubToken] = useState(localStorage.getItem('github_token') || '');
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [repoFiles, setRepoFiles] = useState<GitHubFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  useEffect(() => {
    if (githubToken) {
      verifyConnection();
    }
  }, [githubToken]);

  const verifyConnection = async () => {
    try {
      setIsLoading(true);
      // Simulate API call to GitHub
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const user = {
        login: 'github_user',
        id: 12345,
        avatar_url: 'https://avatars.githubusercontent.com/u/12345',
        name: 'GitHub User',
        public_repos: 15,
        followers: 25,
        following: 30
      };
      
      setUserInfo(user);
      setIsConnected(true);
      localStorage.setItem('github_token', githubToken);
      
      await loadRepositories();
      
      if (onSetupComplete) {
        onSetupComplete();
      }
    } catch (error) {
      console.error('GitHub connection failed:', error);
      setIsConnected(false);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!githubToken.trim()) return;
    await verifyConnection();
  };

  const handleDisconnect = () => {
    localStorage.removeItem('github_token');
    setGithubToken('');
    setIsConnected(false);
    setUserInfo(null);
    setRepositories([]);
    setSelectedRepo(null);
    setRepoFiles([]);
  };

  const loadRepositories = async () => {
    try {
      setIsLoading(true);
      // Simulate API call to GitHub
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock repositories data
      const repos: GitHubRepo[] = [
        {
          id: 1,
          name: 'project-alpha',
          full_name: 'github_user/project-alpha',
          description: 'A React-based web application with TypeScript',
          private: false,
          owner: 'github_user',
          html_url: 'https://github.com/github_user/project-alpha',
          clone_url: 'https://github.com/github_user/project-alpha.git',
          language: 'TypeScript',
          stargazers_count: 25,
          forks_count: 5,
          updated_at: '2023-12-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'api-service',
          full_name: 'github_user/api-service',
          description: 'RESTful API service built with Node.js and Express',
          private: false,
          owner: 'github_user',
          html_url: 'https://github.com/github_user/api-service',
          clone_url: 'https://github.com/github_user/api-service.git',
          language: 'JavaScript',
          stargazers_count: 12,
          forks_count: 3,
          updated_at: '2024-01-20T14:45:00Z'
        },
        {
          id: 3,
          name: 'data-visualization',
          full_name: 'github_user/data-visualization',
          description: 'Data visualization library using D3.js',
          private: true,
          owner: 'github_user',
          html_url: 'https://github.com/github_user/data-visualization',
          clone_url: 'https://github.com/github_user/data-visualization.git',
          language: 'JavaScript',
          stargazers_count: 8,
          forks_count: 1,
          updated_at: '2024-02-05T09:15:00Z'
        }
      ];
      
      setRepositories(repos);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRepositoryFromUrl = async () => {
    if (!repoUrl.trim()) return;
    
    try {
      setIsLoading(true);
      // Simulate API call to GitHub
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extract owner/repo from GitHub URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub repository URL');
      }
      
      const [, owner, repoName] = match;
      
      // Mock repository data
      const repo: GitHubRepo = {
        id: 999,
        name: repoName,
        full_name: `${owner}/${repoName}`,
        description: 'Repository loaded from URL',
        private: false,
        owner: owner,
        html_url: repoUrl,
        clone_url: `${repoUrl}.git`,
        language: 'JavaScript',
        stargazers_count: 0,
        forks_count: 0,
        updated_at: new Date().toISOString()
      };
      
      setSelectedRepo(repo);
      await loadRepositoryFiles(repo);
    } catch (error) {
      console.error('Failed to load repository from URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRepositoryFiles = async (repo: GitHubRepo, path = '') => {
    try {
      setIsLoading(true);
      setCurrentPath(path);
      
      // Simulate API call to GitHub
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock files data
      let files: GitHubFile[] = [];
      
      if (path === '') {
        files = [
          { name: 'src', path: 'src', type: 'dir' },
          { name: 'public', path: 'public', type: 'dir' },
          { name: 'package.json', path: 'package.json', type: 'file', size: 1024 },
          { name: 'README.md', path: 'README.md', type: 'file', size: 2048 },
          { name: '.gitignore', path: '.gitignore', type: 'file', size: 512 }
        ];
      } else if (path === 'src') {
        files = [
          { name: 'components', path: 'src/components', type: 'dir' },
          { name: 'utils', path: 'src/utils', type: 'dir' },
          { name: 'App.js', path: 'src/App.js', type: 'file', size: 3072 },
          { name: 'index.js', path: 'src/index.js', type: 'file', size: 1536 }
        ];
      } else if (path === 'src/components') {
        files = [
          { name: 'Header.js', path: 'src/components/Header.js', type: 'file', size: 2048 },
          { name: 'Footer.js', path: 'src/components/Footer.js', type: 'file', size: 1536 },
          { name: 'Button.js', path: 'src/components/Button.js', type: 'file', size: 1024 }
        ];
      }
      
      setRepoFiles(files);
    } catch (error) {
      console.error('Failed to load repository files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRepository = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setCurrentPath('');
    setPathHistory([]);
    await loadRepositoryFiles(repo);
  };

  const handleNavigateToFolder = async (file: GitHubFile) => {
    if (file.type === 'dir' && selectedRepo) {
      setPathHistory([...pathHistory, currentPath]);
      await loadRepositoryFiles(selectedRepo, file.path);
    }
  };

  const handleNavigateBack = async () => {
    if (pathHistory.length > 0 && selectedRepo) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(pathHistory.slice(0, -1));
      await loadRepositoryFiles(selectedRepo, previousPath);
    }
  };

  const handleImportFile = async (file: GitHubFile) => {
    try {
      setIsLoading(true);
      
      // Simulate API call to get file content
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock file content
      let content = '';
      if (file.name.endsWith('.js')) {
        content = `// ${file.name}\n// Imported from GitHub\n\nfunction example() {\n  console.log("Hello from ${file.name}");\n}\n\nexport default example;`;
      } else if (file.name.endsWith('.json')) {
        content = `{\n  "name": "${selectedRepo?.name}",\n  "version": "1.0.0",\n  "description": "${selectedRepo?.description}"\n}`;
      } else if (file.name.endsWith('.md')) {
        content = `# ${file.name.replace('.md', '')}\n\nThis file was imported from GitHub repository: ${selectedRepo?.full_name}\n\n## Description\n\n${selectedRepo?.description}`;
      } else {
        content = `// ${file.name}\n// Imported from GitHub\n`;
      }

      const projectFile = {
        id: Date.now().toString(),
        name: file.name,
        path: file.path,
        content,
        language: getLanguageFromExtension(file.name),
        isDirty: false,
        isActive: true,
      };

      dispatch({ type: 'OPEN_FILE', payload: projectFile });
    } catch (error) {
      console.error('Failed to import file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportRepository = async () => {
    if (!selectedRepo) return;

    try {
      setIsLoading(true);
      
      // Simulate importing all files
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock files to import
      const filesToImport = [
        { name: 'package.json', path: 'package.json', content: `{\n  "name": "${selectedRepo.name}",\n  "version": "1.0.0",\n  "description": "${selectedRepo.description}"\n}` },
        { name: 'README.md', path: 'README.md', content: `# ${selectedRepo.name}\n\n${selectedRepo.description}` },
        { name: 'App.js', path: 'src/App.js', content: `// App.js\n// Imported from GitHub\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello from ${selectedRepo.name}</h1>\n    </div>\n  );\n}\n\nexport default App;` }
      ];
      
      for (const file of filesToImport) {
        const projectFile = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          path: file.path,
          content: file.content,
          language: getLanguageFromExtension(file.name),
          isDirty: false,
          isActive: false,
        };

        dispatch({ type: 'OPEN_FILE', payload: projectFile });
      }
      
      // Set the first file as active
      if (filesToImport.length > 0) {
        const firstFile = {
          id: `${Date.now()}-${Math.random()}`,
          name: filesToImport[0].name,
          path: filesToImport[0].path,
          content: filesToImport[0].content,
          language: getLanguageFromExtension(filesToImport[0].name),
          isDirty: false,
          isActive: true,
        };
        
        dispatch({ type: 'SET_ACTIVE_FILE', payload: firstFile.id });
      }
    } catch (error) {
      console.error('Failed to import repository:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown'
    };
    return languageMap[ext || ''] || 'text';
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!fullScreen) {
    // Sidebar mode
    return (
      <div className="h-full flex flex-col bg-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Github className="h-5 w-5 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-200">GitHub</h3>
          </div>
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => setGithubToken('')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Connect
            </button>
          )}
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="GitHub Personal Access Token"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
            <button
              onClick={handleConnect}
              disabled={isLoading || !githubToken.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded text-sm"
            >
              {isLoading ? 'Connecting...' : 'Connect to GitHub'}
            </button>
            <div className="text-xs text-gray-400">
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Generate a token
              </a> with repo scope
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* User info */}
            <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-700 rounded">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">
                {userInfo?.login?.charAt(0).toUpperCase() || 'G'}
              </div>
              <div className="text-sm text-gray-200">{userInfo?.login}</div>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200"
              />
            </div>
            
            {/* Repository list */}
            <div className="flex-1 overflow-y-auto">
              <div className="text-xs text-gray-400 mb-2">Repositories</div>
              <div className="space-y-1">
                {filteredRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
                      selectedRepo?.id === repo.id ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => handleSelectRepository(repo)}
                  >
                    <GitBranch className="h-3 w-3 text-gray-400 mr-2" />
                    <div className="text-xs text-gray-200 truncate">{repo.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full screen mode
  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Github className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">GitHub Integration</h2>
          </div>
          
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="text-red-400 hover:text-red-300 px-3 py-1 border border-red-700 rounded"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {!isConnected ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl border border-gray-700">
            <div className="text-center mb-6">
              <Github className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Connect to GitHub</h3>
              <p className="text-gray-400">
                Connect your GitHub account to access repositories, import code, and collaborate.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Create a token with 'repo' scope at{' '}
                  <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    GitHub Settings → Developer settings → Personal access tokens
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Or import from public repository URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <button
                    onClick={loadRepositoryFromUrl}
                    disabled={isLoading || !repoUrl.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg"
                  >
                    {isLoading ? 'Loading...' : 'Import'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleConnect}
                disabled={isLoading || !githubToken.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Github className="h-5 w-5" />
                    <span>Connect to GitHub</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex">
          {/* Repository List */}
          <div className="w-1/3 p-4 border-r border-gray-700 overflow-y-auto">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                {userInfo?.login?.charAt(0).toUpperCase() || 'G'}
              </div>
              <div>
                <div className="font-medium text-white">{userInfo?.login}</div>
                <div className="text-sm text-gray-400">{userInfo?.public_repos} repositories</div>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
              />
            </div>
            
            {/* Repository list */}
            <div className="space-y-3">
              {filteredRepositories.map((repo) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRepo?.id === repo.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                  }`}
                  onClick={() => handleSelectRepository(repo)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="h-4 w-4 text-blue-400" />
                      <h4 className="font-medium text-white">{repo.name}</h4>
                    </div>
                    {repo.private && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        Private
                      </span>
                    )}
                  </div>
                  
                  {repo.description && (
                    <p className="text-sm text-gray-400 mb-2">{repo.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {repo.language && (
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{repo.language}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{repo.stargazers_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <GitFork className="h-3 w-3" />
                      <span>{repo.forks_count}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {filteredRepositories.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No repositories found</p>
                </div>
              )}
              
              {isLoading && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
                  <p className="text-gray-400">Loading repositories...</p>
                </div>
              )}
            </div>
          </div>

          {/* Repository Files */}
          <div className="w-2/3 flex flex-col">
            {selectedRepo ? (
              <>
                {/* Repo Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{selectedRepo.full_name}</h3>
                    <button
                      onClick={handleImportRepository}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Import All</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{selectedRepo.language}</span>
                    <a 
                      href={selectedRepo.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
                
                {/* File Navigation */}
                <div className="p-3 border-b border-gray-700 flex items-center space-x-2">
                  {currentPath !== '' && (
                    <button
                      onClick={handleNavigateBack}
                      className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  
                  <div className="flex items-center space-x-1 text-sm text-gray-300">
                    <span className="font-medium">{selectedRepo.name}</span>
                    {currentPath.split('/').filter(Boolean).map((part, index, array) => (
                      <React.Fragment key={index}>
                        <span>/</span>
                        <span>{part}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                
                {/* Files List */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
                      <p className="text-gray-400">Loading files...</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {repoFiles.map((file) => (
                        <div
                          key={file.path}
                          className="flex items-center justify-between p-2 hover:bg-gray-800 rounded group"
                        >
                          <div 
                            className="flex items-center space-x-2 cursor-pointer"
                            onClick={() => file.type === 'dir' ? handleNavigateToFolder(file) : null}
                          >
                            {file.type === 'dir' ? (
                              <Folder className="h-4 w-4 text-blue-400" />
                            ) : (
                              <File className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-300">{file.name}</span>
                          </div>
                          
                          {file.type === 'file' && (
                            <button
                              onClick={() => handleImportFile(file)}
                              className="text-blue-400 hover:text-blue-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Import
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {repoFiles.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No files found in this directory</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Github className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a repository to view files</p>
                  <p className="text-sm mt-2">Or import a repository from URL</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}