/**
 * WorkspaceControls component
 * Toolbar buttons and controls for the workspace
 */
import React from 'react';
import { FaSearch, FaRegHandPaper, FaPlus, FaLink, FaTrash } from 'react-icons/fa';
import ToolbarButton from './components/ToolbarButton';
import UndoRedo from '../../common/UndoRedo';

export interface WorkspaceControlsProps {
  mode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete';
  onModeChange: (mode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete') => void;
  className?: string;
}

const WorkspaceControls: React.FC<WorkspaceControlsProps> = ({
  mode,
  onModeChange,
  className = ''
}) => {
  // Toggle mode function - if already in the mode, switch to select
  const handleModeChange = (newMode: 'select' | 'pan' | 'addNode' | 'addEdge' | 'delete') => {
    if (mode === newMode) {
      onModeChange('select');
    } else {
      onModeChange(newMode);
    }
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <h2 className="text-lg font-medium">Network Visualization</h2>
      <div className="flex-1"></div>
      
      {/* Undo/Redo buttons */}
      <UndoRedo />
      
      {/* Mode buttons */}
      <ToolbarButton 
        icon={FaSearch}
        active={mode === 'select'}
        onClick={() => handleModeChange('select')}
        title="Select Mode"
      />
      
      <ToolbarButton 
        icon={FaRegHandPaper}
        active={mode === 'pan'}
        onClick={() => handleModeChange('pan')}
        title="Pan Mode"
      />
      
      <ToolbarButton 
        icon={FaPlus}
        active={mode === 'addNode'}
        onClick={() => handleModeChange('addNode')}
        title="Add Node"
      />
      
      <ToolbarButton 
        icon={FaLink}
        active={mode === 'addEdge'}
        onClick={() => handleModeChange('addEdge')}
        title="Add Edge"
      />
      
      <ToolbarButton 
        icon={FaTrash}
        active={mode === 'delete'}
        onClick={() => handleModeChange('delete')}
        title="Delete Element"
      />
    </div>
  );
};

export default WorkspaceControls;
