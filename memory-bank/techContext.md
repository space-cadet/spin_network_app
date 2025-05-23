# Spin Network Visualization and Diffusion App - Technical Context

## Technology Stack

### Frontend Framework
- **React 18.2.0**: Component-based UI library
- **TypeScript 5.2.2**: Static typing for improved development experience
- **Vite 5.0.0**: Build tool for fast development and optimized production builds

### State Management
- **Redux Toolkit 1.9.7**: State management library
- **Redux Persist 6.0.0**: For state persistence across sessions
- **Localforage 1.10.0**: IndexedDB wrapper for improved storage capabilities
- **Custom History Tracking**: For undo/redo functionality

### Visualization Libraries
- **Cytoscape.js 3.26.0**: Core library for network visualization
- **D3.js 7.8.5**: For data visualization components (plots, charts)

### Mathematics and Simulation
- **Math.js 12.1.0**: Mathematical operations and matrix manipulations
- *(Planned)* **Numeric.js**: For numerical methods implementation

### UI Components and Styling
- **React Icons 4.12.0**: Icon components
- **Tailwind CSS 3.3.5**: Utility-first CSS framework
- **PostCSS 8.4.31**: CSS processing tool
- **Autoprefixer 10.4.16**: CSS vendor prefixing

### Development Tools
- **ESLint 8.53.0**: Code linting
- **Prettier 3.0.3**: Code formatting
- **pnpm 8.10.0**: Package manager (faster and more efficient than npm)

## Development Environment

- **Node.js**: v16 or newer
- **Package Manager**: pnpm v8 or newer
- **Build Commands**:
  - `pnpm dev`: Start development server
  - `pnpm build`: Build for production
  - `pnpm lint`: Run ESLint
  - `pnpm format`: Format code with Prettier

## Key Technical Components

### 1. Resizable Panel System

A custom implementation that allows users to resize UI panels:

```tsx
<ResizablePanel 
  direction="horizontal" 
  defaultSize={250} 
  minSize={200} 
  maxSize={400}
  handlePosition="end"
  className="border-r border-gray-200 bg-white overflow-y-auto"
>
  {/* Panel content */}
</ResizablePanel>
```

Key features:
- Supports both horizontal and vertical resizing
- Configurable min/max sizes
- Visual resize handles
- Maintains layout integrity during resize operations

### 2. Network Visualization

The core visualization is implemented using Cytoscape.js:

```tsx
const cyInstance = cytoscape({
  container: containerRef.current,
  elements: [...networkElements],
  style: [...networkStyles],
  layout: { name: 'grid' },
  userZoomingEnabled: true,
  userPanningEnabled: true,
  boxSelectionEnabled: true
});
```

Features:
- Interactive node/edge manipulation
- Zoom, pan, and selection capabilities
- Visual representation of network elements
- Event handling for user interactions

### 3. Simulation Controls

Interface for configuring and controlling diffusion simulations:

```tsx
<SimulationControls
  onStartSimulation={handleStartSimulation}
  parameters={{
    type: 'ordinary',
    alpha: 0.5,
    beta: 0.5,
    c: 1.0,
    timeStep: 0.01,
    totalTime: 10
  }}
/>
```

Supports:
- Different diffusion types (ordinary, finite-velocity)
- Parameter configuration
- Playback controls (start, pause, step, reset)

### 4. Data Visualization

Energy and simulation data visualization implemented using D3.js:

```tsx
<EnergyPlot 
  data={{
    time: [...timePoints],
    gravitational: [...gravEnergyValues],
    matter: [...matterEnergyValues],
    total: [...totalEnergyValues]
  }} 
/>
```

Features:
- Time series plotting
- Multiple data series visualization
- Interactive elements (tooltips, zoom)

## API Organization

### Standalone Library Structure

The library is organized into focused namespaces with clear responsibilities:

1. **Core Module** (`SpinNetwork.core`)
   - Complex number operations
   - Tensor node operations
   - State vector operations
   - Math adapter functions
   - Intertwiner space utilities

