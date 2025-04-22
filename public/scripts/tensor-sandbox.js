//  * Tensor Sandbox Implementation
//  * 
//  * This script connects the tensor-sandbox.html UI to the standalone library
//  * for testing the tensor node and state vector edge implementations.
//  */

// Network state
let network = {
    nodes: [],
    edges: []
};

// Currently selected elements
let selectedNode = null;
let selectedEdge = null;

// Canvas and rendering context
let canvas;
let ctx;

// Initialize when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if SpinNetwork library is available
    if (!window.SpinNetwork) {
        console.error('SpinNetwork library not found. Please ensure the library is properly loaded.');
        alert('Error: SpinNetwork library not found. The sandbox requires the Spin Network library to function.');
        return;
    }
    
    // Initialize canvas
    canvas = document.getElementById('networkCanvas');
    ctx = canvas.getContext('2d');
    
    // Attach event handlers
    attachEventHandlers();
    
    // Set initial UI state
    updateUI();
    
    console.log('Tensor Sandbox initialized successfully');
});

/**
 * Attaches event handlers to UI controls
 */
function attachEventHandlers() {
    // Network creation
    document.getElementById('createNetworkButton').addEventListener('click', createNetwork);
    document.getElementById('resetButton').addEventListener('click', resetNetwork);
    
    // Change handlers for network type
    document.getElementById('networkType').addEventListener('change', updateNetworkTypeOptions);
    
    // Node operations
    document.getElementById('selectedNode').addEventListener('change', onNodeSelected);
    document.getElementById('setTensorElementButton').addEventListener('click', setTensorElement);
    
    // Edge operations
    document.getElementById('selectedEdge').addEventListener('change', onEdgeSelected);
    document.getElementById('setAmplitudeButton').addEventListener('click', setStateVectorAmplitude);
    document.getElementById('normalizeButton').addEventListener('click', normalizeStateVector);
    
    // Analysis
    document.getElementById('calculatePropertiesButton').addEventListener('click', calculateProperties);
    
    // Visualization mode
    document.getElementById('visualizationMode').addEventListener('change', renderNetwork);
}

/**
 * Updates UI options based on selected network type
 */
function updateNetworkTypeOptions() {
    const networkType = document.getElementById('networkType').value;
    const nodeCountInput = document.getElementById('nodeCount');
    
    // Enable/disable and set appropriate defaults based on network type
    switch(networkType) {
        case 'empty':
            nodeCountInput.value = '0';
            nodeCountInput.disabled = true;
            break;
        case 'line':
            nodeCountInput.value = '4';
            nodeCountInput.disabled = false;
            break;
        case 'ring':
            nodeCountInput.value = '6';
            nodeCountInput.disabled = false;
            break;
        case 'lattice':
            nodeCountInput.value = '9';
            nodeCountInput.disabled = false;
            break;
        case 'custom':
            nodeCountInput.value = '2';
            nodeCountInput.disabled = false;
            break;
    }
}

/**
 * Creates a new network based on selected options
 */
function createNetwork() {
    // Clear current network
    resetNetwork();
    
    const networkType = document.getElementById('networkType').value;
    const nodeCount = parseInt(document.getElementById('nodeCount').value) || 0;
    const spinValue = parseFloat(document.getElementById('defaultSpin').value) || 0.5;
    
    try {
        switch(networkType) {
            case 'empty':
                // Just leave the network empty
                break;
                
            case 'line':
                createLineNetwork(nodeCount, spinValue);
                break;
                
            case 'ring':
                createRingNetwork(nodeCount, spinValue);
                break;
                
            case 'lattice':
                createLatticeNetwork(nodeCount, spinValue);
                break;
                
            case 'custom':
                createCustomNetwork(nodeCount, spinValue);
                break;
        }
        
        // Update UI
        updateUI();
        renderNetwork();
        
        console.log(`Created ${networkType} network with ${network.nodes.length} nodes and ${network.edges.length} edges`);
    } catch (error) {
        console.error('Error creating network:', error);
        alert(`Error creating network: ${error.message}`);
    }
}

/**
 * Creates a line network with the specified number of nodes
 */
