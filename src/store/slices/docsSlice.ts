import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the slice state
interface DocsState {
  selectedResourceId: string | null;
}

// Define the initial state using that type
const initialState: DocsState = {
  selectedResourceId: null,
};

const docsSlice = createSlice({
  name: 'docs',
  initialState,
  reducers: {
    setSelectedResourceId: (state, action: PayloadAction<string | null>) => {
      state.selectedResourceId = action.payload;
    },
  },
});

export const { setSelectedResourceId } = docsSlice.actions;

export default docsSlice.reducer;
