# Spin Network Visualization and Diffusion App - Documentation

## Overview

The Spin Network Visualization and Diffusion App is a comprehensive tool for constructing, visualizing, and simulating diffusion processes on spin networks. This application allows researchers and students to explore the properties of spin networks with various symmetries and study different types of diffusion processes, including ordinary diffusion, finite velocity diffusion, and variants with potentials.

## Features

### Network Construction
- Create empty networks from scratch
- Generate lattice networks with configurable rows, columns, and spin values
- Generate circular networks with configurable nodes and spin values
- Generate random networks with configurable parameters
- Edit node properties (position, intertwiner values)
- Edit edge properties (spin values)
- Visual editing through an interactive canvas

### Diffusion Simulation
- Ordinary diffusion (heat equation)
- Finite velocity diffusion (telegraph equation)
- Support for potential-based variants
- Configurable simulation parameters (time step, total time, damping coefficients)
- Real-time visualization of diffusion processes
- Energy conservation analysis

### Visualization
- Interactive network visualization using Cytoscape.js
- Color mapping of node values during simulation
- Edge width mapping based on spin values
- Energy plots showing gravitational, matter, and total energy
- Statistical analysis of simulation results

### State Persistence
- Save and load networks
- Save and load simulation results
- Export networks to JSON files
- Import networks from JSON files
- Browser local storage for persistent state

## Technical Architecture

The application is built using modern web technologies:

- **Frontend Framework**: React with TypeScript
- **State Management**: Redux with Redux Toolkit
- **Network Visualization**: Cytoscape.js
- **Data Visualization**: D3.js
- **Build System**: Vite
- **Testing**: Jest and React Testing Library

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Building for Production

To build the application for production:

```
npm run build
```

The built files will be in the `dist` directory.

### Deployment

To deploy the application:

```
./deploy.sh
```

This script will run tests, build the application, and serve it locally.

## Usage Guide

### Creating a Spin Network

1. Use the sidebar to create a new network or generate a network from a template
2. Enter a name and description for your network
3. For template networks, configure the parameters (rows, columns, nodes, spin values)
4. Click the generate button to create the network

### Editing a Network

1. Click on nodes or edges to select them
2. Use the properties panel to edit selected elements
3. Drag nodes to reposition them
4. Double-click on the canvas to add new nodes
5. Connect nodes by selecting a source node, then shift-clicking on a target node

### Running a Simulation

1. Configure simulation parameters in the simulation controls panel
2. Select the diffusion type (ordinary or finite velocity)
3. Set parameters like alpha, beta, c, time step, and total time
4. Click "Start Simulation" to begin
5. Use the pause, resume, and step buttons to control the simulation
6. Observe the network visualization and energy plots during simulation

### Saving and Loading

1. Use the save/load panel to save your current network or simulation
2. Enter a name and description for saved items
3. View saved networks and simulations in the lists
4. Click "Load" to restore a saved network or simulation
5. Use the export/import buttons to save to or load from files

## Mathematical Background

The application implements several diffusion models:

### Ordinary Diffusion (Heat Equation)

The heat equation on a spin network is given by:

```
∂u/∂t = c² Δu
```

where Δ is the Laplacian operator on the spin network.

### Finite Velocity Diffusion (Telegraph Equation)

The telegraph equation on a spin network is given by:

```
∂²u/∂t² + (α + β)∂u/∂t + αβu = c² Δu
```

where α and β are damping coefficients.

### Dynamical Spin Networks

For dynamical spin networks, the edges (spins) evolve according to:

```
μ d²j_e/dt² = -κj_e + c² (u_i - u_j)² (2j_e + 1) + λu_i u_j
```

where μ is a mass parameter, κ is a potential coefficient, and λ is a coupling constant.

## Extending the Application

The modular architecture makes it easy to extend the application:

- Add new network templates by extending the network slice
- Implement new diffusion algorithms in the diffusionAlgorithms.ts file
- Add new visualization components in the visualization directory
- Extend the state persistence with additional storage options

## Troubleshooting

- If the visualization is slow, try reducing the network size or increasing the time step
- For large simulations, consider using the "Save" functionality frequently
- If the application becomes unresponsive, refresh the page and load your last saved state

## License

This application is provided for educational and research purposes.
