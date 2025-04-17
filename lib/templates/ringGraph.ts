/**
 * Ring graph template implementation
 */

import { SimulationGraph } from '../core/types';
import { RingGraphOptions } from './types';

/**
 * Create a ring graph with nodes arranged in a circle
 * 
 * @param graph Empty graph to build upon
 * @param options Configuration options for the ring graph
 * @returns A new graph with a ring structure
 */
export function createRingGraph(graph: SimulationGraph, options: RingGraphOptions = {}): SimulationGraph {
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
    radius = 150,
  } = options;
  
  // Default center to the radius if not specified
  const centerX = options.centerX ?? radius;
  const centerY = options.centerY ?? radius;
  
  // Validate node count
  if (nodeCount < 3) {
    throw new Error('Ring graph requires at least 3 nodes');
  }
  
  // Build the graph
  let result = graph;
  
  // Create nodes in a circle
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * 2 * Math.PI;
    result = result.addNode({
      id: `${nodeIdPrefix}${i+1}`,
      intertwiner: defaultIntertwiner,
      position: { 
        x: centerX + radius * Math.cos(angle), 
        y: centerY + radius * Math.sin(angle) 
      },
      properties: {}
    });
  }
  
  // Create edges around the ring
  for (let i = 0; i < nodeCount; i++) {
    const nextIndex = (i + 1) % nodeCount;
    
    // Determine spin value based on spinType
    const spin = spinType === 'random' 
      ? minSpin + Math.random() * (maxSpin - minSpin) 
      : fixedSpinValue;
    
    result = result.addEdge({
      id: `${edgeIdPrefix}${i+1}`,
      sourceId: `${nodeIdPrefix}${i+1}`,
      targetId: `${nodeIdPrefix}${nextIndex+1}`,
      spin,
      properties: {}
    });
  }
  
  return result;
}
