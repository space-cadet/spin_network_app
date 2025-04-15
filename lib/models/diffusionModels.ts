/**
 * Diffusion model implementations for the Spin Network library
 * 
 * This file contains implementations of various diffusion models
 * for simulating dynamics on spin networks.
 */

import * as math from 'mathjs';
import { 
  DiffusionModel, 
  SimulationGraph, 
  SimulationParameters, 
  StateVector,
  NumericalSolver
} from '../core/types';
import { MathAdapter } from '../core/mathAdapter';
import { SolverFactory } from './solvers';

/**
 * Implementation of ordinary diffusion model (heat equation)
 * 
 * dϕ/dt = α ⋅ L ⋅ ϕ
 * 
 * where L is the Laplacian matrix and α is the diffusion coefficient
 */
export class OrdinaryDiffusionModel implements DiffusionModel {
  private _graph?: SimulationGraph;
  private _parameters?: SimulationParameters;
  private _currentState?: StateVector;
  private _initialState?: StateVector;
  private _laplacian?: math.Matrix;
  private _currentTime: number = 0;
  private _solver?: NumericalSolver;
  
  /**
   * Initialize the model with a graph and parameters
   */
  initialize(graph: SimulationGraph, parameters: SimulationParameters): void {
    this._graph = graph;
    this._parameters = parameters;
    this._currentTime = 0;
    
    // Create the Laplacian matrix
    this._laplacian = this._createLaplacianMatrix();
    
    // Initialize solver based on numerical method parameter
    this._solver = SolverFactory.createSolver(parameters.numericalMethod);
  }
  
  /**
   * Set initial state
   */
  setInitialState(state: StateVector): void {
    this._initialState = state.clone();
    this._currentState = state.clone();
  }
  
  /**
   * Evolve the state by one time step
   */
  evolveStep(dt: number): StateVector {
    if (!this._graph || !this._parameters || !this._currentState || !this._laplacian) {
      throw new Error('Diffusion model not properly initialized');
    }
    
    const alpha = this._parameters.alpha;
    
    // For ordinary diffusion, we can use either:
    // 1. Analytic solution with matrix exponential (more accurate but slower)
    // 2. Numerical solver (faster but may have numerical errors)
    
    // Using the analytic solution for simplicity and accuracy
    const nodeIds = this._graph.nodes.map(node => node.id);
    
    // Get the current state as a math.js array
    const stateArray = this._currentState.toMathArray();
    
    // Solve the diffusion equation
    const newStateArray = MathAdapter.solveOrdinaryDiffusion(
      this._laplacian,
      stateArray,
      alpha,
      dt
    );
    
    // Update current state and time
    this._currentState = MathAdapter.matrixToStateVector(
      newStateArray as unknown as math.Matrix, 
      nodeIds
    );
    this._currentTime += dt;
    
    return this._currentState;
  }
  
  /**
   * Evolve to a specific time
   */
  evolveTo(t: number, dt: number): StateVector {
    if (!this._currentState) {
      throw new Error('Diffusion model not properly initialized');
    }
    
    if (t <= this._currentTime) {
      return this._currentState;
    }
    
    // Calculate the number of steps needed
    const steps = Math.ceil((t - this._currentTime) / dt);
    
    // Take steps until we reach the target time
    for (let i = 0; i < steps; i++) {
      // Make sure we don't exceed the target time
      const actualDt = Math.min(dt, t - this._currentTime);
      if (actualDt <= 0) break;
      
      this.evolveStep(actualDt);
    }
    
    return this._currentState;
  }
  
