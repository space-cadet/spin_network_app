/**
 * Line graph template implementation
 */

import { SimulationGraph } from '../core/types';
import { LineGraphOptions } from './types';

/**
 * Create a linear chain of nodes
 * 
 * @param graph Empty graph to build upon
 * @param options Configuration options for the line graph
 * @returns A new graph with a line structure
 */
export function createLineGraph(graph: SimulationGraph, options: LineGraphOptions = {}): SimulationGraph {
  // Apply default options
  const {
    nodeCount = 5,
    spinType = 'fixed',
    fixedSpinValue = 0.5,
    minSpin = 0.5,
    maxSpin = 2.0,
    defaultIntertwiner = 2,
    nodeIdPrefix = 'node',
    edgeIdPrefix = 'edge',
    spacing = 100,
    startX = 0,
    startY = 0
  } = options;
  
  // Validate node count
  if (nodeCount < 2) {
    throw new Error('Line graph requires at least 2 nodes');
  }
  
  // Build the graph
  let result = graph;
  
  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    result = result.addNode({
      id: `${nodeIdPrefix}${i+1}`,
      intertwiner: defaultIntertwiner,
      position: { 
        x: startX + i * spacing, 
        y: startY 
      },
      properties: {}
    });
  }
  
  // Create edges
  for (let i = 0; i < nodeCount - 1; i++) {
    // Determine spin value based on spinType
    const spin = spinType === 'random' 
      ? minSpin + Math.random() * (maxSpin - minSpin) 
      : fixedSpinValue;
    
    result = result.addEdge({
      id: `${edgeIdPrefix}${i+1}`,
      sourceId: `${nodeIdPrefix}${i+1}`,
      targetId: `${nodeIdPrefix}${i+2}`,
      spin,
      properties: {}
    });
  }
  
  return result;
}
