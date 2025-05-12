/**
 * Tests for Hamiltonian implementation
 */

import { describe, it, expect, beforeEach, test } from 'vitest';

import { Hamiltonian, HamiltonianTerm } from '../src/operators/hamiltonian';
// import { math.complex } from '../complex';
import { PauliX, PauliY, PauliZ } from '../src/operators/gates';
import { MatrixOperator } from '../src/operators/operator';
import { StateVector } from '../src/states/stateVector';
import * as math from 'mathjs';

describe('Hamiltonian', () => {
  describe('Basic Hamiltonian operations', () => {
    let H: Hamiltonian;
    
    beforeEach(() => {
      // Create a simple Hamiltonian H = σz
      H = new Hamiltonian(2, [{
        coefficient: math.complex(1,  0),
        operator: PauliZ
      }], 'spin');
    });

    test('should construct correctly', () => {
      expect(H.dimension).toBe(2);
      expect(H.hamiltonianType).toBe('spin');
      expect(H.terms.length).toBe(1);
    });

    test('should compute correct expectation values', () => {
      // Test with |0⟩ state (eigenstate of σz with +1)
      const state0 = StateVector.computationalBasis(2, 0);
      const exp0 = H.expectationValue(state0);
      expect(exp0.re).toBeCloseTo(1);
      expect(exp0.im).toBeCloseTo(0);

      // Test with |1⟩ state (eigenstate of σz with -1)
      const state1 = StateVector.computationalBasis(2, 1);
      const exp1 = H.expectationValue(state1);
      expect(exp1.re).toBeCloseTo(-1);
      expect(exp1.im).toBeCloseTo(0);
    });

    test('should correctly evolve states', () => {
      // Create |+⟩ state = (|0⟩ + |1⟩)/√2
      const statePlus = new StateVector(2, [
        math.complex(1/Math.sqrt(2),  0),
        math.complex(1/Math.sqrt(2),  0)
      ]);

      // Evolve for t = π/2 (quarter rotation)
      const evolved = H.evolveState(statePlus, Math.PI/2);
      
      // Should be (|0⟩ + i|1⟩)/√2
      expect(evolved.amplitudes[0].re).toBeCloseTo(1/Math.sqrt(2));
      expect(evolved.amplitudes[0].im).toBeCloseTo(0);
      expect(evolved.amplitudes[1].re).toBeCloseTo(0);
      expect(evolved.amplitudes[1].im).toBeCloseTo(1/Math.sqrt(2));
    });
  });

  describe('Spin Hamiltonian', () => {
    test('should create correct spin Hamiltonian', () => {
      const B = [1, 0, 0] as [number, number, number];  // Field in x direction
      const H = Hamiltonian.createSpinHamiltonian(B);

      // Should be equivalent to σx
      const state = StateVector.computationalBasis(2, 0);
      const evolved = H.evolveState(state, Math.PI);  // Rotate by π
      
      // Should flip to |1⟩
      expect(evolved.amplitudes[0].re).toBeCloseTo(0);
      expect(evolved.amplitudes[1].re).toBeCloseTo(1);
    });

    test('should give correct energy levels', () => {
      const B = [0, 0, 1] as [number, number, number];  // Field in z direction
      const H = Hamiltonian.createSpinHamiltonian(B);

      // Ground state |0⟩ should have energy +1
      const ground = StateVector.computationalBasis(2, 0);
      const E0 = H.expectationValue(ground);
      expect(E0.re).toBeCloseTo(1);

      // Excited state |1⟩ should have energy -1
      const excited = StateVector.computationalBasis(2, 1);
      const E1 = H.expectationValue(excited);
      expect(E1.re).toBeCloseTo(-1);
    });
  });

  describe('Heisenberg Hamiltonian', () => {
    test('should create correct Heisenberg Hamiltonian', () => {
      const H = Hamiltonian.createHeisenbergHamiltonian(2, 1);  // Two spins, J=1
      
      // Test with |↑↑⟩ state
      const upup = StateVector.computationalBasis(4, 0);
      const E_upup = H.expectationValue(upup);
      expect(E_upup.re).toBeCloseTo(0.75);  // Eigenstate with E = 3J/4

      // Test with singlet state (|↑↓⟩ - |↓↑⟩)/√2
      const singlet = new StateVector(4, [
        math.complex(0,  0),
        math.complex(1/Math.sqrt(2),  0),
        math.complex(-1/Math.sqrt(2),  0),
        math.complex(0,  0)
      ]);
      const E_singlet = H.expectationValue(singlet);
      expect(E_singlet.re).toBeCloseTo(-0.75);  // Eigenstate with E = -3J/4
    });

    test('should conserve total spin and energy', () => {
      const H = Hamiltonian.createHeisenbergHamiltonian(2, 1);

      // Start with |↑↓⟩ state
      const updown = StateVector.computationalBasis(4, 1);
      const initialEnergy = H.expectationValue(updown).re;
      
      // Evolve for various times
      const times = [0.1, 0.5, 1.0, 2.0];
      for (const t of times) {
        const evolved = H.evolveState(updown, t);
        
        // Should only evolve within Sz=0 subspace
        const prob0 = math.abs(math.multiply(evolved.amplitudes[0], math.conj(evolved.amplitudes[0])));
        const prob3 = math.abs(math.multiply(evolved.amplitudes[3], math.conj(evolved.amplitudes[3])));
        expect(prob0).toBeCloseTo(0);
        expect(prob3).toBeCloseTo(0);
        
        // Energy should be conserved
        const energy = H.expectationValue(evolved).re;
        expect(energy).toBeCloseTo(initialEnergy);
        
        // Verify |↑↓⟩ evolves to mix with |↓↑⟩ only
        const totalProb = math.abs(math.multiply(evolved.amplitudes[1], math.conj(evolved.amplitudes[1]))) +
                         math.abs(math.multiply(evolved.amplitudes[2], math.conj(evolved.amplitudes[2])));
        expect(totalProb).toBeCloseTo(1);
      }
    });

    test('evolves product and entangled states correctly', () => {
      const H = Hamiltonian.createHeisenbergHamiltonian(2, 1);
      
      // Test evolution of |↑↑⟩ state (energy eigenstate)
      const upup = StateVector.computationalBasis(4, 0);
      const evolved_upup = H.evolveState(upup, Math.PI);
      expect(math.abs(evolved_upup.innerProduct(upup))).toBeCloseTo(1);  // Should return to itself
      
      // Test evolution of |↑↓⟩ state
      const updown = StateVector.computationalBasis(4, 1);
      const evolved_updown = H.evolveState(updown, Math.PI);
      
      // At t = π, should have maximum overlap with |↓↑⟩
      const downup = StateVector.computationalBasis(4, 2);
      const overlap = math.abs(evolved_updown.innerProduct(downup));
      expect(overlap).toBeCloseTo(1);
    });
  });

  describe('Error handling', () => {
    test('should throw on dimension mismatch', () => {
      const H = new Hamiltonian(2, [{
        coefficient: math.complex(1,  0),
        operator: PauliZ
      }]);

      const wrongState = new StateVector(3, [
        math.complex(1,  0),
        math.complex(0,  0),
        math.complex(0,  0)
      ]);

      expect(() => H.evolveState(wrongState, 1)).toThrow();
      expect(() => H.expectationValue(wrongState)).toThrow();
    });

    test('should throw on non-Hermitian terms when required', () => {
      const nonHermitian = new MatrixOperator([
        [math.complex(1,  0), math.complex(1,  1)],
        [math.complex(1,  -1), math.complex(1,  0)]
      ]);

      expect(() => new Hamiltonian(2, [{
        coefficient: math.complex(1,  0),
        operator: nonHermitian
      }], 'custom', false, true)).toThrow();  // requireHermitian = true
    });
  });
});
