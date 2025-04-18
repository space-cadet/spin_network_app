/**
 * Exporters for simulation data in various formats
 */

import { SimulationEngine } from '../core/types';
import { ExportFormat, ExportOptions, SerializedSimulation } from './types';
import { serializeSimulation, convertToCSV, createDataURL, getFileExtension } from './serialization';

/**
 * Export simulation results to a file or data URL
 * 
 * @param engine Simulation engine to export data from
 * @param options Export options
 * @returns Data URL for the exported data
 */
export function exportSimulation(
  engine: SimulationEngine,
  options: Partial<ExportOptions> = {}
): string {
  // Serialize simulation data
  const serialized = serializeSimulation(engine, options);
  
  // Convert to specified format and create data URL
  const format = options.format || ExportFormat.JSON;
  
  return createDataURL(serialized, format);
}

/**
 * Export simulation results to a file by triggering a download
 * 
 * @param engine Simulation engine to export data from
 * @param filename Base filename (without extension)
 * @param options Export options
 */
export function downloadSimulationResults(
  engine: SimulationEngine,
  filename: string = 'simulation-results',
  options: Partial<ExportOptions> = {}
): void {
  const format = options.format || ExportFormat.JSON;
  const dataURL = exportSimulation(engine, options);
  const extension = getFileExtension(format);
  
  // Create a download link
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = `${filename}${extension}`;
  a.style.display = 'none';
  
  // Add to document, click, and remove
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(dataURL);
  }, 100);
}

/**
 * Export simulation parameters and configuration
 * 
 * @param engine Simulation engine to export configuration from
 * @param filename Base filename (without extension)
 */
export function downloadSimulationConfig(
  engine: SimulationEngine,
  filename: string = 'simulation-config'
): void {
  const engineImpl = engine as any;
  
  if (!engineImpl.getParameters) {
    throw new Error('Simulation engine does not support configuration export');
  }
  
  const config = {
    parameters: engineImpl.getParameters(),
    metadata: {
      exportedAt: new Date().toISOString(),
      engineType: engineImpl.constructor.name,
    }
  };
  
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create a download link
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.style.display = 'none';
  
  // Add to document, click, and remove
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export simulation graph structure
 * 
 * @param engine Simulation engine to export graph from
 * @param filename Base filename (without extension)
 */
export function downloadSimulationGraph(
  engine: SimulationEngine,
  filename: string = 'simulation-graph'
): void {
  const engineImpl = engine as any;
  
  if (!engineImpl.getGraph) {
    throw new Error('Simulation engine does not support graph export');
  }
  
  const graph = engineImpl.getGraph();
  const graphData = {
    nodes: graph.nodes,
    edges: graph.edges,
    metadata: {
      exportedAt: new Date().toISOString(),
      nodeCount: graph.getNodeCount(),
      edgeCount: graph.getEdgeCount()
    }
  };
  
  const json = JSON.stringify(graphData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create a download link
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.style.display = 'none';
  
  // Add to document, click, and remove
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export simulation results in CSV format
 * 
 * @param engine Simulation engine to export data from
 * @param filename Base filename (without extension)
 * @param options Export options
 */
export function downloadSimulationCSV(
  engine: SimulationEngine,
  filename: string = 'simulation-results',
  options: Partial<ExportOptions> = {}
): void {
  // Force CSV format
  const csvOptions = { ...options, format: ExportFormat.CSV };
  downloadSimulationResults(engine, filename, csvOptions);
}

/**
 * Export all simulation data as separate files (results, config, and graph)
 * 
 * @param engine Simulation engine to export data from
 * @param baseFilename Base filename for all exports
 * @param options Export options
 */
export function downloadAllSimulationData(
  engine: SimulationEngine,
  baseFilename: string = 'simulation',
  options: Partial<ExportOptions> = {}
): void {
  // Export results
  downloadSimulationResults(engine, `${baseFilename}-results`, options);
  
  // Export config
  downloadSimulationConfig(engine, `${baseFilename}-config`);
  
  // Export graph
  downloadSimulationGraph(engine, `${baseFilename}-graph`);
}

/**
 * Converts serialized simulation to CSV string
 * 
 * @param data Serialized simulation data
 * @param options Export options
 * @returns CSV string
 */
export function simulationToCSV(
  data: SerializedSimulation,
  options: Partial<ExportOptions> = {}
): string {
  return convertToCSV(data, options);
}

/**
 * Creates a data URL for the given content
 * 
 * @param content Content to create URL for
 * @param mimeType MIME type of the content
 * @returns Data URL
 */
export function createDownloadURL(content: string, mimeType: string): string {
  const blob = new Blob([content], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Creates a function to revoke a URL object
 * 
 * @param url URL to revoke
 * @returns Function that revokes the URL
 */
export function createURLRevoker(url: string): () => void {
  return () => URL.revokeObjectURL(url);
}
