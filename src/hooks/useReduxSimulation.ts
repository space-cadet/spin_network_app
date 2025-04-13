import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setSimulationRunning,
  setCurrentTime,
  setHasHistory,
  updateGeometricData,
  updateStatisticsData,
  updateConservationData,
  updateParameters,
  updateInitialStateParams,
  resetSimulationState
} from '../store/slices/simulationSlice';
import { RootState } from '../store';
import { useSimulation } from './useSimulation';
import { SpinNetworkGeometryCalculator } from '../simulation/analysis/geometricProps';
import { SimulationAnalyzer } from '../simulation/analysis/statistics';
import { simulationLogger } from '../simulation/core/simulationLogger';

/**
 * Enhanced hook that combines the existing useSimulation with Redux state management
 */
export const useReduxSimulation = () => {
  const dispatch = useDispatch();
  
  // Get the existing simulation hook for engine functionality
  const simulation = useSimulation();
  
  // Get simulation state from Redux
  const simulationState = useSelector((state: RootState) => state.simulation);
  
  // Reference to track if we need to sync from useSimulation to Redux
  const needsSyncRef = useRef<boolean>(true);
  const refreshTimerRef = useRef<number | null>(null);
  
  // Start simulation with Redux integration
  const startSimulation = useCallback(() => {
    // Call the original startSimulation
    simulation.startSimulation();
    
    // Update Redux state
    dispatch(setSimulationRunning(true));
    
    // Enable synchronization to ensure we capture the latest data
    needsSyncRef.current = true;
  }, [simulation, dispatch]);
  
  // Pause simulation with Redux integration
  const pauseSimulation = useCallback(() => {
    // Call the original pauseSimulation
    simulation.pauseSimulation();
    
    // Update Redux state
    dispatch(setSimulationRunning(false));
    
    // Force one final sync to ensure we have the latest data
    syncSimulationDataToRedux();
  }, [simulation, dispatch]);
  
  // Reset simulation with Redux integration
  const resetSimulation = useCallback(() => {
    // Call the original resetSimulation
    simulation.resetSimulation();
    
    // Reset Redux state
    dispatch(resetSimulationState());
    
    // Re-enable synchronization
    needsSyncRef.current = true;
  }, [simulation, dispatch]);
  
  // Step simulation with Redux integration
  const stepSimulation = useCallback(() => {
    // Call the original stepSimulation
    simulation.stepSimulation();
    
    // Update Redux with new time
    dispatch(setCurrentTime(simulation.currentTime));
    
    // Ensure we update Redux with the latest data
    syncSimulationDataToRedux();
  }, [simulation, dispatch]);
  
  // Jump to a specific time with Redux integration
  const jumpToTime = useCallback((time: number) => {
    // Call the original jumpToTime
    simulation.jumpToTime(time);
    
    // Update Redux with new time
    dispatch(setCurrentTime(time));
    
    // Ensure we update Redux with the latest data
    syncSimulationDataToRedux();
  }, [simulation, dispatch]);
  
  // Update parameters with Redux integration
  const updateParametersWithRedux = useCallback((params: any) => {
    // Call the original updateParameters
    simulation.updateParameters(params);
    
    // Update Redux state
    dispatch(updateParameters(params));
  }, [simulation, dispatch]);
  
  // Update initial state params with Redux integration
  const updateInitialStateParamsWithRedux = useCallback((params: any) => {
    // Call the original updateInitialStateParams
    simulation.updateInitialStateParams(params);
    
    // Update Redux state
    dispatch(updateInitialStateParams(params));
  }, [simulation, dispatch]);
  
  // Function to sync simulation data to Redux
  const syncSimulationDataToRedux = useCallback(() => {
    // Only proceed if sync is needed
    if (!needsSyncRef.current) return;
    
    try {
      // Update time, running state, and history status
      dispatch(setCurrentTime(simulation.currentTime));
      dispatch(setSimulationRunning(simulation.isRunning));
      dispatch(setHasHistory(simulation.hasHistory));
      
      // Get current state and graph if available
      const currentState = simulation.getCurrentState?.();
      const graph = simulation.getGraph?.();
      
      // Get conservation data if available
      if (simulation.getConservationLaws) {
        const conservationData = simulation.getConservationLaws();
        if (conservationData) {
          dispatch(updateConservationData({
            totalProbability: conservationData.totalProbability || 0,
            normVariation: conservationData.normVariation || 0,
            positivity: conservationData.positivity || false
          }));
        }
      }
      
      // Calculate and update geometric data if we have state and graph
      if (currentState && graph) {
        try {
          const geometryCalculator = new SpinNetworkGeometryCalculator();
          
          dispatch(updateGeometricData({
            totalVolume: geometryCalculator.calculateTotalVolume(currentState),
            totalArea: geometryCalculator.calculateTotalArea(graph),
            effectiveDimension: geometryCalculator.calculateEffectiveDimension(graph, currentState),
            volumeEntropy: geometryCalculator.calculateVolumeEntropy(currentState)
          }));
        } catch (error) {
          console.error('Error calculating geometric data:', error);
        }
        
        // Calculate and update statistics data
        try {
          const stats = SimulationAnalyzer.calculateStatistics(currentState, simulation.currentTime);
          
          dispatch(updateStatisticsData({
            mean: stats.mean,
            variance: stats.variance,
            skewness: 0, // Not implemented yet
            kurtosis: 0  // Not implemented yet
          }));
        } catch (error) {
          console.error('Error calculating statistics data:', error);
        }
      } else {
        // If we don't have state and graph, check logs as a fallback
        const logsSession = simulationLogger.getCurrentSession();
        if (logsSession && logsSession.results.length > 0) {
          // Get the most recent result
          const latestResult = logsSession.results[logsSession.results.length - 1];
          
          if (latestResult) {
            // Backup geometric data
            if (latestResult.geometric) {
              dispatch(updateGeometricData({
                totalVolume: latestResult.geometric.totalVolume || 0,
                volumeEntropy: latestResult.geometric.volumeEntropy || 0,
                totalArea: latestResult.geometric.totalArea || 0,
                effectiveDimension: latestResult.geometric.effectiveDimension || 0
              }));
            }
            
            // Backup statistics data
            if (latestResult.statistics) {
              dispatch(updateStatisticsData({
                mean: latestResult.statistics.mean || 0,
                variance: latestResult.statistics.variance || 0,
                skewness: latestResult.statistics.skewness || 0,
                kurtosis: latestResult.statistics.kurtosis || 0
              }));
            }
            
            // Backup conservation data
            if (latestResult.conservation) {
              dispatch(updateConservationData({
                totalProbability: latestResult.conservation.totalProbability || 0,
                normVariation: latestResult.conservation.normVariation || 0,
                positivity: latestResult.conservation.positivity || false
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error synchronizing simulation data to Redux:', error);
    }
  }, [simulation, dispatch]);
  
  // Setup regular sync of data from simulation engine to Redux
  useEffect(() => {
    // If simulation is running, sync more frequently
    if (simulation.isRunning) {
      // Set up interval for regular updates
      if (refreshTimerRef.current === null) {
        refreshTimerRef.current = window.setInterval(syncSimulationDataToRedux, 250);
      }
    } else {
      // If not running but we have history, sync once
      if (simulation.hasHistory && needsSyncRef.current) {
        syncSimulationDataToRedux();
        needsSyncRef.current = false;
      }
      
      // Clear interval if it exists
      if (refreshTimerRef.current !== null) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }
    
    return () => {
      // Clean up interval on unmount
      if (refreshTimerRef.current !== null) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [simulation.isRunning, simulation.hasHistory, syncSimulationDataToRedux]);
  
  // Sync simulation parameters from Redux to the engine when they change
  useEffect(() => {
    // Avoid cyclical updates by checking if we just updated Redux
    if (!needsSyncRef.current) return;
    
    // Update the simulation engine parameters
    simulation.updateParameters(simulationState.parameters);
  }, [simulationState.parameters, simulation]);
  
  // Return combined interface with Redux and original simulation functions
  return {
    // Redux state
    ...simulationState,
    
    // Enhanced methods that update both simulation engine and Redux
    startSimulation,
    pauseSimulation,
    resetSimulation,
    stepSimulation,
    jumpToTime,
    updateParameters: updateParametersWithRedux,
    updateInitialStateParams: updateInitialStateParamsWithRedux,
    
    // Original methods from simulation that don't need Redux integration
    getVisualizationState: simulation.getVisualizationState,
    getConservationLaws: simulation.getConservationLaws,
    getGraph: simulation.getGraph,
    getCurrentState: simulation.getCurrentState,
    getHistory: simulation.getHistory
  };
};
