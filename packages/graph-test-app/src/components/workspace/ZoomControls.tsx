import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ZoomControlsProps {
  className?: string;
  onZoom?: (factor: number) => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ className = '', onZoom }) => {
  return (
    <div className={`flex flex-col gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg ${className}`}>
      <button 
        className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors"
        onClick={() => onZoom?.(1.2)}
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button 
        className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors"
        onClick={() => onZoom?.(0.8)}
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button 
        className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors"
        onClick={() => onZoom?.(1)}
        title="Fit to View"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
};