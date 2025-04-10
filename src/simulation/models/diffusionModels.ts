/**
 * Implementation of diffusion models for spin networks
 */

import {
  DiffusionModel,
  SimulationGraph,
  SimulationParameters,
  StateVector,
  WeightFunction,
  WeightFunctionFactory
} from '../core/types';
import { SimulationStateVector } from '../core/stateVector';
import { SpinWeightFunctionFactory } from './weightFunctions';
import { MathAdapter } from '../core/mathAdapter';

/**
 * Base class for diffusion models
 */
abstract class BaseDiffusionModel implements DiffusionModel {
  protected graph: SimulationGraph | null = null;
  protected parameters: SimulationParameters | null = null;
  protected state: StateVector | null = null;
  protected initialState: StateVector | null = null;
  protected currentTime: number = 0;
  protected weightFunction: WeightFunction | null = null;
  protected weightFunctionFactory: WeightFunctionFactory = new SpinWeightFunctionFactory();
  protected mathAdapter: MathAdapter = new MathAdapter();

  /**
   * Initialize the model with a graph and parameters
   */
  initialize(graph: SimulationGraph, parameters: SimulationParameters): void {
    this.graph = graph;
    this.parameters = { ...parameters };
    this.currentTime = 0;
    
    // Get the weight function from the factory
    this.weightFunction = this.weightFunctionFactory.getWeightFunction(parameters.weightFunction);
    
    // Initialize with empty state
    const nodeIds = graph.nodes.map(node => node.id);
    this.state = new SimulationStateVector(nodeIds);
    this.initialState = this.state.clone();
  }

  /**
   * Set the initial state
   */
  setInitialState(state: StateVector): void {
    if (!this.state) return;
    
    this.state = state.clone();
    this.initialState = state.clone();
    this.currentTime = 0;
  }

  /**
   * Get the current state
   */
  getCurrentState(): StateVector {
    return this.state || new SimulationStateVector([]);
  }

  /**
   * Get the current time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Reset the simulation
   */
  reset(): void {
    if (this.initialState) {
      this.state = this.initialState.clone();
    }
    this.currentTime = 0;
  }

  /**
   * Evolve the state by one time step
   * Each diffusion model must implement this
   */
  abstract evolveStep(dt: number): StateVector;

  /**
   * Evolve to a specific time
   */
  evolveTo(t: number, dt: number): StateVector {
    if (!this.state) {
      return new SimulationStateVector([]);
    }
    
    // Calculate number of steps
    const steps = Math.ceil((t - this.currentTime) / dt);
    
    // Evolve step by step
    for (let i = 0; i < steps; i++) {
      this.state = this.evolveStep(dt);
    }
    
    return this.state;
  }
}

/**
 * Implementation of ordinary diffusion model (heat equation)
 */
export class OrdinaryDiffusionModel extends BaseDiffusionModel {
  /**
   * Evolve the state by one time step using the heat equation
   * ∂ϕ/∂t = α∇²ϕ
   */
  evolveStep(dt: number): StateVector {
    if (!this.graph || !this.state || !this.parameters || !this.weightFunction) {
      return this.state || new SimulationStateVector([]);
    }
    
    // Get the Laplacian matrix
    const laplacian = this.graph.toLaplacianMatrix(this.weightFunction);
    
    // Convert state to math array
    const stateArray = this.state.toMathArray();
    
    // Calculate diffusion
    // ∂ϕ/∂t = α∇²ϕ
    // ϕ(t+dt) = ϕ(t) + dt * α * ∇²ϕ
    const alpha = this.parameters.alpha || 1.0;
    const diffusionTerm = this.mathAdapter.multiply(laplacian, stateArray);
    const alphaDiffusion = this.mathAdapter.multiply(diffusionTerm, alpha);
    const deltaState = this.mathAdapter.multiply(alphaDiffusion, dt);
    const newStateArray = this.mathAdapter.add(stateArray, deltaState);
    
    // Convert back to state vector - ensure it's a MathArray by casting
    const newState = this.state.fromMathArray(
      newStateArray as any, 
      this.state.nodeIds
    );
    
    // Update time
    this.currentTime += dt;
    
    // Update state
    this.state = newState;
    
    return this.state;
  }
}

