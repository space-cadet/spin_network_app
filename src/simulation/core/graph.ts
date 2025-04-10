/**
 * Implementation of the Graph interface for spin network simulation
 */

import { Graph, SimulationNode, SimulationEdge, Matrix, WeightFunction } from './types';
import { DenseMatrix } from './matrix';
import { SpinNetwork, NetworkNode, NetworkEdge } from '../../models/types';

/**
 * Default implementation of the Graph interface
 */
export class SimulationGraph implements Graph {
  private _nodes: Map<string, SimulationNode> = new Map();
  private _edges: Map<string, SimulationEdge> = new Map();
  private _adjacencyList: Map<string, Set<string>> = new Map();
  private _nodeEdges: Map<string, Set<string>> = new Map();

  /**
   * Create a new SimulationGraph
   */
  constructor() {}

  /**
   * Create a simulation graph from the application SpinNetwork model
   */
  static fromSpinNetwork(network: SpinNetwork): SimulationGraph {
    const graph = new SimulationGraph();
    
    // Add all nodes
    for (const node of network.nodes) {
      // Skip placeholder nodes
      if (node.type === 'placeholder') continue;
      
      graph.addNode({
        id: node.id,
        intertwiner: node.intertwiner,
        properties: node.properties || {}
      });
    }
    
    // Add all edges
    for (const edge of network.edges) {
      // Skip edges with dangling endpoints (null source or target)
      if (edge.source === null || edge.target === null) continue;
      
      graph.addEdge({
        id: edge.id,
        sourceId: edge.source,
        targetId: edge.target,
        spin: edge.spin,
        properties: edge.properties || {}
      });
    }
    
    return graph;
  }