function createLineNetwork(nodeCount, spinValue) {
    const graphOptions = {
        nodeCount: nodeCount,
        spinType: "fixed",
        fixedSpinValue: spinValue,
        defaultIntertwiner: 0,
        spacing: canvas.width / (nodeCount + 1),
        startY: canvas.height / 2
    };
    
    // Create a graph using the library function
    const graph = window.SpinNetwork.createLineGraph(window.SpinNetwork.createGraph(), graphOptions);
    
    // Convert library graph nodes to tensor nodes
    graph.nodes.forEach(node => {
        const tensorNode = window.SpinNetwork.createTensorNode(
            node.id,
            node.position,
            node.intertwiner || 0,
            [2, 2, 2, 2]  // 4-valent node
        );
        network.nodes.push(tensorNode);
    });
    
    // Convert library graph edges to state vector edges
    graph.edges.forEach(edge => {
        const stateVectorEdge = window.SpinNetwork.createStateVectorEdge(
            edge.id,
            edge.sourceId,
            edge.targetId,
            edge.spin || spinValue
        );
        network.edges.push(stateVectorEdge);
    });
}

/**
 * Creates a ring network with the specified number of nodes
 */
function createRingNetwork(nodeCount, spinValue) {
    const graphOptions = {
        nodeCount: nodeCount,
        spinType: "fixed",
        fixedSpinValue: spinValue,
        defaultIntertwiner: 0,
        radius: Math.min(canvas.width, canvas.height) * 0.4,
        centerX: canvas.width / 2,
        centerY: canvas.height / 2
    };
    
    // Create a graph using the library function
    const graph = window.SpinNetwork.createRingGraph(window.SpinNetwork.createGraph(), graphOptions);
    
    // Convert library graph nodes to tensor nodes
    graph.nodes.forEach(node => {
        const tensorNode = window.SpinNetwork.createTensorNode(
            node.id,
            node.position,
            node.intertwiner || 0,
            [2, 2]  // 2-valent node in a ring
        );
        network.nodes.push(tensorNode);
    });
    
    // Convert library graph edges to state vector edges
    graph.edges.forEach(edge => {
        const stateVectorEdge = window.SpinNetwork.createStateVectorEdge(
            edge.id,
            edge.sourceId,
            edge.targetId,
            edge.spin || spinValue
        );
        network.edges.push(stateVectorEdge);
    });
}

/**
 * Creates a lattice network with the specified number of nodes
 */
function createLatticeNetwork(nodeCount, spinValue) {
    // Calculate grid dimensions
    const rows = Math.max(2, Math.floor(Math.sqrt(nodeCount)));
    const cols = Math.ceil(nodeCount / rows);
    
    const spacing = Math.min(canvas.width / (cols + 1), canvas.height / (rows + 1));
    
    const graphOptions = {
        nodeCount: nodeCount,
        rows: rows,
        columns: cols,
        spinType: "fixed",
        fixedSpinValue: spinValue,
        defaultIntertwiner: 0,
        spacing: spacing
    };
    
    // Create a graph using the library function
    const graph = window.SpinNetwork.createGridGraph(window.SpinNetwork.createGraph(), graphOptions);
    
    // Convert library graph nodes to tensor nodes
    graph.nodes.forEach(node => {
        // Adjust positions to center the grid in the canvas
        const offsetX = (canvas.width - (cols - 1) * spacing) / 2;
        const offsetY = (canvas.height - (rows - 1) * spacing) / 2;
        
        const position = {
            x: offsetX + (node.position.x || 0),
            y: offsetY + (node.position.y || 0)
        };
        
        const tensorNode = window.SpinNetwork.createTensorNode(
            node.id,
            position,
            node.intertwiner || 0,
            [2, 2, 2, 2]  // 4-valent node
        );
        network.nodes.push(tensorNode);
    });
    
    // Convert library graph edges to state vector edges
    graph.edges.forEach(edge => {
        const stateVectorEdge = window.SpinNetwork.createStateVectorEdge(
            edge.id,
            edge.sourceId,
            edge.targetId,
            edge.spin || spinValue
        );
        network.edges.push(stateVectorEdge);
    });
}

/**
 * Creates a custom network with the specified number of nodes
 */
