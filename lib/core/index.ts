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
} from './intertwinerSpace';

export type { IntertwinerBasisState } from './intertwinerSpace';

// Export tensor and state vector utilities
export {
  // Tensor node
  TensorNode,
  createTensorNode,
  setTensorElement,
  getTensorElement,
  createTensorNodeFromBasisState,
  calculateNodeVolume,
  
  // State vector edge
  StateVectorEdge,
  createStateVectorEdge,
  setStateVectorAmplitude,
  getStateVectorAmplitude,
  normalizeStateVector,
  calculateEdgeArea,
  
  // Complex number utilities
  Complex,
  createComplex,
  addComplex,
  multiplyComplex,
  
  // Sparse element type
  SparseElement
} from './tensor';

export type { 
  TensorNode,
  StateVectorEdge,
  Complex,
  SparseElement
} from './tensor';
