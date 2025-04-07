import React, { useEffect } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSectionCollapsed } from '../../store/slices/uiSlice';
import { selectSectionCollapsed } from '../../store/selectors';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
  id?: string; // Optional ID - will be generated from title if not provided
}

/**
 * A reusable collapsible section component with expand/collapse functionality
 * that persists its state in Redux
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  iconClassName = '',
  id: propId,
}) => {
  const dispatch = useAppDispatch();
  
  // Generate a consistent ID for this section based on title
  const sectionId = propId || `section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Get collapsed state from Redux
  const isCollapsed = useAppSelector(selectSectionCollapsed(sectionId));
  
  // Initialize the state on first render if needed
  useEffect(() => {
    // Only initialize if it's not already in Redux
    if (isCollapsed === undefined) {
      dispatch(toggleSectionCollapsed({ 
        sectionId, 
        collapsed: !defaultExpanded 
      }));
    }
  }, [dispatch, sectionId, defaultExpanded, isCollapsed]);

  const toggleExpand = () => {
    dispatch(toggleSectionCollapsed({ sectionId }));
  };

  return (
    <div className={`mb-4 border border-gray-200 rounded-md ${className}`}>
      <button
        className={`w-full flex items-center justify-between py-2 px-4 bg-gray-50 hover:bg-gray-100 text-left rounded-t-md ${headerClassName}`}
        onClick={toggleExpand}
      >
        <span className="font-medium">{title}</span>
        <span className={`transition-transform duration-200 ${iconClassName}`}>
          {!isCollapsed ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
        </span>
      </button>
      
      {!isCollapsed && (
        <div className={`p-4 rounded-b-md ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
