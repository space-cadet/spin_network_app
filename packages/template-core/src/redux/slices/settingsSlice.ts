import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState } from '../store/types';

const initialState: SettingsState = {
  theme: 'light',
  persistLayout: true,
  persistTheme: true,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLayoutPersistence: (state, action: PayloadAction<boolean>) => {
      state.persistLayout = action.payload;
    },
    setThemePersistence: (state, action: PayloadAction<boolean>) => {
      state.persistTheme = action.payload;
    },
  },
});

export const { setTheme, setLayoutPersistence, setThemePersistence } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;