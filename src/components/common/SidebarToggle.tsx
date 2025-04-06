import React from 'react';
import { FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useAppDispatch } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';

interface SidebarToggleProps {
  side: 'left' | 'right' | 'bottom';
  isVisible: boolean;
  className?: string;
}

/**
 * Component that provides a toggle button for sidebar visibility
 */
const SidebarToggle: React.FC<SidebarToggleProps> = ({ side, isVisible, className = '' }) => {
  const dispatch = useAppDispatch();
  
  const handleToggle = () => {
    dispatch(toggleSidebar(side));
  };
  
  // Determine which icon to use based on side and visibility
  const getIcon = () => {
    switch (side) {
      case 'left':
        return isVisible ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />;
      case 'right':
        return isVisible ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />;
      case 'bottom':
        return isVisible ? <FaChevronDown size={16} /> : <FaChevronUp size={16} />;
      default:
        return null;
    }
  };
  
  // Determine tooltip text
  const getTooltip = () => {
    const action = isVisible ? 'Hide' : 'Show';
    return `${action} ${side} panel`;
  };
  
  // Determine position classes based on side
  const getPositionClasses = () => {
    switch (side) {
      case 'left':
        return isVisible ? 'top-1/2 -translate-y-1/2 -right-3' : 'top-1/2 -translate-y-1/2 left-3';
      case 'right':
        return isVisible ? 'top-1/2 -translate-y-1/2 -left-3' : 'top-1/2 -translate-y-1/2 right-3';
      case 'bottom':
        return isVisible ? 'left-1/2 -translate-x-1/2 -top-3' : 'left-1/2 -translate-x-1/2 bottom-3';
      default:
        return '';
    }
  };
  
  return (
    <button
      className={`absolute z-10 ${isVisible ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'} rounded-full p-1 shadow-md ${getPositionClasses()} ${className}`}
      onClick={handleToggle}
      title={getTooltip()}
    >
      {getIcon()}
    </button>
  );
};

export default SidebarToggle;
