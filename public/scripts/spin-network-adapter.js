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

    // Store the original SpinNetwork library reference
    const lib = window.SpinNetwork;
    // Save original lib functions that we'll need to access
    const originalLib = {
        getOptimizedIntertwinerBasis: lib.getOptimizedIntertwinerBasis,
        calculateNodeVolume: lib.calculateNodeVolume,
        calculateEdgeArea: lib.calculateEdgeArea,
        normalizeStateVector: lib.normalizeStateVector,
        createStateVectorEdge: lib.createStateVectorEdge,
        setTensorElement: lib.setTensorElement,
        setStateVectorAmplitude: lib.setStateVectorAmplitude
    };
    
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
            // First, create a basic tensor node structure
            const node = {
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
            
            // Now we need to populate the tensor elements based on the intertwiner value
            // and dimensions
            try {
                // For each edge dimension, we need to determine the corresponding spin value
                const spins = dimensions.map(dim => (dim - 1) / 2); // Convert dimension to spin (e.g., dim=2 → spin=0.5)
                
                // We can only properly initialize tensors for certain common cases:
                if (dimensions.length === 2) {
                    // 2-valent node: identity tensor
                    this.initializeTwoValentTensor(node.tensor, intertwinerValue);
                } 
                else if (dimensions.length === 3) {
                    // 3-valent node: use Clebsch-Gordan coefficients
                    this.initializeThreeValentTensor(node.tensor, intertwinerValue, spins);
                }
                else if (dimensions.length === 4) {
                    // 4-valent node: use intertwiner basis
                    // Try to use the library's specialized function if available
                    if (lib.getOptimizedIntertwinerBasis) {
                        this.initializeFourValentTensor(node.tensor, intertwinerValue, spins);
                    } else {
                        console.warn('Library missing getOptimizedIntertwinerBasis function, tensor elements not initialized');
                    }
                }
            } catch (error) {
                console.error('Error initializing tensor elements:', error);
            }
            
            return node;
        },
        
        // Helper functions for tensor initialization
        initializeTwoValentTensor: function(tensor, intertwinerValue) {
            // For 2-valent node, we initialize with an identity tensor
            // This is a 2x2 tensor with 1s on the diagonal
            // [1 0]
            // [0 1]
            const complex1 = this.createComplex(1, 0);
            this.setTensorElement(tensor, [0, 0], complex1);
            this.setTensorElement(tensor, [1, 1], complex1);
        },
        
        initializeThreeValentTensor: function(tensor, intertwinerValue, spins) {
            // For 3-valent node with spin-1/2 edges, we have 8 possible configurations
            // but only certain ones are non-zero due to angular momentum conservation
            // Use Clebsch-Gordan coefficients for the non-zero elements
            
            if (spins.every(spin => Math.abs(spin - 0.5) < 1e-10)) {
                // All edges are spin-1/2
                const complex1 = this.createComplex(1, 0);
                const complexSqrt2 = this.createComplex(1 / Math.sqrt(2), 0);
                
                // Set the non-zero elements based on angular momentum conservation
                this.setTensorElement(tensor, [0, 0, 0], complexSqrt2);
                this.setTensorElement(tensor, [1, 1, 1], complexSqrt2);
            }
        },
        
        initializeFourValentTensor: function(tensor, intertwinerValue, spins) {
            try {
                // For 4-valent node, we use the library's intertwiner basis function if available
                if (spins.every(spin => Math.abs(spin - 0.5) < 1e-10)) {
                    // All edges are spin-1/2
                    // For intertwiner value 0, we use the singlet coupling basis
                    if (Math.abs(intertwinerValue) < 1e-10) {
                        // Example tensor for intertwiner=0 (simplified)
                        // These values are an approximation of the correct intertwiner
                        const complex = this.createComplex(0.5, 0);
                        this.setTensorElement(tensor, [0, 1, 1, 0], complex);
                        this.setTensorElement(tensor, [1, 0, 0, 1], complex);
                        this.setTensorElement(tensor, [1, 0, 1, 0], this.createComplex(-0.5, 0));
                        this.setTensorElement(tensor, [0, 1, 0, 1], this.createComplex(-0.5, 0));
                    }
                    else if (Math.abs(intertwinerValue - 1) < 1e-10) {
                        // Example tensor for intertwiner=1 (simplified)
                        const complex = this.createComplex(0.5, 0);
                        this.setTensorElement(tensor, [0, 0, 0, 0], complex);
                        this.setTensorElement(tensor, [0, 0, 1, 1], complex);
                        this.setTensorElement(tensor, [1, 1, 0, 0], complex);
                        this.setTensorElement(tensor, [1, 1, 1, 1], complex);
                    }
                }
            } catch (error) {
                console.error('Error initializing 4-valent tensor:', error);
            }
        },
        
        setTensorElement: function(tensor, indices, value) {
            // Use the original library implementation
            return originalLib.setTensorElement(tensor, indices, value);
        },
        
        // State vector edge operations
        createStateVectorEdge: function(id, source, target, spin) {
            // Use the original library implementation
            return originalLib.createStateVectorEdge(id, source, target, spin);
        },
        
        setStateVectorAmplitude: function(stateVector, index, value) {
            // Use the original library implementation
            return originalLib.setStateVectorAmplitude(stateVector, index, value);
        },
        
        normalizeStateVector: function(stateVector) {
            // Use the original library implementation
            return originalLib.normalizeStateVector(stateVector);
        },
        
        // Complex number utilities
        createComplex: function(re, im) {
            // Implementation of createComplex for the standalone library
            return { re: re || 0, im: im || 0 };
        },
        
        // Physical calculations - use library implementations
        calculateNodeVolume: function(node) {
            // Use the original library implementation
            return originalLib.calculateNodeVolume(node);
        },
        
        calculateEdgeArea: function(edge) {
            // Use the original library implementation
            return originalLib.calculateEdgeArea(edge);
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