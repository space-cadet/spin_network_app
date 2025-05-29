import React, { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import { NodeCircleProgram, EdgeLineProgram } from 'sigma/rendering';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { GraphologyAdapter } from '../../../../graph-core/src/core/GraphologyAdapter';

// Global reference to the current graph instance
let currentGraphInstance: GraphologyAdapter | null = null;

// Function to set the current graph (called from GraphBuilderControls)
export const setCurrentGraphInstance = (graph: GraphologyAdapter | null) => {
  currentGraphInstance = graph;
};

interface GraphManagerProps {
  className?: string;
}

export const GraphManager: React.FC<GraphManagerProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphId = useSelector((state: RootState) => state.graph.graphId);

  // Initialize or update Sigma when graph changes
  useEffect(() => {
    if (!containerRef.current || !currentGraphInstance || !graphId) return;

    const graphInstance = currentGraphInstance.getGraphologyInstance();
    
    // Kill existing Sigma instance
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }
    
    // Initialize Sigma with the current graph
    sigmaRef.current = new Sigma(graphInstance, containerRef.current, {
      nodeProgramClasses: {
        default: NodeCircleProgram,
        circle: NodeCircleProgram,
        lattice: NodeCircleProgram,
        triangular_lattice: NodeCircleProgram
      },
      edgeProgramClasses: {
        default: EdgeLineProgram,
        line: EdgeLineProgram,
        lattice_edge: EdgeLineProgram,
        triangular_edge: EdgeLineProgram
      },
      renderLabels: true,
      labelFont: 'Arial',
      labelSize: 12,
      labelWeight: 'bold',
      labelDensity: 1,
      labelGridCellSize: 100
    });

    return () => {
      sigmaRef.current?.kill();
      sigmaRef.current = null;
    };
  }, [graphId]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ minHeight: '400px' }}
    />
  );
};
