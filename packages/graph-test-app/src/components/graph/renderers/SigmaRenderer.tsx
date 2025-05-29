import React, { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import { NodeCircleProgram, EdgeLineProgram } from 'sigma/rendering';
import Graph from 'graphology';
import { Attributes } from 'graphology-types';
import { IRenderGraph } from '@spin-network/graph-ui/src/types/rendering';

interface NodeAttributes extends Attributes {
  x: number;
  y: number;
  color?: string;
  size?: number;
  label?: string;
}

interface EdgeAttributes extends Attributes {
  color?: string;
  size?: number;
}

interface SigmaRendererProps {
  renderGraph: IRenderGraph;
  className?: string;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
}

export const SigmaRenderer: React.FC<SigmaRendererProps> = ({ 
  renderGraph,
  className,
  onNodeClick,
  onEdgeClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }

    const graph = new Graph<NodeAttributes, EdgeAttributes>();

    renderGraph.getAllRenderNodes().forEach(([nodeId, node]) => {
      graph.addNode(nodeId, {
        x: node.position.x,
        y: node.position.y,
        color: node.renderProps?.color || '#6366f1',
        size: node.renderProps?.size || 8,
        label: nodeId
      });
    });

    renderGraph.getAllRenderEdges().forEach(([edgeId, edge]) => {
      graph.addEdge(edge.source, edge.target, {
        color: edge.renderProps?.color || '#94a3b8',
        size: edge.renderProps?.size || 2
      });
    });

    sigmaRef.current = new Sigma(graph, containerRef.current, {
      nodeProgramClasses: {
        default: NodeCircleProgram,
      },
      edgeProgramClasses: {
        default: EdgeLineProgram,
      },
      renderLabels: true,
      defaultNodeColor: '#6366f1',
      defaultEdgeColor: '#94a3b8'
    });

    const handleNodeClick = ({ node }: { node: string }) => onNodeClick?.(node);
    const handleEdgeClick = ({ edge }: { edge: string }) => onEdgeClick?.(edge);

    if (onNodeClick) {
      sigmaRef.current.on('clickNode', handleNodeClick);
    }
    if (onEdgeClick) {
      sigmaRef.current.on('clickEdge', handleEdgeClick);
    }

    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
    };
  }, [renderGraph, onNodeClick, onEdgeClick]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ minHeight: '400px' }}
    />
  );
};
