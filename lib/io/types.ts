/**
 * Types for I/O and serialization operations
 */

/**
 * Format options for exporting simulation results
 */
export enum ExportFormat {
  /**
   * JavaScript Object Notation
   */
  JSON = 'json',
  
  /**
   * Comma-Separated Values
   */
  CSV = 'csv',
  
  /**
   * JavaScript Object Notation with Line Delimited format
   */
  JSONL = 'jsonl'
}

/**
 * Options for exporting simulation results
 */
export interface ExportOptions {
  /**
   * Format to export the data in
   * @default ExportFormat.JSON
   */
  format?: ExportFormat;
  
  /**
   * Whether to include graph structure in the export
   * @default true
   */
  includeGraph?: boolean;
  
  /**
   * Whether to include simulation parameters in the export
   * @default true
   */
  includeParameters?: boolean;
  
  /**
   * Whether to include simulation state history in the export
   * @default true
   */
  includeHistory?: boolean;
  
  /**
   * Whether to include geometric properties in the export
   * @default true
   */
  includeGeometricProperties?: boolean;
  
  /**
   * Whether to include statistical analysis in the export
   * @default true
   */
  includeStatistics?: boolean;
  
  /**
   * Sampling interval for simulation history
   * If set to a number > 1, will only include every Nth step in the history
   * @default 1
   */
  historyInterval?: number;
  
  /**
   * Maximum number of history states to include
   * If undefined, all history states will be included
   */
  maxHistoryStates?: number;
  
  /**
   * Precision for numerical values (number of decimal places)
   * @default 6
   */
  precision?: number;
}

/**
 * Options for importing simulation data
 */
export interface ImportOptions {
  /**
   * Whether to validate the imported data structure
   * @default true
   */
  validate?: boolean;
  
  /**
   * How to handle validation errors
   * - 'error': throw an error (default)
   * - 'warn': log warning and try to continue
   * - 'ignore': silently ignore errors and load what's possible
   * @default 'error'
   */
  validationMode?: 'error' | 'warn' | 'ignore';
}

/**
 * Serialized simulation data format
 */
export interface SerializedSimulation {
  /**
   * Format version
   */
  version: string;
  
  /**
   * When the data was exported
   */
  exportedAt: string;
  
  /**
   * Simulation parameters
   */
  parameters?: Record<string, any>;
  
  /**
   * Graph structure
   */
  graph?: {
    nodes: Array<any>;
    edges: Array<any>;
  };
  
  /**
   * Simulation history
   */
  history?: {
    times: number[];
    states: Array<{
      nodeIds: string[];
      values: number[];
    }>;
  };
  
  /**
   * Geometric properties at each time step
   */
  geometricProperties?: Array<{
    time: number;
    properties: Record<string, number>;
  }>;
  
  /**
   * Statistical analysis at each time step
   */
  statistics?: Array<{
    time: number;
    statistics: Record<string, number>;
  }>;
  
  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Interface for storage adapters
 */
export interface StorageAdapter {
  /**
   * Save data to storage
   * @param key Storage key
   * @param data Data to save
   * @returns Promise resolving when the save is complete
   */
  save(key: string, data: any): Promise<void>;
  
  /**
   * Load data from storage
   * @param key Storage key
   * @returns Promise resolving with the loaded data, or null if not found
   */
  load<T>(key: string): Promise<T | null>;
  
  /**
   * Check if a key exists in storage
   * @param key Storage key to check
   * @returns Promise resolving with boolean indicating if the key exists
   */
  exists(key: string): Promise<boolean>;
  
  /**
   * Delete data from storage
   * @param key Storage key to delete
   * @returns Promise resolving when the delete is complete
   */
  delete(key: string): Promise<void>;
  
  /**
   * List available keys in storage
   * @param prefix Optional prefix to filter keys
   * @returns Promise resolving with array of keys
   */
  listKeys(prefix?: string): Promise<string[]>;
}
