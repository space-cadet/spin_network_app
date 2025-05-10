# Quantum Circuit Implementation Plan
*Last Updated: May 10, 2025*

## Overview

This document details the implementation plan for the quantum circuit module, following the established patterns from the existing codebase (states.ts, operator.ts, stateVector.ts). The implementation uses a hybrid approach combining pure functional operations with a stateful wrapper class for caching and convenience.

## 1. Module Structure

```
lib/quantum/
├── circuit/
│   ├── types.ts           # Circuit-specific types
│   ├── circuitOps.ts      # Pure functional operations
│   ├── circuit.ts         # Stateful wrapper class
│   ├── commonCircuits.ts  # Common circuit patterns
│   └── validation.ts      # Circuit-specific validation
└── __tests__/
    └── circuit/
        ├── circuit.test.ts     # Core functionality tests
        ├── circuit.prop.ts     # Property-based tests
        └── integration.test.ts # Integration tests
```

## 2. Implementation Components

### 2.1 Core Types (types.ts)

```typescript
/**
 * Single quantum gate operation
 */
type GateOperation = {
    type: 'gate';
    operator: Operator;
    targets: number[];
    controls?: number[];
    label?: string;
};

/**
 * Single measurement operation
 */
type MeasurementOperation = {
    type: 'measurement';
    target: number;
    basis?: Operator;
    label?: string;
};

/**
 * Union type for quantum operations
 */
type QuantumOperation = GateOperation | MeasurementOperation;

/**
 * Pure circuit data structure
 */
type CircuitData = {
    numQubits: number;
    operations: QuantumOperation[][];
};

/**
 * Result of circuit execution
 */
type CircuitResult = {
    finalState: StateVector;
    measurements: MeasurementRecord[];
    intermediateStates?: StateVector[];
};

/**
 * Cache structure for stateful operations
 */
type CircuitCache = {
    operator: Operator | null;
    results: Map<string, CircuitResult>;
};

/**
 * Public circuit interface
 */
interface CircuitInterface {
    readonly numQubits: number;
    readonly depth: number;
    
    // Circuit building
    addGate(gate: Operator, targets: number[], step?: number): this;
    addMeasurement(qubit: number, step?: number): this;
    
    // Execution
    execute(initialState?: StateVector): CircuitResult;
    executeWithShots(shots: number, initialState?: StateVector): MeasurementDistribution;
    
    // Utilities
    toOperator(): Operator;
    inverse(): CircuitInterface;
}
```

### 2.2 Pure Circuit Operations (circuitOps.ts)

```typescript
/**
 * Pure functional circuit operations
 */
export const circuitOps = {
    /**
     * Creates a new empty circuit
     */
    createCircuit(numQubits: number): CircuitData {
        validatePosDim(numQubits);
        return {
            numQubits,
            operations: []
        };
    },

    /**
     * Adds a gate operation to the circuit
     */
    addGate(
        circuit: CircuitData,
        gate: Operator,
        targets: number[],
        step?: number
    ): CircuitData {
        validateCircuitOperation(circuit, targets);
        const operation: GateOperation = {
            type: 'gate',
            operator: gate,
            targets,
            label: `${gate.type}${targets.join(',')}`
        };
        return addOperationToCircuit(circuit, operation, step);
    },

    /**
     * Adds a measurement operation
     */
    addMeasurement(
        circuit: CircuitData,
        qubit: number,
        step?: number
    ): CircuitData {
        validateCircuitOperation(circuit, [qubit]);
        const operation: MeasurementOperation = {
            type: 'measurement',
            target: qubit,
            label: `M${qubit}`
        };
        return addOperationToCircuit(circuit, operation, step);
    },

    /**
     * Executes circuit on given state
     */
    execute(
        circuit: CircuitData,
        initialState?: StateVector
    ): CircuitResult {
        validateCircuitExecution(circuit);
        const state = initialState || 
            StateVector.computationalBasis(2 ** circuit.numQubits, 0);
        return executeCircuitOps(circuit, state);
    },

    /**
     * Converts circuit to single operator
     */
    toOperator(circuit: CircuitData): Operator {
        return circuit.operations
            .flat()
            .filter(op => op.type === 'gate')
            .reduce((acc, op) => 
                acc.compose(op.operator),
                MatrixOperator.identity(2 ** circuit.numQubits)
            );
    },

    /**
     * Creates inverse circuit
     */
    inverse(circuit: CircuitData): CircuitData {
        return {
            numQubits: circuit.numQubits,
            operations: [...circuit.operations]
                .reverse()
                .map(step => 
                    step.map(op => 
                        op.type === 'gate' 
                            ? {...op, operator: op.operator.adjoint()}
                            : op
                    )
                )
        };
    }
};

/**
 * Helper functions for circuit operations
 */
function addOperationToCircuit(
    circuit: CircuitData,
    operation: QuantumOperation,
    step?: number
): CircuitData {
    const operations = [...circuit.operations];
    if (step === undefined) {
        operations.push([operation]);
    } else {
        operations[step] = [...(operations[step] || []), operation];
    }
    return {
        ...circuit,
        operations
    };
}

function executeCircuitOps(
    circuit: CircuitData,
    initialState: StateVector
): CircuitResult {
    let state = initialState;
    const measurements: MeasurementRecord[] = [];
    const intermediateStates: StateVector[] = [state];

    for (const step of circuit.operations) {
        for (const op of step) {
            if (op.type === 'gate') {
                state = op.operator.apply(state);
            } else {
                const measurement = measureState(state, op.target);
                measurements.push({
                    step: circuit.operations.indexOf(step),
                    qubit: op.target,
                    outcome: measurement.value,
                    probability: measurement.probability
                });
                state = measurement.state;
            }
            intermediateStates.push(state);
        }
    }

    return {
        finalState: state,
        measurements,
        intermediateStates
    };
}
```

