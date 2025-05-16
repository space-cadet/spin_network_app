import React from 'react';
import { GraphManager } from './GraphManager';

export const GraphCanvas: React.FC = () => {
  return (
    <div className="w-full h-full flex-1 bg-gray-50 rounded-lg shadow-inner" style={{ minHeight: '600px' }}>
      <GraphManager />
    </div>
  );
};