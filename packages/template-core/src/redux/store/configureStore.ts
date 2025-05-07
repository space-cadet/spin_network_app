import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { uiReducer } from '../slices/uiSlice';
import { settingsReducer } from '../slices/settingsSlice';
import { RootState } from './types';

export function createStore(options?: {
  preloadedState?: RootState;
  middleware?: any[];
}) {
  return configureStore({
    reducer: {
      ui: uiReducer,
      settings: settingsReducer,
    },
    preloadedState: options?.preloadedState,
    middleware: (getDefault) => 
      options?.middleware 
        ? getDefault().concat(options.middleware)
        : getDefault(),
  });
}

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];