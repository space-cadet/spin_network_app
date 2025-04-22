/**
 * Quantum module for the Spin Network simulation library
 * 
 * Provides tensor and state vector operations for quantum calculations
 */

// Export tensor operations
export {
  createTensor,
  setTensorElement,
  getTensorElement,
  tensorNodeToTensor,
  contractTensors,
  tensorNorm,
  normalizeTensor,
  createIntertwinerTensor,
  tensorExpectationValue
} from './tensorOperations';

export type { Tensor } from './tensorOperations';

// Export state vector operations
export {
  createStateVector,
  initializeSpinState,
  edgeToStateVector,
  innerProduct,
  normSquared,
  normalizeStateVector,
  applyOperator,
  createSpinOperators,
  expectationValue
} from './stateVectorOperations';

export type { StateVector } from './stateVectorOperations';
