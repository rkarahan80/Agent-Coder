import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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

interface AgentState {
  messages: Message[];
  isLoading: boolean;
  currentProject: string | null;
  apiKey: string | null;
  model: string;
}

type AgentAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROJECT'; payload: string }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'CLEAR_MESSAGES' };

const initialState: AgentState = {
  messages: [],
  isLoading: false,
  currentProject: null,
  apiKey: localStorage.getItem('openai_api_key'),
  model: 'gpt-4-turbo-preview'
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
      localStorage.setItem('openai_api_key', action.payload);
      return {
        ...state,
        apiKey: action.payload
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

  return (
    <AgentContext.Provider value={{ state, dispatch }}>
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