import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { InteractionMode } from '../../types/graph';

interface GraphControlsProps {
  className?: string;
}

export const GraphControls: React.FC<GraphControlsProps> = ({ className = '' }) => {
  return (
    <div className={`flex gap-2 p-2 ${className}`}>
      {/* Mode controls will be implemented here */}
    </div>
  );
};