/**
 * Tests for complex number operations
 */

import { describe, it, expect } from '@jest/globals';
import {
  createComplex,
  addComplex,
  subtractComplex,
  multiplyComplex,
  conjugateComplex,
  modulusComplex,
  isZeroComplex
} from '../complex';
import { Complex } from '../types';
import { complexApproxEqual } from './utils/testHelpers';

describe('Complex Number Operations', () => {
  describe('createComplex', () => {
    it('creates complex number with zero imaginary part by default', () => {
      const z = createComplex(1);
      expect(z).toEqual({ re: 1, im: 0 });
    });

    it('creates complex number with given real and imaginary parts', () => {
      const z = createComplex(1, 2);
      expect(z).toEqual({ re: 1, im: 2 });
    });
  });

  describe('addComplex', () => {
    it('adds two complex numbers', () => {
      const a = createComplex(1, 2);
      const b = createComplex(3, 4);
      const sum = addComplex(a, b);
      expect(sum).toEqual({ re: 4, im: 6 });
    });

    it('handles addition with zero', () => {
      const a = createComplex(1, 2);
      const zero = createComplex(0, 0);
      const sum = addComplex(a, zero);
      expect(sum).toEqual(a);
    });
  });

  describe('subtractComplex', () => {
    it('subtracts two complex numbers', () => {
      const a = createComplex(3, 4);
      const b = createComplex(1, 2);
      const diff = subtractComplex(a, b);
      expect(diff).toEqual({ re: 2, im: 2 });
    });

    it('handles subtraction with zero', () => {
      const a = createComplex(1, 2);
      const zero = createComplex(0, 0);
      const diff = subtractComplex(a, zero);
      expect(diff).toEqual(a);
    });
  });

  describe('multiplyComplex', () => {
    it('multiplies two complex numbers', () => {
      const a = createComplex(1, 2);
      const b = createComplex(3, 4);
      const product = multiplyComplex(a, b);
      expect(product).toEqual({ re: -5, im: 10 });
    });

    it('handles multiplication by i', () => {
      const a = createComplex(1, 2);
      const i = createComplex(0, 1);
      const product = multiplyComplex(a, i);
      expect(product).toEqual({ re: -2, im: 1 });
    });

    it('handles multiplication by zero', () => {
      const a = createComplex(1, 2);
      const zero = createComplex(0, 0);
      const product = multiplyComplex(a, zero);
      expect(product).toEqual(zero);
    });
  });

  describe('conjugateComplex', () => {
    it('conjugates a complex number', () => {
      const z = createComplex(1, 2);
      const conj = conjugateComplex(z);
      expect(conj).toEqual({ re: 1, im: -2 });
    });

    it('conjugate of real number is itself', () => {
      const real = createComplex(1, 0);
      const conj = conjugateComplex(real);
      expect(conj).toEqual(real);
    });
  });

  describe('modulusComplex', () => {
    it('calculates modulus of complex number', () => {
      const z = createComplex(3, 4);
      expect(modulusComplex(z)).toBe(5);
    });

    it('handles zero', () => {
      const zero = createComplex(0, 0);
      expect(modulusComplex(zero)).toBe(0);
    });

    it('handles real numbers', () => {
      const real = createComplex(3, 0);
      expect(modulusComplex(real)).toBe(3);
    });

    it('handles purely imaginary numbers', () => {
      const imag = createComplex(0, 4);
      expect(modulusComplex(imag)).toBe(4);
    });
  });

  describe('isZeroComplex', () => {
    it('identifies exact zero', () => {
      const zero = createComplex(0, 0);
      expect(isZeroComplex(zero)).toBe(true);
    });

    it('identifies non-zero numbers', () => {
      const nonZero = createComplex(1, 1);
      expect(isZeroComplex(nonZero)).toBe(false);
    });

    it('handles numerical tolerance', () => {
      const almostZero = createComplex(1e-11, -1e-11);
      expect(isZeroComplex(almostZero, 1e-10)).toBe(true);
      expect(isZeroComplex(almostZero, 1e-12)).toBe(false);
    });
  });

  describe('complexApproxEqual', () => {
    it('identifies equal complex numbers', () => {
      const a = createComplex(1, 2);
      const b = createComplex(1, 2);
      expect(complexApproxEqual(a, b)).toBe(true);
    });

    it('identifies unequal complex numbers', () => {
      const a = createComplex(1, 2);
      const b = createComplex(1, 3);
      expect(complexApproxEqual(a, b)).toBe(false);
    });

    it('handles numerical tolerance', () => {
      const a = createComplex(1, 2);
      const b = createComplex(1 + 1e-11, 2 - 1e-11);
      expect(complexApproxEqual(a, b, 1e-10)).toBe(true);
      expect(complexApproxEqual(a, b, 1e-12)).toBe(false);
    });
  });
});