/**
 * Tests for matrix operations
 */

import {
  multiplyMatrices,
  matrixExponential,
  tensorProduct,
  adjoint,
  addMatrices,
  scaleMatrix,
  isHermitian,
  isUnitary,
  eigenDecomposition
} from '../matrixOperations';
import { Complex } from '../types';
import * as math from 'mathjs';

// Helper to compare complex numbers accounting for -0/0 differences
function complexEqual(a: Complex, b: Complex, tolerance: number = 1e-10): boolean {
  // For zero imaginary parts, treat 0 and -0 as equal
  const imEqual = Math.abs(a.im) < tolerance && Math.abs(b.im) < tolerance
    ? true
    : Math.abs(a.im - b.im) < tolerance;
  
  return Math.abs(a.re - b.re) < tolerance && imEqual;
}

// Helper to create test matrices
function createIdentityMatrix(size: number): Complex[][] {
  return Array(size).fill(null).map((_, i) =>
    Array(size).fill(null).map((_, j) =>
      i === j ? math.complex(1, 0) : math.complex(0, 0)
    )
  );
}

describe('Matrix Operations', () => {
  describe('multiplyMatrices', () => {
    it('multiplies 2x2 matrices correctly', () => {
      const a = createIdentityMatrix(2);
      const b = [
        [math.complex(2, 0), math.complex(0, 0)],
        [math.complex(0, 0), math.complex(2, 0)]
      ];
      
      const result = multiplyMatrices(a, b);
      expect(result[0][0]).toEqual(math.complex(2, 0));
      expect(result[1][1]).toEqual(math.complex(2, 0));
    });

    it('handles complex matrix multiplication', () => {
      const a = [
        [math.complex(0, 1), math.complex(1, 0)],
        [math.complex(1, 0), math.complex(0, -1)]
      ];
      const b = [
        [math.complex(1, 0), math.complex(0, 1)],
        [math.complex(0, -1), math.complex(1, 0)]
      ];
      
      const result = multiplyMatrices(a, b);
      // For [0][0]: (0+i)(1+0i) + (1+0i)(0-i) = i + (-i) = 0
      expect(result[0][0]).toEqual(math.complex(0, 0));
      // For [0][1]: (0+i)(0+i) + (1+0i)(1+0i) = -1 + 1 = 0
      expect(result[0][1]).toEqual(math.complex(0, 0));
      // For [1][0]: (1+0i)(1+0i) + (0-i)(0-i) = 1 + (-1) = 0
      expect(result[1][0]).toEqual(math.complex(0, 0));
      // For [1][1]: (1+0i)(0+i) + (0-i)(1+0i) = i + (-i) = 0 
      expect(result[1][1]).toEqual(math.complex(0, 0));
    });

    it('throws error for invalid dimensions', () => {
      const a = [[math.complex(1, 0)]];
      const b = [[math.complex(1, 0)], [math.complex(1, 0)]];
      expect(() => multiplyMatrices(a, b)).toThrow();
    });
  });

  describe('matrixExponential', () => {
    it('computes exponential of zero matrix', () => {
      const matrix = [
        [math.complex(0, 0), math.complex(0, 0)],
        [math.complex(0, 0), math.complex(0, 0)]
      ];
      
      const result = matrixExponential(matrix);
      expect(result[0][0]).toEqual(math.complex(1, 0));
      expect(result[1][1]).toEqual(math.complex(1, 0));
      expect(result[0][1]).toEqual(math.complex(0, 0));
      expect(result[1][0]).toEqual(math.complex(0, 0));
    });

    it('computes exponential of diagonal matrix', () => {
      const matrix = [
        [math.complex(1, 0), math.complex(0, 0)],
        [math.complex(0, 0), math.complex(1, 0)]
      ];
      
      const result = matrixExponential(matrix);
      expect(Math.abs(result[0][0].re - Math.E)).toBeLessThan(1e-10);
      expect(Math.abs(result[1][1].re - Math.E)).toBeLessThan(1e-10);
    });

    it('throws error for non-square matrix', () => {
      const matrix = [
        [math.complex(1, 0)],
        [math.complex(1, 0)]
      ];
      expect(() => matrixExponential(matrix)).toThrow();
    });
  });

  describe('tensorProduct', () => {
    it('computes tensor product of 2x2 matrices', () => {
      const a = createIdentityMatrix(2);
      const b = [
        [math.complex(2, 0), math.complex(0, 0)],
        [math.complex(0, 0), math.complex(2, 0)]
      ];
      
      const result = tensorProduct(a, b);
      expect(result.length).toBe(4);
      expect(result[0].length).toBe(4);
      expect(result[0][0]).toEqual(math.complex(2, 0));
      expect(result[3][3]).toEqual(math.complex(2, 0));
    });

    it('throws error for invalid dimensions', () => {
      expect(() => tensorProduct([], [])).toThrow();
    });
  });

  describe('adjoint', () => {
    it('computes adjoint of real matrix', () => {
      const matrix = [
        [math.complex(1, 0), math.complex(2, 0)],
        [math.complex(3, 0), math.complex(4, 0)]
      ];
      
      const result = adjoint(matrix);
      expect(complexEqual(result[0][1], math.complex(3, 0))).toBe(true);
      expect(complexEqual(result[1][0], math.complex(2, 0))).toBe(true);
    });

    it('computes adjoint of complex matrix', () => {
      const matrix = [
        [math.complex(1, 1), math.complex(0, 1)],
        [math.complex(1, 0), math.complex(1, -1)]
      ];
      
      const result = adjoint(matrix);
      expect(complexEqual(result[0][0], math.complex(1, -1))).toBe(true);
      expect(complexEqual(result[0][1], math.complex(1, 0))).toBe(true);
      expect(complexEqual(result[1][0], math.complex(0, -1))).toBe(true);
      expect(complexEqual(result[1][1], math.complex(1, 1))).toBe(true);
    });

    it('throws error for invalid matrix', () => {
      expect(() => adjoint([])).toThrow();
    });
  });

  describe('addMatrices', () => {
    it('adds matrices correctly', () => {
      const a = [
        [math.complex(1, 0), math.complex(0, 1)],
        [math.complex(0, -1), math.complex(1, 0)]
      ];
      const b = [
        [math.complex(1, 0), math.complex(0, -1)],
        [math.complex(0, 1), math.complex(1, 0)]
      ];
      
      const result = addMatrices(a, b);
      expect(result[0][0]).toEqual(math.complex(2, 0));
      expect(result[0][1]).toEqual(math.complex(0, 0));
      expect(result[1][0]).toEqual(math.complex(0, 0));
      expect(result[1][1]).toEqual(math.complex(2, 0));
    });

    it('throws error for mismatched dimensions', () => {
      const a = [[math.complex(1, 0)]];
      const b = [[math.complex(1, 0)], [math.complex(1, 0)]];
      expect(() => addMatrices(a, b)).toThrow();
    });
  });

  describe('scaleMatrix', () => {
    it('scales matrix by real number', () => {
      const matrix = [
        [math.complex(1, 0), math.complex(0, 1)],
        [math.complex(1, 0), math.complex(0, -1)]
      ];
      const scalar = math.complex(2, 0);
      
      const result = scaleMatrix(matrix, scalar);
      expect(result[0][0]).toEqual(math.complex(2, 0));
      expect(result[0][1]).toEqual(math.complex(0, 2));
    });

    it('scales matrix by complex number', () => {
      const matrix = [
        [math.complex(1, 0), math.complex(0, 1)],
        [math.complex(1, 0), math.complex(0, -1)]
      ];
      const scalar = math.complex(0, 1);
      
      const result = scaleMatrix(matrix, scalar);
      expect(result[0][0]).toEqual(math.complex(0, 1));
      expect(result[0][1]).toEqual(math.complex(-1, 0));
    });

    it('throws error for invalid matrix', () => {
      expect(() => scaleMatrix([], math.complex(1, 0))).toThrow();
    });
  });

  describe('isHermitian', () => {
    it('identifies Hermitian matrix', () => {
      const matrix = [
        [math.complex(1, 0), math.complex(2, -1)],
        [math.complex(2, 1), math.complex(3, 0)]
      ];
      expect(isHermitian(matrix)).toBe(true);
    });

    it('identifies non-Hermitian matrix', () => {
      const matrix = [
        [math.complex(1, 0), math.complex(2, -1)],
        [math.complex(2, -1), math.complex(3, 0)]
      ];
      expect(isHermitian(matrix)).toBe(false);
    });

    it('handles numerical tolerance', () => {
      const matrix = [
        [math.complex(1, 1e-11), math.complex(1, 0)],
        [math.complex(1, 0), math.complex(1, -1e-11)]
      ];
      expect(isHermitian(matrix, 1e-10)).toBe(true);
      expect(isHermitian(matrix, 1e-12)).toBe(false);
    });
  });

  describe('isUnitary', () => {
    it('identifies unitary matrix', () => {
      const matrix = [
        [math.complex(1/Math.sqrt(2), 0), math.complex(-1/Math.sqrt(2), 0)],
        [math.complex(1/Math.sqrt(2), 0), math.complex(1/Math.sqrt(2), 0)]
      ];
      expect(isUnitary(matrix)).toBe(true);
    });

    it('identifies non-unitary matrix', () => {
      const matrix = [
        [math.complex(1, 0), math.complex(1, 0)],
        [math.complex(1, 0), math.complex(1, 0)]
      ];
      expect(isUnitary(matrix)).toBe(false);
    });

    it('handles numerical tolerance', () => {
      const matrix = [
        [math.complex(1 + 1e-11, 0), math.complex(0, 0)],
        [math.complex(0, 0), math.complex(1 - 1e-11, 0)]
      ];
      expect(isUnitary(matrix, 1e-10)).toBe(true);
      expect(isUnitary(matrix, 1e-12)).toBe(false);
    });
  });

  describe('eigenDecomposition', () => {
    it('computes eigenvalues and eigenvectors of Hermitian matrix', () => {
      const matrix = [
        [math.complex(2, 0), math.complex(1, 0)],
        [math.complex(1, 0), math.complex(2, 0)]
      ];
      const { values, vectors } = eigenDecomposition(matrix);
      
      // Should have eigenvalues 1 and 3
      expect(values.length).toBe(2);
      expect(Math.abs(values[0].re - 3)).toBeLessThan(1e-10);
      expect(Math.abs(values[0].im)).toBeLessThan(1e-10);
      expect(Math.abs(values[1].re - 1)).toBeLessThan(1e-10);
      expect(Math.abs(values[1].im)).toBeLessThan(1e-10);
      
      // Should have normalized eigenvectors
      expect(vectors.length).toBe(2);
      for (const vector of vectors) {
        const norm = vector.reduce((sum, v) => 
          sum + math.abs(v) ** 2, 0);
        expect(Math.abs(norm - 1)).toBeLessThan(1e-10);
      }

      // Verify eigenvector equation Av = λv
      for (let i = 0; i < values.length; i++) {
        const Av = multiplyMatrices(matrix, [vectors[i]])[0];
        const lambdaV = vectors[i].map(v => 
          math.multiply(values[i], v) as Complex
        );
        
        for (let j = 0; j < matrix.length; j++) {
          expect(complexEqual(Av[j], lambdaV[j])).toBe(true);
        }
      }
    });

    it('throws error for non-Hermitian matrix', () => {
      const matrix = [
        [math.complex(1, 0), math.complex(1, 1)],
        [math.complex(1, -2), math.complex(2, 0)]
      ];
      expect(() => eigenDecomposition(matrix)).toThrow();
    });

    it('handles degenerate eigenvalues', () => {
      const matrix = [
        [math.complex(1, 0), math.complex(0, 0)],
        [math.complex(0, 0), math.complex(1, 0)]
      ];
      const { values, vectors } = eigenDecomposition(matrix);
      
      // Should have same eigenvalue 1 twice
      expect(values.length).toBe(2);
      expect(Math.abs(values[0].re - 1)).toBeLessThan(1e-10);
      expect(Math.abs(values[1].re - 1)).toBeLessThan(1e-10);
      
      // Eigenvectors should be orthogonal
      const dotProduct = vectors[0].reduce((sum, v, i) =>
        sum + math.abs(math.multiply(math.conj(v), vectors[1][i])), 0
      );
      expect(Math.abs(dotProduct)).toBeLessThan(1e-10);
    });
  });
});