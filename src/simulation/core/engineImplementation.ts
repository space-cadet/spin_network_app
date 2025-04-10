/**
 * Implementation of the SpinNetworkSimulationEngine class
 * 
 * This file provides the actual implementation of the simulation engine
 * that was previously a placeholder in index.ts.
 */

import {
  SimulationEngine,
  SimulationGraph,
  SimulationParameters,
  SimulationHistory,
  StateVector,
  DiffusionModel,
  NumericalSolver
} from './types';
import { DiffusionModelFactory } from '../models/diffusionModels';
import { SolverFactory } from '../models/solvers';
import { SimulationStateVector } from './stateVector';
import { ProbabilityConservation } from '../analysis/conservation';

/**
 * Implementation of the SimulationHistory interface
 */
export class SimulationHistoryImpl implements SimulationHistory {
  private states: Map<number, StateVector> = new Map();
  private times: number[] = [];

  constructor(private maxEntries: number = 1000) {}

  /**
   * Add a state to the history
   */
  addState(time: number, state: StateVector): void {
    // Skip if we already have a state at this exact time
    if (this.states.has(time)) {
      return;
    }

    // Add the state and time
    this.states.set(time, state.clone());
    this.times.push(time);
    
    // Sort times to ensure they are in order
    this.times.sort((a, b) => a - b);
    
    // Remove oldest entries if we exceed maxEntries
    while (this.times.length > this.maxEntries) {
      const oldestTime = this.times.shift();
      if (oldestTime !== undefined) {
        this.states.delete(oldestTime);
      }
    }
  }

  /**
   * Get a state at a specific time
   */
  getStateAtTime(time: number): StateVector | undefined {
    return this.states.get(time);
  }

  /**
   * Get the closest state to a specific time
   */
  getClosestState(time: number): { time: number; state: StateVector } | undefined {
    if (this.times.length === 0) {
      return undefined;
    }

    // Find the closest time
    let closestTime = this.times[0];
    let minDistance = Math.abs(time - closestTime);

    for (const t of this.times) {
      const distance = Math.abs(time - t);
      if (distance < minDistance) {
        minDistance = distance;
        closestTime = t;
      }
    }

    const state = this.states.get(closestTime);
    if (!state) {
      return undefined;
    }

    return { time: closestTime, state };
  }

  /**
   * Get all recorded times
   */
  getTimes(): number[] {
    return [...this.times];
  }

  /**
   * Get total history duration
   */
  getDuration(): number {
    if (this.times.length < 2) {
      return 0;
    }
    return this.times[this.times.length - 1] - this.times[0];
  }

  /**
   * Clear history
   */
  clear(): void {
    this.states.clear();
    this.times = [];
  }
}

/**
 * Implementation of the SpinNetworkSimulationEngine class
 */
export class SpinNetworkSimulationEngineImpl implements SimulationEngine {
  private graph: SimulationGraph | null = null;
  private parameters: SimulationParameters | null = null;
  private diffusionModel: DiffusionModel | null = null;
  private solver: NumericalSolver | null = null;
  private state: StateVector | null = null;
  private initialState: StateVector | null = null;
  private currentTime: number = 0;
  private running: boolean = false;
  private history: SimulationHistoryImpl = new SimulationHistoryImpl();
  private eventListeners: Record<string, Function[]> = {};
  private stepCounter: number = 0;

  /**
   * Initialize the simulation engine
   */
  initialize(graph: SimulationGraph, parameters: SimulationParameters): void {
    this.graph = graph;
    this.parameters = { ...parameters };
    this.currentTime = 0;
    this.stepCounter = 0;
    
    // Create the diffusion model
    const diffusionFactory = new DiffusionModelFactory();
    this.diffusionModel = diffusionFactory.createDiffusionModel(parameters.diffusionType);
    
    // Initialize the diffusion model
    if (this.diffusionModel) {
      this.diffusionModel.initialize(graph, parameters);
    }
    
    // Create the solver
    const solverFactory = new SolverFactory();
    this.solver = solverFactory.createSolver(parameters.numericalMethod);
    
    // Create the initial state
    this.createInitialState(parameters);
    
    // Clear history
    this.history.clear();
    
    // Record initial state if history recording is enabled
    if (parameters.recordHistory && this.state) {
      this.history.addState(0, this.state);
    }
    
    // Fire initialized event
    this.dispatchEvent('initialized', { graph, parameters });
  }

