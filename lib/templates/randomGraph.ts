/**
 * Random graph template implementation
 */

import { SimulationGraph } from '../core/types';
import { RandomGraphOptions } from './types';

/**
 * Create a random graph with randomly positioned nodes and connections
 * 
 * @param graph Empty graph to build upon
 * @param options Configuration options for the random graph
 * @returns A new graph with a random structure
 */
export function createRandomGraph(graph: SimulationGraph, options: RandomGraphOptions = {}): SimulationGraph {
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
    width = 300,
    height = 300,
    connectivity = 0.5,
    ensureConnected = true
  } = options;
  
  // Validate node count
  if (nodeCount < 2) {
    throw new Error('Random graph requires at least 2 nodes');
  }
  
  // Validate connectivity factor
  if (connectivity < 0 || connectivity > 1) {
    throw new Error('Connectivity factor must be between 0 and 1');
  }
  
  // Build the graph
  let result = graph;
  
  // Create nodes with random positions
  for (let i = 0; i < nodeCount; i++) {
    result = result.addNode({
      id: `${nodeIdPrefix}${i+1}`,
      intertwiner: defaultIntertwiner,
      position: { 
        x: Math.random() * width, 
        y: Math.random() * height 
      },
      properties: {}
    });
  }
  
  // Create random edges
  // Determine target edge count based on connectivity factor
  const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2;
  const targetEdgeCount = Math.min(
    Math.max(nodeCount, Math.floor(maxPossibleEdges * connectivity)),
    maxPossibleEdges
  );
  
  // If we need to ensure the graph is connected
  if (ensureConnected) {
    // Start with a minimal spanning tree to ensure connectivity
    const connected = new Set([1]); // Start with node1 as connected
    const unconnected = new Set(Array.from({length: nodeCount - 1}, (_, i) => i + 2)); // All other nodes
    
    let edgeIndex = 1;
    
    // Connect all nodes to the growing tree
    while (unconnected.size > 0) {
      const targetId = Array.from(unconnected)[0];
      const sourceId = Array.from(connected)[Math.floor(Math.random() * connected.size)];
      
      // Determine spin value based on spinType
      const spin = spinType === 'random' 
        ? minSpin + Math.random() * (maxSpin - minSpin) 
        : fixedSpinValue;
      
      result = result.addEdge({
        id: `${edgeIdPrefix}${edgeIndex++}`,
        sourceId: `${nodeIdPrefix}${sourceId}`,
        targetId: `${nodeIdPrefix}${targetId}`,
        spin,
        properties: {}
      });
      
      connected.add(targetId);
      unconnected.delete(targetId);
    }
    
    // Add additional random edges to reach target count
    while (edgeIndex <= targetEdgeCount) {
      const sourceId = Math.floor(Math.random() * nodeCount) + 1;
      let targetId;
      do {
        targetId = Math.floor(Math.random() * nodeCount) + 1;
      } while (targetId === sourceId);
      
      const sourceNodeId = `${nodeIdPrefix}${sourceId}`;
      const targetNodeId = `${nodeIdPrefix}${targetId}`;
      
      // Check if this edge already exists
      const exists = result.edges.some(
        e => (e.sourceId === sourceNodeId && e.targetId === targetNodeId) || 
             (e.sourceId === targetNodeId && e.targetId === sourceNodeId)
      );
      
      if (!exists) {
        // Determine spin value based on spinType
        const spin = spinType === 'random' 
          ? minSpin + Math.random() * (maxSpin - minSpin) 
          : fixedSpinValue;
        
        result = result.addEdge({
          id: `${edgeIdPrefix}${edgeIndex++}`,
          sourceId: sourceNodeId,
          targetId: targetNodeId,
          spin,
          properties: {}
        });
      }
    }
  } else {
    // If we don't need to ensure connectivity, just add random edges
    let edgeIndex = 1;
    const edgeMap = new Map(); // Track created edges to avoid duplicates
    
    while (edgeIndex <= targetEdgeCount && edgeMap.size < maxPossibleEdges) {
      const sourceId = Math.floor(Math.random() * nodeCount) + 1;
      let targetId;
      do {
        targetId = Math.floor(Math.random() * nodeCount) + 1;
      } while (targetId === sourceId);
      
      // Ensure we have the smaller ID first to avoid duplicates
      const minId = Math.min(sourceId, targetId);
      const maxId = Math.max(sourceId, targetId);
      const edgeKey = `${minId}-${maxId}`;
      
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, true);
        
        // Determine spin value based on spinType
        const spin = spinType === 'random' 
          ? minSpin + Math.random() * (maxSpin - minSpin) 
          : fixedSpinValue;
        
        result = result.addEdge({
          id: `${edgeIdPrefix}${edgeIndex++}`,
          sourceId: `${nodeIdPrefix}${sourceId}`,
          targetId: `${nodeIdPrefix}${targetId}`,
          spin,
          properties: {}
        });
      }
    }
  }
  
  return result;
}
