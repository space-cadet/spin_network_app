# Session Cache

*Last Updated: April 10, 2025*

## Status
CONTINUING

## Current Task
Implementing the simulation component for spin network diffusion

## Current Step
Building core simulation infrastructure with existing libraries

## Critical Files
- `/src/simulation/core/types.ts`
- `/src/simulation/core/stateVector.ts`
- `/src/simulation/core/graph.ts`
- `/src/simulation/core/mathAdapter.ts`
- `/src/simulation/models/weightFunctions.ts`
- `/src/simulation/core/simulation-plan.md`

## State Information
- Selected approach: Modular Incremental Approach using existing libraries
- Decided to leverage math.js for matrix operations instead of building from scratch
- Implemented core interfaces and initial classes for simulation component
- Created math.js adapter for mathematical operations
- Created state vector implementation and graph model
- Next step: Complete diffusion models and time evolution engine

## Implementation Progress
1. ✅ Created directory structure for simulation component
2. ✅ Implemented core interfaces in types.ts
3. ✅ Created simulation-plan.md with revised approach leveraging existing libraries
4. ✅ Implemented math.js adapter for matrix operations
5. ✅ Built state vector implementation for simulation state
6. ✅ Implemented graph model for network representation
7. ✅ Created weight function factory for different edge weight calculations
8. 🔄 Started implementing diffusion models
9. ⬜ Implement time evolution engine and visualization adapters

## Design Decisions
- Using math.js for matrix operations and numerical methods
- Creating visualization-agnostic models to support both Cytoscape.js and future three.js
- Implementing immutable data structures for state safety
- Supporting both 2D and 3D network representations with a common interface
- Designing with future extensibility for different diffusion models

## Notes
- Simulation component is being designed for compatibility with future three.js 3D visualization
- Clean separation between simulation logic and visualization allows for multiple visualization approaches
- Core utilities like mathAdapter.ts provide reusable mathematical operations
- Weight functions are configurable to support different physical interpretations of spin networks
