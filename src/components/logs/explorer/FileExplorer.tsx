// src/components/logs/explorer/FileExplorer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FaFolder, FaFile, FaArrowLeft, FaDownload, FaTrash } from 'react-icons/fa';

// Interface for file/directory items
interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: Date;
}

const FileExplorer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [splitPosition, setSplitPosition] = useState<number>(50); // Default 50%
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
  }, [currentPath]);

  // Function to load files from BrowserFS
  const loadFiles = async (path: string) => {
    setLoading(true);
    setError(null);
    setFileContent(null);
    setSelectedFile(null);
    
    try {
      // Ensure window.fs is available
      if (!window.fs) {
        throw new Error('File system not initialized');
      }
      
      // Read directory contents
      window.fs.readdir(path, (err, items) => {
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
        
        items.forEach((name) => {
          const itemPath = `${path}/${name}`.replace(/\/+/g, '/');
          
          window.fs.stat(itemPath, (statErr, stats) => {
            pendingItems--;
            
            if (!statErr) {
              fileItems.push({
                name,
                path: itemPath,
                isDirectory: stats.isDirectory(),
                size: stats.isFile() ? stats.size : undefined,
                lastModified: stats.mtime ? new Date(stats.mtime) : undefined,
              });
            } else {
              console.warn(`Couldn't get stats for ${itemPath}:`, statErr);
            }
            
            // If all items processed, update state
            if (pendingItems === 0) {
              // Sort: directories first, then files alphabetically
              fileItems.sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
              });
              
              setFiles(fileItems);
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
    setCurrentPath(path);
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
      navigateToDirectory(file.path);
      return;
    }
    
    setSelectedFile(file.path);
    setFileContent(null); // Clear content while loading
    
    window.fs.readFile(file.path, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        console.error(`Error reading file ${file.path}:`, err);
        setError(`Error reading file: ${err.message}`);
        return;
      }
      
      setFileContent(data);
    });
  };

  // Delete a file
  const deleteFile = (file: FileItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete ${file.path}?`)) {
      if (file.isDirectory) {
        window.fs.rmdir(file.path, (err) => {
          if (err) {
            console.error(`Error deleting directory ${file.path}:`, err);
            setError(`Error deleting directory: ${err.message}`);
            return;
          }
          
          loadFiles(currentPath);
        });
      } else {
        window.fs.unlink(file.path, (err) => {
          if (err) {
            console.error(`Error deleting file ${file.path}:`, err);
            setError(`Error deleting file: ${err.message}`);
            return;
          }
          
          if (selectedFile === file.path) {
            setSelectedFile(null);
            setFileContent(null);
          }
          
          loadFiles(currentPath);
        });
      }
    }
  };

  // Download a file
  const downloadFile = (file: FileItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
    window.fs.readFile(file.path, (err, data) => {
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
    
    setSplitPosition(newPosition);
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
            <div className="divide-y">
              {files.map((file) => (
                <div
                  key={file.path}
                  onClick={() => viewFile(file)}
                  className={`p-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                    selectedFile === file.path ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="mr-2">
                    {file.isDirectory ? (
                      <FaFolder className="text-yellow-500" />
                    ) : (
                      <FaFile className="text-gray-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {file.isDirectory
                        ? 'Directory'
                        : file.size !== undefined
                        ? formatFileSize(file.size)
                        : 'Unknown size'}
                      {file.lastModified && ` • ${formatDate(file.lastModified)}`}
                    </div>
                  </div>
                  
                  {!file.isDirectory && (
                    <button
                      onClick={(e) => downloadFile(file, e)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => deleteFile(file, e)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded ml-1"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
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
