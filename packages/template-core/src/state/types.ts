import { ReactNode } from 'react';

export interface PanelState {
  id: string;
  isOpen: boolean;
  size: number;
  minSize?: number;
  maxSize?: number;
  position?: 'left' | 'right' | 'top' | 'bottom';
  content?: ReactNode;
}

export interface WorkspaceState {
  id: string;
  name: string;
  panels: Record<string, PanelState>;
  layout: {
    direction: 'horizontal' | 'vertical';
    panels: string[]; // panel IDs in order
  };
}

export interface AppState {
  theme: 'light' | 'dark';
  currentWorkspace: string;
  workspaces: Record<string, WorkspaceState>;
  panels: Record<string, PanelState>;
  settings: {
    persistLayout: boolean;
    persistTheme: boolean;
    persistWorkspace: boolean;
  };
}

export type AppAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_CURRENT_WORKSPACE'; payload: string }
  | { type: 'ADD_WORKSPACE'; payload: WorkspaceState }
  | { type: 'UPDATE_WORKSPACE'; payload: { id: string; workspace: Partial<WorkspaceState> } }
  | { type: 'REMOVE_WORKSPACE'; payload: string }
  | { type: 'ADD_PANEL'; payload: PanelState }
  | { type: 'UPDATE_PANEL'; payload: { id: string; panel: Partial<PanelState> } }
  | { type: 'REMOVE_PANEL'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'UPDATE_LAYOUT'; payload: { workspaceId: string; layout: WorkspaceState['layout'] } };