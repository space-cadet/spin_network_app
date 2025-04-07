import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the state structure for UI elements
interface UIState {
  selectedElement: {
    id: string | null;
    type: 'node' | 'edge' | null;
  };
  interactionMode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete';
  viewSettings: {
    showLabels: boolean;
    showProperties: boolean;
  };
  sidebarVisibility: {
    left: boolean;
    right: boolean;
    bottom: boolean;
  };
  sidebarSizes: {
    left: number;
    right: number;
    bottom: number;
  };
}

// Initial state
const initialState: UIState = {
  selectedElement: {
    id: null,
    type: null,
  },
  interactionMode: 'select',
  viewSettings: {
    showLabels: true,
    showProperties: true,
  },
  sidebarVisibility: {
    left: true,
    right: true,
    bottom: true,
  },
  sidebarSizes: {
    left: 250,    // Default width for left sidebar
    right: 300,   // Default width for right sidebar
    bottom: 200,  // Default height for bottom sidebar
  },
};

/**
 * UI slice for managing UI-related state
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Set the selected element
    setSelectedElement: (
      state,
      action: PayloadAction<{ id: string | null; type: 'node' | 'edge' | null }>
    ) => {
      state.selectedElement = action.payload;
    },
    
    // Change the interaction mode
    setInteractionMode: (state, action: PayloadAction<UIState['interactionMode']>) => {
      state.interactionMode = action.payload;
    },
    
    // Update view settings
    setViewSettings: (state, action: PayloadAction<Partial<UIState['viewSettings']>>) => {
      state.viewSettings = {
        ...state.viewSettings,
        ...action.payload,
      };
    },
    
    // Toggle sidebar visibility
    toggleSidebar: (state, action: PayloadAction<keyof UIState['sidebarVisibility']>) => {
      const sidebar = action.payload;
      state.sidebarVisibility[sidebar] = !state.sidebarVisibility[sidebar];
    },
    
    // Set sidebar visibility
    setSidebarVisibility: (
      state, 
      action: PayloadAction<{ sidebar: keyof UIState['sidebarVisibility']; isVisible: boolean }>
    ) => {
      const { sidebar, isVisible } = action.payload;
      state.sidebarVisibility[sidebar] = isVisible;
    },
    
    // Set sidebar size
    setSidebarSize: (
      state,
      action: PayloadAction<{ sidebar: keyof UIState['sidebarSizes']; size: number }>
    ) => {
      const { sidebar, size } = action.payload;
      state.sidebarSizes[sidebar] = size;
    },
    
    // Clear selection
    clearSelection: (state) => {
      state.selectedElement = {
        id: null,
        type: null,
      };
    },
  },
});

// Export actions
export const { 
  setSelectedElement, 
  setInteractionMode, 
  setViewSettings,
  toggleSidebar,
  setSidebarVisibility,
  setSidebarSize,
  clearSelection
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;
