import React, { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface GraphManagerProps {
  className?: string;
}

export const GraphManager: React.FC<GraphManagerProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const currentGraph = useSelector((state: RootState) => state.graph.currentGraph);

  // Initialize or update Sigma when graph changes
  useEffect(() => {
    if (!containerRef.current || !currentGraph) return;

    const graphInstance = currentGraph.getGraphologyInstance();
    
    // Kill existing Sigma instance
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }
    
    // Initialize Sigma with the current graph
    sigmaRef.current = new Sigma(graphInstance, containerRef.current, {
      nodeColor: '#6366f1',
      edgeColor: '#94a3b8',
      nodeSize: 8,
      edgeSize: 2,
      labelSize: 12,
      labelWeight: 'bold',
      nodeType: 'circle',
      edgeType: 'line',
      labelDensity: 1,
      labelGridCellSize: 100,
      labelFont: 'Arial'
    } as any);

    return () => {
      sigmaRef.current?.kill();
      sigmaRef.current = null;
    };
  }, [currentGraph]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ minHeight: '400px' }}
    />
  );
};