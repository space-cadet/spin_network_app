/**
 * Statistical analysis tools for simulation results
 * 
 * This file provides utilities for analyzing simulation results
 * and extracting meaningful statistics.
 */

import { SimulationGraph, StateVector, SimulationHistory } from '../core/types';

/**
 * Interface for simulation statistics
 */
export interface SimulationStatistics {
  // Basic statistics
  mean: number;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  
  // Node-specific values
  nodeValues: Record<string, number>;
  
  // Time point
  time: number;
}

/**
 * Class for analyzing simulation results
 */
export class SimulationAnalyzer {
  /**
   * Calculate basic statistics for a state vector
   */
  static calculateStatistics(
    state: StateVector, 
    time: number
  ): SimulationStatistics {
    // Default statistics object with safe values
    const defaultStats: SimulationStatistics = {
      mean: 0,
      variance: 0,
      standardDeviation: 0,
      min: 0,
      max: 0,
      nodeValues: {},
      time: time || 0
    };
    
    // Validate input
    if (!state || typeof state.size !== 'number' || state.size <= 0) {
      console.warn('Invalid state provided to calculateStatistics');
      return defaultStats;
    }
    
    try {
      // Validate nodeIds
      if (!state.nodeIds || !Array.isArray(state.nodeIds) || state.nodeIds.length === 0) {
        console.warn('State has invalid nodeIds array');
        return defaultStats;
      }
      
      const nodeValues: Record<string, number> = {};
      let sum = 0;
      let sumSquared = 0;
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      let validValueCount = 0;
      
      // Calculate basic statistics with robust error handling
      for (let i = 0; i < state.size; i++) {
        const nodeId = state.nodeIds[i];
        
        // Skip if nodeId is invalid
        if (nodeId === undefined || nodeId === null) {
          console.warn(`Invalid nodeId at index ${i}`);
          continue;
        }
        
        let value: number;
        
        try {
          value = state.getValueAtIndex(i);
          
          // Skip non-numeric or infinite values
          if (value === null || value === undefined || !Number.isFinite(value)) {
            console.warn(`Invalid value for node ${nodeId} at index ${i}:`, value);
            continue;
          }
        } catch (error) {
          console.error(`Error getting value for node ${nodeId} at index ${i}:`, error);
          continue;
        }
        
        // Store valid value and update statistics
        nodeValues[nodeId] = value;
        sum += value;
        sumSquared += value * value;
        validValueCount++;
        
        if (value < min) min = value;
        if (value > max) max = value;
      }
      
      // If no valid values were found, return default stats
      if (validValueCount === 0) {
        console.warn('No valid values found in state');
        return defaultStats;
      }
      
      // Calculate statistics using the valid value count
      const mean = sum / validValueCount;
      
      // Handle potential calculation errors
      if (!Number.isFinite(mean)) {
        console.warn('Calculated non-finite mean:', mean);
        return {
          ...defaultStats,
          nodeValues,
          min: Number.isFinite(min) ? min : 0,
          max: Number.isFinite(max) ? max : 0
        };
      }
      
      // Calculate variance with validation
      let variance = 0;
      try {
        variance = (sumSquared / validValueCount) - (mean * mean);
        // Variance should never be negative due to floating point errors
        variance = Math.max(0, variance);
      } catch (error) {
        console.error('Error calculating variance:', error);
      }
      
      // Calculate standard deviation with validation
      let standardDeviation = 0;
      try {
        standardDeviation = Math.sqrt(variance);
      } catch (error) {
        console.error('Error calculating standard deviation:', error);
      }
      
      // Handle edge cases for min/max
      if (min === Number.POSITIVE_INFINITY) min = 0;
      if (max === Number.NEGATIVE_INFINITY) max = 0;
      
      return {
        mean,
        variance,
        standardDeviation,
        min,
        max,
        nodeValues,
        time: time || 0
      };
    } catch (error) {
      console.error('Unhandled error in calculateStatistics:', error);
      return defaultStats;
    }
  }
  
  /**
   * Calculate statistics for a series of states in a simulation history
   */
  static analyzeHistory(
    history: SimulationHistory
  ): SimulationStatistics[] {
    const times = history.getTimes();
    const result: SimulationStatistics[] = [];
    
    for (const time of times) {
      const state = history.getStateAtTime(time);
      if (state) {
        result.push(this.calculateStatistics(state, time));
      }
    }
    
    return result;
  }
  
  /**
   * Calculate the mean square displacement of a state from initial state
   * 
   * This is a measure of how much the state has diffused from the initial position.
   */
  static calculateMeanSquareDisplacement(
    initialState: StateVector,
    currentState: StateVector
  ): number {
    // Validate inputs
    if (!initialState || !currentState || initialState.size !== currentState.size) {
      console.warn('Invalid states provided to calculateMeanSquareDisplacement');
      return 0;
    }
    
    let sumSquaredDisplacement = 0;
    let validNodeCount = 0;
    
    // Calculate the sum of squared differences
    for (let i = 0; i < initialState.size; i++) {
      try {
        const initialValue = initialState.getValueAtIndex(i);
        const currentValue = currentState.getValueAtIndex(i);
        
        // Skip invalid values
        if (!Number.isFinite(initialValue) || !Number.isFinite(currentValue)) {
          continue;
        }
        
        const displacement = currentValue - initialValue;
        sumSquaredDisplacement += displacement * displacement;
        validNodeCount++;
      } catch (error) {
        console.error('Error calculating displacement at index', i, error);
      }
    }
    
    // Avoid division by zero
    if (validNodeCount === 0) {
      return 0;
    }
    
    // Return the mean square displacement
    return sumSquaredDisplacement / validNodeCount;
  }
  
