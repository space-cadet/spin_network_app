# Graph-Quantum Integration: Implementation Plan

*Updated: May 11, 2025*

This document outlines the comprehensive plan for restructuring the library to create proper abstract graph tools that can be integrated with the quantum module to construct graph state vectors with quantum states on edges and intertwiner tensors on nodes.

## 1. Current State Analysis

The codebase currently has several key components:

- **lib/quantum**: A robust quantum mechanics library with state vectors, operators, etc.
- **lib/graph**: Current graph implementation that's tightly coupled to simulation concepts
- **lib/tensor**: Initial tensor implementation with some intertwiner functionality
- **lib/core**: Mix of core functionality including types, math adapters, etc.

Key issues with current implementation:

1. Naming doesn't reflect abstract graph structures (e.g., "SpinNetworkGraph" for abstract graph)
2. Tight coupling between graph structure and simulation-specific concepts
3. Incomplete tensor implementation for intertwiner spaces
4. No clear separation between abstract graph structures and quantum-specific extensions
5. Library code spread across lib/ and packages/ without consistent organization

## 2. Proposed Redesign

### 2.1 Library Structure

We'll move all library code to the packages/ folder for a consistent monorepo structure:

```
packages/
├── quantum/         (Moved from lib/quantum)
│   ├── src/
│   │   ├── core/    (Core quantum mechanics)
│   │   ├── states/  (Quantum state implementations)
│   │   ├── operators/ (Quantum operators)
│   │   └── utils/
│
├── graph-core/      (Abstract graph structures)
│   ├── src/
│   │   ├── core/    (Basic graph implementations)
│   │   ├── utils/   (Utility functions)
│   │   └── algorithms/ (Graph algorithms)
│
├── tensor-core/     (Tensor operations)
│   ├── src/
│   │   ├── core/    (Basic tensor implementations)
│   │   ├── operations/ (Tensor manipulations)
│   │   └── utils/
│
└── spin-network/    (Combines quantum, graph, and tensor)
    ├── src/
    │   ├── core/    (Core spin network abstractions)
    │   ├── edge/    (Edge states)
    │   ├── node/    (Intertwiner implementations)
    │   └── composer/ (Graph state composition)
```

The old lib/ folder contents will be gradually deprecated as functionality is migrated to the new packages.

### 2.2 Renaming Strategy

| **Current Name** | **Proposed Name** | **Reason for Change** |
|------------------|-------------------|------------------------|
| `SpinNetworkGraph` | `IGraph` | Base interface for all graph structures |
| `SimulationNode` | `IGraphNode` | Base interface for all graph nodes |
| `SimulationEdge` | `IGraphEdge` | Base interface for all graph edges |
| `SimulationGraph` | `ITypedGraph` | Type-safe graph interface |
| `SimulationStateVector` | `INodeState` | Interface for node states |
| `GraphStateVector` | `IGraphState` | Interface for overall graph state |
| `TensorNode` | `IIntertwinerNode` | Interface for nodes with intertwiner tensors |
| `StateVectorEdge` | `IQuantumEdge` | Interface for edges with quantum states |
| `WeightFunction` | `EdgeWeightFunction` | Type for edge weight calculations |
| `StandardWeightFunction` | `SpinWeightFunction` | Type for spin-specific weight calculations |
| `intertwinerValue` property | `intertwinerIndex` | More accurate property name |

For new classes and interfaces that need to be created:

| **New Component** | **Proposed Name** | **Purpose** |
|-------------------|-------------------|-------------|
| New class for quantum states on edges | `EdgeStateVector` | Represents quantum states living on graph edges. |
| New class for quantum graph | `QuantumGraph` | Extends AbstractGraph with quantum state functionality. |
| New interface for edge quantum states | `QuantumEdgeState` | Interface defining operations for quantum states on edges. |
| New class for intertwiner tensors | `IntertwinerTensor` | Represents tensors at graph nodes. |
| New module for combining edge and node states | `GraphStateComposer` | Composes edge states and intertwiner tensors. |

### 2.3 Dependencies Flow

The dependencies would flow in a clear, one-way direction:

1. **quantum package** has no dependencies on other packages
2. **graph-core** and **tensor-core** depend on quantum
3. **spin-network** depends on quantum, graph-core, and tensor-core

This creates a clean separation where each package has a clear responsibility:
- quantum: Quantum mechanics fundamentals
- graph-core: Abstract graph structures and algorithms
- tensor-core: Tensor operations and manipulations
- spin-network: Integration of quantum states with graph structures

### 2.4 Extended Interface Structure

