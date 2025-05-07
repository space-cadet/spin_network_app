/**
 * Quantum module for the Spin Network simulation library
 * 
 * Provides quantum mechanical operations for spin network simulations
 */

// Core types
export * from './types';
export { StateVector as StateVectorImpl } from './stateVector';

// Core operations
export * from './complex';
export * from './hilbertSpace';
export * from './states';

// Operators and quantum gates 
export * from './operator';
export * from './gates';

// Fundamental operator algebra
export * from './operatorAlgebra';

// Matrix operations and functions
export * from './matrixOperations';
export * from './matrixFunctions';

// Quantum information theory tools
export * from './information';

// Measurement and mixed states
export * from './measurement';
export * from './densityMatrix';

// Hamiltonian evolution
export * from './hamiltonian';

// Export individual operators
export {
    PauliX,
    PauliY,
    PauliZ,
    Hadamard
} from './gates';

// Export standard states
export {
    createBasisState,
    createPlusState,
    createMinusState,
    createBellState,
    createGHZState,
    createWState
} from './states';

// Export fundamental operator algebra operations
export {
    commutator,
    antiCommutator,
    operatorsCommute,
    uncertaintyProduct
} from './operatorAlgebra';

// Export quantum information tools
export {
    schmidtDecomposition,
    fidelity,
    traceFidelity,
    vonNeumannEntropy,
    entanglementEntropy
} from './information';
