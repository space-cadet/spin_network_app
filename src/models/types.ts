/**
 * Core type definitions for the Spin Network application
 */

/**
 * Represents a node (intertwiner) in the spin network
 */
export interface NetworkNode {
  id: string;
  position: {
    x: number;
    y: number;
  };
  intertwiner: number; // The intertwiner value (typically a half-integer)
  label?: string; // Optional display label
  properties?: Record<string, any>; // Additional custom properties
}

/**
 * Represents an edge (spin) in the spin network
 */
export interface NetworkEdge {
  id: string;
  source: string | null; // ID of the source node (null if dangling)
  target: string | null; // ID of the target node (null if dangling)
  spin: number; // The spin value (typically a half-integer)
  label?: string; // Optional display label
  sourcePosition?: { x: number, y: number }; // Position for dangling source end
  targetPosition?: { x: number, y: number }; // Position for dangling target end
  properties?: Record<string, any>; // Additional custom properties
}

/**
 * Represents the complete spin network
 */
export interface SpinNetwork {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  metadata: NetworkMetadata;
}

/**
 * Metadata for the spin network
 */
export interface NetworkMetadata {
  name: string; // Network name
  description?: string; // Optional description
  created: number; // Creation timestamp
  modified: number; // Last modification timestamp
  type?: 'empty' | 'lattice' | 'circular' | 'random' | 'custom'; // Network type
  properties?: Record<string, any>; // Additional custom properties
}

/**
 * Parameters for creating a lattice network
 */
export interface LatticeNetworkParams {
  rows: number; // Number of rows
  columns: number; // Number of columns
  defaultIntertwiner?: number; // Default intertwiner value for all nodes
  defaultSpin?: number; // Default spin value for all edges
}

/**
 * Parameters for creating a circular network
 */
export interface CircularNetworkParams {
  nodes: number; // Number of nodes in the circle
  radius?: number; // Circle radius
  defaultIntertwiner?: number; // Default intertwiner value for all nodes
  defaultSpin?: number; // Default spin value for all edges
  connectAll?: boolean; // If true, all nodes are connected to all others
}

/**
 * Parameters for creating a random network
 */
export interface RandomNetworkParams {
  nodes: number; // Number of nodes
  edgeProbability: number; // Probability of edge between any two nodes (0-1)
  defaultIntertwiner?: number; // Default intertwiner value for all nodes
  defaultSpin?: number; // Default spin value for all edges
}

/**
 * Type for supported operations on the network
 */
export type NetworkOperation = 
  | { type: 'ADD_NODE'; node: NetworkNode }
  | { type: 'UPDATE_NODE'; id: string; updates: Partial<NetworkNode> }
  | { type: 'REMOVE_NODE'; id: string }
  | { type: 'ADD_EDGE'; edge: NetworkEdge }
  | { type: 'UPDATE_EDGE'; id: string; updates: Partial<NetworkEdge> }
  | { type: 'REMOVE_EDGE'; id: string }
  | { type: 'CLEAR_NETWORK' }
  | { type: 'SET_NETWORK'; network: SpinNetwork };
