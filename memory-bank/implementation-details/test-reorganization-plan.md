# Test File Reorganization Plan

*Created: May 1, 2025*

## 1. Overview

This document outlines the plan to reorganize the test files into two focused sets:
1. React app testing
2. Standalone library testing

## 2. Current Structure Analysis

Currently we have four test files:
- `simulation-test.html`: Core simulation testing
- `standalone-guide.html`: Library usage demonstrations
- `tensor-tests.html`: Automated tensor validation
- `tensor-sandbox.html`: Interactive tensor experimentation

## 3. Proposed Reorganization

### 3.1 Directory Structure

```
/docs/
  /implementation/
    /tests/
      /react-app/
        tensor-operations.html     # Tests tensor operations in React context
        simulation-methods.html    # Tests simulation methods in React context
      /standalone/
        tensor-operations.html     # Tests tensor operations in standalone context
        simulation-methods.html    # Tests simulation methods in standalone context
    /scripts/
      /modules/
        testRunner.js            # Common test infrastructure
        uiElements.js            # DOM element handling
        visualizer.js            # Network visualization helpers
        testLogger.js           # Test result logging
```

### 3.2 File Consolidation Plan

#### React App Test Files

1. **tensor-operations.html**
   - Purpose: Test tensor operations in React context
   - Core Components:
     - Basic tensor operations (creation, access, contraction)
     - React component integration tests
     - State management tests
     - Redux integration validation
     - Physical property validation:
       - Volume calculation for nodes
       - Area calculation for edges
       - Network geometry properties

2. **simulation-methods.html**
   - Purpose: Test simulation functionality in React context
   - Core Components:
     - Basic simulation control testing
     - React hook validation
     - Redux state synchronization
     - Event handling verification
     - Simulation evolution validation

#### Standalone Library Test Files

1. **tensor-operations.html**
   - Purpose: Test core tensor functionality
   - Core Components:
     - Basic tensor operations validation:
       - Creation and initialization
       - Element access and modification
       - Tensor contraction and products
       - Normalization operations
     - Sparse tensor representation testing
     - Mathematical consistency validation
     - Physical constraint verification:
       - Triangle inequalities for 3-valent nodes
       - Intermediate coupling for 4-valent nodes
     - Quantum state calculations

2. **simulation-methods.html**
   - Purpose: Test core simulation functionality
   - Core Components:
     - Engine initialization and control
     - Network creation and manipulation
     - State evolution validation
     - Conservation law verification
     - Performance benchmarking

### 3.3 Implementation Phases

1. **Phase 1: Setup (1-2 days)**
   - Create new directory structure
   - Set up shared testing infrastructure
   - Implement common test utilities

2. **Phase 2: React Tests (2-3 days)**
   - Create React-specific test files
   - Implement React component testing
   - Add Redux integration tests
   - Set up event handling validation

3. **Phase 3: Standalone Tests (2-3 days)**
   - Create standalone library test files
   - Implement core functionality tests
   - Add mathematical validation
   - Set up interactive testing interfaces

4. **Phase 4: Migration (1-2 days)**
   - Move existing test code to new structure
   - Update references and imports
   - Validate all functionality
   - Remove old test files

### 3.4 Shared Components

1. **Test Runner**
   - Common test execution framework
   - Result collection and reporting
   - Error handling and logging
   - Test suite organization
   - Data structure validation:
     - TensorNode validation
     - StateVectorEdge validation
     - Physical property calculations

2. **UI Elements**
   - Shared DOM manipulation utilities
   - Common UI components
   - Event handling helpers
   - Form input management

3. **Visualizer**
   - Network visualization utilities
   - Canvas handling helpers
   - Animation utilities
   - Layout management
   - Tensor visualization:
     - Dimension color coding
     - Sparsity representation
     - 3D plots for rank-3 tensors
   - State vector visualization:
     - Amplitude and phase visualization
     - Bloch sphere for spin-1/2

4. **Test Logger**
   - Unified logging interface
   - Result formatting
   - Error reporting
   - Console output management

## 4. Success Criteria

1. All existing test functionality preserved
2. Clear separation between React and standalone tests
3. Improved code organization and maintainability
4. Reduced code duplication
5. Better test coverage and reporting
6. More intuitive test organization
7. Comprehensive validation coverage including:
   - Individual tensor/state vector operations
   - Network consistency
   - Evolution correctness
   - Conservation laws
   - Performance benchmarks

## 5. Dependencies

1. Spin Network standalone library
2. React testing infrastructure
3. Redux integration
4. Visualization components

## 6. Risks and Mitigation

1. **Risk**: Loss of existing test coverage
   - **Mitigation**: Careful migration with validation at each step

2. **Risk**: Increased complexity from separation
   - **Mitigation**: Well-designed shared components and clear documentation

3. **Risk**: Performance impact
   - **Mitigation**: Efficient test runner implementation and code splitting

4. **Risk**: Maintenance overhead
   - **Mitigation**: Clear organization and comprehensive documentation

5. **Risk**: Physical constraint validation complexity
   - **Mitigation**: Clear separation of mathematical vs physical tests

6. **Risk**: Quantum state visualization complexity
   - **Mitigation**: Focus on essential visualizations first

## 7. Documentation Requirements

1. Updated test execution instructions
2. New test file organization guide
3. Shared component documentation
4. Test writing guidelines
5. Migration guide for existing tests
6. Quantum state calculation guide
7. Physical constraint validation guide