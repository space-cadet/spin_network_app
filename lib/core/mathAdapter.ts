/**
 * Adapter for math.js integration
 * 
 * This file provides adapters between simulation data structures
 * and math.js library components for matrix operations and numerical methods.
 */

import * as math from 'mathjs';
import { SimulationGraph, SimulationEdge, WeightFunction } from './types';
import { StateVector } from '../quantum/types';
import { SimulationStateVector } from '../graph/graphState';

/**
 * Math.js adapter for simulation operations
 */
export class MathAdapter {
  /**
   * Create an adjacency matrix from a simulation graph
   */
  static createAdjacencyMatrix(graph: SimulationGraph): math.Matrix {
    const nodes = graph.nodes;
    const n = nodes.length;
    const nodeIdToIndex = new Map<string, number>();
    
    // Create mapping from node IDs to matrix indices
    nodes.forEach((node, index) => {
      nodeIdToIndex.set(node.id, index);
    });
    
    // Create zero matrix
    const matrix = math.zeros(n, n) as math.Matrix;
    
    // Fill matrix with edge connections
    for (const edge of graph.edges) {
      const sourceIndex = nodeIdToIndex.get(edge.sourceId);
      const targetIndex = nodeIdToIndex.get(edge.targetId);
      
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        // Set 1 to indicate connection
        matrix.set([sourceIndex, targetIndex], 1);
        matrix.set([targetIndex, sourceIndex], 1);
      }
    }
    
