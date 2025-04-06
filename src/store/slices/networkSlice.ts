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
  if (state.historyIndex >= 0) {
    const currentJson = JSON.stringify(state.currentNetwork);
    const historyJson = JSON.stringify(state.history[state.historyIndex]);
    
    if (currentJson === historyJson) {
      console.log("Skipping history save for identical state");
      return;
    }
  }

  // If we're not at the end of the history, truncate it
  if (state.historyIndex < state.history.length - 1) {
    console.log(`Truncating history from ${state.history.length} to ${state.historyIndex + 1}`);
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  
  // Add current network to history (create a deep copy)
  const historyCopy = JSON.parse(JSON.stringify(state.currentNetwork));
  state.history.push(historyCopy);
  console.log(`Added state to history at index ${state.history.length - 1}`);
  
  // Trim history if it exceeds the maximum length
  if (state.history.length > MAX_HISTORY_LENGTH) {
    const trimAmount = state.history.length - MAX_HISTORY_LENGTH;
    console.log(`Trimming ${trimAmount} items from history`);
    state.history = state.history.slice(trimAmount);
    // Adjust historyIndex since we removed items from the beginning
    state.historyIndex = state.historyIndex - trimAmount;
  }
  
  // Update index to point to the end
  state.historyIndex = state.history.length - 1;
  
  // Update undo/redo state
  state.canUndo = state.historyIndex > 0;
  state.canRedo = false;
  
  console.log(`History state updated: index=${state.historyIndex}, length=${state.history.length}, canUndo=${state.canUndo}, canRedo=${state.canRedo}`);
};

/**
 * Network slice for managing the spin network data
 */
const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    // Add a special action to save history before a group operation
    saveHistoryBeforeGroupOperation: (state) => {
      console.log("Saving history before group operation");
      saveStateForHistory(state);
      // We don't modify the network here, just save the current state
    },
    
    // Add a special action to finalize a group operation
    finalizeGroupOperation: (state) => {
      console.log("Finalizing group operation");
      
      // Edge case: If there's no valid history yet, add the initial state first
      if (state.history.length === 0) {
        console.log("No history exists, adding initial state");
        state.history.push(JSON.parse(JSON.stringify(state.currentNetwork)));
        state.historyIndex = 0;
        state.canUndo = false;
        state.canRedo = false;
        return;
      }
      
      // Compare the current state with the last history entry
      const lastHistoryJson = JSON.stringify(state.history[state.historyIndex]);
      const currentJson = JSON.stringify(state.currentNetwork);
      
      if (lastHistoryJson === currentJson) {
        console.log("No changes detected, skipping finalization");
        return;
      }
      
      // If we're not at the end of the history, truncate it
      if (state.historyIndex < state.history.length - 1) {
        console.log(`Truncating history from ${state.history.length} to ${state.historyIndex + 1}`);
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      
      // Add the current state as a single history entry (deep copy)
      const finalState = JSON.parse(JSON.stringify(state.currentNetwork));
      state.history.push(finalState);
      console.log(`Added finalized state to history at index ${state.history.length - 1}`);
      
      // Trim history if it exceeds the maximum length
      if (state.history.length > MAX_HISTORY_LENGTH) {
        const trimAmount = state.history.length - MAX_HISTORY_LENGTH;
        console.log(`Trimming ${trimAmount} items from history`);
        state.history = state.history.slice(trimAmount);
        // Adjust historyIndex since we removed items from the beginning
        state.historyIndex = state.historyIndex - trimAmount;
      }
      
      // Update index to point to the end
      state.historyIndex = state.history.length - 1;
      
      // Update undo/redo state
      state.canUndo = state.historyIndex > 0;
      state.canRedo = false;
      
      console.log(`History state finalized: index=${state.historyIndex}, length=${state.history.length}, canUndo=${state.canUndo}, canRedo=${state.canRedo}`);
    },
    
    // Undo the last action with improved state restoration
    undo: (state) => {
      if (state.historyIndex <= 0) {
        console.log("Cannot undo - at earliest state or no history");
        return;
      }
      
      try {
        console.log(`Undoing from history index ${state.historyIndex} to ${state.historyIndex - 1}`);
        
        // Move to previous state in history
        state.historyIndex--;
        
        // Ensure the index is valid
        if (state.historyIndex < 0 || state.historyIndex >= state.history.length) {
          console.error(`Invalid history index after undo: ${state.historyIndex}`);
          state.historyIndex = Math.min(Math.max(0, state.historyIndex), state.history.length - 1);
        }
        
        // Deep copy to ensure complete state restoration
        if (state.history[state.historyIndex]) {
          state.currentNetwork = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
          console.log(`Restored network state: ${state.currentNetwork.nodes.length} nodes, ${state.currentNetwork.edges.length} edges`);
        } else {
          console.error(`No history state found at index ${state.historyIndex}`);
        }
        
        // Update flags
        state.canUndo = state.historyIndex > 0;
        state.canRedo = state.historyIndex < state.history.length - 1;
        
        console.log(`Undo complete - new state at index: ${state.historyIndex}, canUndo=${state.canUndo}, canRedo=${state.canRedo}`);
      } catch (error) {
        console.error("Error during undo operation:", error);
      }
    },
    
    // Redo the previously undone action with improved state restoration
    redo: (state) => {
      if (state.historyIndex >= state.history.length - 1) {
        console.log("Cannot redo - at latest state or no future states");
        return;
      }
      
      try {
        console.log(`Redoing from history index ${state.historyIndex} to ${state.historyIndex + 1}`);
        
        // Move to next state in history
        state.historyIndex++;
        
        // Ensure the index is valid
        if (state.historyIndex < 0 || state.historyIndex >= state.history.length) {
          console.error(`Invalid history index after redo: ${state.historyIndex}`);
          state.historyIndex = Math.min(Math.max(0, state.historyIndex), state.history.length - 1);
        }
        
        // Deep copy to ensure complete state restoration
        if (state.history[state.historyIndex]) {
          state.currentNetwork = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
          console.log(`Restored network state: ${state.currentNetwork.nodes.length} nodes, ${state.currentNetwork.edges.length} edges`);
        } else {
          console.error(`No history state found at index ${state.historyIndex}`);
        }
        
        // Update flags
        state.canUndo = state.historyIndex > 0;
        state.canRedo = state.historyIndex < state.history.length - 1;
        
        console.log(`Redo complete - new state at index: ${state.historyIndex}, canUndo=${state.canUndo}, canRedo=${state.canRedo}`);
      } catch (error) {
        console.error("Error during redo operation:", error);
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
    
    // Set the network with history (for loading saved networks with history)
    setNetworkWithHistory: (state, action: PayloadAction<{
      network: SpinNetwork;
      history: {
        history: SpinNetwork[];
        historyIndex: number;
        canUndo: boolean;
        canRedo: boolean;
      };
    }>) => {
      const { network, history } = action.payload;
      
      // Set the network
      state.currentNetwork = network;
      
      // Restore history state
      state.history = history.history;
      state.historyIndex = history.historyIndex;
      state.canUndo = history.canUndo;
      state.canRedo = history.canRedo;
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
