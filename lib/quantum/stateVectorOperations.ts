/**
 * State Vector Operations Module
 * 
 * Provides essential operations for quantum state vectors in the
 * context of spin networks, focusing on intertwiner properties.
 */

import { 
  StateVectorEdge, 
  Complex, 
  createComplex, 
  addComplex, 
  multiplyComplex
} from '../core/tensor';

/**
 * Represents a quantum state vector
 */
export interface StateVector {
  dimension: number;           // Dimension (2j+1)
  amplitudes: Complex[];       // State vector amplitudes
}

/**
 * Creates a state vector with given dimension
 */
export function createStateVector(dimension: number): StateVector {
  return {
    dimension,
    amplitudes: Array(dimension).fill(null).map(() => createComplex(0, 0))
  };
}

/**
 * Initializes a state vector to represent a specific |j,m⟩ state
 * where j is the total angular momentum and m is the z-component
 */
export function initializeSpinState(j: number, m: number): StateVector {
  const dimension = Math.floor(2 * j + 1);
  
  // Create zero state vector
  const stateVector = createStateVector(dimension);
  
  // m runs from j, j-1, ..., -j
  // So m = j corresponds to index 0, m = -j to index 2j
  const index = Math.floor(j - m);
  
  if (index < 0 || index >= dimension) {
    throw new Error(`Invalid m value ${m} for spin ${j}`);
  }
  
  // Set the corresponding amplitude to 1
  stateVector.amplitudes[index] = createComplex(1, 0);
  
  return stateVector;
}

/**
 * Converts a StateVectorEdge to a StateVector
 */
export function edgeToStateVector(edge: StateVectorEdge): StateVector {
  return {
    dimension: edge.stateVector.dimension,
    amplitudes: edge.stateVector.amplitudes.map(amp => ({ ...amp }))
  };
}

/**
 * Calculates the inner product ⟨ψ|φ⟩ of two state vectors
 */
export function innerProduct(stateA: StateVector, stateB: StateVector): Complex {
  if (stateA.dimension !== stateB.dimension) {
    throw new Error('State vectors must have the same dimension for inner product');
  }
  
  let result = createComplex(0, 0);
  
  for (let i = 0; i < stateA.dimension; i++) {
    // Conjugate first state vector: ⟨ψ|φ⟩ = ψ*·φ
    const conjugatedA = {
      re: stateA.amplitudes[i].re,
      im: -stateA.amplitudes[i].im
    };
    
    const product = multiplyComplex(conjugatedA, stateB.amplitudes[i]);
    result = addComplex(result, product);
  }
  
  return result;
}

/**
 * Calculates the squared norm ⟨ψ|ψ⟩ of a state vector
 */
export function normSquared(state: StateVector): number {
  let sum = 0;
  
  for (const amplitude of state.amplitudes) {
    sum += amplitude.re * amplitude.re + amplitude.im * amplitude.im;
  }
  
  return sum;
}

/**
 * Normalizes a state vector
 */
export function normalizeStateVector(state: StateVector): StateVector {
  const norm = Math.sqrt(normSquared(state));
  
  if (norm < 1e-10) {
    throw new Error('Cannot normalize state vector with near-zero norm');
  }
  
  const normalized = createStateVector(state.dimension);
  
  for (let i = 0; i < state.dimension; i++) {
    normalized.amplitudes[i] = {
      re: state.amplitudes[i].re / norm,
      im: state.amplitudes[i].im / norm
    };
  }
  
  return normalized;
}

/**
 * Applies a matrix (operator) to a state vector: |ψ'⟩ = O|ψ⟩
 */
export function applyOperator(state: StateVector, operator: Complex[][]): StateVector {
  if (operator.length !== state.dimension) {
    throw new Error('Operator dimensions must match state vector dimension');
  }
  
  const result = createStateVector(state.dimension);
  
  for (let i = 0; i < state.dimension; i++) {
    let sum = createComplex(0, 0);
    
    for (let j = 0; j < state.dimension; j++) {
      const term = multiplyComplex(operator[i][j], state.amplitudes[j]);
      sum = addComplex(sum, term);
    }
    
    result.amplitudes[i] = sum;
  }
  
  return result;
}

/**
 * Creates the spin-j operators in the |j,m⟩ basis
 */
export function createSpinOperators(j: number): {
  Sx: Complex[][],
  Sy: Complex[][],
  Sz: Complex[][]
} {
  const dimension = Math.floor(2 * j + 1);
  
  // Initialize operators with zeros
  const Sx = Array(dimension).fill(null).map(() => 
    Array(dimension).fill(null).map(() => createComplex(0, 0))
  );
  
  const Sy = Array(dimension).fill(null).map(() => 
    Array(dimension).fill(null).map(() => createComplex(0, 0))
  );
  
  const Sz = Array(dimension).fill(null).map(() => 
    Array(dimension).fill(null).map(() => createComplex(0, 0))
  );
  
  // Fill Sz (diagonal)
  for (let i = 0; i < dimension; i++) {
    const m = j - i;  // m value for this index
    Sz[i][i] = createComplex(m, 0);
  }
  
  // Fill Sx and Sy (off-diagonal)
  for (let i = 0; i < dimension - 1; i++) {
    const m = j - i;  // m value for this index
    
    // Coefficients for raising/lowering operators
    const coeff = Math.sqrt(j * (j + 1) - m * (m + 1));
    
    // S+ = Sx + iSy, S- = Sx - iSy
    // Matrix elements: ⟨j,m|S+|j,m-1⟩ = √(j(j+1) - m(m-1))
    // For Sx: ⟨j,m|Sx|j,m±1⟩ = √(j(j+1) - m(m±1))/2
    // For Sy: ⟨j,m|Sy|j,m±1⟩ = ∓i√(j(j+1) - m(m±1))/2
    
    // Sx: upper diagonal
    Sx[i][i+1] = createComplex(coeff/2, 0);
    // Sx: lower diagonal (symmetric)
    Sx[i+1][i] = createComplex(coeff/2, 0);
    
    // Sy: upper diagonal
    Sy[i][i+1] = createComplex(0, -coeff/2);
    // Sy: lower diagonal (anti-symmetric)
    Sy[i+1][i] = createComplex(0, coeff/2);
  }
  
  return { Sx, Sy, Sz };
}

/**
 * Calculates the expectation value ⟨ψ|O|ψ⟩ of an operator
 * with respect to a state vector
 */
export function expectationValue(state: StateVector, operator: Complex[][]): Complex {
  // Apply operator to state: O|ψ⟩
  const operated = applyOperator(state, operator);
  
  // Calculate inner product: ⟨ψ|O|ψ⟩
  return innerProduct(state, operated);
}
