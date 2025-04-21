/**
 * Placeholder for simulation module
 * This file is a fallback for when the actual simulation module is not available
 */

console.log('Loading placeholder simulation module');

// Mock simulation classes with minimal implementations
export class SpinNetworkGeometryCalculator {
  constructor() {
    console.warn('Using placeholder SpinNetworkGeometryCalculator');
  }
  
  calculateTotalVolume() {
    console.warn('Using placeholder calculateTotalVolume method');
    return 0;
  }
  
  calculateTotalArea() {
    console.warn('Using placeholder calculateTotalArea method');
    return 0;
  }
  
  calculateEffectiveDimension() {
    console.warn('Using placeholder calculateEffectiveDimension method');
    return 0;
  }
  
  calculateVolumeEntropy() {
    console.warn('Using placeholder calculateVolumeEntropy method');
    return 0;
  }
}

export class SimulationAnalyzer {
  static calculateStatistics() {
    console.warn('Using placeholder calculateStatistics method');
    return {
      mean: 0,
      variance: 0,
      standardDeviation: 0,
      min: 0,
      max: 0
    };
  }
}

// Show an error message when imported
(() => {
  const errorMessage = 'Simulation module files are missing. Please run "pnpm run build:lib" to generate them.';
  console.error(errorMessage);
  
  // Display on page if possible
  setTimeout(() => {
    // Check if document is available (browser environment)
    if (typeof document !== 'undefined') {
      // Create error message element
      const errorDiv = document.createElement('div');
      errorDiv.style.backgroundColor = '#fee2e2';
      errorDiv.style.border = '1px solid #ef4444';
      errorDiv.style.color = '#b91c1c';
      errorDiv.style.padding = '12px';
      errorDiv.style.borderRadius = '4px';
      errorDiv.style.marginBottom = '16px';
      errorDiv.style.marginTop = '16px';
      
      errorDiv.innerHTML = `
        <h3 style="margin-top: 0;">Missing Simulation Files</h3>
        <p>${errorMessage}</p>
      `;
      
      // Try to insert in a sensible location
      const insertionPoint = document.querySelector('.output') || document.body;
      if (insertionPoint) {
        insertionPoint.insertBefore(errorDiv, insertionPoint.firstChild);
      }
    }
  }, 500);
})();
