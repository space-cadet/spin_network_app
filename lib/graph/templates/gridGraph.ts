/**
 * Grid graph template implementation
 */

import { SimulationGraph } from '../../core/types';
import { GridGraphOptions } from './types';

/**
 * Create a 2D grid graph with nodes arranged in rows and columns
 * 
 * @param graph Empty graph to build upon
 * @param options Configuration options for the grid graph
 * @returns A new graph with a grid structure
 */
export function createGridGraph(graph: SimulationGraph, options: GridGraphOptions = {}): SimulationGraph {
  // Apply default options
  const {
    nodeCount = 9,
    spinType = 'fixed',
    fixedSpinValue = 0.5,
    minSpin = 0.5,
    maxSpin = 2.0,
    defaultIntertwiner = 2,
    nodeIdPrefix = 'node',
    edgeIdPrefix = 'edge',
    spacing = 80,
  } = options;
  
  // Validate node count
  if (nodeCount < 4) {
    throw new Error('Grid graph requires at least 4 nodes');
  }
  
  // Determine grid dimensions
  const size = options.rows && options.columns 
    ? { rows: options.rows, columns: options.columns }
    : calculateGridDimensions(nodeCount);
  
  // Build the graph
  let result = graph;
  
  // Create nodes in a grid
  let nodeIndex = 1;
  for (let row = 0; row < size.rows && nodeIndex <= nodeCount; row++) {
    for (let col = 0; col < size.columns && nodeIndex <= nodeCount; col++) {
      result = result.addNode({
        id: `${nodeIdPrefix}${nodeIndex}`,
        intertwiner: defaultIntertwiner,
        position: { 
          x: col * spacing, 
          y: row * spacing 
        },
        properties: {}
      });
      nodeIndex++;
    }
  }
  
  // Create horizontal edges
  let edgeIndex = 1;
  for (let row = 0; row < size.rows; row++) {
    for (let col = 0; col < size.columns - 1; col++) {
      const nodeIndex1 = row * size.columns + col + 1;
      const nodeIndex2 = row * size.columns + col + 2;
      
      if (nodeIndex1 <= nodeCount && nodeIndex2 <= nodeCount) {
        // Determine spin value based on spinType
        const spin = spinType === 'random' 
          ? minSpin + Math.random() * (maxSpin - minSpin) 
          : fixedSpinValue;
        
        result = result.addEdge({
          id: `${edgeIdPrefix}${edgeIndex++}`,
          sourceId: `${nodeIdPrefix}${nodeIndex1}`,
          targetId: `${nodeIdPrefix}${nodeIndex2}`,
          spin,
          properties: {}
        });
      }
    }
  }
  
  // Create vertical edges
  for (let row = 0; row < size.rows - 1; row++) {
    for (let col = 0; col < size.columns; col++) {
      const nodeIndex1 = row * size.columns + col + 1;
      const nodeIndex2 = (row + 1) * size.columns + col + 1;
      
      if (nodeIndex1 <= nodeCount && nodeIndex2 <= nodeCount) {
        // Determine spin value based on spinType
        const spin = spinType === 'random' 
          ? minSpin + Math.random() * (maxSpin - minSpin) 
          : fixedSpinValue;
        
        result = result.addEdge({
          id: `${edgeIdPrefix}${edgeIndex++}`,
          sourceId: `${nodeIdPrefix}${nodeIndex1}`,
          targetId: `${nodeIdPrefix}${nodeIndex2}`,
          spin,
          properties: {}
        });
      }
    }
  }
  
  return result;
}

/**
 * Calculate the dimensions of a grid to best approximate the given node count
 * 
 * @param nodeCount Total number of nodes in the grid
 * @returns Object containing rows and columns
 */
function calculateGridDimensions(nodeCount: number): { rows: number, columns: number } {
  const size = Math.ceil(Math.sqrt(nodeCount));
  
  // Try to make the grid more square-like
  for (let columns = size; columns >= 1; columns--) {
    const rows = Math.ceil(nodeCount / columns);
    if (rows * columns >= nodeCount) {
      return { rows, columns };
    }
  }
  
  // Fallback to square grid
  return { rows: size, columns: size };
}
