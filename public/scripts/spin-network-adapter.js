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
    
    // Check if SpinNetwork is available
    if (!window.SpinNetwork) {
        console.error('SpinNetwork library not loaded. Cannot initialize adapter.');
        return;
    }
    
    // Log the structure to help with debugging
    console.log('SpinNetwork library structure:', Object.keys(window.SpinNetwork));

    // The original SpinNetwork library
    const lib = window.SpinNetwork;
    
    // Create a new adapter object that will provide the expected interface
    const adapter = {
        // Core graph creation functions
        createGraph: lib.createGraph || function() {
            console.error('createGraph not found in library');
            return { nodes: [], edges: [] };
        },
        
        createLineGraph: function(graph, options) {
            if (lib.createLineGraph) return lib.createLineGraph(graph, options);
            console.error('createLineGraph not found in library');
            return graph;
        },
        
        createRingGraph: function(graph, options) {
            if (lib.createRingGraph) return lib.createRingGraph(graph, options);
            console.error('createRingGraph not found in library');
            return graph;
        },
        
        createGridGraph: function(graph, options) {
            if (lib.createGridGraph) return lib.createGridGraph(graph, options);
            console.error('createGridGraph not found in library');
            return graph;
        },
        
        createRandomGraph: function(graph, options) {
            if (lib.createRandomGraph) return lib.createRandomGraph(graph, options);
            console.error('createRandomGraph not found in library');
            return graph;
        },
        
        // Tensor node operations
        createTensorNode: function(id, position, intertwinerValue, dimensions) {
            // Try different paths to find the function
            if (lib.createTensorNode) {
                return lib.createTensorNode(id, position, intertwinerValue, dimensions);
            } else if (lib.core && lib.core.createTensorNode) {
                return lib.core.createTensorNode(id, position, intertwinerValue, dimensions);
            } else {
                console.error('createTensorNode not found in library');
                // Fallback implementation
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
            }
        },
        
        setTensorElement: function(tensor, indices, value) {
            if (lib.setTensorElement) {
                return lib.setTensorElement(tensor, indices, value);
            } else if (lib.core && lib.core.setTensorElement) {
                return lib.core.setTensorElement(tensor, indices, value);
            } else {
                console.error('setTensorElement not found in library');
                // Fallback implementation
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
            }
        },
        
        // State vector edge operations
        createStateVectorEdge: function(id, source, target, spin) {
            if (lib.createStateVectorEdge) {
                return lib.createStateVectorEdge(id, source, target, spin);
            } else if (lib.core && lib.core.createStateVectorEdge) {
                return lib.core.createStateVectorEdge(id, source, target, spin);
            } else {
                console.error('createStateVectorEdge not found in library');
                // Fallback implementation
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
            }
        },
        
        setStateVectorAmplitude: function(stateVector, index, value) {
            if (lib.setStateVectorAmplitude) {
                return lib.setStateVectorAmplitude(stateVector, index, value);
            } else if (lib.core && lib.core.setStateVectorAmplitude) {
                return lib.core.setStateVectorAmplitude(stateVector, index, value);
            } else {
                console.error('setStateVectorAmplitude not found in library');
                // Fallback implementation
                if (index >= 0 && index < stateVector.amplitudes.length) {
                    stateVector.amplitudes[index] = { ...value };
                }
            }
        },
        
        normalizeStateVector: function(stateVector) {
            if (lib.normalizeStateVector) {
                return lib.normalizeStateVector(stateVector);
            } else if (lib.core && lib.core.normalizeStateVector) {
                return lib.core.normalizeStateVector(stateVector);
            } else {
                console.error('normalizeStateVector not found in library');
                // Fallback implementation
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
            }
        },
        
        // Complex number utilities
        createComplex: function(re, im) {
            if (lib.createComplex) {
                return lib.createComplex(re, im);
            } else if (lib.core && lib.core.createComplex) {
                return lib.core.createComplex(re, im);
            } else {
                console.error('createComplex not found in library');
                // Fallback implementation
                return { re: re || 0, im: im || 0 };
            }
        },
        
        // Physical calculations
        calculateNodeVolume: function(node) {
            if (lib.calculateNodeVolume) {
                return lib.calculateNodeVolume(node);
            } else if (lib.core && lib.core.calculateNodeVolume) {
                return lib.core.calculateNodeVolume(node);
            } else {
                console.error('calculateNodeVolume not found in library');
                // Fallback implementation
                return node.intertwiner.dimension || 1;
            }
        },
        
        calculateEdgeArea: function(edge) {
            if (lib.calculateEdgeArea) {
                return lib.calculateEdgeArea(edge);
            } else if (lib.core && lib.core.calculateEdgeArea) {
                return lib.core.calculateEdgeArea(edge);
            } else {
                console.error('calculateEdgeArea not found in library');
                // Fallback implementation
                return Math.sqrt(edge.spin * (edge.spin + 1));
            }
        }
    };
    
    // Try to determine if functions are exported directly or in namespaces
    console.log('Creating adapter with found functions:');
    
    // Copy any other needed functions from the library
    Object.keys(lib).forEach(key => {
        if (typeof lib[key] === 'function' && !adapter[key]) {
            adapter[key] = lib[key];
            console.log(`- Added ${key} from library root`);
        } else if (typeof lib[key] === 'object' && lib[key] !== null) {
            // Look for functions in namespaces
            Object.keys(lib[key]).forEach(subKey => {
                if (typeof lib[key][subKey] === 'function' && !adapter[subKey]) {
                    adapter[subKey] = lib[key][subKey];
                    console.log(`- Added ${subKey} from ${key} namespace`);
                }
            });
        }
    });
    
    // Replace the SpinNetwork global with our adapter
    window.SpinNetwork = adapter;
    
    console.log('SpinNetwork Adapter initialized successfully');
})();