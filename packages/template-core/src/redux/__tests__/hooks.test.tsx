import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from '../store/configureStore';
import {
  useCollapsedState,
  usePanelState,
  useTheme,
  usePersistenceSettings,
} from '../hooks';

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createStore({
    preloadedState: {
      ui: {
        collapsedSections: { testSection: true },
        panels: { testPanel: { isOpen: true, size: 200 } },
      },
      settings: {
        theme: 'dark',
        persistLayout: false,
        persistTheme: true,
      },
    },
  });
  return <Provider store={store}>{children}</Provider>;
};

describe('Redux Hooks', () => {
  describe('useCollapsedState', () => {
    it('should return collapsed state for section', () => {
      const { result } = renderHook(() => useCollapsedState('testSection'), {
        wrapper,
      });
      expect(result.current).toBe(true);
    });

    it('should return undefined for non-existent section', () => {
      const { result } = renderHook(() => useCollapsedState('nonExistent'), {
        wrapper,
      });
      expect(result.current).toBeUndefined();
    });
  });

  describe('usePanelState', () => {
    it('should return panel state', () => {
      const { result } = renderHook(() => usePanelState('testPanel'), {
        wrapper,
      });
      expect(result.current).toEqual({ isOpen: true, size: 200 });
    });

    it('should return undefined for non-existent panel', () => {
      const { result } = renderHook(() => usePanelState('nonExistent'), {
        wrapper,
      });
      expect(result.current).toBeUndefined();
    });
  });

  describe('useTheme', () => {
    it('should return current theme', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper,
      });
      expect(result.current).toBe('dark');
    });
  });

  describe('usePersistenceSettings', () => {
    it('should return persistence settings', () => {
      const { result } = renderHook(() => usePersistenceSettings(), {
        wrapper,
      });
      expect(result.current).toEqual({
        persistLayout: false,
        persistTheme: true,
      });
    });
  });
});