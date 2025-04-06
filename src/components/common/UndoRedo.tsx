import React, { useEffect } from 'react';
import { FaUndo, FaRedo } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { undo, redo } from '../../store/slices/networkSlice';
import { selectCanUndo, selectCanRedo } from '../../store/selectors';

/**
 * Undo/Redo component with buttons and keyboard shortcuts
 */
const UndoRedo: React.FC = () => {
  const dispatch = useAppDispatch();
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl/Cmd + Z is pressed
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (canUndo) {
          e.preventDefault();
          dispatch(undo());
        }
      }
      
      // Check if Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y is pressed
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        if (canRedo) {
          e.preventDefault();
          dispatch(redo());
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, canUndo, canRedo]);
  
  const handleUndo = () => {
    if (canUndo) {
      dispatch(undo());
    }
  };
  
  const handleRedo = () => {
    if (canRedo) {
      dispatch(redo());
    }
  };
  
  return (
    <div className="flex space-x-2">
      <button
        className={`p-2 rounded ${
          canUndo 
            ? 'text-gray-700 hover:bg-gray-100' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        onClick={handleUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <FaUndo />
      </button>
      <button
        className={`p-2 rounded ${
          canRedo 
            ? 'text-gray-700 hover:bg-gray-100' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        onClick={handleRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
      >
        <FaRedo />
      </button>
    </div>
  );
};

export default UndoRedo;
