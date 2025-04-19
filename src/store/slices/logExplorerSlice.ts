import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define literal types for sort fields, directions, and view modes
export type SortField = 'name' | 'size' | 'created' | 'modified';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'content' | 'details';

// Define the state interface
interface LogExplorerState {
  currentPath: string;
  selectedFile: string | null;
  splitPosition: number;
  sortField: SortField;
  sortDirection: SortDirection;
  viewMode: ViewMode;
}

// Define the initial state
const initialState: LogExplorerState = {
  currentPath: '/',
  selectedFile: null,
  splitPosition: 50, // Default split position percentage
  sortField: 'name',
  sortDirection: 'asc',
  viewMode: 'content',
};

// Create the slice
const logExplorerSlice = createSlice({
  name: 'logExplorer',
  initialState,
  reducers: {
    setCurrentPath: (state, action: PayloadAction<string>) => {
      state.currentPath = action.payload;
      // Reset selected file when path changes
      state.selectedFile = null; 
    },
    setSelectedFile: (state, action: PayloadAction<string | null>) => {
      state.selectedFile = action.payload;
    },
    setSplitPosition: (state, action: PayloadAction<number>) => {
      state.splitPosition = action.payload;
    },
    setSortField: (state, action: PayloadAction<SortField>) => {
      // If clicking the same field, toggle direction, otherwise reset direction
      if (state.sortField === action.payload) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = action.payload;
        state.sortDirection = 'asc'; // Default to ascending when changing field
      }
    },
    setSortDirection: (state, action: PayloadAction<SortDirection>) => {
      state.sortDirection = action.payload;
    },
    toggleSortDirection: (state) => {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === 'content' ? 'details' : 'content';
    }
  },
});

// Export actions and reducer
export const {
  setCurrentPath,
  setSelectedFile,
  setSplitPosition,
  setSortField,
  setSortDirection,
  toggleSortDirection,
  setViewMode,
  toggleViewMode,
} = logExplorerSlice.actions;

export default logExplorerSlice.reducer;
