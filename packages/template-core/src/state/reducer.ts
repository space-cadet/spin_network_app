import { AppState, AppAction } from './types';

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'SET_CURRENT_WORKSPACE':
      return {
        ...state,
        currentWorkspace: action.payload,
      };

    case 'ADD_WORKSPACE':
      return {
        ...state,
        workspaces: {
          ...state.workspaces,
          [action.payload.id]: action.payload,
        },
      };

    case 'UPDATE_WORKSPACE': {
      const { id, workspace } = action.payload;
      return {
        ...state,
        workspaces: {
          ...state.workspaces,
          [id]: {
            ...state.workspaces[id],
            ...workspace,
          },
        },
      };
    }

    case 'REMOVE_WORKSPACE': {
      const { [action.payload]: removed, ...remaining } = state.workspaces;
      return {
        ...state,
        workspaces: remaining,
        currentWorkspace:
          state.currentWorkspace === action.payload
            ? Object.keys(remaining)[0] || ''
            : state.currentWorkspace,
      };
    }

    case 'ADD_PANEL':
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.payload.id]: action.payload,
        },
      };

    case 'UPDATE_PANEL': {
      const { id, panel } = action.payload;
      return {
        ...state,
        panels: {
          ...state.panels,
          [id]: {
            ...state.panels[id],
            ...panel,
          },
        },
      };
    }

    case 'REMOVE_PANEL': {
      const { [action.payload]: removed, ...remaining } = state.panels;
      return {
        ...state,
        panels: remaining,
      };
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case 'UPDATE_LAYOUT': {
      const { workspaceId, layout } = action.payload;
      return {
        ...state,
        workspaces: {
          ...state.workspaces,
          [workspaceId]: {
            ...state.workspaces[workspaceId],
            layout,
          },
        },
      };
    }

    default:
      return state;
  }
}