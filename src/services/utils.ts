export function extractCodeBlocks(content: string): Array<{
  language: string;
  code: string;
  filename?: string;
}> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{
    language: string;
    code: string;
    filename?: string;
  }> = [];
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();
    
    blocks.push({
      language,
      code,
      filename: getFilenameFromLanguage(language)
    });
  }

  return blocks;
}

export function getFilenameFromLanguage(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    html: 'html',
    css: 'css',
    json: 'json',
    xml: 'xml',
    yaml: 'yml',
    sql: 'sql',
    bash: 'sh',
    shell: 'sh',
    go: 'go',
    rust: 'rs',
    php: 'php',
    ruby: 'rb'
  };

  const ext = extensions[language.toLowerCase()] || 'txt';
  return `example.${ext}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getLanguageFromExtension(filename: string): string {
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
    h: 'c',
    hpp: 'cpp',
    html: 'html',
    css: 'css',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby'
  };
  
  return languageMap[ext || ''] || 'text';
}