// Basic Test Suite Implementation

// Store references to DOM elements
const consoleOutput = document.getElementById('console-output');
const createNetworkBtn = document.getElementById('create-network');
const runTestBtn = document.getElementById('run-test');
const resetBtn = document.getElementById('reset');

// Visualization elements
const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
const nodeSizeInput = document.getElementById('node-size');
const edgeWidthInput = document.getElementById('edge-width');
const showLabelsInput = document.getElementById('show-labels');
const vizTypeSelect = document.getElementById('viz-type');

// Visualization state
let visualizationState = {
    nodeSize: 10,
    edgeWidth: 2,
    showLabels: true,
    vizType: 'network'
};

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
        visualization: {
            nodeSize: visualizationState.nodeSize,
            edgeWidth: visualizationState.edgeWidth,
            showLabels: visualizationState.showLabels,
            vizType: visualizationState.vizType
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

        // Restore visualization settings
        if (state.visualization) {
            visualizationState = state.visualization;
            nodeSizeInput.value = visualizationState.nodeSize;
            edgeWidthInput.value = visualizationState.edgeWidth;
            showLabelsInput.checked = visualizationState.showLabels;
            vizTypeSelect.value = visualizationState.vizType;
            
            // Initialize canvas and render network if it exists
            initializeCanvas();
            renderNetwork();
        }

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
        
        // Clear the current network
        currentNetwork = null;
        
        // Create an empty graph instance
        const emptyGraph = window.SpinNetwork.createGraph();
        
        switch(graphTypeSelect.value) {
            case 'line':
                currentNetwork = window.SpinNetwork.templates.createLineGraph(emptyGraph, options);
                break;
            case 'ring':
                currentNetwork = window.SpinNetwork.templates.createRingGraph(emptyGraph, options);
                break;
            case 'grid':
                currentNetwork = window.SpinNetwork.templates.createGridGraph(emptyGraph, options);
                break;
            case 'random':
                currentNetwork = window.SpinNetwork.templates.createRandomGraph(emptyGraph, {
                    ...options,
                    edgeProbability: 0.5
                });
                break;
            default:
                throw new Error('Unknown graph type: ' + graphTypeSelect.value);
        }

        console.log('Network created with:', {
            nodes: currentNetwork.nodes.length,
            edges: currentNetwork.edges,
            type: graphTypeSelect.value
        });
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
        
        // Render the updated network
        initializeCanvas();
        renderNetwork();
        
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

        // Calculate and display geometric properties using Analysis namespace
        const totalVolume = window.SpinNetwork.Analysis.calculateTotalVolume(state);
        const totalArea = window.SpinNetwork.Analysis.calculateTotalArea(currentNetwork);
        const effectiveDim = window.SpinNetwork.Analysis.calculateEffectiveDimension(currentNetwork, state);

        totalVolumeElem.textContent = totalVolume.toFixed(4);
        totalAreaElem.textContent = totalArea.toFixed(4);
        effectiveDimensionElem.textContent = effectiveDim.toFixed(4);

        // Calculate and display statistics
        const stats = window.SpinNetwork.analysis.SimulationAnalyzer.calculateStatistics(state);
        
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

// Visualization Functions
function initializeCanvas() {
    if (!canvas || !ctx) return;
    
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    ctx.strokeStyle = '#1e40af';
    ctx.fillStyle = '#3b82f6';
    ctx.font = '12px sans-serif';
}

function drawNode(x, y, label, value = null) {
    ctx.beginPath();
    ctx.arc(x, y, visualizationState.nodeSize, 0, Math.PI * 2);
    
    if (visualizationState.vizType === 'state' && value !== null) {
        // Color based on state value
        const hue = Math.max(0, Math.min(240, value * 240));
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
    }
    
    ctx.fill();
    ctx.stroke();
    
    if (visualizationState.showLabels) {
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y - visualizationState.nodeSize - 5);
    }
}

