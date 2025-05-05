/**
 * Core state vector operations
 */

import { Complex, StateVector } from './types';
import { 
  createComplex, 
  addComplex, 
  multiplyComplex, 
  conjugateComplex,
  modulusComplex,
  isZeroComplex 
} from './complex';

/**
 * Creates a quantum state vector of given dimension
 */
export function createState(dimension: number): StateVector {
  if (dimension < 1) {
    throw new Error('Dimension must be positive');
  }
  return {
    dimension,
    amplitudes: Array(dimension).fill(null).map(() => createComplex(0, 0))
  };
}

/**
 * Sets amplitude at specified index in state vector
 */
export function setState(state: StateVector, index: number, value: Complex): void {
  if (index < 0 || index >= state.dimension) {
    throw new Error(`Index ${index} out of bounds for dimension ${state.dimension}`);
  }
  state.amplitudes[index] = { ...value };
}

/**
 * Gets amplitude at specified index from state vector
 */
export function getState(state: StateVector, index: number): Complex {
  if (index < 0 || index >= state.dimension) {
    throw new Error(`Index ${index} out of bounds for dimension ${state.dimension}`);
  }
  return { ...state.amplitudes[index] };
}

/**
 * Calculates inner product ⟨ψ|φ⟩ between two state vectors
 */
export function innerProduct(state1: StateVector, state2: StateVector): Complex {
  if (state1.dimension !== state2.dimension) {
    throw new Error('States must have same dimension for inner product');
  }

  let result = createComplex(0, 0);
  for (let i = 0; i < state1.dimension; i++) {
    const conj = conjugateComplex(state1.amplitudes[i]);  // Take complex conjugate of first state
    const prod = multiplyComplex(conj, state2.amplitudes[i]); // Multiply by second state
    result = addComplex(result, prod); // Add to running sum
  }
  return result;
}

/**
 * Calculates norm of state vector
 */
export function norm(state: StateVector): number {
  const normSquared = modulusComplex(innerProduct(state, state));
  return Math.sqrt(normSquared);
}

/**
 * Normalizes state vector to unit norm
 */
export function normalize(state: StateVector): StateVector {
  const currentNorm = norm(state);
  if (isZeroComplex({ re: currentNorm, im: 0 })) {
    throw new Error('Cannot normalize zero state vector');
  }

  const normalized = createState(state.dimension);
  for (let i = 0; i < state.dimension; i++) {
    normalized.amplitudes[i] = {
      re: state.amplitudes[i].re / currentNorm,
      im: state.amplitudes[i].im / currentNorm
    };
  }
  return normalized;
}

/**
 * Computes tensor product of two state vectors
 */
export function tensorProduct(state1: StateVector, state2: StateVector): StateVector {
  const newDimension = state1.dimension * state2.dimension;
  const result = createState(newDimension);

  for (let i = 0; i < state1.dimension; i++) {
    for (let j = 0; j < state2.dimension; j++) {
      const index = i * state2.dimension + j;
      result.amplitudes[index] = multiplyComplex(
        state1.amplitudes[i],
        state2.amplitudes[j]
      );
    }
  }
  return result;
}

/**
 * Returns an array of basis states for a Hilbert space of given dimension
 */
export function getBasis(dimension: number): StateVector[] {
  const basis: StateVector[] = [];
  for (let i = 0; i < dimension; i++) {
    const state = createState(dimension);
    setState(state, i, createComplex(1, 0));
    basis.push(state);
  }
  return basis;
}
