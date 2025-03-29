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
  
  // State for edge creation
  const [edgeCreationState, setEdgeCreationState] = useState<{
    sourceId: string | null;
    sourceHandle: any | null;
  }>({
    sourceId: null,
    sourceHandle: null
  });
  
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
          selector: '.edge-preview',
          style: {
            'width': 3,
            'line-color': '#9ca3af',
            'line-style': 'dashed',
            'curve-style': 'bezier',
            'target-arrow-shape': 'none',
            'opacity': 0.75
          }
        },
        {
          selector: '.preview-node',
          style: {
            'opacity': 0,
            'events': 'no'
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
      
      // Ignore preview node
      if (element.id() === 'preview-target-node') return;
      
      // Only update selection if in select mode or if we need to select for edge creation
      if (mode === 'select' || (mode === 'addEdge' && element.isNode())) {
        dispatch(setSelectedElement({
          id: element.id(),
          type: element.isNode() ? 'node' : 'edge'
        }));
      }
    });

    cyInstance.on('unselect', 'node, edge', () => {
      // Only update selection if in select mode and not if we're in edge creation mode
      if (mode === 'select') {
        dispatch(setSelectedElement({ id: null, type: null }));
      }
    });
    
    // Add click handler for canvas and elements
    cyInstance.on('tap', (event) => {
      // If we clicked on the background
      if (event.target === cyInstance) {
        if (mode === 'addNode') {
          handleAddNode(event.position);
        } else if (mode !== 'addEdge') {
          // Clear selection when clicking background (except in addEdge mode)
          dispatch(clearSelection());
        }
      }
    });
    
    // Click handler for nodes
    cyInstance.on('tap', 'node', (event) => {
      const node = event.target;
      
      // Ignore preview node
      if (node.id() === 'preview-target-node') return;
      
      if (mode === 'addEdge') {
        handleAddEdgeNodeSelection(node);
        // Prevent event propagation
        event.originalEvent?.stopPropagation();
      } else if (mode === 'delete') {
        handleDeleteElement('node', node.id());
        // Prevent event propagation
        event.originalEvent?.stopPropagation();
      }
    });
    
    // Click handler for edges
    cyInstance.on('tap', 'edge', (event) => {
      const edge = event.target;
      
      if (mode === 'delete') {
        handleDeleteElement('edge', edge.id());
      }
    });

    // Set the cytoscape instance
    setCy(cyInstance);
    
    // Visual indicator for addNode mode - change cursor
    if (cyContainerRef.current) {
      cyContainerRef.current.style.cursor = 'default';
    }

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

  // Handle mode change
  useEffect(() => {
    if (!cy) return;
    
    // Reset edge creation state when changing modes
    if (mode !== 'addEdge') {
      setEdgeCreationState({
        sourceId: null,
        sourceHandle: null
      });
      
      // Remove any preview elements
      cy.$('#edge-preview, #preview-target-node').remove();
    }
    
    // Set appropriate interaction settings based on mode
    if (mode === 'select') {
      cy.userPanningEnabled(false);
      cy.boxSelectionEnabled(true);
      if (cyContainerRef.current) {
        cyContainerRef.current.style.cursor = 'default';
      }
    } else if (mode === 'pan') {
      cy.userPanningEnabled(true);
      cy.boxSelectionEnabled(false);
      if (cyContainerRef.current) {
        cyContainerRef.current.style.cursor = 'grab';
      }
    } else if (mode === 'addNode') {
      cy.userPanningEnabled(false);
      cy.boxSelectionEnabled(false);
      if (cyContainerRef.current) {
        cyContainerRef.current.style.cursor = 'cell';
      }
    } else if (mode === 'addEdge') {
      cy.userPanningEnabled(false);
      cy.boxSelectionEnabled(false);
      if (cyContainerRef.current) {
        cyContainerRef.current.style.cursor = 'crosshair';
      }
    } else if (mode === 'delete') {
      cy.userPanningEnabled(false);
      cy.boxSelectionEnabled(false);
      if (cyContainerRef.current) {
        cyContainerRef.current.style.cursor = 'not-allowed';
      }
    }
  }, [cy, mode]);
  
  // Handler for adding a new node at the specified position
  const handleAddNode = (position: { x: number, y: number }): void => {
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
    
    // Optionally select the new node
    setTimeout(() => {
      dispatch(setSelectedElement({
        id: newNodeId,
        type: 'node'
      }));
    }, 100);
  };
  
  // Track mouse position for edge preview
  useEffect(() => {
    if (!cy || !cyContainerRef.current || mode !== 'addEdge' || !edgeCreationState.sourceId) return;
    
    // Add specific styles just for preview elements
    cy.style().selector('#preview-target-node').style({
      'background-opacity': 0,
      'border-width': 0,
      'overlay-opacity': 0,
      'label': ''
    }).update();
    
    cy.style().selector('#edge-preview').style({
      'width': 3,
      'line-color': '#9ca3af',
      'line-style': 'dashed',
      'curve-style': 'bezier',
      'target-arrow-shape': 'none',
      'opacity': 0.75,
      'label': ''
    }).update();
    
    // Create or update edge preview when we have a source node
    const handleMouseMove = (event: MouseEvent) => {
      if (!cy || !cyContainerRef.current) return;
      
      // Get the position of the source node
      const sourceNode = cy.$(`#${edgeCreationState.sourceId}`);
      if (!sourceNode) return;
      
      // Remove any existing preview elements
      cy.$('#edge-preview, #preview-target-node').remove();
      
      // Convert mouse position to relative to the container
      const containerRect = cyContainerRef.current.getBoundingClientRect();
      const x = event.clientX - containerRect.left;
      const y = event.clientY - containerRect.top;
      
      // Add a temporary target node (invisible)
      cy.add({
        data: { id: 'preview-target-node' },
        position: { x, y },
        selectable: false
      });
      
      // Add the preview edge
      cy.add({
        data: { 
          id: 'edge-preview',
          source: edgeCreationState.sourceId,
          target: 'preview-target-node'
        },
        selectable: false
      });
    };
    
    cyContainerRef.current.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      if (cyContainerRef.current) {
        cyContainerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      cy.$('#edge-preview, #preview-target-node').remove();
    };
  }, [cy, mode, edgeCreationState.sourceId]);
  
  // Handler for node selection during edge creation
  const handleAddEdgeNodeSelection = (node: cytoscape.NodeSingular): void => {
    // If we don't have a source node yet, set this as the source
    if (!edgeCreationState.sourceId) {
      console.log('Selected source node:', node.id());
      setEdgeCreationState({
        sourceId: node.id(),
        sourceHandle: node
      });
      return;
    }
    
    // If we have a source and now selected a target
    if (edgeCreationState.sourceId && node.id() !== edgeCreationState.sourceId) {
      console.log('Selected target node:', node.id());
      console.log('Creating edge from', edgeCreationState.sourceId, 'to', node.id());
      
      const timestamp = Date.now();
      const newEdgeId = `edge-${timestamp}-${Math.floor(Math.random() * 1000)}`;
      
      const newEdge: NetworkEdge = {
        id: newEdgeId,
        source: edgeCreationState.sourceId,
        target: node.id(),
        spin: defaultEdgeSpin,
        label: `j=${defaultEdgeSpin}`
      };
      
      // Create the edge
      dispatch(addNetworkEdge(newEdge));
      
      // Reset edge creation state
      setEdgeCreationState({
        sourceId: null,
        sourceHandle: null
      });
      
      // Clear any preview elements
      if (cy) {
        cy.$('.edge-preview').remove();
        cy.$('#preview-target-node').remove();
      }
      
      // Select the new edge
      setTimeout(() => {
        dispatch(setSelectedElement({
          id: newEdgeId,
          type: 'edge'
        }));
      }, 100);
    }
  };
  
  // Handler for deleting elements
  const handleDeleteElement = (type: 'node' | 'edge', id: string): void => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'node') {
        dispatch(removeNetworkNode(id));
      } else {
        dispatch(removeNetworkEdge(id));
      }
      dispatch(clearSelection());
    }
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
    dispatch(setInteractionMode(newMode));
    
    // Clear selection when switching to certain modes
    if (newMode === 'addNode' || newMode === 'delete') {
      dispatch(setSelectedElement({ id: null, type: null }));
    }
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
          {mode === 'addEdge' && !edgeCreationState.sourceId && <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Select a source node</span>}
          {mode === 'addEdge' && edgeCreationState.sourceId && <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Select a target node</span>}
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
