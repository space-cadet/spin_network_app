/**
 * Quantum Matrix Operations (v2)
 * 
 * Provides a robust, type-safe implementation of matrix operations
 * for quantum computations with proper error handling and consistent
 * behavior patterns.
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

export interface MatrixOperationResult<T> {
    success: boolean;
    result?: T;
    error?: MatrixError;
}

export interface EigendecompositionResult {
    values: Complex[];
    vectors: QuantumMatrix[];
}

export enum MatrixErrorType {
    INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
    INCOMPATIBLE_DIMENSIONS = 'INCOMPATIBLE_DIMENSIONS',
    NON_SQUARE_MATRIX = 'NON_SQUARE_MATRIX',
    INVALID_DATA = 'INVALID_DATA',
    CONVERSION_ERROR = 'CONVERSION_ERROR',
    COMPUTATION_ERROR = 'COMPUTATION_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface MatrixErrorDetails {
    message: string;
    expected?: MatrixDimensions;
    actual?: MatrixDimensions;
    location?: string;
}

// ==================== Error Handling ====================

export class MatrixError extends Error {
    constructor(
        public readonly type: MatrixErrorType,
        public readonly details: MatrixErrorDetails
    ) {
        super(details.message);
        this.name = 'MatrixError';
    }
}

// ==================== Configuration ====================

export interface MatrixConfig {
    numericalThreshold: number;
    validateOperations: boolean;
    throwOnError: boolean;
}

const DEFAULT_CONFIG: MatrixConfig = {
    numericalThreshold: 1e-14,
    validateOperations: true,
    throwOnError: true
};

// ==================== Main Matrix Class ====================

export class QuantumMatrix {
    private readonly dimensions: MatrixDimensions;
    private elements: ComplexMatrix;
    private mathMatrix: math.Matrix | null = null;
    
    constructor(
        data: ComplexMatrix,
        private config: MatrixConfig = DEFAULT_CONFIG
    ) {
        const validationResult = this.validateInput(data);
        if (!validationResult.success) {
            throw new MatrixError(
                MatrixErrorType.INVALID_DATA,
                { message: validationResult.error?.details.message || 'Invalid matrix data' }
            );
        }
        
        this.dimensions = {
            rows: data.length,
            cols: data[0].length
        };
        this.elements = this.cleanupNumericalNoise(data);
    }

    // ==================== Static Creators ====================

    static identity(size: number): QuantumMatrix {
        const elements: ComplexMatrix = Array(size).fill(null).map((_, i) =>
            Array(size).fill(null).map((_, j) => ({
                re: i === j ? 1 : 0,
                im: 0
            }))
        );
        return new QuantumMatrix(elements);
    }

    static zero(rows: number, cols: number): QuantumMatrix {
        const elements: ComplexMatrix = Array(rows).fill(null).map(() =>
            Array(cols).fill(null).map(() => ({ re: 0, im: 0 }))
        );
        return new QuantumMatrix(elements);
    }

    // ==================== Core Operations ====================

    multiply(other: QuantumMatrix): MatrixOperationResult<QuantumMatrix> {
        try {
            if (this.dimensions.cols !== other.dimensions.rows) {
                throw new MatrixError(
                    MatrixErrorType.INCOMPATIBLE_DIMENSIONS,
                    {
                        message: 'Matrix dimensions incompatible for multiplication',
                        expected: { rows: this.dimensions.rows, cols: other.dimensions.cols },
                        actual: { rows: this.dimensions.rows, cols: this.dimensions.cols }
                    }
                );
            }

            const thisMatrix = this.getMathMatrix();
            const otherMatrix = other.getMathMatrix();
            const resultMatrix = math.multiply(thisMatrix, otherMatrix);
            const resultArray = this.fromMathMatrix(resultMatrix);

            return {
                success: true,
                result: new QuantumMatrix(resultArray)
            };
        } catch (error) {
            return this.handleError(error as Error);
        }
    }

    add(other: QuantumMatrix): MatrixOperationResult<QuantumMatrix> {
        try {
            if (this.dimensions.rows !== other.dimensions.rows ||
                this.dimensions.cols !== other.dimensions.cols) {
                throw new MatrixError(
                    MatrixErrorType.INCOMPATIBLE_DIMENSIONS,
                    {
                        message: 'Matrix dimensions must match for addition',
                        expected: this.dimensions,
                        actual: other.dimensions
                    }
                );
            }

            const thisMatrix = this.getMathMatrix();
            const otherMatrix = other.getMathMatrix();
            const resultMatrix = math.add(thisMatrix, otherMatrix);
            const resultArray = this.fromMathMatrix(resultMatrix);

            return {
                success: true,
                result: new QuantumMatrix(resultArray)
            };
        } catch (error) {
            return this.handleError(error as Error);
        }
    }

    tensorProduct(other: QuantumMatrix): MatrixOperationResult<QuantumMatrix> {
        try {
            const thisMatrix = this.getMathMatrix();
            const otherMatrix = other.getMathMatrix();
            const resultMatrix = math.kron(thisMatrix, otherMatrix);
            const resultArray = this.fromMathMatrix(resultMatrix);

            return {
                success: true,
                result: new QuantumMatrix(resultArray)
            };
        } catch (error) {
            return this.handleError(error as Error);
        }
    }

    adjoint(): MatrixOperationResult<QuantumMatrix> {
        try {
            const conjugate = this.elements.map(row =>
                row.map(element => ({
                    re: element.re,
                    im: -element.im
                }))
            );

            const transposed: ComplexMatrix = Array(this.dimensions.cols)
                .fill(null)
                .map((_, i) =>
                    Array(this.dimensions.rows)
                        .fill(null)
                        .map((_, j) => conjugate[j][i])
                );

            return {
                success: true,
                result: new QuantumMatrix(transposed)
            };
        } catch (error) {
            return this.handleError(error as Error);
        }
    }

    eigendecomposition(): MatrixOperationResult<EigendecompositionResult> {
        try {
            if (!this.isSquare()) {
                throw new MatrixError(
                    MatrixErrorType.NON_SQUARE_MATRIX,
                    {
                        message: 'Eigendecomposition requires a square matrix',
                        actual: this.dimensions
                    }
                );
            }

            const mathMatrix = this.getMathMatrix();
            const { values, vectors } = math.eigs(mathMatrix);

            // Convert eigenvalues to Complex[]
            const complexValues = (values as number[]).map(v => ({
                re: v,
                im: 0
            }));

            // Convert eigenvectors to QuantumMatrix[]
            const complexVectors = (vectors.valueOf() as number[][]).map(vec =>
                new QuantumMatrix(vec.map(v => ({ re: v, im: 0 })))
            );

            return {
                success: true,
                result: {
                    values: complexValues,
                    vectors: complexVectors
                }
            };
        } catch (error) {
            return this.handleError(error as Error);
        }
    }

    // ==================== Matrix Properties ====================

    isHermitian(tolerance: number = this.config.numericalThreshold): boolean {
        if (!this.isSquare()) {
            return false;
        }

        const adjoint = this.adjoint();
        if (!adjoint.success || !adjoint.result) {
            return false;
        }

        for (let i = 0; i < this.dimensions.rows; i++) {
            for (let j = 0; j < this.dimensions.cols; j++) {
                const diff = {
                    re: Math.abs(this.elements[i][j].re - adjoint.result.elements[i][j].re),
                    im: Math.abs(this.elements[i][j].im - adjoint.result.elements[i][j].im)
                };
                if (diff.re > tolerance || diff.im > tolerance) {
                    return false;
                }
            }
        }
        return true;
    }

    isUnitary(tolerance: number = this.config.numericalThreshold): boolean {
        if (!this.isSquare()) {
            return false;
        }

        const adjoint = this.adjoint();
        if (!adjoint.success || !adjoint.result) {
            return false;
        }

        const product = this.multiply(adjoint.result);
        if (!product.success || !product.result) {
            return false;
        }

        const identity = QuantumMatrix.identity(this.dimensions.rows);
        
        for (let i = 0; i < this.dimensions.rows; i++) {
            for (let j = 0; j < this.dimensions.cols; j++) {
                const diff = {
                    re: Math.abs(product.result.elements[i][j].re - identity.elements[i][j].re),
                    im: Math.abs(product.result.elements[i][j].im - identity.elements[i][j].im)
                };
                if (diff.re > tolerance || diff.im > tolerance) {
                    return false;
                }
            }
        }
        return true;
    }

    trace(): Complex {
        if (!this.isSquare()) {
            throw new MatrixError(
                MatrixErrorType.NON_SQUARE_MATRIX,
                {
                    message: 'Trace is only defined for square matrices',
                    actual: this.dimensions
                }
            );
        }

        return this.elements.reduce((sum, row, i) => ({
            re: sum.re + row[i].re,
            im: sum.im + row[i].im
        }), { re: 0, im: 0 });
    }

    getDimensions(): MatrixDimensions {
        return { ...this.dimensions };
    }

    getElements(): ComplexMatrix {
        return this.elements.map(row => [...row]);
    }

    isSquare(): boolean {
        return this.dimensions.rows === this.dimensions.cols;
    }

    // ==================== Private Utilities ====================

    private validateInput(data: ComplexMatrix): MatrixOperationResult<void> {
        if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
            return {
                success: false,
                error: new MatrixError(
                    MatrixErrorType.INVALID_DATA,
                    { message: 'Invalid matrix structure' }
                )
            };
        }

        const cols = data[0].length;
        if (!data.every(row => Array.isArray(row) && row.length === cols)) {
            return {
                success: false,
                error: new MatrixError(
                    MatrixErrorType.INVALID_DIMENSIONS,
                    { message: 'Inconsistent row lengths' }
                )
            };
        }

        if (!data.every(row => row.every(element =>
            typeof element === 'object' &&
            typeof element.re === 'number' &&
            typeof element.im === 'number' &&
            !isNaN(element.re) &&
            !isNaN(element.im)
        ))) {
            return {
                success: false,
                error: new MatrixError(
                    MatrixErrorType.INVALID_DATA,
                    { message: 'Invalid complex number format' }
                )
            };
        }

        return { success: true };
    }

    private cleanupNumericalNoise(data: ComplexMatrix): ComplexMatrix {
        return data.map(row =>
            row.map(element => ({
                re: Math.abs(element.re) < this.config.numericalThreshold ? 0 : element.re,
                im: Math.abs(element.im) < this.config.numericalThreshold ? 0 : element.im
            }))
        );
    }

    private getMathMatrix(): math.Matrix {
        if (!this.mathMatrix) {
            this.mathMatrix = math.matrix(
                this.elements.map(row =>
                    row.map(element =>
                        math.complex({re: element.re, im:  element.im})
                    )
                )
            );
        }
        return this.mathMatrix;
    }

    private fromMathMatrix(matrix: math.Matrix): ComplexMatrix {
        const data = matrix.valueOf() as any[][];
        return data.map(row =>
            row.map(element => ({
                re: element.re || 0,
                im: element.im || 0
            }))
        );
    }

    private handleError(error: Error): MatrixOperationResult<never> {
        const matrixError = error instanceof MatrixError
            ? error
            : new MatrixError(
                MatrixErrorType.COMPUTATION_ERROR,
                { message: error.message }
            );

        if (this.config.throwOnError) {
            throw matrixError;
        }

        return {
            success: false,
            error: matrixError
        };
    }
}
