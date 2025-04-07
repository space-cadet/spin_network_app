import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// View settings interface
interface ViewSettings {
  showLabels: boolean;
  showProperties: boolean;
  showNodeLabels: boolean;
  showEdgeLabels: boolean;
  showGrid: boolean;
  nodeSize: 'small' | 'medium' | 'large';
  edgeThickness: 'thin' | 'medium' | 'thick';
}

// Performance settings interface
interface PerformanceSettings {
  renderingQuality: 'low' | 'medium' | 'high';
  animationSmoothness: 'low' | 'medium' | 'high';
  autoSimplify: boolean;
  hardwareAcceleration: boolean;
}

// Define the state structure for UI elements
interface UIState {
  selectedElement: {
    id: string | null;
    type: 'node' | 'edge' | null;
  };
  interactionMode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete';
  viewSettings: ViewSettings;
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
  theme: 'light' | 'dark' | 'system';
  performanceSettings: PerformanceSettings;
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
    showNodeLabels: true,
    showEdgeLabels: false,
    showGrid: false,
    nodeSize: 'medium',
    edgeThickness: 'medium'
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
  theme: 'light',
  performanceSettings: {
    renderingQuality: 'high',
    animationSmoothness: 'medium',
    autoSimplify: true,
    hardwareAcceleration: true
  }
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
    toggleSidebar: (
      state, 
      action: PayloadAction<{ side: keyof UIState['sidebarVisibility'], visible?: boolean }>
    ) => {
      const { side, visible } = action.payload;
      if (visible !== undefined) {
        state.sidebarVisibility[side] = visible;
      } else {
        state.sidebarVisibility[side] = !state.sidebarVisibility[side];
      }
    },
    
    // Set sidebar visibility
    setSidebarVisibility: (
      state, 
      action: PayloadAction<{ side: keyof UIState['sidebarVisibility']; isVisible: boolean }>
    ) => {
      const { side, isVisible } = action.payload;
      state.sidebarVisibility[side] = isVisible;
    },
    
    // Set sidebar size
    setSidebarSize: (
      state,
      action: PayloadAction<{ side: keyof UIState['sidebarSizes']; size: number }>
    ) => {
      const { side, size } = action.payload;
      state.sidebarSizes[side] = size;
    },
    
    // Set theme
    setTheme: (
      state,
      action: PayloadAction<UIState['theme']>
    ) => {
      state.theme = action.payload;
    },
    
    // Set performance settings
    setPerformanceSettings: (
      state,
      action: PayloadAction<Partial<UIState['performanceSettings']>>
    ) => {
      state.performanceSettings = {
        ...state.performanceSettings,
        ...action.payload
      };
    },
    
    // Reset all settings to defaults
    resetAllSettings: (state) => {
      state.viewSettings = initialState.viewSettings;
      state.sidebarVisibility = initialState.sidebarVisibility;
      state.sidebarSizes = initialState.sidebarSizes;
      state.theme = initialState.theme;
      state.performanceSettings = initialState.performanceSettings;
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
  setTheme,
  setPerformanceSettings,
  resetAllSettings,
  clearSelection
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;
