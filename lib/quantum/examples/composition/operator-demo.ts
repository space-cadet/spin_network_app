import { HilbertSpace } from '../../hilbertSpace';
import { PauliX } from '../../gates';

// Demonstrates basic quantum operator operations
function demoOperators() {
    // Create a simple qubit space
    const qubitSpace = new HilbertSpace(2, ['|0⟩', '|1⟩']);
    
    // Show Pauli X (bit flip) operation
    console.log('Pauli X matrix:');
    console.log(PauliX.toMatrix());
    
    // Create and apply adjoint (X is self-adjoint)
    const Xadj = PauliX.adjoint();
    console.log('\nX adjoint equals X:');
    console.log(Xadj.toMatrix());
    
    // Compose X with itself (should give identity)
    const X2 = PauliX.compose(PauliX);
    console.log('\nX composed with X (identity):');
    console.log(X2.toMatrix());
}

// Run the demonstration
console.log('=== Quantum Operator Demo ===\n');
demoOperators();