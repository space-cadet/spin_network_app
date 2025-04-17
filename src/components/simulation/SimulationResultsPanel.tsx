import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FaChartBar, FaChartPie, FaChartLine, FaRuler, FaInfoCircle } from 'react-icons/fa';
import CollapsibleSection from '../common/CollapsibleSection';
import { useReduxSimulation } from '../../hooks/useReduxSimulation';
import { SpinNetworkGeometryCalculator } from '../../simulation/analysis/geometricProps';
import { SimulationAnalyzer } from '../../simulation/analysis/statistics';
import { simulationLogger } from '../../simulation/core/simulationLogger';
import RawDataDisplay from './RawDataDisplay';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// Define type interfaces for the simulation state objects
interface ConservationState {
  totalProbability: number;
  normVariation: number;
  positivity: boolean; // Ensure positivity is explicitly defined as boolean
  [key: string]: string | number | boolean;
}

interface GeometricState {
  totalVolume: number;
  totalArea: number;
  effectiveDimension: number;
  volumeEntropy: number;
  [key: string]: string | number | boolean;
}

interface StatisticsState {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  [key: string]: string | number | boolean;
}

// Time points display component to prevent render loops
interface TimePointsDisplayProps {
  simulation: {
    getHistory?: () => any;
    // Add other properties as needed
  };
}

const TimePointsDisplay = React.memo(({ simulation }: TimePointsDisplayProps) => {
  // Use a ref to store the last fetched times to avoid re-rendering on every check
  const timePointsRef = useRef<Array<number>>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  
  // Effect to update the time points data periodically
  useEffect(() => {
    const updateTimePoints = () => {
      if (simulation?.getHistory && typeof simulation.getHistory === 'function') {
        try {
          const history = simulation.getHistory();
          const times = history.getTimes();
          if (times && times.length > 0) {
            timePointsRef.current = times;
            setLastUpdateTime(Date.now());
          }
        } catch (error) {
          console.error("Error retrieving time points:", error);
        }
      }
    };
    
    // Update immediately
    updateTimePoints();
    
    // Then set up an interval for periodic updates
    const interval = setInterval(updateTimePoints, 1000);
    
    return () => clearInterval(interval);
  }, [simulation]);
  
  // Render the time points display
  const times = timePointsRef.current;
  
  if (!simulation?.getHistory || typeof simulation.getHistory !== 'function') {
    return <div className="text-gray-500">History function not available</div>;
  }
  
  if (!times || times.length === 0) {
    return <div className="text-gray-500">No time points available</div>;
  }
  
  // Show a sample of the most recent time points
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
});

