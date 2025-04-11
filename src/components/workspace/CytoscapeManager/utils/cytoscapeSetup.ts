/**
 * Utility functions for Cytoscape setup and configuration
 */
import cytoscape from 'cytoscape';

/**
 * Initialize a Cytoscape instance with default settings
 * @param container The HTML element to contain the graph
 * @param styles Cytoscape stylesheet
 * @returns A new Cytoscape instance
 */
export const initializeCytoscape = (
  container: HTMLElement,
  styles: cytoscape.StylesheetCSS[]
): cytoscape.Core => {
  return cytoscape({
    container,
    style: styles,
    // Basic interactions
    userZoomingEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: true
  });
};

/**
 * Configure event listeners for a Cytoscape instance
 * @param cy Cytoscape instance
 * @param handlers Object containing event handler functions
 */
export const configureCytoscapeEvents = (
  cy: cytoscape.Core,
  handlers: {
    onSelect?: (element: cytoscape.SingularElementReturnValue) => void;
    onUnselect?: () => void;
    onZoom?: (zoom: number) => void;
    onTap?: (event: cytoscape.EventObject) => void;
  }
) => {
  // Selection events
  if (handlers.onSelect) {
    cy.on('select', 'node, edge', (event) => {
      handlers.onSelect?.(event.target);
    });
  }

  if (handlers.onUnselect) {
    cy.on('unselect', 'node, edge', () => {
      handlers.onUnselect?.();
    });
  }

  // Zoom events
  if (handlers.onZoom) {
    cy.on('zoom', () => {
      handlers.onZoom?.(cy.zoom());
    });
  }

  // Canvas tap event
  if (handlers.onTap) {
    cy.on('tap', (event) => {
      handlers.onTap?.(event);
    });
  }
};

/**
 * Remove all event listeners from a Cytoscape instance
 */
export const removeCytoscapeEvents = (cy: cytoscape.Core) => {
  cy.removeAllListeners();
};

/**
 * Set mode-specific interactions for a Cytoscape instance
 */
export const setModeInteractions = (
  cy: cytoscape.Core,
  mode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete'
) => {
  // First reset all interaction settings
  cy.userPanningEnabled(false);
  cy.boxSelectionEnabled(false);
  
  // Then configure based on mode
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
};