function createCustomNetwork(nodeCount, spinValue) {
    const padding = 50;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    const graphOptions = {
        nodeCount: nodeCount,
        spinType: "fixed",
        fixedSpinValue: spinValue,
        defaultIntertwiner: 0,
        width: width,
        height: height,
        connectivity: 0.3,
        ensureConnected: true
    };
    
    // Create a graph using the library function
    const graph = window.SpinNetwork.createRandomGraph(window.SpinNetwork.createGraph(), graphOptions);
    
    // Convert library graph nodes to tensor nodes
    graph.nodes.forEach(node => {
        // Adjust positions to account for padding
        const position = {
            x: padding + (node.position.x || 0),
            y: padding + (node.position.y || 0)
        };
        
        const tensorNode = window.SpinNetwork.createTensorNode(
            node.id,
            position,
            node.intertwiner || 0,
            [2, 2, 2]  // 3-valent node
        );
        network.nodes.push(tensorNode);
    });
    
    // Convert library graph edges to state vector edges
    graph.edges.forEach(edge => {
        const stateVectorEdge = window.SpinNetwork.createStateVectorEdge(
            edge.id,
            edge.sourceId,
            edge.targetId,
            edge.spin || spinValue
        );
        network.edges.push(stateVectorEdge);
    });
}

/**
 * Resets the network to an empty state
 */
function resetNetwork() {
    network = {
        nodes: [],
        edges: []
    };
    
    selectedNode = null;
    selectedEdge = null;
    
    updateUI();
    renderNetwork();
}

/**
 * Updates the UI based on the current network state
 */
function updateUI() {
    // Update node selection dropdown
    const nodeSelect = document.getElementById('selectedNode');
    nodeSelect.innerHTML = '<option value=\"\">Select a node...</option>';
    
    network.nodes.forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = `Node ${node.id}`;
        nodeSelect.appendChild(option);
    });
    
    // Update edge selection dropdown
    const edgeSelect = document.getElementById('selectedEdge');
    edgeSelect.innerHTML = '<option value=\"\">Select an edge...</option>';
    
    network.edges.forEach(edge => {
        const option = document.createElement('option');
        option.value = edge.id;
        option.textContent = `Edge ${edge.id} (${edge.source || 'null'} → ${edge.target || 'null'})`;
        edgeSelect.appendChild(option);
    });
    
    // Clear node details
    document.getElementById('tensorDimensions').textContent = 'Not selected';
    document.getElementById('nodeIntertwiner').textContent = 'Not selected';
    document.getElementById('tensorBasis').textContent = 'Not selected';
    document.getElementById('tensorValues').innerHTML = '';
    document.getElementById('nodeProperties').textContent = 'Not selected';
    
    // Clear edge details
    document.getElementById('edgeSpin').textContent = 'Not selected';
    document.getElementById('stateVectorDimension').textContent = 'Not selected';
    document.getElementById('stateVectorAmplitudes').querySelector('tbody').innerHTML = '';
    document.getElementById('edgeProperties').textContent = 'Not selected';
    
    // Clear analysis
    document.getElementById('totalVolume').textContent = '0';
    document.getElementById('totalArea').textContent = '0';
    document.getElementById('networkState').textContent = 'No state defined';
}

/**
 * Handles selection of a node
 */
function onNodeSelected() {
    const nodeId = document.getElementById('selectedNode').value;
    selectedNode = network.nodes.find(node => node.id === nodeId) || null;
    
    if (selectedNode) {
        // Update tensor dimensions
        document.getElementById('tensorDimensions').textContent = 
            selectedNode.tensor.dimensions.join(' × ');
        
        // Update intertwiner info
        document.getElementById('nodeIntertwiner').textContent = 
            `Value: ${selectedNode.intertwiner.value}, Dimension: ${selectedNode.intertwiner.dimension || 'N/A'}`;
        
        // Update tensor basis
        document.getElementById('tensorBasis').textContent = 
            selectedNode.tensor.basis || 'standard';
        
        // Update tensor values
        updateTensorValues();
        
        // Update node properties
        const volume = selectedNode.volume ||
            window.SpinNetwork.calculateNodeVolume(selectedNode);
        document.getElementById('nodeProperties').textContent = 
            `Volume: ${volume.toFixed(2)}`;
    } else {
        // Clear node details
        document.getElementById('tensorDimensions').textContent = 'Not selected';
        document.getElementById('nodeIntertwiner').textContent = 'Not selected';
        document.getElementById('tensorBasis').textContent = 'Not selected';
        document.getElementById('tensorValues').innerHTML = '';
        document.getElementById('nodeProperties').textContent = 'Not selected';
    }
}

