/**
 * Simulation Logger
 * 
 * Provides structured logging for simulation events, with special handling
 * for numerical stability issues and performance tracking. Also supports
 * file-based logging for persistence and analysis.
 */

import { SimulationParameters } from '../core/types';

// Use type imports instead of value imports to avoid conflicts
import type * as fsType from 'fs';
import type * as pathType from 'path';

// No need to redeclare global types as they're now in global.d.ts

/**
 * Initialize BrowserFS for browser environments
 * This must be called before attempting to use file logging in the browser
 */
export function initBrowserFileSystem(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Skip if we're not in a browser environment
    if (typeof window === 'undefined') {
      console.log('Not in browser environment, skipping BrowserFS initialization');
      resolve(false);
      return;
    }
    
    // Check if BrowserFS is available
    if (!window.BrowserFS) {
      console.warn('BrowserFS library not loaded. File logging will be disabled.');
      resolve(false);
      return;
    }
    
    // Initialize BrowserFS with an IndexedDB backend for persistence
    console.log('Configuring BrowserFS with IndexedDB backend...');
    window.BrowserFS.configure({
      fs: "IndexedDB",
      options: {
        storeName: 'spin-network-fs' // Use the same DB name as in browserFSConfig.ts
      }
    }, (err: Error | null) => {
      if (err) {
        console.error('Failed to initialize BrowserFS:', err);
        reject(err);
        return;
      }
      
      // Verify BrowserFS is still available after configuration
      if (!window.BrowserFS) {
        console.error('BrowserFS disappeared after configuration');
        reject(new Error('BrowserFS disappeared after configuration'));
        return;
      }
      
      // Assign the BrowserFS file system to window.fs
      window.fs = window.BrowserFS.BFSRequire('fs');
      window.path = window.BrowserFS.BFSRequire('path');
      console.log('BrowserFS initialized successfully. File logging enabled.');
      
      // Create basic directory structure
      try {
        const fs = window.fs;
        
        // Create root directories
        const baseDirs = ['/', '/logs', '/logs/simulation'];
        for (const dir of baseDirs) {
          try {
            if (!fs.existsSync(dir)) {
              console.log(`Creating base directory: ${dir}`);
              fs.mkdirSync(dir);
            } else {
              console.log(`Base directory already exists: ${dir}`);
            }
          } catch (dirErr) {
            console.warn(`Failed to create directory ${dir}:`, dirErr);
            // Continue with other directories
          }
        }
        
        // List files in the root to verify
        try {
          const rootFiles = fs.readdirSync('/');
          console.log('Files in root directory:', rootFiles);
        } catch (listErr) {
          console.warn('Failed to list files in root directory:', listErr);
        }
      } catch (setupErr) {
        console.warn('Error during initial directory setup:', setupErr);
        // Still resolve as true since BrowserFS is initialized
      }
      
      resolve(true);
    });
  });
}

/**
 * Log levels for simulation events
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3
}

/**
 * Log categories for different aspects of the simulation
 */
export enum LogCategory {
  GENERAL = 'general',
  STABILITY = 'stability',
  PERFORMANCE = 'performance',
  STATE = 'state',
  GRAPH = 'graph',
  MODEL = 'model',
  SOLVER = 'solver'
}

/**
 * Interface for log entries
 */
export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
}

/**
 * Configuration options for the simulation logger
 */
export interface SimulationLoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  throttleWarnings: boolean;
  throttleInterval: number;
  maxEntries: number;
  enableFileLogging: boolean;
  logsDirectory: string;
}

/**
 * Simulation state enum for lifecycle events
 */
export enum SimulationState {
  CREATED = 'created',
  STARTED = 'started',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  STOPPED = 'stopped'
}

/**
 * Graph data interface for logging graph information
 */
