# Spin Network Visualization and Diffusion App

An interactive web application for constructing, visualizing, and simulating diffusion processes on spin networks.  
This project serves as an educational and research tool for exploring quantum geometric concepts through an interactive interface.

<!-- ![Spin Network Visualization App](public/spin-network-icon.svg) -->

<p align="center">
<img src="public/spin-network-icon.svg" alt="Spin Network Visualization App" width="200" height="200" class="center">
</p>

---

## Project Overview

The Spin Network Visualization and Diffusion App enables users to:
- Construct spin networks from scratch or templates
- Edit network nodes (intertwiners) and edges (spins)
- Visualize network structure, energy conservation, and simulation results
- Simulate both ordinary and telegraph diffusion processes on arbitrary graphs
- Analyze geometric and statistical properties of networks

## Features

- **Network Construction & Manipulation**
  - Create and edit spin networks with various symmetries (lattice, circular, random)
  - UI-based node/edge creation and deletion
  - Comprehensive type management for visual customization (real-time updates, sidebar integration)
- **Simulation Engine**
  - Ordinary diffusion (heat equation) and telegraph equation models
  - Multiple numerical solvers (Euler, Midpoint, RK4, Adaptive)
  - Real-time visualization of propagation and energy conservation
  - Parameter adjustment UI and results visualization
- **State Management & Persistence**
  - Redux for global state management (including simulation state)
  - Undo/redo history for all network operations
  - Recent networks feature for quick access
  - Automatic state persistence using IndexedDB
- **User Interface**
  - Intuitive, responsive design with resizable and collapsible panels
  - Dedicated panels for properties, type management, simulation controls, and network tools
  - Hideable sidebars and customizable workspace
  - Debug panel and raw data display for diagnostics
- **Robust Error Handling & Diagnostics**
  - Defensive programming throughout simulation and analysis
  - Comprehensive logging and error feedback in the UI
  - Fallback mechanisms for missing or invalid data
  - Standalone simulation test page for debugging and verification

## Current Status (April 2025)

- ✅ Redux integration for simulation state and UI
- ✅ Robust error handling and validation in all analysis modules
- ✅ Performance optimizations: reduced re-renders, improved memoization, throttling
- ✅ Debug tools: dedicated debug panel, raw data display, enhanced logging
- ✅ Refactored large components for maintainability
- 🔄 Ongoing: Advanced simulation analysis, component refactoring, database/log management

## Technology Stack

- **Frontend**: React with TypeScript
- **Visualization**: Cytoscape.js (networks), D3.js (plots)
- **Mathematics**: math.js, numeric.js
- **State Management**: Redux
- **Build System**: Vite
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js (v16 or newer recommended)
- pnpm (v8 or newer recommended)

### Installation

1. Clone this repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

## Documentation & Memory Bank

- For advanced usage, troubleshooting, and development history, see the `memory-bank/` directory:
  - `projectbrief.md`: Project goals and requirements
  - `progress.md`: Feature and milestone checklist
  - `activeContext.md`: Current focus and roadmap
  - `changelog.md`: Narrative changelog and key decisions
  - `edit_history.md`: Chronological file modification log
  - `session_cache.md`: Current session status and critical files
- Additional technical docs are available in the `docs/` directory.

## User Interface

The application features a flexible, customizable interface:

- **Left Panel**: Network creation tools, templates, and file operations with collapsible sections
- **Main Area**: Interactive network visualization with dedicated zoom controls and mode selection
- **Right Panel**: Properties editor, type management, and simulation controls with collapsible sections
- **Bottom Panel**: Simulation results, analysis, and visualization metrics

Key features:
- All panels are resizable to accommodate different workflows and preferences
- Each panel contains collapsible sections for better organization
- Panels can be hidden/shown to maximize workspace
- Panel sizes are remembered between sessions
- Dedicated zoom controls with percentage indicator
- Undo/redo functionality with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Multiple interaction modes (select, pan, add node, add edge, delete)
- Network saving and loading with timestamp versioning
- Recent networks quick access menu
- Real-time type management updates with immediate visualization feedback
- Dark/light theme support with system detection
- Comprehensive simulation controls with adjustable parameters
- Analysis tools for conservation laws and geometric properties

