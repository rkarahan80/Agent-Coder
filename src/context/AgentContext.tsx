import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AIProvider } from '../types/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
}

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  lastModified: Date;
}

interface AgentState {
  messages: Message[];
  isLoading: boolean;
  currentProject: string | null;
  projectFiles: ProjectFile[];
  apiKeys: Record<AIProvider, string>;
  provider: AIProvider;
  model: string;
  activeFile: string | null;
}

type AgentAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROJECT'; payload: string }
  | { type: 'SET_API_KEY'; payload: { provider: AIProvider; key: string } }
  | { type: 'SET_PROVIDER'; payload: AIProvider }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'ADD_PROJECT_FILE'; payload: ProjectFile }
  | { type: 'UPDATE_PROJECT_FILE'; payload: { id: string; content: string } }
  | { type: 'DELETE_PROJECT_FILE'; payload: string }
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'LOAD_PROJECT_FILES'; payload: ProjectFile[] };

const getStoredApiKeys = (): Record<AIProvider, string> => {
  return {
    openai: localStorage.getItem('openai_api_key') || '',
    gemini: localStorage.getItem('gemini_api_key') || '',
    claude: localStorage.getItem('claude_api_key') || '',
    deepseek: localStorage.getItem('deepseek_api_key') || ''
  };
};

const initialState: AgentState = {
  messages: [],
  isLoading: false,
  currentProject: null,
  projectFiles: [],
  apiKeys: getStoredApiKeys(),
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  activeFile: null
};

function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_PROJECT':
      return {
        ...state,
        currentProject: action.payload
      };
    case 'SET_API_KEY':
      const newApiKeys = {
        ...state.apiKeys,
        [action.payload.provider]: action.payload.key
      };
      localStorage.setItem(`${action.payload.provider}_api_key`, action.payload.key);
      return {
        ...state,
        apiKeys: newApiKeys
      };
    case 'SET_PROVIDER':
      return {
        ...state,
        provider: action.payload
      };
    case 'SET_MODEL':
      return {
        ...state,
        model: action.payload
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: []
      };
    case 'ADD_PROJECT_FILE':
      return {
        ...state,
        projectFiles: [...state.projectFiles, action.payload]
      };
    case 'UPDATE_PROJECT_FILE':
      return {
        ...state,
        projectFiles: state.projectFiles.map(file =>
          file.id === action.payload.id
            ? { ...file, content: action.payload.content, lastModified: new Date() }
            : file
        )
      };
    case 'DELETE_PROJECT_FILE':
      return {
        ...state,
        projectFiles: state.projectFiles.filter(file => file.id !== action.payload),
        activeFile: state.activeFile === action.payload ? null : state.activeFile
      };
    case 'SET_ACTIVE_FILE':
      return {
        ...state,
        activeFile: action.payload
      };
    case 'LOAD_PROJECT_FILES':
      return {
        ...state,
        projectFiles: action.payload
      };
    default:
      return state;
  }
}

const AgentContext = createContext<{
  state: AgentState;
  dispatch: React.Dispatch<AgentAction>;
} | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  // Computed values
  const apiKey = state.apiKeys[state.provider];

  return (
    <AgentContext.Provider value={{ 
      state: { ...state, apiKey }, 
      dispatch 
    }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}