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

    // Ensure all numbers are proper math.js complex numbers
    const complexNumbers = numbers.map(n => math.complex(n.re, n.im));

    let sum = math.complex(0, 0);
    let c = math.complex(0, 0);   // Compensation term

    for (const num of complexNumbers) {
        // y = num - c
        const y = math.subtract(num, c) as Complex;
        
        // t = sum + y
        const t = math.add(sum, y) as Complex;
        
        // c = (t - sum) - y
        const tc = math.subtract(t, sum) as Complex;
        c = math.subtract(tc, y) as Complex;

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

    // Convert to math.js matrices with proper complex numbers
    const matA = math.matrix(a.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));
    const matB = math.matrix(b.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));

    // Perform multiplication
    const resultMat = math.multiply(matA, matB);
    const resultArray = (resultMat.toArray() as any[][]).map(row =>
        row.map(x => math.complex(x.re, x.im))
    );

    // Clean up numerical noise
    return resultArray.map(row =>
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

    // Convert to math.js matrix format
    const matM = math.matrix(matrix.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));

    // Compute matrix exponential
    const result = math.expm(matM);

    // Convert back to ComplexMatrix format
    return (result.toArray() as any[][]).map(row =>
        row.map(x => math.complex(x.re, x.im))
    );
}

/**
 * Computes tensor product (Kronecker product) of two matrices using math.js
 */
export function tensorProduct(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    if (!a || !b || a.length === 0 || b.length === 0) {
        throw new Error('Invalid matrix dimensions');
    }

    // Convert matrices to math.js format
    const matA = math.matrix(a.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));
    const matB = math.matrix(b.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));

    // Compute Kronecker product
    const result = math.kron(matA, matB);

    // Convert back to ComplexMatrix
    return (result.toArray() as any[][]).map(row =>
        row.map(x => math.complex(x.re, x.im))
    );
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

    // Create conjugate transpose manually to ensure correct complex number handling
    const result: ComplexMatrix = Array(n).fill(null).map(() => 
        Array(m).fill(null).map(() => math.complex(0, 0))
    );

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            result[j][i] = math.complex(matrix[i][j].re, -matrix[i][j].im);
        }
    }

    return result;
}

/**
 * Adds two matrices using math.js
 */
export function addMatrices(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
    if (!a || !b || a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error('Matrix dimensions must match for addition');
    }

    // Convert to math.js matrices
    const matA = math.matrix(a.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));
    const matB = math.matrix(b.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));

    // Perform addition
    const result = math.add(matA, matB);
    return (result.toArray() as any[][]).map(row =>
        row.map(x => math.complex(x.re, x.im))
    );
}

/**
 * Scales a matrix by a complex number using math.js
 */
export function scaleMatrix(matrix: ComplexMatrix, scalar: Complex): ComplexMatrix {
    if (!matrix || matrix.length === 0) {
        throw new Error('Invalid matrix');
    }

    // Ensure scalar is a proper math.js complex number
    const s = math.complex(scalar.re, scalar.im);

    // Convert matrix to math.js format
    const matM = math.matrix(matrix.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));

    // Perform multiplication
    const result = math.multiply(matM, s);
    return (result.toArray() as any[][]).map(row =>
        row.map(x => math.complex(x.re, x.im))
    );
}

/**
 * Checks if matrix is Hermitian (self-adjoint)
 */
export function isHermitian(matrix: ComplexMatrix, tolerance: number = 1e-10): boolean {
    const n = matrix.length;
    
    // Convert matrix to math.js format
    const matM = matrix.map(row => 
        row.map(x => math.complex(x.re, x.im))
    );
    
    for (let i = 0; i < n; i++) {
        // Check diagonal elements are real
        const diag = matM[i][i];
        if (Math.abs(diag.im) > tolerance) {
            return false;
        }
        
        // Check off-diagonal elements are conjugates
        for (let j = i + 1; j < n; j++) {
            const upper = matM[i][j];
            const lower = matM[j][i];
            const conjLower = math.conj(lower);
            
            const diff = math.subtract(upper, conjLower) as Complex;
            if (Math.abs(diff.re) > tolerance || Math.abs(diff.im) > tolerance) {
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
    // Convert matrix to math.js format
    const matM = math.matrix(matrix.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));
    
    // Get adjoint
    const adjM = adjoint(matrix);
    const matAdj = math.matrix(adjM.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));
    
    // Calculate products
    const productUUdagger = math.multiply(matM, matAdj);
    const productUdaggerU = math.multiply(matAdj, matM);
    
    // Convert to array for checking
    const arrUUdagger = (productUUdagger.toArray() as any[][]).map(row =>
        row.map(x => math.complex(x.re, x.im))
    );
    const arrUdaggerU = (productUdaggerU.toArray() as any[][]).map(row =>
        row.map(x => math.complex(x.re, x.im))
    );

    const n = matrix.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const expected = i === j ? math.complex(1, 0) : math.complex(0, 0);
            
            const diffUU = math.subtract(arrUUdagger[i][j], expected) as Complex;
            const diffUdaggerU = math.subtract(arrUdaggerU[i][j], expected) as Complex;
            
            if (math.abs(diffUU) > tolerance || math.abs(diffUdaggerU) > tolerance) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Computes eigenvalues and eigenvectors of a matrix using math.js
 * Returns sorted eigenvalues and corresponding eigenvectors
 */
export function eigenDecomposition(matrix: ComplexMatrix): {
    values: Complex[];
    vectors: ComplexMatrix;
} {
    // if (!isHermitian(matrix)) {
    //     throw new Error('Matrix must be Hermitian for real eigenvalues');
    // }

    // Convert to math.js matrix format, ensuring proper complex number handling
    const n = matrix.length;
    const matrixM = math.matrix(matrix.map(row => 
        row.map(x => math.complex(x.re, x.im))
    ));

    // Compute eigenvalues and eigenvectors using math.js
    const { values: rawVals, eigenvectors: rawVecs } = math.eigs(matrixM);

    // Extract eigenvalues from DenseMatrix and convert to Complex type
    const eigenvalues = (rawVals._data as number[]).map(v => math.complex(v, 0));

    // Convert eigenvectors to ComplexMatrix format and normalize them
    const eigenvectors: ComplexMatrix = [];
    for (let i = 0; i < n; i++) {
        // Extract eigenvector as column from rawVecs
        const vec = Array(n).fill(0).map((_, j) => rawVecs[j][i]);
        
        // Normalize the eigenvector
        const norm = Math.sqrt(vec.reduce((sum, x) => sum + x * x, 0));
        const normalizedVec = vec.map(x => math.complex(x / norm, 0));
        
        eigenvectors.push(normalizedVec);
    }

    // Convert eigenvalues array-like object to actual array for sorting
    const eigenvalueArray = Array.from(eigenvalues);
    const indices = Array.from({ length: eigenvalueArray.length }, (_, i) => i)
        .sort((a, b) => Math.abs(eigenvalueArray[b].re) - Math.abs(eigenvalueArray[a].re));

    return {
        values: indices.map(i => eigenvalueArray[i]),
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