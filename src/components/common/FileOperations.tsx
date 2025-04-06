import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SpinNetwork } from '../../models/types';
import { setNetwork } from '../../store/slices/networkSlice';
import { RootState } from '../../store';

/**
 * Component that provides save/load functionality for network files
 */
const FileOperations: React.FC = () => {
  const dispatch = useDispatch();
  const currentNetwork = useSelector((state: RootState) => state.network.currentNetwork);
  
  /**
   * Save the current network to a file
   */
  const handleSaveNetwork = async () => {
    try {
      // Create a JSON string of the current network
      const networkJson = JSON.stringify(currentNetwork, null, 2);
      const blob = new Blob([networkJson], { type: 'application/json' });
      
      // Generate default filename from network metadata or timestamp
      const defaultFilename = currentNetwork.metadata?.name 
        ? `${currentNetwork.metadata.name}.json`
        : `spin-network-${new Date().toISOString().slice(0, 10)}.json`;
      
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
      alert('Failed to save network. Please try again.');
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
      const network = JSON.parse(jsonString) as SpinNetwork;
      
      // Basic validation
      if (!network.nodes || !network.edges || !network.metadata) {
        throw new Error('Invalid network file format');
      }
      
      // Dispatch action to set the network
      dispatch(setNetwork(network));
      console.log('Network loaded successfully');
    } catch (error) {
      console.error('Error parsing network JSON:', error);
      alert('Failed to load network. The file format appears to be invalid.');
    }
  };
  
  return (
    <div className="flex space-x-2">
      <button
        onClick={handleSaveNetwork}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Save Network
      </button>
      <button
        onClick={handleLoadNetwork}
        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
      >
        Load Network
      </button>
    </div>
  );
};

export default FileOperations;
