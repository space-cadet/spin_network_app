/**
 * Quantum Matrix Operations
 * 
 * This module provides pure functional implementations of matrix operations
 * specifically designed for quantum computations. It focuses on:
 * - Type safety through TypeScript
 * - Proper error handling with detailed messages
 * - Mathematical correctness and numerical stability
 * - Clean functional programming interface
 * 
 * Key features:
 * - Complex matrix operations (multiplication, addition, scaling)
 * - Quantum-specific operations (tensor products, adjoints)
 * - Eigendecomposition with support for degenerate cases
 * - Numerical stability handling
 * - Comprehensive error checking
 * 
 * @module quantum/matrixOperations
 */

import * as math from 'mathjs';
import { Complex } from '../core/types';

// ==================== Type Definitions ====================

/**
 * Represents a matrix of complex numbers
 * Each element is a Complex type from mathjs
 */
export type ComplexMatrix = Complex[][];

/**
 * Represents the dimensions of a matrix
 */
export interface MatrixDimensions {
    /** Number of rows in the matrix */
    rows: number;
    /** Number of columns in the matrix */
    cols: number;
}

/**
 * Result of matrix validation operations
 */
export interface ValidationResult {
    /** Whether the matrix is valid */
    valid: boolean;
    /** Error message if validation failed */
    error?: string;
}


// ==================== Configuration ====================

/**
 * Numerical threshold for floating point comparisons and noise reduction
 * 
 * Used for:
 * - Comparing complex numbers for equality
 * - Cleaning up numerical noise in calculations
 * - Determining if a value is effectively zero
 * - Validating unitary and Hermitian properties
 * - Checking orthogonality of eigenvectors
 * 
 * @constant
 * @default 1e-10
 */
const NUMERICAL_THRESHOLD = 1e-10;

// ==================== Validation Functions ====================

/**
 * Validates matrix structure and element types
 * 
 * Checks for:
 * - Non-empty array structure
 * - Consistent row lengths
 * - Valid complex numbers in all positions
 * 
 * @param matrix - Matrix to validate
 * @returns Validation result with error message if invalid
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
 * 
 * Ensures that the number of columns in the first matrix
 * equals the number of rows in the second matrix
 * 
 * @param a - First matrix
 * @param b - Second matrix
 * @returns Validation result with error message if dimensions are incompatible
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
 * Validates that a matrix is square (same number of rows and columns)
 * 
 * @param matrix - Matrix to validate
 * @returns Validation result with error message if not square
 */
function validateSquareMatrix(matrix: ComplexMatrix): ValidationResult {
    if (!matrix[0] || matrix.length !== matrix[0].length) {
        return { valid: false, error: 'Matrix must be square' };
    }
    return { valid: true };
}

// ==================== Utility Functions ====================

/**
 * Cleans up numerical noise in results by zeroing very small values
 * 
 * @param value - Numerical value to clean
 * @returns Cleaned value (0 if absolute value is below threshold)
 */
function cleanupNumericalNoise(value: number): number {
    return Math.abs(value) < NUMERICAL_THRESHOLD ? 0 : value;
}

/**
 * Converts ComplexMatrix to math.js matrix format
 * 
 * @param matrix - ComplexMatrix to convert
 * @returns math.js Matrix equivalent
 */
function toMathMatrix(matrix: ComplexMatrix): math.Matrix {
    return math.matrix(matrix.map(row =>
        row.map(x => math.complex({re: x.re, im:  x.im}))
    ));
}

