/**
 * Standalone Spin Network Simulation Test
 * 
 * This file demonstrates the usage of the standalone spin network simulation library
 * without any UI framework dependencies.
 */

// Using the bundled SpinNetwork library
// The SpinNetwork global variable should be available from the included script

// Global references
let simulationEngine = null;
let simulationGraph = null;
let currentState = null;
let animationFrameId = null;
let lastUpdateTime = 0;

// DOM elements
const consoleOutput = document.getElementById('console-output');
const createGraphButton = document.getElementById('create-graph');
const runSimulationButton = document.getElementById('run-simulation');
const pauseSimulationButton = document.getElementById('pause-simulation');
const continueSimulationButton = document.getElementById('continue-simulation');
const resetSimulationButton = document.getElementById('reset-simulation');
const visualizationContainer = document.querySelector('.visualization');

// Graph configuration controls
const graphTypeSelect = document.getElementById('graph-type');
const nodeCountInput = document.getElementById('node-count');
const edgeSpinSelect = document.getElementById('edge-spin');
const diffusionTypeSelect = document.getElementById('diffusion-type');
const numericalMethodSelect = document.getElementById('numerical-method');
const timeStepInput = document.getElementById('time-step');
const diffusionCoefficientInput = document.getElementById('diffusion-coefficient');
const autoNormalizeCheckbox = document.getElementById('auto-normalize');

// State display elements
const simulationStatus = document.getElementById('simulation-status');
const simulationTime = document.getElementById('simulation-time');
const nodeCount = document.getElementById('node-count');
const edgeCount = document.getElementById('edge-count');

// Results display elements
const totalVolume = document.getElementById('total-volume');
const totalArea = document.getElementById('total-area');
const effectiveDimension = document.getElementById('effective-dimension');
const volumeEntropy = document.getElementById('volume-entropy');

// Capture console output
setupConsoleCapture();

// Initialize the page
initializePage();

/**
 * Initializes the page and sets up event listeners
 */
function initializePage() {
  log('Initializing standalone spin network simulation test page');
  
  // Set up event listeners
  createGraphButton.addEventListener('click', handleCreateGraph);
  runSimulationButton.addEventListener('click', handleRunSimulation);
  pauseSimulationButton.addEventListener('click', handlePauseSimulation);
  continueSimulationButton.addEventListener('click', handleContinueSimulation);
  resetSimulationButton.addEventListener('click', handleResetSimulation);
  
  // Set up configuration change listeners
  graphTypeSelect.addEventListener('change', updateNodeCountVisibility);
  
  // Initialize UI state
  updateNodeCountVisibility();
  
  // Helper function to toggle node count input visibility
  function updateNodeCountVisibility() {
    const graphType = graphTypeSelect.value;
    if (graphType === 'custom') {
      nodeCountInput.value = 5;
      nodeCountInput.disabled = true;
    } else {
      nodeCountInput.disabled = false;
    }
  }
  
  log('Initialization complete. Click "Create Graph" to start.');
}

/**
 * Graph generator functions
 */
