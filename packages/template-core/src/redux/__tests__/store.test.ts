import { describe, it, expect } from 'vitest';
import { createStore } from '../store/configureStore';
import { setTheme } from '../slices/settingsSlice';
import { setPanelState } from '../slices/uiSlice';

describe('Redux Store', () => {
  it('should create store with initial state', () => {
    const store = createStore();
    const state = store.getState();

    expect(state.settings.theme).toBe('light');
    expect(state.settings.persistLayout).toBe(true);
    expect(state.settings.persistTheme).toBe(true);
    expect(state.ui.collapsedSections).toEqual({});
    expect(state.ui.panels).toEqual({});
  });

  it('should create store with preloaded state', () => {
    const preloadedState = {
      settings: {
        theme: 'dark',
        persistLayout: false,
        persistTheme: true,
      },
      ui: {
        collapsedSections: { test: true },
        panels: { panel1: { isOpen: true, size: 200 } },
      },
    };

    const store = createStore({ preloadedState });
    const state = store.getState();

    expect(state.settings.theme).toBe('dark');
    expect(state.settings.persistLayout).toBe(false);
    expect(state.ui.collapsedSections).toEqual({ test: true });
    expect(state.ui.panels).toEqual({ panel1: { isOpen: true, size: 200 } });
  });

  it('should handle dispatched actions', () => {
    const store = createStore();

    store.dispatch(setTheme('dark'));
    store.dispatch(setPanelState({ panelId: 'test', isOpen: true, size: 300 }));

    const state = store.getState();
    expect(state.settings.theme).toBe('dark');
    expect(state.ui.panels.test).toEqual({ isOpen: true, size: 300 });
  });

  it('should support custom middleware', () => {
    const actionLog: any[] = [];
    const loggerMiddleware = () => (next: any) => (action: any) => {
      actionLog.push(action);
      return next(action);
    };

    const store = createStore({
      middleware: [loggerMiddleware],
    });

    store.dispatch(setTheme('dark'));
    expect(actionLog).toHaveLength(1);
    expect(actionLog[0].type).toBe('settings/setTheme');
  });
});