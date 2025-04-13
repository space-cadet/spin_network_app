/**
 * Log entry models for database storage
 */

/**
 * Represents a log entry in the database
 */
export interface LogEntry {
  id?: number;         // Auto-incremented primary key
  timestamp: number;   // When the log entry was created
  type: LogType;       // Type of log entry
  component: string;   // Component or file associated with the log
  message: string;     // Log message
  details?: string;    // Additional structured details (JSON string)
  stackTrace?: string; // For error logs
  fixed?: boolean;     // For error logs - has this been fixed?
  relatedFiles?: string[]; // Files related to this log entry
}

/**
 * Type of log entry
 */
export type LogType = 'error' | 'edit' | 'info' | 'warning' | 'debug';

/**
 * Extended error log entry with additional error-specific fields
 */
export interface ErrorLogEntry extends LogEntry {
  type: 'error';
  errorMessage: string; // The original error message
  errorCode?: string;   // Error code if available
  fixed: boolean;       // Whether the error has been fixed
  fixedTimestamp?: number; // When the error was fixed
  fixedBy?: string;     // Who fixed the error
  fixDetails?: string;  // Details about the fix
}

/**
 * Extended edit log entry with additional edit-specific fields
 */
export interface EditLogEntry extends LogEntry {
  type: 'edit';
  filePath: string;    // Path to the edited file
  changeType: 'create' | 'update' | 'delete'; // Type of change
  fileType?: string;   // Type of file (e.g., 'tsx', 'css', 'json')
  patch?: string;      // Optional diff/patch of the changes
  linesChanged?: number; // Number of lines changed
}

/**
 * Log query options for filtering logs
 */
export interface LogQueryOptions {
  type?: LogType | LogType[];  // Filter by type(s)
  component?: string;          // Filter by component
  startTime?: number;          // Filter by start time
  endTime?: number;            // Filter by end time
  fixed?: boolean;             // Filter by fixed status (for errors)
  search?: string;             // Search term for message or details
  limit?: number;              // Limit number of results
  offset?: number;             // Offset for pagination
  sort?: 'asc' | 'desc';       // Sort direction by timestamp
}
