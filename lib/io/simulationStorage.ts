/**
 * SimulationStorage - High-level API for saving/loading simulation data
 */

import { SimulationEngine } from '../core/types';
import { StorageAdapter } from './types';
import { getBestAvailableStorageAdapter } from './storageAdapters';
import { serializeSimulation, deserializeSimulation } from './serialization';

/**
 * Metadata for a stored simulation
 */
export interface StoredSimulationMetadata {
  /**
   * Unique identifier for the simulation
   */
  id: string;
  
  /**
   * Display name for the simulation
   */
  name: string;
  
  /**
   * When the simulation was created
   */
  createdAt: string;
  
  /**
   * When the simulation was last modified
   */
  lastModified: string;
  
  /**
   * Description of the simulation
   */
  description?: string;
  
  /**
   * Tags for categorizing the simulation
   */
  tags?: string[];
  
  /**
   * Number of nodes in the simulation graph
   */
  nodeCount?: number;
  
  /**
   * Number of edges in the simulation graph
   */
  edgeCount?: number;
  
  /**
   * Current simulation time
   */
  currentTime?: number;
  
  /**
   * Simulation type information
   */
  simulationType?: string;
  
  /**
   * Custom metadata fields
   */
  [key: string]: any;
}

/**
 * Options for the SimulationStorage class
 */
export interface SimulationStorageOptions {
  /**
   * Storage adapter to use
   * If not provided, the best available adapter will be used
   */
  storageAdapter?: StorageAdapter;
  
  /**
   * Namespace for storage
   * Used as a prefix for storage keys
   * @default 'spin-network'
   */
  namespace?: string;
  
  /**
   * Whether to automatically save metadata for simulations
   * @default true
   */
  autoSaveMetadata?: boolean;
  
  /**
   * Factory function to create a new simulation engine
   * Required for loading simulations
   */
  engineFactory?: () => SimulationEngine;
}

/**
 * High-level API for saving and loading simulation data
 */
export class SimulationStorage {
  private adapter: StorageAdapter;
  private namespace: string;
  private autoSaveMetadata: boolean;
  private engineFactory?: () => SimulationEngine;
  
  /**
   * Create a new SimulationStorage instance
   * @param options Storage options
   */
  constructor(options: SimulationStorageOptions = {}) {
    this.adapter = options.storageAdapter || getBestAvailableStorageAdapter();
    this.namespace = options.namespace || 'spin-network';
    this.autoSaveMetadata = options.autoSaveMetadata !== false;
    this.engineFactory = options.engineFactory;
    
    // Ensure the metadata index exists
    this.ensureMetadataIndex();
  }
  
  /**
   * Ensure the metadata index exists
   * Creates it if it doesn't exist
   */
  private async ensureMetadataIndex(): Promise<void> {
    const exists = await this.adapter.exists(this.getMetadataKey());
    
    if (!exists) {
      await this.adapter.save(this.getMetadataKey(), {
        simulations: [],
        lastUpdated: new Date().toISOString()
      });
    }
  }
  
  /**
   * Get the key for the metadata index
   * @returns Storage key for the metadata index
   */
  private getMetadataKey(): string {
    return `${this.namespace}:metadata`;
  }
  
  /**
   * Get the key for a simulation's data
   * @param id Simulation ID
   * @returns Storage key for the simulation data
   */
  private getSimulationKey(id: string): string {
    return `${this.namespace}:simulation:${id}`;
  }
  
  /**
   * Create a unique ID for a new simulation
   * @returns Unique ID
   */
  private createUniqueId(): string {
    return `sim_${Date.now()}_${Math.floor(Math.random() * 1000000).toString(16)}`;
  }
  
  /**
   * Save a simulation to storage
   * 
   * @param engine Simulation engine to save
   * @param metadata Metadata for the simulation
   * @returns ID of the saved simulation
   */
  async saveSimulation(
    engine: SimulationEngine, 
    metadata: Partial<StoredSimulationMetadata> = {}
  ): Promise<string> {
    // Create or use existing ID
    const id = metadata.id || this.createUniqueId();
    const now = new Date().toISOString();
    
    // Create full metadata
    const fullMetadata: StoredSimulationMetadata = {
      id,
      name: metadata.name || `Simulation ${id}`,
      createdAt: metadata.createdAt || now,
      lastModified: now,
      description: metadata.description,
      tags: metadata.tags || [],
      ...metadata
    };
    
    // Extract additional metadata from engine
    const engineImpl = engine as any;
    if (engineImpl.getGraph) {
      const graph = engineImpl.getGraph();
      fullMetadata.nodeCount = graph.getNodeCount();
      fullMetadata.edgeCount = graph.getEdgeCount();
    }
    
    fullMetadata.currentTime = engine.getCurrentTime();
    fullMetadata.simulationType = engineImpl.constructor.name;
    
    // Serialize the simulation
    const serializedData = serializeSimulation(engine);
    
    // Save the simulation data
    await this.adapter.save(this.getSimulationKey(id), serializedData);
    
    // Update metadata index if autoSaveMetadata is enabled
    if (this.autoSaveMetadata) {
      await this.updateMetadata(fullMetadata);
    }
    
    return id;
  }
  
