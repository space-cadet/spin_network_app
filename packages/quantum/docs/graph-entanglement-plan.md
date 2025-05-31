# Quantum Graph Entanglement Implementation Plan

*Created: 2025-05-30*
*Status: Planning Phase*

## Overview

Extend the QuantumGraph class to support genuine quantum entanglement by implementing composite state storage that spans multiple vertices. Current limitation: individual vertex storage cannot represent entangled states.

## Current Bell Chain Example

The existing Bell chain example demonstrates the limitation:

```
Bell State Chain Examples

1. 3-vertex chain (aperiodic):
   q0 ---- bell_0_1 ---- q1 ---- bell_1_2 ---- q2
   |0⟩                   |0⟩                   |0⟩

2. 4-vertex ring (periodic):
        q0 ---- bell_0_1 ---- q1
        |                      |
   bell_3_0                bell_1_2
        |                      |
        q3 ---- bell_2_3 ---- q2
       |0⟩                   |0⟩

3. 6-vertex chain (aperiodic):
   q0 ---- bell_0_1 ---- q1 ---- bell_1_2 ---- q2 ---- bell_2_3 ---- q3 ---- bell_3_4 ---- q4 ---- bell_4_5 ---- q5
   |1⟩                   |1⟩                   |1⟩                   |1⟩                   |1⟩                   |1⟩

Legend:
- Vertices (qN): Quantum states (qubits)
- Edges (bell_i_j): Bell state entanglement operators
- |0⟩, |1⟩: Initial computational basis states
```

**Issue**: Each vertex stores independent states, edges have only metadata labels.
**Goal**: Transform into genuine entangled Bell states |00⟩ + |11⟩ spanning vertex pairs.

## Current Architecture Issues

**Problem**: One vertex = one quantum object
**Need**: One quantum object across multiple vertices for entanglement

```typescript
// Current (Limited)
vertex_q0: StateVector(|0⟩)  // 2D, independent
vertex_q1: StateVector(|0⟩)  // 2D, independent

// Required (Entangled) 
composite_system: StateVector(|00⟩ + |11⟩)  // 4D, spanning q0,q1
```

## Implementation Plan

### Phase 1: Core Composite State Storage ✅ COMPLETE

**Status**: Implemented and validated in `entangledGraphPOC.ts`

**File**: `packages/quantum/examples/poc/entangledGraphPOC.ts` (~100 lines)
```typescript
class CompositeQuantumManager {
  private composites: Map<string, QuantumObject>;
  private elementToComposite: Map<string, string>;
  
  // Core operations implemented
  setComposite(elementIds: string[], obj: QuantumObject): void;
  getComposite(elementIds: string[]): QuantumObject | undefined;
  getCompositeForElement(elementId: string): QuantumObject | undefined;
}
```

**Validation Results**:
- ✅ Multi-vertex Bell states: |00⟩ + |11⟩ (dim 4, norm 1.0)
- ✅ Multi-edge plaquette operators: |0000⟩ + |1111⟩ (dim 16, norm 1.0)
- ✅ Composite priority over individual assignments
- ✅ Backward compatibility maintained

**File**: `packages/quantum/src/qgraph/types.ts` (~80 lines)
```typescript
interface ICompositeSystem {
  id: string;
  vertexIds: Set<string>;
  state: StateVector;
  dimension: number;
}

interface EntanglementOperation {
  sourceVertices: string[];
  targetVertices: string[];
  operator: IOperator;
  resultingComposite: string;
}
```

### Phase 2: QuantumGraph Integration ✅ COMPLETE

**Status**: Implemented and validated in `entangledGraphPOC.ts`

**File**: `packages/quantum/examples/poc/entangledGraphPOC.ts` (extended implementation)
```typescript
class CompositeQuantumGraph {
  private compositeManager: CompositeQuantumManager;
  
  // Composite methods implemented
  setCompositeQuantumObject(elementIds: string[], obj: QuantumObject): void;
  getCompositeQuantumObject(elementIds: string[]): QuantumObject | undefined;
  
  // Enhanced backward compatible methods
  getVertexQuantumObject(nodeId: string): QuantumObject | undefined; // composite priority
  setVertexQuantumObject(nodeId: string, obj: QuantumObject): void; // prevents overwrites
}
```

