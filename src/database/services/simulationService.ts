/**
 * Service for managing simulation data in the database
 */
import { db } from '../db.config';
import { 
  SimulationRecord, 
  SimulationResultRecord, 
  SimulationQueryOptions,
  ResultQueryOptions,
  SimulationStatus,
  SimulationSnapshot
} from '../models/simulationModels';

import { 
  SimulationParameters,
  DEFAULT_SIMULATION_PARAMETERS
} from '../../simulation';

import {
  GeometricState,
  StatisticsState,
  ConservationState
} from '../../store/slices/simulationSlice';

/**
 * Service for managing simulation data in the database
 */
export class SimulationService {
  /**
   * Create a new simulation record
   * @param simulation Simulation data to store
   * @returns ID of the created simulation record
   */
  static async createSimulation(simulation: Omit<SimulationRecord, 'id'>): Promise<number> {
    try {
      // Ensure timestamp is set
      const record = {
        ...simulation,
        timestamp: simulation.timestamp || Date.now()
      };
      
      // Add to database
      const id = await db.simulations.add(record as SimulationRecord);
      return id;
    } catch (error) {
      console.error('Failed to create simulation record:', error);
      throw error;
    }
  }
  
  /**
   * Get a simulation record by ID
   * @param id Simulation record ID
   * @returns Simulation record or undefined if not found
   */
  static async getSimulation(id: number): Promise<SimulationRecord | undefined> {
    try {
      return await db.simulations.get(id);
    } catch (error) {
      console.error('Failed to get simulation record:', error);
      throw error;
    }
  }
  
  /**
   * Update a simulation record
   * @param id Simulation record ID
   * @param updates Properties to update
   * @returns true if updated, false if not found
   */
  static async updateSimulation(
    id: number,
    updates: Partial<Omit<SimulationRecord, 'id'>>
  ): Promise<boolean> {
    try {
      // Store count as a number before comparison
      const count: number = await db.simulations.update(id, updates);
      return count > 0;
    } catch (error) {
      console.error('Failed to update simulation record:', error);
      throw error;
    }
  }
  
  /**
   * Update simulation status
   * @param id Simulation record ID
   * @param status New status
   * @returns true if updated, false if not found
   */
  static async updateSimulationStatus(
    id: number,
    status: SimulationStatus
  ): Promise<boolean> {
    try {
      const count = await db.simulations.update(id, { status });
      return count > 0;
    } catch (error) {
      console.error('Failed to update simulation status:', error);
      throw error;
    }
  }
  
