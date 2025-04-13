/**
 * Simulation data models for database storage
 */
import { SimulationParameters } from '../../simulation';
import { GeometricState, StatisticsState, ConservationState } from '../../store/slices/simulationSlice';

/**
 * Represents a simulation record in the database
 */
export interface SimulationRecord {
  id?: number;          // Auto-incremented primary key
  networkId: string;    // Reference to the associated network
  timestamp: number;    // When the simulation was created/updated
  name: string;         // User-friendly name for the simulation
  description?: string; // Optional description
  parameters: string;   // Serialized SimulationParameters
  duration: number;     // Total simulation time
  timePoints: number;   // Number of time points in the simulation
  status: SimulationStatus; // Status of the simulation
  tags?: string[];      // Optional tags for organizing simulations
  createdBy?: string;   // User who created the simulation
}

/**
 * Status of a simulation
 */
export type SimulationStatus = 'completed' | 'in-progress' | 'error' | 'stopped';

/**
 * Represents a simulation result entry in the database
 */
export interface SimulationResultRecord {
  id?: number;           // Auto-incremented primary key
  simulationId: number;  // Reference to the parent simulation
  timePoint: number;     // Time point in the simulation
  geometricData: string; // Serialized GeometricState
  statisticsData: string; // Serialized StatisticsState
  conservationData: string; // Serialized ConservationState
  stateSnapshot?: string; // Optional full state snapshot (may be large)
  timestamp: number;     // When this result was recorded
}

/**
 * Helper type for storing simulation snapshots
 */
export interface SimulationSnapshot {
  parameters: SimulationParameters;
  geometric: GeometricState;
  statistics: StatisticsState;
  conservation: ConservationState;
  timePoint: number;
  networkState?: any; // The actual network state at this time point (optional, can be large)
}

/**
 * Query options for retrieving simulation records
 */
export interface SimulationQueryOptions {
  networkId?: string;            // Filter by network
  status?: SimulationStatus | SimulationStatus[]; // Filter by status
  startTime?: number;            // Filter by start time
  endTime?: number;              // Filter by end time
  tags?: string[];               // Filter by tags
  search?: string;               // Search in name or description
  limit?: number;                // Limit number of results
  offset?: number;               // Offset for pagination
  sortBy?: 'timestamp' | 'name' | 'duration'; // Sort field
  sortDirection?: 'asc' | 'desc'; // Sort direction
}

/**
 * Query options for retrieving simulation results
 */
export interface ResultQueryOptions {
  simulationId: number;         // The simulation to query results for
  startTimePoint?: number;      // Start time point
  endTimePoint?: number;        // End time point
  includeSnapshots?: boolean;   // Whether to include state snapshots
  limit?: number;               // Limit number of results
  step?: number;                // Step between time points (for sampling)
}