**Integration Status**:
- ✅ Composite quantum object management integrated
- ✅ Multi-element quantum states working
- ✅ Backward compatibility with single-element interface
- ✅ Composite priority prevents overlap conflicts

**Next Phase Ready**: Entanglement operations (CNOT, Bell state creation, measurement)

### Phase 3: Graph-State Entanglement Operations (IN PROGRESS - 3-4 days) 

**Current Status**: Phase 3A Complete - General operation infrastructure implemented. QuantumGraph now supports arbitrary operations on arbitrary element subsets with composite state management.

#### Phase 3A: General Operation Infrastructure ✅ COMPLETE

**Implementation Summary**:
The general operation infrastructure provides a foundation for applying arbitrary quantum operations to arbitrary subsets of graph elements. This addresses the core requirement to create entanglement ON existing graph states rather than attaching pre-entangled objects.

**Files Implemented**:
- `packages/quantum/src/qgraph/QuantumGraph.ts` (+80 lines) - Enhanced with composite manager and operation methods
- `packages/quantum/src/qgraph/CompositeQuantumManager.ts` (30 lines) - Separate class for composite state management  
- `packages/quantum/src/qgraph/operations/general.ts` (150 lines) - General operation functions
- `packages/quantum/src/qgraph/operations/index.ts` (15 lines) - Operations module exports
- `packages/quantum/src/qgraph/types.ts` (updated) - Proper interface separation, removed class definitions

**Key Features Implemented**:
- **Three Operation Methods**: 
  - `applyVertexOperation(vertexIds[], operator)` - Apply to vertex subsets
  - `applyEdgeOperation(edgeIds[], operator)` - Apply to edge subsets  
  - `applyOperation(elementIds[], operator)` - Apply to mixed vertex/edge subsets
- **Composite State Integration**: Get/set methods check composite states first, fall back to individual
- **General Operations Module**: Eight functions for arbitrary operations on graph subsets
- **Measurement Support**: `measureSubsystem(vertexIds[], projector?)` for quantum measurements
- **Proper Type Organization**: Interfaces in types.ts, class implementations in separate files
- **Utility Functions**: Validation, dimension calculation, state extraction/insertion

**Current Capabilities**:
- Apply arbitrary quantum operators to arbitrary vertex/edge subsets
- Automatic composite state creation for multi-element operations  
- State extraction and insertion with composite priority
- Basic measurement operations with outcome calculation
- Validation and dimension calculation for subsystems
- Mixed vertex/edge operations with element type detection

**Architecture Benefits**:
- **General vs Specific**: Framework supports arbitrary operations instead of predefined gate sequences
- **Type Safety**: Proper separation of interfaces and implementations
- **Extensibility**: Operations module can be extended with domain-specific functions
- **Composability**: Basic operations can be combined to create complex quantum circuits

#### Phase 3B: Enhanced Operation Implementation (NEXT - 2-3 days)

**Required Enhancements** (Current placeholder implementations need upgrading):

#### Composite System Step-by-Step Operation

The current POC composite system works as follows:

1. **Composite Manager Structure**
   - `QCompManager` maintains two maps: `composites` (composite ID → quantum object) and `elementToComposite` (element ID → composite ID)
   - Composite ID created by sorting element IDs and joining with underscore for consistent lookup

2. **Setting Composite Relationships**
   - `setComposite(elementIds[], obj)` stores quantum object under composite ID
   - Each individual element maps to the composite ID in reverse lookup
   - Example: Bell state spanning vertices "0,0" and "0,1" creates composite ID "0,0_0,1"

3. **Retrieval with Composite Priority**
   - `getCompositeForElement(elementId)` returns composite object if element is part of one
   - `getNodeQObj(nodeId)` always returns composite state when element belongs to composite
   - Individual states only allowed if element not already in composite

4. **Composite Object Creation**
   - Current: Pre-created Bell states and plaquette operators attached to multiple elements
   - **Issue**: States created externally, then attached to graph - not generated from graph operations

#### Required Changes for Graph-State Entanglement

**Problem**: Current system attaches pre-entangled objects to graph elements instead of creating entanglement from existing graph states.

**Solution**: Transform to act ON graph states themselves:

