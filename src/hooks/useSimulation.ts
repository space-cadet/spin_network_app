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
  
  // Update simulation parameters
  const updateParameters = useCallback((newParams: Partial<SimulationParameters>) => {
    setParameters(prev => {
      const updated = { ...prev, ...newParams };
      
      // Log parameter change
      simulationLogger.logParameterChange(prev, updated);
      
      // If engine already exists, update it
      if (engineRef.current && graphRef.current) {
        engineRef.current.initialize(graphRef.current, updated);
      }
      
      return updated;
    });
  }, []);
  
  // Update initial state parameters
  const updateInitialStateParams = useCallback((newParams: Record<string, any>) => {
    setParameters(prev => {
      const updated = {
        ...prev,
        initialStateParams: {
          ...prev.initialStateParams,
          ...newParams
        }
      };
      
      // If engine already exists, update it
      if (engineRef.current && graphRef.current) {
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
  
  // Animation loop for updating simulation
  const animationLoop = useCallback(() => {
    if (isRunning && engineRef.current) {
      console.log("Animation loop iteration, stepping simulation");
      
      // Step the simulation
      try {
        engineRef.current.step();
        
        const currentTime = engineRef.current.getCurrentTime();
        console.log("Current simulation time:", currentTime);
        
        // Update current time
        setCurrentTime(currentTime);
        
        // Check if history is available
        if (engineRef.current.getHistory().getTimes().length > 0) {
          setHasHistory(true);
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
      } catch (error) {
        console.error("Error in simulation step:", error);
        simulationLogger.log('error', 'Error in simulation step', { error });
      }
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(animationLoop);
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
      engineRef.current.pause();
      setIsRunning(false);
      
      // Log simulation pause
      simulationLogger.log('info', 'Simulation paused', {
        time: engineRef.current.getCurrentTime()
      }, engineRef.current.getCurrentTime());
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

  // Start simulation
  const startSimulation = useCallback(() => {
    if (!engineRef.current || !graphRef.current) {
      console.error("Cannot start simulation: engine or graph is null");
      if (!graphRef.current) console.error("Graph ref is null");
      if (!engineRef.current) console.error("Engine ref is null");
      return;
    }
    
    try {
      console.log("Starting simulation, graph:", graphRef.current.nodes.length, "nodes");
      
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
      
      // Only proceed if the nodeId is valid
      // (nodeIdValidation === true means the node ID is valid)
      {
        // Initialize engine if not already done
        engineRef.current.initialize(graphRef.current, parameters);
        
        // Log simulation start
        if (network) {
          simulationLogger.startSession({
            nodeCount: network.nodes?.length || 0,
            edgeCount: network.edges?.length || 0,
            name: network.metadata?.name,
            type: network.metadata?.type
          }, parameters);
          
          simulationLogger.log('info', 'Simulation started', {
            networkSize: network.nodes?.length || 0,
            parameters
          });
        }
        
        console.log("Using initial node:", parameters.initialStateParams.nodeId);
        
        // Start simulation
        engineRef.current.resume();
        setIsRunning(true);
        
        // Take an immediate first step to show something happening
        try {
          engineRef.current.step();
          const newTime = engineRef.current.getCurrentTime();
          console.log("First step completed, new time:", newTime);
          setCurrentTime(newTime);
          setHasHistory(true);
        } catch (error) {
          console.error("Error during first step:", error);
        }
      }
    } catch (error) {
      console.error("Error starting simulation:", error);
    }
  }, [parameters, network]);
  
  // Initialize simulation with current network when it changes
  useEffect(() => {
    // Only proceed if network exists and has nodes
    if (!network || !network.nodes || network.nodes.length === 0) {
      return;
    }
    
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
      }
      
      // Initialize engine with updated parameters after a short delay
      // This ensures the parameters are fully updated before initialization
      setTimeout(() => {
        if (engineRef.current && graphRef.current) {
          console.log("Initializing simulation engine with updated parameters");
          engineRef.current.initialize(graphRef.current, parameters);
          setCurrentTime(0);
          setHasHistory(false);
        }
      }, 100);
    } catch (error) {
      console.error("Error initializing simulation with new network:", error);
    }
  }, [network]);
  
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
    if (isRunning) {
      console.log("Starting animation loop");
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
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    } else if (animationFrameRef.current !== null) {
      console.log("Stopping animation loop");
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [isRunning, animationLoop]);

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
    getConservationLaws
  };
};