// Basic Test Suite Implementation

// Store references to DOM elements
const consoleOutput = document.getElementById('console-output');
const createNetworkBtn = document.getElementById('create-network');
const runTestBtn = document.getElementById('run-test');
const resetBtn = document.getElementById('reset');

// Configuration elements
const graphTypeSelect = document.getElementById('graph-type');
const nodeCountInput = document.getElementById('node-count');
const edgeSpinInput = document.getElementById('edge-spin');

// Results elements
const totalVolumeElem = document.getElementById('total-volume');
const totalAreaElem = document.getElementById('total-area');
const effectiveDimensionElem = document.getElementById('effective-dimension');
const meanElem = document.getElementById('mean');
const varianceElem = document.getElementById('variance');

// Store current test state
let currentNetwork = null;
let currentState = null;

// State persistence
const STATE_KEY = 'spinNetworkState';

function saveState() {
    const timestamp = new Date();
    const state = {
        config: {
            graphType: graphTypeSelect.value,
            nodeCount: nodeCountInput.value,
            edgeSpin: edgeSpinInput.value
        },
        results: {
            totalVolume: totalVolumeElem.textContent,
            totalArea: totalAreaElem.textContent,
            effectiveDimension: effectiveDimensionElem.textContent,
            mean: meanElem.textContent,
            variance: varianceElem.textContent
        },
        timestamp: timestamp.toISOString()
    };
    
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
        document.getElementById('last-saved').textContent = 
            timestamp.toLocaleTimeString();
        console.log('State saved successfully');
    } catch (error) {
        console.error('Failed to save state:', error);
    }
}

function loadState() {
    try {
        const savedState = localStorage.getItem(STATE_KEY);
        if (!savedState) {
            console.log('No saved state found');
            return;
        }

        const state = JSON.parse(savedState);
        console.log('Loading state from:', state.timestamp);

        // Restore configuration
        graphTypeSelect.value = state.config.graphType;
        nodeCountInput.value = state.config.nodeCount;
        edgeSpinInput.value = state.config.edgeSpin;

        // Restore results
        totalVolumeElem.textContent = state.results.totalVolume;
        totalAreaElem.textContent = state.results.totalArea;
        effectiveDimensionElem.textContent = state.results.effectiveDimension;
        meanElem.textContent = state.results.mean;
        varianceElem.textContent = state.results.variance;

        console.log('State restored successfully');
    } catch (error) {
        console.error('Failed to load state:', error);
    }
}

// Capture console output
const originalLog = console.log;
const originalError = console.error;

console.log = function() {
    originalLog.apply(console, arguments);
    const args = Array.from(arguments);
    const line = args.map(arg => {
        if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
        }
        return String(arg);
    }).join(' ');
    consoleOutput.textContent += line + '\n';
};

console.error = function() {
    originalError.apply(console, arguments);
    const args = Array.from(arguments);
    const line = args.map(arg => {
        if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
        }
        return String(arg);
    }).join(' ');
    consoleOutput.textContent += '❌ ERROR: ' + line + '\n';
};

// Network creation with configuration
function createBasicNetwork() {
    try {
        console.log('Creating network...');
        
        if (!window.SpinNetwork) {
            throw new Error('Spin Network library not loaded');
        }

        const options = {
            nodeCount: parseInt(nodeCountInput.value),
            edgeSpin: parseFloat(edgeSpinInput.value)
        };

        console.log('Creating network with options:', options);
        
        switch(graphTypeSelect.value) {
            case 'line':
                currentNetwork = window.SpinNetwork.createLineGraph(options);
                break;
            case 'ring':
                currentNetwork = window.SpinNetwork.createRingGraph(options);
                break;
            case 'grid':
                currentNetwork = window.SpinNetwork.createGridGraph(options);
                break;
            case 'random':
                currentNetwork = window.SpinNetwork.createRandomGraph({
                    ...options,
                    edgeProbability: 0.5
                });
                break;
            default:
                throw new Error('Unknown graph type: ' + graphTypeSelect.value);
        }

        console.log('Network created successfully with', currentNetwork.nodes.length, 'nodes');
        return true;
    } catch (error) {
        console.error('Failed to create network:', error);
        return false;
    }
}

// Basic test implementation
function runBasicTest() {
    try {
        console.log('Running basic test...');
        
        if (!currentNetwork) {
            throw new Error('No network created. Create network first.');
        }

        // Create simulation engine
        const engine = window.SpinNetwork.createSimulationEngine();
        
        // Set up basic parameters
        const params = {
            initialStateType: 'uniform',  // Add initial state type
            initialStateParams: {         // Add initial state parameters
                value: 1.0
            },
            timeStep: 0.01,
            totalTime: 1.0,
            diffusionType: 'ordinary',
            recordHistory: true,          // Enable history recording
            historyInterval: 0.1,         // Record every 0.1 time units
            weightFunction: 'spin',       // Add weight function
            alpha: 1.0,                   // Add diffusion coefficient
            parameters: {                 // Add additional parameters
                stabilityThreshold: 1e6,
                autoNormalize: true,
                normalizeFrequency: 10
            }
        };

        // Initialize and run
        console.log('Initializing engine with parameters:', params);
        engine.initialize(currentNetwork, params);
        engine.step();
        
        currentState = engine.getCurrentState();
        updateResults(currentState);
        console.log('Test completed successfully');
        
        return true;
    } catch (error) {
        console.error('Test failed:', error);
        return false;
    }
}

// Update results display
function updateResults(state) {
    try {
        if (!state) {
            console.log('No state available for results update');
            return;
        }

        const geometryCalculator = new window.SpinNetwork.GeometricPropertiesCalculator();
        
        // Calculate and display geometric properties
        const totalVolume = geometryCalculator.calculateTotalVolume(state);
        const totalArea = geometryCalculator.calculateTotalArea(currentNetwork);
        const effectiveDim = geometryCalculator.calculateEffectiveDimension(currentNetwork, state);

        totalVolumeElem.textContent = totalVolume.toFixed(4);
        totalAreaElem.textContent = totalArea.toFixed(4);
        effectiveDimensionElem.textContent = effectiveDim.toFixed(4);

        // Calculate and display statistics
        const stats = window.SpinNetwork.SimulationAnalyzer.calculateStatistics(state);
        
        meanElem.textContent = stats.mean.toFixed(4);
        varianceElem.textContent = stats.variance.toFixed(4);

    } catch (error) {
        console.error('Error updating results:', error);
    }
}

// Reset test environment
function resetEnvironment() {
    console.log('Resetting test environment...');
    currentNetwork = null;
    currentState = null;
    consoleOutput.textContent = '';
    
    // Reset result displays
    totalVolumeElem.textContent = '0.0000';
    totalAreaElem.textContent = '0.0000';
    effectiveDimensionElem.textContent = '0.0000';
    meanElem.textContent = '0.0000';
    varianceElem.textContent = '0.0000';
}

// Event Listeners
createNetworkBtn.addEventListener('click', () => {
    if (createBasicNetwork()) {
        saveState();
    }
});

runTestBtn.addEventListener('click', () => {
    if (runBasicTest()) {
        saveState();
    }
});

resetBtn.addEventListener('click', () => {
    resetEnvironment();
    localStorage.removeItem(STATE_KEY);
    console.log('State cleared');
});

// Load saved state when page loads
document.addEventListener('DOMContentLoaded', loadState);

// Save state when user changes configuration
graphTypeSelect.addEventListener('change', saveState);
nodeCountInput.addEventListener('change', saveState);
edgeSpinInput.addEventListener('change', saveState);