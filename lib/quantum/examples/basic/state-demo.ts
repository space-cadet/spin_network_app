import { HilbertSpace } from '../../hilbertSpace';
import { createStateVector, initializeSpinState, innerProduct } from '../../stateVectorOperations';
import { MatrixOperator } from '../../operator';
import { createComplex } from '../../complex';

// Demonstrates quantum state operations
function demoStates() {
    // Create a simple qubit space
    const qubitSpace = new HilbertSpace(2, ['|0⟩', '|1⟩']);
    
    // Initialize states
    const state0 = createStateVector(qubitSpace, [
        createComplex(1, 0),
        createComplex(0, 0)
    ]);
    
    const state1 = createStateVector(qubitSpace, [
        createComplex(0, 0),
        createComplex(1, 0)
    ]);
    
    console.log('State |0⟩ amplitudes:', state0.amplitudes);
    console.log('State |1⟩ amplitudes:', state1.amplitudes);
    
    // Create superposition with Hadamard
    const hadamardMatrix = [
        [createComplex(1/Math.sqrt(2), 0), createComplex(1/Math.sqrt(2), 0)],
        [createComplex(1/Math.sqrt(2), 0), createComplex(-1/Math.sqrt(2), 0)]
    ];
    const H = new MatrixOperator(hadamardMatrix, 'unitary');
    
    const superposition = H.apply(state0);
    console.log('\nSuperposition state amplitudes:', superposition.amplitudes);
    
    // Calculate inner product
    const overlap = innerProduct(state0, superposition);
    console.log('\nOverlap ⟨0|+⟩:', overlap);
}

// Run the demonstration
console.log('=== Quantum State Demo ===\n');
demoStates();