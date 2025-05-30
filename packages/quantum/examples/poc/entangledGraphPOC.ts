/**
 * Proof of Concept: Composite Quantum Graph Data Structure
 * 
 * Demonstrates a graph where quantum objects can span multiple vertices
 * and/or edges, enabling true entanglement and composite quantum states.
 */

import { QuantumObject, isState, isOperator } from '../../src/core/types';
import { StateVector } from '../../src/states/stateVector';
import { PauliX, PauliZ } from '../../src/operators/gates';
import { GraphologyAdapter } from '../../../graph-core/src/core/GraphologyAdapter';
import { path, lattice2D } from '../../../graph-core/src/core/builders';
import { IGraph, IGraphNode, IGraphEdge } from '../../../graph-core/src/core/types';
import * as math from 'mathjs';

// Simple composite quantum object manager
class CompositeQuantumManager {
  private composites: Map<string, QuantumObject> = new Map();
  private elementToComposite: Map<string, string> = new Map();

  setComposite(elementIds: string[], obj: QuantumObject): void {
    const compositeId = this.makeCompositeId(elementIds);
    this.composites.set(compositeId, obj);
    
    // Map each element to this composite
    for (const elementId of elementIds) {
      this.elementToComposite.set(elementId, compositeId);
    }
  }

  getComposite(elementIds: string[]): QuantumObject | undefined {
    const compositeId = this.makeCompositeId(elementIds);
    return this.composites.get(compositeId);
  }

  getCompositeForElement(elementId: string): QuantumObject | undefined {
    const compositeId = this.elementToComposite.get(elementId);
    return compositeId ? this.composites.get(compositeId) : undefined;
  }

  private makeCompositeId(elementIds: string[]): string {
    return [...elementIds].sort().join('_');
  }
}

// Enhanced quantum-labeled graph with composite support
interface CompositeQuantumGraphPOC extends IGraph {
  // Composite quantum labeling methods
  setCompositeQuantumObject(elementIds: string[], obj: QuantumObject): void;
  getCompositeQuantumObject(elementIds: string[]): QuantumObject | undefined;
  
  // Backward compatible single-element methods
  setVertexQuantumObject(nodeId: string, obj: QuantumObject): void;
  getVertexQuantumObject(nodeId: string): QuantumObject | undefined;
  setEdgeQuantumObject(edgeId: string, obj: QuantumObject): void;
  getEdgeQuantumObject(edgeId: string): QuantumObject | undefined;
  
  // Graph-core adapter
  getGraphAdapter(): GraphologyAdapter;
}

// Implementation with composite quantum object support
class CompositeQuantumGraph implements CompositeQuantumGraphPOC {
  private adapter: GraphologyAdapter;
  private compositeManager: CompositeQuantumManager = new CompositeQuantumManager();

  constructor(baseGraph?: GraphologyAdapter) {
    this.adapter = baseGraph || new GraphologyAdapter();
  }

  // Composite quantum labeling methods
  setCompositeQuantumObject(elementIds: string[], obj: QuantumObject): void {
    this.compositeManager.setComposite(elementIds, obj);
  }

  getCompositeQuantumObject(elementIds: string[]): QuantumObject | undefined {
    return this.compositeManager.getComposite(elementIds);
  }

  // Backward compatible methods - check composite first, allow individual assignment
  setVertexQuantumObject(nodeId: string, obj: QuantumObject): void {
    if (!this.adapter.hasNode(nodeId)) {
      throw new Error(`Node ${nodeId} does not exist in graph`);
    }
    // Only set individual state if not already part of composite
    if (!this.compositeManager.getCompositeForElement(nodeId)) {
      this.compositeManager.setComposite([nodeId], obj);
    }
  }

  getVertexQuantumObject(nodeId: string): QuantumObject | undefined {
    // Always return composite state if element is part of one (composite priority)
    return this.compositeManager.getCompositeForElement(nodeId);
  }

  setEdgeQuantumObject(edgeId: string, obj: QuantumObject): void {
    if (!this.adapter.hasEdge(edgeId)) {
      throw new Error(`Edge ${edgeId} does not exist in graph`);
    }
    // Only set individual state if not already part of composite
    if (!this.compositeManager.getCompositeForElement(edgeId)) {
      this.compositeManager.setComposite([edgeId], obj);
    }
  }

  getEdgeQuantumObject(edgeId: string): QuantumObject | undefined {
    // Always return composite state if element is part of one (composite priority)
    return this.compositeManager.getCompositeForElement(edgeId);
  }

  getGraphAdapter(): GraphologyAdapter {
    return this.adapter;
  }

  // Delegate IGraph methods to adapter
  get isDirected(): boolean { return this.adapter.isDirected; }
  get nodeCount(): number { return this.adapter.nodeCount; }
  get edgeCount(): number { return this.adapter.edgeCount; }

  addNode(node: IGraphNode): IGraph { return this.adapter.addNode(node); }
  removeNode(nodeId: string): IGraph { return this.adapter.removeNode(nodeId); }
  addEdge(edge: IGraphEdge): IGraph { return this.adapter.addEdge(edge); }
  removeEdge(edgeId: string): IGraph { return this.adapter.removeEdge(edgeId); }
  