export interface GraphData {
  id: string;
  type: string;
  nodeCount: number;
  edgeCount: number;
  parameters: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Simulation result data for logging
 */
export interface SimulationResultData {
  time: number;
  conservation?: {
    totalProbability: number;
    normVariation?: number;
    positivity?: boolean;
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

/**
 * SimulationLogger class
 */
export class SimulationLogger {
  // Changed to protected to allow access from test functions
  protected _config: SimulationLoggerConfig;
  protected _logs: LogEntry[] = [];
  protected _lastWarnings: Map<string, number> = new Map();
  protected _stabilityMetrics: {
    timestep: number;
    maxVolume: number;
    normalizations: number;
    lastNormalizationTime: number | null;
  };
  protected _sessionId: string | null = null;
  protected _graphId: string | null = null;
  protected _simulationState: SimulationState | null = null;
  protected _resultsCount: number = 0;
  protected _lastResultsTime: number = 0;
  protected _resultsLogInterval: number = 5000; // ms between results logs
  protected _autoSaveResults: boolean = true;

  /**
   * Create a new SimulationLogger instance
   */
  constructor(config?: Partial<SimulationLoggerConfig>) {
    // Default configuration
    this._config = {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      throttleWarnings: true,
      throttleInterval: 1000, // ms
      maxEntries: 1000,
      enableFileLogging: false,
      logsDirectory: './logs',
      ...config
    };

    // Initialize stability metrics
    this._stabilityMetrics = {
      timestep: 0,
      maxVolume: 0,
      normalizations: 0,
      lastNormalizationTime: null
    };

    // Generate a session ID
    this._generateSessionId();
  }

  /**
   * Generate a unique session ID
   */
  private _generateSessionId(): void {
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, '0');
    const day = String(timestamp.getDate()).padStart(2, '0');
    const hours = String(timestamp.getHours()).padStart(2, '0');
    const minutes = String(timestamp.getMinutes()).padStart(2, '0');
    const seconds = String(timestamp.getSeconds()).padStart(2, '0');
    const ms = String(timestamp.getMilliseconds()).padStart(3, '0');
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    this._sessionId = `sim-${year}${month}${day}-${hours}${minutes}${seconds}-${ms}-${randomStr}`;
  }

  /**
   * Log a message
   */
  log(level: LogLevel, category: LogCategory, message: string, data?: any): void {
    // Skip logging if below minimum level
    if (level < this._config.minLevel) {
      return;
    }

    // Create log entry
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data
    };

    // Handle throttling for warnings
    if (level === LogLevel.WARNING && this._config.throttleWarnings) {
      const key = `${category}-${message}`;
      const lastTime = this._lastWarnings.get(key) || 0;
      const now = Date.now();

      if (now - lastTime < this._config.throttleInterval) {
        // Skip this warning due to throttling
        return;
      }

      // Update last warning time
      this._lastWarnings.set(key, now);
    }

    // Add to logs, maintaining max entries limit
    this._logs.push(entry);
    if (this._logs.length > this._config.maxEntries) {
      this._logs.shift();
    }

    // Output to console if enabled
    if (this._config.enableConsole) {
      this._outputToConsole(entry);
    }

    // Write to file if enabled
    if (this._config.enableFileLogging) {
      this._writeLogToFile(entry);
    }

    // Update stability metrics if relevant
    if (category === LogCategory.STABILITY && data && typeof data.volume === 'number') {
      this._updateStabilityMetrics(data);
    }
  }

  /**
   * Write log entry to file
   */
  private _writeLogToFile(entry: LogEntry): void {
    try {
      // If browser environment, use window.fs
      if (typeof window !== 'undefined' && window.fs) {
        this._writeLogUsingBrowserFS(entry);
      }
      // If Node.js environment, use fs module
      else if (typeof fs !== 'undefined' && fs.appendFileSync) {
        this._writeLogUsingNodeFS(entry);
      }
    } catch (error) {
      console.error('Error writing log to file:', error);
    }
  }

