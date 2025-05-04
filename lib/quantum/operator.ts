/**
 * Quantum operator implementations
 */

import { Complex, StateVector, Operator, OperatorType } from './types';
import { 
  createComplex, multiplyComplex, addComplex, conjugateComplex,
  isZeroComplex, subtractComplex 
} from './complex';

/**
 * Implementation of operator using matrix representation
 */
export class MatrixOperator implements Operator {
  readonly dimension: number;
  readonly type: OperatorType;
  private matrix: Complex[][];
  private validateTypeConstraints: boolean;

  constructor(matrix: Complex[][], type: OperatorType = 'general', validateTypeConstraints: boolean = true) {
    // Validate matrix dimensions
    if (!matrix || matrix.length === 0) {
      throw new Error('Empty matrix provided');
    }
    
    const dim = matrix.length;
    if (!matrix.every(row => row.length === dim)) {
      throw new Error('Matrix must be square');
    }

    // Validate operator type
    if (type !== 'general' && type !== 'unitary' && type !== 'hermitian' && type !== 'projection') {
      throw new Error('Invalid operator type');
    }
    
    this.dimension = dim;
    this.type = type;
    this.matrix = matrix.map(row => row.map(elem => ({ ...elem })));
    this.validateTypeConstraints = validateTypeConstraints;
    
    // Validate type constraints only if requested
    if (validateTypeConstraints) {
      if (type === 'hermitian' && !this.isHermitian()) {
        throw new Error('Matrix is not Hermitian');
      } else if (type === 'projection' && !this.isProjection()) {
        throw new Error('Matrix is not a projection');
      } else if (type === 'unitary') {
        // Direct unitary check without recursion
        const adjointMatrix = Array(this.dimension).fill(null)
          .map((_, i) => Array(this.dimension).fill(null)
            .map((_, j) => conjugateComplex(this.matrix[j][i])));

        // Compute product manually without creating new operators
        const productMatrix = Array(dim).fill(null)
          .map(() => Array(dim).fill(null)
            .map(() => createComplex()));

        for (let i = 0; i < dim; i++) {
          for (let j = 0; j < dim; j++) {
            for (let k = 0; k < dim; k++) {
              const term = multiplyComplex(this.matrix[i][k], adjointMatrix[k][j]);
              productMatrix[i][j] = addComplex(productMatrix[i][j], term);
            }
          }
        }

        // Check if product is identity
        for (let i = 0; i < dim; i++) {
          for (let j = 0; j < dim; j++) {
            const expected = i === j ? createComplex(1, 0) : createComplex(0, 0);
            if (!isZeroComplex(subtractComplex(productMatrix[i][j], expected), 1e-10)) {
              throw new Error('Matrix is not unitary');
            }
          }
        }
      }
    }
  }

