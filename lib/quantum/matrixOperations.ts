/**
 * Quantum Matrix Operations (v3)
 * 
 * Provides pure functional implementations of matrix operations for quantum computations.
 * Focuses on type safety, proper error handling, and mathematical correctness while
 * maintaining a clean functional interface.
 */

import * as math from 'mathjs';

// ==================== Type Definitions ====================

export interface Complex {
    re: number;
    im: number;
}

export type ComplexMatrix = Complex[][];

export interface MatrixDimensions {
    rows: number;
    cols: number;
}

export interface ValidationResult {
    valid: boolean;
    error?: string;
}


// ==================== Configuration ====================

const NUMERICAL_THRESHOLD = 1e-10;

// ==================== Validation Functions ====================

/**
 * Validates matrix structure and element types
 */
function validateMatrix(matrix: ComplexMatrix): ValidationResult {
    if (!Array.isArray(matrix) || matrix.length === 0) {
        return { valid: false, error: 'Matrix must be non-empty array' };
    }

    const cols = matrix[0]?.length;
    if (!cols) {
        return { valid: false, error: 'Matrix must have at least one column' };
    }

    for (let i = 0; i < matrix.length; i++) {
        if (!Array.isArray(matrix[i]) || matrix[i].length !== cols) {
            return { valid: false, error: `Inconsistent row length at row ${i}` };
        }
        for (let j = 0; j < cols; j++) {
            const element = matrix[i][j];
            if (!element || typeof element.re !== 'number' || typeof element.im !== 'number' ||
                isNaN(element.re) || isNaN(element.im)) {
                return { valid: false, error: `Invalid complex number at position [${i},${j}]` };
            }
        }
    }

    return { valid: true };
}

/**
 * Validates matrix dimensions for multiplication
 */
function validateMultiplicationDimensions(a: ComplexMatrix, b: ComplexMatrix): ValidationResult {
    if (!a[0] || !b[0]) {
        return { valid: false, error: 'Empty matrix provided' };
    }
    
    if (a[0].length !== b.length) {
        return {
            valid: false,
            error: `Invalid dimensions for multiplication: ${a.length}x${a[0].length} and ${b.length}x${b[0].length}`
        };
    }

    return { valid: true };
}

/**
 * Validates square matrix
 */
function validateSquareMatrix(matrix: ComplexMatrix): ValidationResult {
    if (!matrix[0] || matrix.length !== matrix[0].length) {
        return { valid: false, error: 'Matrix must be square' };
    }
    return { valid: true };
}

// ==================== Utility Functions ====================

/**
 * Cleans up numerical noise in results
 */
function cleanupNumericalNoise(value: number): number {
    return Math.abs(value) < NUMERICAL_THRESHOLD ? 0 : value;
}

/**
 * Converts ComplexMatrix to math.js matrix format
 */
function toMathMatrix(matrix: ComplexMatrix): math.Matrix {
    return math.matrix(matrix.map(row =>
        row.map(x => math.complex(x.re, x.im))
    ));
}

/**
 * Converts math.js matrix to ComplexMatrix format
 */
function fromMathMatrix(matrix: math.Matrix): ComplexMatrix {
    const data = matrix.valueOf() as any[][];
    return data.map(row =>
        row.map(elem => ({
            re: cleanupNumericalNoise(elem.re || 0),
            im: cleanupNumericalNoise(elem.im || 0)
        }))
    );
}

// ==================== Core Matrix Operations ====================

/**
 * Multiplies two complex matrices
 * 
 * @param a First matrix
 * @param b Second matrix
 * @returns Result of matrix multiplication
 * @throws Error if matrices have invalid dimensions
 */
export function multiplyMatrices(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    const validationA = validateMatrix(a);
    if (!validationA.valid) {
        throw new Error(`First matrix invalid: ${validationA.error}`);
    }

    const validationB = validateMatrix(b);
    if (!validationB.valid) {
        throw new Error(`Second matrix invalid: ${validationB.error}`);
    }

    const dimValidation = validateMultiplicationDimensions(a, b);
    if (!dimValidation.valid) {
        throw new Error(dimValidation.error);
    }

    const matA = toMathMatrix(a);
    const matB = toMathMatrix(b);
    const result = math.multiply(matA, matB);
    
    return fromMathMatrix(result);
}

