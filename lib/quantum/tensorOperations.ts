/**
 * Tensor Operations Module
 * 
 * Provides essential operations for manipulating tensors in the
 * context of spin networks, focusing on intertwiner properties.
 */

import { 
  TensorNode, 
  Complex, 
  SparseElement, 
  createComplex, 
  addComplex, 
  multiplyComplex,
  getTensorElement
} from '../core/tensor';

/**
 * Represents a tensor for mathematical operations
 */
export interface Tensor {
  dimensions: number[];        // Tensor dimensions (shape)
  elements: SparseElement[];   // Non-zero tensor elements
}

/**
 * Creates a tensor with given dimensions
 */
export function createTensor(dimensions: number[]): Tensor {
  return {
    dimensions,
    elements: []
  };
}

/**
 * Sets an element in a tensor at the specified indices
 */
export function setTensorElement(
  tensor: Tensor, 
  indices: number[], 
  value: Complex
): void {
  // Validate indices against dimensions
  if (indices.length !== tensor.dimensions.length) {
    throw new Error(`Invalid indices length: ${indices.length}, expected ${tensor.dimensions.length}`);
  }
  
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] < 0 || indices[i] >= tensor.dimensions[i]) {
      throw new Error(`Index ${indices[i]} out of bounds for dimension ${i}`);
    }
  }
  
  // Check if element with these indices already exists
  const existingIndex = tensor.elements.findIndex(
    el => el.indices.length === indices.length && 
    el.indices.every((idx, i) => idx === indices[i])
  );
  
  // Skip if value is essentially zero
  if (Math.abs(value.re) < 1e-10 && Math.abs(value.im) < 1e-10) {
    if (existingIndex >= 0) {
      // Remove existing element if value is now zero
      tensor.elements.splice(existingIndex, 1);
    }
    return;
  }
  
  if (existingIndex >= 0) {
    // Update existing element
    tensor.elements[existingIndex].value = { ...value };
  } else {
    // Add new element
    tensor.elements.push({
      indices: [...indices],
      value: { ...value }
    });
  }
}

/**
 * Gets an element from a tensor at the specified indices
 */
