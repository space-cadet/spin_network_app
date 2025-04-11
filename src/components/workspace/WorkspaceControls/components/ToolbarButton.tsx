/**
 * ToolbarButton component
 * Reusable button for workspace controls
 */
import React from 'react';
import { IconType } from 'react-icons';

export interface ToolbarButtonProps {
  icon: IconType;
  label?: string;
  active?: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  label,
  active = false,
  onClick,
  title,
  className = ''
}) => {
  return (
    <button 
      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'} ${className}`}
      onClick={onClick}
      title={title}
    >
      <Icon />
      {label && <span className="ml-2">{label}</span>}
    </button>
  );
};

export default ToolbarButton;
