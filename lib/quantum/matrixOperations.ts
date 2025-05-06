/**
 * Core matrix operations for quantum computations
 */

import { Complex } from './types';
import { createComplex, multiplyComplex, addComplex, conjugateComplex } from './complex';

// Only clean up extreme numerical noise
const NUMERICAL_THRESHOLD = 1e-15;

/**
 * Helper function for Kahan summation of complex numbers
 */
function kahanSum(numbers: Complex[]): Complex {
    if (numbers.length === 0) {
        return { re: 0, im: 0 };
    }

    let sum = { re: 0, im: 0 }; // Initialize to zero
    let c = { re: 0, im: 0 };   // Compensation term

    for (const num of numbers) {
        const y = {
            re: num.re - c.re,
            im: num.im - c.im
        };

        const t = {
            re: sum.re + y.re,
            im: sum.im + y.im
        };

        c = {
            re: (t.re - sum.re) - y.re,
            im: (t.im - sum.im) - y.im
        };

        sum = t;
    }

    return sum;
}

/**
 * Multiplies two complex matrices with enhanced numerical stability
 */
export function multiplyMatrices(a: Complex[][], b: Complex[][]): Complex[][] {
    if (!a || !b || a.length === 0 || b.length === 0) {
        throw new Error('Invalid matrix dimensions');
    }
    if (a[0].length !== b.length) {
        throw new Error('Matrix dimensions do not match for multiplication');
    }

    const m = a.length;
    const n = b[0].length;
    const p = b.length;

    const result = Array(m).fill(null)
        .map(() => Array(n).fill(null)
            .map(() => createComplex(0, 0)));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const products: Complex[] = [];
            
            for (let k = 0; k < p; k++) {
                products.push(multiplyComplex(a[i][k], b[k][j]));
            }
            
            const sum = kahanSum(products);
            
            // Only clean up extremely small values that are likely numerical noise
            result[i][j] = {
                re: Math.abs(sum.re) < NUMERICAL_THRESHOLD ? 0 : sum.re,
                im: Math.abs(sum.im) < NUMERICAL_THRESHOLD ? 0 : sum.im
            };
        }
    }

    return result;
}

/**
 * Computes matrix exponential using Taylor series with scaling and squaring
 */
export function matrixExponential(
    matrix: Complex[][],
    maxTerms: number = 30,
    tolerance: number = 1e-12
): Complex[][] {
    const dim = matrix.length;
    if (!matrix[0] || matrix[0].length !== dim) {
        throw new Error('Matrix must be square');
    }

    // Compute matrix norm to determine scaling
    let maxNorm = 0;
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            const elem = matrix[i][j];
            maxNorm = Math.max(maxNorm, Math.sqrt(elem.re * elem.re + elem.im * elem.im));
        }
    }

    // Determine scaling factor (power of 2)
    const scalingPower = Math.max(0, Math.ceil(Math.log2(maxNorm)));
    const scalingFactor = Math.pow(2, scalingPower);
    
    // Scale matrix
    const scaledMatrix = scaleMatrix(matrix, createComplex(1/scalingFactor, 0));

    // Initialize result to identity matrix
    const result = Array(dim).fill(null).map((_, i) => 
        Array(dim).fill(null).map((_, j) => 
            i === j ? createComplex(1, 0) : createComplex(0, 0)
        )
    );

    // Initialize term to identity
    let term = Array(dim).fill(null).map((_, i) => 
        Array(dim).fill(null).map((_, j) => 
            i === j ? createComplex(1, 0) : createComplex(0, 0)
        )
    );

    let maxElement = 0;

    // Compute sum of terms with convergence check
    for (let n = 1; n <= maxTerms; n++) {
        // Multiply term by scaled matrix and divide by n
        term = multiplyMatrices(term, scaledMatrix).map(row =>
            row.map(element => ({
                re: element.re / n,
                im: element.im / n
            }))
        );

        // Track largest element for convergence check
        maxElement = 0;
        
        // Add to result and check convergence
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                const termElement = term[i][j];
                maxElement = Math.max(maxElement, 
                    Math.sqrt(termElement.re * termElement.re + termElement.im * termElement.im));
                result[i][j] = addComplex(result[i][j], term[i][j]);
            }
        }

        // Check for convergence
        if (maxElement < tolerance) {
            // Square the result scalingPower times
            let finalResult = result;
            for (let k = 0; k < scalingPower; k++) {
                finalResult = multiplyMatrices(finalResult, finalResult);
            }
            return finalResult;
        }
    }

    throw new Error('Matrix exponential did not converge');
}

