// Standalone Test JS file

window.addEventListener('DOMContentLoaded', function() {
  const consoleOutput = document.getElementById('console-output');
  let simulationEngine = null;
  let currentGraph = null;
  let animationFrameId = null;
  
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
    
    if (consoleOutput) {
      consoleOutput.textContent += line + '\n';
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
    console.log(...args); // Also log to console for debugging
  }

  // Check if the UMD library was loaded
  if (typeof window.SpinNetwork === 'undefined') {
    log('ERROR: The SpinNetwork UMD library could not be loaded.');
    log('Please run: pnpm run build:lib to generate the required library file.');
    log('Expected path: /dist/lib/spin-network.umd.js');
    return;
  }
  
  log('SpinNetwork UMD library loaded successfully!');

  // Get UI elements
  const createGraphBtn = document.getElementById('create-graph');
  const runSimulationBtn = document.getElementById('run-simulation');
  const pauseSimulationBtn = document.getElementById('pause-simulation');
  const continueSimulationBtn = document.getElementById('continue-simulation');
  const resetSimulationBtn = document.getElementById('reset-simulation');
  
  // Get configuration elements
  const graphTypeSelect = document.getElementById('graph-type');
  const nodeCountInput = document.getElementById('node-count');
  const edgeSpinSelect = document.getElementById('edge-spin');
  const diffusionTypeSelect = document.getElementById('diffusion-type');
  const numericalMethodSelect = document.getElementById('numerical-method');
  const timeStepInput = document.getElementById('time-step');
  const diffusionCoeffInput = document.getElementById('diffusion-coefficient');
  const autoNormalizeCheck = document.getElementById('auto-normalize');

  // Get display elements
  const simulationStatus = document.getElementById('simulation-status');
  const simulationTime = document.getElementById('simulation-time');
  const nodeCountDisplay = document.getElementById('node-count');
  const edgeCountDisplay = document.getElementById('edge-count');
  const totalVolume = document.getElementById('total-volume');
  const totalArea = document.getElementById('total-area');
  const effectiveDimension = document.getElementById('effective-dimension');
  const volumeEntropy = document.getElementById('volume-entropy');

  function updateSimulationDisplay() {
    if (!simulationEngine || !currentGraph) return;
    
    try {
      // Get current state
      const state = simulationEngine.getCurrentState();
      const time = simulationEngine.getCurrentTime();
      
      // Update simulation state display
      simulationTime.textContent = time.toFixed(4);
      nodeCountDisplay.textContent = currentGraph.nodes.length;
      edgeCountDisplay.textContent = currentGraph.edges.length;
      
      // Only calculate geometric properties if we have a valid state
      if (state && state.size > 0) {
        // Calculate geometric properties using the SpinNetwork library
        const geometryCalculator = new window.SpinNetwork.GeometricPropertiesCalculator();
        
        try {
          const volume = geometryCalculator.calculateTotalVolume(state);
          const area = geometryCalculator.calculateTotalArea(currentGraph);
          const dimension = geometryCalculator.calculateEffectiveDimension(currentGraph, state);
          const entropy = geometryCalculator.calculateVolumeEntropy(state);
          
          totalVolume.textContent = volume.toFixed(4);
          totalArea.textContent = area.toFixed(4);
          effectiveDimension.textContent = dimension.toFixed(4);
          volumeEntropy.textContent = entropy.toFixed(4);
        } catch (calcError) {
          console.error('Error calculating geometric properties:', calcError);
        }
      }
      
      // Continue animation if running
      if (simulationEngine.isRunning()) {
        animationFrameId = requestAnimationFrame(updateSimulationDisplay);
      }
    } catch (error) {
      console.error('Error in display update:', error);
    }
  }

  function createGraph() {
    try {
      const type = graphTypeSelect.value;
      const nodeCount = parseInt(nodeCountInput.value);
      const spinType = edgeSpinSelect.value;
      
      // Create graph options
      const options = {
        nodeCount,
        spinType,
        fixedSpinValue: 0.5,
        minSpin: 0.5,
        maxSpin: 2.0
      };
      
      // Create the appropriate graph type
      switch (type) {
        case 'line':
          currentGraph = window.SpinNetwork.createLineGraph(options);
          break;
        case 'ring':
          currentGraph = window.SpinNetwork.createRingGraph(options);
          break;
        case 'grid':
          currentGraph = window.SpinNetwork.createGridGraph({
            ...options,
            rows: Math.ceil(Math.sqrt(nodeCount)),
            columns: Math.ceil(Math.sqrt(nodeCount))
          });
          break;
        case 'random':
          currentGraph = window.SpinNetwork.createRandomGraph({
            ...options,
            connectivity: 0.3,
            ensureConnected: true
          });
          break;
        default:
          currentGraph = window.SpinNetwork.createLineGraph({ nodeCount: 5, spinType: 'fixed' });
      }

      log(`Created ${type} graph with ${currentGraph.nodes.length} nodes and ${currentGraph.edges.length} edges`);

      // Create simulation engine
      simulationEngine = window.SpinNetwork.createSimulationEngine();
      
      // Update UI
      simulationStatus.textContent = 'Graph created';
      runSimulationBtn.disabled = false;
      resetSimulationBtn.disabled = false;
      
      // Update display
      updateSimulationDisplay();
      
    } catch (error) {
      log('Error creating graph:', error.message);
    }
  }

  function startSimulation() {
    if (!currentGraph || !simulationEngine) {
      log('Error: Create a graph first');
      return;
    }
    
    try {
      // Construct simulation parameters
      const parameters = {
        timeStep: parseFloat(timeStepInput.value),
        totalTime: 10.0,
        diffusionType: diffusionTypeSelect.value,
        numericalMethod: numericalMethodSelect.value,
        alpha: parseFloat(diffusionCoeffInput.value),
        beta: 0.5,
        c: 1.0,
        weightFunction: 'spin',
        initialStateType: 'delta',
        initialStateParams: {
          nodeId: currentGraph.nodes[0].id,
          value: 1.0
        },
        recordHistory: true,
        historyInterval: 1,
        autoNormalize: autoNormalizeCheck.checked,
        parameters: {}
      };

      log('Initializing simulation with parameters:', parameters);
      
      // Initialize the simulation
      simulationEngine.initialize(currentGraph, parameters);
      
      // Verify initial state
      const initialState = simulationEngine.getCurrentState();
      if (!initialState) {
        throw new Error('Failed to create initial state');
      }
      
      log('Initial state created successfully');
      
      // Start the simulation
      simulationEngine.resume();
      
      // Update UI
      simulationStatus.textContent = 'Running';
      runSimulationBtn.disabled = true;
      pauseSimulationBtn.disabled = false;
      
      // Start animation loop
      updateSimulationDisplay();
      
      log('Simulation started');
      
    } catch (error) {
      log('Error starting simulation:', error.message);
    }
  }

  function pauseSimulation() {
    if (simulationEngine) {
      simulationEngine.pause();
      simulationStatus.textContent = 'Paused';
      pauseSimulationBtn.disabled = true;
      continueSimulationBtn.disabled = false;
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      log('Simulation paused');
    }
  }

  function continueSimulation() {
    if (simulationEngine) {
      simulationEngine.resume();
      simulationStatus.textContent = 'Running';
      pauseSimulationBtn.disabled = false;
      continueSimulationBtn.disabled = true;
      
      updateSimulationDisplay();
      
      log('Simulation resumed');
    }
  }

  function resetSimulation() {
    if (simulationEngine) {
      simulationEngine.reset();
      simulationStatus.textContent = 'Reset';
      runSimulationBtn.disabled = false;
      pauseSimulationBtn.disabled = true;
      continueSimulationBtn.disabled = true;
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      updateSimulationDisplay();
      
      log('Simulation reset');
    }
  }

  // Add event listeners
  createGraphBtn.addEventListener('click', createGraph);
  runSimulationBtn.addEventListener('click', startSimulation);
  pauseSimulationBtn.addEventListener('click', pauseSimulation);
  continueSimulationBtn.addEventListener('click', continueSimulation);
  resetSimulationBtn.addEventListener('click', resetSimulation);
});
