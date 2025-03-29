# Spin Network Visualization and Diffusion App

An interactive web application for constructing, visualizing, and simulating diffusion processes on spin networks.

## Features

- Create and edit spin networks with various symmetries
- Configure and run diffusion simulations
- Visualize diffusion processes and energy conservation
- Interactive network manipulation

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

## Development

### Project Structure

```
spin_network_app/
├── public/               # Static assets
├── resources/            # Documentation and resources
│   ├── architecture.md
│   ├── data_structures.md
│   ├── documentation.md
│   └── spin-net-telegraph.md
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── layouts/      # Layout components
│   │   ├── panels/       # Panel components
│   │   ├── simulation/   # Simulation components
│   │   ├── tools/        # Tool components
│   │   ├── visualization/# Visualization components
│   │   └── workspace/    # Workspace components
│   ├── styles/           # CSS styles
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── index.html            # HTML entry point
├── package.json          # Project dependencies
├── pnpm-lock.yaml        # PNPM lockfile
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

### Building for Production

To build the application for production:

```bash
pnpm build
```

The built application will be in the `dist` directory.

## Technologies Used

- React - UI library
- TypeScript - Type-safe JavaScript
- Cytoscape.js - Network visualization
- Tailwind CSS - Utility-first CSS framework
- Vite - Build tool
- pnpm - Fast, disk space efficient package manager

## License

This project is for educational and research purposes.

## Acknowledgments

- The spin network and diffusion mathematics are based on concepts from loop quantum gravity and graph theory.
