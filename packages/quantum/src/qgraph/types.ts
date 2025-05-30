/**
 * Type definitions for quantum graph module
 */

import { QuantumObject } from '../core/types';
import { IGraph } from '../../../graph-core/src/core/types';

/**
 * Interface for quantum-labeled graphs
 * Extends IGraph with quantum object labeling capabilities
 */
export interface IQuantumGraph extends IGraph {
  // Vertex quantum labeling
  setVertexQuantumObject(nodeId: string, obj: QuantumObject): void;
  getVertexQuantumObject(nodeId: string): QuantumObject | undefined;
  
  // Edge quantum labeling  
  setEdgeQuantumObject(edgeId: string, obj: QuantumObject): void;
  getEdgeQuantumObject(edgeId: string): QuantumObject | undefined;
  
  // Utility methods
  hasVertexQuantumObject(nodeId: string): boolean;
  hasEdgeQuantumObject(edgeId: string): boolean;
  clearVertexQuantumObject(nodeId: string): void;
  clearEdgeQuantumObject(edgeId: string): void;
}

/**
 * Result type for quantum graph analysis
 */
export interface QuantumGraphAnalysis {
  totalNodes: number;
  totalEdges: number;
  labeledNodes: number;
  labeledEdges: number;
  nodeTypes: {
    states: number;
    operators: number;
  };
  edgeTypes: {
    states: number;
    operators: number;
  };
}

/**
 * Options for quantum graph traversal
 */
export interface QuantumTraversalOptions {
  startVertex: string;
  applyOperators?: boolean;
  maxDepth?: number;
  direction?: 'forward' | 'backward' | 'both';
}

/**
 * Result of quantum traversal operation
 */
export interface QuantumTraversalResult {
  path: string[];
  finalState?: QuantumObject;
  operations: Array<{
    edge: string;
    operator?: QuantumObject;
    result?: QuantumObject;
  }>;
}
