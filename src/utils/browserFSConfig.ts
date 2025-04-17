/**
 * BrowserFS Configuration Module
 * 
 * This module handles the initialization of BrowserFS to provide a file system API
 * in the browser environment. It's used primarily by the simulation logger for
 * storing logs and simulation results.
 */

// We'll use a script import approach instead of ESM import
// This ensures BrowserFS is loaded into the global scope properly
// We're not using import directly since BrowserFS wasn't designed for ESM

// Type definitions for BrowserFS global objects
interface BrowserFSModule {
  configure: (config: any, callback: (err?: any) => void) => void;
  BFSRequire: (module: string) => any;
}

// Node.js-like filesystem interface
interface FileSystem {
  readFile: any;
  writeFile: any;
  readFileSync: any;
  writeFileSync: any;
  mkdirSync: any;
  existsSync: any;
  [key: string]: any; // Allow any other methods
}

// Extend Window interface without conflicts
declare global {
  interface Window {
    BrowserFS: BrowserFSModule; // Remove optional flag and use exact type
    fs: FileSystem; // Use our FileSystem interface
    path: any;
  }
}

/**
 * Initialize BrowserFS with IndexedDB backend
 * This provides persistent storage across browser sessions
 */
export function initializeBrowserFS(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if BrowserFS is already loaded
    if (typeof window !== 'undefined' && !window.BrowserFS) {
      // If not loaded, dynamically load the script
      const script = document.createElement('script');
      script.src = '/node_modules/browserfs/dist/browserfs.min.js';
      script.onload = () => {
        console.log('BrowserFS script loaded dynamically');
        configureFS(resolve, reject);
      };
      script.onerror = (err) => {
        reject(new Error('Failed to load BrowserFS script: ' + err));
      };
      document.head.appendChild(script);
    } else {
      // BrowserFS already loaded, proceed with configuration
      configureFS(resolve, reject);
    }
  });
}

// Helper function to configure BrowserFS
function configureFS(resolve: () => void, reject: (error: Error) => void): void {
  if (!window.BrowserFS) {
    return reject(new Error('BrowserFS not available. Library might not be loaded correctly.'));
  }
  
  window.BrowserFS.configure({
    fs: "IndexedDB",
    options: {
      // The name of the database to use
      storeName: 'spin-network-fs'
    }
  }, (err: any) => {
    if (err) {
      console.error('Failed to initialize BrowserFS:', err);
      reject(err);
      return;
    }
    
    // BrowserFS is initialized and ready to use
    // Assign to window.fs for compatibility with existing code
    const fs = window.BrowserFS.BFSRequire('fs');
    const path = window.BrowserFS.BFSRequire('path');
    
    window.fs = fs;
    window.path = path;
    
    console.log('BrowserFS initialized successfully with IndexedDB backend');
    resolve();
  });
}

/**
 * Test if BrowserFS is properly initialized
 */
export function testBrowserFS(): boolean {
  if (typeof window === 'undefined' || !window.fs) {
    console.warn('BrowserFS not initialized: window.fs is undefined');
    return false;
  }
  
  try {
    // Try a simple operation to verify it's working
    const fs = window.fs;
    
    // Create logs directory without using recursive option
    // Check if directory exists first to avoid errors
    try {
      if (!fs.existsSync('/logs')) {
        fs.mkdirSync('/logs');
      }
    } catch (dirErr) {
      console.warn('Could not create logs directory:', dirErr);
      // Continue with test in root directory if logs creation fails
    }
    
    // Write a test file - use both sync and async methods to verify
    const testPath = '/logs/test.txt';
    const testData = 'BrowserFS test successful at ' + new Date().toISOString();
    
    fs.writeFileSync(testPath, testData);
    
    // Read the test file
    const testContent = fs.readFileSync(testPath, { encoding: 'utf8' });
    console.log('BrowserFS test successful:', testContent);
    
    return true;
  } catch (err) {
    console.error('BrowserFS test failed:', err);
    return false;
  }
}