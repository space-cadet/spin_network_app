/**
 * Hamiltonian implementation for quantum systems
 * Represents energy operators and generates time evolution
 */

import { Complex, Operator, OperatorType } from './types';
import { StateVector } from './stateVector';
import { MatrixOperator } from './operator';
import { createComplex, multiplyComplex, addComplex } from './complex';
import { validatePosDim } from './utils/validation';
import { matrixExponential, scaleMatrix } from './matrixOperations';
import { PauliX, PauliY, PauliZ } from './gates';
import { composeOperators } from './composition';

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
    timeDependent: boolean = false
  ) {
    // Validate and initialize base operator
    validatePosDim(dimension);
    
    // Initialize operator with sum of terms
    const matrix = terms.reduce((acc, term) => {
      const termMatrix = term.operator.toMatrix();
      const scaledTerm = scaleMatrix(termMatrix, term.coefficient);
      return acc.map((row, i) => 
        row.map((elem, j) => addComplex(elem, scaledTerm[i][j]))
      );
    }, Array(dimension).fill(null).map(() => 
      Array(dimension).fill(null).map(() => createComplex(0, 0))
    ));
    
    super(matrix, 'hermitian');

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

    // Create -iHt matrix
    const scaledMatrix = scaleMatrix(
      this.toMatrix(),
      createComplex(0, -time)  // -i * t (ħ = 1 units)
    );
    
    // Compute matrix exponential
    const evolutionMatrix = matrixExponential(scaledMatrix);
    return new MatrixOperator(evolutionMatrix, 'unitary');
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
        coefficient: createComplex(Bx, 0),
        operator: PauliX
      },
      {
        coefficient: createComplex(By, 0),
        operator: PauliY
      },
      {
        coefficient: createComplex(Bz, 0),
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
    const coeff = createComplex(coupling, 0);

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