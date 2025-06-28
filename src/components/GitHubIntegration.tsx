import React, { useState, useEffect } from 'react';
import { Github, GitBranch, Download, Upload, Folder, File, Star, GitFork } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { GitHubService, GitHubRepo, GitHubFile } from '../services/githubService';

export function GitHubIntegration() {
  const { dispatch } = useAgent();
  const [githubToken, setGithubToken] = useState(localStorage.getItem('github_token') || '');
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [repoFiles, setRepoFiles] = useState<GitHubFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  const githubService = new GitHubService(githubToken);

  useEffect(() => {
    if (githubToken) {
      verifyConnection();
    }
  }, [githubToken]);

  const verifyConnection = async () => {
    try {
      setIsLoading(true);
      const user = await githubService.getCurrentUser();
      setUserInfo(user);
      setIsConnected(true);
      await loadRepositories();
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
    
    localStorage.setItem('github_token', githubToken);
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
      const repos = await githubService.getUserRepositories();
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
      const repo = await githubService.getRepositoryFromUrl(repoUrl);
      setSelectedRepo(repo);
      await loadRepositoryFiles(repo);
    } catch (error) {
      console.error('Failed to load repository from URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRepositoryFiles = async (repo: GitHubRepo) => {
    try {
      setIsLoading(true);
      const files = await githubService.getRepositoryFiles(repo.owner, repo.name);
      setRepoFiles(files);
    } catch (error) {
      console.error('Failed to load repository files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRepository = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    await loadRepositoryFiles(repo);
  };

  const handleImportFile = async (file: GitHubFile) => {
    try {
      const content = await githubService.getFileContent(
        selectedRepo!.owner,
        selectedRepo!.name,
        file.path
      );

      const projectFile = {
        id: Date.now().toString(),
        name: file.name,
        path: file.path,
        content,
        language: getLanguageFromExtension(file.name),
        size: content.length,
        lastModified: new Date()
      };

      dispatch({ type: 'ADD_PROJECT_FILE', payload: projectFile });
      dispatch({ type: 'SET_ACTIVE_FILE', payload: projectFile.id });
    } catch (error) {
      console.error('Failed to import file:', error);
    }
  };

  const handleImportRepository = async () => {
    if (!selectedRepo) return;

    try {
      setIsLoading(true);
      const allFiles = await githubService.getAllRepositoryFiles(
        selectedRepo.owner,
        selectedRepo.name
      );

      for (const file of allFiles) {
        if (file.type === 'file' && !file.name.startsWith('.')) {
          try {
            const content = await githubService.getFileContent(
              selectedRepo.owner,
              selectedRepo.name,
              file.path
            );

            const projectFile = {
              id: `${Date.now()}-${Math.random()}`,
              name: file.name,
              path: file.path,
              content,
              language: getLanguageFromExtension(file.name),
              size: content.length,
              lastModified: new Date()
            };

            dispatch({ type: 'ADD_PROJECT_FILE', payload: projectFile });
          } catch (error) {
            console.error(`Failed to import file ${file.path}:`, error);
          }
        }
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

  if (!isConnected) {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <Github className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">GitHub Integration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="input-field"
            />
            <p className="text-sm text-gray-500 mt-1">
              Create a token at{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                GitHub Settings → Developer settings → Personal access tokens
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or import from public repository URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="input-field flex-1"
              />
              <button
                onClick={loadRepositoryFromUrl}
                disabled={isLoading || !repoUrl.trim()}
                className="btn-primary"
              >
                {isLoading ? 'Loading...' : 'Import'}
              </button>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={isLoading || !githubToken.trim()}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Github className="h-4 w-4" />
            <span>{isLoading ? 'Connecting...' : 'Connect to GitHub'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Github className="h-6 w-6 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Connected to GitHub
              </h3>
              <p className="text-sm text-gray-600">
                {userInfo?.login} • {userInfo?.public_repos} repositories
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="btn-secondary text-red-600"
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repository List */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Your Repositories</h4>
            <button
              onClick={loadRepositories}
              disabled={isLoading}
              className="btn-secondary text-sm"
            >
              Refresh
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredRepositories.map((repo) => (
              <div
                key={repo.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                  selectedRepo?.id === repo.id
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectRepository(repo)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900">{repo.name}</h5>
                      {repo.private && (
                        <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Private
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repository Files */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              {selectedRepo ? `${selectedRepo.name} Files` : 'Select Repository'}
            </h4>
            {selectedRepo && (
              <button
                onClick={handleImportRepository}
                disabled={isLoading}
                className="btn-primary text-sm flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Import All</span>
              </button>
            )}
          </div>

          {selectedRepo ? (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {repoFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    {file.type === 'dir' ? (
                      <Folder className="h-4 w-4 text-blue-600" />
                    ) : (
                      <File className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-sm">{file.name}</span>
                  </div>
                  {file.type === 'file' && (
                    <button
                      onClick={() => handleImportFile(file)}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Import
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Github className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Select a repository to view files</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}