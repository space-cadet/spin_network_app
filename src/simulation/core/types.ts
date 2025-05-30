/**
 * Type definitions for the simulation component of the Spin Network application
 * 
 * This file defines the core interfaces for the simulation component,
 * independent of any specific visualization library to support both
 * Cytoscape.js (current) and future three.js 3D visualization.
 */

import { Matrix, MathArray, mod } from 'mathjs';
import { SpinNetwork } from '../../models/types';
import { IntertwinerData } from '../../models/types';

/**
 * Represents a graph structure for simulation
 */
export interface SimulationGraph {
  // Core graph properties
  readonly nodes: SimulationNode[];
  readonly edges: SimulationEdge[];
  
  // Accessor methods
  getNode(id: string): SimulationNode | undefined;
  getEdge(id: string): SimulationEdge | undefined;
  getAdjacentNodes(nodeId: string): SimulationNode[];
  getConnectedEdges(nodeId: string): SimulationEdge[];
  
  // Graph metrics
  getNodeCount(): number;
  getEdgeCount(): number;
  
  // Graph operations - returns a new graph
  addNode(node: SimulationNode): SimulationGraph;
  removeNode(nodeId: string): SimulationGraph;
  addEdge(edge: SimulationEdge): SimulationGraph;
  removeEdge(edgeId: string): SimulationGraph;
  
  // Graph analysis
  getDegree(nodeId: string): number;
  getNeighbors(nodeId: string): string[];
  
  // Conversion to/from application model
  fromSpinNetwork(network: SpinNetwork): SimulationGraph;
  toSpinNetwork(networkTemplate?: SpinNetwork): SpinNetwork;
  
  // Conversion to matrix representation
  toAdjacencyMatrix(): Matrix;
  toLaplacianMatrix(weightFunction?: WeightFunction): Matrix;
}

/**
 * Represents a node in the simulation graph
 */
export interface SimulationNode {
  readonly id: string;
  readonly intertwiner: number; // The intertwiner value for quantum geometric calculations
  readonly position: NodePosition; // Position that can support both 2D and 3D
  readonly properties: Record<string, any>; // Additional simulation-specific properties
}

/**
 * Position interface that supports both 2D and 3D coordinates
 */
export interface NodePosition {
  readonly x: number;
  readonly y: number;
  readonly z?: number; // Optional for 2D networks, required for 3D
}

/**
 * Represents an edge in the simulation graph
 */
export interface SimulationEdge {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly spin: number; // The spin value (typically a half-integer)
  readonly properties: Record<string, any>; // Additional simulation-specific properties
}

/**
 * State vector representing the quantum state of the network
 */
export interface StateVector {
  // Core properties
  readonly size: number;
  readonly nodeIds: string[]; // Maps indices to node IDs
  
  // Access methods
  getValue(nodeId: string): number;
  setValue(nodeId: string, value: number): StateVector;
  getValueAtIndex(index: number): number;
  setValueAtIndex(index: number, value: number): StateVector;
  
  // Vector operations - all return new vectors
  add(other: StateVector): StateVector;
  subtract(other: StateVector): StateVector;
  multiply(scalar: number): StateVector;
  
  // Math.js integration
  toMathArray(): MathArray;
  fromMathArray(array: MathArray, nodeIds: string[]): StateVector;
  
  // Utility methods
  normalize(): StateVector;
  clone(): StateVector;
  equals(other: StateVector): boolean;
  
  // Conversion to/from application model
  toVisualizationState(): import('../visualization/cytoscapeAdapter').CytoscapeVisualizationState;
}

/**
 * Function type for calculating edge weights based on spin values
 */
export type WeightFunction = (edge: SimulationEdge) => number;

/**
 * Standard weight functions for spin networks
 */
export enum StandardWeightFunction {
  SPIN = 'spin', // w_{ij} = j_{ij}
  CASIMIR = 'casimir', // w_{ij} = j_{ij}(j_{ij} + 1)
  DIMENSION = 'dimension', // w_{ij} = 2j_{ij} + 1
  AREA = 'area' // w_{ij} = sqrt(j_{ij}(j_{ij} + 1))
}

/**
 * Factory for standard weight functions
 */
export interface WeightFunctionFactory {
  getWeightFunction(type: StandardWeightFunction | string): WeightFunction;
  registerWeightFunction(name: string, fn: WeightFunction): void;
}

