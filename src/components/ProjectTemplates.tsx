import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { FileText, Download, Star, Search, Filter, Code, Globe, Smartphone, Database } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  language: string;
  framework: string;
  rating: number;
  downloads: number;
  tags: string[];
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  dependencies: string[];
  scripts: Record<string, string>;
}

const ADVANCED_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'react-enterprise',
    name: 'React Enterprise Starter',
    description: 'Production-ready React app with TypeScript, testing, and CI/CD',
    category: 'Frontend',
    language: 'TypeScript',
    framework: 'React',
    rating: 4.9,
    downloads: 15420,
    tags: ['TypeScript', 'Testing', 'CI/CD', 'ESLint', 'Prettier'],
    files: [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { ErrorFallback } from './components/ErrorFallback';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </main>
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;`,
        language: 'typescript'
      },
      {
        path: 'src/components/Header.tsx',
        content: `import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Enterprise App</h1>
        <nav className="nav">
          {user ? (
            <div className="user-menu">
              <span>Welcome, {user.name}</span>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          ) : (
            <Button href="/login">Login</Button>
          )}
        </nav>
      </div>
    </header>
  );
}`,
        language: 'typescript'
      }
    ],
    dependencies: ['react', 'react-router-dom', '@tanstack/react-query', 'react-error-boundary'],
    scripts: {
      'dev': 'vite',
      'build': 'tsc && vite build',
      'test': 'vitest',
      'lint': 'eslint src --ext ts,tsx',
      'format': 'prettier --write src'
    }
  },
  {
    id: 'node-microservice',
    name: 'Node.js Microservice',
    description: 'Scalable microservice with Docker, monitoring, and API documentation',
    category: 'Backend',
    language: 'TypeScript',
    framework: 'Express',
    rating: 4.8,
    downloads: 8930,
    tags: ['Docker', 'OpenAPI', 'Monitoring', 'Testing'],
    files: [
      {
        path: 'src/app.ts',
        content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { apiRouter } from './routes/api';
import { healthRouter } from './routes/health';
import { metricsRouter } from './routes/metrics';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Request processing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging and monitoring
app.use(requestLogger);
app.use(rateLimiter);

// Routes
app.use('/health', healthRouter);
app.use('/metrics', metricsRouter);
app.use('/api/v1', apiRouter);

// Error handling
app.use(errorHandler);

export { app };`,
        language: 'typescript'
      }
    ],
    dependencies: ['express', 'cors', 'helmet', 'compression'],
    scripts: {
      'dev': 'nodemon src/app.ts',
      'build': 'tsc',
      'start': 'node dist/app.js',
      'test': 'jest',
      'docker:build': 'docker build -t microservice .',
      'docker:run': 'docker run -p 3000:3000 microservice'
    }
  },
  {
    id: 'flutter-enterprise',
    name: 'Flutter Enterprise App',
    description: 'Cross-platform mobile app with state management and testing',
    category: 'Mobile',
    language: 'Dart',
    framework: 'Flutter',
    rating: 4.7,
    downloads: 12340,
    tags: ['BLoC', 'Testing', 'CI/CD', 'Localization'],
    files: [
      {
        path: 'lib/main.dart',
        content: `import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:enterprise_app/app/app.dart';
import 'package:enterprise_app/app/bloc_observer.dart';
import 'package:enterprise_app/injection_container.dart' as di;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize dependencies
  await di.init();
  
  // Set up BLoC observer for debugging
  Bloc.observer = AppBlocObserver();
  
  runApp(const EnterpriseApp());
}

class EnterpriseApp extends StatelessWidget {
  const EnterpriseApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Enterprise App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', 'US'),
        Locale('es', 'ES'),
      ],
      home: const App(),
    );
  }
}`,
        language: 'dart'
      }
    ],
    dependencies: ['flutter_bloc', 'dio', 'get_it', 'injectable'],
    scripts: {
      'build:android': 'flutter build apk --release',
      'build:ios': 'flutter build ios --release',
      'test': 'flutter test',
      'analyze': 'flutter analyze',
      'format': 'dart format lib test'
    }
  }
];

export function ProjectTemplates() {
  const { dispatch } = useEditor();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const categories = ['all', 'Frontend', 'Backend', 'Mobile', 'Full-Stack', 'DevOps'];

  const filteredTemplates = ADVANCED_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: ProjectTemplate) => {
    // Create all files from template
    template.files.forEach((file, index) => {
      const editorFile = {
        id: `${template.id}-${index}`,
        name: file.path.split('/').pop() || 'file',
        path: file.path,
        content: file.content,
        language: file.language,
        isDirty: false,
        isActive: index === 0,
      };
      dispatch({ type: 'OPEN_FILE', payload: editorFile });
    });

    // Create package.json if dependencies exist
    if (template.dependencies.length > 0) {
      const packageJson = {
        name: template.name.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: template.description,
        dependencies: template.dependencies.reduce((acc, dep) => {
          acc[dep] = 'latest';
          return acc;
        }, {} as Record<string, string>),
        scripts: template.scripts
      };

      const packageFile = {
        id: `${template.id}-package`,
        name: 'package.json',
        path: '/package.json',
        content: JSON.stringify(packageJson, null, 2),
        language: 'json',
        isDirty: false,
        isActive: false,
      };
      dispatch({ type: 'OPEN_FILE', payload: packageFile });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Frontend': return Globe;
      case 'Backend': return Database;
      case 'Mobile': return Smartphone;
      default: return Code;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Project Templates</h2>
        
        {/* Search and Filters */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Templates List */}
        <div className="w-1/2 p-4 overflow-y-auto border-r border-gray-700">
          <div className="space-y-4">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold text-white">{template.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-300">{template.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">{template.downloads} downloads</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{template.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        {template.framework}
                      </span>
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        {template.category}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-1 py-0.5 bg-gray-600 text-gray-300 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Template Details */}
        <div className="w-1/2 p-4 overflow-y-auto">
          {selectedTemplate ? (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{selectedTemplate.name}</h3>
                <p className="text-gray-300 mb-4">{selectedTemplate.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-400">Language:</span>
                    <span className="ml-2 text-white">{selectedTemplate.language}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Framework:</span>
                    <span className="ml-2 text-white">{selectedTemplate.framework}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Category:</span>
                    <span className="ml-2 text-white">{selectedTemplate.category}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Files:</span>
                    <span className="ml-2 text-white">{selectedTemplate.files.length}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleUseTemplate(selectedTemplate)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Use This Template
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Dependencies</h4>
                  <div className="space-y-1">
                    {selectedTemplate.dependencies.map((dep, index) => (
                      <div key={index} className="text-sm text-gray-300 font-mono">
                        {dep}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Scripts</h4>
                  <div className="space-y-1">
                    {Object.entries(selectedTemplate.scripts).map(([script, command]) => (
                      <div key={script} className="text-sm">
                        <span className="text-blue-400">{script}:</span>
                        <span className="ml-2 text-gray-300 font-mono">{command}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">File Structure</h4>
                  <div className="space-y-1">
                    {selectedTemplate.files.map((file, index) => (
                      <div key={index} className="text-sm text-gray-300 font-mono">
                        <FileText className="inline h-3 w-3 mr-1" />
                        {file.path}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a template to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}