1. **Initialize Graph with Individual States**
   - All vertices start with individual |0⟩ states
   - All edges start with individual |0⟩ states  
   - No composite objects initially - pure product state

2. **Graph-Level Gate Operations**
   - `applyVertexGate(vertexId, gate)` - acts on single vertex state
   - `applyEdgeGate(edgeId, gate)` - acts on single edge state
   - `applyTwoVertexGate(vertex1, vertex2, gate)` - creates entanglement between vertices
   - `applyMultiEdgeGate(edgeIds[], gate)` - creates entanglement between edges

3. **Entanglement Creation Process**
   - Apply Hadamard to vertex A: |0⟩ → (|0⟩ + |1⟩)/√2
   - Apply CNOT between vertex A and B: creates Bell state across both
   - System automatically converts individual states to composite when entanglement occurs

4. **State Management During Operations**
   - Detect when operations create entanglement
   - Automatically merge individual states into composites
   - Update composite manager mappings
   - Remove individual states that become part of composites

5. **Operation Interface**
   - `graph.entangleVertices([v1, v2], bellCircuit)`
   - `graph.createPlaquette([e1, e2, e3, e4], stabilizerOp)`
   - Operations work on existing graph-attached states, not external objects

**File**: `packages/quantum/src/qgraph/operations/entanglement.ts` (~200 lines)
```typescript
// Graph-state entanglement operations
function entangleVertices(graph: QuantumGraph, vertex1: string, vertex2: string): void {
  // Get existing individual states from graph
  const state1 = graph.getVertexQuantumObject(vertex1);
  const state2 = graph.getVertexQuantumObject(vertex2);
  
  // Apply Hadamard to first vertex
  graph.applyVertexGate(vertex1, new HadamardGate());
  
  // Apply CNOT to create Bell state
  graph.applyTwoVertexGate(vertex1, vertex2, new CNOTGate());
  
  // System automatically creates composite state
}

// Multi-vertex entanglement from product states
function createGHZState(graph: QuantumGraph, vertexIds: string[]): void;
function createWState(graph: QuantumGraph, vertexIds: string[]): void;

// Controlled operations across existing graph states
function applyControlledOperation(
  graph: QuantumGraph, 
  controlVertices: string[], 
  targetVertices: string[], 
  operator: IOperator
): void;

// Partial measurement splits composites back to individual states
function partialMeasure(
  graph: QuantumGraph, 
  vertexIds: string[], 
  projector: IOperator
): MeasurementResult;
```

### Phase 4: Quantum Circuit Operations (2-3 days)

**File**: `packages/quantum/src/qgraph/operations/circuits.ts` (~150 lines)
```typescript
// CNOT across graph edges
function applyCNOT(graph: QuantumGraph, controlVertex: string, targetVertex: string): void;

// Hadamard to single vertex in composite
function applyHadamard(graph: QuantumGraph, vertex: string): void;

// Toffoli (CCX) gates
function applyToffoli(
  graph: QuantumGraph, 
  control1: string, 
  control2: string, 
  target: string
): void;

// Circuit sequence execution
function executeCircuit(graph: QuantumGraph, operations: CircuitOperation[]): void;
```

### Phase 5: Enhanced Bell Chain Example (1-2 days)

**File**: `packages/quantum/examples/qgraph/entangledBellChain.ts` (~180 lines)
```typescript
export function createEntangledBellChain(config: BellChainConfig): QuantumGraph {
  const graph = new QuantumGraph();
  
  // Add individual vertices with |0⟩ states
  for (let i = 0; i < config.numVertices; i++) {
    graph.addNode({id: `q${i}`, type: 'qubit', properties: {...}});
    graph.setVertexQuantumObject(`q${i}`, StateVector.computationalBasis(2, 0));
  }
  
  // Create actual Bell state entanglement between adjacent pairs
  for (let i = 0; i < config.numVertices - 1; i++) {
    // Apply Hadamard to first qubit
    graph.applyHadamard(`q${i}`);
    
    // Apply CNOT to create Bell state |00⟩ + |11⟩
    graph.applyCNOT(`q${i}`, `q${i+1}`);
    
    console.log(`Created Bell pair between q${i} and q${i+1}`);
  }
  
  // Handle periodic boundary
  if (config.periodic && config.numVertices > 2) {
    graph.applyCNOT(`q${config.numVertices-1}`, `q0`);
  }
  
  return graph;
}

export function verifyEntanglement(graph: QuantumGraph): void {
  // Calculate entanglement entropy between subsystems
  // Verify Bell state correlations
  // Show composite state dimensions
}
```

