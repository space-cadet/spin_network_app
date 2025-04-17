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
     * @param callback Optional callback function
     * @returns Promise resolving to file contents
     */
    readFile(path: string, options?: { encoding?: string } | string, callback?: (err: any, data: string | Buffer) => void): Promise<string | ArrayBuffer>;

    /**
     * Write data to a file
     * @param path Path to the file
     * @param data Data to write
     * @param options Optional configuration including encoding
     * @param callback Optional callback function
     */
    writeFile(path: string, data: string, options?: { encoding?: string } | string, callback?: (err: any) => void): void;

    /**
     * Append data to a file
     * @param path Path to the file
     * @param data Data to append
     * @param options Optional configuration including encoding
     * @param callback Optional callback function
     */
    appendFile(path: string, data: string, options?: { encoding?: string } | string, callback?: (err: any) => void): void;

    /**
     * Create a directory
     * @param path Path to the directory
     * @param options Optional configuration including recursive creation
     * @param callback Optional callback function
     */
    mkdir(path: string, options?: { recursive?: boolean } | number, callback?: (err: any) => void): void;

    /**
     * Create a directory synchronously
     * @param path Path to the directory
     * @param options Optional configuration including recursive creation
     */
    mkdirSync(path: string, options?: { recursive?: boolean } | number): void;

    /**
     * Check if a path exists synchronously
     * @param path Path to check
     * @returns Boolean indicating existence
     */
    existsSync(path: string): boolean;
  };
}
