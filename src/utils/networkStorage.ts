import localforage from 'localforage';
import { SpinNetwork } from '../models/types';

// Configure localforage instance for network storage
const networkStorage = localforage.createInstance({
  name: 'spin-network-app',
  storeName: 'networkFiles'
});

/**
 * Storage utilities for network files
 */
export const NetworkStorage = {
  /**
   * Save a network to storage
   */
  saveNetwork: async (networkData: any): Promise<string> => {
    try {
      // Check if this is a network or a network with history
      const isNetworkWithHistory = typeof networkData === 'object' && 'network' in networkData;
      console.log('Is network with history?', isNetworkWithHistory);
      
      let network;
      if (isNetworkWithHistory) {
        network = networkData.network;
      } else {
        network = networkData;
      }
      
      if (!network || !network.metadata) {
        throw new Error('Invalid network data structure');
      }
      
      const id = network.metadata?.id || `network-${Date.now()}`;
      console.log(`Saving network with ID: ${id}`);
      
      // Serialize to JSON
      const networkJson = JSON.stringify(networkData);
      console.log(`Serialized network size: ${networkJson.length} characters`);
      
      // Save to IndexedDB via localforage
      await networkStorage.setItem(id, networkJson);
      console.log(`Network saved successfully to storage with ID: ${id}`);
      return id;
    } catch (error) {
      console.error('Error saving network:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to save network: ${error.message}`);
      } else {
        throw new Error('Failed to save network to storage');
      }
    }
  },
  
  /**
   * Load a network from storage by ID
   */
  loadNetwork: async (id: string): Promise<any> => {
    try {
      console.log(`Loading network with ID: ${id}`);
      const networkJson = await networkStorage.getItem<string>(id);
      
      if (!networkJson) {
        throw new Error(`Network with ID ${id} not found`);
      }
      
      console.log(`Network loaded from storage, JSON length: ${networkJson.length}`);
      const parsedData = JSON.parse(networkJson);
      
      // Check if this is a network with history or just a network
      const isNetworkWithHistory = typeof parsedData === 'object' && 'network' in parsedData && 'history' in parsedData;
      console.log('Loaded data is network with history?', isNetworkWithHistory);
      
      return parsedData;
    } catch (error) {
      console.error('Error loading network:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to load network: ${error.message}`);
      } else {
        throw new Error('Failed to load network from storage');
      }
    }
  },
  
  /**
   * Delete a network from storage by ID
   */
  deleteNetwork: async (id: string): Promise<void> => {
    try {
      await networkStorage.removeItem(id);
    } catch (error) {
      console.error('Error deleting network:', error);
      throw new Error('Failed to delete network from storage');
    }
  },
  
  /**
   * Get all networks from storage
   */
  getAllNetworks: async (): Promise<SpinNetwork[]> => {
    const networks: SpinNetwork[] = [];
    
    try {
      await networkStorage.iterate<string, void>((value, key) => {
        const network = JSON.parse(value) as SpinNetwork;
        networks.push(network);
      });
      
      return networks;
    } catch (error) {
      console.error('Error getting all networks:', error);
      throw new Error('Failed to retrieve networks from storage');
    }
  }
};
