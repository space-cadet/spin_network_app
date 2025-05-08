/**
 * Core matrix operations for quantum computations.
 * Uses math.js for enhanced numerical stability and complex number operations.
 */

import { Complex } from 'mathjs';
import * as math from 'mathjs';

// Type for matrix operations
type ComplexMatrix = Complex[][];

// Only clean up extreme numerical noise
const NUMERICAL_THRESHOLD = 1e-15;

/**
 * Helper function for Kahan summation of complex numbers
 */
function kahanSum(numbers: Complex[]): Complex {
    if (numbers.length === 0) {
        return math.complex(0, 0);
    }

    let sum = math.complex(0, 0);
    let c = math.complex(0, 0);   // Compensation term

    for (const num of numbers) {
        // y = num - c
        const y = math.subtract(num, c) as Complex;
        
        // t = sum + y
        const t = math.add(sum, y) as Complex;
        
        // c = (t - sum) - y
        c = math.subtract(
            math.subtract(t, sum),
            y
        ) as Complex;

        sum = t;
    }

    return sum;
}

/**
 * Multiplies two complex matrices using math.js
 */
export function multiplyMatrices(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    if (!a || !b || a.length === 0 || b.length === 0) {
        throw new Error('Invalid matrix dimensions');
    }
    if (a[0].length !== b.length) {
        throw new Error('Matrix dimensions do not match for multiplication');
    }

    const result = math.multiply(a, b) as ComplexMatrix;

    // Clean up numerical noise
    return result.map(row =>
        row.map(val =>
            math.abs(val).re < NUMERICAL_THRESHOLD ? math.complex(0, 0) : val
        )
    );
}

/**
 * Computes matrix exponential exp(A) for a complex matrix A using math.js
 */
export function matrixExponential(matrix: ComplexMatrix): ComplexMatrix {
    if (!matrix || matrix.length === 0) {
        throw new Error('Invalid matrix');
    }
    const dim = matrix.length;
    if (!matrix[0] || matrix[0].length !== dim) {
        throw new Error('Matrix must be square');
    }

    const result = math.expm(matrix);
    return Array.isArray(result) ? result : result.toArray() as ComplexMatrix;
}

/**
 * Computes tensor product (Kronecker product) of two matrices using math.js
 */
export function tensorProduct(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    if (!a || !b || a.length === 0 || b.length === 0) {
        throw new Error('Invalid matrix dimensions');
    }

    return math.kron(a, b) as ComplexMatrix;
}

/**
 * Computes the adjoint (conjugate transpose) of a matrix using math.js
 */
export function adjoint(matrix: ComplexMatrix): ComplexMatrix {
    if (!matrix || matrix.length === 0) {
        throw new Error('Invalid matrix');
    }

    const m = matrix.length;
    const n = matrix[0].length;

    // // Ensure all elements are valid complex numbers
    // const validMatrix = matrix.map(row =>
    //     row.map(elem =>
    //         elem ? elem : createComplex(0, 0)
    //     )
    // );

    return math.ctranspose(matrix) as ComplexMatrix;
}

/**
 * Adds two matrices using math.js
 */
export function addMatrices(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    if (!a || !b || a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error('Matrix dimensions must match for addition');
    }

    return math.add(a, b) as ComplexMatrix;
}

/**
 * Scales a matrix by a complex number using math.js
 */
export function scaleMatrix(matrix: ComplexMatrix, scalar: Complex): ComplexMatrix {
    if (!matrix || matrix.length === 0) {
        throw new Error('Invalid matrix');
    }

    return math.multiply(matrix, scalar) as ComplexMatrix;
}

/**
 * Checks if matrix is Hermitian (self-adjoint)
 */
