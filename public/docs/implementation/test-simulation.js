/**
 * Placeholder for test-simulation.js
 * This file is a fallback for when the actual simulation module is not available
 */

console.log('Loading placeholder test-simulation.js module');

// Mock implementation that displays a graceful error message
export function runSimulationTest() {
  console.error('Cannot run simulation test: Required modules are missing');
  
  // Display an error message in the results panel
  const resultsPanel = document.querySelector('.results-panel');
  if (resultsPanel) {
    resultsPanel.style.display = 'block';
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.style.backgroundColor = '#fee2e2';
    errorDiv.style.border = '1px solid #ef4444';
    errorDiv.style.color = '#b91c1c';
    errorDiv.style.padding = '12px';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.marginBottom = '16px';
    
    errorDiv.innerHTML = `
      <h3 style="margin-top: 0;">Missing Simulation Files</h3>
      <p>The simulation test cannot run because required files are missing.</p>
      <p style="margin-bottom: 0;">Please run <code>pnpm run build:lib</code> to generate the necessary files.</p>
    `;
    
    // Insert at the beginning of the results panel
    resultsPanel.insertBefore(errorDiv, resultsPanel.firstChild);
  }
  
  return Promise.resolve(false);
}

export function generateRandomNetwork(numNodes = 5, connectivity = 0.5) {
  console.error('Cannot generate random network: Required modules are missing');
  
  // Return a minimal mock network
  return {
    nodes: Array.from({ length: numNodes }, (_, i) => ({ 
      id: `node${i+1}`,
      position: { x: 100 * (i % 3), y: 100 * Math.floor(i/3) }
    })),
    edges: []
  };
}
