/**
 * Geometric property calculations for spin networks
 * 
 * This file implements the calculation of various geometric properties
 * of the network based on quantum geometry principles.
 */

import { GeometricCalculator, SimulationGraph, StateVector } from '../core/types';
import { MathAdapter } from '../core/mathAdapter';

/**
 * Implementation of the GeometricCalculator interface
 */
export class SpinNetworkGeometryCalculator implements GeometricCalculator {
  
  /**
   * Calculate the total volume based on state vector values
   * 
   * In loop quantum gravity, the volume is related to the
   * quantum state at each node (intertwiner).
   */
  calculateTotalVolume(state: StateVector): number {
    // Validate input to prevent null/undefined errors
    if (!state || typeof state.size !== 'number' || state.size <= 0) {
      console.warn('Invalid state provided to calculateTotalVolume');
      return 0;
    }
    
    try {
      let totalVolume = 0;
      
      // Sum up the volumes associated with each node
      for (let i = 0; i < state.size; i++) {
        // Get state value with error handling
        let stateValue = 0;
        try {
          stateValue = state.getValueAtIndex(i);
          
          // Validate we got a finite number
          if (stateValue === null || stateValue === undefined || !Number.isFinite(stateValue)) {
            console.warn(`Invalid state value at index ${i}:`, stateValue);
            stateValue = 0;
          }
        } catch (error) {
          console.error(`Error getting state value at index ${i}:`, error);
          stateValue = 0;
        }
        
        // The volume contribution of a node is proportional to |ψ|^2
        // This is a simplified model; in full LQG, volume depends on
        // intertwiner quantum numbers in a more complex way
        const volumeContribution = Math.abs(stateValue) ** 2;
        totalVolume += volumeContribution;
      }
      
      return totalVolume;
    } catch (error) {
      console.error('Error calculating total volume:', error);
      return 0;
    }
  }
  
  /**
   * Calculate volume entropy as a measure of volume distribution
   * 
   * This is defined as -Σ (v_i/V_tot) * ln(v_i/V_tot) where v_i is the
   * volume at node i and V_tot is the total volume.
   */
  calculateVolumeEntropy(state: StateVector): number {
    // Validate input to prevent null/undefined errors
    if (!state || typeof state.size !== 'number' || state.size <= 0) {
      console.warn('Invalid state provided to calculateVolumeEntropy');
      return 0;
    }
    
    try {
      const totalVolume = this.calculateTotalVolume(state);
      
      // If total volume is 0, return 0 to avoid division by zero
      if (totalVolume === 0 || !Number.isFinite(totalVolume)) {
        return 0;
      }
      
      let entropy = 0;
      
      // Calculate entropy based on volume distribution
      for (let i = 0; i < state.size; i++) {
        // Get state value with error handling
        let stateValue = 0;
        try {
          stateValue = state.getValueAtIndex(i);
          
          // Validate we got a finite number
          if (stateValue === null || stateValue === undefined || !Number.isFinite(stateValue)) {
            continue; // Skip invalid values
          }
        } catch (error) {
          console.error(`Error getting state value at index ${i}:`, error);
          continue; // Skip on error
        }
        
        const volumeContribution = Math.abs(stateValue) ** 2;
        
        // Skip nodes with zero volume
        if (volumeContribution === 0 || !Number.isFinite(volumeContribution)) {
          continue;
        }
        
        // Calculate the volume fraction
        const volumeFraction = volumeContribution / totalVolume;
        
        // Add to entropy: -p * ln(p) with validation
        if (volumeFraction > 0 && Number.isFinite(volumeFraction)) {
          try {
            const logTerm = Math.log(volumeFraction);
            if (Number.isFinite(logTerm)) {
              entropy -= volumeFraction * logTerm;
            }
          } catch (error) {
            console.error('Error calculating log term for entropy:', error);
          }
        }
      }
      
      return Number.isFinite(entropy) ? entropy : 0;
    } catch (error) {
      console.error('Error calculating volume entropy:', error);
      return 0;
    }
  }
  
