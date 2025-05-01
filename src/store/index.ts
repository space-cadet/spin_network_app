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
import logExplorerReducer from './slices/logExplorerSlice';
import docsReducer from './slices/docsSlice'; // Import the docs slice reducer
import testingReducer from './slices/testingSlice'; // Import the testing slice reducer
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

// Configure logs persist options
const logsPersistConfig = {
  key: 'logs',
  version: 1, // Initial version
  storage: localforage,
  migrate: migrationFunction,
  // Only persist query options and not the log data itself
  whitelist: ['queryOptions']
};

// Configure log explorer persist options
const logExplorerPersistConfig = {
  key: 'logExplorer',
  version: 1, // Initial version
  storage: localforage,
  migrate: migrationFunction,
  // Persist UI state for the log explorer
  whitelist: ['currentPath', 'selectedFile', 'splitPosition', 'sortField', 'sortDirection', 'viewMode']
};

// Configure docs persist options
const docsPersistConfig = {
  key: 'docs',
  version: 1, // Initial version
  storage: localforage,
  migrate: migrationFunction,
  // Persist the selected resource ID
  whitelist: ['selectedResourceId']
};

// Configure testing persist options
const testingPersistConfig = {
  key: 'testing',
  version: 1, // Initial version
  storage: localforage,
  migrate: migrationFunction,
  // Persist the selected resource ID
  whitelist: ['selectedResourceId']
};

// Create persisted reducers
const persistedNetworkReducer = persistReducer(persistConfig, networkReducer);
const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);
const persistedRecentNetworksReducer = persistReducer(recentNetworksPersistConfig, recentNetworksReducer);
const persistedTypeReducer = persistReducer(typesPersistConfig, typeReducer);
const persistedSimulationReducer = persistReducer(simulationPersistConfig, simulationReducer);
const persistedLogsReducer = persistReducer(logsPersistConfig, logsReducer);
const persistedLogExplorerReducer = persistReducer(logExplorerPersistConfig, logExplorerReducer);
const persistedDocsReducer = persistReducer(docsPersistConfig, docsReducer);
const persistedTestingReducer = persistReducer(testingPersistConfig, testingReducer);

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
    logExplorer: persistedLogExplorerReducer,
    docs: persistedDocsReducer, // Add the persisted docs reducer
    testing: persistedTestingReducer, // Add the persisted testing reducer
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
