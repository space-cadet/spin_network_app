# Spin Network Quantum Library and Visualization App - System Patterns

## Architecture Overview

The system follows a dual architecture approach with a standalone quantum library and a visualization application:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    Spin Network System                          │
│                                                                 │
├─────────────────────────────┐   ┌─────────────────────────────┐ │
│                             │   │                             │ │
│    Quantum Library          │   │    Visualization App        │ │
│    ┌───────────────────┐    │   │    ┌───────────────────┐    │ │
│    │  Core             │    │   │    │  App State        │    │ │
│    │  ┌─────────────┐  │    │   │    │  (Redux)          │    │ │
│    │  │ Types       │  │    │   │    └───────────────────┘    │ │
│    │  │ Math Adapter│  │    │   │              │               │ │
│    │  │ Validation  │  │    │   │              ▼               │ │
│    │  └─────────────┘  │    │   │    ┌───────────────────┐    │ │
│    │                   │    │   │    │                   │    │ │
│    │  ┌─────────────┐  │    │   │    │  Components       │    │ │
│    │  │ Quantum     │◄─┼────┼───┼────┤                   │    │ │
│    │  │ Matrix      │  │    │   │    │                   │    │ │
│    │  │ State Vector│  │    │   │    │                   │    │ │
│    │  └─────────────┘  │    │   │    └───────────────────┘    │ │
│    │                   │    │   │              │               │ │
│    │  ┌─────────────┐  │    │   │              ▼               │ │
│    │  │ Graph       │◄─┼────┼───┼────┐ ┌───────────────────┐  │ │
│    │  │ Tensor      │  │    │   │    │ │  Visualization    │  │ │
│    │  │ Circuit     │  │    │   │    └─►  Components       │  │ │
│    │  └─────────────┘  │    │   │      └───────────────────┘  │ │
│    └───────────────────┘    │   │                             │ │
│                             │   │                             │ │
└─────────────────────────────┘   └─────────────────────────────┘ │
                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The application component architecture follows a component-based approach with clear separation of concerns:

```
                  ┌─────────────────┐
                  │    App State    │
                  │    (Redux)      │
                  └─────────────────┘
                          │
                          ▼
┌─────────────┐   ┌─────────────────┐   ┌─────────────┐
│  Network    │   │                 │   │ Simulation  │
│  Creation   │◄──┤  Main App       ├──►│ Control     │
│  Components │   │  Container      │   │ Components  │
└─────────────┘   └─────────────────┘   └─────────────┘
                          │
                          ▼
                  ┌─────────────────┐
                  │  Visualization  │
                  │  Components     │
                  └─────────────────┘
```

## Key Design Patterns

### 1. Component Composition

The UI is built using a composition of smaller, focused components:

- **Container Components**: Manage state and data flow
- **Presentational Components**: Handle rendering and user interaction
- **Layout Components**: Manage application structure and resizable panels
- **Interactive Controls**: Handle user input and provide feedback
- **Type Management Components**: Handle creation and customization of node and edge types

This approach promotes reusability and simplifies testing and maintenance.

### 2. Command History Pattern

The application implements the Command History pattern for undo/redo functionality:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Command     │    │ Command     │    │ Current     │
│ History     │    │ Execution   │    │ State       │
└─────────────┘    └─────────────┘    └─────────────┘
      ▲ ▼                ▲                   │
      │                  │                   │
      │                  │                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Undo/Redo   │◄───┤ Redux       │◄───┤ User        │
│ Controls    │    │ Actions     │    │ Interaction │
└─────────────┘    └─────────────┘    └─────────────┘
```

This pattern:
- Tracks all network-modifying operations
- Maintains a history stack with current index
- Allows reverting to previous states (undo)
- Allows reapplying reverted operations (redo)
- Optimizes by storing only needed state changes

### 3. Resizable and Hideable Panel Pattern

A key architectural pattern is the resizable and hideable panel system:

```
┌─────────────────────────────────────────────────────┐
│ MainLayout                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Header                                          │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌───────────┐ ┌───────────────────┐ ┌───────────┐ │
│ │ ◀ Toggle  │ │                   │ │  Toggle ▶ │ │
│ │           │ │                   │ │           │ │
│ │  Left     │ │     Main          │ │  Right    │ │
│ │  Sidebar  │ │     Content       │ │  Sidebar  │ │
│ │  Panel    │ │     Panel         │ │  Panel    │ │
│ │           │ │                   │ │           │ │
│ │  Resize   │ │                   │ │  Resize   │ │
│ │  Handle ▶ │ ├───────────────────┤ │ ◀ Handle  │ │
│ │           │ │  Bottom Panel     │ │           │ │
│ └───────────┘ └───────────────────┘ └───────────┘ │
│                    ▲ Toggle                        │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Footer                                          │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

