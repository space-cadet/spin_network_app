// This is a sample file to test the correct type signature for Cytoscape events
import * as cytoscape from 'cytoscape';

// Using correct import style
export function sampleUsage(cy: cytoscape.Core) {
  // Event handler function
  const handleTap = function(evt: cytoscape.EventObject) {
    console.log('Tapped:', evt.target.id());
  };

  // The simplest form should work
  cy.on('tap', handleTap);
  
  // Clean up with the same pattern
  cy.off('tap', handleTap);
}
