/**
 * Weight function implementations for the spin network
 */

import {
  WeightFunction,
  WeightFunctionFactory,
  SimulationEdge,
  StandardWeightFunction
} from '../core/types';

/**
 * Implementation of the weight function factory for spin networks
 */
export class SpinWeightFunctionFactory implements WeightFunctionFactory {
  private weightFunctions: Record<string, WeightFunction> = {};

  constructor() {
    // Register standard weight functions
    this.registerWeightFunction(StandardWeightFunction.SPIN, edge => edge.spin);
    this.registerWeightFunction(StandardWeightFunction.CASIMIR, edge => edge.spin * (edge.spin + 1));
    this.registerWeightFunction(StandardWeightFunction.DIMENSION, edge => 2 * edge.spin + 1);
    this.registerWeightFunction(StandardWeightFunction.AREA, edge => Math.sqrt(edge.spin * (edge.spin + 1)));
  }

  /**
   * Get a weight function by name
   */
  getWeightFunction(type: StandardWeightFunction | string): WeightFunction {
    // Return the requested weight function or default to spin
    return this.weightFunctions[type] || this.weightFunctions[StandardWeightFunction.SPIN];
  }

  /**
   * Register a custom weight function
   */
  registerWeightFunction(name: string, fn: WeightFunction): void {
    this.weightFunctions[name] = fn;
  }
}

/**
 * Create a weight function based on intertwiner values
 */
export function createIntertwinerWeightFunction(exponent: number = 1): WeightFunction {
  return (edge: SimulationEdge) => {
    // This would use the intertwiner values of the connected nodes
    // For simplicity, just use spin value as a fallback
    return Math.pow(edge.spin, exponent);
  };
}
