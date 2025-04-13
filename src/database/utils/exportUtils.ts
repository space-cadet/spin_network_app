/**
 * Utilities for exporting and importing database data
 */
import { db } from '../db.config';
import { LogService } from '../services/logService';
import { SimulationService } from '../services/simulationService';
import { GraphService } from '../services/graphService';

/**
 * Export all database data to a JSON string
 * @param options Options for export
 * @returns JSON string with all database data
 */
export async function exportDatabaseToJson(options: {
  includeLogs?: boolean;
  includeSimulations?: boolean;
  includeGraphs?: boolean;
  includeResults?: boolean;
} = {}): Promise<string> {
  try {
    const exportData: Record<string, any> = {
      metadata: {
        exportTime: new Date().toISOString(),
        version: db.verno,
        options
      }
    };
    
    // Set default options
    const opts = {
      includeLogs: true,
      includeSimulations: true,
      includeGraphs: true,
      includeResults: true,
      ...options
    };
    
    // Export logs
    if (opts.includeLogs) {
      exportData.logs = await db.logs.toArray();
    }
    
    // Export simulations
    if (opts.includeSimulations) {
      exportData.simulations = await db.simulations.toArray();
      
      // Export simulation results
      if (opts.includeResults) {
        exportData.simulationResults = await db.simulationResults.toArray();
      }
    }
    
    // Export graphs
    if (opts.includeGraphs) {
      exportData.graphs = await db.graphs.toArray();
    }
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export database to JSON:', error);
    throw error;
  }
}

/**
 * Import database data from a JSON string
 * @param json JSON string with database data
 * @param options Options for import
 * @returns Summary of the import operation
 */
export async function importDatabaseFromJson(
  json: string,
  options: {
    clearExisting?: boolean;
    includeLogs?: boolean;
    includeSimulations?: boolean;
    includeGraphs?: boolean;
    includeResults?: boolean;
  } = {}
): Promise<{
  logsImported: number;
  simulationsImported: number;
  resultsImported: number;
  graphsImported: number;
  totalRecordsImported: number;
}> {
  try {
    const importData = JSON.parse(json);
    
    // Set default options
    const opts = {
      clearExisting: false,
      includeLogs: true,
      includeSimulations: true,
      includeGraphs: true,
      includeResults: true,
      ...options
    };
    
    // Initialize counters
    let logsImported = 0;
    let simulationsImported = 0;
    let resultsImported = 0;
    let graphsImported = 0;
    
    // Start a transaction for atomicity
    await db.transaction('rw', [db.logs, db.simulations, db.simulationResults, db.graphs], async () => {
      // Clear existing data if requested
      if (opts.clearExisting) {
        if (opts.includeLogs) {
          await db.logs.clear();
        }
        
        if (opts.includeSimulations) {
          await db.simulations.clear();
          
          if (opts.includeResults) {
            await db.simulationResults.clear();
          }
        }
        
        if (opts.includeGraphs) {
          await db.graphs.clear();
        }
      }
      
      // Import logs
      if (opts.includeLogs && importData.logs && Array.isArray(importData.logs)) {
        for (const log of importData.logs) {
          // Remove any existing ID to let Dexie generate a new one
          const { id, ...logData } = log;
          await db.logs.add(logData);
          logsImported++;
        }
      }
      
      // Import simulations
      if (opts.includeSimulations && importData.simulations && Array.isArray(importData.simulations)) {
        // Create a mapping of old IDs to new IDs
        const simulationIdMap = new Map<number, number>();
        
        for (const simulation of importData.simulations) {
          // Remove any existing ID to let Dexie generate a new one
          const { id: oldId, ...simulationData } = simulation;
          const newId = await db.simulations.add(simulationData);
          simulationsImported++;
          
          // Store the ID mapping for results
          if (oldId !== undefined) {
            simulationIdMap.set(oldId, newId);
          }
        }
        
        // Import simulation results
        if (opts.includeResults && importData.simulationResults && Array.isArray(importData.simulationResults)) {
          for (const result of importData.simulationResults) {
            // Update the simulationId to match the new ID
            const { id, simulationId: oldSimulationId, ...resultData } = result;
            
            if (oldSimulationId !== undefined && simulationIdMap.has(oldSimulationId)) {
              const newSimulationId = simulationIdMap.get(oldSimulationId);
              await db.simulationResults.add({
                ...resultData,
                simulationId: newSimulationId
              });
              resultsImported++;
            }
          }
        }
      }
      
      // Import graphs
      if (opts.includeGraphs && importData.graphs && Array.isArray(importData.graphs)) {
        for (const graph of importData.graphs) {
          // Remove any existing ID to let Dexie generate a new one
          const { id, ...graphData } = graph;
          await db.graphs.add(graphData);
          graphsImported++;
        }
      }
    });
    
    const totalRecordsImported = logsImported + simulationsImported + resultsImported + graphsImported;
    
    return {
      logsImported,
      simulationsImported,
      resultsImported,
      graphsImported,
      totalRecordsImported
    };
  } catch (error) {
    console.error('Failed to import database from JSON:', error);
    throw error;
  }
}

