# Changelog

All notable changes to the Spin Network Visualization and Diffusion App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Real-time type management updates with immediate visualization feedback
- Type Management panel in the right sidebar as a collapsible element
- Collapsible panels for all sidebar components (Properties, Type Management, Simulation Controls, Network Tools)
- Dedicated zoom controls with percentage indicator
- Collapsible sections in panels to reduce scrolling and improve organization
- Persistent sidebar width/height between sessions

### Changed
- Improved Type Management workflow with real-time updates instead of requiring "Update" button clicks
- Enhanced organization of sidebar components with consistent collapsible sections
- Updated Settings dropdown to indicate Type Management is also available in the sidebar
- Modified Type Management modal with tip about sidebar alternative

### In Progress
- Simulation engine development (Graph Laplacian calculation)
- Matrix representations for network data
- Diffusion algorithm implementations
- Network history restoration improvements

### Planned
- Numerical methods for time evolution
- Simulation visualization improvements
- Advanced network manipulation features
- Statistics and metrics calculation
- Export functionality for results

### UI Improvements Roadmap (Prioritized)
1. **Panel Tabs**: Convert right sidebar into tabbed interface (Easy)
2. ~~**Dark/Light Theme Support**: Implement theme switching (Medium)~~ ✓ IMPLEMENTED
3. **Fullscreen Mode**: Add button to expand workspace to fullscreen (Easy)
4. **Context Menus**: Right-click context menus for nodes and edges (Medium)
5. **Multi-select Operations**: Enable selecting and operating on multiple nodes/edges (Medium)
6. ~~**Visual Node Categorization**: Use different shapes/colors for node types (Easy)~~ ✓ IMPLEMENTED
7. **History Navigation UI**: Create visual timeline for undo/redo operations (Medium)
8. **Interactive Tutorial**: Step-by-step walkthrough for first-time users (Complex)

## [0.3.0] - 2025-04-06

### Added
- State persistence with IndexedDB (Redux Persist)
- Undo/redo functionality with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- History tracking for all network operations
- Hideable panels with toggle buttons for workspace maximization
- Recent networks list with quick access to previous work
- Save/load functionality for network files with history preservation
- Support for dangling edges with placeholder node visualization
- Timestamps in filenames when saving networks
- Group operation tracking for complex interactions
- Enhanced error handling and validation for network operations

### Changed
- Moved undo/redo buttons to main toolbar for better accessibility
- Improved sidebar scrolling for all panels
- Enhanced UI feedback during operations
- Refined network element creation workflows
- Updated network visualization to use fixed node dimensions
- Improved interaction mode indicators

### Fixed
- Vertical scrolling in sidebar panels
- Node sizing issues in network visualization
- Event handler persistence across operations
- Edge creation workflow with placeholder nodes
- History state tracking for composite operations
- File operation error handling and feedback
- Visual feedback for interaction modes

## [0.2.0] - 2025-03-29

### Added
- Core network data model with TypeScript interfaces
- Network validation functions for data integrity
- Network generator functions for different network types:
  - Lattice networks with configurable rows and columns
  - Circular networks with configurable nodes and connectivity
  - Random networks with configurable nodes and edge probability
- Network operation utility functions (add/remove/update nodes and edges)
- Context-based state management for network data
- Integration between network model and Cytoscape.js visualization
- Property panel display for selected network elements
- Network information display (node/edge count and network type)

### Changed
- Updated UI components to work with the new network data model
- Improved Cytoscape.js integration with error handling
- Enhanced network visualization with proper node positioning
- Refined network tools panel with generator parameter controls

### Fixed
- Cytoscape.js rendering issues with position handling
- Element selection and property display synchronization
- Network layout issues when rendering different network types
- Zoom and fit functionality for network visualization

## [0.1.0] - 2025-03-25

### Added
- Initial project setup with React, TypeScript, and Vite
- Customizable layout with resizable panels on all sides
- Interactive network visualization using Cytoscape.js
- Network tools panel with template options
- Properties panel for network element editing
- Simulation controls panel with parameter inputs
- Energy plot visualization placeholder
- Zoom and pan controls for network view
- Selection functionality for network elements
- Responsive design with flexible layout
- SVG application icon

### Changed
- Switched from npm to pnpm for package management
- Enhanced resize handles for better visibility and usability
- Improved panel resize behavior with proper constraints

### Fixed
- Resize handle positioning and visibility for all panels
- Network component update on panel resize
- Event propagation during panel resizing operations