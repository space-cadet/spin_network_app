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
    // Check if this is a network or a network with history
    const isNetworkWithHistory = typeof networkData === 'object' && 'network' in networkData;
    const network = isNetworkWithHistory ? networkData.network : networkData;
    
    const id = network.metadata?.id || `network-${Date.now()}`;
    const networkJson = JSON.stringify(networkData);
    
    try {
      await networkStorage.setItem(id, networkJson);
      return id;
    } catch (error) {
      console.error('Error saving network:', error);
      throw new Error('Failed to save network to storage');
    }
  },
  
  /**
   * Load a network from storage by ID
   */
  loadNetwork: async (id: string): Promise<SpinNetwork> => {
    try {
      const networkJson = await networkStorage.getItem<string>(id);
      
      if (!networkJson) {
        throw new Error(`Network with ID ${id} not found`);
      }
      
      return JSON.parse(networkJson) as SpinNetwork;
    } catch (error) {
      console.error('Error loading network:', error);
      throw new Error('Failed to load network from storage');
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
