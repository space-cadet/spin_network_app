import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SpinNetwork } from '../../models/types';

// Maximum number of recent networks to keep
const MAX_RECENT_NETWORKS = 10;

// Interface for recent network entry
export interface RecentNetworkEntry {
  id: string;
  name: string;
  timestamp: number;
  preview?: string; // Could be a thumbnail or serialized preview
  nodeCount: number;
  edgeCount: number;
}

// Interface for recent networks state
interface RecentNetworksState {
  entries: RecentNetworkEntry[];
}

// Initial state
const initialState: RecentNetworksState = {
  entries: [],
};

/**
 * Create a recent network entry from a network
 */
const createEntryFromNetwork = (network: SpinNetwork): RecentNetworkEntry => {
  return {
    id: network.metadata?.id || `network-${Date.now()}`,
    name: network.metadata?.name || 'Unnamed Network',
    timestamp: Date.now(),
    nodeCount: network.nodes.length,
    edgeCount: network.edges.length,
    // Could generate a preview here in the future
  };
};

/**
 * Recent networks slice for tracking recently used networks
 */
const recentNetworksSlice = createSlice({
  name: 'recentNetworks',
  initialState,
  reducers: {
    // Add a network to recent networks
    addToRecentNetworks: (state, action: PayloadAction<SpinNetwork>) => {
      const network = action.payload;
      const entry = createEntryFromNetwork(network);
      
      // Check if this network already exists in recent networks
      const existingIndex = state.entries.findIndex(n => n.id === entry.id);
      if (existingIndex !== -1) {
        // Remove the existing entry
        state.entries.splice(existingIndex, 1);
      }
      
      // Add the new entry at the beginning
      state.entries.unshift(entry);
      
      // Trim the list if it exceeds the maximum length
      if (state.entries.length > MAX_RECENT_NETWORKS) {
        state.entries = state.entries.slice(0, MAX_RECENT_NETWORKS);
      }
    },
    
    // Remove a network from recent networks
    removeFromRecentNetworks: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.entries = state.entries.filter(entry => entry.id !== id);
    },
    
    // Clear all recent networks
    clearRecentNetworks: (state) => {
      state.entries = [];
    },
  },
});

// Export actions
export const { 
  addToRecentNetworks, 
  removeFromRecentNetworks, 
  clearRecentNetworks 
} = recentNetworksSlice.actions;

// Export reducer
export default recentNetworksSlice.reducer;
