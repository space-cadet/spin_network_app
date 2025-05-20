/**
 * Tests for angular momentum composition
*/

import { describe, it, expect } from 'vitest';
import { clebschGordan, isZeroCG, addAngularMomenta, decomposeAngularState } from '../../src/angularMomentum/composition';
import { createState } from '../../src/angularMomentum/core';
import * as math from 'mathjs';

describe('Angular Momentum Composition', () => {
  describe('Clebsch-Gordan Coefficients', () => {
    it('should return zero for coefficients that violate selection rules', () => {
      // m ≠ m1 + m2
      expect(math.abs(clebschGordan(1, 1, 1, 0, 2, 0))).toBeLessThan(1e-10);
      
      // j > j1 + j2
      expect(math.abs(clebschGordan(1, 1, 1, 1, 3, 2))).toBeLessThan(1e-10);
      
      // j < |j1 - j2|
      expect(math.abs(clebschGordan(2, 1, 1, 0, 0, 1))).toBeLessThan(1e-10);
    });
    
    it('should correctly calculate coefficients for two spin-1/2 particles', () => {
      // Singlet state (j=0)
      const c1 = clebschGordan(0.5, 0.5, 0.5, -0.5, 0, 0);
      expect(math.abs(math.subtract(c1, math.complex(-1/Math.sqrt(2), 0)))).toBeLessThan(1e-10);
      
      const c2 = clebschGordan(0.5, -0.5, 0.5, 0.5, 0, 0);
      expect(math.abs(math.subtract(c2, math.complex(1/Math.sqrt(2), 0)))).toBeLessThan(1e-10);
      
      // Triplet states (j=1)
      const c3 = clebschGordan(0.5, 0.5, 0.5, 0.5, 1, 1);
      expect(math.abs(math.subtract(c3, math.complex(1, 0)))).toBeLessThan(1e-10);
      
      const c4 = clebschGordan(0.5, 0.5, 0.5, -0.5, 1, 0);
      expect(math.abs(math.subtract(c4, math.complex(1/Math.sqrt(2), 0)))).toBeLessThan(1e-10);
      
      const c5 = clebschGordan(0.5, -0.5, 0.5, -0.5, 1, -1);
      expect(math.abs(math.subtract(c5, math.complex(1, 0)))).toBeLessThan(1e-10);
    });
    
    it('should correctly calculate coefficients for j1=1, j2=1/2 case', () => {
      // This is another common case in physics
      // |3/2, 3/2⟩ = |1, 1⟩|1/2, 1/2⟩
      const c1 = clebschGordan(1, 1, 0.5, 0.5, 1.5, 1.5);
      expect(math.abs(math.subtract(c1, math.complex(1, 0)))).toBeLessThan(1e-10);
      
      // |3/2, 1/2⟩ = √(2/3)|1, 1⟩|1/2, -1/2⟩ + √(1/3)|1, 0⟩|1/2, 1/2⟩
      const c2 = clebschGordan(1, 1, 0.5, -0.5, 1.5, 0.5);
      expect(math.abs(math.subtract(c2, math.complex(Math.sqrt(2/3), 0)))).toBeLessThan(1e-10);
      
      const c3 = clebschGordan(1, 0, 0.5, 0.5, 1.5, 0.5);
      expect(math.abs(math.subtract(c3, math.complex(Math.sqrt(1/3), 0)))).toBeLessThan(1e-10);
    });
  });
  
  describe('Angular Momentum Addition', () => {
    it('should correctly add two spin-1/2 states', () => {
      // Create |j1=1/2, m1=1/2⟩ and |j2=1/2, m2=1/2⟩
      const state1 = createState(0.5, 0.5);
      const state2 = createState(0.5, 0.5);
      
      // Add them to get |j=1, m=1⟩
      const combined = addAngularMomenta(state1, 0.5, state2, 0.5);
      
      // The result should be of dimension 4 (2*(0+1)+1 = 3 for j=1 + 1 for j=0)
      expect(combined.dimension).toBe(4);
      
      // The first element should be 1 (|j=1, m=1⟩ component)
      expect(math.abs(math.subtract(combined.amplitudes[0], math.complex(1, 0)))).toBeLessThan(1e-10);
      
      // The other elements should be 0 
      expect(math.abs(combined.amplitudes[1])).toBeLessThan(1e-10);
      expect(math.abs(combined.amplitudes[2])).toBeLessThan(1e-10);
      expect(math.abs(combined.amplitudes[3])).toBeLessThan(1e-10);
    });
  });
});