const GraphGenerators = {
  /**
   * Create a custom 5-node graph (original example)
   */
  custom: function() {
    const graph = SpinNetwork.createGraph();
    
    // Add nodes to the graph with positions
    const nodePositions = [
      { id: 'node1', x: 0, y: 0 },
      { id: 'node2', x: 100, y: 0 },
      { id: 'node3', x: 50, y: 87 },
      { id: 'node4', x: 0, y: 174 },
      { id: 'node5', x: 100, y: 174 }
    ];
    
    let result = graph;
    
    nodePositions.forEach(pos => {
      result = result.addNode({
        id: pos.id,
        intertwiner: 2, // Default intertwiner value
        position: { x: pos.x, y: pos.y },
        properties: {}
      });
    });
    
    // Add edges to the graph
    const edges = [
      { id: 'edge1', sourceId: 'node1', targetId: 'node2', spin: 0.5 },
      { id: 'edge2', sourceId: 'node1', targetId: 'node3', spin: 1.0 },
      { id: 'edge3', sourceId: 'node2', targetId: 'node3', spin: 0.5 },
      { id: 'edge4', sourceId: 'node3', targetId: 'node4', spin: 1.5 },
      { id: 'edge5', sourceId: 'node3', targetId: 'node5', spin: 1.0 },
      { id: 'edge6', sourceId: 'node4', targetId: 'node5', spin: 0.5 }
    ];
    
    edges.forEach(edge => {
      result = result.addEdge({
        id: edge.id,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        spin: edge.spin,
        properties: {}
      });
    });
    
    return result;
  },
  
  /**
   * Create a linear chain of nodes
   */
  line: function(nodeCount, spinType) {
    const graph = SpinNetwork.createGraph();
    let result = graph;
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      result = result.addNode({
        id: `node${i+1}`,
        intertwiner: 2,
        position: { x: i * 100, y: 0 },
        properties: {}
      });
    }
    
    // Create edges
    for (let i = 0; i < nodeCount - 1; i++) {
      const spin = spinType === 'random' ? 0.5 + Math.random() * 1.5 : 0.5;
      
      result = result.addEdge({
        id: `edge${i+1}`,
        sourceId: `node${i+1}`,
        targetId: `node${i+2}`,
        spin: spin,
        properties: {}
      });
    }
    
    return result;
  },
  
  /**
   * Create a ring of nodes
   */
  ring: function(nodeCount, spinType) {
    const graph = SpinNetwork.createGraph();
    let result = graph;
    
    const radius = 150;
    const centerX = radius;
    const centerY = radius;
    
    // Create nodes in a circle
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * 2 * Math.PI;
      result = result.addNode({
        id: `node${i+1}`,
        intertwiner: 2,
        position: { 
          x: centerX + radius * Math.cos(angle), 
          y: centerY + radius * Math.sin(angle) 
        },
        properties: {}
      });
    }
    
    // Create edges around the ring
    for (let i = 0; i < nodeCount; i++) {
      const nextIndex = (i + 1) % nodeCount;
      const spin = spinType === 'random' ? 0.5 + Math.random() * 1.5 : 0.5;
      
      result = result.addEdge({
        id: `edge${i+1}`,
        sourceId: `node${i+1}`,
        targetId: `node${nextIndex+1}`,
        spin: spin,
        properties: {}
      });
    }
    
    return result;
  },
  
  /**
   * Create a 2D grid of nodes
   */
  grid: function(nodeCount, spinType) {
    const graph = SpinNetwork.createGraph();
    let result = graph;
    
    // Determine grid dimensions
    const size = Math.ceil(Math.sqrt(nodeCount));
    const spacing = 80;
    
    // Create nodes in a grid
    let nodeIndex = 1;
    for (let row = 0; row < size && nodeIndex <= nodeCount; row++) {
      for (let col = 0; col < size && nodeIndex <= nodeCount; col++) {
        result = result.addNode({
          id: `node${nodeIndex}`,
          intertwiner: 2,
          position: { x: col * spacing, y: row * spacing },
          properties: {}
        });
        nodeIndex++;
      }
    }
    
    // Create horizontal edges
    let edgeIndex = 1;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size - 1; col++) {
        const nodeIndex1 = row * size + col + 1;
        const nodeIndex2 = row * size + col + 2;
        
        if (nodeIndex1 <= nodeCount && nodeIndex2 <= nodeCount) {
          const spin = spinType === 'random' ? 0.5 + Math.random() * 1.5 : 0.5;
          
          result = result.addEdge({
            id: `edge${edgeIndex++}`,
            sourceId: `node${nodeIndex1}`,
            targetId: `node${nodeIndex2}`,
            spin: spin,
            properties: {}
          });
        }
      }
    }
    
    // Create vertical edges
    for (let row = 0; row < size - 1; row++) {
      for (let col = 0; col < size; col++) {
        const nodeIndex1 = row * size + col + 1;
        const nodeIndex2 = (row + 1) * size + col + 1;
        
        if (nodeIndex1 <= nodeCount && nodeIndex2 <= nodeCount) {
          const spin = spinType === 'random' ? 0.5 + Math.random() * 1.5 : 0.5;
          
          result = result.addEdge({
            id: `edge${edgeIndex++}`,
            sourceId: `node${nodeIndex1}`,
            targetId: `node${nodeIndex2}`,
            spin: spin,
            properties: {}
          });
        }
      }
    }
    
    return result;
  },
  
  /**
   * Create a random graph with random connections
   */
  random: function(nodeCount, spinType) {
    const graph = SpinNetwork.createGraph();
    let result = graph;
    
    // Create nodes with random positions
    for (let i = 0; i < nodeCount; i++) {
      result = result.addNode({
        id: `node${i+1}`,
        intertwiner: 2,
        position: { 
          x: Math.random() * 300, 
          y: Math.random() * 300 
        },
        properties: {}
      });
    }
    
    // Create random edges with a target connectivity (avoid disconnected nodes)
    const edgeCount = Math.min(nodeCount * 2, nodeCount * (nodeCount - 1) / 2);
    const connected = new Set([1]); // Start with node1 as connected
    const unconnected = new Set(Array.from({length: nodeCount - 1}, (_, i) => i + 2)); // All other nodes
    
    let edgeIndex = 1;
    
    // First ensure all nodes are connected to at least one other node
    while (unconnected.size > 0) {
      const targetId = Array.from(unconnected)[0];
      const sourceId = Array.from(connected)[Math.floor(Math.random() * connected.size)];
      
      const spin = spinType === 'random' ? 0.5 + Math.random() * 1.5 : 0.5;
      
      result = result.addEdge({
        id: `edge${edgeIndex++}`,
        sourceId: `node${sourceId}`,
        targetId: `node${targetId}`,
        spin: spin,
        properties: {}
      });
      
      connected.add(targetId);
      unconnected.delete(targetId);
    }
    
    // Add additional random edges to reach target count
    while (edgeIndex <= edgeCount) {
      const sourceId = Math.floor(Math.random() * nodeCount) + 1;
      let targetId;
      do {
        targetId = Math.floor(Math.random() * nodeCount) + 1;
      } while (targetId === sourceId);
      
      // Check if this edge already exists
      const exists = result.edges.some(
        e => (e.sourceId === `node${sourceId}` && e.targetId === `node${targetId}`) || 
             (e.sourceId === `node${targetId}` && e.targetId === `node${sourceId}`)
      );
      
      if (!exists) {
        const spin = spinType === 'random' ? 0.5 + Math.random() * 1.5 : 0.5;
        
        result = result.addEdge({
          id: `edge${edgeIndex++}`,
          sourceId: `node${sourceId}`,
          targetId: `node${targetId}`,
          spin: spin,
          properties: {}
        });
      }
    }
    
    return result;
  }
};

