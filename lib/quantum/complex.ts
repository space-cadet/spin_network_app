/**
 * Enhanced complex number operations for quantum computations
 */

import { Complex } from './types';

/**
 * Creates a new complex number
 */
export function createComplex(re: number = 0, im: number = 0): Complex {
  return { re, im };
}

/**
 * Adds two complex numbers
 */
export function addComplex(a: Complex, b: Complex): Complex {
  return {
    re: a.re + b.re,
    im: a.im + b.im
  };
}

/**
 * Subtracts two complex numbers: a - b
 */
export function subtractComplex(a: Complex, b: Complex): Complex {
  return {
    re: a.re - b.re,
    im: a.im - b.im
  };
}

/**
 * Multiplies two complex numbers
 */
export function multiplyComplex(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  };
}

/**
 * Returns the complex conjugate
 */
export function conjugateComplex(c: Complex): Complex {
  return {
    re: c.re,
    im: -c.im
  };
}

/**
 * Returns the modulus (absolute value) of a complex number
 */
export function modulusComplex(c: Complex): number {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

/**
 * Checks if a complex number is approximately zero
 */
export function isZeroComplex(c: Complex, tolerance: number = 1e-10): boolean {
  return Math.abs(c.re) < tolerance && Math.abs(c.im) < tolerance;
}

/**
 * Divides two complex numbers: a / b
 */
export function divideComplex(a: Complex, b: Complex): Complex {
  const denom = b.re * b.re + b.im * b.im;
  if (isZeroComplex({ re: denom, im: 0 })) {
    throw new Error('Division by zero');
  }
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom
  };
}

/**
 * Returns the phase (argument) of a complex number in radians
 */
export function phaseComplex(c: Complex): number {
  return Math.atan2(c.im, c.re);
}

/**
 * Creates a complex number from magnitude and phase
 */
export function fromPolar(r: number, theta: number): Complex {
  return {
    re: r * Math.cos(theta),
    im: r * Math.sin(theta)
  };
}

/**
 * Returns e^(i*theta) as a complex number
 */
export function expComplex(theta: number): Complex {
  return fromPolar(1, theta);
}
