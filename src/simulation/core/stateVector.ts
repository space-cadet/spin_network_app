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
  private _values: number[];
  private _nodeIds: string[];
  private _nodeIdToIndex: Map<string, number>;

  /**
   * Create a new state vector
   * 
   * @param nodeIds Array of node IDs (order determines vector indices)
   * @param initialValues Initial values for the state vector (optional)
   */
  constructor(nodeIds: string[], initialValues?: number[]) {
    this._nodeIds = [...nodeIds]; // Make a copy to prevent external modification
    this._nodeIdToIndex = new Map();
    
    // Build node ID to index mapping
    this._nodeIds.forEach((id, index) => {
      this._nodeIdToIndex.set(id, index);
    });
    
    // Initialize values
    if (initialValues && initialValues.length === nodeIds.length) {
      this._values = [...initialValues];
    } else {
      this._values = Array(nodeIds.length).fill(0);
    }
  }

  /**
   * Create a state vector with a single value at specified node (delta function)
   */
  static createDeltaState(nodeIds: string[], nodeId: string, value: number = 1.0): SimulationStateVector {
    const state = new SimulationStateVector(nodeIds);
    const index = state._nodeIdToIndex.get(nodeId);
    
    if (index !== undefined) {
      state._values[index] = value;
    } else {
      throw new Error(`Node ID ${nodeId} not found in the state vector`);
    }
    
    return state;
  }
  
  /**
   * Create a state vector with uniform values across all nodes
   */
  static createUniformState(nodeIds: string[], value: number = 1.0): SimulationStateVector {
    const values = Array(nodeIds.length).fill(value);
    return new SimulationStateVector(nodeIds, values);
  }
  
  /**
   * Create a state vector with Gaussian distribution centered at a specific node
   */
  static createGaussianState(
    nodeIds: string[], 
    centerNodeId: string, 
    sigma: number,
    nodePositions: Map<string, {x: number, y: number, z?: number}>
  ): SimulationStateVector {
    const state = new SimulationStateVector(nodeIds);
    const centerIndex = state._nodeIdToIndex.get(centerNodeId);
    
    if (centerIndex === undefined) {
      throw new Error(`Center node ID ${centerNodeId} not found in the state vector`);
    }
    
    // Get center position
    const centerPos = nodePositions.get(centerNodeId);
    if (!centerPos) {
      throw new Error(`Position for center node ID ${centerNodeId} not available`);
    }
    
    // Calculate values based on distance from center
    state._nodeIds.forEach((id, index) => {
      const pos = nodePositions.get(id);
      if (!pos) return; // Skip if position not available
      
      // Calculate squared distance (2D or 3D)
      let distanceSquared = Math.pow(pos.x - centerPos.x, 2) + Math.pow(pos.y - centerPos.y, 2);
      if (pos.z !== undefined && centerPos.z !== undefined) {
        distanceSquared += Math.pow(pos.z - centerPos.z, 2);
      }
      
      // Gaussian function: exp(-d²/(2σ²))
      const value = Math.exp(-distanceSquared / (2 * sigma * sigma));
      state._values[index] = value;
    });
    
    // Normalize the state
    return state.normalize();
  }
  
  /**
   * Create a state vector from math.js array
   */
  static fromMathArray(array: math.MathArray, nodeIds: string[]): StateVector {
    // Convert math.js array to regular array
    const values: number[] = Array.isArray(array) 
      ? array as number[]
      : (math.flatten(array) as math.MathArray).valueOf() as number[];
    
    if (values.length !== nodeIds.length) {
      throw new Error(`Array length (${values.length}) doesn't match node count (${nodeIds.length})`);
    }
    
    return new SimulationStateVector(nodeIds, values);
  }

  // Implement StateVector interface
  
  get size(): number {
    return this._nodeIds.length;
  }
  
  get nodeIds(): string[] {
    return [...this._nodeIds]; // Return a copy to prevent external modification
  }
  
  getValue(nodeId: string): number {
    const index = this._nodeIdToIndex.get(nodeId);
    if (index === undefined) {
      throw new Error(`Node ID ${nodeId} not found in the state vector`);
    }
    return this._values[index];
  }
  
  setValue(nodeId: string, value: number): StateVector {
    const index = this._nodeIdToIndex.get(nodeId);
    if (index === undefined) {
      throw new Error(`Node ID ${nodeId} not found in the state vector`);
    }
    
    // Create a new state vector with the updated value
    const newValues = [...this._values];
    newValues[index] = value;
    
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  getValueAtIndex(index: number): number {
    if (index < 0 || index >= this._values.length) {
      throw new Error(`Index ${index} out of bounds for state vector of size ${this._values.length}`);
    }
    return this._values[index];
  }
  
  setValueAtIndex(index: number, value: number): StateVector {
    if (index < 0 || index >= this._values.length) {
      throw new Error(`Index ${index} out of bounds for state vector of size ${this._values.length}`);
    }
    
    // Create a new state vector with the updated value
    const newValues = [...this._values];
    newValues[index] = value;
    
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  add(other: StateVector): StateVector {
    if (other.size !== this.size) {
      throw new Error(`Cannot add state vectors of different sizes: ${this.size} vs ${other.size}`);
    }
    
    // Check if node IDs match
    for (let i = 0; i < this._nodeIds.length; i++) {
      if (this._nodeIds[i] !== other.nodeIds[i]) {
        throw new Error(`Node ID mismatch at index ${i}: ${this._nodeIds[i]} vs ${other.nodeIds[i]}`);
      }
    }
    
    // Add values
    const newValues = this._values.map((value, index) => value + other.getValueAtIndex(index));
    
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  subtract(other: StateVector): StateVector {
    if (other.size !== this.size) {
      throw new Error(`Cannot subtract state vectors of different sizes: ${this.size} vs ${other.size}`);
    }
    
    // Check if node IDs match
    for (let i = 0; i < this._nodeIds.length; i++) {
      if (this._nodeIds[i] !== other.nodeIds[i]) {
        throw new Error(`Node ID mismatch at index ${i}: ${this._nodeIds[i]} vs ${other.nodeIds[i]}`);
      }
    }
    
    // Subtract values
    const newValues = this._values.map((value, index) => value - other.getValueAtIndex(index));
    
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  multiply(scalar: number): StateVector {
    const newValues = this._values.map(value => value * scalar);
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  toMathArray(): math.MathArray {
    return math.matrix(this._values) as math.MathArray;
  }
  
  normalize(): StateVector {
    // Calculate L2 norm (Euclidean length)
    const norm = Math.sqrt(this._values.reduce((sum, value) => sum + value * value, 0));
    
    // Handle zero vector
    if (norm === 0) {
      return this.clone();
    }
    
    // Divide by norm
    return this.multiply(1 / norm);
  }
  
  clone(): StateVector {
    return new SimulationStateVector(this._nodeIds, [...this._values]);
  }
  
  equals(other: StateVector): boolean {
    if (this.size !== other.size) {
      return false;
    }
    
    // Check if node IDs match
    for (let i = 0; i < this._nodeIds.length; i++) {
      if (this._nodeIds[i] !== other.nodeIds[i]) {
        return false;
      }
    }
    
    // Check if values match (with floating point tolerance)
    const EPSILON = 1e-10;
    for (let i = 0; i < this._values.length; i++) {
      if (Math.abs(this._values[i] - other.getValueAtIndex(i)) > EPSILON) {
        return false;
      }
    }
    
    return true;
  }
  
  toVisualizationState(): Record<string, number> {
    const result: Record<string, number> = {};
    
    this._nodeIds.forEach((id, index) => {
      result[id] = this._values[index];
    });
    
    return result;
  }
}