  /**
   * Update the metadata for a simulation
   * 
   * @param metadata Metadata to update
   */
  async updateMetadata(metadata: StoredSimulationMetadata): Promise<void> {
    // Load current metadata index
    const metadataIndex = await this.adapter.load<{ simulations: StoredSimulationMetadata[], lastUpdated: string }>(
      this.getMetadataKey()
    );
    
    if (!metadataIndex) {
      // Create new metadata index if it doesn't exist
      await this.adapter.save(this.getMetadataKey(), {
        simulations: [metadata],
        lastUpdated: new Date().toISOString()
      });
      return;
    }
    
    // Update or add the metadata
    const existingIndex = metadataIndex.simulations.findIndex(sim => sim.id === metadata.id);
    
    if (existingIndex >= 0) {
      // Update existing metadata
      metadataIndex.simulations[existingIndex] = metadata;
    } else {
      // Add new metadata
      metadataIndex.simulations.push(metadata);
    }
    
    // Sort by last modified (newest first)
    metadataIndex.simulations.sort((a, b) => {
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });
    
    // Update the index
    metadataIndex.lastUpdated = new Date().toISOString();
    await this.adapter.save(this.getMetadataKey(), metadataIndex);
  }
  
  /**
   * Load a simulation from storage
   * 
   * @param id ID of the simulation to load
   * @returns The loaded simulation engine
   * @throws Error if the simulation cannot be loaded or if engineFactory is not provided
   */
  async loadSimulation(id: string): Promise<SimulationEngine> {
    if (!this.engineFactory) {
      throw new Error('Cannot load simulation: engineFactory is required');
    }
    
    // Load the simulation data
    const data = await this.adapter.load<any>(this.getSimulationKey(id));
    
    if (!data) {
      throw new Error(`Simulation not found: ${id}`);
    }
    
    // Deserialize the simulation
    return deserializeSimulation(data, this.engineFactory);
  }
  
  /**
   * Get the metadata for all saved simulations
   * 
   * @returns Array of simulation metadata
   */
  async getSimulationList(): Promise<StoredSimulationMetadata[]> {
    // Ensure metadata index exists
    await this.ensureMetadataIndex();
    
    // Load metadata index
    const metadataIndex = await this.adapter.load<{ simulations: StoredSimulationMetadata[], lastUpdated: string }>(
      this.getMetadataKey()
    );
    
    return metadataIndex?.simulations || [];
  }
  
  /**
   * Get the metadata for a specific simulation
   * 
   * @param id ID of the simulation
   * @returns Simulation metadata, or null if not found
   */
  async getSimulationMetadata(id: string): Promise<StoredSimulationMetadata | null> {
    const simulations = await this.getSimulationList();
    return simulations.find(sim => sim.id === id) || null;
  }
  
  /**
   * Delete a simulation from storage
   * 
   * @param id ID of the simulation to delete
   */
  async deleteSimulation(id: string): Promise<void> {
    // Delete the simulation data
    await this.adapter.delete(this.getSimulationKey(id));
    
    // Update the metadata index
    const metadataIndex = await this.adapter.load<{ simulations: StoredSimulationMetadata[], lastUpdated: string }>(
      this.getMetadataKey()
    );
    
    if (metadataIndex) {
      // Remove the simulation from the index
      metadataIndex.simulations = metadataIndex.simulations.filter(sim => sim.id !== id);
      metadataIndex.lastUpdated = new Date().toISOString();
      
      // Save the updated index
      await this.adapter.save(this.getMetadataKey(), metadataIndex);
    }
  }
  
  /**
   * Check if a simulation exists in storage
   * 
   * @param id ID of the simulation to check
   * @returns True if the simulation exists, false otherwise
   */
  async hasSimulation(id: string): Promise<boolean> {
    return this.adapter.exists(this.getSimulationKey(id));
  }
  
  /**
   * Create a backup of all simulations
   * 
   * @returns Backup data as a JSON string
   */
  async createBackup(): Promise<string> {
    // Get all simulation IDs
    const simulations = await this.getSimulationList();
    
    // Create backup object
    const backup = {
      format: 'spin-network-backup',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      metadata: simulations,
      simulationData: {} as Record<string, any>
    };
    
    // Load simulation data for each ID
    for (const sim of simulations) {
      const data = await this.adapter.load<any>(this.getSimulationKey(sim.id));
      if (data) {
        backup.simulationData[sim.id] = data;
      }
    }
    
    return JSON.stringify(backup);
  }
  
  /**
   * Restore simulations from a backup
   * 
   * @param backupData Backup data as a JSON string
   * @param overwrite Whether to overwrite existing simulations
   * @returns Number of simulations restored
   */
  async restoreFromBackup(backupData: string, overwrite: boolean = false): Promise<number> {
    let backup: any;
    
    try {
      backup = JSON.parse(backupData);
    } catch (error) {
      throw new Error(`Invalid backup data: ${error.message}`);
    }
    
    // Validate backup format
    if (backup.format !== 'spin-network-backup' || !backup.metadata || !backup.simulationData) {
      throw new Error('Invalid backup format');
    }
    
    // Restore each simulation
    let restoredCount = 0;
    
    for (const metadata of backup.metadata) {
      const id = metadata.id;
      const data = backup.simulationData[id];
      
      if (!data) {
        continue; // Skip if simulation data is missing
      }
      
      // Check if simulation already exists
      const exists = await this.hasSimulation(id);
      
      if (!exists || overwrite) {
        // Save simulation data
        await this.adapter.save(this.getSimulationKey(id), data);
        
        // Update metadata
        if (this.autoSaveMetadata) {
          await this.updateMetadata(metadata);
        }
        
        restoredCount++;
      }
    }
    
    return restoredCount;
  }
  
  /**
   * Set the factory function for creating simulation engines
   * 
   * @param factory Factory function
   */
  setEngineFactory(factory: () => SimulationEngine): void {
    this.engineFactory = factory;
  }
  
  /**
   * Get the current storage adapter
   * 
   * @returns Storage adapter
   */
  getStorageAdapter(): StorageAdapter {
    return this.adapter;
  }
  
  /**
   * Set a different storage adapter
   * 
   * @param adapter New storage adapter
   */
  setStorageAdapter(adapter: StorageAdapter): void {
    this.adapter = adapter;
  }
}