### Phase 6: Testing and Validation (2-3 days)

**File**: `packages/quantum/__tests__/qgraph/entanglement.test.ts` (~250 lines)
```typescript
describe('Quantum Graph Entanglement', () => {
  test('Bell state creation', () => {
    // Verify |00⟩ + |11⟩ state creation
    // Test measurement correlations
    // Validate composite state storage
  });
  
  test('Multi-vertex entanglement', () => {
    // GHZ state: |000⟩ + |111⟩
    // W state: |001⟩ + |010⟩ + |100⟩
    // Verify composite dimensions
  });
  
  test('Partial measurement', () => {
    // Measure one qubit in Bell pair
    // Verify state collapse and partition splitting
    // Test remaining entanglement
  });
  
  test('Composite state management', () => {
    // Test merging and splitting operations
    // Verify vertex partition tracking
    // Test error conditions
  });
});
```

## Implementation Details

### 1. Composite State Identification
```typescript
// Use deterministic IDs for composite systems
function generateCompositeId(vertexIds: string[]): string {
  return `composite_${[...vertexIds].sort().join('_')}`;
}
```

### 2. State Vector Tensor Operations
```typescript
// Extend StateVector for tensor products
class StateVector {
  static tensorProduct(state1: StateVector, state2: StateVector): StateVector;
  static partialTrace(compositeState: StateVector, tracedVertices: number[]): StateVector;
}
```

### 3. Memory Management
```typescript
// Handle large composite state spaces efficiently
class CompositeStateManager {
  private maxCompositeSize: number = 10; // Limit to 2^10 = 1024 dimensions
  
  private validateCompositeSize(vertexCount: number): void {
    if (Math.pow(2, vertexCount) > Math.pow(2, this.maxCompositeSize)) {
      throw new Error(`Composite system too large: ${vertexCount} qubits`);
    }
  }
}
```

### 4. Edge Operator Integration
```typescript
// Apply edge operators to create entanglement
class QuantumGraph {
  applyEdgeOperator(edgeId: string): void {
    const edge = this.getEdge(edgeId);
    const operator = this.getEdgeQuantumObject(edgeId) as IOperator;
    
    if (operator) {
      this.applyCompositeOperation([edge.sourceId, edge.targetId], operator);
    }
  }
}
```

## Success Criteria

1. **Genuine Bell State Creation**: |00⟩ + |11⟩ stored as single composite state
2. **Measurement Correlations**: Measuring one qubit instantly affects its partner
3. **Composite State Tracking**: System knows which vertices are entangled together
4. **Memory Efficiency**: No redundant storage of individual states for entangled systems
5. **Circuit Operations**: CNOT, Hadamard, and multi-qubit gates work across composites

## File Structure Summary

```
packages/quantum/src/qgraph/
├── CompositeStateManager.ts      # Core composite state storage
├── QuantumGraph.ts              # Extended with entanglement support
├── operations/
│   ├── entanglement.ts          # Bell, GHZ, W state creation
│   └── circuits.ts              # Quantum gate operations
└── types.ts                     # Composite system interfaces

packages/quantum/examples/qgraph/
└── entangledBellChain.ts        # Enhanced example with real entanglement

packages/quantum/__tests__/qgraph/
└── entanglement.test.ts         # Comprehensive entanglement tests

packages/quantum/docs/
└── graph-entanglement-plan.md   # This document
```

## Dependencies

- **T73**: Core QuantumGraph implementation
- **StateVector**: Tensor product and partial trace operations
- **Operator**: Multi-qubit gate applications
- **Measurement**: Composite system measurements

## Timeline

**Total Estimated Time**: 13-19 days

- Phase 1-2: Core infrastructure (5-7 days)
- Phase 3-4: Operations and circuits (5-7 days)  
- Phase 5-6: Examples and testing (3-5 days)

## Notes

This implementation transforms the QuantumGraph from a static structure with quantum labels into a dynamic quantum computational framework capable of representing and manipulating genuine quantum entanglement across graph topologies.
