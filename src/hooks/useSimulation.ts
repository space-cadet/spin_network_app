import { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  SimulationParameters,
  createSimulationEngine,
  createSimulationGraph,
  SpinNetworkSimulationEngine,
  DEFAULT_SIMULATION_PARAMETERS,
  SimulationGraph
} from '../simulation';
import { RootState } from '../store';

export const useSimulation = () => {
  // Get network from Redux - handle the case where it might be undefined
  const network = useSelector((state: RootState) => state.network?.present);
  
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
  const engineRef = useRef<SpinNetworkSimulationEngine | null>(null);
  const graphRef = useRef<SimulationGraph | null>(null);
  
  // Animation frame ID for cleanup
  const animationFrameRef = useRef<number | null>(null);
  
  // Initialize simulation with current network when it changes
  useEffect(() => {
    // Create simulation graph from network if it exists and has nodes
    if (network && network.nodes && network.nodes.length > 0) {
      graphRef.current = createSimulationGraph(network);
      
      // Initialize engine if it exists
      if (engineRef.current) {
        engineRef.current.initialize(graphRef.current, parameters);
        setCurrentTime(0);
        setHasHistory(false);
      }
      
      // Update default node ID if it's not set or doesn't exist in network
      const nodeExists = network.nodes.some(node => node.id === parameters.initialStateParams.nodeId);
      if (!nodeExists && network.nodes.length > 0) {
        updateInitialStateParams({
          ...parameters.initialStateParams,
          nodeId: network.nodes[0].id
        });
      }
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
  
  // Animation loop for updating simulation
  const animationLoop = useCallback(() => {
    if (isRunning && engineRef.current) {
      // Step the simulation
      engineRef.current.step();
      
      // Update current time
      setCurrentTime(engineRef.current.getCurrentTime());
      
      // Check if history is available
      if (engineRef.current.getHistory().getTimes().length > 0) {
        setHasHistory(true);
      }
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [isRunning]);
  
  // Start animation loop when isRunning changes
  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    } else if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [isRunning, animationLoop]);
  
  // Start simulation
  const startSimulation = useCallback(() => {
    if (engineRef.current && graphRef.current) {
      // Initialize engine if not already done
      engineRef.current.initialize(graphRef.current, parameters);
      
      // Start simulation
      engineRef.current.resume();
      setIsRunning(true);
    }
  }, [parameters]);
  
  // Pause simulation
  const pauseSimulation = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
      setIsRunning(false);
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
  
  // Reset simulation
  const resetSimulation = useCallback(() => {
    if (engineRef.current && graphRef.current) {
      // Pause if running
      if (isRunning) {
        engineRef.current.pause();
        setIsRunning(false);
      }
      
      // Reinitialize engine
      engineRef.current.initialize(graphRef.current, parameters);
      engineRef.current.reset();
      
      // Reset time and history
      setCurrentTime(0);
      setHasHistory(false);
    }
  }, [isRunning, parameters]);
  
  // Jump to a specific time in the simulation history
  const jumpToTime = useCallback((time: number) => {
    if (engineRef.current && hasHistory) {
      // Get state from history
      const history = engineRef.current.getHistory();
      const closestState = history.getClosestState(time);
      
      if (closestState) {
        // Update current time
        setCurrentTime(closestState.time);
        
        // TODO: Update visualization with state
      }
    }
  }, [hasHistory]);
  
  // Update simulation parameters
  const updateParameters = useCallback((newParams: Partial<SimulationParameters>) => {
    setParameters(prev => {
      const updated = { ...prev, ...newParams };
      
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
    if (engineRef.current) {
      return engineRef.current.getCurrentState().toVisualizationState();
    }
    return {};
  }, []);
  
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
    getVisualizationState
  };
};