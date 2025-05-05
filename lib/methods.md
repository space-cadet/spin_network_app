# Library Module Structure and Exports

## Module Organization
```
lib/
├── adapters/              // External adapters
├── analysis/             // Analysis utilities
├── core/                // Core mathematical operations
├── examples/            // Example implementations
├── graph/               // Graph operations
├── io/                 // Input/output operations
├── models/            // Core models
├── quantum/          // Quantum operations
├── tensor/          // Tensor operations
└── utils/          // Shared utilities
```

## Quantum Module
Located in `lib/quantum/`

### Core Types
```typescript
interface Complex {
  re: number;    // Real part
  im: number;    // Imaginary part
}

interface StateVector {
  dimension: number;      // Hilbert space dimension
  amplitudes: Complex[];  // State vector amplitudes
  basis?: string;        // Optional basis label
}

type OperatorType = 'unitary' | 'hermitian' | 'projection' | 'general';

interface Operator {
  dimension: number;
  type: OperatorType;
  apply(state: StateVector): StateVector;
  compose(other: Operator): Operator;
  adjoint(): Operator;
  toMatrix(): Complex[][];
  tensorProduct(other: Operator): Operator;
  partialTrace(dims: number[], traceOutIndices: number[]): Operator;
}

interface MeasurementOutcome {
  value: number;          // Measured eigenvalue
  state: StateVector;     // Post-measurement state
  probability: number;    // Measurement probability
}

interface DensityMatrix extends Operator {
  trace(): Complex;
  partialTrace(subsystemDimensions: number[]): DensityMatrix;
  purity(): number;
  vonNeumannEntropy(): number;
}

interface QuantumChannel {
  apply(state: DensityMatrix): DensityMatrix;
}
```

### Complex Number Operations
```typescript
function createComplex(re: number = 0, im: number = 0): Complex
function addComplex(a: Complex, b: Complex): Complex
function subtractComplex(a: Complex, b: Complex): Complex
function multiplyComplex(a: Complex, b: Complex): Complex
function conjugateComplex(c: Complex): Complex
function modulusComplex(c: Complex): number
function isZeroComplex(c: Complex, tolerance: number = 1e-10): boolean
```

### State Vector Operations
```typescript
class StateVector implements IStateVector {
  constructor(dimension: number, amplitudes?: Complex[], basis?: string)
  
  // State manipulation
  setState(index: number, value: Complex): void
  getState(index: number): Complex
  
  // Quantum operations
  innerProduct(other: StateVector): Complex
  norm(): number
  normalize(): StateVector
  tensorProduct(other: StateVector): StateVector
  
  // Utility methods
  isZero(tolerance?: number): boolean
  toArray(): Complex[]
  toString(): string
  
  // Static factory methods
  static computationalBasis(dimension: number, index: number): StateVector
  static computationalBasisStates(dimension: number): StateVector[]
  static superposition(coefficients: Complex[]): StateVector
  static equalSuperposition(dimension: number): StateVector
}

// Common quantum states
function createBasisState(dimension: number, index: number): StateVector
function createBellState(type: 'Phi+' | 'Phi-' | 'Psi+' | 'Psi-'): StateVector
function createGHZState(numQubits: number): StateVector
function createPlusState(): StateVector
function createMinusState(): StateVector
function createWState(numQubits: number): StateVector
```

### Quantum Operators
```typescript
class MatrixOperator implements Operator {
  constructor(matrix: Complex[][], type?: OperatorType)
  
  // Core operator methods
  apply(state: StateVector): StateVector
  compose(other: Operator): Operator
  adjoint(): Operator
  toMatrix(): Complex[][]
  tensorProduct(other: Operator): Operator
  partialTrace(dims: number[], traceOutIndices: number[]): Operator
}

// Standard quantum gates
const PauliX: Operator  // σx gate
const PauliY: Operator  // σy gate
const PauliZ: Operator  // σz gate
const Hadamard: Operator // H gate
const CNOT: Operator    // Controlled-NOT gate
```

