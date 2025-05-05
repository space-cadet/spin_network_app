/**
 * StateVector implementation for the Spin Network library
 * 
 * Represents the quantum state of the spin network during simulation,
 * mapping state values to network nodes.
 */

import * as math from 'mathjs';
import { StateVector } from '../core/types';

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
    if (!nodeIds.includes(nodeId)) {
      throw new Error(`Node ID "${nodeId}" not found in provided node IDs`);
    }
    
    const values = Array(nodeIds.length).fill(0);
    const index = nodeIds.indexOf(nodeId);
    values[index] = value;
    
    return new SimulationStateVector(nodeIds, values);
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
  ): StateVector {
    if (!nodeIds.includes(centerNodeId)) {
      throw new Error(`Center node ID "${centerNodeId}" not found in provided node IDs`);
    }
    
    // Get the position of the center node
    const centerPos = nodePositions.get(centerNodeId);
    if (!centerPos) {
      throw new Error(`Position for center node "${centerNodeId}" not found`);
    }
    
    // Calculate distances and Gaussian values
    const values = nodeIds.map(id => {
      const pos = nodePositions.get(id);
      if (!pos) {
        throw new Error(`Position for node "${id}" not found`);
      }
      
      // Calculate Euclidean distance
      const dx = pos.x - centerPos.x;
      const dy = pos.y - centerPos.y;
      const dz = (pos.z !== undefined && centerPos.z !== undefined) ? pos.z - centerPos.z : 0;
      
      const distSquared = dx * dx + dy * dy + dz * dz;
      
      // Gaussian function: exp(-d²/2σ²)
      return Math.exp(-distSquared / (2 * sigma * sigma));
    });
    
    // Create and normalize the state vector
    const stateVector = new SimulationStateVector(nodeIds, values);
    return stateVector.normalize();
  }
  
  /**
   * Create a state vector from math.js array
   */
  static fromMathArray(array: math.MathArray, nodeIds: string[]): StateVector {
    let values: number[];
    
    if (math.isMatrix(array)) {
      // Handle math.js matrix
      values = (math.flatten(array) as math.Matrix).valueOf() as number[];
    } else if (Array.isArray(array)) {
      // Handle regular array
      values = [...array] as number[];
    } else {
      // Try to convert other formats
      try {
        values = Array.from(array as any);
      } catch (e) {
        throw new Error('Could not convert MathArray to regular array: ' + e);
      }
    }
    
    if (values.length !== nodeIds.length) {
      throw new Error(`Array size (${values.length}) does not match number of node IDs (${nodeIds.length})`);
    }
    
    return new SimulationStateVector(nodeIds, values);
  }

  /**
   * Instance method to create from math array (required by StateVector interface)
   */
  fromMathArray(array: math.MathArray, nodeIds: string[]): StateVector {
    return SimulationStateVector.fromMathArray(array, nodeIds);
  }

  // StateVector interface implementation

  /**
   * Get the size of the state vector
   */
  get size(): number {
    return this._values.length;
  }
  
  /**
   * Get the node IDs in the state vector
   */
  get nodeIds(): string[] {
    return [...this._nodeIds]; // Return a copy to maintain immutability
  }
  
  /**
   * Get the value for a specific node
   */
  getValue(nodeId: string): number {
    const index = this._nodeIdToIndex.get(nodeId);
    if (index === undefined) {
      throw new Error(`Node ID "${nodeId}" not found in state vector`);
    }
    return this._values[index];
  }
  
  /**
   * Set the value for a specific node (returns a new vector)
   */
  setValue(nodeId: string, value: number): StateVector {
    const index = this._nodeIdToIndex.get(nodeId);
    if (index === undefined) {
      throw new Error(`Node ID "${nodeId}" not found in state vector`);
    }
    
    // Create a new vector with the updated value
    const newValues = [...this._values];
    newValues[index] = value;
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  /**
   * Get the value at a specific index
   */
  getValueAtIndex(index: number): number {
    if (index < 0 || index >= this._values.length) {
      throw new Error(`Index ${index} out of bounds [0, ${this._values.length - 1}]`);
    }
    return this._values[index];
  }
  
  /**
   * Set the value at a specific index (returns a new vector)
   */
  setValueAtIndex(index: number, value: number): StateVector {
    if (index < 0 || index >= this._values.length) {
      throw new Error(`Index ${index} out of bounds [0, ${this._values.length - 1}]`);
    }
    
    // Create a new vector with the updated value
    const newValues = [...this._values];
    newValues[index] = value;
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  /**
   * Add another state vector to this one (returns a new vector)
   */
  add(other: StateVector): StateVector {
    // Verify that vectors have the same node IDs
    if (other.nodeIds.length !== this._nodeIds.length) {
      throw new Error('Cannot add vectors of different sizes');
    }
    
    // Create a new values array with added values
    const newValues = this._values.map((value, index) => {
      // We need to find the corresponding value in the other vector
      const otherNodeId = this._nodeIds[index];
      return value + other.getValue(otherNodeId);
    });
    
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  /**
   * Subtract another state vector from this one (returns a new vector)
   */
  subtract(other: StateVector): StateVector {
    // Verify that vectors have the same node IDs
    if (other.nodeIds.length !== this._nodeIds.length) {
      throw new Error('Cannot subtract vectors of different sizes');
    }
    
    // Create a new values array with subtracted values
    const newValues = this._values.map((value, index) => {
      // We need to find the corresponding value in the other vector
      const otherNodeId = this._nodeIds[index];
      return value - other.getValue(otherNodeId);
    });
    
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  /**
   * Multiply by a scalar (returns a new vector)
   */
  multiply(scalar: number): StateVector {
    const newValues = this._values.map(value => value * scalar);
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  /**
   * Convert to a math.js array
   */
  toMathArray(): math.MathArray {
    return math.matrix(this._values).valueOf() as math.MathArray;
  }
  
  /**
   * Normalize the state vector (returns a new vector)
   */
  normalize(): StateVector {
    const normSquared = this._values.reduce((sum, value) => sum + value * value, 0);
    const norm = Math.sqrt(normSquared);
    
    // Avoid division by zero
    if (norm === 0) {
      return this.clone();
    }
    
    const newValues = this._values.map(value => value / norm);
    return new SimulationStateVector(this._nodeIds, newValues);
  }
  
  /**
   * Create a copy of the state vector
   */
  clone(): StateVector {
    return new SimulationStateVector(this._nodeIds, [...this._values]);
  }
  
  /**
   * Check if this vector equals another
   */
  equals(other: StateVector): boolean {
    if (this._nodeIds.length !== other.nodeIds.length) {
      return false;
    }
    
    // Check if all values are the same
    for (let i = 0; i < this._nodeIds.length; i++) {
      const nodeId = this._nodeIds[i];
      if (Math.abs(this.getValue(nodeId) - other.getValue(nodeId)) > 1e-10) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Serialize to JSON
   */
  toJSON(): Record<string, any> {
    return {
      nodeIds: this._nodeIds,
      values: this._values
    };
  }

  /**
   * Convert to simple array of values
   * @returns Array of state vector values
   */
  toArray(): number[] {
    return [...this._values];
  }
}
