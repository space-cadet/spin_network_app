# Spin Network Visualization and Diffusion App - System Patterns

## Architecture Overview

The application follows a component-based architecture with clear separation of concerns:

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

This approach promotes reusability and simplifies testing and maintenance.

### 2. Resizable Panel Pattern

A key architectural pattern is the resizable panel system:

```
┌─────────────────────────────────────────────────────┐
│ MainLayout                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Header                                          │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌───────────┐ ┌───────────────────┐ ┌───────────┐ │
│ │           │ │                   │ │           │ │
│ │           │ │                   │ │           │ │
│ │  Left     │ │     Main          │ │  Right    │ │
│ │  Sidebar  │ │     Content       │ │  Sidebar  │ │
│ │  Panel    │ │     Panel         │ │  Panel    │ │
│ │           │ │                   │ │           │ │
│ │           │ │                   │ │           │ │
│ │           │ ├───────────────────┤ │           │ │
│ │           │ │  Bottom Panel     │ │           │ │
│ └───────────┘ └───────────────────┘ └───────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Footer                                          │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

- Each panel can be resized by the user
- Panels communicate size changes to maintain a responsive layout
- Content within panels adapts to available space

### 3. State Management

The application uses a centralized state management approach:

- **Global State**: Application-wide state managed by Redux
- **Component State**: Local state for UI-specific concerns
- **Derived State**: Calculated from the global state for visualization

### 4. Event-Driven Interaction

User interactions follow an event-driven pattern:

1. User initiates action (e.g., selecting a node)
2. Component generates event
3. Event handlers update state
4. UI re-renders to reflect changes

### 5. Graph Data Structure

Spin networks are represented using a graph data structure:

```typescript
interface Node {
  id: string;
  position: { x: number, y: number };
  intertwiner: number | null;
  properties: Record<string, any>;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  spin: number;
  properties: Record<string, any>;
}

interface SpinNetwork {
  nodes: Node[];
  edges: Edge[];
  metadata: { /* network metadata */ };
}
```

This structure is optimized for visualization with Cytoscape.js and for diffusion calculations.

## Component Relationships

### Network Visualization Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Network Data │───►│ Cytoscape.js │───►│ Rendered     │
│ Model        │    │ Adapter      │    │ Network      │
└──────────────┘    └──────────────┘    └──────────────┘
       ▲                                        │
       │                                        │
       └───────────────────────────────────────┘
                  User Interaction
```

### Simulation Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Simulation   │───►│ Numerical    │───►│ Simulation   │
│ Parameters   │    │ Solver       │    │ Results      │
└──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Visualization│
                                       │ Components   │
                                       └──────────────┘
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
