/**
 * Time evolution engine for spin network simulation
 * 
 * This file implements the main simulation engine that controls
 * the time evolution of the diffusion process on the network.
 */

import { 
  SimulationEngine, 
  SimulationGraph, 
  SimulationParameters,
  StateVector,
  SimulationHistory,
  DiffusionModel
} from './types';
import { SimulationStateVector } from './stateVector';
import { DiffusionModelFactory } from '../models/diffusionModels';

/**
 * Implementation of simulation history
 */
class SimulationHistoryImpl implements SimulationHistory {
  private _timePoints: number[] = [];
  private _states: Map<number, StateVector> = new Map();
  
  /**
   * Add a state to the history
   */
  addState(time: number, state: StateVector): void {
    // Store the state at the given time
    this._timePoints.push(time);
    this._states.set(time, state.clone());
    
    // Sort time points to ensure they're in order
    this._timePoints.sort((a, b) => a - b);
  }
  
  /**
   * Get a state at a specific time
   */
  getStateAtTime(time: number): StateVector | undefined {
    return this._states.get(time);
  }
  
  /**
   * Get the closest state to a specific time
   */
  getClosestState(time: number): { time: number; state: StateVector } | undefined {
    if (this._timePoints.length === 0) {
      return undefined;
    }
    
    // Find the closest time point
    let closestTime = this._timePoints[0];
    let closestDistance = Math.abs(time - closestTime);
    
    for (const t of this._timePoints) {
      const distance = Math.abs(time - t);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTime = t;
      }
    }
    
    const state = this._states.get(closestTime);
    if (!state) {
      return undefined;
    }
    
    return { time: closestTime, state };
  }
  
  /**
   * Get all recorded times
   */
  getTimes(): number[] {
    return [...this._timePoints];
  }
  
  /**
   * Get total history duration
   */
  getDuration(): number {
    if (this._timePoints.length === 0) {
      return 0;
    }
    
    const minTime = Math.min(...this._timePoints);
    const maxTime = Math.max(...this._timePoints);
    
    return maxTime - minTime;
  }
  
  /**
   * Clear history
   */
  clear(): void {
    this._timePoints = [];
    this._states.clear();
  }
}

/**
 * Implementation of the simulation engine
 */
export class SpinNetworkSimulationEngine implements SimulationEngine {
  private graph: SimulationGraph | null = null;
  private parameters: SimulationParameters | null = null;
  private diffusionModel: DiffusionModel | null = null;
  private history: SimulationHistoryImpl = new SimulationHistoryImpl();
  private isSimulationRunning: boolean = false;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private animationFrameId: number | null = null;
  
  /**
   * Initialize the simulation
   */
  initialize(graph: SimulationGraph, parameters: SimulationParameters): void {
    this.graph = graph;
    this.parameters = parameters;
    
    // Create the appropriate diffusion model
    const diffusionModelFactory = new DiffusionModelFactory();
    this.diffusionModel = diffusionModelFactory.createDiffusionModel(parameters.diffusionType);
    this.diffusionModel && this.diffusionModel.initialize(graph, parameters);
    
    // Clear history
    this.history.clear();
    
    // Set initial state based on parameters
    this.setInitialState(parameters);
    
    // Notify listeners
    this.emit('initialized', { graph, parameters });
  }
  
  /**
   * Set up the initial state based on simulation parameters
   */
  private setInitialState(parameters: SimulationParameters): void {
    if (!this.diffusionModel || !this.graph) {
      throw new Error('Cannot set initial state: simulation not initialized');
    }
    
    let initialState: StateVector;
    const nodeIds = this.graph.nodes.map(node => node.id);
    
    switch (parameters.initialStateType) {
      case 'delta': {
        // Delta function on a specific node
        const nodeId = parameters.initialStateParams.nodeId || nodeIds[0];
        initialState = SimulationStateVector.createDeltaState(
          nodeIds, 
          nodeId, 
          parameters.initialStateParams.value || 1.0
        );
        break;
      }
      
      case 'uniform': {
        // Uniform value across all nodes
        initialState = SimulationStateVector.createUniformState(
          nodeIds, 
          parameters.initialStateParams.value || 1.0
        );
        break;
      }
      
      case 'gaussian': {
        // Gaussian distribution centered at a node
        const centerNodeId = parameters.initialStateParams.nodeId || nodeIds[0];
        const sigma = parameters.initialStateParams.sigma || 1.0;
        
        // Create position map for Gaussian calculation
        const nodePositions = new Map(
          this.graph.nodes.map(node => [
            node.id, 
            { x: node.position.x, y: node.position.y, z: node.position.z }
          ])
        );
        
        initialState = SimulationStateVector.createGaussianState(
          nodeIds, 
          centerNodeId, 
          sigma,
          nodePositions
        );
        break;
      }
      
      case 'custom': {
        // Custom state from parameters
        const values = parameters.initialStateParams.values || {};
        const stateValues = nodeIds.map(id => values[id] || 0);
        initialState = new SimulationStateVector(nodeIds, stateValues);
        break;
      }
      
      default:
        // Default to delta function on the first node
        initialState = SimulationStateVector.createDeltaState(nodeIds, nodeIds[0], 1.0);
    }
    
    // Set the initial state in the diffusion model
    this.diffusionModel.setInitialState(initialState);
    
    // Add to history
    if (parameters.recordHistory) {
      this.history.addState(0, initialState);
    }
    
    // Notify listeners
    this.emit('initialStateSet', { state: initialState });
  }
  
