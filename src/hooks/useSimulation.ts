import { useState, useCallback, useEffect, useRef } from 'react';
import { CytoscapeAdapter } from '../simulation/visualization/cytoscapeAdapter';
import { useSelector } from 'react-redux';
import { 
  SimulationParameters,
  createSimulationEngine,
  createSimulationGraph,
  DEFAULT_SIMULATION_PARAMETERS,
  SimulationGraph
} from '../simulation';
// Import the engine implementation directly
import { SpinNetworkSimulationEngineImpl } from '../simulation/core/engineImplementation';
import { RootState } from '../store';
import { simulationLogger } from '../simulation/core/simulationLogger';

export const useSimulation = () => {
  // Get network from Redux - handle the case where it might be undefined
  const network = useSelector((state: RootState) => state.network?.currentNetwork);
  
  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasHistory, setHasHistory] = useState(false);
  
  // Simulation parameters (with defaults)
  const [parameters, setParameters] = useState<SimulationParameters>({
    ...DEFAULT_SIMULATION_PARAMETERS,
    initialStateParams: {
      ...DEFAULT_SIMULATION_PARAMETERS.initialStateParams,
      // Safely set the first node as default delta source if available
      nodeId: network?.nodes?.[0]?.id || ''
    }
  });

  // References to the simulation engine and graph
  const engineRef = useRef<SpinNetworkSimulationEngineImpl | null>(null);
  const graphRef = useRef<SimulationGraph | null>(null);
  
  // Animation frame ID for cleanup
  const animationFrameRef = useRef<number | null>(null);
  
  // Define all callback functions first to avoid reference errors
  
  // To prevent reinitializing parameters in a loop
  const lastParameterUpdateRef = useRef<number>(0);
  
  // Update simulation parameters
  const updateParameters = useCallback((newParams: Partial<SimulationParameters>) => {
    const now = Date.now();
    
    // Prevent rapid reinitializations (throttle to max once per 500ms)
    if (now - lastParameterUpdateRef.current < 500) {
      console.log("Throttling parameter update");
      return;
    }
    
    lastParameterUpdateRef.current = now;
    
    setParameters(prev => {
      const updated = { ...prev, ...newParams };
      
      // Log parameter change
      simulationLogger.logParameterChange(prev, updated);
      
      // If engine already exists, update it - but only if user is interacting
      // This prevents an initialization feedback loop
      if (engineRef.current && graphRef.current && !engineRef.current.isRunning()) {
        console.log("Reinitializing engine with new parameters:", newParams);
        engineRef.current.initialize(graphRef.current, updated);
      }
      
      return updated;
    });
  }, []);
  
  // Update initial state parameters
  const updateInitialStateParams = useCallback((newParams: Record<string, any>) => {
    const now = Date.now();
    
    // Prevent rapid reinitializations (throttle to max once per 500ms)
    if (now - lastParameterUpdateRef.current < 500) {
      console.log("Throttling initial state parameter update");
      return;
    }
    
    lastParameterUpdateRef.current = now;
    
    setParameters(prev => {
      const updated = {
        ...prev,
        initialStateParams: {
          ...prev.initialStateParams,
          ...newParams
        }
      };
      
      // If engine already exists, update it - but only if user is interacting
      // This helps prevent initialization loops
      if (engineRef.current && graphRef.current && !engineRef.current.isRunning()) {
        console.log("Reinitializing engine with new initial state parameters:", newParams);
        engineRef.current.initialize(graphRef.current, updated);
      }
      
      return updated;
    });
  }, []);
  
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
  
  // Enhanced animation loop for updating simulation
  const animationLoop = useCallback(() => {
    // Check both internal (engine) and external (React state) running flags
    if (engineRef.current && engineRef.current.isRunning() && isRunning) {
      console.log("Animation loop iteration, stepping simulation");
      
      // Step the simulation
      try {
        engineRef.current.step();
        
        const currentTime = engineRef.current.getCurrentTime();
        console.log("Current simulation time:", currentTime);
        
        // Update current time
        setCurrentTime(currentTime);
        
        // Check if history is available - CRITICAL FIX
        const history = engineRef.current.getHistory();
        const times = history.getTimes();
        
        // Always set hasHistory to true when animation is running
        // This ensures debug panel always shows history as available
        setHasHistory(true);
        
        // Log history information for debugging
        if (times.length > 0) {
          console.log("History available:", times.length, "timepoints");
        }
        
        // Check if we have valid state data - CRITICAL FIX
        const state = engineRef.current.getCurrentState();
        if (!state || state.size === 0) {
          console.warn("Animation loop: Current state is empty or invalid");
        } else {
          // Log state size and sample value
          if (state.size > 0) {
            console.log("State data:", {
              size: state.size,
              firstNodeValue: state.getValueAtIndex(0)
            });
          }
        }
        
        // Get and log conservation laws for every step
        const conservation = engineRef.current.getConservationLaws();
        console.log("Conservation laws:", conservation);
        
        // Log occasionally (every second of simulation time)
        // This reduces log clutter while still providing useful data
        const timeStep = parameters.timeStep || 0.01;
        if (Math.floor(currentTime / 1.0) > Math.floor((currentTime - timeStep) / 1.0)) {
          // Get analysis results
          try {
            // Log simulation step with conservation data
            simulationLogger.logResults(currentTime, {
              conservation: {
                totalProbability: conservation.totalProbability || 0,
                normVariation: conservation.normVariation || 0,
                positivity: conservation.positivity || false
              }
            });
          } catch (error) {
            simulationLogger.log('error', 'Error computing analysis results', { error }, currentTime);
          }
        }
        
        // Only schedule next frame if still running
        if (engineRef.current.isRunning() && isRunning) {
          // Request next frame
          animationFrameRef.current = requestAnimationFrame(animationLoop);
        } else {
          console.log("Animation stopped due to running state change");
          animationFrameRef.current = null;
        }
      } catch (error) {
        console.error("Error in simulation step:", error);
        simulationLogger.log('error', 'Error in simulation step', { error });
        
        // Still schedule next frame to ensure animation doesn't stop on error
        if (engineRef.current.isRunning() && isRunning) {
          animationFrameRef.current = requestAnimationFrame(animationLoop);
        }
      }
    } else {
      console.log("Animation loop called but simulation is not running");
      console.log("Engine running:", engineRef.current?.isRunning(), "React state:", isRunning);
    }
  }, [isRunning, parameters.timeStep]);
  
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
      const nodeIdValidation = validateNodeId(network, parameters);
      
      if (nodeIdValidation !== true) {
        if (nodeIdValidation) {
          // Update with valid node ID
          console.log("Updating node ID during reset to", nodeIdValidation);
          
          // Update parameters
          setParameters(prev => ({
            ...prev,
            initialStateParams: {
              ...prev.initialStateParams,
              nodeId: nodeIdValidation
            }
          }));
          
          // Delay reinitialization to ensure parameters are updated
          setTimeout(() => {
            if (engineRef.current && graphRef.current) {
              engineRef.current.initialize(graphRef.current, parameters);
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
      engineRef.current.initialize(graphRef.current, parameters);
      engineRef.current.reset();
      
      // Reset time and history
      setCurrentTime(0);
      setHasHistory(false);
    } catch (error) {
      console.error("Error resetting simulation:", error);
    }
  }, [isRunning, parameters, network]);
  
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
    if (engineRef.current) {
      console.log("Pausing simulation - canceling animation frame");
      
      // Cancel any pending animation frame first
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Update engine state
      engineRef.current.pause();
      
      // Update React state
      setIsRunning(false);
      
      // Log simulation pause
      simulationLogger.log('info', 'Simulation paused', {
        time: engineRef.current.getCurrentTime()
      }, engineRef.current.getCurrentTime());
      
      console.log("Simulation paused at time:", engineRef.current.getCurrentTime());
    }
  }, []);
  
  // Step simulation (single step)
  const stepSimulation = useCallback(() => {
    if (engineRef.current && graphRef.current) {
      // Initialize engine if not already done
      if (currentTime === 0) {
        engineRef.current.initialize(graphRef.current, parameters);
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
  const startSimulation = useCallback(() => {
    if (!engineRef.current || !graphRef.current) {
      console.error("Cannot start simulation: engine or graph is null");
      if (!graphRef.current) console.error("Graph ref is null");
      if (!engineRef.current) console.error("Engine ref is null");
      return;
    }
    
    try {
      // Important debug information
      const graphNodeCount = graphRef.current.nodes.length;
      console.log("Starting simulation, graph:", graphNodeCount, "nodes");
      
      if (graphNodeCount === 0) {
        console.error("Cannot start simulation with empty graph (0 nodes)");
        return;
      }
      
      // Validate that the nodeId exists in the network
      const nodeIdValidation = validateNodeId(network, parameters);
      
      if (nodeIdValidation !== true) {
        if (nodeIdValidation) {
          // Update with valid node ID
          console.log("Invalid node ID, updating to:", nodeIdValidation);
          
          // Update parameters
          setParameters(prev => ({
            ...prev,
            initialStateParams: {
              ...prev.initialStateParams,
              nodeId: nodeIdValidation
            }
          }));
          
          // Don't proceed with simulation start until parameters are updated
          console.log("Deferring simulation start until node ID is updated");
          setTimeout(() => {
            startSimulation();
          }, 50);
          return;
        } else {
          console.error("Failed to validate node ID and couldn't find a valid substitute");
          return;
        }
      }
      
      // Force history recording - CRITICAL FIX
      const enhancedParameters = {
        ...parameters,
        recordHistory: true,
        historyInterval: 1 // Record every step for better analysis
      };
      
      // Only proceed if the nodeId is valid
      // (nodeIdValidation === true means the node ID is valid)
      {
        console.log("Initializing engine with parameters:", enhancedParameters);
        
        // Initialize engine if not already done
        engineRef.current.initialize(graphRef.current, enhancedParameters);
        
        // Force a check of initial state
        const initialState = engineRef.current.getCurrentState();
        console.log("Initial state after initialization:", {
          exists: !!initialState,
          size: initialState ? initialState.size : 0,
          nodeIds: initialState ? initialState.nodeIds.slice(0, 3) : []
        });
        
        if (!initialState || initialState.size === 0) {
          console.error("Failed to create valid initial state");
          return;
        }
        
        // Log simulation start
        if (network) {
          simulationLogger.startSession({
            nodeCount: network.nodes?.length || 0,
            edgeCount: network.edges?.length || 0,
            name: network.metadata?.name,
            type: network.metadata?.type
          }, enhancedParameters);
          
          simulationLogger.log('info', 'Simulation started', {
            networkSize: network.nodes?.length || 0,
            parameters: enhancedParameters
          });
        }
        
        console.log("Using initial node:", enhancedParameters.initialStateParams.nodeId);
        
        // Start simulation
        engineRef.current.resume();
        setIsRunning(true);
        
        // Take an immediate first step to show something happening
        try {
          engineRef.current.step();
          const newTime = engineRef.current.getCurrentTime();
          console.log("First step completed, new time:", newTime);
          setCurrentTime(newTime);
          
          // Explicitly set hasHistory to true regardless of timelines
          setHasHistory(true);
          
          // Double check history state
          const history = engineRef.current.getHistory();
          const times = history.getTimes();
          console.log("History check after first step:", {
            hasHistory: true,
            timePointsExist: times.length > 0,
            timePoints: times
          });
          
          console.log("History after first step:", {
            hasTimes: times.length > 0,
            timePoints: times
          });
          
          // Also check conservation laws to see if they've been computed
          const conservation = engineRef.current.getConservationLaws();
          console.log("Conservation laws after first step:", conservation);
        } catch (error) {
          console.error("Error during first step:", error);
        }
      }
    } catch (error) {
      console.error("Error starting simulation:", error);
    }
  }, [parameters, network]);
  
  // Track if we've already initialized for this network
  const initializedNetworkRef = useRef<string | null>(null);
  
  // Initialize simulation with current network when it changes
  useEffect(() => {
    // Only proceed if network exists and has nodes
    if (!network || !network.nodes || network.nodes.length === 0) {
      return;
    }
    
    // Skip if we've already initialized for this network
    const networkId = network.id || JSON.stringify(network.nodes.map(n => n.id).sort());
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
      const nodeExists = network.nodes.some(node => node.id === parameters.initialStateParams.nodeId);
      if (!nodeExists && network.nodes.length > 0) {
        const firstNodeId = network.nodes[0].id;
        console.log("Updating initial state node ID to", firstNodeId);
        
        // Update parameters directly to avoid any race conditions
        setParameters(prev => ({
          ...prev,
          initialStateParams: {
            ...prev.initialStateParams,
            nodeId: firstNodeId
          }
        }));
        
        // Only initialize once after setting parameters
        // This helps prevent multiple initializations in a single render cycle
        setTimeout(() => {
          if (engineRef.current && graphRef.current) {
            console.log("Initializing simulation engine with updated parameters");
            engineRef.current.initialize(graphRef.current, {
              ...parameters,
              initialStateParams: {
                ...parameters.initialStateParams,
                nodeId: firstNodeId
              }
            });
            setCurrentTime(0);
            setHasHistory(false);
          }
        }, 100);
      } else {
        // If we don't need to update nodeId, initialize immediately
        if (engineRef.current && graphRef.current) {
          console.log("Initializing simulation engine with existing parameters");
          engineRef.current.initialize(graphRef.current, parameters);
          setCurrentTime(0);
          setHasHistory(false);
        }
      }
    } catch (error) {
      console.error("Error initializing simulation with new network:", error);
    }
  }, [network, parameters.initialStateParams.nodeId]);
  
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
    // Make sure we clean up any existing animation frame before changing state
    if (animationFrameRef.current !== null) {
      console.log("Cleaning up existing animation frame before state change");
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (isRunning) {
      console.log("Starting animation loop, engine state:", engineRef.current?.isRunning());
      
      // Make sure engine and React states are in sync
      if (engineRef.current && !engineRef.current.isRunning()) {
        console.log("Engine was not running, resuming it");
        engineRef.current.resume();
      }
      
      // Directly run a step immediately
      if (engineRef.current && graphRef.current) {
        console.log("Initial step when starting animation");
        try {
          engineRef.current.step();
          setCurrentTime(engineRef.current.getCurrentTime());
          setHasHistory(true);
          console.log("Current time after initial step:", engineRef.current.getCurrentTime());
        } catch (error) {
          console.error("Error during initial step:", error);
        }
      }
      
      // Then start the animation loop
      console.log("Requesting initial animation frame");
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    } else {
      console.log("Not starting animation loop because isRunning is false");
      
      // Make sure engine state matches React state
      if (engineRef.current && engineRef.current.isRunning()) {
        console.log("Engine was running but React state is not, pausing engine");
        engineRef.current.pause();
      }
    }
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current !== null) {
        console.log("Cleaning up animation frame in effect cleanup");
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRunning, animationLoop]);

  // Get the current simulation graph with enhanced error handling
  const getGraph = useCallback(() => {
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
  
  // Add static property to track warning state
  getGraph.hasWarnedNull = false;

  // Get the current state directly with improved error handling
  const getCurrentState = useCallback(() => {
    try {
      if (engineRef.current) {
        // Always get a fresh state to ensure we have the latest
        const state = engineRef.current.getCurrentState();
        
        // Validate state has data
        if (state && state.size > 0) {
          return state;
        } else {
          // Use static variable to avoid logging the same message repeatedly
          if (!getCurrentState.hasWarnedNoData) {
            console.warn("getCurrentState: State exists but has no data");
            getCurrentState.hasWarnedNoData = true;
          }
        }
      } else {
        // Use static variable to avoid logging the same message repeatedly
        if (!getCurrentState.hasWarnedNoEngine) {
          console.warn("getCurrentState: No engine reference available");
          getCurrentState.hasWarnedNoEngine = true;
        }
      }
    } catch (error) {
      console.error("Error in getCurrentState:", error);
    }
    return null;
  }, []);
  
  // Add static properties to track warning states
  getCurrentState.hasWarnedNoData = false;
  getCurrentState.hasWarnedNoEngine = false;
  
  // To avoid excessive logging during getHistory calls
  const lastHistoryCallTimeRef = useRef<number>(0);
  const historyCallCountRef = useRef<number>(0);
  
  // Get the simulation history with enhanced error handling and status tracking
  const getHistory = useCallback(() => {
    try {
      if (engineRef.current) {
        const history = engineRef.current.getHistory();
        
        // Get the times for validation
        const times = history.getTimes();
        
        // Update hasHistory state only once on first call or when simulation status changes
        // This prevents setting state on every call, which can cause render loops
        const hasActualTimes = times.length > 0;
        const shouldHaveHistory = currentTime > 0 || isRunning;
        
        // Check for status changes that require hasHistory updates
        // But don't update state on every call - use refs to track state
        if (!getHistory.hasUpdatedHistory) {
          // Only set the state if there's a reason to change it
          if (hasActualTimes || shouldHaveHistory) {
            if (!hasHistory) {
              setHasHistory(true);
              getHistory.hasUpdatedHistory = true;
            }
          } else if (hasHistory) {
            setHasHistory(false);
            getHistory.hasUpdatedHistory = true;
          }
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
  
  // Static property to track if we've already updated history
  getHistory.hasUpdatedHistory = false;
  
  // Reset history update flag when simulation status changes
  useEffect(() => {
    getHistory.hasUpdatedHistory = false;
  }, [isRunning, currentTime]);

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
    updateParameters,
    updateInitialStateParams,
    getVisualizationState,
    getConservationLaws,
    getGraph,
    getCurrentState,
    getHistory  // Add history getter
  };
};