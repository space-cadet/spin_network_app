import React, { useState } from 'react';
import { OriginalSimulationLogsPanel } from './index';
import { LogViewerAdapter, LogMigrationTool } from '../logs';

/**
 * Enhanced Logs Panel that can display both simulation logs and application logs
 */
const EnhancedLogsPanel: React.FC = () => {
  const [logType, setLogType] = useState<'simulation' | 'application'>('simulation');

  return (
    <div className="h-full flex flex-col">
      {/* Custom Tab Navigation - matches the application style */}
      <div className="flex border-b border-gray-200 mb-2 px-4">
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            logType === 'simulation'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setLogType('simulation')}
        >
          Simulation Logs
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            logType === 'application'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setLogType('application')}
        >
          Application Logs
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {logType === 'simulation' ? (
          <OriginalSimulationLogsPanel />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 primereact-scope">
              <LogViewerAdapter 
                defaultLogType={['error', 'edit']}
                defaultLimit={50}
                showFilters={true}
                allowExport={true}
                height="calc(100vh - 300px)"
              />
            </div>
            
            {/* Collapsible log migration tool */}
            <div className="border-t border-gray-200 p-2">
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
                  Log Migration Tools
                </summary>
                <div className="mt-2 primereact-scope p-2 bg-gray-50 rounded">
                  <LogMigrationTool />
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedLogsPanel;