const SimulationResultsPanel: React.FC = () => {
  // Get simulation from Redux-integrated hook
  const simulation = useReduxSimulation();
  
  // Get simulation state directly from Redux
  const { currentTime, isRunning, hasHistory, geometricData, statisticsData, conservationData } = useSelector(
    (state: RootState) => ({
      currentTime: state.simulation.currentTime,
      isRunning: state.simulation.isRunning === true, // Ensure boolean with default
      hasHistory: state.simulation.hasHistory === true ? true : false, // Explicitly convert to boolean
      geometricData: state.simulation.geometricData as GeometricState,
      statisticsData: state.simulation.statisticsData as StatisticsState,
      conservationData: state.simulation.conservationData as ConservationState
    })
  );
  
  // Use a local state for active tab to avoid too many Redux updates for UI
  const [activeTab, setActiveTab] = useState<'conservation' | 'geometric' | 'statistics'>('conservation');
  const [refreshCounter, setRefreshCounter] = useState(0); // Used to force re-renders
  
  // Create refs for time tracking at the top level
  const loggingTimeRef = useRef<number>(0);
  const renderTimeRef = useRef<number>(0);
  
  // Enhanced logging to debug simulation data flow - but only once per second
  useEffect(() => {
    const now = Date.now();
    
    // Only log every second to prevent console flood
    if (now - loggingTimeRef.current > 1000) {
      console.log("useReduxSimulation hook and Redux state:", {
        currentTime,
        hasHistory,
        isRunning,
        hasGetGraph: typeof simulation?.getGraph === 'function',
        hasGetCurrentState: typeof simulation?.getCurrentState === 'function',
        geometricData,
        statisticsData,
        conservationData
      });
      
      loggingTimeRef.current = now;
    }
  }, [
    currentTime, hasHistory, isRunning, 
    simulation, geometricData, statisticsData, conservationData
  ]);
  
  // Inspect actual graph and state data - but only once per render
  useEffect(() => {
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
  }, [simulation]);
  
  // Effect to log when component mounts or refreshes
  useEffect(() => {
    console.log("SimulationResultsPanel mounted/refreshed - using Redux data:", {
      geometricData,
      statisticsData,
      conservationData
    });
  }, [geometricData, statisticsData, conservationData]);
  
  // Force refresh function that will cause Redux to update by forcing a data sync
  const forceDataRefresh = useCallback(() => {
    console.log("Force refresh requested");
    setRefreshCounter(prev => prev + 1);
  }, []);
  
  // Minimal refresh effect that connects refresh counter to Redux sync
  useEffect(() => {
    if (refreshCounter > 0 && simulation) {
      // The useReduxSimulation hook already handles syncing data to Redux
      console.log("Refresh counter incremented, data sync should occur in the hook");
    }
  }, [refreshCounter, simulation]);

  // Enhanced data availability detection with more robust checks - now using Redux state
  const hasAnyData = (() => {
    // Function to check if a value is valid and non-zero
    const isValidData = (value: any): boolean => {
      return value !== null && value !== undefined && Number.isFinite(value) && value !== 0;
    };
    
    // Check multiple sources of data with more robust validation
    const fromRunningState = isRunning;
    const fromHistoryFlag = hasHistory;
    
    // Check conservation data with validation
    const fromConservationData = conservationData && 
                                 Number.isFinite(conservationData.totalProbability) && 
                                 conservationData.totalProbability > 0;
    
    // Check geometric data with validation for each property
    const fromGeometricData = isValidData(geometricData.totalVolume) || 
                              isValidData(geometricData.totalArea) || 
                              isValidData(geometricData.effectiveDimension) || 
                              isValidData(geometricData.volumeEntropy);
    
    // Check statistics data with validation for each property
    const fromStatisticsData = isValidData(statisticsData.mean) || 
                               isValidData(statisticsData.variance) || 
                               isValidData(statisticsData.skewness) || 
                               isValidData(statisticsData.kurtosis);
    
    // Logs check is still a good fallback even with Redux
    let fromLogs = false;
    try {
      const logsSession = simulationLogger.getCurrentSession();
      if (logsSession && Array.isArray(logsSession.results) && logsSession.results.length > 0) {
        const latestResult = logsSession.results[logsSession.results.length - 1];
        fromLogs = Boolean(latestResult !== undefined && latestResult !== null && (
          (latestResult.conservation && Number.isFinite(latestResult.conservation.totalProbability)) ||
          (latestResult.geometric && isValidData(latestResult.geometric.totalVolume)) ||
          (latestResult.statistics && isValidData(latestResult.statistics.mean))
        ));
      }
    } catch (error) {
      console.error("Error checking log data:", error);
    }
    
    // Log debug information - but store in a ref instead of logging every render
    const dataSourceInfo = {
      fromRunningState,
      fromHistoryFlag,
      fromConservationData,
      fromGeometricData,
      fromStatisticsData,
      fromLogs,
      conservationData,
      geometricData,
      statisticsData,
      hasHistory,
      isRunning
    };
    
    // Store in component instance instead of logging on every render
    // This can be accessed in dev tools for debugging
    (window as any).__dataSourceInfo = dataSourceInfo;
    
    return fromRunningState || fromHistoryFlag || fromConservationData || 
           fromGeometricData || fromStatisticsData || fromLogs;
  })();
  
  // Store render info in a ref for debugging instead of logging on every render
  useEffect(() => {
    // Store in component instance for debugging in dev tools
    (window as any).__simulationResultsInfo = {
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
    };
    
    // Only log once per second to prevent console flood
    const now = Date.now();
    
    if (now - renderTimeRef.current > 1000) {
      console.log("SimulationResultsPanel render state updated");
      renderTimeRef.current = now;
    }
  }, [
    hasAnyData, isRunning, hasHistory, 
    conservationData, geometricData, statisticsData
  ]);

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
                                    {samples.map((nodeId: string) => (
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
                    {/* Use memoized time points data to prevent render loops */}
                    <TimePointsDisplay simulation={simulation} />
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