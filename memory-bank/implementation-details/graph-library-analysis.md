# Graph Library Analysis Document

This document contains the detailed analysis of JavaScript/TypeScript graph libraries considered for the graph-core package implementation.

[All the library comparison content from T64a.md will go here]

## Objectives

1. Create a standalone graph library with high performance and flexibility
2. Support both directed and undirected graphs with customizable properties
3. Implement core graph algorithms for traversal, search, and analysis
4. Enable straightforward integration with quantum state components
5. Provide excellent TypeScript typing and documentation

## Task Breakdown

  - ✅ Created basic package structure
  - ✅ Added package.json with dependencies
  - ✅ Created placeholder type definitions
  - ✅ Set up basic exports

- 🔄 Test Application Setup (graph-test-app)
  - ✅ Created basic package structure
  - ✅ Set up configuration files (tsconfig.json, vite.config.ts)
  - ✅ Added required dependencies
  - ✅ Created basic application structure
  - ✅ Set up routing configuration
  - ⬜ Implementation of panel components not started
  - ⬜ Backend selection UI not implemented
  - ⬜ Graph visualization not started
  - ⬜ Graph operation functionality not implemented
  - ⬜ Performance monitoring not implemented
  - ⬜ Library evaluation not started

- ⬜ Evaluation Tasks
  - ⬜ Implement and test Graphology adapter
  - ⬜ Implement and test Cytoscape.js adapter
  - ⬜ Perform performance benchmarks
  - ⬜ Compare API usability
  - ⬜ Document findings
  - ⬜ Make implementation decision


### Phase 5: Testing and Documentation
- ⬜ Implement comprehensive unit tests
- ⬜ Create performance benchmarks for large graphs
- ⬜ Generate API documentation with TSDoc
- ⬜ Create usage examples for common operations
- ⬜ Write integration tests with the quantum package

## Design Decisions

### Interface Hierarchy
We will implement a comprehensive interface hierarchy to support multiple use cases:

1. **Base Interfaces**
   - `IGraphElement`: Common base for all graph elements
   - `IGraphNode`: Base node interface with type support
   - `IGraphEdge`: Base edge interface with type support
   - `IPropertyMap`: Type-safe property storage

2. **Specialized Graph Interfaces**
   - `ITypedGraph<NodeType, EdgeType>`: Type-safe graph operations
   - `IOrderedGraph`: Support for ordered subgraphs (quantum circuits)
   - `ISimplicialGraph`: Support for faces and simplices (topology)
   - `IRewriteableGraph`: Pattern matching and rewrite rules

3. **Extended Structures**
   - `IFace`: 2D face representation
   - `ISimplex`: N-dimensional simplicial complex
   - `IOrderedSubgraph`: Ordered collections of elements
   - `IMatch`: Pattern matching results
   - `IRewritePattern`: Graph rewrite rules

This design supports:
- Spin networks through `ITypedGraph` and `ISimplicialGraph`
- Quantum circuits through `ITypedGraph` and `IOrderedGraph`
- ZX-calculus through `ITypedGraph` and `IRewriteableGraph`
- Pachner moves through `ISimplicialGraph` and `IRewriteableGraph`

### Implementation Strategy
- Use immutable interfaces throughout
- Support pattern matching and rewrite rules at the core
- Enable type-safe graph operations through generics
- Support higher-dimensional structures natively
- Allow composition of interfaces for specialized uses

### Algorithm Implementation
- Implement algorithms as standalone functions
- Use generator functions for lazy iteration
- Support early termination for search algorithms
- Enable custom comparators and visitor functions

## Required Files

### Core Interfaces
- `packages/graph-core/src/core/types.ts` - Base type definitions
- `packages/graph-core/src/core/interfaces/`
  - `IGraphElement.ts` - Base element interface
  - `IGraphNode.ts` - Node interface
  - `IGraphEdge.ts` - Edge interface
  - `IGraph.ts` - Core graph interface
  - `ITypedGraph.ts` - Type-safe graph interface
  - `IOrderedGraph.ts` - Ordered graph interface
  - `ISimplicialGraph.ts` - Simplicial complex interface
  - `IRewriteableGraph.ts` - Rewrite system interface

