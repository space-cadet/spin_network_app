/**
 * Common test fixtures for quantum module tests
 */

import { Complex, StateVector } from '../../types';
import { HilbertSpace } from '../../hilbertSpace';
import { createComplex } from '../../complex';

/**
 * Standard test dimensions
 */
export const TEST_DIMS = {
  QUBIT: 2,
  QUTRIT: 3,
  SMALL: 4,
  MEDIUM: 8,
  LARGE: 16
};

/**
 * Standard basis states
 */
export const BASIS_STATES = {
  // Qubit basis states |0⟩ and |1⟩
  QUBIT_0: {
    dimension: 2,
    amplitudes: [createComplex(1, 0), createComplex(0, 0)],
    basis: '|0⟩'
  },
  QUBIT_1: {
    dimension: 2,
    amplitudes: [createComplex(0, 0), createComplex(1, 0)],
    basis: '|1⟩'
  },

  // Qutrit basis states |0⟩, |1⟩, |2⟩
  QUTRIT_0: {
    dimension: 3,
    amplitudes: [createComplex(1, 0), createComplex(0, 0), createComplex(0, 0)],
    basis: '|0⟩'
  },
  QUTRIT_1: {
    dimension: 3,
    amplitudes: [createComplex(0, 0), createComplex(1, 0), createComplex(0, 0)],
    basis: '|1⟩'
  },
  QUTRIT_2: {
    dimension: 3,
    amplitudes: [createComplex(0, 0), createComplex(0, 0), createComplex(1, 0)],
    basis: '|2⟩'
  }
};

/**
 * Common quantum states
 */
export const TEST_STATES = {
  // Single qubit states
  PLUS: {
    dimension: 2,
    amplitudes: [
      createComplex(1/Math.sqrt(2), 0),
      createComplex(1/Math.sqrt(2), 0)
    ],
    basis: '|+⟩'
  },
  MINUS: {
    dimension: 2,
    amplitudes: [
      createComplex(1/Math.sqrt(2), 0),
      createComplex(-1/Math.sqrt(2), 0)
    ],
    basis: '|-⟩'
  },
  
  // Bell states
  BELL_PHI_PLUS: {
    dimension: 4,
    amplitudes: [
      createComplex(1/Math.sqrt(2), 0),
      createComplex(0, 0),
      createComplex(0, 0),
      createComplex(1/Math.sqrt(2), 0)
    ],
    basis: '|Φ⁺⟩'
  },
  BELL_PHI_MINUS: {
    dimension: 4,
    amplitudes: [
      createComplex(1/Math.sqrt(2), 0),
      createComplex(0, 0),
      createComplex(0, 0),
      createComplex(-1/Math.sqrt(2), 0)
    ],
    basis: '|Φ⁻⟩'
  }
};

/**
 * Common Hilbert spaces
 */
export const TEST_SPACES = {
  QUBIT: new HilbertSpace(2, ['|0⟩', '|1⟩']),
  QUTRIT: new HilbertSpace(3, ['|0⟩', '|1⟩', '|2⟩']),
  TWO_QUBIT: new HilbertSpace(4, ['|00⟩', '|01⟩', '|10⟩', '|11⟩'])
};

/**
 * Common operators (as complex matrices)
 */
export const TEST_OPERATORS = {
  // Pauli matrices
  PAULI_X: [
    [createComplex(0, 0), createComplex(1, 0)],
    [createComplex(1, 0), createComplex(0, 0)]
  ],
  PAULI_Y: [
    [createComplex(0, 0), createComplex(0, -1)],
    [createComplex(0, 1), createComplex(0, 0)]
  ],
  PAULI_Z: [
    [createComplex(1, 0), createComplex(0, 0)],
    [createComplex(0, 0), createComplex(-1, 0)]
  ],
  
  // Identity gate
  IDENTITY_2: [
    [createComplex(1, 0), createComplex(0, 0)],
    [createComplex(0, 0), createComplex(1, 0)]
  ],
  
  // Hadamard gate
  HADAMARD: [
    [createComplex(1/Math.sqrt(2), 0), createComplex(1/Math.sqrt(2), 0)],
    [createComplex(1/Math.sqrt(2), 0), createComplex(-1/Math.sqrt(2), 0)]
  ],
  
  // CNOT gate
  CNOT: [
    [createComplex(1, 0), createComplex(0, 0), createComplex(0, 0), createComplex(0, 0)],
    [createComplex(0, 0), createComplex(1, 0), createComplex(0, 0), createComplex(0, 0)],
    [createComplex(0, 0), createComplex(0, 0), createComplex(0, 0), createComplex(1, 0)],
    [createComplex(0, 0), createComplex(0, 0), createComplex(1, 0), createComplex(0, 0)]
  ]
};