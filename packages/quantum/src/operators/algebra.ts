/**
 * Operator algebra extensions for quantum mechanics
 * 
 * Provides fundamental operator algebra operations including commutators, 
 * anti-commutators, Lie algebraic structures, and more.
 */

import { Complex, Operator, StateVector } from '../core/types';
import { MatrixOperator } from './operator';
import { matrixExponential } from '../utils/matrixOperations';
import * as math from 'mathjs';

/**
 * Adds two operators
 * 
 * @param a First operator
 * @param b Second operator
 * @returns The sum operator
 */
export function addOperators(a: Operator, b: Operator): Operator {
  if (a.dimension !== b.dimension) {
    throw new Error('Operator dimensions do not match');
  }
  return a.add(b);
}

/**
 * Subtracts one operator from another
 * 
 * @param a First operator
 * @param b Second operator to subtract
 * @returns The difference operator
 */
export function subtractOperators(a: Operator, b: Operator): Operator {
  if (a.dimension !== b.dimension) {
    throw new Error('Operator dimensions do not match');
  }
  return a.add(b.scale(math.complex(-1, 0)));
}

/**
 * Calculates the commutator [A,B] = AB - BA between two operators
 * 
 * Used for determining whether operators commute, which is essential
 * for determining if observables can be measured simultaneously.
 * 
 * @param A First operator
 * @param B Second operator
 * @returns The commutator operator [A,B]
 */
export function commutator(A: Operator, B: Operator): Operator {
  if (A.dimension !== B.dimension) {
    throw new Error('Operators must have the same dimension for commutator');
  }
  
  // Manually calculate the commutator with proper complex number handling
  const matrixA = A.toMatrix();
  const matrixB = B.toMatrix();
  const dim = A.dimension;

  // Initialize result matrix
  const resultMatrix = Array(dim).fill(null)
    .map(() => Array(dim).fill(null)
      .map(() => math.complex(0, 0)));

  // Calculate AB - BA directly with proper complex number handling
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let ab = math.complex(0, 0);
      let ba = math.complex(0, 0);

      for (let k = 0; k < dim; k++) {
        // Calculate AB term
        ab = math.add(ab, 
          math.multiply(
            math.complex(matrixA[i][k].re, matrixA[i][k].im),
            math.complex(matrixB[k][j].re, matrixB[k][j].im)
          )
        ) as Complex;

        // Calculate BA term
        ba = math.add(ba,
          math.multiply(
            math.complex(matrixB[i][k].re, matrixB[i][k].im),
            math.complex(matrixA[k][j].re, matrixA[k][j].im)
          )
        ) as Complex;
      }

      // AB - BA for this element
      resultMatrix[i][j] = math.subtract(ab, ba) as Complex;
    }
  }

  return new MatrixOperator(resultMatrix);
}

/**
 * Calculates the anti-commutator {A,B} = AB + BA between two operators
 * 
 * Important for fermion systems and in supersymmetry.
 * 
 * @param A First operator
 * @param B Second operator
 * @returns The anti-commutator operator {A,B}
 */
export function antiCommutator(A: Operator, B: Operator): Operator {
  if (A.dimension !== B.dimension) {
    throw new Error('Operators must have the same dimension for anti-commutator');
  }
  
  // Manually calculate anti-commutator with proper complex number handling
  const matrixA = A.toMatrix();
  const matrixB = B.toMatrix();
  const dim = A.dimension;

  // Initialize result matrix
  const resultMatrix = Array(dim).fill(null)
    .map(() => Array(dim).fill(null)
      .map(() => math.complex(0, 0)));

  // Calculate AB + BA directly with proper complex number handling
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let ab = math.complex(0, 0);
      let ba = math.complex(0, 0);

      for (let k = 0; k < dim; k++) {
        // Calculate AB term
        ab = math.add(ab, 
          math.multiply(
            math.complex(matrixA[i][k].re, matrixA[i][k].im),
            math.complex(matrixB[k][j].re, matrixB[k][j].im)
          )
        ) as Complex;

        // Calculate BA term
        ba = math.add(ba,
          math.multiply(
            math.complex(matrixB[i][k].re, matrixB[i][k].im),
            math.complex(matrixA[k][j].re, matrixA[k][j].im)
          )
        ) as Complex;
      }

      // AB + BA for this element
      resultMatrix[i][j] = math.add(ab, ba) as Complex;
    }
  }

  return new MatrixOperator(resultMatrix);
}

