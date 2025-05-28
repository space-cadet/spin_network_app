# Graph UI Implementation Plan

*Created: May 29, 2025*

This document outlines the plan for reorganizing the graph UI components into a dedicated `graph-ui` package, separating UI concerns from core graph operations.

## 1. Current State

The graph UI components currently reside in the main application (`graph-test-app/src/`), mixed with application-specific code. Key issues:

- UI components tightly coupled with main app
- Duplicate UI component implementations
- Mixed responsibilities between graph operations and visualization
- No clear separation between core graph functionality and UI

## 2. Package Structure

```
packages/
  graph-core/           # Existing - Core graph operations
    - core/
      - builders.ts    # Graph generation
      - types.ts       # Core types
      - GraphologyAdapter.ts
      
  graph-ui/            # New - React components
    src/
      components/
        canvas/
          GraphCanvas.tsx        # Main graph visualization
          ZoomControls.tsx       # Zoom in/out controls
          types.ts              # Canvas-specific types
        
        controls/
          builders/
            GraphBuilderControls.tsx
            BuilderSelect.tsx
            BuilderForm.tsx
          
          operations/
            GraphControls.tsx
            NodeControls.tsx
            EdgeControls.tsx
          
          properties/
            GraphProperties.tsx
            NodeProperties.tsx
            EdgeProperties.tsx
            
        layout/
          GraphWorkspace.tsx
          ResizablePanel.tsx
          ControlPanel.tsx
          
      hooks/
        useGraphInstance.ts
        useGraphSelection.ts
        useGraphLayout.ts
        useGraphOperations.ts
        
      state/
        graphSlice.ts
        selectionSlice.ts
        layoutSlice.ts
        
      types/
        ui.ts
        events.ts
        
      utils/
        layout.ts
        interaction.ts
        styling.ts
```

## 3. Implementation Plan

### Phase 1: Package Setup ✅
- [x] Create graph-ui package structure
- [x] Set up build configuration (TypeScript, Vite)
- [x] Configure dependencies
  - [x] graph-core as peer dependency
  - [x] React as peer dependency
  - [x] Styling dependencies (tailwind, etc.)

### Phase 2: Component Migration
- [~] Move core visualization components
  - [x] GraphCanvas (with improvements)
    - Added proper type definitions
    - Improved Sigma configuration
    - Added node/edge click handlers
  - [x] useGraphInstance hook
    - Separated from GraphManager
    - Added better type safety
    - Improved initialization
  - [ ] ZoomControls
- [ ] Move control components
  - [ ] GraphBuilderControls
  - [ ] GraphControls
  - [ ] GraphProperties
- [ ] Move layout components
  - [ ] GraphWorkspace
  - [ ] ResizablePanel
  - [ ] ControlPanel

### Phase 3: State Management
- [ ] Implement graph UI state management
- [ ] Create hooks for common operations
- [ ] Set up event handling system

### Phase 4: Testing & Documentation
- [ ] Set up testing infrastructure
- [ ] Write component tests
- [ ] Create usage documentation
- [ ] Add example implementations

## 4. Component Dependencies

### Core Dependencies
```typescript
// GraphCanvas.tsx
import { useGraphInstance } from '../../hooks/useGraphInstance';
import { GraphCanvasProps } from '../../types/graph';

// useGraphInstance.ts
import { GraphologyAdapter } from '@spin-network/graph-core';
import { GraphNode, GraphEdge } from '../types/graph';

// GraphBuilderControls.tsx (To be implemented)
import { builders } from '@spin-network/graph-core';
import { useGraphOperations } from '../../hooks/useGraphOperations';
```

### Component Flow
1. GraphWorkspace (container)
   - Manages layout
   - Contains GraphCanvas and ControlPanel

2. GraphCanvas (visualization)
   - Uses graph-core adapter
   - Handles interactions

3. ControlPanel (operations)
   - Contains builder controls
   - Contains operation controls
   - Contains property editors

## 5. Migration Strategy

1. **Incremental Migration**
   - Move components one at a time
   - Update imports in main app
   - Test each component after migration

2. **Dependency Management**
   - Keep graph-core as peer dependency
   - Share UI component library with main app
   - Maintain consistent styling system

3. **Testing Approach**
   - Unit tests for each component
   - Integration tests for component interactions
   - Visual regression tests for UI components

## 6. Success Criteria

1. Clear separation between graph-core and UI components
2. Reusable graph UI components
3. Improved maintainability
4. Consistent styling and behavior
5. Comprehensive test coverage
6. Clear documentation and examples

## 7. Next Steps

1. ✅ Create initial graph-ui package structure
2. ✅ Set up build and test configuration
3. 🔄 Component migration in progress
   - ✅ GraphCanvas and core hooks completed
   - ⬜ ZoomControls implementation
   - ⬜ GraphBuilderControls migration
   - ⬜ GraphProperties implementation
4. ⬜ Update main app to use new components
5. ⬜ Add comprehensive tests
6. ⬜ Create usage documentation