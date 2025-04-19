/**
 * Simulation Logger
 * 
 * Records and manages simulation events, parameter changes, and results
 * for debugging, history tracking, and analysis purposes.
 */

// Remove the helpers import and use the original functions

// Log entry type definitions
export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  simTime?: number;
}

export interface SimulationParameterChangeLog {
  timestamp: number;
  previousParams: Record<string, any>;
  newParams: Record<string, any>;
  changedFields: string[];
}

export interface SimulationResultsLog {
  timestamp: number;
  simTime: number;
  conservation: {
    totalProbability: number;
    normVariation: number;
    positivity: boolean;
  };
  geometric?: {
    totalVolume?: number;
    totalArea?: number;
    effectiveDimension?: number;
    volumeEntropy?: number;
  };
  statistics?: {
    mean?: number;
    variance?: number;
    skewness?: number;
    kurtosis?: number;
  };
}

export interface SimulationSessionLog {
  id: string;
  startTime: number;
  endTime?: number;
  networkInfo: {
    nodeCount: number;
    edgeCount: number;
    name?: string;
    type?: string;
  };
  parameters: Record<string, any>;
  logs: LogEntry[];
  paramChanges: SimulationParameterChangeLog[];
  results: SimulationResultsLog[];
}

/**
 * SimulationLogger class for recording simulation events and data
 */
export class SimulationLogger {
  private static instance: SimulationLogger;
  private currentSession: SimulationSessionLog | null = null;
  private allSessions: SimulationSessionLog[] = [];
  private maxSessionsToKeep = 20;
  
  // Private constructor (singleton pattern)
  private constructor() {
    this.loadSessionsFromStorage();
  }
  
  /**
   * Get the singleton instance of the SimulationLogger
   */
  public static getInstance(): SimulationLogger {
    if (!SimulationLogger.instance) {
      SimulationLogger.instance = new SimulationLogger();
    }
    return SimulationLogger.instance;
  }
  