/**
 * Converts math.js matrix to ComplexMatrix format
 * 
 * Includes cleanup of numerical noise in the conversion process
 * 
 * @param matrix - math.js Matrix to convert
 * @returns ComplexMatrix equivalent with cleaned numerical values
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
 * Multiplies two complex matrices using standard matrix multiplication
 * 
 * For matrices A (m×n) and B (n×p), computes the product C = AB (m×p) where:
 * C[i,j] = Σ(k=0 to n-1) A[i,k] * B[k,j]
 * 
 * In quantum mechanics, matrix multiplication represents:
 * - Sequential application of quantum operations
 * - Composition of quantum gates
 * - Transformation of quantum states
 * 
 * @param a - First matrix (m×n)
 * @param b - Second matrix (n×p)
 * @returns Result matrix (m×p)
 * @throws Error if matrices have invalid dimensions or elements
 * 
 * @example
 * // Multiply Hadamard gate by itself (H² = I)
 * const H = [[1/√2, 1/√2], [1/√2, -1/√2]];
 * const HH = multiplyMatrices(H, H); // Should give identity matrix
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
 * The adjoint A† of a matrix A is obtained by taking the complex conjugate
 * of each element and then transposing the matrix. For quantum operators,
 * the adjoint is essential for:
 * - Testing if an operator is Hermitian (A = A†)
 * - Testing if an operator is unitary (A†A = AA† = I)
 * - Computing expectation values ⟨ψ|A|ψ⟩
 * 
 * @param matrix - Input matrix
 * @returns Adjoint matrix
 * @throws Error if matrix is invalid
 * 
 * @example
 * const matrix = [[{re: 1, im: 1}, {re: 0, im: 0}],
 *                 [{re: 0, im: 0}, {re: 1, im: -1}]];
 * const adj = adjoint(matrix); // Conjugate transpose
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
 * Computes tensor product (Kronecker product) of two matrices
 * 
 * The tensor product A ⊗ B of matrices A and B is a matrix whose dimension
 * is the product of the dimensions of A and B. It represents the quantum
 * mechanical combination of two quantum systems.
 * 
 * @param a - First matrix
 * @param b - Second matrix
 * @returns Tensor product matrix with dimensions (m*p) × (n*q) for m×n and p×q input matrices
 * @throws Error if either matrix is invalid
 * 
 * @example
 * const a = [[1, 0], [0, 1]]; // 2×2 identity matrix
 * const b = [[0, 1], [1, 0]]; // Pauli X matrix
 * const result = tensorProduct(a, b); // 4×4 matrix
 */
/**
 * Computes matrix exponential exp(A) for a complex matrix A
 * 
 * The matrix exponential is defined as:
 * exp(A) = I + A + A²/2! + A³/3! + ...
 * 
 * In quantum mechanics, the matrix exponential is crucial for:
 * - Time evolution: U(t) = exp(-iHt/ħ) where H is the Hamiltonian
 * - Quantum gates: Many gates are exponentials of Pauli matrices
 * - Continuous transformations: exp(θA) gives continuous path of transformations
 * 
 * @param matrix - Input matrix (must be square)
 * @returns Matrix exponential result
 * @throws Error if matrix is invalid or non-square
 * 
 * @example
 * // Pauli X gate is exp(iπX/2) where X is the Pauli X matrix
 * const X = [[0, 1], [1, 0]];
 * const theta = Math.PI/2;
 * const iX = scaleMatrix(X, {re: 0, im: theta});
 * const expIX = matrixExponential(iX);
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
 * Normalizes a set of complex vectors and adjusts their phases
 * 
 * For each vector:
 * 1. Computes the norm (length) of the vector
 * 2. Divides by the norm to get unit length
 * 3. Adjusts the phase so the first significant component is real and positive
 * 
 * This is important in quantum mechanics where:
 * - Vectors must be normalized (unit length)
 * - Global phase is arbitrary but should be consistent
 * 
 * @param vectors - Array of complex vectors to normalize
 * @returns Normalized vectors with consistent phases
 * @private
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
 * Processes eigenvectors to ensure proper normalization and orthogonality
 * 
 * Performs several key operations:
 * 1. Cleans up numerical noise in eigenvector components
 * 2. Groups degenerate eigenvectors (same eigenvalue)
 * 3. Orthogonalizes degenerate eigenvectors
 * 4. Normalizes all vectors to unit length
 * 
 * This is crucial for quantum mechanics where:
 * - Eigenvectors form an orthonormal basis
 * - Degenerate eigenstates need special handling
 * - Numerical precision affects physical meaning
 * 
 * @param vectors - Raw eigenvectors from computation
 * @param values - Corresponding eigenvalues
 * @param dimension - Matrix dimension
 * @param precision - Numerical precision threshold
 * @param enforceOrthogonality - Whether to enforce orthogonality
 * @returns Processed eigenvectors
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
 * Groups eigenvectors by their corresponding eigenvalues
 * 
 * In quantum mechanics, degenerate eigenstates (states with same energy/eigenvalue)
 * require special handling. This function:
 * 1. Groups vectors with eigenvalues that are equal within precision
 * 2. Creates a map of eigenvalue -> vectors for efficient processing
 * 3. Handles both real and complex eigenvalues
 * 
 * @param vectors - Array of eigenvectors
 * @param values - Corresponding eigenvalues
 * @param precision - Numerical threshold for considering eigenvalues equal
 * @returns Map of eigenvalue groups to their corresponding vectors
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
 * Orthogonalizes degenerate eigenvectors using modified Gram-Schmidt process
 * 
 * For quantum systems with degenerate states, we need an orthonormal basis.
 * This function:
 * 1. Takes groups of degenerate vectors (same eigenvalue)
 * 2. Applies modified Gram-Schmidt for numerical stability
 * 3. Ensures resulting vectors are orthogonal and normalized
 * 
 * The modified Gram-Schmidt process is more numerically stable than
 * classical Gram-Schmidt, which is important for quantum computations.
 * 
 * @param groups - Map of eigenvalue groups to their vectors
 * @param precision - Numerical threshold for orthogonality
 * @returns Array of orthogonalized vectors
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
 * Computes the projection of vector v onto vector u
 * 
 * The projection is given by: proj_u(v) = (⟨v|u⟩/⟨u|u⟩)u
 * where ⟨v|u⟩ is the inner product.
 * 
 * This is used in:
 * - Gram-Schmidt orthogonalization
 * - Finding components of quantum states
 * - Decomposing states into basis vectors
 * 
 * @param v - Vector to project
 * @param u - Vector to project onto
 * @returns Projection vector
 * @private
 */