2. **Quantum Module** (`SpinNetwork.quantum`)
   - Tensor operations
   - State vector operations
   - Quantum operator functions

3. **Analysis Module** (`SpinNetwork.analysis`)
   - Geometric property calculations
   - Conservation law checking
   - Statistical analysis tools
   - Dimensionality analysis

4. **Models Module** (`SpinNetwork.models`)
   - Diffusion model implementations
   - Weight function factories
   - Numerical solver implementations

5. **IO Module** (`SpinNetwork.io`)
   - Export functions
   - Import functions
   - Storage adapters

### Dual Access Patterns

The library supports two primary access patterns:

1. **Module-based Access** (Node.js/bundlers):
   ```typescript
   import { createSimulationEngine } from 'spin-network';
   import * as quantum from 'spin-network/quantum';
   ```

2. **Browser Global Access**:
   ```javascript
   const engine = window.SpinNetwork.createSimulationEngine();
   const tensor = window.SpinNetwork.quantum.createTensor([2, 2]);
   ```

### Factory Function Pattern

Core objects are created through factory functions:
```typescript
const engine = createSimulationEngine();
const graph = createGraph();
const stateVector = createStateVector(nodeIds);
```

### Storage Adapter Pattern

The IO module uses an adapter pattern for storage:
```typescript
interface StorageAdapter {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

Implementations include:
- MemoryStorageAdapter
- LocalStorageAdapter
- IndexedDBAdapter
- BrowserFSAdapter
- NodeFSAdapter

## Technical Constraints

### Performance Considerations

1. **Rendering Performance**:
   - Large networks can impact rendering speed
   - Cytoscape.js optimization settings are crucial
   - Throttling updates for smooth user experience

2. **Calculation Efficiency**:
   - Diffusion simulations involve matrix operations that can be computationally intensive
   - Strategic use of web workers for heavy calculations
   - Optimized data structures for simulation state

3. **Storage Considerations**:
   - IndexedDB (via localforage) used for state persistence with improved storage limits
   - Large networks are stored efficiently using JSON serialization
   - File-based save/load implemented for explicit user control over network storage
   - Migration system in place for future state structure changes

### Proposed 3D Visualization Technologies

For the planned 3D network visualization capabilities, the following technologies are being considered:

1. **Three.js**:
   - WebGL-based 3D rendering library
   - Well-established with extensive documentation and community support
   - Provides comprehensive 3D capabilities including camera controls, materials, and lighting

2. **React Integration**:
   - **react-three-fiber**: React reconciler for Three.js
   - **drei**: Helper library with common Three.js components and controls
   - Enables declarative Three.js usage within React component structure

3. **Performance Optimization**:
   - Instanced rendering for nodes in large networks
   - Level-of-detail adjustments for complex visualizations
   - Throttled interaction during camera movement
   - WebWorkers for layout calculations

The proposed implementation would extend the current architecture while maintaining compatibility with existing network operations and state management.

### Browser Compatibility

- Target: Modern browsers with good WebGL support (Chrome, Firefox, Safari, Edge)
- Minimum specifications:
  - WebGL 1.0 support
  - ES6 compatibility
  - Modern CSS feature support
  - LocalStorage/IndexedDB support for persistence

### Responsive Design Challenges

- Maintaining usability on different screen sizes
- Handling resize events without performance degradation
- Preserving visualization quality when panels are resized
- Optimizing workspace with hideable panels
- Supporting keyboard shortcuts for important operations

## Template Architecture
*Added: May 6, 2025*

### Package Organization
The template system is organized into three main packages:

1. **template-core**:
   - Core layout components
   - Panel system
   - State management
   - Common utilities
   - TypeScript types and interfaces

2. **template-base**:
   - Base application components
   - Panel implementations
   - Configuration system
   - Theme support

3. **simulation-app**:
   - Domain-specific implementation
   - Custom panels and components
   - Configuration customization

### Architecture Features
- Modular package structure
- Type-safe interfaces
- Configurable layouts
- Theme customization
- State persistence
- Logging infrastructure

### Component Hierarchy
```typescript
// Base configuration interfaces
interface LayoutConfiguration {
  panels: {
    left?: PanelConfig;
    right?: PanelConfig;
    bottom?: PanelConfig;
  };
  workspace?: WorkspaceConfig;
}

