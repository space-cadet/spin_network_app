/**
 * NetworkInteractionManager component
 * Handles network interactions like selection, creation, and deletion
 */
import React, { useCallback, useEffect } from 'react';
import cytoscape from 'cytoscape';
import { useNetworkInteractions } from './hooks/useNetworkInteractions';
import { createNode, createPlaceholderNode, getPlaceholderConversionInfo } from './handlers/nodeHandlers';
import { createEdge, createDanglingEdge, createDanglingEdgeWithPlaceholder } from './handlers/edgeHandlers';
import { handleCanvasClick, handleEdgeCreationCanvasClick } from './handlers/canvasHandlers';
import { SpinNetwork, NetworkNode, NetworkEdge } from '../../../models/types';

export interface NetworkInteractionManagerProps {
  cy: cytoscape.Core | null;
  network: SpinNetwork;
  mode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete';
  onAddNode?: (node: NetworkNode) => void;
  onAddEdge?: (edge: NetworkEdge) => void;
  onDeleteNode?: (nodeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onClearSelection?: () => void;
  onConvertPlaceholder?: (placeholderId: string, newNodeId: string, edgeId?: string, endpoint?: 'source' | 'target') => void;
  defaultNodeIntertwiner?: number;
  defaultEdgeSpin?: number;
}

const NetworkInteractionManager: React.FC<NetworkInteractionManagerProps> = ({
  cy,
  network,
  mode,
  onAddNode,
  onAddEdge,
  onDeleteNode,
  onDeleteEdge,
  onClearSelection,
  onConvertPlaceholder,
  defaultNodeIntertwiner = 1,
  defaultEdgeSpin = 0.5
}) => {
  // Use the network interactions hook for state and basic handlers
  const { edgeSourceId, setEdgeSourceId, clearEdgeSource } = useNetworkInteractions(cy, {
    mode,
    onDeleteNode,
    onDeleteEdge
  });
  
  // Handler for adding a new node
  const handleAddNode = useCallback((position: { x: number; y: number }) => {
    if (!onAddNode) return;
    
    const newNode = createNode(position, defaultNodeIntertwiner, network.nodes.length);
    onAddNode(newNode);
  }, [onAddNode, defaultNodeIntertwiner, network.nodes.length]);
  
  // Handler for creating an edge between two nodes
  const handleCreateEdge = useCallback((sourceId: string, targetId: string) => {
    if (!onAddEdge || !cy) return;
    
    const newEdge = createEdge(sourceId, targetId, cy, defaultEdgeSpin);
    onAddEdge(newEdge);
    clearEdgeSource();
  }, [onAddEdge, cy, defaultEdgeSpin, clearEdgeSource]);
  
  // Handler for creating a dangling edge
  const handleCreateDanglingEdge = useCallback((sourceId: string, position: { x: number; y: number }) => {
    if (!onAddEdge || !cy) return;
    
    // Check if source is a placeholder node
    const sourceNode = cy.$(`#${sourceId}`);
    
    if (sourceNode.data('type') === 'placeholder') {
      // Create another placeholder for the target
      if (onAddNode) {
        const placeholderNode = createPlaceholderNode(position);
        onAddNode(placeholderNode);
        
        // Create edge between the two placeholders
        const newEdge = createDanglingEdgeWithPlaceholder(
          sourceId, 
          position, 
          placeholderNode.id, 
          defaultEdgeSpin
        );
        onAddEdge(newEdge);
      }
    } else {
      // Regular node as source, create dangling edge
      const { edge } = createDanglingEdge(sourceId, position, defaultEdgeSpin);
      onAddEdge(edge);
    }
    
    clearEdgeSource();
  }, [onAddEdge, onAddNode, cy, defaultEdgeSpin, clearEdgeSource]);
  
  // Handler for placeholder creation
  const handleCreatePlaceholder = useCallback((position: { x: number; y: number }) => {
    if (!onAddNode) return '';
    
    const placeholder = createPlaceholderNode(position);
    onAddNode(placeholder);
    return placeholder.id;
  }, [onAddNode]);
  
  // Handler for canvas clicks
  const handleCanvasTap = useCallback((event: cytoscape.EventObject) => {
    if (!cy) return;
    
    if (mode === 'addEdge') {
      handleEdgeCreationCanvasClick(event, cy, edgeSourceId, {
        createPlaceholder: handleCreatePlaceholder,
        setEdgeSource: setEdgeSourceId,
        createDanglingEdge: handleCreateDanglingEdge
      });
    } else {
      handleCanvasClick(event, mode, cy, {
        onAddNode: handleAddNode,
        onClearSelection,
        onCreateDanglingEdge: handleCreateDanglingEdge
      });
    }
  }, [
    cy, 
    mode, 
    edgeSourceId, 
    handleCreatePlaceholder,
    setEdgeSourceId,
    handleCreateDanglingEdge,
    handleAddNode,
    onClearSelection
  ]);
  
  // Additional edge creation handlers
  useEffect(() => {
    if (!cy || mode !== 'addEdge') return;
    
    // Function to handle node tap during edge creation
    const handleNodeTapForEdge = (event: cytoscape.EventObjectData) => {
      const nodeId = event.target.id();
      
      // If we have a source but it's the same as this node, ignore
      if (edgeSourceId && nodeId === edgeSourceId) return;
      
      // If we have a source, create an edge to this node
      if (edgeSourceId) {
        handleCreateEdge(edgeSourceId, nodeId);
      }
    };
    
    // Add handlers for both regular and placeholder nodes
    cy.nodes().bind('tap', handleNodeTapForEdge);
    
    return () => {
      cy.nodes().unbind('tap', handleNodeTapForEdge);
    };
  }, [cy, mode, edgeSourceId, handleCreateEdge]);
  
  // Handler for placeholder conversion in select mode
  useEffect(() => {
    if (!cy || mode !== 'select' || !onConvertPlaceholder) return;
    
    // Function to handle placeholder tap in select mode
    const handlePlaceholderTap = (event: cytoscape.EventObjectData) => {
      const placeholderId = event.target.id();
      
      // Ask if the user wants to convert the placeholder to a real node
      if (window.confirm('Convert this placeholder to a real node?')) {
        const conversionInfo = getPlaceholderConversionInfo(
          cy, 
          placeholderId, 
          defaultNodeIntertwiner,
          network.nodes.length
        );
        
        if (conversionInfo) {
          onConvertPlaceholder(
            placeholderId, 
            conversionInfo.newNode.id,
            conversionInfo.edgeId,
            conversionInfo.endpoint
          );
          
          if (onAddNode) {
            onAddNode(conversionInfo.newNode);
          }
        }
      }
    };
    
    // Add handler only for placeholder nodes
    cy.nodes().filter('[type = "placeholder"]').bind('tap', handlePlaceholderTap);
    
    return () => {
      cy.nodes().filter('[type = "placeholder"]').unbind('tap', handlePlaceholderTap);
    };
  }, [cy, mode, onConvertPlaceholder, onAddNode, defaultNodeIntertwiner, network.nodes.length]);
  
  // Set up canvas tap handler
  useEffect(() => {
    if (!cy) return;
    
    // Add canvas tap handler
    cy.on('tap', handleCanvasTap);
    
    return () => {
      cy.removeListener('tap', handleCanvasTap);
    };
  }, [cy, handleCanvasTap]);
  
  // This is a non-visual component that just attaches handlers
  return null;
};

export default NetworkInteractionManager;