- Each panel can be resized by the user with resize handles
- Panels can be hidden/shown with toggle buttons
- Panels communicate size changes to maintain a responsive layout
- Content within panels adapts to available space
- Panel visibility state is persisted between sessions

### 3. State Management

The application uses a centralized state management approach:

- **Global State**: Application-wide state managed by Redux
- **Component State**: Local state for UI-specific concerns
- **Derived State**: Calculated from the global state for visualization
- **Persistent State**: State preserved between sessions using Redux Persist
- **History State**: Tracks operations for undo/redo functionality

#### History Tracking Pattern

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ User Action  │───►│ Store Action │───►│ State Update │
└──────────────┘    └──────────────┘    └──────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐    ┌──────────────┐
                    │ Add to       │◄───┤ Persist to   │
                    │ History Stack│    │ Storage      │
                    └──────────────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Update Undo/ │
                    │ Redo State   │
                    └──────────────┘
```

### 4. Test Suite Pattern

The consolidated test suite follows a standardized pattern:

```
┌─────────────────────────────────────┐
│            Test Suite               │
├─────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────┐ │
│ │   Config    │ │    Results      │ │
│ │   Panel     │ │    Panel        │ │
│ └─────────────┘ └─────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │         Console Output          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

Key components:
- Configuration Panel for test setup
- Results Panel for test outputs
- Console Output for detailed logging
- State persistence for configurations
- Reusable test infrastructure

### 5. Event-Driven Interaction

User interactions follow an event-driven pattern:

1. User initiates action (e.g., selecting a node)
2. Component generates event
3. Event handlers update state
4. State changes are tracked in history (for undo/redo)
5. UI re-renders to reflect changes
6. Changes are persisted to storage

#### Sidebar Visibility Pattern

```
┌──────────────────────────────────────────────────────┐
│ MainLayout                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Header                                          │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────┐ ┌───────────────────┐ ┌─────────┐      │
│ │         │ │                   │ │         │      │
│ │ Toggle  │ │                   │ │ Toggle  │      │
│ │ Button◄─┼─┤     Main          ├─┼─►Button │      │
│ │         │ │     Content       │ │         │      │
│ │         │ │     Panel         │ │         │      │
│ │         │ │                   │ │         │      │
│ │         │ │                   │ │         │      │
│ │         │ ├───────────────────┤ │         │      │
│ │         │ │  Toggle Button    │ │         │      │
│ └─────────┘ └───────────────────┘ └─────────┘      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Footer                                          │ │
│ └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

This pattern allows users to toggle the visibility of panels to maximize workspace area.

### 5. Quantum-Enhanced Graph Data Structure

Spin networks are represented using an enhanced graph data structure with quantum state integration:

```typescript
// Core graph interfaces
interface AbstractNode<T> {
  id: string;
  data: T;
  position?: { x: number, y: number };
  type?: string;
  properties: Record<string, any>;
}

interface AbstractEdge<T> {
  id: string;
  source: string;
  target: string;
  data: T;
  type?: string;
  properties: Record<string, any>;
}

// Quantum-specific implementations
interface IntertwinerNode extends AbstractNode<TensorData> {
  intertwiner: number | null;
  hilbertSpace: HilbertSpace;
  tensorIndex: number[];
}

interface SpinEdge extends AbstractEdge<StateVectorData> {
  spin: number;
  stateVector: StateVector;
  dimension: number;
}

interface SpinNetwork<N extends AbstractNode<any>, E extends AbstractEdge<any>> {
  nodes: N[];
  edges: E[];
  metadata: {
    quantum: boolean;
    conservationLaws: string[];
    simulationType: string;
    /* additional metadata */
  };
  getStateVector(): ComplexMatrix;
  getHamiltonian(): ComplexMatrix;
  evolve(time: number): void;
}
```

This enhanced structure integrates quantum states and operations with the graph structure:
- AbstractNode and AbstractEdge provide generic graph capabilities
- IntertwinerNode adds tensor data and Hilbert space properties
- SpinEdge includes quantum state information
- SpinNetwork includes quantum simulation methods

The structure is optimized for both visualization with Cytoscape.js and quantum simulations. The type field allows for dynamic styling based on node and edge types defined in the Type Management system.

## Component Relationships

### Quantum Library Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Quantum      │───►│ Matrix       │───►│ Operator     │
│ Types        │    │ Operations   │    │ Framework    │
└──────────────┘    └──────────────┘    └──────────────┘
       │                  │                    │
       │                  │                    │
       ▼                  ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ State        │◄───┤ Measurement  │◄───┤ Quantum      │
│ Vectors      │    │ System       │    │ Gates        │
└──────────────┘    └──────────────┘    └──────────────┘
       │                  │                    │
       │                  │                    │
       ▼                  ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Hamiltonian  │───►│ Time         │───►│ Simulation   │
│ Systems      │    │ Evolution    │    │ Results      │
└──────────────┘    └──────────────┘    └──────────────┘
```

