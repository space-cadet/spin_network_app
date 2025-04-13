/**
 * Migration utilities for log data
 */
import { LogService } from '../services/logService';
import { LogEntry, ErrorLogEntry, EditLogEntry } from '../models/logModels';

/**
 * Parse error logs from the errorLog.md file
 * @param content Content of the errorLog.md file
 * @returns Array of parsed error logs
 */
export function parseErrorLogs(content: string): Omit<ErrorLogEntry, 'id'>[] {
  const errorLogs: Omit<ErrorLogEntry, 'id'>[] = [];
  
  // Match each error log section
  const errorRegex = /## (\d{4}-\d{2}-\d{2} \d{2}:\d{2}[^\n]*) - ([^\n]+)\s*\n\n\*\*File:\*\* `([^`]+)`.*?\n\n\*\*Error Message:\*\*\s*(?:```\s*([\s\S]*?)```|([^\n]*))(?:[\s\S]*?\*\*Cause:\*\*\s*([\s\S]*?)(?:\n\n\*\*Fix:\*\*|\n\n\*\*Affected Files|\n$))?(?:[\s\S]*?\*\*Fix:\*\*\s*([\s\S]*?)(?:\n\n\*\*Affected Files|\n$))?(?:[\s\S]*?\*\*Affected Files:\*\*\s*([\s\S]*?)(?:\n\n---|$))?/g;
  
  let match;
  while ((match = errorRegex.exec(content)) !== null) {
    const [
      _,
      timestampStr,
      message,
      filePath,
      errorMessageCode,
      errorMessagePlain,
      causeText,
      fixText,
      affectedFilesText
    ] = match;
    
    // Parse timestamp
    const timestamp = new Date(timestampStr).getTime();
    
    // Parse affected files
    const affectedFiles = affectedFilesText
      ? affectedFilesText.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim())
        .filter(Boolean)
      : [];
    
    // Determine if this error has been fixed
    const fixed = !!fixText;
    
    // Create the error log entry
    const errorLog: Omit<ErrorLogEntry, 'id'> = {
      timestamp,
      type: 'error',
      component: filePath,
      message,
      details: JSON.stringify({
        cause: causeText?.trim() || '',
        fix: fixText?.trim() || '',
        errorContext: errorMessageCode || errorMessagePlain || ''
      }),
      errorMessage: errorMessageCode || errorMessagePlain || message,
      relatedFiles: affectedFiles,
      fixed,
      fixedTimestamp: fixed ? timestamp + 3600000 : undefined // Assume fix happened within an hour
    };
    
    errorLogs.push(errorLog);
  }
  
  return errorLogs;
}

/**
 * Parse edit history from the edit_history.md file
 * @param content Content of the edit_history.md file
 * @returns Array of parsed edit logs
 */
export function parseEditHistory(content: string): Omit<EditLogEntry, 'id'>[] {
  const editLogs: Omit<EditLogEntry, 'id'>[] = [];
  
  // Match each edit history section
  const editRegex = /## (\d{4}-\d{2}-\d{2})[^\n]*: ([^\n]+)\s*\n\n(?:Modified files:\s*\n([\s\S]*?)(?:\n\n(?:New files:|Issues addressed:|$)))?(?:New files:\s*\n([\s\S]*?)(?:\n\n(?:Issues addressed:|$)))?(?:Issues addressed:\s*\n([\s\S]*?)(?:\n\n|$))?/g;
  
  let match;
  while ((match = editRegex.exec(content)) !== null) {
    const [
      _,
      dateStr,
      message,
      modifiedFilesText,
      newFilesText,
      issuesText
    ] = match;
    
    // Parse date (using noon to avoid timezone issues)
    const date = new Date(`${dateStr}T12:00:00`);
    const timestamp = date.getTime();
    
    // Parse modified files
    const modifiedFiles = modifiedFilesText
      ? modifiedFilesText.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim())
        .filter(Boolean)
      : [];
    
    // Parse new files
    const newFiles = newFilesText
      ? newFilesText.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim())
        .filter(Boolean)
      : [];
    
    // Parse issues addressed
    const issues = issuesText
      ? issuesText.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-') || line.startsWith('*'))
        .map(line => line.substring(1).trim())
        .filter(Boolean)
      : [];
    
    // Create an edit log entry for each file
    const allFiles = [...modifiedFiles, ...newFiles];
    
    for (const filePath of allFiles) {
      const isNewFile = newFiles.includes(filePath);
      const changeType = isNewFile ? 'create' : 'update';
      const fileExt = filePath.split('.').pop() || '';
      
      const editLog: Omit<EditLogEntry, 'id'> = {
        timestamp,
        type: 'edit',
        component: 'edit_history',
        message: `${changeType} ${filePath}`,
        filePath,
        changeType,
        fileType: fileExt,
        details: JSON.stringify({
          batchDescription: message,
          issues: issues,
          isNewFile,
          fullEntry: {
            date: dateStr,
            message,
            modifiedFiles,
            newFiles,
            issues
          }
        }),
        relatedFiles: allFiles.filter(f => f !== filePath)
      };
      
      editLogs.push(editLog);
    }
  }
  
  return editLogs;
}

/**
 * Migrate logs from markdown files to the database
 * @param errorLogContent Content of the errorLog.md file
 * @param editHistoryContent Content of the edit_history.md file
 * @returns Summary of the migration
 */
export async function migrateLogsFromMarkdown(
  errorLogContent: string,
  editHistoryContent: string
): Promise<{
  errorLogsMigrated: number;
  editLogsMigrated: number;
  totalLogsMigrated: number;
}> {
  try {
    // Parse error logs
    const errorLogs = parseErrorLogs(errorLogContent);
    
    // Parse edit history
    const editLogs = parseEditHistory(editHistoryContent);
    
    // Add logs to the database
    let errorLogsMigrated = 0;
    let editLogsMigrated = 0;
    
    // Add error logs
    for (const errorLog of errorLogs) {
      await LogService.addLog(errorLog);
      errorLogsMigrated++;
    }
    
    // Add edit logs
    for (const editLog of editLogs) {
      await LogService.addLog(editLog);
      editLogsMigrated++;
    }
    
    return {
      errorLogsMigrated,
      editLogsMigrated,
      totalLogsMigrated: errorLogsMigrated + editLogsMigrated
    };
  } catch (error) {
    console.error('Failed to migrate logs from markdown:', error);
    throw error;
  }
}

/**
 * Initialize logs from memory bank markdown files
 * @param errorLogPath Path to errorLog.md
 * @param editHistoryPath Path to edit_history.md
 * @returns Summary of the migration
 */
export async function initLogsFromMemoryBank(
  errorLogPath: string,
  editHistoryPath: string
): Promise<{
  errorLogsMigrated: number;
  editLogsMigrated: number;
  totalLogsMigrated: number;
}> {
  try {
    // Use fetch to read the files
    const errorLogResponse = await fetch(errorLogPath);
    const editHistoryResponse = await fetch(editHistoryPath);
    
    if (!errorLogResponse.ok || !editHistoryResponse.ok) {
      throw new Error('Failed to read memory bank files');
    }
    
    const errorLogContent = await errorLogResponse.text();
    const editHistoryContent = await editHistoryResponse.text();
    
    // Migrate logs
    return await migrateLogsFromMarkdown(errorLogContent, editHistoryContent);
  } catch (error) {
    console.error('Failed to initialize logs from memory bank:', error);
    throw error;
  }
}