  /**
   * Calculate the spectral dimension of a graph using the heat kernel method
   * 
   * The spectral dimension is a measure of how fast diffusion occurs on the network.
   */
  static calculateSpectralDimension(
    graph: SimulationGraph,
    times: number[],
    initialState: StateVector,
    diffusionFn: (t: number) => StateVector
  ): { times: number[], dimensions: number[] } {
    // Validate inputs
    if (!graph || !Array.isArray(times) || times.length < 2 || !initialState || !diffusionFn) {
      console.warn('Invalid inputs provided to calculateSpectralDimension');
      return { times: [], dimensions: [] };
    }
    
    // Find the node with the highest initial probability
    let maxValueIndex = 0;
    let maxValue = -Infinity;
    
    for (let i = 0; i < initialState.size; i++) {
      const value = initialState.getValueAtIndex(i);
      if (value > maxValue) {
        maxValue = value;
        maxValueIndex = i;
      }
    }
    
    // Calculate return probability for each time
    const returnProbabilities: number[] = [];
    
    for (const t of times) {
      try {
        const state = diffusionFn(t);
        if (!state) {
          returnProbabilities.push(0);
          continue;
        }
        
        const returnProb = state.getValueAtIndex(maxValueIndex);
        returnProbabilities.push(returnProb || 0);
      } catch (error) {
        console.error(`Error calculating state at time ${t}:`, error);
        returnProbabilities.push(0);
      }
    }
    
    // Calculate spectral dimension for each time interval
    const spectralDimensions: number[] = [];
    
    for (let i = 1; i < times.length; i++) {
      try {
        const dt = times[i] - times[i - 1];
        const p1 = returnProbabilities[i - 1];
        const p2 = returnProbabilities[i];
        
        // Skip invalid values
        if (dt <= 0 || p1 <= 0 || p2 <= 0) {
          spectralDimensions.push(0);
          continue;
        }
        
        // d_s = -2 * d(log(p)) / d(log(t))
        const logP1 = Math.log(p1);
        const logP2 = Math.log(p2);
        const logT1 = Math.log(times[i - 1]);
        const logT2 = Math.log(times[i]);
        
        const dLogP = logP2 - logP1;
        const dLogT = logT2 - logT1;
        
        if (dLogT === 0) {
          spectralDimensions.push(0);
          continue;
        }
        
        const slope = dLogP / dLogT;
        const dimension = -2 * slope;
        
        // Validate result
        if (!Number.isFinite(dimension)) {
          spectralDimensions.push(0);
        } else {
          // Dimensions should be reasonable (between 0 and 10)
          spectralDimensions.push(Math.max(0, Math.min(10, dimension)));
        }
      } catch (error) {
        console.error(`Error calculating spectral dimension at interval ${i}:`, error);
        spectralDimensions.push(0);
      }
    }
    
    return {
      times: times.slice(1), // Remove first time to match dimensions array length
      dimensions: spectralDimensions
    };
  }
  
  /**
   * Calculate the return probability for a diffusion process
   * 
   * This is the probability that a particle returns to its starting position after time t.
   */
  static calculateReturnProbability(
    initialState: StateVector,
    currentState: StateVector
  ): number {
    // Validate inputs
    if (!initialState || !currentState || initialState.size !== currentState.size) {
      console.warn('Invalid states provided to calculateReturnProbability');
      return 0;
    }
    
    // Find the node with the highest initial probability
    let maxValueIndex = 0;
    let maxValue = -Infinity;
    
    for (let i = 0; i < initialState.size; i++) {
      const value = initialState.getValueAtIndex(i);
      if (value > maxValue) {
        maxValue = value;
        maxValueIndex = i;
      }
    }
    
    // Return the probability at the initial node
    try {
      const returnProb = currentState.getValueAtIndex(maxValueIndex);
      return returnProb || 0;
    } catch (error) {
      console.error('Error calculating return probability:', error);
      return 0;
    }
  }
  
  /**
   * Calculate the diffusion coefficient from mean square displacement
   * 
   * In normal diffusion, MSD ~ 2*d*D*t where d is dimensionality, D is diffusion coefficient, and t is time.
   */
  static calculateDiffusionCoefficient(
    initialState: StateVector,
    currentState: StateVector,
    time: number,
    dimension: number
  ): number {
    // Validate inputs
    if (!initialState || !currentState || !Number.isFinite(time) || time <= 0 || !Number.isFinite(dimension) || dimension <= 0) {
      console.warn('Invalid inputs provided to calculateDiffusionCoefficient');
      return 0;
    }
    
    // Calculate mean square displacement
    const msd = this.calculateMeanSquareDisplacement(initialState, currentState);
    
    // D = MSD / (2 * d * t)
    return msd / (2 * dimension * time);
  }
}

// Export convenience functions
export const calculateMeanSquareDisplacement = (
  initialState: StateVector,
  currentState: StateVector
): number => {
  return SimulationAnalyzer.calculateMeanSquareDisplacement(initialState, currentState);
};

export const calculateSpectralDimension = (
  graph: SimulationGraph,
  times: number[],
  initialState: StateVector,
  diffusionFn: (t: number) => StateVector
): { times: number[], dimensions: number[] } => {
  return SimulationAnalyzer.calculateSpectralDimension(graph, times, initialState, diffusionFn);
};

export const calculateReturnProbability = (
  initialState: StateVector,
  currentState: StateVector
): number => {
  return SimulationAnalyzer.calculateReturnProbability(initialState, currentState);
};

export const calculateDiffusionCoefficient = (
  initialState: StateVector,
  currentState: StateVector,
  time: number,
  dimension: number
): number => {
  return SimulationAnalyzer.calculateDiffusionCoefficient(initialState, currentState, time, dimension);
};