  getNode(nodeId: string): IGraphNode | undefined { return this.adapter.getNode(nodeId); }
  getEdge(edgeId: string): IGraphEdge | undefined { return this.adapter.getEdge(edgeId); }
  getNodes(): readonly IGraphNode[] { return this.adapter.getNodes(); }
  getEdges(): readonly IGraphEdge[] { return this.adapter.getEdges(); }
  
  getAdjacentNodes(nodeId: string, options?: any): readonly IGraphNode[] { 
    return this.adapter.getAdjacentNodes(nodeId, options); 
  }
  getConnectedEdges(nodeId: string, options?: any): readonly IGraphEdge[] { 
    return this.adapter.getConnectedEdges(nodeId, options); 
  }
  findPath(fromId: string, toId: string, options?: any): readonly any[] { 
    return this.adapter.findPath(fromId, toId, options); 
  }
  
  toAdjacencyMatrix(weightFn?: any): any { return this.adapter.toAdjacencyMatrix(weightFn); }
  toLaplacianMatrix(weightFn?: any): any { return this.adapter.toLaplacianMatrix(weightFn); }
  
  setMetadata(metadata: any): IGraph { return this.adapter.setMetadata(metadata); }
  getMetadata(): any { return this.adapter.getMetadata(); }
  
  hasNode(nodeId: string): boolean { return this.adapter.hasNode(nodeId); }
  hasEdge(edgeId: string): boolean { return this.adapter.hasEdge(edgeId); }
  areNodesAdjacent(sourceId: string, targetId: string, options?: any): boolean { 
    return this.adapter.areNodesAdjacent(sourceId, targetId, options); 
  }
  getNodeDegree(nodeId: string, options?: any): number { 
    return this.adapter.getNodeDegree(nodeId, options); 
  }
  clone(): IGraph { return this.adapter.clone(); }
  clear(): IGraph { return this.adapter.clear(); }
}

// Create Bell state (|00⟩ + |11⟩)/√2
function createBellState(): StateVector {
  const bellState = new StateVector(4); // 2-qubit system
  bellState.setState(0, math.complex(1/Math.sqrt(2), 0)); // |00⟩
  bellState.setState(3, math.complex(1/Math.sqrt(2), 0)); // |11⟩
  return bellState;
}

// Create toric code plaquette operator (simplified)
function createPlaquetteOperator(): StateVector {
  const plaquetteState = new StateVector(16); // 4-edge system
  plaquetteState.setState(0, math.complex(1/Math.sqrt(2), 0));  // |0000⟩
  plaquetteState.setState(15, math.complex(1/Math.sqrt(2), 0)); // |1111⟩
  return plaquetteState;
}

// Create POC graphs demonstrating composite quantum objects
function createCompositeQuantumGraphPOC(): CompositeQuantumGraphPOC {
  const baseGraph = lattice2D(2, 2); // 4 vertices, 4 edges forming a 2x2 square
  const quantumGraph = new CompositeQuantumGraph(baseGraph);

  const nodes = quantumGraph.getNodes();
  const edges = quantumGraph.getEdges();

  // Example 1: Multi-vertex Bell state (vertices 0 and 1)
  if (nodes.length >= 2) {
    const bellState = createBellState();
    quantumGraph.setCompositeQuantumObject([nodes[0].id, nodes[1].id], bellState);
    console.log(`Created Bell state across vertices ${nodes[0].id}, ${nodes[1].id}`);
  }

  // Example 2: Toric code plaquette (all 4 edges)
  if (edges.length >= 4) {
    const plaquetteState = createPlaquetteOperator();
    const allEdgeIds = edges.map(e => e.id);
    quantumGraph.setCompositeQuantumObject(allEdgeIds, plaquetteState);
    console.log(`Created plaquette operator across edges: ${allEdgeIds.join(', ')}`);
  }

  // Example 3: Single vertex states (backward compatibility)
  if (nodes.length >= 4) {
    const state0 = new StateVector(2);
    state0.setState(0, math.complex(1, 0));
    quantumGraph.setVertexQuantumObject(nodes[2].id, state0);
    
    const state1 = new StateVector(2);
    state1.setState(1, math.complex(1, 0));
    quantumGraph.setVertexQuantumObject(nodes[3].id, state1);
  }

  return quantumGraph;
}

