import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a type for the slice state
interface TestingState {
  selectedResourceId: string | null;
}

// Define the initial state using that type
const initialState: TestingState = {
  selectedResourceId: null,
};

const testingSlice = createSlice({
  name: 'testing',
  initialState,
  reducers: {
    setSelectedResourceId: (state, action: PayloadAction<string | null>) => {
      state.selectedResourceId = action.payload;
    },
  },
});

export const { setSelectedResourceId } = testingSlice.actions;

export default testingSlice.reducer;
