# Changelog

All notable changes to the Spin Network Visualization and Diffusion App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Redux integration for centralized state management:
  - Network slice for managing network data
  - UI slice for managing interface state
  - Strongly typed selectors for state access
  - Custom hooks for Redux integration
- Enhanced properties panel with source/target node label display
- Comprehensive Redux documentation in memory-bank
- Support for immutable state updates in all operations
- Foundation for future undo/redo functionality

### Changed
- Migrated from context-based state management to Redux
- Updated all components to use Redux hooks instead of context
- Improved property panel to properly display edge connections
- Refined state update patterns for consistency and type safety
- Optimized component re-renders with proper selector usage

### Fixed
- React hooks order violation in properties panel
- Edge properties display issues when selecting edges
- Component re-rendering inconsistencies
- TypeScript type safety issues in state updates
- State synchronization between components

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
