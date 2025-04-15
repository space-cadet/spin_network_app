/**
 * Log service for handling application logs
 */
import { db } from '../db.config';
import { LogEntry, LogType, ErrorLogEntry, EditLogEntry, LogQueryOptions } from '../models/logModels';

/**
 * Service for managing log entries in the database
 */
export class LogService {
  /**
   * Add a log entry to the database
   * @param logEntry The log entry to add
   * @returns The ID of the newly created log entry
   */
  static async addLog(logEntry: Omit<LogEntry, 'id'>): Promise<number> {
    try {
      // Make sure timestamp is set
      const entry = {
        ...logEntry,
        timestamp: logEntry.timestamp || Date.now()
      };
      
      // Add the log entry to the database
      const id = await db.logs.add(entry as LogEntry);
      return id;
    } catch (error) {
      console.error('Failed to add log entry:', error);
      throw error;
    }
  }
  
  /**
   * Add an error log entry to the database
   * @param error The error object or message
   * @param component The component where the error occurred
   * @param details Additional details about the error
   * @returns The ID of the newly created log entry
   */
  static async addErrorLog(
    error: Error | string,
    component: string,
    details?: Record<string, any>
  ): Promise<number> {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const stackTrace = error instanceof Error ? error.stack : undefined;
      
      const logEntry: Omit<ErrorLogEntry, 'id'> = {
        timestamp: Date.now(),
        type: 'error',
        component,
        message: errorMessage,
        details: details ? JSON.stringify(details) : undefined,
        stackTrace,
        errorMessage,
        fixed: false
      };
      
      return await this.addLog(logEntry);
    } catch (error) {
      console.error('Failed to add error log:', error);
      throw error;
    }
  }
  
  /**
   * Add an edit log entry to the database
   * @param filePath The path of the edited file
   * @param changeType The type of change
   * @param component The component responsible for the edit
   * @param details Additional details about the edit
   * @returns The ID of the newly created log entry
   */
  static async addEditLog(
    filePath: string,
    changeType: 'create' | 'update' | 'delete',
    component: string,
    details?: {
      linesChanged?: number;
      patch?: string;
      message?: string;
      relatedFiles?: string[];
    }
  ): Promise<number> {
    try {
      const fileType = filePath.split('.').pop() || '';
      
      const logEntry: Omit<EditLogEntry, 'id'> = {
        timestamp: Date.now(),
        type: 'edit',
        component,
        message: `${changeType} ${filePath}`,
        filePath,
        changeType,
        fileType,
        linesChanged: details?.linesChanged,
        patch: details?.patch,
        details: details ? JSON.stringify(details) : undefined,
        relatedFiles: details?.relatedFiles
      };
      
      return await this.addLog(logEntry);
    } catch (error) {
      console.error('Failed to add edit log:', error);
      throw error;
    }
  }
  
  /**
   * Mark an error log as fixed
   * @param id The ID of the error log entry
   * @param fixDetails Optional details about the fix
   * @returns true if successful, false if not found
   */
  static async markErrorAsFixed(
    id: number,
    fixDetails?: {
      fixedBy?: string;
      details?: string;
    }
  ): Promise<boolean> {
    try {
      const logEntry = await db.logs.get(id);
      
      if (!logEntry || logEntry.type !== 'error') {
        return false;
      }
      
      await db.logs.update(id, {
        fixed: true,
        details: JSON.stringify({
          ...JSON.parse(logEntry.details || '{}'),
          fixedTimestamp: Date.now(),
          fixedBy: fixDetails?.fixedBy,
          fixDetails: fixDetails?.details
        })
      });
      
      return true;
    } catch (error) {
      console.error('Failed to mark error as fixed:', error);
      throw error;
    }
  }
  
  /**
   * Get a log entry by ID
   * @param id The ID of the log entry
   * @returns The log entry or undefined if not found
   */
  static async getLog(id: number): Promise<LogEntry | undefined> {
    try {
      return await db.logs.get(id);
    } catch (error) {
      console.error('Failed to get log entry:', error);
      throw error;
    }
  }
  
  /**
   * Query log entries based on criteria
   * @param options Query options
   * @returns Array of matching log entries
   */
  static async queryLogs(options: LogQueryOptions = {}): Promise<LogEntry[]> {
    try {
      let query = db.logs.orderBy('timestamp');
      
      // Apply filters
      if (options.type) {
        if (Array.isArray(options.type)) {
          query = query.filter(log => options.type!.includes(log.type));
        } else {
          query = query.filter(log => log.type === options.type);
        }
      }
      
      if (options.component) {
        query = query.filter(log => log.component === options.component);
      }
      
      if (options.startTime !== undefined) {
        query = query.filter(log => log.timestamp >= options.startTime!);
      }
      
      if (options.endTime !== undefined) {
        query = query.filter(log => log.timestamp <= options.endTime!);
      }
      
      if (options.fixed !== undefined) {
        query = query.filter(log => {
          // Ensure boolean comparison
          const fixedValue = !!options.fixed;
          return log.fixed === fixedValue;
        });
      }
      
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        query = query.filter(log => 
          log.message.toLowerCase().includes(searchTerm) ||
          (log.details && log.details.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply sort direction
      if (options.sort === 'asc') {
        query = query.reverse(); // Default is desc, so reverse for asc
      }
      
      // Apply limit and offset
      if (options.offset !== undefined) {
        query = query.offset(options.offset);
      }
      
      if (options.limit !== undefined) {
        query = query.limit(options.limit);
      }
      
      return await query.toArray();
    } catch (error) {
      console.error('Failed to query logs:', error);
      throw error;
    }
  }
  
  /**
   * Get recent logs
   * @param limit Maximum number of logs to retrieve (default: 20)
   * @param type Optional log type filter
   * @returns Array of recent log entries
   */
  static async getRecentLogs(limit = 20, type?: LogType): Promise<LogEntry[]> {
    try {
      let query = db.logs.orderBy('timestamp').reverse();
      
      if (type) {
        query = query.filter(log => log.type === type);
      }
      
      return await query.limit(limit).toArray();
    } catch (error) {
      console.error('Failed to get recent logs:', error);
      throw error;
    }
  }
  
  /**
   * Count logs by type
   * @returns Record of log counts by type
   */
  static async countLogsByType(): Promise<Record<LogType, number>> {
    try {
      const logs = await db.logs.toArray();
      
      const counts: Partial<Record<LogType, number>> = {};
      for (const log of logs) {
        counts[log.type] = (counts[log.type] || 0) + 1;
      }
      
      return counts as Record<LogType, number>;
    } catch (error) {
      console.error('Failed to count logs by type:', error);
      throw error;
    }
  }
  
  /**
   * Delete a log entry by ID
   * @param id The ID of the log entry to delete
   * @returns true if deleted, false if not found
   */
  static async deleteLog(id: number): Promise<boolean> {
    try {
      const count = await db.logs.where('id').equals(id).delete();
      return count > 0;
    } catch (error) {
      console.error('Failed to delete log entry:', error);
      throw error;
    }
  }
  
  /**
   * Clear all logs
   * @param confirm Must be true to proceed with deletion
   * @returns Number of deleted log entries
   */
  static async clearLogs(confirm: boolean): Promise<number> {
    if (!confirm) {
      throw new Error('Log clearance requires confirmation');
    }
    
    try {
      return await db.logs.clear();
    } catch (error) {
      console.error('Failed to clear logs:', error);
      throw error;
    }
  }
  
  /**
   * Export logs to JSON format
   * @param options Optional query options to filter logs for export
   * @returns JSON string of logs
   */
  static async exportLogsToJson(options?: LogQueryOptions): Promise<string> {
    try {
      const logs = await this.queryLogs(options);
      return JSON.stringify(logs, null, 2);
    } catch (error) {
      console.error('Failed to export logs to JSON:', error);
      throw error;
    }
  }
  
  /**
   * Export logs to Markdown format
   * @param options Optional query options to filter logs for export
   * @returns Markdown string of logs
   */
  static async exportLogsToMarkdown(options?: LogQueryOptions): Promise<string> {
    try {
      const logs = await this.queryLogs(options);
      
      let markdown = '# Log Export\n\n';
      markdown += `*Generated: ${new Date().toISOString()}*\n\n`;
      
      // Group logs by type
      const groupedLogs: Record<string, LogEntry[]> = {};
      for (const log of logs) {
        if (!groupedLogs[log.type]) {
          groupedLogs[log.type] = [];
        }
        groupedLogs[log.type].push(log);
      }
      
      // Generate markdown for each log type
      for (const [type, typeLogs] of Object.entries(groupedLogs)) {
        markdown += `## ${type.charAt(0).toUpperCase() + type.slice(1)} Logs\n\n`;
        
        for (const log of typeLogs) {
          const date = new Date(log.timestamp).toISOString();
          markdown += `### ${date} - ${log.component}\n\n`;
          markdown += `**Message:** ${log.message}\n\n`;
          
          if (log.details) {
            try {
              const details = JSON.parse(log.details);
              markdown += '**Details:**\n```json\n';
              markdown += JSON.stringify(details, null, 2);
              markdown += '\n```\n\n';
            } catch {
              markdown += `**Details:** ${log.details}\n\n`;
            }
          }
          
          if (log.stackTrace) {
            markdown += '**Stack Trace:**\n```\n';
            markdown += log.stackTrace;
            markdown += '\n```\n\n';
          }
          
          if (log.type === 'error') {
            markdown += `**Fixed:** ${log.fixed ? 'Yes' : 'No'}\n\n`;
          }
          
          if (log.relatedFiles && log.relatedFiles.length > 0) {
            markdown += '**Related Files:**\n';
            for (const file of log.relatedFiles) {
              markdown += `- ${file}\n`;
            }
            markdown += '\n';
          }
          
          markdown += '---\n\n';
        }
      }
      
      return markdown;
    } catch (error) {
      console.error('Failed to export logs to Markdown:', error);
      throw error;
    }
  }
}
