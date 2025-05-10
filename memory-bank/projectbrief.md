## Library Components

1. **Core Quantum Module**
   - Complex number operations
   - Matrix operations with numerical stability features
   - State vector implementations
   - Operator framework
   - Validation utilities

2. **Quantum Features Module**
   - Quantum gates (Pauli X/Y/Z, Hadamard, CNOT, etc.)
   - Measurement operations with eigendecomposition
   - Density matrix operations with partial trace
   - Entanglement measures (fidelity, concurrence, negativity)
   - Quantum information metrics (entropy, trace distance)

3. **Graph Module**
   - Abstract graph implementations
   - Graph algorithms and traversal
   - Quantum state integration
   - Edge and node operations

4. **Circuit Module (In Progress)**
   - Circuit operations and composition
   - Gate application and sequencing
   - Measurement integration
   - Common circuit patterns

5. **Visualization Module**
   - Network visualization adapters
   - Quantum state visualization
   - Circuit visualization
   - Plot and chart generation

6. **Integration Features**
   - Browser global access through SpinNetwork namespace
   - Module-based imports
   - Python WebAssembly integration (planned)
   - Documentation and examples

## Key Applications

1. **Network Simulation Application**
   - Interactive network creation and manipulation
   - Simulation of quantum and diffusion processes
   - Visualization of results
   - Analysis tools

2. **Quantum Tutorial Examples**
   - Educational examples for quantum concepts
   - Interactive visualizations
   - Step-by-step explanations
   - Validation against theoretical predictions

3. **Component Template System**
   - Reusable React components
   - Layout system with panels
   - State management patterns
   - Theme customization# Spin Network Quantum Library and Visualization App - Project Brief

## Project Overview

The Spin Network Quantum Library and Visualization App is a comprehensive quantum simulation toolkit that provides both a standalone quantum mechanics library and an interactive visualization application. The project enables researchers and educators to construct, visualize, and simulate quantum processes on spin networks, with particular emphasis on quantum geometric and quantum gravity concepts. The modular architecture supports both application-based interactive exploration and programmatic analysis through a comprehensive JavaScript/TypeScript library.

## Core Requirements

1. **Quantum Library Core Features**
   - Comprehensive quantum mechanical operations
   - Matrix and tensor operations with complex numbers
   - Quantum state vectors and operators
   - Quantum gates and circuit implementation
   - Measurement and density matrix operations
   - Modular architecture with clear namespaces

2. **Network Construction and Manipulation**
   - Create spin networks from scratch or templates
   - Edit network nodes (intertwiners) and edges (spins)
   - Support for various network symmetries (lattice, circular, random)
   - Abstract graph infrastructure with quantum state integration

3. **Visualization Capabilities**
   - Interactive network visualization with zoom/pan controls
   - Visual representation of spins and intertwiners
   - Energy conservation plots and statistics
   - Quantum tetrahedron visualization
   - Circuit and state visualization

4. **Quantum Simulation**
   - Quantum state evolution with Hamiltonian dynamics
   - Ordinary diffusion (heat equation on graphs)
   - Finite velocity diffusion (telegraph equation)
   - Support for quantum and potential-based variants
   - Real-time visualization of propagation

5. **User Interface**
   - Intuitive, responsive design with resizable panels
   - Tool panels for network creation and editing
   - Properties panel for detailed element configuration
   - Simulation controls for running and analyzing quantum models
   - Reusable React template system for consistent UI architecture

## Technology Stack

- **Frontend**: React with TypeScript
- **Visualization**: Cytoscape.js for networks, D3.js for plots, Three.js for 3D visualization
- **Mathematics**: math.js for comprehensive mathematical operations including complex numbers
- **Quantum Computing**: Custom quantum library with math.js integration
- **State Management**: Redux with Redux Toolkit
- **Build System**: Vite with optimized bundling
- **Package Manager**: pnpm
- **Documentation**: Docusaurus with TypeDoc
- **Testing**: Jest, Vitest for unit testing
- **Deployment**: Vercel, Firebase

## Project Goals

1. Develop a comprehensive quantum mechanics library for spin networks and quantum states
2. Create an educational tool for exploring quantum physics concepts through visualization
3. Provide both interactive UI and programmatic APIs for quantum simulations
4. Visualize complex quantum mathematical processes in a comprehensible way
5. Enable researchers to experiment with different quantum network configurations and models
6. Support integration with other computational environments including Python
7. Create reusable component patterns for quantum physics visualization applications

## Development Phases

1. **Phase 1 (Completed)**: Core UI and Visualization
   - Application layout with resizable panels
   - Network visualization component with Cytoscape.js
   - Tool panels for network manipulation
   - Property editing with validation

2. **Phase 2 (Completed)**: Basic Functionality
   - Network construction logic
   - Saving/loading networks
   - Diffusion algorithm implementation
   - Basic simulation capabilities
   - Initial quantum operations

3. **Phase 3 (Current)**: Quantum Library Development
   - Comprehensive quantum mechanics library
   - Matrix and tensor operations
   - Quantum state and operator framework
   - Quantum gates and circuit implementation
   - Measurement and density matrix operations
   - Hamiltonian dynamics
   - Graph-quantum integration
   - Python WebAssembly integration

4. **Phase 4 (Upcoming)**: Advanced Visualization and UX
   - Enhanced visualization options
   - 3D network visualization
   - Quantum circuit visualization
   - Advanced analysis tools
   - Reusable React template architecture
   - Improved documentation and examples

5. **Phase 5 (Future)**: Expansion and Integration
   - Performance optimizations
   - Integration with quantum computing platforms
   - Collaborative features
   - Educational content and tutorials
   - Advanced quantum algorithms
