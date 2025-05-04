# Minimal Quantum Library Extension Plan

## Overview

This plan outlines extensions to enhance the existing quantum features of the standalone library. The library currently implements core quantum mechanical features through two main modules:

1. **State Vector Operations**
   - Basic state vector structure with dimension and complex amplitudes
   - Support for arbitrary dimensional quantum states
   - Inner product and norm calculations
   - Operator application and expectation values
   - Spin-j operator generation

2. **Tensor Operations**
   - Sparse tensor implementation for arbitrary dimensions
   - Element access, modification, and normalization
   - Tensor contraction with arbitrary index pairs
   - 4-valent intertwiner tensor creation
   - Angular momentum coupling support

The proposed extensions will build upon these foundations to provide a more complete quantum simulation toolkit while maintaining the library's simplicity and efficiency.

## Phase 1: Core Quantum Foundations

### 1.1 Enhanced Complex Number Operations
**Priority: HIGH**
**Current Status**: Basic complex operations (addition, multiplication) exist but with limitations.

**Required Extensions**:
- Add `subtractComplex()` method - Currently missing
- Add `conjugateComplex()` method - Needed for proper quantum operations
- Add `modulusComplex()` method - Essential for norm calculations
- Add `isZeroComplex(tolerance)` - Replace current fixed 1e-10 tolerance checks

**Implementation:**
```typescript
// Add to core/tensor.ts
export function subtractComplex(a: Complex, b: Complex): Complex
export function conjugateComplex(c: Complex): Complex
export function modulusComplex(c: Complex): number
export function isZeroComplex(c: Complex, tolerance: number = 1e-10): boolean
```

### 1.2 Operator Base Class
**Priority: HIGH**
**Current Status**: Operator operations exist but are scattered across stateVectorOperations.ts without a unified interface.

**Required Extensions**:
- Create abstract `Operator` interface - Unify existing operator implementations
- Add operator application to quantum states - Currently implemented ad-hoc
- Add operator composition method - Missing in current implementation
- Add adjoint operation - Essential for quantum mechanics, currently missing

**Implementation:**
```typescript
// Create quantum/operator.ts
export interface Operator {
  dimension: number;
  apply(state: StateVector): StateVector;  // Unify existing implementations
  compose(other: Operator): Operator;     // New capability
  adjoint(): Operator;                    // New capability
  toMatrix(): Complex[][];                // Support existing code
}

export class MatrixOperator implements Operator {
  // Implementation for matrix-based operators
}
```

**Benefits**:
- Unified operator framework
- Better code organization
- Easier extension with new operators
- Proper mathematical structure

## Phase 2: Essential Quantum Operations

### 2.1 Basic Hamiltonian Class
**Priority: MEDIUM**
**Current Status**: No dedicated Hamiltonian implementation or time evolution support.

**Required Extensions**:
- Implement simple `Hamiltonian` class - New feature
- Add time evolution via matrix exponentiation - Currently missing
- Include basic built-in Hamiltonians - Will complement existing spin operators

**Implementation:**
```typescript
// Create quantum/hamiltonian.ts
export class Hamiltonian extends MatrixOperator {
  constructor(matrix: Complex[][]);
  
  // Method for time evolution
  evolve(state: StateVector, time: number): StateVector;
  
  // Static methods for common Hamiltonians
  static harmonicOscillator(frequency: number): Hamiltonian;
  static twoLevel(energy: number): Hamiltonian;
}
```

### 2.2 Matrix Exponentiation
**Priority: MEDIUM**
**Current Status**: No matrix exponential implementation, needed for time evolution.

**Required Extensions**:
- Implement basic matrix exponential - Essential for Hamiltonians
- Use Taylor series with cutoff - Maintain current numerical stability standards
- Add caching for repeated operations - Performance optimization

**Implementation:**
```typescript
// Add to quantum/matrixOperations.ts
export function matrixExponential(matrix: Complex[][], 
                                cutoff: number = 1e-8): Complex[][];
```

### 2.3 Measurement Operators
**Priority: MEDIUM**
**Current Status**: Basic expectation value calculations exist in both stateVectorOperations.ts and tensorOperations.ts, but no projection operators or measurement simulation.

**Current Features**:
- Expectation value calculation for state vectors
- Tensor-based expectation values
- Basic operator application

**Required Extensions**:
- Implement projection operators - Currently missing
- Add measurement simulation with collapse - New feature
- Unify expectation value calculations - Currently scattered

**Implementation:**
```typescript
// Add to quantum/measurement.ts
export class ProjectionOperator implements Operator {
  constructor(basisState: StateVector);
}

export function measureState(state: StateVector, 
                           observable: Operator): {
  outcome: number;
  collapsed: StateVector;  // Add quantum state collapse
  probability: number;     // Include measurement probability
}
```