  /**
   * Calculate the total area based on edge spins
   * 
   * In spin networks, the area of a surface crossed by an edge
   * is proportional to sqrt(j(j+1)) where j is the spin.
   */
  calculateTotalArea(graph: SimulationGraph): number {
    // Validate input to prevent null/undefined errors
    if (!graph || !Array.isArray(graph.edges) || graph.edges.length === 0) {
      console.warn('Invalid graph provided to calculateTotalArea');
      return 0;
    }
    
    try {
      let totalArea = 0;
      
      // Sum up the areas associated with each edge
      for (const edge of graph.edges) {
        // Validate edge object and spin property
        if (!edge || typeof edge.spin !== 'number' || !Number.isFinite(edge.spin)) {
          console.warn('Invalid edge or spin value:', edge);
          continue; // Skip invalid edges
        }
        
        try {
          // The area contribution of an edge is proportional to sqrt(j(j+1))
          const spinValue = Math.max(0, edge.spin); // Ensure non-negative
          const areaContribution = Math.sqrt(spinValue * (spinValue + 1));
          
          if (Number.isFinite(areaContribution)) {
            totalArea += areaContribution;
          }
        } catch (error) {
          console.error('Error calculating area contribution for edge:', edge, error);
        }
      }
      
      return Number.isFinite(totalArea) ? totalArea : 0;
    } catch (error) {
      console.error('Error calculating total area:', error);
      return 0;
    }
  }
  
  /**
   * Calculate the effective dimension of the network
   * 
   * This estimates the spectral dimension based on the
   * eigenvalues of the Laplacian matrix.
   */
  calculateEffectiveDimension(
    graph: SimulationGraph,
    state: StateVector
  ): number {
    // Validate input to prevent null/undefined errors
    if (!graph || !state) {
      console.warn('Invalid graph or state provided to calculateEffectiveDimension');
      return 0;
    }
    
    try {
      // Verify graph has required methods
      if (typeof graph.toLaplacianMatrix !== 'function') {
        console.warn('Graph is missing toLaplacianMatrix method');
        return 0;
      }
      
      // Create the Laplacian matrix with error handling
      let laplacian;
      try {
        laplacian = graph.toLaplacianMatrix();

        // For validation, convert to plain array if possible
        // For validation, convert to plain array if possible
        let laplacianArray = laplacian && typeof laplacian.toArray === 'function'
          ? laplacian.toArray()
          : laplacian;

        // Validate laplacian matrix (as array)
        if (!laplacianArray || !Array.isArray(laplacianArray) || laplacianArray.length === 0) {
          console.warn('Invalid Laplacian matrix:', laplacian);
          return 0;
        }
      } catch (error) {
        console.error('Error creating Laplacian matrix:', error);
        return 0;
      }

      // Calculate eigenvalues with error handling
      let eigenvalues;
      try {
        const result = MathAdapter.eigenDecomposition(laplacian);
        eigenvalues = result.values;
        
        // Validate eigenvalues
        if (!eigenvalues || !Array.isArray(eigenvalues) || eigenvalues.length === 0) {
          console.warn('Invalid eigenvalues:', eigenvalues);
          return 0;
        }
      } catch (error) {
        console.error('Error calculating eigenvalues:', error);
        return 0;
      }
      
      // Filter and sort eigenvalues with validation
      let sortedEigenvalues;
      try {
        sortedEigenvalues = eigenvalues
          .filter(v => Number.isFinite(v) && Math.abs(v) > 1e-10) // Remove zeros and invalid values
          .sort((a, b) => a - b);
        
        // If we don't have enough eigenvalues, return 0
        if (sortedEigenvalues.length < 2) {
          console.warn('Insufficient non-zero eigenvalues for dimension calculation');
          return 0;
        }
      } catch (error) {
        console.error('Error processing eigenvalues:', error);
        return 0;
      }
      
      // Calculate the spectral dimension
      try {
        // Take a sample of the smallest eigenvalues
        const sampleSize = Math.min(10, Math.floor(sortedEigenvalues.length / 3));
        if (sampleSize < 2) {
          console.warn('Insufficient sample size for regression');
          return 0;
        }
        
        // Calculate log eigenvalues with validation
        const logEigenvalues = [];
        for (let i = 0; i < sampleSize; i++) {
          const eigenvalue = sortedEigenvalues[i];
          if (eigenvalue <= 0) continue;
          
          try {
            const logValue = Math.log(eigenvalue);
            if (Number.isFinite(logValue)) {
              logEigenvalues.push(logValue);
            }
          } catch (error) {
            console.error(`Error calculating log of eigenvalue ${eigenvalue}:`, error);
          }
        }
        
        // Check if we have enough valid log eigenvalues
        if (logEigenvalues.length < 2) {
          console.warn('Insufficient valid log eigenvalues for regression');
          return 0;
        }
        
        // Generate log(N(λ)) data points with validation
        const logCumulative = [];
        for (let i = 0; i < logEigenvalues.length; i++) {
          try {
            const cumulative = (i + 1) / sortedEigenvalues.length;
            const logCumul = Math.log(cumulative);
            
            if (Number.isFinite(logCumul)) {
              logCumulative.push(logCumul);
            }
          } catch (error) {
            console.error(`Error calculating log cumulative at index ${i}:`, error);
          }
        }
        
        // Check if we have matching arrays
        if (logEigenvalues.length !== logCumulative.length || logEigenvalues.length < 2) {
          console.warn('Mismatched or insufficient data points for regression');
          return 0;
        }
        
        // Calculate the slope using linear regression
        let sumXY = 0;
        let sumX = 0;
        let sumY = 0;
        let sumXX = 0;
        
        for (let i = 0; i < logEigenvalues.length; i++) {
          sumXY += logEigenvalues[i] * logCumulative[i];
          sumX += logEigenvalues[i];
          sumY += logCumulative[i];
          sumXX += logEigenvalues[i] * logEigenvalues[i];
        }
        
        const denominator = (logEigenvalues.length * sumXX - sumX * sumX);
        
        // Check for division by zero
        if (Math.abs(denominator) < 1e-10) {
          console.warn('Near-zero denominator in regression calculation');
          return 0;
        }
        
        const slope = (logEigenvalues.length * sumXY - sumX * sumY) / denominator;
        
        // d_s = -2 * slope
        const dimension = -2 * slope;
        
        // Validate the result
        if (!Number.isFinite(dimension)) {
          console.warn('Invalid dimension calculated:', dimension);
          return 0;
        }
        
        // Dimensions should be reasonable (between 0 and 10)
        return Math.max(0, Math.min(10, dimension));
      } catch (error) {
        console.error('Error calculating effective dimension:', error);
        return 0;
      }
    } catch (error) {
      console.error('Unhandled error in calculateEffectiveDimension:', error);
      return 0;
    }
  }
  
