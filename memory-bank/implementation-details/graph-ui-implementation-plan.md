# Graph UI Implementation Plan

*Created: May 29, 2025*
*Updated: May 29, 2025 20:09 IST - Implemented Type System*

## 1. Implementation Status

### ✅ Completed
- Clean separation between `graph-core` and `graph-ui`
- Type system for rendering and layout
- Consistent 3D coordinate support

### ⏳ In Progress
- Layout transformation system
- Renderer implementations

## 2. Architecture Overview

### Package Structure
```
graph-core/           graph-ui/
  └─ Pure Logic        ├─ Rendering Types
     - IGraph          ├─ Layout Engine
     - IGraphNode      ├─ Visual Properties
     - IGraphEdge      └─ Renderers
```

### Type System
```typescript
// graph-core: Pure Logic
interface IGraph {
  topology: 'torus' | 'planar' | 'sphere';
  dimensions: 2 | 3;
  nodes: IGraphNode[];
  edges: IGraphEdge[];
}

// graph-ui: Rendering
interface IRenderNode {
  id: string;
  position: IRenderPosition;  // Always 3D (z=0 for 2D)
  renderProps?: IRenderProperties;
}
```

### Core Principles
1. **Clean Separation**
   - `graph-core`: No rendering knowledge
   - `graph-ui`: All visual concerns
   - One-way dependency

2. **Coordinate System**
   - Logical coordinates in `graph-core`
   - Visual coordinates in `graph-ui`
   - Consistent 3D support (z=0 for 2D), not vice versa

### Responsibility Boundaries

#### graph-core
- Graph data structures and operations
- Mathematical properties (topology, dimensions)
- No rendering knowledge
```

#### graph-ui Package (All Rendering)
```typescript
✅ Coordinate transformation (logical → visual)
✅ Layout algorithms (preserve, force-directed, etc.)
✅ Visual properties (color, size, opacity)
✅ Rendering components (Canvas, SVG, WebGL)
✅ User interactions (click, drag, zoom)
✅ Animation and transitions
```

## 3. Separated Type Systems

### graph-core Types (Pure Logic)
```typescript
// Pure logical graph structure - NO rendering concepts
interface IGraphNode {
  id: string;
  type?: string;
  properties?: Record<string, any>;
  // NO x, y, z coordinates - only abstract structure
}

interface IGraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  properties?: Record<string, any>;
  // NO visual properties
}

// Abstract positioning identifiers (NOT coordinates)
interface ILogicalIdentifiers {
  latticePosition?: { i: number; j: number; k?: number };  // Grid indices
  hierarchyPosition?: { level: number; index: number };   // Tree position
  networkId?: string;                                      // Network identifier
}

// Graph metadata (mathematical properties only)
interface IGraphMetadata {
  type: string;                                   // Graph type identifier
  topology: 'planar' | 'torus' | 'sphere';      // Mathematical topology
  dimensions: number;                             // Logical dimensionality
  parameters: Record<string, any>;               // Construction parameters
}
```

### graph-ui Types (Rendering Logic)
```typescript
// Rendering coordinates (visual space)
interface IRenderPosition {
  x: number;
  y: number;
  z?: number;
}

// Visual properties
interface IRenderProperties {
  color?: string;
  size?: number;
  opacity?: number;
  shape?: string;
  selected?: boolean;
  [key: string]: any;
}

// Complete rendering node (combines logical + visual)
interface IRenderNode extends IGraphNode {
  position: IRenderPosition;
  renderProps?: IRenderProperties;
}

interface IRenderEdge extends IGraphEdge {
  renderProps?: IRenderProperties;
}