The quantum library follows a layered architecture with core mathematical operations building up to higher-level quantum concepts and simulations.

### Graph-Quantum Integration Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Abstract     │───►│ Quantum      │───►│ Spin Network │
│ Graph        │    │ State Vector │    │ Graph        │
└──────────────┘    └──────────────┘    └──────────────┘
       │                  │                    │
       │                  │                    │
       ▼                  ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Graph        │◄───┤ Intertwiner  │◄───┤ Edge State   │
│ Algorithms   │    │ Tensor       │    │ Vector       │
└──────────────┘    └──────────────┘    └──────────────┘
       │                  │                    │
       │                  │                    │
       ▼                  ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Graph State  │───►│ Quantum      │───►│ Simulation   │
│ Composer     │    │ Evolution    │    │ Results      │
└──────────────┘    └──────────────┘    └──────────────┘
```

The Graph-Quantum integration combines abstract graph theory with quantum mechanical operations to create a unified system for quantum graph state simulations.

### Network Visualization Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Network Data │───►│ Cytoscape.js │───►│ Rendered     │
│ Model        │    │ Adapter      │    │ Network      │
└──────────────┘    └──────────────┘    └──────────────┘
       ▲                  ▲                    │
       │                  │                    │
       │                  │                    │
       │            ┌──────────────┐           │
       │            │ Type         │           │
       │            │ Registry     │           │
       │            └──────────────┘           │
       │                                       │
       └───────────────────────────────────────┘
                  User Interaction
```

The Type Registry provides styling information to the Cytoscape.js Adapter, which applies the appropriate visual properties to each node and edge based on its assigned type.

### Quantum Simulation Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Quantum      │───►│ Hamiltonian  │───►│ Time         │
│ State        │    │ Generation   │    │ Evolution    │
└──────────────┘    └──────────────┘    └──────────────┘
       ▲                                       │
       │                                       │
       │                                       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Initial      │    │ Visualization│◄───┤ Evolved      │
│ Conditions   │    │ Components   │    │ State        │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Technical Constraints and Decisions

1. **Browser Compatibility**: The application targets modern browsers with WebGL support for optimal visualization performance.

2. **Performance Considerations**:
   - Network size is limited by browser rendering capabilities
   - Heavy calculations are optimized or offloaded to Web Workers when possible
   - Visualization updates are throttled for large networks

3. **Accessibility**:
   - Resizable panels improve usability across different screen sizes
   - Keyboard navigation for core functionality
   - Color schemes consider color blindness

4. **Synchronization**:
   - UI updates are synchronized with simulation steps
   - Visualization components respond to window/panel resize events

## Proposed 3D Visualization Architecture

For visualizing non-planar graphs, a 3D network viewer is being considered with the following architectural approach:

```
┌─────────────────────┐
│                     │
│   NetworkViewer     │
│   (Container)       │
│                     │
└─────────────┬───────┘
              │
              ▼
┌─────────────┴───────┐
│                     │
│   ViewerSelector    │
│                     │
└─┬───────────────────┘
  │
  ├─────────────┬─────────────┐
  │             │             │
  ▼             ▼             ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│         │ │         │ │         │
│ 2D View │ │ 3D View │ │ 2.5D    │
│         │ │         │ │ View    │
│         │ │         │ │         │
└─────────┘ └─────────┘ └─────────┘
```

### Technology Options

The 3D visualization would extend the current architecture with:

1. **Core Rendering Library**:
   - Three.js for full 3D WebGL rendering capabilities
   - react-three-fiber for React integration
   - drei for common 3D controls and helpers

2. **Data Adaptation Pattern**:
   - Adapter between network data model and 3D visualization
   - Consistent mapping of network properties to visual elements
   - Synchronization between 2D and 3D representations

