/**
 * Measurement operations for quantum states
 */

import { Complex, Operator, StateVector, MeasurementOutcome } from './types';
import { MatrixOperator } from './operator';
import * as math from 'mathjs';

/**
 * Implementation of a projection operator for quantum measurements
 */
export class ProjectionOperator implements Operator {
    private _operator: MatrixOperator;
    private _dimension: number;

    constructor(state: StateVector) {
        this._dimension = state.dimension;
        
        // Create projection matrix |ψ⟩⟨ψ| without validation
        const matrix: Complex[][] = Array(state.dimension).fill(null)
            .map(() => Array(state.dimension).fill(null).map(() => ({ re: 0, im: 0 })));
        
        for (let i = 0; i < state.dimension; i++) {
            for (let j = 0; j < state.dimension; j++) {
                // |ψ⟩⟨ψ| = ψi * ψj*
                matrix[i][j] = math.multiply(
                    state.amplitudes[i],
                    math.conj(state.amplitudes[j])
                ) as Complex;
            }
        }
        
        // Create operator without validation since we know it's a valid projection
        this._operator = new MatrixOperator(matrix, 'projection', false);
    }

    get dimension(): number {
        return this._dimension;
    }

    get type(): 'projection' {
        return 'projection';
    }

    apply(state: StateVector): StateVector {
        return this._operator.apply(state);
    }

    compose(other: Operator): Operator {
        // Manually implement composition with proper complex number handling
        const otherMatrix = other.toMatrix();
        const thisMatrix = this.toMatrix();
        const dim = this.dimension;

        // Initialize result matrix
        const resultMatrix = Array(dim).fill(null)
            .map(() => Array(dim).fill(null)
                .map(() => math.complex(0, 0)));

        // Calculate matrix product
        for (let i = 0; i < dim; i++) {
            for (let j = 0; j < dim; j++) {
                for (let k = 0; k < dim; k++) {
                    const term = math.multiply(
                        math.complex(thisMatrix[i][k].re, thisMatrix[i][k].im),
                        math.complex(otherMatrix[k][j].re, otherMatrix[k][j].im)
                    );
                    resultMatrix[i][j] = math.add(resultMatrix[i][j], term) as Complex;
                }
            }
        }

        return new MatrixOperator(resultMatrix, 'general');
    }

    adjoint(): Operator {
        // Projection operators are Hermitian
        return this;
    }

    toMatrix(): Complex[][] {
        return this._operator.toMatrix();
    }

    tensorProduct(other: Operator): Operator {
        return this._operator.tensorProduct(other);
    }

    partialTrace(dims: number[], traceOutIndices: number[]): Operator {
        return this._operator.partialTrace(dims, traceOutIndices);
    }
}

/**
 * Calculate expectation value of an operator for a given state
 */
export function expectationValue(state: StateVector, operator: Operator): Complex {
    const resultState = operator.apply(state);
    let result = math.complex(0, 0);

    for (let i = 0; i < state.dimension; i++) {
        // ⟨ψ|A|ψ⟩ = Σ ψi* (A|ψ⟩)i
        result = math.add(
            result,
            math.multiply(
                math.conj(state.amplitudes[i]),
                resultState.amplitudes[i]
            )
        ) as Complex;
    }

    return result;
}

/**
 * Perform a measurement on a quantum state with a given observable
 */
export function measureState(state: StateVector, operator: Operator): MeasurementOutcome {
    // For a projective measurement, the eigenvalue is 1 for the measured state
    const eigenvalue = 1;
    
    // Apply measurement operator
    const resultState = operator.apply(state);
    
    // Calculate probability from norm squared of resulting state
    const probability = resultState.amplitudes.reduce((sum, amp) => 
        sum + math.abs(amp) ** 2, 0
    );
    
    // Normalize the post-measurement state
    const normalizedAmplitudes = resultState.amplitudes.map(amp => 
        math.divide(amp, math.sqrt(probability)) as Complex
    );
    
    const postState: StateVector = {
        dimension: state.dimension,
        amplitudes: normalizedAmplitudes,
        basis: state.basis
    };
    
    return {
        value: eigenvalue,
        probability,
        state: postState
    };
}

/**
 * Create a measurement operator for a given observable and eigenvalue
 */
export function createMeasurementOperator(
    observable: Operator, 
    eigenvalue: number
): Operator {
    // This would involve eigendecomposition of the observable
    // For now, we'll just implement projection measurements
    throw new Error('General measurement operators not yet implemented');
}
