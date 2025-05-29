import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SigmaRenderer, ThreeFiberRenderer } from './renderers';
import { StandardLayoutEngine } from '@spin-network/graph-ui/src/layout/StandardLayoutEngine';

interface GraphCanvasProps {
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  className?: string;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ 
  onNodeClick,
  onEdgeClick,
  className
}) => {
  const renderMode = useSelector((state: RootState) => state.graph.renderMode);
  const graphInstance = useSelector((state: RootState) => state.graph.graphInstance);

  const renderGraph = useMemo(() => {
    if (!graphInstance) return null;
    
    const layoutEngine = new StandardLayoutEngine();
    return layoutEngine.transformToRender(graphInstance, {
      algorithm: 'preserve_logical',
      dimensions: renderMode === '3d' ? 3 : 2,
      spacing: 100
    });
  }, [graphInstance, renderMode]);

  if (!renderGraph) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No graph loaded</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex-1 bg-gray-50 rounded-lg shadow-inner ${className}`} style={{ minHeight: '600px' }}>
      {renderMode === '2d' ? (
        <SigmaRenderer 
          renderGraph={renderGraph}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
        />
      ) : (
        <ThreeFiberRenderer 
          renderGraph={renderGraph}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
        />
      )}
    </div>
  );
};