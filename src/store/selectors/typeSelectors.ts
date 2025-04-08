import { RootState } from '../index';
import { NodeType, EdgeType } from '../../models/typeModels';

/**
 * Selectors for the type management state
 */

// Node type selectors
export const selectAllNodeTypes = (state: RootState): NodeType[] => 
  state.types.nodeTypes;

export const selectNodeTypeById = (state: RootState, id: string): NodeType | undefined => 
  state.types.nodeTypes.find(type => type.id === id);

export const selectNodeTypeUsage = (state: RootState): Record<string, number> => 
  state.types.nodeTypeUsage;

export const selectNodeTypeUsageById = (state: RootState, id: string): number => 
  state.types.nodeTypeUsage[id] || 0;

// Edge type selectors
export const selectAllEdgeTypes = (state: RootState): EdgeType[] => 
  state.types.edgeTypes;

export const selectEdgeTypeById = (state: RootState, id: string): EdgeType | undefined => 
  state.types.edgeTypes.find(type => type.id === id);

export const selectEdgeTypeUsage = (state: RootState): Record<string, number> => 
  state.types.edgeTypeUsage;

export const selectEdgeTypeUsageById = (state: RootState, id: string): number => 
  state.types.edgeTypeUsage[id] || 0;

// System type selectors
export const selectSystemNodeTypes = (state: RootState): NodeType[] => 
  state.types.nodeTypes.filter(type => type.isSystem === true);

export const selectSystemEdgeTypes = (state: RootState): EdgeType[] => 
  state.types.edgeTypes.filter(type => type.isSystem === true);

// Custom (non-system) type selectors
export const selectCustomNodeTypes = (state: RootState): NodeType[] => 
  state.types.nodeTypes.filter(type => type.isSystem !== true);

export const selectCustomEdgeTypes = (state: RootState): EdgeType[] => 
  state.types.edgeTypes.filter(type => type.isSystem !== true);

// Default type selectors (for when no specific type is selected)
export const selectDefaultNodeType = (state: RootState): NodeType | undefined => 
  state.types.nodeTypes.find(type => type.id === 'regular');

export const selectDefaultEdgeType = (state: RootState): EdgeType | undefined => 
  state.types.edgeTypes.find(type => type.id === 'regular');
