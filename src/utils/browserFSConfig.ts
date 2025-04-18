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

// No need to redefine types as they're now in global.d.ts

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
  if (!window || !window.BrowserFS) {
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
    if (!window.BrowserFS) {
      reject(new Error('BrowserFS disappeared after configuration. This should not happen.'));
      return;
    }
    
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
 * Create all required log directories
 * This ensures the complete directory structure exists
 */
export function createLogDirectories(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.fs) {
      console.warn('BrowserFS not initialized: window.fs is undefined');
      resolve(false);
      return;
    }
    
    const fs = window.fs;
    
    // Define the complete directory structure
    const directories = [
      '/',
      '/logs',
      '/logs/application',
      '/logs/application/error',
      '/logs/application/performance',
      '/logs/application/user',
      '/logs/simulation',
      '/logs/simulation/tests',    // For test logs
      '/logs/simulation/runs',     // For simulation run logs and results
      '/logs/simulation/sessions', // For session logs
      '/logs/simulation/exports',  // For exported data
      '/logs/simulation/graphs',   // For graph structure and metadata
      '/logs/simulation/performance', // For performance logs
      '/logs/simulation/stability'    // For stability logs
    ];
    
    console.log('Directory structure to be created:', directories);
    
    console.log('Creating log directories structure...');
    
    // Use a recursive function to create directories one by one
    function createDirectoryAtIndex(index: number) {
      if (index >= directories.length) {
        // All directories created
        console.log('Successfully created all log directories');
        resolve(true);
        return;
      }
      
      const dir = directories[index];
      
      // Check if directory exists
      fs.stat(dir, (statErr: any) => {
        if (statErr) {
          // Directory doesn't exist, create it
          fs.mkdir(dir, (mkdirErr: any) => {
            if (mkdirErr && mkdirErr.code !== 'EEXIST') {
              console.warn(`Could not create directory ${dir}:`, mkdirErr);
            } else {
              console.log(`Created directory: ${dir}`);
            }
            // Continue with next directory regardless of success
            createDirectoryAtIndex(index + 1);
          });
        } else {
          // Directory already exists
          console.log(`Directory already exists: ${dir}`);
          createDirectoryAtIndex(index + 1);
        }
      });
    }
    
    // Start the process with the first directory
    createDirectoryAtIndex(0);
  });
}

/**
 * Test if BrowserFS is properly initialized and create test directories
 */
export function testBrowserFS(): boolean {
  if (typeof window === 'undefined' || !window.fs) {
    console.warn('BrowserFS not initialized: window.fs is undefined');
    return false;
  }
  
  try {
    // Try a simple operation to verify it's working
    const fs = window.fs;
    
    // Create basic directories for testing
    const testDirectories = ['/', '/logs', '/logs/simulation'];
    
    // Create directories one by one
    for (const dir of testDirectories) {
      try {
        if (!fs.existsSync(dir)) {
          console.log(`Creating directory: ${dir}`);
          fs.mkdirSync(dir);
        } else {
          console.log(`Directory already exists: ${dir}`);
        }
      } catch (dirErr) {
        console.warn(`Could not create directory ${dir}:`, dirErr);
        // Don't return here, try to continue with the test
      }
    }
    
    // After basic test, trigger the complete directory structure creation
    createLogDirectories().then(success => {
      console.log(`Log directories creation ${success ? 'succeeded' : 'failed'}`);
    });
    
    // Write a test file in the root directory to avoid path issues
    const testPath = '/browserfs-test.txt';
    const testData = 'BrowserFS test successful at ' + new Date().toISOString();
    
    try {
      fs.writeFileSync(testPath, testData);
      
      // Read the test file
      const testContent = fs.readFileSync(testPath, { encoding: 'utf8' });
      console.log(`BrowserFS test successful: ${testContent}`);
      
      // Check what files exist in the root directory
      const rootFiles = fs.readdirSync('/');
      console.log('Files in root directory:', rootFiles);
      
      // Check what files exist in the logs directory if it exists
      try {
        if (fs.existsSync('/logs')) {
          const logFiles = fs.readdirSync('/logs');
          console.log('Files in /logs directory:', logFiles);
        }
      } catch (readErr) {
        console.warn('Could not read /logs directory:', readErr);
      }
      
      return true;
    } catch (fileErr) {
      console.error('File operation failed:', fileErr);
      return false;
    }
  } catch (err) {
    console.error('BrowserFS test failed:', err);
    return false;
  }
}