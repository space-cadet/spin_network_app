/**
 * Spin Network Library
 * Main entry point that exports all public APIs
 */

// Declare global SpinNetwork type
declare global {
  interface Window {
    SpinNetwork: any;
  }
}

import * as coreModule from './core';
import * as modelsModule from './models';
import * as analysisModule from './analysis';
import * as quantumModule from './quantum';
import * as adaptersModule from './adapters';
import * as utilsModule from './utils';
import * as templatesModule from './templates';
import * as ioModule from './io';

// Export all modules for use in Node/module environments
export * from './core';
export * from './models';
export * from './analysis';
export * as quantum from './quantum';
export * from './adapters';
export * from './utils';
export * from './templates';
export * from './io';

// Import specific types and classes needed for factory functions
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

// Export factory functions
export function createSimulationEngine(): SimulationEngine {
  return new SpinNetworkSimulationEngine();
}

export function createGraph(): SimulationGraph {
  return new SpinNetworkGraph();
}

export function createStateVector(nodeIds: string[]): SimulationStateVector {
  return new SimulationStateVector(nodeIds);
}

// For browser environments, attach to window.SpinNetwork
if (typeof window !== 'undefined') {
  window.SpinNetwork = {
    // Attach all modules
    core: coreModule,
    models: modelsModule,
    analysis: analysisModule,
    quantum: quantumModule,
    adapters: adaptersModule,
    utils: utilsModule,
    templates: templatesModule,
    io: ioModule,
    
    // Attach factory functions
    createSimulationEngine,
    createGraph,
    createStateVector,
    
    // Attach Analysis object
    Analysis,
  };
}