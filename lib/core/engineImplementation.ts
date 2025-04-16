/**
 * Implementation of the SimulationEngine interface
 * 
 * This is the main engine for running spin network simulations.
 */

import * as math from 'mathjs';
import {
  SimulationEngine,
  SimulationGraph,
  SimulationParameters,
  StateVector,
  SimulationHistory,
  DiffusionModel,
  SimulationEvent
} from './types';
import { SimulationStateVector } from './stateVector';
import { MathAdapter } from './mathAdapter';
import { 
  SimulationLogger, 
  defaultLogger, 
  LogCategory,
  monitorSimulationStability
} from '../utils/simulationLogger';

/**
 * Implementation of SimulationHistory for tracking simulation state over time
 */
export class SimulationHistoryImpl implements SimulationHistory {
  private _times: number[] = [];
  private _states: Map<number, StateVector> = new Map();

  /**
   * Add a state to the history
   */
  addState(time: number, state: StateVector): void {
    if (!this._states.has(time)) {
      this._times.push(time);
      this._times.sort((a, b) => a - b);
    }
    this._states.set(time, state);
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
    if (this._times.length === 0) {
      return undefined;
    }
    // Find closest time using binary search
    let left = 0;
    let right = this._times.length - 1;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this._times[mid] === time) {
        return { time: this._times[mid], state: this._states.get(this._times[mid])! };
      } else if (this._times[mid] < time) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    // After binary search, left is the insertion point
    const before = left > 0 ? this._times[left - 1] : null;
    const after = left < this._times.length ? this._times[left] : null;

    if (before === null) {
      return { time: after!, state: this._states.get(after!)! };
    }
    if (after === null) {
      return { time: before, state: this._states.get(before)! };
    }
    // Return the closest of before and after
    if (Math.abs(time - before) <= Math.abs(after - time)) {
      return { time: before, state: this._states.get(before)! };
    } else {
      return { time: after, state: this._states.get(after)! };
    }
  }

  /**
   * Get all recorded times
   */
  getTimes(): number[] {
    return [...this._times];
  }

  /**
   * Get total history duration
   */
  getDuration(): number {
    if (this._times.length === 0) {
      return 0;
    }
    return this._times[this._times.length - 1] - this._times[0];
  }

  /**
   * Clear history
   */
  clear(): void {
    this._times = [];
    this._states.clear();
  }

  /**
   * Serialize to JSON
   */
  toJSON(): Record<string, any> {
    return {
      times: this._times,
      states: Array.from(this._times, time => ({
        time,
        state: this._states.get(time)?.toJSON()
      }))
    };
  }

  /**
   * Create from JSON
   */
  fromJSON(data: Record<string, any>): SimulationHistory {
    this.clear();
    if (Array.isArray(data.times) && Array.isArray(data.states)) {
      data.states.forEach((entry: any) => {
        if (entry.time !== undefined && entry.state !== undefined) {
          // Assuming state is serialized as JSON compatible with SimulationStateVector
          // We need nodeIds to reconstruct state vector, but this is a limitation here
          // For now, we skip deserialization of state vector details
          // This can be improved with additional context or parameters
          this._times.push(entry.time);
          // Placeholder: store undefined or null for state
          this._states.set(entry.time, undefined as unknown as StateVector);
        }
      });
      this._times.sort((a, b) => a - b);
    }
    return this;
  }
}

/**
 * Implementation of the SimulationEngine interface for spin network simulations
 */
export class SpinNetworkSimulationEngine implements SimulationEngine {
  private _graph?: SimulationGraph;
  private _parameters?: SimulationParameters;
  private _currentTime: number = 0;
  private _currentState?: StateVector;
  private _initialState?: StateVector;
  private _running: boolean = false;
  private _history: SimulationHistoryImpl = new SimulationHistoryImpl();
  private _diffusionModel?: DiffusionModel;
  private _eventListeners: Map<string, Function[]> = new Map();
  private _laplacianMatrix?: math.Matrix;
  private _logger: SimulationLogger = defaultLogger;
  private _stabilityCheckCounter: number = 0;

