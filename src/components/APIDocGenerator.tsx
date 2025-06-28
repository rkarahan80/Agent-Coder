import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useAI } from '../context/AIContext';
import { FileText, Code, Globe, RefreshCw, Download, Copy, Check, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: {
    contentType: string;
    schema: string;
    example: string;
  };
  responses: Array<{
    status: number;
    description: string;
    contentType: string;
    schema: string;
    example: string;
  }>;
  security?: string[];
}

interface APIDocumentation {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  endpoints: APIEndpoint[];
}

export function APIDocGenerator() {
  const { state: editorState } = useEditor();
  const { state: aiState } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiDocs, setApiDocs] = useState<APIDocumentation | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [outputFormat, setOutputFormat] = useState<'openapi' | 'markdown' | 'html'>('openapi');
  const [copied, setCopied] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);

  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId);

  const generateDocs = async () => {
    if (!activeFile || !aiState.apiKeys.openai) return;

    setIsGenerating(true);
    setApiDocs(null);
    setGeneratedOutput(null);

    try {
      // Simulate AI API documentation generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sample API documentation
      const docs: APIDocumentation = {
        title: 'Sample API',
        version: '1.0.0',
        description: 'A sample API for demonstration purposes',
        baseUrl: 'https://api.example.com/v1',
        endpoints: [
          {
            path: '/users',
            method: 'GET',
            description: 'Get a list of users',
            parameters: [
              {
                name: 'limit',
                type: 'integer',
                required: false,
                description: 'Maximum number of users to return'
              },
              {
                name: 'offset',
                type: 'integer',
                required: false,
                description: 'Number of users to skip'
              }
            ],
            responses: [
              {
                status: 200,
                description: 'Successful response',
                contentType: 'application/json',
                schema: '{ "users": [User] }',
                example: '{ "users": [{ "id": 1, "name": "John Doe", "email": "john@example.com" }] }'
              },
              {
                status: 400,
                description: 'Bad request',
                contentType: 'application/json',
                schema: '{ "error": string }',
                example: '{ "error": "Invalid parameters" }'
              }
            ],
            security: ['api_key']
          },
          {
            path: '/users/{id}',
            method: 'GET',
            description: 'Get a user by ID',
            parameters: [
              {
                name: 'id',
                type: 'integer',
                required: true,
                description: 'User ID'
              }
            ],
            responses: [
              {
                status: 200,
                description: 'Successful response',
                contentType: 'application/json',
                schema: 'User',
                example: '{ "id": 1, "name": "John Doe", "email": "john@example.com" }'
              },
              {
                status: 404,
                description: 'User not found',
                contentType: 'application/json',
                schema: '{ "error": string }',
                example: '{ "error": "User not found" }'
              }
            ],
            security: ['api_key']
          },
          {
            path: '/users',
            method: 'POST',
            description: 'Create a new user',
            parameters: [],
            requestBody: {
              contentType: 'application/json',
              schema: '{ "name": string, "email": string, "password": string }',
              example: '{ "name": "John Doe", "email": "john@example.com", "password": "password123" }'
            },
            responses: [
              {
                status: 201,
                description: 'User created',
                contentType: 'application/json',
                schema: 'User',
                example: '{ "id": 1, "name": "John Doe", "email": "john@example.com" }'
              },
              {
                status: 400,
                description: 'Bad request',
                contentType: 'application/json',
                schema: '{ "error": string }',
                example: '{ "error": "Invalid user data" }'
              }
            ],
            security: ['api_key']
          }
        ]
      };

      setApiDocs(docs);
      setSelectedEndpoint(docs.endpoints[0]);
      generateOutput(docs, outputFormat);
    } catch (error) {
      console.error('API documentation generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateOutput = (docs: APIDocumentation, format: string) => {
    let output = '';

    if (format === 'openapi') {
      output = JSON.stringify({
        openapi: '3.0.0',
        info: {
          title: docs.title,
          version: docs.version,
          description: docs.description
        },
        servers: [
          {
            url: docs.baseUrl
          }
        ],
        paths: docs.endpoints.reduce((paths, endpoint) => {
          const path = endpoint.path;
          const method = endpoint.method.toLowerCase();
          
          if (!paths[path]) {
            paths[path] = {};
          }
          
          paths[path][method] = {
            summary: endpoint.description,
            parameters: endpoint.parameters.map(param => ({
              name: param.name,
              in: path.includes(`{${param.name}}`) ? 'path' : 'query',
              required: param.required,
              schema: {
                type: param.type
              },
              description: param.description
            })),
            responses: endpoint.responses.reduce((responses, response) => {
              responses[response.status] = {
                description: response.description,
                content: {
                  [response.contentType]: {
                    schema: {
                      type: 'object'
                    },
                    example: JSON.parse(response.example)
                  }
                }
              };
              return responses;
            }, {} as any)
          };
          
          if (endpoint.requestBody) {
            paths[path][method].requestBody = {
              content: {
                [endpoint.requestBody.contentType]: {
                  schema: {
                    type: 'object'
                  },
                  example: JSON.parse(endpoint.requestBody.example)
                }
              }
            };
          }
          
          return paths;
        }, {} as any)
      }, null, 2);
    } else if (format === 'markdown') {
      output = `# ${docs.title} API Documentation\n\nVersion: ${docs.version}\n\n${docs.description}\n\nBase URL: ${docs.baseUrl}\n\n`;
      
      docs.endpoints.forEach(endpoint => {
        output += `## ${endpoint.method} ${endpoint.path}\n\n${endpoint.description}\n\n`;
        
        if (endpoint.parameters.length > 0) {
          output += '### Parameters\n\n';
          output += '| Name | Type | Required | Description |\n';
          output += '| ---- | ---- | -------- | ----------- |\n';
          endpoint.parameters.forEach(param => {
            output += `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
          });
          output += '\n';
        }
        
        if (endpoint.requestBody) {
          output += '### Request Body\n\n';
          output += `Content-Type: ${endpoint.requestBody.contentType}\n\n`;
          output += '```json\n';
          output += endpoint.requestBody.example;
          output += '\n```\n\n';
        }
        
        output += '### Responses\n\n';
        endpoint.responses.forEach(response => {
          output += `#### ${response.status} - ${response.description}\n\n`;
          output += `Content-Type: ${response.contentType}\n\n`;
          output += '```json\n';
          output += response.example;
          output += '\n```\n\n';
        });
      });
    } else {
      // HTML format
      output = `<!DOCTYPE html>
<html>
<head>
  <title>${docs.title} API Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3, h4 { margin-top: 1.5em; }
    .endpoint { border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; overflow: hidden; }
    .endpoint-header { display: flex; padding: 10px; background: #f5f5f5; align-items: center; }
    .method { font-weight: bold; padding: 5px 10px; border-radius: 4px; margin-right: 10px; }
    .get { background: #61affe; color: white; }
    .post { background: #49cc90; color: white; }
    .put { background: #fca130; color: white; }
    .delete { background: #f93e3e; color: white; }
    .path { font-family: monospace; font-size: 1.1em; }
    .endpoint-content { padding: 15px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${docs.title} API Documentation</h1>
  <p><strong>Version:</strong> ${docs.version}</p>
  <p>${docs.description}</p>
  <p><strong>Base URL:</strong> ${docs.baseUrl}</p>
  
  <h2>Endpoints</h2>
  `;
      
      docs.endpoints.forEach(endpoint => {
        const methodClass = endpoint.method.toLowerCase();
        
        output += `
  <div class="endpoint">
    <div class="endpoint-header">
      <span class="method ${methodClass}">${endpoint.method}</span>
      <span class="path">${endpoint.path}</span>
    </div>
    <div class="endpoint-content">
      <p>${endpoint.description}</p>
      `;
        
        if (endpoint.parameters.length > 0) {
          output += `
      <h3>Parameters</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          `;
          
          endpoint.parameters.forEach(param => {
            output += `
          <tr>
            <td>${param.name}</td>
            <td>${param.type}</td>
            <td>${param.required ? 'Yes' : 'No'}</td>
            <td>${param.description}</td>
          </tr>
            `;
          });
          
          output += `
        </tbody>
      </table>
          `;
        }
        
        if (endpoint.requestBody) {
          output += `
      <h3>Request Body</h3>
      <p><strong>Content-Type:</strong> ${endpoint.requestBody.contentType}</p>
      <pre><code>${endpoint.requestBody.example}</code></pre>
          `;
        }
        
        output += `
      <h3>Responses</h3>
        `;
        
        endpoint.responses.forEach(response => {
          output += `
      <h4>${response.status} - ${response.description}</h4>
      <p><strong>Content-Type:</strong> ${response.contentType}</p>
      <pre><code>${response.example}</code></pre>
          `;
        });
        
        output += `
    </div>
  </div>
        `;
      });
      
      output += `
</body>
</html>
      `;
    }

    setGeneratedOutput(output);
  };

  const handleCopy = async () => {
    if (!generatedOutput) return;
    
    await navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedOutput) return;
    
    const extensions = {
      openapi: 'json',
      markdown: 'md',
      html: 'html'
    };
    
    const blob = new Blob([generatedOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-documentation.${extensions[outputFormat]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-600 text-white';
      case 'POST': return 'bg-green-600 text-white';
      case 'PUT': return 'bg-yellow-600 text-white';
      case 'DELETE': return 'bg-red-600 text-white';
      case 'PATCH': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Configuration Panel */}
      <div className="w-1/3 p-4 border-r border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-white">API Documentation</h2>
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <h3 className="font-medium text-white mb-3">Current File</h3>
          {activeFile ? (
            <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-white">{activeFile.name}</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {activeFile.language} • {activeFile.content.split('\n').length} lines
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-400">
              No file selected. Please open a file to generate API documentation.
            </div>
          )}
        </div>

        {/* Output Format */}
        <div className="mb-6">
          <h3 className="font-medium text-white mb-3">Output Format</h3>
          <div className="space-y-2">
            {[
              { id: 'openapi', label: 'OpenAPI 3.0 (JSON)', icon: Code },
              { id: 'markdown', label: 'Markdown', icon: FileText },
              { id: 'html', label: 'HTML', icon: Globe }
            ].map((format) => {
              const FormatIcon = format.icon;
              return (
                <label
                  key={format.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                    outputFormat === format.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={outputFormat === format.id}
                    onChange={() => {
                      setOutputFormat(format.id as any);
                      if (apiDocs) {
                        generateOutput(apiDocs, format.id);
                      }
                    }}
                    className="hidden"
                  />
                  <FormatIcon className="h-5 w-5" />
                  <span>{format.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateDocs}
          disabled={isGenerating || !activeFile || !aiState.apiKeys.openai}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Globe className="h-5 w-5" />
              <span>Generate API Documentation</span>
            </>
          )}
        </button>

        {/* Endpoints List */}
        {apiDocs && (
          <div className="mt-6">
            <h3 className="font-medium text-white mb-3">Endpoints</h3>
            <div className="space-y-2">
              {apiDocs.endpoints.map((endpoint) => (
                <button
                  key={`${endpoint.method}-${endpoint.path}`}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className={`w-full flex items-center p-2 rounded-lg text-left ${
                    selectedEndpoint === endpoint
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className={`px-2 py-1 rounded text-xs mr-2 ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-sm truncate">{endpoint.path}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Documentation Preview */}
      <div className="w-2/3 flex flex-col">
        {apiDocs ? (
          <>
            {/* Endpoint Details */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{apiDocs.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>Version: {apiDocs.version}</span>
                    <span>•</span>
                    <span>Base URL: {apiDocs.baseUrl}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Endpoint Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {selectedEndpoint ? (
                <div className="space-y-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-3 py-1 rounded ${getMethodColor(selectedEndpoint.method)}`}>
                        {selectedEndpoint.method}
                      </span>
                      <span className="font-mono text-white">{selectedEndpoint.path}</span>
                    </div>
                    <p className="text-gray-300">{selectedEndpoint.description}</p>
                  </div>

                  {selectedEndpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="font-medium text-white mb-3">Parameters</h4>
                      <div className="bg-gray-800 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-700">
                              <th className="px-4 py-2 text-left text-gray-300">Name</th>
                              <th className="px-4 py-2 text-left text-gray-300">Type</th>
                              <th className="px-4 py-2 text-left text-gray-300">Required</th>
                              <th className="px-4 py-2 text-left text-gray-300">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEndpoint.parameters.map((param, index) => (
                              <tr key={param.name} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                                <td className="px-4 py-2 font-mono text-blue-400">{param.name}</td>
                                <td className="px-4 py-2 text-gray-300">{param.type}</td>
                                <td className="px-4 py-2 text-gray-300">{param.required ? 'Yes' : 'No'}</td>
                                <td className="px-4 py-2 text-gray-300">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedEndpoint.requestBody && (
                    <div>
                      <h4 className="font-medium text-white mb-3">Request Body</h4>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-2">
                          Content-Type: {selectedEndpoint.requestBody.contentType}
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          Schema: {selectedEndpoint.requestBody.schema}
                        </div>
                        <div className="p-3 bg-gray-900 rounded">
                          <pre className="text-green-400 text-sm font-mono">
                            {selectedEndpoint.requestBody.example}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-white mb-3">Responses</h4>
                    <div className="space-y-4">
                      {selectedEndpoint.responses.map((response) => (
                        <div key={response.status} className="bg-gray-800 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              response.status >= 200 && response.status < 300
                                ? 'bg-green-600 text-white'
                                : response.status >= 400
                                ? 'bg-red-600 text-white'
                                : 'bg-yellow-600 text-white'
                            }`}>
                              {response.status}
                            </span>
                            <span className="text-gray-300">{response.description}</span>
                          </div>
                          
                          <div className="text-sm text-gray-400 mb-2">
                            Content-Type: {response.contentType}
                          </div>
                          
                          <div className="text-sm text-gray-400 mb-2">
                            Schema: {response.schema}
                          </div>
                          
                          <div className="p-3 bg-gray-900 rounded">
                            <pre className="text-blue-400 text-sm font-mono">
                              {response.example}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Endpoint Button */}
                  <div className="flex justify-end">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Test Endpoint</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an endpoint to view details</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Generate API documentation to see a preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}