/**
 * Tensor module exports for the spin network library
 * 
 * This module brings together tensor creation, manipulation, and calculation
 * functionalities, bridging the intertwiner space calculations with
 * tensor-based node representation.
 */

// Re-export the core tensor types from the core module
import {
  TensorNode,
  StateVectorEdge,
  Complex,
  SparseElement,
  createTensorNode as coreTensorNodeCreator,
  setTensorElement,
  getTensorElement,
  createStateVectorEdge,
  setStateVectorAmplitude,
  getStateVectorAmplitude,
  normalizeStateVector,
  calculateNodeVolume,
  calculateEdgeArea,
  createComplex,
  addComplex,
  multiplyComplex
} from '../core/tensor';

// Import the new TensorNode implementation
// // Using require for JavaScript file compatibility
// const tensorNodeModule = require('./tensorNode');

import { createTensorNode, calculateIntertwinerDimension } from './tensorNode';


/**
 * Enhanced createTensorNode function that uses the improved implementation
 * to properly initialize tensor nodes with appropriate intertwiner tensor
 * elements based on edge spins.
 * 
 * @param id - Node identifier
 * @param position - x,y coordinates of the node
 * @param intertwinerValue - Value of the intertwiner
 * @param edgeSpins - Array of spin values for edges connected to the node
 * @param options - Additional options
 * @returns A tensor node with initialized elements
 */
export function createEnhancedTensorNode(
  id: string,
  position: { x: number, y: number, z?: number },
  intertwinerValue: number,
  edgeSpins: number[],
  options: any = {}
): TensorNode {
  // Use the enhanced implementation from tensorNode.js
  return tensorNodeModule.createTensorNode(
    id, 
    position, 
    intertwinerValue, 
    edgeSpins, 
    options
  );
}

/**
 * Calculate the dimension of the intertwiner space for a node with given edge spins.
 * 
 * @param spins - Array of spin values for edges connected to the node
 * @returns The dimension of the intertwiner space
 */
export function calculateIntertwinerDimension(spins: number[]): number {
  return tensorNodeModule.calculateIntertwinerDimension(spins);
}

// Re-export the core tensor functions for backward compatibility
export {
  // From core/tensor.ts
  coreTensorNodeCreator as createBasicTensorNode,
  setTensorElement,
  getTensorElement,
  createStateVectorEdge,
  setStateVectorAmplitude,
  getStateVectorAmplitude,
  normalizeStateVector,
  calculateNodeVolume,
  calculateEdgeArea,
  createComplex,
  addComplex,
  multiplyComplex,
  
  // From tensorNode.js
  createEnhancedTensorNode as createTensorNode // Make this the default
}
