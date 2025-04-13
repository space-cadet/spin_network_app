/**
 * Migration utilities for simulation data
 */
import { SimulationService } from '../services/simulationService';
import { SimulationRecord, SimulationResultRecord } from '../models/simulationModels';
import { GeometricState, StatisticsState, ConservationState } from '../../store/slices/simulationSlice';

/**
 * Import simulation data from Redux state
 * @param networkId Network ID
 * @param simulationState Redux simulation state
 * @returns ID of the created simulation record
 */
export async function importSimulationFromRedux(
  networkId: string,
  simulationState: {
    parameters: any;
    geometricData: GeometricState;
    statisticsData: StatisticsState;
    conservationData: ConservationState;
    currentTime: number;
    hasHistory: boolean;
    isRunning: boolean;
  }
): Promise<number> {
  try {
    // Create simulation record
    const simulationId = await SimulationService.createSimulation({
      networkId,
      timestamp: Date.now(),
      name: `Simulation at t=${simulationState.currentTime.toFixed(2)}`,
      description: `Imported from Redux state`,
      parameters: JSON.stringify(simulationState.parameters),
      duration: simulationState.currentTime,
      timePoints: 1, // Only current state is available
      status: simulationState.isRunning ? 'in-progress' : 'completed'
    });
    
    // Add simulation result
    await SimulationService.addSimulationResult({
      simulationId,
      timePoint: simulationState.currentTime,
      geometricData: JSON.stringify(simulationState.geometricData),
      statisticsData: JSON.stringify(simulationState.statisticsData),
      conservationData: JSON.stringify(simulationState.conservationData),
      timestamp: Date.now()
    });
    
    return simulationId;
  } catch (error) {
    console.error('Failed to import simulation from Redux:', error);
    throw error;
  }
}

/**
 * Import multiple simulation results from an array
 * @param networkId Network ID
 * @param simulationName Name for the simulation
 * @param parameters Simulation parameters
 * @param results Array of simulation results with time points
 * @returns ID of the created simulation record
 */
export async function importSimulationResults(
  networkId: string,
  simulationName: string,
  parameters: any,
  results: Array<{
    timePoint: number;
    geometricData: GeometricState;
    statisticsData: StatisticsState;
    conservationData: ConservationState;
    stateSnapshot?: any;
  }>
): Promise<number> {
  try {
    // Calculate duration based on the last time point
    const sortedResults = [...results].sort((a, b) => a.timePoint - b.timePoint);
    const duration = sortedResults.length > 0 ? sortedResults[sortedResults.length - 1].timePoint : 0;
    
    // Create simulation record
    const simulationId = await SimulationService.createSimulation({
      networkId,
      timestamp: Date.now(),
      name: simulationName,
      description: `Imported simulation with ${results.length} time points`,
      parameters: JSON.stringify(parameters),
      duration,
      timePoints: results.length,
      status: 'completed'
    });
    
    // Add simulation results
    for (const result of results) {
      await SimulationService.addSimulationResult({
        simulationId,
        timePoint: result.timePoint,
        geometricData: JSON.stringify(result.geometricData),
        statisticsData: JSON.stringify(result.statisticsData),
        conservationData: JSON.stringify(result.conservationData),
        stateSnapshot: result.stateSnapshot ? JSON.stringify(result.stateSnapshot) : undefined,
        timestamp: Date.now()
      });
    }
    
    return simulationId;
  } catch (error) {
    console.error('Failed to import simulation results:', error);
    throw error;
  }
}

/**
 * Export the current simulation state to a Redux-compatible format
 * @param id Simulation record ID
 * @returns Redux-compatible simulation state
 */
export async function exportSimulationToRedux(id: number): Promise<{
  parameters: any;
  geometricData: GeometricState;
  statisticsData: StatisticsState;
  conservationData: ConservationState;
  currentTime: number;
  hasHistory: boolean;
  isRunning: boolean;
}> {
  try {
    // Get the simulation data
    const simulationData = await SimulationService.restoreSimulation(id);
    
    // Format for Redux
    return {
      ...simulationData,
      hasHistory: true,
      isRunning: false // Always start in paused state
    };
  } catch (error) {
    console.error('Failed to export simulation to Redux:', error);
    throw error;
  }
}