function drawEdge(x1, y1, x2, y2, weight = 1) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    
    if (visualizationState.vizType === 'geometry') {
        // Adjust line width based on geometric weight
        ctx.lineWidth = weight * visualizationState.edgeWidth;
    }
    
    ctx.stroke();
}

function calculateNodePositions(network) {
    const positions = [];
    const padding = 50;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    switch(graphTypeSelect.value) {
        case 'line':
            // Position nodes in a horizontal line
            for (let i = 0; i < network.nodes.length; i++) {
                positions.push({
                    x: padding + (width * i / (network.nodes.length - 1)),
                    y: canvas.height / 2
                });
            }
            break;
            
        case 'ring':
            // Position nodes in a circle
            const radius = Math.min(width, height) / 2;
            for (let i = 0; i < network.nodes.length; i++) {
                const angle = (i / network.nodes.length) * Math.PI * 2;
                positions.push({
                    x: canvas.width / 2 + radius * Math.cos(angle),
                    y: canvas.height / 2 + radius * Math.sin(angle)
                });
            }
            break;
            
        case 'grid':
            // Position nodes in a grid
            const cols = Math.ceil(Math.sqrt(network.nodes.length));
            const rows = Math.ceil(network.nodes.length / cols);
            for (let i = 0; i < network.nodes.length; i++) {
                positions.push({
                    x: padding + (width * (i % cols) / (cols - 1)),
                    y: padding + (height * Math.floor(i / cols) / (rows - 1))
                });
            }
            break;
            
        case 'random':
            // Random positions with minimum distance constraints
            for (let i = 0; i < network.nodes.length; i++) {
                let x, y, attempts = 0;
                do {
                    x = padding + Math.random() * width;
                    y = padding + Math.random() * height;
                    attempts++;
                } while (attempts < 50 && positions.some(p => 
                    Math.hypot(p.x - x, p.y - y) < 3 * visualizationState.nodeSize));
                positions.push({ x, y });
            }
            break;
    }
    
    return positions;
}

