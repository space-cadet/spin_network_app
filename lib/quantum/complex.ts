/**
 * Enhanced complex number operations for quantum computations using math.js
 */

import { Complex } from './types';
import * as math from 'mathjs';

/**
 * Creates a new complex number
 */
export function createComplex(re: number = 0, im: number = 0): Complex {
  return math.complex(re, im);
}

/**
 * Adds two complex numbers
 */
export function addComplex(a: Complex, b: Complex): Complex {
  return math.add(a, b) as Complex;
}

/**
 * Subtracts two complex numbers: a - b
 */
export function subtractComplex(a: Complex, b: Complex): Complex {
  return math.subtract(a, b) as Complex;
}

/**
 * Multiplies two complex numbers
 */
export function multiplyComplex(a: Complex, b: Complex): Complex {
  return math.multiply(a, b) as Complex;
}

/**
 * Returns the complex conjugate
 */
export function conjugateComplex(c: Complex): Complex {
  return math.conj(c) as Complex;
}

/**
 * Returns the modulus (absolute value) of a complex number
 */
export function modulusComplex(c: Complex): number {
  return math.abs(c);
}

/**
 * Checks if a complex number is approximately zero
 */
export function isZeroComplex(c: Complex, tolerance: number = 1e-10): boolean {
  return math.abs(c) < tolerance;
}

/**
 * Divides two complex numbers: a / b
 */
export function divideComplex(a: Complex, b: Complex): Complex {
  if (isZeroComplex(b)) {
    throw new Error('Division by zero');
  }
  return math.divide(a, b) as Complex;
}

/**
 * Returns the phase (argument) of a complex number in radians
 */
export function phaseComplex(c: Complex): number {
  return math.arg(c);
}

/**
 * Creates a complex number from magnitude and phase
 */
export function fromPolar(r: number, theta: number): Complex {
  return math.multiply(
    r,
    math.exp(math.complex(0, theta))
  ) as Complex;
}

/**
 * Returns e^(i*theta) as a complex number
 */
export function expComplex(theta: number): Complex {
  return math.exp(math.complex(0, theta)) as Complex;
}
