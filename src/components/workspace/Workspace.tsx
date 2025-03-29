import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { FaSearch, FaSearchMinus, FaSearchPlus, FaRegHandPaper } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedElement, setInteractionMode } from '../../store/slices/uiSlice';
import { selectNetwork, selectInteractionMode } from '../../store/selectors';
import { networkToCytoscape } from '../../models/networkModel';

const Workspace: React.FC = () => {
  const cyContainerRef = useRef<HTMLDivElement>(null);
  const [cy, setCy] = useState<cytoscape.Core | null>(null);
  const network = useAppSelector(selectNetwork);
  const mode = useAppSelector(selectInteractionMode);
  const dispatch = useAppDispatch();

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
      dispatch(setSelectedElement({
        id: element.id(),
        type: element.isNode() ? 'node' : 'edge'
      }));
    });

    cyInstance.on('unselect', 'node, edge', () => {
      dispatch(setSelectedElement({ id: null, type: null }));
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
  }, [dispatch]);

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
    
    if (mode === 'select') {
      cy.userPanningEnabled(false);
      cy.boxSelectionEnabled(true);
    } else if (mode === 'pan') {
      cy.userPanningEnabled(true);
      cy.boxSelectionEnabled(false);
    }
  }, [cy, mode]);

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
  const handleModeChange = (newMode: 'select' | 'pan') => {
    dispatch(setInteractionMode(newMode));
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
      <div className="text-sm text-gray-500 mb-2">
        <span>
          {network.nodes.length} nodes, {network.edges.length} edges
        </span>
        <span className="ml-4">
          {network.metadata.name} {network.metadata.type ? `(${network.metadata.type})` : ''}
        </span>
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
