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
   * Calculate the rate of change of statistics over time
   */
  static calculateRateOfChange(
    stats: SimulationStatistics[]
  ): Record<string, number[]> {
    const result: Record<string, number[]> = {
      times: [],
      meanRates: [],
      varianceRates: [],
      maxRates: [],
      minRates: []
    };
    
    // Need at least two data points to calculate rates
    if (stats.length < 2) {
      return result;
    }
    
    // Sort by time for correct rate calculation
    const sortedStats = [...stats].sort((a, b) => a.time - b.time);
    
    for (let i = 1; i < sortedStats.length; i++) {
      const prevStats = sortedStats[i - 1];
      const currStats = sortedStats[i];
      const deltaTime = currStats.time - prevStats.time;
      
      // Avoid division by zero
      if (deltaTime === 0) continue;
      
      const meanRate = (currStats.mean - prevStats.mean) / deltaTime;
      const varianceRate = (currStats.variance - prevStats.variance) / deltaTime;
      const maxRate = (currStats.max - prevStats.max) / deltaTime;
      const minRate = (currStats.min - prevStats.min) / deltaTime;
      
      result.times.push(currStats.time);
      result.meanRates.push(meanRate);
      result.varianceRates.push(varianceRate);
      result.maxRates.push(maxRate);
      result.minRates.push(minRate);
    }
    
    return result;
  }
  
  /**
   * Calculate the divergence between two states
   */
  static calculateDivergence(
    state1: StateVector,
    state2: StateVector
  ): number {
    // Check if the states have the same structure
    if (state1.size !== state2.size) {
      throw new Error('Cannot calculate divergence between states of different sizes');
    }
    
    // Kullback-Leibler divergence for probability distributions
    // We need positive values, so we square the state values
    
    let divergence = 0;
    let sum1 = 0;
    let sum2 = 0;
    
    // Calculate the sums for normalization
    for (let i = 0; i < state1.size; i++) {
      const value1 = Math.pow(state1.getValueAtIndex(i), 2);
      const value2 = Math.pow(state2.getValueAtIndex(i), 2);
      
      sum1 += value1;
      sum2 += value2;
    }
    
    // Avoid division by zero
    if (sum1 === 0 || sum2 === 0) {
      return 0;
    }
    
    // Calculate the divergence
    for (let i = 0; i < state1.size; i++) {
      const prob1 = Math.pow(state1.getValueAtIndex(i), 2) / sum1;
      const prob2 = Math.pow(state2.getValueAtIndex(i), 2) / sum2;
      
      // Avoid log(0) and division by zero
      if (prob1 === 0 || prob2 === 0) continue;
      
      divergence += prob1 * Math.log(prob1 / prob2);
    }
    
    return divergence;
  }
  
  /**
   * Calculate the correlation between node values
   */
  static calculateNodeCorrelations(
    state: StateVector,
    graph: SimulationGraph
  ): number[][] {
    const n = state.size;
    const correlations: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    
    // Calculate mean and standard deviation
    let sum = 0;
    const values: number[] = [];
    
    for (let i = 0; i < n; i++) {
      const value = state.getValueAtIndex(i);
      values.push(value);
      sum += value;
    }
    
    const mean = sum / n;
    
    let sumSquaredDiff = 0;
    for (let i = 0; i < n; i++) {
      const diff = values[i] - mean;
      sumSquaredDiff += diff * diff;
    }
    
    const stdDev = Math.sqrt(sumSquaredDiff / n);
    
    // If there's no variation, set all correlations to 1
    if (stdDev === 0) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          correlations[i][j] = 1;
        }
      }
      return correlations;
    }
    
    // Calculate correlations
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          correlations[i][j] = 1; // Self-correlation is always 1
          continue;
        }
        
        const nodeId1 = state.nodeIds[i];
        const nodeId2 = state.nodeIds[j];
        
        // Check if nodes are connected
        const neighbors = graph.getNeighbors(nodeId1);
        const isConnected = neighbors.includes(nodeId2);
        
        // Calculate Pearson correlation
        const diff1 = values[i] - mean;
        const diff2 = values[j] - mean;
        
        // Correlation is stronger for connected nodes
        const distance = isConnected ? 1 : 2;
        const correlation = (diff1 * diff2) / (stdDev * stdDev) * (1 / distance);
        
        correlations[i][j] = correlation;
      }
    }
    
    return correlations;
  }
  
  /**
   * Find important nodes in the network based on state values
   */
  static findImportantNodes(
    state: StateVector,
    graph: SimulationGraph,
    criterion: 'value' | 'degree' | 'centrality',
    count: number = 5
  ): string[] {
    const nodeIds = state.nodeIds;
    
    switch (criterion) {
      case 'value': {
        // Find nodes with the highest state values
        const nodeValues = nodeIds.map((id, index) => ({
          id,
          value: Math.abs(state.getValueAtIndex(index))
        }));
        
        // Sort by value (descending)
        nodeValues.sort((a, b) => b.value - a.value);
        
        // Return the top N node IDs
        return nodeValues.slice(0, count).map(node => node.id);
      }
      
      case 'degree': {
        // Find nodes with the highest degree
        const nodeDegrees = nodeIds.map(id => ({
          id,
          degree: graph.getDegree(id)
        }));
        
        // Sort by degree (descending)
        nodeDegrees.sort((a, b) => b.degree - a.degree);
        
        // Return the top N node IDs
        return nodeDegrees.slice(0, count).map(node => node.id);
      }
      
      case 'centrality': {
        // Calculate a simple centrality measure
        // This is a weighted combination of degree and state value
        const nodeCentrality = nodeIds.map((id, index) => {
          const degree = graph.getDegree(id);
          const value = Math.abs(state.getValueAtIndex(index));
          
          // Normalize degree by maximum possible (n-1)
          const normalizedDegree = degree / (state.size - 1);
          
          // Simple centrality formula
          const centrality = 0.5 * normalizedDegree + 0.5 * value;
          
          return { id, centrality };
        });
        
        // Sort by centrality (descending)
        nodeCentrality.sort((a, b) => b.centrality - a.centrality);
        
        // Return the top N node IDs
        return nodeCentrality.slice(0, count).map(node => node.id);
      }
      
      default:
        throw new Error(`Unknown importance criterion: ${criterion}`);
    }
  }
}
