import React, { useState, useEffect } from 'react';
import { FaChartBar, FaChartPie, FaChartLine, FaRuler, FaInfoCircle } from 'react-icons/fa';
import CollapsibleSection from '../common/CollapsibleSection';
import { useSimulation } from '../../hooks/useSimulation';
import { SpinNetworkGeometryCalculator } from '../../simulation/analysis/geometricProps';
import { SimulationAnalyzer } from '../../simulation/analysis/statistics';
import { simulationLogger } from '../../simulation/core/simulationLogger';
import RawDataDisplay from './RawDataDisplay';

const SimulationResultsPanel: React.FC = () => {
  // Handle undefined values from useSimulation gracefully
  const simulation = useSimulation();
  const currentTime = simulation?.currentTime || 0;
  const [hasHistory, setHasHistory] = useState(simulation?.hasHistory || false);
  const isRunning = simulation?.isRunning || false;
  
  // Enhanced logging to debug simulation data flow
  console.log("useSimulation hook returned:", {
    currentTime,
    hasHistory,
    isRunning,
    hasGetGraph: typeof simulation?.getGraph === 'function',
    hasGetCurrentState: typeof simulation?.getCurrentState === 'function',
    graphData: simulation && typeof simulation.getGraph === 'function' ? 'Fetching graph...' : 'No getGraph method',
    stateData: simulation && typeof simulation.getCurrentState === 'function' ? 'Fetching state...' : 'No getCurrentState method'
  });
  
  // Inspect actual graph and state data
  if (simulation?.getGraph) {
    const graph = simulation.getGraph();
    console.log("Graph data:", {
      hasGraph: !!graph,
      nodeCount: graph ? graph.nodes.length : 0,
      edgeCount: graph ? graph.edges.length : 0
    });
  }
  
  if (simulation?.getCurrentState) {
    const state = simulation.getCurrentState();
    console.log("State data:", {
      hasState: !!state,
      size: state ? state.size : 0,
      hasValidData: state ? state.size > 0 : false
    });
  }
  
  const [activeTab, setActiveTab] = useState<'conservation' | 'geometric' | 'statistics'>('conservation');
  const [refreshCounter, setRefreshCounter] = useState(0); // Used to force re-renders
  const [geometricData, setGeometricData] = useState({
    totalVolume: 0,
    totalArea: 0,
    effectiveDimension: 0,
    volumeEntropy: 0
  });
  
  const [statisticsData, setStatisticsData] = useState({
    mean: 0,
    variance: 0,
    skewness: 0,
    kurtosis: 0
  });
  
  // Run initial calculation once when component mounts
  useEffect(() => {
    console.log("SimulationResultsPanel mounted - will perform initial data calculation");
    // Delay the initial calculation to ensure all hooks are properly initialized
    setTimeout(() => {
      if (simulation && (simulation.isRunning || simulation.hasHistory)) {
        console.log("Running initial analysis calculation");
        // Get initial data
        try {
          const currentState = simulation.getCurrentState ? simulation.getCurrentState() : null;
          const graph = simulation.getGraph ? simulation.getGraph() : null;
          if (currentState && graph) {
            console.log("Initial data available - calculating");
            // Intentionally call function logic directly rather than through updateAnalysisData
            // to avoid any issues with function references or closures
            const geometryCalculator = new SpinNetworkGeometryCalculator();
            setGeometricData({
              totalVolume: geometryCalculator.calculateTotalVolume(currentState),
              volumeEntropy: geometryCalculator.calculateVolumeEntropy(currentState),
              totalArea: geometryCalculator.calculateTotalArea(graph),
              effectiveDimension: geometryCalculator.calculateEffectiveDimension(graph, currentState)
            });
            
            const stats = SimulationAnalyzer.calculateStatistics(currentState, simulation.currentTime);
            setStatisticsData({
              mean: stats.mean,
              variance: stats.variance,
              skewness: 0,
              kurtosis: 0
            });
          }
        } catch (error) {
          console.error("Error in initial analysis calculation:", error);
        }
      }
    }, 100);
  }, []);
  
  // Get conservation data from simulation with better fallback handling
  const conservationData = (() => {
    try {
      // First try to get data directly from simulation engine
      if (simulation && simulation.getConservationLaws) {
        const data = simulation.getConservationLaws();
        
        // Check if we actually got valid data
        if (data && typeof data.totalProbability === 'number' && data.totalProbability > 0) {
          console.log("Got valid conservation data from simulation:", data);
          return data;
        } else {
          console.warn("Conservation data from simulation was invalid:", data);
        }
      }
      
      // Try to get data from simulation logs as a fallback
      // This is especially useful after a simulation has finished running
      const simulationLogs = simulationLogger.getCurrentSession();
      if (simulationLogs && simulationLogs.results.length > 0) {
        // Get the most recent result
        const latestResult = simulationLogs.results[simulationLogs.results.length - 1];
        
        if (latestResult && latestResult.conservation) {
          console.log("Using conservation data from logs:", latestResult.conservation);
          return latestResult.conservation;
        }
      }
      
      console.warn("Could not get valid conservation data from any source");
      return {
        totalProbability: 0,
        positivity: false,
        normVariation: 0,
      };
    } catch (error) {
      console.error("Error getting conservation data:", error);
      return {
        totalProbability: 0,
        positivity: false,
        normVariation: 0,
      };
    }
  })();
  
  // Enhanced helper function to safely update analysis data with fallbacks
  const updateAnalysisData = () => {
    if (!simulation) {
      console.warn("updateAnalysisData called with no simulation object");
      return;
    }
    
    try {
      // Try to get the current state and graph
      const currentState = simulation.getCurrentState ? simulation.getCurrentState() : null;
      const graph = simulation.getGraph ? simulation.getGraph() : null;
      
      // More detailed diagnostics
      console.log("Analysis data check:", {
        hasCurrentState: !!currentState,
        hasGraph: !!graph,
        currentStateSize: currentState ? currentState.size : 0,
        graphNodeCount: graph ? graph.nodes.length : 0,
        graphEdgeCount: graph ? graph.edges.length : 0,
        simulationTime: simulation.currentTime
      });
      
      // CRITICAL FIX: Check logs for data when simulation state is missing
      if (!currentState || !graph || currentState.size === 0 || graph.nodes.length === 0) {
        console.warn("Missing or invalid simulation data, checking logs as fallback");
        
        // Try to get data from logs
        const logsSession = simulationLogger.getCurrentSession();
        if (logsSession && logsSession.results.length > 0) {
          // Get the most recent result
          const latestResult = logsSession.results[logsSession.results.length - 1];
          
          // Update conservation data from logs
          if (latestResult.conservation) {
            console.log("Using log data for analysis:", latestResult);
            
            // Directly update geometric data from logs if available
            if (latestResult.geometric) {
              setGeometricData({
                totalVolume: latestResult.geometric.totalVolume || 0,
                volumeEntropy: latestResult.geometric.volumeEntropy || 0,
                totalArea: latestResult.geometric.totalArea || 0,
                effectiveDimension: latestResult.geometric.effectiveDimension || 0
              });
              console.log("Updated geometric data from logs");
            }
            
            // Update statistics from logs if available
            if (latestResult.statistics) {
              setStatisticsData({
                mean: latestResult.statistics.mean || 0,
                variance: latestResult.statistics.variance || 0,
                skewness: latestResult.statistics.skewness || 0,
                kurtosis: latestResult.statistics.kurtosis || 0
              });
              console.log("Updated statistics data from logs");
            }
            
            // Force hasHistory to true since we have log data
            if (simulation && typeof simulation.getHistory === 'function') {
              const history = simulation.getHistory();
              if (history && typeof history.getTimes === 'function') {
                const times = history.getTimes();
                setHasHistory(times.length > 0);
              }
            }
            
            return; // Exit early, we've updated from logs
          }
        }
        
        // If we get here, we couldn't get data from logs either
        console.warn("No valid data available from simulation or logs");
        return;
      }
      
      // Calculate geometric properties
      console.log("Beginning geometric calculations...");
      const geometryCalculator = new SpinNetworkGeometryCalculator();
      
      // Log each calculation step
      console.log("Calculating total volume...");
      const totalVolume = geometryCalculator.calculateTotalVolume(currentState);
      
      console.log("Calculating volume entropy...");
      const volumeEntropy = geometryCalculator.calculateVolumeEntropy(currentState);
      
      console.log("Calculating total area...");
      const totalArea = geometryCalculator.calculateTotalArea(graph);
      
      console.log("Calculating effective dimension...");
      const effectiveDimension = geometryCalculator.calculateEffectiveDimension(graph, currentState);
      
      console.log("Calculated geometric data:", {
        totalVolume,
        volumeEntropy,
        totalArea,
        effectiveDimension,
        calculationSuccess: true
      });
      
      // Update state only if calculations succeeded
      setGeometricData({
        totalVolume,
        totalArea,
        effectiveDimension,
        volumeEntropy
      });
      
      // Calculate statistics
      console.log("Beginning statistics calculations...");
      const stats = SimulationAnalyzer.calculateStatistics(currentState, simulation.currentTime);
      console.log("Calculated statistics:", {
        ...stats,
        calculationSuccess: true
      });
      
      setStatisticsData({
        mean: stats.mean,
        variance: stats.variance,
        skewness: 0,  // Placeholder - could be calculated 
        kurtosis: 0   // Placeholder - could be calculated
      });
    } catch (error) {
      console.error("Error calculating analysis data:", error);
      
      // Type-safe error handling
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error("Unknown error type:", error);
      }
    }
  };
  
  // Calculate geometric and statistical data
  useEffect(() => {
    // Only calculate if simulation has data
    if (simulation && (simulation.isRunning || simulation.hasHistory)) {
      console.log("Triggering analysis data calculation");
      updateAnalysisData();
    } else {
      console.log("Simulation not running or no history, skipping analysis calculations");
    }
    
    // Add a console log showing the specific changes that triggered this effect
    console.log("Analysis calculation effect triggered by:", {
      refreshCounter,
      currentTime: simulation?.currentTime,
      isRunning: simulation?.isRunning,
      simulationChanged: true,
      hasHistory: simulation?.hasHistory
    });
  }, [simulation, refreshCounter, simulation?.currentTime, simulation?.isRunning, simulation?.hasHistory]);

  // Enhanced auto-refresh for simulation results
  useEffect(() => {
    console.log("Setting up enhanced refresh mechanism:", {
      isRunning,
      hasHistory,
      currentTime,
      simulationExists: !!simulation
    });
    
    // Create both interval-based and animation frame-based refresh
    let timer: number | null = null;
    let animationFrame: number | null = null;
    
    const refreshFunction = () => {
      // Only update if simulation still exists
      if (simulation) {
        // Check if simulation data has actually changed
        const newTime = simulation.currentTime;
        const newRunning = simulation.isRunning;
        
        console.log("Checking for simulation state changes:", {
          newTime,
          currentTimeInState: currentTime,
          newRunning,
          isRunningInState: isRunning
        });
        
        // Force update counter on any change to trigger recalculation
        if (newTime !== currentTime || newRunning !== isRunning) {
          console.log("Simulation state changed - forcing refresh");
          setRefreshCounter(prev => prev + 1);
          updateAnalysisData();
        }
        
        // Schedule next animation frame if still running
        if (newRunning) {
          animationFrame = requestAnimationFrame(refreshFunction);
        }
      }
    };
    
    if (isRunning) {
      // Initial calculation
      console.log("Simulation is running - performing initial calculation");
      updateAnalysisData();
      
      // Use both interval for guaranteed updates and animation frame for smooth updates
      
      // Interval-based polling as a fallback (at a lower frequency)
      timer = window.setInterval(() => {
        console.log("Interval timer triggered - checking state");
        setRefreshCounter(prev => prev + 1);
        updateAnalysisData();
      }, 1000); // Every second as a fallback
      
      // Animation frame for smooth, continuous updates
      animationFrame = requestAnimationFrame(refreshFunction);
      
      console.log("Enhanced refresh mechanism set up with both interval and animation frame");
    } else if (hasHistory) {
      // If not running but has history, calculate once
      console.log("Simulation not running but has history - performing one-time calculation");
      updateAnalysisData();
      
      // Even for non-running simulations, set up a slow polling interval
      // to catch any external state changes (e.g., from debug panel)
      timer = window.setInterval(() => {
        updateAnalysisData();
      }, 2000); // Every 2 seconds for history mode
    } else {
      console.log("Neither running nor has history - setting up minimal polling");
      
      // Even when no data exists, set up a very infrequent check
      // to detect when simulation becomes available
      timer = window.setInterval(() => {
        if (simulation?.isRunning || simulation?.hasHistory) {
          console.log("Simulation became available during polling");
          setRefreshCounter(prev => prev + 1);
          updateAnalysisData();
        }
      }, 3000); // Every 3 seconds when idle
    }
    
    return () => {
      // Clean up both timers
      if (timer !== null) {
        console.log("Cleaning up interval timer");
        window.clearInterval(timer);
      }
      
      if (animationFrame !== null) {
        console.log("Cleaning up animation frame");
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRunning, hasHistory, simulation]);

  // Enhanced data availability detection
  const hasAnyData = (() => {
    // Check multiple sources of data
    const fromRunningState = isRunning;
    const fromHistoryFlag = hasHistory;
    const fromConservationData = conservationData && conservationData.totalProbability > 0;
    const fromGeometricData = geometricData.totalVolume > 0;
    const fromStatisticsData = statisticsData.mean !== 0 || statisticsData.variance !== 0;
    
    // Check logs as a fallback
    const logsSession = simulationLogger.getCurrentSession();
    const fromLogs = logsSession && logsSession.results.length > 0;
    
    // Detailed logging of data sources
    console.log("Data source check:", {
      fromRunningState,
      fromHistoryFlag,
      fromConservationData,
      fromGeometricData,
      fromStatisticsData,
      fromLogs,
      conservationData,
      hasHistory,
      isRunning
    });
    
    return fromRunningState || fromHistoryFlag || fromConservationData || 
           fromGeometricData || fromStatisticsData || fromLogs;
  })();
  
  console.log("SimulationResultsPanel render:", {
    hasAnyData,
    isRunning,
    hasHistory,
    conservationData,
    geometricData,
    statisticsData,
    hasLogsData: (() => {
      const session = simulationLogger.getCurrentSession();
      const results = session?.results;
      return results && results.length > 0;
    })()
  });

  // No longer need to import debug view here since we have a dedicated panel
  
  if (!hasAnyData) {
    return (
      <div className="simulation-results-panel p-4 text-center text-gray-500">
        <FaChartLine className="mx-auto mb-3 text-3xl" />
        <p>Run simulation to see results</p>
        <p className="text-sm">Analysis will appear here after simulation starts</p>
        <p className="text-xs mt-4">For detailed diagnostic information, check the Debug Panel tab</p>
      </div>
    );
  }

  return (
    <div className="simulation-results-panel p-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Simulation Results</h3>
        <span className="text-sm font-mono">t={currentTime.toFixed(2)}</span>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          className={`text-xs px-3 py-1 rounded flex items-center ${
            activeTab === 'conservation' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('conservation')}
        >
          <FaChartPie className="mr-1" />
          Conservation
        </button>
        <button
          className={`text-xs px-3 py-1 rounded flex items-center ${
            activeTab === 'geometric' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('geometric')}
        >
          <FaRuler className="mr-1" />
          Geometric
        </button>
        <button
          className={`text-xs px-3 py-1 rounded flex items-center ${
            activeTab === 'statistics' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('statistics')}
        >
          <FaChartBar className="mr-1" />
          Statistics
        </button>
      </div>
      
      {activeTab === 'conservation' && (
        <div className="conservation-tab space-y-3">
          <CollapsibleSection title="Total Probability Conservation" defaultExpanded={true}>
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Current Value:</span>
                <span className={`font-mono text-sm ${
                  Math.abs(conservationData.totalProbability - 1) < 0.01 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {Number(conservationData.totalProbability).toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Variation:</span>
                <span className={`font-mono text-sm ${
                  conservationData.normVariation < 0.01 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {Number(conservationData.normVariation).toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Positivity:</span>
                <span className={`font-mono text-sm ${
                  conservationData.positivity 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {conservationData.positivity ? 'Preserved' : 'Violated'}
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>Ideal value is 1.0 with minimal variation over time.</p>
              <p>Quantum states should maintain positivity and normalization.</p>
            </div>
          </CollapsibleSection>
          
          <div className="border-t border-gray-200 my-3"></div>
          
          <CollapsibleSection title="Raw Conservation Data" defaultExpanded={false}>
            <RawDataDisplay 
              title="Conservation Laws" 
              data={conservationData}
              precision={8}
            />
            <div className="text-xs text-gray-600 mt-2">
              <p>Raw conservation values calculated from the simulation state.</p>
            </div>
          </CollapsibleSection>
          
          <div className="border border-gray-200 rounded">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium">Conservation Over Time</h4>
            </div>
            <div className="h-40 flex items-center justify-center bg-gray-100">
              {/* Chart validation - only try to render if we have valid data */}
              {simulation && hasHistory ? (
                <div className="w-full h-full p-2">
                  {/* Chart would be rendered here */}
                  {/* Using a text display as a fallback for now */}
                  <div className="text-xs bg-white p-2 rounded shadow border border-gray-200 h-full overflow-y-auto">
                    <div className="font-medium mb-1">Conservation Data:</div>
                    <div className="flex justify-between">
                      <span>Total Probability:</span>
                      <span className="font-mono">{conservationData.totalProbability.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variation:</span>
                      <span className="font-mono">{conservationData.normVariation.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={conservationData.positivity ? "text-green-500" : "text-red-500"}>
                        {conservationData.positivity ? "Valid" : "Violated"}
                      </span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500 italic">
                        Using fallback display - chart visualization in progress
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-500 block">
                    {!simulation ? "Simulation not available" : 
                     !hasHistory ? "No historical data available yet" : 
                     "Chart will appear here"}
                  </span>
                  <button
                    className="mt-2 text-xs text-blue-600 underline"
                    onClick={() => {
                      console.log("Forcing visualization update for conservation chart");
                      setRefreshCounter(prev => prev + 1);
                    }}
                  >
                    Force Update
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'geometric' && (
        <div className="geometric-tab space-y-3">
          <CollapsibleSection title="Geometric Properties" defaultExpanded={true}>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Total Volume</h4>
                <div className="text-lg font-mono text-center">
                  {geometricData.totalVolume.toFixed(4)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Total Area</h4>
                <div className="text-lg font-mono text-center">
                  {geometricData.totalArea.toFixed(4)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Effective Dimension</h4>
                <div className="text-lg font-mono text-center">
                  {geometricData.effectiveDimension.toFixed(4)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Volume Entropy</h4>
                <div className="text-lg font-mono text-center">
                  {geometricData.volumeEntropy.toFixed(4)}
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex items-center space-x-2 text-xs text-blue-600">
              <FaInfoCircle />
              <span>These values represent quantum geometric properties of the network state</span>
            </div>
          </CollapsibleSection>
          
          <div className="border-t border-gray-200 my-3"></div>
          
          <CollapsibleSection title="Raw Geometric Data" defaultExpanded={false}>
            <RawDataDisplay 
              title="Geometric Properties" 
              data={geometricData}
              precision={6}
            />
            
            <div className="text-xs text-gray-600 mt-2">
              <p>The raw data shows numeric values without visualizations. This is helpful when charts are not displaying properly.</p>
            </div>
          </CollapsibleSection>
          
          <div className="border border-gray-200 rounded">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium">Dimension Analysis</h4>
            </div>
            <div className="h-40 flex items-center justify-center bg-gray-100">
              {/* Chart validation - only try to render if we have valid data */}
              {simulation && geometricData.totalVolume > 0 ? (
                <div className="w-full h-full p-2">
                  {/* Chart would be rendered here */}
                  {/* Using a text display as a fallback for now */}
                  <div className="text-xs bg-white p-2 rounded shadow border border-gray-200 h-full overflow-y-auto">
                    <div className="font-medium mb-1">Dimension Analysis:</div>
                    <div className="flex justify-between">
                      <span>Total Volume:</span>
                      <span className="font-mono">{geometricData.totalVolume.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume Entropy:</span>
                      <span className="font-mono">{geometricData.volumeEntropy.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Area:</span>
                      <span className="font-mono">{geometricData.totalArea.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effective Dimension:</span>
                      <span className="font-mono">{geometricData.effectiveDimension.toFixed(6)}</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500 italic">
                        Using fallback display - chart visualization in progress
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-500 block">
                    {!simulation ? "Simulation not available" : 
                     geometricData.totalVolume <= 0 ? "No geometric data available yet" : 
                     "Chart will appear here"}
                  </span>
                  <button
                    className="mt-2 text-xs text-blue-600 underline"
                    onClick={() => {
                      console.log("Forcing visualization update for dimension analysis");
                      setRefreshCounter(prev => prev + 1);
                    }}
                  >
                    Force Update
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'statistics' && (
        <div className="statistics-tab space-y-3">
          <CollapsibleSection title="Distribution Statistics" defaultExpanded={true}>
            <div className="bg-gray-50 p-3 rounded">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <h4 className="text-xs text-gray-500">Mean</h4>
                  <div className="font-mono">{statisticsData.mean.toFixed(4)}</div>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500">Variance</h4>
                  <div className="font-mono">{statisticsData.variance.toFixed(4)}</div>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500">Skewness</h4>
                  <div className="font-mono">{statisticsData.skewness.toFixed(4)}</div>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500">Kurtosis</h4>
                  <div className="font-mono">{statisticsData.kurtosis.toFixed(4)}</div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>Statistics describe the distribution of the quantum state across the network.</p>
            </div>
          </CollapsibleSection>
          
          <div className="border-t border-gray-200 my-3"></div>
          
          <CollapsibleSection title="Raw Statistics Data" defaultExpanded={false}>
            <RawDataDisplay 
              title="Statistical Metrics" 
              data={statisticsData}
              precision={6}
            />
            <div className="text-xs text-gray-600 mt-2">
              <p>Raw statistical values calculated from the current quantum state.</p>
            </div>
          </CollapsibleSection>
          
          <div className="border border-gray-200 rounded">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium">State Distribution</h4>
            </div>
            <div className="h-40 flex items-center justify-center bg-gray-100">
              {/* Chart validation - only try to render if we have valid data */}
              {simulation && statisticsData.mean !== 0 ? (
                <div className="w-full h-full p-2">
                  {/* Histogram would be rendered here */}
                  {/* Using a text display as a fallback for now */}
                  <div className="text-xs bg-white p-2 rounded shadow border border-gray-200 h-full overflow-y-auto">
                    <div className="font-medium mb-1">State Distribution:</div>
                    <div className="flex justify-between">
                      <span>Mean:</span>
                      <span className="font-mono">{statisticsData.mean.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variance:</span>
                      <span className="font-mono">{statisticsData.variance.toFixed(6)}</span>
                    </div>
                    {simulation?.getCurrentState && (
                      <div className="mt-2">
                        <div className="font-medium mb-1">Node Value Distribution:</div>
                        <div className="bg-gray-100 p-1 rounded">
                          {(() => {
                            try {
                              const state = simulation.getCurrentState();
                              if (state && state.nodeIds && state.nodeIds.length > 0) {
                                // Sample a few values for display
                                const sampleSize = Math.min(5, state.nodeIds.length);
                                const samples = state.nodeIds.slice(0, sampleSize);
                                
                                return (
                                  <div>
                                    {samples.map(nodeId => (
                                      <div key={nodeId} className="flex justify-between">
                                        <span>{nodeId}:</span>
                                        <span>{state.getValue(nodeId).toFixed(4)}</span>
                                      </div>
                                    ))}
                                    {state.nodeIds.length > sampleSize && (
                                      <div className="text-gray-500 text-center mt-1">
                                        +{state.nodeIds.length - sampleSize} more nodes
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return <div className="text-gray-500">No node values available</div>;
                            } catch (error) {
                              console.error("Error retrieving node values:", error);
                              return <div className="text-red-500">Error retrieving node values</div>;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500 italic">
                        Using fallback display - histogram visualization in progress
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-500 block">
                    {!simulation ? "Simulation not available" : 
                     statisticsData.mean === 0 ? "No statistical data available yet" : 
                     "Histogram will appear here"}
                  </span>
                  <button
                    className="mt-2 text-xs text-blue-600 underline"
                    onClick={() => {
                      console.log("Forcing visualization update for state distribution");
                      setRefreshCounter(prev => prev + 1);
                    }}
                  >
                    Force Update
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="border border-gray-200 rounded mt-3">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium">Time Evolution</h4>
            </div>
            <div className="h-40 flex items-center justify-center bg-gray-100">
              {/* Chart validation - only try to render if we have valid data */}
              {simulation && hasHistory ? (
                <div className="w-full h-full p-2">
                  {/* Time evolution chart would be rendered here */}
                  {/* Using a text display as a fallback for now */}
                  <div className="text-xs bg-white p-2 rounded shadow border border-gray-200 h-full overflow-y-auto">
                    <div className="font-medium mb-1">Time Evolution:</div>
                    <div className="flex justify-between">
                      <span>Current Time:</span>
                      <span className="font-mono">{currentTime.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Mean:</span>
                      <span className="font-mono">{statisticsData.mean.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Variance:</span>
                      <span className="font-mono">{statisticsData.variance.toFixed(4)}</span>
                    </div>
                    <div className="mt-2 font-medium">Time Points:</div>
                    {(() => {
                      try {
                        if (simulation.getHistory && typeof simulation.getHistory === 'function') {
                          const history = simulation.getHistory();
                          const times = history.getTimes();
                          
                          if (times && times.length > 0) {
                            // Just show a few time points
                            const sampleSize = Math.min(5, times.length);
                            const samples = times.slice(-sampleSize); // Show most recent
                            
                            return (
                              <div className="bg-gray-100 p-1 rounded">
                                {samples.map((t, index) => (
                                  <div key={index} className="flex justify-between">
                                    <span>t{index}:</span>
                                    <span>{t.toFixed(4)}</span>
                                  </div>
                                ))}
                                {times.length > sampleSize && (
                                  <div className="text-gray-500 text-center mt-1">
                                    +{times.length - sampleSize} more time points
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return <div className="text-gray-500">No time points available</div>;
                        }
                        return <div className="text-gray-500">History function not available</div>;
                      } catch (error) {
                        console.error("Error retrieving time points:", error);
                        return <div className="text-red-500">Error retrieving time points</div>;
                      }
                    })()}
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500 italic">
                        Using fallback display - time evolution visualization in progress
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-sm text-gray-500 block">
                    {!simulation ? "Simulation not available" : 
                     !hasHistory ? "No historical data available yet" : 
                     "Line chart will appear here"}
                  </span>
                  <button
                    className="mt-2 text-xs text-blue-600 underline"
                    onClick={() => {
                      console.log("Forcing visualization update for time evolution");
                      setRefreshCounter(prev => prev + 1);
                    }}
                  >
                    Force Update
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationResultsPanel;