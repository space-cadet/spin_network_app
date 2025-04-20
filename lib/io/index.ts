/**
 * I/O Module
 * 
 * Provides functionality for import/export and storage of simulation data
 */

// Export type definitions
export * from './types';

// Export serialization utilities
export {
  serializeSimulation,
  deserializeSimulation,
  serializeGraph,
  deserializeGraph,
  convertToCSV,
  createDataURL,
  getFileExtension,
} from './serialization';

// Export storage adapters
export {
  MemoryStorageAdapter,
  LocalStorageAdapter,
  IndexedDBAdapter,
  BrowserFSAdapter,
  NodeFSAdapter,
  getBestAvailableStorageAdapter
} from './storageAdapters';
export type { StorageAdapter } from './types';

// Export exporters
export {
  exportSimulation,
  downloadSimulationResults,
  downloadSimulationConfig,
  downloadSimulationGraph,
  downloadSimulationCSV,
  downloadAllSimulationData,
  simulationToCSV,
  createDownloadURL,
  createURLRevoker,
} from './exporters';

// Export importers
export {
  importSimulationFromJSON,
  importSimulationFromFile,
  importGraphFromJSON,
  importGraphFromFile,
  importConfigFromJSON,
  importConfigFromFile,
  parseCSVResults,
  importResultsFromCSVFile,
} from './importers';

// Export SimulationStorage for easier management of simulation data
export { SimulationStorage } from './simulationStorage';