  /**
   * Initialize the state vector based on simulation parameters
   */
  private _initializeState(): void {
    if (!this._graph || !this._parameters) {
      throw new Error('Cannot initialize state: graph or parameters missing');
    }

    const nodeIds = this._graph.nodes.map(node => node.id);
    
    // Create state vector based on initial state type
    switch (this._parameters.initialStateType) {
      case 'delta': {
        // Single node excitation
        const nodeId = this._parameters.initialStateParams.nodeId;
        const value = this._parameters.initialStateParams.value || 1.0;
        
        if (!nodeIds.includes(nodeId)) {
          throw new Error(`Initial state node "${nodeId}" not found in the graph`);
        }
        
        this._currentState = SimulationStateVector.createDeltaState(nodeIds, nodeId, value);
        break;
      }
      
      case 'uniform': {
        // Uniform distribution across all nodes
        const value = this._parameters.initialStateParams.value || 1.0;
        this._currentState = SimulationStateVector.createUniformState(nodeIds, value);
        break;
      }
      
      case 'gaussian': {
        // Gaussian distribution centered at a node
        const centerNodeId = this._parameters.initialStateParams.centerNodeId;
        const sigma = this._parameters.initialStateParams.sigma || 1.0;
        
        if (!nodeIds.includes(centerNodeId)) {
          throw new Error(`Center node "${centerNodeId}" not found in the graph`);
        }
        
        // Create position map
        const nodePositions = new Map(
          this._graph.nodes.map(node => [node.id, node.position])
        );
        
        this._currentState = SimulationStateVector.createGaussianState(
          nodeIds, 
          centerNodeId, 
          sigma,
          nodePositions
        );
        break;
      }
      
      case 'custom': {
        // Custom state provided directly
        const values = this._parameters.initialStateParams.values;
        
        if (!Array.isArray(values) || values.length !== nodeIds.length) {
          throw new Error('Custom initial state values must be an array matching the number of nodes');
        }
        
        this._currentState = new SimulationStateVector(nodeIds, values);
        break;
      }
      
      default:
        throw new Error(`Unknown initial state type: ${this._parameters.initialStateType}`);
    }
    
    // Save a copy of the initial state
    this._initialState = this._currentState.clone();
    
    // Pre-compute the Laplacian matrix for evolution
    this._laplacianMatrix = this._createLaplacianMatrix();
  }
  
