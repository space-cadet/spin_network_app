/**
 * JavaScript bridge for the simulation component
 * 
 * This file re-exports all components from the TypeScript implementation
 * to allow direct usage from JavaScript/HTML without TypeScript compilation.
 */

// Re-export everything from the TypeScript implementation
export * from './index.ts';

// The HTML file imports these specific components directly, so make sure they're available
// Export the critical components with specific imports to ensure they're available
export { SpinNetworkGeometryCalculator } from './analysis/geometricProps';
export { SimulationAnalyzer } from './analysis/statistics';

// Export the main engine components directly as well
export { SpinNetworkSimulationEngineImpl } from './core/engineImplementation';
export { SimulationStateVector } from './core/stateVector';

// Add console logs for debugging
console.log('src/simulation/index.js loaded');
console.log('SpinNetworkGeometryCalculator available:', typeof SpinNetworkGeometryCalculator !== 'undefined');
console.log('SimulationAnalyzer available:', typeof SimulationAnalyzer !== 'undefined');
