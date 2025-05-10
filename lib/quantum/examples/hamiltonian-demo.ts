/**
 * Examples of using the Hamiltonian class for quantum simulations
 */

import { Hamiltonian } from '../hamiltonian';
import { StateVector } from '../stateVector';
import { PauliX, PauliY, PauliZ } from '../gates';
import { MatrixOperator } from '../operator';
import { composeOperators } from '../composition';
import * as math from 'mathjs';

/**
 * Example 1: Single Spin in a Magnetic Field
 * Shows basic Hamiltonian construction and time evolution
 */
function singleSpinExample() {
  console.log('Example 1: Single Spin in a Magnetic Field');
  console.log('----------------------------------------');

  // Create a magnetic field pointing in the z direction
  const B: [number, number, number] = [0, 0, 1];
  const H = Hamiltonian.createSpinHamiltonian(B);

  // Create initial state |+⟩ = (|0⟩ + |1⟩)/√2
  const initialState = new StateVector(2, [
    math.complex({re: 1/Math.sqrt(2), im:  0}),
    math.complex({re: 1/Math.sqrt(2), im:  0})
  ]);

  // Evolution times
  const times = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI];

  console.log('Initial state:', initialState.toString());
  const energy = H.expectationValue(initialState);
  console.log('Energy expectation value:', energy.re.toFixed(3));
  console.log('\nTime evolution:');

  for (const t of times) {
    const evolved = H.evolveState(initialState, t);
    const energy = H.expectationValue(evolved);
    console.log(`t = ${(t/Math.PI).toFixed(3)}π:`);
    console.log('State:', evolved.toString());
    console.log('Energy:', energy.re.toFixed(3));
    console.log();
  }
}

/**
 * Example 2: Heisenberg Spin Chain
 * Shows how to work with multi-spin systems
 */
function heisenbergChainExample() {
  console.log('Example 2: Heisenberg Spin Chain');
  console.log('------------------------------');

  // Create Heisenberg Hamiltonian for 3 spins with J = 1
  const H = Hamiltonian.createHeisenbergHamiltonian(3, 1);

  // Create initial Néel state |↑↓↑⟩
  const initialState = StateVector.computationalBasis(8, 0b101);

  console.log('Initial state: |↑↓↑⟩');
  const initialEnergy = H.expectationValue(initialState);
  console.log('Energy:', initialEnergy.re.toFixed(3));

  // Evolve for different times
  const times = [0.1, 0.5, 1.0, 2.0];
  
  console.log('\nTime evolution:');
  for (const t of times) {
    const evolved = H.evolveState(initialState, t);
    
    // Compute magnetization for each site
    const magnetization = computeMagnetization(evolved, 3);
    const energy = H.expectationValue(evolved);
    
    console.log(`\nt = ${t.toFixed(2)}:`);
    console.log('Magnetization per site:', magnetization.map(m => m.toFixed(3)));
    console.log('Total energy:', energy.re.toFixed(3));
  }
}

/**
 * Helper function to compute magnetization (⟨σz⟩) for each site
 */
function computeMagnetization(state: StateVector, numSites: number): number[] {
  const magnetization: number[] = [];
  
  for (let site = 0; site < numSites; site++) {
    // Create σz operator for this site
    const ops = Array(numSites).fill(null).map(() => 
      MatrixOperator.identity(2)
    );
    ops[site] = PauliZ;
    
    const sz = composeOperators(ops);
    
    // Compute expectation value
    const mz = sz.apply(state).innerProduct(state);
    magnetization.push(mz.re);
  }
  
  return magnetization;
}

// Run the examples
console.log('Running Hamiltonian Examples\n');
  
singleSpinExample();
console.log('\n' + '='.repeat(50) + '\n');
heisenbergChainExample();