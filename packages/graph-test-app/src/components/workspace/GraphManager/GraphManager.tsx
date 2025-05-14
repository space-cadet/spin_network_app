import React from 'react';
import { useGraphManager } from './hooks/useGraphManager';

export interface GraphManagerProps {
  className?: string;
}

export const GraphManager: React.FC<GraphManagerProps> = ({ className = '' }) => {
  const { containerRef } = useGraphManager();

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} />
  );
};
