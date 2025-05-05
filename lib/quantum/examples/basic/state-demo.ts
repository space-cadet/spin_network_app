import { HilbertSpace } from '../../hilbertSpace';
import { StateVector, Complex } from '../../types';
import { createComplex } from '../../complex';
import { Hadamard } from '../../gates';

// Demonstrates quantum state operations
function demoStates() {
    // Create a simple qubit space
    const qubitSpace = new HilbertSpace(2, ['|0⟩', '|1⟩']);
    
    // Initialize states
    const state0: StateVector = {
        dimension: 2,
        amplitudes: [
            createComplex(1, 0),
            createComplex(0, 0)
        ]
    };
    
    const state1: StateVector = {
        dimension: 2,
        amplitudes: [
            createComplex(0, 0),
            createComplex(1, 0)
        ]
    };
    
    console.log('State |0⟩ amplitudes:', state0.amplitudes);
    console.log('State |1⟩ amplitudes:', state1.amplitudes);
    
    // Create superposition using Hadamard gate
    const superposition = Hadamard.apply(state0);
    console.log('\nSuperposition state amplitudes:', superposition.amplitudes);
    
    // Calculate inner product between |0⟩ and |+⟩
    const overlap = stateInnerProduct(state0, superposition);
    console.log('\nOverlap ⟨0|+⟩:', overlap);
}

// Helper function to calculate inner product
function stateInnerProduct(stateA: StateVector, stateB: StateVector): Complex {
    if (stateA.dimension !== stateB.dimension) {
        throw new Error('State vector dimensions must match');
    }

    let result = createComplex(0, 0);
    for (let i = 0; i < stateA.dimension; i++) {
        // Conjugate first state's amplitude
        const conj = {
            re: stateA.amplitudes[i].re,
            im: -stateA.amplitudes[i].im
        };
        const prod = {
            re: conj.re * stateB.amplitudes[i].re - conj.im * stateB.amplitudes[i].im,
            im: conj.re * stateB.amplitudes[i].im + conj.im * stateB.amplitudes[i].re
        };
        result = {
            re: result.re + prod.re,
            im: result.im + prod.im
        };
    }
    return result;
}

// Run the demonstration
console.log('=== Quantum State Demo ===\n');
demoStates();