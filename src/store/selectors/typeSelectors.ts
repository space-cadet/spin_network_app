import { RootState } from '../index';
import { NodeType, EdgeType, DEFAULT_NODE_TYPES, DEFAULT_EDGE_TYPES } from '../../models/typeModels';

/**
 * Helper functions for type safety
 */
const ensureNodeTypeArray = (types: any): NodeType[] => {
  if (!types) return DEFAULT_NODE_TYPES;
  if (!Array.isArray(types)) return DEFAULT_NODE_TYPES;
  return types;
};

const ensureEdgeTypeArray = (types: any): EdgeType[] => {
  if (!types) return DEFAULT_EDGE_TYPES;
  if (!Array.isArray(types)) return DEFAULT_EDGE_TYPES;
  return types;
};

/**
 * Selectors for the type management state
 */

// Node type selectors
export const selectAllNodeTypes = (state: RootState): NodeType[] => 
  ensureNodeTypeArray(state.types.nodeTypes);

export const selectNodeTypeById = (state: RootState, id: string): NodeType | undefined => {
  const types = ensureNodeTypeArray(state.types.nodeTypes);
  return types.find((type: NodeType) => type.id === id);
};

export const selectNodeTypeUsage = (state: RootState): Record<string, number> => 
  state.types.nodeTypeUsage || {};

export const selectNodeTypeUsageById = (state: RootState, id: string): number => 
  (state.types.nodeTypeUsage || {})[id] || 0;

// Edge type selectors
export const selectAllEdgeTypes = (state: RootState): EdgeType[] => 
  ensureEdgeTypeArray(state.types.edgeTypes);

export const selectEdgeTypeById = (state: RootState, id: string): EdgeType | undefined => {
  const types = ensureEdgeTypeArray(state.types.edgeTypes);
  return types.find(type => type.id === id);
};

export const selectEdgeTypeUsage = (state: RootState): Record<string, number> => 
  state.types.edgeTypeUsage || {};

export const selectEdgeTypeUsageById = (state: RootState, id: string): number => 
  (state.types.edgeTypeUsage || {})[id] || 0;

// System type selectors
export const selectSystemNodeTypes = (state: RootState): NodeType[] => {
  const types = ensureNodeTypeArray(state.types.nodeTypes);
  return types.filter((type: NodeType) => type.isSystem === true);
};

export const selectSystemEdgeTypes = (state: RootState): EdgeType[] => {
  const types = ensureEdgeTypeArray(state.types.edgeTypes);
  return types.filter((type: EdgeType) => type.isSystem === true);
};

// Custom (non-system) type selectors
export const selectCustomNodeTypes = (state: RootState): NodeType[] => {
  const types = ensureNodeTypeArray(state.types.nodeTypes);
  return types.filter((type: NodeType) => type.isSystem !== true);
};

export const selectCustomEdgeTypes = (state: RootState): EdgeType[] => {
  const types = ensureEdgeTypeArray(state.types.edgeTypes);
  return types.filter((type: EdgeType) => type.isSystem !== true);
};

// Default type selectors (for when no specific type is selected)
export const selectDefaultNodeType = (state: RootState): NodeType | undefined => {
  const types = ensureNodeTypeArray(state.types.nodeTypes);
  return types.find(type => type.id === 'regular') || DEFAULT_NODE_TYPES[0];
};

export const selectDefaultEdgeType = (state: RootState): EdgeType | undefined => {
  const types = ensureEdgeTypeArray(state.types.edgeTypes);
  return types.find(type => type.id === 'regular') || DEFAULT_EDGE_TYPES[0];
};