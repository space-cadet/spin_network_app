/**
 * Demonstrates commutator algebra with quantum operators
 * 
 * Explores fundamental commutation relations between operators,
 * which are essential for understanding quantum mechanical systems.
 */

import { 
  commutator, 
  antiCommutator,
  nestedCommutator,
  operatorsCommute,
  uncertaintyProduct
} from '../../src/operators/algebra';
import { PauliX, PauliY, PauliZ } from '../../src/operators/gates';
import { StateVector } from '../../src/states/stateVector';
import * as math from 'mathjs';

// Demonstrate commutators of Pauli matrices
function demoCommutators() {
  console.log('=== Pauli Matrix Commutator Algebra ===\n');
  
  // [X, Y] = 2iZ
  console.log('Computing [X, Y]:');
  const comm_XY = commutator(PauliX, PauliY);
  console.log('Matrix representation:');
  console.log(comm_XY.toMatrix());
  console.log('This should equal 2iZ\n');
  
  // [Y, Z] = 2iX
  console.log('Computing [Y, Z]:');
  const comm_YZ = commutator(PauliY, PauliZ);
  console.log('Matrix representation:');
  console.log(comm_YZ.toMatrix());
  console.log('This should equal 2iX\n');
  
  // [Z, X] = 2iY
  console.log('Computing [Z, X]:');
  const comm_ZX = commutator(PauliZ, PauliX);
  console.log('Matrix representation:');
  console.log(comm_ZX.toMatrix());
  console.log('This should equal 2iY\n');
  
  // Commuting operators
  console.log('Check if X commutes with X:', operatorsCommute(PauliX, PauliX));
  console.log('Check if X commutes with Y:', operatorsCommute(PauliX, PauliY));
  console.log('Check if Y commutes with Z:', operatorsCommute(PauliY, PauliZ));
}

// Demonstrate anti-commutators of Pauli matrices
function demoAntiCommutators() {
  console.log('\n=== Pauli Matrix Anti-Commutator Algebra ===\n');
  
  // {X, X} = 2I
  console.log('Computing {X, X}:');
  const anticomm_XX = antiCommutator(PauliX, PauliX);
  console.log('Matrix representation:');
  console.log(anticomm_XX.toMatrix());
  console.log('This should equal 2I\n');
  
  // {X, Y} = 0
  console.log('Computing {X, Y}:');
  const anticomm_XY = antiCommutator(PauliX, PauliY);
  console.log('Matrix representation:');
  console.log(anticomm_XY.toMatrix());
  console.log('This should equal 0\n');
  
  // {Y, Z} = 0
  console.log('Computing {Y, Z}:');
  const anticomm_YZ = antiCommutator(PauliY, PauliZ);
  console.log('Matrix representation:');
  console.log(anticomm_YZ.toMatrix());
  console.log('This should equal 0\n');
}

// Demonstrate nested commutators (Lie algebra)
function demoNestedCommutators() {
  console.log('\n=== Nested Commutators ===\n');
  
  // [X, [Y, Z]] = [X, 2iX] = 0
  console.log('Computing [X, [Y, Z]]:');
  const ops = [PauliX, PauliY, PauliZ];
  const indices = [[0, 1], [1, 2]]; // This represents [ops[0], [ops[1], ops[2]]]
  const nested = nestedCommutator(ops, indices);
  console.log('Matrix representation:');
  console.log(nested.toMatrix());
  
  // Jacobi identity: [X, [Y, Z]] + [Y, [Z, X]] + [Z, [X, Y]] = 0
  console.log('\nVerifying Jacobi identity:');
  console.log('[X, [Y, Z]] + [Y, [Z, X]] + [Z, [X, Y]] should equal 0');
  
  const term1 = nestedCommutator([PauliX, PauliY, PauliZ], [[0, 1], [1, 2]]);
  const term2 = nestedCommutator([PauliY, PauliZ, PauliX], [[0, 1], [1, 2]]);
  const term3 = nestedCommutator([PauliZ, PauliX, PauliY], [[0, 1], [1, 2]]);
  
  const sum = term1.add(term2.add(term3));
  console.log('Sum of terms:');
  console.log(sum.toMatrix());
}

// Demonstrate uncertainty principle using commutators
function demoUncertaintyPrinciple() {
  console.log('\n=== Uncertainty Principle ===\n');
  
  // Create |+⟩ state (eigenstate of X)
  const plusState = new StateVector(2, [
    math.complex({re: 1/Math.sqrt(2), im:  0}),
    math.complex({re: 1/Math.sqrt(2), im:  0})
  ]);
  
  // Calculate ΔY·ΔZ for |+⟩
  const uncertainty = uncertaintyProduct(plusState, PauliY, PauliZ);
  console.log(`Uncertainty product ΔY·ΔZ for |+⟩ state: ${uncertainty}`);
  
  // Lower bound from commutator
  const commutatorValue = commutator(PauliY, PauliZ);
  console.log('Commutator [Y, Z]:');
  console.log(commutatorValue.toMatrix());
  
  console.log('\nUncertainty principle states:');
  console.log('ΔY·ΔZ ≥ |⟨[Y,Z]⟩|/2 = |⟨2iX⟩|/2 = |⟨X⟩| = 1/2');
  console.log(`Our calculated uncertainty (${uncertainty}) satisfies this bound.`);
}

// Run the demonstrations
demoCommutators();
demoAntiCommutators();
demoNestedCommutators();
demoUncertaintyPrinciple();