  /**
   * Calculate the diffusion rate based on the current state
   */
  calculateDiffusionRate(
    prevState: StateVector,
    state: StateVector,
    dt: number
  ): number {
    // If dt is 0, return 0 to avoid division by zero
    if (dt === 0) {
      return 0;
    }
    
    // Calculate the L2 norm of the difference between states
    let diffNormSquared = 0;
    for (let i = 0; i < state.size; i++) {
      const diff = state.getValueAtIndex(i) - prevState.getValueAtIndex(i);
      diffNormSquared += diff * diff;
    }
    
    // Rate is proportional to |ψ(t) - ψ(t-dt)|^2 / dt
    return diffNormSquared / dt;
  }
  
  /**
   * Calculate the total spin of the network
   */
  calculateTotalSpin(graph: SimulationGraph): number {
    let totalSpin = 0;
    
    // Sum up the spins of all edges
    for (const edge of graph.edges) {
      totalSpin += edge.spin;
    }
    
    return totalSpin;
  }
  
  /**
   * Calculate the average degree of the network
   */
  calculateAverageDegree(graph: SimulationGraph): number {
    const nodeCount = graph.getNodeCount();
    
    // If there are no nodes, return 0
    if (nodeCount === 0) {
      return 0;
    }
    
    // Sum up the degrees of all nodes
    let totalDegree = 0;
    for (const node of graph.nodes) {
      totalDegree += graph.getDegree(node.id);
    }
    
    // Return the average
    return totalDegree / nodeCount;
  }
  
  /**
   * Calculate custom geometric properties
   */
  calculateProperty(
    name: string,
    graph: SimulationGraph,
    state: StateVector
  ): number {
    switch (name) {
      case 'volume':
        return this.calculateTotalVolume(state);
      
      case 'volumeEntropy':
        return this.calculateVolumeEntropy(state);
      
      case 'area':
        return this.calculateTotalArea(graph);
      
      case 'dimension':
        return this.calculateEffectiveDimension(graph, state);
      
      case 'totalSpin':
        return this.calculateTotalSpin(graph);
      
      case 'averageDegree':
        return this.calculateAverageDegree(graph);
      
      default:
        throw new Error(`Unknown geometric property: ${name}`);
    }
  }
}