## Simulation Features

The application includes a powerful simulation engine for modeling diffusion processes on spin networks:

- **Multiple Diffusion Models**:
  - Ordinary diffusion (heat equation model) for traditional diffusion processes
  - Telegraph diffusion (wave-like model) for finite velocity propagation

- **Configurable Parameters**:
  - Diffusion rate (alpha) controls the speed of ordinary diffusion
  - Damping (beta) and wave speed (c) for telegraph diffusion
  - Choice of numerical methods (Euler, RK4, Adaptive)
  - Weight function selection based on spin values
  - Time step and total simulation time customization

- **Initial State Configuration**:
  - Delta function (single node) initialization
  - Uniform distribution across nodes
  - Gaussian distribution with configurable parameters
  - Support for custom initial states

- **Analysis Tools**:
  - Conservation law verification
  - Geometric property calculations
  - Statistical analysis of simulation results
  - Time evolution visualization

## Development

### Project Structure

```
spin_network_app/
├── memory-bank/          # Project documentation and context
├── public/               # Static assets
├── resources/            # Technical documentation
│   ├── architecture.md
│   ├── data_structures.md
│   ├── documentation.md
│   └── spin-net-telegraph.md
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── common/       # Shared components like ResizablePanel
│   │   ├── layouts/      # Layout components
│   │   ├── panels/       # Panel components
│   │   ├── simulation/   # Simulation components
│   │   ├── tools/        # Tool components
│   │   ├── visualization/# Visualization components
│   │   └── workspace/    # Workspace components
│   ├── hooks/            # Custom React hooks
│   ├── models/           # Data models and types
│   ├── simulation/       # Simulation engine
│   │   ├── analysis/     # Analysis tools
│   │   ├── core/         # Core simulation classes
│   │   ├── models/       # Diffusion models
│   │   └── visualization/# Visualization adapters
│   ├── store/            # Redux store and slices
│   ├── styles/           # CSS styles
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── index.html            # HTML entry point
├── package.json          # Project dependencies
├── pnpm-lock.yaml        # PNPM lockfile
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean build artifacts and dependencies

### Technical Documentation

For more detailed technical information, see the files in the `resources/` directory:

- `architecture.md` - System architecture and components
- `data_structures.md` - Core data structures and algorithms
- `documentation.md` - User-oriented documentation
- `spin-net-telegraph.md` - Mathematical background

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Cytoscape.js** - Network visualization
- **math.js** - Mathematical operations for simulation
- **D3.js** - Data visualization for metrics and plots
- **Redux Toolkit** - State management
- **Redux Persist** - State persistence with IndexedDB
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool
- **pnpm** - Fast, disk space efficient package manager

## Current Status

The project is in active development. The current version features:
- Comprehensive network data model with TypeScript interfaces
- Multiple network generation options (lattice, circular, random)
- Interactive network visualization with Cytoscape.js
- Dedicated zoom controls with percentage indicator
- Full undo/redo support for all network operations
- State persistence to preserve work between sessions
- Save/load functionality with recent networks tracking
- Support for dangling edges with placeholder nodes
- Hideable panels to maximize workspace
- Customizable workspace with resizable panels that remember their sizes
- Property editing for network elements in organized collapsible sections
- Type management with real-time updates and immediate visualization feedback
- Collapsible panels and sections for better organization and reduced scrolling
- Dark/light theme support with system detection
- Simulation engine with support for ordinary and telegraph diffusion
- Comprehensive simulation controls with customizable parameters
- Analysis tools for conservation laws and geometric properties

See the [CHANGELOG.md](CHANGELOG.md) for recent updates and the current development status.

## License

[MIT](LICENSE)