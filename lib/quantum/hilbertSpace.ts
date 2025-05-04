/**
 * Hilbert space implementation supporting composition and tensor products
 */

import { Complex, StateVector } from './types';
import { createComplex, multiplyComplex } from './complex';

/**
 * Represents a quantum Hilbert space with dimension and optional basis labels
 */
export class HilbertSpace {
  readonly dimension: number;
  readonly basis: string[];

  constructor(dimension: number, basis?: string[]) {
    if (dimension < 1) {
      throw new Error('Hilbert space dimension must be positive');
    }
    
    this.dimension = dimension;
    this.basis = basis || Array(dimension).fill(null)
      .map((_, i) => `|${i}⟩`);

    if (basis && basis.length !== dimension) {
      throw new Error('Number of basis labels must match dimension');
    }
  }

  /**
   * Creates tensor product of two Hilbert spaces: H₁ ⊗ H₂
   */
  static compose(space1: HilbertSpace, space2: HilbertSpace): HilbertSpace {
    const newDimension = space1.dimension * space2.dimension;
    
    // Generate basis labels for product space
    const newBasis: string[] = [];
    for (let i = 0; i < space1.dimension; i++) {
      for (let j = 0; j < space2.dimension; j++) {
        newBasis.push(`${space1.basis[i]}⊗${space2.basis[j]}`);
      }
    }

    return new HilbertSpace(newDimension, newBasis);
  }

  /**
   * Decomposes a Hilbert space into tensor product factors
   * @param space The space to decompose
   * @param dims Array of dimensions that should multiply to space dimension
   */
  static decompose(space: HilbertSpace, dims: number[]): HilbertSpace[] {
    // Validate dimensions
    const product = dims.reduce((a, b) => a * b, 1);
    if (product !== space.dimension) {
      throw new Error('Product of dimensions must equal space dimension');
    }

    // Create factor spaces
    return dims.map((dim, i) => {
      // Extract relevant basis labels if possible
      const basisStart = i * dim;
      const basis = space.basis.slice(basisStart, basisStart + dim);
      return new HilbertSpace(dim, basis);
    });
  }

  /**
   * Creates tensor product with another space: this ⊗ other
   */
  tensorProduct(other: HilbertSpace): HilbertSpace {
    return HilbertSpace.compose(this, other);
  }

  /**
   * Performs partial trace over specified subsystems
   * @param subsystemDims Dimensions of subsystems to trace out
   */
  partialTrace(subsystemDims: number[]): HilbertSpace {
    // Validate subsystem dimensions
    const subsystemProduct = subsystemDims.reduce((a, b) => a * b, 1);
    if (subsystemProduct >= this.dimension) {
      throw new Error('Cannot trace out entire space or more');
    }

    // Calculate remaining dimension
    const remainingDim = this.dimension / subsystemProduct;
    
    // Generate new basis labels
    const newBasis = this.basis.slice(0, remainingDim);

    return new HilbertSpace(remainingDim, newBasis);
  }

  /**
   * Checks if a state vector belongs to this Hilbert space
   */
  containsState(state: StateVector): boolean {
    return state.dimension === this.dimension;
  }

  /**
   * Creates a computational basis state |i⟩
   */
  computationalBasisState(i: number): StateVector {
    if (i < 0 || i >= this.dimension) {
      throw new Error('Basis state index out of range');
    }

    const amplitudes = Array(this.dimension).fill(null)
      .map((_, j) => i === j ? createComplex(1, 0) : createComplex(0, 0));

    return {
      dimension: this.dimension,
      amplitudes,
      basis: this.basis[i]
    };
  }

  /**
   * Returns array of all computational basis states
   */
  computationalBasis(): StateVector[] {
    return Array(this.dimension).fill(null)
      .map((_, i) => this.computationalBasisState(i));
  }

  /**
   * Creates normalized superposition of basis states with given coefficients
   */
  superposition(coefficients: Complex[]): StateVector {
    if (coefficients.length !== this.dimension) {
      throw new Error('Number of coefficients must match dimension');
    }

    // Calculate normalization factor
    let normSquared = 0;
    for (const coeff of coefficients) {
      const { re, im } = coeff;
      normSquared += re * re + im * im;
    }
    const normFactor = Math.sqrt(normSquared);

    // Create normalized amplitudes
    const amplitudes = coefficients.map(coeff => ({
      re: coeff.re / normFactor,
      im: coeff.im / normFactor
    }));

    return {
      dimension: this.dimension,
      amplitudes,
      basis: 'superposition'
    };
  }

  /**
   * Extends this space to a larger space by tensoring with auxiliary space
   * @param auxDimension Dimension of auxiliary space
   * @param position Position to insert this space (0 = leftmost)
   */
  extendToLargerSpace(auxDimension: number, position: number = 0): HilbertSpace {
    const auxSpace = new HilbertSpace(auxDimension);
    
    if (position === 0) {
      return this.tensorProduct(auxSpace);
    } else {
      return auxSpace.tensorProduct(this);
    }
  }

  /**
   * Creates an equally weighted superposition of all basis states
   */
  equalSuperposition(): StateVector {
    const coefficient = createComplex(1 / Math.sqrt(this.dimension), 0);
    return this.superposition(Array(this.dimension).fill(coefficient));
  }

  /**
   * Returns string representation of the Hilbert space
   */
  toString(): string {
    return `HilbertSpace(dim=${this.dimension}, basis=[${this.basis.join(', ')}])`;
  }
}
