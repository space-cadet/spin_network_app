/**
 * Multi-type quantum composition operations
 */

import { HilbertSpace } from '../core/hilbertSpace';
import { IOperator } from '../core/types';
import { IStateVector } from '../core/types';
import { StateVector } from './stateVector';
import { validateMatchDims } from '../utils/validation';

/**
 * Composes multiple Hilbert spaces via tensor product
 */
export function composeSpaces(spaces: HilbertSpace[]): HilbertSpace {
  if (spaces.length === 0) {
    throw new Error('Empty spaces array');
  }
  
  return spaces.reduce((acc, space) => acc.tensorProduct(space));
}

/**
 * Composes multiple state vectors via tensor product
 */
export function composeStates(states: IStateVector[]): IStateVector {
  if (states.length === 0) {
    throw new Error('Empty states array');
  }

  // Convert to StateVector instances if needed and use tensorProduct
  const stateVectors = states.map(state => 
    state instanceof StateVector ? state : new StateVector(state.dimension, state.amplitudes, state.basis)
  );
  
  return stateVectors.reduce((acc, state) => acc.tensorProduct(state));
}

/**
 * Composes multiple operators via tensor product
 */
export function composeOperators(operators: IOperator[]): IOperator {
  if (operators.length === 0) {
    throw new Error('Empty operators array');
  }

  const [first, ...rest] = operators;
  return rest.reduce((acc, op) => acc.tensorProduct(op), first);
}

/**
 * Creates a bipartite split of a Hilbert space
 */
export function bipartiteSplit(
  space: HilbertSpace,
  firstDimension: number
): [HilbertSpace, HilbertSpace] {
  const totalDim = space.dimension;
  if (totalDim % firstDimension !== 0) {
    throw new Error('First dimension must divide total dimension');
  }

  const secondDimension = totalDim / firstDimension;
  return space.decompose([firstDimension, secondDimension]) as [HilbertSpace, HilbertSpace];
}

/**
 * Performs partial trace over specified subsystems
 */
export function partialTrace(
  operator: IOperator,
  dims: number[],
  traceOutIndices: number[]
): IOperator {
  // Total dimension should match operator dimension
  const totalDim = dims.reduce((a, b) => a * b, 1);
  validateMatchDims(totalDim, operator.dimension);

  // Validation and implementation handled by operator's partialTrace
  return operator.partialTrace(dims, traceOutIndices);
}