/**
 * Updates the tensor values display
 */
function updateTensorValues() {
    if (!selectedNode) return;
    
    const valuesContainer = document.getElementById('tensorValues');
    valuesContainer.innerHTML = '';
    
    // For simplicity, only show up to the first 10 non-zero elements
    if (selectedNode.tensor.elements.length === 0) {
        valuesContainer.textContent = 'No non-zero elements';
        return;
    }
    
    const elementsToShow = selectedNode.tensor.elements.slice(0, 10);
    
    elementsToShow.forEach(el => {
        const cell = document.createElement('div');
        cell.classList.add('tensor-cell');
        
        const indices = el.indices.join(',');
        const value = el.value.im === 0 
            ? el.value.re.toFixed(2)
            : `${el.value.re.toFixed(2)} ${el.value.im >= 0 ? '+' : ''}${el.value.im.toFixed(2)}i`;
        
        cell.textContent = `[${indices}]: ${value}`;
        valuesContainer.appendChild(cell);
    });
    
    if (selectedNode.tensor.elements.length > 10) {
        const moreInfo = document.createElement('div');
        moreInfo.textContent = `... ${selectedNode.tensor.elements.length - 10} more elements`;
        valuesContainer.appendChild(moreInfo);
    }
}

/**
 * Sets a tensor element for the selected node
 */
function setTensorElement() {
    if (!selectedNode) {
        alert('Please select a node first');
        return;
    }
    
    const indicesInput = document.getElementById('tensorIndices').value;
    const valueInput = document.getElementById('tensorValue').value;
    
    try {
        // Parse indices (e.g., \"0,1,0\")
        const indices = indicesInput.split(',').map(idx => parseInt(idx.trim()));
        
        // Check indices validity
        if (indices.length !== selectedNode.tensor.dimensions.length) {
            throw new Error(`Expected ${selectedNode.tensor.dimensions.length} indices but got ${indices.length}`);
        }
        
        // Parse complex value (e.g., \"1+2i\" or \"1.5-3i\" or just \"2\")
        let re = 0, im = 0;
        
        // Basic regex to match real and imaginary parts
        const match = valueInput.match(/^([-+]?\\d*\\.?\\d*)(?:([-+]\\d*\\.?\\d*)i)?$/);
        if (match) {
            re = parseFloat(match[1] || '0');
            if (match[2]) {
                // Handle imaginary part with sign
                im = parseFloat(match[2] + '1');
            }
        } else {
            throw new Error('Invalid complex number format. Use format like \"1+2i\", \"3-1.5i\", or just \"2\"');
        }
        
        // Set the tensor element using the library function
        window.SpinNetwork.setTensorElement(
            selectedNode.tensor,
            indices,
            window.SpinNetwork.createComplex(re, im)
        );
        
        // Update the display
        updateTensorValues();
        renderNetwork();
    } catch (error) {
        console.error('Error setting tensor element:', error);
        alert(`Error setting tensor element: ${error.message}`);
    }
}

/**
 * Handles selection of an edge
 */
function onEdgeSelected() {
    const edgeId = document.getElementById('selectedEdge').value;
    selectedEdge = network.edges.find(edge => edge.id === edgeId) || null;
    
    if (selectedEdge) {
        // Update edge spin
        document.getElementById('edgeSpin').textContent = selectedEdge.spin;
        
        // Update state vector dimension
        document.getElementById('stateVectorDimension').textContent = 
            selectedEdge.stateVector.dimension;
        
        // Update state vector amplitudes
        updateStateVectorAmplitudes();
        
        // Update edge properties
        const area = selectedEdge.area ||
            window.SpinNetwork.calculateEdgeArea(selectedEdge);
        document.getElementById('edgeProperties').textContent = 
            `Area: ${area.toFixed(2)}`;
    } else {
        // Clear edge details
        document.getElementById('edgeSpin').textContent = 'Not selected';
        document.getElementById('stateVectorDimension').textContent = 'Not selected';
        document.getElementById('stateVectorAmplitudes').querySelector('tbody').innerHTML = '';
        document.getElementById('edgeProperties').textContent = 'Not selected';
    }
}

