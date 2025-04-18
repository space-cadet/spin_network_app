// src/components/logs/explorer/LogExplorerPage.tsx
import React, { useEffect } from 'react';
import FileExplorer from './FileExplorer';
import { initializeBrowserFS } from '../../../utils/browserFSConfig';

const LogExplorerPage: React.FC = () => {
  const [fsInitialized, setFsInitialized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Initialize BrowserFS when component mounts
  useEffect(() => {
    const initFS = async () => {
      try {
        await initializeBrowserFS();
        setFsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize BrowserFS:', err);
        setError(`Failed to initialize file system: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    initFS();
  }, []);

  return (
    <div className="container mx-auto p-4 h-full">
      <h1 className="text-2xl font-bold mb-4">Log Files Explorer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!fsInitialized && !error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Initializing file system...</p>
          </div>
        </div>
      ) : fsInitialized ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden h-[calc(100vh-8rem)]">
          <FileExplorer />
        </div>
      ) : null}
    </div>
  );
};

export default LogExplorerPage;