### Measurement Operations
```typescript
class ProjectionOperator implements Operator {
  constructor(state: StateVector)
  
  // Inherited operator methods
  apply(state: StateVector): StateVector
  compose(other: Operator): Operator
  adjoint(): Operator
  toMatrix(): Complex[][]
  tensorProduct(other: Operator): Operator
  partialTrace(dims: number[], traceOutIndices: number[]): Operator
}

// Measurement functions
function expectationValue(state: StateVector, operator: Operator): Complex
function measureState(state: StateVector, operator: Operator): MeasurementOutcome
function createMeasurementOperator(observable: Operator, eigenvalue: number): Operator
```

### Mixed States and Quantum Channels
```typescript
class DensityMatrixOperator implements DensityMatrix {
  constructor(matrix: Complex[][])
  
  // Core density matrix methods
  apply(state: StateVector): StateVector
  trace(): Complex
  partialTrace(subsystemDimensions: number[]): DensityMatrix
  purity(): number
  vonNeumannEntropy(): number
  
  // Static factory methods
  static fromPureState(state: StateVector): DensityMatrix
  static mixedState(states: StateVector[], probabilities: number[]): DensityMatrix
}

class KrausChannel implements QuantumChannel {
  constructor(operators: Operator[])
  apply(state: DensityMatrix): DensityMatrix
}

// Quantum channel factory functions
function createDepolarizingChannel(dimension: number, p: number): QuantumChannel
function createAmplitudeDampingChannel(gamma: number): QuantumChannel
function createPhaseDampingChannel(gamma: number): QuantumChannel
function createBitFlipChannel(p: number): QuantumChannel
function createPhaseFlipChannel(p: number): QuantumChannel
```

### Hilbert Space Operations
```typescript
class HilbertSpace {
  constructor(dimension: number, basisLabels?: string[])
  
  // State creation
  computationalBasisState(i: number): StateVector
  computationalBasis(): StateVector[]
  superposition(coefficients: Complex[]): StateVector
  
  // Validation
  containsState(state: StateVector): boolean
}

// Composition operations
function composeSpaces(spaces: HilbertSpace[]): HilbertSpace
function composeStates(states: StateVector[]): StateVector
function composeOperators(operators: Operator[]): Operator
function bipartiteSplit(space: HilbertSpace, firstDimension: number): [HilbertSpace, HilbertSpace]
```

## Core Module
Located in `lib/core/`

### Core Types
```typescript
interface SimulationGraph {
  // Core properties
  readonly size: number
  readonly nodeIds: string[]
  
  // Access methods
  getValue(nodeId: string): number
  setValue(nodeId: string, value: number): StateVector
  getValueAtIndex(index: number): number
  setValueAtIndex(index: number, value: number): StateVector
}

interface SimulationNode {
  id: string
  position: NodePosition
  properties?: Record<string, any>
}

interface NodePosition {
  x: number
  y: number
  z?: number
}

interface SimulationEdge {
  id: string
  source: string | null
  target: string | null
  spin: number
  stateVector: {
    dimension: number
    amplitudes: Complex[]
    basis: string
  }
  area?: number
  properties?: Record<string, any>
}

interface StateVector {
  // Core properties
  readonly size: number
  readonly nodeIds: string[]

  // Access methods
  getValue(nodeId: string): number
  setValue(nodeId: string, value: number): StateVector
  getValueAtIndex(index: number): number
  setValueAtIndex(index: number, value: number): StateVector
  
  // Vector operations
  add(other: StateVector): StateVector
  subtract(other: StateVector): StateVector
  multiply(scalar: number): StateVector
  
  // Math.js integration
  toMathArray(): MathArray
  fromMathArray(array: MathArray, nodeIds: string[]): StateVector
  
  // Utility methods
  normalize(): StateVector
  clone(): StateVector
  equals(other: StateVector): boolean
  toJSON(): Record<string, any>
  toArray(): number[]
}

type WeightFunction = (edge: SimulationEdge) => number
```

