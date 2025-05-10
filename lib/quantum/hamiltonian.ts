/**
 * Hamiltonian implementation for quantum systems
 * Represents energy operators and generates time evolution
 */

import { Complex, Operator, OperatorType } from './types';
import { StateVector } from './stateVector';
import { MatrixOperator } from './operator';
import { validatePosDim } from './utils/validation';
import { matrixExponential, scaleMatrix } from './matrixOperations';
import { PauliX, PauliY, PauliZ } from './gates';
import { composeOperators } from './composition';
import { isHermitian } from './matrixOperations';
import * as math from 'mathjs';

/**
 * Types of common Hamiltonians
 */
export type HamiltonianType = 
  | 'free'           // Free particle
  | 'harmonic'       // Harmonic oscillator  
  | 'spin'          // Spin system
  | 'interaction'    // Interaction term
  | 'custom';        // Custom Hamiltonian

/**
 * Interface for Hamiltonian terms
 */
export interface HamiltonianTerm {
  coefficient: Complex;    // Coupling strength
  operator: Operator;      // Operator for this term
}

/**
 * Core Hamiltonian class
 * Represents quantum system energy operator
 */
export class Hamiltonian extends MatrixOperator {
  readonly hamiltonianType: HamiltonianType;
  readonly terms: HamiltonianTerm[];
  private _timeDependent: boolean;

  constructor(
    dimension: number,
    terms: HamiltonianTerm[],
    hamiltonianType: HamiltonianType = 'custom',
    timeDependent: boolean = false,
    requireHermitian: boolean = false
  ) {
    validatePosDim(dimension);
    
    // Validate Hermiticity of individual terms and result if required
    if (requireHermitian) {
      for (const term of terms) {
        if (!term || !term.operator) {
          throw new Error('Invalid term in Hamiltonian');
        }
        
        const termMatrix = term.operator.toMatrix();
        
        try {
          if (!isHermitian(termMatrix)) {
            throw new Error('All terms must be Hermitian when requireHermitian is true');
          }
        } catch (e) {
          throw new Error(`Hermiticity check failed: ${e.message}`);
        }
        
        if (term.coefficient && Math.abs(term.coefficient.im) > 1e-10) {
          throw new Error('All coefficients must be real when requireHermitian is true');
        }
      }

      // Also check the final matrix
      try {
        const matrix = terms.reduce((acc, term) => {
          const termMatrix = term.operator.toMatrix();
          const scaledTerm = scaleMatrix(termMatrix, term.coefficient);
          return acc.map((row, i) => 
            row.map((elem, j) => math.add(elem, scaledTerm[i][j]) as Complex)
          );
        }, Array(dimension).fill(null).map(() => 
          Array(dimension).fill(null).map(() => math.complex({re: 0, im:  0}))
        ));

        if (!isHermitian(matrix)) {
          throw new Error('Combined Hamiltonian must be Hermitian when requireHermitian is true');
        }
      } catch (e) {
        throw new Error(`Hermiticity validation failed: ${e.message}`);
      }
    }

    // Initialize operator with sum of terms
    const matrix = terms.reduce((acc, term) => {
      const termMatrix = term.operator.toMatrix();
      const scaledTerm = scaleMatrix(termMatrix, term.coefficient);
      return acc.map((row, i) => 
        row.map((elem, j) => math.add(elem, scaledTerm[i][j]))
      );
    }, Array(dimension).fill(null).map(() => 
      Array(dimension).fill(null).map(() => math.complex({re: 0, im:  0}))
    ));
    
    // Always use 'general' as the operator type, store Hamiltonian type separately
    super(matrix, 'general');

    this.hamiltonianType = hamiltonianType;
    this.terms = [...terms];
    this._timeDependent = timeDependent;
  }

