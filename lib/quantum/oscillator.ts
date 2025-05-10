/**
 * Creation and annihilation operators for quantum harmonic oscillators
 */

import { Complex, Operator } from './types';
import { MatrixOperator } from './operator';
import * as math from 'mathjs';

/**
 * Creates creation operator a† for dimension N
 * Matrix elements: ⟨n|a†|m⟩ = √(m+1)δ(n,m+1)
 */
export function creationOp(dimension: number): Operator {
    const matrix = Array(dimension).fill(null)
        .map(() => Array(dimension).fill(null)
            .map(() => math.complex({re: 0, im:  0})));
            
    // Fill matrix elements
    for (let m = 0; m < dimension - 1; m++) {
        matrix[m + 1][m] = math.complex({re: Math.sqrt(m + 1), im:  0});
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
            .map(() => math.complex({re: 0, im:  0})));
            
    // Fill matrix elements
    for (let m = 1; m < dimension; m++) {
        matrix[m - 1][m] = math.complex({re: Math.sqrt(m), im:  0});
    }
    
    return new MatrixOperator(matrix);
}

/**
 * Creates number operator n = a†a for dimension N
 */
export function numberOp(dimension: number): Operator {
    // Create diagonal matrix for number operator
    const matrix = Array(dimension).fill(null)
        .map((_, i) => Array(dimension).fill(null)
            .map((_, j) => i === j ? math.complex({re: i, im:  0}) : math.complex({re: 0, im:  0})));
            
    // Explicitly mark as hermitian since it's diagonal with real entries
    return new MatrixOperator(matrix, 'hermitian');
}

/**
 * Creates position operator x = (a + a†)/√2 for dimension N
 */
export function positionOp(dimension: number): Operator {
    const aOp = destructionOp(dimension);
    const aUpOp = creationOp(dimension);
    
    // Scale operator after addition to maintain hermiticity
    const sumOp = aOp.add(aUpOp);
    const finalOp = sumOp.scale(math.complex({re: 1/Math.sqrt(2), im:  0}));
    
    return new MatrixOperator(finalOp.toMatrix(), 'hermitian');
}

/**
 * Creates momentum operator p = i(a† - a)/√2 for dimension N
 */
export function momentumOp(dimension: number): Operator {
    const aOp = destructionOp(dimension);
    const aUpOp = creationOp(dimension);
    
    // i(a† - a)/√2 
    const diffOp = aUpOp.add(aOp.scale(math.complex({re: -1, im:  0})));
    const finalOp = diffOp.scale(math.complex({re: 0, im:  1/Math.sqrt(2)}));
    
    return new MatrixOperator(finalOp.toMatrix(), 'hermitian');
}

/**
 * Creates harmonic oscillator Hamiltonian H = ℏω(a†a + 1/2)
 * For simplicity, we set ℏω = 1
 */
export function harmonicOscillator(dimension: number): Operator {
    const n = numberOp(dimension);
    const halfId = MatrixOperator.identity(dimension).scale(math.complex({re: 0.5, im:  0}));
    const hamiltonian = n.add(halfId);
    
    return new MatrixOperator(hamiltonian.toMatrix(), 'hermitian');
}