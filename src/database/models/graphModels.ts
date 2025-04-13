/**
 * Graph data models for database storage
 */

/**
 * Represents a graph record in the database
 */
export interface GraphRecord {
  id?: number;          // Auto-incremented primary key
  networkId: string;    // Reference to the associated network
  timestamp: number;    // When the graph was created/updated
  nodes: number;        // Number of nodes in the graph
  edges: number;        // Number of edges in the graph
  properties: string;   // Serialized graph properties (JSON)
  description?: string; // Optional description
  type: string;         // Graph type (e.g., 'lattice', 'random', 'custom')
  name?: string;        // Optional user-defined name
  metadata?: string;    // Optional metadata (serialized JSON)
}

/**
 * Graph properties for analysis and visualization
 */
export interface GraphProperties {
  // Topological properties
  degree?: {
    min: number;
    max: number;
    average: number;
    distribution: Record<number, number>; // degree -> count
  };
  
  // Connectivity properties
  components?: number;  // Number of connected components
  diameter?: number;    // Graph diameter (longest shortest path)
  density?: number;     // Edge density
  
  // Spectral properties
  eigenvalues?: {
    min: number;
    max: number;
    spectrum?: number[]; // Eigenvalue spectrum (may be large)
  };
  
  // Geometric properties
  volume?: number;      // Total volume
  area?: number;        // Total area
  dimension?: number;   // Effective dimension
  
  // Custom properties
  [key: string]: any;   // Additional custom properties
}

/**
 * Query options for retrieving graph records
 */
export interface GraphQueryOptions {
  networkId?: string;       // Filter by network ID
  type?: string | string[]; // Filter by graph type
  startTime?: number;       // Filter by start time
  endTime?: number;         // Filter by end time
  minNodes?: number;        // Filter by minimum number of nodes
  maxNodes?: number;        // Filter by maximum number of nodes
  search?: string;          // Search in name or description
  limit?: number;           // Limit number of results
  offset?: number;          // Offset for pagination
  sortBy?: 'timestamp' | 'name' | 'nodes'; // Sort field
  sortDirection?: 'asc' | 'desc'; // Sort direction
}