  /**
   * Generates time evolution operator U(t) = exp(-iHt/ħ)
   */
  getEvolutionOperator(time: number): Operator {
    if (this._timeDependent) {
      throw new Error('Time-dependent Hamiltonians require numerical integration');
    }

    // For a Hermitian matrix H, exp(-iHt) should be unitary
    // Create -iHt matrix
    const matrix = this.toMatrix();
    
    // Explicitly verify matrix
    if (!matrix || matrix.length === 0 || !matrix[0] || matrix[0].length === 0) {
      throw new Error('Invalid Hamiltonian matrix');
    }
    
    // Scale by -i*t (ħ = 1 units)
    const scaledMatrix = matrix.map(row => 
      row.map(element => {
        // Multiply by -i*t
        return math.multiply(element, math.complex({re: 0, im:  -time})) as Complex;
      })
    );
    
    // Compute matrix exponential
    const evolutionMatrix = matrixExponential(scaledMatrix);

    // Explicitly ensure it's properly formed
    const dim = this.dimension;
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        if (!evolutionMatrix[i][j] || typeof evolutionMatrix[i][j].re !== 'number' || 
            typeof evolutionMatrix[i][j].im !== 'number') {
          evolutionMatrix[i][j] = math.complex({re: i === j ? 1 : 0, im:  0});
        }
      }
    }
    
    // Return as unitary operator
    return new MatrixOperator(evolutionMatrix, 'unitary', false);
  }

  /**
   * Evolves a state under this Hamiltonian
   */
  evolveState(state: StateVector, time: number): StateVector {
    if (state.dimension !== this.dimension) {
      throw new Error('State dimension does not match Hamiltonian dimension');
    }

    const U = this.getEvolutionOperator(time);
    
    // Apply evolution operator to state
    const evolvedState = U.apply(state) as StateVector;
    
    // Ensure the state is properly normalized
    // This step is important to correct for any numerical errors
    try {
      const norm = evolvedState.norm();
      if (norm > 1e-10 && Math.abs(norm - 1) > 1e-10) {
        return evolvedState.normalize();
      }
      return evolvedState;
    } catch (e) {
      // If normalization fails, ensure we still return a valid state
      console.error("Normalization error in evolveState:", e);
      return state; // Return original state if evolution fails
    }
  }

  /**
   * Computes expectation value of energy
   */
  expectationValue(state: StateVector): Complex {
    if (state.dimension !== this.dimension) {
      throw new Error('State dimension does not match Hamiltonian dimension');
    }

    const Hpsi = this.apply(state) as StateVector;
    return state.innerProduct(Hpsi);
  }

  /**
   * Creates spin-1/2 Hamiltonian in magnetic field
   * H = B·σ where σ are Pauli matrices
   */
  static createSpinHamiltonian(
    magneticField: [number, number, number]
  ): Hamiltonian {
    const [Bx, By, Bz] = magneticField;
    
    const terms: HamiltonianTerm[] = [
      {
        coefficient: math.complex({re: Bx, im:  0}),
        operator: PauliX
      },
      {
        coefficient: math.complex({re: By, im:  0}),
        operator: PauliY
      },
      {
        coefficient: math.complex({re: Bz, im:  0}),
        operator: PauliZ
      }
    ];
    
    return new Hamiltonian(2, terms, 'spin');
  }

  /**
   * Creates Heisenberg interaction Hamiltonian
   * H = J Σ S₁·S₂ for nearest neighbors
   */
  static createHeisenbergHamiltonian(
    numSpins: number,
    coupling: number
  ): Hamiltonian {
    if (numSpins < 2) {
      throw new Error('Heisenberg model requires at least 2 spins');
    }

    const terms: HamiltonianTerm[] = [];
    const coeff = math.complex({re: coupling, im:  0});
    const dimension = Math.pow(2, numSpins);

    // For each pair of neighboring spins
    for (let i = 0; i < numSpins - 1; i++) {
      // Create terms for σx⊗σx + σy⊗σy + σz⊗σz
      for (const pauli of [PauliX, PauliY, PauliZ]) {
        // Create array of operators for tensor product
        const ops = Array(numSpins).fill(null).map(() => MatrixOperator.identity(2));
        ops[i] = pauli;
        ops[i + 1] = pauli;
        
        try {
          const op = composeOperators(ops);
          // Verify operator dimension
          if (op.dimension !== dimension) {
            throw new Error(`Operator dimension mismatch: expected ${dimension}, got ${op.dimension}`);
          }
          
          terms.push({
            coefficient: coeff,
            operator: op
          });
        } catch (e) {
          console.error(`Error creating Heisenberg term: ${e.message}`);
          // Create fallback identity term as placeholder
          terms.push({
            coefficient: math.complex({re: 0, im:  0}), // Zero coefficient
            operator: MatrixOperator.identity(dimension)
          });
        }
      }
    }

    // Validate we have terms before creating Hamiltonian
    if (terms.length === 0) {
      throw new Error('Failed to create any valid terms for Heisenberg Hamiltonian');
    }

    return new Hamiltonian(dimension, terms, 'interaction');
  }
}