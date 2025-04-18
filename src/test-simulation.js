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
import { simulationLogger } from './simulation/core/simulationLogger';

/**
 * Generate a randomized network with a specified number of nodes and connectivity
 * @param {number} numNodes - Number of nodes to create
 * @param {number} connectivity - Probability of edge creation between nodes (0-1)
 * @returns {Object} A network with random nodes and edges
 */
export const generateRandomNetwork = (numNodes = 5, connectivity = 0.6) => {
  // Generate nodes with random positions
  const nodes = [];
  for (let i = 1; i <= numNodes; i++) {
    nodes.push({
      id: `node${i}`,
      position: { 
        x: 100 + Math.random() * 300, 
        y: 100 + Math.random() * 300 
      },
      intertwiner: Math.floor(Math.random() * 3) + 1, // Random intertwiner values 1-3
      type: 'default'
    });
  }
  
  // Generate edges with random connectivity
  const edges = [];
  let edgeCounter = 1;
  
  // Ensure the network is connected (create a spanning tree first)
  // This guarantees all nodes are reachable
  const connectedNodes = [0]; // Indices of connected nodes (start with first node)
  const unconnectedNodes = [...Array(numNodes - 1).keys()].map(i => i + 1); // Rest of the nodes
  
  // Connect all nodes to form a connected graph
  while (unconnectedNodes.length > 0) {
    // Pick a random connected node
    const sourceIndex = connectedNodes[Math.floor(Math.random() * connectedNodes.length)];
    
    // Pick a random unconnected node
    const targetIndexInArray = Math.floor(Math.random() * unconnectedNodes.length);
    const targetIndex = unconnectedNodes[targetIndexInArray];
    
    // Create an edge between them
    edges.push({
      id: `edge${edgeCounter++}`,
      source: nodes[sourceIndex].id,
      target: nodes[targetIndex].id,
      spin: (Math.floor(Math.random() * 4) + 1) / 2, // Random spin values: 0.5, 1, 1.5, or 2
      type: 'default'
    });
    
    // Move the target node to the connected set
    connectedNodes.push(targetIndex);
    unconnectedNodes.splice(targetIndexInArray, 1);
  }
  
  // Add more random edges based on connectivity parameter
  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      // Skip if already connected in the spanning tree
      if (edges.some(edge => 
          (edge.source === nodes[i].id && edge.target === nodes[j].id) ||
          (edge.source === nodes[j].id && edge.target === nodes[i].id))) {
        continue;
      }
      
      // Add edge with probability determined by connectivity
      if (Math.random() < connectivity) {
        edges.push({
          id: `edge${edgeCounter++}`,
          source: nodes[i].id,
          target: nodes[j].id,
          spin: (Math.floor(Math.random() * 4) + 1) / 2, // Random spin values: 0.5, 1, 1.5, or 2
          type: 'default'
        });
      }
    }
  }
  
  return {
    nodes,
    edges,
    metadata: {
      name: 'Random Test Network',
      description: 'A randomly generated network for simulation testing',
      type: 'custom',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    }
  };
};