/**
 * Creates a graph based on current configuration
 */
function handleCreateGraph() {
  log('Creating graph based on configuration...');
  
  try {
    // Get configuration values
    const graphType = graphTypeSelect.value;
    const nodeCount = parseInt(nodeCountInput.value, 10);
    const spinType = edgeSpinSelect.value;
    
    // Validate node count
    if (isNaN(nodeCount) || nodeCount < 2 || nodeCount > 50) {
      log('Invalid node count. Using default of 5 nodes.');
      nodeCountInput.value = 5;
    }
    
    // Generate graph based on type
    if (graphType === 'custom' && nodeCount === 5) {
      simulationGraph = GraphGenerators.custom();
      log('Created custom 5-node graph');
    } else if (graphType === 'line') {
      simulationGraph = GraphGenerators.line(nodeCount, spinType);
      log(`Created linear chain with ${nodeCount} nodes`);
    } else if (graphType === 'ring') {
      simulationGraph = GraphGenerators.ring(nodeCount, spinType);
      log(`Created ring with ${nodeCount} nodes`);
    } else if (graphType === 'grid') {
      simulationGraph = GraphGenerators.grid(nodeCount, spinType);
      log(`Created ${Math.ceil(Math.sqrt(nodeCount))}x${Math.ceil(Math.sqrt(nodeCount))} grid with ${nodeCount} nodes`);
    } else if (graphType === 'random') {
      simulationGraph = GraphGenerators.random(nodeCount, spinType);
      log(`Created random graph with ${nodeCount} nodes`);
    } else {
      simulationGraph = GraphGenerators.custom();
      log('Using default custom graph');
    }
    
    // Update UI
    updateGraphInfo();
    
    // Enable simulation controls
    runSimulationButton.disabled = false;
    resetSimulationButton.disabled = false;
    
    log('Graph created successfully');
    log('Graph nodes:', simulationGraph.nodes.map(n => n.id).join(', '));
    log('Graph edges:', simulationGraph.edges.map(e => `${e.sourceId}->${e.targetId}`).join(', '));
    
    // Draw the initial graph
    drawGraph();
    
  } catch (error) {
    logError('Error creating graph:', error);
  }
}

