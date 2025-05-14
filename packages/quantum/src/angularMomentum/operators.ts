/**
 * Angular momentum operators implementation
 * Implements J₊, J₋, Jz, and J² operators for arbitrary angular momentum j
 */

import { Complex, IOperator, OperatorType } from '../core/types';
import { MatrixOperator } from '../operators/operator';
import * as math from 'mathjs';

/**
 * Creates the raising operator J₊ for given angular momentum j
 * J₊|j,m⟩ = √(j(j+1) - m(m+1)) |j,m+1⟩
 * 
 * @param j Total angular momentum quantum number
 * @returns The J₊ operator as a matrix
 */
export function createJplus(j: number): IOperator {
  validateJ(j);
  const dim = Math.floor(2 * j + 1);
  const matrix: Complex[][] = Array(dim).fill(null)
    .map(() => Array(dim).fill(null)
      .map(() => math.complex(0, 0)));

  // Fill matrix elements
  for (let m = -j; m < j; m++) {
    const row = m + j;
    const col = m + j + 1;
    const element = Math.sqrt(j * (j + 1) - m * (m + 1));
    matrix[row][col] = math.complex(element, 0);
  }

  return new MatrixOperator(matrix, 'general', true, { j });
}

/**
 * Creates the lowering operator J₋ for given angular momentum j
 * J₋|j,m⟩ = √(j(j+1) - m(m-1)) |j,m-1⟩
 * 
 * @param j Total angular momentum quantum number
 * @returns The J₋ operator as a matrix
 */
export function createJminus(j: number): IOperator {
  validateJ(j);
  const dim = Math.floor(2 * j + 1);
  const matrix: Complex[][] = Array(dim).fill(null)
    .map(() => Array(dim).fill(null)
      .map(() => math.complex(0, 0)));

  // Fill matrix elements
  for (let m = -j + 1; m <= j; m++) {
    const row = m + j;
    const col = m + j - 1;
    const element = Math.sqrt(j * (j + 1) - m * (m - 1));
    matrix[row][col] = math.complex(element, 0);
  }

  const op = new MatrixOperator(matrix);
  return Object.assign(op, { j }) as IOperator;
}

/**
 * Creates the z-component operator Jz for given angular momentum j
 * Jz|j,m⟩ = m|j,m⟩
 * 
 * @param j Total angular momentum quantum number
 * @returns The Jz operator as a matrix
 */
export function createJz(j: number): IOperator {
  validateJ(j);
  const dim = Math.floor(2 * j + 1);
  const matrix: Complex[][] = Array(dim).fill(null)
    .map(() => Array(dim).fill(null)
      .map(() => math.complex(0, 0)));

  // Fill diagonal elements
  for (let m = -j; m <= j; m++) {
    const idx = m + j;
    matrix[idx][idx] = math.complex(m, 0);
  }

  const op = new MatrixOperator(matrix);
  return Object.assign(op, { j }) as IOperator;
}

/**
 * Creates the total angular momentum operator J² for given j
 * J²|j,m⟩ = j(j+1)|j,m⟩
 * 
 * @param j Total angular momentum quantum number
 * @returns The J² operator as a matrix
 */
export function createJ2(j: number): IOperator {
  validateJ(j);
  const dim = Math.floor(2 * j + 1);
  const eigenvalue = j * (j + 1);
  
  const matrix: Complex[][] = Array(dim).fill(null)
    .map(() => Array(dim).fill(null)
      .map(() => math.complex(0, 0)));

  // Fill diagonal elements with j(j+1)
  for (let i = 0; i < dim; i++) {
    matrix[i][i] = math.complex(eigenvalue, 0);
  }

  const op = new MatrixOperator(matrix);
  return Object.assign(op, { j }) as IOperator;
}

/**
 * Creates total angular momentum operator J² from components
 * J² = Jx² + Jy² + Jz² = J₊J₋ + Jz² - Jz = J₋J₊ + Jz² + Jz
 * 
 * This is an alternative implementation that constructs J² from its components.
 * Useful for verification against createJ2().
 * 
 * @param j Total angular momentum quantum number
 * @returns The J² operator as a matrix
 */
export function createJ2FromComponents(j: number): IOperator {
  const jPlus = createJplus(j);
  const jMinus = createJminus(j);
  const jz = createJz(j);
  
  // Calculate J² = J₊J₋ + Jz² - Jz
  const jPlusJMinus = jPlus.compose(jMinus);
  const jzSquared = jz.compose(jz);
  const result = jPlusJMinus.add(jzSquared).add(jz.scale(math.complex(-1, 0)));

  return Object.assign(new MatrixOperator(result.toMatrix()), { j }) as IOperator;
}

/**
 * Validates angular momentum quantum number j
 * j must be a non-negative integer or half-integer
 * 
 * @param j Angular momentum quantum number to validate
 * @throws Error if j is invalid
 */
