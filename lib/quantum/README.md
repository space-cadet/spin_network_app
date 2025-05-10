# Quantum Module

A TypeScript library for quantum mechanical calculations and spin network simulations.

## Features

- Quantum state vector operations
- Standard quantum gates (Pauli, Hadamard, CNOT)
- Density matrix operations
- Quantum measurements
- Hilbert space operations
- Hamiltonian evolution
- Quantum information tools

## Core Components

### State Vectors
```typescript
import { StateVector } from './quantum';

// Create a 2-dimensional quantum state
const state = new StateVector(2);

// Create standard basis states
const zeroState = StateVector.computationalBasis(2, 0); // |0⟩
const oneState = StateVector.computationalBasis(2, 1);  // |1⟩
```

### Quantum Gates
```typescript
import { PauliX, Hadamard } from './quantum';

// Apply X gate (NOT gate)
const flippedState = PauliX.apply(zeroState);

// Create superposition with Hadamard
const superposition = Hadamard.apply(zeroState);
```

### Measurements
```typescript
import { measure } from './quantum';

// Measure a state in computational basis
const outcome = measure(state);
console.log(`Measured: ${outcome.value} with probability ${outcome.probability}`);
```

## Installation

```bash
npm install @spin-network/quantum
```

## Requirements

- Node.js >= 14.0.0
- TypeScript >= 4.5.0
- mathjs >= 10.0.0

## Basic Usage

```typescript
import { 
  StateVector,
  PauliX,
  Hadamard,
  measure
} from '@spin-network/quantum';

// Create a qubit in |0⟩ state
const qubit = StateVector.computationalBasis(2, 0);

// Apply Hadamard gate to create superposition
const superposition = Hadamard.apply(qubit);

// Measure the state
const result = measure(superposition);
```

## API Documentation

The quantum module consists of several key components:

### StateVector
Core class for quantum state manipulation:
- `StateVector(dimension: number)`
- `setState(index: number, value: Complex)`
- `getState(index: number): Complex`
- `innerProduct(other: StateVector): Complex`
- `normalize(): StateVector`

### Quantum Gates
Standard quantum gates:
- `PauliX` - NOT gate
- `PauliY` - Y rotation
- `PauliZ` - Phase flip
- `Hadamard` - Creates superposition
- `CNOT` - Controlled-NOT gate

### Measurement
Quantum measurement operations:
- `measure(state: StateVector)`
- `projectiveMeasurement(state: StateVector, operator: Operator)`

### DensityMatrix
Mixed state operations:
- `DensityMatrix(dimension: number)`
- `trace(): Complex`
- `purity(): number`
- `vonNeumannEntropy(): number`

## Examples

See the `/examples` directory for more detailed usage examples.

## Contributing

Please see CONTRIBUTING.md for guidelines.

## License

MIT License