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

// Define the state structure
interface NetworkState {
  currentNetwork: SpinNetwork;
  // For future implementation of history (undo/redo)
  history: SpinNetwork[];
  historyIndex: number;
}

// Initial state
const initialState: NetworkState = {
  currentNetwork: createEmptyNetwork(),
  history: [],
  historyIndex: -1,
};

/**
 * Network slice for managing the spin network data
 */
const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    // Create an empty network
    createEmpty: (state, action: PayloadAction<string | undefined>) => {
      state.currentNetwork = createEmptyNetwork(action.payload);
    },
    
    // Create a lattice network
    createLattice: (state, action: PayloadAction<LatticeNetworkParams>) => {
      state.currentNetwork = createLatticeNetwork(action.payload);
    },
    
    // Create a circular network
    createCircular: (state, action: PayloadAction<CircularNetworkParams>) => {
      state.currentNetwork = createCircularNetwork(action.payload);
    },
    
    // Create a random network
    createRandom: (state, action: PayloadAction<RandomNetworkParams>) => {
      state.currentNetwork = createRandomNetwork(action.payload);
    },
    
    // Set the entire network
    setNetwork: (state, action: PayloadAction<SpinNetwork>) => {
      state.currentNetwork = action.payload;
    },
    
    // Update network metadata
    updateMetadata: (state, action: PayloadAction<Partial<SpinNetwork['metadata']>>) => {
      state.currentNetwork = updateNetworkMetadata(state.currentNetwork, action.payload);
    },
    
    // Add a node to the network
    addNetworkNode: (state, action: PayloadAction<NetworkNode>) => {
      state.currentNetwork = addNode(state.currentNetwork, action.payload);
    },
    
    // Update a node in the network
    updateNetworkNode: (state, action: PayloadAction<{ id: string; updates: Partial<NetworkNode> }>) => {
      const { id, updates } = action.payload;
      state.currentNetwork = updateNode(state.currentNetwork, id, updates);
    },
    
    // Remove a node from the network
    removeNetworkNode: (state, action: PayloadAction<string>) => {
      state.currentNetwork = removeNode(state.currentNetwork, action.payload);
    },
    
    // Add an edge to the network
    addNetworkEdge: (state, action: PayloadAction<NetworkEdge>) => {
      state.currentNetwork = addEdge(state.currentNetwork, action.payload);
    },
    
    // Update an edge in the network
    updateNetworkEdge: (state, action: PayloadAction<{ id: string; updates: Partial<NetworkEdge> }>) => {
      const { id, updates } = action.payload;
      state.currentNetwork = updateEdge(state.currentNetwork, id, updates);
    },
    
    // Remove an edge from the network
    removeNetworkEdge: (state, action: PayloadAction<string>) => {
      state.currentNetwork = removeEdge(state.currentNetwork, action.payload);
    },
    
    // Clear the network (remove all nodes and edges)
    clearNetwork: (state) => {
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
  clearNetwork
} = networkSlice.actions;

// Export reducer
export default networkSlice.reducer;
