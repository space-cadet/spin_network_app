import { describe, it, expect } from 'vitest';
import {
  settingsReducer,
  setTheme,
  setLayoutPersistence,
  setThemePersistence,
} from '../slices/settingsSlice';

describe('Settings Slice', () => {
  const initialState = {
    theme: 'light',
    persistLayout: true,
    persistTheme: true,
  };

  describe('theme', () => {
    it('should handle setTheme', () => {
      const state = settingsReducer(initialState, setTheme('dark'));
      expect(state.theme).toBe('dark');
    });

    it('should toggle theme', () => {
      let state = settingsReducer(initialState, setTheme('dark'));
      expect(state.theme).toBe('dark');

      state = settingsReducer(state, setTheme('light'));
      expect(state.theme).toBe('light');
    });
  });

  describe('persistence settings', () => {
    it('should handle setLayoutPersistence', () => {
      const state = settingsReducer(initialState, setLayoutPersistence(false));
      expect(state.persistLayout).toBe(false);
    });

    it('should handle setThemePersistence', () => {
      const state = settingsReducer(initialState, setThemePersistence(false));
      expect(state.persistTheme).toBe(false);
    });

    it('should handle multiple persistence settings', () => {
      let state = initialState;
      state = settingsReducer(state, setLayoutPersistence(false));
      state = settingsReducer(state, setThemePersistence(false));

      expect(state).toEqual({
        theme: 'light',
        persistLayout: false,
        persistTheme: false,
      });
    });
  });

  it('should maintain other state when updating single property', () => {
    let state = settingsReducer(initialState, setTheme('dark'));
    expect(state.persistLayout).toBe(true);
    expect(state.persistTheme).toBe(true);

    state = settingsReducer(state, setLayoutPersistence(false));
    expect(state.theme).toBe('dark');
    expect(state.persistTheme).toBe(true);
  });
});