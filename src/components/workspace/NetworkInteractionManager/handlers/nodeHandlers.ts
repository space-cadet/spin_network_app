/**
 * Node-specific interaction handlers
 */
import { NetworkNode } from '../../../../models/types';
import cytoscape from 'cytoscape';

/**
 * Generate a new node with default properties
 */
export const createNode = (
  position: { x: number, y: number },
  defaultIntertwiner: number = 1,
  nodeCount: number = 0
): NetworkNode => {
  const timestamp = Date.now();
  const newNodeId = `node-${timestamp}-${Math.floor(Math.random() * 1000)}`;
  
  return {
    id: newNodeId,
    position,
    intertwiner: defaultIntertwiner,
    label: `Node ${nodeCount + 1}`,
    type: 'regular'
  };
};

/**
 * Create a placeholder node (used for edge creation)
 */
export const createPlaceholderNode = (
  position: { x: number, y: number }
): NetworkNode => {
  const timestamp = Date.now();
  const placeholderId = `placeholder-${timestamp}-${Math.floor(Math.random() * 1000)}`;

  return {
    id: placeholderId,
    position,
    intertwiner: 0,
    label: '',
    type: 'placeholder'
  };
};

/**
 * Get necessary information to convert a placeholder to a real node
 */
export const getPlaceholderConversionInfo = (
  cy: cytoscape.Core,
  placeholderId: string,
  defaultIntertwiner: number = 1,
  nodeCount: number = 0
): {
  newNode: NetworkNode;
  edgeId?: string;
  endpoint?: 'source' | 'target';
} | null => {
  if (!cy) return null;
  
  const placeholder = cy.$(`#${placeholderId}`);
  if (placeholder.length === 0) return null;
  
  const position = placeholder.position();
  const timestamp = Date.now();
  const newNodeId = `node-${timestamp}-${Math.floor(Math.random() * 1000)}`;
  
  // Create a new real node at the placeholder position
  const newNode: NetworkNode = {
    id: newNodeId,
    position: {
      x: position.x,
      y: position.y
    },
    intertwiner: defaultIntertwiner,
    label: `Node ${nodeCount + 1}`
  };
  
  // Get the associated edge from the placeholder
  const edgeId = placeholder.data('edgeId');
  const endpoint = placeholder.data('endpoint');
  
  return {
    newNode,
    edgeId,
    endpoint: endpoint as 'source' | 'target'
  };
};

/**
 * Handle highlighting a node (e.g., for edge source selection)
 */
export const highlightNode = (
  cy: cytoscape.Core,
  nodeId: string,
  className: string = 'source-node'
) => {
  if (!cy) return;
  cy.$(`#${nodeId}`).addClass(className);
};

/**
 * Remove highlighting from a node
 */
export const unhighlightNode = (
  cy: cytoscape.Core,
  nodeId: string,
  className: string = 'source-node'
) => {
  if (!cy) return;
  cy.$(`#${nodeId}`).removeClass(className);
};
