/**
 * Workspace component
 * Main container for the network visualization workspace
 */
import React, { useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedElement, setInteractionMode, clearSelection } from '../../store/slices/uiSlice';
import { 
  selectNetwork, 
  selectInteractionMode,
  selectViewSettings
} from '../../store/selectors';
import { useTypeBasedStyles } from '../../hooks/useTypeBasedStyles';
import { 
  addNetworkNode, 
  addNetworkEdge, 
  removeNetworkNode, 
  removeNetworkEdge,
  updateNetworkEdge
} from '../../store/slices/networkSlice';
import { NetworkNode, NetworkEdge } from '../../models/types';
import { useSimulation } from '../../hooks/useSimulation';
import { CytoscapeAdapter } from '../../simulation/visualization/cytoscapeAdapter';

// Import refactored components
import CytoscapeManager from './CytoscapeManager';
import NetworkInteractionManager from './NetworkInteractionManager';
import SimulationVisualizationManager from './SimulationVisualizationManager';
import WorkspaceControls from './WorkspaceControls';
import NetworkStatusBar from './NetworkStatusBar';
import ZoomControls from './ZoomControls';

const Workspace: React.FC = () => {
  // References and state
  const containerRef = useRef<HTMLDivElement>(null);
  const [cy, setCy] = useState<cytoscape.Core | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [edgeSourceId, setEdgeSourceId] = useState<string | null>(null);
  
  // Redux state
  const network = useAppSelector(selectNetwork);
  const mode = useAppSelector(selectInteractionMode);
  const viewSettings = useAppSelector(selectViewSettings);
  const dispatch = useAppDispatch();
  
  // Get simulation state
  const simulation = useSimulation();
  
  // Network styles - use type assertion to handle the complex type
  const networkStyles = useTypeBasedStyles() as unknown as cytoscape.StylesheetCSS[];
  
  // Default values for new elements
  const defaultNodeIntertwiner = 1;
  const defaultEdgeSpin = 0.5;
  
  // Cytoscape visualization adapter
  const [cytoscapeAdapter] = useState(() => new CytoscapeAdapter({
    colorScale: ['#dbeafe', '#3b82f6'], // Light blue to primary blue
    sizeScale: [25, 50],
    useColor: true,
    useSize: true,
    showValues: true,
    normalizeValues: true
  }));
  
  // Handler for interaction mode change
  const handleModeChange = (newMode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete') => {
    // Clear selection when switching modes
    dispatch(clearSelection());
    dispatch(setInteractionMode(newMode));
  };
  
  // Handler for element selection
  const handleSelect = useCallback((elementId: string, elementType: string) => {
    // Validate element type to make sure it's 'node' or 'edge'
    const validType = (elementType === 'node' || elementType === 'edge') ? elementType : 'node';
    if (mode === 'select') {
      // Validate element type to make sure it's 'node' or 'edge'
      const validType = (elementType === 'node' || elementType === 'edge') ? elementType : 'node';
      
      dispatch(setSelectedElement({
        id: elementId,
        type: validType
      }));
    }
  }, [dispatch, mode]);
  
  // Handler for element deselection
  const handleUnselect = useCallback(() => {
    if (mode === 'select') {
      dispatch(setSelectedElement({ id: null, type: null }));
    }
  }, [dispatch, mode]);
  
  // Handler for adding a node
  const handleAddNode = useCallback((node: NetworkNode) => {
    // Save history before the operation
    dispatch({ type: 'network/saveHistoryBeforeGroupOperation' });
    
    // Add the node
    dispatch(addNetworkNode(node));
    
    // Finalize the operation for proper history tracking
    dispatch({ type: 'network/finalizeGroupOperation' });
    
    // Briefly select the new node, then clear selection to prepare for next node
    setTimeout(() => {
      dispatch(setSelectedElement({
        id: node.id,
        type: 'node'
      }));
      
      // Clear selection after a moment
      setTimeout(() => {
        dispatch(clearSelection());
      }, 500);
    }, 100);
  }, [dispatch]);
  
  // Handler for adding an edge
  const handleAddEdge = useCallback((edge: NetworkEdge) => {
    // Save history before the operation
    dispatch({ type: 'network/saveHistoryBeforeGroupOperation' });
    
    // Add the edge
    dispatch(addNetworkEdge(edge));
    
    // Finalize the operation for proper history tracking
    dispatch({ type: 'network/finalizeGroupOperation' });
    
    // Select the new edge briefly
    setTimeout(() => {
      dispatch(setSelectedElement({
        id: edge.id,
        type: 'edge'
      }));
      
      // Clear selection after a moment to prepare for the next edge
      setTimeout(() => {
        dispatch(clearSelection());
      }, 500);
    }, 100);
  }, [dispatch]);
  
  // Handler for deleting a node
  const handleDeleteNode = useCallback((nodeId: string) => {
    // Save history before the deletion
    dispatch({ type: 'network/saveHistoryBeforeGroupOperation' });
    
    // Perform the deletion
    dispatch(removeNetworkNode(nodeId));
    dispatch(clearSelection());
    
    // Finalize the operation for proper history tracking
    dispatch({ type: 'network/finalizeGroupOperation' });
  }, [dispatch]);
  
  // Handler for deleting an edge
  const handleDeleteEdge = useCallback((edgeId: string) => {
    // Save history before the deletion
    dispatch({ type: 'network/saveHistoryBeforeGroupOperation' });
    
    // Perform the deletion
    dispatch(removeNetworkEdge(edgeId));
    dispatch(clearSelection());
    
    // Finalize the operation for proper history tracking
    dispatch({ type: 'network/finalizeGroupOperation' });
  }, [dispatch]);
  
  // Handler for converting a placeholder node to a regular node
  const handleConvertPlaceholder = useCallback((
    placeholderId: string, 
    newNodeId: string,
    edgeId?: string,
    endpoint?: 'source' | 'target'
  ) => {
    // Save history before the composite operation
    dispatch({ type: 'network/saveHistoryBeforeGroupOperation' });
    
    // If we have an associated edge, update it
    if (edgeId && endpoint) {
      const updates: Partial<NetworkEdge> = {};
      
      if (endpoint === 'source') {
        updates.source = newNodeId;
        updates.sourcePosition = undefined;
      } else if (endpoint === 'target') {
        updates.target = newNodeId;
        updates.targetPosition = undefined;
      }
      
      dispatch(updateNetworkEdge({
        id: edgeId,
        updates: updates
      }));
    }
    
    // Save history after the composite operation
    dispatch({ type: 'network/finalizeGroupOperation' });
  }, [dispatch]);
  
  // Zoom handlers
  const handleZoomChange = useCallback((zoom: number) => {
    setZoomLevel(zoom);
  }, []);
  
  // Handler for zoom controls
  const handleZoomIn = useCallback(() => {
    if (cy) {
      const newZoom = cy.zoom() * 1.2;
      cy.zoom(newZoom);
      setZoomLevel(newZoom);
    }
  }, [cy]);
  
  const handleZoomOut = useCallback(() => {
    if (cy) {
      const newZoom = cy.zoom() / 1.2;
      cy.zoom(newZoom);
      setZoomLevel(newZoom);
    }
  }, [cy]);
  
  const handleZoomFit = useCallback(() => {
    if (cy) {
      try {
        const visibleElements = cy.elements().filter(ele => ele.visible());
        if (visibleElements.length > 0) {
          // Use more padding (100px) to avoid nodes at the edges
          cy.fit(visibleElements, 100);
          
          // Limit maximum zoom level to prevent nodes from becoming too large
          if (cy.zoom() > 1.5) {
            cy.zoom(1.5);
            cy.center(visibleElements);
          }
          
          // Update zoom level
          setZoomLevel(cy.zoom());
        }
      } catch (error) {
        console.warn('Error during fit operation:', error);
      }
    }
  }, [cy]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Workspace controls/toolbar */}
      <WorkspaceControls
        mode={mode}
        onModeChange={handleModeChange}
        className="mb-4"
      />
      
      {/* Network status bar */}
      <NetworkStatusBar
        network={network}
        mode={mode}
        edgeSourceId={edgeSourceId}
        className="mb-2"
      />
      
      {/* Cytoscape container with visualizations */}
      <div className="relative flex-1 overflow-hidden">
        {/* Create a container that can scroll while keeping zoom controls fixed */}
        <div className="h-full overflow-auto relative">
          {/* Main Cytoscape visualization */}
          <CytoscapeManager
            network={network}
            styles={networkStyles}
            mode={mode}
            onSelect={handleSelect}
            onUnselect={handleUnselect}
            onZoomChange={handleZoomChange}
            onCytoscapeReady={setCy}
          />
          
          {/* Network interaction manager - non-visual component */}
          {cy && (
            <NetworkInteractionManager
              cy={cy}
              network={network}
              mode={mode}
              onAddNode={handleAddNode}
              onAddEdge={handleAddEdge}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
              onClearSelection={() => dispatch(clearSelection())}
              onConvertPlaceholder={handleConvertPlaceholder}
              onEdgeSourceChange={setEdgeSourceId}
              defaultNodeIntertwiner={defaultNodeIntertwiner}
              defaultEdgeSpin={defaultEdgeSpin}
            />
          )}
          
          {/* Simulation visualization manager - non-visual component */}
          {cy && (
            <SimulationVisualizationManager
              cy={cy}
              simulation={simulation}
              adapter={cytoscapeAdapter}
            />
          )}
        </div>
        
        {/* Zoom controls in separate layer to stay fixed */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
          <ZoomControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomFit={handleZoomFit}
            zoomLevel={zoomLevel}
            className="bg-white bg-opacity-90 shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default Workspace;
