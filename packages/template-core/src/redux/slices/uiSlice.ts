import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UiState } from '../store/types';

const initialState: UiState = {
  collapsedSections: {},
  panels: {},
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSectionCollapsed: (state, action: PayloadAction<{ sectionId: string }>) => {
      const { sectionId } = action.payload;
      state.collapsedSections[sectionId] = !state.collapsedSections[sectionId];
    },
    setSectionCollapsed: (state, action: PayloadAction<{ 
      sectionId: string;
      collapsed: boolean;
    }>) => {
      const { sectionId, collapsed } = action.payload;
      state.collapsedSections[sectionId] = collapsed;
    },
    setPanelState: (state, action: PayloadAction<{ 
      panelId: string; 
      isOpen?: boolean;
      size?: number;
    }>) => {
      const { panelId, isOpen, size } = action.payload;
      state.panels[panelId] = {
        ...state.panels[panelId],
        ...(isOpen !== undefined ? { isOpen } : {}),
        ...(size !== undefined ? { size } : {}),
      };
    },
  },
});

export const { toggleSectionCollapsed, setSectionCollapsed, setPanelState } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;