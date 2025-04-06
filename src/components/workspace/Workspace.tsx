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
  removeNetworkEdge,
  updateNetworkEdge
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
          selector: 'node[type="regular"]',
          style: {
            'background-color': '#4f46e5',
            'label': 'data(label)',
            'color': '#fff',
            'text-outline-color': '#4f46e5',
            'text-outline-width': 2,
            'text-valign': 'center',
            'width': 80,
            'height': 80,
            'font-size': '14px'
          }
        },
        {
          selector: 'node[type="placeholder"]',
          style: {
            'background-color': '#f97316',
            'border-width': 2,
            'border-color': '#fb923c',
            'border-style': 'dashed',
            'width': 30,
            'height': 30,
            'shape': 'diamond',
            'opacity': 0.7,
            'label': ''
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
          selector: 'edge[hasDangling]',
          style: {
            'line-style': 'dashed',
            'line-color': '#f97316', // Match placeholder color
            'width': 2,
            'target-arrow-shape': 'none',
            'source-arrow-shape': 'none'
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
        } else if (mode === 'addEdge') {
          if (edgeSourceId) {
            // Create dangling edge from existing source to empty space
            createDanglingEdge(edgeSourceId, event.position);
          } else {
            // Start new edge from empty space by creating placeholder node
            const placeholderId = createPlaceholderNode(event.position);
            setEdgeSourceId(placeholderId);
            cyInstance.$(`#${placeholderId}`).addClass('source-node');
          }
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
                // If this is a new network with just 1-2 nodes, set a reasonable zoom
                if (visibleElements.length <= 2) {
                  cy.zoom(1.2); // Slightly zoomed in for better visibility
                  cy.center(visibleElements);
                } else {
                  // For networks with more nodes, fit with padding
                  cy.fit(visibleElements, 100);
                  
                  // Limit maximum zoom level
                  if (cy.zoom() > 1.5) {
                    cy.zoom(1.5);
                    cy.center(visibleElements);
                  }
                }
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
    
    // First remove all tap handlers to start fresh
    cy.nodes().unbind('tap');
    cy.edges().unbind('tap');
    
    // Set up mode-specific handlers
    if (mode === 'delete') {
      // Delete mode gets its own specialized handlers
      setupDeleteHandlers();
    } else if (mode === 'select') {
      // In select mode, allow converting placeholders to real nodes
      cy.nodes().filter('[type = "placeholder"]').bind('tap', (event) => {
        const node = event.target;
        console.log('Clicked on placeholder node in select mode:', node.id());
        
        // Ask if the user wants to convert the placeholder to a real node
        if (window.confirm('Convert this placeholder to a real node?')) {
          convertPlaceholderToNode(node.id());
        }
      });
    } else if (mode === 'addEdge') {
      // Add edge mode handlers for regular nodes
      cy.nodes().filter('[type != "placeholder"]').bind('tap', (event) => {
        const node = event.target;
        
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
      });
      
      // For placeholder nodes, allow connecting to them directly
      cy.nodes().filter('[type = "placeholder"]').bind('tap', (event) => {
        const node = event.target;
        console.log('Clicked on placeholder node in edge mode:', node.id());
        
        // If we're already creating an edge, connect to this placeholder
        if (edgeSourceId) {
          createEdge(edgeSourceId, node.id());
        }
        // If this is the first click, we can use this placeholder as source
        else {
          setEdgeSourceId(node.id());
          cy.$(`#${node.id()}`).addClass('source-node');
        }
      });
      
      // We'll handle the background click in the main canvas handler instead
      // This prevents multiple event handlers from conflicting
    }
    // Select mode handlers are managed by the select/unselect events
    
    // Reset any styling when changing modes
    if (mode !== 'addEdge' && edgeSourceId) {
      cy.$(`#${edgeSourceId}`).removeClass('source-node');
    }
  }, [cy, mode, edgeSourceId]);
  
  // Helper function to create an edge with a dangling end
  const createDanglingEdge = (sourceId: string, targetPosition: { x: number, y: number }) => {
    const timestamp = Date.now();
    const newEdgeId = `edge-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    
    // Check if source is a placeholder node
    let targetPlaceholderId: string | null = null;
    const sourceNode = cy?.$(`#${sourceId}`);
    
    // If source is a placeholder, use its position
    if (sourceNode?.data('type') === 'placeholder') {
      targetPlaceholderId = createPlaceholderNode(targetPosition);
    }
    
    // Create the edge with target information
    const newEdge: NetworkEdge = {
      id: newEdgeId,
      source: sourceId,
      target: targetPlaceholderId, // null or new placeholder ID
      targetPosition: targetPlaceholderId ? undefined : targetPosition,
      spin: defaultEdgeSpin,
      label: `j=${defaultEdgeSpin}`
    };
    
    console.log("Creating dangling edge:", newEdge);
    
    // Add the edge
    dispatch(addNetworkEdge(newEdge));
    
    // Reset source node styling
    if (cy) {
      cy.$(`#${sourceId}`).removeClass('source-node');
    }
    setEdgeSourceId(null);
  };
  
  // Function to create an edge between source and target nodes
  const createEdge = (sourceId: string, targetId: string) => {
    const timestamp = Date.now();
    const newEdgeId = `edge-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    
    // Check if source and target exist as actual nodes (vs. placeholders)
    let sourceNode = null;
    let targetNode = null;
    
    if (cy) {
      sourceNode = cy.$(`#${sourceId}`);
      targetNode = cy.$(`#${targetId}`);
    }
    
    const newEdge: NetworkEdge = {
      id: newEdgeId,
      source: sourceId,
      target: targetId,
      spin: defaultEdgeSpin,
      label: `j=${defaultEdgeSpin}`
    };
    
    // If the source or target is a placeholder, get its position
    if (sourceNode && sourceNode.data('type') === 'placeholder') {
      const pos = sourceNode.position();
      newEdge.sourcePosition = { x: pos.x, y: pos.y };
    }
    
    if (targetNode && targetNode.data('type') === 'placeholder') {
      const pos = targetNode.position();
      newEdge.targetPosition = { x: pos.x, y: pos.y };
    }
    
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
  
  // Helper function to convert a placeholder node to a real node
  const createPlaceholderNode = (position: { x: number, y: number }): string => {
    const timestamp = Date.now();
    const placeholderId = `placeholder-${timestamp}-${Math.floor(Math.random() * 1000)}`;

    const placeholderNode: NetworkNode = {
      id: placeholderId,
      position,
      intertwiner: 0, // Placeholder nodes have 0 intertwiner
      label: '',
      type: 'placeholder'
    };

    dispatch(addNetworkNode(placeholderNode));
    return placeholderId;
  };

  const convertPlaceholderToNode = (placeholderId: string) => {
    if (!cy) return;
    
    const placeholder = cy.$(`#${placeholderId}`);
    if (placeholder.length === 0) return;
    
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
      intertwiner: defaultNodeIntertwiner,
      label: `Node ${network.nodes.length + 1}`
    };
    
    dispatch(addNetworkNode(newNode));
    
    // Get the associated edge from the placeholder
    const edgeId = placeholder.data('edgeId');
    const endpoint = placeholder.data('endpoint');
    
    if (edgeId && endpoint) {
      // Update the edge to connect to the new node
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
  };
  
  // Handler for adding a new node at the specified position
  const handleAddNode = (position: { x: number, y: number }) => {
    const timestamp = Date.now();
    const newNodeId = `node-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    
    // Create new node
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
      if (cy) {
        // Ensure we don't zoom in too close when adding a node
        if (cy.zoom() > 1.5) {
          cy.zoom(1.5);
        }
        
        // Center on the new node with a slight offset to avoid stacking
        const nodeElement = cy.$(`#${newNodeId}`);
        if (nodeElement.length > 0) {
          cy.center(nodeElement);
        }
      }
      
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
    console.log("Deleting node:", nodeId);
    dispatch(removeNetworkNode(nodeId));
    dispatch(clearSelection());
    
    // Reattach delete event handlers after deletion
    setTimeout(() => {
      if (cy && mode === 'delete') {
        setupDeleteHandlers();
      }
    }, 100);
  };
  
  // Handler for deleting an edge
  const deleteEdge = (edgeId: string) => {
    console.log("Deleting edge:", edgeId);
    dispatch(removeNetworkEdge(edgeId));
    dispatch(clearSelection());
    
    // Reattach delete event handlers after deletion
    setTimeout(() => {
      if (cy && mode === 'delete') {
        setupDeleteHandlers();
      }
    }, 100);
  };
  
  // Setup handlers for delete mode
  const setupDeleteHandlers = () => {
    if (!cy) return;
    
    // Remove all existing tap handlers to avoid conflicts
    cy.nodes().unbind('tap');
    cy.edges().unbind('tap');
    
    // Add regular node click handler for delete mode
    cy.nodes().filter('[type != "placeholder"]').bind('tap', (event) => {
      event.preventDefault(); // Prevent other handlers from firing
      event.stopPropagation(); // Stop event from bubbling
      deleteNode(event.target.id());
    });
    
    // Add placeholder node click handler
    cy.nodes().filter('[type = "placeholder"]').bind('tap', (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Get the edge ID associated with this placeholder
      const node = event.target;
      const edgeId = node.data('edgeId');
      
      if (edgeId) {
        console.log("Deleting edge attached to placeholder:", edgeId);
        deleteEdge(edgeId);
      } else {
        console.log("Placeholder node has no associated edge");
      }
    });
    
    // Add edge click handler for delete mode
    cy.edges().bind('tap', (event) => {
      event.preventDefault(); // Prevent other handlers from firing
      event.stopPropagation(); // Stop event from bubbling
      deleteEdge(event.target.id());
    });
  };

  // Safe fit function with safeguards
  const safeFit = () => {
    if (!cy || cy.elements().length === 0) return;
    
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
