import { SpinNetwork } from '../models/types';

/**
 * Calculates usage statistics for node types in a network
 * @param network The spin network to analyze
 * @returns Record of type IDs mapped to usage counts
 */
export function calculateNodeTypeUsage(network: SpinNetwork): Record<string, number> {
  const usage: Record<string, number> = {};
  
  // Initialize with zero counts for all types
  network.nodes.forEach(node => {
    const typeId = node.type || 'regular';
    if (!usage[typeId]) {
      usage[typeId] = 0;
    }
  });
  
  // Count occurrences
  network.nodes.forEach(node => {
    const typeId = node.type || 'regular';
    usage[typeId] = (usage[typeId] || 0) + 1;
  });
  
  return usage;
}

/**
 * Calculates usage statistics for edge types in a network
 * @param network The spin network to analyze
 * @returns Record of type IDs mapped to usage counts
 */
export function calculateEdgeTypeUsage(network: SpinNetwork): Record<string, number> {
  const usage: Record<string, number> = {};
  
  // Initialize with zero counts for all types
  network.edges.forEach(edge => {
    const typeId = edge.type || 'regular';
    if (!usage[typeId]) {
      usage[typeId] = 0;
    }
  });
  
  // Count occurrences
  network.edges.forEach(edge => {
    const typeId = edge.type || 'regular';
    usage[typeId] = (usage[typeId] || 0) + 1;
  });
  
  // Special case for dangling edges
  const danglingEdges = network.edges.filter(edge => edge.source === null || edge.target === null);
  if (danglingEdges.length > 0) {
    usage['dangling'] = (usage['dangling'] || 0) + danglingEdges.length;
  }
  
  return usage;
}

/**
 * Calculates both node and edge type usage for a network
 * @param network The spin network to analyze
 * @returns Object containing both node and edge type usage statistics
 */
export function calculateTypeUsage(network: SpinNetwork): {
  nodeTypeUsage: Record<string, number>;
  edgeTypeUsage: Record<string, number>;
} {
  return {
    nodeTypeUsage: calculateNodeTypeUsage(network),
    edgeTypeUsage: calculateEdgeTypeUsage(network)
  };
}
