/**
 * Core QuantumGraph implementation
 */

import { QuantumObject } from '../core/types';
import { IQuantumGraph } from './types';
import { GraphologyAdapter } from '../../../graph-core/src/core/GraphologyAdapter';
import { IGraph, IGraphNode, IGraphEdge } from '../../../graph-core/src/core/types';

/**
 * Implementation of quantum-labeled graph
 */
export class QuantumGraph implements IQuantumGraph {
  private adapter: GraphologyAdapter;
  private quantumNodes: Map<string, QuantumObject> = new Map();
  private quantumEdges: Map<string, QuantumObject> = new Map();

  constructor(baseGraph?: GraphologyAdapter) {
    this.adapter = baseGraph || new GraphologyAdapter();
  }

  // Quantum labeling methods
  setVertexQuantumObject(nodeId: string, obj: QuantumObject): void {
    if (!this.adapter.hasNode(nodeId)) {
      throw new Error(`Node ${nodeId} does not exist in graph`);
    }
    this.quantumNodes.set(nodeId, obj);
  }

  getVertexQuantumObject(nodeId: string): QuantumObject | undefined {
    return this.quantumNodes.get(nodeId);
  }

  setEdgeQuantumObject(edgeId: string, obj: QuantumObject): void {
    if (!this.adapter.hasEdge(edgeId)) {
      throw new Error(`Edge ${edgeId} does not exist in graph`);
    }
    this.quantumEdges.set(edgeId, obj);
  }

  getEdgeQuantumObject(edgeId: string): QuantumObject | undefined {
    return this.quantumEdges.get(edgeId);
  }

  // Utility methods
  hasVertexQuantumObject(nodeId: string): boolean {
    return this.quantumNodes.has(nodeId);
  }

  hasEdgeQuantumObject(edgeId: string): boolean {
    return this.quantumEdges.has(edgeId);
  }

  clearVertexQuantumObject(nodeId: string): void {
    this.quantumNodes.delete(nodeId);
  }

  clearEdgeQuantumObject(edgeId: string): void {
    this.quantumEdges.delete(edgeId);
  }

  // Access to underlying graph adapter
  getGraphAdapter(): GraphologyAdapter {
    return this.adapter;
  }

  // Delegate IGraph methods to adapter
  get isDirected(): boolean { 
    return this.adapter.isDirected; 
  }
  
  get nodeCount(): number { 
    return this.adapter.nodeCount; 
  }
  
  get edgeCount(): number { 
    return this.adapter.edgeCount; 
  }

  addNode(node: IGraphNode): IGraph { 
    return this.adapter.addNode(node); 
  }
  
  removeNode(nodeId: string): IGraph { 
    this.quantumNodes.delete(nodeId);
    return this.adapter.removeNode(nodeId); 
  }
  
  addEdge(edge: IGraphEdge): IGraph { 
    return this.adapter.addEdge(edge); 
  }
  
  removeEdge(edgeId: string): IGraph { 
    this.quantumEdges.delete(edgeId);
    return this.adapter.removeEdge(edgeId); 
  }
  
  getNode(nodeId: string): IGraphNode | undefined { 
    return this.adapter.getNode(nodeId); 
  }
  
  getEdge(edgeId: string): IGraphEdge | undefined { 
    return this.adapter.getEdge(edgeId); 
  }
  
  getNodes(): readonly IGraphNode[] { 
    return this.adapter.getNodes(); 
  }
  
  getEdges(): readonly IGraphEdge[] { 
    return this.adapter.getEdges(); 
  }
  
  getAdjacentNodes(nodeId: string, options?: any): readonly IGraphNode[] { 
    return this.adapter.getAdjacentNodes(nodeId, options); 
  }
  
  getConnectedEdges(nodeId: string, options?: any): readonly IGraphEdge[] { 
    return this.adapter.getConnectedEdges(nodeId, options); 
  }
  
  findPath(fromId: string, toId: string, options?: any): readonly any[] { 
    return this.adapter.findPath(fromId, toId, options); 
  }
  
  toAdjacencyMatrix(weightFn?: any): any { 
    return this.adapter.toAdjacencyMatrix(weightFn); 
  }
  
  toLaplacianMatrix(weightFn?: any): any { 
    return this.adapter.toLaplacianMatrix(weightFn); 
  }
  
  setMetadata(metadata: any): IGraph { 
    return this.adapter.setMetadata(metadata); 
  }
  
  getMetadata(): any { 
    return this.adapter.getMetadata(); 
  }
  
  hasNode(nodeId: string): boolean { 
    return this.adapter.hasNode(nodeId); 
  }
  
  hasEdge(edgeId: string): boolean { 
    return this.adapter.hasEdge(edgeId); 
  }
  
  areNodesAdjacent(sourceId: string, targetId: string, options?: any): boolean { 
    return this.adapter.areNodesAdjacent(sourceId, targetId, options); 
  }
  
  getNodeDegree(nodeId: string, options?: any): number { 
    return this.adapter.getNodeDegree(nodeId, options); 
  }
  
  clone(): IGraph { 
    return this.adapter.clone(); 
  }
  
  clear(): IGraph { 
    this.quantumNodes.clear();
    this.quantumEdges.clear();
    return this.adapter.clear(); 
  }
}
