import { describe, it, expect } from 'vitest';
import { uiReducer, toggleSectionCollapsed, setSectionCollapsed, setPanelState } from '../slices/uiSlice';

describe('UI Slice', () => {
  const initialState = {
    collapsedSections: {},
    panels: {},
  };

  describe('collapsedSections', () => {
    it('should handle toggleSectionCollapsed', () => {
      let state = uiReducer(initialState, toggleSectionCollapsed({ sectionId: 'test' }));
      expect(state.collapsedSections.test).toBe(true);

      state = uiReducer(state, toggleSectionCollapsed({ sectionId: 'test' }));
      expect(state.collapsedSections.test).toBe(false);
    });

    it('should handle setSectionCollapsed', () => {
      const state = uiReducer(
        initialState,
        setSectionCollapsed({ sectionId: 'test', collapsed: true })
      );
      expect(state.collapsedSections.test).toBe(true);
    });

    it('should handle multiple sections', () => {
      let state = initialState;
      state = uiReducer(state, setSectionCollapsed({ sectionId: 'section1', collapsed: true }));
      state = uiReducer(state, setSectionCollapsed({ sectionId: 'section2', collapsed: false }));

      expect(state.collapsedSections).toEqual({
        section1: true,
        section2: false,
      });
    });
  });

  describe('panels', () => {
    it('should handle setPanelState', () => {
      const state = uiReducer(
        initialState,
        setPanelState({ panelId: 'test', isOpen: true, size: 300 })
      );
      expect(state.panels.test).toEqual({ isOpen: true, size: 300 });
    });

    it('should handle partial panel updates', () => {
      let state = uiReducer(
        initialState,
        setPanelState({ panelId: 'test', isOpen: true, size: 300 })
      );

      state = uiReducer(state, setPanelState({ panelId: 'test', size: 400 }));
      expect(state.panels.test).toEqual({ isOpen: true, size: 400 });

      state = uiReducer(state, setPanelState({ panelId: 'test', isOpen: false }));
      expect(state.panels.test).toEqual({ isOpen: false, size: 400 });
    });

    it('should handle multiple panels', () => {
      let state = initialState;
      state = uiReducer(state, setPanelState({ panelId: 'panel1', isOpen: true, size: 200 }));
      state = uiReducer(state, setPanelState({ panelId: 'panel2', isOpen: false, size: 300 }));

      expect(state.panels).toEqual({
        panel1: { isOpen: true, size: 200 },
        panel2: { isOpen: false, size: 300 },
      });
    });
  });
});