// Layout algorithm configuration
interface ILayoutOptions {
  algorithm: 'preserve_logical' | 'force_directed' | 'circular' | 'hierarchical';
  dimensions: 2 | 3;
  preserveTopology?: boolean;
  bounds?: { width: number; height: number; depth?: number };
  spacing?: number;
}
```

## 4. Corrected Package Structure

### Complete Separation: Core vs UI

```
packages/
  graph-core/           # PURE logical operations - NO rendering
    src/
      core/
        builders.ts     # Creates ONLY logical structure + metadata
        types.ts        # ONLY logical types (IGraphNode, IGraphEdge, IGraphMetadata)
        GraphologyAdapter.ts  # Pure graph operations (NO coordinates)
        algorithms.ts   # Graph algorithms (traversal, analysis)
        
      utils/
        validation.ts   # Graph structure validation
        conversion.ts   # Format conversions (Graphology ↔ IGraph)
        
      __tests__/
        builders.test.ts      # Test logical graph creation
        algorithms.test.ts    # Test graph analysis
        
  graph-ui/            # ALL rendering and visual logic
    src/
      layout/           # ← MOVED: All coordinate logic here
        LayoutEngine.ts         # Logical → Visual coordinate transformation
        algorithms/
          PreserveLogical.ts    # Maintains mathematical structure
          ForceDirected.ts      # Physical simulation layouts
          Circular.ts           # Circular arrangements
          Hierarchical.ts       # Tree layouts
          
      rendering/        # ← MOVED: All visual representation
        RenderGraph.ts          # Manages visual coordinates & properties
        CoordinateManager.ts    # Coordinate transformation utilities
        
      components/
        canvas/
          GraphCanvas.tsx       # Main visualization orchestrator
          ZoomControls.tsx      # Camera/view controls
          
        renderers/              # Rendering backends
          SigmaRenderer.tsx     # 2D Sigma.js rendering
          ThreeFiberRenderer.tsx # 3D Three.js rendering
          SVGRenderer.tsx       # SVG rendering (future)
          
        controls/
          builders/
            GraphBuilderControls.tsx  # UI for logical graph creation
            BuilderSelect.tsx
            BuilderForm.tsx
          
          layout/
            LayoutControls.tsx        # Algorithm selection UI
            CoordinateControls.tsx    # Coordinate system options
            ViewControls.tsx          # 2D/3D view switching
          
        properties/
          GraphProperties.tsx         # Graph metadata display
          NodeProperties.tsx          # Node logical + visual info
          EdgeProperties.tsx          # Edge logical + visual info
            
      hooks/
        useGraphRendering.ts          # Logical → Render transformation
        useLayoutEngine.ts            # Layout computation management
        useCoordinateTransform.ts     # Coordinate utilities
        useGraphInteraction.ts        # Mouse/touch interactions
        
      state/
        renderingSlice.ts             # Visual state (coordinates, colors)
        layoutSlice.ts                # Layout algorithm options
        interactionSlice.ts           # Selection, hover, etc.
        
      types/
        rendering.ts                  # Visual types (IRenderNode, etc.)
        layout.ts                     # Layout algorithm types
        interaction.ts                # UI interaction types
        
      __tests__/
        layout.test.ts                # Test coordinate transformation
        rendering.test.ts             # Test visual components
        interaction.test.ts           # Test UI interactions
```

### Key Architectural Changes

#### graph-core: Pure Logic Only
```typescript
// ✅ ONLY in graph-core
interface IGraphNode {
  id: string;
  type?: string;
  properties?: {
    latticePosition?: { i: number; j: number; k?: number };  // Abstract identifiers
    // NO x, y, z coordinates
  };
}

// ✅ Builders create pure structure
function build2DPeriodicLattice(width: number, height: number): IGraph {
  // Creates topology + metadata, NO visual coordinates
  graph.setMetadata({
    type: '2d_periodic_lattice',
    topology: 'torus',
    dimensions: 2,
    parameters: { width, height }
  });
}
```

#### graph-ui: All Visual Logic
```typescript
// ✅ ONLY in graph-ui
interface IRenderNode extends IGraphNode {
  position: { x: number; y: number; z?: number };  // Visual coordinates
  renderProps?: { color?: string; size?: number }; // Visual properties
}