/**
 * Interface for a diffusion model
 */
export interface DiffusionModel {
  // Initialize the model with a graph and parameters
  initialize(graph: SimulationGraph, parameters: SimulationParameters): void;
  
  // Set initial state
  setInitialState(state: StateVector): void;
  
  // Evolve the state by one time step
  evolveStep(dt: number): StateVector;
  
  // Evolve to a specific time
  evolveTo(t: number, dt: number): StateVector;
  
  // Current state access
  getCurrentState(): StateVector;
  getCurrentTime(): number;
  
  // Reset the simulation
  reset(): void;
}

/**
 * Interface for a numerical solver
 */
export interface NumericalSolver {
  // Solve one step of a differential equation
  // y' = f(t, y), from t to t+dt
  step(
    t: number,
    y: StateVector,
    dt: number,
    f: (t: number, y: StateVector) => StateVector
  ): StateVector;
}

/**
 * Interface for a geometrical property calculator
 */
export interface GeometricCalculator {
  // Calculate total volume
  calculateTotalVolume(state: StateVector): number;
  
  // Calculate volume entropy (a measure of volume distribution)
  calculateVolumeEntropy(state: StateVector): number;
  
  // Calculate total area (based on edge spins)
  calculateTotalArea(graph: SimulationGraph): number;
  
  // Calculate effective dimension
  calculateEffectiveDimension(graph: SimulationGraph, state: StateVector): number;
  
  // Calculate other geometric properties
  calculateProperty(name: string, graph: SimulationGraph, state: StateVector): number;
}

/**
 * Simulation parameters for configuring the diffusion model
 */
export interface SimulationParameters {
  // General simulation parameters
  timeStep: number;
  totalTime: number;
  
  // Diffusion model parameters
  diffusionType: 'ordinary' | 'telegraph';
  alpha: number; // Diffusion coefficient for ordinary diffusion
  beta?: number; // Damping coefficient for telegraph equation
  c?: number; // Wave speed for telegraph equation
  
  // Numerical method parameters
  numericalMethod: 'euler' | 'rk4' | 'adaptive';
  tolerance?: number; // Error tolerance for adaptive methods
  
  // Weight function configuration
  weightFunction: StandardWeightFunction | string;
  
  // Initial state configuration
  initialStateType: 'delta' | 'uniform' | 'gaussian' | 'custom';
  initialStateParams: Record<string, any>;
  
  // Analysis and visualization
  recordHistory: boolean;
  historyInterval: number;
  
  // Additional parameters
  parameters: Record<string, any>;
}

/**
 * Interface for simulation history recording
 */
export interface SimulationHistory {
  // Add a state to the history
  addState(time: number, state: StateVector): void;
  
  // Get a state at a specific time
  getStateAtTime(time: number): StateVector | undefined;
  
  // Get the closest state to a specific time
  getClosestState(time: number): { time: number; state: StateVector } | undefined;
  
  // Get all recorded times
  getTimes(): number[];
  
  // Get total history duration
  getDuration(): number;
  
  // Clear history
  clear(): void;
}

/**
 * Interface for the main simulation engine
 */
export interface SimulationEngine {
  // Setup the simulation
  initialize(graph: SimulationGraph, parameters: SimulationParameters): void;
  
  // Run simulation for one step
  step(): void;
  
  // Run simulation until a specific time
  runUntil(time: number): void;
  
  // Run simulation for a specific number of steps
  runSteps(steps: number): void;
  
  // Pause/resume simulation
  pause(): void;
  resume(): void;
  
  // Reset simulation to initial state
  reset(): void;
  
  // Access current state
  getCurrentState(): StateVector;
  getCurrentTime(): number;
  
  // Access simulation history
  getHistory(): SimulationHistory;
  
  // Current simulation status
  isRunning(): boolean;
  
  // Event handling
  addEventListener(event: string, callback: Function): void;
  removeEventListener(event: string, callback: Function): void;
}

/**
 * Interface for visualization adapter
 * Converts simulation state to visualization-specific format
 */
export interface VisualizationAdapter<T> {
  // Convert simulation state to visualization format
  stateToVisualization(state: StateVector, graph: SimulationGraph): T;
  
  // Update existing visualization with new state
  updateVisualization(visualization: T, state: StateVector, graph: SimulationGraph): void;
  
  // Create initial visualization
  createVisualization(graph: SimulationGraph): T;
}