  /**
   * Delete a simulation record and all its results
   * @param id Simulation record ID
   * @returns true if deleted, false if not found
   */
  static async deleteSimulation(id: number): Promise<boolean> {
    try {
      // Start a transaction to ensure atomicity
      await db.transaction('rw', [db.simulations, db.simulationResults], async () => {
        // Delete all results for this simulation
        await db.simulationResults.where('simulationId').equals(id).delete();
        
        // Delete the simulation record
        const count = await db.simulations.delete(id);
        if (count === 0) {
          throw new Error(`Simulation with ID ${id} not found`);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to delete simulation:', error);
      
      // If the error is "not found", return false instead of throwing
      if (error instanceof Error && error.message.includes('not found')) {
        return false;
      }
      
      throw error;
    }
  }
  
  /**
   * Query simulations based on criteria
   * @param options Query options
   * @returns Array of matching simulation records
   */
  static async querySimulations(options: SimulationQueryOptions = {}): Promise<SimulationRecord[]> {
    try {
      let query = db.simulations.orderBy('timestamp').reverse();
      
      // Apply filters
      if (options.networkId) {
        query = query.filter(sim => sim.networkId === options.networkId);
      }
      
      if (options.status) {
        if (Array.isArray(options.status)) {
          query = query.filter(sim => options.status!.includes(sim.status));
        } else {
          query = query.filter(sim => sim.status === options.status);
        }
      }
      
      if (options.startTime !== undefined) {
        query = query.filter(sim => sim.timestamp >= options.startTime!);
      }
      
      if (options.endTime !== undefined) {
        query = query.filter(sim => sim.timestamp <= options.endTime!);
      }
      
      if (options.tags && options.tags.length > 0) {
        query = query.filter(sim => {
          if (!sim.tags) return false;
          return options.tags!.some(tag => sim.tags!.includes(tag));
        });
      }
      
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        query = query.filter(sim => 
          (sim.name && sim.name.toLowerCase().includes(searchTerm)) ||
          (sim.description && sim.description.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply sort
      if (options.sortBy) {
        if (options.sortBy === 'name') {
          query = db.simulations.orderBy('name');
        } else if (options.sortBy === 'duration') {
          query = db.simulations.orderBy('duration');
        } else {
          // Default is already timestamp
          query = db.simulations.orderBy('timestamp');
        }
        
        // Apply sort direction
        if (options.sortDirection === 'asc') {
          // Nothing to do, default is asc
        } else {
          query = query.reverse();
        }
      }
      
      // Apply pagination
      if (options.offset !== undefined) {
        query = query.offset(options.offset);
      }
      
      if (options.limit !== undefined) {
        query = query.limit(options.limit);
      }
      
      return await query.toArray();
    } catch (error) {
      console.error('Failed to query simulations:', error);
      throw error;
    }
  }
  
  /**
   * Get recent simulations
   * @param limit Maximum number of simulations to retrieve (default: 10)
   * @param networkId Optional network ID filter
   * @returns Array of recent simulation records
   */
  static async getRecentSimulations(limit = 10, networkId?: string): Promise<SimulationRecord[]> {
    try {
      let query = db.simulations.orderBy('timestamp').reverse();
      
      if (networkId) {
        query = query.filter(sim => sim.networkId === networkId);
      }
      
      return await query.limit(limit).toArray();
    } catch (error) {
      console.error('Failed to get recent simulations:', error);
      throw error;
    }
  }
  
  /**
   * Add a simulation result
   * @param result Simulation result data
   * @returns ID of the created result record
   */
  static async addSimulationResult(result: Omit<SimulationResultRecord, 'id'>): Promise<number> {
    try {
      // Ensure timestamp is set
      const record = {
        ...result,
        timestamp: result.timestamp || Date.now()
      };
      
      // Add to database
      const id = await db.simulationResults.add(record as SimulationResultRecord);
      
      // Update the parent simulation record's timePoints count
      const simulation = await db.simulations.get(result.simulationId);
      if (simulation) {
        await db.simulations.update(result.simulationId, {
          timePoints: (simulation.timePoints || 0) + 1,
          duration: Math.max(simulation.duration || 0, result.timePoint)
        });
      }
      
      return id;
    } catch (error) {
      console.error('Failed to add simulation result:', error);
      throw error;
    }
  }
  
  /**
   * Get a simulation result by ID
   * @param id Result record ID
   * @returns Result record or undefined if not found
   */
  static async getSimulationResult(id: number): Promise<SimulationResultRecord | undefined> {
    try {
      return await db.simulationResults.get(id);
    } catch (error) {
      console.error('Failed to get simulation result:', error);
      throw error;
    }
  }
  
  /**
   * Query simulation results based on criteria
   * @param options Query options
   * @returns Array of matching result records
   */
  static async querySimulationResults(options: ResultQueryOptions): Promise<SimulationResultRecord[]> {
    try {
      // Start with filter by simulationId
      const rawResults = await db.simulationResults
        .where('simulationId')
        .equals(options.simulationId)
        .sortBy('timePoint');
      
      // Apply filters in memory (Dexie doesn't support complex filtering on non-indexed fields)
      let filteredResults = [...rawResults]; // Create a new array to work with
      
      if (options.startTimePoint !== undefined) {
        filteredResults = filteredResults.filter(result => result.timePoint >= options.startTimePoint!);
      }
      
      if (options.endTimePoint !== undefined) {
        filteredResults = filteredResults.filter(result => result.timePoint <= options.endTimePoint!);
      }
      
      // Sample results if step is provided
      if (options.step && options.step > 1) {
        filteredResults = filteredResults.filter((_, index) => index % options.step! === 0);
      }
      
      // Strip state snapshots if not requested
      if (!options.includeSnapshots) {
        filteredResults = filteredResults.map(result => ({
          ...result,
          stateSnapshot: undefined
        }));
      }
      
      // Apply limit
      if (options.limit !== undefined && filteredResults.length > options.limit) {
        filteredResults = filteredResults.slice(0, options.limit);
      }
      
      return filteredResults;
    } catch (error) {
      console.error('Failed to query simulation results:', error);
      throw error;
    }
  }
  
  /**
   * Get the results for a specific time point in a simulation
   * @param simulationId Simulation ID
   * @param timePoint Time point to query
   * @returns Result record or undefined if not found
   */
  static async getResultAtTimePoint(
    simulationId: number,
    timePoint: number
  ): Promise<SimulationResultRecord | undefined> {
    try {
      // Find the exact match first
      const exactMatch = await db.simulationResults
        .where('[simulationId+timePoint]')
        .equals([simulationId, timePoint])
        .first();
      
      if (exactMatch) {
        return exactMatch;
      }
      
      // If no exact match, find the closest time point before the requested one
      const results = await db.simulationResults
        .where('simulationId')
        .equals(simulationId)
        .and(result => result.timePoint <= timePoint)
        .sortBy('timePoint');
      
      if (results.length > 0) {
        return results[results.length - 1]; // Return the last one (closest to target)
      }
      
      return undefined;
    } catch (error) {
      console.error('Failed to get result at time point:', error);
      throw error;
    }
  }
  
  /**
   * Store a snapshot of the current simulation state
   * @param networkId Network ID
   * @param snapshot Simulation snapshot data
   * @returns ID of the created simulation record
   */
  static async storeSimulationSnapshot(
    networkId: string,
    snapshot: SimulationSnapshot
  ): Promise<number> {
    try {
      // Create a new simulation record
      const simulationId = await this.createSimulation({
        networkId,
        timestamp: Date.now(),
        name: `Snapshot at t=${snapshot.timePoint.toFixed(2)}`,
        parameters: JSON.stringify(snapshot.parameters),
        duration: snapshot.timePoint,
        timePoints: 1,
        status: 'completed'
      });
      
      // Add the result record
      await this.addSimulationResult({
        simulationId,
        timePoint: snapshot.timePoint,
        geometricData: JSON.stringify(snapshot.geometric),
        statisticsData: JSON.stringify(snapshot.statistics),
        conservationData: JSON.stringify(snapshot.conservation),
        stateSnapshot: snapshot.networkState ? JSON.stringify(snapshot.networkState) : undefined,
        timestamp: Date.now()
      });
      
      return simulationId;
    } catch (error) {
      console.error('Failed to store simulation snapshot:', error);
      throw error;
    }
  }
  
  /**
   * Restore a simulation from a database record
   * @param id Simulation record ID
   * @returns Simulation data in Redux-compatible format
   */
  static async restoreSimulation(id: number): Promise<{
    parameters: SimulationParameters;
    geometricData: GeometricState;
    statisticsData: StatisticsState;
    conservationData: ConservationState;
    currentTime: number;
  }> {
    try {
      // Get the simulation record
      const simulation = await this.getSimulation(id);
      if (!simulation) {
        throw new Error(`Simulation with ID ${id} not found`);
      }
      
      // Get the most recent result
      const results = await this.querySimulationResults({
        simulationId: id,
        limit: 1
      });
      
      if (results.length === 0) {
        throw new Error(`No results found for simulation with ID ${id}`);
      }
      
      const result = results[0];
      
      // Parse the data
      const parameters = JSON.parse(simulation.parameters) as SimulationParameters;
      const geometricData = JSON.parse(result.geometricData) as GeometricState;
      const statisticsData = JSON.parse(result.statisticsData) as StatisticsState;
      const conservationData = JSON.parse(result.conservationData) as ConservationState;
      
      return {
        parameters,
        geometricData,
        statisticsData,
        conservationData,
        currentTime: result.timePoint
      };
    } catch (error) {
      console.error('Failed to restore simulation:', error);
      throw error;
    }
  }
  
  /**
   * Export a simulation to JSON format
   * @param id Simulation record ID
   * @param includeResults Whether to include detailed results
   * @returns JSON string of the simulation data
   */
  static async exportSimulationToJson(id: number, includeResults = true): Promise<string> {
    try {
      // Get the simulation record
      const simulation = await this.getSimulation(id);
      if (!simulation) {
        throw new Error(`Simulation with ID ${id} not found`);
      }
      
      let exportData: any = {
        simulation
      };
      
      if (includeResults) {
        // Get all results for this simulation
        const results = await this.querySimulationResults({
          simulationId: id,
          includeSnapshots: true
        });
        
        exportData.results = results;
      }
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export simulation to JSON:', error);
      throw error;
    }
  }
  
  /**
   * Import a simulation from JSON format
   * @param json JSON string of the simulation data
   * @returns ID of the imported simulation record
   */
  static async importSimulationFromJson(json: string): Promise<number> {
    try {
      const importData = JSON.parse(json);
      
      // Validate the format
      if (!importData.simulation) {
        throw new Error('Invalid simulation export format');
      }
      
      // Create new simulation record (without the existing ID)
      const { id, ...simulationData } = importData.simulation;
      const simulationId = await this.createSimulation(simulationData);
      
      // Import results if present
      if (importData.results && Array.isArray(importData.results)) {
        for (const result of importData.results) {
          const { id: resultId, ...resultData } = result;
          await this.addSimulationResult({
            ...resultData,
            simulationId
          });
        }
      }
      
      return simulationId;
    } catch (error) {
      console.error('Failed to import simulation from JSON:', error);
      throw error;
    }
  }
}
