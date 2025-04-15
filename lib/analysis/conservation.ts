/**
 * Conservation law verification for spin network diffusion
 * 
 * This file implements functions to check conservation laws
 * during the simulation to ensure physical validity.
 */

import { StateVector } from '../core/types';

/**
 * Interface for conservation law checker
 */
export interface ConservationLawChecker {
  /**
   * Check if a conservation law is satisfied
   * 
   * @param initialState The initial state
   * @param currentState The current state
   * @returns True if the conservation law is satisfied within tolerance
   */
  checkConservation(
    initialState: StateVector,
    currentState: StateVector
  ): boolean;
  
  /**
   * Get the deviation from the conservation law
   * 
   * @param initialState The initial state
   * @param currentState The current state
   * @returns The deviation from the conservation law
   */
  getDeviation(
    initialState: StateVector,
    currentState: StateVector
  ): number;
  
  /**
   * Get the name of the conservation law
   */
  getName(): string;
  
  /**
   * Get the description of the conservation law
   */
  getDescription(): string;
}

/**
 * Check conservation of probability (L2 norm)
 */
export class ProbabilityConservation implements ConservationLawChecker {
  private tolerance: number;
  
  constructor(tolerance: number = 1e-6) {
    this.tolerance = tolerance;
  }
  
  /**
   * Calculate the L2 norm of a state vector
   */
  private calculateL2Norm(state: StateVector): number {
    let normSquared = 0;
    
    for (let i = 0; i < state.size; i++) {
      const value = state.getValueAtIndex(i);
      normSquared += value * value;
    }
    
    return Math.sqrt(normSquared);
  }
  
  /**
   * Check if probability is conserved (L2 norm remains constant)
   */
  checkConservation(
    initialState: StateVector,
    currentState: StateVector
  ): boolean {
    const initialNorm = this.calculateL2Norm(initialState);
    const currentNorm = this.calculateL2Norm(currentState);
    
    // If initial norm is zero, current should also be zero
    if (initialNorm < this.tolerance) {
      return currentNorm < this.tolerance;
    }
    
    // Calculate relative deviation
    const relativeDeviation = Math.abs(currentNorm - initialNorm) / initialNorm;
    
    return relativeDeviation <= this.tolerance;
  }
  
  /**
   * Get the deviation from probability conservation
   */
  getDeviation(
    initialState: StateVector,
    currentState: StateVector
  ): number {
    const initialNorm = this.calculateL2Norm(initialState);
    const currentNorm = this.calculateL2Norm(currentState);
    
    // If initial norm is zero, return absolute current norm
    if (initialNorm < this.tolerance) {
      return currentNorm;
    }
    
    // Calculate relative deviation
    return Math.abs(currentNorm - initialNorm) / initialNorm;
  }
  
  /**
   * Get the name of the conservation law
   */
  getName(): string {
    return 'Probability Conservation';
  }
  
  /**
   * Get the description of the conservation law
   */
  getDescription(): string {
    return 'The L2 norm of the state vector should remain constant during diffusion.';
  }
}

/**
 * Check conservation of total volume/occupancy
 */
export class TotalOccupancyConservation implements ConservationLawChecker {
  private tolerance: number;
  
  constructor(tolerance: number = 1e-6) {
    this.tolerance = tolerance;
  }
  
  /**
   * Calculate the total occupancy (sum of values)
   */
  private calculateTotalOccupancy(state: StateVector): number {
    let total = 0;
    
    for (let i = 0; i < state.size; i++) {
      const value = state.getValueAtIndex(i);
      total += value;
    }
    
    return total;
  }
  
  /**
   * Check if total occupancy is conserved
   */
  checkConservation(
    initialState: StateVector,
    currentState: StateVector
  ): boolean {
    const initialTotal = this.calculateTotalOccupancy(initialState);
    const currentTotal = this.calculateTotalOccupancy(currentState);
    
    // If initial total is zero, current should also be zero
    if (Math.abs(initialTotal) < this.tolerance) {
      return Math.abs(currentTotal) < this.tolerance;
    }
    
    // Calculate relative deviation
    const relativeDeviation = Math.abs(currentTotal - initialTotal) / Math.abs(initialTotal);
    
    return relativeDeviation <= this.tolerance;
  }
  