### 2.3 Stateful Circuit Class (circuit.ts)

```typescript
/**
 * Stateful quantum circuit with caching
 */
export class Circuit implements CircuitInterface {
    private data: CircuitData;
    private cache: CircuitCache;

    constructor(numQubits: number) {
        validatePosDim(numQubits);
        this.data = circuitOps.createCircuit(numQubits);
        this.cache = createEmptyCache();
    }

    get numQubits(): number {
        return this.data.numQubits;
    }

    get depth(): number {
        return this.data.operations.length;
    }

    /**
     * Adds a quantum gate to the circuit
     */
    addGate(gate: Operator, targets: number[], step?: number): this {
        this.data = circuitOps.addGate(this.data, gate, targets, step);
        this.invalidateCache();
        return this;
    }

    /**
     * Adds a measurement operation
     */
    addMeasurement(qubit: number, step?: number): this {
        this.data = circuitOps.addMeasurement(this.data, qubit, step);
        this.invalidateCache();
        return this;
    }

    /**
     * Executes circuit with caching
     */
    execute(initialState?: StateVector): CircuitResult {
        const cacheKey = this.getCacheKey(initialState);
        const cached = this.cache.results.get(cacheKey);
        if (cached) return cached;

        const result = circuitOps.execute(this.data, initialState);
        this.cache.results.set(cacheKey, result);
        return result;
    }

    /**
     * Executes circuit multiple times
     */
    executeWithShots(shots: number, initialState?: StateVector): MeasurementDistribution {
        const results = Array(shots)
            .fill(null)
            .map(() => this.execute(initialState));
        
        const counts = countMeasurementOutcomes(results);
        return new MeasurementDistribution(counts, shots);
    }

    /**
     * Converts circuit to operator with caching
     */
    toOperator(): Operator {
        if (!this.cache.operator) {
            this.cache.operator = circuitOps.toOperator(this.data);
        }
        return this.cache.operator;
    }

    /**
     * Creates inverse circuit
     */
    inverse(): Circuit {
        const newCircuit = new Circuit(this.numQubits);
        newCircuit.data = circuitOps.inverse(this.data);
        return newCircuit;
    }

    /**
     * Cache management
     */
    private invalidateCache(): void {
        this.cache = createEmptyCache();
    }

    private getCacheKey(state?: StateVector): string {
        return state 
            ? `${this.depth}-${state.toString()}`
            : 'default';
    }

    /**
     * Access to underlying data
     */
    getData(): Readonly<CircuitData> {
        return Object.freeze({...this.data});
    }
}

function createEmptyCache(): CircuitCache {
    return {
        operator: null,
        results: new Map()
    };
}

function countMeasurementOutcomes(
    results: CircuitResult[]
): Record<string, number> {
    return results.reduce((counts, result) => {
        const outcome = result.measurements
            .map(m => m.outcome)
            .join('');
        counts[outcome] = (counts[outcome] || 0) + 1;
        return counts;
    }, {} as Record<string, number>);
}
```

