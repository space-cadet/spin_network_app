/**
 * Test helpers for quantum module tests
 */

import { Complex, StateVector } from '../../src/core/types';
import { HilbertSpace } from '../../src/core/hilbertSpace';
import * as math from 'mathjs';

/**
 * Checks if two complex numbers are approximately equal
 */
export function complexApproxEqual(a: Complex, b: Complex, tolerance: number = 1e-10): boolean {
  // Ensure we're working with proper math.js complex numbers
  const ca = typeof a === 'number' ? math.complex(a,  0) : math.complex(a.re,  a.im);
  const cb = typeof b === 'number' ? math.complex(b,  0) : math.complex(b.re,  b.im);
  const diff = math.subtract(ca, cb) as Complex;
  return math.abs(diff) < tolerance;
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
  const normSquared = amplitudes.reduce((sum, amp) => {
    // Convert plain object to math.js Complex if needed
    const complexAmp = math.complex(amp.re,  amp.im);
    // Calculate absolute value squared (|z|²)
    const absSquared = math.add(
      math.multiply(complexAmp.re, complexAmp.re),
      math.multiply(complexAmp.im, complexAmp.im)
    );
    return sum + absSquared;
  }, 0);
  
  const normFactor = Math.sqrt(normSquared);
  
  const normalizedAmplitudes = amplitudes.map(amp => {
    // Convert plain object to math.js Complex
    const complexAmp = math.complex(amp.re,  amp.im);
    // Divide by normalization factor
    return math.divide(complexAmp, normFactor) as Complex;
  });

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
    row.map(x => math.complex(x,  0))
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