/**
 * Initializes and runs the simulation
 */
function handleRunSimulation() {
  log('Starting simulation...');
  
  try {
    // Create simulation engine if not exists
    if (!simulationEngine) {
      simulationEngine = SpinNetwork.createSimulationEngine();
      
      // Add event listeners
      simulationEngine.addEventListener(SpinNetwork.SimulationEvent.STEP_COMPLETE, handleStepComplete);
      simulationEngine.addEventListener(SpinNetwork.SimulationEvent.SIMULATION_COMPLETE, handleSimulationComplete);
      simulationEngine.addEventListener(SpinNetwork.SimulationEvent.STATE_NORMALIZED, (event) => {
        log('State normalized to prevent numerical instability.');
      });
      simulationEngine.addEventListener(SpinNetwork.SimulationEvent.ERROR, (error) => {
        logError('Simulation error:', error);
      });
    }
    
    // Initialize simulation if needed
    if (!simulationEngine.isRunning()) {
      // Get configuration values from UI
      const timeStep = parseFloat(timeStepInput.value) || 0.005;
      const diffusionType = diffusionTypeSelect.value;
      const alpha = parseFloat(diffusionCoefficientInput.value) || 0.5;
      const numericalMethod = numericalMethodSelect.value;
      const autoNormalize = autoNormalizeCheckbox.checked;
      
      const simulationParameters = {
        // General simulation parameters
        timeStep: timeStep,
        totalTime: 10,
        
        // Diffusion model parameters
        diffusionType: diffusionType,
        alpha: alpha,
        beta: 0.1, // For telegraph equation
        
        // Numerical method parameters
        numericalMethod: numericalMethod,
        
        // Weight function configuration
        weightFunction: 'spin', // Use spin values as weights
        
        // Initial state configuration
        initialStateType: 'delta', // Delta function at a specific node
        initialStateParams: {
          nodeId: simulationGraph.nodes[0].id, // Start at first node
          value: 1.0 // Initial value
        },
        
        // Analysis and visualization
        recordHistory: true,
        historyInterval: 5, // Record every 5 steps
        
        // Additional parameters
        parameters: {
          normalizeFrequency: 5, // Normalize state more frequently (every 5 steps)
          autoNormalize: autoNormalize,
          stabilityThreshold: 1e4 // Lower threshold for earlier detection
        }
      };
      
      log('Simulation parameters:', simulationParameters);
      
      // Initialize the simulation
      simulationEngine.initialize(simulationGraph, simulationParameters);
      log('Simulation initialized with parameters:', simulationParameters);
      
      // Get the initial state for visualization
      currentState = simulationEngine.getCurrentState();
      log('Initial state created, size:', currentState.size);
    }
    
    // Start the simulation
    simulationEngine.resume();
    
    // Update UI
    simulationStatus.textContent = 'Running';
    runSimulationButton.disabled = true;
    pauseSimulationButton.disabled = false;
    continueSimulationButton.disabled = true;
    
    // Start animation loop
    startAnimationLoop();
    
    log('Simulation started');
    
  } catch (error) {
    logError('Error starting simulation:', error);
  }
}

/**
 * Pauses the running simulation
 */
function handlePauseSimulation() {
  log('Pausing simulation...');
  
  try {
    if (simulationEngine && simulationEngine.isRunning()) {
      simulationEngine.pause();
      
      // Update UI
      simulationStatus.textContent = 'Paused';
      runSimulationButton.disabled = true;
      pauseSimulationButton.disabled = true;
      continueSimulationButton.disabled = false;
      
      // Stop animation loop
      stopAnimationLoop();
      
      log('Simulation paused');
    } else {
      log('No simulation is running');
    }
  } catch (error) {
    logError('Error pausing simulation:', error);
  }
}

/**
 * Continues a paused simulation
 */
