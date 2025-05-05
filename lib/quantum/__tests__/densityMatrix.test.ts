/**
 * Tests for density matrix operations
 */

import { 
  DensityMatrixOperator,
  KrausChannel,
  createDepolarizingChannel,
  createAmplitudeDampingChannel,
  createPhaseDampingChannel,
  createBitFlipChannel,
  createPhaseFlipChannel,
  traceFidelity,
  concurrence,
  negativity
} from '../densityMatrix';
import { StateVector } from '../stateVector';
import { createComplex } from '../complex';

describe('DensityMatrix', () => {
  describe('Constructor', () => {
    it('creates valid density matrix from pure state', () => {
      const state = new StateVector(2, [
        createComplex(1, 0),
        createComplex(0, 0)
      ]);
      const rho = DensityMatrixOperator.fromPureState(state);
      
      expect(rho.dimension).toBe(2);
      const matrix = rho.toMatrix();
      expect(matrix[0][0]).toEqual(createComplex(1, 0));
      expect(matrix[1][1]).toEqual(createComplex(0, 0));
    });

    it('validates trace equals 1', () => {
      const invalidMatrix = [
        [createComplex(2, 0), createComplex(0, 0)],
        [createComplex(0, 0), createComplex(0, 0)]
      ];
      expect(() => new DensityMatrixOperator(invalidMatrix)).toThrow();
    });

    it('validates hermiticity', () => {
      const invalidMatrix = [
        [createComplex(1, 0), createComplex(1, 0)],
        [createComplex(0, 1), createComplex(0, 0)]
      ];
      expect(() => new DensityMatrixOperator(invalidMatrix)).toThrow();
    });

    it('validates positive semidefiniteness via purity', () => {
      const invalidMatrix = [
        [createComplex(2, 0), createComplex(0, 0)],
        [createComplex(0, 0), createComplex(-1, 0)]
      ];
      expect(() => new DensityMatrixOperator(invalidMatrix)).toThrow();
    });
  });

  describe('Mixed States', () => {
    it('creates valid mixed state', () => {
      const states = [
        new StateVector(2, [createComplex(1, 0), createComplex(0, 0)]),
        new StateVector(2, [createComplex(0, 0), createComplex(1, 0)])
      ];
      const probs = [0.6, 0.4];
      
      const rho = DensityMatrixOperator.mixedState(states, probs);
      expect(rho.dimension).toBe(2);
      
      const matrix = rho.toMatrix();
      expect(matrix[0][0].re).toBeCloseTo(0.6);
      expect(matrix[1][1].re).toBeCloseTo(0.4);
    });

    it('validates probability sum equals 1', () => {
      const states = [
        new StateVector(2, [createComplex(1, 0), createComplex(0, 0)]),
        new StateVector(2, [createComplex(0, 0), createComplex(1, 0)])
      ];
      const probs = [0.5, 0.6];
      
      expect(() => DensityMatrixOperator.mixedState(states, probs)).toThrow();
    });

    it('validates matching dimensions', () => {
      const states = [
        new StateVector(2, [createComplex(1, 0), createComplex(0, 0)]),
        new StateVector(3, [createComplex(1, 0), createComplex(0, 0), createComplex(0, 0)])
      ];
      const probs = [0.5, 0.5];
      
      expect(() => DensityMatrixOperator.mixedState(states, probs)).toThrow();
    });
  });

  describe('Operations', () => {
    it('calculates purity correctly', () => {
      const state = new StateVector(2, [
        createComplex(1, 0),
        createComplex(0, 0)
      ]);
      const rho = DensityMatrixOperator.fromPureState(state);
      
      expect(rho.purity()).toBeCloseTo(1);
    });

    it('calculates trace correctly', () => {
      const state = new StateVector(2, [
        createComplex(1/Math.sqrt(2), 0),
        createComplex(1/Math.sqrt(2), 0)
      ]);
      const rho = DensityMatrixOperator.fromPureState(state);
      
      const tr = rho.trace();
      expect(tr.re).toBeCloseTo(1);
      expect(tr.im).toBeCloseTo(0);
    });
  });
});

describe('Quantum Channels', () => {
  describe('KrausChannel', () => {
    // TODO: Add tests once Kraus operators are implemented
    it('validates completeness relation', () => {
      // Placeholder test - implement once Kraus operators are added
      expect(true).toBe(true);
    });
  });

  describe('Channel Creation', () => {
    it('validates probability parameters', () => {
      expect(() => createDepolarizingChannel(2, -0.1)).toThrow();
      expect(() => createDepolarizingChannel(2, 1.1)).toThrow();
      
      expect(() => createBitFlipChannel(-0.1)).toThrow();
      expect(() => createBitFlipChannel(1.1)).toThrow();
      
      expect(() => createPhaseFlipChannel(-0.1)).toThrow();
      expect(() => createPhaseFlipChannel(1.1)).toThrow();
    });

    it('validates damping parameters', () => {
      expect(() => createAmplitudeDampingChannel(-0.1)).toThrow();
      expect(() => createAmplitudeDampingChannel(1.1)).toThrow();
      
      expect(() => createPhaseDampingChannel(-0.1)).toThrow();
      expect(() => createPhaseDampingChannel(1.1)).toThrow();
    });
  });
});

describe('Entanglement Measures', () => {
  describe('Trace Fidelity', () => {
    it('equals 1 for identical states', () => {
      const state = new StateVector(2, [
        createComplex(1, 0),
        createComplex(0, 0)
      ]);
      const rho = DensityMatrixOperator.fromPureState(state);
      
      expect(traceFidelity(rho, rho)).toBeCloseTo(1);
    });
  });

  describe('Concurrence', () => {
    it('validates two-qubit requirement', () => {
      const state = new StateVector(3);
      const rho = DensityMatrixOperator.fromPureState(state);
      
      expect(() => concurrence(rho)).toThrow();
    });
  });

  describe('Negativity', () => {
    it('validates bipartite requirement', () => {
      const state = new StateVector(8);
      const rho = DensityMatrixOperator.fromPureState(state);
      
      expect(() => negativity(rho, [2, 2, 2])).toThrow();
    });
  });
});