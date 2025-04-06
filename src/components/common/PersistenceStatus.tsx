import React, { useEffect, useState } from 'react';
import { useStore } from 'react-redux';
import { PERSIST, REHYDRATE } from 'redux-persist';

/**
 * Component that displays the current persistence status of the application
 * Shows when the state is being saved to or loaded from storage
 */
const PersistenceStatus: React.FC = () => {
  const store = useStore();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'loading'>('idle');
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const unsubscribe = store.subscribe(() => {
      const action = store.getState()._persist?.rehydrated 
        ? { type: PERSIST } // If already rehydrated, this is a persist action
        : { type: REHYDRATE }; // Otherwise it's a rehydrate action
      
      // Check if we're in a persist or rehydrate action
      if (action.type === PERSIST) {
        setStatus('saving');
        
        // After a delay, show saved notification
        timeout = setTimeout(() => {
          setStatus('saved');
          
          // Reset to idle after showing "saved" for a moment
          timeout = setTimeout(() => {
            setStatus('idle');
          }, 1500);
        }, 800);
      } else if (action.type === REHYDRATE) {
        setStatus('loading');
        
        // After a delay, reset to idle
        timeout = setTimeout(() => {
          setStatus('idle');
        }, 1000);
      }
    });
    
    return () => {
      unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, [store]);
  
  if (status === 'idle') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 flex items-center bg-gray-800 text-white px-3 py-2 rounded shadow-lg opacity-80 z-50">
      {status === 'saving' && (
        <>
          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Saving...</span>
        </>
      )}
      
      {status === 'saved' && (
        <>
          <svg className="mr-2 h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Saved</span>
        </>
      )}
      
      {status === 'loading' && (
        <>
          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>Loading...</span>
        </>
      )}
    </div>
  );
};

export default PersistenceStatus;
