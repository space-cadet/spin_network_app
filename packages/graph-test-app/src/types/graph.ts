// Core graph type definitions
export interface GraphNode {
  id: string;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  properties?: Record<string, any>;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type InteractionMode = 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete';
