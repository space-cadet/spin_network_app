import { useCallback } from 'react';
import { useAppState } from './context';
import { PanelState, WorkspaceState } from './types';

export function useTheme() {
  const { state, dispatch } = useAppState();

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, [dispatch]);

  return [state.theme, setTheme] as const;
}

export function useWorkspace(workspaceId?: string) {
  const { state, dispatch } = useAppState();
  const workspace = workspaceId || state.currentWorkspace;

  const updateWorkspace = useCallback((updates: Partial<WorkspaceState>) => {
    dispatch({
      type: 'UPDATE_WORKSPACE',
      payload: { id: workspace, workspace: updates },
    });
  }, [dispatch, workspace]);

  const setCurrentWorkspace = useCallback((id: string) => {
    dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: id });
  }, [dispatch]);

  return {
    workspace: state.workspaces[workspace],
    currentWorkspaceId: state.currentWorkspace,
    updateWorkspace,
    setCurrentWorkspace,
  };
}

export function usePanel(panelId: string) {
  const { state, dispatch } = useAppState();

  const updatePanel = useCallback((updates: Partial<PanelState>) => {
    dispatch({
      type: 'UPDATE_PANEL',
      payload: { id: panelId, panel: updates },
    });
  }, [dispatch, panelId]);

  const removePanel = useCallback(() => {
    dispatch({ type: 'REMOVE_PANEL', payload: panelId });
  }, [dispatch, panelId]);

  return {
    panel: state.panels[panelId],
    updatePanel,
    removePanel,
  };
}

export function usePanelLayout() {
  const { state, dispatch } = useAppState();
  const currentWorkspace = state.workspaces[state.currentWorkspace];

  const updateLayout = useCallback((layout: WorkspaceState['layout']) => {
    dispatch({
      type: 'UPDATE_LAYOUT',
      payload: { workspaceId: state.currentWorkspace, layout },
    });
  }, [dispatch, state.currentWorkspace]);

  const addPanel = useCallback((panel: PanelState) => {
    dispatch({ type: 'ADD_PANEL', payload: panel });
    
    // Update the workspace layout to include the new panel
    const currentLayout = currentWorkspace.layout;
    dispatch({
      type: 'UPDATE_LAYOUT',
      payload: {
        workspaceId: state.currentWorkspace,
        layout: {
          ...currentLayout,
          panels: [...currentLayout.panels, panel.id],
        },
      },
    });
  }, [dispatch, state.currentWorkspace, currentWorkspace]);

  return {
    layout: currentWorkspace.layout,
    panels: state.panels,
    updateLayout,
    addPanel,
  };
}

export function useSettings() {
  const { state, dispatch } = useAppState();

  const updateSettings = useCallback((updates: Partial<typeof state.settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  }, [dispatch]);

  return {
    settings: state.settings,
    updateSettings,
  };
}