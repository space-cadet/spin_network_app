# Workspace.tsx Refactoring Plan

*Created: April 11, 2025*

## Current Issues

- Workspace.tsx has grown to 1400+ lines
- Mixes visualization, interaction, and UI control logic
- Difficult to maintain and test
- Tight coupling between different concerns

## Proposed Solution

Break down Workspace.tsx into focused components with clear responsibilities:

### 1. CytoscapeManager.tsx
**Responsibilities**:
- Cytoscape initialization and lifecycle management
- Core visualization setup and configuration
- Viewport and zoom management
- Base styling and theming

**Key Interfaces**:
```typescript
interface CytoscapeManagerProps {
  network: NetworkState;
  styles: NetworkStyles;
  onViewportChange?: (viewport: Viewport) => void;
  onZoomChange?: (zoom: number) => void;
}
```

### 2. NetworkInteractionManager.tsx
**Responsibilities**:
- Node/edge selection and highlighting
- Drag-and-drop interactions
- Context menu handling
- Element creation/deletion

**Key Interfaces**:
```typescript
interface NetworkInteractionManagerProps {
  network: NetworkState;
  onSelect?: (elements: ElementDefinition[]) => void;
  onNodeCreate?: (position: {x: number, y: number}) => void;
  onEdgeCreate?: (source: string, target: string) => void;
  onDelete?: (elements: ElementDefinition[]) => void;
}
```

### 3. SimulationVisualizationManager.tsx
**Responsibilities**:
- Simulation state visualization
- Animation handling
- Time evolution display
- Results overlay

**Key Interfaces**:
```typescript
interface SimulationVisualizationManagerProps {
  simulation: SimulationState;
  network: NetworkState;
  onAnimationFrame?: (frame: number) => void;
  onVisualizationReady?: () => void;
}
```

### 4. WorkspaceControls.tsx
**Responsibilities**:
- Toolbar buttons and controls
- View options toggles
- Layout selection
- Export/import UI

**Key Interfaces**:
```typescript
interface WorkspaceControlsProps {
  onLayoutChange?: (layout: LayoutType) => void;
  onExport?: (format: ExportFormat) => void;
  onImport?: (file: File) => void;
  onResetView?: () => void;
}
```

## Implementation Approach

1. **Component Creation**:
   - Create each new component with TypeScript interfaces
   - Set up proper props and callbacks
   - Move relevant code from Workspace.tsx to each component

2. **Data Flow**:
   ```mermaid
   graph TD
     Workspace.tsx --> CytoscapeManager
     Workspace.tsx --> NetworkInteractionManager
     Workspace.tsx --> SimulationVisualizationManager
     Workspace.tsx --> WorkspaceControls
     CytoscapeManager --> Workspace.tsx[Viewport/Zoom Events]
     NetworkInteractionManager --> Workspace.tsx[Selection/Creation Events]
     SimulationVisualizationManager --> Workspace.tsx[Animation Events]
   ```

3. **State Management**:
   - Keep global state in Redux
   - Use hooks for local component state
   - Maintain single source of truth for network data

4. **Testing Strategy**:
   - Unit tests for each component
   - Integration tests for data flow
   - Visual regression tests for rendering

## File Structure Changes

```
src/components/workspace/
├── Workspace.tsx (refactored)
├── CytoscapeManager/
│   ├── CytoscapeManager.tsx
│   ├── styles.css
│   └── index.ts
├── NetworkInteractionManager/
│   ├── NetworkInteractionManager.tsx
│   ├── useNetworkInteractions.ts
│   └── index.ts
├── SimulationVisualizationManager/
│   ├── SimulationVisualizationManager.tsx
│   ├── useSimulationVisualization.ts
│   └── index.ts
└── WorkspaceControls/
    ├── WorkspaceControls.tsx
    ├── ToolbarButton.tsx
    └── index.ts
```

## Expected Benefits

- **Reduced Complexity**:
  - Workspace.tsx reduced from 1400+ to ~200-300 lines
  - Clear separation of concerns
  - Easier to reason about each component

- **Improved Maintainability**:
  - Isolated changes
  - Better test coverage
  - Clearer component boundaries

- **Enhanced Flexibility**:
  - Easier to modify individual features
  - Better support for future extensions
  - More reusable components

## Migration Plan

1. Create new component files with initial structure
2. Gradually move functionality from Workspace.tsx
3. Verify functionality at each step
4. Update tests and documentation
5. Final cleanup and optimization

## Risks and Mitigation

- **Risk**: Breaking existing functionality
  - **Mitigation**: Incremental migration with thorough testing

- **Risk**: Performance impact
  - **Mitigation**: Profile critical paths and optimize

- **Risk**: Increased bundle size
  - **Mitigation**: Code splitting and lazy loading
