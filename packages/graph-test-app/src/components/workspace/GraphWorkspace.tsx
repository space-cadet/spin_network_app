import React from 'react';
import { Activity } from 'lucide-react';
import { GraphManager } from './GraphManager';
import { GraphControls } from './GraphControls';
import { ZoomControls } from './ZoomControls';

export const GraphWorkspace: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 p-4">
      {/* Restored original blue bar */}
      <div className="bg-blue-100 p-4 mb-4 rounded-lg">
        <GraphControls className="mb-4" />
      </div>

      {/* Main Visualization Area */}
      <div className="relative flex-1 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
          Graph Visualization Area
        </div>
        <GraphManager className="h-full" />
        <div className="absolute bottom-4 right-4">
          <ZoomControls />
        </div>
      </div>
    </div>
  );
};