// ✅ Layout engine transforms logical → visual
class LayoutEngine {
  transformToRenderCoordinates(logicalGraph: IGraph, options: ILayoutOptions): IRenderGraph {
    // All coordinate computation happens in UI package
  }
}
```

## 5. Implementation Plan (Revised)

### Phase 1: Clean Separation - Core Package
**Priority: HIGH - Establish pure logical foundation**

#### graph-core: Remove ALL Rendering Logic
- [ ] **Clean core types** (`packages/graph-core/src/core/types.ts`)
  - Remove `x?, y?` from `IGraphNode` interface completely
  - Keep ONLY logical types: `IGraphNode`, `IGraphEdge`, `IGraphMetadata`
  - NO rendering interfaces in graph-core (move `IRenderNode` to graph-ui)

- [ ] **Pure graph builders** (`packages/graph-core/src/core/builders.ts`)
  ```typescript
  // BEFORE (mixed concerns - WRONG)
  build2DPeriodicLattice() → { i: 2, j: 3, x: 150, y: 200 }
  
  // AFTER (pure logical structure - CORRECT)
  build2DPeriodicLattice() → { 
    properties: { latticePosition: { i: 2, j: 3 } },  // Abstract identifiers only
    // NO x,y,z coordinates anywhere
  }
  
  // Add metadata for UI package to use
  graph.setMetadata({
    type: '2d_periodic_lattice',
    topology: 'torus', 
    dimensions: 2,
    parameters: { width: 4, height: 4 }
  });
  ```

- [ ] **Remove rendering dependencies**
  - NO coordinate transformation in graph-core
  - NO layout algorithms in graph-core  
  - NO visual properties in graph-core
  - Clean separation: graph-core never imports graph-ui

### Phase 2: UI Package - All Rendering Logic
**Priority: HIGH - Move ALL visual logic to graph-ui**

#### graph-ui: Accept ALL Rendering Responsibility
- [ ] **Create Layout Engine** (`packages/graph-ui/src/layout/LayoutEngine.ts`)
  ```typescript
  // ✅ CORRECT: Layout logic in UI package
  interface ILayoutEngine {
    transformToRender(logicalGraph: IGraph, options: ILayoutOptions): IRenderGraph;
  }
  
  class StandardLayoutEngine implements ILayoutEngine {
    transformToRender(graph: IGraph, options: ILayoutOptions): IRenderGraph {
      const metadata = graph.getMetadata();
      
      // Handle 2D graphs in 3D space
      if (metadata.topology === 'torus' && options.dimensions === 3) {
        // Set z=0 for all nodes to preserve planarity
        return this.createPlanarRender(graph, options);
      }
      
      // Other layout algorithms...
    }
  }
  ```

- [ ] **Create RenderGraph** (`packages/graph-ui/src/rendering/RenderGraph.ts`)
  ```typescript
  // ✅ CORRECT: Visual representation in UI package
  class RenderGraph {
    private logicalGraph: IGraph;
    private renderNodes: Map<string, IRenderNode>;
    
    constructor(logicalGraph: IGraph) {
      this.logicalGraph = logicalGraph;
    }
    
    // Methods to manage visual coordinates
    setNodePosition(nodeId: string, position: IRenderPosition): void;
    getNodePosition(nodeId: string): IRenderPosition | undefined;
  }
  ```

#### Critical Coordinate Handling (ALL in graph-ui)
- [ ] **2D Periodic Lattice**: Layout engine sets `z: 0` (preserve torus structure)
- [ ] **Triangular Lattice**: Layout engine sets `z: 0` (planar geometry)  
- [ ] **3D Lattice**: Layout engine computes proper 3D coordinates
- [ ] **Random/Complete**: Layout engine chooses 2D vs 3D based on graph metadata

### Phase 2: Renderer Updates  
**Priority: HIGH - Fixes immediate 3D visualization issues**

- [ ] **Update ThreeFiberRenderer** (`packages/graph-test-app/src/components/graph/renderers/ThreeFiberRenderer.tsx`)
  ```typescript
  // BEFORE (random Z destruction)
  position={[node.x || 0, node.y || 0, Math.random() * 10 - 5]}
  
  // AFTER (proper render coordinates)
  position={[renderNode.position.x, renderNode.position.y, renderNode.position.z || 0]}
  ```

- [ ] **Update SigmaRenderer** for RenderGraph compatibility
- [ ] **Update GraphCanvas** to use Layout Engine transformation
- [ ] **Add coordinate system indicators** in UI (2D plane vs 3D space)

### Phase 3: State Management Integration
**Priority: MEDIUM - Clean data flow**

- [ ] **Update Redux store** (`packages/graph-test-app/src/store/graphSlice.ts`)
  ```typescript
  interface GraphState {
    logicalGraph: IGraph | null;        // Pure structure
    renderGraph: IRenderGraph | null;   // Visual representation  
    layoutOptions: LayoutOptions;       // Transform parameters
    renderMode: '2d' | '3d';
  }
  ```

- [ ] **Add layout controls** for user preferences
- [ ] **Create coordinate debugging** tools (show both logical & render)

### Phase 4: Graph-UI Package Migration
**Priority: MEDIUM - Long-term organization**

- [ ] Move components to dedicated package
- [ ] Update import paths and dependencies  
- [ ] Create reusable layout components
- [ ] Add comprehensive testing

### Phase 5: Advanced Features
**Priority: LOW - Enhancement**

- [ ] **Multiple layout algorithms** per graph type
- [ ] **Interactive coordinate transformation**
- [ ] **Layout animation** (smooth transitions)
- [ ] **Coordinate system validation** tools

## 6. Corrected Implementation Examples

### graph-core: Pure Logical Structure
**File: `packages/graph-core/src/core/builders.ts`**

```typescript
// ✅ CORRECT: Pure logical structure, NO visual coordinates
export function build2DPeriodicLattice(width: number, height: number): IGraph {
  const graph = new GraphologyAdapter();
  
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      graph.addNode(`node_${i}_${j}`, {
        type: 'lattice_point',
        properties: {
          latticePosition: { i, j }  // ✅ Abstract identifiers only, NO x,y,z
        }
      });
      
      // Add edges based on topology (torus wrapping)
      const rightNeighbor = `node_${(i + 1) % width}_${j}`;
      const bottomNeighbor = `node_${i}_${(j + 1) % height}`;
      
      graph.addEdge(`edge_${i}_${j}_right`, `node_${i}_${j}`, rightNeighbor);
      graph.addEdge(`edge_${i}_${j}_down`, `node_${i}_${j}`, bottomNeighbor);
    }
  }
  
  // ✅ Metadata describes mathematical structure
  graph.setMetadata({
    type: '2d_periodic_lattice',
    topology: 'torus',           // Mathematical topology
    dimensions: 2,               // Logical dimensionality  
    parameters: { width, height }
  });
  
  return graph;
}

