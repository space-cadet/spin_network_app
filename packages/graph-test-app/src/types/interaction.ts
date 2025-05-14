export type InteractionMode = 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete';

export interface InteractionHandlers {
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  onCanvasClick?: (x: number, y: number) => void;
  onZoomChange?: (level: number) => void;
}