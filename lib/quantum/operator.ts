/**
 * Quantum operator implementations
 */

import { Complex, StateVector, Operator, OperatorType } from './types';
import { 
  createComplex, multiplyComplex, addComplex, conjugateComplex,
  isZeroComplex 
} from './complex';

/**
 * Implementation of operator using matrix representation
 */
export class MatrixOperator implements Operator {
  readonly dimension: number;
  readonly type: OperatorType;
  private matrix: Complex[][];

  constructor(matrix: Complex[][], type: OperatorType = 'general') {
    // Validate matrix dimensions
    if (!matrix || matrix.length === 0) {
      throw new Error('Empty matrix provided');
    }
    
    const dim = matrix.length;
    if (!matrix.every(row => row.length === dim)) {
      throw new Error('Matrix must be square');
    }
    
    this.dimension = dim;
    this.type = type;
    this.matrix = matrix.map(row => row.map(elem => ({ ...elem })));
    
    // Validate type constraints
    if (type === 'hermitian') {
      if (!this.isHermitian()) {
        throw new Error('Matrix is not Hermitian');
      }
    } else if (type === 'unitary') {
      if (!this.isUnitary()) {
        throw new Error('Matrix is not unitary');
      }
    } else if (type === 'projection') {
      if (!this.isProjection()) {
        throw new Error('Matrix is not a projection');
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

    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        const term = multiplyComplex(this.matrix[i][j], state.amplitudes[j]);
        newAmplitudes[i] = addComplex(newAmplitudes[i], term);
      }
    }

    return {
      dimension: this.dimension,
      amplitudes: newAmplitudes,
      basis: state.basis
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

    // Determine adjoint operator type
    let adjointType: OperatorType = 'general';
    if (this.type === 'unitary') adjointType = 'unitary';
    if (this.type === 'hermitian') adjointType = 'hermitian';
    if (this.type === 'projection') adjointType = 'projection';

    return new MatrixOperator(adjointMatrix, adjointType);
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
    // Check if U†U = UU† = I
    const adjoint = this.adjoint();
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