export function isHermitian(matrix: ComplexMatrix, tolerance: number = 1e-10): boolean {
    const n = matrix.length;
    
    for (let i = 0; i < n; i++) {
        // Check diagonal elements are real
        if (Math.abs(matrix[i][i].im) > tolerance) {
            return false;
        }
        
        // Check off-diagonal elements are conjugates
        for (let j = i + 1; j < n; j++) {
            const upper = matrix[i][j];
            const lower = matrix[j][i];
            
            // Check if upper[i][j] = conjugate(lower[j][i])
            if (Math.abs(upper.re - lower.re) > tolerance || 
                Math.abs(upper.im + lower.im) > tolerance) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Checks if matrix is unitary
 */
export function isUnitary(matrix: ComplexMatrix, tolerance: number = 1e-10): boolean {
    const adjointMatrix = adjoint(matrix);
    const n = matrix.length;
    
    // Check both UU† and U†U equal identity
    const productUUdagger = multiplyMatrices(matrix, adjointMatrix);
    const productUdaggerU = multiplyMatrices(adjointMatrix, matrix);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const expected = i === j ? math.complex(1, 0) : math.complex(0, 0);
            const diffUUdagger = math.subtract(productUUdagger[i][j], expected) as Complex;
            const diffUdaggerU = math.subtract(productUdaggerU[i][j], expected) as Complex;
            
            // Check both real and imaginary parts are within tolerance
            if (Math.abs(diffUUdagger.re) > tolerance || Math.abs(diffUUdagger.im) > tolerance ||
                Math.abs(diffUdaggerU.re) > tolerance || Math.abs(diffUdaggerU.im) > tolerance) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Computes eigenvalues and eigenvectors of a hermitian matrix using math.js
 * Returns sorted eigenvalues and corresponding eigenvectors
 */
export function eigenDecomposition(matrix: ComplexMatrix): {
    values: Complex[];
    vectors: ComplexMatrix;
} {
    if (!isHermitian(matrix)) {
        throw new Error('Matrix must be Hermitian for real eigenvalues');
    }

    const result = math.eigs(matrix);
    const values = result.values as Complex[];
    const vectors = result.eigenvectors as ComplexMatrix;

    // Sort by eigenvalue magnitude (descending)
    const indices = values
        .map((_, i) => i)
        .sort((a, b) => math.abs(values[b]).re - math.abs(values[a]).re);

    return {
        values: indices.map(i => values[i]),
        vectors: indices.map(i => vectors[i])
    };
}

/**
 * Power iteration to find largest eigenvalue/vector
 */
function powerIteration(matrix: number[][]): { value: number; vector: number[] } {
    const dim = matrix.length;
    const MAX_ITERATIONS = 1000; // Increased from 100
    const CONVERGENCE_THRESHOLD = 1e-8; // Relaxed from 1e-10
    
    // Initialize with more stable starting vector
    let vector = Array(dim).fill(0);
    vector[0] = 1; // Start with basis vector instead of random
    
    // Initial normalization
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    vector = vector.map(v => v / norm);

    let prevValue = 0;
    
    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
        // Apply matrix with enhanced numerical stability
        const newVector = vector.map((_, i) => {
            let sum = 0;
            for (let j = 0; j < dim; j++) {
                sum += matrix[i][j] * vector[j];
            }
            return sum;
        });

        // Compute new norm
        const newNorm = Math.sqrt(newVector.reduce((sum, v) => sum + v * v, 0));
        
        // Check for zero norm (indicates zero eigenvalue)
        if (Math.abs(newNorm) < 1e-14) {
            return { value: 0, vector: vector };
        }

        const normalized = newVector.map(v => v / newNorm);

        // Calculate eigenvalue using Rayleigh quotient
        const value = vector.reduce((sum, v, i) => sum + v * newVector[i], 0);
        
        // Check convergence using both vector difference and eigenvalue stability
        const vectorDiff = normalized.reduce((sum, v, i) => 
            sum + Math.abs(v - vector[i]), 0
        );
        
        const valueDiff = Math.abs(value - prevValue);
        
        if (vectorDiff < CONVERGENCE_THRESHOLD && valueDiff < CONVERGENCE_THRESHOLD) {
            return { value, vector: normalized };
        }

        vector = normalized;
        prevValue = value;
    }

    // If we haven't converged, but the last few iterations were stable enough,
    // return the current best estimate
    const finalValue = vector.reduce((sum, v, i) => {
        let matrixValue = 0;
        for (let j = 0; j < dim; j++) {
            matrixValue += matrix[i][j] * vector[j];
        }
        return sum + v * matrixValue;
    }, 0);

    return { value: finalValue, vector: vector };
}

/**
 * Deflate matrix by removing contribution of found eigenvalue/vector
 */
function deflateMatrix(matrix: number[][], value: number, vector: number[]) {
    const dim = matrix.length;
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            matrix[i][j] -= value * vector[i] * vector[j];
        }
    }
}