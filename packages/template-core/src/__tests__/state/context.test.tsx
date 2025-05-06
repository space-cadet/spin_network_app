import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { AppStateProvider, useAppState } from '../../state/context';

describe('AppStateProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should provide initial state', () => {
    const TestComponent = () => {
      const { state } = useAppState();
      return <div data-testid="theme">{state.theme}</div>;
    };

    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    expect(getByTestId('theme')).toHaveTextContent('light');
  });

  it('should accept and merge provided initial state', () => {
    const TestComponent = () => {
      const { state } = useAppState();
      return <div data-testid="theme">{state.theme}</div>;
    };

    const { getByTestId } = render(
      <AppStateProvider initialState={{ theme: 'dark' }}>
        <TestComponent />
      </AppStateProvider>
    );

    expect(getByTestId('theme')).toHaveTextContent('dark');
  });

  it('should persist state to localStorage', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    const TestComponent = () => {
      const { state, dispatch } = useAppState();
      return (
        <>
          <div data-testid="theme">{state.theme}</div>
          <button
            onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}
            data-testid="button"
          >
            Toggle Theme
          </button>
        </>
      );
    };

    const { getByTestId } = render(
      <AppStateProvider storageKey="test-storage">
        <TestComponent />
      </AppStateProvider>
    );

    // Initial state
    expect(getByTestId('theme')).toHaveTextContent('light');

    // Update state
    act(() => {
      getByTestId('button').click();
    });

    // Verify state updated
    expect(getByTestId('theme')).toHaveTextContent('dark');

    // Wait for persistence effect to run
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Verify local storage was updated
    expect(setItemSpy).toHaveBeenCalledWith('test-storage', expect.any(String));
    const savedState = JSON.parse(setItemSpy.mock.lastCall![1]);
    expect(savedState).toHaveProperty('theme', 'dark');
  });

  it('should load persisted state from localStorage', () => {
    const persistedState = {
      theme: 'dark',
      currentWorkspace: 'test',
      workspaces: {
        test: {
          id: 'test',
          name: 'Test Workspace',
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

    localStorage.setItem('test-storage', JSON.stringify(persistedState));

    const TestComponent = () => {
      const { state } = useAppState();
      return (
        <>
          <div data-testid="theme">{state.theme}</div>
          <div data-testid="workspace">{state.currentWorkspace}</div>
        </>
      );
    };

    const { getByTestId } = render(
      <AppStateProvider storageKey="test-storage">
        <TestComponent />
      </AppStateProvider>
    );

    expect(getByTestId('theme')).toHaveTextContent('dark');
    expect(getByTestId('workspace')).toHaveTextContent('test');
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const TestComponent = () => {
      const { state } = useAppState();
      return <div data-testid="theme">{state.theme}</div>;
    };

    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    expect(getByTestId('theme')).toHaveTextContent('light');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should throw error when useAppState is used outside provider', () => {
    const TestComponent = () => {
      useAppState();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useAppState must be used within an AppStateProvider'
    );
  });
});