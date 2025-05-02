/**
 * Spin Network Library
 * Main entry point that exports all public APIs
 */

// Core exports
export * from './core';

// Models
export * from './models';

// Analysis tools - this needs to come before other exports
export * from './analysis';

// Adapters (optional, for visualization)
export * from './adapters';

// Utilities
export * from './utils';

// Graph Templates
export * from './templates';

// I/O and Serialization
export * from './io';

// Factory functions for easy instantiation
import { SpinNetworkGraph } from './core/graph';
import { SimulationStateVector } from './core/stateVector';
import { SpinNetworkSimulationEngine } from './core/engineImplementation';
import { 
  SimulationParameters, 
  SimulationEngine, 
  SimulationGraph,
  StateVector 
} from './core/types';
import { GeometricPropertiesCalculator } from './analysis/geometricProps';

// Create shorthand Analysis property
export const Analysis = {
  calculateTotalVolume: (state: StateVector): number => {
    return new GeometricPropertiesCalculator().calculateTotalVolume(state);
  },
  calculateTotalArea: (graph: SimulationGraph): number => {
    return new GeometricPropertiesCalculator().calculateTotalArea(graph);
  },
  calculateEffectiveDimension: (graph: SimulationGraph, state: StateVector): number => {
    return new GeometricPropertiesCalculator().calculateEffectiveDimension(graph, state);
  },
  calculateVolumeEntropy: (state: StateVector): number => {
    return new GeometricPropertiesCalculator().calculateVolumeEntropy(state);
  }
};

// Export the core types and classes
export {
  SpinNetworkGraph,
  SimulationStateVector,
  SpinNetworkSimulationEngine,
  GeometricPropertiesCalculator
};

/**
 * Creates a new simulation engine with default configuration
 * @returns A new simulation engine instance
 */
export function createSimulationEngine(): SimulationEngine {
  return new SpinNetworkSimulationEngine();
}

/**
 * Creates a new spin network graph
 * @returns A new graph instance
 */
export function createGraph(): SimulationGraph {
  return new SpinNetworkGraph();
}

/**
 * Creates a new state vector with the specified node IDs
 * @param nodeIds Array of node IDs in the graph
 * @returns A new state vector instance
 */
export function createStateVector(nodeIds: string[]): SimulationStateVector {
  return new SimulationStateVector(nodeIds);
}

// Import template functionality
import { 
  createGraphTemplate,
  LineGraphOptions,
  RingGraphOptions,
  GridGraphOptions,
  RandomGraphOptions
} from './templates';

/**
 * Creates a line graph with the specified configuration
 * @param options Configuration options for the line graph
 * @returns A new graph with a line structure
 */
export function createLineGraph(options: LineGraphOptions = {}): SimulationGraph {
  return createGraphTemplate('line', createGraph(), options);
}

/**
 * Creates a ring graph with the specified configuration
 * @param options Configuration options for the ring graph
 * @returns A new graph with a ring structure
 */
export function createRingGraph(options: RingGraphOptions = {}): SimulationGraph {
  return createGraphTemplate('ring', createGraph(), options);
}

/**
 * Creates a grid graph with the specified configuration
 * @param options Configuration options for the grid graph
 * @returns A new graph with a grid structure
 */
export function createGridGraph(options: GridGraphOptions = {}): SimulationGraph {
  return createGraphTemplate('grid', createGraph(), options);
}

/**
 * Creates a random graph with the specified configuration
 * @param options Configuration options for the random graph
 * @returns A new graph with a random structure
 */
export function createRandomGraph(options: RandomGraphOptions = {}): SimulationGraph {
  return createGraphTemplate('random', createGraph(), options);
}