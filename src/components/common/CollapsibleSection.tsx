import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
}

/**
 * A reusable collapsible section component with expand/collapse functionality
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  iconClassName = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`mb-4 border border-gray-200 rounded-md ${className}`}>
      <button
        className={`w-full flex items-center justify-between py-2 px-4 bg-gray-50 hover:bg-gray-100 text-left rounded-t-md ${headerClassName}`}
        onClick={toggleExpand}
      >
        <span className="font-medium">{title}</span>
        <span className={`transition-transform duration-200 ${iconClassName}`}>
          {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
        </span>
      </button>
      
      {isExpanded && (
        <div className={`p-4 rounded-b-md ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