The graph-core package will implement a hierarchical interface structure that supports multiple use cases:

```typescript
// Base interfaces for all graph elements
interface IGraphElement {
  readonly id: string;
  readonly properties: IPropertyMap;
}

interface IGraphNode extends IGraphElement {
  readonly type: string;
}

interface IGraphEdge extends IGraphElement {
  readonly sourceId: string;
  readonly targetId: string;
  readonly directed: boolean;
  readonly type: string;
}

// Type-safe graph elements
interface ITypedNode<T extends string> extends IGraphNode {
  readonly type: T;
}

interface ITypedEdge<T extends string> extends IGraphEdge {
  readonly type: T;
}

// Higher dimensional structures
interface IFace extends IGraphElement {
  readonly edgeIds: readonly string[];
  readonly nodeIds: readonly string[];
}

interface ISimplex extends IGraphElement {
  readonly dimension: number;
  readonly boundaryIds: readonly string[];
  readonly coFaceIds: readonly string[];
}

// Specialized graph interfaces
interface ITypedGraph<NodeType extends string, EdgeType extends string> extends IGraph {
  // Type-safe operations
}

interface IOrderedGraph extends IGraph {
  // Operations for ordered subgraphs (circuits)
}

interface ISimplicialGraph extends IGraph {
  // Operations for faces and simplices
}

interface IRewriteableGraph extends IGraph {
  // Pattern matching and rewrite operations
}

// Combined interface for full functionality
interface IExtendedGraph<NodeType extends string, EdgeType extends string> 
  extends ITypedGraph<NodeType, EdgeType>,
          IOrderedGraph,
          ISimplicialGraph,
          IRewriteableGraph {
}
```

This interface structure supports:
1. **Type Safety**: Through `ITypedGraph<NodeType, EdgeType>`
2. **Quantum Circuits**: Using `IOrderedGraph` for gate sequences
3. **ZX-Calculus**: Using `ITypedGraph` and `IRewriteableGraph`
4. **Pachner Moves**: Using `ISimplicialGraph` and `IRewriteableGraph`
5. **Pattern Matching**: Through the rewrite rule system

## 3. Implementation Plan

### 3.1 Phase 1: Move Quantum to Packages

1. **Create the quantum package structure**:
   ```
   packages/quantum/
   ├── package.json
   ├── tsconfig.json
   ├── vite.config.ts
   └── src/
       ├── core/
       ├── states/
       ├── operators/
       └── index.ts
   ```

2. **Configure package.json for quantum**:
   ```json
   {
     "name": "@spin-network/quantum",
     "version": "0.1.0",
     "description": "Quantum mechanics library for spin networks",
     "main": "dist/index.js",
     "module": "dist/index.mjs",
     "types": "dist/index.d.ts",
     "scripts": {
       "build": "tsc && vite build",
       "test": "vitest run",
       "lint": "eslint src --ext .ts",
       "clean": "rimraf dist"
     },
     "dependencies": {
       "mathjs": "^12.1.0"
     },
     "devDependencies": {
       "typescript": "^5.8.3",
       "vite": "^6.0.0",
       "vitest": "^1.0.0"
     }
   }
   ```

3. **Copy and reorganize files** from lib/quantum:
   - Copy core interfaces and types to src/core/
   - Organize state implementations in src/states/
   - Group operator implementations in src/operators/
   - Create clean exports in index.ts

4. **Create comprehensive tests** to ensure full functionality

### 3.2 Phase 2: Create Graph Core Package

#### 3.2.1 Updated Approach: Library Evaluation Through Testing App

Based on our comprehensive analysis of available graph libraries, we've decided to take an incremental approach to implementation:

1. First, implement a testing application to directly compare Graphology and Cytoscape.js
2. Define core interfaces in the graph-core package from the start
3. Implement concrete adapters in the testing app for both libraries
4. Use the testing results to make an informed decision about which approach to use
5. Migrate the chosen implementation to the graph-core package

This approach allows us to:
- Directly compare the APIs and performance of both libraries
- Make data-driven decisions based on actual usage patterns
- Start with the right abstractions from the beginning
- Avoid committing prematurely to an implementation strategy

##### Package Structure for Evaluation

```
/packages/graph-core/
├── src/
│   ├── core/
│   │   ├── types.ts            # Common interfaces and types
│   │   └── AbstractGraph.ts    # Interface definition for graphs
│   └── index.ts                # Public exports

/packages/graph-test-app/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── components/             # UI components
│   ├── backends/               # Graph library implementations for testing
│   │   ├── graphology/         # Graphology implementation
│   │   └── cytoscape/          # Cytoscape implementation
│   └── utils/                  # Utility functions
```

