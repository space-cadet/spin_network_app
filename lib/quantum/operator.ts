/**
 * Quantum operator implementations
 */

import { Complex, StateVector as IStateVector, OperatorType, Operator } from './types';
import { 
  createComplex, multiplyComplex, addComplex, conjugateComplex,
  isZeroComplex, subtractComplex 
} from './complex';
import { StateVector } from './stateVector';
import { validateMatDims, validateMatchDims } from './utils/validation';
import { eigenDecomposition } from './matrixOperations';

/** 
 * Implementation of operator using matrix representation
 */
export class MatrixOperator implements Operator {
  readonly dimension: number;
  readonly type: OperatorType;
  private matrix: Complex[][];
  private validateTypeConstraints: boolean;

  constructor(matrix: Complex[][], type: OperatorType = 'general', validateTypeConstraints: boolean = true) {
    validateMatDims(matrix);
    
    const dim = matrix.length;
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
  apply(state: IStateVector): IStateVector {
    validateMatchDims(state.dimension, this.dimension);

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

    return new StateVector(this.dimension, newAmplitudes, newBasis);
  }

  /**
   * Composes with another operator: O₁O₂
   */
  compose(other: Operator): Operator {
    validateMatchDims(other.dimension, this.dimension);

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

  /**
   * Creates the identity operator of given dimension
   */
  static identity(dimension: number): MatrixOperator {
    const matrix = Array(dimension).fill(null)
      .map((_, i) => Array(dimension).fill(null)
        .map((_, j) => i === j ? createComplex(1, 0) : createComplex(0, 0))
      );
    return new MatrixOperator(matrix, 'unitary');
  }

  /**
   * Creates a zero operator of given dimension
   */
  static zero(dimension: number): MatrixOperator {
    const matrix = Array(dimension).fill(null)
      .map(() => Array(dimension).fill(null)
        .map(() => createComplex(0, 0))
      );
    return new MatrixOperator(matrix);
  }

  /**
   * Scales operator by a complex number
   */
  scale(scalar: Complex): MatrixOperator {
    const scaledMatrix = this.matrix.map(row => 
      row.map(elem => multiplyComplex(elem, scalar))
    );
    return new MatrixOperator(scaledMatrix);
  }

  /**
   * Adds this operator with another operator
   */
  add(other: Operator): MatrixOperator {
    validateMatchDims(other.dimension, this.dimension);

    const otherMatrix = other.toMatrix();
    const sumMatrix = this.matrix.map((row, i) =>
      row.map((elem, j) => addComplex(elem, otherMatrix[i][j]))
    );

    return new MatrixOperator(sumMatrix);
  }

  /**
   * Performs partial trace over specified subsystems
   */
  partialTrace(dims: number[], traceOutIndices: number[]): Operator {
    // Validate dimensions
    const totalDim = dims.reduce((a, b) => a * b, 1);
    if (totalDim !== this.dimension) {
      throw new Error('Product of subsystem dimensions must equal total dimension');
    }

    // Validate trace indices
    if (!traceOutIndices.every(i => i >= 0 && i < dims.length)) {
      throw new Error('Invalid trace out indices');
    }

    // Calculate remaining dimension after trace
    const remainingDim = dims.filter((_, i) => !traceOutIndices.includes(i))
      .reduce((a, b) => a * b, 1);

    // Initialize result matrix
    const resultMatrix = Array(remainingDim).fill(null)
      .map(() => Array(remainingDim).fill(null)
        .map(() => createComplex(0, 0)));

    // Perform partial trace
    const traceRange = Array(this.dimension).fill(0)
      .map((_, i) => i);

    // Implementation of partial trace operation...
    // This is a simplified version - would need to be expanded for full functionality
    for (let i = 0; i < remainingDim; i++) {
      for (let j = 0; j < remainingDim; j++) {
        for (const k of traceRange) {
          // Map indices to multi-dimensional coordinates
          const iCoords = indexToCoords(i, dims.filter((_, idx) => !traceOutIndices.includes(idx)));
          const jCoords = indexToCoords(j, dims.filter((_, idx) => !traceOutIndices.includes(idx)));
          const kCoords = indexToCoords(k, dims.filter((_, idx) => traceOutIndices.includes(idx)));
          
          // Combine coordinates
          const fullICoords = combineCoords(iCoords, kCoords, traceOutIndices);
          const fullJCoords = combineCoords(jCoords, kCoords, traceOutIndices);
          
          // Map back to flat indices
          const fullI = coordsToIndex(fullICoords, dims);
          const fullJ = coordsToIndex(fullJCoords, dims);
          
          // Add to result
          resultMatrix[i][j] = addComplex(
            resultMatrix[i][j],
            this.matrix[fullI][fullJ]
          );
        }
      }
    }

    return new MatrixOperator(resultMatrix);
  }

  /**
   * Returns eigenvalues and eigenvectors of the operator
   * Only works for Hermitian operators
   */
  eigenDecompose(): { values: Complex[]; vectors: MatrixOperator[] } {
    const { values, vectors } = eigenDecomposition(this.matrix);
    return {
      values,
      vectors: vectors.map(v => new MatrixOperator([v], 'general'))
    };
  }

  /**
   * Projects onto eigenspace with given eigenvalue
   */
  projectOntoEigenspace(eigenvalue: Complex, tolerance: number = 1e-10): MatrixOperator {
    const { values, vectors } = this.eigenDecompose();
    
    // Find eigenvectors for this eigenvalue
    const matchingVectors = vectors.filter((_, i) => 
      Math.abs(values[i].re - eigenvalue.re) < tolerance &&
      Math.abs(values[i].im - eigenvalue.im) < tolerance
    );

    if (matchingVectors.length === 0) {
      throw new Error('No eigenvectors found for given eigenvalue');
    }

    // Construct projection operator
    return matchingVectors.reduce((sum, vector) => {
      const vectorMatrix = vector.toMatrix()[0]; // Get the first row since vector is 1xN matrix
      const proj = new MatrixOperator([vectorMatrix], 'projection');
      return sum ? sum.add(proj) : proj;
    });
  }
}

// Helper functions for partial trace implementation
function indexToCoords(index: number, dims: number[]): number[] {
  const coords: number[] = [];
  let remainder = index;
  for (let i = dims.length - 1; i >= 0; i--) {
    coords.unshift(remainder % dims[i]);
    remainder = Math.floor(remainder / dims[i]);
  }
  return coords;
}

function coordsToIndex(coords: number[], dims: number[]): number {
  let index = 0;
  let factor = 1;
  for (let i = coords.length - 1; i >= 0; i--) {
    index += coords[i] * factor;
    factor *= dims[i];
  }
  return index;
}

function combineCoords(coords1: number[], coords2: number[], traceIndices: number[]): number[] {
  const result: number[] = [];
  let i1 = 0;
  let i2 = 0;
  for (let i = 0; i < coords1.length + coords2.length; i++) {
    if (traceIndices.includes(i)) {
      result.push(coords2[i2++]);
    } else {
      result.push(coords1[i1++]);
    }
  }
  return result;
}
