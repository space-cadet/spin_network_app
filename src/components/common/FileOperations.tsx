import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SpinNetwork } from '../../models/types';
import { setNetwork, setNetworkWithHistory } from '../../store/slices/networkSlice';
import { addToRecentNetworks, removeFromRecentNetworks } from '../../store/slices/recentNetworksSlice';
import { RootState } from '../../store';
import store from '../../store';
import { selectRecentNetworks } from '../../store/selectors';
import { FaSave, FaFileUpload, FaHistory, FaTimes } from 'react-icons/fa';
import { NetworkStorage } from '../../utils/networkStorage';

/**
 * Component that provides save/load functionality for network files
 */
const FileOperations: React.FC = () => {
  const dispatch = useDispatch();
  const currentNetwork = useSelector((state: RootState) => state.network.currentNetwork);
  const recentNetworks = useSelector(selectRecentNetworks);
  const [showRecentMenu, setShowRecentMenu] = useState(false);
  const recentMenuRef = useRef<HTMLDivElement>(null);
  
  /**
   * Save the current network to a file
   */
  const handleSaveNetwork = async () => {
    try {
      // Create a copy with proper ID and timestamp
      const networkToSave = { 
        ...currentNetwork,
        metadata: {
          ...currentNetwork.metadata,
          id: currentNetwork.metadata?.id || `network-${Date.now()}`,
          modified: Date.now()
        }
      };
      
      console.log('Adding network to recent list:', networkToSave);
      
      // Add to recent networks (do this first to ensure UI update)
      dispatch(addToRecentNetworks(networkToSave));
      
      // Try saving to storage (can fail but at least recent list will be updated)
      try {
        await NetworkStorage.saveNetwork(networkToSave);
      } catch (storageError) {
        console.warn('Could not save to storage, but recent list updated:', storageError);
      }
      
      // Get the current state directly from the store
      const currentState = store.getState();
      const networkState = currentState.network;
      
      // Include history state when saving
      const networkWithHistory = {
        network: currentNetwork,
        history: {
          history: networkState.history,
          historyIndex: networkState.historyIndex,
          canUndo: networkState.canUndo,
          canRedo: networkState.canRedo
        }
      };
      
      console.log('Saving network with history:', networkWithHistory);
      
      // Create a JSON string of the current network with history
      const networkJson = JSON.stringify(networkWithHistory, null, 2);
      const blob = new Blob([networkJson], { type: 'application/json' });
      
      // Generate default filename from network metadata with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); // Format: YYYY-MM-DDTHH-MM-SS
      const defaultFilename = currentNetwork.metadata?.name 
        ? `${currentNetwork.metadata.name}-${timestamp}.json`
        : `spin-network-${timestamp}.json`;
      
      // Use File System Access API if available
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: defaultFilename,
            types: [{
              description: 'Spin Network JSON',
              accept: { 'application/json': ['.json'] }
            }]
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          console.log('Network saved successfully using File System Access API');
        } catch (err) {
          // User canceled or API error - fall back to download approach
          console.warn('File System Access API failed, falling back to download', err);
          downloadFile(blob, defaultFilename);
        }
      } else {
        // Fall back to regular file download for browsers without File System Access API
        downloadFile(blob, defaultFilename);
      }
    } catch (error) {
      console.error('Error saving network:', error);
      // Show more detailed error message
      if (error instanceof Error) {
        alert(`Failed to save network: ${error.message}`);
      } else {
        alert('Failed to save network. Please try again.');
      }
    }
  };
  
  /**
   * Fall back method to trigger a file download
   */
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('Network saved successfully using download method');
  };
  
  /**
   * Load a network from a file
   */
  const handleLoadNetwork = async () => {
    try {
      // Use File System Access API if available
      if ('showOpenFilePicker' in window) {
        try {
          const [fileHandle] = await (window as any).showOpenFilePicker({
            types: [{
              description: 'Spin Network JSON',
              accept: { 'application/json': ['.json'] }
            }],
            multiple: false
          });
          
          const file = await fileHandle.getFile();
          const contents = await file.text();
          
          loadNetworkFromJson(contents);
        } catch (err) {
          // User canceled or API error - fall back to input approach
          console.warn('File System Access API failed, falling back to file input', err);
          triggerFileInput();
        }
      } else {
        // Fall back to regular file input for browsers without File System Access API
        triggerFileInput();
      }
    } catch (error) {
      console.error('Error loading network:', error);
      alert('Failed to load network. Please try again.');
    }
  };
  
  /**
   * Fall back method to open a file input dialog
   */
  const triggerFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadNetworkFromJson(event.target.result as string);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  /**
   * Parse and validate network JSON data
   */
  const loadNetworkFromJson = (jsonString: string) => {
    try {
      // Try parsing as a network with history first
      const parsed = JSON.parse(jsonString);
      let network: SpinNetwork;
      let history = null;
      
      // Check if this is a network with history or just a network
      if (parsed.network && parsed.history) {
        network = parsed.network;
        history = parsed.history;
      } else {
        // Legacy format - just a network without history
        network = parsed as SpinNetwork;
      }
      
      // Basic validation
      if (!network.nodes || !network.edges) {
        throw new Error('Invalid network file format');
      }
      
      // Ensure the network has proper metadata
      const loadedNetwork = {
        ...network,
        metadata: {
          ...network.metadata,
          id: network.metadata?.id || `network-${Date.now()}`,
          name: network.metadata?.name || 'Imported Network',
          modified: Date.now()
        }
      };
      
      // Dispatch action to set the network
      if (history) {
        console.log('Loading network with history:', history);
        // Use the named action creator to restore both network and history
        dispatch(setNetworkWithHistory({
          network: loadedNetwork,
          history: history
        }));
      } else {
        // Just set the network without history
        dispatch(setNetwork(loadedNetwork));
      }
      
      // Add to recent networks
      console.log('Adding loaded network to recent list:', loadedNetwork);
      dispatch(addToRecentNetworks(loadedNetwork));
      
      console.log('Network loaded successfully');
    } catch (error) {
      console.error('Error parsing network JSON:', error);
      alert('Failed to load network. The file format appears to be invalid.');
    }
  };
  
  /**
   * Load a recent network by ID
   */
  const handleLoadRecentNetwork = async (networkId: string) => {
    try {
      console.log('Loading recent network with ID:', networkId);
      
      // Try to load the network from storage
      const networkData = await NetworkStorage.loadNetwork(networkId);
      
      if (networkData) {
        console.log('Network data loaded:', networkData);
        
        // Process the loaded data
        if (typeof networkData === 'object' && 'network' in networkData && 'history' in networkData) {
          console.log('Found network with history, dispatching setNetworkWithHistory');
          
          // This is a network with history - make sure to properly structure the payload
          const payload = {
            network: networkData.network,
            history: networkData.history
          };
          
          // Use the explicitly imported action creator for better type safety
          dispatch(setNetworkWithHistory(payload));
          
          console.log('Network with history dispatched successfully');
        } else {
          // This is just a network
          console.log('Found network without history, using setNetwork');
          dispatch(setNetwork(networkData));
        }
        
        // Add to recent networks list
        if (typeof networkData === 'object' && 'network' in networkData) {
          dispatch(addToRecentNetworks(networkData.network));
        } else {
          dispatch(addToRecentNetworks(networkData));
        }
        
        console.log('Network loaded successfully from recent list');
      } else {
        throw new Error('Network not found in storage');
      }
      
      setShowRecentMenu(false);
    } catch (error) {
      console.error('Error loading recent network:', error);
      alert('Failed to load this network. It may have been deleted or corrupted.');
    }
  };
  
  /**
   * Remove a network from recent networks
   */
  const handleRemoveFromRecent = (event: React.MouseEvent, networkId: string) => {
    event.stopPropagation();
    dispatch(removeFromRecentNetworks(networkId));
  };
  
  /**
   * Toggle the recent networks menu
   */
  const toggleRecentMenu = () => {
    console.log('Toggling recent networks menu. Current state:', showRecentMenu);
    console.log('Recent networks:', recentNetworks);
    setShowRecentMenu(!showRecentMenu);
  };
  
  // Close the dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (recentMenuRef.current && !recentMenuRef.current.contains(event.target as Node)) {
        setShowRecentMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [recentMenuRef]);
  
  return (
    <div className="flex space-x-2">
      <button
        onClick={handleSaveNetwork}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
        title="Save Network"
      >
        <FaSave className="mr-1" /> Save
      </button>
      <button
        onClick={handleLoadNetwork}
        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center"
        title="Load Network"
      >
        <FaFileUpload className="mr-1" /> Load
      </button>
      
      {/* Recent Networks Dropdown */}
      <div className="relative" ref={recentMenuRef}>
        <button
          onClick={toggleRecentMenu}
          className={`px-3 py-1 ${recentNetworks.length === 0 ? 'bg-gray-400' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center`}
          title="Recent Networks"
          disabled={recentNetworks.length === 0}
        >
          <FaHistory className="mr-1" /> Recent ({recentNetworks.length})
        </button>
        
        {showRecentMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 overflow-hidden">
            <div className="py-1">
              <h3 className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">Recent Networks</h3>
              <div className="max-h-60 overflow-y-auto">
                {recentNetworks.length > 0 ? (
                  recentNetworks.map((network) => (
                    <div
                      key={network.id}
                      className="px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between border-b border-gray-100"
                    >
                      <button
                        className="flex-1 text-left truncate flex items-center"
                        onClick={() => handleLoadRecentNetwork(network.id)}
                      >
                        <span className="truncate mr-2">
                          {network.name}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {`${network.nodeCount}N, ${network.edgeCount}E`}
                        </span>
                      </button>
                      <button
                        className="ml-2 text-gray-400 hover:text-red-500 p-1"
                        onClick={(e) => handleRemoveFromRecent(e, network.id)}
                        title="Remove from recent"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No recent networks
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileOperations;
