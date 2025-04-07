import React from 'react';
import { FaPlus, FaMinus, FaExpand } from 'react-icons/fa';
import { BsArrowsFullscreen } from 'react-icons/bs';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  zoomLevel: number;
  className?: string;
}

/**
 * Zoom controls component for the network visualization
 */
const ZoomControls: React.FC<ZoomControlsProps> = ({ 
  onZoomIn, 
  onZoomOut, 
  onZoomFit, 
  zoomLevel,
  className = ''
}) => {
  // Format zoom level as percentage
  const zoomPercentage = Math.round(zoomLevel * 100);

  return (
    <div className={`flex items-center bg-white bg-opacity-80 rounded-md shadow-md p-1 ${className}`}>
      <button
        className="p-2 hover:bg-gray-200 rounded-md"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <FaMinus size={14} />
      </button>
      
      <div className="px-2 min-w-[60px] text-center">
        {zoomPercentage}%
      </div>
      
      <button
        className="p-2 hover:bg-gray-200 rounded-md"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <FaPlus size={14} />
      </button>
      
      <div className="border-l border-gray-300 mx-1 h-6"></div>
      
      <button
        className="p-2 hover:bg-gray-200 rounded-md"
        onClick={onZoomFit}
        title="Fit to View"
      >
        <BsArrowsFullscreen size={14} />
      </button>
    </div>
  );
};

export default ZoomControls;
