/**
 * Tensor and State Vector representations for Spin Networks
 * 
 * This module provides the core data structures for representing
 * nodes as tensors and edges as state vectors in spin networks.
 */

import { IntertwinerBasisState, getOptimizedIntertwinerBasis, triangleInequality } from './intertwinerSpace';

/**
 * Represents a complex number for tensor operations
 */
export interface Complex {
  re: number;  // Real part
  im: number;  // Imaginary part
}

/**
 * Creates a new complex number
 */
export function createComplex(re: number = 0, im: number = 0): Complex {
  return { re, im };
}

/**
 * Adds two complex numbers
 */
export function addComplex(a: Complex, b: Complex): Complex {
  return {
    re: a.re + b.re,
    im: a.im + b.im
  };
}

/**
 * Multiplies two complex numbers
 */
export function multiplyComplex(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  };
}

/**
 * Represents a sparse element in a tensor
 */
export interface SparseElement {
  indices: number[];  // Position in the tensor
  value: Complex;     // Complex value at this position
}

/**
 * Represents a tensor node in the spin network
 */
export interface TensorNode {
  id: string;
  position: {
    x: number;
    y: number;
    z?: number;
  };
  
  // Tensor representation
  tensor: {
    dimensions: number[];         // Tensor dimensions (shape)
    elements: SparseElement[];    // Non-zero tensor elements
    basis: string;                // Basis representation
  };
  
  // Intertwiner representation (for backward compatibility)
  intertwiner: {
    value: number;                // The numerical value
    dimension?: number;           // Dimension of the intertwiner space
    basisStateRef?: string;       // Reference to a basis state
    recouplingScheme?: string;    // E.g. "(j1,j2)(j3,j4)"
    edgeOrder?: string[];         // Ordered array of connected edge IDs
  };
  
  // Physical properties
  volume?: number;                // Quantum volume contribution
  
  // Additional properties
  label?: string;
  type?: string;
  properties?: Record<string, any>;
}

/**
 * Represents a state vector edge in the spin network
 */
export interface StateVectorEdge {
  id: string;
  source: string | null;         // Source node ID (null if dangling)
  target: string | null;         // Target node ID (null if dangling)
  
  // State vector representation
  stateVector: {
    dimension: number;           // Dimension (2j+1)
    amplitudes: Complex[];       // State vector amplitudes
    basis: string;               // Basis representation
  };
  
  // Spin representation (for backward compatibility)
  spin: number;                  // The spin value (typically a half-integer)
  
  // Physical properties
  area?: number;                 // Quantum area contribution
  
  // Additional properties
  label?: string;
  type?: string;
  sourcePosition?: { x: number, y: number, z?: number };  // Position for dangling source end
  targetPosition?: { x: number, y: number, z?: number };  // Position for dangling target end
  properties?: Record<string, any>;
}

/**
 * Creates a tensor node with default values and automatically initializes tensor elements
 * based on the intertwiner values and dimensions (which correspond to edge spins)
 */
export function createTensorNode(
  id: string,
  position: { x: number, y: number, z?: number },
  intertwinerId: number,
  dimensions: number[] = []
): TensorNode {
  // Use provided dimensions or default to 4-valent node with spin-1/2 edges
  const dims = dimensions.length > 0 ? dimensions : [2, 2, 2, 2];
  
  // Create the basic node structure
  const node: TensorNode = {
    id,
    position,
    tensor: {
      dimensions: dims,
      elements: [],
      basis: 'standard'
    },
    intertwiner: {
      value: intertwinerId,
      dimension: dims.reduce((prod, dim) => prod * dim, 1)
    }
  };
  
  // Initialize tensor elements if we have exactly 4 edges (4-valent node)
  if (dims.length === 4) {
    // Calculate spins from dimensions (j = (dim-1)/2)
    const j1 = (dims[0] - 1) / 2;
    const j2 = (dims[1] - 1) / 2;
    const j3 = (dims[2] - 1) / 2;
    const j4 = (dims[3] - 1) / 2;
    
    try {
      // Use the optimized intertwiner basis calculation from intertwinerSpace.ts
      // Get basis state that corresponds to this intertwiner value
      const basis = getOptimizedIntertwinerBasis(j1, j2, j3, j4);
        
        // Find the basis state matching the requested intertwiner value or use the first one
        const basisState = basis.find(state => 
          Math.abs(state.intermediateJ - intertwinerId) < 1e-6
        ) || basis[0];
        
        if (basisState) {
          // Initialize tensor elements from the basis state coefficients
          let coeffIndex = 0;
          for (let i1 = 0; i1 < dims[0]; i1++) {
            for (let i2 = 0; i2 < dims[1]; i2++) {
              for (let i3 = 0; i3 < dims[2]; i3++) {
                for (let i4 = 0; i4 < dims[3]; i4++) {
                  const coeff = basisState.coefficients[coeffIndex++];
                  if (Math.abs(coeff) > 1e-10) {
                    setTensorElement(
                      node.tensor, 
                      [i1, i2, i3, i4], 
                      { re: coeff, im: 0 }
                    );
                  }
                }
              }
            }
          }
          
          // Update intertwiner properties
          node.intertwiner.dimension = basisState.coefficients.length;
          node.intertwiner.basisStateRef = `${j1},${j2},${j3},${j4}:${basisState.intermediateJ}`;
          node.intertwiner.recouplingScheme = "(j1,j2)(j3,j4)";
        }
      }
    } catch (error) {
      console.warn('Failed to initialize tensor elements:', error);
    }
  } else if (dims.length === 3) {
    // Handle 3-valent nodes
    // For 3-valent nodes, the intertwiner space is 1-dimensional if the spins satisfy triangle inequality
    const j1 = (dims[0] - 1) / 2;
    const j2 = (dims[1] - 1) / 2;
    const j3 = (dims[2] - 1) / 2;
    
    try {
      // Check if the spins satisfy triangle inequality
      if (triangleInequality(j1, j2, j3)) {
        // For 3-valent nodes with valid spins, set up a normalized tensor 
        // This is a simplified implementation; a full implementation would use 3j-symbols
        
        // Set a single non-zero element to represent the intertwiner
        const maxIndices = [0, 0, 0]; // Use highest weight states for simplicity
        setTensorElement(
          node.tensor,
          maxIndices,
          { re: 1, im: 0 } // Normalized coefficient
        );
        
        // Update intertwiner properties
        node.intertwiner.dimension = 1; // 3-valent nodes have 1-dimensional intertwiner space
        node.intertwiner.basisStateRef = `${j1},${j2},${j3}`;
        node.intertwiner.recouplingScheme = "3-valent";
      }
    } catch (error) {
      console.warn('Failed to initialize 3-valent tensor elements:', error);
    }
  }
  
  return node;
}

