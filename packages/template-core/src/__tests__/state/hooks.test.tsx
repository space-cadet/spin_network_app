import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppStateProvider } from '../../state/context';
import { useTheme, useWorkspace, usePanel, usePanelLayout, useSettings } from '../../state/hooks';

describe('State Hooks', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppStateProvider>{children}</AppStateProvider>
  );

  beforeEach(() => {
    // Clear localStorage mock
    localStorage.clear();
  });

  describe('useTheme', () => {
    it('should return current theme and setter', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const [theme, setTheme] = result.current;
      expect(theme).toBe('light');

      act(() => {
        setTheme('dark');
      });

      expect(result.current[0]).toBe('dark');
    });
  });

  describe('useWorkspace', () => {
    it('should return current workspace and updater', () => {
      const { result } = renderHook(() => useWorkspace(), { wrapper });

      expect(result.current.workspace.name).toBe('Default Workspace');

      act(() => {
        result.current.updateWorkspace({ name: 'Updated Workspace' });
      });

      expect(result.current.workspace.name).toBe('Updated Workspace');
    });

    it('should handle workspace switching', () => {
      const { result } = renderHook(() => useWorkspace(), { wrapper });

      act(() => {
        result.current.setCurrentWorkspace('workspace1');
      });

      expect(result.current.currentWorkspaceId).toBe('workspace1');
    });
  });

  describe('usePanel', () => {
    it('should handle panel operations', () => {
      const { result } = renderHook(() => usePanel('panel1'), { wrapper });

      act(() => {
        result.current.updatePanel({
          isOpen: true,
          size: 200,
        });
      });

      expect(result.current.panel?.isOpen).toBe(true);
      expect(result.current.panel?.size).toBe(200);

      act(() => {
        result.current.removePanel();
      });

      expect(result.current.panel).toBeUndefined();
    });
  });

  describe('usePanelLayout', () => {
    it('should handle layout operations', () => {
      const { result } = renderHook(() => usePanelLayout(), { wrapper });

      act(() => {
        result.current.updateLayout({
          direction: 'vertical',
          panels: ['panel1', 'panel2'],
        });
      });

      expect(result.current.layout.direction).toBe('vertical');
      expect(result.current.layout.panels).toEqual(['panel1', 'panel2']);
    });

    it('should handle adding new panels', () => {
      const { result } = renderHook(() => usePanelLayout(), { wrapper });

      act(() => {
        result.current.addPanel({
          id: 'panel1',
          isOpen: true,
          size: 200,
        });
      });

      expect(result.current.panels.panel1).toBeDefined();
      expect(result.current.layout.panels).toContain('panel1');
    });
  });

  describe('useSettings', () => {
    it('should handle settings updates', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.updateSettings({
          persistLayout: false,
        });
      });

      expect(result.current.settings.persistLayout).toBe(false);
      expect(result.current.settings.persistTheme).toBe(true);
    });
  });
});