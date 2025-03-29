import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { FaSearch, FaSearchMinus, FaSearchPlus, FaRegHandPaper, FaPlus, FaLink, FaTrash } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedElement, setInteractionMode, clearSelection } from '../../store/slices/uiSlice';
import { 
  selectNetwork, 
  selectInteractionMode
} from '../../store/selectors';
import { 
  networkToCytoscape
} from '../../models/networkModel';
import { 
  addNetworkNode, 
  addNetworkEdge, 
  removeNetworkNode, 
  removeNetworkEdge 
} from '../../store/slices/networkSlice';
import { NetworkNode, NetworkEdge } from '../../models/types';

const Workspace: React.FC = () => {
  const cyContainerRef = useRef<HTMLDivElement>(null);
  const [cy, setCy] = useState<cytoscape.Core | null>(null);
  const network = useAppSelector(selectNetwork);
  const mode = useAppSelector(selectInteractionMode);
  const dispatch = useAppDispatch();
  
  // State for edge creation - just store the source node ID
  const [edgeSourceId, setEdgeSourceId] = useState<string | null>(null);
  
  // Default values for new elements
  const defaultNodeIntertwiner = 1;
  const defaultEdgeSpin = 0.5;

  // Initialize cytoscape
  useEffect(() => {
    if (!cyContainerRef.current) return;

    const cyInstance = cytoscape({
      container: cyContainerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4f46e5',
            'label': 'data(label)',
            'color': '#fff',
            'text-outline-color': '#4f46e5',
            'text-outline-width': 2,
            'text-valign': 'center'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#3b82f6',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#334155',
            'text-background-color': '#fff',
            'text-background-opacity': 1,
            'text-background-padding': '2px'
          }
        },
        {
          selector: ':selected',
          style: {
            'background-color': '#ef4444',
            'line-color': '#ef4444',
            'border-width': 2,
            'border-color': '#fef2f2'
          }
        },
        {
          selector: '.source-node',
          style: {
            'border-width': 3,
            'border-color': '#10b981',
            'border-style': 'solid'
          }
        }
      ],
      // Basic interactions
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true
    });

    // Add selection event
    cyInstance.on('select', 'node, edge', (event) => {
      const element = event.target;
      
      // Only update selection if in select mode
      if (mode === 'select') {
        dispatch(setSelectedElement({
          id: element.id(),
          type: element.isNode() ? 'node' : 'edge'
        }));
      }
    });

    cyInstance.on('unselect', 'node, edge', () => {
      // Only update selection if in select mode
      if (mode === 'select') {
        dispatch(setSelectedElement({ id: null, type: null }));
      }
    });
    
    // Add click handler for canvas
    cyInstance.on('tap', (event) => {
      // If we clicked on the background
      if (event.target === cyInstance) {
        if (mode === 'addNode') {
          handleAddNode(event.position);
        } else if (mode === 'select') {
          // Clear selection when clicking background in select mode
          dispatch(clearSelection());
        }
      }
    });

    // Set the cytoscape instance
    setCy(cyInstance);
    
    // Handle window resize to redraw the graph
    const handleResize = () => {
      if (cyInstance) {
        cyInstance.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cyInstance.destroy();
    };
  }, [dispatch, mode]);

  // Update cursor based on mode
  useEffect(() => {
    if (!cyContainerRef.current) return;
    
    if (mode === 'select') {
      cyContainerRef.current.style.cursor = 'default';
    } else if (mode === 'pan') {
      cyContainerRef.current.style.cursor = 'grab';
    } else if (mode === 'addNode') {
      cyContainerRef.current.style.cursor = 'cell';
    } else if (mode === 'addEdge') {
      cyContainerRef.current.style.cursor = 'crosshair';
    } else if (mode === 'delete') {
      cyContainerRef.current.style.cursor = 'not-allowed';
    }
  }, [mode]);

  // Update cytoscape when network changes
  useEffect(() => {
    if (!cy) return;
    
    try {
      // Convert network to cytoscape format
      const elements = networkToCytoscape(network);
      
      // Clear the current graph
      cy.elements().remove();
      
      // Only add elements if there are any
      if (elements.length > 0) {
        cy.add(elements);
        
        // Use a delay to ensure elements are rendered
        setTimeout(() => {
          if (cy && cy.elements().length > 0) {
            try {
              // Only try to fit if we have visible elements
              const visibleElements = cy.elements().filter(ele => ele.visible());
              if (visibleElements.length > 0) {
                cy.zoom(1); // Reset zoom level first
                cy.pan({ x: 0, y: 0 }); // Reset pan position
                cy.fit(visibleElements, 50); // Then fit to visible elements
              }
              
              // Reattach handlers after network update
              if (mode === 'delete') {
                setupDeleteHandlers();
              }
              
              // Restore source node highlight if in edge creation mode
              if (mode === 'addEdge' && edgeSourceId) {
                cy.$(`#${edgeSourceId}`).addClass('source-node');
              }
            } catch (error) {
              console.warn('Non-critical render adjustment error:', error);
            }
          }
        }, 100); // Longer delay to ensure rendering is complete
      }
    } catch (error) {
      console.error('Error updating network visualization:', error);
    }
  }, [cy, network]);

  // Monitor for size changes in the container (for resizable panels)
  useEffect(() => {
    if (!cy) return;
    
    // Create a ResizeObserver to detect changes in the container size
    const resizeObserver = new ResizeObserver(() => {
      if (cy) {
        cy.resize();
      }
    });
    
    if (cyContainerRef.current) {
      resizeObserver.observe(cyContainerRef.current);
    }
    
    return () => {
      if (cyContainerRef.current) {
        resizeObserver.unobserve(cyContainerRef.current);
      }
    };
  }, [cy]);

  // Handle interaction mode change
  useEffect(() => {
    if (!cy) return;
    
    // Reset edge source ID when changing modes
    if (mode !== 'addEdge') {
      setEdgeSourceId(null);
    }
    
    // Set appropriate interaction settings based on mode
    if (mode === 'select') {
      cy.userPanningEnabled(false);
      cy.boxSelectionEnabled(true);
    } else if (mode === 'pan') {
      cy.userPanningEnabled(true);
      cy.boxSelectionEnabled(false);
    } else if (mode === 'addNode' || mode === 'addEdge' || mode === 'delete') {
      cy.userPanningEnabled(false);
      cy.boxSelectionEnabled(false);
    }
    
    // Add node click handler for different modes
    cy.nodes().unbind('tap');
    cy.nodes().bind('tap', (event) => {
      const node = event.target;
      
      if (mode === 'addEdge') {
        // First selection: set as source
        if (!edgeSourceId) {
          setEdgeSourceId(node.id());
          // Highlight the selected source node
          cy.$(`#${node.id()}`).addClass('source-node');
        } 
        // Second selection: create edge
        else if (node.id() !== edgeSourceId) {
          createEdge(edgeSourceId, node.id());
        }
      } else if (mode === 'select') {
        // Selection is handled by the select event
      }
    });
    
    // Set up delete handlers if in delete mode
    if (mode === 'delete') {
      setupDeleteHandlers();
    }
    
    // Reset any styling when changing modes
    if (mode !== 'addEdge' && edgeSourceId) {
      cy.$(`#${edgeSourceId}`).removeClass('source-node');
    }
  }, [cy, mode, edgeSourceId]);
  
  // Function to create an edge between source and target nodes
  const createEdge = (sourceId: string, targetId: string) => {
    const timestamp = Date.now();
    const newEdgeId = `edge-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    
    const newEdge: NetworkEdge = {
      id: newEdgeId,
      source: sourceId,
      target: targetId,
      spin: defaultEdgeSpin,
      label: `j=${defaultEdgeSpin}`
    };
    
    // Create the edge
    dispatch(addNetworkEdge(newEdge));
    
    // Reset source node
    if (cy) {
      cy.$(`#${sourceId}`).removeClass('source-node');
    }
    setEdgeSourceId(null);
    
    // Select the new edge but stay in edge creation mode
    setTimeout(() => {
      dispatch(setSelectedElement({
        id: newEdgeId,
        type: 'edge'
      }));
      
      // Clear selection after a moment to prepare for the next edge
      setTimeout(() => {
        dispatch(clearSelection());
      }, 500);
    }, 100);
  };
  
  // Handler for adding a new node at the specified position
  const handleAddNode = (position: { x: number, y: number }) => {
    const timestamp = Date.now();
    const newNodeId = `node-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    
    const newNode: NetworkNode = {
      id: newNodeId,
      position: {
        x: position.x,
        y: position.y
      },
      intertwiner: defaultNodeIntertwiner,
      label: `Node ${network.nodes.length + 1}`
    };
    
    dispatch(addNetworkNode(newNode));
    
    // Briefly select the new node, then clear selection to prepare for next node
    setTimeout(() => {
      dispatch(setSelectedElement({
        id: newNodeId,
        type: 'node'
      }));
      
      // Clear selection after a moment
      setTimeout(() => {
        dispatch(clearSelection());
      }, 500);
    }, 100);
  };
  
  // Handler for deleting a node
  const deleteNode = (nodeId: string) => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      dispatch(removeNetworkNode(nodeId));
      dispatch(clearSelection());
      
      // Reattach delete event handlers after deletion
      setTimeout(() => {
        if (cy && mode === 'delete') {
          setupDeleteHandlers();
        }
      }, 100);
    }
  };
  
  // Handler for deleting an edge
  const deleteEdge = (edgeId: string) => {
    if (window.confirm('Are you sure you want to delete this edge?')) {
      dispatch(removeNetworkEdge(edgeId));
      dispatch(clearSelection());
      
      // Reattach delete event handlers after deletion
      setTimeout(() => {
        if (cy && mode === 'delete') {
          setupDeleteHandlers();
        }
      }, 100);
    }
  };
  
  // Setup handlers for delete mode
  const setupDeleteHandlers = () => {
    if (!cy) return;
    
    // Remove existing handlers
    cy.nodes().unbind('tap.delete');
    cy.edges().unbind('tap.delete');
    
    // Add node click handler for delete mode
    cy.nodes().bind('tap.delete', (event) => {
      deleteNode(event.target.id());
    });
    
    // Add edge click handler for delete mode
    cy.edges().bind('tap.delete', (event) => {
      deleteEdge(event.target.id());
    });
  };

  // Safe fit function with safeguards
  const safeFit = () => {
    if (!cy || cy.elements().length === 0) return;
    
    try {
      const visibleElements = cy.elements().filter(ele => ele.visible());
      if (visibleElements.length > 0) {
        cy.fit(visibleElements, 50);
      }
    } catch (error) {
      console.warn('Error during fit operation:', error);
    }
  };

  // Zoom functions
  const handleZoomIn = () => {
    if (cy) cy.zoom(cy.zoom() * 1.2);
  };
  
  const handleZoomOut = () => {
    if (cy) cy.zoom(cy.zoom() / 1.2);
  };
  
  const handleZoomFit = () => safeFit();

  // Mode functions
  const handleModeChange = (newMode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete') => {
    // If already in this mode, switch back to select mode (toggle behavior)
    if (mode === newMode) {
      dispatch(setInteractionMode('select'));
    } else {
      dispatch(setInteractionMode(newMode));
    }
    
    // Clear selection when switching modes
    dispatch(setSelectedElement({ id: null, type: null }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4">
        <h2 className="text-lg font-medium">Network Visualization</h2>
        <div className="flex-1"></div>
        
        {/* Mode buttons */}
        <button 
          className={`btn btn-sm ${mode === 'select' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleModeChange('select')}
          title="Select Mode"
        >
          <FaSearch />
        </button>
        
        <button 
          className={`btn btn-sm ${mode === 'pan' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleModeChange('pan')}
          title="Pan Mode"
        >
          <FaRegHandPaper />
        </button>
        
        <button 
          className={`btn btn-sm ${mode === 'addNode' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleModeChange('addNode')}
          title="Add Node"
        >
          <FaPlus />
        </button>
        
        <button 
          className={`btn btn-sm ${mode === 'addEdge' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleModeChange('addEdge')}
          title="Add Edge"
        >
          <FaLink />
        </button>
        
        <button 
          className={`btn btn-sm ${mode === 'delete' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleModeChange('delete')}
          title="Delete Element"
        >
          <FaTrash />
        </button>
        
        {/* Zoom controls */}
        <button 
          className="btn btn-sm btn-outline"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <FaSearchPlus />
        </button>
        
        <button 
          className="btn btn-sm btn-outline"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <FaSearchMinus />
        </button>
        
        <button 
          className="btn btn-sm btn-outline"
          onClick={handleZoomFit}
          title="Fit View"
        >
          <FaSearch />
        </button>
      </div>
      
      {/* Network information */}
      <div className="text-sm text-gray-500 mb-2 flex items-center justify-between">
        <div>
          <span>
            {network.nodes.length} nodes, {network.edges.length} edges
          </span>
          <span className="ml-4">
            {network.metadata.name} {network.metadata.type ? `(${network.metadata.type})` : ''}
          </span>
        </div>
        
        {/* Status indicator */}
        <div>
          {mode === 'select' && <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Select Mode</span>}
          {mode === 'pan' && <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Pan Mode</span>}
          {mode === 'addNode' && <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Click anywhere to add a node</span>}
          {mode === 'addEdge' && !edgeSourceId && <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Select a source node</span>}
          {mode === 'addEdge' && edgeSourceId && <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Select a target node</span>}
          {mode === 'delete' && <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Click on an element to delete it</span>}
        </div>
      </div>
      
      {/* Cytoscape container */}
      <div 
        ref={cyContainerRef} 
        className="cy-container flex-1 border border-gray-200 rounded-md"
      ></div>
    </div>
  );
};

export default Workspace;
