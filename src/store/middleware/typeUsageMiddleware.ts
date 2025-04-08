import { Middleware } from 'redux';
import { updateNodeTypeUsage, updateEdgeTypeUsage } from '../slices/typeSlice';
import { calculateNodeTypeUsage, calculateEdgeTypeUsage } from '../../utils/typeUsageCalculator';
import { RootState } from '../index';

/**
 * Middleware to update type usage statistics when the network changes
 */
const typeUsageMiddleware: Middleware = store => next => action => {
  // First, let the action go through
  const result = next(action);
  
  // Check if this is an action that might change the network structure
  const networkActionsPattern = /^network\/(addNetworkNode|updateNetworkNode|removeNetworkNode|addNetworkEdge|updateNetworkEdge|removeNetworkEdge|setNetwork|createEmpty|createLattice|createCircular|createRandom|clearNetwork|undo|redo)/;
  
  if (typeof action.type === 'string' && networkActionsPattern.test(action.type)) {
    const state = store.getState() as RootState;
    const network = state.network.currentNetwork;
    
    // Calculate new usage stats
    const nodeTypeUsage = calculateNodeTypeUsage(network);
    const edgeTypeUsage = calculateEdgeTypeUsage(network);
    
    // Dispatch updates to type usage
    store.dispatch(updateNodeTypeUsage(nodeTypeUsage));
    store.dispatch(updateEdgeTypeUsage(edgeTypeUsage));
  }
  
  return result;
};

export default typeUsageMiddleware;
