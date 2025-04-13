/**
 * Service for managing graph data in the database
 */
import { db } from '../db.config';
import { GraphRecord, GraphProperties, GraphQueryOptions } from '../models/graphModels';

/**
 * Service for managing graph data in the database
 */
export class GraphService {
  /**
   * Create a new graph record
   * @param graph Graph data to store
   * @returns ID of the created graph record
   */
  static async createGraph(graph: Omit<GraphRecord, 'id'>): Promise<number> {
    try {
      // Ensure timestamp is set
      const record = {
        ...graph,
        timestamp: graph.timestamp || Date.now()
      };
      
      // Add to database
      const id = await db.graphs.add(record as GraphRecord);
      return id;
    } catch (error) {
      console.error('Failed to create graph record:', error);
      throw error;
    }
  }
  
  /**
   * Get a graph record by ID
   * @param id Graph record ID
   * @returns Graph record or undefined if not found
   */
  static async getGraph(id: number): Promise<GraphRecord | undefined> {
    try {
      return await db.graphs.get(id);
    } catch (error) {
      console.error('Failed to get graph record:', error);
      throw error;
    }
  }
  
  /**
   * Update a graph record
   * @param id Graph record ID
   * @param updates Properties to update
   * @returns true if updated, false if not found
   */
  static async updateGraph(
    id: number,
    updates: Partial<Omit<GraphRecord, 'id'>>
  ): Promise<boolean> {
    try {
      const count = await db.graphs.update(id, updates);
      return count > 0;
    } catch (error) {
      console.error('Failed to update graph record:', error);
      throw error;
    }
  }
  
  /**
   * Delete a graph record
   * @param id Graph record ID
   * @returns true if deleted, false if not found
   */
  static async deleteGraph(id: number): Promise<boolean> {
    try {
      const count = await db.graphs.delete(id);
      return count > 0;
    } catch (error) {
      console.error('Failed to delete graph record:', error);
      throw error;
    }
  }
  
