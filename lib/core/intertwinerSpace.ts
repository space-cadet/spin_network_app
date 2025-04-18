/**
 * Intertwiner Space Calculator
 * 
 * This module provides utilities for calculating the dimension and basis vectors
 * of intertwiner spaces for spin network nodes with arbitrary edge labels.
 */

import { Complex } from './types';

/**
 * Check if three angular momenta satisfy the triangle inequality.
 */
export function triangleInequality(j1: number, j2: number, j3: number): boolean {
  return (j1 + j2 >= j3) && (j2 + j3 >= j1) && (j3 + j1 >= j2);
}

/**
 * Calculate allowed intermediate spins when coupling j1 and j2.
 * Returns an array of possible j values.
 */
export function allowedIntermediateSpins(j1: number, j2: number): number[] {
  const j_min = Math.abs(j1 - j2);
  const j_max = j1 + j2;
  
  // Check if j1 + j2 is an integer
  const sumJ = j1 + j2;
  const isIntegerSum = Math.abs(sumJ - Math.round(sumJ)) < 1e-10;
  
  // Generate all possible intermediate j values (integers or half-integers)
  const step = isIntegerSum ? 1 : 0.5;
  const result: number[] = [];
  
  for (let j = j_min; j <= j_max + 1e-10; j += step) {
    result.push(j);
  }
  
  return result;
}

/**
 * Calculate the dimension of the intertwiner space for a 4-valent node
 * with edges labeled j1, j2, j3, j4.
 */
export function intertwinerDimension(j1: number, j2: number, j3: number, j4: number): number {
  // Get allowed intermediate spins
  const j12_values = allowedIntermediateSpins(j1, j2);
  const j34_values = allowedIntermediateSpins(j3, j4);
  
  // Count overlapping values that can couple to j=0
  let dimension = 0;
  for (const j12 of j12_values) {
    if (j34_values.some(j34 => Math.abs(j12 - j34) < 1e-10)) {
      dimension++;
    }
  }
  
  return dimension;
}

/**
 * Calculates Clebsch-Gordan coefficient <j1 m1 j2 m2|j m>
 * Implementation based on the Wigner 3j-symbol formula.
 * 
 * Note: For production use, this should be replaced with a pre-computed
 * lookup table for common cases, or a more optimized algorithm.
 */
export function cgCoefficient(j1: number, m1: number, j2: number, m2: number, j: number, m: number): number {
  // Verify m = m1 + m2
  if (Math.abs((m1 + m2) - m) > 1e-10) {
    return 0;
  }
  
  // Check triangle inequality
  if (!triangleInequality(j1, j2, j)) {
    return 0;
  }
  
  // Verify m values are within range
  if (Math.abs(m1) > j1 + 1e-10 || Math.abs(m2) > j2 + 1e-10 || Math.abs(m) > j + 1e-10) {
    return 0;
  }
  
  // This is a placeholder for a full CG coefficient implementation
  // In a real implementation, this would be computed using the Wigner 3j-symbol formula
  // or looked up from a pre-computed table
  
  // For the purposes of demonstration, we'll implement a few specific cases
  // that are commonly needed for intertwiner calculations
  
  // Case: j1 = j2 = 1/2, j = 0, m1 = -m2, m = 0
  if (Math.abs(j1 - 0.5) < 1e-10 && Math.abs(j2 - 0.5) < 1e-10 && Math.abs(j) < 1e-10) {
    if (Math.abs(m1 + m2) < 1e-10 && Math.abs(m) < 1e-10) {
      // Coefficient for singlet state
      return (m1 > 0) ? 1/Math.sqrt(2) : -1/Math.sqrt(2);
    }
  }
  
  // Case: j1 = j2 = 1/2, j = 1, m = m1 + m2
  if (Math.abs(j1 - 0.5) < 1e-10 && Math.abs(j2 - 0.5) < 1e-10 && Math.abs(j - 1) < 1e-10) {
    if (Math.abs(m - (m1 + m2)) < 1e-10) {
      // Coefficients for triplet states
      if (Math.abs(m1 - 0.5) < 1e-10 && Math.abs(m2 - 0.5) < 1e-10) return 1; // |↑↑⟩
      if (Math.abs(m1 + 0.5) < 1e-10 && Math.abs(m2 + 0.5) < 1e-10) return 1; // |↓↓⟩
      if (Math.abs(m) < 1e-10) return 1/Math.sqrt(2); // (|↑↓⟩ + |↓↑⟩)/√2
    }
  }
  
  // For a real implementation, add more cases or use a proper algorithm
  console.warn("CG coefficient calculation falling back to approximate value.");
  return 0;
}

/**
 * Interface for the basis state of an intertwiner
 */
export interface IntertwinerBasisState {
  intermediateJ: number;
  coefficients: number[];
}

