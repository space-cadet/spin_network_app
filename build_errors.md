
> spin-network-app@0.1.0 build /Users/deepak/code/spin_network_app
> tsc && vite build

src/simulation/analysis/conservation.ts(81,5): error TS6133: 'graph' is declared but its value is never read.
src/simulation/analysis/conservation.ts(103,5): error TS6133: 'graph' is declared but its value is never read.
src/simulation/analysis/conservation.ts(162,5): error TS6133: 'graph' is declared but its value is never read.
src/simulation/analysis/conservation.ts(184,5): error TS6133: 'graph' is declared but its value is never read.
src/simulation/analysis/conservation.ts(259,5): error TS6133: 'graph' is declared but its value is never read.
src/simulation/analysis/conservation.ts(278,5): error TS6133: 'graph' is declared but its value is never read.
src/simulation/analysis/geometricProps.ts(8,1): error TS6133: 'math' is declared but its value is never read.
src/simulation/analysis/geometricProps.ts(28,13): error TS6133: 'nodeId' is declared but its value is never read.
src/simulation/analysis/geometricProps.ts(104,5): error TS6133: 'state' is declared but its value is never read.
src/simulation/analysis/geometricProps.ts(163,5): error TS6133: 'graph' is declared but its value is never read.
src/simulation/core/graph.ts(10,59): error TS6133: 'NodePosition' is declared but its value is never read.
src/simulation/core/graph.ts(16,14): error TS2420: Class 'SpinNetworkGraph' incorrectly implements interface 'SimulationGraph'.
  Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/graph.ts(87,5): error TS2741: Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/graph.ts(257,5): error TS2741: Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/graph.ts(265,7): error TS2322: Type 'this' is not assignable to type 'SimulationGraph'.
  Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/graph.ts(313,5): error TS2741: Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/graph.ts(322,7): error TS2322: Type 'this' is not assignable to type 'SimulationGraph'.
  Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/graph.ts(351,5): error TS2741: Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/graph.ts(360,7): error TS2322: Type 'this' is not assignable to type 'SimulationGraph'.
  Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/graph.ts(412,5): error TS2741: Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/graph.ts(433,46): error TS2345: Argument of type 'this' is not assignable to parameter of type 'SimulationGraph'.
  Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/graph.ts(440,46): error TS2345: Argument of type 'this' is not assignable to parameter of type 'SimulationGraph'.
  Property 'fromSpinNetwork' is missing in type 'SpinNetworkGraph' but required in type 'SimulationGraph'.
src/simulation/core/mathAdapter.ts(118,21): error TS2339: Property 'vectors' does not exist on type '{ values: MathCollection; eigenvectors: { value: number | BigNumber; vector: MathCollection; }[]; }'.
src/simulation/core/mathAdapter.ts(126,5): error TS6133: 'matrix' is declared but its value is never read.
src/simulation/core/mathAdapter.ts(131,5): error TS2741: Property 'fromMathArray' is missing in type '{ size: number; nodeIds: string[]; getValue: () => number; setValue: () => StateVector; getValueAtIndex: () => number; setValueAtIndex: () => StateVector; add: () => StateVector; subtract: () => StateVector; multiply: () => StateVector; ... 4 more ...; toVisualizationState: () => {}; }' but required in type 'StateVector'.
src/simulation/core/mathAdapter.ts(174,12): error TS2352: Conversion of type 'Matrix' to type 'MathArray' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Matrix' is missing the following properties from type 'MathNumericType[][]': length, pop, push, concat, and 27 more.
src/simulation/core/mathAdapter.ts(197,28): error TS2769: No overload matches this call.
  Overload 1 of 2, '(format?: "sparse" | "dense" | undefined): Matrix', gave the following error.
    Argument of type 'MathArray[]' is not assignable to parameter of type '"sparse" | "dense" | undefined'.
src/simulation/core/mathAdapter.ts(203,19): error TS6133: 't' is declared but its value is never read.
src/simulation/core/mathAdapter.ts(218,26): error TS2769: No overload matches this call.
  Overload 1 of 2, '(format?: "sparse" | "dense" | undefined): Matrix', gave the following error.
    Argument of type 'Matrix[]' is not assignable to parameter of type '"sparse" | "dense" | undefined'.
src/simulation/core/mathAdapter.ts(240,12): error TS2352: Conversion of type 'Matrix' to type 'MathArray' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Matrix' is missing the following properties from type 'MathNumericType[][]': length, pop, push, concat, and 27 more.
src/simulation/core/stateVector.ts(14,14): error TS2420: Class 'SimulationStateVector' incorrectly implements interface 'StateVector'.
  Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/stateVector.ts(105,5): error TS2739: Type 'StateVector' is missing the following properties from type 'SimulationStateVector': _values, _nodeIds, _nodeIdToIndex
src/simulation/core/stateVector.ts(121,5): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/stateVector.ts(152,5): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/stateVector.ts(171,5): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/stateVector.ts(189,5): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/stateVector.ts(207,5): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/stateVector.ts(212,5): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/stateVector.ts(216,12): error TS2352: Conversion of type 'Matrix' to type 'MathArray' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Matrix' is missing the following properties from type 'MathNumericType[][]': length, pop, push, concat, and 27 more.
src/simulation/core/stateVector.ts(233,5): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/timeEvolution.ts(151,9): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/timeEvolution.ts(161,9): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/timeEvolution.ts(181,9): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/timeEvolution.ts(194,9): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/timeEvolution.ts(200,9): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/core/types.ts(41,3): error TS1070: 'static' modifier cannot appear on a type member.
src/simulation/core/types.ts(100,3): error TS1070: 'static' modifier cannot appear on a type member.
src/simulation/index.ts(68,43): error TS2304: Cannot find name 'SpinNetworkSimulationEngine'.
src/simulation/index.ts(69,14): error TS2304: Cannot find name 'SpinNetworkSimulationEngine'.
src/simulation/index.ts(75,54): error TS2304: Cannot find name 'SpinNetworkGraph'.
src/simulation/index.ts(76,10): error TS2304: Cannot find name 'SpinNetworkGraph'.
src/simulation/models/diffusionModels.ts(14,3): error TS6133: 'StandardWeightFunction' is declared but its value is never read.
src/simulation/models/diffusionModels.ts(18,1): error TS6133: 'MathAdapter' is declared but its value is never read.
src/simulation/models/diffusionModels.ts(145,27): error TS2352: Conversion of type 'Matrix' to type 'MathArray' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Matrix' is missing the following properties from type 'MathNumericType[][]': length, pop, push, concat, and 27 more.
src/simulation/models/diffusionModels.ts(194,5): error TS2741: Property 'fromMathArray' is missing in type 'SimulationStateVector' but required in type 'StateVector'.
src/simulation/models/diffusionModels.ts(195,28): error TS2531: Object is possibly 'null'.
src/simulation/models/diffusionModels.ts(232,27): error TS2352: Conversion of type 'Matrix' to type 'MathArray' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'Matrix' is missing the following properties from type 'MathNumericType[][]': length, pop, push, concat, and 27 more.
src/simulation/models/weightFunctions.ts(92,3): error TS6133: 'intertwinersEffect' is declared but its value is never read.
src/simulation/visualization/cytoscapeAdapter.ts(70,5): error TS6133: 'graph' is declared but its value is never read.
src/simulation/visualization/cytoscapeAdapter.ts(111,5): error TS6133: 'graph' is declared but its value is never read.
src/simulation/visualization/visualizationTypes.ts(9,1): error TS6133: 'CytoscapeVisualizationState' is declared but its value is never read.
 ELIFECYCLE  Command failed with exit code 2.