3. **Layout Algorithms**:
   - 3D force-directed layouts for non-planar graphs
   - 3D hierarchical layouts for structured networks
   - Spherical layouts for certain network types

4. **User Interaction Model**:
   - Orbit controls for network rotation and exploration
   - 3D selection and manipulation capabilities
   - Consistent operation between 2D and 3D modes

### State Management Extension

The Redux state would be extended with:

```typescript
interface ViewState {
  viewMode: '2d' | '3d' | '2.5d';
  camera3D: {
    position: { x: number, y: number, z: number };
    target: { x: number, y: number, z: number };
    zoom: number;
  };
  layout3D: {
    algorithm: '3d-force' | '3d-hierarchical' | 'spherical';
    settings: Record<string, any>;
  };
}
```

### Visualization Component Structure

The 3D visualization would follow this component structure:

```
┌─────────────────────────┐
│ ThreeNetworkViewer      │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Scene               │ │
│ │ ┌─────────────────┐ │ │
│ │ │ Camera Controls │ │ │
│ │ └─────────────────┘ │ │
│ │ ┌─────────────────┐ │ │
│ │ │ Nodes           │ │ │
│ │ └─────────────────┘ │ │
│ │ ┌─────────────────┐ │ │
│ │ │ Edges           │ │ │
│ │ └─────────────────┘ │ │
│ │ ┌─────────────────┐ │ │
│ │ │ Visual Helpers  │ │ │
│ │ └─────────────────┘ │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## Library Architecture

### Quantum Library Architecture

### Namespace Organization

The standalone library is organized into modular namespaces with clear separation of concerns:

```
SpinNetwork
├── core/           # Core types and implementations
│   ├── Complex number operations
│   ├── Tensor node operations
│   ├── State vector operations
│   ├── Math adapter
│   └── Intertwiner space utilities
│
├── quantum/        # Quantum mechanical operations
│   ├── Matrix operations
│   │   ├── Eigendecomposition
│   │   ├── Matrix functions (log, sqrt, exp)
│   │   └── Unitary validation
│   ├── State vectors
│   │   ├── State creation and manipulation
│   │   ├── Measurement operations
│   │   └── Entanglement measures
│   ├── Operators
│   │   ├── Operator algebra
│   │   ├── Commutator operations
│   │   └── Quantum gates
│   ├── Density matrices
│   │   ├── Pure to mixed conversions
│   │   ├── Partial trace operations
│   │   └── Quantum channels
│   ├── Hamiltonian
│   │   ├── Spin systems
│   │   ├── Heisenberg models
│   │   └── Time evolution
│   ├── Circuits (in progress)
│   │   ├── Gate operations
│   │   ├── Measurements
│   │   └── Circuit composition
│   └── Examples
│       ├── Basic quantum operations
│       ├── Hamiltonian dynamics
│       ├── Quantum information
│       └── Algorithms
│
├── graph/          # Graph structure operations
│   ├── Abstract graph implementations
│   ├── Node and edge operations
│   ├── Graph algorithms
│   └── Quantum-graph integration
│
├── tensor/         # Tensor operations
│   ├── Core tensor structures
│   ├── Contraction operations
│   ├── Tensor networks
│   └── Integration with quantum
│
├── analysis/       # Analysis tools
│   ├── Geometric properties
│   ├── Conservation laws
│   └── Statistical analysis
│
├── models/         # Simulation models
│   ├── Diffusion models
│   ├── Weight functions
│   └── Numerical solvers
│
├── io/             # Input/Output functionality
│   ├── Export functions
│   ├── Import functions
│   └── Storage adapters
│
├── utils/          # Utility functions
│   ├── Validation utilities
│   ├── Type checking
│   ├── Math utilities
│   └── Error handling
│
├── templates/      # Graph templates
└── adapters/       # Visualization adapters
```

### Template Architecture Pattern
*Added: May 6, 2025*

The application's UI architecture is being extracted into a reusable template system:

```
┌─────────────────────────────────────────────┐
│              template-core                   │
├─────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│ │  Layout     │ │   Panel     │ │ Common │ │
│ │ Components  │ │  System     │ │  Utils │ │
│ └─────────────┘ └─────────────┘ └────────┘ │
└─────────────────────────────────────────────┘
                    ▲
                    │
┌─────────────────────────────────────────────┐
│              template-base                   │
├─────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│ │   Base      │ │    Base     │ │  Base  │ │
│ │    App      │ │   Panels    │ │ Config │ │
│ └─────────────┘ └─────────────┘ └────────┘ │
└─────────────────────────────────────────────┘
                    ▲
                    │
