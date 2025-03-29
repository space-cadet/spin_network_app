import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { FaSearch, FaSearchMinus, FaSearchPlus, FaRegHandPaper } from 'react-icons/fa';
import { useNetwork } from '../../context/NetworkContext';
import { networkToCytoscape } from '../../models/networkModel';

const Workspace: React.FC = () => {
  const cyContainerRef = useRef<HTMLDivElement>(null);
  const [cy, setCy] = useState<cytoscape.Core | null>(null);
  const [mode, setMode] = useState<'select' | 'pan'>('select');
  const { network, setSelectedElement } = useNetwork();

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
      layout: {
        name: 'preset' // Use preset layout to respect node positions
      },
      // Basic interactions
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true
    });

    // Add selection event
    cyInstance.on('select', 'node, edge', (event) => {
      const element = event.target;
      setSelectedElement(
        element.id(), 
        element.isNode() ? 'node' : 'edge'
      );
    });

    cyInstance.on('unselect', 'node, edge', () => {
      setSelectedElement(null, null);
    });

    // Set the cytoscape instance
    setCy(cyInstance);

    // Handle window resize to redraw the graph
    const handleResize = () => {
      if (cyInstance) {
        cyInstance.resize();
        cyInstance.fit();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cyInstance.destroy();
    };
  }, [setSelectedElement]);

  // Update cytoscape when network changes
  useEffect(() => {
    if (!cy) return;
    
    try {
      // Convert network to cytoscape format
      const elements = networkToCytoscape(network);
      
      // Clear the current graph
      cy.elements().remove();
      
      // Add the new elements
      if (elements.length > 0) {
        cy.add(elements);
        
        // First use no layout to ensure nodes are in their defined positions
        cy.elements().positions((node) => {
          // This function returns positions for nodes only
          if (node.isNode()) {
            return {
              x: node.data('position')?.x || 0,
              y: node.data('position')?.y || 0
            };
          }
          return { x: 0, y: 0 }; // Fallback, won't be used for edges
        });
        
        // Fit the view to show all elements with padding
        cy.fit(undefined, 50);
        cy.center();
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

  // Zoom functions
  const handleZoomIn = () => cy?.zoom(cy.zoom() * 1.2);
  const handleZoomOut = () => cy?.zoom(cy.zoom() / 1.2);
  const handleZoomFit = () => {
    if (cy && cy.elements().length > 0) {
      cy.fit(undefined, 50);
    }
  };

  // Mode functions
  const handleModeChange = (newMode: 'select' | 'pan') => {
    setMode(newMode);
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
