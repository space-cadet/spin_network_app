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

    // Store the original SpinNetwork library reference and log it
    const lib = window.SpinNetwork;
    console.log("Available SpinNetwork functions:", Object.keys(lib).join(", "));
    
    // Direct function access for simplicity
    // No need to store in originalLib which might cause reference issues
    
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
            // Convert dimensions to spins
            const spins = dimensions.map(dim => (dim - 1) / 2);
            
            // Log what's happening for debugging
            console.log(`Creating tensor node: id=${id}, intertwiner=${intertwinerValue}, dimensions=${dimensions.join(',')}`);
            
            // Use the direct library function
            return lib.createTensorNode(id, position, intertwinerValue, dimensions);
        },
        
        setTensorElement: function(tensor, indices, value) {
            // Direct library function call
            return lib.setTensorElement(tensor, indices, value);
        },
        
        // State vector edge operations
        createStateVectorEdge: function(id, source, target, spin) {
            return lib.createStateVectorEdge(id, source, target, spin);
        },
        
        setStateVectorAmplitude: function(stateVector, index, value) {
            // Direct library function call
            return lib.setStateVectorAmplitude(stateVector, index, value);
        },
        
        normalizeStateVector: function(stateVector) {
            // Direct library function call
            return lib.normalizeStateVector(stateVector);
        },
        
        // Complex number utilities
        createComplex: function(re, im) {
            // Implementation of createComplex for the standalone library
            return { re: re || 0, im: im || 0 };
        },
        
        // Physical calculations - use library implementations
        calculateNodeVolume: function(node) {
            // Direct library function call
            return lib.calculateNodeVolume(node);
        },
        
        calculateEdgeArea: function(edge) {
            // Direct library function call
            return lib.calculateEdgeArea(edge);
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