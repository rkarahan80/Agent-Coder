import React, { useState } from 'react';
import { FileText, Copy, Download, Star, Search, Filter } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  category: string;
  code: string;
  tags: string[];
  rating: number;
  downloads: number;
}

const SAMPLE_TEMPLATES: CodeTemplate[] = [
  {
    id: '1',
    name: 'React Functional Component',
    description: 'A basic React functional component with TypeScript',
    language: 'typescript',
    category: 'React',
    code: `import React from 'react';

interface Props {
  title: string;
  children?: React.ReactNode;
}

export const MyComponent: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default MyComponent;`,
    tags: ['react', 'typescript', 'component'],
    rating: 4.8,
    downloads: 1250
  },
  {
    id: '2',
    name: 'Express API Route',
    description: 'RESTful API route with error handling',
    language: 'javascript',
    category: 'Backend',
    code: `const express = require('express');
const router = express.Router();

// GET /api/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST /api/users
router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;`,
    tags: ['express', 'api', 'rest', 'nodejs'],
    rating: 4.6,
    downloads: 890
  },
  {
    id: '3',
    name: 'Python Data Analysis',
    description: 'Basic data analysis with pandas and matplotlib',
    language: 'python',
    category: 'Data Science',
    code: `import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def analyze_data(file_path):
    """
    Perform basic data analysis on a CSV file
    """
    # Load data
    df = pd.read_csv(file_path)
    
    # Basic info
    print("Dataset Info:")
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    
    # Summary statistics
    print("\\nSummary Statistics:")
    print(df.describe())
    
    # Missing values
    print("\\nMissing Values:")
    print(df.isnull().sum())
    
    # Correlation matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(df.corr(), annot=True, cmap='coolwarm')
    plt.title('Correlation Matrix')
    plt.show()
    
    return df

# Usage
# df = analyze_data('your_data.csv')`,
    tags: ['pandas', 'matplotlib', 'data-analysis', 'python'],
    rating: 4.9,
    downloads: 2100
  },
  {
    id: '4',
    name: 'Custom React Hook',
    description: 'Custom hook for API data fetching with loading states',
    language: 'typescript',
    category: 'React',
    code: `import { useState, useEffect } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(url: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}

// Usage example:
// const { data, loading, error } = useApi<User[]>('/api/users');`,
    tags: ['react', 'hooks', 'typescript', 'api'],
    rating: 4.7,
    downloads: 1680
  }
];

export function CodeTemplates() {
  const { dispatch } = useAgent();
  const [templates] = useState<CodeTemplate[]>(SAMPLE_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  const languages = ['all', ...Array.from(new Set(templates.map(t => t.language)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'all' || template.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const handleUseTemplate = (template: CodeTemplate) => {
    const newFile = {
      id: Date.now().toString(),
      name: `${template.name.toLowerCase().replace(/\s+/g, '-')}.${getFileExtension(template.language)}`,
      path: `${template.name.toLowerCase().replace(/\s+/g, '-')}.${getFileExtension(template.language)}`,
      content: template.code,
      language: template.language,
      size: template.code.length,
      lastModified: new Date()
    };

    dispatch({ type: 'ADD_PROJECT_FILE', payload: newFile });
    dispatch({ type: 'SET_ACTIVE_FILE', payload: newFile.id });
  };

  const handleCopyTemplate = async (template: CodeTemplate) => {
    await navigator.clipboard.writeText(template.code);
  };

  const handleDownloadTemplate = (template: CodeTemplate) => {
    const blob = new Blob([template.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.${getFileExtension(template.language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (language: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css'
    };
    return extensions[language] || 'txt';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Templates List */}
      <div className="lg:col-span-2 card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Code Templates</h3>
            <span className="text-sm text-gray-500">({filteredTemplates.length} templates)</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="input-field"
          >
            {languages.map(language => (
              <option key={language} value={language}>
                {language === 'all' ? 'All Languages' : language}
              </option>
            ))}
          </select>
        </div>

        {/* Templates Grid */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 ${
                selectedTemplate?.id === template.id
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {template.language}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {template.category}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(template.rating)}
                    <span className="text-xs text-gray-500 ml-1">{template.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">{template.downloads} downloads</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No templates found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Template Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Preview</h3>
        
        {selectedTemplate ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{selectedTemplate.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{selectedTemplate.description}</p>
              
              <div className="flex items-center space-x-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {selectedTemplate.language}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  {selectedTemplate.category}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(selectedTemplate.rating)}
                  <span className="text-xs text-gray-500 ml-1">{selectedTemplate.rating}</span>
                </div>
                <span className="text-xs text-gray-500">{selectedTemplate.downloads} downloads</span>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Code Preview:</h5>
              <div className="bg-gray-900 rounded p-3 max-h-64 overflow-y-auto">
                <pre className="text-gray-100 text-xs font-mono whitespace-pre-wrap">
                  {selectedTemplate.code}
                </pre>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleUseTemplate(selectedTemplate)}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Use Template</span>
              </button>
              <button
                onClick={() => handleCopyTemplate(selectedTemplate)}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDownloadTemplate(selectedTemplate)}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Select a template to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}