function validateJ(j: number): void {
  if (j < 0) {
    throw new Error('Angular momentum j must be non-negative');
  }
  
  // Check if j is integer or half-integer
  const isValid = Math.abs(j * 2 - Math.round(j * 2)) < 1e-10;
  if (!isValid) {
    throw new Error('Angular momentum j must be integer or half-integer');
  }
}

/**
 * Gets the valid m values for a given j
 * m ranges from -j to +j in integer steps
 * 
 * @param j Total angular momentum quantum number
 * @returns Array of valid m values
 */
export function getValidM(j: number): number[] {
  validateJ(j);
  const mValues: number[] = [];
  for (let m = -j; m <= j; m++) {
    mValues.push(m);
  }
  return mValues;
}

/**
 * Checks if a given m value is valid for angular momentum j
 * 
 * @param j Total angular momentum quantum number
 * @param m Magnetic quantum number to check
 * @returns true if m is valid for given j
 */
export function isValidM(j: number, m: number): boolean {
  validateJ(j);
  // m must be between -j and +j
  return m >= -j && m <= j && Math.abs(m - Math.round(m)) < 1e-10;
}

/**
 * Creates Wigner rotation operator D(α,β,γ) = exp(-iαJz)exp(-iβJy)exp(-iγJz)
 * 
 * @param j Total angular momentum quantum number
 * @param alpha First Euler angle
 * @param beta Second Euler angle
 * @param gamma Third Euler angle
 * @returns The Wigner rotation operator
 */
export function createRotationOperator(
  j: number,
  alpha: number,
  beta: number,
  gamma: number
): IOperator {
  // Get Jz and construct Jy = (J₊ - J₋)/(2i)
  const jz = createJz(j);
  const jPlus = createJplus(j);
  const jMinus = createJminus(j);
  
  // Create Jy from J₊ and J₋
  const jyMatrix: Complex[][] = jPlus.toMatrix().map((row, i) => 
    row.map((_, j) => {
      const plusElem = jPlus.toMatrix()[i][j];
      const minusElem = jMinus.toMatrix()[i][j];
      return math.multiply(
        math.subtract(plusElem, minusElem),
        math.complex(0, -0.5)
      ) as Complex;
    })
  );
  const jy = new MatrixOperator(jyMatrix, { j });
  
  // Calculate rotation matrices
  const expAlpha = Object.assign(
    new MatrixOperator(matrixExponential(jz.scale(math.complex(0, -alpha)).toMatrix())),
    { j }
  );
  
  const expBeta = Object.assign(
    new MatrixOperator(matrixExponential(jy.scale(math.complex(0, -beta)).toMatrix())),
    { j }
  ) as IOperator;
  
  const expGamma = Object.assign(
    new MatrixOperator(matrixExponential(jz.scale(math.complex(0, -gamma)).toMatrix())),
    { j }
  ) as IOperator;
  
  // Combine the rotations
  const result = expAlpha.compose(expBeta).compose(expGamma);
  return Object.assign(new MatrixOperator(result.toMatrix()), { j }) as IOperator;
}

/**
 * Calculates matrix exponential e^A
 * Uses Taylor series approximation
 */
function matrixExponential(matrix: Complex[][]): Complex[][] {
  const dim = matrix.length;
  let result = Array(dim).fill(null).map(() => 
    Array(dim).fill(null).map((_, j) => 
      j === _ ? math.complex(1, 0) : math.complex(0, 0)
    )
  );
  
  let term = result;
  const maxIterations = 20;
  
  for (let n = 1; n <= maxIterations; n++) {
    // Multiply term by A/n
    term = multiplyMatrices(term, matrix).map(row => 
      row.map(x => math.divide(x, math.complex(n, 0)))
    );
    
    // Add to result
    result = result.map((row, i) => 
      row.map((x, j) => math.add(x, term[i][j]))
    );
    
    // Check convergence
    const normTerm = Math.max(...term.map(row => 
      Math.max(...row.map(x => math.abs(x)))
    ));
    if (normTerm < 1e-10) break;
  }
  
  return result;
}

/**
 * Multiplies two complex matrices
 */
function multiplyMatrices(A: Complex[][], B: Complex[][]): Complex[][] {
  const n = A.length;
  const result = Array(n).fill(null).map(() => 
    Array(n).fill(null).map(() => math.complex(0, 0))
  );
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        result[i][j] = math.add(
          result[i][j],
          math.multiply(A[i][k], B[k][j])
        );
      }
    }
  }
  
  return result;
}

/**
 * Calculates expectation value ⟨j,m|O|j,m⟩ for an angular momentum operator
 * 
 * @param operator Angular momentum operator to calculate expectation for
 * @param j Total angular momentum quantum number
 * @param m Magnetic quantum number
 * @returns Complex expectation value
 */
export function expectationValue(
  operator: IOperator & { j: number },
  j: number,
  m: number
): Complex {
  validateJ(j);
  if (!isValidM(j, m)) {
    throw new Error(`Invalid m=${m} for j=${j}`);
  }
  
  const idx = m + j;
  const matrix = operator.toMatrix();
  return matrix[idx][idx];
}