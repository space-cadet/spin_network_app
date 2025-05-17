import { describe, it, expect } from 'vitest';

import { Complex } from '../../src/core/types';
import {
  createState,
  createCoherentState,
  createJz,
  createJplus,
  createJminus,
  jmExpectationValue
} from '../../src/angularMomentum/core';
import * as math from 'mathjs';

describe('Angular Momentum States', () => {
  // Test basic state creation
  describe('State Creation', () => {
    it('should create valid states for j=1/2', () => {
      expect(() => createState(1/2, 1/2)).not.toThrow();
      expect(() => createState(1/2, -1/2)).not.toThrow();
    });

    it('should throw for invalid m values', () => {
      expect(() => createState(1/2, 3/2)).toThrow();
      expect(() => createState(1, 1.5)).toThrow();
    });

    it('should create normalized states', () => {
      const state = createState(1/2, 1/2);
      expect(math.abs(math.subtract(state.norm(), 1)) < 1e-10).toBe(true);
    });
  });

  // Test state vectors for j=1/2
  describe('j=1/2 State Vectors', () => {
    it('should have correct components for |1/2,1/2⟩', () => {
      const stateUp = createState(1/2, 1/2);
      const components = stateUp.getAmplitudes();
      
      expect(math.abs(math.subtract(components[0], math.complex(1, 0))) < 1e-10).toBe(true);
      expect(math.abs(components[1]) < 1e-10).toBe(true);
    });

    it('should have correct components for |1/2,-1/2⟩', () => {
      const stateDown = createState(1/2, -1/2);
      const components = stateDown.getAmplitudes();
      
      expect(math.abs(components[0]) < 1e-10).toBe(true);
      expect(math.abs(math.subtract(components[1], math.complex(1, 0))) < 1e-10).toBe(true);
    });
  });

  // Test raising and lowering operators on states
  describe('Raising and Lowering Operations', () => {
    const j = 1;
    const jplus = createJplus(j);
    const jminus = createJminus(j);

    it('should correctly raise states', () => {
      const state = createState(j, -1);
      const raised = jplus.apply(state);
      const expectedNorm = Math.sqrt(j*(j+1) - (-1)*0);
      
      // Compare with |j,m+1⟩ scaled by √(j(j+1)-m(m+1))
      const expectedState = createState(j, 0).scale(math.complex(expectedNorm, 0));
      expect(raised.equals(expectedState)).toBe(true);
    });

    it('should correctly lower states', () => {
      const state = createState(j, 0);
      const lowered = jminus.apply(state);
      const expectedNorm = Math.sqrt(j*(j+1) - (-1)*0);
      
      // Compare with |j,m-1⟩ scaled by √(j(j+1)-m(m-1))
      const expectedState = createState(j, -1).scale(math.complex(expectedNorm, 0));
      expect(lowered.equals(expectedState)).toBe(true);
    });

    it('should annihilate highest/lowest weight states', () => {
      const highest = createState(j, j);
      const lowest = createState(j, -j);
      
      const raisedHighest = jplus.apply(highest);
      const loweredLowest = jminus.apply(lowest);
      
      expect(raisedHighest.norm() < 1e-10).toBe(true);
      expect(loweredLowest.norm() < 1e-10).toBe(true);
    });
  });

  // Test coherent states
  describe('Coherent States', () => {
    const j = 1/2;

    it('should create normalized coherent states', () => {
      const state = createCoherentState(j, Math.PI/4, Math.PI/3);
      expect(math.abs(math.subtract(state.norm(), 1)) < 1e-10).toBe(true);
    });

    it('should give expected Jz expectation values', () => {
      // θ = 0 should give maximum Jz
      const stateUp = createCoherentState(j, 0, 0);
      const jz = createJz(j);
      
      const expectValue = jmExpectationValue(jz, j, 1/2);
      expect(math.abs(math.subtract(expectValue, math.complex(1/2, 0))) < 1e-10).toBe(true);
    });
  });
});
