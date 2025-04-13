import React, { useState } from 'react';
import { LogViewerAdapter } from './LogViewerAdapter';
import { LogMigrationTool } from './LogMigrationTool';

/**
 * SimulationLogsPanel component - Tab interface for logs
 */
export const SimulationLogsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'viewer' | 'migration'>('viewer');

  return (
    <div className="h-full flex flex-col">
      {/* Custom Tab Navigation - matches the application style */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'viewer'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('viewer')}
        >
          Log Viewer
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'migration'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('migration')}
        >
          Log Migration
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'viewer' ? (
          <LogViewerAdapter 
            defaultLogType={['error', 'edit']}
            defaultLimit={50}
            showFilters={true}
            allowExport={true}
            height="calc(100vh - 250px)"
          />
        ) : (
          <LogMigrationTool />
        )}
      </div>
    </div>
  );
};