/**
 * Sets an element in the tensor at the specified indices
 */
export function setTensorElement(
  tensor: TensorNode['tensor'], 
  indices: number[], 
  value: Complex
): void {
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
}

/**
 * Gets an element from the tensor at the specified indices
 */
export function getTensorElement(
  tensor: TensorNode['tensor'], 
  indices: number[]
): Complex {
  // Validate indices against dimensions
  if (indices.length !== tensor.dimensions.length) {
    console.warn(`Invalid indices length: ${indices.length}, expected ${tensor.dimensions.length}`);
    return { re: 0, im: 0 };
  }
  
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] < 0 || indices[i] >= tensor.dimensions[i]) {
      console.warn(`Index ${indices[i]} out of bounds for dimension ${i}`);
      return { re: 0, im: 0 };
    }
  }
  
  // Find element with these indices
  const element = tensor.elements.find(
    el => el.indices.length === indices.length && 
    el.indices.every((idx, i) => idx === indices[i])
  );
  
  return element ? { ...element.value } : { re: 0, im: 0 };
}

/**
 * Creates a state vector edge with default values
 */
export function createStateVectorEdge(
  id: string,
  source: string | null,
  target: string | null,
  spin: number
): StateVectorEdge {
  const dimension = Math.floor(2 * spin + 1);
  
  // Initialize with |j,j⟩ state (highest weight state)
  const amplitudes: Complex[] = new Array(dimension).fill(null).map(() => ({ re: 0, im: 0 }));
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
}

/**
 * Sets an amplitude in the state vector at the specified index
 */
export function setStateVectorAmplitude(
  stateVector: StateVectorEdge['stateVector'],
  index: number,
  value: Complex
): void {
  if (index < 0 || index >= stateVector.dimension) {
    console.warn(`Index ${index} out of bounds for state vector of dimension ${stateVector.dimension}`);
    return;
  }
  
  stateVector.amplitudes[index] = { ...value };
}

/**
 * Gets an amplitude from the state vector at the specified index
 */
export function getStateVectorAmplitude(
  stateVector: StateVectorEdge['stateVector'],
  index: number
): Complex {
  if (index < 0 || index >= stateVector.dimension) {
    console.warn(`Index ${index} out of bounds for state vector of dimension ${stateVector.dimension}`);
    return { re: 0, im: 0 };
  }
  
  return { ...stateVector.amplitudes[index] };
}

/**
 * Normalizes a state vector
 */
export function normalizeStateVector(stateVector: StateVectorEdge['stateVector']): void {
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
}

/**
 * Creates a tensor node from intertwiner basis state
 */
export function createTensorNodeFromBasisState(
  id: string,
  position: { x: number, y: number, z?: number },
  j1: number, j2: number, j3: number, j4: number,
  basisState: IntertwinerBasisState
): TensorNode {
  const dim1 = Math.floor(2 * j1 + 1);
  const dim2 = Math.floor(2 * j2 + 1);
  const dim3 = Math.floor(2 * j3 + 1);
  const dim4 = Math.floor(2 * j4 + 1);
  
  const node = createTensorNode(id, position, basisState.intermediateJ, [dim1, dim2, dim3, dim4]);
  
  // Set tensor elements from basis state coefficients
  let coeffIndex = 0;
  for (let i1 = 0; i1 < dim1; i1++) {
    for (let i2 = 0; i2 < dim2; i2++) {
      for (let i3 = 0; i3 < dim3; i3++) {
        for (let i4 = 0; i4 < dim4; i4++) {
          const coeff = basisState.coefficients[coeffIndex++];
          if (Math.abs(coeff) > 1e-10) {
            setTensorElement(
              node.tensor, 
              [i1, i2, i3, i4], 
              { re: coeff, im: 0 }
            );
          }
        }
      }
    }
  }
  
  // Set intertwiner properties
  node.intertwiner = {
    value: basisState.intermediateJ,
    dimension: basisState.coefficients.length,
    basisStateRef: `${j1},${j2},${j3},${j4}:${basisState.intermediateJ}`,
    recouplingScheme: "(j1,j2)(j3,j4)"
  };
  
  return node;
}

/**
 * Calculate the volume contribution of a tensor node
 */
export function calculateNodeVolume(node: TensorNode): number {
  // Simple volume calculation proportional to dimension
  const volumeFactor = 8 * Math.PI;
  return volumeFactor * (node.intertwiner.dimension || 1);
}

/**
 * Calculate the area contribution of a state vector edge
 */
export function calculateEdgeArea(edge: StateVectorEdge): number {
  // Area calculation based on spin (standard LQG formula)
  const areaFactor = 8 * Math.PI;
  return areaFactor * Math.sqrt(edge.spin * (edge.spin + 1));
}
