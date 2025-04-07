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
import recentNetworksReducer from './slices/recentNetworksSlice';
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
  blacklist: ['ui', 'recentNetworks'] // We handle these with their own persist configs
};

// Configure UI persist options (selective persistence)
const uiPersistConfig = {
  key: 'ui',
  version: 1,
  storage: localforage,
  migrate: migrationFunction,
  // Persist UI settings, sidebar visibility, sidebar sizes, and collapsed sections
  whitelist: ['viewSettings', 'sidebarVisibility', 'sidebarSizes', 'collapsedSections']
};

// Configure recent networks persist options
const recentNetworksPersistConfig = {
  key: 'recentNetworks',
  version: 1,
  storage: localforage,
  migrate: migrationFunction,
};

// Create persisted reducers
const persistedNetworkReducer = persistReducer(persistConfig, networkReducer);
const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);
const persistedRecentNetworksReducer = persistReducer(recentNetworksPersistConfig, recentNetworksReducer);

/**
 * Configure the Redux store with persisted reducers
 */
const store = configureStore({
  reducer: {
    network: persistedNetworkReducer,
    ui: persistedUiReducer,
    recentNetworks: persistedRecentNetworksReducer,
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

// Export both as named exports and default
export { store };
export default store;