### 2.4 Common Circuit Patterns (commonCircuits.ts)

```typescript
/**
 * Pure functions for common quantum circuits
 */
export const commonCircuits = {
    /**
     * Creates Bell state circuit
     */
    createBellCircuit(
        q1: number = 0,
        q2: number = 1
    ): CircuitData {
        return pipe(
            circuitOps.createCircuit(Math.max(q1, q2) + 1),
            c => circuitOps.addGate(c, Hadamard, [q1]),
            c => circuitOps.addGate(c, CNOT, [q2], [q1])
        );
    },

    /**
     * Creates GHZ state circuit
     */
    createGHZCircuit(numQubits: number): CircuitData {
        return pipe(
            circuitOps.createCircuit(numQubits),
            c => circuitOps.addGate(c, Hadamard, [0]),
            c => range(1, numQubits).reduce(
                (acc, i) => circuitOps.addGate(acc, CNOT, [i], [0]),
                c
            )
        );
    }
};

/**
 * Factory functions for stateful circuits
 */
export const CircuitFactory = {
    /**
     * Creates Bell state circuit
     */
    bell(q1: number = 0, q2: number = 1): Circuit {
        const circuit = new Circuit(Math.max(q1, q2) + 1);
        circuit.addGate(Hadamard, [q1])
              .addGate(CNOT, [q2], [q1]);
        return circuit;
    },

    /**
     * Creates GHZ state circuit
     */
    ghz(numQubits: number): Circuit {
        const circuit = new Circuit(numQubits);
        circuit.addGate(Hadamard, [0]);
        for (let i = 1; i < numQubits; i++) {
            circuit.addGate(CNOT, [i], [0]);
        }
        return circuit;
    }
};
```

## 3. Integration Points

### 3.1 StateVector Integration
- Uses StateVector class for quantum states
- Follows same validation patterns
- Maintains immutability in operations

### 3.2 Operator Integration
- Uses MatrixOperator for gates
- Follows operator composition patterns
- Maintains type safety

### 3.3 Validation Integration
- Uses existing validation utilities
- Follows same error handling patterns
- Adds circuit-specific validations

### 3.4 Math.js Integration
- Uses math.js for numerical operations
- Follows same complex number handling
- Maintains numerical stability

## 4. Implementation Phases

1. **Phase 1: Core Implementation** (Week 1)
   - Implement pure operations in circuitOps
   - Add circuit-specific types
   - Create basic validation

2. **Phase 2: Stateful Wrapper** (Week 1)
   - Implement Circuit class
   - Add caching mechanism
   - Create factory methods

3. **Phase 3: Integration** (Week 2)
   - Integrate with StateVector
   - Integrate with Operators
   - Add measurement support

4. **Phase 4: Testing & Documentation** (Week 2)
   - Implement test suite
   - Add documentation
   - Create examples

## 5. Testing Strategy

### 5.1 Unit Tests
```typescript
// circuit.test.ts
describe('Circuit Operations', () => {
    describe('Pure Operations', () => {
        test('createCircuit validates inputs', () => {});
        test('addGate maintains immutability', () => {});
        test('execute produces correct results', () => {});
    });
    
    describe('Circuit Class', () => {
        test('caching works correctly', () => {});
        test('state management is reliable', () => {});
    });
});
```

### 5.2 Property Tests
```typescript
// circuit.prop.ts
describe('Circuit Properties', () => {
    test('inverse is reversible', () => {});
    test('composition is associative', () => {});
    test('measurements are valid', () => {});
});
```

### 5.3 Integration Tests
```typescript
// integration.test.ts
describe('Circuit Integration', () => {
    test('works with StateVector', () => {});
    test('works with Operators', () => {});
    test('handles complex circuits', () => {});
});
```

## 6. Documentation

### 6.1 API Documentation
- TypeScript interfaces with JSDoc comments
- Parameter and return type documentation
- Usage examples in comments
- Cross-references between components

### 6.2 Implementation Documentation
- In-code documentation of algorithms
- Mathematical background
- Performance considerations
- Testing requirements

### 6.3 Example Programs
- Basic circuit construction
- Common quantum algorithms
- Measurement examples
- Complex circuit patterns
