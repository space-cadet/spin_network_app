/**
 * Implementation of the SimulationGraph interface for the simulation component
 * 
 * This graph representation is designed to be compatible with both 2D and 3D
 * visualizations and to work with math.js for matrix operations.
 */

import * as math from 'mathjs';
import { SpinNetwork } from '../../models/types';
import { SimulationGraph, SimulationNode, SimulationEdge, WeightFunction } from './types';
import { MathAdapter } from './mathAdapter';

/**
 * Implementation of the SimulationGraph interface
 */
export class SpinNetworkGraph implements SimulationGraph {
  private _nodes: Map<string, SimulationNode>;
  private _edges: Map<string, SimulationEdge>;
  private _adjacencyList: Map<string, Set<string>>;
  private _nodeEdges: Map<string, Set<string>>;

  /**
   * Create a new SimulationGraph
   */
  constructor() {
    this._nodes = new Map();
    this._edges = new Map();
    this._adjacencyList = new Map();
    this._nodeEdges = new Map();
  }

  /**
   * Create a simulation graph from the application SpinNetwork model
   */
  fromSpinNetwork(network: SpinNetwork): SimulationGraph {
    const graph = new SpinNetworkGraph();
    
    // Add all nodes (skip placeholder nodes)
    for (const node of network.nodes) {
      if (node.type === 'placeholder') continue;
      
      graph._nodes.set(node.id, {
        id: node.id,
        intertwiner: node.intertwiner,
        position: {
          x: node.position.x,
          y: node.position.y,
          z: 0 // Default to z=0 for 2D networks
        },
        properties: node.properties || {}
      });
      
      // Initialize adjacency and edge lists
      graph._adjacencyList.set(node.id, new Set());
      graph._nodeEdges.set(node.id, new Set());
    }
    
    // Add all edges (skip dangling edges)
    for (const edge of network.edges) {
      if (edge.source === null || edge.target === null) continue;
      
      const sourceNode = graph._nodes.get(edge.source);
      const targetNode = graph._nodes.get(edge.target);
      
      if (sourceNode && targetNode) {
        // Create the edge
        const simEdge: SimulationEdge = {
          id: edge.id,
          sourceId: edge.source,
          targetId: edge.target,
          spin: edge.spin,
          properties: edge.properties || {}
        };
        
        graph._edges.set(edge.id, simEdge);
        
        // Update adjacency list
        graph._adjacencyList.get(edge.source)?.add(edge.target);
        graph._adjacencyList.get(edge.target)?.add(edge.source);
        
        // Update node-edge mapping
        graph._nodeEdges.get(edge.source)?.add(edge.id);
        graph._nodeEdges.get(edge.target)?.add(edge.id);
      }
    }
    
    return graph;
  }

  /**
   * Static factory method to create a graph from a SpinNetwork
   */
  static fromSpinNetwork(network: SpinNetwork): SimulationGraph {
    const instance = new SpinNetworkGraph();
    return instance.fromSpinNetwork(network);
  }

