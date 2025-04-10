/**
 * Simulation Logger
 * 
 * Records and manages simulation events, parameter changes, and results
 * for debugging, history tracking, and analysis purposes.
 */

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
    
    // Return the session ID
    return sessionId;
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
   * Export a session to JSON
   */
  public exportSessionToJson(sessionId: string): string {
    const session = this.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    return JSON.stringify(session, null, 2);
  }
  
  /**
   * Export all sessions to JSON
   */
  public exportAllSessionsToJson(): string {
    return JSON.stringify(this.allSessions, null, 2);
  }
}

// Export a singleton instance
export const simulationLogger = SimulationLogger.getInstance();
