# Spin Network Library Exports Reference

The library exposes functionality through several namespaces. In browser environments, these are available through `window.SpinNetwork`. When using modules, you can import either the entire namespace or specific functions.

## Core Namespace (`SpinNetwork.core` or import from 'lib/core')

### Complex Number Operations
```typescript
createComplex(re: number, im: number): Complex
addComplex(a: Complex, b: Complex): Complex
multiplyComplex(a: Complex, b: Complex): Complex
```

### Tensor Node Operations
```typescript
createTensorNode(id: string, position: Position, intertwinerId: number, dimensions: number[]): TensorNode
setTensorElement(tensor: TensorNode, indices: number[], value: Complex): void
getTensorElement(tensor: TensorNode, indices: number[]): Complex
createTensorNodeFromBasisState(id: string, position: Position, j1: number, j2: number, j3: number, j4: number, basisState: Complex[]): TensorNode
calculateNodeVolume(node: TensorNode): number
```

### State Vector Operations
```typescript
createStateVectorEdge(id: string, source: string, target: string, spin: number): StateVectorEdge
setStateVectorAmplitude(stateVector: StateVector, index: number, value: Complex): void
getStateVectorAmplitude(stateVector: StateVector, index: number): Complex
normalizeStateVector(stateVector: StateVector): StateVector
calculateEdgeArea(edge: StateVectorEdge): number
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

### Intertwiner Space Utilities
```typescript
triangleInequality(j1: number, j2: number, j3: number): boolean
allowedIntermediateSpins(j1: number, j2: number): number[]
intertwinerDimension(j1: number, j2: number, j3: number, j4: number): number
getIntertwinerBasis(j1: number, j2: number, j3: number, j4: number): IntertwinerBasisState[]
getOptimizedIntertwinerBasis(j1: number, j2: number, j3: number, j4: number): IntertwinerBasisState[]
```

## Quantum Namespace (`SpinNetwork.quantum` or import from 'lib/quantum')

### Tensor Operations
```typescript
createTensor(dimensions: number[]): Tensor
tensorNodeToTensor(node: TensorNode): Tensor
contractTensors(tensorA: Tensor, tensorB: Tensor, contractionIndices: number[][]): Tensor
tensorNorm(tensor: Tensor): number
normalizeTensor(tensor: Tensor): Tensor 
createIntertwinerTensor(j1: number, j2: number, j3: number, j4: number): Tensor
tensorExpectationValue(tensor: Tensor, operator: Tensor): Complex
```

### State Vector Operations
```typescript
createStateVector(dimension: number): StateVector
initializeSpinState(j: number, m: number): StateVector
edgeToStateVector(edge: StateVectorEdge): StateVector
innerProduct(stateA: StateVector, stateB: StateVector): Complex
normSquared(state: StateVector): number
normalizeStateVector(state: StateVector): StateVector
applyOperator(state: StateVector, operator: Complex[][]): StateVector
createSpinOperators(j: number): { Sx: Complex[][], Sy: Complex[][], Sz: Complex[][] }
expectationValue(state: StateVector, operator: Complex[][]): Complex
```

## Analysis Namespace (`SpinNetwork.analysis` or import from 'lib/analysis')

### Geometric Properties
```typescript
class GeometricPropertiesCalculator {
  calculateTotalVolume(state: StateVector): number
  calculateTotalArea(graph: SimulationGraph): number
  calculateEffectiveDimension(graph: SimulationGraph, state: StateVector): number
  calculateVolumeEntropy(state: StateVector): number
}

// Convenience functions
calculateVolume(state: StateVector): number
calculateArea(graph: SimulationGraph): number
calculateEffectiveDimension(graph: SimulationGraph, state: StateVector): number
calculateVolumeEntropy(state: StateVector): number
```

### Conservation Laws
```typescript
class ConservationCheckerFactory {
  createProbabilityChecker(): ConservationLawChecker
  createTotalOccupancyChecker(): ConservationLawChecker
  createPositivityChecker(): ConservationLawChecker
}

checkMassConservation(state: StateVector): boolean
checkEnergyConservation(state: StateVector, hamiltonian: Complex[][]): boolean
```

### Statistical Analysis
```typescript
class SimulationAnalyzer {
  calculateMeanSquareDisplacement(state: StateVector): number
  calculateSpectralDimension(graph: SimulationGraph, times: number[]): number[]
  calculateReturnProbability(state: StateVector): number
  calculateDiffusionCoefficient(states: StateVector[]): number
}

// Convenience functions
calculateMeanSquareDisplacement(initialState: StateVector, currentState: StateVector): number
calculateSpectralDimension(graph: SimulationGraph, times: number[], initialState: StateVector, diffusionFn: (t: number) => StateVector): { times: number[], dimensions: number[] }
calculateReturnProbability(initialState: StateVector, currentState: StateVector): number
calculateDiffusionCoefficient(states: StateVector[]): number
```

## Models Namespace (`SpinNetwork.models` or import from 'lib/models')

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
class SpinWeightFunctionFactory implements WeightFunctionFactory {
  static getSpin(): WeightFunction
  static getCasimir(): WeightFunction
  static getDimension(): WeightFunction
  static getArea(): WeightFunction
}
createIntertwinerWeightFunction(intertwinerSpace: IntertwinerSpace): WeightFunction
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

## IO Namespace (`SpinNetwork.io` or import from 'lib/io')

### Export Functions
```typescript
exportSimulation(engine: SimulationEngine, options?: ExportOptions): string
downloadSimulationResults(engine: SimulationEngine, filename?: string): void
downloadSimulationConfig(engine: SimulationEngine, filename?: string): void
downloadSimulationGraph(engine: SimulationEngine, filename?: string): void
downloadSimulationCSV(engine: SimulationEngine, filename?: string): void
downloadAllSimulationData(engine: SimulationEngine, baseFilename?: string): void
```

### Import Functions
```typescript
importSimulationFromJSON(json: string, engine: SimulationEngine): void
importSimulationFromFile(file: File, engine: SimulationEngine): Promise<void>
importGraphFromJSON(json: string): SimulationGraph
importGraphFromFile(file: File): Promise<SimulationGraph>
importConfigFromJSON(json: string): SimulationParameters
importConfigFromFile(file: File): Promise<SimulationParameters>
```

### Storage Adapters
```typescript
class MemoryStorageAdapter implements StorageAdapter { }
class LocalStorageAdapter implements StorageAdapter { }
class IndexedDBAdapter implements StorageAdapter { }
class BrowserFSAdapter implements StorageAdapter { }
class NodeFSAdapter implements StorageAdapter { }
getBestAvailableStorageAdapter(): StorageAdapter
```

## Factory Functions (Global Exports)

Available directly from the main entry point or as `SpinNetwork.createX`:

```typescript
createSimulationEngine(): SimulationEngine
createGraph(): SimulationGraph
createStateVector(nodeIds: string[]): SimulationStateVector
```

## Analysis Object (Convenience Functions)

Available as `SpinNetwork.Analysis`:

```typescript
Analysis.calculateTotalVolume(state: StateVector): number
Analysis.calculateTotalArea(graph: SimulationGraph): number
Analysis.calculateEffectiveDimension(graph: SimulationGraph, state: StateVector): number
Analysis.calculateVolumeEntropy(state: StateVector): number
```