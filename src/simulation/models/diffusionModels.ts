/**
 * Diffusion model implementations for spin network simulation
 * 
 * This file contains implementations of different diffusion models
 * that can be used to simulate diffusion processes on spin networks.
 */

import * as math from 'mathjs';
import { 
  DiffusionModel, 
  SimulationGraph, 
  StateVector, 
  SimulationParameters,
  StandardWeightFunction,
  WeightFunction 
} from '../core/types';
import { SimulationStateVector } from '../core/stateVector';
import { MathAdapter } from '../core/mathAdapter';
import { SpinWeightFunctionFactory } from './weightFunctions';

/**
 * Base class for diffusion models
 */
abstract class BaseDiffusionModel implements DiffusionModel {
  protected graph: SimulationGraph | null = null;
  protected parameters: SimulationParameters | null = null;
  protected currentState: StateVector | null = null;
  protected initialState: StateVector | null = null;
  protected currentTime: number = 0;
  protected laplacianMatrix: math.Matrix | null = null;
  protected weightFunction: WeightFunction | null = null;
  
  /**
   * Initialize the diffusion model with a graph and parameters
   */
  initialize(graph: SimulationGraph, parameters: SimulationParameters): void {
    this.graph = graph;
    this.parameters = parameters;
    this.currentTime = 0;
    
    // Get the weight function
    const weightFunctionFactory = new SpinWeightFunctionFactory();
    this.weightFunction = weightFunctionFactory.getWeightFunction(parameters.weightFunction);
    
    // Compute the Laplacian matrix
    this.laplacianMatrix = graph.toLaplacianMatrix(this.weightFunction);
    
    // Reset current state to null
    this.currentState = null;
    this.initialState = null;
  }
  
  /**
   * Set the initial state for the simulation
   */
  setInitialState(state: StateVector): void {
    this.initialState = state.clone();
    this.currentState = state.clone();
    this.currentTime = 0;
  }
  
  /**
   * Get the current state
   */
  getCurrentState(): StateVector {
    if (!this.currentState) {
      throw new Error('Model not initialized or no initial state set');
    }
    return this.currentState;
  }
  
  /**
   * Get the current simulation time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }
  
  /**
   * Reset the simulation to the initial state
   */
  reset(): void {
    if (this.initialState) {
      this.currentState = this.initialState.clone();
      this.currentTime = 0;
    }
  }
  
  /**
   * Evolve the state by one time step
   */
  abstract evolveStep(dt: number): StateVector;
  
  /**
   * Evolve to a specific time using multiple steps
   */
  evolveTo(t: number, dt: number): StateVector {
    if (!this.currentState || !this.graph || !this.parameters) {
      throw new Error('Model not initialized or no initial state set');
    }
    
    // If target time is less than current time, reset
    if (t < this.currentTime) {
      this.reset();
    }
    
    // Evolve until we reach the target time
    while (this.currentTime < t) {
      const remainingTime = t - this.currentTime;
      const stepSize = Math.min(dt, remainingTime);
      
      this.currentState = this.evolveStep(stepSize);
      this.currentTime += stepSize;
    }
    
    return this.currentState;
  }
}

/**
 * Ordinary diffusion model: dϕ/dt = α ⋅ L ⋅ ϕ
 * 
 * This implements the standard diffusion equation using the
 * Laplacian matrix of the network.
 */
export class OrdinaryDiffusionModel extends BaseDiffusionModel {
  /**
   * Evolve the state by one time step using the diffusion equation
   */
  evolveStep(dt: number): StateVector {
    if (!this.currentState || !this.laplacianMatrix || !this.parameters) {
      throw new Error('Model not initialized or no initial state set');
    }
    
    // Get the diffusion coefficient
    const alpha = this.parameters.alpha;
    
    // For small time steps, we can use Euler's method:
    // ϕ(t+dt) ≈ ϕ(t) + dt * α * L * ϕ(t)
    
    // Get current state as math.js array
    const stateArray = this.currentState.toMathArray();
    
    // Calculate L * ϕ
    const laplacianTerm = math.multiply(this.laplacianMatrix, stateArray) as math.MathArray;
    
    // Calculate α * L * ϕ
    const diffusionTerm = math.multiply(laplacianTerm, alpha) as math.MathArray;
    
    // Calculate dt * α * L * ϕ
    const deltaTerm = math.multiply(diffusionTerm, dt) as math.MathArray;
    
    // Calculate ϕ(t) + dt * α * L * ϕ(t)
    const newStateArray = math.add(stateArray, deltaTerm) as math.MathArray;
    
    // Convert back to a StateVector
    const newState = SimulationStateVector.fromMathArray(
      newStateArray,
      this.currentState.nodeIds
    );
    
    return newState;
  }
}