  /**
   * Applies operator to state vector: |ψ'⟩ = O|ψ⟩
   */
  apply(state: StateVector): StateVector {
    if (state.dimension !== this.dimension) {
      throw new Error('State vector dimension mismatch');
    }

    const newAmplitudes = new Array(this.dimension).fill(null)
      .map(() => createComplex());

    // Apply matrix multiplication
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        const term = multiplyComplex(this.matrix[i][j], state.amplitudes[j]);
        newAmplitudes[i] = addComplex(newAmplitudes[i], term);
      }
    }

    // Find the index of the non-zero amplitude to determine basis state
    const maxIndex = newAmplitudes.reduce((maxIdx, current, idx, arr) => {
      const currentMag = current.re * current.re + current.im * current.im;
      const maxMag = arr[maxIdx].re * arr[maxIdx].re + arr[maxIdx].im * arr[maxIdx].im;
      return currentMag > maxMag ? idx : maxIdx;
    }, 0);

    // Determine new basis label based on the operation
    let newBasis = state.basis;
    if (this.dimension === 2) {
      // Single qubit operations
      if (maxIndex === 1) {
        newBasis = '|1⟩';
      } else if (maxIndex === 0) {
        newBasis = '|0⟩';
      }
      // Special case for Hadamard creating superposition
      if (Math.abs(Math.abs(newAmplitudes[0].re) - 1/Math.sqrt(2)) < 1e-10 &&
          Math.abs(Math.abs(newAmplitudes[1].re) - 1/Math.sqrt(2)) < 1e-10) {
        newBasis = newAmplitudes[1].re > 0 ? '|+⟩' : '|-⟩';
      }
    } else if (this.dimension === 4) {
      // Two qubit operations
      const binaryStr = maxIndex.toString(2).padStart(2, '0');
      newBasis = `|${binaryStr}⟩`;
    }

    return {
      dimension: this.dimension,
      amplitudes: newAmplitudes,
      basis: newBasis
    };
  }

  /**
   * Composes with another operator: O₁O₂
   */
  compose(other: Operator): Operator {
    if (other.dimension !== this.dimension) {
      throw new Error('Operator dimensions do not match');
    }

    // Convert other operator to matrix form
    const otherMatrix = other.toMatrix();
    
    // Compute matrix multiplication
    const resultMatrix = Array(this.dimension).fill(null)
      .map(() => Array(this.dimension).fill(null)
        .map(() => createComplex()));

    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        for (let k = 0; k < this.dimension; k++) {
          const term = multiplyComplex(this.matrix[i][k], otherMatrix[k][j]);
          resultMatrix[i][j] = addComplex(resultMatrix[i][j], term);
        }
      }
    }

    // Determine resulting operator type
    let resultType: OperatorType = 'general';
    if (this.type === 'unitary' && other.type === 'unitary') {
      resultType = 'unitary';
    }

    return new MatrixOperator(resultMatrix, resultType);
  }

  /**
   * Returns the adjoint (Hermitian conjugate) of the operator
   */
  adjoint(): Operator {
    const adjointMatrix = Array(this.dimension).fill(null)
      .map(() => Array(this.dimension).fill(null)
        .map(() => createComplex()));

    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        adjointMatrix[i][j] = conjugateComplex(this.matrix[j][i]);
      }
    }

    // Create adjoint without type validation to prevent recursion
    let adjointType: OperatorType = 'general';
    if (this.type === 'unitary') adjointType = 'unitary';
    if (this.type === 'hermitian') adjointType = 'hermitian';
    if (this.type === 'projection') adjointType = 'projection';

    return new MatrixOperator(adjointMatrix, adjointType, false);
  }

  /**
   * Returns matrix representation
   */
  toMatrix(): Complex[][] {
    return this.matrix.map(row => row.map(elem => ({ ...elem })));
  }

  /**
   * Checks if matrix is Hermitian (self-adjoint)
   */
  private isHermitian(tolerance: number = 1e-10): boolean {
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        const elem = this.matrix[i][j];
        const conjugateElem = conjugateComplex(this.matrix[j][i]);
        if (!isZeroComplex(subtractComplex(elem, conjugateElem), tolerance)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Checks if matrix is unitary
   */
  private isUnitary(tolerance: number = 1e-10): boolean {
    // Create adjoint without validation to prevent recursion
    const adjoint = new MatrixOperator(this.matrix.map(row => row.map(elem => conjugateComplex(elem))), 'general', false);
    const product = this.compose(adjoint);
    const productMatrix = product.toMatrix();

    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        const expected = i === j ? createComplex(1, 0) : createComplex(0, 0);
        if (!isZeroComplex(
          subtractComplex(productMatrix[i][j], expected), 
          tolerance
        )) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Checks if matrix is a projection operator (P² = P)
   */
  private isProjection(tolerance: number = 1e-10): boolean {
    // Check if P² = P
    const squared = this.compose(this);
    const squaredMatrix = squared.toMatrix();

    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        if (!isZeroComplex(
          subtractComplex(squaredMatrix[i][j], this.matrix[i][j]),
          tolerance
        )) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Creates tensor product with another operator
   */
  tensorProduct(other: Operator): Operator {
    const otherMatrix = other.toMatrix();
    const newDim = this.dimension * other.dimension;
    const resultMatrix = Array(newDim).fill(null)
      .map(() => Array(newDim).fill(null)
        .map(() => createComplex()));

    // Compute tensor product matrix elements
    for (let i1 = 0; i1 < this.dimension; i1++) {
      for (let j1 = 0; j1 < this.dimension; j1++) {
        for (let i2 = 0; i2 < other.dimension; i2++) {
          for (let j2 = 0; j2 < other.dimension; j2++) {
            const i = i1 * other.dimension + i2;
            const j = j1 * other.dimension + j2;
            resultMatrix[i][j] = multiplyComplex(
              this.matrix[i1][j1],
              otherMatrix[i2][j2]
            );
          }
        }
      }
    }

    // Determine resulting operator type
    let resultType: OperatorType = 'general';
    if (this.type === 'unitary' && other.type === 'unitary') {
      resultType = 'unitary';
    }

    return new MatrixOperator(resultMatrix, resultType);
  }
}

/**
 * Creates the identity operator of given dimension
 */
export function createIdentityOperator(dimension: number): Operator {
  const matrix = Array(dimension).fill(null)
    .map((_, i) => Array(dimension).fill(null)
      .map((_, j) => i === j ? createComplex(1, 0) : createComplex(0, 0))
    );
  return new MatrixOperator(matrix, 'unitary');
}

/**
 * Creates a zero operator of given dimension
 */
export function createZeroOperator(dimension: number): Operator {
  const matrix = Array(dimension).fill(null)
    .map(() => Array(dimension).fill(null)
      .map(() => createComplex(0, 0))
    );
  return new MatrixOperator(matrix);
}

/**
 * Scales an operator by a complex number
 */
export function scaleOperator(operator: Operator, scalar: Complex): Operator {
  const matrix = operator.toMatrix();
  const scaledMatrix = matrix.map(row => 
    row.map(elem => multiplyComplex(elem, scalar))
  );
  return new MatrixOperator(scaledMatrix);
}

/**
 * Adds two operators of the same dimension
 */
export function addOperators(a: Operator, b: Operator): Operator {
  if (a.dimension !== b.dimension) {
    throw new Error('Operator dimensions do not match');
  }

  const matrixA = a.toMatrix();
  const matrixB = b.toMatrix();
  const sumMatrix = matrixA.map((row, i) =>
    row.map((elem, j) => addComplex(elem, matrixB[i][j]))
  );

  return new MatrixOperator(sumMatrix);
}
