import React from 'react';
import { BackendSelector } from '../common/BackendSelector';

export const ControlPanel: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Controls</h2>
      
      {/* Backend Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Graph Backend</label>
        <BackendSelector />
      </div>

      {/* Control Buttons */}
      <div className="space-y-2">
        <button 
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => console.log('Create Node clicked')}
        >
          Create Node
        </button>
        <button 
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => console.log('Create Edge clicked')}
        >
          Create Edge
        </button>
        <button 
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => console.log('Run BFS clicked')}
        >
          Run BFS
        </button>
      </div>
    </div>
  );
};