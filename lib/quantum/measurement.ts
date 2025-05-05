/**
 * Measurement operations for quantum states
 */

import { Complex, Operator, StateVector, MeasurementOutcome } from './types';
import { MatrixOperator } from './operator';

/**
 * Implementation of a projection operator for quantum measurements
 */
export class ProjectionOperator implements Operator {
    private _operator: MatrixOperator;
    private _dimension: number;

    constructor(state: StateVector) {
        this._dimension = state.dimension;
        
        // Create projection matrix |ψ⟩⟨ψ|
        const matrix: Complex[][] = Array(state.dimension).fill(0)
            .map(() => Array(state.dimension).fill({ re: 0, im: 0 }));
        
        for (let i = 0; i < state.dimension; i++) {
            for (let j = 0; j < state.dimension; j++) {
                // |ψ⟩⟨ψ| = ψi * ψj*
                matrix[i][j] = {
                    re: state.amplitudes[i].re * state.amplitudes[j].re + 
                        state.amplitudes[i].im * state.amplitudes[j].im,
                    im: state.amplitudes[i].re * state.amplitudes[j].im - 
                        state.amplitudes[i].im * state.amplitudes[j].re
                };
            }
        }
        
        this._operator = new MatrixOperator(matrix, 'projection');
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
        return this._operator.compose(other);
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
    let result: Complex = { re: 0, im: 0 };

    for (let i = 0; i < state.dimension; i++) {
        // ⟨ψ|A|ψ⟩ = Σ ψi* (A|ψ⟩)i
        const conj: Complex = { 
            re: state.amplitudes[i].re, 
            im: -state.amplitudes[i].im 
        };
        result = {
            re: result.re + (conj.re * resultState.amplitudes[i].re - 
                           conj.im * resultState.amplitudes[i].im),
            im: result.im + (conj.re * resultState.amplitudes[i].im + 
                           conj.im * resultState.amplitudes[i].re)
        };
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
    let probability = 0;
    for (const amp of resultState.amplitudes) {
        probability += amp.re * amp.re + amp.im * amp.im;
    }
    
    // Normalize the post-measurement state
    const normalizedAmplitudes = resultState.amplitudes.map(amp => ({
        re: amp.re / Math.sqrt(probability),
        im: amp.im / Math.sqrt(probability)
    }));
    
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
