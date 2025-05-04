/**
 * Tests for quantum operators
 */

import { 
  MatrixOperator,
  createIdentityOperator,
  createZeroOperator,
  scaleOperator,
  addOperators
} from '../operator';
import { TEST_DIMS, TEST_OPERATORS, TEST_STATES } from './utils/testFixtures';
import { createRandomUnitary, createRandomHermitian, complexApproxEqual } from './utils/testHelpers';
import { OperatorType } from '../types';

describe('Quantum Operators', () => {
  describe('MatrixOperator', () => {
    describe('Constructor', () => {
      it('creates operator with valid matrix', () => {
        const operator = new MatrixOperator(TEST_OPERATORS.PAULI_X);
        expect(operator.dimension).toBe(2);
        expect(operator.type).toBe('general');
      });

      it('throws error for non-square matrix', () => {
        const invalidMatrix = [
          [{ re: 1, im: 0 }],
          [{ re: 0, im: 0 }],
          [{ re: 0, im: 0 }]
        ];
        expect(() => new MatrixOperator(invalidMatrix)).toThrow();
      });

      it('validates operator types', () => {
        // Unitary
        expect(() => new MatrixOperator(TEST_OPERATORS.PAULI_X, 'unitary')).not.toThrow();
        
        // Hermitian
        expect(() => new MatrixOperator(TEST_OPERATORS.PAULI_Z, 'hermitian')).not.toThrow();
        
        // Should throw for invalid type claims
        const nonUnitary = [
          [{ re: 2, im: 0 }, { re: 0, im: 0 }],
          [{ re: 0, im: 0 }, { re: 1, im: 0 }]
        ];
        expect(() => new MatrixOperator(nonUnitary, 'unitary')).toThrow();
      });
    });

    describe('Core Operations', () => {
      it('applies operator to state vector', () => {
        const X = new MatrixOperator(TEST_OPERATORS.PAULI_X);
        const result = X.apply(TEST_STATES.PLUS);
        expect(result).toEqual(TEST_STATES.PLUS);
      });

      it('composes operators correctly', () => {
        const X = new MatrixOperator(TEST_OPERATORS.PAULI_X);
        const Y = new MatrixOperator(TEST_OPERATORS.PAULI_Y);
        const Z = new MatrixOperator(TEST_OPERATORS.PAULI_Z);
        
        // Test XY = iZ
        const XY = X.compose(Y);
        const scaledZ = scaleOperator(Z, { re: 0, im: 1 });
        
        const XYMatrix = XY.toMatrix();
        const scaledZMatrix = scaledZ.toMatrix();
        
        // Compare matrices
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            expect(complexApproxEqual(XYMatrix[i][j], scaledZMatrix[i][j])).toBe(true);
          }
        }
      });

      it('computes adjoint correctly', () => {
        const H = new MatrixOperator(TEST_OPERATORS.HADAMARD);
        const adjoint = H.adjoint();
        
        const matrix = H.toMatrix();
        const adjointMatrix = adjoint.toMatrix();
        
        // Hadamard is self-adjoint
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            expect(complexApproxEqual(matrix[i][j], adjointMatrix[i][j])).toBe(true);
          }
        }
      });
    });

    describe('Type Checking', () => {
      it('identifies unitary operators', () => {
        const dim = TEST_DIMS.QUBIT;
        const unitary = createRandomUnitary(dim);
        expect(() => new MatrixOperator(unitary, 'unitary')).not.toThrow();
      });

      it('identifies hermitian operators', () => {
        const dim = TEST_DIMS.QUBIT;
        const hermitian = createRandomHermitian(dim);
        expect(() => new MatrixOperator(hermitian, 'hermitian')).not.toThrow();
      });

      it('identifies projection operators', () => {
        // Create simple projection operator |0⟩⟨0|
        const proj = [
          [{ re: 1, im: 0 }, { re: 0, im: 0 }],
          [{ re: 0, im: 0 }, { re: 0, im: 0 }]
        ];
        expect(() => new MatrixOperator(proj, 'projection')).not.toThrow();
      });
    });
  });

  describe('Operator Factory Functions', () => {
    describe('createIdentityOperator', () => {
      it('creates identity operator of given dimension', () => {
        const I = createIdentityOperator(TEST_DIMS.QUBIT);
        expect(I.dimension).toBe(TEST_DIMS.QUBIT);
        expect(I.type).toBe('unitary');
        
        // Check matrix elements
        const matrix = I.toMatrix();
        for (let i = 0; i < TEST_DIMS.QUBIT; i++) {
          for (let j = 0; j < TEST_DIMS.QUBIT; j++) {
            expect(matrix[i][j]).toEqual({
              re: i === j ? 1 : 0,
              im: 0
            });
          }
        }
      });
    });

    describe('createZeroOperator', () => {
      it('creates zero operator of given dimension', () => {
        const Z = createZeroOperator(TEST_DIMS.QUBIT);
        expect(Z.dimension).toBe(TEST_DIMS.QUBIT);
        
        // Check matrix elements
        const matrix = Z.toMatrix();
        for (let i = 0; i < TEST_DIMS.QUBIT; i++) {
          for (let j = 0; j < TEST_DIMS.QUBIT; j++) {
            expect(matrix[i][j]).toEqual({ re: 0, im: 0 });
          }
        }
      });
    });

    describe('scaleOperator', () => {
      it('scales operator by complex number', () => {
        const X = new MatrixOperator(TEST_OPERATORS.PAULI_X);
        const scalar = { re: 2, im: 1 };
        const scaled = scaleOperator(X, scalar);
        
        const originalMatrix = X.toMatrix();
        const scaledMatrix = scaled.toMatrix();
        
        // Check scaling
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const expected = {
              re: originalMatrix[i][j].re * scalar.re - originalMatrix[i][j].im * scalar.im,
              im: originalMatrix[i][j].re * scalar.im + originalMatrix[i][j].im * scalar.re
            };
            expect(complexApproxEqual(scaledMatrix[i][j], expected)).toBe(true);
          }
        }
      });
    });

    describe('addOperators', () => {
      it('adds two operators', () => {
        const X = new MatrixOperator(TEST_OPERATORS.PAULI_X);
        const Y = new MatrixOperator(TEST_OPERATORS.PAULI_Y);
        const sum = addOperators(X, Y);
        
        const matrixX = X.toMatrix();
        const matrixY = Y.toMatrix();
        const matrixSum = sum.toMatrix();
        
        // Check addition
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const expected = {
              re: matrixX[i][j].re + matrixY[i][j].re,
              im: matrixX[i][j].im + matrixY[i][j].im
            };
            expect(complexApproxEqual(matrixSum[i][j], expected)).toBe(true);
          }
        }
      });

      it('throws error for mismatched dimensions', () => {
        const X = new MatrixOperator(TEST_OPERATORS.PAULI_X);
        const CNOT = new MatrixOperator(TEST_OPERATORS.CNOT);
        expect(() => addOperators(X, CNOT)).toThrow();
      });
    });
  });

  describe('Common Quantum Operations', () => {
    it('correctly implements Pauli X gate', () => {
      const X = new MatrixOperator(TEST_OPERATORS.PAULI_X);
      const zero = TEST_STATES.BASIS_STATES.QUBIT_0;
      const one = TEST_STATES.BASIS_STATES.QUBIT_1;
      
      const result0 = X.apply(zero);
      const result1 = X.apply(one);
      
      expect(result0).toEqual(one);
      expect(result1).toEqual(zero);
    });

    it('correctly implements Hadamard gate', () => {
      const H = new MatrixOperator(TEST_OPERATORS.HADAMARD);
      const zero = TEST_STATES.BASIS_STATES.QUBIT_0;
      
      const result = H.apply(zero);
      expect(result).toEqual(TEST_STATES.PLUS);
    });

    it('correctly implements CNOT gate', () => {
      const CNOT = new MatrixOperator(TEST_OPERATORS.CNOT);
      
      // Test on |11⟩ -> |10⟩
      const input = {
        dimension: 4,
        amplitudes: [
          { re: 0, im: 0 },
          { re: 0, im: 0 },
          { re: 0, im: 0 },
          { re: 1, im: 0 }
        ],
        basis: '|11⟩'
      };
      
      const expected = {
        dimension: 4,
        amplitudes: [
          { re: 0, im: 0 },
          { re: 0, im: 0 },
          { re: 1, im: 0 },
          { re: 0, im: 0 }
        ],
        basis: '|10⟩'
      };
      
      const result = CNOT.apply(input);
      expect(result).toEqual(expected);
    });
  });
});