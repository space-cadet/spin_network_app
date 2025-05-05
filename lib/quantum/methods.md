# Method Changes for Quantum Library Refactoring

## File Structure Changes
```
lib/quantum/
├── types.ts               // Core type definitions 
├── complex.ts            // Complex number operations
├── hilbertSpace.ts      // Hilbert space abstraction
├── stateVector.ts       // Core state vector operations
├── states.ts           // All quantum state implementations
├── operator.ts         // Operator implementations
├── densityMatrix.ts    // Density matrix & quantum channels
├── measurement.ts     // Measurement operations
├── gates.ts          // Quantum gates
└── index.ts         // Main exports
```

## Method Changes by File

### 1. hilbertSpace.ts (Unchanged Name)

Methods to be removed:
```typescript
// Move to states.ts
computationalBasisState(i: number): StateVector
computationalBasis(): StateVector[]
superposition(coefficients: Complex[]): StateVector
equalSuperposition(): StateVector
```

Methods to keep:
```typescript
class HilbertSpace {
    constructor(dimension: number, basis?: string[])
    compose(other: HilbertSpace): HilbertSpace
    decompose(dims: number[]): HilbertSpace[]
    tensorProduct(other: HilbertSpace): HilbertSpace 
    partialTrace(subsystemDims: number[]): HilbertSpace
    containsState(state: StateVector): boolean
    toString(): string
}
```

### 2. stateVector.ts

Core state vector operations:
```typescript
export class StateVector implements IStateVector {
    constructor(dimension: number, amplitudes?: Complex[], basis?: string)
    setState(index: number, value: Complex): void
    getState(index: number): Complex
    innerProduct(other: StateVector): Complex
    norm(): number
    normalize(): StateVector
    tensorProduct(other: StateVector): StateVector
    isZero(tolerance?: number): boolean
    toArray(): Complex[]
    toString(): string
}
```

### 3. states.ts

Consolidated state creation functions:
```typescript
// Base state operations
export function createState(dimension: number): StateVector
export function setState(state: StateVector, index: number, value: Complex): void
export function getState(state: StateVector, index: number): Complex

// Computational basis states
export function computationalBasis(numQubits: number): StateVector[]
export function createBasisState(dimension: number, index: number): StateVector

// Bell states
export function createBellState(type: 'Phi+' | 'Phi-' | 'Psi+' | 'Psi-'): StateVector

// GHZ and W states
export function createGHZState(numQubits: number): StateVector
export function createWState(numQubits: number): StateVector

// Plus/Minus states
export function createPlusState(): StateVector
export function createMinusState(): StateVector
```

### 4. operator.ts (Updated)

```typescript
export class MatrixOperator implements Operator {
    constructor(matrix: Complex[][], type: OperatorType = 'general')
    apply(state: StateVector): StateVector
    compose(other: Operator): Operator
    adjoint(): Operator
    tensorProduct(other: Operator): Operator
    partialTrace(dims: number[], traceOutIndices: number[]): Operator
    toMatrix(): Complex[][]
    // New consolidated utility methods
    static identity(dimension: number): MatrixOperator
    static zero(dimension: number): MatrixOperator
    static validateMatrixDimensions(matrix: Complex[][]): void
}
```

### 5. densityMatrix.ts (New Organization)

```typescript
export class DensityMatrixOperator implements DensityMatrix {
    constructor(matrix: Complex[][])
    apply(state: StateVector): StateVector
    compose(other: Operator): Operator
    adjoint(): Operator  // Returns self (Hermitian)
    toMatrix(): Complex[][]
    trace(): Complex
    partialTrace(subsystemDimensions: number[]): DensityMatrix
    purity(): number
    vonNeumannEntropy(): number
    
    static fromPureState(state: StateVector): DensityMatrix
    static mixedState(states: StateVector[], probabilities: number[]): DensityMatrix
}

export class KrausChannel implements QuantumChannel {
    constructor(krausOperators: Operator[])
    apply(state: DensityMatrix): DensityMatrix
}

// Quantum Channels
export function createDepolarizingChannel(dimension: number, p: number): QuantumChannel
export function createAmplitudeDampingChannel(gamma: number): QuantumChannel
export function createPhaseDampingChannel(gamma: number): QuantumChannel
export function createBitFlipChannel(p: number): QuantumChannel
export function createPhaseFlipChannel(p: number): QuantumChannel

// Entanglement Measures
export function traceFidelity(rho: DensityMatrix, sigma: DensityMatrix): number
export function concurrence(rho: DensityMatrix): number
export function negativity(rho: DensityMatrix, subsystemDimensions: number[]): number
```

### 6. utils/validation.ts (Consolidated)

```typescript
export function validateMatrixDimensions(matrix: Complex[][]): void
export function validatePositiveDimension(dimension: number): void
export function validateIndex(index: number, dimension: number): void
export function validateAmplitudes(amplitudes: Complex[], dimension: number): void
export function validateNormalization(amplitudes: Complex[], tolerance?: number): void
export function validateMatchingDimensions(dim1: number, dim2: number): void
```

### 7. utils/math.ts

```typescript
export function matrixExponential(matrix: Complex[][], terms?: number): Complex[][]
export function multiplyMatrices(a: Complex[][], b: Complex[][]): Complex[][]
export function partialTrace(matrix: Complex[][], dims: number[], traceOutIndices: number[]): Complex[][]
export function singularValueDecomposition(matrix: Complex[][]): {U: Complex[][], S: number[], V: Complex[][]}
```

### 8. measurement.ts (New File)

```typescript
export function expectationValue(state: StateVector, operator: Complex[][]): Complex
export function measureState(state: StateVector, observable: Operator): MeasurementOutcome
export class ProjectionOperator implements Operator {
    constructor(basisState: StateVector)
    apply(state: StateVector): StateVector
    compose(other: Operator): Operator
    adjoint(): Operator
    toMatrix(): Complex[][]
}
```

### 9. index.ts (Updated Exports)

New exports structure:
```typescript
// Core types and operations
export * from './types';
export * from './complex';
export * from './hilbertSpace';
export * from './stateVector';
export * from './states';
export * from './densityMatrix';
export * from './measurement';

// Operators and gates
export * from './operator';
export * from './gates';
```