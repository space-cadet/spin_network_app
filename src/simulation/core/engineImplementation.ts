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
  DiffusionModel
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
    
    // Create the initial state
    this.createInitialState(parameters);
    
    // Clear history
    this.history.clear();
    
    // Always record initial state to ensure history exists
    // This is critical for ensuring the debug panel shows history data
    if (this.state) {
      this.history.addState(0, this.state);
      console.log("Recorded initial state in history at time 0");
    } else {
      console.error("Cannot record initial state: state is null");
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
    if (nodeIds.length === 0) {
      console.error("Cannot create initial state: graph has no nodes");
      return;
    }
    
    this.state = new SimulationStateVector(nodeIds);
    this.initialState = this.state.clone();
    
    // Apply the initial state based on parameters
    const { initialStateType, initialStateParams } = parameters;
    
    if (initialStateType === 'delta') {
      try {
        // Validate that the node ID exists in the network
        let nodeId = initialStateParams.nodeId;
        
        // If node ID is missing or not in the graph, use the first node
        if (!nodeId || !this.graph.getNode(nodeId)) {
          nodeId = nodeIds[0];
          console.warn(`Initial state node ID ${initialStateParams.nodeId} is invalid, using ${nodeId} instead`);
        }
        
        const value = initialStateParams.value || 1.0;
        this.state = this.state.setValue(nodeId, value);
      } catch (error) {
        console.error("Error setting delta state:", error);
        
        // Fallback: Set first node to 1.0 if available
        if (nodeIds.length > 0) {
          const nodeId = nodeIds[0];
          console.warn(`Falling back to first node ${nodeId} for initial state`);
          try {
            this.state = this.state.setValue(nodeId, 1.0);
          } catch (fallbackError) {
            console.error("Critical error: Failed to set fallback initial state:", fallbackError);
          }
        }
      }
    }
    else if (initialStateType === 'uniform') {
      try {
        // Set all nodes to the same value
        const value = initialStateParams.value || 0.1;
        for (const nodeId of nodeIds) {
          this.state = this.state.setValue(nodeId, value);
        }
      } catch (error) {
        console.error("Error setting uniform state:", error);
      }
    }
    else if (initialStateType === 'gaussian') {
      try {
        // Create a Gaussian distribution centered on a node
        let centerNodeId = initialStateParams.nodeId;
        
        // Validate that the center node ID exists
        if (!centerNodeId || !this.graph.getNode(centerNodeId)) {
          centerNodeId = nodeIds[0];
          console.warn(`Center node ID ${initialStateParams.nodeId} is invalid, using ${centerNodeId} instead`);
        }
        
        const centerValue = initialStateParams.centerValue || 1.0;
        const sigma = initialStateParams.sigma || 1.0;
        
        // Set center node
        this.state = this.state.setValue(centerNodeId, centerValue);
        
        // Get center node position
        const centerNode = this.graph.getNode(centerNodeId);
        if (!centerNode) {
          console.error("Center node not found even after validation");
          return;
        }
        
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
      } catch (error) {
        console.error("Error setting Gaussian state:", error);
        
        // Fallback to a simple delta state on the first node
        if (nodeIds.length > 0) {
          try {
            console.warn("Falling back to delta state on first node");
            this.state = this.state.setValue(nodeIds[0], 1.0);
          } catch (fallbackError) {
            console.error("Critical error: Failed to set fallback state:", fallbackError);
          }
        }
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
    
    // Always record state to ensure history is available
    // This ensures the debug panel can access history data
    this.history.addState(this.currentTime, this.state);
    
    // Log every Nth step to avoid excessive logging
    if (this.stepCounter % 10 === 0) {
      console.log(`Recorded state at step ${this.stepCounter}, time ${this.currentTime}`);
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
    console.log("Getting conservation laws...");
    
    if (!this.state) {
      console.warn("Cannot get conservation laws: state is null");
      return {
        totalProbability: 0,
        normVariation: 0,
        positivity: false,
      };
    }

    if (!this.initialState) {
      console.warn("Cannot get conservation laws: initialState is null");
      return {
        totalProbability: 0,
        normVariation: 0,
        positivity: false,
      };
    }

    try {
      // Calculate L2 norm (sqrt of sum of squares) instead of deviation
      let initialNorm = 0;
      let currentNorm = 0;
      
      // Calculate norms directly
      for (let i = 0; i < this.state.size; i++) {
        const initialValue = this.initialState.getValueAtIndex(i);
        const currentValue = this.state.getValueAtIndex(i);
        
        initialNorm += initialValue * initialValue;
        currentNorm += currentValue * currentValue;
      }
      
      // Take square root to get actual norms
      initialNorm = Math.sqrt(initialNorm);
      currentNorm = Math.sqrt(currentNorm);
      
      console.log("Conservation calculation:", {
        initialNorm,
        currentNorm,
        stateSize: this.state.size
      });
      
      // Calculate the variation
      const normVariation = Math.abs(currentNorm - initialNorm) / 
                           (initialNorm > 1e-10 ? initialNorm : 1.0);
      
      // Check positivity
      let positivity = true;
      for (let i = 0; i < this.state.size; i++) {
        if (this.state.getValueAtIndex(i) < -1e-10) {
          positivity = false;
          break;
        }
      }
      
      console.log("Conservation laws calculated:", {
        totalProbability: currentNorm,
        normVariation,
        positivity
      });
      
      return {
        totalProbability: currentNorm,
        normVariation,
        positivity,
      };
    } catch (error) {
      console.error("Error calculating conservation laws:", error);
      return {
        totalProbability: 0,
        normVariation: 0,
        positivity: false,
      };
    }
  }
}