  /**
   * Get current state
   */
  getCurrentState(): StateVector {
    if (!this._currentState) {
      throw new Error('Diffusion model not properly initialized');
    }
    return this._currentState;
  }
  
  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this._currentTime;
  }
  
  /**
   * Reset the simulation
   */
  reset(): void {
    if (!this._initialState) {
      throw new Error('Diffusion model not properly initialized');
    }
    
    this._currentState = this._initialState.clone();
    this._currentTime = 0;
  }
  
  /**
   * Create the Laplacian matrix for the graph
   */
  private _createLaplacianMatrix(): math.Matrix {
    if (!this._graph || !this._parameters) {
      throw new Error('Cannot create Laplacian: graph or parameters missing');
    }
    
    // Get the weight function based on the parameter
    const weightFunctionName = this._parameters.weightFunction;
    
    // This is a placeholder - in a real implementation, you would use a proper factory
    const weightFunction = (edge: any): number => {
      switch (weightFunctionName) {
        case 'spin':
          return edge.spin;
        case 'casimir':
          return edge.spin * (edge.spin + 1);
        case 'dimension':
          return 2 * edge.spin + 1;
        case 'area':
          return Math.sqrt(edge.spin * (edge.spin + 1));
        default:
          return edge.spin; // Default to spin value
      }
    };
    
    // Create the Laplacian matrix
    return MathAdapter.createLaplacianMatrix(this._graph, weightFunction);
  }
}

/**
 * Implementation of telegraph diffusion model (wave equation with damping)
 * 
 * d²ϕ/dt² + β ⋅ dϕ/dt = c² ⋅ L ⋅ ϕ
 * 
 * where L is the Laplacian matrix, β is the damping coefficient, and c is the wave speed
 */
export class TelegraphDiffusionModel implements DiffusionModel {
  private _graph?: SimulationGraph;
  private _parameters?: SimulationParameters;
  private _currentState?: StateVector;
  private _currentVelocity?: StateVector;
  private _initialState?: StateVector;
  private _initialVelocity?: StateVector;
  private _laplacian?: math.Matrix;
  private _currentTime: number = 0;
  private _solver?: NumericalSolver;
  
  /**
   * Initialize the model with a graph and parameters
   */
  initialize(graph: SimulationGraph, parameters: SimulationParameters): void {
    this._graph = graph;
    this._parameters = parameters;
    this._currentTime = 0;
    
    // Create the Laplacian matrix
    this._laplacian = this._createLaplacianMatrix();
    
    // Initialize solver based on numerical method parameter
    this._solver = SolverFactory.createSolver(parameters.numericalMethod);
    
    // Initialize velocity to zero if not set
    if (!this._currentVelocity) {
      const nodeIds = graph.nodes.map(node => node.id);
      const zeroValues = Array(nodeIds.length).fill(0);
      this._currentVelocity = new SimulationStateVector(nodeIds, zeroValues);
      this._initialVelocity = this._currentVelocity.clone();
    }
  }
  
  /**
   * Set initial state
   */
  setInitialState(state: StateVector): void {
    this._initialState = state.clone();
    this._currentState = state.clone();
    
    // Initialize velocity to zero if not set
    if (!this._currentVelocity) {
      const nodeIds = state.nodeIds;
      const zeroValues = Array(nodeIds.length).fill(0);
      this._currentVelocity = new SimulationStateVector(nodeIds, zeroValues);
      this._initialVelocity = this._currentVelocity.clone();
    }
  }
  
  /**
   * Set initial velocity (for second-order wave equation)
   */
  setInitialVelocity(velocity: StateVector): void {
    this._initialVelocity = velocity.clone();
    this._currentVelocity = velocity.clone();
  }
  