/**
 * Computes tensor product of two matrices
 */
export function tensorProduct(a: Complex[][], b: Complex[][]): Complex[][] {
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
                    result[i][j] = multiplyComplex(a[i1][j1], b[i2][j2]);
                }
            }
        }
    }

    return result;
}

/**
 * Computes the adjoint (conjugate transpose) of a matrix
 */
export function adjoint(matrix: Complex[][]): Complex[][] {
    if (!matrix || matrix.length === 0) {
        throw new Error('Invalid matrix');
    }

    const m = matrix.length;
    const n = matrix[0].length;

    return Array(n).fill(null).map((_, i) =>
        Array(m).fill(null).map((_, j) => ({
            re: matrix[j][i].re,
            // Negate imaginary part when conjugating
            im: matrix[j][i].im === 0 ? 0 : -matrix[j][i].im
        }))
    );
}

/**
 * Adds two matrices
 */
export function addMatrices(a: Complex[][], b: Complex[][]): Complex[][] {
    if (!a || !b || a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error('Matrix dimensions must match for addition');
    }

    return a.map((row, i) =>
        row.map((elem, j) =>
            addComplex(elem, b[i][j])
        )
    );
}

/**
 * Scales a matrix by a complex number
 */
export function scaleMatrix(matrix: Complex[][], scalar: Complex): Complex[][] {
    if (!matrix || matrix.length === 0) {
        throw new Error('Invalid matrix');
    }

    return matrix.map(row =>
        row.map(elem =>
            multiplyComplex(elem, scalar)
        )
    );
}

/**
 * Checks if matrix is Hermitian (self-adjoint)
 */
export function isHermitian(matrix: Complex[][], tolerance: number = 1e-10): boolean {
    const adjointMatrix = adjoint(matrix);
    const m = matrix.length;
    const n = matrix[0].length;

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const diff = {
                re: Math.abs(matrix[i][j].re - adjointMatrix[i][j].re),
                im: Math.abs(matrix[i][j].im - adjointMatrix[i][j].im)
            };
            if (diff.re > tolerance || diff.im > tolerance) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Checks if matrix is unitary
 */
export function isUnitary(matrix: Complex[][], tolerance: number = 1e-10): boolean {
    const adjointMatrix = adjoint(matrix);
    const product = multiplyMatrices(matrix, adjointMatrix);
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const expected = i === j ? createComplex(1, 0) : createComplex(0, 0);
            const diff = {
                re: Math.abs(product[i][j].re - expected.re),
                im: Math.abs(product[i][j].im - expected.im)
            };
            if (diff.re > tolerance || diff.im > tolerance) {
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
export function eigenDecomposition(matrix: Complex[][]): {
    values: Complex[];
    vectors: Complex[][];
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
    let vector = Array(dim).fill(0).map(() => Math.random());
    
    // Normalize initial vector
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    vector = vector.map(v => v / norm);

    for (let iter = 0; iter < 100; iter++) {
        // Apply matrix
        const newVector = vector.map((_, i) => 
            vector.reduce((sum, v, j) => sum + matrix[i][j] * v, 0)
        );

        // Normalize
        const newNorm = Math.sqrt(newVector.reduce((sum, v) => sum + v * v, 0));
        const normalized = newVector.map(v => v / newNorm);

        // Check convergence
        const diff = normalized.reduce((sum, v, i) => 
            sum + Math.abs(v - vector[i]), 0
        );
        
        if (diff < 1e-10) {
            // Calculate eigenvalue using Rayleigh quotient
            const value = vector.reduce((sum, v, i) => 
                sum + v * newVector[i], 0
            );
            return { value, vector: normalized };
        }

        vector = normalized;
    }

    throw new Error('Power iteration did not converge');
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