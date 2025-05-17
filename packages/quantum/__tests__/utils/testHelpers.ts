/**
 * Test helpers for quantum module tests
 */

import { Complex, IStateVector } from '../../src/core/types';
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
  return (math.abs(diff).re as number) < tolerance;
}

/**
 * Checks if two state vectors are approximately equal
 */
export function stateVectorApproxEqual(a: IStateVector, b: IStateVector, tolerance: number = 1e-10): boolean {
  if (a.dimension !== b.dimension) return false;
  const aAmps = a.getAmplitudes();
  const bAmps = b.getAmplitudes();
  return aAmps.every((amp, i) => complexApproxEqual(amp, bAmps[i], tolerance));
}

/**
 * Creates a normalized random state vector in given Hilbert space
 */
export function createRandomState(space: HilbertSpace): IStateVector {
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
    basis: 'random',
    setState: (index: number, value: Complex): void => {
      if (index < 0 || index >= space.dimension) throw new Error('Index out of bounds');
      normalizedAmplitudes[index] = value;
    },
    getState: (index: number): Complex => {
      if (index < 0 || index >= space.dimension) throw new Error('Index out of bounds');
      return normalizedAmplitudes[index];
    },
    innerProduct: (other: IStateVector): Complex => {
      if (other.dimension !== space.dimension) throw new Error('Dimension mismatch');
      let result = math.complex(0, 0);
      for (let i = 0; i < space.dimension; i++) {
        const conj = math.conj(normalizedAmplitudes[i]);
        result = math.add(result, math.multiply(conj, other.amplitudes[i])) as Complex;
      }
      return result;
    },
    norm: (): number => {
      const innerProd = math.complex(0, 0);
      for (let i = 0; i < space.dimension; i++) {
        const conj = math.conj(normalizedAmplitudes[i]);
        const amp = normalizedAmplitudes[i];
        innerProd.re += conj.re * amp.re + conj.im * amp.im;
        innerProd.im += conj.re * amp.im - conj.im * amp.re;
      }
      return Math.sqrt(innerProd.re);
    },
    normalize: () => {
      const norm = Math.sqrt(normalizedAmplitudes.reduce((sum, amp) => {
        return sum + math.abs(amp) ** 2;
      }, 0));
      const normalized = normalizedAmplitudes.map(amp => math.divide(amp, math.complex(norm, 0)) as Complex);
      return {
        ...this,
        amplitudes: normalized
      } as IStateVector;
    },
    tensorProduct: (other: IStateVector): IStateVector => {
      const newDimension = space.dimension * other.dimension;
      const newAmplitudes: Complex[] = [];
      for (let i = 0; i < space.dimension; i++) {
        for (let j = 0; j < other.dimension; j++) {
          newAmplitudes.push(math.multiply(normalizedAmplitudes[i], other.amplitudes[j]) as Complex);
        }
      }
      return {
        dimension: newDimension,
        amplitudes: newAmplitudes,
        basis: 'tensor',
      } as IStateVector;
    },
    isZero: (tolerance: number = 1e-10): boolean => {
      return normalizedAmplitudes.every(amp => math.abs(amp).re < tolerance);
    },
    toArray: (): Complex[] => {
      return [...normalizedAmplitudes];
    },
    toString: (): string => {
      return normalizedAmplitudes
        .map((amp, i) => {
          if (math.abs(amp).re < 1e-10) return '';
          const sign = i === 0 ? '' : ' + ';
          return `${sign}${amp.toString()}|${i}⟩`;
        })
        .filter(s => s !== '')
        .join('') || '0';
    }
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
    Array(dim).fill(null).map(() => 
      math.complex(Math.random() - 0.5, Math.random() - 0.5)
    )
  );

  // Make Hermitian
  for (let i = 0; i < dim; i++) {
    for (let j = i + 1; j < dim; j++) {
      matrix[j][i] = math.complex(
        matrix[i][j].re,
        -matrix[i][j].im
      );
    }
    // Diagonal elements should be real
    matrix[i][i] = math.complex(matrix[i][i].re, 0);
  }

  return matrix;
}