import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface EditorFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
}

interface EditorState {
  files: EditorFile[];
  activeFileId: string | null;
  theme: string;
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  tabSize: number;
}

type EditorAction =
  | { type: 'OPEN_FILE'; payload: EditorFile }
  | { type: 'CLOSE_FILE'; payload: string }
  | { type: 'SET_ACTIVE_FILE'; payload: string }
  | { type: 'UPDATE_FILE_CONTENT'; payload: { id: string; content: string } }
  | { type: 'SAVE_FILE'; payload: string }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'TOGGLE_WORD_WRAP' }
  | { type: 'TOGGLE_MINIMAP' }
  | { type: 'TOGGLE_LINE_NUMBERS' }
  | { type: 'TOGGLE_AUTO_SAVE' }
  | { type: 'SET_TAB_SIZE'; payload: number };

const initialState: EditorState = {
  files: [],
  activeFileId: null,
  theme: 'vs-dark',
  fontSize: 14,
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
  autoSave: true,
  tabSize: 2,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'OPEN_FILE':
      const existingFile = state.files.find(f => f.path === action.payload.path);
      if (existingFile) {
        return {
          ...state,
          activeFileId: existingFile.id,
          files: state.files.map(f => ({ ...f, isActive: f.id === existingFile.id }))
        };
      }
      return {
        ...state,
        files: [
          ...state.files.map(f => ({ ...f, isActive: false })),
          { ...action.payload, isActive: true }
        ],
        activeFileId: action.payload.id
      };

    case 'CLOSE_FILE':
      const remainingFiles = state.files.filter(f => f.id !== action.payload);
      const wasActive = state.activeFileId === action.payload;
      let newActiveId = state.activeFileId;
      
      if (wasActive && remainingFiles.length > 0) {
        newActiveId = remainingFiles[remainingFiles.length - 1].id;
      } else if (wasActive) {
        newActiveId = null;
      }

      return {
        ...state,
        files: remainingFiles.map(f => ({ 
          ...f, 
          isActive: f.id === newActiveId 
        })),
        activeFileId: newActiveId
      };

    case 'SET_ACTIVE_FILE':
      return {
        ...state,
        files: state.files.map(f => ({ ...f, isActive: f.id === action.payload })),
        activeFileId: action.payload
      };

    case 'UPDATE_FILE_CONTENT':
      return {
        ...state,
        files: state.files.map(f =>
          f.id === action.payload.id
            ? { ...f, content: action.payload.content, isDirty: true }
            : f
        )
      };

    case 'SAVE_FILE':
      return {
        ...state,
        files: state.files.map(f =>
          f.id === action.payload ? { ...f, isDirty: false } : f
        )
      };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };

    case 'TOGGLE_WORD_WRAP':
      return { ...state, wordWrap: !state.wordWrap };

    case 'TOGGLE_MINIMAP':
      return { ...state, minimap: !state.minimap };

    case 'TOGGLE_LINE_NUMBERS':
      return { ...state, lineNumbers: !state.lineNumbers };

    case 'TOGGLE_AUTO_SAVE':
      return { ...state, autoSave: !state.autoSave };

    case 'SET_TAB_SIZE':
      return { ...state, tabSize: action.payload };

    default:
      return state;
  }
}

const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
} | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}