/**
 * Download database export as a file
 * @param options Export options
 */
export async function downloadDatabaseExport(options: {
  filename?: string;
  includeLogs?: boolean;
  includeSimulations?: boolean;
  includeGraphs?: boolean;
  includeResults?: boolean;
} = {}): Promise<void> {
  try {
    // Get JSON export
    const json = await exportDatabaseToJson(options);
    
    // Set filename
    const filename = options.filename || `spin-network-db-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    // Create download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Failed to download database export:', error);
    throw error;
  }
}

/**
 * Export logs to markdown format
 * @param filename Filename for download
 * @param options Log query options
 */
export async function downloadLogsAsMarkdown(
  filename = 'logs-export.md',
  options?: Parameters<typeof LogService.queryLogs>[0]
): Promise<void> {
  try {
    // Get markdown export
    const markdown = await LogService.exportLogsToMarkdown(options);
    
    // Create download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Failed to download logs as markdown:', error);
    throw error;
  }
}

/**
 * Export a specific simulation to a JSON file
 * @param simulationId Simulation ID
 * @param includeResults Whether to include detailed results
 * @param filename Optional filename for download
 */
export async function downloadSimulationExport(
  simulationId: number,
  includeResults = true,
  filename?: string
): Promise<void> {
  try {
    // Get simulation data
    const simulation = await SimulationService.getSimulation(simulationId);
    
    if (!simulation) {
      throw new Error(`Simulation with ID ${simulationId} not found`);
    }
    
    // Get JSON export
    const json = await SimulationService.exportSimulationToJson(simulationId, includeResults);
    
    // Set filename
    const defaultFilename = `simulation-${simulation.name.replace(/\s+/g, '-').toLowerCase()}-${simulationId}.json`;
    const downloadFilename = filename || defaultFilename;
    
    // Create download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Failed to download simulation export:', error);
    throw error;
  }
}

/**
 * Import database data from a file input element
 * @param fileInput File input element or event
 * @param options Import options
 * @returns Summary of import operation
 */
export async function importDatabaseFromFileInput(
  fileInput: HTMLInputElement | Event,
  options: Parameters<typeof importDatabaseFromJson>[1] = {}
): Promise<{
  logsImported: number;
  simulationsImported: number;
  resultsImported: number;
  graphsImported: number;
  totalRecordsImported: number;
}> {
  try {
    // Get file from input
    let file: File | null = null;
    
    if (fileInput instanceof Event && fileInput.target instanceof HTMLInputElement) {
      file = fileInput.target.files?.[0] || null;
    } else if (fileInput instanceof HTMLInputElement) {
      file = fileInput.files?.[0] || null;
    }
    
    if (!file) {
      throw new Error('No file selected');
    }
    
    // Read file as text
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file!);
    });
    
    // Import from JSON
    return await importDatabaseFromJson(text, options);
  } catch (error) {
    console.error('Failed to import database from file input:', error);
    throw error;
  }
}
