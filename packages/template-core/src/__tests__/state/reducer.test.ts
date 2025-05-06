import { describe, it, expect } from 'vitest';
import { appReducer } from '../../state/reducer';
import { AppState } from '../../state/types';

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

describe('appReducer', () => {
  it('should handle SET_THEME', () => {
    const newState = appReducer(initialState, {
      type: 'SET_THEME',
      payload: 'dark',
    });

    expect(newState.theme).toBe('dark');
  });

  it('should handle SET_CURRENT_WORKSPACE', () => {
    const newState = appReducer(initialState, {
      type: 'SET_CURRENT_WORKSPACE',
      payload: 'workspace1',
    });

    expect(newState.currentWorkspace).toBe('workspace1');
  });

  it('should handle ADD_WORKSPACE', () => {
    const workspace = {
      id: 'workspace1',
      name: 'New Workspace',
      panels: {},
      layout: {
        direction: 'horizontal',
        panels: [],
      },
    };

    const newState = appReducer(initialState, {
      type: 'ADD_WORKSPACE',
      payload: workspace,
    });

    expect(newState.workspaces.workspace1).toEqual(workspace);
  });

  it('should handle UPDATE_WORKSPACE', () => {
    const newState = appReducer(initialState, {
      type: 'UPDATE_WORKSPACE',
      payload: {
        id: 'default',
        workspace: { name: 'Updated Workspace' },
      },
    });

    expect(newState.workspaces.default.name).toBe('Updated Workspace');
  });

  it('should handle ADD_PANEL', () => {
    const panel = {
      id: 'panel1',
      isOpen: true,
      size: 200,
    };

    const newState = appReducer(initialState, {
      type: 'ADD_PANEL',
      payload: panel,
    });

    expect(newState.panels.panel1).toEqual(panel);
  });

  it('should handle UPDATE_PANEL', () => {
    const state = {
      ...initialState,
      panels: {
        panel1: {
          id: 'panel1',
          isOpen: true,
          size: 200,
        },
      },
    };

    const newState = appReducer(state, {
      type: 'UPDATE_PANEL',
      payload: {
        id: 'panel1',
        panel: { size: 300 },
      },
    });

    expect(newState.panels.panel1.size).toBe(300);
  });

  it('should handle REMOVE_PANEL', () => {
    const state = {
      ...initialState,
      panels: {
        panel1: {
          id: 'panel1',
          isOpen: true,
          size: 200,
        },
      },
    };

    const newState = appReducer(state, {
      type: 'REMOVE_PANEL',
      payload: 'panel1',
    });

    expect(newState.panels.panel1).toBeUndefined();
  });

  it('should handle UPDATE_SETTINGS', () => {
    const newState = appReducer(initialState, {
      type: 'UPDATE_SETTINGS',
      payload: {
        persistLayout: false,
      },
    });

    expect(newState.settings.persistLayout).toBe(false);
    expect(newState.settings.persistTheme).toBe(true);
  });

  it('should handle UPDATE_LAYOUT', () => {
    const newLayout = {
      direction: 'vertical' as const,
      panels: ['panel1', 'panel2'],
    };

    const newState = appReducer(initialState, {
      type: 'UPDATE_LAYOUT',
      payload: {
        workspaceId: 'default',
        layout: newLayout,
      },
    });

    expect(newState.workspaces.default.layout).toEqual(newLayout);
  });
});