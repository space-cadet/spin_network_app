/**
 * Core QuantumGraph implementation
 */

import { QuantumObject, IOperator, IStateVector } from '../core/types';
import { IQuantumGraph, MeasurementResult } from './types';
import { CompositeQuantumManager } from './CompositeQuantumManager';
import { GraphologyAdapter } from '../../../graph-core/src/core/GraphologyAdapter';
import { IGraph, IGraphNode, IGraphEdge } from '../../../graph-core/src/core/types';

/**
 * Implementation of quantum-labeled graph
 */
export class QuantumGraph implements IQuantumGraph {
  private adapter: GraphologyAdapter;
  private quantumNodes: Map<string, QuantumObject> = new Map();
  private quantumEdges: Map<string, QuantumObject> = new Map();
  private compositeManager: CompositeQuantumManager;

  constructor(baseGraph?: GraphologyAdapter) {
    this.adapter = baseGraph || new GraphologyAdapter();
    this.compositeManager = new CompositeQuantumManager();
  }

  // Quantum labeling methods
  setVertexQuantumObject(nodeId: string, obj: QuantumObject): void {
    if (!this.adapter.hasNode(nodeId)) {
      throw new Error(`Node ${nodeId} does not exist in graph`);
    }
    this.quantumNodes.set(nodeId, obj);
  }

  getVertexQuantumObject(nodeId: string): QuantumObject | undefined {
    // Check composite first, fallback to individual
    return this.compositeManager.getCompositeForElement(nodeId) || this.quantumNodes.get(nodeId);
  }

  setEdgeQuantumObject(edgeId: string, obj: QuantumObject): void {
    if (!this.adapter.hasEdge(edgeId)) {
      throw new Error(`Edge ${edgeId} does not exist in graph`);
    }
    this.quantumEdges.set(edgeId, obj);
  }

  getEdgeQuantumObject(edgeId: string): QuantumObject | undefined {
    // Check composite first, fallback to individual
    return this.compositeManager.getCompositeForElement(edgeId) || this.quantumEdges.get(edgeId);
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

  // Composite quantum object management
  setCompositeQuantumObject(elementIds: string[], obj: QuantumObject): void {
    this.compositeManager.setComposite(elementIds, obj);
  }

  getCompositeQuantumObject(elementIds: string[]): QuantumObject | undefined {
    return this.compositeManager.getComposite(elementIds);
  }

  // General quantum operations
  applyVertexOperation(vertexIds: string[], operator: IOperator): void {
    // Extract current subsystem state
    const currentStates = vertexIds.map(id => this.getVertexQuantumObject(id)).filter(Boolean) as QuantumObject[];
    
    if (currentStates.length === 0) {
      throw new Error('No quantum objects found on specified vertices');
    }

    // For now, apply operator to first state (placeholder implementation)
    if (currentStates.length === 1 && currentStates[0].objectType === 'state') {
      const newState = operator.apply(currentStates[0] as IStateVector);
      
      if (vertexIds.length === 1) {
        // Single vertex operation - update individual state
        this.setVertexQuantumObject(vertexIds[0], newState);
      } else {
        // Multi-vertex operation - create composite
        this.setCompositeQuantumObject(vertexIds, newState);
      }
    }
  }

  applyEdgeOperation(edgeIds: string[], operator: IOperator): void {
    // Extract current subsystem state  
    const currentStates = edgeIds.map(id => this.getEdgeQuantumObject(id)).filter(Boolean) as QuantumObject[];
    
    if (currentStates.length === 0) {
      throw new Error('No quantum objects found on specified edges');
    }

    // For now, apply operator to first state (placeholder implementation)
    if (currentStates.length === 1 && currentStates[0].objectType === 'state') {
      const newState = operator.apply(currentStates[0] as IStateVector);
      
      if (edgeIds.length === 1) {
        // Single edge operation - update individual state
        this.setEdgeQuantumObject(edgeIds[0], newState);
      } else {
        // Multi-edge operation - create composite
        this.setCompositeQuantumObject(edgeIds, newState);
      }
    }
  }

  applyOperation(elementIds: string[], operator: IOperator): void {
    // Determine element types and delegate appropriately
    const vertexIds = elementIds.filter(id => this.hasNode(id));
    const edgeIds = elementIds.filter(id => this.hasEdge(id));
    
    if (vertexIds.length > 0 && edgeIds.length > 0) {
      // Mixed operation - extract states from both vertices and edges
      const allStates = [
        ...vertexIds.map(id => this.getVertexQuantumObject(id)),
        ...edgeIds.map(id => this.getEdgeQuantumObject(id))
      ].filter(Boolean) as QuantumObject[];
      
      if (allStates.length === 0) {
        throw new Error('No quantum objects found on specified elements');
      }

      // Apply to first state and create composite (placeholder implementation)
      if (allStates[0].objectType === 'state') {
        const newState = operator.apply(allStates[0] as IStateVector);
        this.setCompositeQuantumObject(elementIds, newState);
      }
    } else if (vertexIds.length > 0) {
      this.applyVertexOperation(vertexIds, operator);
    } else if (edgeIds.length > 0) {
      this.applyEdgeOperation(edgeIds, operator);
    } else {
      throw new Error('No valid graph elements found in elementIds');
    }
  }

  measureSubsystem(vertexIds: string[], projector?: IOperator): MeasurementResult {
    // Extract subsystem state
    const subsystemState = this.getCompositeQuantumObject(vertexIds) || 
                          this.getVertexQuantumObject(vertexIds[0]);
    
    if (!subsystemState || subsystemState.objectType !== 'state') {
      throw new Error('No quantum state found for measurement');
    }

    const state = subsystemState as IStateVector;
    
    // Simple measurement implementation (placeholder)
    const probability = state.norm() ** 2;
    const outcome = Math.random() < 0.5 ? 0 : 1;
    
    return {
      outcome,
      probability,
      postMeasurementState: state,
      measuredSubsystem: vertexIds
    };
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