┌─────────────────────────────────────────────┐
│            simulation-app                    │
├─────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│ │ Simulation  │ │ Simulation  │ │  Sim   │ │
│ │    App      │ │   Panels    │ │ Config │ │
│ └─────────────┘ └─────────────┘ └────────┘ │
└─────────────────────────────────────────────┘
```

Key components:
- Core layout and panel system
- Base implementation components
- Configuration interfaces
- State management
- Theme support

### Global Access Pattern

The library supports both module imports and global browser access:

1. **Module Environment**:
   ```typescript
   import { createSimulationEngine } from 'spin-network';
   import * as quantum from 'spin-network/quantum';
   ```

2. **Browser Environment**:
   ```javascript
   const engine = window.SpinNetwork.createSimulationEngine();
   const tensor = window.SpinNetwork.quantum.createTensor([2, 2]);
   ```

### Factory Functions

Core functionality is exposed through global factory functions:
- `createSimulationEngine()`: Creates new simulation engine
- `createGraph()`: Creates new spin network graph
- `createStateVector()`: Creates new state vector

### Analysis Object

Common analysis functions are provided through a convenience object:
- `Analysis.calculateTotalVolume()`
- `Analysis.calculateTotalArea()`
- `Analysis.calculateEffectiveDimension()`
- `Analysis.calculateVolumeEntropy()`

## Quantum Design Patterns

### 1. Hybrid Functional/OOP Pattern

The quantum library follows a hybrid approach combining functional programming patterns with object-oriented interfaces:

```typescript
// Pure functional core (circuitOps.ts)
export function applyGate(state: StateVector, gate: QuantumGate, targetQubit: number): StateVector {
  // Pure functional implementation with no side effects
  const matrix = constructGateMatrix(gate, targetQubit, state.size());
  return multiplyStateVector(state, matrix);
}

// Stateful wrapper class (Circuit.ts)
export class QuantumCircuit {
  private state: StateVector;
  private operations: CircuitOperation[];
  
  constructor(qubits: number) {
    this.state = createZeroState(qubits);
    this.operations = [];
  }
  
  // Method using functional core
  applyGate(gate: QuantumGate, targetQubit: number): this {
    this.state = applyGate(this.state, gate, targetQubit);
    this.operations.push({ type: 'gate', gate, target: targetQubit });
    return this;
  }
  
  // Chainable interface
  hadamard(qubit: number): this {
    return this.applyGate(GATES.hadamard, qubit);
  }
  
  // Additional methods...
}
```

This pattern provides both pure functional operations and a convenient object-oriented interface, combining the benefits of both paradigms:
- Pure functions are testable, composable, and free of side effects
- OOP wrappers provide chainable APIs and intuitive interfaces
- Core functionality can be used directly or through the wrapper

### 2. Math.js Complex Integration Pattern

The library uses direct math.js integration for complex number operations:

```typescript
import { Complex, complex, multiply, add, subtract, divide } from 'mathjs';

// Create complex numbers using math.js
const a = complex(1, 2); // 1 + 2i
const b = complex(3, 4); // 3 + 4i

// Perform operations using math.js functions
const product = multiply(a, b);
const sum = add(a, b);
const difference = subtract(a, b);
const quotient = divide(a, b);

// Convert to array representation when needed
function toComplexArray(matrix: Matrix): Complex[][] {
  // Implementation...
}
```

This approach leverages the robust math.js library for complex arithmetic while ensuring type safety through TypeScript interfaces. Direct integration eliminates the need for custom complex number implementations and improves consistency.

### 3. Quantum-Graph Integration Pattern

The library implements a unique pattern for integrating quantum states with graph structures:

```typescript
// Abstract graph interface
interface Graph<N, E> {
  addNode(id: string, data: N): void;
  addEdge(id: string, source: string, target: string, data: E): void;
  getNode(id: string): N | undefined;
  getEdge(id: string): E | undefined;
  // Additional methods...
}

// Quantum state on graph implementation
class QuantumGraphState<N extends TensorData, E extends StateVectorData> {
  private graph: Graph<N, E>;
  
  constructor(graph: Graph<N, E>) {
    this.graph = graph;
  }
  
  // Compose full state vector from graph elements
  getFullStateVector(): StateVector {
    // Implementation that composes state from nodes and edges
  }
  
