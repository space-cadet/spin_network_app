// Make available globally for the sandbox
console.log('Tensor Bridge initializing');

// Import the compiled library - this is already loaded in the HTML via script tag
// so we'll use the global SpinNetworkLib variable instead of importing
const SpinNetworkLib = window.SpinNetwork || {};

// Create the API expected by tensor-sandbox.js
const SpinNetwork = {
    // Create complex numbers
    createComplex: function(re, im) {
        return { re, im };
    },
    
    // Node creation
    createTensorNode: function(id, position, intertwinerValue, dimensions) {
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
    },
    
    // Edge creation
    createStateVectorEdge: function(id, source, target, spin) {
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
    },
    
    // Tensor operations
    setTensorElement: function(tensor, indices, value) {
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
    },
    
    // State vector operations
    setStateVectorAmplitude: function(stateVector, index, value) {
        if (index >= 0 && index < stateVector.amplitudes.length) {
            stateVector.amplitudes[index] = { ...value };
        }
    },
    
    normalizeStateVector: function(stateVector) {
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
    },
    
    // Physical property calculations
    calculateNodeVolume: function(node) {
        // Simple example implementation
        return node.intertwiner.dimension || 1;
    },
    
    calculateEdgeArea: function(edge) {
        // Simple example implementation
        return Math.sqrt(edge.spin * (edge.spin + 1));
    }
};

// Make available globally for the sandbox
window.SpinNetwork = SpinNetwork;

// If there are any functions in the library that aren't in our SpinNetwork object,
// add them to make sure all library functions are available
if (SpinNetworkLib) {
    Object.keys(SpinNetworkLib).forEach(key => {
        if (typeof SpinNetworkLib[key] === 'function' && !SpinNetwork[key]) {
            SpinNetwork[key] = SpinNetworkLib[key];
        }
    });
}

console.log('Tensor Bridge initialized successfully');