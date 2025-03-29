import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { FaSearch, FaSearchMinus, FaSearchPlus, FaRegHandPaper } from 'react-icons/fa';

interface WorkspaceProps {
  onElementSelect: (element: any) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ onElementSelect }) => {
  const cyContainerRef = useRef<HTMLDivElement>(null);
  const [cy, setCy] = useState<cytoscape.Core | null>(null);
  const [mode, setMode] = useState<'select' | 'pan'>('select');

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
        name: 'grid'
      },
      // Basic interactions
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true
    });

    // Add some sample data just for visualization purposes
    cyInstance.add([
      { 
        group: 'nodes', 
        data: { id: 'n1', label: 'Node 1', intertwiner: 0.5 },
        position: { x: 100, y: 100 }
      },
      { 
        group: 'nodes', 
        data: { id: 'n2', label: 'Node 2', intertwiner: 1 }, 
        position: { x: 200, y: 200 }
      },
      { 
        group: 'nodes', 
        data: { id: 'n3', label: 'Node 3', intertwiner: 1.5 }, 
        position: { x: 150, y: 250 }
      },
      { 
        group: 'edges', 
        data: { id: 'e1', source: 'n1', target: 'n2', label: 'j=1/2', spin: 0.5 } 
      },
      { 
        group: 'edges', 
        data: { id: 'e2', source: 'n2', target: 'n3', label: 'j=1', spin: 1 } 
      },
      { 
        group: 'edges', 
        data: { id: 'e3', source: 'n3', target: 'n1', label: 'j=3/2', spin: 1.5 } 
      }
    ]);

    // Add selection event
    cyInstance.on('select', 'node, edge', (event) => {
      const element = event.target;
      onElementSelect({
        id: element.id(),
        type: element.isNode() ? 'node' : 'edge',
        data: element.data()
      });
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
  }, [onElementSelect]);

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
  const handleZoomFit = () => cy?.fit();

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
      
      {/* Cytoscape container */}
      <div 
        ref={cyContainerRef} 
        className="cy-container flex-1"
      ></div>
    </div>
  );
};

export default Workspace;
