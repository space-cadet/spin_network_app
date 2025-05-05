/**
 * Core matrix operations for quantum computations
 */

import { Complex } from './types';
import { createComplex, multiplyComplex, addComplex, conjugateComplex } from './complex';

/**
 * Multiplies two complex matrices
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
            for (let k = 0; k < p; k++) {
                const prod = multiplyComplex(a[i][k], b[k][j]);
                result[i][j] = addComplex(result[i][j], prod);
            }
        }
    }

    return result;
}

/**
 * Computes matrix exponential using Taylor series
 */
export function matrixExponential(
    matrix: Complex[][],
    terms: number = 10
): Complex[][] {
    const dim = matrix.length;
    if (!matrix[0] || matrix[0].length !== dim) {
        throw new Error('Matrix must be square');
    }

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

    // Compute sum of terms
    for (let n = 1; n <= terms; n++) {
        // Multiply term by matrix and divide by n
        term = multiplyMatrices(term, matrix).map(row =>
            row.map(element => ({
                re: element.re / n,
                im: element.im / n
            }))
        );

        // Add to result
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                result[i][j] = addComplex(result[i][j], term[i][j]);
            }
        }
    }

    return result;
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
        Array(m).fill(null).map((_, j) =>
            conjugateComplex(matrix[j][i])
        )
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