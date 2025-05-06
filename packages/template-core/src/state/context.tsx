import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, AppAction } from './types';
import { appReducer } from './reducer';

const initialState: AppState = {
  theme: 'light',
  currentWorkspace: 'default',
  workspaces: {
    default: {
      id: 'default',
      name: 'Default Workspace',
      panels: {},
      layout: {
        direction: 'horizontal',
        panels: [],
      },
    },
  },
  panels: {},
  settings: {
    persistLayout: true,
    persistTheme: true,
    persistWorkspace: true,
  },
};

interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export interface AppStateProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AppState>;
  storageKey?: string;
}

function loadState(key: string): Partial<AppState> | undefined {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
}

function saveState(state: AppState, key: string) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

export function AppStateProvider({
  children,
  initialState: providedInitialState,
  storageKey = 'template-core-state',
}: AppStateProviderProps) {
  const [state, dispatch] = useReducer(
    appReducer,
    undefined,
    () => {
      const persistedState = loadState(storageKey);
      return {
        ...initialState,
        ...persistedState,
        ...providedInitialState,
      };
    }
  );

  useEffect(() => {
    const handler = () => {
      if (state.settings.persistLayout || state.settings.persistTheme || state.settings.persistWorkspace) {
        saveState(state, storageKey);
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state, storageKey]);

  // Save state when it changes and persistence is enabled
  useEffect(() => {
    if (state.settings.persistLayout || state.settings.persistTheme || state.settings.persistWorkspace) {
      saveState(state, storageKey);
    }
  }, [state, storageKey]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}