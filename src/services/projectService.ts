import { AIProvider } from '../types/ai';

export async function analyzeProject(
  files: Record<string, string>,
  apiKey: string,
  provider: AIProvider = 'openai'
): Promise<any> {
  try {
    // In a real implementation, this would call the Python backend
    // For now, we'll simulate the analysis
    const totalLines = Object.values(files).reduce((sum, content) => {
      return sum + content.split('\n').length;
    }, 0);

    const languages = Object.keys(files).reduce((acc, filename) => {
      const ext = filename.split('.').pop()?.toLowerCase();
      const language = getLanguageFromExtension(ext || '');
      acc[language] = (acc[language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const complexity = Object.values(files).reduce((sum, content) => {
      return sum + (content.match(/if|while|for|switch|case/g) || []).length;
    }, 0);

    // Simulate test coverage calculation
    const testFiles = Object.keys(files).filter(filename => 
      filename.includes('test') || filename.includes('spec')
    ).length;
    const testCoverage = Math.min(100, (testFiles / Object.keys(files).length) * 100);

    // Simulate documentation coverage
    const docFiles = Object.keys(files).filter(filename => 
      filename.toLowerCase().includes('readme') || filename.endsWith('.md')
    ).length;
    const documentation = Math.min(100, (docFiles / Object.keys(files).length) * 100);

    // Calculate health score
    const healthScore = Math.max(0, Math.min(100, 
      (testCoverage * 0.3) + 
      (documentation * 0.2) + 
      (Math.max(0, 100 - complexity) * 0.3) + 
      (totalLines > 0 ? 20 : 0)
    ));

    // Simulate issues
    const issues = [
      { type: 'style', severity: 'low' as const, count: Math.floor(Math.random() * 5) },
      { type: 'performance', severity: 'medium' as const, count: Math.floor(Math.random() * 3) },
      { type: 'security', severity: 'high' as const, count: Math.floor(Math.random() * 2) },
    ];

    // Simulate trends
    const trends = {
      linesAdded: Math.floor(Math.random() * 100),
      linesRemoved: Math.floor(Math.random() * 50),
      filesChanged: Math.floor(Math.random() * 10),
      period: '7d'
    };

    return {
      totalLines,
      totalFiles: Object.keys(files).length,
      languages,
      complexity,
      testCoverage: Math.round(testCoverage),
      documentation: Math.round(documentation),
      healthScore: Math.round(healthScore),
      issues,
      trends
    };
  } catch (error) {
    console.error('Project analysis error:', error);
    throw new Error('Failed to analyze project');
  }
}

function getLanguageFromExtension(ext: string): string {
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
  
  return languageMap[ext] || 'unknown';
}