// Utility functions for composite quantum graph
function analyzeCompositeGraph(graph: CompositeQuantumGraphPOC): void {
  console.log('\n=== Composite Quantum Graph Analysis ===');
  
  const metadata = graph.getMetadata();
  console.log(`Graph type: ${metadata?.type || 'unknown'}`);
  console.log(`Topology: ${metadata?.topology || 'unknown'}`);
  console.log(`Graph size: ${graph.nodeCount} vertices, ${graph.edgeCount} edges`);
  
  // Check for multi-vertex composite states
  console.log('\n--- Multi-Vertex Composite States ---');
  const nodes = graph.getNodes();
  if (nodes.length >= 2) {
    const bellState = graph.getCompositeQuantumObject([nodes[0].id, nodes[1].id]);
    if (bellState && isState(bellState)) {
      console.log(`Bell state spanning ${nodes[0].id}, ${nodes[1].id}:`);
      console.log(`  Dimension: ${bellState.dimension}`);
      console.log(`  Norm: ${bellState.norm().toFixed(3)}`);
      console.log(`  Type: Entangled 2-qubit state`);
    }
  }

  // Check for multi-edge composite states (toric code plaquette)
  console.log('\n--- Multi-Edge Composite States ---');
  const edges = graph.getEdges();
  if (edges.length >= 4) {
    const allEdgeIds = edges.map(e => e.id);
    const plaquetteState = graph.getCompositeQuantumObject(allEdgeIds);
    if (plaquetteState && isState(plaquetteState)) {
      console.log(`Plaquette operator spanning edges: ${allEdgeIds.join(', ')}`);
      console.log(`  Dimension: ${plaquetteState.dimension}`);
      console.log(`  Norm: ${plaquetteState.norm().toFixed(3)}`);
      console.log(`  Type: 4-edge toric code plaquette`);
    }
  }

  // Check individual vertex states (backward compatibility)
  console.log('\n--- Individual Vertex States ---');
  for (const node of nodes) {
    const obj = graph.getVertexQuantumObject(node.id);
    if (obj && isState(obj)) {
      console.log(`${node.id}: Individual state, dim = ${obj.dimension}, norm = ${obj.norm().toFixed(3)}`);
    }
  }
}

// Demonstrate composite quantum operations
function demonstrateCompositeOperations(graph: CompositeQuantumGraphPOC): void {
  console.log('\n=== Composite Quantum Operations Demo ===');
  
  const nodes = graph.getNodes();
  const edges = graph.getEdges();

  // Test Bell state measurement correlations
  if (nodes.length >= 2) {
    const bellState = graph.getCompositeQuantumObject([nodes[0].id, nodes[1].id]);
    if (bellState && isState(bellState)) {
      console.log('\nBell State Analysis:');
      console.log(`  Composite system: ${nodes[0].id} ⊗ ${nodes[1].id}`);
      console.log(`  State dimension: ${bellState.dimension} (2-qubit)`);
      console.log(`  Entanglement: Present (Bell state)`);
      
      // Show amplitudes
      const amplitudes = bellState.getAmplitudes();
      console.log(`  |00⟩ amplitude: ${amplitudes[0].re.toFixed(3)}`);
      console.log(`  |11⟩ amplitude: ${amplitudes[3].re.toFixed(3)}`);
    }
  }

  // Test plaquette operator properties
  if (edges.length >= 4) {
    const allEdgeIds = edges.map(e => e.id);
    const plaquetteState = graph.getCompositeQuantumObject(allEdgeIds);
    if (plaquetteState && isState(plaquetteState)) {
      console.log('\nToric Code Plaquette Analysis:');
      console.log(`  Composite system: ${allEdgeIds.join(' ⊗ ')}`);
      console.log(`  State dimension: ${plaquetteState.dimension} (4-edge)`);
      console.log(`  Stabilizer: Plaquette operator`);
      
      // Show key amplitudes
      const amplitudes = plaquetteState.getAmplitudes();
      console.log(`  |0000⟩ amplitude: ${amplitudes[0].re.toFixed(3)}`);
      console.log(`  |1111⟩ amplitude: ${amplitudes[15].re.toFixed(3)}`);
    }
  }

  // Demonstrate backward compatibility
  console.log('\nBackward Compatibility Check:');
  for (let i = 2; i < Math.min(4, nodes.length); i++) {
    const individualState = graph.getVertexQuantumObject(nodes[i].id);
    if (individualState && isState(individualState)) {
      console.log(`  ${nodes[i].id}: Individual state (${individualState.dimension}D)`);
    }
  }
}

// Run the composite quantum graph POC demonstration
export function runCompositeQuantumGraphPOC(): void {
  console.log('🔬 Composite Quantum Graph POC Demo');
  console.log('====================================');
  
  try {
    const graph = createCompositeQuantumGraphPOC();
    analyzeCompositeGraph(graph);
    demonstrateCompositeOperations(graph);
    
    console.log('\n✅ Composite POC completed successfully!');
    console.log('\nThis demonstrates:');
    console.log('• Multi-vertex entangled states (Bell pairs)');
    console.log('• Multi-edge quantum objects (toric code plaquettes)');
    console.log('• Backward compatibility with single-element states');
    console.log('• Composite quantum object management');
    console.log('• Foundation for true quantum entanglement in graphs');
    
  } catch (error) {
    console.error('❌ Composite POC failed:', error);
  }
}

// Export for testing
export { 
  createCompositeQuantumGraphPOC, 
  analyzeCompositeGraph, 
  demonstrateCompositeOperations, 
  CompositeQuantumGraph,
  CompositeQuantumManager,
  createBellState,
  createPlaquetteOperator
};
