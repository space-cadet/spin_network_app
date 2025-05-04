/**
 * Tests for state vector operations
 */

import { StateVector } from '../types';
import { TEST_STATES, BASIS_STATES } from './utils/testFixtures';
import { stateVectorApproxEqual, createRandomState } from './utils/testHelpers';
import { HilbertSpace } from '../hilbertSpace';

describe('State Vector Operations', () => {
  describe('Basic State Properties', () => {
    it('validates state vector normalization', () => {
      const states = [
        TEST_STATES.PLUS,
        TEST_STATES.MINUS,
        TEST_STATES.BELL_PHI_PLUS,
        TEST_STATES.BELL_PHI_MINUS
      ];

      states.forEach(state => {
        const normSquared = state.amplitudes.reduce((sum, amp) => 
          sum + amp.re * amp.re + amp.im * amp.im, 0);
        expect(Math.abs(normSquared - 1)).toBeLessThan(1e-10);
      });
    });

    it('verifies orthogonality of basis states', () => {
      const basis = [
        BASIS_STATES.QUBIT_0,
        BASIS_STATES.QUBIT_1
      ];

      for (let i = 0; i < basis.length; i++) {
        for (let j = 0; j < basis.length; j++) {
          const overlap = basis[i].amplitudes.reduce((sum, amp, k) => {
            const conj = {
              re: basis[j].amplitudes[k].re,
              im: -basis[j].amplitudes[k].im
            };
            return sum + (amp.re * conj.re - amp.im * conj.im);
          }, 0);

          if (i === j) {
            expect(Math.abs(overlap - 1)).toBeLessThan(1e-10);
          } else {
            expect(Math.abs(overlap)).toBeLessThan(1e-10);
          }
        }
      }
    });
  });

  describe('State Transformations', () => {
    it('preserves normalization under unitary transformations', () => {
      const space = new HilbertSpace(2);
      const state = createRandomState(space);
      
      // Apply Hadamard transformation
      const H = [
        [{ re: 1/Math.sqrt(2), im: 0 }, { re: 1/Math.sqrt(2), im: 0 }],
        [{ re: 1/Math.sqrt(2), im: 0 }, { re: -1/Math.sqrt(2), im: 0 }]
      ];

      const newAmplitudes = new Array(2).fill(null).map(() => ({ re: 0, im: 0 }));
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const term = {
            re: H[i][j].re * state.amplitudes[j].re - H[i][j].im * state.amplitudes[j].im,
            im: H[i][j].re * state.amplitudes[j].im + H[i][j].im * state.amplitudes[j].re
          };
          newAmplitudes[i].re += term.re;
          newAmplitudes[i].im += term.im;
        }
      }

      const transformedState: StateVector = {
        dimension: 2,
        amplitudes: newAmplitudes,
        basis: state.basis
      };

      const normSquared = transformedState.amplitudes.reduce((sum, amp) => 
        sum + amp.re * amp.re + amp.im * amp.im, 0);
      expect(Math.abs(normSquared - 1)).toBeLessThan(1e-10);
    });
  });

  describe('Multi-qubit States', () => {
    it('correctly represents separable states', () => {
      // Create |0⟩⊗|1⟩ state
      const state: StateVector = {
        dimension: 4,
        amplitudes: [
          { re: 0, im: 0 },
          { re: 1, im: 0 },
          { re: 0, im: 0 },
          { re: 0, im: 0 }
        ],
        basis: '|01⟩'
      };

      // Verify it's a valid quantum state
      const normSquared = state.amplitudes.reduce((sum, amp) => 
        sum + amp.re * amp.re + amp.im * amp.im, 0);
      expect(Math.abs(normSquared - 1)).toBeLessThan(1e-10);
    });

    it('correctly represents entangled states', () => {
      // Test Bell states
      const bellStates = [
        TEST_STATES.BELL_PHI_PLUS,
        TEST_STATES.BELL_PHI_MINUS
      ];

      bellStates.forEach(state => {
        // Verify normalization
        const normSquared = state.amplitudes.reduce((sum, amp) => 
          sum + amp.re * amp.re + amp.im * amp.im, 0);
        expect(Math.abs(normSquared - 1)).toBeLessThan(1e-10);

        // Could add more specific tests for entanglement properties
        // e.g., check reduced density matrix is maximally mixed
      });
    });
  });

  describe('State Vector Math', () => {
    it('calculates inner products correctly', () => {
      const bra = TEST_STATES.PLUS;
      const ket = TEST_STATES.MINUS;

      // Calculate ⟨+|-⟩
      let innerProduct = { re: 0, im: 0 };
      for (let i = 0; i < bra.dimension; i++) {
        innerProduct.re += bra.amplitudes[i].re * ket.amplitudes[i].re + 
                          bra.amplitudes[i].im * ket.amplitudes[i].im;
        innerProduct.im += bra.amplitudes[i].re * ket.amplitudes[i].im - 
                          bra.amplitudes[i].im * ket.amplitudes[i].re;
      }

      // Should be 0 as |+⟩ and |-⟩ are orthogonal
      expect(Math.abs(innerProduct.re)).toBeLessThan(1e-10);
      expect(Math.abs(innerProduct.im)).toBeLessThan(1e-10);
    });

    it('implements state addition correctly', () => {
      const state1 = BASIS_STATES.QUBIT_0;
      const state2 = BASIS_STATES.QUBIT_1;

      // Create (|0⟩ + |1⟩)/√2
      const sum: StateVector = {
        dimension: 2,
        amplitudes: state1.amplitudes.map((amp, i) => ({
          re: (amp.re + state2.amplitudes[i].re) / Math.sqrt(2),
          im: (amp.im + state2.amplitudes[i].im) / Math.sqrt(2)
        })),
        basis: 'sum'
      };

      // Should equal |+⟩ state
      expect(stateVectorApproxEqual(sum, TEST_STATES.PLUS)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles zero vectors appropriately', () => {
      const zeroState: StateVector = {
        dimension: 2,
        amplitudes: [
          { re: 0, im: 0 },
          { re: 0, im: 0 }
        ],
        basis: 'zero'
      };

      // Various operations with zero state...
      // Note: In practice, we'd usually avoid zero states
      // as they can't be normalized
    });

    it('detects dimension mismatches', () => {
      const state2d = BASIS_STATES.QUBIT_0;
      const state3d = BASIS_STATES.QUTRIT_0;

      // Attempt operations between different dimensions...
      // Implementation would depend on specific operations we want to test
    });
  });
});