export function getTensorElement(
  tensor: Tensor, 
  indices: number[]
): Complex {
  // Validate indices against dimensions
  if (indices.length !== tensor.dimensions.length) {
    throw new Error(`Invalid indices length: ${indices.length}, expected ${tensor.dimensions.length}`);
  }
  
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] < 0 || indices[i] >= tensor.dimensions[i]) {
      throw new Error(`Index ${indices[i]} out of bounds for dimension ${i}`);
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
 * Converts a TensorNode to a Tensor
 */
export function tensorNodeToTensor(node: TensorNode): Tensor {
  return {
    dimensions: [...node.tensor.dimensions],
    elements: node.tensor.elements.map(el => ({
      indices: [...el.indices],
      value: { ...el.value }
    }))
  };
}

/**
 * Contracts two tensors along specified indices
 * 
 * Example: contracting tensors A and B along indices [[0, 1]] means
 * summing over index 0 of A and index 1 of B.
 */
export function contractTensors(
  tensorA: Tensor,
  tensorB: Tensor,
  contractionPairs: [number, number][]
): Tensor {
  // Validate contraction pairs
  for (const [indexA, indexB] of contractionPairs) {
    if (indexA < 0 || indexA >= tensorA.dimensions.length) {
      throw new Error(`Invalid index ${indexA} for first tensor`);
    }
    if (indexB < 0 || indexB >= tensorB.dimensions.length) {
      throw new Error(`Invalid index ${indexB} for second tensor`);
    }
    if (tensorA.dimensions[indexA] !== tensorB.dimensions[indexB]) {
      throw new Error(`Dimension mismatch for contraction: ${tensorA.dimensions[indexA]} != ${tensorB.dimensions[indexB]}`);
    }
  }
  
  // Determine free (non-contracted) indices
  const freeIndicesA = Array.from(
    { length: tensorA.dimensions.length },
    (_, i) => i
  ).filter(i => !contractionPairs.some(([a, _]) => a === i));
  
  const freeIndicesB = Array.from(
    { length: tensorB.dimensions.length },
    (_, i) => i
  ).filter(i => !contractionPairs.some(([_, b]) => b === i));
  
  // Determine result dimensions
  const resultDimensions = [
    ...freeIndicesA.map(i => tensorA.dimensions[i]),
    ...freeIndicesB.map(i => tensorB.dimensions[i])
  ];
  
  // Create result tensor
  const result = createTensor(resultDimensions);
  
  // If either tensor is empty, return empty result
  if (tensorA.elements.length === 0 || tensorB.elements.length === 0) {
    return result;
  }
  
  // Perform contraction (only for non-zero elements)
  // This is a simplified version that works for simple contractions
  const contractionDimensions = contractionPairs.map(([a, _]) => tensorA.dimensions[a]);
  
  // Generate all possible free index values for result tensor
  const generateIndices = (dims: number[]): number[][] => {
    if (dims.length === 0) return [[]];
    
    const subIndices = generateIndices(dims.slice(1));
    const result: number[][] = [];
    
    for (let i = 0; i < dims[0]; i++) {
      for (const sub of subIndices) {
        result.push([i, ...sub]);
      }
    }
    
    return result;
  };
  
  // Generate free indices for first tensor
  const freeIndicesValuesA = generateIndices(freeIndicesA.map(i => tensorA.dimensions[i]));
  
  // Generate free indices for second tensor
  const freeIndicesValuesB = generateIndices(freeIndicesB.map(i => tensorB.dimensions[i]));
  
  // For each combination of free indices
  for (const freeValuesA of freeIndicesValuesA) {
    for (const freeValuesB of freeIndicesValuesB) {
      // Initialize sum for this element
      let sum = createComplex(0, 0);
      
      // Generate all possible contraction index values
      const contractionIndicesValues = generateIndices(contractionDimensions);
      
      for (const contractionValues of contractionIndicesValues) {
        // Build complete indices for tensor A
        const indicesA = new Array(tensorA.dimensions.length);
        for (let i = 0; i < freeIndicesA.length; i++) {
          indicesA[freeIndicesA[i]] = freeValuesA[i];
        }
        for (let i = 0; i < contractionPairs.length; i++) {
          indicesA[contractionPairs[i][0]] = contractionValues[i];
        }
        
        // Build complete indices for tensor B
        const indicesB = new Array(tensorB.dimensions.length);
        for (let i = 0; i < freeIndicesB.length; i++) {
          indicesB[freeIndicesB[i]] = freeValuesB[i];
        }
        for (let i = 0; i < contractionPairs.length; i++) {
          indicesB[contractionPairs[i][1]] = contractionValues[i];
        }
        
        // Get elements from both tensors
        const elementA = getTensorElement(tensorA, indicesA);
        const elementB = getTensorElement(tensorB, indicesB);
        
        // Compute product and add to sum
        const product = multiplyComplex(elementA, elementB);
        sum = addComplex(sum, product);
      }
      
      // If sum is non-zero, add to result tensor
      if (Math.abs(sum.re) > 1e-10 || Math.abs(sum.im) > 1e-10) {
        const resultIndices = [...freeValuesA, ...freeValuesB];
        setTensorElement(result, resultIndices, sum);
      }
    }
  }
  
  return result;
}

/**
 * Calculates the norm of a tensor (Frobenius norm)
 */
export function tensorNorm(tensor: Tensor): number {
  let sumSquared = 0;
  
  for (const element of tensor.elements) {
    const value = element.value;
    sumSquared += value.re * value.re + value.im * value.im;
  }
  
  return Math.sqrt(sumSquared);
}

/**
 * Normalizes a tensor to have Frobenius norm of 1
 */
export function normalizeTensor(tensor: Tensor): Tensor {
  const norm = tensorNorm(tensor);
  
  if (norm < 1e-10) {
    throw new Error('Cannot normalize tensor with near-zero norm');
  }
  
  const result = createTensor(tensor.dimensions);
  
  for (const element of tensor.elements) {
    setTensorElement(
      result,
      element.indices,
      {
        re: element.value.re / norm,
        im: element.value.im / norm
      }
    );
  }
  
  return result;
}

/**
 * Creates a 4-valent intertwiner tensor from j values and intermediate j
 */
export function createIntertwinerTensor(
  j1: number, j2: number, j3: number, j4: number, 
  intermediateJ: number
): Tensor {
  // Create dimensions based on j values
  const dim1 = Math.floor(2 * j1 + 1);
  const dim2 = Math.floor(2 * j2 + 1);
  const dim3 = Math.floor(2 * j3 + 1);
  const dim4 = Math.floor(2 * j4 + 1);
  
  // Create tensor
  const tensor = createTensor([dim1, dim2, dim3, dim4]);
  
  // Generate m values for each j
  const m1Values = Array.from({ length: dim1 }, (_, i) => j1 - i);
  const m2Values = Array.from({ length: dim2 }, (_, i) => j2 - i);
  const m3Values = Array.from({ length: dim3 }, (_, i) => j3 - i);
  const m4Values = Array.from({ length: dim4 }, (_, i) => j4 - i);
  
  // Generate intertwiner coefficients using CG coefficients
  // For each combination of m values
  for (let i1 = 0; i1 < dim1; i1++) {
    const m1 = m1Values[i1];
    
    for (let i2 = 0; i2 < dim2; i2++) {
      const m2 = m2Values[i2];
      const m12 = m1 + m2;
      
      // Skip if m12 is out of range for intermediateJ
      if (Math.abs(m12) > intermediateJ + 1e-10) continue;
      
      for (let i3 = 0; i3 < dim3; i3++) {
        const m3 = m3Values[i3];
        
        for (let i4 = 0; i4 < dim4; i4++) {
          const m4 = m4Values[i4];
          const m34 = m3 + m4;
          
          // For an invariant intertwiner, we need m12 + m34 = 0
          if (Math.abs(m12 + m34) > 1e-10) continue;
          
          // Simple coefficient based on positions
          // In a full implementation, this would use proper CG coefficients
          let coefficient = 0;
          
          // Special case: four spin-1/2 edges
          if (Math.abs(j1 - 0.5) < 1e-10 && 
              Math.abs(j2 - 0.5) < 1e-10 && 
              Math.abs(j3 - 0.5) < 1e-10 && 
              Math.abs(j4 - 0.5) < 1e-10) {
            
            if (Math.abs(intermediateJ) < 1e-10) {
              // Singlet basis state (j=0)
              if ((i1 + i2 + i3 + i4) % 2 === 0) {
                coefficient = (i1 + i3) % 2 === 0 ? 0.5 : -0.5;
              }
            } else if (Math.abs(intermediateJ - 1) < 1e-10) {
              // Triplet basis state (j=1)
              if (i1 === 0 && i2 === 0 && i3 === 1 && i4 === 1) coefficient = 1/Math.sqrt(3);
              else if (i1 === 1 && i2 === 1 && i3 === 0 && i4 === 0) coefficient = 1/Math.sqrt(3);
              else if ((i1 + i2 + i3 + i4) % 2 === 0) coefficient = -1/(2*Math.sqrt(3));
            }
          } else {
            // For other cases, use a simplified placeholder coefficient
            // This is a placeholder - not physically accurate
            coefficient = 1 / Math.sqrt(dim1 * dim2 * dim3 * dim4);
          }
          
          if (Math.abs(coefficient) > 1e-10) {
            setTensorElement(
              tensor,
              [i1, i2, i3, i4],
              { re: coefficient, im: 0 }
            );
          }
        }
      }
    }
  }
  
  // Normalize the tensor
  return normalizeTensor(tensor);
}

/**
 * Calculates the expectation value of an operator with respect to a state vector
 */
export function tensorExpectationValue(
  tensor: Tensor,
  operator: Tensor
): Complex {
  // Validate dimensions
  if (JSON.stringify(tensor.dimensions) !== JSON.stringify(operator.dimensions)) {
    throw new Error('Tensor and operator dimensions must match for expectation value');
  }
  
  // For a rank-2 tensor (matrix) operator, calculate <ψ|O|ψ>
  let result = createComplex(0, 0);
  
  // For simplicity, only handle the case where all indices have same dimension
  const dim = tensor.dimensions[0];
  
  // Generate all possible indices
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      const psi_i = getTensorElement(tensor, [i]);
      const O_ij = getTensorElement(operator, [i, j]);
      const psi_j = getTensorElement(tensor, [j]);
      
      // psi_i* * O_ij * psi_j
      const psi_i_conj = { re: psi_i.re, im: -psi_i.im };
      const temp = multiplyComplex(O_ij, psi_j);
      const term = multiplyComplex(psi_i_conj, temp);
      
      result = addComplex(result, term);
    }
  }
  
  return result;
}
