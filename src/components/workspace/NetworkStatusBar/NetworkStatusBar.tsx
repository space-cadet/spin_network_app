/**
 * NetworkStatusBar component
 * Displays network statistics and interaction mode
 */
import React from 'react';
import { SpinNetwork } from '../../../models/types';

export interface NetworkStatusBarProps {
  network: SpinNetwork;
  mode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete';
  edgeSourceId?: string | null;
  className?: string;
}

const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({
  network,
  mode,
  edgeSourceId,
  className = ''
}) => {
  return (
    <div className={`text-sm text-gray-500 mb-2 flex items-center justify-between ${className}`}>
      {/* Network statistics */}
      <div>
        <span>
          {network.nodes.length} nodes, {network.edges.length} edges
        </span>
        <span className="ml-4">
          {network.metadata.name} {network.metadata.type ? `(${network.metadata.type})` : ''}
        </span>
      </div>
      
      {/* Status indicator */}
      <div>
        {mode === 'select' && <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Select Mode</span>}
        {mode === 'pan' && <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Pan Mode</span>}
        {mode === 'addNode' && <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Click anywhere to add a node</span>}
        {mode === 'addEdge' && !edgeSourceId && <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Select a source node</span>}
        {mode === 'addEdge' && edgeSourceId && <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Select a target node</span>}
        {mode === 'delete' && <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Click on an element to delete it</span>}
      </div>
    </div>
  );
};

export default NetworkStatusBar;