/**
 * Computes the adjoint (conjugate transpose) of a matrix
 * 
 * @param matrix Input matrix
 * @returns Adjoint matrix
 * @throws Error if matrix is invalid
 */
export function adjoint(matrix: ComplexMatrix): ComplexMatrix {
    const validation = validateMatrix(matrix);
    if (!validation.valid) {
        throw new Error(`Invalid matrix: ${validation.error}`);
    }

    // Compute adjoint directly to avoid math.js conversion issues
    return matrix[0].map((_, colIndex) =>
        matrix.map((row, rowIndex) => ({
            re: matrix[rowIndex][colIndex].re,
            im: -matrix[rowIndex][colIndex].im
        }))
    );
}

/**
 * Computes tensor product of two matrices
 * 
 * @param a First matrix
 * @param b Second matrix
 * @returns Tensor product matrix
 * @throws Error if either matrix is invalid
 */
/**
 * Computes matrix exponential exp(A) for a complex matrix A
 * 
 * @param matrix Input matrix
 * @returns Matrix exponential result
 * @throws Error if matrix is invalid or non-square
 */
export function matrixExponential(matrix: ComplexMatrix): ComplexMatrix {
    const validation = validateMatrix(matrix);
    if (!validation.valid) {
        throw new Error(`Invalid matrix: ${validation.error}`);
    }

    const squareValidation = validateSquareMatrix(matrix);
    if (!squareValidation.valid) {
        throw new Error(squareValidation.error);
    }

    const mathMatrix = toMathMatrix(matrix);
    const result = math.expm(mathMatrix);
    
    return fromMathMatrix(result);
}

export function tensorProduct(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    const validationA = validateMatrix(a);
    if (!validationA.valid) {
        throw new Error(`First matrix invalid: ${validationA.error}`);
    }

    const validationB = validateMatrix(b);
    if (!validationB.valid) {
        throw new Error(`Second matrix invalid: ${validationB.error}`);
    }

    const matA = toMathMatrix(a);
    const matB = toMathMatrix(b);
    const result = math.kron(matA, matB);
    
    return fromMathMatrix(result);
}

/**
 * Computes eigendecomposition of a matrix
 * 
 * @param matrix Input matrix
 * @returns Object containing eigenvalues and eigenvectors
 * @throws Error if matrix is invalid or non-square
 */
export function eigenDecomposition(matrix: ComplexMatrix): {
    values: Complex[];
    vectors: ComplexMatrix;
} {
    const validation = validateMatrix(matrix);
    if (!validation.valid) {
        throw new Error(`Invalid matrix: ${validation.error}`);
    }

    const squareValidation = validateSquareMatrix(matrix);
    if (!squareValidation.valid) {
        throw new Error(squareValidation.error);
    }

    const mathMatrix = toMathMatrix(matrix);
    const { values, eigenvectors } = math.eigs(mathMatrix);

    // Convert eigenvalues to Complex[]
    const complexValues = (values.valueOf() as number[]).map(v => ({
        re: cleanupNumericalNoise(v),
        im: 0
    }));

    // Handle different eigenvector formats from math.eigs()
    let complexVectors: ComplexMatrix;
    const eigenVectorsValue = eigenvectors.valueOf();
    
    if (Array.isArray(eigenVectorsValue) && eigenVectorsValue.every(Array.isArray)) {
        // Case 1: Direct array of arrays
        complexVectors = eigenVectorsValue.map(vec =>
            vec.map(v => ({
                re: cleanupNumericalNoise(v),
                im: 0
            }))
        );
    } else if (Array.isArray(eigenVectorsValue)) {
        // Case 2: Array of eigenvector objects (mathjs format)
        complexVectors = eigenVectorsValue.map((eigenpair: any) => {
            const vec = eigenpair.vector ? eigenpair.vector.valueOf() : eigenpair;
            return Array.isArray(vec) ? 
                vec.map(v => ({
                    re: cleanupNumericalNoise(v),
                    im: 0
                })) : 
                [];
        }).filter(vec => vec.length > 0);
    } else {
        throw new Error('Unsupported eigenvectors format from math.eigs()');
    }

    if (complexVectors.length === 0) {
        throw new Error('No valid eigenvectors found');
    }

    return {
        values: complexValues,
        vectors: complexVectors
    };
}

