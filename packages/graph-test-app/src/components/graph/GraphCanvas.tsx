import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SigmaRenderer, ThreeFiberRenderer } from './renderers';

export const GraphCanvas: React.FC = () => {
  const renderMode = useSelector((state: RootState) => state.graph.renderMode);

  return (
    <div className="w-full h-full flex-1 bg-gray-50 rounded-lg shadow-inner" style={{ minHeight: '600px' }}>
      {renderMode === '2d' ? <SigmaRenderer /> : <ThreeFiberRenderer />}
    </div>
  );
};