## Tensor Operations
Located in `lib/tensor/`

### Core Types
```typescript
interface Complex {
  re: number
  im: number
}

interface SparseElement {
  indices: number[]
  value: Complex
}

interface TensorNode {
  id: string
  position: NodePosition
  tensor: {
    dimensions: number[]
    elements: SparseElement[]
  }
  volume?: number
  properties?: Record<string, any>
}

// Core tensor functions
function createTensorNode(
  id: string, 
  position: NodePosition,
  dimensions: number[]
): TensorNode

function setTensorElement(
  tensor: TensorNode['tensor'],
  indices: number[],
  value: Complex
): void

function getTensorElement(
  tensor: TensorNode['tensor'],
  indices: number[]
): Complex

function createTensorNodeFromBasisState(
  id: string,
  position: NodePosition,
  j1: number, j2: number, j3: number, j4: number,
  basisState: IntertwinerBasisState
): TensorNode

// Core state vector functions
function createStateVectorEdge(
  id: string,
  source: string | null,
  target: string | null,
  spin: number
): StateVectorEdge

function setStateVectorAmplitude(
  stateVector: StateVectorEdge['stateVector'],
  index: number,
  value: Complex
): void

function getStateVectorAmplitude(
  stateVector: StateVectorEdge['stateVector'],
  index: number
): Complex

function normalizeStateVector(
  stateVector: StateVectorEdge['stateVector']
): void

// Geometric calculations
function calculateNodeVolume(node: TensorNode): number
function calculateEdgeArea(edge: StateVectorEdge): number
```

### Math Adapter
```typescript
class MathAdapter {
  static createAdjacencyMatrix(graph: SimulationGraph): Matrix
  static createLaplacianMatrix(graph: SimulationGraph, weightFunction?: WeightFunction): Matrix
  static matrixExponential(matrix: Matrix, t: number): Matrix
  static eigenDecomposition(matrix: Matrix): { values: number[]; vectors: Matrix }
}
```

## Analysis Module
Located in `lib/analysis/`

### Geometric Properties
```typescript
interface GeometricCalculator {
  calculateTotalVolume(state: StateVector): number
  calculateTotalArea(graph: SimulationGraph): number
  calculateEffectiveDimension(graph: SimulationGraph, state: StateVector): number
  calculateVolumeEntropy(state: StateVector): number
  calculateProperty(name: string, graph: SimulationGraph, state: StateVector): number
}

class GeometricPropertiesCalculator implements GeometricCalculator {
  // Volume calculations
  calculateTotalVolume(state: StateVector): number  // Based on quantum state at nodes
  calculateVolumeEntropy(state: StateVector): number  // -Σ (v_i/V_tot) * ln(v_i/V_tot)
  
  // Area calculations  
  calculateTotalArea(graph: SimulationGraph): number  // Based on edge spins
  
  // Dimension calculations
  calculateEffectiveDimension(graph: SimulationGraph, state: StateVector): number  // Spectral dimension from Laplacian
  
  // Generic property calculator
  calculateProperty(name: string, graph: SimulationGraph, state: StateVector): number
}

// Convenience functions
function calculateVolume(state: StateVector): number
function calculateArea(graph: SimulationGraph): number
function calculateEffectiveDimension(graph: SimulationGraph, state: StateVector): number
function calculateVolumeEntropy(state: StateVector): number
```

