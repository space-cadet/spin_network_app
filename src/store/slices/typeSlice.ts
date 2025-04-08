import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NodeType, EdgeType, DEFAULT_NODE_TYPES, DEFAULT_EDGE_TYPES } from '../../models/typeModels';

interface TypeState {
  nodeTypes: NodeType[];
  edgeTypes: EdgeType[];
  // Track usage counts for displaying in UI and deletion safety checks
  nodeTypeUsage: Record<string, number>;
  edgeTypeUsage: Record<string, number>;
}

const initialState: TypeState = {
  nodeTypes: DEFAULT_NODE_TYPES,
  edgeTypes: DEFAULT_EDGE_TYPES,
  nodeTypeUsage: {},
  edgeTypeUsage: {}
};

// Helper function to ensure types are arrays
const ensureArray = <T>(value: any, defaultValue: T[]): T[] => {
  if (!value) return defaultValue;
  if (!Array.isArray(value)) return defaultValue;
  return value;
};

// Helper to validate the entire state for type safety
const validateState = (state: any): TypeState => {
  return {
    nodeTypes: ensureArray(state?.nodeTypes, DEFAULT_NODE_TYPES),
    edgeTypes: ensureArray(state?.edgeTypes, DEFAULT_EDGE_TYPES),
    nodeTypeUsage: state?.nodeTypeUsage || {},
    edgeTypeUsage: state?.edgeTypeUsage || {}
  };
};

const typeSlice = createSlice({
  name: 'types',
  initialState,
  reducers: {
    // Node type management actions
    addNodeType: (state, action: PayloadAction<NodeType>) => {
      // Validate state
      const validState = validateState(state);
      state.nodeTypes = validState.nodeTypes;
      
      // Check if type with this ID already exists
      if (state.nodeTypes.some(type => type.id === action.payload.id)) {
        // Generate a unique ID if needed
        const timestamp = Date.now();
        action.payload.id = `${action.payload.id}-${timestamp}`;
      }
      
      state.nodeTypes.push(action.payload);
      // Initialize usage count for new type
      state.nodeTypeUsage[action.payload.id] = 0;
    },
    
    updateNodeType: (state, action: PayloadAction<NodeType>) => {
      // Validate state
      const validState = validateState(state);
      state.nodeTypes = validState.nodeTypes;
      
      const index = state.nodeTypes.findIndex(type => type.id === action.payload.id);
      if (index !== -1) {
        // Preserve the isSystem flag if it exists
        const isSystem = state.nodeTypes[index].isSystem;
        state.nodeTypes[index] = {
          ...action.payload,
          isSystem: isSystem
        };
      }
    },
    
    removeNodeType: (state, action: PayloadAction<string>) => {
      // Validate state
      const validState = validateState(state);
      state.nodeTypes = validState.nodeTypes;
      
      // Don't remove system types
      const typeToRemove = state.nodeTypes.find(type => type.id === action.payload);
      if (typeToRemove?.isSystem) {
        return;
      }
      
      state.nodeTypes = state.nodeTypes.filter(type => type.id !== action.payload);
      // Clean up usage count
      delete state.nodeTypeUsage[action.payload];
    },
    
    // Edge type management actions
    addEdgeType: (state, action: PayloadAction<EdgeType>) => {
      // Validate state
      const validState = validateState(state);
      state.edgeTypes = validState.edgeTypes;
      
      // Check if type with this ID already exists
      if (state.edgeTypes.some(type => type.id === action.payload.id)) {
        // Generate a unique ID if needed
        const timestamp = Date.now();
        action.payload.id = `${action.payload.id}-${timestamp}`;
      }
      
      state.edgeTypes.push(action.payload);
      // Initialize usage count for new type
      state.edgeTypeUsage[action.payload.id] = 0;
    },
    
    updateEdgeType: (state, action: PayloadAction<EdgeType>) => {
      // Validate state
      const validState = validateState(state);
      state.edgeTypes = validState.edgeTypes;
      
      const index = state.edgeTypes.findIndex(type => type.id === action.payload.id);
      if (index !== -1) {
        // Preserve the isSystem flag if it exists
        const isSystem = state.edgeTypes[index].isSystem;
        state.edgeTypes[index] = {
          ...action.payload,
          isSystem: isSystem
        };
      }
    },
    
    removeEdgeType: (state, action: PayloadAction<string>) => {
      // Validate state
      const validState = validateState(state);
      state.edgeTypes = validState.edgeTypes;
      
      // Don't remove system types
      const typeToRemove = state.edgeTypes.find(type => type.id === action.payload);
      if (typeToRemove?.isSystem) {
        return;
      }
      
      state.edgeTypes = state.edgeTypes.filter(type => type.id !== action.payload);
      // Clean up usage count
      delete state.edgeTypeUsage[action.payload];
    },
    
    // Reset to default types
    resetNodeTypes: (state) => {
      // Reset to default node types
      state.nodeTypes = [...DEFAULT_NODE_TYPES];
    },
    
    resetEdgeTypes: (state) => {
      // Reset to default edge types
      state.edgeTypes = [...DEFAULT_EDGE_TYPES];
    },
    
    // Update type usage counts
    updateNodeTypeUsage: (state, action: PayloadAction<Record<string, number>>) => {
      state.nodeTypeUsage = action.payload;
    },
    
    updateEdgeTypeUsage: (state, action: PayloadAction<Record<string, number>>) => {
      state.edgeTypeUsage = action.payload;
    },
    
    // Completely reset to initial state (for testing or app reset)
    resetAllTypes: (state) => {
      state.nodeTypes = [...DEFAULT_NODE_TYPES];
      state.edgeTypes = [...DEFAULT_EDGE_TYPES];
      state.nodeTypeUsage = {};
      state.edgeTypeUsage = {};
    }
  }
});

export const {
  addNodeType,
  updateNodeType,
  removeNodeType,
  addEdgeType,
  updateEdgeType,
  removeEdgeType,
  resetNodeTypes,
  resetEdgeTypes,
  updateNodeTypeUsage,
  updateEdgeTypeUsage,
  resetAllTypes
} = typeSlice.actions;

export default typeSlice.reducer;