  /**
   * Get the deviation from total occupancy conservation
   */
  getDeviation(
    initialState: StateVector,
    currentState: StateVector
  ): number {
    const initialTotal = this.calculateTotalOccupancy(initialState);
    const currentTotal = this.calculateTotalOccupancy(currentState);
    
    // If initial total is zero, return absolute current total
    if (Math.abs(initialTotal) < this.tolerance) {
      return Math.abs(currentTotal);
    }
    
    // Calculate relative deviation
    return Math.abs(currentTotal - initialTotal) / Math.abs(initialTotal);
  }
  
  /**
   * Get the name of the conservation law
   */
  getName(): string {
    return 'Total Occupancy Conservation';
  }
  
  /**
   * Get the description of the conservation law
   */
  getDescription(): string {
    return 'The total occupancy (sum of state values) should remain constant during diffusion.';
  }
}

/**
 * Check conservation of positive occupancy
 */
export class PositivityConservation implements ConservationLawChecker {
  private tolerance: number;
  
  constructor(tolerance: number = 1e-6) {
    this.tolerance = tolerance;
  }
  
  /**
   * Check if all values are positive (within tolerance)
   */
  private checkAllPositive(state: StateVector): boolean {
    for (let i = 0; i < state.size; i++) {
      const value = state.getValueAtIndex(i);
      if (value < -this.tolerance) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Find the minimum value in the state
   */
  private findMinimumValue(state: StateVector): number {
    let minValue = Infinity;
    
    for (let i = 0; i < state.size; i++) {
      const value = state.getValueAtIndex(i);
      if (value < minValue) {
        minValue = value;
      }
    }
    
    return minValue;
  }
  
  /**
   * Check if positivity is conserved
   */
  checkConservation(
    initialState: StateVector,
    currentState: StateVector
  ): boolean {
    // If initial state is all positive, current state should also be positive
    const initialPositive = this.checkAllPositive(initialState);
    
    if (initialPositive) {
      return this.checkAllPositive(currentState);
    }
    
    // If initial state has negative values, we don't enforce positivity
    return true;
  }
  
  /**
   * Get the deviation from positivity conservation
   */
  getDeviation(
    initialState: StateVector,
    currentState: StateVector
  ): number {
    // If initial state is all positive, measure negative deviation
    const initialPositive = this.checkAllPositive(initialState);
    
    if (initialPositive) {
      const minValue = this.findMinimumValue(currentState);
      return Math.max(0, -minValue);
    }
    
    // If initial state has negative values, return 0 deviation
    return 0;
  }
  
  /**
   * Get the name of the conservation law
   */
  getName(): string {
    return 'Positivity Conservation';
  }
  
  /**
   * Get the description of the conservation law
   */
  getDescription(): string {
    return 'If the initial state has only positive values, all values should remain positive during diffusion.';
  }
}

/**
 * Factory for creating conservation checkers
 */
export class ConservationCheckerFactory {
  /**
   * Create a set of standard conservation checkers
   */
  static createStandardCheckers(tolerance: number = 1e-6): ConservationLawChecker[] {
    return [
      new ProbabilityConservation(tolerance),
      new TotalOccupancyConservation(tolerance),
      new PositivityConservation(tolerance)
    ];
  }
  
  /**
   * Create a specific conservation checker by name
   */
  static createChecker(
    name: 'probability' | 'occupancy' | 'positivity', 
    tolerance: number = 1e-6
  ): ConservationLawChecker {
    switch (name) {
      case 'probability':
        return new ProbabilityConservation(tolerance);
      case 'occupancy':
        return new TotalOccupancyConservation(tolerance);
      case 'positivity':
        return new PositivityConservation(tolerance);
      default:
        throw new Error(`Unknown conservation law: ${name}`);
    }
  }
}

// Convenience exports for easier use
export const checkMassConservation = (
  initialState: StateVector, 
  currentState: StateVector, 
  tolerance: number = 1e-6
): boolean => {
  return new TotalOccupancyConservation(tolerance).checkConservation(initialState, currentState);
};

export const checkEnergyConservation = (
  initialState: StateVector, 
  currentState: StateVector, 
  tolerance: number = 1e-6
): boolean => {
  return new ProbabilityConservation(tolerance).checkConservation(initialState, currentState);
};