function handleContinueSimulation() {
  log('Continuing simulation...');
  
  try {
    if (simulationEngine && !simulationEngine.isRunning()) {
      simulationEngine.resume();
      
      // Update UI
      simulationStatus.textContent = 'Running';
      runSimulationButton.disabled = true;
      pauseSimulationButton.disabled = false;
      continueSimulationButton.disabled = true;
      
      // Start animation loop
      startAnimationLoop();
      
      log('Simulation continued');
    } else {
      log('No paused simulation to continue');
    }
  } catch (error) {
    logError('Error continuing simulation:', error);
  }
}

/**
 * Resets the simulation to initial state
 */
function handleResetSimulation() {
  log('Resetting simulation...');
  
  try {
    if (simulationEngine) {
      simulationEngine.reset();
      
      // Update UI
      simulationStatus.textContent = 'Reset';
      runSimulationButton.disabled = false;
      pauseSimulationButton.disabled = true;
      continueSimulationButton.disabled = true;
      
      // Stop animation loop
      stopAnimationLoop();
      
      // Update results with initial state
      updateResults();
      
      // Redraw graph
      drawGraph();
      
      log('Simulation reset');
    } else {
      log('No simulation to reset');
    }
  } catch (error) {
    logError('Error resetting simulation:', error);
  }
}

/**
 * Handle step completion event from the simulation engine
 */
function handleStepComplete(event) {
  // This function will be called after each simulation step
  // Update the current state
  currentState = simulationEngine.getCurrentState();
}

/**
 * Handle simulation completion event
 */
function handleSimulationComplete(event) {
  log('Simulation completed');
  
  // Update UI
  simulationStatus.textContent = 'Completed';
  runSimulationButton.disabled = false;
  pauseSimulationButton.disabled = true;
  continueSimulationButton.disabled = true;
  
  // Stop animation loop
  stopAnimationLoop();
  
  // Final update of results once
  updateResults();
  
  // Print final results to console just once
  const time = simulationEngine.getCurrentTime();
  const currentState = simulationEngine.getCurrentState();
  
  // Calculate final volume
  let volume = 0;
  for (let i = 0; i < currentState.size; i++) {
    const value = currentState.getValueAtIndex(i);
    volume += value * value;
  }
  
  // Calculate final entropy
  let sumValues = 0;
  let entropy = 0;
  
  for (let i = 0; i < currentState.size; i++) {
    const value = Math.abs(currentState.getValueAtIndex(i));
    sumValues += value;
  }
  
  if (sumValues > 0) {
    for (let i = 0; i < currentState.size; i++) {
      const value = Math.abs(currentState.getValueAtIndex(i));
      const p = value / sumValues;
      if (p > 0) {
        entropy -= p * Math.log(p);
      }
    }
  }
  
  log(`Final simulation results at time ${time.toFixed(2)}:`);
  log(`- Volume: ${volume.toFixed(4)}`);
  log(`- Entropy: ${entropy.toFixed(4)}`);
  
  // Log node-by-node values
  log("Final state values by node:");
  for (let i = 0; i < currentState.size; i++) {
    const nodeId = currentState.nodeIds[i];
    const value = currentState.getValueAtIndex(i);
    log(`- ${nodeId}: ${value.toFixed(6)}`);
  }
}

/**
 * Start animation loop for continuous updates
 */
function startAnimationLoop() {
  lastUpdateTime = performance.now();
  updateAnimation();
}

/**
 * Animation loop for updating the UI and stepping the simulation
 */
function updateAnimation() {
  const now = performance.now();
  
  // Update UI at most 10 times per second
  if (now - lastUpdateTime > 100) {
    // Execute simulation steps
    if (simulationEngine && simulationEngine.isRunning()) {
      // Run multiple steps per frame to speed up simulation
      // This runs 5 steps per frame, which with the default timeStep of 0.01
      // means each frame advances time by 0.05 units
      simulationEngine.runSteps(5);
    }
    
    // Update UI with latest results
    updateResults();
    lastUpdateTime = now;
  }
  
  // Continue animation loop
  animationFrameId = requestAnimationFrame(updateAnimation);
}

/**
 * Stop the animation loop
 */
function stopAnimationLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Update graph information in the UI
 */
function updateGraphInfo() {
  if (simulationGraph) {
    nodeCount.textContent = simulationGraph.getNodeCount();
    edgeCount.textContent = simulationGraph.getEdgeCount();
  }
}

/**
 * Update simulation results in the UI
 */
