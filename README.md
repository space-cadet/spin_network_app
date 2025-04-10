# Spin Network Visualization and Diffusion App

An interactive web application for constructing, visualizing, and simulating diffusion processes on spin networks.

![Spin Network Visualization App](public/spin-network-icon.svg)

## Features

- Create and edit spin networks with various symmetries (lattice, circular, random)
- Configure and run diffusion simulations with adjustable parameters
- Visualize diffusion processes and energy conservation through interactive UI
- Customizable workspace with resizable panels
- Interactive network manipulation with intuitive controls
- Comprehensive type management for visual customization
- Simulation support for both ordinary and telegraph diffusion models

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

This project is for educational and research purposes.

## Acknowledgments

- The spin network and diffusion mathematics are based on concepts from loop quantum gravity and graph theory.