  /**
   * Create the Laplacian matrix for evolution
   */
  private _createLaplacianMatrix(): math.Matrix {
    if (!this._graph || !this._parameters) {
      throw new Error('Cannot create Laplacian: graph or parameters missing');
    }
    
    // Get the weight function based on the parameter
    const weightFunctionName = this._parameters.weightFunction;
    
    // This is a placeholder - in a real implementation, you would use a proper factory
    const weightFunction = (edge: SimulationEdge): number => {
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
  
  /**
   * Evolve the state by one time step
   */
  private _evolveState(): void {
    if (!this._graph || !this._parameters || !this._currentState || !this._laplacianMatrix) {
      throw new Error('Cannot evolve state: simulation not fully initialized');
    }
    
    const dt = this._parameters.timeStep;
    
    // Evolve based on diffusion type
    if (this._parameters.diffusionType === 'ordinary') {
      // For ordinary diffusion, use the analytic solution
      const alpha = this._parameters.alpha;
      const nodeIds = this._graph.nodes.map(node => node.id);
      
      // Get the current state as a math.js array
      const stateArray = this._currentState.toMathArray();
      
      // Solve the diffusion equation
      const newStateArray = MathAdapter.solveOrdinaryDiffusion(
        this._laplacianMatrix,
        stateArray,
        alpha,
        dt
      );
      
      // Update current state
      this._currentState = SimulationStateVector.fromMathArray(
        newStateArray as unknown as math.MathArray,
        nodeIds
      );
      
      // Check for numerical stability
      this._stabilityCheckCounter++;
      const normalizeFrequency = this._parameters.parameters?.normalizeFrequency || 10;
      
      if (this._stabilityCheckCounter >= normalizeFrequency) {
        this._stabilityCheckCounter = 0;
        
        // Monitor stability and normalize if needed
        const stabilityResult = monitorSimulationStability(
          this._currentState,
          this._currentTime,
          this._parameters,
          this._logger
        );
        
        // Update state if normalization occurred
        if (stabilityResult.normalized) {
          this._currentState = stabilityResult.stateVector;
          this._notifyListeners(SimulationEvent.STATE_NORMALIZED, {
            time: this._currentTime,
            volume: stabilityResult.volume
          });
        }
      }
      
    } else if (this._parameters.diffusionType === 'telegraph') {
      // For telegraph equation, need to solve second-order ODE
      // This requires more state information (velocity)
      // Simplified implementation pending
      
      this._logger.warn(LogCategory.MODEL, 'Telegraph equation evolution not fully implemented yet. Using approximate solution.');
      
      // Implement a basic version of the telegraph equation
      const alpha = this._parameters.alpha || 1.0;
      const beta = this._parameters.beta || 0.1;
      const nodeIds = this._graph.nodes.map(node => node.id);
      
      // Get the current state as a math.js array
      const stateArray = this._currentState.toMathArray();
      
      // For now, we'll use a simplified approach similar to ordinary diffusion
      // but with dampening
      const newStateArray = MathAdapter.solveOrdinaryDiffusion(
        this._laplacianMatrix,
        stateArray,
        alpha * Math.exp(-beta * this._currentTime), // Damped diffusion coefficient
        dt
      );
      
      // Update current state
      this._currentState = SimulationStateVector.fromMathArray(
        newStateArray as unknown as math.MathArray,
        nodeIds
      );
      
      // Check for numerical stability
      const stabilityResult = monitorSimulationStability(
        this._currentState,
        this._currentTime,
        this._parameters,
        this._logger
      );
      
      // Update state if normalization occurred
      if (stabilityResult.normalized) {
        this._currentState = stabilityResult.stateVector;
        this._notifyListeners(SimulationEvent.STATE_NORMALIZED, {
          time: this._currentTime,
          volume: stabilityResult.volume
        });
      }
      
    } else {
      throw new Error(`Unknown diffusion type: ${this._parameters.diffusionType}`);
    }
    
    // Update current time
    this._currentTime += dt;
    
    // Log simulation progress periodically
    if (Math.floor(this._currentTime / dt) % 100 === 0) {
      this._logger.info(LogCategory.GENERAL, `Simulation at t=${this._currentTime.toFixed(4)}`);
    }
  }
  
  /**
   * Notify listeners of an event
   */
  private _notifyListeners(event: string, data?: any): void {
    if (!this._eventListeners.has(event)) {
      return;
    }
    
    const listeners = this._eventListeners.get(event)!;
    for (const callback of listeners) {
      try {
        if (data !== undefined) {
          callback(data);
        } else {
          callback();
        }
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }
  }
  
  /**
   * Initialize the simulation with a graph and parameters
   */
  initialize(graph: SimulationGraph, parameters: SimulationParameters): void {
    this._graph = graph;
    this._parameters = parameters;
    this._currentTime = 0;
    this._running = false;
    this._history.clear();
    this._stabilityCheckCounter = 0;
    
    // Set default stability parameters if not provided
    if (!parameters.parameters) {
      parameters.parameters = {};
    }
    
    if (parameters.parameters.stabilityThreshold === undefined) {
      parameters.parameters.stabilityThreshold = 1e6;
    }
    
    if (parameters.parameters.autoNormalize === undefined) {
      parameters.parameters.autoNormalize = true;
    }
    
    if (parameters.parameters.normalizeFrequency === undefined) {
      parameters.parameters.normalizeFrequency = 10;
    }
    
    // Log initialization
    this._logger.info(LogCategory.GENERAL, 'Initializing simulation', {
      nodeCount: graph.getNodeCount(),
      edgeCount: graph.getEdgeCount(),
      diffusionType: parameters.diffusionType,
      timeStep: parameters.timeStep,
      totalTime: parameters.totalTime,
      numericalMethod: parameters.numericalMethod
    });
    
    // Create initial state based on parameters
    this._initializeState();
    
    // Record initial state in history if needed
    if (parameters.recordHistory) {
      this._history.addState(0, this._currentState!);
    }
    
    // Notify listeners
    this._notifyListeners(SimulationEvent.SIMULATION_RESET);
    
    // Log successful initialization
    this._logger.info(LogCategory.GENERAL, 'Simulation initialized successfully');
  }
  
  /**
   * Run simulation for one step
   */
  step(): void {
    if (!this._graph || !this._parameters || !this._currentState) {
      throw new Error('Simulation not initialized');
    }
    
    // Check if we've reached the total simulation time
    if (this._currentTime >= this._parameters.totalTime) {
      this._running = false;
      this._notifyListeners(SimulationEvent.SIMULATION_COMPLETE);
      return;
    }
    
    // Advance the simulation by one time step
    this._evolveState();
    
    // Record state in history if needed
    if (this._parameters.recordHistory && 
        Math.round(this._currentTime / this._parameters.historyInterval) * 
        this._parameters.historyInterval === this._currentTime) {
      this._history.addState(this._currentTime, this._currentState);
    }
    
    // Notify listeners
    this._notifyListeners(SimulationEvent.STEP_COMPLETE);
  }
  
  /**
   * Run simulation until a specific time
   */
  runUntil(time: number): void {
    if (!this._graph || !this._parameters || !this._currentState) {
      throw new Error('Simulation not initialized');
    }
    
    if (time <= this._currentTime) {
      return;
    }
    
    this._running = true;
    this._notifyListeners(SimulationEvent.SIMULATION_RESUMED);
    
    // Run until we reach the target time or total simulation time
    const targetTime = Math.min(time, this._parameters.totalTime);
    while (this._running && this._currentTime < targetTime) {
      this.step();
    }
  }
  
  /**
   * Run simulation for a specific number of steps
   */
  runSteps(steps: number): void {
    if (!this._graph || !this._parameters || !this._currentState) {
      throw new Error('Simulation not initialized');
    }
    
    if (steps <= 0) {
      return;
    }
    
    this._running = true;
    this._notifyListeners(SimulationEvent.SIMULATION_RESUMED);
    
    // Run for the specified number of steps, or until we reach the end
    for (let i = 0; i < steps && this._running && this._currentTime < this._parameters.totalTime; i++) {
      this.step();
    }
    
    // Check if we've reached the end of the simulation
    if (this._currentTime >= this._parameters.totalTime) {
      this._running = false;
      this._notifyListeners(SimulationEvent.SIMULATION_COMPLETE);
    }
  }
  
  /**
   * Pause simulation
   */
  pause(): void {
    if (this._running) {
      this._running = false;
      this._notifyListeners(SimulationEvent.SIMULATION_PAUSED);
    }
  }
  
  /**
   * Resume simulation
   */
  resume(): void {
    if (!this._running && this._currentState && this._currentTime < this._parameters!.totalTime) {
      this._running = true;
      this._notifyListeners(SimulationEvent.SIMULATION_RESUMED);
    }
  }
  
  /**
   * Reset simulation to initial state
   */
  reset(): void {
    if (!this._graph || !this._parameters) {
      throw new Error('Simulation not initialized');
    }
    
    this._currentTime = 0;
    this._running = false;
    this._currentState = this._initialState!.clone();
    this._history.clear();
    
    // Record initial state in history if needed
    if (this._parameters.recordHistory) {
      this._history.addState(0, this._currentState);
    }
    
    this._notifyListeners(SimulationEvent.SIMULATION_RESET);
  }
  
  /**
   * Get current state
   */
  getCurrentState(): StateVector {
    if (!this._currentState) {
      throw new Error('Simulation not initialized');
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
   * Get simulation history
   */
  getHistory(): SimulationHistory {
    return this._history;
  }
  
  /**
   * Check if simulation is running
   */
  isRunning(): boolean {
    return this._running;
  }
  
  /**
   * Add event listener
   */
  addEventListener(event: string, callback: Function): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    
    const listeners = this._eventListeners.get(event)!;
    if (!listeners.includes(callback)) {
      listeners.push(callback);
    }
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(event: string, callback: Function): void {
    if (!this._eventListeners.has(event)) {
      return;
    }
    
    const listeners = this._eventListeners.get(event)!;
    const index = listeners.indexOf(callback);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }
  
  /**
   * Set the current state (used for normalization and stability control)
   */
  _setCurrentState(state: StateVector): void {
    if (!this._graph || !this._parameters) {
      throw new Error('Simulation not initialized');
    }
    
    // Verify that the state is compatible with the graph
    if (state.size !== this._graph.getNodeCount()) {
      throw new Error(`State size mismatch: expected ${this._graph.getNodeCount()}, got ${state.size}`);
    }
    
    // Set the new state
    this._currentState = state;
    
    // Notify listeners of state change
    this._notifyListeners(SimulationEvent.STATE_NORMALIZED);
    this._notifyListeners(SimulationEvent.STEP_COMPLETE);
  }
}
