/**
 * Tensor Bridge Module
 * 
 * Provides a bridge between the core tensor/state vector implementations
 * and the sandbox UI, maintaining compatibility with the existing API.
 */

import { 
    TensorNode,
    StateVectorEdge,
    createComplex,
    addComplex,
    multiplyComplex,
    createTensorNode,
    createStateVectorEdge,
    setTensorElement as coreTensorSetElement,
    getTensorElement as coreTensorGetElement,
    setStateVectorAmplitude,
    getStateVectorAmplitude,
    normalizeStateVector as coreNormalizeStateVector,
    calculateNodeVolume,
    calculateEdgeArea,
    createTensorNodeFromBasisState
} from '../../lib/core/tensor';

import {
    getOptimizedIntertwinerBasis,
    IntertwinerBasisState
} from '../../lib/core/intertwinerSpace';

import {
    Tensor,
    createTensor,
    setTensorElement,
    getTensorElement,
    tensorNodeToTensor,
    contractTensors,
    tensorNorm,
    normalizeTensor,
    createIntertwinerTensor,
    tensorExpectationValue
} from '../../lib/quantum/tensorOperations';

import {
    StateVector,
    createStateVector,
    initializeSpinState,
    edgeToStateVector,
    normalizeStateVector,
    innerProduct,
    applyOperator,
    createSpinOperators,
    expectationValue
} from '../../lib/quantum/stateVectorOperations';

// Export the API expected by tensor-sandbox.js
const SpinNetwork = {
    // Core types
    TensorNode,
    StateVectorEdge,
    Tensor,
    StateVector,
    
    // Node creation and manipulation
    createTensorNode,
    createTensorNodeFromBasisState,
    calculateNodeVolume,
    
    // Edge creation and manipulation
    createStateVectorEdge,
    setStateVectorAmplitude,
    getStateVectorAmplitude,
    coreNormalizeStateVector,
    calculateEdgeArea,
    
    // Tensor operations
    createTensor,
    setTensorElement,
    getTensorElement,
    tensorNodeToTensor,
    contractTensors,
    tensorNorm,
    normalizeTensor,
    createIntertwinerTensor,
    tensorExpectationValue,
    
    // State vector operations
    createStateVector,
    initializeSpinState,
    edgeToStateVector,
    normalizeStateVector,
    innerProduct,
    applyOperator,
    createSpinOperators,
    expectationValue,
    
    // Intertwiner operations
    getIntertwinerBasis: getOptimizedIntertwinerBasis,
    
    // Complex number utilities
    createComplex,
    complexAdd: addComplex,
    complexMultiply: multiplyComplex,
    
    // Constants
    PI: Math.PI,
    SQRT2: Math.SQRT2
};

// Make available globally for the sandbox
window.SpinNetwork = SpinNetwork;

console.log('Tensor Bridge initialized with quantum operations');
