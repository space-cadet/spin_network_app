import { useState, useCallback, useEffect, useRef } from 'react';
import { CytoscapeAdapter } from '../simulation/visualization/cytoscapeAdapter';
import { useSelector, useDispatch } from 'react-redux';
import { updateInitialStateParams, updateParameters } from '../store/slices/simulationSlice';
import { 
  createSimulationEngine,
  createSimulationGraph,
  SimulationGraph
} from '../simulation';
// Import the engine implementation directly
import { SpinNetworkSimulationEngineImpl } from '../simulation/core/engineImplementation';
import { RootState } from '../store';
import { simulationLogger } from '../simulation/core/simulationLogger';
import { SpinNetworkGeometryCalculator } from '../simulation/analysis/geometricProps';
import { SimulationAnalyzer } from '../simulation/analysis/statistics';

// Define missing SimulationParameters type
interface SimulationParameters {
  initialStateParams: {
    nodeId: string;
    [key: string]: any;
  };
  timeStep?: number;
  recordHistory?: boolean;
  historyInterval?: number;
  [key: string]: any;
}

// Extend function interfaces with static properties
interface GetGraphFunction {
  (): SimulationGraph | null;
  hasWarnedNull?: boolean;
}

interface GetCurrentStateFunction {
  (): any;
  hasWarnedNull?: boolean;
}

interface GetHistoryFunction {
  (): any;
  hasWarnedNull?: boolean;
}

