/**
 * Test helpers for quantum module tests
 */

import { Complex, StateVector } from '../../types';
import { HilbertSpace } from '../../hilbertSpace';
import { createComplex } from '../../complex';

/**
 * Checks if two complex numbers are approximately equal
 */
export function complexApproxEqual(a: Complex, b: Complex, tolerance: number = 1e-10): boolean {
  return Math.abs(a.re - b.re) < tolerance && Math.abs(a.im - b.im) < tolerance;
}

/**
 * Checks if two state vectors are approximately equal
 */
export function stateVectorApproxEqual(a: StateVector, b: StateVector, tolerance: number = 1e-10): boolean {
  if (a.dimension !== b.dimension) return false;
  return a.amplitudes.every((amp, i) => complexApproxEqual(amp, b.amplitudes[i], tolerance));
}

/**
 * Creates a normalized random state vector in given Hilbert space
 */
export function createRandomState(space: HilbertSpace): StateVector {
  const amplitudes = Array(space.dimension).fill(null).map(() => ({
    re: Math.random() - 0.5,
    im: Math.random() - 0.5
  }));
  
  // Normalize
  const normSquared = amplitudes.reduce((sum, amp) => 
    sum + amp.re * amp.re + amp.im * amp.im, 0);
  const normFactor = Math.sqrt(normSquared);
  
  const normalizedAmplitudes = amplitudes.map(amp => ({
    re: amp.re / normFactor,
    im: amp.im / normFactor
  }));

  return {
    dimension: space.dimension,
    amplitudes: normalizedAmplitudes,
    basis: 'random'
  };
}

/**
 * Creates a random unitary matrix of given dimension
 */
export function createRandomUnitary(dim: number): Complex[][] {
  // Use QR decomposition to generate random unitary matrix
  const realMatrix = Array(dim).fill(null).map(() => 
    Array(dim).fill(null).map(() => Math.random() - 0.5)
  );
  
  // Simple Gram-Schmidt process
  for (let i = 0; i < dim; i++) {
    // Normalize column i
    let norm = Math.sqrt(realMatrix.reduce((sum, row) => 
      sum + row[i] * row[i], 0));
    for (let j = 0; j < dim; j++) {
      realMatrix[j][i] /= norm;
    }
    
    // Make orthogonal to remaining columns
    for (let k = i + 1; k < dim; k++) {
      const dot = realMatrix.reduce((sum, row) => 
        sum + row[i] * row[k], 0);
      for (let j = 0; j < dim; j++) {
        realMatrix[j][k] -= dot * realMatrix[j][i];
      }
    }
  }

  // Convert to complex matrix
  return realMatrix.map(row => 
    row.map(x => createComplex(x, 0))
  );
}

/**
 * Creates random Hermitian matrix of given dimension
 */
export function createRandomHermitian(dim: number): Complex[][] {
  const matrix = Array(dim).fill(null).map(() => 
    Array(dim).fill(null).map(() => ({
      re: Math.random() - 0.5,
      im: Math.random() - 0.5
    }))
  );

  // Make Hermitian
  for (let i = 0; i < dim; i++) {
    for (let j = i + 1; j < dim; j++) {
      matrix[j][i] = {
        re: matrix[i][j].re,
        im: -matrix[i][j].im
      };
    }
    // Diagonal elements should be real
    matrix[i][i].im = 0;
  }

  return matrix;
}