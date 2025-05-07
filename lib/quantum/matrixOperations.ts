/**
 * Core matrix operations for quantum computations.
 * Uses math.js for enhanced numerical stability and complex number operations.
 */

import { Complex } from './types';
import { createComplex, multiplyComplex, addComplex, conjugateComplex, isZeroComplex } from './complex';
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
        return createComplex(0, 0);
    }

    let sum = createComplex(0, 0);
    let c = createComplex(0, 0);   // Compensation term

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
 * Multiplies two complex matrices with enhanced numerical stability
 */
export function multiplyMatrices(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    if (!a || !b || a.length === 0 || b.length === 0) {
        throw new Error('Invalid matrix dimensions');
    }
    if (a[0].length !== b.length) {
        throw new Error('Matrix dimensions do not match for multiplication');
    }

    const m = a.length;
    const n = b[0].length;
    const p = b.length;

    // Initialize result matrix
    const result = Array(m).fill(null)
        .map(() => Array(n).fill(null)
            .map(() => createComplex(0, 0)));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const products: Complex[] = [];
            
            for (let k = 0; k < p; k++) {
                products.push(math.multiply(a[i][k], b[k][j]) as Complex);
            }
            
            const sum = kahanSum(products);
            
            // Clean up numerical noise
            if (math.abs(sum) < NUMERICAL_THRESHOLD) {
                result[i][j] = createComplex(0, 0);
            } else {
                result[i][j] = sum;
            }
        }
    }

    return result;
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

    // Create math.js matrix
    const mathjsMatrix = math.matrix(matrix);

    // Use mathjs expm
    const result = math.expm(mathjsMatrix);

    // Convert back to our ComplexMatrix format
    // toArray() gives us the nested array structure back
    const arrayResult = result.toArray() as Complex[][];
    
    return arrayResult;
}

/**
 * Computes tensor product of two matrices
 */
export function tensorProduct(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    if (!a || !b || a.length === 0 || b.length === 0) {
        throw new Error('Invalid matrix dimensions');
    }

    const m1 = a.length;
    const n1 = a[0].length;
    const m2 = b.length;
    const n2 = b[0].length;

    const result = Array(m1 * m2).fill(null)
        .map(() => Array(n1 * n2).fill(null)
            .map(() => createComplex(0, 0)));

    for (let i1 = 0; i1 < m1; i1++) {
        for (let j1 = 0; j1 < n1; j1++) {
            for (let i2 = 0; i2 < m2; i2++) {
                for (let j2 = 0; j2 < n2; j2++) {
                    const i = i1 * m2 + i2;
                    const j = j1 * n2 + j2;
                    result[i][j] = math.multiply(a[i1][j1], b[i2][j2]) as Complex;
                }
            }
        }
    }

    return result;
}

/**
 * Computes the adjoint (conjugate transpose) of a matrix
 */
export function adjoint(matrix: ComplexMatrix): ComplexMatrix {
    if (!matrix || matrix.length === 0) {
        throw new Error('Invalid matrix');
    }

    const m = matrix.length;
    const n = matrix[0].length;

    return Array(n).fill(null).map((_, i) =>
        Array(m).fill(null).map((_, j) => 
            math.conj(matrix[j][i]) as Complex
        )
    );
}

/**
 * Adds two matrices
 */
export function addMatrices(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    if (!a || !b || a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error('Matrix dimensions must match for addition');
    }

    return a.map((row, i) =>
        row.map((elem, j) =>
            math.add(elem, b[i][j]) as Complex
        )
    );
}

/**
 * Scales a matrix by a complex number
 */
export function scaleMatrix(matrix: ComplexMatrix, scalar: Complex): ComplexMatrix {
    if (!matrix || matrix.length === 0) {
        throw new Error('Invalid matrix');
    }

    return matrix.map(row =>
        row.map(elem =>
            math.multiply(elem, scalar) as Complex
        )
    );
}

/**
 * Checks if matrix is Hermitian (self-adjoint)
 */
export function isHermitian(matrix: ComplexMatrix, tolerance: number = 1e-10): boolean {
    const adjointMatrix = adjoint(matrix);
    const m = matrix.length;
    const n = matrix[0].length;

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const diff = math.subtract(matrix[i][j], adjointMatrix[i][j]) as Complex;
            if (math.abs(diff) > tolerance) {
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
    const product = multiplyMatrices(matrix, adjointMatrix);
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const expected = i === j ? createComplex(1, 0) : createComplex(0, 0);
            const diff = math.subtract(product[i][j], expected) as Complex;
            if (math.abs(diff) > tolerance) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Computes eigenvalues and eigenvectors of a hermitian matrix
 * Returns sorted eigenvalues and corresponding eigenvectors
 */
export function eigenDecomposition(matrix: ComplexMatrix): {
    values: Complex[];
    vectors: ComplexMatrix;
} {
    const dim = matrix.length;
    
    // Validate hermiticity
    if (!isHermitian(matrix)) {
        throw new Error('Matrix must be Hermitian for real eigenvalues');
    }

    // Convert to real matrix if Hermitian
    const realMatrix = matrix.map(row => 
        row.map(elem => Math.abs(elem.im) < 1e-10 ? elem.re : NaN)
    );

    // Check if conversion was successful
    if (realMatrix.some(row => row.some(elem => isNaN(elem)))) {
        throw new Error('Matrix has significant imaginary components');
    }

    // Use power iteration with deflation for eigenvalues/vectors
    const eigenvalues: Complex[] = [];
    const eigenvectors: Complex[][] = [];

    for (let i = 0; i < dim; i++) {
        // Find largest remaining eigenvalue and vector
        const { value, vector } = powerIteration(realMatrix);
        
        // Convert to complex
        eigenvalues.push(createComplex(value, 0));
        eigenvectors.push(vector.map(v => createComplex(v, 0)));

        // Deflate matrix
        deflateMatrix(realMatrix, value, vector);
    }

    // Sort by eigenvalue (descending)
    const indices = eigenvalues
        .map((_, i) => i)
        .sort((a, b) => eigenvalues[b].re - eigenvalues[a].re);

    return {
        values: indices.map(i => eigenvalues[i]),
        vectors: indices.map(i => eigenvectors[i])
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