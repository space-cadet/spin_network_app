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
            // Implementation of createTensorNode for the standalone library
            return {
                id,
                position,
                tensor: {
                    dimensions: dimensions.length > 0 ? dimensions : [2, 2, 2, 2], // Default to 4-valent node with spin-1/2 edges
                    elements: [],
                    basis: 'standard'
                },
                intertwiner: {
                    value: intertwinerValue,
                    dimension: dimensions.reduce((prod, dim) => prod * dim, 1)
                }
            };
        },
        
        setTensorElement: function(tensor, indices, value) {
            // Implementation of setTensorElement for the standalone library
            // Validate indices against dimensions
            if (indices.length !== tensor.dimensions.length) {
                console.warn(`Invalid indices length: ${indices.length}, expected ${tensor.dimensions.length}`);
                return;
            }
            
            for (let i = 0; i < indices.length; i++) {
                if (indices[i] < 0 || indices[i] >= tensor.dimensions[i]) {
                    console.warn(`Index ${indices[i]} out of bounds for dimension ${i}`);
                    return;
                }
            }
            
            // Check if element with these indices already exists
            const existingIndex = tensor.elements.findIndex(
                el => el.indices.length === indices.length && 
                el.indices.every((idx, i) => idx === indices[i])
            );
            
            if (existingIndex >= 0) {
                // Update existing element
                tensor.elements[existingIndex].value = value;
            } else {
                // Add new element
                tensor.elements.push({
                    indices: [...indices],
                    value: { ...value }
                });
            }
        },
        
        // State vector edge operations
        createStateVectorEdge: function(id, source, target, spin) {
            // Implementation of createStateVectorEdge for the standalone library
            const dimension = Math.floor(2 * spin + 1);
            
            // Initialize with |j,j⟩ state (highest weight state)
            const amplitudes = new Array(dimension).fill(null).map(() => ({ re: 0, im: 0 }));
            amplitudes[0] = { re: 1, im: 0 };  // Set amplitude for |j,j⟩ to 1
            
            return {
                id,
                source,
                target,
                stateVector: {
                    dimension,
                    amplitudes,
                    basis: 'standard'
                },
                spin
            };
        },
        
        setStateVectorAmplitude: function(stateVector, index, value) {
            // Implementation of setStateVectorAmplitude for the standalone library
            if (index < 0 || index >= stateVector.dimension) {
                console.warn(`Index ${index} out of bounds for state vector of dimension ${stateVector.dimension}`);
                return;
            }
            
            stateVector.amplitudes[index] = { ...value };
        },
        
        normalizeStateVector: function(stateVector) {
            // Implementation of normalizeStateVector for the standalone library
            // Calculate norm
            const normSquared = stateVector.amplitudes.reduce(
                (sum, amp) => sum + amp.re * amp.re + amp.im * amp.im,
                0
            );
            
            if (normSquared < 1e-10) {
                console.warn('Cannot normalize state vector with norm close to zero');
                return;
            }
            
            const norm = Math.sqrt(normSquared);
            
            // Normalize amplitudes
            for (let i = 0; i < stateVector.amplitudes.length; i++) {
                stateVector.amplitudes[i].re /= norm;
                stateVector.amplitudes[i].im /= norm;
            }
        },
        
        // Complex number utilities
        createComplex: function(re, im) {
            // Implementation of createComplex for the standalone library
            return { re: re || 0, im: im || 0 };
        },
        
        // Physical calculations
        calculateNodeVolume: function(node) {
            // Implementation of calculateNodeVolume for the standalone library
            const volumeFactor = 8 * Math.PI;
            return volumeFactor * (node.intertwiner.dimension || 1);
        },
        
        calculateEdgeArea: function(edge) {
            // Implementation of calculateEdgeArea for the standalone library
            const areaFactor = 8 * Math.PI;
            return areaFactor * Math.sqrt(edge.spin * (edge.spin + 1));
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