| Feature | Graphology | Cytoscape.js | ngraph.graph | Custom Implementation |
|---------|------------|--------------|--------------|------------------------|
| **Core Features** |
| License | MIT | MIT | MIT | N/A |
| TypeScript Support | Excellent | Good (since 3.31.0) | Limited | Full Control |
| Performance | Good | Good | Excellent | Depends on Implementation |
| **Graph Types** |
| Directed/Undirected/Mixed | ✅ | ✅ | Limited | Can Implement |
| Multi-Graphs | ✅ | ✅ | ✅ | Can Implement |
| Compound Graphs | ✅ | ✅ | ❌ | Can Implement |
| **Algorithm Support** |
| Traversal & Path Finding | ✅ | ✅ | ✅ | Need to Implement |
| Centrality Measures | ✅ | ✅ | Limited | Need to Implement |
| Graph Composition | ✅ | Limited | Limited | Need to Implement |
| **Integration Potential** |
| Math.js Compatibility | Via Custom Adapter | Via Custom Adapter | Via Custom Adapter | Direct Integration |
| Quantum State Attachment | Via Extension | Via Extension | Via Extension | Native Support |
| **Community & Support** |
| Active Maintenance | ✅ | ✅ | Limited | N/A |
| Documentation | Excellent | Excellent | Good | N/A |

**Key Decision Factors:**
1. **Integration with Quantum States**: All options would require custom adapters for quantum state attachment
2. **Current Usage**: Cytoscape.js is already used in our UI components for visualization
3. **Math.js Integration**: Current SpinNetworkGraph already implements matrix conversion methods
4. **Performance**: For complex quantum graphs, performance will be critical

#### 3.2.2 Implementation Plan

1. **Set up core interfaces in graph-core**:
   ```typescript
   // packages/graph-core/src/core/types.ts
   
   // Base interfaces
   export interface IGraphElement {
     readonly id: string;
     readonly properties: IPropertyMap;
   }

   export interface IGraphNode extends IGraphElement {
     readonly type: string;
   }

   export interface IGraphEdge extends IGraphElement {
     readonly sourceId: string;
     readonly targetId: string;
     readonly directed: boolean;
     readonly type: string;
   }

   // Core graph interface
   export interface IGraph {
     readonly isDirected: boolean;
     readonly nodeCount: number;
     readonly edgeCount: number;

     // Graph operations
     addNode(node: IGraphNode): IGraph;
     removeNode(nodeId: string): IGraph;
     addEdge(edge: IGraphEdge): IGraph;
     removeEdge(edgeId: string): IGraph;

     // Query operations
     getNode(nodeId: string): IGraphNode | undefined;
     getEdge(edgeId: string): IGraphEdge | undefined;
     getNodes(): readonly IGraphNode[];
     getEdges(): readonly IGraphEdge[];

     // Matrix operations
     toAdjacencyMatrix(weightFn?: EdgeWeightFunction): Matrix;
     toLaplacianMatrix(weightFn?: EdgeWeightFunction): Matrix;
   }

   // Extended interfaces
   export interface ITypedGraph<NodeType extends string, EdgeType extends string> extends IGraph {
     addTypedNode(node: ITypedNode<NodeType>): ITypedGraph<NodeType, EdgeType>;
     getTypedNode(nodeId: string): ITypedNode<NodeType> | undefined;
     getNodesOfType(type: NodeType): readonly ITypedNode<NodeType>[];
   }

   export interface IOrderedGraph extends IGraph {
     createOrderedSubgraph(elements: IGraphElement[]): IOrderedSubgraph;
     getElementOrder(subgraphId: string, elementId: string): number | undefined;
   }

   export interface ISimplicialGraph extends IGraph {
     addFace(face: IFace): ISimplicialGraph;
     addSimplex(simplex: ISimplex): ISimplicialGraph;
     getFacesByVertex(vertexId: string): readonly IFace[];
   }

   export interface IRewriteableGraph extends IGraph {
     findMatches(pattern: IRewritePattern): readonly IMatch[];
     applyRewrite(pattern: IRewritePattern, match: IMatch): IRewriteableGraph;
   }
   ```

2. **Implement adapters in the test app**:
   ```typescript
   // packages/graph-test-app/src/backends/graphology/GraphAdapter.ts
   import { Graph, GraphNode, GraphEdge } from '@spin-network/graph-core';
   import { Graph as GraphologyGraph } from 'graphology';
   
   export class GraphologyAdapter implements Graph {
     private graph: GraphologyGraph;
     
     constructor() {
       this.graph = new GraphologyGraph();
     }
     
     // Implement Graph interface methods...
   }
   
   // Similar implementation for CytoscapeAdapter
   ```