function computeProjection(v: Complex[], u: Complex[]): Complex[] {
    const uDotU = innerProduct(u, u);
    const vDotU = innerProduct(v, u);
    const scalar = math.divide(vDotU, uDotU) as Complex;
    
    return u.map(ui => math.multiply(ui, scalar) as Complex);
}

/**
 * Computes the inner product ⟨v|u⟩ of two complex vectors
 * 
 * The inner product is defined as: Σᵢ v̄ᵢuᵢ
 * where v̄ᵢ is the complex conjugate of vᵢ
 * 
 * This is fundamental in quantum mechanics for:
 * - Computing probability amplitudes
 * - Calculating expectation values
 * - Determining orthogonality
 * - Normalizing quantum states
 * 
 * @param v - First vector
 * @param u - Second vector
 * @returns Complex inner product
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
 * Subtracts two complex vectors component-wise
 * 
 * Used in:
 * - Gram-Schmidt orthogonalization
 * - Error calculation
 * - Vector space operations
 * 
 * @param v - First vector
 * @param u - Second vector
 * @returns v - u component-wise
 * @private
 */
function subtractVectors(v: Complex[], u: Complex[]): Complex[] {
    return v.map((vi, i) => 
        math.subtract(vi, u[i]) as Complex
    );
}

/**
 * Computes the norm (length) of a complex vector
 * 
 * The norm is defined as: √(⟨v|v⟩)
 * where ⟨v|v⟩ is the inner product of v with itself
 * 
 * Critical in quantum mechanics for:
 * - Normalizing quantum states
 * - Computing probabilities
 * - Validating unitary transformations
 * 
 * @param v - Complex vector
 * @returns Norm of the vector
 * @private
 */
function vectorNorm(v: Complex[]): number {
    const normComplex = math.sqrt(innerProduct(v, v)) as Complex;
    return Math.sqrt(normComplex.re * normComplex.re + normComplex.im * normComplex.im);
}

/**
 * Rounds a number to a specified precision
 * 
 * Used for:
 * - Handling numerical noise
 * - Comparing floating point numbers
 * - Grouping nearly-equal eigenvalues
 * 
 * @param value - Number to round
 * @param precision - Precision threshold
 * @returns Rounded value
 * @private
 */
function roundToPrec(value: number, precision: number): number {
    return Math.round(value / precision) * precision;
}

/**
 * Verifies the correctness of eigendecomposition
 * 
 * Checks that Av = λv for each eigenpair (λ,v) within specified precision.
 * This verification is important because:
 * - Numerical methods can accumulate errors
 * - Degenerate eigenvalues need special attention
 * - Physical meaning depends on mathematical accuracy
 * 
 * @param matrix - Original matrix
 * @param values - Computed eigenvalues
 * @param vectors - Computed eigenvectors
 * @param precision - Tolerance for verification
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
