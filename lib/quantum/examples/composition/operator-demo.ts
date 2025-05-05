import { Operator } from '../../operator';
import { HilbertSpace } from '../../hilbertSpace';

// Demonstrates basic quantum operator operations
function demoOperators() {
    // Create a simple qubit space
    const qubitSpace = new HilbertSpace(2, ['|0⟩', '|1⟩']);
    
    // Create Pauli X operator (bit flip)
    const X = Operator.pauliX(qubitSpace);
    console.log('Pauli X matrix:');
    console.log(X.toMatrix());
    
    // Create and apply adjoint
    const Xadj = X.adjoint();
    console.log('\nX adjoint equals X:');
    console.log(Xadj.toMatrix());
    
    // Compose X with itself (should give identity)
    const X2 = X.compose(X);
    console.log('\nX composed with X (identity):');
    console.log(X2.toMatrix());
}

// Run the demonstration
console.log('=== Quantum Operator Demo ===\n');
demoOperators();