/**
 * Tensor Node Implementation
 * 
 * This module provides functionality for creating and manipulating tensor nodes
 * in spin networks. It connects the abstract tensor representation to the
 * intertwiner space calculation functionality.
 */

// Import required modules - Changed to ES module imports
import { getOptimizedIntertwinerBasis, getIntertwinerBasis, 
    intertwinerDimension } from '../core/intertwinerSpace';

/**
* Create a tensor node with properly initialized tensor elements based on the
* intertwiner value and edge spins.
*/
export function createTensorNode(id, position, intertwinerValue, edgeSpins, options = {}) {
// Function implementation remains the same
const dimensions = edgeSpins.map(spin => Math.round(2 * spin + 1));

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
   volume: 0,
   label: options.label || id,
   type: options.type || 'default',
   properties: options.properties || {}
};

initializeTensorElements(node, edgeSpins, intertwinerValue);

return node;
}

// Rest of the functions remain the same, just remove their declarations
// and add 'export' to the ones that need to be exported

export function calculateIntertwinerDimension(spins) {
if (spins.length === 4) {
   return intertwinerDimension(spins[0], spins[1], spins[2], spins[3]);
} else if (spins.length === 3) {
   const [j1, j2, j3] = spins;
   return triangleInequality(j1, j2, j3) ? 1 : 0;
} else if (spins.length === 2) {
   return Math.abs(spins[0] - spins[1]) < 1e-10 ? 1 : 0;
} else {
   console.warn(`Intertwiner dimension calculation for ${spins.length}-valent nodes not fully implemented`);
   return 1;
}
}

export function initializeTensorElements(node, spins, intertwinerValue) {
const valence = spins.length;

if (valence === 2) {
   initializeTwoValentTensor(node, spins);
} else if (valence === 3) {
   initializeThreeValentTensor(node, spins, intertwinerValue);
} else if (valence === 4) {
   initializeFourValentTensor(node, spins, intertwinerValue);
} else {
   console.warn(`Tensor initialization for ${valence}-valent nodes not fully implemented`);
}
}

export function addTensorElement(tensor, indices, value) {
if (Math.abs(value.re) < 1e-10 && Math.abs(value.im) < 1e-10) {
   return;
}

tensor.elements.push({
   indices: [...indices],
   value: { ...value }
});
}

// Helper functions (not exported)
function triangleInequality(j1, j2, j3) {
return (j1 + j2 >= j3) && (j2 + j3 >= j1) && (j3 + j1 >= j2);
}

function allSpinsHalfInteger(spins) {
return spins.every(spin => {
   const doubled = spin * 2;
   return Math.abs(doubled - Math.round(doubled)) < 1e-10 && 
          Math.abs(doubled % 2 - 1) < 1e-10;
});
}

function initializeTwoValentTensor(node, spins) {
if (Math.abs(spins[0] - spins[1]) < 1e-10) {
   const dim = Math.round(2 * spins[0] + 1);
   
   for (let i = 0; i < dim; i++) {
       addTensorElement(node.tensor, [i, i], { re: 1, im: 0 });
   }
}
}

function initializeThreeValentTensor(node, spins, intertwinerValue) {
const [j1, j2, j3] = spins;

if (triangleInequality(j1, j2, j3)) {
   if (allSpinsHalfInteger(spins)) {
       initialize3ValentTensorForHalfIntegers(node, spins);
   } else {
       initialize3ValentTensorGeneral(node, spins);
   }
}
}

function initializeFourValentTensor(node, spins, intertwinerValue) {
const [j1, j2, j3, j4] = spins;

try {
   const basis = getOptimizedIntertwinerBasis(j1, j2, j3, j4);
   
   if (basis && basis.length > 0) {
       let basisState = null;
       
       for (const state of basis) {
           if (Math.abs(state.intermediateJ - intertwinerValue) < 1e-10) {
               basisState = state;
               break;
           }
       }
       
       if (!basisState && basis.length > 0) {
           basisState = basis[0];
           for (const state of basis) {
               if (Math.abs(state.intermediateJ - intertwinerValue) < 
                   Math.abs(basisState.intermediateJ - intertwinerValue)) {
                   basisState = state;
               }
           }
       }
       
       if (basisState) {
           const dims = node.tensor.dimensions;
           const coefficients = basisState.coefficients;
           
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

function initialize3ValentTensorForHalfIntegers(node, spins) {
if (spins.every(spin => Math.abs(spin - 0.5) < 1e-10)) {
   addTensorElement(node.tensor, [0, 0, 0], { re: 0, im: 0 });
   addTensorElement(node.tensor, [0, 1, 1], { re: 1 / Math.sqrt(2), im: 0 });
   addTensorElement(node.tensor, [1, 0, 1], { re: 1 / Math.sqrt(2), im: 0 });
   addTensorElement(node.tensor, [1, 1, 0], { re: 1 / Math.sqrt(2), im: 0 });
}
}

function initialize3ValentTensorGeneral(node, spins) {
console.warn("General 3-valent tensor initialization using full CG coefficients not implemented");
addTensorElement(node.tensor, [0, 0, 0], { re: 1, im: 0 });
}