/**
 * Implementation of telegraph diffusion model (wave-like diffusion)
 */
export class TelegraphDiffusionModel extends BaseDiffusionModel {
  private previousState: StateVector | null = null;

  /**
   * Set the initial state (overridden to initialize previous state)
   */
  setInitialState(state: StateVector): void {
    super.setInitialState(state);
    this.previousState = state.clone();
  }

  /**
   * Reset the simulation (overridden to reset previous state)
   */
  reset(): void {
    super.reset();
    if (this.initialState) {
      this.previousState = this.initialState.clone();
    }
  }

  /**
   * Evolve the state by one time step using the telegraph equation
   * ∂²ϕ/∂t² + β∂ϕ/∂t = c²∇²ϕ
   */
  evolveStep(dt: number): StateVector {
    if (!this.graph || !this.state || !this.parameters || !this.weightFunction || !this.previousState) {
      return this.state || new SimulationStateVector([]);
    }
    
    // Get the Laplacian matrix
    const laplacian = this.graph.toLaplacianMatrix(this.weightFunction);
    
    // Convert state to math array
    const stateArray = this.state.toMathArray();
    const prevStateArray = this.previousState.toMathArray();
    
    // Get parameters
    const beta = this.parameters.beta || 0.5;
    const c = this.parameters.c || 1.0;
    const c2 = c * c;
    
    // Calculate the right hand side of the equation: c²∇²ϕ
    const laplacianTerm = this.mathAdapter.multiply(laplacian, stateArray);
    const c2Laplacian = this.mathAdapter.multiply(laplacianTerm, c2);
    
    // Calculate the time step for the wave equation with damping
    // ∂²ϕ/∂t² + β∂ϕ/∂t = c²∇²ϕ
    // Using a numerical approximation:
    // ϕ(t+dt) = 2*ϕ(t) - ϕ(t-dt) + dt² * (c²∇²ϕ - β∂ϕ/∂t)
    // where ∂ϕ/∂t ≈ (ϕ(t) - ϕ(t-dt))/dt
    
    // Calculate first-order time derivative approximation
    const timeDeriv = this.mathAdapter.subtract(stateArray, prevStateArray);
    const timeDerivScaled = this.mathAdapter.divide(timeDeriv, dt);
    
    // Calculate damping term
    const dampingTerm = this.mathAdapter.multiply(timeDerivScaled, beta);
    
    // Calculate wave propagation term
    const waveterm = this.mathAdapter.subtract(c2Laplacian, dampingTerm);
    const wavetermScaled = this.mathAdapter.multiply(waveterm, dt * dt);
    
    // Calculate new state
    const twoState = this.mathAdapter.multiply(stateArray, 2);
    const stateMinusPrev = this.mathAdapter.subtract(twoState, prevStateArray);
    const newStateArray = this.mathAdapter.add(stateMinusPrev, wavetermScaled);
    
    // Convert back to state vector - ensure it's a MathArray by casting
    const newState = this.state.fromMathArray(
      newStateArray as any, 
      this.state.nodeIds
    );
    
    // Update time
    this.currentTime += dt;
    
    // Update previous and current state
    this.previousState = this.state.clone();
    this.state = newState;
    
    return this.state;
  }
}

/**
 * Factory for creating diffusion models
 */
export class DiffusionModelFactory {
  /**
   * Create a diffusion model based on the type
   */
  createDiffusionModel(type: 'ordinary' | 'telegraph'): DiffusionModel {
    if (type === 'telegraph') {
      return new TelegraphDiffusionModel();
    }
    return new OrdinaryDiffusionModel();
  }
}
