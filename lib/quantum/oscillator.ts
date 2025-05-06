/**
 * Creation and annihilation operators for quantum harmonic oscillators
 */

import { Complex, Operator } from './types';
import { MatrixOperator } from './operator';
import { createComplex } from './complex';

/**
 * Creates creation operator a† for dimension N
 * Matrix elements: ⟨n|a†|m⟩ = √(m+1)δ(n,m+1)
 */
export function creationOp(dimension: number): Operator {
    const matrix = Array(dimension).fill(null)
        .map(() => Array(dimension).fill(null)
            .map(() => createComplex(0, 0)));
            
    // Fill matrix elements
    for (let m = 0; m < dimension - 1; m++) {
        matrix[m + 1][m] = createComplex(Math.sqrt(m + 1), 0);
    }
    
    return new MatrixOperator(matrix);
}

/**
 * Creates annihilation operator a for dimension N
 * Matrix elements: ⟨n|a|m⟩ = √m δ(n,m-1)
 */
export function destructionOp(dimension: number): Operator {
    const matrix = Array(dimension).fill(null)
        .map(() => Array(dimension).fill(null)
            .map(() => createComplex(0, 0)));
            
    // Fill matrix elements
    for (let m = 1; m < dimension; m++) {
        matrix[m - 1][m] = createComplex(Math.sqrt(m), 0);
    }
    
    return new MatrixOperator(matrix);
}

/**
 * Creates number operator n = a†a for dimension N
 */
export function numberOp(dimension: number): Operator {
    const matrix = Array(dimension).fill(null)
        .map(() => Array(dimension).fill(null)
            .map(() => createComplex(0, 0)));
            
    // Fill diagonal elements
    for (let n = 0; n < dimension; n++) {
        matrix[n][n] = createComplex(n, 0);
    }
    
    return new MatrixOperator(matrix, 'hermitian');
}

/**
 * Creates position operator x = (a + a†)/√2 for dimension N
 */
export function positionOp(dimension: number): Operator {
    const aOp = destructionOp(dimension);
    const aUpOp = creationOp(dimension);
    const scale = createComplex(1/Math.sqrt(2), 0);
    
    return aOp.add(aUpOp).scale(scale);
}

/**
 * Creates momentum operator p = i(a† - a)/√2 for dimension N
 */
export function momentumOp(dimension: number): Operator {
    const aOp = destructionOp(dimension);
    const aUpOp = creationOp(dimension);
    const scale = createComplex(0, 1/Math.sqrt(2));
    
    return aUpOp.scale(scale).add(aOp.scale(createComplex(0, -1/Math.sqrt(2))));
}

/**
 * Creates harmonic oscillator Hamiltonian H = ℏω(a†a + 1/2)
 * For simplicity, we set ℏω = 1
 */
export function harmonicOscillator(dimension: number): Operator {
    const n = numberOp(dimension);
    return n.add(MatrixOperator.identity(dimension).scale(createComplex(0.5, 0)));
}