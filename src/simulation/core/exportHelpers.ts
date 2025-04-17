/**
 * Helper functions for exporting simulation data
 * 
 * These helpers are separate from the logger to avoid circular dependencies
 * and make the CSV and JSON exports more maintainable.
 */

import { SimulationSessionLog } from './simulationLogger';

/**
 * Export session results to CSV
 */
export function exportSessionResultsToCsv(session: SimulationSessionLog): string {
  if (!session || session.results.length === 0) {
    return "No results data available";
  }
  
  // Fixed column headers in the preferred order
  const headers = [
    'simTime',
    'timestamp',
    // Conservation
    'totalProbability',
    'normVariation',
    'positivity',
    // Geometric
    'totalVolume',
    'totalArea',
    'effectiveDimension',
    'volumeEntropy',
    // Statistics
    'mean',
    'variance',
    'skewness',
    'kurtosis'
  ];
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  session.results.forEach(result => {
    const row = [
      result.simTime,
      result.timestamp,
      // Conservation data
      result.conservation?.totalProbability ?? '',
      result.conservation?.normVariation ?? '',
      result.conservation?.positivity ?? '',
      // Geometric data
      result.geometric?.totalVolume ?? '',
      result.geometric?.totalArea ?? '',
      result.geometric?.effectiveDimension ?? '',
      result.geometric?.volumeEntropy ?? '',
      // Statistics data
      result.statistics?.mean ?? '',
      result.statistics?.variance ?? '',
      result.statistics?.skewness ?? '',
      result.statistics?.kurtosis ?? ''
    ];
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

/**
 * Export session configuration to JSON
 */
export function exportSessionConfigToJson(session: SimulationSessionLog): string {
  if (!session) {
    return "{}";
  }
  
  // Create a copy with only the config data, omitting results and logs
  const configOnly = {
    id: session.id,
    startTime: session.startTime,
    endTime: session.endTime,
    networkInfo: session.networkInfo,
    parameters: session.parameters,
    paramChanges: session.paramChanges
  };
  
  return JSON.stringify(configOnly, null, 2);
}