  /**
   * Write log using browser's window.fs API
   */
  private _writeLogUsingBrowserFS(entry: LogEntry): void {
    try {
      // Safety check
      if (!window || !window.fs) {
        console.error('Browser filesystem API not available.');
        return;
      }
      
      const logType = this._getCategoryLogType(entry.category);
      const fileName = this._getLogFileName(entry.category);
      const logMessage = this._formatLogMessage(entry);
      
      // First ensure the base logs directory exists
      if (!window.fs.existsSync(this._config.logsDirectory)) {
        try {
          window.fs.mkdirSync(this._config.logsDirectory);
          console.debug(`Created base logs directory: ${this._config.logsDirectory}`);
        } catch (baseErr: any) {
          if (baseErr && baseErr.code !== 'EEXIST') {
            console.error(`Failed to create base logs directory: ${baseErr.message || baseErr}`);
            return;
          }
        }
      }
      
      // Then ensure the simulation directory exists
      const simDirPath = `${this._config.logsDirectory}/simulation`;
      if (!window.fs.existsSync(simDirPath)) {
        try {
          window.fs.mkdirSync(simDirPath);
          console.debug(`Created simulation directory: ${simDirPath}`);
        } catch (simErr: any) {
          if (simErr && simErr.code !== 'EEXIST') {
            console.error(`Failed to create simulation directory: ${simErr.message || simErr}`);
            return;
          }
        }
      }
      
      // Finally ensure the log type directory exists
      const logDirPath = `${this._config.logsDirectory}/simulation/${logType}`;
      if (!window.fs.existsSync(logDirPath)) {
        try {
          window.fs.mkdirSync(logDirPath);
          console.debug(`Created log type directory: ${logDirPath}`);
        } catch (logErr: any) {
          if (logErr && logErr.code !== 'EEXIST') {
            console.error(`Failed to create log type directory: ${logErr.message || logErr}`);
            return;
          }
        }
      }
      
      // Now we can write to the file
      const filePath = `${this._config.logsDirectory}/simulation/${logType}/${fileName}`;
      console.debug(`Writing log to: ${filePath}`);
      
      // Append to log file
      window.fs.appendFile(
        filePath,
        logMessage + '\n',
        { encoding: 'utf8' },
        (err: any) => {
          if (err) {
            console.error(`Error writing to log file (${filePath}): ${err.message || err}`);
          }
        }
      );
    } catch (error) {
      console.error('Error using browser FS:', error);
    }
  }

  /**
   * Write log using Node.js fs module
   */
  private _writeLogUsingNodeFS(entry: LogEntry): void {
    try {
      // Safety check
      if (typeof fs === 'undefined' || !fs) {
        console.error('Node.js filesystem API not available.');
        return;
      }
      
      // Safety check for path
      if (typeof path === 'undefined' || !path) {
        console.error('Node.js path module not available.');
        return;
      }
      
      const logType = this._getCategoryLogType(entry.category);
      const fileName = this._getLogFileName(entry.category);
      const logMessage = this._formatLogMessage(entry);
      const dirPath = path.join(this._config.logsDirectory, 'simulation', logType);
      const filePath = path.join(dirPath, fileName);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Append to log file
      fs.appendFileSync(filePath, logMessage + '\n', 'utf8');
    } catch (error) {
      console.error('Error using Node FS:', error);
    }
  }