    return matrix;
  }
  
  /**
   * Create a Laplacian matrix from a simulation graph
   */
  static createLaplacianMatrix(
    graph: SimulationGraph, 
    weightFunction?: WeightFunction
  ): math.Matrix {
    const nodes = graph.nodes;
    const n = nodes.length;
    const nodeIdToIndex = new Map<string, number>();
    
    // Create mapping from node IDs to matrix indices
    nodes.forEach((node, index) => {
      nodeIdToIndex.set(node.id, index);
    });
    
    // Create zero matrix
    const matrix = math.zeros(n, n) as math.Matrix;
    
    // Default weight function is the spin value
    const weightFn = weightFunction || ((edge: SimulationEdge) => edge.spin);
    
    // Fill matrix with weighted edges
    for (const edge of graph.edges) {
      const sourceIndex = nodeIdToIndex.get(edge.sourceId);
      const targetIndex = nodeIdToIndex.get(edge.targetId);
      
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        const weight = weightFn(edge);
        
        // Update off-diagonal elements (negative)
        const currentSourceTarget = matrix.get([sourceIndex, targetIndex]) as number;
        const currentTargetSource = matrix.get([targetIndex, sourceIndex]) as number;
        
        matrix.set([sourceIndex, targetIndex], currentSourceTarget - weight);
        matrix.set([targetIndex, sourceIndex], currentTargetSource - weight);
        
        // Update diagonal elements (sum of connected weights)
        const currentSourceSource = matrix.get([sourceIndex, sourceIndex]) as number;
        const currentTargetTarget = matrix.get([targetIndex, targetIndex]) as number;
        
        matrix.set([sourceIndex, sourceIndex], currentSourceSource + weight);
        matrix.set([targetIndex, targetIndex], currentTargetTarget + weight);
      }
    }
    
    return matrix;
  }
  
  /**
   * Calculate matrix exponential: e^(tA)
   * Used for time evolution in diffusion equations
   */
  static matrixExponential(matrix: math.Matrix, t: number): math.Matrix {
    // Scale the matrix by time parameter
    const scaledMatrix = math.multiply(matrix, t) as math.Matrix;
    
    // Calculate the matrix exponential
    return math.expm(scaledMatrix) as math.Matrix;
  }
  
  /**
   * Calculate eigenvalues and eigenvectors of a matrix
   */
  static eigenDecomposition(matrix: math.Matrix): {
    values: number[];
    vectors: math.Matrix;
  } {
    const eigs = math.eigs(matrix);
    
    // Extract the eigenvalues and ensure they are numbers
    let values: number[];
    if (math.isMatrix(eigs.values)) {
      values = (math.flatten(eigs.values).valueOf() as (number | math.BigNumber)[])
        .map(v => typeof v === 'number' ? v : v.toNumber());
    } else if (Array.isArray(eigs.values)) {
      values = (eigs.values as (number | math.BigNumber)[])
        .map(v => typeof v === 'number' ? v : v.toNumber());
    } else {
      const v = eigs.values as (number | math.BigNumber);
      values = [typeof v === 'number' ? v : v.toNumber()];
    }
    
    // Create a matrix for the eigenvectors
    const size = matrix.size();
    const eigenvectors = math.zeros(size[0], size[1]) as math.Matrix;
    
    // Handle the case where eigenvectors are provided
    if (eigs.eigenvectors && Array.isArray(eigs.eigenvectors)) {
      // Convert eigenvectors to matrix format
      eigs.eigenvectors.forEach((item, index) => {
        const vector = Array.isArray(item.vector) ? item.vector : [item.vector];
        for (let i = 0; i < vector.length; i++) {
          const value = vector[i];
          eigenvectors.set([i, index], 
            typeof value === 'number' ? value : 
            math.isBigNumber(value) ? value.toNumber() :
            Array.isArray(value) ? value[0] :
            math.isComplex(value) ? value.re :
            math.isFraction(value) ? value.n / value.d :
            0 // fallback for unknown types
          );
        }
      });
    }

    return {
      values,
      vectors: eigenvectors
    };
  }

  /**
   * Multiply two matrices or a matrix and a scalar
   * @param x First matrix/array
   * @param y Second matrix/array or scalar
   * @returns Result of multiplication
   */
  static multiply(x: math.Matrix | math.MathArray, y: math.Matrix | math.MathArray | number): math.MathArray {
    // Cast inputs to any to bypass type restriction for BigNumber, Fraction, Complex, etc.
    const result = math.multiply(x as any, y as any);
    
    if (typeof result === 'number') {
      return [result] as unknown as math.MathArray;
    }
    
    // Handle different return types from math.multiply
    if (math.isMatrix(result)) {
      // If it's a math.js Matrix, use toArray()
      return result.toArray() as unknown as math.MathArray;
    } else if (Array.isArray(result)) {
      // If it's already an array, return it directly
      return result as unknown as math.MathArray;
    } else {
      // For any other type, try to convert it safely
      try {
        // Try to get as a flat array - this works for most math.js structures
        return math.flatten(result).valueOf() as unknown as math.MathArray;
      } catch (e) {
        // Fallback: try to convert to a regular array
        try {
          return Array.from(result as any) as unknown as math.MathArray;
        } catch (e2) {
          console.error("Failed to convert multiplication result to MathArray:", e2);
          // Last resort: return an empty array
          return [] as unknown as math.MathArray;
        }
      }
    }
  }

  /**
   * Add two matrices
   * @param x First matrix/array
   * @param y Second matrix/array 
   * @returns Result of addition
   */
  static add(x: math.Matrix | math.MathArray, y: math.Matrix | math.MathArray): math.Matrix | math.MathArray {
    return math.add(x, y) as math.Matrix | math.MathArray;
  }

  /**
   * Subtract two matrices
   * @param x First matrix/array
   * @param y Second matrix/array
   * @returns Result of subtraction
   */
  static subtract(x: math.Matrix | math.MathArray, y: math.Matrix | math.MathArray): math.Matrix | math.MathArray {
    return math.subtract(x, y) as math.Matrix | math.MathArray;
  }

  /**
   * Divide a matrix by a scalar
   * @param x Matrix/array to divide
   * @param y Scalar divisor
   * @returns Result of division
   */
  static divide(x: math.Matrix | math.MathArray, y: number): math.Matrix | math.MathArray {
    return math.divide(x, y) as math.Matrix | math.MathArray;
  }
  
  /**
   * Convert a math.js matrix to a state vector
   * @param matrix Matrix to convert
   * @param nodeIds Array of node IDs
   * @returns StateVector representation
   */
  static matrixToStateVector(
    matrix: math.Matrix, 
    nodeIds: string[]
  ): StateVector {
    // Convert matrix to array safely
    const matrixArray = math.flatten(math.clone(matrix)).valueOf() as number[];
    
    // Use the StateVector implementation
    return SimulationStateVector.fromMathArray(matrixArray as unknown as math.MathArray, nodeIds);
  }
  
  /**
   * Solve ordinary diffusion equation: dϕ/dt = α ⋅ L ⋅ ϕ
   * 
   * @param laplacian The Laplacian matrix
   * @param initialState Initial state vector
   * @param alpha Diffusion coefficient
   * @param t Time point to solve for
   * @returns State vector at time t
   */
  static solveOrdinaryDiffusion(
    laplacian: math.Matrix,
    initialState: math.MathArray | math.Matrix,
    alpha: number,
    t: number
  ): math.MathArray {
    // For ordinary diffusion, the solution is:
    // ϕ(t) = e^(α⋅L⋅t) ⋅ ϕ(0)
    
    // Create α⋅L
    const scaledLaplacian = math.multiply(laplacian, alpha) as math.Matrix;
    
    // Calculate e^(α⋅L⋅t)
    const expMatrix = this.matrixExponential(scaledLaplacian, t);
    
    // Convert initialState to matrix if it's not already
    const initialStateMatrix = math.isMatrix(initialState) ? 
      initialState as math.Matrix : 
      math.matrix(initialState);
    
    // Apply to initial state: e^(α⋅L⋅t) ⋅ ϕ(0)
    return math.multiply(expMatrix, initialStateMatrix) as unknown as math.MathArray;
  }
  
  /**
   * Numerically solve telegraph equation: 
   * d²ϕ/dt² + β ⋅ dϕ/dt = c² ⋅ L ⋅ ϕ
   * 
   * This requires a numerical ODE solver since the equation is second order
   * 
   * @param laplacian The Laplacian matrix
   * @param initialState Initial state vector
   * @param initialVelocity Initial velocity vector
   * @param beta Damping coefficient
   * @param cSquared Wave speed squared
   * @param t Time point to solve for
   * @param dt Time step for numerical solution
   * @returns State vector at time t
   */
  static solveTelegraphDiffusion(
    laplacian: math.Matrix,
    initialState: math.MathArray | math.Matrix,
    initialVelocity: math.MathArray | math.Matrix,
    beta: number,
    cSquared: number,
    t: number,
    dt: number
  ): math.MathArray {
    // Convert inputs to matrices if they're not already
    const initialStateMatrix = math.isMatrix(initialState) ? 
      initialState as math.Matrix : 
      math.matrix(initialState);
    
    const initialVelocityMatrix = math.isMatrix(initialVelocity) ? 
      initialVelocity as math.Matrix : 
      math.matrix(initialVelocity);
    
    // Convert to a system of first-order ODEs:
    // Let y = [ϕ, dϕ/dt]
    // Then dy/dt = [dϕ/dt, c²⋅L⋅ϕ - β⋅dϕ/dt]
    
    // Get size of state vector
    const size = math.size(initialStateMatrix).valueOf() as number[];
    
    // Create dense matrices for the state
    const stateData = math.flatten(initialStateMatrix).valueOf() as number[];
    const velocityData = math.flatten(initialVelocityMatrix).valueOf() as number[];
    
    // Create combined state
    const y0 = math.matrix([stateData, velocityData]);
    
    // Function to compute derivative
    const dydt = (t: number, y: math.Matrix): math.Matrix => {
      const phi = math.subset(y, math.index(0, math.range(0, size[0]))) as math.Matrix;
      const dphidt = math.subset(y, math.index(1, math.range(0, size[0]))) as math.Matrix;
      
      // Calculate c²⋅L⋅ϕ
      const laplacianTerm = math.multiply(laplacian, phi) as math.Matrix;
      const cSquaredLaplacianTerm = math.multiply(laplacianTerm, cSquared) as math.Matrix;
      
      // Calculate -β⋅dϕ/dt
      const dampingTerm = math.multiply(dphidt, -beta) as math.Matrix;
      
      // Combine: c²⋅L⋅ϕ - β⋅dϕ/dt
      const acceleration = math.add(cSquaredLaplacianTerm, dampingTerm) as math.Matrix;
      
      // Return [dϕ/dt, c²⋅L⋅ϕ - β⋅dϕ/dt]
      const dphiValues = math.flatten(dphidt).valueOf() as number[];
      const accelValues = math.flatten(acceleration).valueOf() as number[];
      return math.matrix([dphiValues, accelValues]);
    };
    
    // Use 4th order Runge-Kutta method to solve numerically
    const steps = Math.ceil(t / dt);
    let currentY = y0;
    let currentT = 0;
    
    for (let i = 0; i < steps; i++) {
      // Ensure we don't exceed the target time
      const actualDt = Math.min(dt, t - currentT);
      if (actualDt <= 0) break;
      
      // Apply RK4 step
      currentY = this.rungeKutta4Step(currentT, currentY, actualDt, dydt);
      currentT += actualDt;
    }
    
    // Extract the solution (just the position component)
    return math.subset(currentY, math.index(0, math.range(0, size[0]))) as unknown as math.MathArray;
  }
  
  /**
   * Implement 4th order Runge-Kutta method for ODE solving
   */
  private static rungeKutta4Step(
    t: number,
    y: math.Matrix,
    dt: number,
    f: (t: number, y: math.Matrix) => math.Matrix
  ): math.Matrix {
    // k1 = f(t, y)
    const k1 = f(t, y);
    
    // k2 = f(t + dt/2, y + dt/2 * k1)
    const temp2 = math.add(y, math.multiply(k1, dt / 2) as math.Matrix) as math.Matrix;
    const k2 = f(t + dt / 2, temp2);
    
    // k3 = f(t + dt/2, y + dt/2 * k2)
    const temp3 = math.add(y, math.multiply(k2, dt / 2) as math.Matrix) as math.Matrix;
    const k3 = f(t + dt / 2, temp3);
    
    // k4 = f(t + dt, y + dt * k3)
    const temp4 = math.add(y, math.multiply(k3, dt) as math.Matrix) as math.Matrix;
    const k4 = f(t + dt, temp4);
    
    // y_next = y + dt/6 * (k1 + 2*k2 + 2*k3 + k4)
    const sum = math.add(
      k1,
      math.multiply(k2, 2) as math.Matrix,
      math.multiply(k3, 2) as math.Matrix,
      k4
    ) as math.Matrix;
    
    return math.add(y, math.multiply(sum, dt / 6) as math.Matrix) as math.Matrix;
  }
}