3. **Create test app UI components**:
   - Implement GraphCanvas for visualization
   - Create operations panel for graph manipulation
   - Add performance measurement utilities
   
4. **Migration path after evaluation**:
   - Move the chosen implementation to graph-core
   - Expand with additional algorithms and utilities
   - Add comprehensive testing

### 3.3 Phase 3: Create Tensor Core Package

1. **Set up package structure**:
   ```
   packages/tensor-core/
   ├── package.json
   ├── tsconfig.json
   └── src/
       ├── core/
       ├── operations/
       └── index.ts
   ```

2. **Configure dependencies**:
   ```json
   {
     "name": "@spin-network/tensor-core",
     "version": "0.1.0",
     "dependencies": {
       "@spin-network/quantum": "^0.1.0",
       "mathjs": "^12.1.0"
     }
   }
   ```

3. **Implement tensor interfaces and operations** for handling intertwiner tensors

### 3.4 Phase 4: Create Spin Network Package

1. **Set up package structure**:
   ```
   packages/spin-network/
   ├── package.json
   ├── tsconfig.json
   └── src/
       ├── core/
       ├── edge/
       ├── node/
       ├── composer/
       └── index.ts
   ```

2. **Configure dependencies**:
   ```json
   {
     "name": "@spin-network/spin-network",
     "version": "0.1.0",
     "dependencies": {
       "@spin-network/quantum": "^0.1.0",
       "@spin-network/graph-core": "^0.1.0",
       "@spin-network/tensor-core": "^0.1.0",
       "mathjs": "^12.1.0"
     }
   }
   ```

3. **Implement quantum edge states**:
   ```typescript
   // packages/spin-network/src/edge/edgeStateVector.ts
   import { StateVector } from '@spin-network/quantum';
   import { GraphEdge } from '@spin-network/graph-core';
   
   export class EdgeStateVector implements QuantumEdgeState {
     // Implementation that maps quantum states to graph edges
   }
   ```

4. **Implement intertwiner node representations** that combine graph nodes with tensor representations

5. **Create the graph state composer** to integrate edge states and node intertwiners

### 3.5 Phase 5: Testing and Documentation

1. **Create unit tests** for each package
2. **Develop integration tests** that verify cross-package functionality
3. **Write comprehensive documentation** including:
   - API references
   - Usage examples
   - Migration guides

## 4. Quantum Package Implementation

### 4.1 Structure Reorganization

The existing lib/quantum code will be reorganized into a cleaner structure:

```
packages/quantum/src/
├── core/
│   ├── types.ts       (Core quantum types)
│   └── complex.ts     (Complex number operations)
├── states/
│   ├── stateVector.ts (State vector implementation)
│   ├── basis.ts       (Basis transformations)
│   └── composite.ts   (Composite systems)
├── operators/
│   ├── operator.ts    (Base operator implementation)
│   ├── unitary.ts     (Unitary operators)
│   ├── hermitian.ts   (Hermitian operators)
│   └── measurement.ts (Measurement operations)
├── utils/
│   ├── math.ts        (Math utilities)
│   └── random.ts      (Quantum random utilities)
└── index.ts           (Public exports)
```

### 4.2 Clean API Design

The quantum package will expose a clean, well-documented API:

```typescript
// Example of clean exports in packages/quantum/src/index.ts
export { StateVector, OperatorType, Complex } from './core/types';
export { createStateVector, normalize, innerProduct } from './states/stateVector';
export { createOperator, applyOperator } from './operators/operator';
export { measure, probability } from './operators/measurement';
```

### 4.3 Backward Compatibility

We'll ensure the migration doesn't break existing code by:

1. Maintaining the same API surface in the new package
2. Creating a compatibility layer if needed
3. Providing detailed migration guides

## 5. Graph-Quantum Integration Strategy

### 5.1 Bridging Abstract Graphs with Quantum States

1. **Edge States**: Quantum states attached to graph edges
   ```typescript
   // Example edge state attachment
   const edgeState = new EdgeStateVector(edge.id, spin, dimensions);
   edgeState.setState(0, { re: 0.7071, im: 0 });
   edgeState.setState(1, { re: 0.7071, im: 0 });
   ```

2. **Node Intertwiners**: Tensor representations at graph nodes
   ```typescript
   // Example intertwiner creation
   const intertwiner = new IntertwinerTensor(
     node.id,
     edgeSpins,
     intertwinerIndex
   );
   ```

