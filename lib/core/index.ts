/**
 * Core module for the Spin Network simulation library
 */

// Export all types
export * from './types';

// Export implementations
export { SpinNetworkGraph } from './graph';
export { SimulationStateVector } from './stateVector';
export { MathAdapter } from './mathAdapter';
export { 
  SpinNetworkSimulationEngine,
  SimulationHistoryImpl 
} from './engineImplementation';

// Export intertwiner space utilities
export {
  triangleInequality,
  allowedIntermediateSpins,
  intertwinerDimension,
  getIntertwinerBasis,
  getOptimizedIntertwinerBasis,
  IntertwinerBasisState
} from './intertwinerSpace';
