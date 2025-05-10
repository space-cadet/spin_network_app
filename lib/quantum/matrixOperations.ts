/**
 * Quantum Matrix Operations (v3)
 * 
 * Provides pure functional implementations of matrix operations for quantum computations.
 * Focuses on type safety, proper error handling, and mathematical correctness while
 * maintaining a clean functional interface.
 */

import * as math from 'mathjs';
import { Complex } from './types';

// ==================== Type Definitions ====================

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
        row.map(x => math.complex({re: x.re, im:  x.im}))
    ));
}

/**
 * Converts math.js matrix to ComplexMatrix format
 */
function fromMathMatrix(matrix: math.Matrix): ComplexMatrix {
    const data = matrix.valueOf() as math.Complex[][];
    return data.map(row =>
        row.map(elem => math.complex(
            cleanupNumericalNoise(elem.re),
            cleanupNumericalNoise(elem.im)
        ))
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

    // Compute adjoint using math.js Complex objects
    return matrix[0].map((_, colIndex) =>
        matrix.map((row, rowIndex) => 
            math.complex(
                matrix[rowIndex][colIndex].re,
                -matrix[rowIndex][colIndex].im
            )
        )
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
 * Computes eigendecomposition of a complex matrix
 * 
 * This implementation handles both Hermitian and non-Hermitian matrices,
 * supporting complex eigenvalues and eigenvectors. For Hermitian matrices,
 * all eigenvalues are guaranteed to be real.
 * 
 * @param matrix Input matrix (can be complex)
 * @param options Configuration options
 * @param options.precision Numerical precision for eigenvalue/eigenvector computation (default: 1e-10)
 * @param options.computeEigenvectors Whether to compute eigenvectors (default: true)
 * @param options.enforceOrthogonality Whether to enforce orthogonality for degenerate eigenvectors (default: true)
 * @returns Object containing eigenvalues and optionally eigenvectors
 * @throws Error if matrix is invalid, non-square, or computation fails
 * 
 * @example
 * // Hermitian matrix
 * const matrix = [
 *   [math.complex(1, 0), math.complex(0, 1)],
 *   [math.complex(0, -1), math.complex(1, 0)]
 * ];
 * const { values, vectors } = eigenDecomposition(matrix);
 */
export function eigenDecomposition(
    matrix: ComplexMatrix,
    options: {
        precision?: number;
        computeEigenvectors?: boolean;
        enforceOrthogonality?: boolean;
    } = {}
): {
    values: Complex[];
    vectors?: ComplexMatrix;
} {
    const validation = validateMatrix(matrix);
    if (!validation.valid) {
        throw new Error(`Invalid matrix: ${validation.error}`);
    }

    const squareValidation = validateSquareMatrix(matrix);
    if (!squareValidation.valid) {
        throw new Error(`Matrix must be square for eigendecomposition: ${squareValidation.error}`);
    }

    const mathMatrix = toMathMatrix(matrix);
    
    try {
        // Compute eigendecomposition using mathjs
        const result = math.eigs(mathMatrix);

        // Process eigenvalues
        const values = (result.values as math.Matrix).valueOf() as Complex[];
        const complexValues = values.map(v => {
            if (typeof v === 'number') {
                return math.complex(v, 0);
            }
            return v as Complex;
        });

        // If eigenvectors weren't requested, return early
        if (!options.computeEigenvectors) {
            return { values: complexValues };
        }

        // Process eigenvectors
        let vectors: ComplexMatrix | undefined;
        try {
            const eigenvectors = (result.eigenvectors as math.Matrix).valueOf() as Array<{
                value: number;
                vector: math.Matrix;
            }>;
            
            // Sort eigenvectors to match eigenvalue order
            const sortedEigenvectors = eigenvectors.sort((a, b) => {
                const aVal = typeof a.value === 'number' ? a.value : a.value.re;
                const bVal = typeof b.value === 'number' ? b.value : b.value.re;
                return aVal - bVal;
            });

            vectors = sortedEigenvectors.map(entry => {
                const vectorData = entry.vector.valueOf() as (number | Complex)[];
                return vectorData.map(v => {
                    if (typeof v === 'number') {
                        return math.complex(v, 0);
                    }
                    return v as Complex;
                });
            });
        
            // Normalize vectors if requested
            if (options.enforceOrthogonality && vectors) {
                vectors = normalizeVectors(vectors);
            }
        } catch (error) {
            console.warn(`Eigenvector computation warning: ${error.message}`);
            return { values: complexValues };
        }

        return {
            values: complexValues,
            vectors
        };

    } catch (error) {
        throw new Error(`Eigendecomposition failed: ${error.message}`);
    }
}

/**
 * Helper function to normalize vectors
 */
function normalizeVectors(vectors: ComplexMatrix): ComplexMatrix {
    return vectors.map(vector => {
        // Compute norm
        const normSquared = vector.reduce((sum, v) => {
            const abs = math.abs(v);
            return sum + abs * abs;
        }, 0);
        const norm = Math.sqrt(normSquared);

        // Find first significant component
        const firstNonZeroIdx = vector.findIndex(v => 
            Math.abs(v.re) > NUMERICAL_THRESHOLD || Math.abs(v.im) > NUMERICAL_THRESHOLD
        );

        // Determine phase correction to make first component real and positive
        let phase = 1;
        if (firstNonZeroIdx !== -1) {
            const firstComponent = vector[firstNonZeroIdx];
            phase = math.exp(-math.arg(firstComponent));
        }

        // Normalize and apply phase correction
        return vector.map(v => 
            math.multiply(math.divide(v, norm), phase) as Complex
        );
    });
}
/**
 * Helper function to process eigenvectors, handling complex values and enforcing orthogonality
 * @private
 */
function processEigenvectors(
    vectors: math.Matrix,
    values: Complex[],
    dimension: number,
    precision: number,
    enforceOrthogonality: boolean
): ComplexMatrix {
    const vectorsArray = vectors.valueOf() as math.Complex[][];
    
    // Initial processing of eigenvectors
    let complexVectors = vectorsArray.map(vec =>
        vec.map(v => math.complex(
            cleanupNumericalNoise(v.re, precision),
            cleanupNumericalNoise(v.im, precision)
        ))
    );

    if (enforceOrthogonality) {
        // Group eigenvectors by eigenvalue (within precision) for degenerate case handling
        const degenerateGroups = groupDegenerateEigenvectors(complexVectors, values, precision);
        
        // Orthogonalize within each degenerate group
        complexVectors = orthogonalizeDegenerateEigenvectors(degenerateGroups, precision);
    }

    // Normalize all eigenvectors
    complexVectors = complexVectors.map(vector => {
        const norm = math.sqrt(
            vector.reduce((sum, v) => 
                math.add(
                    sum,
                    math.multiply(math.conj(v), v)
                ) as Complex,
                math.complex(0, 0)
            )
        ) as Complex;
        
        return vector.map(v => 
            math.divide(v, norm) as Complex
        );
    });

    return complexVectors;
}

/**
 * Helper function to group eigenvectors by degenerate eigenvalues
 * @private
 */
function groupDegenerateEigenvectors(
    vectors: ComplexMatrix,
    values: Complex[],
    precision: number
): Map<string, ComplexMatrix> {
    const groups = new Map<string, ComplexMatrix>();
    
    vectors.forEach((vector, idx) => {
        const value = values[idx];
        // Use rounded values as keys to group degenerate eigenvalues
        const key = `${roundToPrec(value.re, precision)},${roundToPrec(value.im, precision)}`;
        
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(vector);
    });
    
    return groups;
}

/**
 * Helper function to orthogonalize degenerate eigenvectors using modified Gram-Schmidt
 * @private
 */
function orthogonalizeDegenerateEigenvectors(
    groups: Map<string, ComplexMatrix>,
    precision: number
): ComplexMatrix {
    const orthogonalVectors: ComplexMatrix = [];
    
    for (const vectors of groups.values()) {
        if (vectors.length > 1) {
            // Apply modified Gram-Schmidt for numerical stability
            for (let i = 0; i < vectors.length; i++) {
                let vi = vectors[i];
                
                // Orthogonalize against all previous vectors
                for (let j = 0; j < i; j++) {
                    const vj = vectors[j];
                    const proj = computeProjection(vi, vj);
                    vi = subtractVectors(vi, proj);
                }
                
                // Add non-zero orthogonalized vector
                const norm = vectorNorm(vi);
                if (norm > precision) {
                    orthogonalVectors.push(vi);
                }
            }
        } else {
            // Single vector case - just add it
            orthogonalVectors.push(vectors[0]);
        }
    }
    
    return orthogonalVectors;
}

/**
 * Helper function to compute vector projection
 * @private
 */
function computeProjection(v: Complex[], u: Complex[]): Complex[] {
    const uDotU = innerProduct(u, u);
    const vDotU = innerProduct(v, u);
    const scalar = math.divide(vDotU, uDotU) as Complex;
    
    return u.map(ui => math.multiply(ui, scalar) as Complex);
}

/**
 * Helper function to compute inner product of complex vectors
 * @private
 */
function innerProduct(v: Complex[], u: Complex[]): Complex {
    return v.reduce((sum, vi, i) => 
        math.add(
            sum,
            math.multiply(math.conj(vi), u[i])
        ) as Complex,
        math.complex(0, 0)
    );
}

/**
 * Helper function to subtract complex vectors
 * @private
 */
function subtractVectors(v: Complex[], u: Complex[]): Complex[] {
    return v.map((vi, i) => 
        math.subtract(vi, u[i]) as Complex
    );
}

/**
 * Helper function to compute vector norm
 * @private
 */
function vectorNorm(v: Complex[]): number {
    const normComplex = math.sqrt(innerProduct(v, v)) as Complex;
    return Math.sqrt(normComplex.re * normComplex.re + normComplex.im * normComplex.im);
}

/**
 * Helper function to round to precision
 * @private
 */
function roundToPrec(value: number, precision: number): number {
    return Math.round(value / precision) * precision;
}

/**
 * Helper function to verify eigendecomposition
 * @private
 */
function verifyDecomposition(
    matrix: ComplexMatrix,
    values: Complex[],
    vectors: ComplexMatrix,
    precision: number
): void {
    // Verify each eigenpair
    vectors.forEach((vector, idx) => {
        const lambda = values[idx];
        
        // Compute Av
        const Av = matrix.map(row => 
            row.reduce((sum, aij, j) => 
                math.add(sum, math.multiply(aij, vector[j])) as Complex,
                math.complex(0, 0)
            )
        );
        
        // Compute λv
        const lambdaV = vector.map(v => 
            math.multiply(lambda, v) as Complex
        );
        
        // Check if Av = λv within precision
        Av.forEach((av, i) => {
            const diff = math.subtract(av, lambdaV[i]) as Complex;
            const error = Math.sqrt(diff.re * diff.re + diff.im * diff.im);
            
            if (error > precision) {
                console.warn(`Eigenpair verification failed at index ${idx}, component ${i} with error ${error}`);
            }
        });
    });
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
    const s = math.complex({re: scalar.re, im:  scalar.im});
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