  /**
   * Convert the simulation graph back to a SpinNetwork
   * Note: This preserves only the topological and quantum information,
   * not the visual layout information
   */
  toSpinNetwork(network?: SpinNetwork): SpinNetwork {
    const result: SpinNetwork = network ? { ...network } : {
      nodes: [],
      edges: [],
      metadata: {
        name: 'Simulated Network',
        created: Date.now(),
        modified: Date.now(),
        type: 'custom'
      }
    };
    
    // If there's an existing network, use it as a template
    // but update the node and edge properties we care about
    if (network) {
      // Update existing nodes
      result.nodes = network.nodes.map(node => {
        const simNode = this._nodes.get(node.id);
        if (simNode) {
          // Copy over the simulation values while preserving layout
          return {
            ...node,
            intertwiner: simNode.intertwiner,
            properties: { ...node.properties, ...simNode.properties }
          };
        }
        return node;
      });
      
      // Update existing edges
      result.edges = network.edges.map(edge => {
        const simEdge = this._edges.get(edge.id);
        if (simEdge) {
          // Copy over the simulation values while preserving layout
          return {
            ...edge,
            spin: simEdge.spin,
            properties: { ...edge.properties, ...simEdge.properties }
          };
        }
        return edge;
      });
      
      // Update metadata
      result.metadata = {
        ...network.metadata,
        modified: Date.now()
      };
      
      return result;
    }
    
    // Create a new network from scratch if no template was provided
    // This is a minimal conversion - no layout information
    
    // Create nodes
    const nodes: NetworkNode[] = [];
    for (const [_, node] of this._nodes.entries()) {
      nodes.push({
        id: node.id,
        position: { x: 0, y: 0 }, // Default position
        intertwiner: node.intertwiner,
        label: `Node ${node.id}`,
        properties: { ...node.properties }
      });
    }
    
    // Create edges
    const edges: NetworkEdge[] = [];
    for (const [_, edge] of this._edges.entries()) {
      edges.push({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        spin: edge.spin,
        label: `j=${edge.spin}`,
        properties: { ...edge.properties }
      });
    }
    
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

  //--------------------------------
  // Graph interface implementation
  //--------------------------------

  get nodes(): SimulationNode[] {
    return Array.from(this._nodes.values());
  }

  get edges(): SimulationEdge[] {
    return Array.from(this._edges.values());
  }

  getNode(id: string): SimulationNode | undefined {
    return this._nodes.get(id);
  }

  getEdge(id: string): SimulationEdge | undefined {
    return this._edges.get(id);
  }

  getAdjacentNodes(nodeId: string): SimulationNode[] {
    const adjacentIds = this._adjacencyList.get(nodeId) || new Set<string>();
    return Array.from(adjacentIds).map(id => this._nodes.get(id)!).filter(node => !!node);
  }

  getConnectedEdges(nodeId: string): SimulationEdge[] {
    const edgeIds = this._nodeEdges.get(nodeId) || new Set<string>();
    return Array.from(edgeIds).map(id => this._edges.get(id)!).filter(edge => !!edge);
  }

  getNodeCount(): number {
    return this._nodes.size;
  }

  getEdgeCount(): number {
    return this._edges.size;
  }

  addNode(node: SimulationNode): Graph {
    // Create a new graph to maintain immutability
    const newGraph = new SimulationGraph();
    
    // Copy existing nodes and edges
    for (const [id, existingNode] of this._nodes.entries()) {
      newGraph._nodes.set(id, { ...existingNode });
    }
    for (const [id, existingEdge] of this._edges.entries()) {
      newGraph._edges.set(id, { ...existingEdge });
    }
    
    // Copy adjacency list
    for (const [id, adjacentIds] of this._adjacencyList.entries()) {
      newGraph._adjacencyList.set(id, new Set(adjacentIds));
    }
    
    // Copy node-edges mapping
    for (const [id, edgeIds] of this._nodeEdges.entries()) {
      newGraph._nodeEdges.set(id, new Set(edgeIds));
    }
    
    // Add the new node
    newGraph._nodes.set(node.id, { ...node });
    newGraph._adjacencyList.set(node.id, new Set<string>());
    newGraph._nodeEdges.set(node.id, new Set<string>());
    
    return newGraph;
  }

  removeNode(nodeId: string): Graph {
    // Create a new graph to maintain immutability
    const newGraph = new SimulationGraph();
    
    // Skip if node doesn't exist
    if (!this._nodes.has(nodeId)) {
      return this;
    }
    
    // Copy nodes except the one being removed
    for (const [id, existingNode] of this._nodes.entries()) {
      if (id !== nodeId) {
        newGraph._nodes.set(id, { ...existingNode });
      }
    }
    
    // Find edges that connect to this node
    const connectedEdgeIds = this._nodeEdges.get(nodeId) || new Set<string>();
    
    // Copy edges except those connected to the removed node
    for (const [id, existingEdge] of this._edges.entries()) {
      if (!connectedEdgeIds.has(id)) {
        newGraph._edges.set(id, { ...existingEdge });
      }
    }
    
    // Update adjacency list
    for (const [id, adjacentIds] of this._adjacencyList.entries()) {
      if (id !== nodeId) {
        // Create a new set without the removed node
        const newAdjacentIds = new Set(adjacentIds);
        newAdjacentIds.delete(nodeId);
        newGraph._adjacencyList.set(id, newAdjacentIds);
      }
    }
    
    // Update node-edges mapping
    for (const [id, edgeIds] of this._nodeEdges.entries()) {
      if (id !== nodeId) {
        // Create a new set without edges connected to the removed node
        const newEdgeIds = new Set<string>();
        for (const edgeId of edgeIds) {
          if (!connectedEdgeIds.has(edgeId)) {
            newEdgeIds.add(edgeId);
          }
        }
        newGraph._nodeEdges.set(id, newEdgeIds);
      }
    }
    
    return newGraph;
  }

  addEdge(edge: SimulationEdge): Graph {
    // Create a new graph to maintain immutability
    const newGraph = new SimulationGraph();
    
    // Copy existing nodes and edges
    for (const [id, existingNode] of this._nodes.entries()) {
      newGraph._nodes.set(id, { ...existingNode });
    }
    for (const [id, existingEdge] of this._edges.entries()) {
      newGraph._edges.set(id, { ...existingEdge });
    }
    
    // Copy adjacency list
    for (const [id, adjacentIds] of this._adjacencyList.entries()) {
      newGraph._adjacencyList.set(id, new Set(adjacentIds));
    }
    
    // Copy node-edges mapping
    for (const [id, edgeIds] of this._nodeEdges.entries()) {
      newGraph._nodeEdges.set(id, new Set(edgeIds));
    }
    
    // Add the new edge if both nodes exist
    if (newGraph._nodes.has(edge.sourceId) && newGraph._nodes.has(edge.targetId)) {
      newGraph._edges.set(edge.id, { ...edge });
      
      // Update adjacency list
      const sourceAdjacent = newGraph._adjacencyList.get(edge.sourceId) || new Set<string>();
      sourceAdjacent.add(edge.targetId);
      newGraph._adjacencyList.set(edge.sourceId, sourceAdjacent);
      
      const targetAdjacent = newGraph._adjacencyList.get(edge.targetId) || new Set<string>();
      targetAdjacent.add(edge.sourceId);
      newGraph._adjacencyList.set(edge.targetId, targetAdjacent);
      
      // Update node-edges mapping
      const sourceEdges = newGraph._nodeEdges.get(edge.sourceId) || new Set<string>();
      sourceEdges.add(edge.id);
      newGraph._nodeEdges.set(edge.sourceId, sourceEdges);
      
      const targetEdges = newGraph._nodeEdges.get(edge.targetId) || new Set<string>();
      targetEdges.add(edge.id);
      newGraph._nodeEdges.set(edge.targetId, targetEdges);
    }
    
    return newGraph;
  }

  removeEdge(edgeId: string): Graph {
    // Create a new graph to maintain immutability
    const newGraph = new SimulationGraph();
    
    // Skip if edge doesn't exist
    const edgeToRemove = this._edges.get(edgeId);
    if (!edgeToRemove) {
      return this;
    }
    
    // Copy existing nodes
    for (const [id, existingNode] of this._nodes.entries()) {
      newGraph._nodes.set(id, { ...existingNode });
    }
    
    // Copy edges except the one being removed
    for (const [id, existingEdge] of this._edges.entries()) {
      if (id !== edgeId) {
        newGraph._edges.set(id, { ...existingEdge });
      }
    }
    
    // Update adjacency list (remove connections from source to target and vice versa)
    for (const [id, adjacentIds] of this._adjacencyList.entries()) {
      newGraph._adjacencyList.set(id, new Set(adjacentIds));
    }
    
    // Only remove the adjacency entry if this is the only edge between the nodes
    const sourceId = edgeToRemove.sourceId;
    const targetId = edgeToRemove.targetId;
    
    // Check if there are other edges between these nodes
    let otherEdgesExist = false;
    for (const [id, edge] of this._edges.entries()) {
      if (id !== edgeId && 
          ((edge.sourceId === sourceId && edge.targetId === targetId) ||
           (edge.sourceId === targetId && edge.targetId === sourceId))) {
        otherEdgesExist = true;
        break;
      }
    }
    
    // If no other edges exist, remove the adjacency entries
    if (!otherEdgesExist) {
      const sourceAdjacent = newGraph._adjacencyList.get(sourceId);
      if (sourceAdjacent) {
        sourceAdjacent.delete(targetId);
      }
      
      const targetAdjacent = newGraph._adjacencyList.get(targetId);
      if (targetAdjacent) {
        targetAdjacent.delete(sourceId);
      }
    }
    
    // Update node-edges mapping
    for (const [id, edgeIds] of this._nodeEdges.entries()) {
      const newEdgeIds = new Set(edgeIds);
      newEdgeIds.delete(edgeId);
      newGraph._nodeEdges.set(id, newEdgeIds);
    }
    
    return newGraph;
  }

  getDegree(nodeId: string): number {
    const adjacentNodes = this._adjacencyList.get(nodeId) || new Set<string>();
    return adjacentNodes.size;
  }

  getNeighbors(nodeId: string): string[] {
    const adjacentNodes = this._adjacencyList.get(nodeId) || new Set<string>();
    return Array.from(adjacentNodes);
  }

  toAdjacencyMatrix(): Matrix {
    const nodeIds = Array.from(this._nodes.keys());
    const n = nodeIds.length;
    const nodeIdToIndex = new Map<string, number>();
    
    // Create a mapping from node ID to matrix index
    for (let i = 0; i < n; i++) {
      nodeIdToIndex.set(nodeIds[i], i);
    }
    
    // Create a zero-filled matrix
    const matrix = new DenseMatrix(n, n);
    
    // Fill the adjacency matrix
    for (const edge of this._edges.values()) {
      const sourceIndex = nodeIdToIndex.get(edge.sourceId);
      const targetIndex = nodeIdToIndex.get(edge.targetId);
      
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        // Set 1 to indicate an edge exists
        matrix.set(sourceIndex, targetIndex, 1);
        matrix.set(targetIndex, sourceIndex, 1);
      }
    }
    
    return matrix;
  }

