*Last Updated: May 23, 2025*

# Table of Contents

1. [Overview](#overview)
2. [Core Types and Interfaces](#level-0-core-types-and-interfaces)
3. [Utilities and Basic Operations](#level-1-utilities-and-basic-operations)
4. [Quantum States](#level-2-quantum-states)
5. [Quantum Operators](#level-3-quantum-operators)
6. [Angular Momentum](#level-4-angular-momentum)
7. [Quantum Circuits](#level-5-quantum-circuits-planned)
8. [Dependency Graph](#dependency-graph)
9. [Usage Example Dependencies](#usage-example-dependencies)
10. [API Status and Stability](#api-status-and-stability)
11. [Performance Considerations](#performance-considerations)
12. [Implementation Index](#implementation-index)
13. [Error Handling](#error-handling)
14. [Testing and Validation](#testing-and-validation)
15. [NPM Package](#npm-package)

## Overview
This index provides a hierarchical view of the quantum package components, ordered by their dependencies. Components at each level may depend on components from previous levels but not on components from later levels.

The package implements a comprehensive quantum mechanics library in TypeScript, providing tools for quantum state manipulation, operator algebra, measurements, time evolution, and angular momentum calculations.

## Level 1: Utilities and Basic Operations
Location: `src/utils/`

### typeUtils (`utils/typeUtils.ts`)

**Functions:**
- `applyNodeTypeStyle`
- `applyEdgeTypeStyle`
- `getNodeTypeClassName`
- `getEdgeTypeClassName`
- `generateNodeTypeStyles`
- `generateEdgeTypeStyles`

### typeUsageCalculator (`utils/typeUsageCalculator.ts`)

**Functions:**
- `calculateNodeTypeUsage`
- `calculateEdgeTypeUsage`
- `calculateTypeUsage`

### testPersistence (`utils/testPersistence.ts`)

**Constants:**
- `testPersistence`
- `verifyPersistence`

### networkStorage (`utils/networkStorage.ts`)

**Constants:**
- `NetworkStorage`

### networkGenerators (`utils/networkGenerators.ts`)

**Functions:**
- `createLatticeNetwork`
- `createCircularNetwork`
- `createRandomNetwork`

### migrations (`utils/migrations.ts`)

**Constants:**
- `migrations`
- `migrationFunction`

### logMigrationUtil (`utils/logMigrationUtil.ts`)

**Functions:**
- `createLogMigrationComponent`

**Constants:**
- `LogMigrationTool`

### browserFSConfig (`utils/browserFSConfig.ts`)

**Functions:**
- `initializeBrowserFS`
- `createLogDirectories`
- `testBrowserFS`

## Dependency Graph
*This section needs to be filled with appropriate content.*

## Usage Example Dependencies
*This section needs to be filled with appropriate content.*

## API Status and Stability
*This section needs to be filled with appropriate content.*

## Performance Considerations
*This section needs to be filled with appropriate content.*

## Implementation Index
*This section needs to be filled with appropriate content.*

## Error Handling
*This section needs to be filled with appropriate content.*

## Testing and Validation
*This section needs to be filled with appropriate content.*

## NPM Package
*This section needs to be filled with appropriate content.*
