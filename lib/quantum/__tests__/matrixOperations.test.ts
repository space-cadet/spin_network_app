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
  isUnitary
} from '../matrixOperations';
import { createComplex } from '../complex';
import { Complex } from '../types';

// Helper to create test matrices
function createIdentityMatrix(size: number): Complex[][] {
  return Array(size).fill(null).map((_, i) =>
    Array(size).fill(null).map((_, j) =>
      i === j ? createComplex(1, 0) : createComplex(0, 0)
    )
  );
}

describe('Matrix Operations', () => {
  describe('multiplyMatrices', () => {
    it('multiplies 2x2 matrices correctly', () => {
      const a = createIdentityMatrix(2);
      const b = [
        [createComplex(2, 0), createComplex(0, 0)],
        [createComplex(0, 0), createComplex(2, 0)]
      ];
      
      const result = multiplyMatrices(a, b);
      expect(result[0][0]).toEqual(createComplex(2, 0));
      expect(result[1][1]).toEqual(createComplex(2, 0));
    });

    it('handles complex matrix multiplication', () => {
      const a = [
        [createComplex(0, 1), createComplex(1, 0)],
        [createComplex(1, 0), createComplex(0, -1)]
      ];
      const b = [
        [createComplex(1, 0), createComplex(0, 1)],
        [createComplex(0, -1), createComplex(1, 0)]
      ];
      
      const result = multiplyMatrices(a, b);
      expect(result[0][0]).toEqual(createComplex(1, 1));
      expect(result[1][1]).toEqual(createComplex(1, -1));
    });

    it('throws error for invalid dimensions', () => {
      const a = [[createComplex(1, 0)]];
      const b = [[createComplex(1, 0)], [createComplex(1, 0)]];
      expect(() => multiplyMatrices(a, b)).toThrow();
    });
  });

  describe('matrixExponential', () => {
    it('computes exponential of zero matrix', () => {
      const matrix = [
        [createComplex(0, 0), createComplex(0, 0)],
        [createComplex(0, 0), createComplex(0, 0)]
      ];
      
      const result = matrixExponential(matrix);
      expect(result[0][0]).toEqual(createComplex(1, 0));
      expect(result[1][1]).toEqual(createComplex(1, 0));
      expect(result[0][1]).toEqual(createComplex(0, 0));
      expect(result[1][0]).toEqual(createComplex(0, 0));
    });

    it('computes exponential of diagonal matrix', () => {
      const matrix = [
        [createComplex(1, 0), createComplex(0, 0)],
        [createComplex(0, 0), createComplex(1, 0)]
      ];
      
      const result = matrixExponential(matrix);
      expect(Math.abs(result[0][0].re - Math.E)).toBeLessThan(1e-10);
      expect(Math.abs(result[1][1].re - Math.E)).toBeLessThan(1e-10);
    });

    it('throws error for non-square matrix', () => {
      const matrix = [
        [createComplex(1, 0)],
        [createComplex(1, 0)]
      ];
      expect(() => matrixExponential(matrix)).toThrow();
    });
  });

  describe('tensorProduct', () => {
    it('computes tensor product of 2x2 matrices', () => {
      const a = createIdentityMatrix(2);
      const b = [
        [createComplex(2, 0), createComplex(0, 0)],
        [createComplex(0, 0), createComplex(2, 0)]
      ];
      
      const result = tensorProduct(a, b);
      expect(result.length).toBe(4);
      expect(result[0].length).toBe(4);
      expect(result[0][0]).toEqual(createComplex(2, 0));
      expect(result[3][3]).toEqual(createComplex(2, 0));
    });

    it('throws error for invalid dimensions', () => {
      expect(() => tensorProduct([], [])).toThrow();
    });
  });

  describe('adjoint', () => {
    it('computes adjoint of real matrix', () => {
      const matrix = [
        [createComplex(1, 0), createComplex(2, 0)],
        [createComplex(3, 0), createComplex(4, 0)]
      ];
      
      const result = adjoint(matrix);
      expect(result[0][1]).toEqual(createComplex(3, 0));
      expect(result[1][0]).toEqual(createComplex(2, 0));
    });

    it('computes adjoint of complex matrix', () => {
      const matrix = [
        [createComplex(1, 1), createComplex(0, 1)],
        [createComplex(1, 0), createComplex(1, -1)]
      ];
      
      const result = adjoint(matrix);
      expect(result[0][0]).toEqual(createComplex(1, -1));
      expect(result[0][1]).toEqual(createComplex(1, 0));
      expect(result[1][0]).toEqual(createComplex(0, -1));
      expect(result[1][1]).toEqual(createComplex(1, 1));
    });

    it('throws error for invalid matrix', () => {
      expect(() => adjoint([])).toThrow();
    });
  });

  describe('addMatrices', () => {
    it('adds matrices correctly', () => {
      const a = [
        [createComplex(1, 0), createComplex(0, 1)],
        [createComplex(0, -1), createComplex(1, 0)]
      ];
      const b = [
        [createComplex(1, 0), createComplex(0, -1)],
        [createComplex(0, 1), createComplex(1, 0)]
      ];
      
      const result = addMatrices(a, b);
      expect(result[0][0]).toEqual(createComplex(2, 0));
      expect(result[0][1]).toEqual(createComplex(0, 0));
      expect(result[1][0]).toEqual(createComplex(0, 0));
      expect(result[1][1]).toEqual(createComplex(2, 0));
    });

    it('throws error for mismatched dimensions', () => {
      const a = [[createComplex(1, 0)]];
      const b = [[createComplex(1, 0)], [createComplex(1, 0)]];
      expect(() => addMatrices(a, b)).toThrow();
    });
  });

  describe('scaleMatrix', () => {
    it('scales matrix by real number', () => {
      const matrix = [
        [createComplex(1, 0), createComplex(0, 1)],
        [createComplex(1, 0), createComplex(0, -1)]
      ];
      const scalar = createComplex(2, 0);
      
      const result = scaleMatrix(matrix, scalar);
      expect(result[0][0]).toEqual(createComplex(2, 0));
      expect(result[0][1]).toEqual(createComplex(0, 2));
    });

    it('scales matrix by complex number', () => {
      const matrix = [
        [createComplex(1, 0), createComplex(0, 1)],
        [createComplex(1, 0), createComplex(0, -1)]
      ];
      const scalar = createComplex(0, 1);
      
      const result = scaleMatrix(matrix, scalar);
      expect(result[0][0]).toEqual(createComplex(0, 1));
      expect(result[0][1]).toEqual(createComplex(-1, 0));
    });

    it('throws error for invalid matrix', () => {
      expect(() => scaleMatrix([], createComplex(1, 0))).toThrow();
    });
  });

  describe('isHermitian', () => {
    it('identifies Hermitian matrix', () => {
      const matrix = [
        [createComplex(1, 0), createComplex(2, -1)],
        [createComplex(2, 1), createComplex(3, 0)]
      ];
      expect(isHermitian(matrix)).toBe(true);
    });

    it('identifies non-Hermitian matrix', () => {
      const matrix = [
        [createComplex(1, 0), createComplex(2, -1)],
        [createComplex(2, -1), createComplex(3, 0)]
      ];
      expect(isHermitian(matrix)).toBe(false);
    });

    it('handles numerical tolerance', () => {
      const matrix = [
        [createComplex(1, 1e-11), createComplex(1, 0)],
        [createComplex(1, 0), createComplex(1, -1e-11)]
      ];
      expect(isHermitian(matrix, 1e-10)).toBe(true);
      expect(isHermitian(matrix, 1e-12)).toBe(false);
    });
  });

  describe('isUnitary', () => {
    it('identifies unitary matrix', () => {
      const matrix = [
        [createComplex(1/Math.sqrt(2), 0), createComplex(-1/Math.sqrt(2), 0)],
        [createComplex(1/Math.sqrt(2), 0), createComplex(1/Math.sqrt(2), 0)]
      ];
      expect(isUnitary(matrix)).toBe(true);
    });

    it('identifies non-unitary matrix', () => {
      const matrix = [
        [createComplex(1, 0), createComplex(1, 0)],
        [createComplex(1, 0), createComplex(1, 0)]
      ];
      expect(isUnitary(matrix)).toBe(false);
    });

    it('handles numerical tolerance', () => {
      const matrix = [
        [createComplex(1 + 1e-11, 0), createComplex(0, 0)],
        [createComplex(0, 0), createComplex(1 - 1e-11, 0)]
      ];
      expect(isUnitary(matrix, 1e-10)).toBe(true);
      expect(isUnitary(matrix, 1e-12)).toBe(false);
    });
  });
});