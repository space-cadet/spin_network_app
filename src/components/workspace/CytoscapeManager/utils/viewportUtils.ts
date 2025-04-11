/**
 * Utility functions for viewport management in Cytoscape
 */
import cytoscape from 'cytoscape';

/**
 * Interface for viewport state
 */
export interface Viewport {
  pan: { x: number; y: number };
  zoom: number;
}

/**
 * Safely center and fit the graph in view
 * @param cy Cytoscape instance
 * @param padding Padding in pixels to leave around the graph
 */
export const safeFit = (cy: cytoscape.Core, padding: number = 100) => {
  if (!cy || cy.elements().length === 0) return;
  
  try {
    const visibleElements = cy.elements().filter(ele => ele.visible());
    if (visibleElements.length > 0) {
      // Use more padding to avoid nodes at the edges
      cy.fit(visibleElements, padding);
      
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

/**
 * Zoom in by a factor
 * @param cy Cytoscape instance
 * @param factor Zoom factor (default: 1.2)
 * @returns New zoom level
 */
export const zoomIn = (cy: cytoscape.Core, factor: number = 1.2): number => {
  if (!cy) return 1.0;
  
  const newZoom = cy.zoom() * factor;
  cy.zoom(newZoom);
  return newZoom;
};

/**
 * Zoom out by a factor
 * @param cy Cytoscape instance
 * @param factor Zoom factor (default: 1.2)
 * @returns New zoom level
 */
export const zoomOut = (cy: cytoscape.Core, factor: number = 1.2): number => {
  if (!cy) return 1.0;
  
  const newZoom = cy.zoom() / factor;
  cy.zoom(newZoom);
  return newZoom;
};

/**
 * Get current viewport information
 */
export const getViewport = (cy: cytoscape.Core): Viewport | null => {
  if (!cy) return null;
  
  return {
    pan: cy.pan(),
    zoom: cy.zoom()
  };
};

/**
 * Set a specific viewport configuration
 */
export const setViewport = (cy: cytoscape.Core, viewport: Viewport) => {
  if (!cy) return;
  
  cy.zoom(viewport.zoom);
  cy.pan(viewport.pan);
};

/**
 * Center on a specific element or collection
 */
export const centerOnElement = (
  cy: cytoscape.Core, 
  elementId: string,
  zoom?: number
) => {
  if (!cy) return;
  
  const element = cy.$(`#${elementId}`);
  if (element.length > 0) {
    cy.center(element);
    if (zoom !== undefined) {
      cy.zoom(zoom);
    }
  }
};