### Implementations
- `packages/graph-core/src/core/implementations/`
  - `BaseGraph.ts` - Abstract base implementation
  - `TypedGraph.ts` - Type-safe graph implementation
  - `OrderedGraph.ts` - Ordered graph implementation
  - `SimplicialGraph.ts` - Simplicial graph implementation
  - `RewriteableGraph.ts` - Rewriteable graph implementation

### Algorithms
- `packages/graph-core/src/algorithms/`
  - `traversal.ts` - Graph traversal algorithms
  - `paths.ts` - Path finding algorithms
  - `centrality.ts` - Centrality measures
  - `components.ts` - Component detection
  - `rewrite.ts` - Pattern matching and rewriting
  - `simplicial.ts` - Simplicial complex operations

### Utilities
- `packages/graph-core/src/utils/`
  - `matrix.ts` - Math.js integration
  - `serialization.ts` - Serialization utilities
  - `matching.ts` - Pattern matching utilities
  - `validation.ts` - Interface validation

### Tests
- `packages/graph-core/__tests__/`
  - `interfaces/` - Interface tests
  - `implementations/` - Implementation tests
  - `algorithms/` - Algorithm tests
  - `rewrite/` - Rewrite system tests

## Dependencies
- T64: Graph-Quantum Integration Restructuring (parent task)

## Graph Library Analysis

The following is a comprehensive comparison of JavaScript/TypeScript graph libraries that could potentially be used for this implementation:

### Comparison of JavaScript/TypeScript Graph Libraries

| Feature | Graphology | Cytoscape.js | ngraph.graph | NetworkX.js |
|---------|------------|--------------|--------------|-------------|
| **Core Features** |
| License | MIT | MIT | MIT | BSD |
| Latest Version | 0.26.0 (3 months ago) | 3.31.0 (Jan 2025) | 20.0.1 (3 years ago) | Varies |
| Weekly Downloads | ~410,000 | ~458,000 | ~25,000 | Lower |
| GitHub Stars | 1,287 | High | 521 | Lower |
| **Graph Types** |
| Directed Graphs | ✅ | ✅ | ✅ | ✅ |
| Undirected Graphs | ✅ | ✅ | ✅ | ✅ |
| Mixed Graphs | ✅ | ✅ | ❌ | ✅ |
| Multi-Graphs | ✅ | ✅ | ✅ | ✅ |
| Compound Graphs | ✅ | ✅ | ❌ | Limited |
| **TypeScript Support** |
| Native TypeScript | ✅ | ✅ (since 3.31.0) | ❌ | ❌ |
| Type Definitions | High Quality | Good | Community | Limited |
| **Performance** |
| Large Graph Handling | Good | Good | Excellent | Limited |
| Memory Efficiency | Good | Moderate | Excellent | Moderate |
| Speed | Good | Good | Excellent | Moderate |
| **Algorithm Support** |
| Shortest Path | ✅ | ✅ | ✅ | ✅ |
| Centrality Measures | ✅ | ✅ | Limited | ✅ |
| Community Detection | ✅ | ✅ | Limited | ✅ |
| Minimum Spanning Tree | ✅ | ✅ | ✅ | ✅ |
| Traversal Algorithms | ✅ | ✅ | ✅ | ✅ |
| **Integration** |
| Math.js Integration | Not Native | Not Native | Not Native | Not Native |
| Quantum Package Integration | Would Require Custom | Would Require Custom | Would Require Custom | Would Require Custom |
| **Additional Features** |
| Event System | ✅ | ✅ | ✅ | Limited |
| Serialization | ✅ (JSON) | ✅ (JSON) | ✅ (JSON) | ✅ (JSON) |
| Layout Algorithms | Via Sigma.js | Extensive | Via Extensions | Limited |
| **Customization & Extension** |
| Plugin/Extension System | ✅ | ✅ | Limited | Limited |
| Custom Node/Edge Types | ✅ | ✅ | Limited | Limited |
| **Documentation & Community** |
| Documentation Quality | Excellent | Excellent | Good | Moderate |
| Maintenance Status | Active | Very Active | Less Active | Varies |
| Community Support | Good | Excellent | Moderate | Moderate |

### Key Library Features

**Graphology**:
- Robust TypeScript support with high-quality type definitions
- Modular architecture with numerous extensions
- Support for various graph types (directed, undirected, mixed, multi)
- Good serialization capabilities
- Active development and maintenance
- Clean and modern API

**Cytoscape.js**:
- Used in our current React app components for visualization
- Strong documentation and extensive features
- Recently added native TypeScript support (v3.31.0)
- Well-maintained with good community support
- Primarily designed for visualization but includes robust graph algorithms