function renderNetwork() {
    if (!currentNetwork || !canvas || !ctx) return;
    
    // Log network structure
    console.log('Network structure:', {
        nodes: currentNetwork.nodes.length,
        edges: currentNetwork.edges,
        type: graphTypeSelect.value
    });
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const nodeRadius = parseInt(nodeSizeInput.value) || 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate positions based on graph type
    const positions = [];
    const effectiveWidth = width - 2 * padding;
    const effectiveHeight = height - 2 * padding;
    
    switch(graphTypeSelect.value) {
        case 'line':
            // Arrange nodes in a horizontal line
            for (let i = 0; i < currentNetwork.nodes.length; i++) {
                positions[i] = {
                    x: padding + (effectiveWidth * i / (currentNetwork.nodes.length - 1)),
                    y: height / 2
                };
            }
            break;
            
        case 'ring':
            // Arrange nodes in a circle
            const radius = Math.min(effectiveWidth, effectiveHeight) / 2.5;
            const centerX = width / 2;
            const centerY = height / 2;
            
            for (let i = 0; i < currentNetwork.nodes.length; i++) {
                const angle = (i / currentNetwork.nodes.length) * Math.PI * 2;
                positions[i] = {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            }
            break;
            
        case 'grid':
            // Arrange nodes in a grid
            const cols = Math.ceil(Math.sqrt(currentNetwork.nodes.length));
            const rows = Math.ceil(currentNetwork.nodes.length / cols);
            const cellWidth = effectiveWidth / (cols - 1 || 1);
            const cellHeight = effectiveHeight / (rows - 1 || 1);
            
            for (let i = 0; i < currentNetwork.nodes.length; i++) {
                positions[i] = {
                    x: padding + (i % cols) * cellWidth,
                    y: padding + Math.floor(i / cols) * cellHeight
                };
            }
            break;
            
        case 'random':
            // Place nodes randomly but try to maintain minimum distance
            const minDistance = nodeRadius * 4;
            
            for (let i = 0; i < currentNetwork.nodes.length; i++) {
                let attempts = 0;
                let validPosition = false;
                
                while (!validPosition && attempts < 50) {
                    const x = padding + Math.random() * effectiveWidth;
                    const y = padding + Math.random() * effectiveHeight;
                    
                    // Check distance from other nodes
                    validPosition = true;
                    for (let j = 0; j < i; j++) {
                        const dx = x - positions[j].x;
                        const dy = y - positions[j].y;
                        if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
                            validPosition = false;
                            break;
                        }
                    }
                    
                    if (validPosition) {
                        positions[i] = { x, y };
                    }
                    attempts++;
                }
                
                // If we couldn't find a good position, just place it
                if (!validPosition) {
                    positions[i] = {
                        x: padding + Math.random() * effectiveWidth,
                        y: padding + Math.random() * effectiveHeight
                    };
                }
            }
            break;
    }
    
    // Draw edges with darker, more visible style
    ctx.strokeStyle = '#000000'; // Black color for better visibility
    ctx.lineWidth = parseInt(edgeWidthInput.value) || 2;
    
    if (currentNetwork.edges && currentNetwork.edges.length > 0) {
        currentNetwork.edges.forEach((edge) => {
            // Extract numeric index from node ID (e.g., "node1" -> 0)
            const sourceIndex = parseInt(edge.sourceId.replace('node', '')) - 1;
            const targetIndex = parseInt(edge.targetId.replace('node', '')) - 1;
            
            const sourcePos = positions[sourceIndex];
            const targetPos = positions[targetIndex];
            
            if (sourcePos && targetPos) {
                ctx.beginPath();
                ctx.moveTo(sourcePos.x, sourcePos.y);
                ctx.lineTo(targetPos.x, targetPos.y);
                ctx.stroke();
            }
        });
    }
    
    // Draw nodes
    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        
        // Draw node
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw label if enabled
        if (showLabelsInput.checked) {
            ctx.fillStyle = '#1e293b';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`N${i}`, pos.x, pos.y - (nodeRadius + 10));
        }
    }
}

// Event Listeners for Visualization
nodeSizeInput.addEventListener('input', () => {
    visualizationState.nodeSize = parseInt(nodeSizeInput.value);
    renderNetwork();
    saveState();
});

edgeWidthInput.addEventListener('input', () => {
    visualizationState.edgeWidth = parseInt(edgeWidthInput.value);
    renderNetwork();
    saveState();
});

showLabelsInput.addEventListener('change', () => {
    visualizationState.showLabels = showLabelsInput.checked;
    renderNetwork();
    saveState();
});

vizTypeSelect.addEventListener('change', () => {
    visualizationState.vizType = vizTypeSelect.value;
    renderNetwork();
    saveState();
});

// Initialize canvas when window resizes
window.addEventListener('resize', () => {
    initializeCanvas();
    renderNetwork();
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeCanvas();
});

window.addEventListener('resize', () => {
    initializeCanvas();
    if (currentNetwork) renderNetwork();
});

createNetworkBtn.addEventListener('click', () => {
    if (createBasicNetwork()) {
        renderNetwork();
        saveState();
    }
});

runTestBtn.addEventListener('click', () => {
    if (runBasicTest()) {
        renderNetwork();
        saveState();
    }
});

resetBtn.addEventListener('click', () => {
    resetEnvironment();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem(STATE_KEY);
    console.log('State cleared');
});

// Load saved state when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initializeCanvas();
    if (currentNetwork) {
        renderNetwork();
    }
});

// Save state when user changes configuration
graphTypeSelect.addEventListener('change', saveState);
nodeCountInput.addEventListener('change', saveState);
edgeSpinInput.addEventListener('change', saveState);

// Handle window resize for canvas
window.addEventListener('resize', () => {
    if (canvas) {
        initializeCanvas();
        renderNetwork();
    }
});