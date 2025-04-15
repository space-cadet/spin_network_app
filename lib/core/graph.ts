/**
 * Implementation of the SimulationGraph interface for the Spin Network library
 * 
 * This graph representation is designed to be compatible with both 2D and 3D
 * visualizations and to work with math.js for matrix operations.
 */

import * as math from 'mathjs';
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
    const adjacentNodeIds = this._adjacencyList.get(nodeId) || new Set<string>();
    return Array.from(adjacentNodeIds)
      .map(id => this._nodes.get(id))
      .filter((node): node is SimulationNode => node !== undefined);
  }

  /**
   * Get all edges connected to a specific node
   */
  getConnectedEdges(nodeId: string): SimulationEdge[] {
    const edgeIds = this._nodeEdges.get(nodeId) || new Set<string>();
    return Array.from(edgeIds)
      .map(id => this._edges.get(id))
      .filter((edge): edge is SimulationEdge => edge !== undefined);
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
    // Create a new graph to maintain immutability
    const newGraph = new SpinNetworkGraph();
    
    // Copy existing nodes and edges
    this._nodes.forEach(n => newGraph._nodes.set(n.id, n));
    this._edges.forEach(e => newGraph._edges.set(e.id, e));
    
    // Copy adjacency and node-edge relationships
    this._adjacencyList.forEach((adjNodes, nodeId) => {
      newGraph._adjacencyList.set(nodeId, new Set(adjNodes));
    });
    this._nodeEdges.forEach((edges, nodeId) => {
      newGraph._nodeEdges.set(nodeId, new Set(edges));
    });
    
    // Add the new node
    newGraph._nodes.set(node.id, node);
    newGraph._adjacencyList.set(node.id, new Set<string>());
    newGraph._nodeEdges.set(node.id, new Set<string>());
    
    return newGraph;
  }

  /**
   * Remove a node from the graph
   */
  removeNode(nodeId: string): SimulationGraph {
    // Create a new graph to maintain immutability
    const newGraph = new SpinNetworkGraph();
    
    // If node doesn't exist, return a copy of the current graph
    if (!this._nodes.has(nodeId)) {
      this._nodes.forEach(n => newGraph._nodes.set(n.id, n));
      this._edges.forEach(e => newGraph._edges.set(e.id, e));
      
      this._adjacencyList.forEach((adjNodes, nId) => {
        newGraph._adjacencyList.set(nId, new Set(adjNodes));
      });
      this._nodeEdges.forEach((edges, nId) => {
        newGraph._nodeEdges.set(nId, new Set(edges));
      });
      
      return newGraph;
    }
    
    // Get the edges connected to this node
    const connectedEdges = this.getConnectedEdges(nodeId);
    
    // Copy nodes (except the one being removed)
    this._nodes.forEach((n) => {
      if (n.id !== nodeId) {
        newGraph._nodes.set(n.id, n);
      }
    });
    
    // Copy edges (except those connected to the removed node)
    this._edges.forEach((e) => {
      if (e.sourceId !== nodeId && e.targetId !== nodeId) {
        newGraph._edges.set(e.id, e);
      }
    });
    
    // Update adjacency list and node-edge relationships
    this._adjacencyList.forEach((adjNodes, nId) => {
      if (nId !== nodeId) {
        const newAdjNodes = new Set<string>();
        adjNodes.forEach(adjId => {
          if (adjId !== nodeId) {
            newAdjNodes.add(adjId);
          }
        });
        newGraph._adjacencyList.set(nId, newAdjNodes);
      }
    });
    
    this._nodeEdges.forEach((edges, nId) => {
      if (nId !== nodeId) {
        const newEdges = new Set<string>();
        edges.forEach(edgeId => {
          const edge = this._edges.get(edgeId);
          if (edge && edge.sourceId !== nodeId && edge.targetId !== nodeId) {
            newEdges.add(edgeId);
          }
        });
        newGraph._nodeEdges.set(nId, newEdges);
      }
    });
    
    return newGraph;
  }

  /**
   * Add an edge to the graph
   */
  addEdge(edge: SimulationEdge): SimulationGraph {
    // Verify that source and target nodes exist
    if (!this._nodes.has(edge.sourceId) || !this._nodes.has(edge.targetId)) {
      throw new Error(`Source or target node not found for edge ${edge.id}`);
    }
    
    // Create a new graph to maintain immutability
    const newGraph = new SpinNetworkGraph();
    
    // Copy existing nodes and edges
    this._nodes.forEach(n => newGraph._nodes.set(n.id, n));
    this._edges.forEach(e => newGraph._edges.set(e.id, e));
    
    // Copy adjacency and node-edge relationships
    this._adjacencyList.forEach((adjNodes, nodeId) => {
      newGraph._adjacencyList.set(nodeId, new Set(adjNodes));
    });
    this._nodeEdges.forEach((edges, nodeId) => {
      newGraph._nodeEdges.set(nodeId, new Set(edges));
    });
    
    // Add the new edge
    newGraph._edges.set(edge.id, edge);
    
    // Update adjacency lists
    const sourceAdjList = newGraph._adjacencyList.get(edge.sourceId) || new Set<string>();
    sourceAdjList.add(edge.targetId);
    newGraph._adjacencyList.set(edge.sourceId, sourceAdjList);
    
    const targetAdjList = newGraph._adjacencyList.get(edge.targetId) || new Set<string>();
    targetAdjList.add(edge.sourceId);
    newGraph._adjacencyList.set(edge.targetId, targetAdjList);
    
    // Update node-edge relationships
    const sourceEdges = newGraph._nodeEdges.get(edge.sourceId) || new Set<string>();
    sourceEdges.add(edge.id);
    newGraph._nodeEdges.set(edge.sourceId, sourceEdges);
    
    const targetEdges = newGraph._nodeEdges.get(edge.targetId) || new Set<string>();
    targetEdges.add(edge.id);
    newGraph._nodeEdges.set(edge.targetId, targetEdges);
    
    return newGraph;
  }

  /**
   * Remove an edge from the graph
   */
  removeEdge(edgeId: string): SimulationGraph {
    // Create a new graph to maintain immutability
    const newGraph = new SpinNetworkGraph();
    
    // If edge doesn't exist, return a copy of the current graph
    const edge = this._edges.get(edgeId);
    if (!edge) {
      this._nodes.forEach(n => newGraph._nodes.set(n.id, n));
      this._edges.forEach(e => newGraph._edges.set(e.id, e));
      
      this._adjacencyList.forEach((adjNodes, nodeId) => {
        newGraph._adjacencyList.set(nodeId, new Set(adjNodes));
      });
      this._nodeEdges.forEach((edges, nodeId) => {
        newGraph._nodeEdges.set(nodeId, new Set(edges));
      });
      
      return newGraph;
    }
    
    // Copy nodes
    this._nodes.forEach(n => newGraph._nodes.set(n.id, n));
    
    // Copy edges (except the one being removed)
    this._edges.forEach(e => {
      if (e.id !== edgeId) {
        newGraph._edges.set(e.id, e);
      }
    });
    
    // Update adjacency list
    this._adjacencyList.forEach((adjNodes, nId) => {
      const newAdjNodes = new Set<string>(adjNodes);
      if (nId === edge.sourceId) {
        newAdjNodes.delete(edge.targetId);
      } else if (nId === edge.targetId) {
        newAdjNodes.delete(edge.sourceId);
      }
      newGraph._adjacencyList.set(nId, newAdjNodes);
    });
    
    // Update node-edge relationships
    this._nodeEdges.forEach((edges, nId) => {
      const newEdges = new Set<string>(edges);
      if (nId === edge.sourceId || nId === edge.targetId) {
        newEdges.delete(edgeId);
      }
      newGraph._nodeEdges.set(nId, newEdges);
    });
    
    return newGraph;
  }

  /**
   * Get the degree of a node (number of connected nodes)
   */
  getDegree(nodeId: string): number {
    // TO BE IMPLEMENTED
    return 0;
  }

  /**
   * Get the IDs of all neighboring nodes
   */
  getNeighbors(nodeId: string): string[] {
    // TO BE IMPLEMENTED
    return [];
  }

  /**
   * Convert the graph to an adjacency matrix using math.js
   */
  toAdjacencyMatrix(): math.Matrix {
    // TO BE IMPLEMENTED
    return math.matrix([]);
  }

  /**
   * Convert the graph to a Laplacian matrix using math.js
   */
  toLaplacianMatrix(weightFunction?: WeightFunction): math.Matrix {
    // TO BE IMPLEMENTED
    return math.matrix([]);
  }

  /**
   * Serialize the graph to a JSON object
   */
  toJSON(): Record<string, any> {
    // TO BE IMPLEMENTED
    return {};
  }

  /**
   * Create a graph from a JSON object
   */
  fromJSON(data: Record<string, any>): SimulationGraph {
    // TO BE IMPLEMENTED
    return this;
  }
}