3. **Composition**: Building full graph states
   ```typescript
   // Example composition
   const graphState = GraphStateComposer.compose(
     graph,
     edgeStates,
     nodeTensors
   );
   ```

### 5.2 Specialized Graph Types

The interface system supports multiple specialized graph types:

1. **Spin Networks**:
   ```typescript
   type SpinNodeType = 'intertwiner' | 'boundary';
   type SpinEdgeType = 'quantum' | 'classical';

   interface ISpinNetwork extends ITypedGraph<SpinNodeType, SpinEdgeType>, ISimplicialGraph {
     // Spin network specific operations
     computeSpinFoam(): ISpinNetwork;
     evaluateAmplitude(): Complex;
   }
   ```

2. **Quantum Circuits**:
   ```typescript
   type CircuitNodeType = 'input' | 'gate' | 'measurement';
   type CircuitEdgeType = 'qubit' | 'classical';

   interface IQuantumCircuit extends ITypedGraph<CircuitNodeType, CircuitEdgeType>, IOrderedGraph {
     // Circuit specific operations
     addGate(gate: IQuantumGate): IQuantumCircuit;
     simulate(): StateVector;
   }
   ```

3. **ZX Diagrams**:
   ```typescript
   type ZXNodeType = 'Z' | 'X' | 'H';
   type ZXEdgeType = 'simple' | 'hadamard';

   interface IZXDiagram extends ITypedGraph<ZXNodeType, ZXEdgeType>, IRewriteableGraph {
     // ZX-calculus specific operations
     simplify(): IZXDiagram;
     toCircuit(): IQuantumCircuit;
   }
   ```

### 5.3 Common Operations

The integrated system will support operations like:

1. **State Evolution**: Apply operators to graph quantum states
2. **Measurement**: Measure quantum properties of the graph
3. **Entropy Calculations**: Compute entanglement entropy between graph regions
4. **Diffusion**: Implement quantum walk algorithms on the graph

## 6. Migration Strategy

### 6.1 Parallel Development

1. Create new packages alongside existing lib/ code
2. Develop and test packages independently
3. Create integration tests between packages

### 6.2 Gradual Transition

1. First, build and test the quantum package
2. Next, develop graph-core and tensor-core
3. Finally, implement spin-network integration
4. Deprecate old code only after new code is fully tested

### 6.3 Application Integration

1. Update imports in main application gradually
2. Create adapter layers where needed
3. Validate functionality after each change
4. Remove old code when no longer referenced

## 7. Potential Challenges and Solutions

### 7.1 Package Interdependencies

**Challenge**: Managing dependencies between packages during development.
**Solution**: Use workspace features of pnpm for local package linking.

### 7.2 API Consistency

**Challenge**: Ensuring consistent API design across packages.
**Solution**: Create shared conventions and interface patterns.

### 7.3 Testing Complexity

**Challenge**: Testing quantum graph compositions is complex.
**Solution**: Build comprehensive test fixtures and validation utilities.

### 7.4 Backward Compatibility

**Challenge**: Ensuring existing code continues to work during migration.
**Solution**: Create compatibility layers and extensive testing.

### 7.5 Library Integration Challenges

**Challenge**: Integrating external graph libraries with quantum-specific features.
**Solution**: Create appropriate adapter layers and thoroughly test integrations.

Key considerations for library integration:
1. Ensure consistent immutability patterns across the codebase
2. Maintain efficient matrix operations with math.js
3. Preserve the ability to attach quantum states to graph elements
4. Support graph composition for building complex quantum networks
5. Ensure type safety and comprehensive TypeScript support

## 8. Next Steps

1. Create the quantum package structure in packages/
2. Refactor and migrate lib/quantum code to the new structure
3. Develop comprehensive tests for the quantum package
4. Begin implementing graph-core package:
   - First implement T64a with evaluation of graph library options
   - If using Graphology, focus on creating adapters for math.js and quantum state integration
   - If custom implementation, refactor current SpinNetworkGraph with improved abstractions

## 9. Conclusion

This plan provides a comprehensive approach to restructuring the library into a proper monorepo structure with consistent package organization. By moving all library code to packages/, we gain better dependency management, clearer boundaries between components, and a more maintainable codebase. The proposed structure allows for independent development and testing of each component, with a clear path for gradually migrating from the current implementation to the new one.

The end result will be a clean, modular system that properly separates abstract graph structures from quantum-specific functionality, while enabling their seamless integration through well-defined interfaces.
