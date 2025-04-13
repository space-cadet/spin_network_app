/**
 * Redux integration utilities for database
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { LogService } from '../services/logService';
import { SimulationService } from '../services/simulationService';
import { GraphService } from '../services/graphService';
import { importSimulationFromRedux, exportSimulationToRedux } from '../migrations/simulationMigration';
import { LogEntry, LogQueryOptions } from '../models/logModels';
import { SimulationRecord, SimulationQueryOptions } from '../models/simulationModels';
import { GraphRecord, GraphQueryOptions } from '../models/graphModels';

// Log Thunks
export const fetchLogs = createAsyncThunk(
  'database/fetchLogs',
  async (options: LogQueryOptions = {}, { rejectWithValue }) => {
    try {
      return await LogService.queryLogs(options);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch logs');
    }
  }
);

export const addLog = createAsyncThunk(
  'database/addLog',
  async (log: Omit<LogEntry, 'id'>, { rejectWithValue }) => {
    try {
      const id = await LogService.addLog(log);
      return { id, ...log };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add log');
    }
  }
);

export const markErrorAsFixed = createAsyncThunk(
  'database/markErrorAsFixed',
  async ({ id, fixDetails }: { id: number; fixDetails?: { fixedBy?: string; details?: string } }, { rejectWithValue }) => {
    try {
      const success = await LogService.markErrorAsFixed(id, fixDetails);
      return { id, success };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark error as fixed');
    }
  }
);

// Simulation Thunks
export const fetchSimulations = createAsyncThunk(
  'database/fetchSimulations',
  async (options: SimulationQueryOptions = {}, { rejectWithValue }) => {
    try {
      return await SimulationService.querySimulations(options);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch simulations');
    }
  }
);

export const fetchSimulationById = createAsyncThunk(
  'database/fetchSimulationById',
  async (id: number, { rejectWithValue }) => {
    try {
      const simulation = await SimulationService.getSimulation(id);
      if (!simulation) {
        return rejectWithValue(`Simulation with ID ${id} not found`);
      }
      return simulation;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch simulation');
    }
  }
);

export const saveCurrentSimulation = createAsyncThunk(
  'database/saveCurrentSimulation',
  async ({ 
    networkId, 
    simulationState,
    name
  }: { 
    networkId: string; 
    simulationState: any;
    name?: string;
  }, { rejectWithValue }) => {
    try {
      const simulationName = name || `Simulation at t=${simulationState.currentTime.toFixed(2)}`;
      const stateWithName = {
        ...simulationState,
        name: simulationName
      };
      
      const id = await importSimulationFromRedux(networkId, stateWithName);
      return { id, name: simulationName };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save simulation');
    }
  }
);

export const loadSimulationToRedux = createAsyncThunk(
  'database/loadSimulationToRedux',
  async (id: number, { rejectWithValue }) => {
    try {
      return await exportSimulationToRedux(id);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load simulation');
    }
  }
);

export const deleteSimulation = createAsyncThunk(
  'database/deleteSimulation',
  async (id: number, { rejectWithValue }) => {
    try {
      const success = await SimulationService.deleteSimulation(id);
      return { id, success };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete simulation');
    }
  }
);

// Graph Thunks
export const fetchGraphs = createAsyncThunk(
  'database/fetchGraphs',
  async (options: GraphQueryOptions = {}, { rejectWithValue }) => {
    try {
      return await GraphService.queryGraphs(options);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch graphs');
    }
  }
);

export const fetchGraphById = createAsyncThunk(
  'database/fetchGraphById',
  async (id: number, { rejectWithValue }) => {
    try {
      const graph = await GraphService.getGraph(id);
      if (!graph) {
        return rejectWithValue(`Graph with ID ${id} not found`);
      }
      return graph;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch graph');
    }
  }
);

export const saveGraphProperties = createAsyncThunk(
  'database/saveGraphProperties',
  async ({ 
    networkId, 
    graphData 
  }: { 
    networkId: string; 
    graphData: any;
  }, { rejectWithValue }) => {
    try {
      const id = await GraphService.storeGraphProperties(networkId, graphData);
      return { id, ...graphData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save graph properties');
    }
  }
);

export const deleteGraph = createAsyncThunk(
  'database/deleteGraph',
  async (id: number, { rejectWithValue }) => {
    try {
      const success = await GraphService.deleteGraph(id);
      return { id, success };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete graph');
    }
  }
);

// Database Stats Thunk
export const fetchDatabaseStats = createAsyncThunk(
  'database/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const status = await getDatabaseStatus();
      return status.tableCount;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch database stats');
    }
  }
);

// Helper function from db.config.ts (duplicated here to avoid circular dependencies)
async function getDatabaseStatus() {
  const tableCount: Record<string, number> = {};
  
  // Import dynamically to avoid circular dependencies
  const { db } = await import('../db.config');
  
  // Get count of records in each table
  if (db.isOpen()) {
    tableCount.logs = await db.logs.count();
    tableCount.simulations = await db.simulations.count();
    tableCount.simulationResults = await db.simulationResults.count();
    tableCount.graphs = await db.graphs.count();
  }
  
  return {
    isOpen: db.isOpen(),
    version: db.verno,
    tableCount
  };
}
