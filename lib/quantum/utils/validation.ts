/**
 * Validation utilities for quantum operations
 */

import { Complex } from '../types';
import { isZeroComplex } from '../complex';

/**
 * Validates that a matrix has valid dimensions and shape
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
 * Validates that a dimension value is positive
 */
export function validatePosDim(dimension: number): void {
  if (dimension < 1) {
    throw new Error('Dimension must be positive');
  }
}

/**
 * Validates that an index is within bounds for given dimension
 */
export function validateIdx(index: number, dimension: number): void {
  if (index < 0 || index >= dimension) {
    throw new Error(`Index ${index} out of bounds for dimension ${dimension}`);
  }
}

/**
 * Validates array of complex amplitudes
 */
export function validateAmps(amplitudes: Complex[], dimension: number): void {
  if (amplitudes.length !== dimension) {
    throw new Error('Number of amplitudes must match dimension');
  }
}

/**
 * Validates that amplitudes are normalized (within tolerance)
 */
export function validateNorm(amplitudes: Complex[], tolerance: number = 1e-10): void {
  const normSquared = amplitudes.reduce((sum, amp) => 
    sum + amp.re * amp.re + amp.im * amp.im, 
    0
  );
  
  if (Math.abs(normSquared - 1) > tolerance) {
    throw new Error('State vector must be normalized');
  }
}

/**
 * Validates that two dimensions match
 */
export function validateMatchDims(dim1: number, dim2: number): void {
  if (dim1 !== dim2) {
    throw new Error(`Dimension mismatch: ${dim1} ≠ ${dim2}`);
  }
}