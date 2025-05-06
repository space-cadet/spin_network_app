/**
 * StateVector implementation for the Spin Network library
 * 
 * Represents the quantum state of the spin network during simulation,
 * mapping state values to network nodes.
 */

import * as math from 'mathjs';
import { StateVector as QuantumStateVector } from '../quantum/types';
import { GraphStateVector } from '../core/types';
import { Complex } from '../quantum/types';
import { createComplex } from '../quantum/complex';

/**
 * Implementation of both quantum StateVector and graph-specific GraphStateVector interfaces.
 * This class represents a quantum state that lives on a graph structure.
 */
export class SimulationStateVector implements QuantumStateVector, GraphStateVector {
  // Implementation of quantum StateVector interface
  readonly dimension: number;
  readonly amplitudes: Complex[];
  readonly basis?: string;

  // Implementation of GraphStateVector interface
  private _values: number[];
  private _nodeIds: string[];
  private _nodeIdToIndex: Map<string, number>;

  constructor(nodeIds: string[], initialValues?: number[]) {
    // Initialize graph state properties
    this._nodeIds = [...nodeIds];
    this._nodeIdToIndex = new Map();
    this._nodeIds.forEach((id, index) => {
      this._nodeIdToIndex.set(id, index);
    });
    this._values = initialValues ? [...initialValues] : Array(nodeIds.length).fill(0);

    // Initialize quantum state properties
    this.dimension = nodeIds.length;
    this.amplitudes = this._values.map(v => createComplex(v, 0));
    this.basis = 'graph';
  }

  // GraphStateVector interface implementation
  get size(): number {
    return this._nodeIds.length;
  }

  get nodeIds(): string[] {
    return [...this._nodeIds];
  }

  getValue(nodeId: string): number {
    const index = this._nodeIdToIndex.get(nodeId);
    if (index === undefined) {
      throw new Error(`Node ID "${nodeId}" not found in state vector`);
    }
    return this._values[index];
  }

  setValue(nodeId: string, value: number): GraphStateVector {
    const index = this._nodeIdToIndex.get(nodeId);
    if (index === undefined) {
      throw new Error(`Node ID "${nodeId}" not found in state vector`);
    }
    const newValues = [...this._values];
    newValues[index] = value;
    return new SimulationStateVector(this._nodeIds, newValues);
  }

  getValueAtIndex(index: number): number {
    if (index < 0 || index >= this._values.length) {
      throw new Error(`Index ${index} out of bounds [0, ${this._values.length - 1}]`);
    }
    return this._values[index];
  }

  setValueAtIndex(index: number, value: number): GraphStateVector {
    if (index < 0 || index >= this._values.length) {
      throw new Error(`Index ${index} out of bounds [0, ${this._values.length - 1}]`);
    }
    const newValues = [...this._values];
    newValues[index] = value;
    return new SimulationStateVector(this._nodeIds, newValues);
  }

  // QuantumStateVector interface implementation
  setState(index: number, value: Complex): void {
    if (index < 0 || index >= this.dimension) {
      throw new Error(`Index ${index} out of bounds [0, ${this.dimension - 1}]`);
    }
    this.amplitudes[index] = { ...value };
    this._values[index] = value.re; // Only real part for graph states
  }

  getState(index: number): Complex {
    if (index < 0 || index >= this.dimension) {
      throw new Error(`Index ${index} out of bounds [0, ${this.dimension - 1}]`);
    }
    return { ...this.amplitudes[index] };
  }

  innerProduct(other: QuantumStateVector): Complex {
    if (this.dimension !== other.dimension) {
      throw new Error('States must have same dimension for inner product');
    }
    let result = createComplex(0, 0);
    for (let i = 0; i < this.dimension; i++) {
      const conj = { re: this.amplitudes[i].re, im: -this.amplitudes[i].im };
      result.re += conj.re * other.amplitudes[i].re - conj.im * other.amplitudes[i].im;
      result.im += conj.re * other.amplitudes[i].im + conj.im * other.amplitudes[i].re;
    }
    return result;
  }

  // Shared methods that satisfy both interfaces
  norm(): number {
    return Math.sqrt(this._values.reduce((sum, v) => sum + v * v, 0));
  }

  normalize(): GraphStateVector & QuantumStateVector {
    const norm = this.norm();
    if (norm === 0) return this.clone();
    return this.multiply(1/norm) as SimulationStateVector;
  }

  tensorProduct(other: QuantumStateVector): QuantumStateVector {
    throw new Error('Tensor product not implemented for graph state vectors');
  }

