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
    <div className="p-4 primereact-scope">
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
          text={`Migration completed: ${result.totalLogsMigrated} logs migrated (${result.errorLogsMigrated} errors, ${result.editLogsMigrated} edits)`} 
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
