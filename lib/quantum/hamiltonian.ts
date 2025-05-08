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
        const termMatrix = term.operator.toMatrix();
        if (!isHermitian(termMatrix)) {
          throw new Error('All terms must be Hermitian when requireHermitian is true');
        }
        if (Math.abs(term.coefficient.im) > 1e-10) {
          throw new Error('All coefficients must be real when requireHermitian is true');
        }
      }

      // Also check the final matrix
      const matrix = terms.reduce((acc, term) => {
        const termMatrix = term.operator.toMatrix();
        const scaledTerm = scaleMatrix(termMatrix, term.coefficient);
        return acc.map((row, i) => 
          row.map((elem, j) => math.add(elem, scaledTerm[i][j]) as Complex)
        );
      }, Array(dimension).fill(null).map(() => 
        Array(dimension).fill(null).map(() => math.complex(0, 0))
      ));

      if (!isHermitian(matrix)) {
        throw new Error('Combined Hamiltonian must be Hermitian when requireHermitian is true');
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
      Array(dimension).fill(null).map(() => math.complex(0, 0))
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
    const scaledMatrix = scaleMatrix(
      this.toMatrix(),
      math.complex(0, -time)  // -i * t (ħ = 1 units)
    );
    
    // Compute matrix exponential
    const evolutionMatrix = matrixExponential(scaledMatrix);

    // Ensure the result is unitary (U†U = 1)
    // The result should be unitary by construction, but numerical errors can accumulate
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
    return U.apply(state) as StateVector;
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
        coefficient: math.complex(Bx, 0),
        operator: PauliX
      },
      {
        coefficient: math.complex(By, 0),
        operator: PauliY
      },
      {
        coefficient: math.complex(Bz, 0),
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
    const coeff = math.complex(coupling, 0);

    // For each pair of neighboring spins
    for (let i = 0; i < numSpins - 1; i++) {
      // Create terms for σx⊗σx + σy⊗σy + σz⊗σz
      const operators = [PauliX, PauliY, PauliZ].map(pauli => {
        // Create array of operators for tensor product
        const ops = Array(numSpins).fill(MatrixOperator.identity(2));
        ops[i] = pauli;
        ops[i + 1] = pauli;
        return composeOperators(ops);
      });

      // Add each component to terms
      operators.forEach(op => {
        terms.push({
          coefficient: coeff,
          operator: op
        });
      });
    }

    return new Hamiltonian(Math.pow(2, numSpins), terms, 'interaction');
  }
}