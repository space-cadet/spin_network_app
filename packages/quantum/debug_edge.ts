/**
 * Debug script to test edge creation and lookup
 */

import { QuantumGraph } from './src/qgraph/QuantumGraph';

const graph = new QuantumGraph();

console.log('=== Edge Debug Test ===');

// Add nodes
graph.addNode({id: 'q0', type: 'qubit', properties: {}});
graph.addNode({id: 'q1', type: 'qubit', properties: {}});
console.log('Nodes added. Node count:', graph.nodeCount);

// Add edge
console.log('Adding edge with ID: e01');
graph.addEdge({id: 'e01', sourceId: 'q0', targetId: 'q1', directed: false, type: 'quantum', properties: {}});
console.log('Edge added. Edge count:', graph.edgeCount);

// Check if edge exists
console.log('Does edge e01 exist?', graph.hasEdge('e01'));

// Get all edges
const edges = graph.getEdges();
console.log('All edges:', edges.map(e => ({ id: e.id, source: e.sourceId, target: e.targetId })));

// Try to get the specific edge
const edge = graph.getEdge('e01');
console.log('Get edge e01:', edge);

// Check underlying adapter
const adapter = graph.getGraphAdapter();
console.log('Adapter hasEdge e01:', adapter.hasEdge('e01'));
console.log('Adapter edge count:', adapter.edgeCount);
