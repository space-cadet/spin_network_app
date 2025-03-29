import { configureStore } from '@reduxjs/toolkit';
import networkReducer from './slices/networkSlice';
import uiReducer from './slices/uiSlice';

/**
 * Configure the Redux store with all reducers
 */
export const store = configureStore({
  reducer: {
    network: networkReducer,
    ui: uiReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
