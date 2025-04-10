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
    let totalVolume = 0;
    
    // Sum up the volumes associated with each node
    for (let i = 0; i < state.size; i++) {
      const stateValue = state.getValueAtIndex(i);
      
      // The volume contribution of a node is proportional to |ψ|^2
      // This is a simplified model; in full LQG, volume depends on
      // intertwiner quantum numbers in a more complex way
      const volumeContribution = Math.abs(stateValue) ** 2;
      totalVolume += volumeContribution;
    }
    
    return totalVolume;
  }
  
  /**
   * Calculate volume entropy as a measure of volume distribution
   * 
   * This is defined as -Σ (v_i/V_tot) * ln(v_i/V_tot) where v_i is the
   * volume at node i and V_tot is the total volume.
   */
  calculateVolumeEntropy(state: StateVector): number {
    const totalVolume = this.calculateTotalVolume(state);
    
    // If total volume is 0, return 0 to avoid division by zero
    if (totalVolume === 0) {
      return 0;
    }
    
    let entropy = 0;
    
    // Calculate entropy based on volume distribution
    for (let i = 0; i < state.size; i++) {
      const stateValue = state.getValueAtIndex(i);
      const volumeContribution = Math.abs(stateValue) ** 2;
      
      // Skip nodes with zero volume
      if (volumeContribution === 0) {
        continue;
      }
      
      // Calculate the volume fraction
      const volumeFraction = volumeContribution / totalVolume;
      
      // Add to entropy: -p * ln(p)
      entropy -= volumeFraction * Math.log(volumeFraction);
    }
    
    return entropy;
  }
  
  /**
   * Calculate the total area based on edge spins
   * 
   * In spin networks, the area of a surface crossed by an edge
   * is proportional to sqrt(j(j+1)) where j is the spin.
   */
  calculateTotalArea(graph: SimulationGraph): number {
    let totalArea = 0;
    
    // Sum up the areas associated with each edge
    for (const edge of graph.edges) {
      // The area contribution of an edge is proportional to sqrt(j(j+1))
      const areaContribution = Math.sqrt(edge.spin * (edge.spin + 1));
      totalArea += areaContribution;
    }
    
    return totalArea;
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
    // Create the Laplacian matrix
    const laplacian = graph.toLaplacianMatrix();
    
    // Calculate eigenvalues
    const { values } = MathAdapter.eigenDecomposition(laplacian);
    
    // Sort eigenvalues (excluding the zero eigenvalue)
    const sortedEigenvalues = values
      .filter(v => Math.abs(v) > 1e-10) // Remove zero eigenvalues
      .sort((a, b) => a - b);
    
    // If we don't have enough eigenvalues, return 0
    if (sortedEigenvalues.length < 2) {
      return 0;
    }
    
    // Calculate the spectral dimension using the smallest non-zero eigenvalues
    // Based on the asymptotic formula: d_s = -2 * d(log N(λ)) / d(log λ)
    // where N(λ) is the cumulative eigenvalue distribution
    
    // Take a sample of the smallest eigenvalues
    const sampleSize = Math.min(10, Math.floor(sortedEigenvalues.length / 3));
    const logEigenvalues = sortedEigenvalues
      .slice(0, sampleSize)
      .map(v => Math.log(v));
    
    // Generate log(N(λ)) data points
    const logCumulative = [];
    for (let i = 0; i < sampleSize; i++) {
      // N(λ) = (i+1) / total
      logCumulative.push(Math.log((i + 1) / sortedEigenvalues.length));
    }
    
    // Calculate the slope using linear regression
    let sumXY = 0;
    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    
    for (let i = 0; i < sampleSize; i++) {
      sumXY += logEigenvalues[i] * logCumulative[i];
      sumX += logEigenvalues[i];
      sumY += logCumulative[i];
      sumXX += logEigenvalues[i] * logEigenvalues[i];
    }
    
    const slope = (sampleSize * sumXY - sumX * sumY) / 
                  (sampleSize * sumXX - sumX * sumX);
    
    // d_s = -2 * slope
    return -2 * slope;
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