function updateResults() {
  if (!simulationEngine || !simulationGraph) return;
  
  try {
    // Update simulation time
    const time = simulationEngine.getCurrentTime();
    simulationTime.textContent = time.toFixed(4);
    
    // Get current state
    currentState = simulationEngine.getCurrentState();
    
    if (currentState) {
      // Calculate total volume - sum of squared state values
      let volume = 0;
      for (let i = 0; i < currentState.size; i++) {
        const value = currentState.getValueAtIndex(i);
        volume += value * value;
      }
      
      // Check for numerical instability - if volume is too large, normalize the state
      if (volume > 1e6) {
        log(`Warning: Numerical instability detected (volume=${volume.toExponential(4)}). Normalizing state.`);
        
        // Normalize the state to prevent instability
        const normalizationFactor = 1.0 / Math.sqrt(volume);
        
        // Create a normalized state
        const nodeIds = currentState.nodeIds;
        const normalizedValues = [];
        
        for (let i = 0; i < currentState.size; i++) {
          const originalValue = currentState.getValueAtIndex(i);
          normalizedValues.push(originalValue * normalizationFactor);
        }
        
        // Set the normalized state back to the simulation engine
        if (simulationEngine._setCurrentState) {
          simulationEngine._setCurrentState(
            new SpinNetwork.SimulationStateVector(nodeIds, normalizedValues)
          );
          
          // Update our local reference
          currentState = simulationEngine.getCurrentState();
          
          // Recalculate volume after normalization (should be ~1.0)
          volume = 0;
          for (let i = 0; i < currentState.size; i++) {
            const value = currentState.getValueAtIndex(i);
            volume += value * value;
          }
        }
      }
      
      totalVolume.textContent = formatValue(volume);
      
      // Calculate total area - sum of edge spins
      let area = 0;
      simulationGraph.edges.forEach(edge => {
        area += edge.spin;
      });
      totalArea.textContent = formatValue(area);
      
      // Calculate effective dimension (simplified version)
      // In a real implementation, this would use spectral dimension calculation
      const dimension = Math.log(simulationGraph.getNodeCount()) / 
                       Math.log(Math.sqrt(simulationGraph.getEdgeCount()));
      effectiveDimension.textContent = formatValue(dimension);
      
      // Calculate volume entropy (simplified)
      // In a real implementation, this would be -sum(p_i * log(p_i))
      let sumValues = 0;
      let entropy = 0;
      
      for (let i = 0; i < currentState.size; i++) {
        const value = Math.abs(currentState.getValueAtIndex(i));
        sumValues += value;
      }
      
      if (sumValues > 0) {
        for (let i = 0; i < currentState.size; i++) {
          const value = Math.abs(currentState.getValueAtIndex(i));
          const p = value / sumValues;
          if (p > 0) {
            entropy -= p * Math.log(p);
          }
        }
      }
      
      volumeEntropy.textContent = formatValue(entropy);
      
      // Log some state values for debugging
      if (time % 1 < 0.011 && !simulationEngine.getCurrentTime() >= simulationEngine._parameters?.totalTime) { 
        // Log approximately once per time unit, but not repeatedly after completion
        log(`Time ${time.toFixed(2)}: Volume=${formatExponential(volume)}, Entropy=${entropy.toFixed(4)}`);
      }
    }
    
    // Update visualization
    drawGraph();
    
  } catch (error) {
    logError('Error updating results:', error);
  }
}

/**
 * Format a number in exponential notation if it's very large
 */
function formatExponential(value, decimals = 4) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "0.0000";
  }
  
  // Use exponential notation for large numbers
  if (Math.abs(value) >= 1000) {
    return value.toExponential(decimals);
  }
  
  return value.toFixed(decimals);
}

/**
 * Draw the graph in the visualization container
 */
