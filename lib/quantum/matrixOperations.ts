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

    // const m = matrix.length;
    // const n = matrix[0].length;

    // // Create conjugate transpose manually to ensure correct complex number handling
    // const result: ComplexMatrix = Array(n).fill(null).map(() => 
    //     Array(m).fill(null).map(() => math.complex(0, 0))
    // );

    // for (let i = 0; i < m; i++) {
    //     for (let j = 0; j < n; j++) {
    //         result[j][i] = math.complex(matrix[i][j].re, -matrix[i][j].im);
    //     }
    // }

    const result = math.transpose(math.conj(matrix));
    return result.valueOf() as ComplexMatrix;
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
    const matM = math.matrix(matrix);
    
    // Calculate M * M† (should equal identity)
    const matAdj = math.conj(math.transpose(matM));  // conjugate transpose
    const product = math.multiply(matM, matAdj);
    
    // Compare with identity matrix
    const n = matrix.length;
    const identity = math.identity(n);
    const diff = math.subtract(product, identity);
    
    // Check if difference matrix is approximately zero
    return math.norm(diff) < tolerance;
}

/**
 * Computes eigenvalues and eigenvectors of a matrix using math.js
 * Returns sorted eigenvalues and corresponding eigenvectors
 */
export function eigenDecomposition(matrix: ComplexMatrix): {
    values: Complex[];
    vectors: ComplexMatrix;
} {
    const matrixM = math.matrix(matrix);
    const { values, eigenvectors } = math.eigs(matrixM);

    // Convert values to Complex numbers regardless of input type
    const eigenvalues = (values.valueOf() as number[]).map(v => math.complex(v));
    
    return {
        values: eigenvalues,
        vectors: eigenvectors.valueOf() as ComplexMatrix
    };
    
    // Ensure proper conversion from MathArray to our types
    // return {
    //     values: (values as math.Matrix).valueOf() as Complex[],
    //     vectors: (eigenvectors as math.Matrix).valueOf() as ComplexMatrix
    // };
}