import React from 'react';
import { GraphCanvas } from '../graph/GraphCanvas';
import { ZoomControls } from './ZoomControls';

export const GraphWorkspace: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 p-4">
      {/* Main Visualization Area */}
      <div className="relative flex-1 border border-gray-200 dark:border-gray-700 rounded-lg">
        <GraphCanvas />
        <div className="absolute bottom-4 right-4">
          <ZoomControls />
        </div>
      </div>
    </div>
  );
};