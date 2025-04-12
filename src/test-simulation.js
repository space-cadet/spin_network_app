/**
 * Test script for simulation functionality
 * 
 * This script tests the core simulation functionality without requiring UI interaction.
 * It provides a simple way to verify that the simulation engine and visualization
 * are working correctly.
 */

import { 
  createSimulationEngine, 
  createSimulationGraph, 
  DEFAULT_SIMULATION_PARAMETERS,
  SpinNetworkGeometryCalculator,
  SimulationAnalyzer
} from './simulation';
import { CytoscapeAdapter } from './simulation/visualization/cytoscapeAdapter';

// Create a test network - exported for test-simulation.html
export const testNetwork = {
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
const runSimulationTest = () => {
  console.log('Running simulation test...');
  
  try {
    // Create a simulation graph from the network
    const graph = createSimulationGraph(testNetwork);
    console.log(`Created simulation graph with ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
    
    // Store graph reference for external access
    if (typeof window !== 'undefined') {
      window.currentGraph = graph;
      console.log('Stored graph reference in window.currentGraph');
    }
    
    // Create a simulation engine
    const engine = createSimulationEngine();
    console.log('Created simulation engine');
    
    // Store engine reference for external access
    if (typeof window !== 'undefined') {
      window.currentEngine = engine;
      console.log('Stored engine reference in window.currentEngine');
      
      // Debug verification
      if (window.currentEngine === engine) {
        console.log('Engine reference correctly assigned');
      } else {
        console.error('Engine reference assignment failed');
      }
    }
    
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
    console.log('Initialized engine with parameters', parameters);
    
    // Get the initial state
    const initialState = engine.getCurrentState();
    console.log('Initial state values:', initialState.nodeIds.map(id => ({ 
      id, 
      value: initialState.getValue(id) 
    })));
    
    // Create geometry calculator and statistics analyzer
    const geometryCalculator = new SpinNetworkGeometryCalculator();
    
    // Calculate and report initial geometric properties
    // No need to get the state again, we already have it
    console.log("Calculating initial geometric properties...");
    
    // Calculate geometric properties
    const initialGeometric = {
      totalVolume: geometryCalculator.calculateTotalVolume(initialState),
      totalArea: geometryCalculator.calculateTotalArea(graph),
      effectiveDimension: geometryCalculator.calculateEffectiveDimension(graph, initialState),
      volumeEntropy: geometryCalculator.calculateVolumeEntropy(initialState)
    };
    
    console.log("Initial geometric properties:", {
      totalVolume: initialGeometric.totalVolume.toFixed(6),
      totalArea: initialGeometric.totalArea.toFixed(6),
      effectiveDimension: initialGeometric.effectiveDimension.toFixed(6),
      volumeEntropy: initialGeometric.volumeEntropy.toFixed(6)
    });
    
    // Calculate initial statistics
    const initialStats = SimulationAnalyzer.calculateStatistics(initialState, 0);
    console.log("Initial statistics:", {
      mean: initialStats.mean.toFixed(6),
      variance: initialStats.variance.toFixed(6),
      standardDeviation: initialStats.standardDeviation.toFixed(6),
      min: initialStats.min.toFixed(6),
      max: initialStats.max.toFixed(6)
    });
    
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
      
      // Calculate geometric properties
      const geometric = {
        totalVolume: geometryCalculator.calculateTotalVolume(state),
        totalArea: geometryCalculator.calculateTotalArea(graph),
        effectiveDimension: geometryCalculator.calculateEffectiveDimension(graph, state),
        volumeEntropy: geometryCalculator.calculateVolumeEntropy(state)
      };
      
      console.log(`  Geometric: volume=${geometric.totalVolume.toFixed(4)}, area=${geometric.totalArea.toFixed(4)}, dimension=${geometric.effectiveDimension.toFixed(4)}, entropy=${geometric.volumeEntropy.toFixed(4)}`);
      
      // Calculate statistics
      const stats = SimulationAnalyzer.calculateStatistics(state, engine.getCurrentTime());
      console.log(`  Statistics: mean=${stats.mean.toFixed(4)}, variance=${stats.variance.toFixed(4)}, min=${stats.min.toFixed(4)}, max=${stats.max.toFixed(4)}`);
      
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

// Check if running in Node.js or browser
if (typeof window === 'undefined') {
  // Node.js environment
  runSimulationTest();
} else {
  // Browser environment
  console.log('Run the simulation test by calling runSimulationTest()');
  window.runSimulationTest = runSimulationTest;
}

export { runSimulationTest };