// ✅ NO coordinate computation in graph-core
// ✅ NO visual properties in graph-core
// ✅ NO layout algorithms in graph-core
```

### graph-ui: All Visual Logic
**File: `packages/graph-ui/src/layout/LayoutEngine.ts`**

```typescript
// ✅ CORRECT: Layout computation in UI package
interface ILayoutOptions {
  algorithm: 'preserve_logical' | 'force_directed' | 'circular';
  dimensions: 2 | 3;
  preserveTopology?: boolean;
  spacing?: number;
}

class StandardLayoutEngine {
  transformToRender(logicalGraph: IGraph, options: ILayoutOptions): IRenderGraph {
    const renderGraph = new RenderGraph(logicalGraph);
    const metadata = logicalGraph.getMetadata();
    
    logicalGraph.forEachNode((node, nodeId) => {
      const renderPos = this.computeVisualPosition(node, metadata, options);
      renderGraph.setNodePosition(nodeId, renderPos);
    });
    
    return renderGraph;
  }
  
  private computeVisualPosition(
    node: IGraphNode, 
    metadata: IGraphMetadata, 
    options: ILayoutOptions
  ): IRenderPosition {
    
    const latticePos = node.properties?.latticePosition;
    
    if (metadata.topology === 'torus' && latticePos) {
      // 2D periodic lattice: preserve planarity in 3D
      return {
        x: latticePos.i * (options.spacing || 50),
        y: latticePos.j * (options.spacing || 50),
        z: options.dimensions === 3 ? 0 : undefined  // ✅ Preserve torus structure!
      };
    }
    
    if (metadata.type === '3d_lattice' && latticePos) {
      // True 3D lattice gets 3D coordinates
      return {
        x: latticePos.i * (options.spacing || 50),
        y: latticePos.j * (options.spacing || 50), 
        z: (latticePos.k || 0) * (options.spacing || 50)
      };
    }
    
    // Other layout algorithms (force-directed, circular, etc.)
    return this.applyLayoutAlgorithm(node, metadata, options);
  }
}
```

### graph-ui: RenderGraph Management  
**File: `packages/graph-ui/src/rendering/RenderGraph.ts`**

```typescript
// ✅ CORRECT: Visual representation in UI package
class RenderGraph {
  private readonly logicalGraph: IGraph;
  private renderNodes: Map<string, IRenderNode> = new Map();
  private renderEdges: Map<string, IRenderEdge> = new Map();
  
