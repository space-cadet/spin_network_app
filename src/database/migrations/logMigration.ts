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
  // Basic validation
  if (!content || typeof content !== 'string') {
    console.error('Invalid content passed to parseErrorLogs:', content);
    return [];
  }
  
  console.log(`Attempting to parse error logs from content of length ${content.length}`);
  
  // Try to get a structure overview
  const headings = content.match(/##\s+[^\n]+/g);
  console.log(`Found ${headings?.length || 0} potential error log sections`);
  if (headings && headings.length > 0) {
    console.log('Sample headings:', headings.slice(0, 3));
  }
  
  // Try multiple strategies and combine the results
  const standardLogs = parseStandardErrorLogs(content);
  const simpleLogs = parseSimpleErrorLogs(content);
  const fallbackLogs = parseFallbackErrorLogs(content);
  
  console.log(`Parsing results: 
    - Standard format: ${standardLogs.length} logs
    - Simple format: ${simpleLogs.length} logs
    - Fallback format: ${fallbackLogs.length} logs`);
  
  const errorLogs = [
    ...standardLogs,
    ...simpleLogs,
    ...fallbackLogs
  ];
  
  console.log(`Parsed ${errorLogs.length} total error logs`);
  return errorLogs;
}

// Parse error logs with the standard format
function parseStandardErrorLogs(content: string): Omit<ErrorLogEntry, 'id'>[] {
  const errorLogs: Omit<ErrorLogEntry, 'id'>[] = [];
  
  // Match each error log section with the standard format
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
  
  console.log(`Parsed ${errorLogs.length} standard format error logs`);
  return errorLogs;
}

// Parse error logs with a simpler format
function parseSimpleErrorLogs(content: string): Omit<ErrorLogEntry, 'id'>[] {
  const errorLogs: Omit<ErrorLogEntry, 'id'>[] = [];
  
  // Match error sections with a simpler format
  const errorRegex = /## ([^\n]+): ([^\n]+)\s*\n\n\*\*File:\*\* `([^`]+)`\s*\n\n([\s\S]*?)(?=\n\n## |$)/g;
  
  let match;
  while ((match = errorRegex.exec(content)) !== null) {
    const [_, dateSection, errorTitle, filePath, errorDetails] = match;
    
    // Try to parse a date from the section heading
    let timestamp: number;
    const isoDateMatch = dateSection.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
    
    if (isoDateMatch) {
      timestamp = new Date(isoDateMatch[1]).getTime();
    } else {
      try {
        timestamp = new Date(dateSection).getTime();
        if (isNaN(timestamp)) {
          timestamp = Date.now();
        }
      } catch (e) {
        timestamp = Date.now();
      }
    }
    
    // Extract error message if present
    const errorMessageMatch = errorDetails.match(/\*\*Error Message:\*\*\s*(?:```\s*([\s\S]*?)```|([^\n]*))/);
    const errorMessage = errorMessageMatch 
      ? (errorMessageMatch[1] || errorMessageMatch[2] || errorTitle).trim()
      : errorTitle;
    
    // Extract cause if present
    const causeMatch = errorDetails.match(/\*\*Cause:\*\*\s*([\s\S]*?)(?=\n\n\*\*|\n$)/);
    const causeText = causeMatch ? causeMatch[1].trim() : '';
    
    // Extract fix if present
    const fixMatch = errorDetails.match(/\*\*Fix:\*\*\s*([\s\S]*?)(?=\n\n\*\*|\n$)/);
    const fixText = fixMatch ? fixMatch[1].trim() : '';
    
    // Determine if error has been fixed
    const fixed = !!fixText || errorDetails.includes('FIXED') || errorDetails.includes('RESOLVED');
    
    // Extract affected files if present
    const affectedFilesMatch = errorDetails.match(/\*\*Affected Files:\*\*\s*([\s\S]*?)(?=\n\n\*\*|\n$)/);
    const affectedFilesText = affectedFilesMatch ? affectedFilesMatch[1] : '';
    
    const affectedFiles = affectedFilesText
      ? affectedFilesText.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim())
        .filter(Boolean)
      : [];
    
    // Create the error log entry
    const errorLog: Omit<ErrorLogEntry, 'id'> = {
      timestamp,
      type: 'error',
      component: filePath,
      message: errorTitle,
      details: JSON.stringify({
        cause: causeText,
        fix: fixText,
        errorContext: errorMessage
      }),
      errorMessage,
      relatedFiles: affectedFiles,
      fixed,
      fixedTimestamp: fixed ? timestamp + 3600000 : undefined // Assume fix happened within an hour
    };
    
    errorLogs.push(errorLog);
  }
  
  console.log(`Parsed ${errorLogs.length} simple format error logs`);
  return errorLogs;
}

