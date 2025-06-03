# Sparse Operations Implementation Plan

*Created: 2025-05-30*
*Related Task: T74 - Optimize Quantum Operator Performance*

## Overview

Implementation plan for sparse storage and operations to optimize quantum operator performance. Target: extend practical limits from 6-7 qubits to 10-12 qubits while maintaining API compatibility.

## Current Performance Bottlenecks

- 6 qubits: 51ms (borderline acceptable)
- 7 qubits: 396ms (significant delay)  
- 8 qubits: 3.2 seconds (impractical)

State vector operations scale well (16 qubits in 75ms), indicating dense matrix operations in operators are the primary bottleneck.

## Simple Transparent Implementation Strategy

### Core Principle: Keep It Really Simple, Stupid (KIRSS)

**Key Insight**: Keep exact same classes and APIs, only change internal storage.

### StateVector Sparse Storage

**Current Dense Implementation:**
```typescript
class StateVector {
  amplitudes: Complex[] = [amp1, amp2, amp3, ...]; // Dense array
}
```

**Proposed Sparse Implementation:**
```typescript
class StateVector {
  private dense: Complex[] | null = null;
  private sparse: Map<number, Complex> = new Map(); // Only non-zero values
  private sparsityThreshold: number = 0.8; // Use sparse when >80% zeros
  
  getState(index: number): Complex {
    return this.sparse.get(index) || math.complex(0, 0);
  }
  
  get amplitudes(): Complex[] {
    if (!this.dense) {
      // Convert sparse to dense when needed
      this.dense = Array(this.dimension).fill(math.complex(0, 0));
      this.sparse.forEach((val, idx) => this.dense[idx] = val);
    }
    return this.dense;
  }
}
```

### MatrixOperator Optimizations

**Specialized Operator Classes (same interface):**

1. **IdentityOperator** - No matrix storage
```typescript
class IdentityOperator implements IOperator {
  apply(state: IStateVector): StateVector {
    return state.clone(); // No matrix multiplication!
  }
  
  compose(other: IOperator): IOperator {
    return other; // I ∘ A = A
  }
}
```

2. **DiagonalOperator** - Store only diagonal elements
```typescript
class DiagonalOperator implements IOperator {
  private diagonal: Complex[];
  
  apply(state: IStateVector): StateVector {
    // Element-wise multiplication, no full matrix
    const newAmps = state.amplitudes.map((amp, i) => 
      math.multiply(amp, this.diagonal[i])
    );
    return new StateVector(state.dimension, newAmps);
  }
}
```

3. **SparseMatrixOperator** - Compressed storage for sparse matrices
```typescript
class SparseMatrixOperator implements IOperator {
  private sparseData: Map<string, Complex> = new Map(); // "i,j" -> value
  
  apply(state: IStateVector): StateVector {
    // Sparse matrix-vector multiplication
    return sparseMatrixVectorMultiply(this.sparseData, state);
  }
}
```

## Performance Trade-offs

### Small Objects (2-8 qubits)
- **Sparse storage penalty**: 2-3x slower due to Map overhead and hash lookups
- **Break-even point**: ~50% sparsity
- **Mitigation**: Use sparsity threshold (>80% zeros) before switching to sparse

### Large Objects (10+ qubits)
- **Memory savings**: Exponential reduction for sparse states
- **Performance gains**: Avoid unnecessary zero operations
- **Target improvement**: 10-12 qubit practical limit

## Implementation Status

### Phase 1: Infrastructure - ✅ COMPLETE
- ✅ Added sparse interfaces to core types (ISparseEntry, ISparseMatrix, ISparseOperator)
- ✅ Implemented comprehensive sparse matrix utilities (284 lines)
  - ✅ Core operations: create, set/get entries, matrix-vector multiplication
  - ✅ Matrix transformations: transpose, conjugate transpose, trace, norm
  - ✅ Property detection: identity, diagonal, validation
  - ✅ Conversion utilities: sparse ↔ dense, cleanup functions
- ✅ Created comprehensive test suite (17 tests, all passing)
- ✅ Validated mathematical correctness of all sparse operations

### Phase 2: Core Optimizations - 🔄 NEXT
- [ ] Implement specialized operator classes (IdentityOperator, DiagonalOperator)
- [ ] Add sparse support to MatrixOperator
- [ ] Create operator factory with automatic optimization selection

### Phase 3: Advanced Features - ⬜ PLANNED
- [ ] SparseMatrixOperator with compressed storage
- [ ] Streaming operations for large matrices
- [ ] In-place state modifications

## API Compatibility

**Zero Breaking Changes:**
- Same class names
- Same method signatures  
- Same public interfaces
- Existing code works unchanged
- Automatic performance improvements

**Transparency Mechanism:**
- Internal storage optimization
- Graceful degradation to dense when needed
- Sparsity threshold prevents small-object penalties

## Files to Modify

### New Files
- `packages/quantum/src/operators/sparse.ts` - Sparse matrix utilities
- `packages/quantum/src/operators/specialized.ts` - Specialized operator classes
- `packages/quantum/src/utils/sparsity.ts` - Sparsity detection and thresholds

### Modified Files
- `packages/quantum/src/states/stateVector.ts` - Add sparse storage option
- `packages/quantum/src/operators/operator.ts` - Add lazy evaluation
- `packages/quantum/src/core/types.ts` - Extend OperatorType union
- `packages/quantum/src/operators/gates.ts` - Use specialized implementations

## Success Metrics

- **Performance**: 10-12 qubit operations in <1 second
- **Memory**: Reduced memory usage for sparse systems
- **Compatibility**: All existing tests pass unchanged
- **Maintainability**: No increase in code complexity for users

## Risk Mitigation

- **Small object penalty**: Sparsity threshold prevents performance regression
- **API stability**: No public interface changes
- **Fallback strategy**: Dense implementation always available
- **Incremental deployment**: Phase-by-phase implementation allows testing

This plan prioritizes simplicity and backward compatibility while achieving the performance goals of T74.