  // Apply operation to specific node/edge
  applyNodeOperation(nodeId: string, operator: Operator): void {
    const node = this.graph.getNode(nodeId);
    if (node) {
      // Apply operator to node's quantum state
    }
  }
  
  // Additional methods...
}
```

This pattern enables quantum operations on graph structures while maintaining the separation of concerns between graph algorithms and quantum mechanics.

### 4. Factory Function Pattern

Core objects are created through factory functions rather than direct constructors:

```typescript
// Factory function for creating state vectors
export function createStateVector(dimension: number, initialValues?: Complex[]): StateVector {
  // Implementation...
  return new StateVectorImpl(dimension, initialValues);
}

// Factory function for creating operators
export function createOperator(matrix: ComplexMatrix): Operator {
  // Validation and normalization
  validateHermitian(matrix);
  return new OperatorImpl(matrix);
}

// Factory function for creating Hamiltonians
export function createHeisenbergHamiltonian(spins: number, 
                                          coupling: number = 1.0, 
                                          field: number = 0.0): Hamiltonian {
  // Implementation...
  return new HeisenbergHamiltonianImpl(spins, coupling, field);
}
```

Factory functions provide several advantages:
- Input validation and error handling
- Default parameters and configuration
- Encapsulation of implementation details
- Simpler API for common use cases
- Consistent creation patterns across the library

### 5. Eigendecomposition Pattern

The library uses a robust pattern for handling matrix eigendecomposition:

```typescript
interface EigenResult {
  values: Complex[];        // Eigenvalues
  vectors?: ComplexMatrix;  // Optional eigenvectors
  isHermitian: boolean;     // Flag indicating if matrix is Hermitian
}

// Eigendecomposition with options
function eigendecompose(matrix: ComplexMatrix, options: {
  computeVectors?: boolean;  // Whether to compute eigenvectors (default: true)
  enforceOrthogonality?: boolean;  // Whether to enforce orthogonality (default: false)
  numericalTolerance?: number;  // Tolerance for numerical errors (default: 1e-10)
} = {}): EigenResult {
  // Validate input
  if (!isMatrix(matrix)) {
    throw new Error('Input must be a valid matrix');
  }
  
  // Determine if matrix is Hermitian
  const isHermitian = checkHermitian(matrix);
  
  // Use math.js for eigendecomposition
  try {
    const result = math.eigs(matrix);
    
    // Extract eigenvalues
    const values = result.values.toArray();
    
    // Compute eigenvectors if requested
    let vectors;
    if (options.computeVectors !== false) {
      vectors = result.vectors;
      
      // Enforce orthogonality if requested
      if (options.enforceOrthogonality && vectors) {
        vectors = orthogonalize(vectors, options.numericalTolerance);
      }
    }
    
    return { values, vectors, isHermitian };
  } catch (error) {
    throw new Error(`Eigendecomposition failed: ${error.message}`);
  }
}
```

This pattern provides robust handling of eigendecomposition with:
- Optional eigenvector computation
- Orthogonality enforcement options
- Numerical tolerance configuration
- Hermitian property detection
- Comprehensive error handling

### 6. Validation Function Pattern

The library implements a consistent pattern for validation functions:

```typescript
// Validation function naming convention uses abbreviated forms
export function validateMatDims(matrix: ComplexMatrix, rows: number, cols: number): void {
  const dims = math.size(matrix).valueOf();
  if (dims[0] !== rows || dims[1] !== cols) {
    throw new Error(`Matrix dimensions must be ${rows}x${cols}, got ${dims[0]}x${dims[1]}`);
  }
}

export function validatePosDim(dimension: number): void {
  if (!Number.isInteger(dimension) || dimension <= 0) {
    throw new Error(`Dimension must be a positive integer, got ${dimension}`);
  }
}

export function validateUnitarity(matrix: ComplexMatrix, tolerance: number = 1e-10): void {
  const dims = math.size(matrix).valueOf();
  if (dims[0] !== dims[1]) {
    throw new Error('Matrix must be square for unitarity check');
  }
  
  // U†U = I check
  const adjoint = math.ctranspose(matrix);
  const product = math.multiply(adjoint, matrix);
  const identity = math.identity(dims[0]);
  
  if (!isApproximatelyEqual(product, identity, tolerance)) {
    throw new Error('Matrix is not unitary');
  }
}
```

This pattern follows these principles:
- Abbreviated function names for clarity and conciseness
- Early validation and meaningful error messages
- Default parameters for tolerances
- Consistent parameter ordering
- Pure functions with no side effects
