/**
 * Tests for quantum composition operations
 */

import {
  composeSpaces,
  composeStates,
  composeOperators,
  bipartiteSplit,
  partialTrace
} from '../composition';
import { HilbertSpace } from '../hilbertSpace';
import { StateVector } from '../stateVector';
import { MatrixOperator } from '../operator';
import { createComplex } from '../complex';

describe('Quantum Composition', () => {
  describe('composeSpaces', () => {
    it('composes two qubit spaces correctly', () => {
      const space1 = new HilbertSpace(2);
      const space2 = new HilbertSpace(2);
      const composed = composeSpaces([space1, space2]);
      
      expect(composed.dimension).toBe(4);
      expect(composed.basis).toHaveLength(4);
    });

    it('composes multiple spaces correctly', () => {
      const spaces = [
        new HilbertSpace(2),
        new HilbertSpace(2),
        new HilbertSpace(2)
      ];
      const composed = composeSpaces(spaces);
      
      expect(composed.dimension).toBe(8);
      expect(composed.basis).toHaveLength(8);
    });

    it('throws error for empty spaces array', () => {
      expect(() => composeSpaces([])).toThrow('Empty spaces array');
    });
  });

  describe('composeStates', () => {
    it('composes two qubit states correctly', () => {
      const state1 = new StateVector(2, [
        createComplex(1, 0),
        createComplex(0, 0)
      ]);
      const state2 = new StateVector(2, [
        createComplex(1, 0),
        createComplex(0, 0)
      ]);
      
      const composed = composeStates([state1, state2]);
      expect(composed.dimension).toBe(4);
      expect(composed.amplitudes[0]).toEqual(createComplex(1, 0));
      expect(composed.amplitudes[1]).toEqual(createComplex(0, 0));
      expect(composed.amplitudes[2]).toEqual(createComplex(0, 0));
      expect(composed.amplitudes[3]).toEqual(createComplex(0, 0));
    });

    it('composes multiple states correctly', () => {
      const states = Array(3).fill(null).map(() => 
        new StateVector(2, [createComplex(1, 0), createComplex(0, 0)])
      );
      
      const composed = composeStates(states);
      expect(composed.dimension).toBe(8);
      expect(composed.amplitudes[0]).toEqual(createComplex(1, 0));
      expect(composed.amplitudes.slice(1).every(amp => 
        amp.re === 0 && amp.im === 0
      )).toBe(true);
    });

    it('throws error for empty states array', () => {
      expect(() => composeStates([])).toThrow('Empty states array');
    });
  });

  describe('composeOperators', () => {
    it('composes two single-qubit operators correctly', () => {
      const op1 = MatrixOperator.identity(2);
      const op2 = MatrixOperator.identity(2);
      
      const composed = composeOperators([op1, op2]);
      expect(composed.dimension).toBe(4);
      
      const matrix = composed.toMatrix();
      expect(matrix[0][0]).toEqual(createComplex(1, 0));
      expect(matrix[3][3]).toEqual(createComplex(1, 0));
    });

    it('composes multiple operators correctly', () => {
      const operators = Array(3).fill(null).map(() => MatrixOperator.identity(2));
      
      const composed = composeOperators(operators);
      expect(composed.dimension).toBe(8);
      
      const matrix = composed.toMatrix();
      expect(matrix[0][0]).toEqual(createComplex(1, 0));
      expect(matrix[7][7]).toEqual(createComplex(1, 0));
    });

    it('throws error for empty operators array', () => {
      expect(() => composeOperators([])).toThrow('Empty operators array');
    });
  });

  describe('bipartiteSplit', () => {
    it('splits two-qubit space correctly', () => {
      const space = new HilbertSpace(4);
      const [space1, space2] = bipartiteSplit(space, 2);
      
      expect(space1.dimension).toBe(2);
      expect(space2.dimension).toBe(2);
    });

    it('throws error for invalid split dimensions', () => {
      const space = new HilbertSpace(6);
      expect(() => bipartiteSplit(space, 4))
        .toThrow('First dimension must divide total dimension');
    });
  });

  describe('partialTrace', () => {
    it('computes partial trace correctly for two-qubit system', () => {
      const operator = MatrixOperator.identity(4);
      const result = partialTrace(operator, [2, 2], [1]);
      
      expect(result.dimension).toBe(2);
      const matrix = result.toMatrix();
      expect(matrix[0][0]).toEqual(createComplex(2, 0));
      expect(matrix[1][1]).toEqual(createComplex(2, 0));
    });

    it('validates dimensions match', () => {
      const operator = MatrixOperator.identity(4);
      expect(() => partialTrace(operator, [3, 2], [1]))
        .toThrow();
    });

    it('validates trace indices', () => {
      const operator = MatrixOperator.identity(4);
      expect(() => partialTrace(operator, [2, 2], [2]))
        .toThrow();
    });
  });
});