/**
 * Edge-specific interaction handlers
 */
import { NetworkEdge } from '../../../../models/types';
import cytoscape from 'cytoscape';

/**
 * Create a regular edge between two nodes
 */
export const createEdge = (
  sourceId: string, 
  targetId: string,
  cy: cytoscape.Core | null,
  defaultSpin: number = 0.5
): NetworkEdge => {
  const timestamp = Date.now();
  const newEdgeId = `edge-${timestamp}-${Math.floor(Math.random() * 1000)}`;
  
  // Default edge with required properties
  const newEdge: NetworkEdge = {
    id: newEdgeId,
    source: sourceId,
    target: targetId,
    spin: defaultSpin,
    label: `j=${defaultSpin}`,
    type: 'regular'
  };
  
  // Check if source and target exist and are placeholders
  if (cy) {
    const sourceNode = cy.$(`#${sourceId}`);
    const targetNode = cy.$(`#${targetId}`);
    
    // If the source is a placeholder, get its position
    if (sourceNode && sourceNode.data('type') === 'placeholder') {
      const pos = sourceNode.position();
      newEdge.sourcePosition = { x: pos.x, y: pos.y };
    }
    
    // If the target is a placeholder, get its position
    if (targetNode && targetNode.data('type') === 'placeholder') {
      const pos = targetNode.position();
      newEdge.targetPosition = { x: pos.x, y: pos.y };
    }
  }
  
  return newEdge;
};

/**
 * Create a dangling edge with one end connected to a node and the other floating
 */
export const createDanglingEdge = (
  sourceId: string,
  targetPosition: { x: number, y: number },
  defaultSpin: number = 0.5
): {
  edge: NetworkEdge;
  placeholderId: string | null;
} => {
  const timestamp = Date.now();
  const newEdgeId = `edge-${timestamp}-${Math.floor(Math.random() * 1000)}`;
  
  // Create dangling edge with no target
  const newEdge: NetworkEdge = {
    id: newEdgeId,
    source: sourceId,
    target: null,
    targetPosition,
    spin: defaultSpin,
    label: `j=${defaultSpin}`,
    type: 'dangling'
  };
  
  return {
    edge: newEdge,
    placeholderId: null
  };
};

/**
 * Create a dangling edge with placeholder node at one end
 */
export const createDanglingEdgeWithPlaceholder = (
  sourceId: string,
  targetPosition: { x: number, y: number },
  placeholderId: string,
  defaultSpin: number = 0.5
): NetworkEdge => {
  const timestamp = Date.now();
  const newEdgeId = `edge-${timestamp}-${Math.floor(Math.random() * 1000)}`;
  
  // Create edge with target as placeholder
  const newEdge: NetworkEdge = {
    id: newEdgeId,
    source: sourceId,
    target: placeholderId,
    spin: defaultSpin,
    label: `j=${defaultSpin}`,
    type: 'dangling'
  };
  
  return newEdge;
};

/**
 * Check if two nodes already have an edge between them
 */
export const edgeExists = (
  cy: cytoscape.Core,
  sourceId: string,
  targetId: string
): boolean => {
  if (!cy) return false;
  
  // Check for edges in both directions
  const existingEdges = cy.edges().filter(edge => 
    (edge.data('source') === sourceId && edge.data('target') === targetId) ||
    (edge.data('source') === targetId && edge.data('target') === sourceId)
  );
  
  return existingEdges.length > 0;
};

/**
 * Get all edges connected to a node (helpful for node deletion)
 */
export const getConnectedEdges = (
  cy: cytoscape.Core,
  nodeId: string
): string[] => {
  if (!cy) return [];
  
  const node = cy.$(`#${nodeId}`);
  if (node.length === 0) return [];
  
  const connectedEdges = node.connectedEdges();
  return connectedEdges.map(edge => edge.id());
};
