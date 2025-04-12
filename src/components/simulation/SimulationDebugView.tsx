import React from 'react';
import { useSimulation } from '../../hooks/useSimulation';

/**
 * Debug component to display raw simulation data
 * Used for troubleshooting when results aren't displayed properly
 */
const SimulationDebugView: React.FC = () => {
  const simulation = useSimulation();
  
  // Get raw data from simulation
  const debugData = {
    hasSimulation: !!simulation,
    isRunning: simulation?.isRunning || false,
    currentTime: simulation?.currentTime || 0,
    hasHistory: simulation?.hasHistory || false,
    hasGetGraph: typeof simulation?.getGraph === 'function',
    hasGetCurrentState: typeof simulation?.getCurrentState === 'function',
    hasConservationLaws: typeof simulation?.getConservationLaws === 'function',
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
        edgeCount: graph?.edges.length || 0
      };
    } catch (error) {
      graphData = { error: "Error fetching graph data" };
    }
  }
  
  if (simulation?.getCurrentState) {
    try {
      const state = simulation.getCurrentState();
      stateData = {
        exists: !!state,
        size: state?.size || 0,
        nodeIds: state?.nodeIds?.slice(0, 5) || [] // Just get first 5 to avoid clutter
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
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">Simulation Debug Data</h3>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white p-2 rounded shadow-sm">
          <h4 className="font-medium text-xs mb-1 text-gray-700">Simulation Status</h4>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-2 rounded shadow-sm">
          <h4 className="font-medium text-xs mb-1 text-gray-700">Graph Data</h4>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(graphData, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-2 rounded shadow-sm">
          <h4 className="font-medium text-xs mb-1 text-gray-700">State Data</h4>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(stateData, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-2 rounded shadow-sm">
          <h4 className="font-medium text-xs mb-1 text-gray-700">Conservation Laws</h4>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(conservationData, null, 2)}
          </pre>
        </div>
      </div>
      
      <p className="text-xs text-yellow-700 mt-3">
        This debug view shows the raw data from the simulation engine. If you see data here but not in the visualizations,
        there may be an issue with how the data is being processed or displayed.
      </p>
    </div>
  );
};

export default SimulationDebugView;