  constructor(logicalGraph: IGraph) {
    this.logicalGraph = logicalGraph;
  }
  
  // Visual coordinate management
  setNodePosition(nodeId: string, position: IRenderPosition): void {
    const logicalNode = this.logicalGraph.getNode(nodeId);
    if (!logicalNode) return;
    
    this.renderNodes.set(nodeId, {
      ...logicalNode,           // Inherit logical properties
      position,                 // Add visual coordinates
      renderProps: this.getDefaultRenderProps(logicalNode)
    });
  }
  
  getNodePosition(nodeId: string): IRenderPosition | undefined {
    return this.renderNodes.get(nodeId)?.position;
  }
  
  // Access to underlying logical structure
  getLogicalGraph(): IGraph {
    return this.logicalGraph;
  }
  
  getAllRenderNodes(): [string, IRenderNode][] {
    return Array.from(this.renderNodes.entries());
  }
}
```

### graph-ui: Updated Renderers
**File: `packages/graph-ui/src/components/renderers/ThreeFiberRenderer.tsx`**

```typescript
// ✅ CORRECT: Renderer uses only render coordinates
interface ThreeFiberRendererProps {
  renderGraph: IRenderGraph;  // ✅ Uses render graph, not logical graph
  onNodeClick?: (nodeId: string) => void;
}

function ThreeFiberRenderer({ renderGraph, onNodeClick }: ThreeFiberRendererProps) {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {renderGraph.getAllRenderNodes().map(([nodeId, renderNode]) => (
        <NodeMesh
          key={nodeId}
          position={[
            renderNode.position.x,       // ✅ Use computed render coordinates
            renderNode.position.y,
            renderNode.position.z || 0   // ✅ Respects layout engine decisions
          ]}
          color={renderNode.renderProps?.color || '#ff6b6b'}
          size={renderNode.renderProps?.size || 1}
          onClick={() => onNodeClick?.(nodeId)}
        />
      ))}
      
      {renderGraph.getAllRenderEdges().map(([edgeId, renderEdge]) => (
        <EdgeMesh
          key={edgeId}
          sourcePosition={renderGraph.getNodePosition(renderEdge.source)!}
          targetPosition={renderGraph.getNodePosition(renderEdge.target)!}
          color={renderEdge.renderProps?.color || '#999'}
        />
      ))}
      
      <OrbitControls />
    </Canvas>
  );
}

// ❌ WRONG: Never access logical graph directly in renderer
// function ThreeFiberRenderer({ logicalGraph }: { logicalGraph: IGraph }) {
//   // This violates separation - renderer shouldn't know about logical structure
// }
```

### graph-ui: Integration Layer
**File: `packages/graph-ui/src/components/canvas/GraphCanvas.tsx`**

```typescript
// ✅ CORRECT: Transform logical → render in UI layer
interface GraphCanvasProps {
  logicalGraph: IGraph;
  renderMode: '2d' | '3d';
  layoutOptions?: ILayoutOptions;
}

