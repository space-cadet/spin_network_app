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
  clearSelection
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;
