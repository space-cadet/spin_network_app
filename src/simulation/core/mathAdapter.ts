/**
 * Adapter for math.js integration
 * 
 * This file provides adapters between our simulation data structures
 * and math.js library components for matrix operations and numerical methods.
 */

import * as math from 'mathjs';
import { SimulationGraph, SimulationEdge, StateVector, WeightFunction } from './types';

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
    
    return {
      values: eigs.values as number[],
      vectors: eigs.vectors as math.Matrix
    };
  }
  
  /**
   * Convert a math.js matrix to a state vector
   */
  static matrixToStateVector(
    matrix: math.Matrix, 
    nodeIds: string[]
  ): StateVector {
    // This is a placeholder - the actual StateVector implementation
    // will be created in stateVector.ts
    return {
      size: nodeIds.length,
      nodeIds,
      getValue: () => 0,
      setValue: () => ({} as StateVector),
      getValueAtIndex: () => 0,
      setValueAtIndex: () => ({} as StateVector),
      add: () => ({} as StateVector),
      subtract: () => ({} as StateVector),
      multiply: () => ({} as StateVector),
      toMathArray: () => [] as math.MathArray,
      normalize: () => ({} as StateVector),
      clone: () => ({} as StateVector),
      equals: () => false,
      toVisualizationState: () => ({})
    };
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
    initialState: math.MathArray,
    alpha: number,
    t: number
  ): math.MathArray {
    // For ordinary diffusion, the solution is:
    // ϕ(t) = e^(α⋅L⋅t) ⋅ ϕ(0)
    
    // Create α⋅L
    const scaledLaplacian = math.multiply(laplacian, alpha) as math.Matrix;
    
    // Calculate e^(α⋅L⋅t)
    const expMatrix = this.matrixExponential(scaledLaplacian, t);
    
    // Apply to initial state: e^(α⋅L⋅t) ⋅ ϕ(0)
    return math.multiply(expMatrix, initialState) as math.MathArray;
  }
  
  /**
   * Numerically solve telegraph equation: 
   * d²ϕ/dt² + β ⋅ dϕ/dt = c² ⋅ L ⋅ ϕ
   * 
   * This requires a numerical ODE solver since the equation is second order
   */
  static solveTelegraphDiffusion(
    laplacian: math.Matrix,
    initialState: math.MathArray,
    initialVelocity: math.MathArray,
    beta: number,
    cSquared: number,
    t: number,
    dt: number
  ): math.MathArray {
    // Convert to a system of first-order ODEs:
    // Let y = [ϕ, dϕ/dt]
    // Then dy/dt = [dϕ/dt, c²⋅L⋅ϕ - β⋅dϕ/dt]
    
    // Initial state as a column vector
    const y0 = math.matrix([
      initialState,
      initialVelocity
    ]);
    
    // Function to compute derivative
    const dydt = (t: number, y: math.Matrix): math.Matrix => {
      const phi = y.subset(math.index(0, math.range(0, initialState.length))) as math.Matrix;
      const dphidt = y.subset(math.index(1, math.range(0, initialState.length))) as math.Matrix;
      
      // Calculate c²⋅L⋅ϕ
      const laplacianTerm = math.multiply(laplacian, phi) as math.Matrix;
      const cSquaredLaplacianTerm = math.multiply(laplacianTerm, cSquared) as math.Matrix;
      
      // Calculate -β⋅dϕ/dt
      const dampingTerm = math.multiply(dphidt, -beta) as math.Matrix;
      
      // Combine: c²⋅L⋅ϕ - β⋅dϕ/dt
      const acceleration = math.add(cSquaredLaplacianTerm, dampingTerm) as math.Matrix;
      
      // Return [dϕ/dt, c²⋅L⋅ϕ - β⋅dϕ/dt]
      return math.matrix([
        dphidt,
        acceleration
      ]);
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
    return currentY.subset(math.index(0, math.range(0, initialState.length))) as math.MathArray;
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