  toLaplacianMatrix(weightFunction?: WeightFunction): Matrix {
    const nodeIds = Array.from(this._nodes.keys());
    const n = nodeIds.length;
    const nodeIdToIndex = new Map<string, number>();
    
    // Create a mapping from node ID to matrix index
    for (let i = 0; i < n; i++) {
      nodeIdToIndex.set(nodeIds[i], i);
    }
    
    // Create a zero-filled matrix
    const matrix = new DenseMatrix(n, n);
    
    // Default weight function: w(e) = e.spin (use spin value directly)
    const weightFn = weightFunction || ((edge: SimulationEdge) => edge.spin);
    
    // Fill the Laplacian matrix
    for (const edge of this._edges.values()) {
      const sourceIndex = nodeIdToIndex.get(edge.sourceId);
      const targetIndex = nodeIdToIndex.get(edge.targetId);
      
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        // Calculate weight for this edge
        const weight = weightFn(edge);
        
        // Update off-diagonal elements (negative weights)
        matrix.set(sourceIndex, targetIndex, matrix.get(sourceIndex, targetIndex) - weight);
        matrix.set(targetIndex, sourceIndex, matrix.get(targetIndex, sourceIndex) - weight);
        
        // Update diagonal elements (sum of weights of connected edges)
        matrix.set(sourceIndex, sourceIndex, matrix.get(sourceIndex, sourceIndex) + weight);
        matrix.set(targetIndex, targetIndex, matrix.get(targetIndex, targetIndex) + weight);
      }
    }
    
    return matrix;
  }
}
