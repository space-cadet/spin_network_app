/**
 * Custom global type definitions
 */

// Extend the Window interface to include the fs object
interface Window {
  /**
   * File system utilities for browser environments
   */
  fs?: {
    /**
     * Read a file asynchronously
     * @param path Path to the file
     * @param options Optional configuration including encoding
     * @returns Promise resolving to file contents
     */
    readFile(path: string, options?: { encoding?: string }): Promise<string | ArrayBuffer>;
  };
}