/**
 * Adds two matrices
 * 
 * @param a First matrix
 * @param b Second matrix
 * @returns Sum matrix
 * @throws Error if matrices have incompatible dimensions
 */
export function addMatrices(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    const validationA = validateMatrix(a);
    if (!validationA.valid) {
        throw new Error(`First matrix invalid: ${validationA.error}`);
    }

    const validationB = validateMatrix(b);
    if (!validationB.valid) {
        throw new Error(`Second matrix invalid: ${validationB.error}`);
    }

    if (a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error('Matrices must have same dimensions for addition');
    }

    const matA = toMathMatrix(a);
    const matB = toMathMatrix(b);
    const result = math.add(matA, matB);
    
    return fromMathMatrix(result);
}

/**
 * Scales a matrix by a complex number
 * 
 * @param matrix Input matrix
 * @param scalar Complex scaling factor
 * @returns Scaled matrix
 * @throws Error if matrix is invalid
 */
export function scaleMatrix(matrix: ComplexMatrix, scalar: Complex): ComplexMatrix {
    const validation = validateMatrix(matrix);
    if (!validation.valid) {
        throw new Error(`Invalid matrix: ${validation.error}`);
    }

    const matM = toMathMatrix(matrix);
    const s = math.complex(scalar.re, scalar.im);
    const result = math.multiply(matM, s);
    
    return fromMathMatrix(result);
}

/**
 * Checks if a matrix is Hermitian (self-adjoint)
 * 
 * @param matrix Input matrix
 * @param tolerance Numerical tolerance for comparison
 * @returns true if matrix is Hermitian
 * @throws Error if matrix is invalid or non-square
 */
export function isHermitian(
    matrix: ComplexMatrix,
    tolerance: number = NUMERICAL_THRESHOLD
): boolean {
    const validation = validateMatrix(matrix);
    if (!validation.valid) {
        throw new Error(`Invalid matrix: ${validation.error}`);
    }

    const squareValidation = validateSquareMatrix(matrix);
    if (!squareValidation.valid) {
        throw new Error(squareValidation.error);
    }

    const adj = adjoint(matrix);
    
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            const diff = {
                re: Math.abs(matrix[i][j].re - adj[i][j].re),
                im: Math.abs(matrix[i][j].im - adj[i][j].im)
            };
            if (diff.re > tolerance || diff.im > tolerance) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Checks if a matrix is unitary
 * 
 * @param matrix Input matrix
 * @param tolerance Numerical tolerance for comparison
 * @returns true if matrix is unitary
 * @throws Error if matrix is invalid or non-square
 */
export function isUnitary(
    matrix: ComplexMatrix,
    tolerance: number = NUMERICAL_THRESHOLD
): boolean {
    const validation = validateMatrix(matrix);
    if (!validation.valid) {
        throw new Error(`Invalid matrix: ${validation.error}`);
    }

    const squareValidation = validateSquareMatrix(matrix);
    if (!squareValidation.valid) {
        throw new Error(squareValidation.error);
    }

    const adj = adjoint(matrix);
    const product = multiplyMatrices(matrix, adj);
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const expected = i === j ? 1 : 0;
            const diff = {
                re: Math.abs(product[i][j].re - expected),
                im: Math.abs(product[i][j].im)
            };
            if (diff.re > tolerance || diff.im > tolerance) {
                return false;
            }
        }
    }
    
    return true;
}