  /**
   * Convert the simulation graph back to a SpinNetwork
   */
  toSpinNetwork(networkTemplate?: SpinNetwork): SpinNetwork {
    // If we have a template, update it with our simulation values
    if (networkTemplate) {
      const result: SpinNetwork = {
        ...networkTemplate,
        nodes: [...networkTemplate.nodes],
        edges: [...networkTemplate.edges],
        metadata: {
          ...networkTemplate.metadata,
          modified: Date.now()
        }
      };
      
      // Update existing nodes with simulation values
      for (let i = 0; i < result.nodes.length; i++) {
        const node = result.nodes[i];
        const simNode = this._nodes.get(node.id);
        
        if (simNode) {
          result.nodes[i] = {
            ...node,
            intertwiner: simNode.intertwiner,
            properties: { ...node.properties, ...simNode.properties }
          };
        }
      }
      
      // Update existing edges with simulation values
      for (let i = 0; i < result.edges.length; i++) {
        const edge = result.edges[i];
        const simEdge = this._edges.get(edge.id);
        
        if (simEdge) {
          result.edges[i] = {
            ...edge,
            spin: simEdge.spin,
            properties: { ...edge.properties, ...simEdge.properties }
          };
        }
      }
      
      return result;
    }
    
    // If no template, create a new SpinNetwork from scratch
    // (this will not have proper layout information)
    const nodes = [...this._nodes.values()].map(node => ({
      id: node.id,
      position: {
        x: node.position.x,
        y: node.position.y
      },
      intertwiner: node.intertwiner,
      label: `Node ${node.id}`,
      properties: { ...node.properties }
    }));
    
    const edges = [...this._edges.values()].map(edge => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      spin: edge.spin,
      label: `j=${edge.spin}`,
      properties: { ...edge.properties }
    }));
    
    return {
      nodes,
      edges,
      metadata: {
        name: 'Simulated Network',
        created: Date.now(),
        modified: Date.now(),
        type: 'custom'
      }
    };
  }

  /**
   * Get all nodes in the graph
   */
  get nodes(): SimulationNode[] {
    return Array.from(this._nodes.values());
  }

  /**
   * Get all edges in the graph
   */
  get edges(): SimulationEdge[] {
    return Array.from(this._edges.values());
  }

  /**
   * Get a specific node by ID
   */
  getNode(id: string): SimulationNode | undefined {
    return this._nodes.get(id);
  }

  /**
   * Get a specific edge by ID
   */
  getEdge(id: string): SimulationEdge | undefined {
    return this._edges.get(id);
  }

  /**
   * Get all nodes adjacent to a specific node
   */
  getAdjacentNodes(nodeId: string): SimulationNode[] {
    const adjacentIds = this._adjacencyList.get(nodeId) || new Set<string>();
    return Array.from(adjacentIds)
      .map(id => this._nodes.get(id))
      .filter(node => node !== undefined) as SimulationNode[];
  }

  /**
   * Get all edges connected to a specific node
   */
  getConnectedEdges(nodeId: string): SimulationEdge[] {
    const edgeIds = this._nodeEdges.get(nodeId) || new Set<string>();
    return Array.from(edgeIds)
      .map(id => this._edges.get(id))
      .filter(edge => edge !== undefined) as SimulationEdge[];
  }

  /**
   * Get the number of nodes in the graph
   */
  getNodeCount(): number {
    return this._nodes.size;
  }

  /**
   * Get the number of edges in the graph
   */
  getEdgeCount(): number {
    return this._edges.size;
  }

  /**
   * Add a node to the graph
   */
  addNode(node: SimulationNode): SimulationGraph {
    // Create a new graph
    const newGraph = new SpinNetworkGraph();
    
    // Copy all existing nodes and edges
    this._nodes.forEach((n, id) => newGraph._nodes.set(id, n));
    this._edges.forEach((e, id) => newGraph._edges.set(id, e));
    
    // Copy adjacency and edge lists
    this._adjacencyList.forEach((adjacent, id) => {
      newGraph._adjacencyList.set(id, new Set(adjacent));
    });
    this._nodeEdges.forEach((edges, id) => {
      newGraph._nodeEdges.set(id, new Set(edges));
    });
    
    // Add the new node
    newGraph._nodes.set(node.id, node);
    newGraph._adjacencyList.set(node.id, new Set());
    newGraph._nodeEdges.set(node.id, new Set());
    
    return newGraph;
  }

  /**
   * Remove a node from the graph
   */
  removeNode(nodeId: string): SimulationGraph {
    if (!this._nodes.has(nodeId)) {
      return this; // Node doesn't exist, return unchanged
    }
    
    // Create a new graph
    const newGraph = new SpinNetworkGraph();
    
    // Copy nodes except the one to remove
    this._nodes.forEach((node, id) => {
      if (id !== nodeId) {
        newGraph._nodes.set(id, node);
      }
    });
    
    // Find edges connected to this node
    const connectedEdgeIds = this._nodeEdges.get(nodeId) || new Set<string>();
    
    // Copy edges except those connected to the removed node
    this._edges.forEach((edge, id) => {
      if (!connectedEdgeIds.has(id)) {
        newGraph._edges.set(id, edge);
      }
    });
    
    // Copy and update adjacency lists
    this._adjacencyList.forEach((adjacent, id) => {
      if (id !== nodeId) {
        const newAdjacent = new Set(adjacent);
        newAdjacent.delete(nodeId); // Remove the deleted node from adjacency
        newGraph._adjacencyList.set(id, newAdjacent);
      }
    });
    
    // Copy and update node-edge mappings
    this._nodeEdges.forEach((edges, id) => {
      if (id !== nodeId) {
        const newEdges = new Set<string>();
        
        // Only include edges that aren't connected to the removed node
        edges.forEach(edgeId => {
          if (!connectedEdgeIds.has(edgeId)) {
            newEdges.add(edgeId);
          }
        });
        
        newGraph._nodeEdges.set(id, newEdges);
      }
    });
    
    return newGraph;
  }

  /**
   * Add an edge to the graph
   */
  addEdge(edge: SimulationEdge): SimulationGraph {
    // Check if both endpoint nodes exist
    if (!this._nodes.has(edge.sourceId) || !this._nodes.has(edge.targetId)) {
      return this; // Nodes don't exist, return unchanged
    }
    
    // Create a new graph
    const newGraph = new SpinNetworkGraph();
    
    // Copy all existing nodes and edges
    this._nodes.forEach((n, id) => newGraph._nodes.set(id, n));
    this._edges.forEach((e, id) => newGraph._edges.set(id, e));
    
    // Copy adjacency and edge lists
    this._adjacencyList.forEach((adjacent, id) => {
      newGraph._adjacencyList.set(id, new Set(adjacent));
    });
    this._nodeEdges.forEach((edges, id) => {
      newGraph._nodeEdges.set(id, new Set(edges));
    });
    
    // Add the new edge
    newGraph._edges.set(edge.id, edge);
    
    // Update adjacency lists
    newGraph._adjacencyList.get(edge.sourceId)?.add(edge.targetId);
    newGraph._adjacencyList.get(edge.targetId)?.add(edge.sourceId);
    
    // Update node-edge mappings
    newGraph._nodeEdges.get(edge.sourceId)?.add(edge.id);
    newGraph._nodeEdges.get(edge.targetId)?.add(edge.id);
    
    return newGraph;
  }

  /**
   * Remove an edge from the graph
   */
  removeEdge(edgeId: string): SimulationGraph {
    const edge = this._edges.get(edgeId);
    if (!edge) {
      return this; // Edge doesn't exist, return unchanged
    }
    
    // Create a new graph
    const newGraph = new SpinNetworkGraph();
    
    // Copy all nodes
    this._nodes.forEach((n, id) => newGraph._nodes.set(id, n));
    
    // Copy edges except the one to remove
    this._edges.forEach((e, id) => {
      if (id !== edgeId) {
        newGraph._edges.set(id, e);
      }
    });
    
    // Copy and update adjacency lists
    // Only remove adjacency if this is the only edge between the nodes
    const { sourceId, targetId } = edge;
    let otherEdgesExist = false;
    
    for (const [id, e] of this._edges.entries()) {
      if (id !== edgeId && 
          ((e.sourceId === sourceId && e.targetId === targetId) ||
           (e.sourceId === targetId && e.targetId === sourceId))) {
        otherEdgesExist = true;
        break;
      }
    }
    
    this._adjacencyList.forEach((adjacent, id) => {
      const newAdjacent = new Set(adjacent);
      
      // Remove adjacency only if this was the only edge
      if (!otherEdgesExist) {
        if (id === sourceId) {
          newAdjacent.delete(targetId);
        } else if (id === targetId) {
          newAdjacent.delete(sourceId);
        }
      }
      
      newGraph._adjacencyList.set(id, newAdjacent);
    });
    
    // Copy and update node-edge mappings
    this._nodeEdges.forEach((edges, id) => {
      const newEdges = new Set(edges);
      newEdges.delete(edgeId); // Remove the edge from the mapping
      newGraph._nodeEdges.set(id, newEdges);
    });
    
    return newGraph;
  }

  /**
   * Get the degree of a node (number of connected nodes)
   */
  getDegree(nodeId: string): number {
    return this._adjacencyList.get(nodeId)?.size || 0;
  }

  /**
   * Get the IDs of all neighboring nodes
   */
  getNeighbors(nodeId: string): string[] {
    return Array.from(this._adjacencyList.get(nodeId) || new Set<string>());
  }

  /**
   * Convert the graph to an adjacency matrix using math.js
   */
  toAdjacencyMatrix(): math.Matrix {
    return MathAdapter.createAdjacencyMatrix(this);
  }

  /**
   * Convert the graph to a Laplacian matrix using math.js
   */
  toLaplacianMatrix(weightFunction?: WeightFunction): math.Matrix {
    return MathAdapter.createLaplacianMatrix(this, weightFunction);
  }
}
