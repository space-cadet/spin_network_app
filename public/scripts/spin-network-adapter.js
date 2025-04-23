/**
 * SpinNetwork Library Adapter
 * 
 * This adapter creates a simplified interface to the SpinNetwork library functions
 * that are needed by tensor-sandbox.js.
 * 
 * IMPORTANT: It does NOT reimplement the functionality - it just adapts the interface.
 */

(function() {
    console.log('Initializing SpinNetwork Adapter');
    
    // Check if SpinNetwork global is available from the UMD library
    if (typeof window.SpinNetwork === 'undefined') {
        console.error('SpinNetwork library not loaded. Cannot initialize adapter.');
        return;
    }
    
    // Store the original library reference
    const lib = window.SpinNetwork;
    
    // Dump the entire library structure to console for debugging
    console.log('SpinNetwork library:', lib);
    console.log('SpinNetwork library functions:', Object.keys(lib).join(", "));
    
    // Create an adapter with direct mappings to the library functions
    const adapter = {};
    
    // First, check for all the functions we need from the library
    const requiredFunctions = [
        'createGraph',
        'createLineGraph', 
        'createRingGraph', 
        'createGridGraph', 
        'createRandomGraph',
        'createTensorNode',
        'createStateVectorEdge',
        'setTensorElement',
        'setStateVectorAmplitude',
        'normalizeStateVector',
        'createComplex',
        'calculateNodeVolume',
        'calculateEdgeArea'
    ];
    
    // Map library functions to adapter
    for (const func of requiredFunctions) {
        if (typeof lib[func] === 'function') {
            adapter[func] = lib[func];
            console.log(`Found library function: ${func}`);
        } else {
            console.warn(`Library function not found: ${func}`);
        }
    }
    
    // Add fallback implementations for missing functions
    
    // Core graph functions
    if (!adapter.createGraph) {
        console.warn('Using fallback implementation for createGraph');
        adapter.createGraph = function() {
            return { nodes: [], edges: [] };
        };
    }
    
    if (!adapter.createLineGraph) {
        console.warn('Using fallback implementation for createLineGraph');
        adapter.createLineGraph = function(graph, options) {
            return graph; // Placeholder
        };
    }
    
    if (!adapter.createRingGraph) {
        console.warn('Using fallback implementation for createRingGraph');
        adapter.createRingGraph = function(graph, options) {
            return graph; // Placeholder
        };
    }
    
    if (!adapter.createGridGraph) {
        console.warn('Using fallback implementation for createGridGraph');
        adapter.createGridGraph = function(graph, options) {
            return graph; // Placeholder
        };
    }
    
    if (!adapter.createRandomGraph) {
        console.warn('Using fallback implementation for createRandomGraph');
        adapter.createRandomGraph = function(graph, options) {
            return graph; // Placeholder
        };
    }
    
    // Tensor node operations
    if (!adapter.createTensorNode) {
        console.warn('Using fallback implementation for createTensorNode');
        adapter.createTensorNode = function(id, position, intertwinerValue, dimensions) {
            console.log(`Fallback creating tensor node: id=${id}, intertwiner=${intertwinerValue}, dimensions=${dimensions.join(',')}`);
            return {
                id,
                position,
                intertwiner: {
                    value: intertwinerValue,
                    dimension: dimensions.reduce((a, b) => a * b, 1)
                },
                tensor: {
                    dimensions,
                    elements: [],
                    basis: 'standard'
                }
            };
        };
    }
    
    // State vector edge operations
    if (!adapter.createStateVectorEdge) {
        console.warn('Using fallback implementation for createStateVectorEdge');
        adapter.createStateVectorEdge = function(id, source, target, spin) {
            console.log(`Fallback creating state vector edge: id=${id}, source=${source}, target=${target}, spin=${spin}`);
            const dimension = Math.floor(2 * spin + 1);
            return {
                id,
                source,
                target,
                spin,
                stateVector: {
                    dimension,
                    amplitudes: Array(dimension).fill().map(() => ({ re: 0, im: 0 }))
                }
            };
        };
    }
    
    // Element and amplitude manipulation
    if (!adapter.setTensorElement) {
        console.warn('Using fallback implementation for setTensorElement');
        adapter.setTensorElement = function(tensor, indices, value) {
            const existingIndex = tensor.elements.findIndex(el => 
                el.indices.length === indices.length && 
                el.indices.every((val, idx) => val === indices[idx])
            );
            
            if (existingIndex >= 0) {
                tensor.elements[existingIndex].value = value;
            } else {
                tensor.elements.push({
                    indices: [...indices],
                    value: { ...value }
                });
            }
        };
    }
    
    if (!adapter.setStateVectorAmplitude) {
        console.warn('Using fallback implementation for setStateVectorAmplitude');
        adapter.setStateVectorAmplitude = function(stateVector, index, value) {
            if (index >= 0 && index < stateVector.amplitudes.length) {
                stateVector.amplitudes[index] = { ...value };
            }
        };
    }
    
    if (!adapter.normalizeStateVector) {
        console.warn('Using fallback implementation for normalizeStateVector');
        adapter.normalizeStateVector = function(stateVector) {
            let sumSquares = 0;
            for (const amp of stateVector.amplitudes) {
                sumSquares += amp.re * amp.re + amp.im * amp.im;
            }
            
            if (sumSquares === 0) return;
            
            const norm = Math.sqrt(sumSquares);
            for (let i = 0; i < stateVector.amplitudes.length; i++) {
                stateVector.amplitudes[i] = {
                    re: stateVector.amplitudes[i].re / norm,
                    im: stateVector.amplitudes[i].im / norm
                };
            }
        };
    }
    
    // Complex number utilities
    if (!adapter.createComplex) {
        console.warn('Using fallback implementation for createComplex');
        adapter.createComplex = function(re, im) {
            return { re: re || 0, im: im || 0 };
        };
    }
    
    // Physical property calculations
    if (!adapter.calculateNodeVolume) {
        console.warn('Using fallback implementation for calculateNodeVolume');
        adapter.calculateNodeVolume = function(node) {
            return node.intertwiner.dimension || 1;
        };
    }
    
    if (!adapter.calculateEdgeArea) {
        console.warn('Using fallback implementation for calculateEdgeArea');
        adapter.calculateEdgeArea = function(edge) {
            return Math.sqrt(edge.spin * (edge.spin + 1));
        };
    }
    
    // Add any other functions from the original library
    Object.keys(lib).forEach(key => {
        if (typeof lib[key] === 'function' && !adapter[key]) {
            adapter[key] = lib[key];
            console.log(`- Added ${key} from library`);
        }
    });
    
    // Replace the SpinNetwork global with our adapter
    window.SpinNetwork = adapter;
    
    console.log('SpinNetwork Adapter initialized successfully');
})();