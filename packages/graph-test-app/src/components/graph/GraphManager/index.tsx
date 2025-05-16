import React, { useEffect, useRef } from 'react';
import { GraphologyAdapter } from '../../../../../graph-core/src/core/GraphologyAdapter';
import Sigma from 'sigma';
import { useGraphInstance } from './useGraphInstance';
import { useDispatch } from 'react-redux';
import { addNode, addEdge } from '../../../store/graphSlice';
import { v4 as uuidv4 } from 'uuid';

interface GraphManagerProps {
  className?: string;
}

export const GraphManager: React.FC<GraphManagerProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const { graph } = useGraphInstance();
  const dispatch = useDispatch();

  // Add some test data when graph is initialized
  useEffect(() => {
    if (!graph) return;

    const graphInstance = graph.getGraphologyInstance();

    // Add test nodes with explicit positions
    const nodes = [
      { id: '1', label: 'Node 1', x: 0, y: 0 },
      { id: '2', label: 'Node 2', x: 5, y: 5 },
      { id: '3', label: 'Node 3', x: -5, y: 5 }
    ];

    // Add edges
    const edges = [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
      { id: 'e3', source: '3', target: '1' }
    ];

    // Add nodes to graph
    nodes.forEach(node => {
      graphInstance.addNode(node.id, {
        x: node.x,
        y: node.y,
        label: node.label,
        size: 10,
        color: '#6366f1'
      });
    });

    // Add edges to graph
    edges.forEach(edge => {
      graphInstance.addEdge(edge.source, edge.target, {
        size: 2,
        color: '#94a3b8'
      });
    });

  }, [graph]);

  // Initialize Sigma when container and graph are ready
  useEffect(() => {
    if (!containerRef.current || !graph) return;

    const graphInstance = graph.getGraphologyInstance();
    
    // Initialize Sigma
    sigmaRef.current = new Sigma(graphInstance, containerRef.current);

    return () => {
      sigmaRef.current?.kill();
      sigmaRef.current = null;
    };
  }, [graph]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ minHeight: '400px' }}
    />
  );
};