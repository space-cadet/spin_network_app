/**
 * Spin Network Library
 * Main entry point that exports all public APIs
 */

// Core exports
export * from './core';

// Models
export * from './models';

// Analysis tools
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
  SimulationGraph 
} from './core/types';

// Import core tensor functions
import {
  createTensorNode as createCoreTensorNode,
  setTensorElement,
  getTensorElement,
  createTensorNodeFromBasisState,
  calculateNodeVolume,
  createStateVectorEdge,
  setStateVectorAmplitude,
  getStateVectorAmplitude,
  normalizeStateVector,
  calculateEdgeArea,
  createComplex,
  addComplex,
  multiplyComplex
} from './core/tensor';

// Import enhanced tensor functionality
import {
  createTensorNode as createEnhancedTensorNode,
  calculateIntertwinerDimension
} from './tensor';

// Export tensor functions directly - these will be available in UMD as SpinNetwork.[functionName]
export const createTensorNode = createEnhancedTensorNode;
export { 
  setTensorElement,
  getTensorElement,
  createTensorNodeFromBasisState,
  calculateNodeVolume,
  createStateVectorEdge,
  setStateVectorAmplitude,
  getStateVectorAmplitude,
  normalizeStateVector,
  calculateEdgeArea,
  createComplex,
  addComplex,
  multiplyComplex,
  calculateIntertwinerDimension
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