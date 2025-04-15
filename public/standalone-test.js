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
const resetSimulationButton = document.getElementById('reset-simulation');
const visualizationContainer = document.querySelector('.visualization');

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
  resetSimulationButton.addEventListener('click', handleResetSimulation);
  
  log('Initialization complete. Click "Create Graph" to start.');
}

/**
 * Creates a sample graph for simulation
 */
function handleCreateGraph() {
  log('Creating sample graph...');
  
  try {
    // Create a new graph
    simulationGraph = SpinNetwork.createGraph();
    
    // Add nodes to the graph with positions
    const nodePositions = [
      { id: 'node1', x: 0, y: 0 },
      { id: 'node2', x: 100, y: 0 },
      { id: 'node3', x: 50, y: 87 },
      { id: 'node4', x: 0, y: 174 },
      { id: 'node5', x: 100, y: 174 }
    ];
    
    nodePositions.forEach(pos => {
      simulationGraph = simulationGraph.addNode({
        id: pos.id,
        intertwiner: 2, // Default intertwiner value
        position: { x: pos.x, y: pos.y },
        properties: {}
      });
    });
    
    log(`Added ${nodePositions.length} nodes to the graph`);
    
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
      simulationGraph = simulationGraph.addEdge({
        id: edge.id,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        spin: edge.spin,
        properties: {}
      });
    });
    
    log(`Added ${edges.length} edges to the graph`);
    
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
      simulationEngine.addEventListener(SpinNetwork.SimulationEvent.ERROR, (error) => {
        logError('Simulation error:', error);
      });
    }
    
    // Initialize simulation if needed
    if (!simulationEngine.isRunning()) {
      const simulationParameters = {
        // General simulation parameters
        timeStep: 0.01,
        totalTime: 10,
        
        // Diffusion model parameters
        diffusionType: 'ordinary', // 'ordinary' or 'telegraph'
        alpha: 1.0, // Diffusion coefficient
        
        // Numerical method parameters
        numericalMethod: 'rk4', // 'euler', 'midpoint', or 'rk4'
        
        // Weight function configuration
        weightFunction: 'spin', // Use spin values as weights
        
        // Initial state configuration
        initialStateType: 'delta', // Delta function at a specific node
        initialStateParams: {
          nodeId: 'node1', // Start at node1
          value: 1.0 // Initial value
        },
        
        // Analysis and visualization
        recordHistory: true,
        historyInterval: 5, // Record every 5 steps
        
        // Additional parameters
        parameters: {}
      };
      
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
      runSimulationButton.disabled = false;
      pauseSimulationButton.disabled = true;
      
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
  
  // Stop animation loop
  stopAnimationLoop();
  
  // Final update of results
  updateResults();
}

/**
 * Start animation loop for continuous updates
 */
function startAnimationLoop() {
  lastUpdateTime = performance.now();
  updateAnimation();
}

/**
 * Animation loop for updating the UI
 */
function updateAnimation() {
  const now = performance.now();
  
  // Update UI at most 10 times per second
  if (now - lastUpdateTime > 100) {
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
      if (time % 1 < 0.011) { // Log approximately once per time unit
        log(`Time ${time.toFixed(2)}: Volume=${volume.toFixed(4)}, Entropy=${entropy.toFixed(4)}`);
      }
    }
    
    // Update visualization
    drawGraph();
    
  } catch (error) {
    logError('Error updating results:', error);
  }
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