  /**
   * Step the simulation forward by one time step
   */
  step(): void {
    if (!this.diffusionModel || !this.parameters) {
      throw new Error('Cannot step: simulation not initialized');
    }
    
    // Get time step from parameters
    const dt = this.parameters.timeStep;
    
    // Evolve the state
    const newState = this.diffusionModel.evolveStep(dt);
    const newTime = this.diffusionModel.getCurrentTime();
    
    // Record history if enabled
    if (this.parameters.recordHistory) {
      const interval = this.parameters.historyInterval || 1;
      
      // Only record at specified intervals
      if (Math.floor(newTime / dt) % interval === 0) {
        this.history.addState(newTime, newState);
      }
    }
    
    // Notify listeners
    this.emit('step', { state: newState, time: newTime });
  }
  
  /**
   * Run the simulation until a specific time
   */
  runUntil(time: number): void {
    if (!this.diffusionModel || !this.parameters) {
      throw new Error('Cannot run: simulation not initialized');
    }
    
    const dt = this.parameters.timeStep;
    
    // Evolve to the specified time
    const newState = this.diffusionModel.evolveTo(time, dt);
    const newTime = this.diffusionModel.getCurrentTime();
    
    // Record the final state in history
    if (this.parameters.recordHistory) {
      this.history.addState(newTime, newState);
    }
    
    // Notify listeners
    this.emit('runCompleted', { state: newState, time: newTime });
  }
  
  /**
   * Run the simulation for a specific number of steps
   */
  runSteps(steps: number): void {
    if (!this.diffusionModel || !this.parameters) {
      throw new Error('Cannot run: simulation not initialized');
    }
    
    // Run the specified number of steps
    for (let i = 0; i < steps; i++) {
      this.step();
    }
    
    // Notify listeners
    this.emit('runCompleted', { 
      state: this.diffusionModel.getCurrentState(),
      time: this.diffusionModel.getCurrentTime(),
      steps
    });
  }
  
  /**
   * Start continuous animation loop for real-time simulation
   */
  private startAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      return; // Already running
    }
    
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      if (!this.isSimulationRunning) {
        this.animationFrameId = null;
        return;
      }
      
      // Calculate elapsed time
      const elapsed = (time - lastTime) / 1000; // Convert to seconds
      lastTime = time;
      
      // Only step if we're running
      if (this.isSimulationRunning && this.parameters) {
        // Adjust time step based on parameters and performance
        const dt = Math.min(this.parameters.timeStep, elapsed);
        
        // Step the simulation
        if (this.diffusionModel) {
          const newState = this.diffusionModel.evolveStep(dt);
          const newTime = this.diffusionModel.getCurrentTime();
          
          // Record history if enabled and at appropriate interval
          if (this.parameters.recordHistory) {
            const interval = this.parameters.historyInterval || 1;
            if (Math.floor(newTime / dt) % interval === 0) {
              this.history.addState(newTime, newState);
            }
          }
          
          // Notify listeners
          this.emit('step', { state: newState, time: newTime, realTimeElapsed: elapsed });
        }
      }
      
      // Continue animation loop
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  /**
   * Stop the animation loop
   */
  private stopAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Pause the simulation
   */
  pause(): void {
    if (this.isSimulationRunning) {
      this.isSimulationRunning = false;
      this.stopAnimationLoop();
      this.emit('paused', { time: this.getCurrentTime() });
    }
  }
  
  /**
   * Resume the simulation
   */
  resume(): void {
    if (!this.isSimulationRunning) {
      this.isSimulationRunning = true;
      this.startAnimationLoop();
      this.emit('resumed', { time: this.getCurrentTime() });
    }
  }
  
  /**
   * Reset the simulation
   */
  reset(): void {
    if (this.diffusionModel) {
      // Pause first
      const wasRunning = this.isSimulationRunning;
      this.pause();
      
      // Reset the diffusion model
      this.diffusionModel.reset();
      
      // Clear history or just keep initial state
      if (this.parameters?.recordHistory) {
        const initialState = this.diffusionModel.getCurrentState();
        this.history.clear();
        this.history.addState(0, initialState);
      } else {
        this.history.clear();
      }
      
      // Notify listeners
      this.emit('reset', { state: this.diffusionModel.getCurrentState() });
      
      // Resume if it was running
      if (wasRunning) {
        this.resume();
      }
    }
  }
  
  /**
   * Get the current state
   */
  getCurrentState(): StateVector {
    if (!this.diffusionModel) {
      throw new Error('Cannot get state: simulation not initialized');
    }
    
    return this.diffusionModel.getCurrentState();
  }
  
  /**
   * Get the current time
   */
  getCurrentTime(): number {
    if (!this.diffusionModel) {
      return 0;
    }
    
    return this.diffusionModel.getCurrentTime();
  }
  
  /**
   * Get the simulation history
   */
  getHistory(): SimulationHistory {
    return this.history;
  }
  
  /**
   * Check if the simulation is running
   */
  isRunning(): boolean {
    return this.isSimulationRunning;
  }
  
  /**
   * Add an event listener
   */
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)?.add(callback);
  }
  
  /**
   * Remove an event listener
   */
  removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }
  
  /**
   * Emit an event
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}
