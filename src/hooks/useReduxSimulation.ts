import { useCallback, useEffect, useRef } from 'react';
import isEqual from 'lodash/isEqual';
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
  
  // Last time we performed a sync
  const lastSyncTimeRef = useRef<number>(0);
  
  // Function to sync simulation data to Redux - MUST DEFINE THIS FIRST
  const syncSimulationDataToRedux = useCallback(() => {
    // Only proceed if sync is needed
    if (!needsSyncRef.current) return;
    
    // Rate limit syncs
    const now = Date.now();
    if (now - lastSyncTimeRef.current < 100) {
      return; // Don't sync more than 10 times per second
    }
    lastSyncTimeRef.current = now;
    
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
      
      // Calculate and update geometric data if we have a valid state
      if (currentState) {
        try {
          const geometryCalculator = new SpinNetworkGeometryCalculator();
          const geometricData = {
            totalVolume: 0,
            totalArea: 0,
            effectiveDimension: 0,
            volumeEntropy: 0
          };
          
          // Volume and entropy only need the state
          geometricData.totalVolume = geometryCalculator.calculateTotalVolume(currentState);
          geometricData.volumeEntropy = geometryCalculator.calculateVolumeEntropy(currentState);
          
          // Area and dimension also need a valid graph
          if (graph && graph.edges && graph.edges.length > 0) {
            geometricData.totalArea = geometryCalculator.calculateTotalArea(graph);
            geometricData.effectiveDimension = geometryCalculator.calculateEffectiveDimension(graph, currentState);
          } else {
            // Try to get a valid graph from network state as fallback
            const networkState = (window as any).__REDUX_STATE__?.network || 
              require('../store').store.getState().network;
              
            if (networkState?.currentNetwork?.edges?.length > 0) {
              const tempGraph = require('../simulation').createSimulationGraph(networkState.currentNetwork);
              if (tempGraph && tempGraph.edges && tempGraph.edges.length > 0) {
                geometricData.totalArea = geometryCalculator.calculateTotalArea(tempGraph);
                geometricData.effectiveDimension = geometryCalculator.calculateEffectiveDimension(
                  tempGraph, currentState
                );
              }
            }
          }
          
          // Only update Redux if we have non-zero values
          if (Object.values(geometricData).some(value => value > 0)) {
            dispatch(updateGeometricData(geometricData));
          }
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

  // Start simulation with Redux integration
  const startSimulation = useCallback(() => {
    // Don't reset time if we have history (resuming from pause)
    const shouldResume = simulation.hasHistory;
    
    // Call the original startSimulation with resume flag
    simulation.startSimulation(shouldResume);
    
    // Update Redux state
    dispatch(setSimulationRunning(true));
    
    // Enable synchronization to ensure we capture the latest data
    needsSyncRef.current = true;
    
    // Initial sync to ensure data is available immediately
    syncSimulationDataToRedux();
  }, [simulation, dispatch, syncSimulationDataToRedux]);
  
  // Pause simulation with Redux integration
  const pauseSimulation = useCallback(() => {
    // Set a flag to force data sync after pause
    needsSyncRef.current = true;
    
    // Call the original pauseSimulation
    simulation.pauseSimulation();
    
    // Update Redux state
    dispatch(setSimulationRunning(false));
    
    // Force one final sync immediately to ensure we have the latest data
    syncSimulationDataToRedux();
    
    // And schedule one more sync after a short delay to catch any final updates
    setTimeout(() => {
      syncSimulationDataToRedux();
      needsSyncRef.current = false;
    }, 100);
  }, [simulation, dispatch, syncSimulationDataToRedux]);
  
  // Reset simulation with Redux integration
  const resetSimulation = useCallback(() => {
    // Call the original resetSimulation
    simulation.resetSimulation();
    
    // Reset Redux state
    dispatch(resetSimulationState());
    
    // Re-enable synchronization
    needsSyncRef.current = true;
    
    // Make sure to sync the reset state to Redux
    syncSimulationDataToRedux();
  }, [simulation, dispatch, syncSimulationDataToRedux]);
  
  // Step simulation with Redux integration
  const stepSimulation = useCallback(() => {
    // Call the original stepSimulation
    simulation.stepSimulation();
    
    // Update Redux with new time
    dispatch(setCurrentTime(simulation.currentTime));
    
    // Ensure we update Redux with the latest data
    syncSimulationDataToRedux();
  }, [simulation, dispatch, syncSimulationDataToRedux]);
  
  // Jump to a specific time with Redux integration
  const jumpToTime = useCallback((time: number) => {
    // Call the original jumpToTime
    simulation.jumpToTime(time);
    
    // Update Redux with new time
    dispatch(setCurrentTime(time));
    
    // Ensure we update Redux with the latest data
    syncSimulationDataToRedux();
  }, [simulation, dispatch, syncSimulationDataToRedux]);
  
  // Update parameters with Redux integration
  const updateParametersWithRedux = useCallback((params: any) => {
    // Set flag to prevent re-entry in the useEffect
    isUpdatingFromHookRef.current = true;
    
    // Store new parameters
    previousParametersRef.current = {...simulationState.parameters, ...params};
    
    // Call the original updateParameters
    simulation.updateParameters(params);
    
    // Update Redux state
    dispatch(updateParameters(params));
    
    // Brief delay before allowing syncs again
    needsSyncRef.current = false;
    setTimeout(() => {
      needsSyncRef.current = true;
    }, 50);
  }, [simulation, dispatch, simulationState.parameters]);
  
  // Update initial state params with Redux integration
  const updateInitialStateParamsWithRedux = useCallback((params: any) => {
    // Call the original updateInitialStateParams
    simulation.updateInitialStateParams(params);
    
    // Update Redux state
    dispatch(updateInitialStateParams(params));
  }, [simulation, dispatch]);
  
  // Setup regular sync of data from simulation engine to Redux
  useEffect(() => {
    // Always clear previous timer when dependencies change
    if (refreshTimerRef.current !== null) {
      window.clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    let isMounted = true;
    
    // If simulation is running, set up regular sync interval
    if (simulation.isRunning) {
      // Sync immediately first
      if (isMounted) {
        syncSimulationDataToRedux();
      }
      
      // Use RAF instead of interval for better performance and less chance of stacking
      const syncLoop = () => {
        if (!isMounted) return;
        
        syncSimulationDataToRedux();
        refreshTimerRef.current = window.setTimeout(syncLoop, 500);
      };
      
      refreshTimerRef.current = window.setTimeout(syncLoop, 500);
    } 
    // If not running but we have history, do a one-time sync
    else if (simulation.hasHistory && needsSyncRef.current) {
      syncSimulationDataToRedux();
      // After initial sync, we only need to sync on state changes
      needsSyncRef.current = false;
    }
    
    return () => {
      // Clean up on unmount or dependency change
      isMounted = false;
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [simulation.isRunning, simulation.hasHistory, syncSimulationDataToRedux]);
  
  // Sync simulation parameters from Redux to the engine when they change
  const previousParametersRef = useRef<any>(null);
  const isUpdatingFromHookRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Skip if we're already in the process of updating from the hook
    if (isUpdatingFromHookRef.current) {
      isUpdatingFromHookRef.current = false;
      return;
    }
    
    // Avoid cyclical updates by checking if we just updated Redux
    if (!needsSyncRef.current) return;

    // Deep compare current and previous parameters
    if (!isEqual(simulationState.parameters, previousParametersRef.current)) {
      // Store previous parameters
      previousParametersRef.current = {...simulationState.parameters};
      
      // Set flag to avoid re-entry
      needsSyncRef.current = false;
      
      // Update simulation parameters
      simulation.updateParameters(simulationState.parameters);
      
      // Reset flag after a brief delay
      setTimeout(() => {
        needsSyncRef.current = true;
      }, 50);
    }
  }, [simulationState.parameters, simulation]);
  
  // Return combined interface with Redux and original simulation functions
  // Stop simulation with Redux integration
  const stopSimulation = useCallback(() => {
    // Pause first if running
    if (simulation.isRunning) {
      simulation.pauseSimulation();
    }
    
    // Update Redux state
    dispatch(setSimulationRunning(false));
    dispatch(setCurrentTime(0));
    dispatch(setHasHistory(false));
    
    // Force one final sync
    syncSimulationDataToRedux();
  }, [simulation, dispatch, syncSimulationDataToRedux]);

  return {
    // Redux state
    ...simulationState,
    
    // Enhanced methods that update both simulation engine and Redux
    startSimulation,
    pauseSimulation,
    stopSimulation,  // Add the new stop method
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