// Fallback parser for other error log formats
function parseFallbackErrorLogs(content: string): Omit<ErrorLogEntry, 'id'>[] {
  const errorLogs: Omit<ErrorLogEntry, 'id'>[] = [];
  
  // Find all level-2 headings which might be error entries
  const sectionRegex = /##\s+([^\n]+)(?=\n)/g;
  let sections: { title: string, startIndex: number }[] = [];
  let match;
  
  while ((match = sectionRegex.exec(content)) !== null) {
    sections.push({
      title: match[1],
      startIndex: match.index + match[0].length
    });
  }
  
  // Process each section
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const nextSection = sections[i + 1];
    const sectionEnd = nextSection ? nextSection.startIndex : content.length;
    const sectionContent = content.substring(section.startIndex, sectionEnd);
    
    // Skip if this doesn't look like an error section
    if (!section.title.includes('Error') && 
        !sectionContent.includes('Error') && 
        !sectionContent.includes('error') && 
        !sectionContent.includes('Failed') &&
        !sectionContent.includes('failed')) {
      continue;
    }
    
    // Try to extract a date
    let dateMatch = section.title.match(/(\d{4}-\d{2}-\d{2})|([A-Za-z]+ \d{1,2},? \d{4})/);
    let timestamp: number;
    
    if (dateMatch) {
      let dateStr = dateMatch[0];
      timestamp = new Date(dateStr).getTime();
      if (isNaN(timestamp)) {
        timestamp = Date.now();
      }
    } else {
      timestamp = Date.now();
    }
    
    // Try to find file path
    const filePathMatch = sectionContent.match(/File:\s*`([^`]+)`/) || 
                          sectionContent.match(/in\s+file\s+`([^`]+)`/) ||
                          sectionContent.match(/([\/\w.-]+\.[a-zA-Z]+):/);
    
    const filePath = filePathMatch ? filePathMatch[1] : 'unknown';
    
    // Extract error message
    let errorMessage = section.title;
    if (errorMessage.includes(':')) {
      errorMessage = errorMessage.split(':')[1].trim();
    }
    
    // Check if fixed
    const fixed = sectionContent.includes('FIXED') || 
                 sectionContent.includes('RESOLVED') ||
                 sectionContent.includes('fixed') ||
                 sectionContent.includes('resolved');
    
    // Create the error log entry
    const errorLog: Omit<ErrorLogEntry, 'id'> = {
      timestamp,
      type: 'error',
      component: filePath,
      message: errorMessage,
      details: JSON.stringify({
        fullContent: sectionContent
      }),
      errorMessage,
      relatedFiles: [],
      fixed,
      fixedTimestamp: fixed ? timestamp + 3600000 : undefined
    };
    
    errorLogs.push(errorLog);
  }
  
  console.log(`Parsed ${errorLogs.length} fallback format error logs`);
  return errorLogs;
}

/**
 * Parse edit history from the edit_history.md file
 * @param content Content of the edit_history.md file
 * @returns Array of parsed edit logs
 */