// Panel configuration
interface PanelConfig {
  enabled: boolean;
  minSize?: number;
  maxSize?: number;
  defaultContent?: React.ReactNode;
}

// Component structure
const BaseApp: React.FC<BaseAppProps> = ({
  config,
  theme,
  panels,
  workspace
}) => {
  // Implementation
};
```

## Development Practices

1. **Component Organization**:
   ```
   src/
   ├── components/
   │   ├── common/         # Shared components like ResizablePanel
   │   ├── layouts/        # Layout components
   │   ├── panels/         # Panel components
   │   ├── simulation/     # Simulation-related components
   │   ├── tools/          # Tool components
   │   ├── visualization/  # Visualization components
   │   └── workspace/      # Workspace components
   ├── styles/             # Global styles
   └── ...
   ```

2. **Type Safety**:
   - Comprehensive type definitions for all components and data structures
   - Strict TypeScript configuration

3. **Code Quality**:
   - ESLint and Prettier for consistent code style
   - Component-focused architecture
   - Clear separation of concerns

4. **Future-Proofing**:
   - Modular design allows for easy replacement of visualization libraries
   - Abstraction layers between data models and visualization
   - Configuration-driven approach for extensibility

## Test Suite Architecture Updates

### Core Infrastructure
- Implemented modular test components with clean separation of concerns
- Added shared infrastructure for DOM manipulation, logging, and visualization
- Created flexible testing framework supporting both React and standalone contexts

### UI Organization
- Added collapsible panel system with CSS transitions for smooth animations
- Implemented state persistence for panel configurations
- Created responsive layouts adapting to content and window size
- Added support for panel state management and user preferences

### Test Capabilities
- Enhanced tensor testing capabilities:
  - 2-valent node normalization and unitarity tests
  - 3-valent node angular momentum and triangle inequality tests
  - 4-valent node recoupling consistency and closure tests
- Enhanced simulation controls with:
  - Multiple diffusion model options
  - Advanced numerical method selection
  - Configurable time step and error tolerance
  - State vector operations

### Template System
- Added template-based graph creation system
- Support for various network topologies:
  - Grid layout
  - Ring layout
  - Line layout
  - Custom configurations
- Configurable node and edge properties
- State persistence for graph configurations

## Quantum Library Technology

### Quantum Module Architecture (May 2025)

The quantum library has been significantly expanded and restructured to provide comprehensive quantum mechanics capabilities while maintaining a clean, modular architecture:

#### Core Technologies

- **Math.js Integration**: Direct integration with Math.js for complex number operations and matrix manipulation
- **TypeScript**: Comprehensive type definitions for quantum states, operators, and systems
- **Hybrid Architecture**: Combines functional core with stateful wrappers
- **WASM Integration**: Planned Python integration via WebAssembly for performance-critical operations

#### Quantum Physics Components

1. **Core Quantum Types and Operations**
   - Complex number operations with direct Math.js integration
   - Comprehensive matrix operations with eigendecomposition
   - Hilbert space operations and composition
   - Tensor product and operations
   - State vector operations with validation

2. **Quantum Mechanics Implementation**
   - Quantum operators with algebra (commutators, anti-commutators)
   - Unitary time evolution
   - Hamiltonian systems with validation
   - Measurement theory with eigendecomposition
   - Schmidt decomposition
   - Density matrices with partial trace
   - Quantum information metrics

3. **Quantum Circuit System**
   - Gate operations (Pauli X/Y/Z, Hadamard, CNOT)
   - Circuit composition
   - Measurement operations
   - Stateful wrapper class with functional core

4. **Quantum-Graph Integration**
   - Abstract graph implementation
   - Quantum state vectors on edges
   - Intertwiner tensors on nodes
   - Graph state composition
   - Package-based architecture

### Technical Implementation Patterns

#### Hybrid Functional/OOP Pattern

The quantum library uses a hybrid approach combining functional programming with object-oriented wrappers:

```typescript
// Pure functional core
export const applyOperator = (operator: Matrix, stateVector: ComplexVector): ComplexVector => {
  // Implementation details
};

