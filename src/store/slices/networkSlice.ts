import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  SpinNetwork, 
  NetworkNode, 
  NetworkEdge,
  LatticeNetworkParams,
  CircularNetworkParams,
  RandomNetworkParams
} from '../../models/types';
import { 
  createEmptyNetwork,
  addNode,
  updateNode,
  removeNode,
  addEdge,
  updateEdge,
  removeEdge,
  updateNetworkMetadata
} from '../../models/networkModel';
import {
  createLatticeNetwork,
  createCircularNetwork,
  createRandomNetwork
} from '../../utils/networkGenerators';

// Maximum number of actions to keep in history
const MAX_HISTORY_LENGTH = 50;

// Define the state structure
interface NetworkState {
  currentNetwork: SpinNetwork;
  // For implementation of history (undo/redo)
  history: SpinNetwork[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}

// Initial state
const initialState: NetworkState = {
  currentNetwork: createEmptyNetwork(),
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
};

/**
 * Helper function to add current network to history before making a change
 */
const saveStateForHistory = (state: NetworkState) => {
  // Don't record history for identical states
  if (state.historyIndex >= 0 && 
      JSON.stringify(state.history[state.historyIndex]) === JSON.stringify(state.currentNetwork)) {
    return;
  }

  // If we're not at the end of the history, truncate it
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  
  // Add current network to history (create a deep copy)
  state.history.push(JSON.parse(JSON.stringify(state.currentNetwork)));
  
  // Trim history if it exceeds the maximum length
  if (state.history.length > MAX_HISTORY_LENGTH) {
    state.history = state.history.slice(state.history.length - MAX_HISTORY_LENGTH);
  }
  
  // Update index to point to the end
  state.historyIndex = state.history.length - 1;
  
  // Update undo/redo state
  state.canUndo = state.historyIndex > 0;
  state.canRedo = false;
};

/**
 * Network slice for managing the spin network data
 */
const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    // Undo the last action
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.currentNetwork = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        state.canUndo = state.historyIndex > 0;
        state.canRedo = true;
      }
    },
    
    // Redo the previously undone action
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.currentNetwork = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        state.canUndo = state.historyIndex > 0;
        state.canRedo = state.historyIndex < state.history.length - 1;
      }
    },
    // Create an empty network
    createEmpty: (state, action: PayloadAction<string | undefined>) => {
      // Add current network to history before changing
      if (state.currentNetwork.nodes.length > 0 || state.currentNetwork.edges.length > 0) {
        saveStateForHistory(state);
      }
      
      state.currentNetwork = createEmptyNetwork(action.payload);
      
      // Reset history for new network
      state.history = [JSON.parse(JSON.stringify(state.currentNetwork))];
      state.historyIndex = 0;
      state.canUndo = false;
      state.canRedo = false;
    },
    
    // Create a lattice network
    createLattice: (state, action: PayloadAction<LatticeNetworkParams>) => {
      // Add current network to history before changing
      if (state.currentNetwork.nodes.length > 0 || state.currentNetwork.edges.length > 0) {
        saveStateForHistory(state);
      }
      
      state.currentNetwork = createLatticeNetwork(action.payload);
      
      // Reset history for new network
      state.history = [JSON.parse(JSON.stringify(state.currentNetwork))];
      state.historyIndex = 0;
      state.canUndo = false;
      state.canRedo = false;
    },
    
    // Create a circular network
    createCircular: (state, action: PayloadAction<CircularNetworkParams>) => {
      // Add current network to history before changing
      if (state.currentNetwork.nodes.length > 0 || state.currentNetwork.edges.length > 0) {
        saveStateForHistory(state);
      }
      
      state.currentNetwork = createCircularNetwork(action.payload);
      
      // Reset history for new network
      state.history = [JSON.parse(JSON.stringify(state.currentNetwork))];
      state.historyIndex = 0;
      state.canUndo = false;
      state.canRedo = false;
    },
    
    // Create a random network
    createRandom: (state, action: PayloadAction<RandomNetworkParams>) => {
      // Add current network to history before changing
      if (state.currentNetwork.nodes.length > 0 || state.currentNetwork.edges.length > 0) {
        saveStateForHistory(state);
      }
      
      state.currentNetwork = createRandomNetwork(action.payload);
      
      // Reset history for new network
      state.history = [JSON.parse(JSON.stringify(state.currentNetwork))];
      state.historyIndex = 0;
      state.canUndo = false;
      state.canRedo = false;
    },
    
    // Set the entire network
    setNetwork: (state, action: PayloadAction<SpinNetwork>) => {
      // Add current network to history before changing
      if (state.currentNetwork.nodes.length > 0 || state.currentNetwork.edges.length > 0) {
        saveStateForHistory(state);
      }
      
      state.currentNetwork = action.payload;
      
      // Reset history for loaded network
      state.history = [JSON.parse(JSON.stringify(state.currentNetwork))];
      state.historyIndex = 0;
      state.canUndo = false;
      state.canRedo = false;
    },
    
    // Update network metadata
    updateMetadata: (state, action: PayloadAction<Partial<SpinNetwork['metadata']>>) => {
      saveStateForHistory(state);
      state.currentNetwork = updateNetworkMetadata(state.currentNetwork, action.payload);
    },
    
    // Add a node to the network
    addNetworkNode: (state, action: PayloadAction<NetworkNode>) => {
      // Save the current state before modification
      saveStateForHistory(state);
      // Apply the change
      state.currentNetwork = addNode(state.currentNetwork, action.payload);
    },
    
    // Update a node in the network
    updateNetworkNode: (state, action: PayloadAction<{ id: string; updates: Partial<NetworkNode> }>) => {
      // Save the current state before modification
      saveStateForHistory(state);
      const { id, updates } = action.payload;
      // Apply the change
      state.currentNetwork = updateNode(state.currentNetwork, id, updates);
    },
    
    // Remove a node from the network
    removeNetworkNode: (state, action: PayloadAction<string>) => {
      // Save the current state before modification
      saveStateForHistory(state);
      // Apply the change
      state.currentNetwork = removeNode(state.currentNetwork, action.payload);
    },
    
    // Add an edge to the network
    addNetworkEdge: (state, action: PayloadAction<NetworkEdge>) => {
      // Save the current state before modification
      saveStateForHistory(state);
      // Apply the change
      state.currentNetwork = addEdge(state.currentNetwork, action.payload);
    },
    
    // Update an edge in the network
    updateNetworkEdge: (state, action: PayloadAction<{ id: string; updates: Partial<NetworkEdge> }>) => {
      // Save the current state before modification
      saveStateForHistory(state);
      const { id, updates } = action.payload;
      // Apply the change
      state.currentNetwork = updateEdge(state.currentNetwork, id, updates);
    },
    
    // Remove an edge from the network
    removeNetworkEdge: (state, action: PayloadAction<string>) => {
      // Save the current state before modification
      saveStateForHistory(state);
      // Apply the change
      state.currentNetwork = removeEdge(state.currentNetwork, action.payload);
    },
    
    // Clear the network (remove all nodes and edges)
    clearNetwork: (state) => {
      saveStateForHistory(state);
      state.currentNetwork = {
        ...state.currentNetwork,
        nodes: [],
        edges: [],
        metadata: {
          ...state.currentNetwork.metadata,
          modified: Date.now()
        }
      };
    },
  },
});

// Export actions
export const { 
  createEmpty, 
  createLattice, 
  createCircular, 
  createRandom,
  setNetwork,
  updateMetadata,
  addNetworkNode,
  updateNetworkNode,
  removeNetworkNode,
  addNetworkEdge,
  updateNetworkEdge,
  removeNetworkEdge,
  clearNetwork,
  undo,
  redo
} = networkSlice.actions;

// Export reducer
export default networkSlice.reducer;
