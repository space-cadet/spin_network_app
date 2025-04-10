/**
 * Main entry point for the simulation component
 * 
 * This file exports the public API for the simulation component,
 * allowing it to be easily imported and used by the rest of the application.
 */

// Core types and interfaces
export * from './core/types';
export { SpinNetworkGraph } from './core/graph';
export { SimulationStateVector } from './core/stateVector';
export { MathAdapter } from './core/mathAdapter';

// Import missing classes from time evolution (we'll need to define these)
import { SimulationEngine } from './core/types';

// Simulation engine class (placeholder until implementation is ready)
export class SpinNetworkSimulationEngine implements SimulationEngine {
  initialize(graph: any, parameters: any): void {}
  step(): void {}
  runUntil(time: number): void {}
  runSteps(steps: number): void {}
  pause(): void {}
  resume(): void {}
  reset(): void {}
  getCurrentState(): any { return null; }
  getCurrentTime(): number { return 0; }
  getHistory(): any { return {}; }
  isRunning(): boolean { return false; }
  addEventListener(event: string, callback: Function): void {}
  removeEventListener(event: string, callback: Function): void {}
}

// Diffusion models
export { 
  OrdinaryDiffusionModel, 
  TelegraphDiffusionModel,
  DiffusionModelFactory 
} from './models/diffusionModels';

// Weight functions
export { 
  SpinWeightFunctionFactory, 
  createIntertwinerWeightFunction 
} from './models/weightFunctions';

// Numerical solvers
export {
  EulerSolver,
  MidpointSolver,
  RungeKutta4Solver,
  AdaptiveRKF45Solver,
  SolverFactory
} from './models/solvers';

// Visualization adapters
export { 
  CytoscapeAdapter,
  type CytoscapeVisualizationState
} from './visualization/cytoscapeAdapter';
export { 
  VisualizationAdapterFactory,
  type BaseVisualizationOptions,
  type ColorGradientOptions,
  type SizeMappingOptions
} from './visualization/visualizationTypes';

// Analysis tools
export {
  SpinNetworkGeometryCalculator
} from './analysis/geometricProps';
export {
  ProbabilityConservation,
  TotalOccupancyConservation,
  PositivityConservation,
  ConservationCheckerFactory,
  type ConservationChecker
} from './analysis/conservation';
export {
  SimulationAnalyzer,
  type SimulationStatistics
} from './analysis/statistics';

/**
 * Create a new simulation engine with default configuration
 */
export function createSimulationEngine(): SpinNetworkSimulationEngine {
  return new SpinNetworkSimulationEngine();
}

/**
 * Create a simulation graph from an existing spin network
 */
export function createSimulationGraph(network: any): SpinNetworkGraph {
  return SpinNetworkGraph.fromSpinNetwork(network);
}

/**
 * Default simulation parameters
 */
export const DEFAULT_SIMULATION_PARAMETERS = {
  timeStep: 0.01,
  totalTime: 10.0,
  diffusionType: 'ordinary' as const,
  alpha: 1.0,
  beta: 0.5,
  c: 1.0,
  numericalMethod: 'euler' as const,
  weightFunction: 'spin' as const,
  initialStateType: 'delta' as const,
  initialStateParams: {
    nodeId: '', // Will be set at runtime to the first node
    value: 1.0
  },
  recordHistory: true,
  historyInterval: 10,
  parameters: {}
};