// Stateful wrapper class
export class Operator {
  private matrix: Matrix;
  
  constructor(matrix: Matrix) {
    this.matrix = validateHermitian(matrix);
  }
  
  apply(state: StateVector): StateVector {
    // Delegates to pure function
    const result = applyOperator(this.matrix, state.toArray());
    return new StateVector(result);
  }
}
```

#### Math.js Complex Integration

Direct integration with Math.js complex number API:

```typescript
import { complex, Complex, add, multiply } from 'mathjs';

// Create complex numbers
const a = complex(1, 2);  // 1 + 2i
const b = complex(3, 4);  // 3 + 4i

// Complex operations
const sum = add(a, b);    // 4 + 6i
const product = multiply(a, b);  // -5 + 10i
```

#### Eigendecomposition Pattern

Robust implementation for quantum measurements:

```typescript
export const eigenDecomposition = (matrix: Matrix): EigenDecomposition => {
  // Implementation using math.js eigs() function
  // Returns eigenvalues and eigenvectors
};

// Used in measurement operations
export const measure = (state: StateVector, observable: Operator): MeasurementResult => {
  const { eigenvalues, eigenvectors } = eigenDecomposition(observable.getMatrix());
  // Calculate probabilities using eigenvectors and state
  return { outcomes, probabilities };
};
```

### Quantum Library Modules

#### Quantum Core (lib/quantum/)

- **types.ts**: Core type definitions for quantum mechanics
- **stateVector.ts**: Quantum state implementations
- **operator.ts**: Quantum operator framework
- **matrixOperations.ts**: Advanced matrix operations
- **matrixFunctions.ts**: Matrix logarithm, square root, etc.
- **operatorAlgebra.ts**: Commutators and advanced algebra
- **measurement.ts**: Quantum measurement system
- **hamiltonian.ts**: Energy operators and evolution
- **gates.ts**: Standard quantum gates
- **densityMatrix.ts**: Mixed state representations
- **information.ts**: Entropy and information metrics
- **circuit/**: Quantum circuit implementation (new)
- **utils/**: Validation and helper functions

#### Integration Layer

- **graph-core/**: Abstract graph implementations
- **tensor-core/**: Core tensor operations
- **spin-network/**: Integration of quantum with graphs

#### Examples and Testing

- **examples/**: Educational quantum examples
  - hamiltonian/: Quantum oscillator, spin chains
  - information/: Quantum information examples
  - circuits/: Quantum circuit demonstrations
  - algorithms/: Quantum algorithm implementations

- **__tests__/**: Comprehensive test suite
  - Unit tests for all modules
  - Integration tests
  - Validation suites

### Quantum Simulation Components

#### Quantum Tetrahedron (T53)
##### Implementation
- **Visualization**: Used Plotly for interactive 3D visualization with NetworkX for graph structure
- **Quantum Engine**: Used QuTiP for quantum state manipulation and evolution
- **State Space**: Implemented using tensor product of 6 spin-1/2 states (one per edge)
- **Interactions**: Three-body interactions between edges of each face using Pauli operators
- **Controls**: Interactive coupling strength controls using ipywidgets

##### Technical Architecture
- **Graph Structure**: NetworkX tetrahedral_graph() with 3D coordinate mapping
- **State Management**: QuTiP Quantum Objects (Qobj) for states and operators
- **Evolution**: Schrödinger equation solver with custom Hamiltonian
- **Visualization**: Real-time updates using Plotly's Figure.update() and callbacks
- **Mathematical Documentation**: Jupyter markdown cells with LaTeX equations

##### Features
- Full tensor product state space representation
- Isotropic three-body interactions
- Interactive parameter control
- Real-time state evolution visualization
- Color-coded coupling strength display