### Statistical Analysis
```typescript
interface SimulationStatistics {
  mean: number
  variance: number
  standardDeviation: number
  min: number
  max: number
  nodeValues: number[]
  time: number
}

class SimulationAnalyzer {
  // Core analysis methods
  static calculateStatistics(state: StateVector, time: number): SimulationStatistics
  static analyzeHistory(history: SimulationHistory): SimulationStatistics[]
  
  // Advanced analysis
  static calculateMeanSquareDisplacement(initialState: StateVector, currentState: StateVector): number
  static calculateSpectralDimension(graph: SimulationGraph, times: number[], initialState: StateVector, diffusionFn: (t: number) => StateVector): { times: number[], dimensions: number[] }
  static calculateNodeCorrelations(state: StateVector, graph: SimulationGraph): number[][]
  static calculateDivergence(state1: StateVector, state2: StateVector): number
  static calculateRateOfChange(stats: SimulationStatistics[]): Record<string, number[]>
}

// Convenience functions
function calculateMeanSquareDisplacement(initialState: StateVector, currentState: StateVector): number
function calculateSpectralDimension(graph: SimulationGraph, times: number[], initialState: StateVector, diffusionFn: (t: number) => StateVector): { times: number[], dimensions: number[] }
function calculateReturnProbability(initialState: StateVector, currentState: StateVector): number
function calculateDiffusionCoefficient(times: number[], displacements: number[]): number
```

### Conservation Laws
```typescript
interface ConservationLawChecker {
  check(state: StateVector): boolean
  getDeviation(): number
  getName(): string
}

class ConservationCheckerFactory {
  createProbabilityChecker(): ConservationLawChecker
  createTotalOccupancyChecker(): ConservationLawChecker
  createPositivityChecker(): ConservationLawChecker
}

// Standard conservation checkers
class ProbabilityConservation implements ConservationLawChecker
class TotalOccupancyConservation implements ConservationLawChecker  
class PositivityConservation implements ConservationLawChecker

// Conservation check functions
function checkMassConservation(state: StateVector): boolean
function checkEnergyConservation(state: StateVector, hamiltonian: Complex[][]): boolean
```

## Graph Module
Located in `lib/graph/`

### Core Graph Types
```typescript
interface SimulationGraph {
  // Core properties
  nodes: SimulationNode[]
  edges: SimulationEdge[]
  size: number
  nodeIds: string[]
  
  // Access methods
  getNode(id: string): SimulationNode
  getEdge(id: string): SimulationEdge
  getAdjacentNodes(nodeId: string): SimulationNode[]
  getConnectedEdges(nodeId: string): SimulationEdge[]
  getNodeCount(): number
  getEdgeCount(): number
  
  // Modification methods
  addNode(node: SimulationNode): SimulationGraph
  removeNode(nodeId: string): SimulationGraph
  addEdge(edge: SimulationEdge): SimulationGraph
  removeEdge(edgeId: string): SimulationGraph
  
  // Graph analysis
  getDegree(nodeId: string): number
  getNeighbors(nodeId: string): string[]
  toAdjacencyMatrix(): Matrix
  toLaplacianMatrix(weightFunction?: WeightFunction): Matrix
  
  // Serialization
  toJSON(): Record<string, any>
  fromJSON(data: Record<string, any>): SimulationGraph
}

interface SimulationNode {
  id: string
  position: NodePosition
  properties?: Record<string, any>
}

interface SimulationEdge {
  id: string
  source: string | null
  target: string | null
  spin: number
  stateVector: {
    dimension: number
    amplitudes: Complex[]
    basis: string
  }
  area?: number
  properties?: Record<string, any>
}
```

## Models Module
Located in `lib/models/`

### Diffusion Models
```typescript
class OrdinaryDiffusionModel implements DiffusionModel { }
class TelegraphDiffusionModel implements DiffusionModel { }
class DiffusionModelFactory {
  static create(type: string, parameters: SimulationParameters): DiffusionModel
}
```

### Weight Functions
```typescript
class SpinWeightFunctionFactory {
  static getSpin(): WeightFunction
  static getCasimir(): WeightFunction
  static getDimension(): WeightFunction
  static getArea(): WeightFunction
}

function createIntertwinerWeightFunction(intertwinerSpace: IntertwinerSpace): WeightFunction
```

