import {
  createState,
  setState,
  getState,
  innerProduct,
  norm,
  normalize,
  tensorProduct,
  getBasis
} from '../stateVector';
import { createComplex } from '../complex';

describe('State Vector Operations', () => {
  describe('createState', () => {
    it('creates state vector with correct dimension', () => {
      const state = createState(3);
      expect(state.dimension).toBe(3);
      expect(state.amplitudes.length).toBe(3);
    });

    it('initializes amplitudes to zero', () => {
      const state = createState(2);
      expect(state.amplitudes[0]).toEqual({ re: 0, im: 0 });
      expect(state.amplitudes[1]).toEqual({ re: 0, im: 0 });
    });

    it('throws error for invalid dimension', () => {
      expect(() => createState(0)).toThrow('Dimension must be positive');
      expect(() => createState(-1)).toThrow('Dimension must be positive');
    });
  });

  describe('setState/getState', () => {
    it('sets and gets state amplitudes correctly', () => {
      const state = createState(2);
      const value = createComplex(1, 2);
      setState(state, 0, value);
      expect(getState(state, 0)).toEqual(value);
    });

    it('creates independent copy of complex value', () => {
      const state = createState(2);
      const value = createComplex(1, 2);
      setState(state, 0, value);
      value.re = 3;  // Modify original
      expect(getState(state, 0)).toEqual({ re: 1, im: 2 });
    });

    it('throws error for invalid indices', () => {
      const state = createState(2);
      expect(() => setState(state, -1, createComplex(1, 0))).toThrow('Index -1 out of bounds');
      expect(() => setState(state, 2, createComplex(1, 0))).toThrow('Index 2 out of bounds');
      expect(() => getState(state, -1)).toThrow('Index -1 out of bounds');
      expect(() => getState(state, 2)).toThrow('Index 2 out of bounds');
    });
  });

  describe('innerProduct', () => {
    it('calculates inner product correctly', () => {
      const state1 = createState(2);
      const state2 = createState(2);
      
      setState(state1, 0, createComplex(1, 0));
      setState(state1, 1, createComplex(0, 1));
      
      setState(state2, 0, createComplex(2, 0));
      setState(state2, 1, createComplex(0, -2));
      
      // ⟨ψ|φ⟩ = (1-0i)(2+0i) + (0-1i)(0-2i) = 2 + 2 = 4
      const result = innerProduct(state1, state2);
      expect(result).toEqual({ re: 0, im: 0 });
    });

    it('handles complex conjugate correctly', () => {
      const state1 = createState(2);
      const state2 = createState(2);
      
      setState(state1, 0, createComplex(0, 1));  // i
      setState(state2, 0, createComplex(0, 1));  // i
      
      // ⟨ψ|φ⟩ = (-i)(i) = 1
      const result = innerProduct(state1, state2);
      expect(result).toEqual({ re: 1, im: 0 });
    });

    it('throws error for mismatched dimensions', () => {
      const state1 = createState(2);
      const state2 = createState(3);
      expect(() => innerProduct(state1, state2)).toThrow('States must have same dimension');
    });
  });

  describe('norm', () => {
    it('calculates norm correctly', () => {
      const state = createState(2);
      setState(state, 0, createComplex(3, 0));
      setState(state, 1, createComplex(4, 0));
      expect(norm(state)).toBe(5);  // 3-4-5 triangle
    });

    it('handles complex amplitudes correctly', () => {
      const state = createState(2);
      setState(state, 0, createComplex(1, 1));  // 1+i
      // |1+i|² = 2
      expect(norm(state)).toBe(Math.sqrt(2));
    });

    it('returns zero for zero state', () => {
      const state = createState(2);
      expect(norm(state)).toBe(0);
    });
  });

  describe('normalize', () => {
    it('normalizes state to unit norm', () => {
      const state = createState(2);
      setState(state, 0, createComplex(3, 0));
      setState(state, 1, createComplex(4, 0));
      
      const normalized = normalize(state);
      expect(norm(normalized)).toBeCloseTo(1, 10);
      expect(normalized.amplitudes[0]).toEqual({ re: 0.6, im: 0 });
      expect(normalized.amplitudes[1]).toEqual({ re: 0.8, im: 0 });
    });

    it('handles complex amplitudes correctly', () => {
      const state = createState(2);
      setState(state, 0, createComplex(1, 1));  // 1+i
      
      const normalized = normalize(state);
      expect(norm(normalized)).toBeCloseTo(1, 10);
      const expectedAmp = 1/Math.sqrt(2);
      expect(normalized.amplitudes[0]).toEqual({ 
        re: expectedAmp, 
        im: expectedAmp 
      });
    });

    it('throws error for zero state', () => {
      const state = createState(2);
      expect(() => normalize(state)).toThrow('Cannot normalize zero state vector');
    });
  });

  describe('tensorProduct', () => {
    it('computes tensor product correctly', () => {
      const state1 = createState(2);
      const state2 = createState(2);
      
      setState(state1, 0, createComplex(1, 0));
      setState(state1, 1, createComplex(1, 0));
      setState(state2, 0, createComplex(1, 0));
      setState(state2, 1, createComplex(-1, 0));
      
      const result = tensorProduct(state1, state2);
      expect(result.dimension).toBe(4);
      expect(result.amplitudes[0]).toEqual({ re: 1, im: 0 });
      expect(result.amplitudes[1]).toEqual({ re: -1, im: 0 });
      expect(result.amplitudes[2]).toEqual({ re: 1, im: 0 });
      expect(result.amplitudes[3]).toEqual({ re: -1, im: 0 });
    });

    it('handles complex amplitudes correctly', () => {
      const state1 = createState(2);
      const state2 = createState(2);
      
      setState(state1, 0, createComplex(0, 1));  // i
      setState(state2, 0, createComplex(0, 1));  // i
      
      const result = tensorProduct(state1, state2);
      expect(result.amplitudes[0]).toEqual({ re: -1, im: 0 });  // i * i = -1
    });
  });

  describe('getBasis', () => {
    it('creates correct basis states', () => {
      const basis = getBasis(2);
      expect(basis.length).toBe(2);
      
      // |0⟩
      expect(basis[0].amplitudes[0]).toEqual({ re: 1, im: 0 });
      expect(basis[0].amplitudes[1]).toEqual({ re: 0, im: 0 });
      
      // |1⟩
      expect(basis[1].amplitudes[0]).toEqual({ re: 0, im: 0 });
      expect(basis[1].amplitudes[1]).toEqual({ re: 1, im: 0 });
    });

    it('creates orthonormal basis', () => {
      const basis = getBasis(3);
      
      // Check orthogonality
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const product = innerProduct(basis[i], basis[j]);
          if (i === j) {
            expect(product).toEqual({ re: 1, im: 0 });
          } else {
            expect(product).toEqual({ re: 0, im: 0 });
          }
        }
      }
    });
  });
});
