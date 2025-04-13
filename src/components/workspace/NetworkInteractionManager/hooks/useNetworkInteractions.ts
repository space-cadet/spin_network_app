/**
 * Hook for managing network interaction state and handlers
 */
import { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { setupDeleteHandlers } from '../handlers/canvasHandlers';
import { highlightNode, unhighlightNode } from '../handlers/nodeHandlers';

export interface NetworkInteractionsOptions {
  mode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete';
  onDeleteNode?: (nodeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

/**
 * Hook to manage interaction state and bind appropriate handlers based on mode
 */
export const useNetworkInteractions = (
  cy: cytoscape.Core | null,
  options: NetworkInteractionsOptions
) => {
  const { mode, onDeleteNode, onDeleteEdge } = options;
  const [edgeSourceId, setEdgeSourceId] = useState<string | null>(null);
  const [lastDeletionTime, setLastDeletionTime] = useState<number>(0);
  
  // Reset edge source when changing modes
  useEffect(() => {
    if (mode !== 'addEdge' && edgeSourceId && cy) {
      unhighlightNode(cy, edgeSourceId);
      setEdgeSourceId(null);
    }
  }, [mode, cy, edgeSourceId]);
  
  // Wrap the delete callbacks to refresh handlers after deletion
  const wrappedDeleteNode = (nodeId: string) => {
    if (onDeleteNode) {
      onDeleteNode(nodeId);
      setLastDeletionTime(Date.now());
    }
  };
  
  const wrappedDeleteEdge = (edgeId: string) => {
    if (onDeleteEdge) {
      onDeleteEdge(edgeId);
      setLastDeletionTime(Date.now());
    }
  };
  
  // Setup mode-specific handlers - reruns when lastDeletionTime changes 
  useEffect(() => {
    if (!cy) return;
    
    // First remove all tap handlers to start fresh
    cy.nodes().unbind('tap');
    cy.edges().unbind('tap');
    
    // Set up mode-specific handlers
    if (mode === 'delete') {
      if (onDeleteNode && onDeleteEdge) {
        // Small timeout to ensure cy is in a stable state
        setTimeout(() => {
          setupDeleteHandlers(cy, {
            onDeleteNode: wrappedDeleteNode,
            onDeleteEdge: wrappedDeleteEdge
          });
        }, 50);
      }
    } else if (mode === 'addEdge') {
      // Setup edge creation mode handlers
      cy.nodes().filter('[type != "placeholder"]').bind('tap', (event) => {
        const node = event.target;
        
        // First selection: set as source
        if (!edgeSourceId) {
          setEdgeSourceId(node.id());
          highlightNode(cy, node.id());
        } 
        // Second selection: create edge (handled by parent component)
        // We just provide the source and target information
      });
      
      // Special case for placeholder nodes
      cy.nodes().filter('[type = "placeholder"]').bind('tap', (event) => {
        const node = event.target;
        
        // If we're already creating an edge, this is handled by parent
        // If this is the first click, we can use this placeholder as source
        if (!edgeSourceId) {
          setEdgeSourceId(node.id());
          highlightNode(cy, node.id());
        }
      });
    }
    
  }, [cy, mode, edgeSourceId, onDeleteNode, onDeleteEdge, lastDeletionTime]);
  
  // Reset any styling when changing modes
  useEffect(() => {
    if (mode !== 'addEdge' && edgeSourceId && cy) {
      unhighlightNode(cy, edgeSourceId);
    }
  }, [mode, cy, edgeSourceId]);
  
  // Helper to clear the current edge source
  const clearEdgeSource = () => {
    if (edgeSourceId && cy) {
      unhighlightNode(cy, edgeSourceId);
      setEdgeSourceId(null);
    }
  };
  
  return {
    edgeSourceId,
    setEdgeSourceId,
    clearEdgeSource
  };
};