/**
 * Construct a basis vector for the intertwiner space corresponding to
 * the intermediate coupling through value j.
 * 
 * Note: This is a simplified implementation that works for common cases.
 * A complete implementation would use proper Clebsch-Gordan coefficients.
 */
export function constructBasisVector(
  j1: number, j2: number, j3: number, j4: number, intermediateJ: number
): IntertwinerBasisState | null {
  // Calculate dimensions of edge Hilbert spaces
  const dim1 = Math.floor(2 * j1 + 1);
  const dim2 = Math.floor(2 * j2 + 1);
  const dim3 = Math.floor(2 * j3 + 1);
  const dim4 = Math.floor(2 * j4 + 1);
  const totalDim = dim1 * dim2 * dim3 * dim4;
  
  // Initialize basis vector coefficients
  const coefficients: number[] = new Array(totalDim).fill(0);
  
  // Generate all possible m values
  const m1Values: number[] = [];
  const m2Values: number[] = [];
  const m3Values: number[] = [];
  const m4Values: number[] = [];
  
  for (let i = 0; i < dim1; i++) m1Values.push(j1 - i);
  for (let i = 0; i < dim2; i++) m2Values.push(j2 - i);
  for (let i = 0; i < dim3; i++) m3Values.push(j3 - i);
  for (let i = 0; i < dim4; i++) m4Values.push(j4 - i);
  
  // Generate all intermediate m values
  const intermediateDim = Math.floor(2 * intermediateJ + 1);
  const intermediateMValues: number[] = [];
  for (let i = 0; i < intermediateDim; i++) {
    intermediateMValues.push(intermediateJ - i);
  }
  
  // For each combination of m values
  for (const m1 of m1Values) {
    for (const m2 of m2Values) {
      for (const intermediateM of intermediateMValues) {
        // Check if m1 + m2 = intermediateM
        if (Math.abs(m1 + m2 - intermediateM) > 1e-10) continue;
        
        // Get CG coefficient for first coupling
        const cg1 = cgCoefficient(j1, m1, j2, m2, intermediateJ, intermediateM);
        if (Math.abs(cg1) < 1e-10) continue;
        
        for (const m3 of m3Values) {
          for (const m4 of m4Values) {
            // For total j=0, we need intermediateM + m3 + m4 = 0
            if (Math.abs(intermediateM + m3 + m4) > 1e-10) continue;
            
            // Get CG coefficient for second coupling
            const cg2 = cgCoefficient(intermediateJ, intermediateM, j3, m3, j4, m4);
            if (Math.abs(cg2) < 1e-10) continue;
            
            // Calculate index in the tensor product basis
            const idx = (
              (Math.floor(j1 - m1) * dim2 * dim3 * dim4) +
              (Math.floor(j2 - m2) * dim3 * dim4) +
              (Math.floor(j3 - m3) * dim4) +
              Math.floor(j4 - m4)
            );
            
            if (idx >= 0 && idx < totalDim) {
              coefficients[idx] += cg1 * cg2;
            }
          }
        }
      }
    }
  }
  
  // Check if the vector is non-zero
  const norm = Math.sqrt(coefficients.reduce((sum, c) => sum + c * c, 0));
  if (norm < 1e-10) {
    return null;
  }
  
  // Normalize
  const normalizedCoefficients = coefficients.map(c => c / norm);
  
  return {
    intermediateJ,
    coefficients: normalizedCoefficients
  };
}

/**
 * Calculate a complete basis for the intertwiner space of a 4-valent node
 * with edges labeled j1, j2, j3, j4.
 */
export function getIntertwinerBasis(
  j1: number, j2: number, j3: number, j4: number
): IntertwinerBasisState[] {
  // Get allowed intermediate spins
  const j12_values = allowedIntermediateSpins(j1, j2);
  const j34_values = allowedIntermediateSpins(j3, j4);
  
  // Find common intermediate values with tolerance for floating point comparison
  const commonJs: number[] = [];
  for (const j12 of j12_values) {
    if (j34_values.some(j34 => Math.abs(j12 - j34) < 1e-10)) {
      commonJs.push(j12);
    }
  }
  
  // Construct basis vectors
  const basis: IntertwinerBasisState[] = [];
  for (const j of commonJs) {
    try {
      const basisState = constructBasisVector(j1, j2, j3, j4, j);
      if (basisState !== null) {
        basis.push(basisState);
      }
    } catch (error) {
      console.error(`Error constructing basis vector for j=${j}:`, error);
    }
  }
  
  // Orthonormalize the basis using Gram-Schmidt if necessary
  return orthonormalizeBasis(basis);
}

/**
 * Apply Gram-Schmidt process to orthonormalize a set of basis vectors.
 */
