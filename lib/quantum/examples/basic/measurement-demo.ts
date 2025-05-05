import { HilbertSpace } from '../../hilbertSpace';
import { createStateVector } from '../../stateVectorOperations';
import { MatrixOperator } from '../../operator';
import { createComplex } from '../../complex';

// Demonstrates quantum measurement operations
function demoMeasurement() {
    // Create a qubit in superposition
    const qubitSpace = new HilbertSpace(2, ['|0⟩', '|1⟩']);
    
    // Create |+⟩ state
    const plusState = createStateVector(qubitSpace, [
        createComplex(1/Math.sqrt(2), 0),
        createComplex(1/Math.sqrt(2), 0)
    ]);
    
    console.log('Initial state |+⟩:', plusState.amplitudes);
    
    // Create measurement operator (Z basis)
    const zProjector0 = new MatrixOperator([
        [createComplex(1, 0), createComplex(0, 0)],
        [createComplex(0, 0), createComplex(0, 0)]
    ], 'projection');
    
    const zProjector1 = new MatrixOperator([
        [createComplex(0, 0), createComplex(0, 0)],
        [createComplex(0, 0), createComplex(1, 0)]
    ], 'projection');
    
    // Perform measurement
    const outcome0 = zProjector0.apply(plusState);
    const outcome1 = zProjector1.apply(plusState);
    
    console.log('\nProbability of |0⟩:', outcome0.amplitudes);
    console.log('Probability of |1⟩:', outcome1.amplitudes);
}

// Run the demonstration
console.log('=== Quantum Measurement Demo ===\n');
demoMeasurement();