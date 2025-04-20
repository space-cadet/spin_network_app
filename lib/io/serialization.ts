/**
 * Serialization utilities for simulation data
 */

import { SimulationEngine, SimulationGraph, StateVector } from '../core/types';
import { SerializedSimulation, ExportOptions, ExportFormat } from './types';

// Current version of the serialization format
const FORMAT_VERSION = '1.0.0';

/**
 * Default export options
 */
const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: ExportFormat.JSON,
  includeGraph: true,
  includeParameters: true,
  includeHistory: true,
  includeGeometricProperties: true,
  includeStatistics: true,
  historyInterval: 1,
  precision: 6
};

/**
 * Serializes a simulation to a standard format
 * 
 * @param engine Simulation engine to serialize
 * @param options Export options
 * @returns Serialized simulation data
 */
export function serializeSimulation(
  engine: SimulationEngine,
  options: Partial<ExportOptions> = {}
): SerializedSimulation {
  // Merge default options with provided options
  const fullOptions: ExportOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  
  // Check if engine has required methods
  const engineImpl = engine as any;
  if (!engineImpl.getGraph || !engineImpl.getParameters || !engineImpl.getHistory) {
    throw new Error('Simulation engine does not support serialization');
  }
  
  // Create serialized data structure
  const serialized: SerializedSimulation = {
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    metadata: {
      totalTime: engine.getCurrentTime(),
      nodeCount: engineImpl.getGraph().getNodeCount(),
      edgeCount: engineImpl.getGraph().getEdgeCount()
    }
  };
  
  // Include parameters if requested
  if (fullOptions.includeParameters) {
    serialized.parameters = { ...engineImpl.getParameters() };
  }
  
  // Include graph if requested
  if (fullOptions.includeGraph) {
    const graph = engineImpl.getGraph();
    serialized.graph = serializeGraph(graph);
  }
  
  // Include history if requested
  if (fullOptions.includeHistory) {
    const history = engineImpl.getHistory();
    const times = history.getTimes();
    const states = history.getStates();
    
    // Apply history interval and max history states if specified
    let filteredTimes = times;
    let filteredStates = states;
    
    if (fullOptions.historyInterval && fullOptions.historyInterval > 1) {
      filteredTimes = times.filter((_, index) => index % fullOptions.historyInterval! === 0);
      filteredStates = states.filter((_, index) => index % fullOptions.historyInterval! === 0);
    }
    
    if (fullOptions.maxHistoryStates && filteredTimes.length > fullOptions.maxHistoryStates) {
      // Calculate sampling step to get approximately maxHistoryStates
      const step = Math.ceil(filteredTimes.length / fullOptions.maxHistoryStates);
      filteredTimes = filteredTimes.filter((_, index) => index % step === 0);
      filteredStates = filteredStates.filter((_, index) => index % step === 0);
    }
    
    serialized.history = {
      times: filteredTimes,
      states: filteredStates.map(state => ({
        nodeIds: state.nodeIds,
        values: state.toArray().map(v => roundToPrecision(v, fullOptions.precision!))
      }))
    };
  }
  
  // Include geometric properties if requested
  if (fullOptions.includeGeometricProperties && engineImpl.getGeometricProperties) {
    const geoProps = engineImpl.getGeometricProperties();
    if (geoProps) {
      serialized.geometricProperties = geoProps.map(prop => ({
        time: prop.time,
        properties: Object.fromEntries(
          Object.entries(prop.properties).map(([key, value]) => 
            [key, roundToPrecision(value as number, fullOptions.precision!)]
          )
        )
      }));
    }
  }
  
  // Include statistics if requested
  if (fullOptions.includeStatistics && engineImpl.getStatistics) {
    const stats = engineImpl.getStatistics();
    if (stats) {
      serialized.statistics = stats.map(stat => ({
        time: stat.time,
        statistics: Object.fromEntries(
          Object.entries(stat.statistics).map(([key, value]) => 
            [key, roundToPrecision(value as number, fullOptions.precision!)]
          )
        )
      }));
    }
  }
  
  return serialized;
}

/**
 * Serializes a graph to a standard format
 * 
 * @param graph Graph to serialize
 * @returns Serialized graph data
 */
export function serializeGraph(graph: SimulationGraph): { nodes: any[], edges: any[] } {
  return {
    nodes: graph.nodes.map(node => ({
      ...node
    })),
    edges: graph.edges.map(edge => ({
      ...edge
    }))
  };
}

/**
 * Deserializes a simulation from serialized data
 * 
 * @param data Serialized simulation data
 * @param engineFactory Factory function to create a new simulation engine
 * @returns Deserialized simulation engine
 */
export function deserializeSimulation(
  data: SerializedSimulation,
  engineFactory: () => SimulationEngine
): SimulationEngine {
  // Check data version
  if (!data.version) {
    throw new Error('Invalid serialized data: missing version');
  }
  
  // Create a new engine
  const engine = engineFactory();
  const engineImpl = engine as any;
  
  // Check if engine supports deserialization
  if (!engineImpl.setGraph || !engineImpl.initialize) {
    throw new Error('Simulation engine does not support deserialization');
  }
  
  // Restore graph if available
  if (data.graph) {
    const graph = deserializeGraph(data.graph, engineImpl.createGraph());
    engineImpl.setGraph(graph);
  }
  
  // Restore parameters if available
  if (data.parameters) {
    engineImpl.initialize(engineImpl.getGraph(), data.parameters);
  }
  
  // Restore history if available
  if (data.history && engineImpl.setHistory) {
    import('../core/types').then(types => {
      const { SimulationStateVector } = types;
      
      const stateVectors = data.history!.states.map(state => {
        return new SimulationStateVector(state.nodeIds, state.values);
      });
      
      engineImpl.setHistory(data.history!.times, stateVectors);
      
      // Set current state to the last state in history
      if (stateVectors.length > 0 && engineImpl.setCurrentState) {
        engineImpl.setCurrentState(stateVectors[stateVectors.length - 1]);
      }
    }).catch(err => {
      console.error('Failed to load SimulationStateVector type:', err);
    });
  }
  
  return engine;
}

