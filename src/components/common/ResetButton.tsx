import React from 'react';
import { useDispatch } from 'react-redux';
import { persistor } from '../../store';
import { createEmpty } from '../../store/slices/networkSlice';

/**
 * Component that provides functionality to reset application state
 */
const ResetButton: React.FC = () => {
  const dispatch = useDispatch();
  
  /**
   * Handle reset of application state
   */
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the application? This will clear all unsaved networks and settings.')) {
      // Create a new empty network
      dispatch(createEmpty());
      
      // Purge the persisted state
      persistor.purge().then(() => {
        console.log('Application state reset successfully');
      });
    }
  };
  
  return (
    <button 
      onClick={handleReset}
      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
    >
      Reset App
    </button>
  );
};

export default ResetButton;
