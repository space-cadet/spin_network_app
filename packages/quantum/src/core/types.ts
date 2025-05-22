/**
 * Core type definitions for quantum operations
 */

import { Complex } from 'mathjs';

import * as math from 'mathjs';

// Direct export of math.js Complex type
export type { Complex } from 'mathjs';

import { StateVector } from '../states/stateVector';

/**
 * Helper functions for complex number handling
 */
export function toComplex(value: number | Complex | {re: number, im: number}): Complex {
  if (typeof value === 'number') {
    return math.complex(value, 0);
  }
  if ('re' in value && 'im' in value) {
    return math.complex(value.re, value.im);
  }
  return value as Complex;
}

export function ensureComplex(value: Complex): Complex {
  return toComplex(value);
}

/**
 * Represents a quantum state vector
 */
export interface IStateVector {
  dimension: number;      // Hilbert space dimension
  amplitudes: Complex[];  // State vector amplitudes in computational basis
  basis?: string;        // Optional basis label
  properties?: Record<string, any>;  // Optional properties bag

  // State manipulation
  setState(index: number, value: Complex): void;
  getState(index: number): Complex;
  getAmplitudes(): Complex[];

  // Quantum operations
  innerProduct(other: IStateVector): Complex;
  norm(): number;
  normalize(): IStateVector;
  tensorProduct(other: IStateVector): IStateVector;
  scale(factor: Complex): IStateVector;
  equals(other: IStateVector, tolerance?: number): boolean;
  
  // Utility methods
  isZero(tolerance?: number): boolean;
  toArray(): Complex[];
  toString(): string;
}

/**
 * Type of quantum operator (unitary, hermitian, etc)
 */
export type OperatorType = 'unitary' | 'hermitian' | 'projection' | 'general' | 'Jplus' | 'Jminus' | 'Jz' | 'J2';

/**
 * Base interface for quantum operators
 */
export interface IOperator {
  dimension: number;      // Hilbert space dimension  
  type: OperatorType;    // Type of operator
  
  // Core operations
  apply(state: IStateVector): StateVector;  // Apply operator to state
  compose(other: IOperator): IOperator;      // Compose with another operator  
  adjoint(): IOperator;                     // Hermitian conjugate
  toMatrix(): Complex[][];                 // Matrix representation
  tensorProduct(other: IOperator): IOperator; // Tensor product with another operator
  partialTrace(dims: number[], traceOutIndices: number[]): IOperator; // Partial trace over subsystems
  
  // Added operations
  scale(scalar: Complex): IOperator;        // Scale operator by complex number
  add(other: IOperator): IOperator;          // Add two operators
  eigenDecompose(): { values: Complex[]; vectors: IOperator[] };
  
  // Utility methods
  isZero(tolerance?: number): boolean;      // Test if operator is identically zero
}

/**
 * Type for measurement outcomes
 */
export interface IMeasurementOutcome {
  value: number;          // Measured eigenvalue
  state: IStateVector;     // Post-measurement state
  probability: number;    // Measurement probability
}

/**
 * Interface for density matrix operations
 */
export interface IDensityMatrix extends IOperator {
  trace(): Complex;                                    // Calculate trace
  partialTrace(dims: number[], traceOutIndices: number[]): IDensityMatrix;  // Partial trace
  purity(): number;                                    // Calculate purity
  vonNeumannEntropy(): number;                        // Calculate entropy
}

/**
 * Interface for quantum channels
 */
export interface IQuantumChannel {
  apply(state: IDensityMatrix): IDensityMatrix;         // Apply channel to state
}