/**
 * Deserializes a graph from serialized data
 * 
 * @param data Serialized graph data
 * @param graphFactory Factory function to create a new graph
 * @returns Deserialized graph
 */
export function deserializeGraph(
  data: { nodes: any[], edges: any[] },
  graphFactory: () => SimulationGraph
): SimulationGraph {
  let graph = graphFactory();
  
  // Add nodes
  for (const node of data.nodes) {
    graph = graph.addNode(node);
  }
  
  // Add edges
  for (const edge of data.edges) {
    graph = graph.addEdge(edge);
  }
  
  return graph;
}

/**
 * Rounds a number to a specified precision
 * 
 * @param value Number to round
 * @param precision Number of decimal places
 * @returns Rounded number
 */
function roundToPrecision(value: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

/**
 * Converts serialized simulation data to CSV format
 * 
 * @param data Serialized simulation data
 * @param options Export options
 * @returns CSV string
 */
export function convertToCSV(data: SerializedSimulation, options: Partial<ExportOptions> = {}): string {
  const fullOptions: ExportOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  
  if (!data.history || data.history.states.length === 0) {
    throw new Error('No simulation history data to export as CSV');
  }
  
  const lines: string[] = [];
  
  // Create header
  const firstState = data.history.states[0];
  const headers = ['time', ...firstState.nodeIds];
  
  // Add geometric properties to header if included
  if (fullOptions.includeGeometricProperties && data.geometricProperties && data.geometricProperties.length > 0) {
    const geoProps = Object.keys(data.geometricProperties[0].properties);
    headers.push(...geoProps);
  }
  
  // Add statistics to header if included
  if (fullOptions.includeStatistics && data.statistics && data.statistics.length > 0) {
    const stats = Object.keys(data.statistics[0].statistics);
    headers.push(...stats);
  }
  
  lines.push(headers.join(','));
  
  // Add data rows
  for (let i = 0; i < data.history.times.length; i++) {
    const time = data.history.times[i];
    const state = data.history.states[i];
    
    const row = [time.toString(), ...state.values.map(v => v.toString())];
    
    // Add geometric properties if included
    if (fullOptions.includeGeometricProperties && data.geometricProperties) {
      const geoProps = data.geometricProperties.find(p => p.time === time)?.properties || {};
      const headers = Object.keys(data.geometricProperties[0].properties);
      row.push(...headers.map(h => (geoProps[h] || 0).toString()));
    }
    
    // Add statistics if included
    if (fullOptions.includeStatistics && data.statistics) {
      const stats = data.statistics.find(s => s.time === time)?.statistics || {};
      const headers = Object.keys(data.statistics[0].statistics);
      row.push(...headers.map(h => (stats[h] || 0).toString()));
    }
    
    lines.push(row.join(','));
  }
  
  return lines.join('\n');
}

/**
 * Creates a data URL for downloading serialized simulation data
 * 
 * @param data Serialized simulation data or CSV string
 * @param format Export format
 * @returns Data URL
 */
export function createDataURL(data: SerializedSimulation | string, format: ExportFormat): string {
  let contentType: string;
  let content: string;
  
  if (format === ExportFormat.CSV) {
    contentType = 'text/csv';
    content = typeof data === 'string' ? data : convertToCSV(data);
  } else if (format === ExportFormat.JSONL) {
    contentType = 'application/x-jsonlines';
    if (typeof data === 'string') {
      content = data;
    } else {
      // Convert to JSONL (one JSON object per line)
      const jsonl: string[] = [];
      
      if (data.parameters) {
        jsonl.push(JSON.stringify({ type: 'parameters', data: data.parameters }));
      }
      
      if (data.graph) {
        jsonl.push(JSON.stringify({ type: 'graph', data: data.graph }));
      }
      
      if (data.history) {
        // Split history into individual entries to avoid large lines
        for (let i = 0; i < data.history.times.length; i++) {
          const entry = {
            type: 'state',
            time: data.history.times[i],
            nodeIds: data.history.states[i].nodeIds,
            values: data.history.states[i].values
          };
          jsonl.push(JSON.stringify(entry));
        }
      }
      
      if (data.geometricProperties) {
        for (const prop of data.geometricProperties) {
          jsonl.push(JSON.stringify({ type: 'geometricProperties', ...prop }));
        }
      }
      
      if (data.statistics) {
        for (const stat of data.statistics) {
          jsonl.push(JSON.stringify({ type: 'statistics', ...stat }));
        }
      }
      
      content = jsonl.join('\n');
    }
  } else {
    // Default to JSON
    contentType = 'application/json';
    content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }
  
  const blob = new Blob([content], { type: contentType });
  return URL.createObjectURL(blob);
}

/**
 * Get the appropriate file extension for a given export format
 * 
 * @param format Export format
 * @returns File extension including the dot
 */
export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case ExportFormat.CSV:
      return '.csv';
    case ExportFormat.JSONL:
      return '.jsonl';
    case ExportFormat.JSON:
    default:
      return '.json';
  }
}
