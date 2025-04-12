import React, { useState, useEffect } from 'react';
import { FaChartBar, FaChartPie, FaChartLine, FaRuler, FaInfoCircle } from 'react-icons/fa';
import CollapsibleSection from '../common/CollapsibleSection';
import { useSimulation } from '../../hooks/useSimulation';
import { SpinNetworkGeometryCalculator } from '../../simulation/analysis/geometricProps';
import { SimulationAnalyzer } from '../../simulation/analysis/statistics';
import RawDataDisplay from './RawDataDisplay';

const SimulationResultsPanel: React.FC = () => {
  // Handle undefined values from useSimulation gracefully
  const simulation = useSimulation();
  const currentTime = simulation?.currentTime || 0;
  const hasHistory = simulation?.hasHistory || false;
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
  
  // Get conservation data from simulation
  const conservationData = simulation.getConservationLaws 
    ? simulation.getConservationLaws() 
    : {
        totalProbability: 0,
        positivity: false,
        normVariation: 0,
      };
  
  // Helper function to safely update analysis data
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
      
      // Validate data is usable
      if (!currentState || !graph) {
        console.warn("Missing state or graph for analysis calculations");
        return;
      }
      
      if (currentState.size === 0) {
        console.warn("Current state has zero size, skipping analysis");
        return;
      }
      
      if (graph.nodes.length === 0) {
        console.warn("Graph has zero nodes, skipping analysis");
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
  }, [simulation, refreshCounter, simulation.currentTime, simulation.isRunning]);

  // Auto-refresh component when simulation is running
  useEffect(() => {
    console.log("Setting up refresh timer:", {
      isRunning,
      hasHistory,
      currentTime,
      simulationExists: !!simulation
    });
    
    let timer: number | null = null;
    
    if (isRunning) {
      // Initial calculation
      console.log("Simulation is running - performing initial calculation");
      updateAnalysisData();
      
      // Set up timer for regular updates
      timer = window.setInterval(() => {
        setRefreshCounter(prev => prev + 1);
        console.log("Refresh timer triggered - updating analysis data", {
          currentTime: simulation?.currentTime,
          isStillRunning: simulation?.isRunning
        });
        
        // Force update analysis data
        updateAnalysisData();
      }, 500); // Refresh more frequently (twice per second)
      
      console.log("Refresh timer set up with interval of 500ms");
    } else if (hasHistory) {
      // If not running but has history, calculate once
      console.log("Simulation not running but has history - performing one-time calculation");
      updateAnalysisData();
    } else {
      console.log("Neither running nor has history - no calculations performed");
    }
    
    return () => {
      if (timer !== null) {
        console.log("Cleaning up refresh timer");
        window.clearInterval(timer);
      }
    };
  }, [isRunning, hasHistory, simulation?.currentTime]);

  // Check if we have any meaningful data to display
  const hasAnyData = isRunning || hasHistory || 
                    (conservationData && conservationData.totalProbability > 0) ||
                    geometricData.totalVolume > 0;
  
  console.log("SimulationResultsPanel render:", { 
    hasAnyData, 
    isRunning, 
    hasHistory, 
    conservationData,
    geometricData,
    statisticsData
  });

  // Import the debug view
  const SimulationDebugView = React.lazy(() => import('./SimulationDebugView'));
  
  // State to control showing debug view
  const [showDebugView, setShowDebugView] = useState(false);
  
  if (!hasAnyData) {
    return (
      <div className="simulation-results-panel p-4 text-center text-gray-500">
        <FaChartLine className="mx-auto mb-3 text-3xl" />
        <p>Run simulation to see results</p>
        <p className="text-sm">Analysis will appear here after simulation starts</p>
        
        {/* Developer debug button */}
        <button 
          className="mt-4 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          onClick={() => setShowDebugView(!showDebugView)}
        >
          {showDebugView ? "Hide Debug Data" : "Show Debug Data"}
        </button>
        
        {/* Show debug view if enabled */}
        {showDebugView && (
          <React.Suspense fallback={<div>Loading debug view...</div>}>
            <div className="mt-4">
              <SimulationDebugView />
            </div>
          </React.Suspense>
        )}
      </div>
    );
  }

  return (
    <div className="simulation-results-panel p-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Simulation Results</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-mono">t={currentTime.toFixed(2)}</span>
          
          {/* Developer debug toggle button */}
          <button 
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            onClick={() => setShowDebugView(!showDebugView)}
          >
            {showDebugView ? "Hide Debug" : "Debug"}
          </button>
        </div>
      </div>
      
      {/* Show debug view if enabled */}
      {showDebugView && (
        <React.Suspense fallback={<div>Loading debug view...</div>}>
          <SimulationDebugView />
        </React.Suspense>
      )}
      
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
              <div className="text-center">
                <span className="text-sm text-gray-500 block">Chart will appear here</span>
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
              <div className="text-center">
                <span className="text-sm text-gray-500 block">Chart will appear here</span>
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
              <div className="text-center">
                <span className="text-sm text-gray-500 block">Histogram will appear here</span>
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
            </div>
          </div>
          
          <div className="border border-gray-200 rounded mt-3">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium">Time Evolution</h4>
            </div>
            <div className="h-40 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <span className="text-sm text-gray-500 block">Line chart will appear here</span>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationResultsPanel;