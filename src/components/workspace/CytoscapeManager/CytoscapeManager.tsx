/**
 * CytoscapeManager component
 * Responsible for Cytoscape initialization and core visualization
 */
import React, { useRef, useEffect } from 'react';
import cytoscape from 'cytoscape';
import { SpinNetwork } from '../../../models/types';
import { useCytoscapeInstance } from './hooks/useCytoscapeInstance';
import { setModeInteractions } from './utils/cytoscapeSetup';
import { networkToCytoscape } from '../../../models/networkModel';
import { Viewport } from './utils/viewportUtils';

export interface CytoscapeManagerProps {
  network: SpinNetwork;
  styles: cytoscape.Stylesheet[];
  mode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete';
  onSelect?: (elementId: string, elementType: 'node' | 'edge') => void;
  onUnselect?: () => void;
  onViewportChange?: (viewport: Viewport) => void;
  onZoomChange?: (zoom: number) => void;
  onTap?: (event: cytoscape.EventObject) => void;
  className?: string;
}

const CytoscapeManager: React.FC<CytoscapeManagerProps> = ({
  network,
  styles,
  mode,
  onSelect,
  onUnselect,
  onViewportChange,
  onZoomChange,
  onTap,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use the Cytoscape instance hook
  const { cy, zoomLevel } = useCytoscapeInstance(containerRef, styles, {
    onSelect,
    onUnselect,
    onTap,
    onZoomChange,
    onViewportChange
  });
  
  // Set cursor based on interaction mode
  useEffect(() => {
    if (!containerRef.current) return;
    
    if (mode === 'select') {
      containerRef.current.style.cursor = 'default';
    } else if (mode === 'pan') {
      containerRef.current.style.cursor = 'grab';
    } else if (mode === 'addNode') {
      containerRef.current.style.cursor = 'cell';
    } else if (mode === 'addEdge') {
      containerRef.current.style.cursor = 'crosshair';
    } else if (mode === 'delete') {
      containerRef.current.style.cursor = 'not-allowed';
    }
  }, [mode]);
  
  // Apply mode-specific interactions
  useEffect(() => {
    if (!cy) return;
    
    // Set mode-specific interactions
    setModeInteractions(cy, mode);
  }, [cy, mode]);
  
  // Update graph when network changes
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
  
  return (
    <div 
      ref={containerRef} 
      className={`cy-container h-full w-full border border-gray-200 rounded-md ${className}`}
      data-testid="cytoscape-container"
    />
  );
};

export default CytoscapeManager;