### Numerical Solvers
```typescript
class EulerSolver implements NumericalSolver { }
class MidpointSolver implements NumericalSolver { }
class RungeKutta4Solver implements NumericalSolver { }
class AdaptiveRKF45Solver implements NumericalSolver { }

class SolverFactory {
  static create(type: string): NumericalSolver
}
```

## I/O Module 
Located in `lib/io/`

### Export Functions
```typescript
function exportSimulation(engine: SimulationEngine, options?: ExportOptions): string
function downloadSimulationResults(engine: SimulationEngine, filename?: string): void
function downloadSimulationConfig(engine: SimulationEngine, filename?: string): void
function downloadSimulationGraph(engine: SimulationEngine, filename?: string): void
function downloadSimulationCSV(engine: SimulationEngine, filename?: string): void
function downloadAllSimulationData(engine: SimulationEngine, baseFilename?: string): void
```

### Import Functions
```typescript
function importSimulationFromJSON(json: string, engine: SimulationEngine): void
function importSimulationFromFile(file: File, engine: SimulationEngine): Promise<void>
function importGraphFromJSON(json: string): SimulationGraph
function importGraphFromFile(file: File): Promise<SimulationGraph>
function importConfigFromJSON(json: string): SimulationParameters
function importConfigFromFile(file: File): Promise<SimulationParameters>
```

### Storage Adapters
```typescript
interface StorageAdapter {
  save(key: string, data: any): Promise<void>
  load(key: string): Promise<any>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

class MemoryStorageAdapter implements StorageAdapter { }
class LocalStorageAdapter implements StorageAdapter { }
class IndexedDBAdapter implements StorageAdapter { }
class BrowserFSAdapter implements StorageAdapter { }
class NodeFSAdapter implements StorageAdapter { }

function getBestAvailableStorageAdapter(): StorageAdapter
```

### Serialization Types
```typescript
enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  JSONL = 'jsonl'
}

interface ExportOptions {
  format?: ExportFormat
  includeGraph?: boolean
  includeParameters?: boolean
  includeHistory?: boolean
  includeGeometricProperties?: boolean
  includeStatistics?: boolean
  historyStepInterval?: number
}

interface ImportOptions {
  validationMode?: 'error' | 'warn' | 'ignore'
  mergeStrategy?: 'replace' | 'merge'
  importHistory?: boolean
}
```

## Templates Module
Located in `lib/templates/`

### Graph Templates
```typescript
function createLineGraph(length: number, options?: GraphTemplateOptions): SimulationGraph
function createRingGraph(size: number, options?: GraphTemplateOptions): SimulationGraph
function createGridGraph(width: number, height: number, options?: GraphTemplateOptions): SimulationGraph
function createRandomGraph(nodes: number, edgeProbability: number, options?: GraphTemplateOptions): SimulationGraph
function createGraphTemplate(template: string, parameters: Record<string, any>): SimulationGraph
```

## Adapters Module
Located in `lib/adapters/`

### Visualization Interfaces
```typescript
interface VisualizationAdapter {
  initialize(graph: SimulationGraph): void
  updateState(state: StateVector): void
  setOptions(options: VisualizationOptions): void
  getOptions(): VisualizationOptions
  getContainer(): HTMLElement | null
  destroy(): void
}

interface VisualizationOptions {
  colorScheme?: ColorScheme
  nodeStyle?: NodeStyle
  edgeStyle?: EdgeStyle
  labels?: boolean
  dimensions?: '2d' | '3d'
  interactive?: boolean
}

enum NodeStyle {
  CIRCLE = 'circle',
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  DIAMOND = 'diamond',
  CUSTOM = 'custom'
}

enum EdgeStyle {
  LINE = 'line',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  CURVED = 'curved',
  CUSTOM = 'custom'
}
```
