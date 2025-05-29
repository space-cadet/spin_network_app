import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SigmaRenderer, ThreeFiberRenderer } from './renderers';
import { StandardLayoutEngine } from '@spin-network/graph-ui/src/layout/StandardLayoutEngine';
import { GraphologyAdapter } from '@spin-network/graph-core/src/core/GraphologyAdapter';

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
  const nodes = useSelector((state: RootState) => state.graph.nodes);
  const edges = useSelector((state: RootState) => state.graph.edges);
  const metadata = useSelector((state: RootState) => state.graph.metadata);

  const renderGraph = useMemo(() => {
    if (nodes.length === 0) return null;
    
    // Reconstruct GraphologyAdapter from serializable data
    const graphInstance = new GraphologyAdapter();
    
    // Add nodes
    nodes.forEach(node => {
      graphInstance.addNode(node);
    });
    
    // Add edges
    edges.forEach(edge => {
      graphInstance.addEdge(edge);
    });
    
    // Restore metadata for proper layout algorithm selection
    if (metadata) {
      graphInstance.setMetadata(metadata);
    }
    
    const layoutEngine = new StandardLayoutEngine();
    return layoutEngine.transformToRender(graphInstance, {
      algorithm: 'preserve_logical',
      dimensions: renderMode === '3d' ? 3 : 2,
      spacing: 100
    });
  }, [nodes, edges, metadata, renderMode]);

  if (!renderGraph) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No graph loaded. Generate a graph to begin.</p>
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