  /**
   * Start a new simulation session
   */
  public startSession(networkInfo: SimulationSessionLog['networkInfo'], parameters: Record<string, any>): string {
    // End the current session if it exists
    if (this.currentSession) {
      this.endSession();
    }
    
    // Generate a unique ID for the session
    const sessionId = `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create a new session
    this.currentSession = {
      id: sessionId,
      startTime: Date.now(),
      networkInfo,
      parameters: { ...parameters },
      logs: [],
      paramChanges: [],
      results: []
    };
    
    // Log the session start
    this.log('info', 'Simulation session started', { parameters });
    
    // Write simulation parameters to a file in the runs folder
    this.writeSimulationStartToFile(sessionId, networkInfo, parameters);
    
    // Return the session ID
    return sessionId;
  }
  
  /**
   * Write simulation start parameters to a file in the runs directory
   */
  private writeSimulationStartToFile(
    sessionId: string, 
    networkInfo: SimulationSessionLog['networkInfo'], 
    parameters: Record<string, any>
  ): void {
    try {
      // Only proceed if we're in a browser environment with BrowserFS
      if (typeof window !== 'undefined' && typeof window.fs !== 'undefined') {
        // Create the simulation config data
        const simulationConfig = {
          id: sessionId,
          startTime: Date.now(),
          networkInfo,
          parameters,
          paramChanges: []
        };
        
        // Format the timestamp for the filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `simulation-config-${sessionId}.json`;
        
        // Ensure the directories exist
        this.ensureDirectoryExists('/logs', () => {
          this.ensureDirectoryExists('/logs/simulation', () => {
            this.ensureDirectoryExists('/logs/simulation/runs', () => {
              // Write the simulation config to a file
              window.fs!.writeFile(
                `/logs/simulation/runs/${filename}`,
                JSON.stringify(simulationConfig, null, 2),
                { encoding: 'utf8' },
                (err: any) => {
                  if (err) {
                    console.error(`Error writing simulation config to file: ${err.message || err}`);
                  } else {
                    console.log(`Successfully wrote simulation config to /logs/simulation/runs/${filename}`);
                  }
                }
              );
              
              // Create an empty CSV file for the results
              const csvFilename = `simulationresults${sessionId.replace(/-/g, '')}.csv`;
              const csvHeader = 'simTime,timestamp,totalProbability,normVariation,positivity,totalVolume,totalArea,effectiveDimension,volumeEntropy,mean,variance,skewness,kurtosis\n';
              
              window.fs!.writeFile(
                `/logs/simulation/runs/${csvFilename}`,
                csvHeader,
                { encoding: 'utf8' },
                (err: any) => {
                  if (err) {
                    console.error(`Error creating simulation results CSV file: ${err.message || err}`);
                  } else {
                    console.log(`Successfully created simulation results CSV file: /logs/simulation/runs/${csvFilename}`);
                  }
                }
              );
            });
          });
        });
      }
    } catch (error) {
      console.error('Error writing simulation start to file:', error);
    }
  }
  
  /**
   * End the current simulation session
   */
  public endSession(): SimulationSessionLog | null {
    if (!this.currentSession) {
      return null;
    }
    
    // Set the end time
    this.currentSession.endTime = Date.now();
    
    // Log the session end
    this.log('info', 'Simulation session ended');
    
    // Add to all sessions
    this.allSessions.push({ ...this.currentSession });
    
    // Trim sessions if we have too many
    if (this.allSessions.length > this.maxSessionsToKeep) {
      this.allSessions = this.allSessions.slice(-this.maxSessionsToKeep);
    }
    
    // Save to storage
    this.saveSessionsToStorage();
    
    // Get a copy of the session before clearing
    const completedSession = { ...this.currentSession };
    
    // Clear current session
    this.currentSession = null;
    
    return completedSession;
  }
  
  /**
   * Add a log entry to the current session
   */
  public log(level: LogLevel, message: string, data?: any, simTime?: number): void {
    if (!this.currentSession) {
      // Auto-create a new session if needed
      this.startSession({ nodeCount: 0, edgeCount: 0 }, {});
    }
    
    // Create the log entry
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      simTime
    };
    
    // Add to session logs
    if (this.currentSession) {
      this.currentSession.logs.push(logEntry);
    }
    
    // Also output to console for easier debugging
    switch (level) {
      case 'error':
        console.error(`[Sim ${simTime?.toFixed(2) || '?'}] ${message}`, data);
        break;
      case 'warning':
        console.warn(`[Sim ${simTime?.toFixed(2) || '?'}] ${message}`, data);
        break;
      case 'debug':
        console.debug(`[Sim ${simTime?.toFixed(2) || '?'}] ${message}`, data);
        break;
      default:
        console.log(`[Sim ${simTime?.toFixed(2) || '?'}] ${message}`, data);
    }
  }
  
  /**
   * Log a parameter change
   */
  public logParameterChange(previousParams: Record<string, any>, newParams: Record<string, any>): void {
    if (!this.currentSession) {
      return;
    }
    
    // Find which fields changed
    const changedFields: string[] = [];
    for (const key in newParams) {
      if (JSON.stringify(previousParams[key]) !== JSON.stringify(newParams[key])) {
        changedFields.push(key);
      }
    }
    
    // Log the parameter change
    this.log('info', `Parameters updated: ${changedFields.join(', ')}`, {
      previous: previousParams,
      new: newParams
    });
    
    // Create the parameter change log
    const paramChangeLog: SimulationParameterChangeLog = {
      timestamp: Date.now(),
      previousParams: { ...previousParams },
      newParams: { ...newParams },
      changedFields
    };
    
    // Add to param changes
    this.currentSession.paramChanges.push(paramChangeLog);
    
    // Update the current session parameters
    this.currentSession.parameters = { ...newParams };
  }
  
  /**
   * Log simulation results
   */
  public logResults(simTime: number, results: Omit<SimulationResultsLog, 'timestamp' | 'simTime'>): void {
    if (!this.currentSession) {
      return;
    }
    
    // Create the results log
    const resultsLog: SimulationResultsLog = {
      timestamp: Date.now(),
      simTime,
      ...results
    };
    
    // Add to results
    this.currentSession.results.push(resultsLog);
    
    // Log a summary
    this.log('info', `Results recorded at t=${simTime.toFixed(2)}`, {
      conservation: results.conservation
    }, simTime);
    
    // Append the results to the CSV file in the runs directory
    this.appendResultsToFile(this.currentSession.id, resultsLog);
  }
  
  /**
   * Append simulation results to the CSV file
   */
  private appendResultsToFile(sessionId: string, results: SimulationResultsLog): void {
    try {
      // Only proceed if we're in a browser environment with BrowserFS
      if (typeof window !== 'undefined' && typeof window.fs !== 'undefined') {
        // Format the results as a CSV row
        let row = `${results.simTime},${results.timestamp}`;
        
        // Add conservation data
        row += `,${results.conservation?.totalProbability ?? ''}`;
        row += `,${results.conservation?.normVariation ?? ''}`;
        row += `,${results.conservation?.positivity ?? ''}`;
        
        // Add geometric data
        row += `,${results.geometric?.totalVolume ?? ''}`;
        row += `,${results.geometric?.totalArea ?? ''}`;
        row += `,${results.geometric?.effectiveDimension ?? ''}`;
        row += `,${results.geometric?.volumeEntropy ?? ''}`;
        
        // Add statistics data
        row += `,${results.statistics?.mean ?? ''}`;
        row += `,${results.statistics?.variance ?? ''}`;
        row += `,${results.statistics?.skewness ?? ''}`;
        row += `,${results.statistics?.kurtosis ?? ''}`;
        
        // Create the filename with no hyphens (per existing format)
        const csvFilename = `simulationresults${sessionId.replace(/-/g, '')}.csv`;
        
        // Ensure directories exist
        this.ensureDirectoryExists('/logs', () => {
          this.ensureDirectoryExists('/logs/simulation', () => {
            this.ensureDirectoryExists('/logs/simulation/runs', () => {
              // Append to the CSV file
              window.fs!.appendFile(
                `/logs/simulation/runs/${csvFilename}`,
                row + '\n',
                { encoding: 'utf8' },
                (err: any) => {
                  if (err) {
                    console.error(`Error appending to simulation results CSV file: ${err.message || err}`);
                  }
                }
              );
            });
          });
        });
      }
    } catch (error) {
      console.error('Error appending results to file:', error);
    }
  }
  
  /**
   * Get the current session
   */
  public getCurrentSession(): SimulationSessionLog | null {
    return this.currentSession;
  }
  
  /**
   * Get all sessions
   */
  public getAllSessions(): SimulationSessionLog[] {
    return [...this.allSessions];
  }
  
  /**
   * Get a specific session by ID
   */
  public getSessionById(sessionId: string): SimulationSessionLog | undefined {
    if (this.currentSession && this.currentSession.id === sessionId) {
      return { ...this.currentSession };
    }
    return this.allSessions.find(session => session.id === sessionId);
  }
  
  /**
   * Clear all sessions
   */
  public clearAllSessions(): void {
    this.allSessions = [];
    this.saveSessionsToStorage();
  }
  
  /**
   * Save sessions to local storage
   */
  private saveSessionsToStorage(): void {
    try {
      localStorage.setItem('simulationSessions', JSON.stringify(this.allSessions));
    } catch (error) {
      console.error('Error saving simulation sessions to storage:', error);
    }
  }
  
  /**
   * Load sessions from local storage
   */
  private loadSessionsFromStorage(): void {
    try {
      const sessionsJson = localStorage.getItem('simulationSessions');
      if (sessionsJson) {
        this.allSessions = JSON.parse(sessionsJson);
      }
    } catch (error) {
      console.error('Error loading simulation sessions from storage:', error);
    }
  }
  
  /**
   * Export session parameters and network config to JSON (without results)
   */
  public exportSessionConfigToJson(sessionId: string): string {
    const session = this.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    
    // Create a copy with only the config data, omitting results
    const configOnly = {
      id: session.id,
      startTime: session.startTime,
      endTime: session.endTime,
      networkInfo: session.networkInfo,
      parameters: session.parameters,
      // Include parameter changes but not logs or results
      paramChanges: session.paramChanges
    };
    
    return JSON.stringify(configOnly, null, 2);
  }

  /**
   * Export a full session to JSON (including all data)
   */
  public exportSessionToJson(sessionId: string): string {
    const session = this.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    return JSON.stringify(session, null, 2);
  }

  /**
   * Export session results to CSV
   */
  public exportSessionResultsToCsv(sessionId: string): string {
    const session = this.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    if (session.results.length === 0) {
      return "No results data available";
    }

    // Create headers based on available data
    const headers: string[] = ['simTime', 'timestamp'];
    
    // Create a Set to track all headers
    const allHeaders = new Set<string>();
    
    // Add standard headers for all common fields
    // We need to ensure these headers are included even if they're not in the data
    const standardHeaders = [
      'totalProbability', 'normVariation', 'positivity',  // Conservation
      'totalVolume', 'totalArea', 'effectiveDimension', 'volumeEntropy',  // Geometric
      'mean', 'variance', 'skewness', 'kurtosis'  // Statistics
    ];
    
    // Add all standard headers to ensure consistent columns across exports
    standardHeaders.forEach(header => allHeaders.add(header));
    
    // Then also scan the actual data to catch any other fields that might exist
    session.results.forEach(result => {
      // Add any additional fields that might exist in the data
      if (result.conservation) {
        Object.keys(result.conservation).forEach(key => allHeaders.add(key));
      }
      
      if (result.geometric) {
        Object.keys(result.geometric).forEach(key => allHeaders.add(key));
      }
      
      if (result.statistics) {
        Object.keys(result.statistics).forEach(key => allHeaders.add(key));
      }
    });
    
    // Add all discovered headers to the header row
    headers.push(...Array.from(allHeaders));
    
    // Create CSV header row
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    session.results.forEach(result => {
      // Start with guaranteed fields
      const row: any[] = [
        result.simTime,
        result.timestamp
      ];
      
      // Add conservation data
      if (headers.includes('totalProbability')) {
        row.push(result.conservation?.totalProbability ?? '');
      }
      if (headers.includes('normVariation')) {
        row.push(result.conservation?.normVariation ?? '');
      }
      if (headers.includes('positivity')) {
        row.push(result.conservation?.positivity ?? '');
      }
      
      // Add geometric data - check each field individually
      if (headers.includes('totalVolume')) {
        row.push(result.geometric?.totalVolume ?? '');
      }
      if (headers.includes('totalArea')) {
        row.push(result.geometric?.totalArea ?? '');
      }
      if (headers.includes('effectiveDimension')) {
        row.push(result.geometric?.effectiveDimension ?? '');
      }
      if (headers.includes('volumeEntropy')) {
        row.push(result.geometric?.volumeEntropy ?? '');
      }
      
      // Add statistics data - check each field individually
      if (headers.includes('mean')) {
        row.push(result.statistics?.mean ?? '');
      }
      if (headers.includes('variance')) {
        row.push(result.statistics?.variance ?? '');
      }
      if (headers.includes('skewness')) {
        row.push(result.statistics?.skewness ?? '');
      }
      if (headers.includes('kurtosis')) {
        row.push(result.statistics?.kurtosis ?? '');
      }
      
      csv += row.join(',') + '\n';
    });
    
    // Also save the CSV to a file in the BrowserFS if available
    this.saveResultsToFile(sessionId, csv);
    
    return csv;
  }
  
  /**
   * Save results to file in the BrowserFS
   */
  private saveResultsToFile(sessionId: string, csvContent: string): void {
    try {
      // Check if we're in a browser environment with BrowserFS
      if (typeof window !== 'undefined' && typeof window.fs !== 'undefined') {
        const logsDir = '/logs';
        const simulationDir = `${logsDir}/simulation`;
        const runsDir = `${simulationDir}/runs`;
        
        // Ensure the directories exist
        this.ensureDirectoryExists(logsDir, () => {
          this.ensureDirectoryExists(simulationDir, () => {
            this.ensureDirectoryExists(runsDir, () => {
              // Write the file
              const filePath = `${runsDir}/simulation-results-${sessionId}.csv`;
              console.log(`Writing simulation results to file: ${filePath}`);
              
              window.fs!.writeFile(filePath, csvContent, { encoding: 'utf8' }, (err: any) => {
                if (err) {
                  console.error(`Error writing results to file: ${err.message || err}`);
                } else {
                  console.log(`Successfully wrote results to file: ${filePath}`);
                }
              });
            });
          });
        });
        
        // Also save graph data if it exists
        const session = this.getSessionById(sessionId);
        if (session && session.networkInfo) {
          const graphsDir = `${simulationDir}/graphs`;
          this.ensureDirectoryExists(graphsDir, () => {
            const graphData = {
              id: sessionId,
              timestamp: Date.now(),
              type: session.networkInfo.type || 'unknown',
              nodeCount: session.networkInfo.nodeCount,
              edgeCount: session.networkInfo.edgeCount,
              name: session.networkInfo.name || 'Untitled Graph',
              parameters: session.parameters
            };
            
            const graphContent = JSON.stringify(graphData, null, 2);
            const graphPath = `${graphsDir}/graph-${sessionId}.json`;
            
            window.fs!.writeFile(graphPath, graphContent, { encoding: 'utf8' }, (err: any) => {
              if (err) {
                console.error(`Error writing graph data to file: ${err.message || err}`);
              } else {
                console.log(`Successfully wrote graph data to file: ${graphPath}`);
              }
            });
          });
        }
      }
    } catch (error) {
      console.error('Error saving results to file:', error);
    }
  }
  
  /**
   * Ensure directory exists
   */
  private ensureDirectoryExists(dirPath: string, callback: () => void): void {
    if (!window || typeof window.fs === 'undefined') {
      callback();
      return;
    }
    
    window.fs!.stat(dirPath, (statErr: any) => {
      if (statErr) {
        // Directory doesn't exist, create it
        window.fs!.mkdir(dirPath, { recursive: false }, (mkdirErr: any) => {
          if (mkdirErr && mkdirErr.code !== 'EEXIST') {
            console.error(`Failed to create directory ${dirPath}: ${mkdirErr.message || mkdirErr}`);
          } else {
            console.log(`Created directory: ${dirPath}`);
            callback();
          }
        });
      } else {
        // Directory already exists
        callback();
      }
    });
  }
  
  /**
   * Export all sessions to JSON
   */
  public exportAllSessionsToJson(): string {
    return JSON.stringify(this.allSessions, null, 2);
  }
  
  /**
   * Save test log to the correct directory
   * This method is specifically for test logs that should go to /logs/simulation/tests/
   */
  public saveTestLog(testName: string, content: string): void {
    try {
      // Check if we're in a browser environment with BrowserFS
      if (typeof window !== 'undefined' && typeof window.fs !== 'undefined') {
        const logsDir = '/logs';
        const simulationDir = `${logsDir}/simulation`;
        const testsDir = `${simulationDir}/tests`;
        
        // Ensure the directories exist
        this.ensureDirectoryExists(logsDir, () => {
          this.ensureDirectoryExists(simulationDir, () => {
            this.ensureDirectoryExists(testsDir, () => {
              // Create a timestamp for the filename
              const timestamp = new Date();
              const dateStr = timestamp.toISOString().replace(/[:.]/g, '-').split('T')[0];
              const timeStr = timestamp.toISOString().replace(/[:.]/g, '-').split('T')[1].split('Z')[0];
              
              // Write the file
              const filePath = `${testsDir}/test-${testName}-${dateStr}-${timeStr}.log`;
              console.log(`Writing test log to file: ${filePath}`);
              
              window.fs!.writeFile(filePath, content, { encoding: 'utf8' }, (err: any) => {
                if (err) {
                  console.error(`Error writing test log to file: ${err.message || err}`);
                } else {
                  console.log(`Successfully wrote test log to file: ${filePath}`);
                }
              });
            });
          });
        });
      }
    } catch (error) {
      console.error('Error saving test log to file:', error);
    }
  }
}

// Export a singleton instance
export const simulationLogger = SimulationLogger.getInstance();
