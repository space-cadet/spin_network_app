/**
 * Utility for log file rotation following the log rotation protocol
 */
import fs from 'fs';
import path from 'path';

// Constants
const MAX_FILE_SIZE_KB = 500; // 500KB
const MAX_ENTRIES = 200;
const MAX_ARCHIVED_LOGS = 10;
const MEMORY_BANK_DIR = '/Users/deepak/code/spin_network_app/memory-bank';
const ARCHIVE_DIR = path.join(MEMORY_BANK_DIR, 'archive');

/**
 * Log file information
 */
interface LogFileInfo {
  path: string;
  size: number;
  entries: number;
  lastModified: Date;
}

/**
 * Check if a log file needs rotation
 * @param filePath Path to the log file
 * @param maxSizeKB Maximum file size in KB
 * @param maxEntries Maximum number of entries
 * @returns True if rotation is needed, false otherwise
 */
export async function checkRotationNeeded(
  filePath: string,
  maxSizeKB: number = MAX_FILE_SIZE_KB,
  maxEntries: number = MAX_ENTRIES
): Promise<boolean> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return false;
    }

    // Check file size
    const stats = fs.statSync(filePath);
    const fileSizeKB = stats.size / 1024;
    
    if (fileSizeKB >= maxSizeKB) {
      console.log(`Log rotation needed: ${filePath} exceeds size limit (${fileSizeKB.toFixed(2)}KB > ${maxSizeKB}KB)`);
      return true;
    }
    
    // Count entries (for error logs, count "## " pattern, for edit history count "#### " pattern)
    const content = fs.readFileSync(filePath, 'utf8');
    let entryCount = 0;
    
    if (filePath.includes('errorLog')) {
      // Count error entries
      entryCount = (content.match(/^## \d{4}-\d{2}-\d{2}/gm) || []).length;
    } else if (filePath.includes('edit_history')) {
      // Count edit history entries
      entryCount = (content.match(/^#### \[\d{2}:\d{2}/gm) || []).length;
    }
    
    if (entryCount >= maxEntries) {
      console.log(`Log rotation needed: ${filePath} exceeds entry limit (${entryCount} > ${maxEntries})`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking rotation for ${filePath}:`, error);
    return false;
  }
}

/**
 * Get archive filename with timestamp
 * @param originalPath Original file path
 * @returns Archive file path
 */
function getArchiveFilename(originalPath: string): string {
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const basename = path.basename(originalPath, '.md');
  const yearDir = path.join(ARCHIVE_DIR, String(now.getFullYear()));
  
  // Create year directory if it doesn't exist
  if (!fs.existsSync(yearDir)) {
    fs.mkdirSync(yearDir, { recursive: true });
  }
  
  return path.join(yearDir, `${basename}-${timestamp}.md`);
}

/**
 * Create a new empty log file with the standard template
 * @param filePath Log file path
 * @param isErrorLog Whether the file is an error log
 */
function createEmptyLogFile(filePath: string, isErrorLog: boolean): void {
  const now = new Date();
  const formattedDate = now.toISOString().split('T')[0];
  
  let template = '';
  
  if (isErrorLog) {
    template = `# Error Log

*Created: ${formattedDate}*

*This log was created as part of log rotation on ${now.toISOString()}*

`;
  } else {
    template = `# Edit History

*Created: ${formattedDate}*

*This log was created as part of log rotation on ${now.toISOString()}*

## File Modification Log

`;
  }
  
  fs.writeFileSync(filePath, template, 'utf8');
}

/**
 * Update the archive index file
 */
async function updateArchiveIndex(): Promise<void> {
  try {
    const indexPath = path.join(ARCHIVE_DIR, 'index.md');
    const archivedLogs: LogFileInfo[] = [];
    
    // Recursively get all .md files in archive directory
    function scanDir(dir: string) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDir(filePath);
        } else if (file.endsWith('.md')) {
          const content = fs.readFileSync(filePath, 'utf8');
          let entries = 0;
          
          if (file.includes('errorLog')) {
            entries = (content.match(/^## \d{4}-\d{2}-\d{2}/gm) || []).length;
          } else if (file.includes('edit_history')) {
            entries = (content.match(/^#### \[\d{2}:\d{2}/gm) || []).length;
          }
          
          archivedLogs.push({
            path: filePath,
            size: stat.size / 1024, // KB
            entries,
            lastModified: stat.mtime
          });
        }
      }
    }
    
    scanDir(ARCHIVE_DIR);
    
    // Sort by last modified date (newest first)
    archivedLogs.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    
    // Generate index content
    let indexContent = `# Archived Log Files

*Last Updated: ${new Date().toISOString()}*

| Filename | Type | Entries | Size (KB) | Last Modified |
|----------|------|---------|-----------|---------------|
`;
    
    for (const log of archivedLogs) {
      const filename = path.basename(log.path);
      const type = filename.includes('errorLog') ? 'Error Log' : 'Edit History';
      const relPath = log.path.replace(MEMORY_BANK_DIR, '.');
      
      indexContent += `| [${filename}](${relPath}) | ${type} | ${log.entries} | ${log.size.toFixed(2)} | ${log.lastModified.toISOString()} |\n`;
    }
    
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log(`Updated archive index at ${indexPath}`);
  } catch (error) {
    console.error('Error updating archive index:', error);
  }
}

/**
 * Rotate a log file
 * @param filePath Log file path
 * @returns Path to the new file
 */
export async function rotateLogFile(filePath: string): Promise<string> {
  try {
    console.log(`Rotating log file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    // Ensure archive directory exists
    if (!fs.existsSync(ARCHIVE_DIR)) {
      fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }
    
    // Get archive filename
    const archivePath = getArchiveFilename(filePath);
    
    // Copy current file to archive
    fs.copyFileSync(filePath, archivePath);
    console.log(`Copied ${filePath} to ${archivePath}`);
    
    // Create new empty log file
    const isErrorLog = path.basename(filePath).includes('errorLog');
    createEmptyLogFile(filePath, isErrorLog);
    console.log(`Created new empty log file: ${filePath}`);
    
    // Update archive index
    await updateArchiveIndex();
    
    // Cleanup old archives if needed
    await cleanupOldArchives();
    
    return filePath;
  } catch (error) {
    console.error(`Error rotating log file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Clean up old archived logs, keeping only the most recent ones
 */
async function cleanupOldArchives(): Promise<void> {
  try {
    const errorLogs: string[] = [];
    const editLogs: string[] = [];
    
    // Recursively get all .md files in archive directory
    function scanDir(dir: string) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDir(filePath);
        } else if (file.endsWith('.md')) {
          if (file.includes('errorLog')) {
            errorLogs.push(filePath);
          } else if (file.includes('edit_history')) {
            editLogs.push(filePath);
          }
        }
      }
    }
    
    scanDir(ARCHIVE_DIR);
    
    // Sort by last modified date (oldest first)
    const sortByDate = (a: string, b: string) => {
      const statA = fs.statSync(a);
      const statB = fs.statSync(b);
      return statA.mtime.getTime() - statB.mtime.getTime();
    };
    
    errorLogs.sort(sortByDate);
    editLogs.sort(sortByDate);
    
    // Remove oldest logs if exceeding limit
    while (errorLogs.length > MAX_ARCHIVED_LOGS) {
      const oldestLog = errorLogs.shift();
      if (oldestLog) {
        fs.unlinkSync(oldestLog);
        console.log(`Removed old archive: ${oldestLog}`);
      }
    }
    
    while (editLogs.length > MAX_ARCHIVED_LOGS) {
      const oldestLog = editLogs.shift();
      if (oldestLog) {
        fs.unlinkSync(oldestLog);
        console.log(`Removed old archive: ${oldestLog}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old archives:', error);
  }
}

/**
 * Check and rotate logs if needed
 */
export async function checkAndRotateLogs(): Promise<void> {
  try {
    const errorLogPath = path.join(MEMORY_BANK_DIR, 'errorLog.md');
    const editHistoryPath = path.join(MEMORY_BANK_DIR, 'edit_history.md');
    
    // Check if logs need rotation
    const errorLogNeedsRotation = await checkRotationNeeded(errorLogPath);
    const editHistoryNeedsRotation = await checkRotationNeeded(editHistoryPath);
    
    // Rotate logs if needed
    if (errorLogNeedsRotation) {
      await rotateLogFile(errorLogPath);
    }
    
    if (editHistoryNeedsRotation) {
      await rotateLogFile(editHistoryPath);
    }
  } catch (error) {
    console.error('Error checking and rotating logs:', error);
  }
}

/**
 * Initialize the archive directory and index
 */
export async function initializeLogArchive(): Promise<void> {
  try {
    // Create archive directory if it doesn't exist
    if (!fs.existsSync(ARCHIVE_DIR)) {
      fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
      console.log(`Created archive directory: ${ARCHIVE_DIR}`);
    }
    
    // Update archive index
    await updateArchiveIndex();
  } catch (error) {
    console.error('Error initializing log archive:', error);
  }
}
