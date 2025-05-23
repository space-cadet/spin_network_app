/**
 * Core type definitions for quantum operations
 */

import { Complex } from 'mathjs';

// Direct export of math.js Complex type
export type { Complex } from 'mathjs';

/**
 * Represents a quantum state vector
 */
export interface IStateVector {
  dimension: number;      // Hilbert space dimension
  amplitudes: Complex[];  // State vector amplitudes in computational basis
  basis?: string;        // Optional basis label

  // State manipulation
  setState(index: number, value: Complex): void;
  getState(index: number): Complex;

  // Quantum operations
  innerProduct(other: IStateVector): Complex;
  norm(): number;
  normalize(): IStateVector;
  tensorProduct(other: IStateVector): IStateVector;

  // Utility methods
  isZero(tolerance?: number): boolean;
  toArray(): Complex[];
  toString(): string;
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
  apply(state: IStateVector): IStateVector;  // Apply operator to state
  compose(other: Operator): Operator;      // Compose with another operator  
  adjoint(): Operator;                     // Hermitian conjugate
  toMatrix(): Complex[][];                 // Matrix representation
  tensorProduct(other: Operator): Operator; // Tensor product with another operator
  partialTrace(dims: number[], traceOutIndices: number[]): Operator; // Partial trace over subsystems
  
  // Added operations
  scale(scalar: Complex): Operator;        // Scale operator by complex number
  add(other: Operator): Operator;          // Add two operators
  eigenDecompose(): { values: Complex[]; vectors: Operator[] };
}

/**
 * Type for measurement outcomes
 */
export interface MeasurementOutcome {
  value: number;          // Measured eigenvalue
  state: IStateVector;     // Post-measurement state
  probability: number;    // Measurement probability
}

/**
 * Interface for density matrix operations
 */
export interface DensityMatrix extends Operator {
  trace(): Complex;                                    // Calculate trace
  partialTrace(subsystemDimensions: number[]): DensityMatrix;  // Partial trace
  purity(): number;                                    // Calculate purity
  vonNeumannEntropy(): number;                        // Calculate entropy
}

/**
 * Interface for quantum channels
 */
export interface QuantumChannel {
  apply(state: DensityMatrix): DensityMatrix;         // Apply channel to state
}
