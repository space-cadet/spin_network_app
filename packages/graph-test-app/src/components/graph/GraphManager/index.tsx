import React, { useEffect, useRef } from 'react';
import { GraphologyAdapter } from '../../../../../graph-core/src/core/GraphologyAdapter';
import Sigma from 'sigma';
import { useGraphInstance } from './useGraphInstance';
import { useDispatch, useSelector } from 'react-redux';
import { addNode, addEdge } from '../../../store/graphSlice';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '../../../store';

interface GraphManagerProps {
  className?: string;
}

export const GraphManager: React.FC<GraphManagerProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const { graph } = useGraphInstance();
  const dispatch = useDispatch();
  const currentGraph = useSelector((state: RootState) => state.graph.currentGraph);

  // Initialize Sigma when container and graph are ready
  useEffect(() => {
    if (!containerRef.current || !graph) return;

    const graphInstance = currentGraph ? 
      currentGraph.getGraphologyInstance() : 
      graph.getGraphologyInstance();
    
    // Kill existing Sigma instance
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }
    
    // Initialize Sigma with the current graph
    sigmaRef.current = new Sigma(graphInstance, containerRef.current);

    return () => {
      sigmaRef.current?.kill();
      sigmaRef.current = null;
    };
  }, [graph, currentGraph]);

  // Add default graph if no current graph exists
  useEffect(() => {
    if (!graph || currentGraph) return;

    const graphInstance = graph.getGraphologyInstance();

    // Add default triangle for initial display
    const nodes = [
      { id: '1', label: 'Node 1', x: 0, y: -100 },
      { id: '2', label: 'Node 2', x: 87, y: 50 },
      { id: '3', label: 'Node 3', x: -87, y: 50 }
    ];

    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '1' }
    ];

    // Clear existing graph
    graphInstance.clear();

    // Add nodes
    nodes.forEach(node => {
      graphInstance.addNode(node.id, {
        x: node.x,
        y: node.y,
        label: node.label,
        size: 10,
        color: '#6366f1'
      });
    });

    // Add edges
    edges.forEach(edge => {
      graphInstance.addEdge(edge.source, edge.target, {
        size: 2,
        color: '#94a3b8'
      });
    });

  }, [graph, currentGraph]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ minHeight: '400px' }}
    />
  );
};