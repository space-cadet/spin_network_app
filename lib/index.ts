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

// Factory functions for easy instantiation
import { SpinNetworkGraph } from './core/graph';
import { SimulationStateVector } from './core/stateVector';
import { SpinNetworkSimulationEngine } from './core/engineImplementation';
import { 
  SimulationParameters, 
  SimulationEngine, 
  SimulationGraph 
} from './core/types';

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
