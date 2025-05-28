import { GraphologyAdapter } from '../../../graph-core/src/core/GraphologyAdapter';

export interface GraphCanvasProps {
  className?: string;
  graph?: GraphologyAdapter;
  defaultNodes?: GraphNode[];
  defaultEdges?: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
}

export interface GraphNode {
  id: string;
  label?: string;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  size?: number;
  color?: string;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId?: string;
  selectedEdgeId?: string;
}