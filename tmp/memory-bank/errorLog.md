# Error Log

## 2025-04-21 22:15 IST: T35.1 - Tensor Interface Compilation Error

**File:** `src/models/types.ts`

**Error Message:**
```
TS2322: Type '{ indices: number[]; value: { re: number; im: number; }; }' is not assignable to type 'SparseIntertwinerElement'.
  Object literal may only specify known properties, and 'value' does not exist in type 'SparseIntertwinerElement'.
```

**Cause:**
The SparseIntertwinerElement interface was missing the 'value' property in its definition, while code was trying to assign a Complex object to this property.

**Fix:**
Updated the SparseIntertwinerElement interface to include the value property with proper typing.

**Key Code Changes:**
```typescript
// Before
interface SparseIntertwinerElement {
  indices: number[];
  // Missing value property
}

// After
interface SparseIntertwinerElement {
  indices: number[];
  value: Complex;  // Added properly typed value property
}
```

**Affected Files:**
- `src/models/types.ts`

**Related Task:** T35.1

## 2025-04-20 18:40 IST: T32 - IntertwinerBasisState Not Exported Error

**File:** `lib/core/index.ts`

**Error Message:**
```
lib/core/index.ts (24:2): "IntertwinerBasisState" is not exported by "lib/core/intertwinerSpace.ts", imported by "lib/core/index.ts".
```

**Cause:**
The interface was correctly defined and exported in `intertwinerSpace.ts`, but the bundler had issues with how it was imported/re-exported in `index.ts`. This is a common issue with TypeScript interfaces during bundling.

**Fix:**
Modified the export statement to separate type exports from value exports.

**Key Code Changes:**
```typescript
// Before:
export {
  triangleInequality,
  allowedIntermediateSpins,
  intertwinerDimension,
  getIntertwinerBasis,
  getOptimizedIntertwinerBasis,
  IntertwinerBasisState
} from './intertwinerSpace';

// After:
export {
  triangleInequality,
  allowedIntermediateSpins,
  intertwinerDimension,
  getIntertwinerBasis,
  getOptimizedIntertwinerBasis,
} from './intertwinerSpace';
export type { IntertwinerBasisState } from './intertwinerSpace';
```

**Affected Files:**
- `lib/core/index.ts`

**Related Task:** T32

## 2025-04-18 14:25 IST: T20 - Incorrect Intertwiner Dimension Calculation

**File:** `lib/core/intertwinerSpace.ts`

**Error Message:**
```
Test failed: intertwinerDimension(1, 0.5, 0.5, 1) returned 3, expected 2
```

**Cause:**
The implementation was not correctly enforcing the quantum mechanical selection rules for angular momentum coupling:
- When coupling two integer spins, intermediate spins must be integers
- When coupling two half-integer spins, intermediate spins must be integers
- When coupling an integer and half-integer spin, intermediate spins must be half-integers

**Fix:**
Updated the allowed_intermediate_spins function to properly enforce angular momentum selection rules.

**Key Code Changes:**
```typescript
// Before
function allowed_intermediate_spins(j1: number, j2: number): number[] {
  const spins: number[] = [];
  const min_j = Math.abs(j1 - j2);
  const max_j = j1 + j2;
  
  for (let j = min_j; j <= max_j; j += 0.5) {
    spins.push(j);
  }
  
  return spins;
}

// After
function allowed_intermediate_spins(j1: number, j2: number): number[] {
  const spins: number[] = [];
  const min_j = Math.abs(j1 - j2);
  const max_j = j1 + j2;
  
  // Determine step based on coupling rules
  const step = (is_half_integer(j1) !== is_half_integer(j2)) ? 1 : 0.5;
  
  // Ensure starting point matches the step pattern
  let start = min_j;
  if (step === 1 && is_half_integer(start) !== is_half_integer(j1 + j2)) {
    start += 0.5;
  }
  
  for (let j = start; j <= max_j; j += step) {
    spins.push(j);
  }
  
  return spins;
}

function is_half_integer(n: number): boolean {
  return Math.round(n * 2) % 2 !== 0;
}
```

**Affected Files:**
- `lib/core/intertwinerSpace.ts`

**Related Task:** T20

## 2025-04-16 10:30 IST: T14 - Redux Dependency in Standalone Library

**File:** `lib/core/engineImplementation.ts`

**Error Message:**
```
Error: Redux dependencies detected in standalone library.
Found import from 'react-redux' in engineImplementation.ts line 5.
```

**Cause:**
The standalone library was importing React-Redux specific code, violating the requirement for the library to be framework-agnostic.

**Fix:**
Removed all React and Redux dependencies from the library and implemented a framework-agnostic event system instead.

**Key Code Changes:**
```typescript
// Before
import { useSelector, useDispatch } from 'react-redux';
import { updateSimulationState } from '../../store/slices/simulationSlice';

class SpinNetworkSimulationEngineImpl implements SimulationEngine {
  private dispatch: any;
  
  constructor(options: SimulationEngineOptions) {
    this.dispatch = options.dispatch;
  }
  
  private updateState(state: SimulationState): void {
    this.dispatch(updateSimulationState(state));
  }
}

// After
class SpinNetworkSimulationEngineImpl implements SimulationEngine {
  private eventEmitter: EventEmitter;
  
  constructor(options: SimulationEngineOptions) {
    this.eventEmitter = new EventEmitter();
  }
  
  private updateState(state: SimulationState): void {
    this.eventEmitter.emit('STATE_UPDATED', state);
  }
  
  public addEventListener(event: string, listener: Function): void {
    this.eventEmitter.on(event, listener);
  }
  
  public removeEventListener(event: string, listener: Function): void {
    this.eventEmitter.off(event, listener);
  }
}
```

**Affected Files:**
- `lib/core/engineImplementation.ts`
- `lib/core/types.ts`
- `lib/utils/eventEmitter.ts` (new file)

**Related Task:** T14

## 2025-04-15 09:45 IST: T6 - Type Error in Database Service

**File:** `src/database/services/simulationService.ts`

**Error Message:**
```
TS2367: This comparison appears to be unintentional because the types 'void' and 'number' have no overlap.
```

**Cause:**
In the `saveSimulation` method, there was an incorrect comparison between a Dexie promise result (which resolves to void for put operations) and a number.

**Fix:**
Updated the condition to check for operation completion rather than comparing with a number.

**Key Code Changes:**
```typescript
// Before
const result = await this.db.simulations.put(simulationData);
if (result !== 1) {
  console.error('Failed to save simulation');
  return null;
}

// After
try {
  await this.db.simulations.put(simulationData);
  return simulationData.id;
} catch (error) {
  console.error('Failed to save simulation:', error);
  return null;
}
```

**Affected Files:**
- `src/database/services/simulationService.ts`

**Related Task:** T6
