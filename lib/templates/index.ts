/**
 * Graph Template Module
 * 
 * This module provides functions for generating common network topologies
 * such as lines, rings, grids, and random graphs.
 */

// Export type definitions
export * from './types';

// Export template generators
export { createLineGraph } from './lineGraph';
export { createRingGraph } from './ringGraph';
export { createGridGraph } from './gridGraph';
export { createRandomGraph } from './randomGraph';

// Re-export core types for convenience
import { SimulationGraph } from '../core/types';
import { 
  LineGraphOptions, 
  RingGraphOptions, 
  GridGraphOptions, 
  RandomGraphOptions 
} from './types';

// Import template functions
import { createLineGraph } from './lineGraph';
import { createRingGraph } from './ringGraph';
import { createGridGraph } from './gridGraph';
import { createRandomGraph } from './randomGraph';

/**
 * Factory function to create different types of graph templates
 * 
 * @param graphType Type of graph template to create
 * @param graph Empty graph instance to build upon
 * @param options Configuration options for the template
 * @returns A new graph with the specified template structure
 */
export function createGraphTemplate(
  graphType: 'line' | 'ring' | 'grid' | 'random',
  graph: SimulationGraph,
  options: LineGraphOptions | RingGraphOptions | GridGraphOptions | RandomGraphOptions = {}
): SimulationGraph {
  switch (graphType) {
    case 'line':
      return createLineGraph(graph, options as LineGraphOptions);
    case 'ring':
      return createRingGraph(graph, options as RingGraphOptions);
    case 'grid':
      return createGridGraph(graph, options as GridGraphOptions);
    case 'random':
      return createRandomGraph(graph, options as RandomGraphOptions);
    default:
      throw new Error(`Unknown graph type: ${graphType}`);
  }
}
