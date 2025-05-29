import React from 'react';
import { Activity, Plus, Link, GitBranch, Share2, Grid } from 'lucide-react';
import { BackendSelector } from '../common/BackendSelector';
import { GraphBuilderControls } from './GraphBuilderControls';
import { RendererSelector } from './RendererSelector';

export const ControlPanel: React.FC = () => { 
  return (
    <div className="p-4 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Graph Controls</h2>
      </div>
      
      {/* Backend Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Graph Backend
        </label>
        <BackendSelector />
      </div>

      {/* Renderer Selection */}
      <div className="mb-6">
        <RendererSelector />
      </div>

      {/* Control Buttons - Grouped by functionality */}
      <div className="space-y-6">
        {/* Graph Builders */}
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Graph Builders
          </label>
          <GraphBuilderControls />
        </div>
        {/* Graph Structure Controls */}
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Structure
          </label>
          <button 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => console.log('Create Node clicked')}
          >
            <Plus className="w-4 h-4" />
            Create Node
          </button>
          <button 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => console.log('Create Edge clicked')}
          >
            <Link className="w-4 h-4" />
            Create Edge
          </button>
        </div>

        {/* Algorithm Controls */}
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Algorithms
          </label>
          <button 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => console.log('Run BFS clicked')}
          >
            <GitBranch className="w-4 h-4" />
            Run BFS
          </button>
          <button 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => console.log('Run DFS clicked')}
          >
            <Share2 className="w-4 h-4" />
            Run DFS
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-auto pt-6 text-sm text-gray-500">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="font-medium mb-2">Graph Info</p>
          <div className="space-y-1">
            <p>Nodes: 0</p>
            <p>Edges: 0</p>
          </div>
        </div>
      </div>
    </div>
  );
};