  /**
   * Evolve the state by one time step
   */
  evolveStep(dt: number): StateVector {
    if (!this._graph || !this._parameters || !this._currentState || 
        !this._currentVelocity || !this._laplacian) {
      throw new Error('Telegraph diffusion model not properly initialized');
    }
    
    const beta = this._parameters.beta || 0.1; // Damping coefficient
    const cSquared = (this._parameters.c || 1.0) ** 2; // Wave speed squared
    
    // For telegraph diffusion, we need to solve the system:
    // dϕ/dt = v
    // dv/dt = c² ⋅ L ⋅ ϕ - β ⋅ v
    
    const nodeIds = this._graph.nodes.map(node => node.id);
    
    // Get current state and velocity as math.js arrays
    const stateArray = this._currentState.toMathArray();
    const velocityArray = this._currentVelocity.toMathArray();
    
    // This is a placeholder - in a real implementation, you would use a proper ODE solver
    // Here we're using a simple Euler method for demonstration
    
    // Calculate acceleration: a = c² ⋅ L ⋅ ϕ - β ⋅ v
    const laplaceProduct = MathAdapter.multiply(this._laplacian, stateArray);
    const scaledLaplaceProduct = MathAdapter.multiply(laplaceProduct, cSquared);
    const dampingTerm = MathAdapter.multiply(velocityArray, beta);
    const acceleration = MathAdapter.subtract(scaledLaplaceProduct, dampingTerm);
    
    // Update velocity: v_new = v + a ⋅ dt
    const velocityIncrement = MathAdapter.multiply(acceleration, dt);
    const newVelocityArray = MathAdapter.add(velocityArray, velocityIncrement);
    
    // Update position: ϕ_new = ϕ + v_new ⋅ dt
    const positionIncrement = MathAdapter.multiply(newVelocityArray, dt);
    const newStateArray = MathAdapter.add(stateArray, positionIncrement);
    
    // Update current state, velocity and time
    this._currentState = MathAdapter.matrixToStateVector(
      newStateArray as unknown as math.Matrix, 
      nodeIds
    );
    this._currentVelocity = MathAdapter.matrixToStateVector(
      newVelocityArray as unknown as math.Matrix,
      nodeIds
    );
    this._currentTime += dt;
    
    return this._currentState;
  }
  
  /**
   * Evolve to a specific time
   */
  evolveTo(t: number, dt: number): StateVector {
    if (!this._currentState) {
      throw new Error('Telegraph diffusion model not properly initialized');
    }
    
    if (t <= this._currentTime) {
      return this._currentState;
    }
    
    // Calculate the number of steps needed
    const steps = Math.ceil((t - this._currentTime) / dt);
    
    // Take steps until we reach the target time
    for (let i = 0; i < steps; i++) {
      // Make sure we don't exceed the target time
      const actualDt = Math.min(dt, t - this._currentTime);
      if (actualDt <= 0) break;
      
      this.evolveStep(actualDt);
    }
    
    return this._currentState;
  }
  
  /**
   * Get current state
   */
  getCurrentState(): StateVector {
    if (!this._currentState) {
      throw new Error('Telegraph diffusion model not properly initialized');
    }
    return this._currentState;
  }
  
  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this._currentTime;
  }
  
  /**
   * Reset the simulation
   */
  reset(): void {
    if (!this._initialState || !this._initialVelocity) {
      throw new Error('Telegraph diffusion model not properly initialized');
    }
    
    this._currentState = this._initialState.clone();
    this._currentVelocity = this._initialVelocity.clone();
    this._currentTime = 0;
  }
  
  /**
   * Create the Laplacian matrix for the graph
   */
  private _createLaplacianMatrix(): math.Matrix {
    if (!this._graph || !this._parameters) {
      throw new Error('Cannot create Laplacian: graph or parameters missing');
    }
    
    // Get the weight function based on the parameter
    const weightFunctionName = this._parameters.weightFunction;
    
    // This is a placeholder - in a real implementation, you would use a proper factory
    const weightFunction = (edge: any): number => {
      switch (weightFunctionName) {
        case 'spin':
          return edge.spin;
        case 'casimir':
          return edge.spin * (edge.spin + 1);
        case 'dimension':
          return 2 * edge.spin + 1;
        case 'area':
          return Math.sqrt(edge.spin * (edge.spin + 1));
        default:
          return edge.spin; // Default to spin value
      }
    };
    
    // Create the Laplacian matrix
    return MathAdapter.createLaplacianMatrix(this._graph, weightFunction);
  }
}

/**
 * Factory for creating diffusion models based on parameters
 */
export class DiffusionModelFactory {
  /**
   * Create a diffusion model based on parameters
   */
  static createModel(parameters: SimulationParameters): DiffusionModel {
    switch (parameters.diffusionType) {
      case 'ordinary':
        return new OrdinaryDiffusionModel();
      
      case 'telegraph':
        return new TelegraphDiffusionModel();
      
      default:
        throw new Error(`Unknown diffusion type: ${parameters.diffusionType}`);
    }
  }
}