/**
 * Updates the state vector amplitudes display
 */
function updateStateVectorAmplitudes() {
    if (!selectedEdge) return;
    
    const tbody = document.getElementById('stateVectorAmplitudes').querySelector('tbody');
    tbody.innerHTML = '';
    
    selectedEdge.stateVector.amplitudes.forEach((amp, idx) => {
        const row = document.createElement('tr');
        
        // Index
        const idxCell = document.createElement('td');
        idxCell.textContent = idx;
        row.appendChild(idxCell);
        
        // Real part
        const reCell = document.createElement('td');
        reCell.textContent = amp.re.toFixed(4);
        row.appendChild(reCell);
        
        // Imaginary part
        const imCell = document.createElement('td');
        imCell.textContent = amp.im.toFixed(4);
        row.appendChild(imCell);
        
        // Magnitude
        const magCell = document.createElement('td');
        const magnitude = Math.sqrt(amp.re * amp.re + amp.im * amp.im);
        magCell.textContent = magnitude.toFixed(4);
        row.appendChild(magCell);
        
        tbody.appendChild(row);
    });
}

/**
 * Sets a state vector amplitude for the selected edge
 */
function setStateVectorAmplitude() {
    if (!selectedEdge) {
        alert('Please select an edge first');
        return;
    }
    
    const indexInput = document.getElementById('amplitudeIndex').value;
    const valueInput = document.getElementById('amplitudeValue').value;
    
    try {
        // Parse index
        const index = parseInt(indexInput);
        
        // Check index validity
        if (isNaN(index) || index < 0 || index >= selectedEdge.stateVector.dimension) {
            throw new Error(`Index must be between 0 and ${selectedEdge.stateVector.dimension - 1}`);
        }
        
        // Parse complex value (e.g., \"1+2i\" or \"1.5-3i\" or just \"2\")
        let re = 0, im = 0;
        
        // Basic regex to match real and imaginary parts
        const match = valueInput.match(/^([-+]?\\d*\\.?\\d*)(?:([-+]\\d*\\.?\\d*)i)?$/);
        if (match) {
            re = parseFloat(match[1] || '0');
            if (match[2]) {
                // Handle imaginary part with sign
                im = parseFloat(match[2] + '1');
            }
        } else {
            throw new Error('Invalid complex number format. Use format like \"1+2i\", \"3-1.5i\", or just \"2\"');
        }
        
        // Set the amplitude using the library function
        window.SpinNetwork.setStateVectorAmplitude(
            selectedEdge.stateVector,
            index,
            window.SpinNetwork.createComplex(re, im)
        );
        
        // Update the display
        updateStateVectorAmplitudes();
        renderNetwork();
    } catch (error) {
        console.error('Error setting amplitude:', error);
        alert(`Error setting amplitude: ${error.message}`);
    }
}

/**
 * Normalizes the state vector of the selected edge
 */
function normalizeStateVector() {
    if (!selectedEdge) {
        alert('Please select an edge first');
        return;
    }
    
    try {
        // Normalize the state vector using the library function
        window.SpinNetwork.normalizeStateVector(selectedEdge.stateVector);
        
        // Update the display
        updateStateVectorAmplitudes();
        renderNetwork();
    } catch (error) {
        console.error('Error normalizing state vector:', error);
        alert(`Error normalizing state vector: ${error.message}`);
    }
}

/**
 * Calculates and displays total physical properties of the network
 */
function calculateProperties() {
    try {
        // Calculate total volume
        let totalVolume = 0;
        network.nodes.forEach(node => {
            const volume = node.volume || window.SpinNetwork.calculateNodeVolume(node);
            totalVolume += volume;
        });
        
        // Calculate total area
        let totalArea = 0;
        network.edges.forEach(edge => {
            const area = edge.area || window.SpinNetwork.calculateEdgeArea(edge);
            totalArea += area;
        });
        
        // Update the display
        document.getElementById('totalVolume').textContent = totalVolume.toFixed(2);
        document.getElementById('totalArea').textContent = totalArea.toFixed(2);
        
        // Generate a simple description of the network state
        const state = `Network with ${network.nodes.length} nodes and ${network.edges.length} edges`;
        document.getElementById('networkState').textContent = state;
    } catch (error) {
        console.error('Error calculating properties:', error);
        alert(`Error calculating properties: ${error.message}`);
    }
}

