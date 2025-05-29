import React from 'react';
import { useGraphManager } from './hooks/useGraphManager';
import { RendererSelector } from '../../panels/RendererSelector';
import { GraphCanvas } from '../../graph/GraphCanvas';
import { ZoomControls } from '../ZoomControls';

export interface GraphManagerProps {
  className?: string;
}

export const GraphManager: React.FC<GraphManagerProps> = ({ className = '' }) => {
  const { 
    containerRef,
    graphInstance,
    handleNodeClick,
    handleEdgeClick,
    handleZoom
  } = useGraphManager();

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex justify-end mb-4">
        <RendererSelector />
      </div>
      <div ref={containerRef} className="relative flex-1">
        <GraphCanvas 
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
        />
        <div className="absolute bottom-4 right-4">
          <ZoomControls onZoom={handleZoom} />
        </div>
      </div>
    </div>
  );
};
