/**
 * StateVector implementation for the simulation component
 * 
 * Represents the quantum state of the spin network during simulation,
 * mapping state values to network nodes.
 */

import * as math from 'mathjs';
import { StateVector } from './types';

/**
 * Implementation of the StateVector interface
 */
export class SimulationStateVector implements StateVector {
  private values: Float64Array;
  private _nodeIds: string[];

  /**
   * Create a new state vector
   * 
   * @param nodeIds Array of node IDs (order determines vector indices)
   * @param initialValues Initial values for the state vector (optional)
   */
  constructor(nodeIds: string[], initialValues?: number[]) {
    this._nodeIds = nodeIds;
    this.values = new Float64Array(nodeIds.length);
    
    if (initialValues) {
      this.values.set(initialValues);
    }
  }

  /**
   * Get the size of the state vector
   */
  get size(): number {
    return this._nodeIds.length;
  }

  /**
   * Get the node IDs associated with the state vector
   */
  get nodeIds(): string[] {
    return this._nodeIds;
  }

  /**
   * Get the value of the state vector at a specific node ID
   * 
   * @param nodeId Node ID
   * @returns Value at the node ID
   */
  getValue(nodeId: string): number {
    const index = this._nodeIds.indexOf(nodeId);
    return index >= 0 ? this.values[index] : 0;
  }

  /**
   * Set the value of the state vector at a specific node ID
   * 
   * @param nodeId Node ID
   * @param value Value to set
   * @returns Updated state vector
   */
  setValue(nodeId: string, value: number): StateVector {
    const index = this._nodeIds.indexOf(nodeId);
    if (index >= 0) {
      this.values[index] = value;
    }
    return this;
  }

  /**
   * Convert the state vector to a math.js array
   * 
   * @returns Math.js array representation of the state vector
   */
  toMathArray(): math.MathArray {
    return Array.from(this.values);
  }

  /**
   * Convert the state vector to a visualization state
   * 
   * @returns Visualization state as a record of node IDs and values
   */
  toVisualizationState() {
    return this._nodeIds.reduce((acc, nodeId, index) => {
      acc[nodeId] = this.values[index];
      return acc;
    }, {} as Record<string, number>);
  }
}
