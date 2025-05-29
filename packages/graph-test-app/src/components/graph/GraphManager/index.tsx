import React, { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import { NodeCircleProgram, EdgeLineProgram } from 'sigma/rendering';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface GraphManagerProps {
  className?: string;
}

export const GraphManager: React.FC<GraphManagerProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphId = useSelector((state: RootState) => state.graph.graphId);
  const graphInstance = useSelector((state: RootState) => state.graph.graphInstance);

  useEffect(() => {
    if (!containerRef.current || !graphInstance || !graphId) return;

    const graph = graphInstance.getGraphologyInstance();
    
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }
    
    sigmaRef.current = new Sigma(graph, containerRef.current, {
      nodeProgramClasses: {
        default: NodeCircleProgram,
      },
      edgeProgramClasses: {
        default: EdgeLineProgram,
      },
      renderLabels: true
    });

    return () => {
      sigmaRef.current?.kill();
      sigmaRef.current = null;
    };
  }, [graphId, graphInstance]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ minHeight: '400px' }}
    />
  );
};
