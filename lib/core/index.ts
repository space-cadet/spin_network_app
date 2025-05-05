/**
 * Core module for the Spin Network simulation library
 */

// Export all types
export * from './types';

// Export implementations
export { SpinNetworkGraph } from '../graph/graph';
export { SimulationStateVector } from '../graph/graphState';
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
} from './intertwinerSpace';

export type { IntertwinerBasisState } from './intertwinerSpace'

// Export tensor and state vector utilities
export {
  // Tensor node
  createTensorNode,
  setTensorElement,
  getTensorElement,
  createTensorNodeFromBasisState,
  calculateNodeVolume,
  
  // State vector edge
  createStateVectorEdge,
  setStateVectorAmplitude,
  getStateVectorAmplitude,
  normalizeStateVector,
  calculateEdgeArea,
  
  // Complex number utilities
  createComplex,
  addComplex,
  multiplyComplex,
  
  // Sparse element type
  // SparseElement
} from './tensor';

export type {
  TensorNode,
  StateVectorEdge,
  Complex,
  SparseElement
 } from './tensor'