/**
 * Core quantum gates implementation
 */

import { MatrixOperator } from './operator';
import { createComplex } from './complex';

// Pauli X (bit flip) gate
export const PauliX = new MatrixOperator([
    [createComplex(0, 0), createComplex(1, 0)],
    [createComplex(1, 0), createComplex(0, 0)]
], 'unitary');

// Pauli Y gate
export const PauliY = new MatrixOperator([
    [createComplex(0, 0), createComplex(0, -1)],
    [createComplex(0, 1), createComplex(0, 0)]
], 'unitary');

// Pauli Z (phase flip) gate
export const PauliZ = new MatrixOperator([
    [createComplex(1, 0), createComplex(0, 0)],
    [createComplex(0, 0), createComplex(-1, 0)]
], 'unitary');

// Hadamard gate
export const Hadamard = new MatrixOperator([
    [createComplex(1/Math.sqrt(2), 0), createComplex(1/Math.sqrt(2), 0)],
    [createComplex(1/Math.sqrt(2), 0), createComplex(-1/Math.sqrt(2), 0)]
], 'unitary');

// CNOT (Controlled-NOT) gate for 2-qubit system
export const CNOT = new MatrixOperator([
    [createComplex(1, 0), createComplex(0, 0), createComplex(0, 0), createComplex(0, 0)],
    [createComplex(0, 0), createComplex(1, 0), createComplex(0, 0), createComplex(0, 0)],
    [createComplex(0, 0), createComplex(0, 0), createComplex(0, 0), createComplex(1, 0)],
    [createComplex(0, 0), createComplex(0, 0), createComplex(1, 0), createComplex(0, 0)]
], 'unitary');