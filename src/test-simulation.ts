/**
 * Test script for simulation functionality
 * 
 * This script tests the core simulation engine and visualization
 * functionality without requiring UI interaction.
 */

import { 
  createSimulationEngine, 
  createSimulationGraph, 
  DEFAULT_SIMULATION_PARAMETERS 
} from './simulation';
import { CytoscapeAdapter } from './simulation/visualization/cytoscapeAdapter';
import { SpinNetwork } from './models/types';

// Create a test network
const testNetwork: SpinNetwork = {
  nodes: [
    { id: 'node1', position: { x: 100, y: 100 }, intertwiner: 1, type: 'default' },
    { id: 'node2', position: { x: 200, y: 100 }, intertwiner: 1, type: 'default' },
    { id: 'node3', position: { x: 150, y: 150 }, intertwiner: 1, type: 'default' }
  ],
  edges: [
    { id: 'edge1', source: 'node1', target: 'node2', spin: 0.5, type: 'default' },
    { id: 'edge2', source: 'node2', target: 'node3', spin: 0.5, type: 'default' },
    { id: 'edge3', source: 'node3', target: 'node1', spin: 0.5, type: 'default' }
  ],
  metadata: {
    name: 'Test Network',
    description: 'A simple test network for simulation testing',
    type: 'custom',
    created: new Date().toISOString(),
    modified: new Date().toISOString()
  }
};

// Run a simulation test
export const runSimulationTest = (): boolean => {
  console.log('Running simulation test...');
  
  try {
    // Create a simulation graph from the network
    const graph = createSimulationGraph(testNetwork);
    console.log(`Created simulation graph with ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
    
    // Create a simulation engine
    const engine = createSimulationEngine();
    console.log('Created simulation engine');
    
    // Create a Cytoscape adapter for visualization
    const adapter = new CytoscapeAdapter();
    console.log('Created Cytoscape adapter');
    
    // Set up initial state parameters
    const parameters = {
      ...DEFAULT_SIMULATION_PARAMETERS,
      initialStateParams: {
        ...DEFAULT_SIMULATION_PARAMETERS.initialStateParams,
        nodeId: 'node1'
      }
    };
    
    // Initialize the engine
    engine.initialize(graph, parameters);
    console.log('Initialized engine with parameters', JSON.stringify(parameters, null, 2));
    
    // Get the initial state
    const initialState = engine.getCurrentState();
    console.log('Initial state values:', initialState.nodeIds.map(id => ({ 
      id, 
      value: initialState.getValue(id) 
    })));
    
    // Step the simulation a few times
    for (let i = 0; i < 5; i++) {
      engine.step();
      console.log(`Stepped simulation (${i+1}), time: ${engine.getCurrentTime()}`);
      
      // Get the current state
      const state = engine.getCurrentState();
      const nodeValues = Object.fromEntries(
        state.nodeIds.map(id => [id, state.getValue(id)])
      );
      console.log(`  Node values: ${JSON.stringify(nodeValues)}`);
      
      // Get conservation laws
      const conservation = engine.getConservationLaws();
      console.log(`  Conservation: total=${conservation.totalProbability.toFixed(4)}, norm_var=${conservation.normVariation.toFixed(4)}, pos=${conservation.positivity}`);
      
      // Create visualization state
      const visualizationState = adapter.createVisualization(graph);
      console.log(`  Visualization: min=${visualizationState.minValue.toFixed(4)}, max=${visualizationState.maxValue.toFixed(4)}`);
    }
    
    console.log('Simulation test completed successfully');
    return true;
  } catch (error) {
    console.error('Error in simulation test:', error);
    return false;
  }
};

// Check if running in browser
if (typeof window !== 'undefined') {
  // Add to window object for browser testing
  (window as any).runSimulationTest = runSimulationTest;
}
