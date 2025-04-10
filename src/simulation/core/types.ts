/**
 * Type definitions for the simulation component of the Spin Network application
 */

/**
 * Represents a graph structure for simulation
 */
export interface Graph {
  // Core graph properties
  nodes: SimulationNode[];
  edges: SimulationEdge[];
  
  // Accessor methods
  getNode(id: string): SimulationNode | undefined;
  getEdge(id: string): SimulationEdge | undefined;
  getAdjacentNodes(nodeId: string): SimulationNode[];
  getConnectedEdges(nodeId: string): SimulationEdge[];
  
  // Graph metrics
  getNodeCount(): number;
  getEdgeCount(): number;
  
  // Graph operations - returns a new graph
  addNode(node: SimulationNode): Graph;
  removeNode(nodeId: string): Graph;
  addEdge(edge: SimulationEdge): Graph;
  removeEdge(edgeId: string): Graph;
  
  // Graph analysis
  getDegree(nodeId: string): number;
  getNeighbors(nodeId: string): string[];
  
  // Conversion to matrix representation
  toAdjacencyMatrix(): Matrix;
  toLaplacianMatrix(weightFunction?: WeightFunction): Matrix;
}

/**
 * Represents a node in the simulation graph
 */
export interface SimulationNode {
  id: string;
  intertwiner: number; // The intertwiner value for quantum geometric calculations
  properties: Record<string, any>; // Additional simulation-specific properties
}

/**
 * Represents an edge in the simulation graph
 */
export interface SimulationEdge {
  id: string;
  sourceId: string;
  targetId: string;
  spin: number; // The spin value (typically a half-integer)
  properties: Record<string, any>; // Additional simulation-specific properties
}

/**
 * Represents a matrix in the simulation
 */
export interface Matrix {
  // Core properties
  rows: number;
  cols: number;
  
  // Access methods
  get(row: number, col: number): number;
  set(row: number, col: number, value: number): void;
  
  // Matrix operations - all return new matrices
  add(other: Matrix): Matrix;
  subtract(other: Matrix): Matrix;
  multiply(other: Matrix): Matrix;
  scalarMultiply(scalar: number): Matrix;
  transpose(): Matrix;
  
  // Advanced operations
  inverse(): Matrix;
  eigenvalues(): number[];
  eigenvectors(): Matrix[];
  exp(): Matrix; // Matrix exponential
  
  // Utility methods
  toArray(): number[][];
  copy(): Matrix;
  equals(other: Matrix): boolean;
}

/**
 * Represents a state vector in the simulation
 */
export interface StateVector {
  // Core properties
  size: number;
  
  // Access methods
  get(index: number): number;
  set(index: number, value: number): void;
  
  // Vector operations - all return new vectors
  add(other: StateVector): StateVector;
  subtract(other: StateVector): StateVector;
  scalarMultiply(scalar: number): StateVector;
  dot(other: StateVector): number;
  
  // Utility methods
  norm(): number; // L2 norm
  normalize(): StateVector;
  toArray(): number[];
  copy(): StateVector;
  equals(other: StateVector): boolean;
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
 * Interface for a diffusion model
 */
export interface DiffusionModel {
  // Initialize the model with a graph and parameters
  initialize(graph: Graph, parameters: Record<string, any>): void;
  
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
  calculateTotalArea(graph: Graph): number;
  
  // Calculate effective dimension
  calculateEffectiveDimension(graph: Graph, state: StateVector): number;
  
  // Calculate other geometric properties
  calculateProperty(name: string, graph: Graph, state: StateVector): number;
}

/**
 * Interface for simulation configuration
 */
export interface SimulationConfig {
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
  weightFunction: StandardWeightFunction | WeightFunction;
  
  // Initial state configuration
  initialStateType: 'delta' | 'uniform' | 'gaussian' | 'custom';
  initialStateParams: Record<string, any>;
  
  // Analysis and visualization
  recordHistory: boolean;
  historyInterval: number;
  
  // Additional parameters
  parameters: Record<string, any>;
}
