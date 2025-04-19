// src/components/logs/explorer/FileExplorer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FaFolder, FaFile, FaArrowLeft, FaDownload, FaTrash } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux'; // Import Redux hooks
import { RootState, AppDispatch } from '../../../store'; // Import store types
import {
  setCurrentPath as setReduxCurrentPath,
  setSelectedFile as setReduxSelectedFile,
  setSplitPosition as setReduxSplitPosition,
  setSortField, // Add missing action
  toggleSortDirection, // Add missing action
  toggleViewMode, // Add missing action
  SortField, // Import type
  ViewMode, // Import type
} from '../../../store/slices/logExplorerSlice';

// Interface for file/directory items
// Enhance FileItem Interface (Step 2)
interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: Date;
  createdAt?: Date; // Add createdAt
  type: string; // Add type
}

const FileExplorer: React.FC = () => {
  // --- Redux State ---
  const dispatch: AppDispatch = useDispatch();
  const currentPath = useSelector((state: RootState) => state.logExplorer.currentPath);
  const selectedFile = useSelector((state: RootState) => state.logExplorer.selectedFile);
  const splitPosition = useSelector((state: RootState) => state.logExplorer.splitPosition);
  const sortField = useSelector((state: RootState) => state.logExplorer.sortField);
  const sortDirection = useSelector((state: RootState) => state.logExplorer.sortDirection);
  const viewMode = useSelector((state: RootState) => state.logExplorer.viewMode);

  // --- Local Component State ---
  // const [currentPath, setCurrentPath] = useState<string>('/'); // Removed
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [selectedFile, setSelectedFile] = useState<string | null>(null); // Removed
  const [fileContent, setFileContent] = useState<string | null>(null);
  // const [splitPosition, setSplitPosition] = useState<number>(50); // Removed
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Load files for the current path
  useEffect(() => {
    loadFiles(currentPath);
    
    return () => {
      // Clean up event listeners when component unmounts
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentPath, dispatch]); // Add dispatch dependency

  // Handle sorting when a header is clicked
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      dispatch(toggleSortDirection());
    } else {
      // If clicking a new field, set it and default to Asc
      dispatch(setSortField(field));
      // Optionally reset direction to Asc when changing field, or keep current direction
      // dispatch(setSortDirection('Asc')); // Uncomment if you want to reset to Asc
    }
    // Reload files to apply the new sort order (or re-sort locally if preferred)
    // Note: loadFiles already sorts based on Redux state, so calling it works.
    // If you want instant local sorting without re-fetching, you'd sort `files` state here.
    loadFiles(currentPath); 
  };

  // Function to sort files based on Redux state
  const sortFiles = (items: FileItem[], field: SortField, direction: string): FileItem[] => {
    const sortedItems = [...items].sort((a, b) => {
      // Always keep directories grouped together, typically at the top when sorting by name ASC
      // Adjust logic slightly: directories first only if sorting by name asc, otherwise sort normally
      if (field === 'name' && direction === 'asc') { // Use lowercase 'name' and 'asc'
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
      } else if (field === 'name' && direction === 'desc') { // Use lowercase 'name' and 'desc'
        // Files first when sorting name desc
        if (a.isDirectory && !b.isDirectory) return 1;
        if (!a.isDirectory && b.isDirectory) return -1;
      }
      // For other fields or if both are files/dirs, sort by field

      let compareResult = 0;

      switch (field) {
        case 'name': // Use lowercase 'name'
          compareResult = a.name.localeCompare(b.name);
          break;
        case 'size': // Use lowercase 'size'
          // Handle undefined sizes (directories or errors)
          // Directories typically don't show size, sort them based on preference (e.g., 0 or -1)
          // Let's treat directory size as 0 for comparison purposes
          const sizeA = a.isDirectory ? 0 : a.size ?? 0;
          const sizeB = b.isDirectory ? 0 : b.size ?? 0;
          compareResult = sizeA - sizeB;
          break;
        case 'created': // Use lowercase 'created'
          // Handle undefined dates - treat as earliest possible time (0)
          const dateA_Created = a.createdAt?.getTime() ?? 0;
          const dateB_Created = b.createdAt?.getTime() ?? 0;
          compareResult = dateA_Created - dateB_Created;
          break;
        case 'modified': // Use lowercase 'modified'
          // Handle undefined dates - treat as earliest possible time (0)
          const dateA_Modified = a.lastModified?.getTime() ?? 0;
          const dateB_Modified = b.lastModified?.getTime() ?? 0;
          compareResult = dateA_Modified - dateB_Modified;
          break;
        default:
          // Should not happen with SortField type, but good practice
          compareResult = 0;
      }

      // Apply direction
      return direction === 'asc' ? compareResult : -compareResult; // Use lowercase 'asc'
    });

    return sortedItems;
  };


  // Function to load files from BrowserFS
  const loadFiles = async (path: string) => {
    setLoading(true);
    setError(null);
    setFileContent(null);
    dispatch(setReduxSelectedFile(null)); // Use Redux action
    
    try {
      // Ensure window.fs is available
      if (!window.fs) {
        throw new Error('File system not initialized');
      }
      
      // Read directory contents
      window.fs.readdir(path, (err: NodeJS.ErrnoException | null, items: string[]) => {
        if (err) {
          console.error('Error reading directory:', err);
          setError(`Error loading files: ${err.message}`);
          setLoading(false);
          return;
        }
        
        // Process items to get stats
        const fileItems: FileItem[] = [];
        let pendingItems = items.length;
        
        if (items.length === 0) {
          setFiles([]);
          setLoading(false);
          return;
        }
        
        items.forEach((name: string) => {
          const itemPath = `${path === '/' ? '' : path}/${name}`.replace(/\/+/g, '/'); // Fix path joining for root
          
          // Ensure window.fs exists before using it
          if (!window.fs) {
             setError('File system not initialized during stat');
             pendingItems--; // Decrement counter even on error
             if (pendingItems === 0) setLoading(false); // Ensure loading stops
             return;
          }

          window.fs.stat(itemPath, (statErr: NodeJS.ErrnoException | null, stats: any) => { // Use 'any' for stats temporarily if fs types aren't fully available/imported
            pendingItems--;
            
            if (!statErr && stats) {
              // Determine file type
              let fileType = 'file'; // Default to file
              if (stats.isDirectory()) {
                fileType = 'directory';
              } else {
                // Extract extension for type, handle no extension
                const extension = name.includes('.') ? name.split('.').pop()?.toLowerCase() : 'unknown';
                 if (extension) {
                   fileType = extension;
                 }
              }

              fileItems.push({
                name,
                path: itemPath,
                isDirectory: stats.isDirectory(),
                size: stats.isFile() ? stats.size : undefined,
                lastModified: stats.mtime ? new Date(stats.mtime) : undefined,
                createdAt: stats.birthtime ? new Date(stats.birthtime) : undefined, // Add createdAt
                type: fileType, // Add type
              });
            } else {
              console.warn(`Couldn't get stats for ${itemPath}:`, statErr);
            }
            
            // If all items processed, update state
            if (pendingItems === 0) {
              // Remove old sorting logic here
              
              // Call the new sort function using Redux state
              const sortedFiles = sortFiles(fileItems, sortField, sortDirection); 
              
              setFiles(sortedFiles); // Update local state with sorted files
              setLoading(false);
            }
          });
        });
      });
    } catch (err) {
      console.error('Error loading files:', err);
      setError(`Failed to load files: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  // Navigate to a directory
  const navigateToDirectory = (path: string) => {
    dispatch(setReduxCurrentPath(path));
  };

  // Navigate to parent directory
  const navigateUp = () => {
    if (currentPath === '/') return;
    
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    navigateToDirectory(parentPath);
  };

  // View file content
  const viewFile = (file: FileItem) => {
    if (file.isDirectory) {
      navigateToDirectory(file.path); // Still uses the updated navigateToDirectory
      return;
    }
    
    dispatch(setReduxSelectedFile(file.path)); // Dispatch Redux action
    setFileContent(null); // Clear content while loading
    
    // Ensure window.fs exists before using it
    if (!window.fs) {
      setError('File system not initialized');
      return;
    }
    
    // Use Buffer type for data as readFile can return it
    window.fs.readFile(file.path, { encoding: 'utf8' }, (err: NodeJS.ErrnoException | null, data: string | Buffer) => {
      if (err) {
        console.error(`Error reading file ${file.path}:`, err);
        setError(`Error reading file: ${err.message}`);
        setFileContent(null); // Clear content on error
        return;
      }
      
      // Handle potential Buffer data
      setFileContent(typeof data === 'string' ? data : data.toString('utf8'));
    });
  };

  // Delete a file
  const deleteFile = (file: FileItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete ${file.path}?`)) {
       // Ensure window.fs exists before using it
       if (!window.fs) {
         setError('File system not initialized');
         return;
       }

      if (file.isDirectory) {
        window.fs.rmdir(file.path, (err: NodeJS.ErrnoException | null) => {
          if (err) {
            console.error(`Error deleting directory ${file.path}:`, err);
            setError(`Error deleting directory: ${err.message}`);
            return;
          }
          
          loadFiles(currentPath); // Reload files after deletion
        });
      } else {
        window.fs.unlink(file.path, (err: NodeJS.ErrnoException | null) => {
          if (err) {
            console.error(`Error deleting file ${file.path}:`, err);
            setError(`Error deleting file: ${err.message}`);
            return;
          }
          
          // If the deleted file was selected, clear selection in Redux
          if (selectedFile === file.path) {
            dispatch(setReduxSelectedFile(null)); 
            setFileContent(null);
          }
          
          loadFiles(currentPath); // Reload files after deletion
        });
      }
    }
  };

  // Download a file
  const downloadFile = (file: FileItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
     // Ensure window.fs exists before using it
     if (!window.fs) {
       setError('File system not initialized');
       return;
      }

     // Use Buffer type for data, explicitly pass undefined for options
     window.fs.readFile(file.path, undefined, (err: NodeJS.ErrnoException | null, data: Buffer | string) => { 
       if (err) {
         console.error(`Error reading file ${file.path}:`, err);
        setError(`Error downloading file: ${err.message}`);
        return;
      }
      
      // Create blob and trigger download
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  // Format file size
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleString();
  };
  
  // Handle resizing panels
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Calculate position as percentage
    let newPosition = (mouseX / containerWidth) * 100;
    
    // Constrain between 20% and 80%
    newPosition = Math.max(20, Math.min(80, newPosition));
    
    dispatch(setReduxSplitPosition(newPosition)); // Dispatch Redux action
  };
  
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 bg-gray-100 mb-2">
        <button
          onClick={navigateUp}
          disabled={currentPath === '/'}
          className={`mr-2 p-1 rounded ${
            currentPath === '/' ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-100'
          }`}
        >
          <FaArrowLeft />
        </button>
        
        <div className="font-mono text-sm flex-1 overflow-auto">
          {currentPath}
        </div>
        
        <button
          onClick={() => loadFiles(currentPath)}
          className="ml-2 p-1 rounded text-blue-600 hover:bg-blue-100"
        >
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden" ref={containerRef}>
        {/* File list */}
        <div 
          className="overflow-auto pr-2" 
          style={{ width: `${splitPosition}%` }}
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : files.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No files found</div>
          ) : (
            <table className="w-full text-sm text-left table-fixed"> {/* Added table-fixed */}
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-4 py-3 w-1/2 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}> {/* Use lowercase 'name' */}
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')} {/* Use lowercase 'name' and 'asc' */}
                  </th>
                  <th scope="col" className="px-4 py-3 w-1/6 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('size')}> {/* Use lowercase 'size' */}
                    Size {sortField === 'size' && (sortDirection === 'asc' ? '▲' : '▼')} {/* Use lowercase 'size' and 'asc' */}
                  </th>
                  <th scope="col" className="px-4 py-3 w-1/6 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('modified')}> {/* Use lowercase 'modified' */}
                    Modified {sortField === 'modified' && (sortDirection === 'asc' ? '▲' : '▼')} {/* Use lowercase 'modified' and 'asc' */}
                  </th>
                  <th scope="col" className="px-4 py-3 w-1/6 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created')}> {/* Use lowercase 'created' */}
                    Created {sortField === 'created' && (sortDirection === 'asc' ? '▲' : '▼')} {/* Use lowercase 'created' and 'asc' */}
                  </th>
                  <th scope="col" className="px-4 py-3 w-auto"> {/* Actions column */}
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>{/* Add tbody, remove newline before map */}
              {files.map((file) => (
                <tr // Replace div with tr
                  key={file.path}
                  onClick={() => viewFile(file)}
                  className={`border-b hover:bg-gray-100 cursor-pointer ${
                    selectedFile === file.path ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Name Column */}
                  <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap flex items-center">
                    <div className="mr-2">
                      {file.isDirectory ? (
                        <FaFolder className="text-yellow-500" />
                      ) : (
                        <FaFile className="text-gray-500" />
                      )}
                    </div>
                    <span className="truncate">{file.name}</span>
                  </td>
                  {/* Size Column */}
                  <td className="px-4 py-2">
                    {file.isDirectory
                      ? '-' // Display dash for directory size
                      : file.size !== undefined
                      ? formatFileSize(file.size)
                      : 'N/A'}
                  </td>
                  {/* Modified Column */}
                  <td className="px-4 py-2">
                    {file.lastModified ? formatDate(file.lastModified) : 'N/A'}
                  </td>
                  {/* Created Column */}
                  <td className="px-4 py-2">
                    {file.createdAt ? formatDate(file.createdAt) : 'N/A'}
                  </td>
                  {/* Actions Column */}
                  <td className="px-4 py-2 flex items-center space-x-1">
                    {!file.isDirectory && (
                      <button
                        onClick={(e) => downloadFile(file, e)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Download"
                      >
                        <FaDownload size="0.8em" /> {/* Slightly smaller icon */}
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteFile(file, e)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <FaTrash size="0.8em" /> {/* Slightly smaller icon */}
                    </button>
                  </td>
                </tr>
              ))}
              </tbody> {/* Add closing tbody */}
            </table> 
          )}
        </div>
        
        {/* Resize handle */}
        <div 
          className="w-2 cursor-col-resize bg-gray-200 hover:bg-blue-300 active:bg-blue-400 transition-colors"
          onMouseDown={handleMouseDown}
        />
        
        {/* File content */}
        <div 
          className="overflow-auto pl-2" 
          style={{ width: `${100 - splitPosition}%` }}
        >
          {selectedFile ? (
            fileContent === null ? (
              <div className="p-4 text-center text-gray-500">Loading file...</div>
            ) : (
              <pre className="p-4 whitespace-pre-wrap break-words text-sm font-mono bg-gray-50 h-full overflow-auto">
                {fileContent}
              </pre>
            )
          ) : (
            <div className="p-4 text-center text-gray-500">
              Select a file to view its contents
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
