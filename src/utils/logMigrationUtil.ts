/**
 * Utility to migrate logs from Markdown files to the database
 */
import { LogService } from '../database/services/logService';
import { migrateLogsFromMarkdown } from '../database/migrations/logMigration';

/**
 * Fetch and migrate logs from markdown files
 * @param errorLogPath Path to the error log markdown file 
 * @param editHistoryPath Path to the edit history markdown file
 * @returns Summary of migration results
 */
export async function migrateMarkdownLogs(
  errorLogPath: string = '/Users/deepak/code/spin_network_app/memory-bank/errorLog.md',
  editHistoryPath: string = '/Users/deepak/code/spin_network_app/memory-bank/edit_history.md'
): Promise<{
  errorLogsMigrated: number;
  editLogsMigrated: number;
  totalLogsMigrated: number;
  success: boolean;
  error?: string;
}> {
  try {
    // Fetch the markdown content
    const errorLogResponse = await fetch(errorLogPath);
    const editHistoryResponse = await fetch(editHistoryPath);
    
    if (!errorLogResponse.ok || !editHistoryResponse.ok) {
      throw new Error('Failed to fetch markdown files');
    }
    
    const errorLogContent = await errorLogResponse.text();
    const editHistoryContent = await editHistoryResponse.text();
    
    // Migrate logs
    const result = await migrateLogsFromMarkdown(errorLogContent, editHistoryContent);
    
    return {
      ...result,
      success: true
    };
  } catch (error) {
    console.error('Error migrating markdown logs:', error);
    return {
      errorLogsMigrated: 0,
      editLogsMigrated: 0,
      totalLogsMigrated: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Create a React component to migrate logs with progress indicator
 * This can be used in the application UI
 */
export function createLogMigrationComponent() {
  const migrationCode = `
  import React, { useState } from 'react';
  import { Button } from 'primereact/button';
  import { ProgressBar } from 'primereact/progressbar';
  import { Message } from 'primereact/message';
  import { migrateMarkdownLogs } from '../../utils/logMigrationUtil';

  export const LogMigrationTool: React.FC = () => {
    const [migrating, setMigrating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleMigration = async () => {
      setMigrating(true);
      setError(null);
      try {
        const migrationResult = await migrateMarkdownLogs();
        setResult(migrationResult);
        if (!migrationResult.success) {
          setError(migrationResult.error || 'Unknown error during migration');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setMigrating(false);
      }
    };

    return (
      <div className="p-4">
        <h2 className="text-xl mb-4">Log Migration Tool</h2>
        <p className="mb-4">
          This tool will migrate logs from the Markdown files (errorLog.md and edit_history.md) to the database.
        </p>
        
        {error && (
          <Message severity="error" text={error} className="w-full mb-4" />
        )}
        
        {result && result.success && (
          <Message 
            severity="success" 
            text={\`Migration completed: \${result.totalLogsMigrated} logs migrated (\${result.errorLogsMigrated} errors, \${result.editLogsMigrated} edits)\`} 
            className="w-full mb-4" 
          />
        )}
        
        {migrating ? (
          <div className="mb-4">
            <p className="mb-2">Migrating logs...</p>
            <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
          </div>
        ) : (
          <Button 
            label="Migrate Logs" 
            icon="pi pi-database" 
            onClick={handleMigration} 
            disabled={migrating}
            className="mb-4"
          />
        )}
        
        {result && (
          <div className="mt-4 p-3 border-1 surface-border surface-card border-round">
            <h3 className="text-lg mb-2">Migration Results</h3>
            <ul className="list-none p-0 m-0">
              <li className="mb-2">
                <span className="font-semibold">Error logs migrated:</span> {result.errorLogsMigrated}
              </li>
              <li className="mb-2">
                <span className="font-semibold">Edit logs migrated:</span> {result.editLogsMigrated}
              </li>
              <li className="mb-2">
                <span className="font-semibold">Total logs migrated:</span> {result.totalLogsMigrated}
              </li>
              <li>
                <span className="font-semibold">Status:</span> {result.success ? 'Success' : 'Failed'}
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };
  `;
  
  return migrationCode;
}

/**
 * Command-line function to migrate logs
 * This can be used in a script or from the console
 */
export async function migrateLogsFromConsole() {
  console.log('Starting log migration from Markdown files to database...');
  
  try {
    const result = await migrateMarkdownLogs();
    
    if (result.success) {
      console.log('✅ Migration completed successfully:');
      console.log(`- Error logs migrated: ${result.errorLogsMigrated}`);
      console.log(`- Edit logs migrated: ${result.editLogsMigrated}`);
      console.log(`- Total logs migrated: ${result.totalLogsMigrated}`);
    } else {
      console.error('❌ Migration failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Migration failed with exception:', error);
    throw error;
  }
}
