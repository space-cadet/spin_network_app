import { configureStore } from '@reduxjs/toolkit';
import graphReducer from './graphSlice';

export const store = configureStore({
  reducer: {
    graph: graphReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