  // Utility methods
  add(other: GraphStateVector): GraphStateVector {
    if (other.nodeIds.length !== this._nodeIds.length) {
      throw new Error('Cannot add vectors of different sizes');
    }
    const newValues = this._values.map((value, index) => {
      const otherNodeId = this._nodeIds[index];
      return value + other.getValue(otherNodeId);
    });
    return new SimulationStateVector(this._nodeIds, newValues);
  }

  subtract(other: GraphStateVector): GraphStateVector {
    if (other.nodeIds.length !== this._nodeIds.length) {
      throw new Error('Cannot subtract vectors of different sizes');
    }
    const newValues = this._values.map((value, index) => {
      const otherNodeId = this._nodeIds[index];
      return value - other.getValue(otherNodeId);
    });
    return new SimulationStateVector(this._nodeIds, newValues);
  }

  multiply(scalar: number): GraphStateVector & QuantumStateVector {
    const newValues = this._values.map(value => value * scalar);
    return new SimulationStateVector(this._nodeIds, newValues);
  }

  clone(): GraphStateVector & QuantumStateVector {
    return new SimulationStateVector(this._nodeIds, [...this._values]);
  }

  equals(other: GraphStateVector & QuantumStateVector): boolean {
    if (this.dimension !== other.dimension) return false;
    return this._values.every((v, i) => Math.abs(v - other.getValueAtIndex(i)) < 1e-10);
  }

  // Math.js integration
  toMathArray(): math.MathArray {
    return this._values as unknown as math.MathArray;
  }

  fromMathArray(array: math.MathArray, nodeIds: string[]): GraphStateVector {
    let values: number[];
    if (math.isMatrix(array)) {
      values = (math.flatten(array) as math.Matrix).valueOf() as number[];
    } else if (Array.isArray(array)) {
      values = [...array] as number[];
    } else {
      try {
        values = Array.from(array as any);
      } catch (e) {
        throw new Error('Could not convert MathArray to regular array: ' + e);
      }
    }
    if (values.length !== nodeIds.length) {
      throw new Error(`Array length (${values.length}) doesn't match node count (${nodeIds.length})`);
    }
    return new SimulationStateVector(nodeIds, values);
  }

  // Bridge between graph and quantum representations
  toArray(): number[] {
    return [...this._values];
  }

  toComplexArray(): Complex[] {
    return [...this.amplitudes];
  }

  toJSON(): Record<string, any> {
    return {
      nodeIds: this._nodeIds,
      values: this._values
    };
  }

  isZero(tolerance: number = 1e-10): boolean {
    return this._values.every(v => Math.abs(v) < tolerance);
  }

  toString(): string {
    return this._nodeIds.map((id, i) => {
      const value = this._values[i];
      if (Math.abs(value) < 1e-10) return '';
      const sign = i === 0 ? '' : (value >= 0 ? ' + ' : ' - ');
      return `${sign}${Math.abs(value)}|${id}⟩`;
    }).filter(s => s !== '').join('') || '0';
  }

  // Static factory methods
  static createDeltaState(nodeIds: string[], nodeId: string, value: number = 1.0): SimulationStateVector {
    if (!nodeIds.includes(nodeId)) {
      throw new Error(`Node ID "${nodeId}" not found in provided node IDs`);
    }
    const values = Array(nodeIds.length).fill(0);
    values[nodeIds.indexOf(nodeId)] = value;
    return new SimulationStateVector(nodeIds, values);
  }

  static createUniformState(nodeIds: string[], value: number = 1.0): SimulationStateVector {
    const values = Array(nodeIds.length).fill(value);
    return new SimulationStateVector(nodeIds, values);
  }

  static createGaussianState(
    nodeIds: string[],
    centerNodeId: string,
    sigma: number,
    nodePositions: Map<string, {x: number, y: number, z?: number}>
  ): SimulationStateVector {
    if (!nodeIds.includes(centerNodeId)) {
      throw new Error(`Center node ID "${centerNodeId}" not found in provided node IDs`);
    }
    const centerPos = nodePositions.get(centerNodeId);
    if (!centerPos) {
      throw new Error(`Position for center node "${centerNodeId}" not found`);
    }
    const values = nodeIds.map(id => {
      const pos = nodePositions.get(id);
      if (!pos) {
        throw new Error(`Position for node "${id}" not found`);
      }
      const dx = pos.x - centerPos.x;
      const dy = pos.y - centerPos.y;
      const dz = (pos.z !== undefined && centerPos.z !== undefined) ? pos.z - centerPos.z : 0;
      const distSquared = dx * dx + dy * dy + dz * dz;
      return Math.exp(-distSquared / (2 * sigma * sigma));
    });
    return new SimulationStateVector(nodeIds, values).normalize() as SimulationStateVector;
  }
}
