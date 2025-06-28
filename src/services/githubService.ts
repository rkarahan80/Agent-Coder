export interface GitHubRepo {
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

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<GitHubUser> {
    return this.request<GitHubUser>('/user');
  }

  async getUserRepositories(per_page = 100): Promise<GitHubRepo[]> {
    const repos = await this.request<any[]>(`/user/repos?per_page=${per_page}&sort=updated`);
    return repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      owner: repo.owner.login,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
    }));
  }

  async getRepositoryFromUrl(url: string): Promise<GitHubRepo> {
    // Extract owner/repo from GitHub URL
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }

    const [, owner, repoName] = match;
    const cleanRepoName = repoName.replace(/\.git$/, '');

    const repo = await this.request<any>(`/repos/${owner}/${cleanRepoName}`);
    return {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      owner: repo.owner.login,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
    };
  }

  async getRepositoryFiles(owner: string, repo: string, path = ''): Promise<GitHubFile[]> {
    const endpoint = `/repos/${owner}/${repo}/contents/${path}`;
    const files = await this.request<any[]>(endpoint);
    
    return files.map(file => ({
      name: file.name,
      path: file.path,
      type: file.type,
      size: file.size,
      download_url: file.download_url,
    }));
  }

  async getAllRepositoryFiles(owner: string, repo: string, path = ''): Promise<GitHubFile[]> {
    const files = await this.getRepositoryFiles(owner, repo, path);
    const allFiles: GitHubFile[] = [];

    for (const file of files) {
      if (file.type === 'file') {
        allFiles.push(file);
      } else if (file.type === 'dir') {
        // Recursively get files from subdirectories
        try {
          const subFiles = await this.getAllRepositoryFiles(owner, repo, file.path);
          allFiles.push(...subFiles);
        } catch (error) {
          console.warn(`Failed to load directory ${file.path}:`, error);
        }
      }
    }

    return allFiles;
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const endpoint = `/repos/${owner}/${repo}/contents/${path}`;
    const file = await this.request<any>(endpoint);
    
    if (file.type !== 'file') {
      throw new Error('Path is not a file');
    }

    // Decode base64 content
    const content = atob(file.content.replace(/\s/g, ''));
    return content;
  }

  async createFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch = 'main'
  ): Promise<void> {
    const endpoint = `/repos/${owner}/${repo}/contents/${path}`;
    const encodedContent = btoa(content);

    await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: encodedContent,
        branch,
      }),
    });
  }

  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha: string,
    branch = 'main'
  ): Promise<void> {
    const endpoint = `/repos/${owner}/${repo}/contents/${path}`;
    const encodedContent = btoa(content);

    await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: encodedContent,
        sha,
        branch,
      }),
    });
  }

  async searchRepositories(query: string, per_page = 30): Promise<GitHubRepo[]> {
    const endpoint = `/search/repositories?q=${encodeURIComponent(query)}&per_page=${per_page}`;
    const response = await this.request<{ items: any[] }>(endpoint);
    
    return response.items.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      owner: repo.owner.login,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
    }));
  }

  async getBranches(owner: string, repo: string): Promise<Array<{ name: string; commit: { sha: string } }>> {
    const endpoint = `/repos/${owner}/${repo}/branches`;
    return this.request<Array<{ name: string; commit: { sha: string } }>>(endpoint);
  }

  async createBranch(owner: string, repo: string, branchName: string, fromSha: string): Promise<void> {
    const endpoint = `/repos/${owner}/${repo}/git/refs`;
    
    await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: fromSha,
      }),
    });
  }
}