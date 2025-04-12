import React, { useState, useEffect } from 'react';
import { FaBug, FaSync } from 'react-icons/fa';
import { useSimulation } from '../../hooks/useSimulation';
import CollapsibleSection from '../common/CollapsibleSection';

/**
 * Dedicated debug panel for simulation data
 * Shows detailed diagnostic information about the simulation state
 */
const SimulationDebugPanel: React.FC = () => {
  const simulation = useSimulation();
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    if (refreshInterval) {
      // Clear existing interval
      window.clearInterval(refreshInterval);
      setRefreshInterval(null);
    } else {
      // Set new interval to refresh every 2 seconds
      const intervalId = window.setInterval(() => {
        setRefreshCounter(prev => prev + 1);
      }, 2000);
      setRefreshInterval(intervalId);
    }
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        window.clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);
  
  // Trigger manual refresh
  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  // Get simulation status
  const debugData = {
    hasSimulation: !!simulation,
    isRunning: simulation?.isRunning || false,
    currentTime: simulation?.currentTime || 0,
    hasHistory: simulation?.hasHistory || false,
    refreshCount: refreshCounter
  };
  
  // Get method existence info
  const methodInfo = {
    hasGetGraph: typeof simulation?.getGraph === 'function',
    hasGetCurrentState: typeof simulation?.getCurrentState === 'function',
    hasConservationLaws: typeof simulation?.getConservationLaws === 'function',
    hasGetVisualizationState: typeof simulation?.getVisualizationState === 'function'
  };
  
  // Try to get actual data if methods exist
  let graphData = null;
  let stateData = null;
  let conservationData = null;
  
  if (simulation?.getGraph) {
    try {
      const graph = simulation.getGraph();
      graphData = {
        exists: !!graph,
        nodeCount: graph?.nodes.length || 0,
        edgeCount: graph?.edges.length || 0,
        firstNodeId: graph?.nodes[0]?.id || 'none'
      };
    } catch (error) {
      graphData = { error: "Error fetching graph data" };
    }
  }
  
  if (simulation?.getCurrentState) {
    try {
      const state = simulation.getCurrentState();
      
      // Create sample values object first
      let sampleValues: Record<string, number> = {};
      
      // Sample a few values if available
      if (state && state.size > 0) {
        const sampleCount = Math.min(3, state.nodeIds.length);
        
        for (let i = 0; i < sampleCount; i++) {
          const nodeId = state.nodeIds[i];
          sampleValues[nodeId] = state.getValue(nodeId);
        }
      }
      
      // Then create the state data object with all properties
      stateData = {
        exists: !!state,
        size: state?.size || 0,
        nodeIds: state?.nodeIds?.slice(0, 3) || [], // Just get first 3 to avoid clutter
        hasValues: state && state.size > 0,
        sampleValues: sampleValues
      };
    } catch (error) {
      stateData = { error: "Error fetching state data" };
    }
  }
  
  if (simulation?.getConservationLaws) {
    try {
      conservationData = simulation.getConservationLaws();
    } catch (error) {
      conservationData = { error: "Error fetching conservation laws" };
    }
  }
  
  return (
    <div className="simulation-debug-panel p-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaBug className="text-yellow-500 mr-2" />
          <h3 className="text-lg font-medium">Simulation Debug Panel</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            className={`px-3 py-1 text-xs rounded flex items-center ${
              refreshInterval ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}
            onClick={toggleAutoRefresh}
          >
            <FaSync className={`mr-1 ${refreshInterval ? 'animate-spin' : ''}`} />
            {refreshInterval ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </button>
          
          <button
            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            onClick={handleRefresh}
          >
            Refresh Now
          </button>
          
          <span className="text-xs text-gray-500">Refresh count: {refreshCounter}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <CollapsibleSection title="Simulation Status" defaultExpanded={true}>
          <div className="bg-gray-50 p-3 rounded">
            <pre className="text-xs overflow-auto">{JSON.stringify(debugData, null, 2)}</pre>
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Simulation Methods" defaultExpanded={true}>
          <div className="bg-gray-50 p-3 rounded">
            <pre className="text-xs overflow-auto">{JSON.stringify(methodInfo, null, 2)}</pre>
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Graph Data" defaultExpanded={true}>
          <div className="bg-gray-50 p-3 rounded">
            <pre className="text-xs overflow-auto">{JSON.stringify(graphData, null, 2)}</pre>
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="State Data" defaultExpanded={true}>
          <div className="bg-gray-50 p-3 rounded">
            <pre className="text-xs overflow-auto">{JSON.stringify(stateData, null, 2)}</pre>
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Conservation Laws" defaultExpanded={true} className="col-span-2">
          <div className="bg-gray-50 p-3 rounded">
            <pre className="text-xs overflow-auto">{JSON.stringify(conservationData, null, 2)}</pre>
          </div>
        </CollapsibleSection>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
        <p className="font-medium">Debug Information</p>
        <p className="text-xs mt-1">
          This panel shows raw data from the simulation engine. Use it to diagnose issues with 
          visualization or data flow. Click "Refresh Now" to update the data manually or enable 
          "Auto-Refresh" to update every 2 seconds.
        </p>
      </div>
    </div>
  );
};

export default SimulationDebugPanel;