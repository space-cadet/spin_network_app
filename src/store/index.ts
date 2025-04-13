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

import localforage from 'localforage';

import networkReducer from './slices/networkSlice';
import uiReducer from './slices/uiSlice';
import recentNetworksReducer from './slices/recentNetworksSlice';
import typeReducer from './slices/typeSlice';
import simulationReducer from './slices/simulationSlice';
import logsReducer from './slices/logsSlice';
import typeUsageMiddleware from './middleware/typeUsageMiddleware';
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
  version: 2, // Updated to latest migration version
  storage: localforage,
  migrate: migrationFunction,
  // We can blacklist any reducers we don't want to persist
  blacklist: ['ui', 'recentNetworks', 'types', 'simulation'] // We handle these with their own persist configs
};

// Configure UI persist options (selective persistence)
const uiPersistConfig = {
  key: 'ui',
  version: 2, // Updated to latest migration version
  storage: localforage,
  migrate: migrationFunction,
  // Persist UI settings, sidebar visibility, sidebar sizes, and collapsed sections
  whitelist: ['viewSettings', 'sidebarVisibility', 'sidebarSizes', 'collapsedSections']
};

// Configure recent networks persist options
const recentNetworksPersistConfig = {
  key: 'recentNetworks',
  version: 2, // Updated to latest migration version
  storage: localforage,
  migrate: migrationFunction,
};

// Configure types persist options
const typesPersistConfig = {
  key: 'types',
  version: 2, // Updated to latest migration version
  storage: localforage,
  migrate: migrationFunction,
};

// Configure simulation persist options
const simulationPersistConfig = {
  key: 'simulation',
  version: 1, // Initial version
  storage: localforage,
  migrate: migrationFunction,
  // Only persist parameters and recent results, not runtime state
  whitelist: ['parameters', 'geometricData', 'statisticsData', 'conservationData']
};

// Create persisted reducers
const persistedNetworkReducer = persistReducer(persistConfig, networkReducer);
const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);
const persistedRecentNetworksReducer = persistReducer(recentNetworksPersistConfig, recentNetworksReducer);
const persistedTypeReducer = persistReducer(typesPersistConfig, typeReducer);
const persistedSimulationReducer = persistReducer(simulationPersistConfig, simulationReducer);

// Configure logs persist options
const logsPersistConfig = {
  key: 'logs',
  version: 1, // Initial version
  storage: localforage,
  migrate: migrationFunction,
  // Only persist query options and not the log data itself
  whitelist: ['queryOptions']
};

// Create persisted reducers
const persistedLogsReducer = persistReducer(logsPersistConfig, logsReducer);

/**
 * Configure the Redux store with persisted reducers
 */
const store = configureStore({
  reducer: {
    network: persistedNetworkReducer,
    ui: persistedUiReducer,
    recentNetworks: persistedRecentNetworksReducer,
    types: persistedTypeReducer,
    simulation: persistedSimulationReducer,
    logs: persistedLogsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions for serializable check to avoid warnings
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(typeUsageMiddleware),
});

// Create the persistor
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export both as named exports and default
export { store };
export default store;