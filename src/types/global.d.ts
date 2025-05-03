/**
 * Custom global type definitions
 */

/**
 * BrowserFS Module interface
 */
interface BrowserFSModule {
  configure: (config: any, callback: (err?: any) => void) => void;
  BFSRequire: (module: string) => any;
}

/**
 * File System interface for BrowserFS
 */
interface FileSystem {
  /**
   * Read a file asynchronously
   */
  readFile(path: string, options?: { encoding?: string } | string, callback?: (err: any, data: string | Buffer) => void): Promise<string | ArrayBuffer>;

  /**
   * Write data to a file
   */
  writeFile(path: string, data: string, options?: { encoding?: string } | string, callback?: (err: any) => void): void;

  /**
   * Append data to a file
   */
  appendFile(path: string, data: string, options?: { encoding?: string } | string, callback?: (err: any) => void): void;

  /**
   * Create a directory
   */
  mkdir(path: string, options?: { recursive?: boolean } | number, callback?: (err: any) => void): void;

  /**
   * Create a directory synchronously
   */
  mkdirSync(path: string, options?: { recursive?: boolean } | number): void;

  /**
   * Check if a path exists synchronously
   */
  existsSync(path: string): boolean;
  
  /**
   * Read a file synchronously
   */
  readFileSync(path: string, options?: { encoding?: string } | string): string | Buffer;
  
  /**
   * Write a file synchronously
   */
  writeFileSync(path: string, data: string, options?: { encoding?: string } | string): void;

  /**
   * Any other methods
   */
  [key: string]: any;
}

// Global declarations for BrowserFS, fs, and path
declare global {
  var BrowserFS: BrowserFSModule | undefined;
  var fs: FileSystem | undefined;
  var path: any | undefined;

  // Extend Window interface
  interface Window {
    BrowserFS?: BrowserFSModule;
    fs?: FileSystem;
    path?: any;
    SpinNetwork: any; // Add SpinNetwork global
  }
}

export {};
