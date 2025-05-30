/**
 * Utility functions for quantum graph operations
 */

import { QuantumObject, isState, isOperator } from '../core/types';
import { StateVector } from '../states/stateVector';
import { IQuantumGraph, QuantumGraphAnalysis, QuantumTraversalOptions, QuantumTraversalResult } from './types';

/**
 * Analyze quantum object distribution in a quantum graph
 */
export function analyzeQuantumGraph(graph: IQuantumGraph): QuantumGraphAnalysis {
  const analysis: QuantumGraphAnalysis = {
    totalNodes: graph.nodeCount,
    totalEdges: graph.edgeCount,
    labeledNodes: 0,
    labeledEdges: 0,
    nodeTypes: { states: 0, operators: 0 },
    edgeTypes: { states: 0, operators: 0 }
  };

  // Analyze vertex quantum objects
  for (const node of graph.getNodes()) {
    const obj = graph.getVertexQuantumObject(node.id);
    if (obj) {
      analysis.labeledNodes++;
      if (isState(obj)) {
        analysis.nodeTypes.states++;
      } else if (isOperator(obj)) {
        analysis.nodeTypes.operators++;
      }
    }
  }

  // Analyze edge quantum objects
  for (const edge of graph.getEdges()) {
    const obj = graph.getEdgeQuantumObject(edge.id);
    if (obj) {
      analysis.labeledEdges++;
      if (isState(obj)) {
        analysis.edgeTypes.states++;
      } else if (isOperator(obj)) {
        analysis.edgeTypes.operators++;
      }
    }
  }

  return analysis;
}

/**
 * Print quantum graph analysis to console
 */
export function printQuantumGraphAnalysis(graph: IQuantumGraph): void {
  const analysis = analyzeQuantumGraph(graph);
  
  console.log('\n=== Quantum Graph Analysis ===');
  console.log(`Graph size: ${analysis.totalNodes} vertices, ${analysis.totalEdges} edges`);
  console.log(`Labeled: ${analysis.labeledNodes}/${analysis.totalNodes} vertices, ${analysis.labeledEdges}/${analysis.totalEdges} edges`);
  
  console.log('\nVertex quantum objects:');
  console.log(`  States: ${analysis.nodeTypes.states}`);
  console.log(`  Operators: ${analysis.nodeTypes.operators}`);
  
  console.log('\nEdge quantum objects:');
  console.log(`  States: ${analysis.edgeTypes.states}`);
  console.log(`  Operators: ${analysis.edgeTypes.operators}`);
}

/**
 * Traverse quantum graph and apply quantum operations
 */
export function traverseWithQuantumOps(graph: IQuantumGraph, options: QuantumTraversalOptions): QuantumTraversalResult {
  const { startVertex, applyOperators = true, maxDepth = 10 } = options;
  
  const result: QuantumTraversalResult = {
    path: [startVertex],
    operations: []
  };

  let currentState = graph.getVertexQuantumObject(startVertex);
  if (!currentState) {
    return result;
  }

  result.finalState = currentState;

  // Simple forward traversal
  let currentVertex = startVertex;
  let depth = 0;

  while (depth < maxDepth) {
    const connectedEdges = graph.getConnectedEdges(currentVertex);
    const outgoingEdges = connectedEdges.filter(edge => edge.sourceId === currentVertex);
    
    if (outgoingEdges.length === 0) break;

    const edge = outgoingEdges[0]; // Take first outgoing edge
    const edgeObj = graph.getEdgeQuantumObject(edge.id);
    
    const operation = {
      edge: edge.id,
      operator: edgeObj
    };

    if (applyOperators && edgeObj && isOperator(edgeObj) && currentState && isState(currentState)) {
      try {
        const newState = edgeObj.apply(currentState as StateVector);
        operation.result = newState;
        result.finalState = newState;
        currentState = newState;
      } catch (error) {
        // Operation failed, continue without updating state
      }
    }

    result.operations.push(operation);
    result.path.push(edge.targetId);
    currentVertex = edge.targetId;
    depth++;
  }

  return result;
}

/**
 * Print detailed quantum graph structure
 */
export function printQuantumGraphStructure(graph: IQuantumGraph): void {
  console.log('\n=== Quantum Graph Structure ===');
  
  // Print metadata if available
  const metadata = graph.getMetadata();
  if (metadata?.type) {
    console.log(`Graph type: ${metadata.type}`);
  }
  
  console.log('\nVertices with quantum objects:');
  for (const node of graph.getNodes()) {
    const obj = graph.getVertexQuantumObject(node.id);
    if (obj) {
      if (isState(obj)) {
        console.log(`  ${node.id}: State |ψ⟩, norm = ${obj.norm().toFixed(3)}`);
      } else if (isOperator(obj)) {
        console.log(`  ${node.id}: Operator (${obj.type}), norm = ${obj.norm().toFixed(3)}`);
      }
    } else {
      console.log(`  ${node.id}: No quantum object`);
    }
  }

  console.log('\nEdges with quantum objects:');
  for (const edge of graph.getEdges()) {
    const obj = graph.getEdgeQuantumObject(edge.id);
    if (obj) {
      if (isState(obj)) {
        console.log(`  ${edge.id}: ${edge.sourceId} →[State |ψ⟩]→ ${edge.targetId}`);
      } else if (isOperator(obj)) {
        console.log(`  ${edge.id}: ${edge.sourceId} →[${obj.type}]→ ${edge.targetId}`);
      }
    } else {
      console.log(`  ${edge.id}: ${edge.sourceId} →[no quantum object]→ ${edge.targetId}`);
    }
  }
}