/**
 * Renders the network on the canvas
 */
function renderNetwork() {
    const mode = document.getElementById('visualizationMode').value;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Render edges
    network.edges.forEach(edge => {
        renderEdge(edge, mode);
    });
    
    // Render nodes
    network.nodes.forEach(node => {
        renderNode(node, mode);
    });
}

/**
 * Renders a node on the canvas
 */
function renderNode(node, mode) {
    // Get node position
    const x = node.position.x;
    const y = node.position.y;
    
    // Different visualization modes
    let fillColor = '#3498db';  // Default blue
    let size = 20;
    let label = node.id;
    
    switch (mode) {
        case 'tensor':
            // Color based on tensor dimension
            const dimension = node.tensor.dimensions.reduce((a, b) => a * b, 1);
            const hue = (dimension % 10) * 36;  // Map dimension to hue (0-360)
            fillColor = `hsl(${hue}, 70%, 50%)`;
            break;
            
        case 'physical':
            // Size based on volume
            const volume = node.volume || window.SpinNetwork.calculateNodeVolume(node);
            size = Math.max(10, Math.min(30, 15 + volume / 10));
            label = volume.toFixed(1);
            break;
    }
    
    // Is this node selected?
    const isSelected = selectedNode && selectedNode.id === node.id;
    if (isSelected) {
        // Draw selection indicator
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, size + 5, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // Draw node
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
}

/**
 * Renders an edge on the canvas
 */
function renderEdge(edge, mode) {
    // Find source and target nodes
    const sourceNode = network.nodes.find(n => n.id === edge.source);
    const targetNode = network.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) {
        // Skip rendering dangling edges for simplicity
        return;
    }
    
    // Get node positions
    const x1 = sourceNode.position.x;
    const y1 = sourceNode.position.y;
    const x2 = targetNode.position.x;
    const y2 = targetNode.position.y;
    
    // Different visualization modes
    let strokeColor = '#7f8c8d';  // Default gray
    let lineWidth = 2;
    
    switch (mode) {
        case 'stateVector':
            // Color based on first amplitude magnitude
            if (edge.stateVector && edge.stateVector.amplitudes.length > 0) {
                const amp = edge.stateVector.amplitudes[0];
                const magnitude = Math.sqrt(amp.re * amp.re + amp.im * amp.im);
                const hue = (Math.atan2(amp.im, amp.re) * 180 / Math.PI + 360) % 360;
                const saturation = 70;
                const lightness = 50 - Math.min(40, magnitude * 20);
                strokeColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                lineWidth = Math.max(1, Math.min(5, magnitude * 4));
            }
            break;
            
        case 'physical':
            // Width based on area
            const area = edge.area || window.SpinNetwork.calculateEdgeArea(edge);
            lineWidth = Math.max(1, Math.min(8, 1 + area / 5));
            strokeColor = '#2c3e50';
            break;
    }
    
    // Is this edge selected?
    const isSelected = selectedEdge && selectedEdge.id === edge.id;
    if (isSelected) {
        // Draw selection indicator with glow effect
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = lineWidth + 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Draw edge
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw edge label at midpoint
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Add small offset to the label
    const dx = y2 - y1;
    const dy = x1 - x2;
    const len = Math.sqrt(dx * dx + dy * dy);
    const offsetX = (len > 0) ? (dx * 10 / len) : 0;
    const offsetY = (len > 0) ? (dy * 10 / len) : 0;
    
    // Draw label background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(midX + offsetX, midY + offsetY, 10, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw label
    ctx.fillStyle = '#2c3e50';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let label = edge.id;
    if (mode === 'physical') {
        const area = edge.area || window.SpinNetwork.calculateEdgeArea(edge);
        label = area.toFixed(1);
    } else if (mode === 'network') {
        label = edge.spin.toString();
    }
    
    ctx.fillText(label, midX + offsetX, midY + offsetY);
}