export const useSimulation = () => {
  // Get network from Redux - handle the case where it might be undefined
  const network = useSelector((state: RootState) => state.network?.currentNetwork);

  // Get simulation parameters from Redux (single source of truth)
  const parameters = useSelector((state: RootState) => state.simulation.parameters);

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasHistory, setHasHistory] = useState(false);

  // Redux dispatch
  const dispatch = useDispatch();

  // References to the simulation engine and graph
  const engineRef = useRef<SpinNetworkSimulationEngineImpl | null>(null);
  const graphRef = useRef<SimulationGraph | null>(null);
  
  // Animation frame ID for cleanup
  const animationFrameRef = useRef<number | null>(null);
  
  // Define all callback functions first to avoid reference errors
  
  // To prevent reinitializing parameters in a loop
  const lastParameterUpdateRef = useRef<number>(0);
  
  // Update simulation parameters (dispatch only, Redux is source of truth)
  const updateParametersWithRedux = useCallback((newParams: any) => {
    dispatch(updateParameters(newParams));
  }, [dispatch]);

  // Update initial state parameters (dispatch only)
  const updateInitialStateParamsWithRedux = useCallback((newParams: Record<string, any>) => {
    dispatch(updateInitialStateParams(newParams));
  }, [dispatch]);
  
  // Get current visualization state
  const getVisualizationState = useCallback(() => {
    if (engineRef.current && graphRef.current) {
      return engineRef.current.getCurrentState().toVisualizationState();
    }
    // Return a default CytoscapeVisualizationState
    if (graphRef.current) {
      return new CytoscapeAdapter().createVisualization(graphRef.current);
    }
    return {
      nodeValues: {},
      minValue: 0,
      maxValue: 1,
      options: {
        colorScale: ['#0000ff', '#ff0000'] as [string, string], // Blue to Red - explicit typing
        sizeScale: [10, 50] as [number, number], // Explicit typing to fix error
        useColor: true,
        useSize: true,
        showValues: false,
        normalizeValues: true
      }
    };
  }, []);
  
  // Get conservation laws
  const getConservationLaws = useCallback(() => {
    if (engineRef.current) {
      try {
        return engineRef.current.getConservationLaws();
      } catch (error) {
        console.error("Error getting conservation laws:", error);
        return {
          totalProbability: 0,
          normVariation: 0,
          positivity: false
        };
      }
    }
    return {
      totalProbability: 0,
      normVariation: 0,
      positivity: false
    };
  }, []);
  
  // Track last time to avoid redundant updates
  const lastTimeRef = useRef<number>(0);
  
  // Enhanced animation loop for updating simulation
  const animationLoop = useCallback(() => {
    // IMPORTANT: Don't proceed if we're not supposed to be running
    if (!isRunning || !engineRef.current) {
      // Reset animation frame ref to ensure we don't have lingering references
      animationFrameRef.current = null;
      return;
    }
    
    // Make sure engine is in running state too
    if (!engineRef.current.isRunning()) {
      engineRef.current.resume();
    }
    
    // Step the simulation
    try {
      engineRef.current.step();
      
      const simulationTime = engineRef.current.getCurrentTime();
      
      // Update current time (only if actually changed to avoid unnecessary renders)
      // Fix: the previous code was comparing currentTime with itself
      if (Math.abs(simulationTime - lastTimeRef.current) > 1e-10) {
        lastTimeRef.current = simulationTime;
        setCurrentTime(simulationTime);
      }
      
      // Update history status
      if (!hasHistory) {
        setHasHistory(true);
      }
      
      // Log occasionally (every second of simulation time)
      // This reduces log clutter while still providing useful data
      const timeStep = parameters.timeStep || 0.01;
      if (Math.floor(simulationTime / 1.0) > Math.floor((simulationTime - timeStep) / 1.0)) {
        // Get conservation laws for logging
        const conservation = engineRef.current.getConservationLaws();
        
        // Get current state for calculating additional observables
        const currentState = engineRef.current.getCurrentState();
        const graph = engineRef.current.getGraph ? engineRef.current.getGraph() : null;
        
        // Always include geometric data, even if it's zeros
        let geometric: {
          totalVolume: number;
          totalArea: number;
          effectiveDimension: number;
          volumeEntropy: number;
          [key: string]: number; // Add index signature to allow dynamic property access
        } = {
          totalVolume: 0,
          totalArea: 0,
          effectiveDimension: 0,
          volumeEntropy: 0
        };
        
        // Try to calculate from current state if available
        if (currentState) {
          try {
            // Get geometric property calculations using proper classes
            const geometryCalculator = new SpinNetworkGeometryCalculator();
            
            // Calculate total volume and entropy (these only need the state)
            geometric.totalVolume = geometryCalculator.calculateTotalVolume(currentState);
            geometric.volumeEntropy = geometryCalculator.calculateVolumeEntropy(currentState);
            
            // Get graph for area and dimension calculations
            const activeGraph = engineRef.current.getGraph ? engineRef.current.getGraph() : null;
            
            // Try to use the graph from engine, graphRef, or create a new one
            const graphForCalculations = activeGraph || graphRef.current || getGraph();
            
            if (graphForCalculations && 
                Array.isArray(graphForCalculations.edges) && 
                graphForCalculations.edges.length > 0) {
              // Calculate area using the graph
              geometric.totalArea = geometryCalculator.calculateTotalArea(graphForCalculations);
              
              // Calculate effective dimension using both graph and state
              geometric.effectiveDimension = geometryCalculator.calculateEffectiveDimension(
                graphForCalculations, currentState
              );
            } else {
              console.warn("Missing valid graph for area and dimension calculations");
            }
            
            // Check if any geometric values were calculated
            const anyGeometricData = Object.values(geometric).some(value => value > 0);
            console.log("Calculated geometric data:", geometric, "Valid data:", anyGeometricData);
            
            // If we couldn't calculate any data, try again with more aggressive validation
            if (!anyGeometricData && network && network.edges && network.edges.length > 0) {
              try {
                const tempGraph = createSimulationGraph(network);
                if (tempGraph && Array.isArray(tempGraph.edges) && tempGraph.edges.length > 0) {
                  // Try calculating again with the temporary graph
                  geometric.totalArea = geometryCalculator.calculateTotalArea(tempGraph);
                  geometric.effectiveDimension = geometryCalculator.calculateEffectiveDimension(
                    tempGraph, currentState
                  );
                  console.log("Recalculated with temporary graph:", geometric);
                }
              } catch (tempError) {
                console.warn("Failed creating temporary graph:", tempError);
              }
            }
          } catch (error) {
            console.warn("Error calculating geometric observables:", error);
          }
        }
        
        // If any values are still zero, try getting from Redux as fallback
        if (geometric.totalVolume === 0 && geometric.totalArea === 0) {
          try {
            // Access the Redux store directly
            const store = require('../store').store;
            const state = store.getState();
            if (state?.simulation?.geometricData) {
              // Only copy non-zero values
              Object.keys(state.simulation.geometricData).forEach(key => {
                const value = state.simulation.geometricData[key];
                if (value && value !== 0) {
                  geometric[key] = value;
                }
              });
              console.log("Using Redux geometric data:", geometric);
            }
          } catch (error) {
            console.warn("Error getting geometric data from Redux:", error);
          }
        }
        
        // Always include statistics data with defaults
        let statistics: {
          mean: number;
          variance: number;
          skewness: number;
          kurtosis: number;
          [key: string]: number; // Add index signature to allow dynamic property access
        } = {
          mean: 0,
          variance: 0,
          skewness: 0,
          kurtosis: 0
        };
        
        // Try to calculate from current state if available
        if (currentState) {
          try {
            // Use proper SimulationAnalyzer 
            const stats = SimulationAnalyzer.calculateStatistics(currentState, simulationTime);
            
            statistics.mean = stats.mean;
            statistics.variance = stats.variance;
            
            // Placeholder for advanced statistics (future implementation)
            statistics.skewness = 0;
            statistics.kurtosis = 0;
            
            console.log("Calculated statistics data:", statistics);
          } catch (error) {
            console.warn("Error calculating statistical observables:", error);
          }
        }
        
        // If values are still zero, get from Redux as fallback
        if (statistics.mean === 0 && statistics.variance === 0) {
          try {
            const store = require('../store').store;
            const state = store.getState();
            if (state?.simulation?.statisticsData) {
              // Only copy non-zero values
              Object.keys(state.simulation.statisticsData).forEach(key => {
                const value = state.simulation.statisticsData[key];
                if (value && value !== 0) {
                  statistics[key] = value;
                }
              });
              console.log("Using Redux statistics data:", statistics);
            }
          } catch (error) {
            console.warn("Error getting statistical data from Redux:", error);
          }
        }
        
        // Log simulation step with all data (only at interval points)
        simulationLogger.logResults(simulationTime, {
          conservation: {
            totalProbability: conservation.totalProbability || 0,
            normVariation: conservation.normVariation || 0,
            positivity: conservation.positivity || false
          },
          geometric,
          statistics
        });
      }
      
      // Only schedule next frame if still supposed to be running
      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(animationLoop);
      } else {
        animationFrameRef.current = null;
      }
    } catch (error) {
      console.error("Error in simulation step:", error);
      simulationLogger.log('error', 'Error in simulation step', { error });
      
      // Stop animation on error to prevent infinite error loops
      animationFrameRef.current = null;
      setIsRunning(false);
      if (engineRef.current) {
        engineRef.current.pause();
      }
    }
  }, [isRunning, parameters.timeStep, hasHistory]);
  
  // Reset simulation
  const resetSimulation = useCallback(() => {
    if (!engineRef.current || !graphRef.current) {
      console.warn("Cannot reset simulation: engine or graph is null");
      return;
    }
    
    try {
      // Pause if running
      if (isRunning) {
        engineRef.current.pause();
        setIsRunning(false);
      }
      
      // Log simulation reset
      simulationLogger.log('info', 'Simulation reset', {
        parameters
      });
      
      // End current simulation session
      simulationLogger.endSession();
      
      // Validate node ID
      const nodeIdValidation = validateNodeId(network, parameters as SimulationParameters);
      
      if (nodeIdValidation !== true) {
        if (nodeIdValidation) {
          // Update with valid node ID
          console.log("Updating node ID during reset to", nodeIdValidation);

          // Update Redux parameters only
          dispatch(updateInitialStateParams({ nodeId: nodeIdValidation }));

          // Delay reinitialization to ensure parameters are updated
          setTimeout(() => {
            if (engineRef.current && graphRef.current) {
              // Create a safe version of parameters with guaranteed nodeId
              const safeParameters = {
                ...parameters,
                initialStateParams: {
                  ...parameters.initialStateParams,
                  nodeId: nodeIdValidation
                }
              };
              // Cast parameters to the right type with unknown as intermediate step
              // Ensure proper initialStateParams shape with nodeId always present
              const simParams = {
                ...safeParameters,
                initialStateParams: {
                  ...safeParameters.initialStateParams,
                  nodeId: safeParameters.initialStateParams.nodeId || ''
                }
              } as unknown as import('../simulation/core/types').SimulationParameters;
              
              engineRef.current.initialize(graphRef.current, simParams);
              engineRef.current.reset();
              setCurrentTime(0);
              setHasHistory(false);
            }
          }, 50);
          return;
        } else {
          console.error("Failed to validate node ID during reset");
          return;
        }
      }

      // If nodeId is valid, reinitialize immediately
      // Cast parameters to the right type with unknown as intermediate step
      // Ensure proper initialStateParams shape with nodeId always present
      const simParams = {
        ...parameters,
        initialStateParams: {
          ...parameters.initialStateParams,
          nodeId: parameters.initialStateParams.nodeId || ''
        }
      } as unknown as import('../simulation/core/types').SimulationParameters;
      
      engineRef.current.initialize(graphRef.current, simParams);
      engineRef.current.reset();

      // Reset time and history
      setCurrentTime(0);
      setHasHistory(false);
    } catch (error) {
      console.error("Error resetting simulation:", error);
    }
  }, [isRunning, parameters, network, dispatch]);
  
  // Jump to a specific time in the simulation history
  const jumpToTime = useCallback((time: number) => {
    if (engineRef.current && hasHistory) {
      // Get state from history
      const history = engineRef.current.getHistory();
      const closestState = history.getClosestState(time);
      
      if (closestState) {
        // Update current time
        setCurrentTime(closestState.time);
      }
    }
  }, [hasHistory]);
  
  // Pause simulation
  const pauseSimulation = useCallback(() => {
    // Update React state first
    setIsRunning(false);
    
    // Cancel animation frame (important to do this immediately)
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Pause the engine
    if (engineRef.current) {
      engineRef.current.pause();
      
      // Log simulation pause
      simulationLogger.log('info', 'Simulation paused', {
        time: engineRef.current.getCurrentTime()
      }, engineRef.current.getCurrentTime());
    }
  }, []);
  
  // Stop simulation (finalize current run)
  const stopSimulation = useCallback(() => {
    // Pause first if running
    if (isRunning) {
      pauseSimulation();
    }
    
    // End the current simulation session and prepare for a new one
    simulationLogger.log('info', 'Simulation stopped', {
      time: currentTime
    });
    simulationLogger.endSession();
    
    // Reset time to 0 but keep parameters
    setCurrentTime(0);
    setHasHistory(false);
    
    // We don't reset the engine because that would reinitialize parameters
    // Instead, we'll re-initialize on the next start
  }, [isRunning, pauseSimulation, currentTime]);
  
  // Step simulation (single step)
  const stepSimulation = useCallback(() => {
    if (engineRef.current && graphRef.current) {
      // Initialize engine if not already done
      if (currentTime === 0) {
        // Create a safe version with nodeId always present
        const safeParams = {
          ...parameters,
          initialStateParams: {
            ...parameters.initialStateParams,
            nodeId: parameters.initialStateParams?.nodeId || ''
          }
        } as unknown as import('../simulation/core/types').SimulationParameters;
        
        engineRef.current.initialize(graphRef.current, safeParams);
      }
      
      // Step once
      engineRef.current.step();
      setCurrentTime(engineRef.current.getCurrentTime());
      
      // Check if history is available
      if (engineRef.current.getHistory().getTimes().length > 0) {
        setHasHistory(true);
      }
    }
  }, [parameters, currentTime]);
  
  // Helper function to validate node ID and return a valid ID or true if current is valid
  const validateNodeId = useCallback((network: any, params: SimulationParameters) => {
    if (!network?.nodes || network.nodes.length === 0) {
      console.warn("Cannot validate node ID: network is undefined or has no nodes");
      return false;
    }
    
    const nodeId = params.initialStateParams.nodeId;
    console.log(`Validating node ID: ${nodeId}`);
    
    if (!nodeId) {
      const firstNodeId = network.nodes[0].id;
      console.log(`Node ID is empty, using first node: ${firstNodeId}`);
      return firstNodeId;
    }
    
    const nodeExists = network.nodes.some((node: any) => node.id === nodeId);
    if (!nodeExists) {
      const firstNodeId = network.nodes[0].id;
      console.log(`Node ID ${nodeId} not found in network, using first node: ${firstNodeId}`);
      return firstNodeId;
    }
    
    return true; // Current node ID is valid
  }, []);

  // Enhanced start simulation with better error handling and state validation
  const startSimulation = useCallback((shouldResume = false) => {
    if (!engineRef.current || !graphRef.current) {
      console.error("Cannot start simulation: engine or graph is null");
      return;
    }
    
    try {
      // Check for empty graph
      const graphNodeCount = graphRef.current.nodes.length;
      if (graphNodeCount === 0) {
        console.error("Cannot start simulation with empty graph (0 nodes)");
        return;
      }
      
      // If we're resuming and we have history, just resume from current state
      if (shouldResume && hasHistory) {
        console.log("Resuming simulation from current state");
        
        // Start the engine without reinitializing
        engineRef.current.resume();
        
        // Update React state
        setIsRunning(true);
        
        // Start animation loop (will be triggered by isRunning effect)
        return;
      }
      
      // For new simulations, validate nodeId
      const nodeIdValidation = validateNodeId(network, parameters);
      
      if (nodeIdValidation !== true) {
        if (nodeIdValidation) {
          // Update Redux parameters with valid node ID and try again
          dispatch(updateInitialStateParams({ nodeId: nodeIdValidation }));

          // Defer simulation start to avoid race conditions
          setTimeout(() => {
            startSimulation(shouldResume);
          }, 50);
          return;
        } else {
          console.error("Failed to validate node ID and couldn't find a valid substitute");
          return;
        }
      }
      
      // Force history recording
      const enhancedParameters = {
        ...parameters,
        recordHistory: true,
        historyInterval: 1
      };
      
      // Create a type-safe version by ensuring nodeId exists in initialStateParams
      const safeParameters = {
        ...enhancedParameters,
        initialStateParams: {
          ...enhancedParameters.initialStateParams,
          nodeId: enhancedParameters.initialStateParams.nodeId || ''
        }
      };
      
      // Use type assertion with as unknown as intermediate step to avoid type mismatch
      const compatibleParams = safeParameters as unknown as import('../simulation/core/types').SimulationParameters;
      engineRef.current.initialize(graphRef.current, compatibleParams);
      
      // Verify initial state
      const initialState = engineRef.current.getCurrentState();
      if (!initialState || initialState.size === 0) {
        console.error("Failed to create valid initial state");
        return;
      }
      
      // Log simulation start (reduced logging)
      simulationLogger.startSession({
        nodeCount: network?.nodes?.length || 0,
        edgeCount: network?.edges?.length || 0,
        name: network?.metadata?.name,
        type: network?.metadata?.type
      }, enhancedParameters);
      
      // Start the engine
      engineRef.current.resume();
      
      // Update React state
      setIsRunning(true);
      setHasHistory(true);
      
      // Take first step immediately
      engineRef.current.step();
      setCurrentTime(engineRef.current.getCurrentTime());
      
      // Start animation loop (will be triggered by isRunning effect)
    } catch (error) {
      console.error("Error starting simulation:", error);
      // Make sure we reset running state on error
      setIsRunning(false);
    }
  }, [parameters, network, validateNodeId, hasHistory]);
  
  // Track if we've already initialized for this network
  const initializedNetworkRef = useRef<string | null>(null);
  
  // Initialize simulation with current network when it changes
  useEffect(() => {
    // Only proceed if network exists and has nodes
    if (!network || !network.nodes || network.nodes.length === 0) {
      return;
    }
    
    // Skip if we've already initialized for this network
    const networkId = (network as any).id || JSON.stringify(network.nodes.map((n: any) => n.id).sort());
    if (initializedNetworkRef.current === networkId) {
      return;
    }

    // Mark this network as initialized
    initializedNetworkRef.current = networkId;

    try {
      console.log("Network changed, creating simulation graph with", network.nodes.length, "nodes");

      // Create simulation graph from network
      graphRef.current = createSimulationGraph(network);

      // Always update the parameters first to ensure we have a valid nodeId
      // Update default node ID if it's not set or doesn't exist in network
      const nodeId = parameters.initialStateParams?.nodeId;
      const nodeExists = network.nodes.some(node => node.id === nodeId);
      if (!nodeExists && network.nodes.length > 0) {
        const firstNodeId = network.nodes[0].id;
        console.log("Updating initial state node ID to", firstNodeId);

        // Only update Redux if nodeId is actually different
        if (nodeId !== firstNodeId) {
          dispatch(updateInitialStateParams({ nodeId: firstNodeId }));
        }

        // Do NOT initialize engine here. Wait for Redux state to update.
        // Initialization will be handled by the effect below.
      } else {
        // If we don't need to update nodeId, initialize immediately
        if (engineRef.current && graphRef.current) {
          console.log("Initializing simulation engine with existing parameters");
          
          // Create a safe version with nodeId always present
          const safeParams = {
            ...parameters,
            initialStateParams: {
              ...parameters.initialStateParams,
              nodeId: nodeId || ''
            }
          } as unknown as import('../simulation/core/types').SimulationParameters;
          
          engineRef.current.initialize(graphRef.current, safeParams);
          setCurrentTime(0);
          setHasHistory(false);
        }
      }
    } catch (error) {
      console.error("Error initializing simulation with new network:", error);
    }
  }, [network, parameters.initialStateParams.nodeId]);

  // New effect: initialize engine when nodeId is valid and graph is ready
  useEffect(() => {
    if (!network || !network.nodes || network.nodes.length === 0) return;
    if (!graphRef.current) return;
    const nodeId = parameters.initialStateParams?.nodeId;
    const nodeExists = network.nodes.some((node: any) => node.id === nodeId);
    if (nodeExists && engineRef.current && graphRef.current) {
      console.log("Deferred initialization: initializing simulation engine after Redux nodeId update");
      
      // Create a safe version with nodeId always present
      const safeParams = {
        ...parameters,
        initialStateParams: {
          ...parameters.initialStateParams,
          nodeId: nodeId || ''
        }
      } as unknown as import('../simulation/core/types').SimulationParameters;
      
      engineRef.current.initialize(graphRef.current, safeParams);
      setCurrentTime(0);
      setHasHistory(false);
    }
  }, [parameters.initialStateParams.nodeId, network]);
  
  // Create simulation engine on first render
  useEffect(() => {
    engineRef.current = createSimulationEngine();
    
    // Clean up on unmount
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Start animation loop when isRunning changes
  useEffect(() => {
    // Always clean up any existing animation frame first
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Only start animation if we're supposed to be running
    if (isRunning && engineRef.current && graphRef.current) {
      // Make sure engine state matches React state
      if (!engineRef.current.isRunning()) {
        engineRef.current.resume();
      }
      
      // Start the animation loop
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    } 
    else if (!isRunning && engineRef.current) {
      // Make sure engine is paused when React state is not running
      if (engineRef.current.isRunning()) {
        engineRef.current.pause();
      }
    }
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRunning, animationLoop]);

  // Get the current simulation graph with enhanced error handling
  const getGraph: GetGraphFunction = useCallback(() => {
    // Only log the first time or when the value changes
    const isEmpty = !graphRef.current;
    if (isEmpty) {
      // Use static variable to avoid logging the same message repeatedly
      if (!getGraph.hasWarnedNull) {
        console.warn("getGraph: Graph reference is null, this may cause display issues");
        getGraph.hasWarnedNull = true;
      }
    } else {
      // Reset the warning flag if graph becomes available
      getGraph.hasWarnedNull = false;
    }
    
    return graphRef.current;
  }, []);
  
  // Get the current state directly with improved error handling
  const getCurrentState: GetCurrentStateFunction = useCallback(() => {
    try {
      if (engineRef.current) {
        // Always get a fresh state to ensure we have the latest
        const state = engineRef.current.getCurrentState();

        // Validate state has data
        if (state && state.size > 0) {
          return state;
        } else {
          // Only log once per session
          console.warn("getCurrentState: State exists but has no data");
        }
      } else {
        // Only log once per session
        console.warn("getCurrentState: No engine reference available");
      }
    } catch (error) {
      console.error("Error in getCurrentState:", error);
    }
    return null;
  }, []);
  
  // To avoid excessive logging during getHistory calls
  const lastHistoryCallTimeRef = useRef<number>(0);
  const historyCallCountRef = useRef<number>(0);

  // Get the simulation history with enhanced error handling and status tracking
  const getHistory: GetHistoryFunction = useCallback(() => {
    try {
      if (engineRef.current) {
        const history = engineRef.current.getHistory();

        // Get the times for validation
        const times = history.getTimes();

        // Update hasHistory state only once on first call or when simulation status changes
        // This prevents setting state on every call, which can cause render loops
        const hasActualTimes = times.length > 0;
        const shouldHaveHistory = currentTime > 0 || isRunning;

        // Only set the state if there's a reason to change it
        if (hasActualTimes || shouldHaveHistory) {
          if (!hasHistory) {
            setHasHistory(true);
          }
        } else if (hasHistory) {
          setHasHistory(false);
        }

        // Limit logging frequency to avoid console spam
        const now = Date.now();
        historyCallCountRef.current++;

        if (now - lastHistoryCallTimeRef.current > 1000) {
          console.log(`getHistory called ${historyCallCountRef.current} times in the last second, timepoints:`, times.length);
          lastHistoryCallTimeRef.current = now;
          historyCallCountRef.current = 0;
        }

        return history;
      } else {
        // Limit logging frequency
        if (Date.now() - lastHistoryCallTimeRef.current > 1000) {
          console.warn("getHistory: No engine reference available");
          lastHistoryCallTimeRef.current = Date.now();
        }
      }
    } catch (error) {
      console.error("Error in getHistory:", error);
    }

    // Return a dummy history object if real one is unavailable
    return {
      getTimes: () => [],
      getStateAtTime: () => null,
      getClosestState: () => null,
      addState: () => {},
      clear: () => {},
      getDuration: (): number => 0
    };
  }, [currentTime, isRunning, hasHistory]);

  return {
    isRunning,
    parameters,
    currentTime,
    hasHistory,
    startSimulation,
    pauseSimulation,
    stepSimulation,
    resetSimulation,
    jumpToTime,
    updateParameters: updateParametersWithRedux,
    updateInitialStateParams: updateInitialStateParamsWithRedux,
    getVisualizationState,
    getConservationLaws,
    getGraph,
    getCurrentState,
    getHistory  // Add history getter
  };
};