/**
 * Calculates a nested commutator [A, [B, C]] and more complex structures
 * 
 * Useful for higher-order perturbation theory and quantum field calculations.
 * 
 * @param ops Array of operators to use in nested commutator
 * @param indices Array of pairs of indices specifying the commutator structure
 * @returns The resulting operator from the nested commutator structure
 */
export function nestedCommutator(ops: Operator[], indices: number[][]): Operator {
  if (ops.length < 2 || indices.length < 1) {
    throw new Error('Need at least two operators and one pair of indices');
  }
  
  // Check all operators have same dimension
  const dim = ops[0].dimension;
  if (!ops.every(op => op.dimension === dim)) {
    throw new Error('All operators must have the same dimension');
  }
  
  // Process nested commutators from innermost to outermost
  let result = ops[indices[indices.length - 1][0]];
  
  // Work backwards through indices to compute nested structure
  for (let i = indices.length - 1; i >= 0; i--) {
    const [a, b] = indices[i];
    if (a < 0 || b < 0 || a >= ops.length || b >= ops.length) {
      throw new Error('Invalid operator indices');
    }
    
    // If we're not at the innermost level, use previous result as left operand
    const A = i === indices.length - 1 ? ops[a] : result;
    const B = ops[b];
    
    result = commutator(A, B);
  }
  
  return result;
}

/**
 * Calculates the Lie derivative L_A(B) = [A, B]
 * 
 * Important in the theory of Lie algebras and quantum mechanics.
 * 
 * @param A First operator (generator)
 * @param B Second operator
 * @returns The Lie derivative operator
 */
export function lieDerivative(A: Operator, B: Operator): Operator {
  return commutator(A, B);
}

/**
 * Implements the Baker-Campbell-Hausdorff formula to calculate exp(A)exp(B)
 * 
 * Formula: exp(A)exp(B) = exp(A + B + 1/2[A,B] + 1/12[A,[A,B]] - 1/12[B,[A,B]] + ...)
 * Essential for quantum mechanics when dealing with non-commuting operators.
 * 
 * @param A First operator in exponential
 * @param B Second operator in exponential
 * @param order Maximum order of nested commutators to include
 * @returns Approximation of exp(A+B) based on BCH formula
 */
export function BCHFormula(A: Operator, B: Operator, order: number = 2): Operator {
  if (A.dimension !== B.dimension) {
    throw new Error('Operators must have the same dimension for BCH formula');
  }
  
  if (order < 1) {
    throw new Error('Order must be at least 1');
  }
  
  // Start with A + B
  let result = addOperators(A, B);
  
  // First order: + 1/2[A,B]
  if (order >= 1) {
    const firstOrder = commutator(A, B).scale(math.complex(0.5, 0));
    result = addOperators(result, firstOrder);
  }
  
  // Second order: + 1/12[A,[A,B]] - 1/12[B,[A,B]]
  if (order >= 2) {
    const AB = commutator(A, B);
    const AAB = commutator(A, AB).scale(math.complex(1/12, 0));
    const BAB = commutator(B, AB).scale(math.complex(-1/12, 0));
    
    result = addOperators(result, AAB);
    result = addOperators(result, BAB);
  }
  
  return result;
}

/**
 * Checks if two operators commute (within numerical tolerance)
 * 
 * @param A First operator
 * @param B Second operator
 * @param tolerance Numerical tolerance for zero check
 * @returns True if operators commute
 */