  /**
   * Create the initial state based on parameters
   */
  private createInitialState(parameters: SimulationParameters): void {
    if (!this.graph) return;
    
    const nodeIds = this.graph.nodes.map(node => node.id);
    this.state = new SimulationStateVector(nodeIds);
    this.initialState = this.state.clone();
    
    // Apply the initial state based on parameters
    const { initialStateType, initialStateParams } = parameters;
    
    if (initialStateType === 'delta') {
      // Set a single node to 1.0 (or specified value)
      const nodeId = initialStateParams.nodeId || nodeIds[0];
      const value = initialStateParams.value || 1.0;
      this.state = this.state.setValue(nodeId, value);
    }
    else if (initialStateType === 'uniform') {
      // Set all nodes to the same value
      const value = initialStateParams.value || 0.1;
      for (const nodeId of nodeIds) {
        this.state = this.state.setValue(nodeId, value);
      }
    }
    else if (initialStateType === 'gaussian') {
      // Create a Gaussian distribution centered on a node
      const centerNodeId = initialStateParams.nodeId || nodeIds[0];
      const centerValue = initialStateParams.centerValue || 1.0;
      const sigma = initialStateParams.sigma || 1.0;
      
      // Set center node
      this.state = this.state.setValue(centerNodeId, centerValue);
      
      // Get center node position
      const centerNode = this.graph.getNode(centerNodeId);
      if (!centerNode) return;
      
      // Set other nodes based on distance
      for (const nodeId of nodeIds) {
        if (nodeId === centerNodeId) continue;
        
        const node = this.graph.getNode(nodeId);
        if (!node) continue;
        
        // Calculate Euclidean distance
        const dx = node.position.x - centerNode.position.x;
        const dy = node.position.y - centerNode.position.y;
        const dz = (node.position.z || 0) - (centerNode.position.z || 0);
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Calculate Gaussian value
        const value = centerValue * Math.exp(-(distance*distance) / (2*sigma*sigma));
        this.state = this.state.setValue(nodeId, value);
      }
    }
    
    // Save a copy of the initial state
    this.initialState = this.state.clone();
    
    // Set the initial state on the diffusion model
    if (this.diffusionModel && this.state) {
      this.diffusionModel.setInitialState(this.state);
    }
  }

  /**
   * Run simulation for one step
   */
  step(): void {
    if (!this.diffusionModel || !this.state || !this.parameters) return;
    
    // Evolve the state by one time step
    const dt = this.parameters.timeStep;
    this.state = this.diffusionModel.evolveStep(dt);
    
    // Update current time
    this.currentTime += dt;
    this.stepCounter++;
    
    // Record state if history recording is enabled
    if (this.parameters.recordHistory && this.stepCounter % this.parameters.historyInterval === 0) {
      this.history.addState(this.currentTime, this.state);
    }
    
    // Dispatch step event
    this.dispatchEvent('step', { time: this.currentTime, state: this.state });
  }

  /**
   * Run simulation until a specific time
   */
  runUntil(time: number): void {
    if (!this.diffusionModel || !this.state || !this.parameters) return;
    
    this.running = true;
    
    // Calculate the number of steps needed
    const dt = this.parameters.timeStep;
    const steps = Math.ceil((time - this.currentTime) / dt);
    
    // Run the simulation
    for (let i = 0; i < steps && this.running; i++) {
      this.step();
    }
    
    this.running = false;
  }

  /**
   * Run simulation for a specific number of steps
   */
  runSteps(steps: number): void {
    if (!this.diffusionModel || !this.state) return;
    
    this.running = true;
    
    // Run the simulation
    for (let i = 0; i < steps && this.running; i++) {
      this.step();
    }
    
    this.running = false;
  }

  /**
   * Pause simulation
   */
  pause(): void {
    this.running = false;
    this.dispatchEvent('pause', { time: this.currentTime });
  }

  /**
   * Resume simulation
   */
  resume(): void {
    this.running = true;
    this.dispatchEvent('resume', { time: this.currentTime });
  }

  /**
   * Reset simulation to initial state
   */
  reset(): void {
    if (!this.initialState || !this.diffusionModel) return;
    
    this.state = this.initialState.clone();
    this.currentTime = 0;
    this.stepCounter = 0;
    
    // Reset the diffusion model
    this.diffusionModel.reset();
    this.diffusionModel.setInitialState(this.state);
    
    // Clear history
    this.history.clear();
    
    // Record initial state if history recording is enabled
    if (this.parameters?.recordHistory) {
      this.history.addState(0, this.state);
    }
    
    // Dispatch reset event
    this.dispatchEvent('reset', { state: this.state });
  }

  /**
   * Get the current state
   */
  getCurrentState(): StateVector {
    if (!this.state) {
      // Create a dummy state if none exists
      const nodeIds = this.graph?.nodes.map(node => node.id) || [];
      return new SimulationStateVector(nodeIds);
    }
    return this.state;
  }

  /**
   * Get the current time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Get simulation history
   */
  getHistory(): SimulationHistory {
    return this.history;
  }

  /**
   * Check if simulation is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Add an event listener
   */
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Remove an event listener
   */
  removeEventListener(event: string, callback: Function): void {
    if (!this.eventListeners[event]) return;
    
    this.eventListeners[event] = this.eventListeners[event].filter(
      listener => listener !== callback
    );
  }

  /**
   * Dispatch an event
   */
  private dispatchEvent(event: string, data: any): void {
    if (!this.eventListeners[event]) return;
    
    for (const listener of this.eventListeners[event]) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
  }

  /**
   * Get conservation laws for the current state
   */
  getConservationLaws() {
    if (!this.state) {
      return {
        totalProbability: 0,
        normVariation: 0,
        positivity: false,
      };
    }

    // Use the ProbabilityConservation checker
    const conservationChecker = new ProbabilityConservation();
    
    // Get the initial probability if available
    const initialProbability = this.initialState ? 
      conservationChecker.getValue(this.initialState) : 1.0;
    
    // Calculate current probability
    const currentProbability = conservationChecker.getValue(this.state);
    
    // Calculate the variation
    const normVariation = Math.abs(currentProbability - initialProbability);
    
    // Check positivity
    let positivity = true;
    for (const nodeId of this.state.nodeIds) {
      if (this.state.getValue(nodeId) < 0) {
        positivity = false;
        break;
      }
    }
    
    return {
      totalProbability: currentProbability,
      normVariation,
      positivity,
    };
  }
}
