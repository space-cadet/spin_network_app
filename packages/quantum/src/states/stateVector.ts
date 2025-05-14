/**
 * Quantum state vector implementation
 */

import { Complex, IStateVector } from '../core/types';
import * as math from 'mathjs';
import { 
  validatePosDim, 
  validateIdx, 
  validateAmps 
} from '../utils/validation';

export class StateVector implements IStateVector {
  readonly dimension: number;
  readonly amplitudes: Complex[];
  readonly basis?: string;
  readonly properties?: Record<string, any>;

  constructor(
    dimension: number, 
    amplitudes?: Complex[], 
    basis?: string,
    properties?: Record<string, any>
  ) {
    validatePosDim(dimension);
    
    this.dimension = dimension;
    this.amplitudes = amplitudes || Array(dimension).fill(null)
      .map(() => math.complex(0, 0));
    this.basis = basis;
    this.properties = properties;

    if (amplitudes) {
      validateAmps(amplitudes, dimension);
    }
  }

  /**
   * Sets amplitude at specified index
   */
  setState(index: number, value: Complex): void {
    validateIdx(index, this.dimension);
    this.amplitudes[index] = value;
  }

  /**
   * Gets amplitude at specified index
   */
  getState(index: number): Complex {
    validateIdx(index, this.dimension);
    return this.amplitudes[index];
  }

  /**
   * Calculates inner product ⟨ψ|φ⟩ with another state
   */
  innerProduct(other: StateVector): Complex {
    if (this.dimension !== other.dimension) {
      throw new Error('States must have same dimension for inner product');
    }

    let result: Complex = math.complex(0, 0);
    for (let i = 0; i < this.dimension; i++) {
      const conj = math.conj(this.amplitudes[i]);
      const prod = math.multiply(conj, other.amplitudes[i]);
      result = math.add(result, prod) as Complex;
    }
    return result;
  }

  /**
   * Calculates norm of state vector
   */
  norm(): number {
    const innerProd = this.innerProduct(this);
    const abs = math.abs(innerProd) as unknown as number;
    return Math.sqrt(abs);
  }

  /**
   * Returns normalized version of state vector
   */
  normalize(): StateVector {
    const currentNorm = this.norm();
    if (currentNorm < 1e-10) {
      throw new Error('Cannot normalize zero state vector');
    }

    const normalizedAmplitudes = this.amplitudes.map(amp => 
      math.divide(amp, math.complex(currentNorm, 0)) as Complex
    );

    return new StateVector(this.dimension, normalizedAmplitudes, this.basis, this.properties);
  }

  /**
   * Computes tensor product with another state vector
   */
  tensorProduct(other: StateVector): StateVector {
    const newDimension = this.dimension * other.dimension;
    const newAmplitudes: Complex[] = [];

    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < other.dimension; j++) {
        newAmplitudes.push(math.multiply(
          this.amplitudes[i],
          other.amplitudes[j]
        ) as Complex);
      }
    }

    // Generate new basis label if both states have basis labels
    let newBasis: string | undefined;
    if (this.basis && other.basis) {
      newBasis = `${this.basis}⊗${other.basis}`;
    }

    return new StateVector(newDimension, newAmplitudes, newBasis, this.properties);
  }

  /**
   * Returns true if state is zero vector
   */
  isZero(tolerance: number = 1e-10): boolean {
    return this.amplitudes.every(amp => 
      (math.abs(amp) as unknown as number) < tolerance
    );
  }

  /**
   * Returns array representation of state vector
   */
  toArray(): Complex[] {
    return [...this.amplitudes];
  }

  /**
   * Returns string representation of state vector
   */
  toString(): string {
    const components = this.amplitudes
      .map((amp, i) => {
        if ((math.abs(amp) as unknown as number) < 1e-10) {
          return '';
        }
        const sign = i === 0 ? '' : ' + ';
        return `${sign}${amp.toString()}|${i}⟩`;
      })
      .filter(s => s !== '')
      .join('');

    return components || '0';
  }

  /**
   * Creates a computational basis state |i⟩
   */
  static computationalBasis(dimension: number, index: number): StateVector {
    validatePosDim(dimension);
    validateIdx(index, dimension);

    const amplitudes = Array(dimension).fill(null)
      .map((_, i) => i === index ? math.complex(1, 0) : math.complex(0, 0));
    
    return new StateVector(dimension, amplitudes, `|${index}⟩`);
  }

  /**
   * Returns array of all computational basis states
   */
  static computationalBasisStates(dimension: number): StateVector[] {
    validatePosDim(dimension);
    
    return Array(dimension).fill(null)
      .map((_, i) => StateVector.computationalBasis(dimension, i));
  }

  /**
   * Creates normalized superposition of basis states with given coefficients
   */
  static superposition(coefficients: Complex[]): StateVector {
    const dimension = coefficients.length;
    validatePosDim(dimension);

    return new StateVector(dimension, coefficients, 'superposition').normalize();
  }

  /**
   * Creates an equally weighted superposition of all basis states
   */
  static equalSuperposition(dimension: number): StateVector {
    validatePosDim(dimension);

    const coefficient = math.complex(1 / Math.sqrt(dimension), 0);
    const coefficients = Array(dimension).fill(coefficient);
    
    return new StateVector(dimension, coefficients, '|+⟩');
  }
}