## Phase 3: Quantum Algorithms Support

### 3.1 Quantum Gates
**Priority: LOW**
**Current Status**: Basic spin operators (Sx, Sy, Sz) exist for arbitrary spin-j, but no specific qubit gate implementations.

**Current Features**:
- Generation of spin-j operators
- Support for arbitrary spin representations
- Matrix elements for raising/lowering operations

**Required Extensions**:
- Add Pauli matrices (X, Y, Z) - Build on existing spin-1/2 operators
- Add Hadamard gate - New implementation
- Add CNOT gate (for 2-qubit systems) - Leverage tensor operations

**Implementation:**
```typescript
// Create quantum/gates.ts
export const PauliX: MatrixOperator;  // Build from spin operators
export const PauliY: MatrixOperator;  // Build from spin operators
export const PauliZ: MatrixOperator;  // Build from spin operators
export const Hadamard: MatrixOperator;

export function CNOT(): MatrixOperator;  // Use tensor methods
```

### 3.2 Simple Quantum Circuit
**Priority: LOW**
**Current Status**: No circuit framework exists, but tensor operations support needed mathematical structure.

**Current Features That Support This**:
- Tensor contraction capabilities
- Sparse tensor implementation
- Efficient element storage
- Proper dimension validation

**Required Extensions**:
- Basic quantum circuit builder - New feature
- Support for sequential gate application - Build on operator composition

**Implementation:**
```typescript
// Create quantum/circuit.ts
export class QuantumCircuit {
  private gates: Operator[];
  
  addGate(gate: Operator): void;      // Sequential gate addition
  apply(state: StateVector): StateVector;  // Use tensor contraction
}
```

**Benefits**:
- Leverage existing tensor infrastructure
- Natural extension of operator framework
- Support for quantum algorithms
- Foundation for future quantum computation features

## Phase 4: Testing and Validation

### 4.1 Test Suite
**Priority: HIGH**
**Current Status**: Basic test coverage exists for core operations.

**Current Test Coverage**:
- Basic state vector operations
- Tensor manipulations
- Intertwiner creation
- Spin operator generation

**Required Extensions**:
- Unit tests for all new operations
- Quantum identity verification tests
- Numerical stability tests
- Edge cases in tensor operations
- Complex numerical stability
- Full operator algebra
- Multi-particle states

**Implementation:**
```typescript
// Create quantum/__tests__/
// - complex.test.ts         // Test enhanced complex operations
// - operator.test.ts        // Test unified operator framework
// - hamiltonian.test.ts     // Test time evolution
// - measurement.test.ts     // Test measurement and collapse
```

### 4.2 Example Scripts
**Priority: MEDIUM**
**Current Status**: Some quantum examples exist in T53 (Quantum Tetrahedron).

**Required Examples**:
- Harmonic oscillator simulation - New
- Two-level system dynamics - Extend from spin-1/2
- Simple Bell state creation - Use new gate framework

## Implementation Timeline

1. **Week 1**: Complex number improvements + Operator interface
   - Leverage existing operations
   - Unify scattered implementations
   
2. **Week 2**: Hamiltonian class + Matrix exponentiation
   - Build on existing operator framework
   - Implement time evolution
   
3. **Week 3**: Measurement operators + Gates
   - Extend current measurement capabilities
   - Build gates from spin operators
   
4. **Week 4**: Testing, examples, and documentation
   - Expand current test coverage
   - Add new examples
   - Complete API documentation

## File Structure

```
lib/quantum/
├── __tests__/                # Test directory
├── complex.ts               # Enhanced complex number operations
├── types.ts                # Core quantum types
├── stateVector.ts          # Core state vector operations
├── operator.ts             # Operator interface & base classes
├── hamiltonian.ts          # Hamiltonian implementation
├── matrixOperations.ts     # Matrix operations
├── measurement.ts          # Measurement operators
├── gates.ts               # Quantum gates
├── circuit.ts             # Quantum circuit
└── index.ts               # Main exports
```

## Success Criteria

### Current Capabilities
1. State vector operations with arbitrary dimensions
2. Tensor operations with sparse storage
3. Spin-j operator generation
4. Basic measurement functionality
5. 4-valent intertwiner support

### Required Extensions
1. Enhanced quantum state manipulation
   - Improved complex operations
   - Unified operator framework
   
2. Advanced quantum operations
   - Time evolution
   - State collapse
   - Measurement simulation
   
3. Quantum computation support
   - Basic quantum gates
   - Simple circuits
   - Multi-qubit operations

4. Complete test coverage
   - All operations
   - Edge cases
   - Numerical stability

This enhanced foundation will provide a robust quantum simulation toolkit while maintaining the library's efficiency and usability.