export function parseEditHistory(content: string): Omit<EditLogEntry, 'id'>[] {
  // Basic validation
  if (!content || typeof content !== 'string') {
    console.error('Invalid content passed to parseEditHistory:', content);
    return [];
  }
  
  console.log(`Attempting to parse edit history from content of length ${content.length}`);
  
  // Try to get a structure overview
  const headings = content.match(/##\s+[^\n]+/g);
  const subheadings = content.match(/###\s+[^\n]+/g);
  console.log(`Found ${headings?.length || 0} main sections and ${subheadings?.length || 0} subsections`);
  if (headings && headings.length > 0) {
    console.log('Sample main headings:', headings.slice(0, 3));
  }
  if (subheadings && subheadings.length > 0) {
    console.log('Sample subsection headings:', subheadings.slice(0, 3));
  }
  
  const editLogs: Omit<EditLogEntry, 'id'>[] = [];
  
  // First try to parse using the format with detailed sections (Modified/New files)
  let formattedEntries = parseFormattedEditHistory(content);
  console.log(`Formatted edit history parser found ${formattedEntries.length} entries`);
  if (formattedEntries.length > 0) {
    editLogs.push(...formattedEntries);
  }
  
  // Then try the simpler format used in more recent entries
  let simpleEntries = parseSimpleEditHistory(content);
  console.log(`Simple edit history parser found ${simpleEntries.length} entries`);
  if (simpleEntries.length > 0) {
    editLogs.push(...simpleEntries);
  }
  
  // If no entries were parsed with either method, try a very simple approach
  if (editLogs.length === 0) {
    let fallbackEntries = parseFallbackEditHistory(content);
    console.log(`Fallback edit history parser found ${fallbackEntries.length} entries`);
    editLogs.push(...fallbackEntries);
  }
  
  console.log(`Parsed ${editLogs.length} total edit logs`);
  return editLogs;
}

function parseFormattedEditHistory(content: string): Omit<EditLogEntry, 'id'>[] {
  const editLogs: Omit<EditLogEntry, 'id'>[] = [];
  
  // Match each edit history section with explicit "Modified files:" headers
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
  
  console.log(`Parsed ${editLogs.length} formatted edit history entries`);
  return editLogs;
}

function parseSimpleEditHistory(content: string): Omit<EditLogEntry, 'id'>[] {
  const editLogs: Omit<EditLogEntry, 'id'>[] = [];
  
  // Pattern for "### [timestamp] - [Task Description]" format
  const simpleRegex = /### (\d{2}:\d{2}|\d{1,2}:\d{2} [AP]M) - ([^\n]+)\s*\n\n([\s\S]*?)(?=\n\n### |\n## |\n# |$)/g;
  
  let match;
  while ((match = simpleRegex.exec(content)) !== null) {
    const [_, timeStr, taskDesc, details] = match;
    
    // Extract date from nearest preceding heading
    const sectionText = content.substring(0, match.index);
    const dateMatch = /## ([A-Za-z]+ \d{1,2}, \d{4}|(\d{4}-\d{2}-\d{2}))/.exec(sectionText);
    if (!dateMatch) continue;
    
    const dateStr = dateMatch[1];
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) continue;
    
    // Adjust date with the time
    if (timeStr.match(/\d{2}:\d{2}/)) {
      const [hours, minutes] = timeStr.split(':').map(n => parseInt(n, 10));
      parsedDate.setHours(hours, minutes);
    } else if (timeStr.match(/\d{1,2}:\d{2} [AP]M/)) {
      const [timeComponent, ampm] = timeStr.split(' ');
      let [hours, minutes] = timeComponent.split(':').map(n => parseInt(n, 10));
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      parsedDate.setHours(hours, minutes);
    }
    
    const timestamp = parsedDate.getTime();
    
    // Extract file paths from details
    const fileRegex = /- (?:Modified|Updated|Created)\s+`([^`]+)`/g;
    const files: string[] = [];
    let fileMatch;
    
    while ((fileMatch = fileRegex.exec(details)) !== null) {
      files.push(fileMatch[1]);
    }
    
    // Create an edit log entry for each file
    for (const filePath of files) {
      const fileExt = filePath.split('.').pop() || '';
      
      const editLog: Omit<EditLogEntry, 'id'> = {
        timestamp,
        type: 'edit',
        component: 'edit_history',
        message: `update ${filePath}`,
        filePath,
        changeType: 'update',
        fileType: fileExt,
        details: JSON.stringify({
          batchDescription: taskDesc,
          fullEntry: {
            date: dateStr,
            time: timeStr,
            message: taskDesc,
            details: details
          }
        }),
        relatedFiles: files.filter(f => f !== filePath)
      };
      
      editLogs.push(editLog);
    }
  }
  
  console.log(`Parsed ${editLogs.length} simple edit history entries`);
  return editLogs;
}

function parseFallbackEditHistory(content: string): Omit<EditLogEntry, 'id'>[] {
  const editLogs: Omit<EditLogEntry, 'id'>[] = [];
  
  // Find all headings that might indicate edit sections
  const sectionRegex = /^#+\s+(.*?)(?=\n)/gm;
  const fileLineRegex = /[-*]\s+([^:\n]+)(?::|$)/gm;
  
  let sections: { title: string, startIndex: number }[] = [];
  let match;
  
  while ((match = sectionRegex.exec(content)) !== null) {
    sections.push({
      title: match[1],
      startIndex: match.index + match[0].length
    });
  }
  
  // Process each section
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const nextSection = sections[i + 1];
    const sectionEnd = nextSection ? nextSection.startIndex : content.length;
    const sectionContent = content.substring(section.startIndex, sectionEnd);
    
    // Try to extract a date from the title
    let dateMatch = section.title.match(/(\d{4}[-/]\d{2}[-/]\d{2})|([A-Za-z]+ \d{1,2},? \d{4})/);
    if (!dateMatch) continue;
    
    let dateStr = dateMatch[0];
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) continue;
    
    const timestamp = parsedDate.getTime();
    
    // Find all file paths in the section content
    let filePaths: string[] = [];
    let fileMatch;
    
    while ((fileMatch = fileLineRegex.exec(sectionContent)) !== null) {
      filePaths.push(fileMatch[1].trim());
    }
    
    // If we found files, create log entries
    for (const filePath of filePaths) {
      // Skip if it doesn't look like a file path
      if (!filePath.includes('.') && !filePath.includes('/')) continue;
      
      const fileExt = filePath.split('.').pop() || '';
      
      const editLog: Omit<EditLogEntry, 'id'> = {
        timestamp,
        type: 'edit',
        component: 'edit_history',
        message: `update ${filePath}`,
        filePath,
        changeType: 'update',
        fileType: fileExt,
        details: JSON.stringify({
          batchDescription: section.title,
          fullEntry: {
            date: dateStr,
            message: section.title,
            details: sectionContent
          }
        }),
        relatedFiles: []
      };
      
      editLogs.push(editLog);
    }
  }
  
  console.log(`Parsed ${editLogs.length} fallback edit history entries`);
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
  skippedDuplicates: number;
}> {
  try {
    // Parse error logs
    const errorLogs = parseErrorLogs(errorLogContent);
    
    // Parse edit history
    const editLogs = parseEditHistory(editHistoryContent);
    
    console.log(`Found ${errorLogs.length} error logs and ${editLogs.length} edit logs to migrate`);
    
    // Check for existing entries to avoid duplicates
    const existingEntries = await checkExistingEntries();
    console.log(`Database has ${existingEntries.total} existing log entries`);
    
    // Add logs to the database
    let errorLogsMigrated = 0;
    let editLogsMigrated = 0;
    let skippedDuplicates = 0;
    
    // Add error logs (filtering out likely duplicates)
    for (const errorLog of errorLogs) {
      // Skip if we already have an entry with this timestamp and message
      const isDuplicate = await isExistingEntry('error', errorLog.timestamp, errorLog.message);
      if (isDuplicate) {
        skippedDuplicates++;
        continue;
      }
      
      try {
        await LogService.addLog(errorLog);
        errorLogsMigrated++;
      } catch (error) {
        console.error('Failed to add error log:', error);
      }
    }
    
    // Add edit logs (filtering out likely duplicates)
    for (const editLog of editLogs) {
      // Skip if we already have an entry with this timestamp and file path
      const isDuplicate = await isExistingEntry('edit', editLog.timestamp, editLog.filePath);
      if (isDuplicate) {
        skippedDuplicates++;
        continue;
      }
      
      try {
        await LogService.addLog(editLog);
        editLogsMigrated++;
      } catch (error) {
        console.error('Failed to add edit log:', error);
      }
    }
    
    return {
      errorLogsMigrated,
      editLogsMigrated,
      totalLogsMigrated: errorLogsMigrated + editLogsMigrated,
      skippedDuplicates
    };
  } catch (error) {
    console.error('Failed to migrate logs from markdown:', error);
    throw error;
  }
}

/**
 * Check for existing entries in the database
 * @returns Counts of existing log entries by type
 */
async function checkExistingEntries(): Promise<{ 
  error: number, 
  edit: number, 
  total: number 
}> {
  try {
    const db = (await import('../db.config')).db;
    
    // Count existing entries by type
    const errorCount = await db.logs.where('type').equals('error').count();
    const editCount = await db.logs.where('type').equals('edit').count();
    const totalCount = await db.logs.count();
    
    return {
      error: errorCount,
      edit: editCount,
      total: totalCount
    };
  } catch (error) {
    console.error('Failed to check existing entries:', error);
    return { error: 0, edit: 0, total: 0 };
  }
}

/**
 * Check if an entry likely already exists in the database
 * @param type Type of log entry
 * @param timestamp Timestamp of the entry
 * @param identifier Message or file path to identify the entry
 * @returns True if a similar entry already exists
 */
async function isExistingEntry(
  type: 'error' | 'edit',
  timestamp: number,
  identifier: string
): Promise<boolean> {
  try {
    const db = (await import('../db.config')).db;
    
    // Get a 24-hour window around the timestamp
    const startTime = timestamp - (12 * 60 * 60 * 1000);
    const endTime = timestamp + (12 * 60 * 60 * 1000);
    
    // Check if we have a similar entry
    if (type === 'error') {
      // For errors, check by timestamp and message
      const existingErrors = await db.logs
        .where('type').equals('error')
        .and(log => 
          log.timestamp >= startTime && 
          log.timestamp <= endTime && 
          log.message.includes(identifier.substring(0, 20))
        )
        .toArray();
        
      return existingErrors.length > 0;
    } else {
      // For edits, check by timestamp and file path
      const existingEdits = await db.logs
        .where('type').equals('edit')
        .and(log => 
          log.timestamp >= startTime && 
          log.timestamp <= endTime && 
          (log as any).filePath === identifier
        )
        .toArray();
        
      return existingEdits.length > 0;
    }
  } catch (error) {
    console.error('Failed to check for existing entry:', error);
    return false;
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
  skippedDuplicates: number;
}> {
  try {
    console.log('Reading memory bank files...');
    
    // Use window.fs to read the files
    let errorLogContent: string;
    let editHistoryContent: string;
    
    try {
      if (!window.fs || typeof window.fs.readFile !== 'function') {
        throw new Error('File system API is not available');
      }
      
      const errorLogData = await window.fs.readFile(errorLogPath, { encoding: 'utf8' });
      errorLogContent = typeof errorLogData === 'string' ? errorLogData : new TextDecoder().decode(errorLogData as ArrayBuffer);
      console.log(`Successfully read error log file (${errorLogContent.length} bytes)`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to read error log file:', error);
      throw new Error('Failed to read error log file: ' + errorMessage);
    }
    
    try {
      if (!window.fs || typeof window.fs.readFile !== 'function') {
        throw new Error('File system API is not available');
      }
      
      const editHistoryData = await window.fs.readFile(editHistoryPath, { encoding: 'utf8' });
      editHistoryContent = typeof editHistoryData === 'string' ? editHistoryData : new TextDecoder().decode(editHistoryData as ArrayBuffer);
      console.log(`Successfully read edit history file (${editHistoryContent.length} bytes)`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to read edit history file:', error);
      throw new Error('Failed to read edit history file: ' + errorMessage);
    }
    
    if (!errorLogContent || !editHistoryContent) {
      throw new Error('One or both files were empty');
    }
    
    console.log('Starting log migration process...');
    // Migrate logs
    return await migrateLogsFromMarkdown(errorLogContent, editHistoryContent);
  } catch (error) {
    console.error('Failed to initialize logs from memory bank:', error);
    throw error;
  }
}