function GraphCanvas({ logicalGraph, renderMode, layoutOptions }: GraphCanvasProps) {
  const [renderGraph, setRenderGraph] = useState<IRenderGraph | null>(null);
  const layoutEngine = useMemo(() => new StandardLayoutEngine(), []);
  
  // ✅ Transform logical graph to render graph when inputs change
  useEffect(() => {
    if (logicalGraph) {
      const options: ILayoutOptions = {
        algorithm: 'preserve_logical',    // Maintain mathematical structure
        dimensions: renderMode === '3d' ? 3 : 2,
        preserveTopology: true,           // Keep 2D graphs planar in 3D
        spacing: 50,
        ...layoutOptions
      };
      
      const newRenderGraph = layoutEngine.transformToRender(logicalGraph, options);
      setRenderGraph(newRenderGraph);
    }
  }, [logicalGraph, renderMode, layoutOptions, layoutEngine]);
  
  if (!renderGraph) {
    return <div className="loading">Computing layout...</div>;
  }
  
  return (
    <div className="graph-canvas">
      {renderMode === '2d' ? (
        <SigmaRenderer renderGraph={renderGraph} />
      ) : (
        <ThreeFiberRenderer renderGraph={renderGraph} />
      )}
    </div>
  );
}
```

### Application Integration
**File: `packages/graph-test-app/src/components/graph/GraphManager.tsx`**

```typescript
// ✅ CORRECT: Application manages logical graph, UI handles rendering
function GraphManager() {
  const { logicalGraph, renderMode } = useSelector((state: RootState) => state.graph);
  const dispatch = useDispatch();
  
  const handleGraphBuilderSelection = (builderType: string, params: any) => {
    // Create logical graph using graph-core builders
    const newLogicalGraph = createGraphFromBuilder(builderType, params);
    
    // Store logical graph in state
    dispatch(setLogicalGraph(newLogicalGraph));
  };
  
  return (
    <div className="graph-manager">
      <GraphBuilderControls onGraphCreated={handleGraphBuilderSelection} />
      
      {logicalGraph && (
        <GraphCanvas 
          logicalGraph={logicalGraph}
          renderMode={renderMode}
        />
      )}
      
      <RenderModeControls 
        currentMode={renderMode}
        onModeChange={(mode) => dispatch(setRenderMode(mode))}
      />
    </div>
  );
}

// ✅ Uses graph-core builders (pure logical structure)
function createGraphFromBuilder(builderType: string, params: any): IGraph {
  switch (builderType) {
    case '2d_periodic':
      return build2DPeriodicLattice(params.width, params.height);
    case 'triangular':
      return buildTriangularLattice(params.width, params.height);
    // All builders return pure logical graphs
  }
}
```

## 7. Migration Strategy

### Immediate Priority (Phase 1 & 2)
**Target: Fix 3D visualization coordinate issues**

1. **Day 1-2: Type System Foundation**
   - Update `IGraphNode` interface (remove x,y coordinates)
   - Add logical position and render position types
   - Add graph metadata interface

2. **Day 3-4: Layout Engine Core** 
   - Implement basic `LayoutEngine` with preserve_logical algorithm
   - Create `RenderGraph` class for coordinate management
   - Add 2D→3D coordinate transformation (z=0 for 2D graphs)

3. **Day 5-6: Renderer Updates**
   - Fix `ThreeFiberRenderer` to use render coordinates
   - Update `SigmaRenderer` for compatibility
   - Add layout engine integration to `GraphCanvas`

```typescript
interface ILayoutEngine {
  transformToRender(graph: IGraph, options: ILayoutOptions): IRenderGraph;
  updateLayout(renderGraph: IRenderGraph, options: ILayoutOptions): IRenderGraph;
  supportsGraphType(graphType: string): boolean;
}
```

### Layout Types
```typescript
type LayoutType = '2d-grid' | '2d-force' | '3d-force' | '3d-sphere';

interface ILayoutOptions {
  type: LayoutType;
  dimensions: 2 | 3;
  spacing?: number;
  preserveTopology?: boolean;
  centerGraph?: boolean;
}
```

## 4. Implementation Plan

### Phase 1: Core Types 
- [x] Clean separation of packages
- [x] Pure graph types in core
- [x] Rendering types in UI
- [x] Consistent coordinate system

### Phase 2: Layout Engine ✅
- [x] Standard layout implementation
- [x] Layout caching system
- [x] Topology preservation
- [x] Performance optimization
- [x] Dual renderer support (Sigma/Three.js)

### Phase 3: Renderers
- [ ] Update Sigma (2D)
- [ ] Update Three.js (3D)
- [ ] Renderer switching
- [ ] Visual properties

## 5. Success Criteria

1. **Clean Architecture**
   - No rendering in core
   - Type-safe interfaces
   - Clear dependencies

2. **Performance**
   - Cached layouts
   - Efficient updates
   - Lazy computation

3. **Developer Experience**
   - Clear separation
   - Easy debugging
   - Type safety

## 6. Future Extensions

- Animated transitions
- Custom layouts
- Interactive positioning
- Layout presets