/**
 * Telegraph equation diffusion model: d²ϕ/dt² + β ⋅ dϕ/dt = c² ⋅ L ⋅ ϕ
 * 
 * This implements the telegraph equation which combines wave-like and
 * diffusion-like behavior. It requires tracking both the state and
 * its time derivative.
 */
export class TelegraphDiffusionModel extends BaseDiffusionModel {
  private currentVelocity: StateVector | null = null;
  private initialVelocity: StateVector | null = null;
  
  /**
   * Initialize the model
   */
  override initialize(graph: SimulationGraph, parameters: SimulationParameters): void {
    super.initialize(graph, parameters);
    this.currentVelocity = null;
    this.initialVelocity = null;
  }
  
  /**
   * Set the initial state and velocity
   */
  override setInitialState(state: StateVector): void {
    super.setInitialState(state);
    
    // Initialize velocity to zero
    const zeroValues = Array(state.size).fill(0);
    this.initialVelocity = new SimulationStateVector(state.nodeIds, zeroValues);
    this.currentVelocity = this.initialVelocity.clone();
  }
  
  /**
   * Reset the simulation
   */
  override reset(): void {
    super.reset();
    if (this.initialVelocity) {
      this.currentVelocity = this.initialVelocity.clone();
    }
  }
  
  /**
   * Evolve the state by one time step using the telegraph equation
   */
  evolveStep(dt: number): StateVector {
    if (!this.currentState || !this.currentVelocity || 
        !this.laplacianMatrix || !this.parameters) {
      throw new Error('Model not initialized or no initial state set');
    }
    
    // Get parameters for the telegraph equation
    const beta = this.parameters.beta || 1.0;
    const cSquared = (this.parameters.c || 1.0) ** 2;
    
    // For small time steps, we can use a semi-implicit Euler method
    // for the system of first-order ODEs:
    //
    // dϕ/dt = v
    // dv/dt = c² ⋅ L ⋅ ϕ - β ⋅ v
    
    // Get current state and velocity as math.js arrays
    const stateArray = this.currentState.toMathArray();
    const velocityArray = this.currentVelocity.toMathArray();
    
    // Calculate c² ⋅ L ⋅ ϕ
    const laplacianTerm = math.multiply(this.laplacianMatrix, stateArray) as math.MathArray;
    const cSquaredLaplacianTerm = math.multiply(laplacianTerm, cSquared) as math.MathArray;
    
    // Calculate -β ⋅ v
    const dampingTerm = math.multiply(velocityArray, -beta) as math.MathArray;
    
    // Calculate acceleration: c² ⋅ L ⋅ ϕ - β ⋅ v
    const accelerationTerm = math.add(cSquaredLaplacianTerm, dampingTerm) as math.MathArray;
    
    // Update velocity: v(t+dt) = v(t) + dt * acceleration
    const deltaVelocity = math.multiply(accelerationTerm, dt) as math.MathArray;
    const newVelocityArray = math.add(velocityArray, deltaVelocity) as math.MathArray;
    
    // Update position: ϕ(t+dt) = ϕ(t) + dt * v(t+dt)
    const deltaPosition = math.multiply(newVelocityArray, dt) as math.MathArray;
    const newStateArray = math.add(stateArray, deltaPosition) as math.MathArray;
    
    // Convert back to StateVectors
    const newState = SimulationStateVector.fromMathArray(
      newStateArray,
      this.currentState.nodeIds
    );
    this.currentVelocity = SimulationStateVector.fromMathArray(
      newVelocityArray,
      this.currentState.nodeIds
    );
    
    return newState;
  }
}

/**
 * Factory for creating diffusion models based on type
 */
export class DiffusionModelFactory {
  /**
   * Create a diffusion model based on the specified type
   */
  static createModel(type: 'ordinary' | 'telegraph'): DiffusionModel {
    switch (type) {
      case 'ordinary':
        return new OrdinaryDiffusionModel();
      case 'telegraph':
        return new TelegraphDiffusionModel();
      default:
        throw new Error(`Unknown diffusion model type: ${type}`);
    }
  }
}