export function operatorsCommute(A: Operator, B: Operator, tolerance: number = 1e-10): boolean {
  const comm = commutator(A, B);
  const matrix = comm.toMatrix();
  
  // Check if all elements are close to zero
  for (const row of matrix) {
    for (const elem of row) {
      const magnitude = math.abs(elem).re;
      if (magnitude > tolerance) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Calculates the expectation value of a commutator [A,B] for a state
 * 
 * Important for uncertainty relations in quantum mechanics.
 * 
 * @param state Quantum state
 * @param A First operator
 * @param B Second operator
 * @returns Complex expectation value
 */
export function commutatorExpectation(state: StateVector, A: Operator, B: Operator): Complex {
  const commutatorOp = commutator(A, B);
  const resultState = commutatorOp.apply(state);
  return state.innerProduct(resultState);
}

/**
 * Calculates the uncertainty product ΔA·ΔB for a state
 * 
 * For the uncertainty principle: ΔA·ΔB ≥ |⟨[A,B]⟩|/2
 * 
 * @param state Quantum state
 * @param A First operator
 * @param B Second operator
 * @returns Real number representing uncertainty product
 */
export function uncertaintyProduct(state: StateVector, A: Operator, B: Operator): number {
  // Calculate ΔA = √(⟨A²⟩ - ⟨A⟩²)
  const expectA = state.innerProduct(A.apply(state));
  const expectA2 = state.innerProduct(A.compose(A).apply(state));
  const varA = expectA2.re - expectA.re * expectA.re - expectA.im * expectA.im;
  const deltaA = Math.sqrt(Math.max(0, varA));
  
  // Calculate ΔB = √(⟨B²⟩ - ⟨B⟩²)
  const expectB = state.innerProduct(B.apply(state));
  const expectB2 = state.innerProduct(B.compose(B).apply(state));
  const varB = expectB2.re - expectB.re * expectB.re - expectB.im * expectB.im;
  const deltaB = Math.sqrt(Math.max(0, varB));
  
  return deltaA * deltaB;
}

/**
 * Checks if an operator is normal (AA† = A†A)
 * 
 * Normal operators have special spectral properties.
 * 
 * @param A Operator to check
 * @param tolerance Numerical tolerance
 * @returns True if operator is normal
 */
export function isNormalOperator(A: Operator, tolerance: number = 1e-10): boolean {
  const ADagger = A.adjoint();
  const AA_dagger = A.compose(ADagger);
  const A_daggerA = ADagger.compose(A);
  
  return operatorsCommute(AA_dagger, A_daggerA, tolerance);
}

/**
 * Creates an operator from its generating function: exp(iG)
 * 
 * Common in quantum mechanics where G is the generator (often Hermitian)
 * 
 * @param generator Generator operator G
 * @returns Resulting operator exp(iG)
 */
export function operatorFromGenerator(generator: Operator): Operator {
  // Scale generator by i
  const iG = generator.scale(math.complex(0, 1));
  
  // Use matrix exponential implementation from matrixOperations
  const matrix = iG.toMatrix();
  const expMatrix = matrixExponential(matrix);
  
  return new MatrixOperator(expMatrix, 'unitary');
}

/**
 * Creates projection operator |ψ⟩⟨ψ| from a state
 * 
 * @param state Quantum state to project onto
 * @returns Projection operator
 */
export function projectionOperator(state: StateVector): Operator {
  const dim = state.dimension;
  const matrix: Complex[][] = Array(dim).fill(null).map(() => 
    Array(dim).fill(null).map(() => math.complex(0, 0))
  );
  
  // Compute |ψ⟩⟨ψ|
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      matrix[i][j] = math.multiply(
        state.amplitudes[i],
        math.conj(state.amplitudes[j])
      ) as Complex;
    }
  }
  
  return new MatrixOperator(matrix, 'projection');
}
