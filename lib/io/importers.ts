/**
 * Importers for simulation data from various formats
 */

import { SimulationEngine, SimulationGraph } from '../core/types';
import { ImportOptions, SerializedSimulation } from './types';
import { deserializeSimulation, deserializeGraph } from './serialization';

/**
 * Default import options
 */
const DEFAULT_IMPORT_OPTIONS: ImportOptions = {
  validate: true,
  validationMode: 'error'
};

/**
 * Import simulation data from a JSON string
 * 
 * @param data JSON string containing serialized simulation data
 * @param engineFactory Factory function to create a new simulation engine
 * @param options Import options
 * @returns Deserialized simulation engine
 */
export function importSimulationFromJSON(
  data: string,
  engineFactory: () => SimulationEngine,
  options: Partial<ImportOptions> = {}
): SimulationEngine {
  const fullOptions: ImportOptions = { ...DEFAULT_IMPORT_OPTIONS, ...options };
  
  try {
    const parsed = JSON.parse(data) as SerializedSimulation;
    
    if (fullOptions.validate) {
      validateSimulationData(parsed, fullOptions.validationMode);
    }
    
    return deserializeSimulation(parsed, engineFactory);
  } catch (error) {
    if (error.message.includes('validation')) {
      throw error; // Re-throw validation errors
    }
    throw new Error(`Failed to import simulation: ${error.message}`);
  }
}

/**
 * Import simulation data from a file object
 * 
 * @param file File object containing serialized simulation data
 * @param engineFactory Factory function to create a new simulation engine
 * @param options Import options
 * @returns Promise resolving to the deserialized simulation engine
 */
