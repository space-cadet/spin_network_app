import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer, 
  FLUSH, 
  REHYDRATE, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER 
} from 'redux-persist';
import { combineReducers } from 'redux';
import localforage from 'localforage';

import networkReducer from './slices/networkSlice';
import uiReducer from './slices/uiSlice';
import { migrationFunction } from '../utils/migrations';

// Configure localforage
localforage.config({
  name: 'spin-network-app',
  storeName: 'spinNetworkStore',
  description: 'Spin Network App Storage'
});

// Configure persist options
const persistConfig = {
  key: 'root',
  version: 1,
  storage: localforage,
  migrate: migrationFunction,
  // We can blacklist any reducers we don't want to persist
  // blacklist: []
};

// Configure UI persist options (selective persistence)
const uiPersistConfig = {
  key: 'ui',
  version: 1,
  storage: localforage,
  migrate: migrationFunction,
  // Only persist certain UI settings
  whitelist: ['viewSettings']
};

// Create persisted reducers
const persistedNetworkReducer = persistReducer(persistConfig, networkReducer);
const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);

/**
 * Configure the Redux store with persisted reducers
 */
export const store = configureStore({
  reducer: {
    network: persistedNetworkReducer,
    ui: persistedUiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions for serializable check to avoid warnings
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create the persistor
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