function drawGraph() {
  if (!simulationGraph) return;
  
  // Clear previous visualization
  visualizationContainer.innerHTML = '';
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = visualizationContainer.clientWidth;
  canvas.height = visualizationContainer.clientHeight;
  visualizationContainer.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    logError('Could not get canvas context');
    return;
  }
  
  // Set up scaling and centering
  const padding = 40;
  const width = canvas.width - 2 * padding;
  const height = canvas.height - 2 * padding;
  
  // Find bounds for scaling
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  simulationGraph.nodes.forEach(node => {
    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, node.position.y);
  });
  
  const rangeX = maxX - minX || 200; // Prevent division by zero
  const rangeY = maxY - minY || 200; // Prevent division by zero
  
  // Scale factors to fit the graph in the canvas
  const scaleX = width / rangeX;
  const scaleY = height / rangeY;
  const scale = Math.min(scaleX, scaleY) * 0.9; // Use the smaller scale with some margin
  
  // Center of the canvas
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  // Center of the graph
  const graphCenterX = (minX + maxX) / 2;
  const graphCenterY = (minY + maxY) / 2;
  
  // Draw edges first (so they appear behind nodes)
  ctx.lineWidth = 2;
  simulationGraph.edges.forEach(edge => {
    const sourceNode = simulationGraph.getNode(edge.sourceId);
    const targetNode = simulationGraph.getNode(edge.targetId);
    
    if (sourceNode && targetNode) {
      // Calculate scaled positions
      const sourceX = centerX + (sourceNode.position.x - graphCenterX) * scale;
      const sourceY = centerY + (sourceNode.position.y - graphCenterY) * scale;
      const targetX = centerX + (targetNode.position.x - graphCenterX) * scale;
      const targetY = centerY + (targetNode.position.y - graphCenterY) * scale;
      
      // Edge width based on spin
      ctx.lineWidth = 1 + edge.spin;
      
      // Draw edge
      ctx.beginPath();
      ctx.moveTo(sourceX, sourceY);
      ctx.lineTo(targetX, targetY);
      ctx.strokeStyle = '#2563eb'; // Blue color
      ctx.stroke();
      
      // Draw edge label (spin value)
      const labelX = (sourceX + targetX) / 2;
      const labelY = (sourceY + targetY) / 2;
      ctx.fillStyle = '#64748b'; // Gray text
      ctx.font = '10px sans-serif';
      ctx.fillText(edge.spin.toString(), labelX, labelY);
    }
  });
  
  // Draw nodes
  const nodeRadius = 15;
  simulationGraph.nodes.forEach(node => {
    // Calculate scaled position
    const x = centerX + (node.position.x - graphCenterX) * scale;
    const y = centerY + (node.position.y - graphCenterY) * scale;
    
    // Get state value for this node (if available)
    let stateValue = 0;
    if (currentState) {
      try {
        stateValue = currentState.getValue(node.id);
      } catch (error) {
        // Ignore errors in getting state value
      }
    }
    
    // Node color based on state value
    let nodeColor;
    if (stateValue > 0) {
      // Positive values: blue (darker for larger values)
      const intensity = Math.min(255, Math.floor(128 + 127 * stateValue));
      nodeColor = `rgb(0, 0, ${intensity})`;
    } else if (stateValue < 0) {
      // Negative values: red (darker for larger absolute values)
      const intensity = Math.min(255, Math.floor(128 + 127 * Math.abs(stateValue)));
      nodeColor = `rgb(${intensity}, 0, 0)`;
    } else {
      // Zero or undefined: gray
      nodeColor = '#64748b';
    }
    
    // Draw node
    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = nodeColor;
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw node label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.id, x, y);
    
    // Draw state value
    if (currentState) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.fillText(stateValue.toFixed(2), x, y + 15);
    }
  });
  
  // Add legend
  ctx.fillStyle = '#0f172a';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Node colors show state values (blue: positive, red: negative)', 10, 10);
}

/**
 * Formats a value for display
 */
function formatValue(value, decimals = 4) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "0.0000";
  }
  return value.toFixed(decimals);
}

/**
 * Set up console output capture
 */
function setupConsoleCapture() {
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = function() {
    originalLog.apply(console, arguments);
    log(...arguments);
  };
  
  console.error = function() {
    originalError.apply(console, arguments);
    logError(...arguments);
  };
}

/**
 * Log a message to the console output
 */
function log(...args) {
  const line = args.map(arg => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (error) {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
  
  consoleOutput.textContent += line + '\n';
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

/**
 * Log an error to the console output
 */
function logError(...args) {
  const line = args.map(arg => {
    if (typeof arg === 'object' && arg instanceof Error) {
      return `${arg.message}\n${arg.stack}`;
    } else if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (error) {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
  
  consoleOutput.textContent += '❌ ERROR: ' + line + '\n';
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}
