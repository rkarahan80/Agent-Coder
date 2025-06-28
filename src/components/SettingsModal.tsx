import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useAI } from '../context/AIContext';
import { X, Settings, Palette, Zap, Key, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { APIKeyManager } from './APIKeyManager';
import { GitHubIntegration } from './GitHubIntegration';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { state: editorState, dispatch: editorDispatch } = useEditor();
  const { state: aiState, dispatch: aiDispatch } = useAI();
  const [activeTab, setActiveTab] = useState<'editor' | 'ai' | 'appearance' | 'github'>('editor');

  const tabs = [
    { id: 'editor' as const, label: 'Editor', icon: Settings },
    { id: 'ai' as const, label: 'AI', icon: Zap },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'github' as const, label: 'GitHub', icon: Github },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-full max-w-4xl h-3/4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900 border-r border-gray-700 p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'editor' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Editor Settings</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Font Size
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="24"
                      value={editorState.fontSize}
                      onChange={(e) => editorDispatch({ 
                        type: 'SET_FONT_SIZE', 
                        payload: parseInt(e.target.value) 
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tab Size
                    </label>
                    <select
                      value={editorState.tabSize}
                      onChange={(e) => editorDispatch({ 
                        type: 'SET_TAB_SIZE', 
                        payload: parseInt(e.target.value) 
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value={2}>2 spaces</option>
                      <option value={4}>4 spaces</option>
                      <option value={8}>8 spaces</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editorState.wordWrap}
                      onChange={() => editorDispatch({ type: 'TOGGLE_WORD_WRAP' })}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                    />
                    <span className="text-gray-300">Word Wrap</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editorState.minimap}
                      onChange={() => editorDispatch({ type: 'TOGGLE_MINIMAP' })}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                    />
                    <span className="text-gray-300">Show Minimap</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editorState.lineNumbers}
                      onChange={() => editorDispatch({ type: 'TOGGLE_LINE_NUMBERS' })}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                    />
                    <span className="text-gray-300">Line Numbers</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editorState.autoSave}
                      onChange={() => editorDispatch({ type: 'TOGGLE_AUTO_SAVE' })}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                    />
                    <span className="text-gray-300">Auto Save</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">AI Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={aiState.provider}
                    onChange={(e) => aiDispatch({ 
                      type: 'SET_PROVIDER', 
                      payload: e.target.value as any 
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="claude">Anthropic Claude</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model
                  </label>
                  <select
                    value={aiState.model}
                    onChange={(e) => aiDispatch({ 
                      type: 'SET_MODEL', 
                      payload: e.target.value 
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    {aiState.provider === 'openai' && (
                      <>
                        <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </>
                    )}
                    {aiState.provider === 'gemini' && (
                      <>
                        <option value="gemini-pro">Gemini Pro</option>
                        <option value="gemini-pro-vision">Gemini Pro Vision</option>
                      </>
                    )}
                    {aiState.provider === 'claude' && (
                      <>
                        <option value="claude-3-opus">Claude 3 Opus</option>
                        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                      </>
                    )}
                  </select>
                </div>

                <APIKeyManager />
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Appearance</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={editorState.theme}
                    onChange={(e) => editorDispatch({ 
                      type: 'SET_THEME', 
                      payload: e.target.value 
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="vs-dark">Dark</option>
                    <option value="vs-light">Light</option>
                    <option value="hc-black">High Contrast</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className="p-4 bg-gray-900 border border-gray-600 rounded-lg cursor-pointer hover:border-blue-500"
                    onClick={() => editorDispatch({ type: 'SET_THEME', payload: 'vs-dark' })}
                  >
                    <div className="h-16 bg-gray-800 rounded mb-2"></div>
                    <div className="text-sm text-center text-gray-300">Dark</div>
                  </div>
                  
                  <div 
                    className="p-4 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500"
                    onClick={() => editorDispatch({ type: 'SET_THEME', payload: 'vs-light' })}
                  >
                    <div className="h-16 bg-gray-100 rounded mb-2"></div>
                    <div className="text-sm text-center text-gray-700">Light</div>
                  </div>
                  
                  <div 
                    className="p-4 bg-black border border-gray-600 rounded-lg cursor-pointer hover:border-blue-500"
                    onClick={() => editorDispatch({ type: 'SET_THEME', payload: 'hc-black' })}
                  >
                    <div className="h-16 bg-gray-900 rounded mb-2"></div>
                    <div className="text-sm text-center text-white">High Contrast</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'github' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">GitHub Integration</h3>
                <GitHubIntegration />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}