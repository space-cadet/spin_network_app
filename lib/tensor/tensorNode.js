/**
 * Tensor Node Implementation
 * 
 * This module provides functionality for creating and manipulating tensor nodes
 * in spin networks. It connects the abstract tensor representation to the
 * intertwiner space calculation functionality.
 */

// Import required modules
const { getOptimizedIntertwinerBasis, getIntertwinerBasis, 
        intertwinerDimension } = require('../core/intertwinerSpace');

/**
 * Create a tensor node with properly initialized tensor elements based on the
 * intertwiner value and edge spins.
 * 
 * @param {string} id - Node identifier
 * @param {Object} position - x,y coordinates of the node
 * @param {number} intertwinerValue - Value of the intertwiner
 * @param {number[]} edgeSpins - Array of spin values for edges connected to the node
 * @param {Object} [options] - Additional options
 * @returns {Object} - A tensor node with initialized elements
 */
function createTensorNode(id, position, intertwinerValue, edgeSpins, options = {}) {
    // Calculate dimensions from spins (dimension = 2j + 1)
    const dimensions = edgeSpins.map(spin => Math.round(2 * spin + 1));
    
    // Create the tensor node structure
    const node = {
        id,
        position,
        tensor: {
            dimensions,
            elements: [],
            basis: options.basis || 'standard'
        },
        intertwiner: {
            value: intertwinerValue,
            dimension: calculateIntertwinerDimension(edgeSpins)
        },
        recouplingScheme: options.recouplingScheme || 'standard',
        edgeOrder: options.edgeOrder || [],
        volume: 0, // Will be calculated later
        label: options.label || id,
        type: options.type || 'default',
        properties: options.properties || {}
    };
    
    // Initialize tensor elements based on the node valence (number of edges)
    initializeTensorElements(node, edgeSpins, intertwinerValue);
    
    return node;
}

/**
 * Calculate the dimension of the intertwiner space for a node with given edge spins.
 * 
 * @param {number[]} spins - Array of spin values for edges connected to the node
 * @returns {number} - Dimension of the intertwiner space
 */
function calculateIntertwinerDimension(spins) {
    if (spins.length === 4) {
        // Use the existing library function for 4-valent nodes
        return intertwinerDimension(spins[0], spins[1], spins[2], spins[3]);
    } else if (spins.length === 3) {
        // For 3-valent nodes, dimension is 0 or 1 depending on if coupling is allowed
        const [j1, j2, j3] = spins;
        return triangleInequality(j1, j2, j3) ? 1 : 0;
    } else if (spins.length === 2) {
        // For 2-valent nodes, dimension is 1 if spins are equal, 0 otherwise
        return Math.abs(spins[0] - spins[1]) < 1e-10 ? 1 : 0;
    } else {
        // For other valences, calculate based on recoupling theory
        // This would require more complex implementation
        console.warn(`Intertwiner dimension calculation for ${spins.length}-valent nodes not fully implemented`);
        return 1; // Default fallback
    }
}

/**
 * Initialize tensor elements based on intertwiner space calculations.
 * 
 * @param {Object} node - The tensor node to initialize
 * @param {number[]} spins - Array of spin values for edges
 * @param {number} intertwinerValue - Value of the intertwiner
 */
function initializeTensorElements(node, spins, intertwinerValue) {
    const valence = spins.length;
    
    if (valence === 2) {
        initializeTwoValentTensor(node, spins);
    } else if (valence === 3) {
        initializeThreeValentTensor(node, spins, intertwinerValue);
    } else if (valence === 4) {
        initializeFourValentTensor(node, spins, intertwinerValue);
    } else {
        // For other valences, initialize with appropriate approach
        console.warn(`Tensor initialization for ${valence}-valent nodes not fully implemented`);
    }
}

/**
 * Initialize tensor elements for a 2-valent node.
 * 
 * @param {Object} node - The tensor node to initialize
 * @param {number[]} spins - Array of spin values for edges
 */
function initializeTwoValentTensor(node, spins) {
    // For 2-valent nodes, the tensor is essentially a delta function
    // connecting the two edges when they have the same spin
    if (Math.abs(spins[0] - spins[1]) < 1e-10) {
        const dim = Math.round(2 * spins[0] + 1);
        
        // Add identity tensor elements
        for (let i = 0; i < dim; i++) {
            addTensorElement(node.tensor, [i, i], { re: 1, im: 0 });
        }
    }
}

/**
 * Initialize tensor elements for a 3-valent node.
 * 
 * @param {Object} node - The tensor node to initialize
 * @param {number[]} spins - Array of spin values for edges
 * @param {number} intertwinerValue - Value of the intertwiner
 */
function initializeThreeValentTensor(node, spins, intertwinerValue) {
    const [j1, j2, j3] = spins;
    
    // 3-valent tensors use 3j symbols (Clebsch-Gordan coefficients)
    const dims = node.tensor.dimensions;
    
    // Verify that triangle inequality is satisfied
    if (triangleInequality(j1, j2, j3)) {
        // Initialize with appropriate Clebsch-Gordan coefficients
        // This is simplified for common cases
        if (allSpinsHalfInteger(spins)) {
            initialize3ValentTensorForHalfIntegers(node, spins);
        } else {
            // For general spins, more complex calculation needed
            initialize3ValentTensorGeneral(node, spins);
        }
    }
}

