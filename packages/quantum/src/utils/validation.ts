/**
 * Core validation utilities for quantum operations.
 * This module provides essential validation functions for quantum state operations,
 * matrix manipulations, and dimensional checks used throughout the quantum library.
 * 
 * @module quantum/utils/validation
 */

import { Complex } from '../core/types';
import * as math from 'mathjs';

/**
 * Validates that a matrix has valid dimensions and shape for quantum operations.
 * Ensures the matrix is square and non-empty, which is required for quantum operators.
 * 
 * @param matrix - Complex matrix to validate
 * @throws {Error} If matrix is empty
 * @throws {Error} If matrix is not square (all rows must have length equal to matrix height)
 * 
 * @example
 * // Valid square matrix
 * const validMatrix = [
 *   [{re: 1, im: 0}, {re: 0, im: 0}],
 *   [{re: 0, im: 0}, {re: 1, im: 0}]
 * ];
 * validateMatDims(validMatrix); // Passes
 * 
 * // Invalid non-square matrix
 * const invalidMatrix = [
 *   [{re: 1, im: 0}],
 *   [{re: 0, im: 0}, {re: 1, im: 0}]
 * ];
 * validateMatDims(invalidMatrix); // Throws Error: "Matrix must be square"
 */
export function validateMatDims(matrix: Complex[][]): void {
  if (!matrix || matrix.length === 0) {
    throw new Error('Empty matrix provided');
  }

  const dim = matrix.length;
  if (!matrix.every(row => row.length === dim)) {
    throw new Error('Matrix must be square');
  }
}

/**
 * Validates that a dimension value is positive and suitable for quantum states.
 * All quantum systems must have positive integer dimensions.
 * 
 * @param dimension - Hilbert space dimension to validate
 * @throws {Error} If dimension is less than 1
 * 
 * @example
 * validatePosDim(2);  // Valid for qubit
 * validatePosDim(3);  // Valid for qutrit
 * validatePosDim(0);  // Throws Error: "Dimension must be positive"
 * validatePosDim(-1); // Throws Error: "Dimension must be positive"
 */
export function validatePosDim(dimension: number): void {
  if (dimension < 1) {
    throw new Error('Dimension must be positive');
  }
}

/**
 * Validates that an index is within bounds for a given dimension.
 * Used for accessing quantum state components and matrix elements.
 * 
 * @param index - The index to validate
 * @param dimension - The dimension of the space
 * @throws {Error} If index is negative or >= dimension
 * 
 * @example
 * // For a qubit (dimension 2)
 * validateIdx(0, 2); // Valid
 * validateIdx(1, 2); // Valid
 * validateIdx(2, 2); // Throws Error: "Index 2 out of bounds for dimension 2"
 * validateIdx(-1, 2); // Throws Error: "Index -1 out of bounds for dimension 2"
 */
export function validateIdx(index: number, dimension: number): void {
  if (index < 0 || index >= dimension) {
    throw new Error(`Index ${index} out of bounds for dimension ${dimension}`);
  }
}

/**
 * Validates an array of complex amplitudes for a quantum state.
 * Ensures the number of amplitudes matches the specified dimension.
 * 
 * @param amplitudes - Array of complex amplitudes
 * @param dimension - Expected dimension of the quantum state
 * @throws {Error} If number of amplitudes doesn't match dimension
 * 
 * @example
 * const qubitState = [
 *   {re: 1/Math.sqrt(2), im: 0},
 *   {re: 1/Math.sqrt(2), im: 0}
 * ];
 * validateAmps(qubitState, 2); // Valid
 * validateAmps(qubitState, 3); // Throws Error: "Number of amplitudes must match dimension"
 */
export function validateAmps(amplitudes: Complex[], dimension: number): void {
  if (amplitudes.length !== dimension) {
    throw new Error('Number of amplitudes must match dimension');
  }
}

/**
 * Validates that quantum state amplitudes are properly normalized.
 * Checks if the sum of amplitude squares equals 1 within specified tolerance.
 * 
 * @param amplitudes - Array of complex amplitudes
 * @param tolerance - Maximum allowed deviation from 1 (default: 1e-10)
 * @throws {Error} If state is not normalized within tolerance
 * 
 * @example
 * // Normalized state
 * const normalizedState = [
 *   {re: 1/Math.sqrt(2), im: 0},
 *   {re: 1/Math.sqrt(2), im: 0}
 * ];
 * validateNorm(normalizedState); // Valid
 * 
 * // Non-normalized state
 * const nonNormalizedState = [
 *   {re: 1, im: 0},
 *   {re: 1, im: 0}
 * ];
 * validateNorm(nonNormalizedState); // Throws Error: "State vector must be normalized"
 */
export function validateNorm(amplitudes: Complex[], tolerance: number = 1e-10): void {
  const normSquared = amplitudes.reduce((sum, amp) => 
    sum + (amp.re * amp.re + amp.im * amp.im),
    0
  );
  
  if (Math.abs(normSquared - 1) > tolerance) {
    throw new Error('State vector must be normalized');
  }
}

/**
 * Validates that two dimensions match for quantum operations.
 * Used when combining or comparing quantum states and operators.
 * 
 * @param dim1 - First dimension to compare
 * @param dim2 - Second dimension to compare
 * @throws {Error} If dimensions don't match
 * 
 * @example
 * // Valid for two qubits
 * validateMatchDims(2, 2); // Valid
 * 
 * // Invalid for operations between qubit and qutrit
 * validateMatchDims(2, 3); // Throws Error: "Dimension mismatch: 2 ≠ 3"
 */
export function validateMatchDims(dim1: number, dim2: number): void {
  if (dim1 !== dim2) {
    throw new Error(`Dimension mismatch: ${dim1} ≠ ${dim2}`);
  }
}