  /**
   * Ensure directory exists (for browser FS)
   */
  private _ensureDirectoryExists(logType: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Safety check
        if (!window || !window.fs) {
          console.error('Browser filesystem API not available.');
          resolve(false);
          return;
        }
        
        // Create directory path structure
        const baseDir = this._config.logsDirectory;
        const simulationDir = `${baseDir}/simulation`;
        const typeDir = `${simulationDir}/${logType}`;
        
        console.debug(`Ensuring directory exists: ${typeDir}`);
        
        // Create directories in sequence: first baseDir, then simulationDir, then typeDir
        // First check and create the base logs directory
        this._createDirectoryIfNeeded(baseDir, (baseSuccess) => {
          if (!baseSuccess) {
            resolve(false);
            return;
          }
          
          // Then create the simulation subdirectory
          this._createDirectoryIfNeeded(simulationDir, (simSuccess) => {
            if (!simSuccess) {
              resolve(false);
              return;
            }
            
            // Finally create the log type subdirectory
            this._createDirectoryIfNeeded(typeDir, (typeSuccess) => {
              resolve(typeSuccess);
            });
          });
        });
      } catch (error) {
        console.error('Error in _ensureDirectoryExists:', error);
        resolve(false);
      }
    });
  }
  
  /**
   * Helper method to create a directory if it doesn't exist
   */
  private _createDirectoryIfNeeded(dirPath: string, callback: (success: boolean) => void): void {
    // Safety check for window.fs
    if (!window || !window.fs) {
      console.error('Browser filesystem API not available in _createDirectoryIfNeeded.');
      callback(false);
      return;
    }

    // Check if directory exists first
    window.fs.stat(dirPath, (statErr: any) => {
      if (statErr) {
        // Directory doesn't exist, create it
        window.fs.mkdir(dirPath, { recursive: false }, (mkdirErr: any) => {
          if (mkdirErr && mkdirErr.code !== 'EEXIST') {
            console.error(`Failed to create directory ${dirPath}: ${mkdirErr.message || mkdirErr}`);
            callback(false);
          } else {
            console.debug(`Created directory: ${dirPath}`);
            callback(true);
          }
        });
      } else {
        // Directory already exists
        console.debug(`Directory already exists: ${dirPath}`);
        callback(true);
      }
    });
  }

  /**
   * Get log file type based on category
   */
  private _getCategoryLogType(category: LogCategory): string {
    switch (category) {
      case LogCategory.STABILITY:
        return 'stability';
      case LogCategory.PERFORMANCE:
        return 'performance';
      case LogCategory.GRAPH:
        return 'graphs';
      case LogCategory.STATE:
        return 'runs';
      case LogCategory.MODEL:
        return 'runs';
      case LogCategory.SOLVER:
        return 'runs';
      case LogCategory.GENERAL:
        return 'runs';
      default:
        return 'runs';
    }
  }

  /**
   * Get log filename based on category
   */
  private _getLogFileName(category: LogCategory): string {
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    switch (category) {
      case LogCategory.STABILITY:
        return `stability-${this._sessionId}.log`;
      case LogCategory.PERFORMANCE:
        return `performance-${this._sessionId}.log`;
      case LogCategory.GRAPH:
        return `graph-${this._graphId || 'unknown'}.json`;
      default:
        return `session-${this._sessionId}.log`;
    }
  }

  /**
   * Format log message for file output
   */
  private _formatLogMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = LogLevel[entry.level];
    const category = entry.category;
    
    if (category === LogCategory.GRAPH) {
      // For graph category, format as JSON
      return JSON.stringify({
        timestamp,
        level,
        message: entry.message,
        data: entry.data,
        sessionId: this._sessionId
      }, null, 2);
    } else {
      // For other categories, format as log line
      const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
      return `[${timestamp}] [${level}] [${category}] ${entry.message}${dataStr}`;
    }
  }

  /**
   * Log a debug message
   */
  debug(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  /**
   * Log an info message
   */
  info(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  /**
   * Log a warning message
   */
  warn(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.WARNING, category, message, data);
  }

  /**
   * Log an error message
   */
  error(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data);
  }

  /**
   * Log stability issues
   */
  logStability(message: string, volume: number, time: number): void {
    this.warn(LogCategory.STABILITY, message, { volume, time });
  }

  /**
   * Record a normalization event
   */
  recordNormalization(volume: number, time: number): void {
    this._stabilityMetrics.normalizations++;
    this._stabilityMetrics.lastNormalizationTime = time;
    this.logStability('State normalized', volume, time);
  }

  /**
   * Log graph creation
   */
  logGraphCreation(graphData: GraphData): string {
    // Generate a unique graph ID if not provided
    if (!graphData.id) {
      const timestamp = new Date();
      const dateTimeStr = timestamp.toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
      const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      graphData.id = `graph-${dateTimeStr}-${randomStr}`;
    }
    
    // Store graph ID for later use
    this._graphId = graphData.id;
    
    // Log the graph creation
    this.info(LogCategory.GRAPH, `Graph created: ${graphData.type} with ${graphData.nodeCount} nodes and ${graphData.edgeCount} edges`, graphData);
    
    // If file logging enabled, write graph data to file
    if (this._config.enableFileLogging) {
      this._writeGraphToFile(graphData);
    }
    
    return graphData.id;
  }

  /**
   * Write graph data to file
   */
  private _writeGraphToFile(graphData: GraphData): void {
    try {
      const graphFileName = `graph-${graphData.id}.json`;
      const graphContent = JSON.stringify({
        id: graphData.id,
        timestamp: Date.now(),
        sessionId: this._sessionId,
        type: graphData.type,
        nodeCount: graphData.nodeCount,
        edgeCount: graphData.edgeCount,
        parameters: graphData.parameters,
        metadata: graphData.metadata || {}
      }, null, 2);
      
      console.log(`Writing graph data to file: ${graphFileName}`);
      
      // If browser environment, use window.fs
      if (typeof window !== 'undefined' && window.fs) {
        // Ensure directory exists
        this._ensureDirectoryExists('graphs');
        
        // Write graph data
        window.fs.writeFile(
          `${this._config.logsDirectory}/simulation/graphs/${graphFileName}`,
          graphContent,
          { encoding: 'utf8' },
          (err: any) => {
            if (err) {
              console.error(`Error writing graph data to file: ${err.message || err}`);
            } else {
              console.log(`Successfully wrote graph data to: ${this._config.logsDirectory}/simulation/graphs/${graphFileName}`);
            }
          }
        );
      }
      // If Node.js environment, use fs module
      else if (typeof fs !== 'undefined' && fs.writeFileSync) {
        const dirPath = path.join(this._config.logsDirectory, 'simulation', 'graphs');
        const filePath = path.join(dirPath, graphFileName);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Write graph data
        fs.writeFileSync(filePath, graphContent, 'utf8');
        console.log(`Successfully wrote graph data to: ${filePath}`);
      }
    } catch (error) {
      console.error('Error writing graph to file:', error);
    }
  }

  /**
   * Log simulation state change
   */
  logSimulationState(state: SimulationState, data?: any): void {
    this._simulationState = state;
    
    switch (state) {
      case SimulationState.CREATED:
        this.info(LogCategory.GENERAL, 'Simulation created', data);
        break;
      case SimulationState.STARTED:
        this.info(LogCategory.GENERAL, 'Simulation started', data);
        break;
      case SimulationState.PAUSED:
        this.info(LogCategory.GENERAL, 'Simulation paused', data);
        break;
      case SimulationState.RESUMED:
        this.info(LogCategory.GENERAL, 'Simulation resumed', data);
        break;
      case SimulationState.STOPPED:
        this.info(LogCategory.GENERAL, 'Simulation stopped', data);
        break;
    }
  }

  /**
   * Log simulation results
   */
  logSimulationResults(results: SimulationResultData): void {
    // Check if we should log this result (based on time interval)
    const now = Date.now();
    if (this._autoSaveResults && now - this._lastResultsTime < this._resultsLogInterval && this._resultsCount > 0) {
      return; // Skip logging this result
    }
    
    // Update last results time and increment counter
    this._lastResultsTime = now;
    this._resultsCount++;
    
    // Log the results
    this.debug(
      LogCategory.STATE, 
      `Simulation results at t=${results.time.toFixed(4)}`, 
      results
    );
    
    // If file logging enabled, write results to file
    if (this._config.enableFileLogging) {
      this._writeResultsToFile(results);
    }
  }

  /**
   * Write simulation results to file
   */
  private _writeResultsToFile(results: SimulationResultData): void {
    try {
      const resultsFileName = `results-${this._sessionId}.csv`;
      const now = Date.now();
      
      // Format as CSV row
      let row = `${results.time},${now}`;
      
      // Add conservation data
      row += `,${results.conservation?.totalProbability || ''}`;
      row += `,${results.conservation?.normVariation || ''}`;
      row += `,${results.conservation?.positivity || ''}`;
      
      // Add geometric data
      row += `,${results.geometric?.totalVolume || ''}`;
      row += `,${results.geometric?.totalArea || ''}`;
      row += `,${results.geometric?.effectiveDimension || ''}`;
      row += `,${results.geometric?.volumeEntropy || ''}`;
      
      // Add statistics data
      row += `,${results.statistics?.mean || ''}`;
      row += `,${results.statistics?.variance || ''}`;
      row += `,${results.statistics?.skewness || ''}`;
      row += `,${results.statistics?.kurtosis || ''}`;
      
      // If this is the first result, add header row
      if (this._resultsCount === 1) {
        const header = 'simTime,timestamp,totalProbability,normVariation,positivity,totalVolume,totalArea,effectiveDimension,volumeEntropy,mean,variance,skewness,kurtosis\n';
        
        // If browser environment, use window.fs
        if (typeof window !== 'undefined' && window.fs) {
          // Ensure directory exists
          this._ensureDirectoryExists('exports');
          
          // Write header first
          window.fs.writeFile(
            `${this._config.logsDirectory}/simulation/exports/${resultsFileName}`,
            header,
            { encoding: 'utf8' }
          );
        }
        // If Node.js environment, use fs module
        else if (typeof fs !== 'undefined' && fs.writeFileSync) {
          const dirPath = path.join(this._config.logsDirectory, 'simulation', 'exports');
          const filePath = path.join(dirPath, resultsFileName);
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          
          // Write header first
          fs.writeFileSync(filePath, header, 'utf8');
        }
      }
      
      // Append data row
      if (typeof window !== 'undefined' && window.fs) {
        window.fs.appendFile(
          `${this._config.logsDirectory}/simulation/exports/${resultsFileName}`,
          row + '\n',
          { encoding: 'utf8' }
        );
      } else if (typeof fs !== 'undefined' && fs.appendFileSync) {
        const dirPath = path.join(this._config.logsDirectory, 'simulation', 'exports');
        const filePath = path.join(dirPath, resultsFileName);
        fs.appendFileSync(filePath, row + '\n', 'utf8');
      }
    } catch (error) {
      console.error('Error writing results to file:', error);
    }
  }

  /**
   * Set auto-save results flag
   */
  setAutoSaveResults(autoSave: boolean): void {
    this._autoSaveResults = autoSave;
  }

  /**
   * Set results log interval
   */
  setResultsLogInterval(intervalMs: number): void {
    this._resultsLogInterval = intervalMs;
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this._logs];
  }

  /**
   * Get logs filtered by level and/or category
   */
  getFilteredLogs(level?: LogLevel, category?: LogCategory): LogEntry[] {
    return this._logs.filter(entry => {
      if (level !== undefined && entry.level < level) {
        return false;
      }
      if (category !== undefined && entry.category !== category) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get stability metrics
   */
  getStabilityMetrics() {
    return { ...this._stabilityMetrics };
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this._logs = [];
    this._lastWarnings.clear();
    this._stabilityMetrics = {
      timestep: 0,
      maxVolume: 0,
      normalizations: 0,
      lastNormalizationTime: null
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SimulationLoggerConfig>): void {
    this._config = {
      ...this._config,
      ...config
    };
  }

  /**
   * Enable file logging
   */
  enableFileLogging(directory: string = './logs'): void {
    this._config.enableFileLogging = true;
    this._config.logsDirectory = directory;
  }

  /**
   * Disable file logging
   */
  disableFileLogging(): void {
    this._config.enableFileLogging = false;
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string {
    return this._sessionId || 'unknown-session';
  }

  /**
   * Get the current graph ID
   */
  getGraphId(): string | null {
    return this._graphId;
  }

  /**
   * Get simulation state
   */
  getSimulationState(): SimulationState | null {
    return this._simulationState;
  }
  
  /**
   * Get logs directory
   */
  getLogsDirectory(): string {
    return this._config.logsDirectory;
  }

  /**
   * Output log entry to console
   */
  private _outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${typeof entry.category === 'string' ? entry.category : LogCategory[entry.category]}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.WARNING:
        console.warn(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ${entry.message}`, entry.data || '');
        break;
    }
  }

  /**
   * Update stability metrics
   */
  private _updateStabilityMetrics(data: any): void {
    if (typeof data.volume === 'number') {
      this._stabilityMetrics.maxVolume = Math.max(this._stabilityMetrics.maxVolume, data.volume);
    }
    if (typeof data.time === 'number') {
      this._stabilityMetrics.timestep = data.time;
    }
  }
}

/**
 * Default logger instance
 */
export const defaultLogger = new SimulationLogger({
  enableFileLogging: false, // Disabled by default but can be enabled
  logsDirectory: '/logs' // Default path to logs directory (relative to BrowserFS root)
});

/**
 * Test logger instance - specifically for test logs
 */
export const testLogger = new SimulationLogger({
  enableFileLogging: false, // Disabled by default but can be enabled
  logsDirectory: '/logs', // Default path to logs directory (relative to BrowserFS root)
  minLevel: LogLevel.DEBUG // Lower log level for tests to capture more details
});

// Function to enable test logging
export function enableTestLogging(): void {
  // Initialize BrowserFS first if in browser environment
  if (typeof window !== 'undefined') {
    initBrowserFileSystem()
      .then(initialized => {
        if (initialized) {
          console.log('BrowserFS initialized successfully for test logging.');
          testLogger.enableFileLogging('/logs');
          // Override the category log type specifically for test logger
          const originalGetCategoryLogType = testLogger['_getCategoryLogType'];
          testLogger['_getCategoryLogType'] = function(category: LogCategory): string {
            // Route all logs to the 'tests' directory for test logging
            return 'simulation/tests';
          };
        } else {
          console.warn('BrowserFS initialization failed for test logging.');
        }
      })
      .catch(err => {
        console.error('Error initializing BrowserFS for test logging:', err);
      });
  } else {
    // In Node.js environment, enable file logging directly
    testLogger.enableFileLogging('/logs');
  }
}

/**
 * Enable file logging for the default logger with the project logs directory
 */
export function enableDefaultLoggerFileLogging(): void {
  // Initialize BrowserFS first if in browser environment
  if (typeof window !== 'undefined') {
    initBrowserFileSystem()
      .then(initialized => {
        if (initialized) {
          console.log('BrowserFS initialized successfully. Enabling file logging.');
          defaultLogger.enableFileLogging('/logs');
        } else {
          console.warn('BrowserFS initialization failed. File logging will be disabled.');
        }
        // Test file system access after initialization attempt
        testFileSystemAccess();
      })
      .catch(err => {
        console.error('Error initializing BrowserFS:', err);
        // Still test file system access to see what's available
        testFileSystemAccess();
      });
  } else {
    // In Node.js environment, enable file logging directly
    defaultLogger.enableFileLogging('/logs');
    testFileSystemAccess();
  }
}

/**
 * Test whether file system is accessible and log paths are correct
 */
export function testFileSystemAccess(): void {
  console.log('Testing file system access...');
  
  // Test if we're in browser environment
  const isBrowser = typeof window !== 'undefined';
  console.log(`Environment: ${isBrowser ? 'Browser' : 'Node.js'}`);
  
  // Get logs directory path via getter
  const logsPath = (defaultLogger as any).getLogsDirectory();
  console.log(`Logs directory path: ${logsPath}`);
  
  // Test if window.fs exists in browser
  if (isBrowser) {
    if (window.fs) {
      console.log('window.fs API is available.');
      
      // Define the directory hierarchy to create
      const directoriesToCreate = [
        logsPath,                           // /logs
        `${logsPath}/application`,          // /logs/application
        `${logsPath}/application/error`,    // /logs/application/error
        `${logsPath}/application/performance`, // /logs/application/performance
        `${logsPath}/application/user`,     // /logs/application/user
        `${logsPath}/simulation`,           // /logs/simulation
        `${logsPath}/simulation/tests`,     // /logs/simulation/tests (NEW)
        `${logsPath}/simulation/runs`,      // /logs/simulation/runs (NEW)
        `${logsPath}/simulation/sessions`,  // /logs/simulation/sessions
        `${logsPath}/simulation/exports`,   // /logs/simulation/exports
        `${logsPath}/simulation/graphs`,    // /logs/simulation/graphs
        `${logsPath}/simulation/performance`, // /logs/simulation/performance
        `${logsPath}/simulation/stability`  // /logs/simulation/stability
      ];
      
      console.log('Trying to create/verify directories:');
      directoriesToCreate.forEach(dir => console.log(`- ${dir}`));
      
      // Create directories sequentially to ensure proper hierarchy
      createDirectoriesSequentially(directoriesToCreate, 0, (success) => {
        if (success) {
          // All directories created successfully, now write a test file
          const testPath = `${logsPath}/simulation/sessions/test-log-${Date.now()}.txt`;
          console.log(`Writing test file to: ${testPath}`);
          
          window.fs.writeFile(
            testPath,
            'File system test - ' + new Date().toISOString(),
            { encoding: 'utf8' },
            (err) => {
              if (err) {
                console.error(`Failed to write test file: ${err.message || err}`);
              } else {
                console.log(`Successfully wrote test file to: ${testPath}`);
              }
            }
          );
        } else {
          console.error('Failed to create some directories. See previous errors for details.');
        }
      });
    } else {
      console.error('window.fs API is NOT available. File logging will not work in browser environment!');
    }
  }
}

// Helper function to create directories sequentially
function createDirectoriesSequentially(
  directories: string[], 
  index: number, 
  callback: (success: boolean) => void
): void {
  // Safety check
  if (!window || !window.fs) {
    console.error('Browser filesystem API not available in createDirectoriesSequentially.');
    callback(false);
    return;
  }

  // Base case: all directories created
  if (index >= directories.length) {
    callback(true);
    return;
  }
  
  const currentDir = directories[index];
  console.log(`Creating directory (${index + 1}/${directories.length}): ${currentDir}`);
  
  // Check if directory exists first
  window.fs.stat(currentDir, (statErr: any) => {
    // Directory doesn't exist, create it
    if (statErr) {
      window.fs.mkdir(currentDir, { recursive: false }, (mkdirErr: any) => {
        if (mkdirErr && mkdirErr.code !== 'EEXIST') {
          console.error(`Failed to create directory ${currentDir}: ${mkdirErr.message || mkdirErr}`);
          callback(false);
        } else {
          console.log(`Created directory: ${currentDir}`);
          // Move to next directory
          createDirectoriesSequentially(directories, index + 1, callback);
        }
      });
    } else {
      // Directory already exists
      console.log(`Directory already exists: ${currentDir}`);
      // Move to next directory
      createDirectoriesSequentially(directories, index + 1, callback);
    }
  });
}

/**
 * Utility function to monitor simulation stability
 * 
 * This function checks the state vector for numerical instability and 
 * normalizes it if necessary, logging the event.
 * 
 * @param stateVector The current state vector
 * @param time The current simulation time
 * @param parameters Simulation parameters
 * @param logger Logger instance
 * @returns Object with normalized state vector (if normalization occurred) and stability info
 */
export function monitorSimulationStability(
  stateVector: any, 
  time: number, 
  parameters: SimulationParameters, 
  logger: SimulationLogger = defaultLogger
) {
  // Calculate total volume - sum of squared state values
  let volume = 0;
  let maxValue = 0;
  
  for (let i = 0; i < stateVector.size; i++) {
    const value = stateVector.getValueAtIndex(i);
    volume += value * value;
    maxValue = Math.max(maxValue, Math.abs(value));
  }
  
  // Default return values
  const result = {
    stateVector,
    normalized: false,
    volume,
    maxValue,
    stable: true
  };
  
  // Stability threshold from parameters or default
  const stabilityThreshold = parameters.parameters?.stabilityThreshold || 1e6;
  
  // Check for instability
  if (volume > stabilityThreshold) {
    logger.logStability(
      `Numerical instability detected (volume=${volume.toExponential(4)})`,
      volume,
      time
    );
    
    result.stable = false;
    
    // Auto-normalize if enabled in parameters
    const shouldNormalize = parameters.parameters?.autoNormalize !== false;
    
    if (shouldNormalize) {
      // Calculate normalization factor
      const normalizationFactor = 1.0 / Math.sqrt(volume);
      
      // Create normalized state
      const nodeIds = stateVector.nodeIds;
      const normalizedValues = [];
      
      for (let i = 0; i < stateVector.size; i++) {
        const originalValue = stateVector.getValueAtIndex(i);
        normalizedValues.push(originalValue * normalizationFactor);
      }
      
      // Create a new normalized state vector
      // Note: This assumes the existence of a SimulationStateVector constructor in the same scope
      // In the actual implementation, this would need to be properly imported or referenced
      const normalizedState = new stateVector.constructor(nodeIds, normalizedValues);
      
      // Record normalization in logger
      logger.recordNormalization(volume, time);
      
      // Update return values
      result.stateVector = normalizedState;
      result.normalized = true;
      result.volume = 1.0; // After normalization, volume should be 1.0
    }
  }
  
  return result;
}