// Create a test network - dynamically generated for test-simulation.html
export const testNetwork = generateRandomNetwork();

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
    
    // Set up initial state parameters with enhanced settings for better test results
    const parameters = {
      ...DEFAULT_SIMULATION_PARAMETERS,
      initialStateParams: {
        ...DEFAULT_SIMULATION_PARAMETERS.initialStateParams,
        nodeId: 'node1',
        value: 1.0 // Ensure we have a good initial value
      },
      recordHistory: true,
      historyInterval: 1, // Record every step
      alpha: 0.05,  // Increased diffusion rate for visible test effects
      timeStep: 0.01 // Small time step for stability
    };
    
    // Start simulation session logging
    simulationLogger.startSession({
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      name: 'Test Simulation',
      type: 'test'
    }, parameters);
    
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
    
    // Calculate geometric properties with more robust error handling
    let initialGeometric;
    try {
      initialGeometric = {
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
      
      // Log to simulation session
      simulationLogger.logResults(0, {
        geometric: initialGeometric,
      });
    } catch (error) {
      console.error("Error calculating initial geometric properties:", error);
      initialGeometric = {
        totalVolume: 0,
        totalArea: 0,
        effectiveDimension: 0,
        volumeEntropy: 0
      };
    }
    
    // Calculate initial statistics with error handling
    let initialStats;
    try {
      initialStats = SimulationAnalyzer.calculateStatistics(initialState, 0);
      console.log("Initial statistics:", {
        mean: initialStats.mean.toFixed(6),
        variance: initialStats.variance.toFixed(6),
        standardDeviation: initialStats.standardDeviation.toFixed(6),
        min: initialStats.min.toFixed(6),
        max: initialStats.max.toFixed(6)
      });
      
      // Log to simulation session
      simulationLogger.logResults(0, {
        statistics: {
          mean: initialStats.mean,
          variance: initialStats.variance,
          standardDeviation: initialStats.standardDeviation,
          min: initialStats.min,
          max: initialStats.max
        }
      });
    } catch (error) {
      console.error("Error calculating initial statistics:", error);
      initialStats = {
        mean: 0,
        variance: 0,
        standardDeviation: 0,
        min: 0,
        max: 0
      };
    }
    
    // Store the initial results for UI access
    if (typeof window !== 'undefined') {
      window.testResults = {
        geometric: initialGeometric,
        statistics: initialStats,
        conservation: engine.getConservationLaws(),
        steps: []
      };
    }
    
    // Step the simulation a few times
    for (let i = 0; i < 10; i++) {  // Increased to 10 steps for better visualization
      engine.step();
      const currentTime = engine.getCurrentTime();
      console.log(`Stepped simulation (${i+1}), time: ${currentTime.toFixed(4)}`);
      
      // Get the current state
      const state = engine.getCurrentState();
      const nodeValues = Object.fromEntries(
        state.nodeIds.map(id => [id, state.getValue(id)])
      );
      console.log(`  Node values: ${JSON.stringify(nodeValues)}`);
      
      // Get conservation laws
      const conservation = engine.getConservationLaws();
      console.log(`  Conservation: total=${conservation.totalProbability.toFixed(4)}, norm_var=${conservation.normVariation.toFixed(4)}, pos=${conservation.positivity}`);
      
      // Calculate geometric properties with error handling
      let geometric;
      try {
        geometric = {
          totalVolume: geometryCalculator.calculateTotalVolume(state),
          totalArea: geometryCalculator.calculateTotalArea(graph),
          effectiveDimension: geometryCalculator.calculateEffectiveDimension(graph, state),
          volumeEntropy: geometryCalculator.calculateVolumeEntropy(state)
        };
        
        console.log(`  Geometric: volume=${geometric.totalVolume.toFixed(4)}, area=${geometric.totalArea.toFixed(4)}, dimension=${geometric.effectiveDimension.toFixed(4)}, entropy=${geometric.volumeEntropy.toFixed(4)}`);
      } catch (error) {
        console.error(`Error calculating geometric properties at step ${i+1}:`, error);
        geometric = { ...initialGeometric }; // Use initial values as fallback
      }
      
      // Calculate statistics with error handling
      let stats;
      try {
        stats = SimulationAnalyzer.calculateStatistics(state, currentTime);
        console.log(`  Statistics: mean=${stats.mean.toFixed(4)}, variance=${stats.variance.toFixed(4)}, min=${stats.min.toFixed(4)}, max=${stats.max.toFixed(4)}`);
      } catch (error) {
        console.error(`Error calculating statistics at step ${i+1}:`, error);
        stats = { ...initialStats }; // Use initial values as fallback
      }
      
      // Create visualization state
      const visualizationState = adapter.createVisualization(graph);
      console.log(`  Visualization: min=${visualizationState.minValue.toFixed(4)}, max=${visualizationState.maxValue.toFixed(4)}`);
      
      // Store step results
      if (typeof window !== 'undefined' && window.testResults) {
        window.testResults.steps.push({
          time: currentTime,
          nodeValues,
          conservation,
          geometric,
          statistics: stats,
          visualization: {
            minValue: visualizationState.minValue,
            maxValue: visualizationState.maxValue
          }
        });
      }
      
      // Log to simulation session
      simulationLogger.logResults(currentTime, {
        conservation: {
          totalProbability: conservation.totalProbability,
          normVariation: conservation.normVariation,
          positivity: conservation.positivity
        },
        geometric,
        statistics: {
          mean: stats.mean,
          variance: stats.variance,
          skewness: 0, // Not calculated yet
          kurtosis: 0  // Not calculated yet
        }
      });
    }
    
    // End simulation session
    simulationLogger.endSession();
    
    // Update the current time result for the UI
    if (typeof window !== 'undefined' && window.testResults) {
      window.testResults.currentTime = engine.getCurrentTime();
      window.testResults.finalState = engine.getCurrentState();
      window.testResults.finalConservation = engine.getConservationLaws();
      
      // Add helper to update UI elements
      window.updateTestResults = () => {
        try {
          // Update geometric properties
          document.getElementById('totalVolume').textContent = window.testResults.geometric.totalVolume.toFixed(4);
          document.getElementById('totalArea').textContent = window.testResults.geometric.totalArea.toFixed(4);
          document.getElementById('effectiveDimension').textContent = window.testResults.geometric.effectiveDimension.toFixed(4);
          document.getElementById('volumeEntropy').textContent = window.testResults.geometric.volumeEntropy.toFixed(4);
          
          // Update statistics
          document.getElementById('mean').textContent = window.testResults.statistics.mean.toFixed(4);
          document.getElementById('variance').textContent = window.testResults.statistics.variance.toFixed(4);
          document.getElementById('skewness').textContent = '0.0000'; // Not calculated yet
          document.getElementById('kurtosis').textContent = '0.0000'; // Not calculated yet
          
          console.log("UI updated with test results:", window.testResults);
          return true;
        } catch (error) {
          console.error("Error updating UI with test results:", error);
          return false;
        }
      };
    }
    
    console.log('Simulation test completed successfully');
    return true;
  } catch (error) {
    console.error('Error in simulation test:', error);
    simulationLogger.log('error', 'Simulation test failed', { error });
    simulationLogger.endSession();
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
  
  // Also expose the SpinNetworkGeometryCalculator and SimulationAnalyzer for debugging
  window.SpinNetworkGeometryCalculator = SpinNetworkGeometryCalculator;
  window.SimulationAnalyzer = SimulationAnalyzer;
}

export { runSimulationTest };
