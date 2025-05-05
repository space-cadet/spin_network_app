import {
  computationalBasis,
  createBasisState,
  createBellState,
  createGHZState,
  createWState,
  createPlusState,
  createMinusState
} from '../states';
import { innerProduct, norm } from '../stateVector';
import { createComplex } from '../complex';

describe('Quantum States', () => {
  describe('computationalBasis', () => {
    it('creates correct number of basis states', () => {
      const basis = computationalBasis(2);  // 2-qubit system
      expect(basis.length).toBe(4);
    });

    it('creates orthonormal basis states', () => {
      const basis = computationalBasis(2);
      
      // Check orthonormality
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const product = innerProduct(basis[i], basis[j]);
          if (i === j) {
            expect(product).toEqual({ re: 1, im: 0 });
          } else {
            expect(product).toEqual({ re: 0, im: 0 });
          }
        }
      }
    });

    it('throws error for invalid number of qubits', () => {
      expect(() => computationalBasis(0)).toThrow('Number of qubits must be positive');
      expect(() => computationalBasis(-1)).toThrow('Number of qubits must be positive');
    });
  });

  describe('createBasisState', () => {
    it('creates correct basis state', () => {
      const state = createBasisState(3, 1);  // |1⟩ in 3D space
      expect(state.amplitudes[0]).toEqual({ re: 0, im: 0 });
      expect(state.amplitudes[1]).toEqual({ re: 1, im: 0 });
      expect(state.amplitudes[2]).toEqual({ re: 0, im: 0 });
    });

    it('throws error for invalid index', () => {
      expect(() => createBasisState(2, -1)).toThrow('Index -1 out of bounds');
      expect(() => createBasisState(2, 2)).toThrow('Index 2 out of bounds');
    });
  });

  describe('Bell States', () => {
    it('creates normalized Bell states', () => {
      const bellStates = ['Phi+', 'Phi-', 'Psi+', 'Psi-'] as const;
      bellStates.forEach(type => {
        const state = createBellState(type);
        expect(norm(state)).toBeCloseTo(1, 10);
      });
    });

    it('creates correct Phi+ state', () => {
      const state = createBellState('Phi+');
      // |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
      expect(state.amplitudes[0]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
      expect(state.amplitudes[1]).toEqual({ re: 0, im: 0 });
      expect(state.amplitudes[2]).toEqual({ re: 0, im: 0 });
      expect(state.amplitudes[3]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
    });

    it('creates correct Phi- state', () => {
      const state = createBellState('Phi-');
      // |Φ⁻⟩ = (|00⟩ - |11⟩)/√2
      expect(state.amplitudes[0]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
      expect(state.amplitudes[3]).toEqual({ re: -1/Math.sqrt(2), im: 0 });
    });

    it('creates correct Psi+ state', () => {
      const state = createBellState('Psi+');
      // |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2
      expect(state.amplitudes[1]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
      expect(state.amplitudes[2]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
    });

    it('creates correct Psi- state', () => {
      const state = createBellState('Psi-');
      // |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2
      expect(state.amplitudes[1]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
      expect(state.amplitudes[2]).toEqual({ re: -1/Math.sqrt(2), im: 0 });
    });
  });

  describe('GHZ States', () => {
    it('creates normalized GHZ states', () => {
      [2, 3, 4].forEach(n => {
        const state = createGHZState(n);
        expect(norm(state)).toBeCloseTo(1, 10);
      });
    });

    it('creates correct 3-qubit GHZ state', () => {
      const state = createGHZState(3);
      // |GHZ₃⟩ = (|000⟩ + |111⟩)/√2
      expect(state.dimension).toBe(8);
      expect(state.amplitudes[0]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
      expect(state.amplitudes[7]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
      
      // All other amplitudes should be 0
      for (let i = 1; i < 7; i++) {
        expect(state.amplitudes[i]).toEqual({ re: 0, im: 0 });
      }
    });

    it('throws error for invalid number of qubits', () => {
      expect(() => createGHZState(1)).toThrow('GHZ state requires at least 2 qubits');
      expect(() => createGHZState(0)).toThrow('GHZ state requires at least 2 qubits');
    });
  });

  describe('W States', () => {
    it('creates normalized W states', () => {
      [2, 3, 4].forEach(n => {
        const state = createWState(n);
        expect(norm(state)).toBeCloseTo(1, 10);
      });
    });

    it('creates correct 3-qubit W state', () => {
      const state = createWState(3);
      // |W₃⟩ = (|100⟩ + |010⟩ + |001⟩)/√3
      expect(state.dimension).toBe(8);
      const expectedAmp = 1/Math.sqrt(3);
      
      expect(state.amplitudes[1]).toEqual({ re: expectedAmp, im: 0 });  // |001⟩
      expect(state.amplitudes[2]).toEqual({ re: expectedAmp, im: 0 });  // |010⟩
      expect(state.amplitudes[4]).toEqual({ re: expectedAmp, im: 0 });  // |100⟩
      
      // All other amplitudes should be 0
      [0, 3, 5, 6, 7].forEach(i => {
        expect(state.amplitudes[i]).toEqual({ re: 0, im: 0 });
      });
    });

    it('throws error for invalid number of qubits', () => {
      expect(() => createWState(1)).toThrow('W state requires at least 2 qubits');
      expect(() => createWState(0)).toThrow('W state requires at least 2 qubits');
    });
  });

  describe('Plus/Minus States', () => {
    it('creates normalized plus state', () => {
      const state = createPlusState();
      expect(norm(state)).toBeCloseTo(1, 10);
      expect(state.amplitudes[0]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
      expect(state.amplitudes[1]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
    });

    it('creates normalized minus state', () => {
      const state = createMinusState();
      expect(norm(state)).toBeCloseTo(1, 10);
      expect(state.amplitudes[0]).toEqual({ re: 1/Math.sqrt(2), im: 0 });
      expect(state.amplitudes[1]).toEqual({ re: -1/Math.sqrt(2), im: 0 });
    });
  });
});
