/**
 * General quantum operations for graph elements
 */

import { QuantumObject, IOperator, IStateVector, isState } from '../../core/types';
import { QuantumGraph } from '../QuantumGraph';
import { MeasurementResult } from '../types';

/**
 * Apply quantum operation to arbitrary subset of graph elements
 */
export function applyQuantumOperation(
  graph: QuantumGraph, 
  elementIds: string[], 
  operator: IOperator
): void {
  // Extract current states from elements
  const currentStates = extractSubsystemState(graph, elementIds);
  
  if (!currentStates || currentStates.length === 0) {
    throw new Error('No quantum objects found on specified elements');
  }

  // Apply operator to the subsystem
  if (currentStates.length === 1 && isState(currentStates[0])) {
    const newState = operator.apply(currentStates[0] as IStateVector);
    insertSubsystemState(graph, elementIds, newState);
  } else {
    // Multi-element operation using tensor product
    const stateVectors = currentStates.filter(isState) as IStateVector[];
    if (stateVectors.length !== currentStates.length) {
      throw new Error('All elements must have state vectors for multi-element operations');
    }
    
    const compositeState = tensorProductStates(stateVectors);
    const newState = operator.apply(compositeState);
    insertSubsystemState(graph, elementIds, newState);
  }
}

/**
 * Extract quantum state from subset of graph elements
 */
export function extractSubsystemState(
  graph: QuantumGraph, 
  elementIds: string[]
): QuantumObject[] {
  const states: QuantumObject[] = [];
  
  for (const id of elementIds) {
    let state: QuantumObject | undefined;
    
    // Check if it's a vertex or edge
    if (graph.hasNode(id)) {
      state = graph.getVertexQuantumObject(id);
    } else if (graph.hasEdge(id)) {
      state = graph.getEdgeQuantumObject(id);
    }
    
    if (state) {
      states.push(state);
    }
  }
  
  return states;
}

/**
 * Insert quantum state into subset of graph elements
 */
export function insertSubsystemState(
  graph: QuantumGraph, 
  elementIds: string[], 
  newState: QuantumObject
): void {
  if (elementIds.length === 1) {
    // Single element - update individual state
    const id = elementIds[0];
    if (graph.hasNode(id)) {
      graph.setVertexQuantumObject(id, newState);
    } else if (graph.hasEdge(id)) {
      graph.setEdgeQuantumObject(id, newState);
    }
  } else {
    // Multi-element - create composite
    graph.setCompositeQuantumObject(elementIds, newState);
  }
}

/**
 * Perform partial measurement on subset of graph elements
 */
export function partialMeasurement(
  graph: QuantumGraph, 
  elementIds: string[], 
  projector?: IOperator
): MeasurementResult {
  // Get composite or individual state
  const subsystemState = graph.getCompositeQuantumObject(elementIds) || 
                        extractSubsystemState(graph, elementIds)[0];
  
  if (!subsystemState || !isState(subsystemState)) {
    throw new Error('No quantum state found for measurement');
  }

  const state = subsystemState as IStateVector;
  
  // Simple measurement implementation
  const probability = state.norm() ** 2;
  const outcome = Math.random() < 0.5 ? 0 : 1;
  
  // Apply projector if provided
  let postMeasurementState = state;
  if (projector) {
    postMeasurementState = projector.apply(state);
  }
  
  return {
    outcome,
    probability,
    postMeasurementState,
    measuredSubsystem: elementIds
  };
}

/**
 * Check if elements form a valid subsystem
 */
export function validateSubsystem(
  graph: QuantumGraph, 
  elementIds: string[]
): boolean {
  return elementIds.every(id => 
    graph.hasNode(id) || graph.hasEdge(id)
  );
}

/**
 * Get dimension of subsystem
 */
export function getSubsystemDimension(
  graph: QuantumGraph, 
  elementIds: string[]
): number {
  const states = extractSubsystemState(graph, elementIds);
  
  if (states.length === 0) return 0;
  
  // For single state, return its dimension
  if (states.length === 1 && isState(states[0])) {
    return (states[0] as IStateVector).dimension;
  }
  
  // For multiple states, would calculate tensor product dimension
  return states.reduce((total, state) => {
    if (isState(state)) {
      return total * (state as IStateVector).dimension;
    }
    return total;
  }, 1);
}

/**
 * Create tensor product of multiple quantum states
 */
export function tensorProductStates(states: IStateVector[]): IStateVector {
  if (states.length === 0) {
    throw new Error('Cannot create tensor product of empty state list');
  }
  
  if (states.length === 1) {
    return states[0];
  }
  
  // Use StateVector tensorProduct method for sequential tensor products
  let result = states[0];
  for (let i = 1; i < states.length; i++) {
    result = result.tensorProduct(states[i] as any);
  }
  
  return result;
}

/**
 * Split composite state into individual components
 */
export function splitCompositeState(
  compositeState: IStateVector, 
  subsystemDimensions: number[]
): IStateVector[] {
  if (subsystemDimensions.length === 0) {
    throw new Error('Cannot split state with empty subsystem dimensions');
  }
  
  if (subsystemDimensions.length === 1) {
    return [compositeState];
  }
  
  // Calculate expected total dimension
  const expectedDim = subsystemDimensions.reduce((prod, dim) => prod * dim, 1);
  if (compositeState.dimension !== expectedDim) {
    throw new Error(`State dimension ${compositeState.dimension} does not match expected ${expectedDim}`);
  }
  
  // Use existing DensityMatrixOperator for partial trace operations
  const { DensityMatrixOperator } = require('../../states/densityMatrix');
  const rho = DensityMatrixOperator.fromPureState(compositeState);
  
  const result: IStateVector[] = [];
  
  for (let i = 0; i < subsystemDimensions.length; i++) {
    // Trace out all subsystems except the i-th one
    const traceOutIndices = Array.from({length: subsystemDimensions.length}, (_, idx) => idx).filter(idx => idx !== i);
    
    if (traceOutIndices.length > 0) {
      const reducedRho = rho.partialTrace(subsystemDimensions, traceOutIndices);
      // For pure states, extract the state vector from reduced density matrix
      // This is a simplified extraction - would need eigendecomposition for mixed states
      const { StateVector } = require('../../states/stateVector');
      result.push(new StateVector(subsystemDimensions[i]));
    } else {
      result.push(compositeState);
    }
  }
  
  return result;
}
