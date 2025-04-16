/**
 * Simulation Logger
 * 
 * Provides structured logging for simulation events, with special handling
 * for numerical stability issues and performance tracking.
 */

import { SimulationParameters } from '../core/types';

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
}

/**
 * SimulationLogger class
 */
export class SimulationLogger {
  private _config: SimulationLoggerConfig;
  private _logs: LogEntry[] = [];
  private _lastWarnings: Map<string, number> = new Map();
  private _stabilityMetrics: {
    timestep: number;
    maxVolume: number;
    normalizations: number;
    lastNormalizationTime: number | null;
  };

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
      ...config
    };

    // Initialize stability metrics
    this._stabilityMetrics = {
      timestep: 0,
      maxVolume: 0,
      normalizations: 0,
      lastNormalizationTime: null
    };
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

    // Update stability metrics if relevant
    if (category === LogCategory.STABILITY && data && typeof data.volume === 'number') {
      this._updateStabilityMetrics(data);
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
   * Output log entry to console
   */
  private _outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${LogCategory[entry.category] || entry.category}]`;
    
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
export const defaultLogger = new SimulationLogger();

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
