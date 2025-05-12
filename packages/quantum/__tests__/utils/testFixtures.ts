/**
 * Common test fixtures for quantum module tests
 */

import { Complex } from '../../types';
import { StateVector } from '../../stateVector';
import { HilbertSpace } from '../../hilbertSpace';
import * as math from 'mathjs';

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
  QUBIT_0: new StateVector(2, [math.complex({re: 1, im:  0}), math.complex({re: 0, im:  0})], '|0⟩'),
  QUBIT_1: new StateVector(2, [math.complex({re: 0, im:  0}), math.complex({re: 1, im:  0})], '|1⟩'),

  // Qutrit basis states |0⟩, |1⟩, |2⟩
  QUTRIT_0: new StateVector(3, [
    math.complex({re: 1, im:  0}), 
    math.complex({re: 0, im:  0}), 
    math.complex({re: 0, im:  0})
  ], '|0⟩'),
  QUTRIT_1: new StateVector(3, [
    math.complex({re: 0, im:  0}), 
    math.complex({re: 1, im:  0}), 
    math.complex({re: 0, im:  0})
  ], '|1⟩'),
  QUTRIT_2: new StateVector(3, [
    math.complex({re: 0, im:  0}), 
    math.complex({re: 0, im:  0}), 
    math.complex({re: 1, im:  0})
  ], '|2⟩')
};

/**
 * Common quantum states
 */
export const TEST_STATES = {
  // Single qubit states
  PLUS: {
    dimension: 2,
    amplitudes: [
      math.complex({re: 1/Math.sqrt(2), im:  0}),
      math.complex({re: 1/Math.sqrt(2), im:  0})
    ],
    basis: '|+⟩'
  },
  MINUS: {
    dimension: 2,
    amplitudes: [
      math.complex({re: 1/Math.sqrt(2), im:  0}),
      math.complex({re: -1/Math.sqrt(2), im:  0})
    ],
    basis: '|-⟩'
  },
  
  // Bell states
  BELL_PHI_PLUS: {
    dimension: 4,
    amplitudes: [
      math.complex({re: 1/Math.sqrt(2), im:  0}),
      math.complex({re: 0, im:  0}),
      math.complex({re: 0, im:  0}),
      math.complex({re: 1/Math.sqrt(2), im:  0})
    ],
    basis: '|Φ⁺⟩'
  },
  BELL_PHI_MINUS: {
    dimension: 4,
    amplitudes: [
      math.complex({re: 1/Math.sqrt(2), im:  0}),
      math.complex({re: 0, im:  0}),
      math.complex({re: 0, im:  0}),
      math.complex({re: -1/Math.sqrt(2), im:  0})
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
    [math.complex({re: 0, im:  0}), math.complex({re: 1, im:  0})],
    [math.complex({re: 1, im:  0}), math.complex({re: 0, im:  0})]
  ],
  PAULI_Y: [
    [math.complex({re: 0, im:  0}), math.complex({re: 0, im:  -1})],
    [math.complex({re: 0, im:  1}), math.complex({re: 0, im:  0})]
  ],
  PAULI_Z: [
    [math.complex({re: 1, im:  0}), math.complex({re: 0, im:  0})],
    [math.complex({re: 0, im:  0}), math.complex({re: -1, im:  0})]
  ],
  
  // Identity gate
  IDENTITY_2: [
    [math.complex({re: 1, im:  0}), math.complex({re: 0, im:  0})],
    [math.complex({re: 0, im:  0}), math.complex({re: 1, im:  0})]
  ],
  
  // Hadamard gate
  HADAMARD: [
    [math.complex({re: 1/Math.sqrt(2), im:  0}), math.complex({re: 1/Math.sqrt(2), im:  0})],
    [math.complex({re: 1/Math.sqrt(2), im:  0}), math.complex({re: -1/Math.sqrt(2), im:  0})]
  ],
  
  // CNOT gate
  CNOT: [
    [math.complex({re: 1, im:  0}), math.complex({re: 0, im:  0}), math.complex({re: 0, im:  0}), math.complex({re: 0, im:  0})],
    [math.complex({re: 0, im:  0}), math.complex({re: 1, im:  0}), math.complex({re: 0, im:  0}), math.complex({re: 0, im:  0})],
    [math.complex({re: 0, im:  0}), math.complex({re: 0, im:  0}), math.complex({re: 0, im:  0}), math.complex({re: 1, im:  0})],
    [math.complex({re: 0, im:  0}), math.complex({re: 0, im:  0}), math.complex({re: 1, im:  0}), math.complex({re: 0, im:  0})]
  ]
};