**ngraph.graph**:
- Extremely performant for large graphs
- Simple, focused API
- Excellent memory efficiency
- Part of a larger ecosystem of graph-related tools
- Less active development than other options

**Graph Types Definitions**:
- **Mixed Graphs**: Graphs containing both directed and undirected edges simultaneously
- **Compound Graphs**: Hierarchical graphs where nodes can contain other nodes (parent-child relationships)

## Implementation Considerations

When choosing whether to build a custom implementation or leverage an existing library, consider:

1. **Integration Requirements**:
   - All libraries would require custom adapters for our quantum package
   - Math.js integration would need to be implemented for any choice

2. **Development Time vs. Control**:
   - Using Graphology would significantly reduce development time
   - Custom implementation provides maximum control over internals
   - A hybrid approach (wrapping Graphology) balances both concerns

3. **Current Usage**:
   - Cytoscape.js is already used in our React components, but primarily for visualization
   - Our SpinNetworkGraph class has existing custom logic that might need to be preserved

4. **Long-term Maintenance**:
   - Libraries reduce maintenance burden for core graph algorithms
   - Custom code increases maintenance needs but provides more flexibility

## Implementation Approach

### Initial Prototype: Graph Testing Application

Before committing to a full implementation strategy, we'll first create a dedicated testing application to evaluate the different graph libraries. This approach will allow for direct comparison of Graphology and Cytoscape.js in terms of API usability, performance, and integration potential.

#### Graph Testing App Structure

The test application will be created as a separate package, with common interfaces defined in graph-core:

```
/packages/graph-core/
├── src/
    ├── core/
    │   ├── types.ts            # Common interfaces and types
    │   └── AbstractGraph.ts    # Interface definition for graphs

/packages/graph-test-app/
├── package.json            # Package configuration with both libraries as dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── src/
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Entry point
│   ├── components/         # App-specific components
│   │   ├── GraphCanvas.tsx     # Graph visualization component
│   │   ├── ControlPanel.tsx    # Left panel controls
│   │   └── InfoPanel.tsx       # Right panel information
│   ├── backends/           # Graph library implementations (for testing)
│   │   ├── graphology/     # Graphology implementation
│   │   └── cytoscape/      # Cytoscape implementation
│   └── utils/              # Utility functions
└── public/                 # Static assets
```

This hybrid approach:
1. Defines core interfaces in graph-core (where they ultimately belong)
2. Keeps implementation experiments in graph-test-app for flexibility
3. Provides a clear path for migrating the chosen implementation to graph-core after evaluation

This test app will reuse components from the template-core package to provide a consistent UI experience with the rest of the application.

#### Testing App Features

The app will include:

1. **Left Panel**: Controls for graph operations
   - Create node
   - Create edge
   - Remove node/edge
   - Graph algorithms (e.g., shortest path, centrality)
   - Choose between Graphology/Cytoscape backends

2. **Main Panel**: Graph visualization area
   - Interactive visualization of the graph
   - Click/drag to interact with nodes/edges

3. **Right Panel**: Properties and information
   - Selected node/edge properties
   - Graph statistics
   - Performance metrics for operations

4. **Bottom Panel**: Console/logs
   - View operation results
   - See timing information
   - Debug outputs

#### Implementation Strategy

Based on the testing results, we will then proceed with the full graph-core package implementation using the better-suited library, or a custom implementation if neither meets our needs. The graph-core package will then build upon these findings to create a robust, reusable graph structure package.

## Notes
This task implements the abstract graph component of the larger T64 Graph-Quantum Integration Restructuring project. The graph-core package provides the foundation for the new architectural approach by creating abstract graph structures that can later be extended with quantum-specific functionality in the spin-network package.

Rather than building everything from scratch, we should evaluate using Graphology or other existing graph libraries as the foundation. If we choose to use an existing library, we should focus on creating appropriate wrappers and extensions that integrate well with our quantum package.

Performance will be critical, especially for large graph operations that may be needed for complex quantum networks. We should benchmark different approaches before committing to a specific implementation strategy.

Our existing SpiNetworkGraph in lib/graph contains custom implementation that already integrates with math.js for matrix operations. If we choose to use a library, we need to ensure it can either replicate this functionality or provide additional benefits that justify the migration effort.