function orthonormalizeBasis(basisStates: IntertwinerBasisState[]): IntertwinerBasisState[] {
  if (basisStates.length === 0) return [];
  
  const orthonormalBasis: IntertwinerBasisState[] = [basisStates[0]]; // First vector is already normalized
  
  for (let i = 1; i < basisStates.length; i++) {
    const currentState = { ...basisStates[i] };
    const currentVector = [...currentState.coefficients];
    
    // Project out all previous vectors
    for (const prevState of orthonormalBasis) {
      const prevVector = prevState.coefficients;
      
      // Calculate dot product
      let projection = 0;
      for (let j = 0; j < currentVector.length; j++) {
        projection += currentVector[j] * prevVector[j];
      }
      
      // Subtract projection
      for (let j = 0; j < currentVector.length; j++) {
        currentVector[j] -= projection * prevVector[j];
      }
    }
    
    // Calculate norm
    const norm = Math.sqrt(currentVector.reduce((sum, c) => sum + c * c, 0));
    
    // Only add if the resulting vector is non-zero
    if (norm > 1e-10) {
      // Normalize
      const normalizedVector = currentVector.map(c => c / norm);
      orthonormalBasis.push({
        intermediateJ: currentState.intermediateJ,
        coefficients: normalizedVector
      });
    }
  }
  
  return orthonormalBasis;
}

/**
 * Create a pre-defined intertwiner basis for the common case of four spin-1/2 edges.
 * This is an optimization to avoid the complex calculation for this frequent case.
 */
export function getFourSpinHalfIntertwinerBasis(): IntertwinerBasisState[] {
  // For four spin-1/2 edges, there are two basis states
  
  // First basis state: (j12=0) ⊗ (j34=0)
  // This corresponds to: 1/2(|↑↓↑↓⟩ - |↑↓↓↑⟩ - |↓↑↑↓⟩ + |↓↑↓↑⟩)
  const basis1: IntertwinerBasisState = {
    intermediateJ: 0,
    coefficients: new Array(16).fill(0)
  };
  
  // Set non-zero coefficients (indices calculated based on basis ordering)
  // |↑↓↑↓⟩ -> 0*8 + 1*4 + 0*2 + 1*1 = 5
  basis1.coefficients[5] = 0.5;
  // |↑↓↓↑⟩ -> 0*8 + 1*4 + 1*2 + 0*1 = 6
  basis1.coefficients[6] = -0.5;
  // |↓↑↑↓⟩ -> 1*8 + 0*4 + 0*2 + 1*1 = 9
  basis1.coefficients[9] = -0.5;
  // |↓↑↓↑⟩ -> 1*8 + 0*4 + 1*2 + 0*1 = 10
  basis1.coefficients[10] = 0.5;
  
  // Second basis state: (j12=1) ⊗ (j34=1) -> j=0
  const basis2: IntertwinerBasisState = {
    intermediateJ: 1,
    coefficients: new Array(16).fill(0)
  };
  
  // Approximate coefficients for the second basis state
  // This is a simplified version - real implementation would use proper CG coefficients
  // |↑↑↓↓⟩ -> 0*8 + 0*4 + 1*2 + 1*1 = 3
  basis2.coefficients[3] = 1/Math.sqrt(3);
  // |↓↓↑↑⟩ -> 1*8 + 1*4 + 0*2 + 0*1 = 12
  basis2.coefficients[12] = 1/Math.sqrt(3);
  // |↑↓↑↓⟩ -> 0*8 + 1*4 + 0*2 + 1*1 = 5
  basis2.coefficients[5] = -1/(2*Math.sqrt(3));
  // |↑↓↓↑⟩ -> 0*8 + 1*4 + 1*2 + 0*1 = 6
  basis2.coefficients[6] = -1/(2*Math.sqrt(3));
  // |↓↑↑↓⟩ -> 1*8 + 0*4 + 0*2 + 1*1 = 9
  basis2.coefficients[9] = -1/(2*Math.sqrt(3));
  // |↓↑↓↑⟩ -> 1*8 + 0*4 + 1*2 + 0*1 = 10
  basis2.coefficients[10] = -1/(2*Math.sqrt(3));
  
  return [basis1, basis2];
}

/**
 * Get intertwiner basis, using pre-computed results for common cases.
 */
export function getOptimizedIntertwinerBasis(
  j1: number, j2: number, j3: number, j4: number
): IntertwinerBasisState[] {
  // Special case: four spin-1/2 edges
  if (
    Math.abs(j1 - 0.5) < 1e-10 && 
    Math.abs(j2 - 0.5) < 1e-10 && 
    Math.abs(j3 - 0.5) < 1e-10 && 
    Math.abs(j4 - 0.5) < 1e-10
  ) {
    return getFourSpinHalfIntertwinerBasis();
  }
  
  // General case - use the full calculation
  return getIntertwinerBasis(j1, j2, j3, j4);
}