/**
 * Initialize tensor elements for a 4-valent node.
 * 
 * @param {Object} node - The tensor node to initialize
 * @param {number[]} spins - Array of spin values for edges
 * @param {number} intertwinerValue - Value of the intertwiner
 */
function initializeFourValentTensor(node, spins, intertwinerValue) {
    const [j1, j2, j3, j4] = spins;
    
    try {
        // Get the intertwiner basis from the library function
        const basis = getOptimizedIntertwinerBasis(j1, j2, j3, j4);
        
        // Check if the basis has states
        if (basis && basis.length > 0) {
            // Find the basis state matching the intertwiner value
            let basisState = null;
            
            // Exact match case
            for (const state of basis) {
                if (Math.abs(state.intermediateJ - intertwinerValue) < 1e-10) {
                    basisState = state;
                    break;
                }
            }
            
            // If no exact match, use the closest one
            if (!basisState && basis.length > 0) {
                basisState = basis[0];
                for (const state of basis) {
                    if (Math.abs(state.intermediateJ - intertwinerValue) < 
                        Math.abs(basisState.intermediateJ - intertwinerValue)) {
                        basisState = state;
                    }
                }
            }
            
            // If a basis state was found, use its coefficients to initialize tensor elements
            if (basisState) {
                const dims = node.tensor.dimensions;
                const coefficients = basisState.coefficients;
                
                // Map coefficients to tensor elements
                let index = 0;
                for (let i1 = 0; i1 < dims[0]; i1++) {
                    for (let i2 = 0; i2 < dims[1]; i2++) {
                        for (let i3 = 0; i3 < dims[2]; i3++) {
                            for (let i4 = 0; i4 < dims[3]; i4++) {
                                if (Math.abs(coefficients[index]) > 1e-10) {
                                    addTensorElement(
                                        node.tensor, 
                                        [i1, i2, i3, i4], 
                                        { re: coefficients[index], im: 0 }
                                    );
                                }
                                index++;
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error initializing 4-valent tensor:', error);
    }
}

/**
 * Add a non-zero element to the tensor.
 * 
 * @param {Object} tensor - The tensor object
 * @param {number[]} indices - The indices where the element should be added
 * @param {Object} value - The complex value to add
 */
function addTensorElement(tensor, indices, value) {
    if (Math.abs(value.re) < 1e-10 && Math.abs(value.im) < 1e-10) {
        return; // Skip zero elements
    }
    
    tensor.elements.push({
        indices: [...indices],
        value: { ...value }
    });
}

/**
 * Check if triangle inequality is satisfied for three spins.
 * 
 * @param {number} j1 - First spin value
 * @param {number} j2 - Second spin value
 * @param {number} j3 - Third spin value
 * @returns {boolean} - True if triangle inequality is satisfied
 */
function triangleInequality(j1, j2, j3) {
    return (j1 + j2 >= j3) && (j2 + j3 >= j1) && (j3 + j1 >= j2);
}

/**
 * Check if all spins are half-integers (spin-1/2, spin-3/2, etc.).
 * 
 * @param {number[]} spins - Array of spin values
 * @returns {boolean} - True if all spins are half-integers
 */
function allSpinsHalfInteger(spins) {
    return spins.every(spin => {
        const doubled = spin * 2;
        return Math.abs(doubled - Math.round(doubled)) < 1e-10 && 
               Math.abs(doubled % 2 - 1) < 1e-10;
    });
}

/**
 * Initialize 3-valent tensor for common case of half-integer spins.
 * 
 * @param {Object} node - The tensor node to initialize
 * @param {number[]} spins - Array of spin values
 */
function initialize3ValentTensorForHalfIntegers(node, spins) {
    // Specialized implementation for spin-1/2 edges
    if (spins.every(spin => Math.abs(spin - 0.5) < 1e-10)) {
        // For three spin-1/2 edges, we have specific tensor elements
        addTensorElement(node.tensor, [0, 0, 0], { re: 0, im: 0 });
        addTensorElement(node.tensor, [0, 1, 1], { re: 1 / Math.sqrt(2), im: 0 });
        addTensorElement(node.tensor, [1, 0, 1], { re: 1 / Math.sqrt(2), im: 0 });
        addTensorElement(node.tensor, [1, 1, 0], { re: 1 / Math.sqrt(2), im: 0 });
    }
}

/**
 * Initialize 3-valent tensor for general case.
 * 
 * @param {Object} node - The tensor node to initialize
 * @param {number[]} spins - Array of spin values
 */
function initialize3ValentTensorGeneral(node, spins) {
    // This would be implemented using the general Clebsch-Gordan coefficients
    // For now, log a warning
    console.warn("General 3-valent tensor initialization using full CG coefficients not implemented");
    // Use placeholder values
    addTensorElement(node.tensor, [0, 0, 0], { re: 1, im: 0 });
}

// Export public functions
module.exports = {
    createTensorNode,
    calculateIntertwinerDimension,
    initializeTensorElements,
    addTensorElement
};
