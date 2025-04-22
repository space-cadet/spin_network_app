// Make available globally for the sandbox
console.log('Tensor Bridge initialized with quantum operations');

// Import the compiled library
import SpinNetworkLib from '../../dist/lib/spin-network.es.js';

// Extract needed functionality from the library
const {
    core: {
        tensor: {
            TensorNode,
            StateVectorEdge,
            createComplex,
            addComplex,
            multiplyComplex,
            createTensorNode,
            createStateVectorEdge,
            setTensorElement: coreTensorSetElement,
            getTensorElement: coreTensorGetElement,
            setStateVectorAmplitude,
            getStateVectorAmplitude,
            normalizeStateVector: coreNormalizeStateVector,
            calculateNodeVolume,
            calculateEdgeArea,
            createTensorNodeFromBasisState
        },
        intertwinerSpace: {
            getOptimizedIntertwinerBasis,
            IntertwinerBasisState
        }
    },
    quantum: {
        tensorOperations: {
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
        },
        stateVectorOperations: {
            StateVector,
            createStateVector,
            initializeSpinState,
            edgeToStateVector,
            normalizeStateVector,
            innerProduct,
            applyOperator,
            createSpinOperators,
            expectationValue
        }
    }
} = SpinNetworkLib;

// Export the API expected by tensor-sandbox.js
const SpinNetwork = {
    // Core types
    TensorNode,
    StateVectorEdge,
    Tensor,
    StateVector,
    
    // Node creation and manipulation
    createTensorNode: (typeof createTensorNode === 'function' ? createTensorNode : createTensorNodeFromBasisState),
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
