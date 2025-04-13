/**
 * Canvas-level interaction handlers
 */
import cytoscape from 'cytoscape';
import { createPlaceholderNode } from './nodeHandlers';
import { createDanglingEdge } from './edgeHandlers';

/**
 * Handle canvas click in different interaction modes
 */
export const handleCanvasClick = (
  event: cytoscape.EventObject,
  mode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete',
  cy: cytoscape.Core,
  callbacks: {
    onAddNode?: (position: { x: number, y: number }) => void;
    onClearSelection?: () => void;
    onStartEdgeCreation?: (sourceId: string) => void;
    onCreateDanglingEdge?: (sourceId: string, position: { x: number, y: number }) => void;
  }
) => {
  // Only process clicks on the background (canvas)
  if (event.target !== cy) return;
  
  // Handle based on mode
  switch (mode) {
    case 'addNode':
      if (callbacks.onAddNode) {
        callbacks.onAddNode(event.position);
      }
      break;
      
    case 'select':
      if (callbacks.onClearSelection) {
        callbacks.onClearSelection();
      }
      break;
      
    case 'addEdge':
      // This depends on internal state (edgeSourceId), so it's handled in the component
      break;
      
    default:
      // Other modes don't have special canvas click behaviors
      break;
  }
};

/**
 * Handle canvas click specifically for edge creation mode
 */
export const handleEdgeCreationCanvasClick = (
  event: cytoscape.EventObject,
  cy: cytoscape.Core,
  edgeSourceId: string | null,
  callbacks: {
    createPlaceholder?: (position: { x: number, y: number }) => string;
    setEdgeSource?: (sourceId: string) => void;
    createDanglingEdge?: (sourceId: string, position: { x: number, y: number }) => void;
  }
) => {
  // Only process clicks on the background (canvas)
  if (event.target !== cy) return;
  
  // If we already have a source node, create a dangling edge to the click position
  if (edgeSourceId) {
    if (callbacks.createDanglingEdge) {
      callbacks.createDanglingEdge(edgeSourceId, event.position);
    }
  } 
  // If we don't have a source node, create a placeholder at the click position
  else {
    if (callbacks.createPlaceholder && callbacks.setEdgeSource) {
      const placeholderId = callbacks.createPlaceholder(event.position);
      callbacks.setEdgeSource(placeholderId);
      
      // Highlight the placeholder as source
      cy.$(`#${placeholderId}`).addClass('source-node');
    }
  }
};

/**
 * Attach delete mode handlers to all elements
 */
export const setupDeleteHandlers = (
  cy: cytoscape.Core, 
  callbacks: {
    onDeleteNode: (nodeId: string) => void;
    onDeleteEdge: (edgeId: string) => void;
  }
) => {
  if (!cy) return;
  
  // Remove all existing tap handlers to avoid conflicts
  cy.nodes().unbind('tap');
  cy.edges().unbind('tap');
  
  // Add regular node click handler for delete mode
  cy.nodes().filter('[type != "placeholder"]').bind('tap', (event) => {
    event.preventDefault(); // Prevent other handlers from firing
    event.stopPropagation(); // Stop event from bubbling
    callbacks.onDeleteNode(event.target.id());
  });
  
  // Add placeholder node click handler
  cy.nodes().filter('[type = "placeholder"]').bind('tap', (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Get the edge ID associated with this placeholder
    const node = event.target;
    const edgeId = node.data('edgeId');
    
    if (edgeId) {
      callbacks.onDeleteEdge(edgeId);
    } else {
      // If there's no associated edge, delete the placeholder node directly
      callbacks.onDeleteNode(node.id());
    }
  });
  
  // Add edge click handler for delete mode
  cy.edges().bind('tap', (event) => {
    event.preventDefault(); // Prevent other handlers from firing
    event.stopPropagation(); // Stop event from bubbling
    callbacks.onDeleteEdge(event.target.id());
  });
};
