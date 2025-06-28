import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'suggestion';
}

interface AIState {
  messages: AIMessage[];
  isLoading: boolean;
  provider: 'openai' | 'gemini' | 'claude';
  model: string;
  apiKeys: {
    openai: string;
    gemini: string;
    claude: string;
  };
  suggestions: Array<{
    id: string;
    type: 'completion' | 'refactor' | 'fix';
    content: string;
    confidence: number;
  }>;
  apiKey?: string; // Computed property for the current provider's API key
}

type AIAction =
  | { type: 'ADD_MESSAGE'; payload: AIMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROVIDER'; payload: 'openai' | 'gemini' | 'claude' }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_API_KEY'; payload: { provider: string; key: string } }
  | { type: 'ADD_SUGGESTION'; payload: any }
  | { type: 'CLEAR_SUGGESTIONS' }
  | { type: 'CLEAR_MESSAGES' };

const initialState: AIState = {
  messages: [],
  isLoading: false,
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  apiKeys: {
    openai: localStorage.getItem('openai_key') || '',
    gemini: localStorage.getItem('gemini_key') || '',
    claude: localStorage.getItem('claude_key') || '',
  },
  suggestions: [],
};

function aiReducer(state: AIState, action: AIAction): AIState {
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

    case 'SET_API_KEY':
      const newApiKeys = {
        ...state.apiKeys,
        [action.payload.provider]: action.payload.key
      };
      localStorage.setItem(`${action.payload.provider}_key`, action.payload.key);
      return {
        ...state,
        apiKeys: newApiKeys
      };

    case 'ADD_SUGGESTION':
      return {
        ...state,
        suggestions: [...state.suggestions, action.payload]
      };

    case 'CLEAR_SUGGESTIONS':
      return {
        ...state,
        suggestions: []
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

const AIContext = createContext<{
  state: AIState;
  dispatch: React.Dispatch<AIAction>;
} | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  // Compute the current API key based on the selected provider
  const apiKey = state.apiKeys[state.provider];

  return (
    <AIContext.Provider value={{ 
      state: { ...state, apiKey }, 
      dispatch 
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}