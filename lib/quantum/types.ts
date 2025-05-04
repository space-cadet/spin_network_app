/**
 * Core type definitions for quantum operations
 */

/**
 * Represents a complex number
 */
export interface Complex {
  re: number;  // Real part
  im: number;  // Imaginary part
}

/**
 * Represents a quantum state vector
 */
export interface StateVector {
  dimension: number;      // Hilbert space dimension
  amplitudes: Complex[];  // State vector amplitudes in computational basis
  basis?: string;        // Optional basis label
}

/**
 * Type of quantum operator (unitary, hermitian, etc)
 */
export type OperatorType = 'unitary' | 'hermitian' | 'projection' | 'general';

/**
 * Base interface for quantum operators
 */
export interface Operator {
  dimension: number;      // Hilbert space dimension  
  type: OperatorType;    // Type of operator
  
  // Core operations
  apply(state: StateVector): StateVector;  // Apply operator to state
  compose(other: Operator): Operator;      // Compose with another operator  
  adjoint(): Operator;                     // Hermitian conjugate
  toMatrix(): Complex[][];                 // Matrix representation
}

/**
 * Type for measurement outcomes
 */
export interface MeasurementOutcome {
  value: number;          // Measured eigenvalue
  state: StateVector;     // Post-measurement state
  probability: number;    // Measurement probability
}