export function importSimulationFromFile(
  file: File,
  engineFactory: () => SimulationEngine,
  options: Partial<ImportOptions> = {}
): Promise<SimulationEngine> {
  return new Promise<SimulationEngine>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        const engine = importSimulationFromJSON(data, engineFactory, options);
        resolve(engine);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Import graph data from a JSON string
 * 
 * @param data JSON string containing serialized graph data
 * @param graphFactory Factory function to create a new graph
 * @param options Import options
 * @returns Deserialized graph
 */
export function importGraphFromJSON(
  data: string,
  graphFactory: () => SimulationGraph,
  options: Partial<ImportOptions> = {}
): SimulationGraph {
  const fullOptions: ImportOptions = { ...DEFAULT_IMPORT_OPTIONS, ...options };
  
  try {
    const parsed = JSON.parse(data);
    
    if (fullOptions.validate) {
      validateGraphData(parsed, fullOptions.validationMode);
    }
    
    return deserializeGraph(parsed, graphFactory);
  } catch (error) {
    if (error.message.includes('validation')) {
      throw error; // Re-throw validation errors
    }
    throw new Error(`Failed to import graph: ${error.message}`);
  }
}

/**
 * Import graph data from a file object
 * 
 * @param file File object containing serialized graph data
 * @param graphFactory Factory function to create a new graph
 * @param options Import options
 * @returns Promise resolving to the deserialized graph
 */
export function importGraphFromFile(
  file: File,
  graphFactory: () => SimulationGraph,
  options: Partial<ImportOptions> = {}
): Promise<SimulationGraph> {
  return new Promise<SimulationGraph>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        const graph = importGraphFromJSON(data, graphFactory, options);
        resolve(graph);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Import simulation configuration from a JSON string
 * 
 * @param data JSON string containing serialized configuration data
 * @param options Import options
 * @returns Deserialized configuration object
 */
export function importConfigFromJSON(
  data: string,
  options: Partial<ImportOptions> = {}
): Record<string, any> {
  const fullOptions: ImportOptions = { ...DEFAULT_IMPORT_OPTIONS, ...options };
  
  try {
    const parsed = JSON.parse(data);
    
    if (fullOptions.validate) {
      validateConfigData(parsed, fullOptions.validationMode);
    }
    
    return parsed.parameters || parsed;
  } catch (error) {
    if (error.message.includes('validation')) {
      throw error; // Re-throw validation errors
    }
    throw new Error(`Failed to import configuration: ${error.message}`);
  }
}

/**
 * Import simulation configuration from a file object
 * 
 * @param file File object containing serialized configuration data
 * @param options Import options
 * @returns Promise resolving to the deserialized configuration object
 */
export function importConfigFromFile(
  file: File,
  options: Partial<ImportOptions> = {}
): Promise<Record<string, any>> {
  return new Promise<Record<string, any>>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        const config = importConfigFromJSON(data, options);
        resolve(config);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parse CSV data into simulation results
 * 
 * @param csvData CSV string containing simulation results
 * @returns Object with parsed times and values for each node
 */
export function parseCSVResults(csvData: string): {
  times: number[];
  nodeData: Record<string, number[]>;
  geometricProperties?: Record<string, number[]>;
  statistics?: Record<string, number[]>;
} {
  const lines = csvData.split(/\r?\n/);
  
  // Parse header
  const header = lines[0].split(',');
  const timeIndex = header.findIndex(col => col.trim().toLowerCase() === 'time');
  
  if (timeIndex === -1) {
    throw new Error('Invalid CSV format: missing "time" column');
  }
  
  // Initialize result structure
  const times: number[] = [];
  const nodeData: Record<string, number[]> = {};
  const geometricProperties: Record<string, number[]> = {};
  const statistics: Record<string, number[]> = {};
  
  // Initialize arrays for each column
  for (let i = 0; i < header.length; i++) {
    if (i === timeIndex) continue;
    
    const colName = header[i].trim();
    nodeData[colName] = [];
  }
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    
    // Extract time
    const time = parseFloat(values[timeIndex]);
    if (isNaN(time)) continue;
    times.push(time);
    
    // Extract node values
    for (let j = 0; j < header.length; j++) {
      if (j === timeIndex) continue;
      
      const colName = header[j].trim();
      const value = parseFloat(values[j]);
      
      if (colName in nodeData) {
        nodeData[colName].push(isNaN(value) ? 0 : value);
      }
    }
  }
  
  return { times, nodeData, geometricProperties, statistics };
}

/**
 * Import simulation results from a CSV file
 * 
 * @param file CSV file containing simulation results
 * @returns Promise resolving to parsed simulation results
 */
export function importResultsFromCSVFile(file: File): Promise<{
  times: number[];
  nodeData: Record<string, number[]>;
  geometricProperties?: Record<string, number[]>;
  statistics?: Record<string, number[]>;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const results = parseCSVResults(csvData);
        resolve(results);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Validate serialized simulation data
 * 
 * @param data Data to validate
 * @param mode Validation mode
 * @throws Error if validation fails and mode is 'error'
 */
function validateSimulationData(data: any, mode: 'error' | 'warn' | 'ignore'): void {
  if (mode === 'ignore') return;
  
  const errors: string[] = [];
  
  // Check version
  if (!data.version) {
    errors.push('Missing version field');
  }
  
  // Check exported timestamp
  if (!data.exportedAt) {
    errors.push('Missing exportedAt field');
  }
  
  // Check required sections
  if (!data.graph && !data.parameters && !data.history) {
    errors.push('Missing required sections: at least one of graph, parameters, or history must be present');
  }
  
  // Check history format if present
  if (data.history) {
    if (!Array.isArray(data.history.times)) {
      errors.push('Invalid history format: times should be an array');
    }
    
    if (!Array.isArray(data.history.states)) {
      errors.push('Invalid history format: states should be an array');
    } else if (data.history.states.length > 0) {
      const firstState = data.history.states[0];
      if (!Array.isArray(firstState.nodeIds) || !Array.isArray(firstState.values)) {
        errors.push('Invalid history state format: nodeIds and values should be arrays');
      }
    }
    
    if (data.history.times && data.history.states &&
        data.history.times.length !== data.history.states.length) {
      errors.push('Invalid history format: times and states arrays should have the same length');
    }
  }
  
  // Check graph format if present
  if (data.graph) {
    if (!Array.isArray(data.graph.nodes)) {
      errors.push('Invalid graph format: nodes should be an array');
    }
    
    if (!Array.isArray(data.graph.edges)) {
      errors.push('Invalid graph format: edges should be an array');
    }
  }
  
  // Handle validation errors
  if (errors.length > 0) {
    const errorMessage = `Validation errors:\n${errors.join('\n')}`;
    
    if (mode === 'error') {
      throw new Error(errorMessage);
    } else if (mode === 'warn') {
      console.warn(errorMessage);
    }
  }
}

/**
 * Validate graph data
 * 
 * @param data Data to validate
 * @param mode Validation mode
 * @throws Error if validation fails and mode is 'error'
 */
function validateGraphData(data: any, mode: 'error' | 'warn' | 'ignore'): void {
  if (mode === 'ignore') return;
  
  const errors: string[] = [];
  
  // Check nodes
  if (!Array.isArray(data.nodes)) {
    errors.push('Missing or invalid nodes array');
  } else {
    // Check node format
    for (let i = 0; i < data.nodes.length; i++) {
      const node = data.nodes[i];
      if (!node.id) {
        errors.push(`Node at index ${i} is missing required 'id' field`);
      }
    }
  }
  
  // Check edges
  if (!Array.isArray(data.edges)) {
    errors.push('Missing or invalid edges array');
  } else {
    // Check edge format
    for (let i = 0; i < data.edges.length; i++) {
      const edge = data.edges[i];
      if (!edge.id) {
        errors.push(`Edge at index ${i} is missing required 'id' field`);
      }
      if (!edge.sourceId) {
        errors.push(`Edge at index ${i} is missing required 'sourceId' field`);
      }
      if (!edge.targetId) {
        errors.push(`Edge at index ${i} is missing required 'targetId' field`);
      }
    }
  }
  
  // Handle validation errors
  if (errors.length > 0) {
    const errorMessage = `Graph validation errors:\n${errors.join('\n')}`;
    
    if (mode === 'error') {
      throw new Error(errorMessage);
    } else if (mode === 'warn') {
      console.warn(errorMessage);
    }
  }
}

/**
 * Validate configuration data
 * 
 * @param data Data to validate
 * @param mode Validation mode
 * @throws Error if validation fails and mode is 'error'
 */
function validateConfigData(data: any, mode: 'error' | 'warn' | 'ignore'): void {
  if (mode === 'ignore') return;
  
  const errors: string[] = [];
  
  // Check for parameters
  if (!data.parameters && typeof data !== 'object') {
    errors.push('Missing or invalid parameters object');
  }
  
  // Check required fields if parameters are present
  const params = data.parameters || data;
  
  if (typeof params !== 'object') {
    errors.push('Parameters must be an object');
  } else {
    // Check specific required parameters
    if (params.timeStep === undefined) {
      errors.push('Missing required parameter: timeStep');
    }
    
    if (params.totalTime === undefined) {
      errors.push('Missing required parameter: totalTime');
    }
    
    if (params.diffusionType === undefined) {
      errors.push('Missing required parameter: diffusionType');
    }
  }
  
  // Handle validation errors
  if (errors.length > 0) {
    const errorMessage = `Configuration validation errors:\n${errors.join('\n')}`;
    
    if (mode === 'error') {
      throw new Error(errorMessage);
    } else if (mode === 'warn') {
      console.warn(errorMessage);
    }
  }
}