  /**
   * Query graphs based on criteria
   * @param options Query options
   * @returns Array of matching graph records
   */
  static async queryGraphs(options: GraphQueryOptions = {}): Promise<GraphRecord[]> {
    try {
      let query = db.graphs.orderBy('timestamp').reverse();
      
      // Apply filters
      if (options.networkId) {
        query = query.filter(graph => graph.networkId === options.networkId);
      }
      
      if (options.type) {
        if (Array.isArray(options.type)) {
          query = query.filter(graph => options.type!.includes(graph.type));
        } else {
          query = query.filter(graph => graph.type === options.type);
        }
      }
      
      if (options.startTime !== undefined) {
        query = query.filter(graph => graph.timestamp >= options.startTime!);
      }
      
      if (options.endTime !== undefined) {
        query = query.filter(graph => graph.timestamp <= options.endTime!);
      }
      
      if (options.minNodes !== undefined) {
        query = query.filter(graph => graph.nodes >= options.minNodes!);
      }
      
      if (options.maxNodes !== undefined) {
        query = query.filter(graph => graph.nodes <= options.maxNodes!);
      }
      
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        query = query.filter(graph => 
          (graph.name && graph.name.toLowerCase().includes(searchTerm)) ||
          (graph.description && graph.description.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply sort
      if (options.sortBy) {
        if (options.sortBy === 'name') {
          query = db.graphs.orderBy('name');
        } else if (options.sortBy === 'nodes') {
          query = db.graphs.orderBy('nodes');
        } else {
          // Default is already timestamp
          query = db.graphs.orderBy('timestamp');
        }
        
        // Apply sort direction
        if (options.sortDirection === 'asc') {
          // Nothing to do, default is asc
        } else {
          query = query.reverse();
        }
      }
      
      // Apply pagination
      if (options.offset !== undefined) {
        query = query.offset(options.offset);
      }
      
      if (options.limit !== undefined) {
        query = query.limit(options.limit);
      }
      
      return await query.toArray();
    } catch (error) {
      console.error('Failed to query graphs:', error);
      throw error;
    }
  }
  
  /**
   * Get recent graphs
   * @param limit Maximum number of graphs to retrieve (default: 10)
   * @param networkId Optional network ID filter
   * @returns Array of recent graph records
   */
  static async getRecentGraphs(limit = 10, networkId?: string): Promise<GraphRecord[]> {
    try {
      let query = db.graphs.orderBy('timestamp').reverse();
      
      if (networkId) {
        query = query.filter(graph => graph.networkId === networkId);
      }
      
      return await query.limit(limit).toArray();
    } catch (error) {
      console.error('Failed to get recent graphs:', error);
      throw error;
    }
  }
  
  /**
   * Get the most recent graph for a network
   * @param networkId Network ID
   * @returns The most recent graph record or undefined if none found
   */
  static async getMostRecentGraph(networkId: string): Promise<GraphRecord | undefined> {
    try {
      return await db.graphs
        .where('networkId')
        .equals(networkId)
        .reverse()
        .first();
    } catch (error) {
      console.error('Failed to get most recent graph:', error);
      throw error;
    }
  }
  
  /**
   * Store graph properties for a network
   * @param networkId Network ID
   * @param graphData Graph data
   * @returns ID of the created graph record
   */
  static async storeGraphProperties(
    networkId: string,
    graphData: {
      nodes: number;
      edges: number;
      type: string;
      name?: string;
      description?: string;
      properties: GraphProperties;
      metadata?: Record<string, any>;
    }
  ): Promise<number> {
    try {
      return await this.createGraph({
        networkId,
        timestamp: Date.now(),
        nodes: graphData.nodes,
        edges: graphData.edges,
        type: graphData.type,
        name: graphData.name,
        description: graphData.description,
        properties: JSON.stringify(graphData.properties),
        metadata: graphData.metadata ? JSON.stringify(graphData.metadata) : undefined
      });
    } catch (error) {
      console.error('Failed to store graph properties:', error);
      throw error;
    }
  }
  
  /**
   * Get graph properties
   * @param id Graph record ID
   * @returns Parsed graph properties or null if not found
   */
  static async getGraphProperties(id: number): Promise<GraphProperties | null> {
    try {
      const graph = await this.getGraph(id);
      
      if (!graph || !graph.properties) {
        return null;
      }
      
      return JSON.parse(graph.properties) as GraphProperties;
    } catch (error) {
      console.error('Failed to get graph properties:', error);
      throw error;
    }
  }
  
  /**
   * Compare two graphs
   * @param id1 First graph ID
   * @param id2 Second graph ID
   * @returns Comparison data highlighting differences
   */
  static async compareGraphs(id1: number, id2: number): Promise<{
    graph1: GraphRecord;
    graph2: GraphRecord;
    properties1: GraphProperties;
    properties2: GraphProperties;
    differences: Record<string, { graph1: any; graph2: any }>;
  }> {
    try {
      const graph1 = await this.getGraph(id1);
      const graph2 = await this.getGraph(id2);
      
      if (!graph1 || !graph2) {
        throw new Error('One or both graphs not found');
      }
      
      const properties1 = await this.getGraphProperties(id1) || {};
      const properties2 = await this.getGraphProperties(id2) || {};
      
      // Compare properties to find differences
      const differences: Record<string, { graph1: any; graph2: any }> = {};
      
      // Compare basic properties
      if (graph1.nodes !== graph2.nodes) {
        differences.nodes = { graph1: graph1.nodes, graph2: graph2.nodes };
      }
      
      if (graph1.edges !== graph2.edges) {
        differences.edges = { graph1: graph1.edges, graph2: graph2.edges };
      }
      
      if (graph1.type !== graph2.type) {
        differences.type = { graph1: graph1.type, graph2: graph2.type };
      }
      
      // Compare graph properties
      const allKeys = new Set([
        ...Object.keys(properties1),
        ...Object.keys(properties2)
      ]);
      
      for (const key of allKeys) {
        // Skip comparing spectrum arrays directly
        if (key === 'eigenvalues' && 'spectrum' in (properties1[key] || {}) && 'spectrum' in (properties2[key] || {})) {
          // Compare only the length and min/max values
          const spectrum1 = properties1[key]?.spectrum || [];
          const spectrum2 = properties2[key]?.spectrum || [];
          
          if (spectrum1.length !== spectrum2.length) {
            differences[`eigenvalues.spectrum.length`] = { 
              graph1: spectrum1.length, 
              graph2: spectrum2.length 
            };
          }
          
          if (properties1[key]?.min !== properties2[key]?.min) {
            differences[`eigenvalues.min`] = { 
              graph1: properties1[key]?.min, 
              graph2: properties2[key]?.min 
            };
          }
          
          if (properties1[key]?.max !== properties2[key]?.max) {
            differences[`eigenvalues.max`] = { 
              graph1: properties1[key]?.max, 
              graph2: properties2[key]?.max 
            };
          }
          continue;
        }
        
        // For degree distribution, compare the overall shape rather than exact values
        if (key === 'degree' && 'distribution' in (properties1[key] || {}) && 'distribution' in (properties2[key] || {})) {
          // Compare only min, max and average values
          if (properties1[key]?.min !== properties2[key]?.min) {
            differences[`degree.min`] = { 
              graph1: properties1[key]?.min, 
              graph2: properties2[key]?.min 
            };
          }
          
          if (properties1[key]?.max !== properties2[key]?.max) {
            differences[`degree.max`] = { 
              graph1: properties1[key]?.max, 
              graph2: properties2[key]?.max 
            };
          }
          
          if (properties1[key]?.average !== properties2[key]?.average) {
            differences[`degree.average`] = { 
              graph1: properties1[key]?.average, 
              graph2: properties2[key]?.average 
            };
          }
          continue;
        }
        
        // For other properties, compare directly
        if (JSON.stringify(properties1[key]) !== JSON.stringify(properties2[key])) {
          differences[key] = { 
            graph1: properties1[key], 
            graph2: properties2[key] 
          };
        }
      }
      
      return {
        graph1,
        graph2,
        properties1,
        properties2,
        differences
      };
    } catch (error) {
      console.error('Failed to compare graphs:', error);
      throw error;
    }
  }
  
  /**
   * Export a graph to JSON format
   * @param id Graph record ID
   * @returns JSON string of the graph data
   */
  static async exportGraphToJson(id: number): Promise<string> {
    try {
      const graph = await this.getGraph(id);
      
      if (!graph) {
        throw new Error(`Graph with ID ${id} not found`);
      }
      
      return JSON.stringify(graph, null, 2);
    } catch (error) {
      console.error('Failed to export graph to JSON:', error);
      throw error;
    }
  }
  
  /**
   * Import a graph from JSON format
   * @param json JSON string of the graph data
   * @returns ID of the imported graph record
   */
  static async importGraphFromJson(json: string): Promise<number> {
    try {
      const importData = JSON.parse(json);
      
      // Create new graph record (without the existing ID)
      const { id, ...graphData } = importData;
      
      return await this.createGraph(graphData);
    } catch (error) {
      console.error('Failed to import graph from JSON:', error);
      throw error;
    }
  }
}
