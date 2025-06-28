import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useAI } from '../context/AIContext';
import { Shield, AlertTriangle, CheckCircle, Search, RefreshCw, Lock, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityVulnerability {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cwe?: string;
  file: string;
  line: number;
  code: string;
  recommendation: string;
  references: string[];
  status: 'open' | 'fixed' | 'ignored';
}

interface SecurityScan {
  id: string;
  timestamp: Date;
  status: 'running' | 'completed' | 'failed';
  vulnerabilities: SecurityVulnerability[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    score: number;
  };
}

export function SecurityScanner() {
  const { state: editorState } = useEditor();
  const { state: aiState } = useAI();
  const [scans, setScans] = useState<SecurityScan[]>([]);
  const [selectedScan, setSelectedScan] = useState<SecurityScan | null>(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState<SecurityVulnerability | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId);

  const startScan = async () => {
    if (!activeFile || !aiState.apiKeys.openai) return;

    setIsScanning(true);

    try {
      // Create a new scan
      const newScan: SecurityScan = {
        id: Date.now().toString(),
        timestamp: new Date(),
        status: 'running',
        vulnerabilities: [],
        summary: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
          score: 0
        }
      };

      setScans([newScan, ...scans]);
      setSelectedScan(newScan);
      setSelectedVulnerability(null);

      // Simulate scanning process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate sample vulnerabilities based on file content
      const vulnerabilities: SecurityVulnerability[] = [];
      
      if (activeFile.content.includes('password') || activeFile.content.includes('auth')) {
        vulnerabilities.push({
          id: '1',
          name: 'Hardcoded Credentials',
          description: 'Credentials should not be hardcoded in source files',
          severity: 'high',
          cwe: 'CWE-798',
          file: activeFile.name,
          line: 15,
          code: 'const password = "admin123";',
          recommendation: 'Use environment variables or a secure vault to store credentials',
          references: ['https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password'],
          status: 'open'
        });
      }

      if (activeFile.content.includes('eval(') || activeFile.content.includes('exec(')) {
        vulnerabilities.push({
          id: '2',
          name: 'Code Injection',
          description: 'Potential code injection vulnerability',
          severity: 'critical',
          cwe: 'CWE-94',
          file: activeFile.name,
          line: 23,
          code: 'eval(userInput);',
          recommendation: 'Avoid using eval() with user input. Use safer alternatives.',
          references: ['https://owasp.org/www-community/attacks/Code_Injection'],
          status: 'open'
        });
      }

      if (activeFile.content.includes('http://')) {
        vulnerabilities.push({
          id: '3',
          name: 'Insecure Protocol',
          description: 'Using HTTP instead of HTTPS',
          severity: 'medium',
          cwe: 'CWE-319',
          file: activeFile.name,
          line: 42,
          code: 'fetch("http://example.com/api");',
          recommendation: 'Use HTTPS for all external communications',
          references: ['https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure'],
          status: 'open'
        });
      }

      // Add some random vulnerabilities
      if (Math.random() > 0.5) {
        vulnerabilities.push({
          id: '4',
          name: 'Cross-Site Scripting (XSS)',
          description: 'Potential XSS vulnerability in user input handling',
          severity: 'high',
          cwe: 'CWE-79',
          file: activeFile.name,
          line: 78,
          code: 'element.innerHTML = userInput;',
          recommendation: 'Use textContent instead of innerHTML or sanitize user input',
          references: ['https://owasp.org/www-community/attacks/xss/'],
          status: 'open'
        });
      }

      if (Math.random() > 0.7) {
        vulnerabilities.push({
          id: '5',
          name: 'Insecure Randomness',
          description: 'Using Math.random() for security-sensitive operations',
          severity: 'medium',
          cwe: 'CWE-338',
          file: activeFile.name,
          line: 92,
          code: 'const token = Math.random().toString(36).substring(2);',
          recommendation: 'Use crypto.getRandomValues() for cryptographic operations',
          references: ['https://owasp.org/www-community/vulnerabilities/Insecure_Randomness'],
          status: 'open'
        });
      }

      // Calculate summary
      const summary = {
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length,
        info: vulnerabilities.filter(v => v.severity === 'info').length,
        score: calculateSecurityScore(vulnerabilities)
      };

      // Update scan with results
      const completedScan: SecurityScan = {
        ...newScan,
        status: 'completed',
        vulnerabilities,
        summary
      };

      setScans(scans => scans.map(s => s.id === newScan.id ? completedScan : s));
      setSelectedScan(completedScan);
    } catch (error) {
      console.error('Security scan failed:', error);
      
      // Update scan with error status
      setScans(scans => scans.map(s => 
        s.id === selectedScan?.id ? { ...s, status: 'failed' } : s
      ));
    } finally {
      setIsScanning(false);
    }
  };

  const calculateSecurityScore = (vulnerabilities: SecurityVulnerability[]): number => {
    const weights = {
      critical: 10,
      high: 5,
      medium: 2,
      low: 1,
      info: 0
    };

    const totalWeight = vulnerabilities.reduce((sum, vuln) => 
      sum + weights[vuln.severity], 0);
    
    // Score from 0-100, higher is better
    return Math.max(0, Math.min(100, 100 - totalWeight * 5));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-100';
      case 'high': return 'text-orange-500 bg-orange-100';
      case 'medium': return 'text-yellow-500 bg-yellow-100';
      case 'low': return 'text-blue-500 bg-blue-100';
      case 'info': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const filteredVulnerabilities = selectedScan?.vulnerabilities.filter(vuln => 
    filterSeverity === 'all' || vuln.severity === filterSeverity
  ) || [];

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Security Scanner</h2>
          </div>
          
          <button
            onClick={startScan}
            disabled={isScanning || !activeFile || !aiState.apiKeys.openai}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Start Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Scan History */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {scans.map((scan) => (
            <button
              key={scan.id}
              onClick={() => {
                setSelectedScan(scan);
                setSelectedVulnerability(null);
              }}
              className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
                selectedScan?.id === scan.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {new Date(scan.timestamp).toLocaleTimeString()}
              {scan.status === 'running' && (
                <RefreshCw className="inline-block h-3 w-3 ml-1 animate-spin" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {selectedScan ? (
        <div className="flex-1 flex">
          {/* Vulnerabilities List */}
          <div className="w-1/2 p-4 border-r border-gray-700 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">
                Vulnerabilities ({filteredVulnerabilities.length})
              </h3>
              
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>

            {/* Summary */}
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">Scan Summary</h4>
                <div className={`text-lg font-bold ${getScoreColor(selectedScan.summary.score)}`}>
                  {selectedScan.summary.score}/100
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-red-500">{selectedScan.summary.critical}</div>
                  <div className="text-xs text-gray-400">Critical</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-500">{selectedScan.summary.high}</div>
                  <div className="text-xs text-gray-400">High</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-500">{selectedScan.summary.medium}</div>
                  <div className="text-xs text-gray-400">Medium</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-500">{selectedScan.summary.low}</div>
                  <div className="text-xs text-gray-400">Low</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-500">{selectedScan.summary.info}</div>
                  <div className="text-xs text-gray-400">Info</div>
                </div>
              </div>
            </div>

            {/* Vulnerabilities */}
            <div className="space-y-3">
              {filteredVulnerabilities.length > 0 ? (
                filteredVulnerabilities.map((vuln) => (
                  <motion.div
                    key={vuln.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedVulnerability?.id === vuln.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                    }`}
                    onClick={() => setSelectedVulnerability(vuln)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          vuln.severity === 'critical' ? 'text-red-500' :
                          vuln.severity === 'high' ? 'text-orange-500' :
                          vuln.severity === 'medium' ? 'text-yellow-500' :
                          vuln.severity === 'low' ? 'text-blue-500' :
                          'text-gray-500'
                        }`} />
                        <h4 className="font-medium text-white">{vuln.name}</h4>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{vuln.file}:{vuln.line}</span>
                      {vuln.cwe && (
                        <span className="text-gray-400">{vuln.cwe}</span>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vulnerabilities found</p>
                </div>
              )}
            </div>
          </div>

          {/* Vulnerability Details */}
          <div className="w-1/2 p-4 overflow-y-auto">
            {selectedVulnerability ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className={`h-5 w-5 ${
                      selectedVulnerability.severity === 'critical' ? 'text-red-500' :
                      selectedVulnerability.severity === 'high' ? 'text-orange-500' :
                      selectedVulnerability.severity === 'medium' ? 'text-yellow-500' :
                      selectedVulnerability.severity === 'low' ? 'text-blue-500' :
                      'text-gray-500'
                    }`} />
                    <h3 className="text-xl font-semibold text-white">{selectedVulnerability.name}</h3>
                  </div>
                  <p className="text-gray-300">{selectedVulnerability.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Vulnerable Code</h4>
                  <div className="p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                      <span>{selectedVulnerability.file}:{selectedVulnerability.line}</span>
                      {selectedVulnerability.cwe && (
                        <a
                          href={`https://cwe.mitre.org/data/definitions/${selectedVulnerability.cwe.split('-')[1]}.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {selectedVulnerability.cwe}
                        </a>
                      )}
                    </div>
                    <pre className="text-sm text-red-400 font-mono">
                      {selectedVulnerability.code}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Recommendation</h4>
                  <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                    <p className="text-green-300">{selectedVulnerability.recommendation}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">References</h4>
                  <div className="space-y-1">
                    {selectedVulnerability.references.map((ref, index) => (
                      <a
                        key={index}
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="text-sm">{ref}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Mark as fixed
                      setSelectedScan(scan => {
                        if (!scan) return null;
                        
                        const updatedVulnerabilities = scan.vulnerabilities.map(v =>
                          v.id === selectedVulnerability.id ? { ...v, status: 'fixed' as const } : v
                        );
                        
                        return {
                          ...scan,
                          vulnerabilities: updatedVulnerabilities
                        };
                      });
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark as Fixed</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Mark as ignored
                      setSelectedScan(scan => {
                        if (!scan) return null;
                        
                        const updatedVulnerabilities = scan.vulnerabilities.map(v =>
                          v.id === selectedVulnerability.id ? { ...v, status: 'ignored' as const } : v
                        );
                        
                        return {
                          ...scan,
                          vulnerabilities: updatedVulnerabilities
                        };
                      });
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Ignore</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a vulnerability to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No security scans available</p>
            <p className="text-sm mt-1">Start a new scan to check for vulnerabilities</p>
          </div>
        </div>
      )}
    </div>
  );
}