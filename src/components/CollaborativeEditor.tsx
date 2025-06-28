import React, { useState, useEffect, useRef } from 'react';
import { Users, Share2, Cursor, MessageCircle, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAgent } from '../context/AgentContext';

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor: { line: number; column: number };
  selection?: { start: { line: number; column: number }; end: { line: number; column: number } };
  isActive: boolean;
  lastSeen: Date;
}

interface CollaborativeSession {
  id: string;
  name: string;
  code: string;
  language: string;
  collaborators: Collaborator[];
  isHost: boolean;
  isConnected: boolean;
}

export function CollaborativeEditor() {
  const { state, dispatch } = useAgent();
  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [showCollaborators, setShowCollaborators] = useState(true);
  const [code, setCode] = useState('// Welcome to collaborative coding!\n// Share this session to code together in real-time\n\nfunction collaborate() {\n  console.log("Coding together!");\n}\n\ncollaborate();');
  const editorRef = useRef<any>(null);

  const activeFile = state.projectFiles.find(f => f.id === state.activeFile);

  useEffect(() => {
    if (activeFile) {
      setCode(activeFile.content);
    }
  }, [activeFile]);

  // Simulate real-time collaboration
  useEffect(() => {
    if (session && isConnected) {
      const interval = setInterval(() => {
        // Simulate collaborator activity
        const mockCollaborators: Collaborator[] = [
          {
            id: '1',
            name: 'Alice Johnson',
            color: '#3b82f6',
            cursor: { line: Math.floor(Math.random() * 20) + 1, column: Math.floor(Math.random() * 50) + 1 },
            isActive: true,
            lastSeen: new Date()
          },
          {
            id: '2',
            name: 'Bob Smith',
            color: '#10b981',
            cursor: { line: Math.floor(Math.random() * 20) + 1, column: Math.floor(Math.random() * 50) + 1 },
            isActive: Math.random() > 0.3,
            lastSeen: new Date(Date.now() - Math.random() * 60000)
          },
          {
            id: '3',
            name: 'Carol Davis',
            color: '#f59e0b',
            cursor: { line: Math.floor(Math.random() * 20) + 1, column: Math.floor(Math.random() * 50) + 1 },
            isActive: Math.random() > 0.5,
            lastSeen: new Date(Date.now() - Math.random() * 120000)
          }
        ];
        setCollaborators(mockCollaborators);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [session, isConnected]);

  const handleStartSession = () => {
    const newSession: CollaborativeSession = {
      id: `session-${Date.now()}`,
      name: `Coding Session - ${new Date().toLocaleTimeString()}`,
      code,
      language: activeFile?.language || 'javascript',
      collaborators: [],
      isHost: true,
      isConnected: true
    };

    setSession(newSession);
    setIsConnected(true);
    setSessionCode(newSession.id);
  };

  const handleJoinSession = () => {
    if (!sessionCode.trim()) return;

    const joinedSession: CollaborativeSession = {
      id: sessionCode,
      name: `Joined Session - ${sessionCode.slice(-6)}`,
      code,
      language: activeFile?.language || 'javascript',
      collaborators: [],
      isHost: false,
      isConnected: true
    };

    setSession(joinedSession);
    setIsConnected(true);
  };

  const handleLeaveSession = () => {
    setSession(null);
    setIsConnected(false);
    setCollaborators([]);
    setSessionCode('');
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    
    if (activeFile) {
      dispatch({
        type: 'UPDATE_PROJECT_FILE',
        payload: { id: activeFile.id, content: newCode }
      });
    }

    // Simulate broadcasting changes to collaborators
    if (session && isConnected) {
      setSession({ ...session, code: newCode });
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Add decorations for collaborator cursors
    if (collaborators.length > 0) {
      const decorations = collaborators
        .filter(c => c.isActive)
        .map(collaborator => ({
          range: new editor.getModel()?.constructor.Range(
            collaborator.cursor.line,
            collaborator.cursor.column,
            collaborator.cursor.line,
            collaborator.cursor.column + 1
          ),
          options: {
            className: 'collaborator-cursor',
            glyphMarginClassName: 'collaborator-glyph',
            stickiness: 1,
            after: {
              content: collaborator.name,
              inlineClassName: 'collaborator-label',
              backgroundColor: collaborator.color
            }
          }
        }));
      
      editor.deltaDecorations([], decorations);
    }
  };

  const copySessionLink = async () => {
    const link = `${window.location.origin}?session=${session?.id}`;
    await navigator.clipboard.writeText(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
      {/* Session Control */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Collaboration</h3>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        </div>

        {!session ? (
          <div className="space-y-4">
            <div>
              <button
                onClick={handleStartSession}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Start New Session</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="Enter session code"
                className="input-field"
              />
              <button
                onClick={handleJoinSession}
                disabled={!sessionCode.trim()}
                className="btn-secondary w-full"
              >
                Join Session
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">
                  {session.isHost ? 'Hosting' : 'Joined'}: {session.name}
                </span>
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <Wifi className="h-4 w-4 text-green-600" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="text-xs text-green-600 font-mono">
                Session: {session.id.slice(-8)}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={copySessionLink}
                className="btn-secondary flex-1 text-sm"
              >
                Copy Link
              </button>
              <button
                onClick={handleLeaveSession}
                className="btn-secondary text-sm text-red-600"
              >
                Leave
              </button>
            </div>
          </div>
        )}

        {/* Collaborators List */}
        {session && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                Collaborators ({collaborators.filter(c => c.isActive).length})
              </h4>
              <button
                onClick={() => setShowCollaborators(!showCollaborators)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showCollaborators ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {showCollaborators && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      collaborator.isActive ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: collaborator.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {collaborator.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {collaborator.isActive ? (
                          `Line ${collaborator.cursor.line}`
                        ) : (
                          `Last seen ${Math.floor((Date.now() - collaborator.lastSeen.getTime()) / 1000)}s ago`
                        )}
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      collaborator.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                ))}
                
                {collaborators.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No other collaborators yet
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collaborative Editor */}
      <div className="lg:col-span-3 card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Cursor className="h-5 w-5 text-gray-600" />
              <span className="font-medium">
                {activeFile?.name || 'Collaborative Editor'}
              </span>
            </div>
            {session && (
              <div className="flex items-center space-x-2">
                {collaborators.filter(c => c.isActive).map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                    style={{ backgroundColor: `${collaborator.color}20`, color: collaborator.color }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: collaborator.color }}
                    ></div>
                    <span>{collaborator.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {session && (
              <span className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            )}
          </div>
        </div>

        <Editor
          height="calc(100% - 73px)"
          language={activeFile?.language || 'javascript'}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            renderLineHighlight: 'all',
            selectionHighlight: true,
            occurrencesHighlight: true,
          }}
        />
      </div>
    </div>
  );
}