/**
 * Storage adapters for different environments
 */

import { StorageAdapter } from './types';

/**
 * In-memory storage adapter
 * Useful for testing or when persistent storage is not needed
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, any> = new Map();
  
  async save(key: string, data: any): Promise<void> {
    this.storage.set(key, JSON.parse(JSON.stringify(data)));
  }
  
  async load<T>(key: string): Promise<T | null> {
    if (!this.storage.has(key)) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(this.storage.get(key))) as T;
  }
  
  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }
  
  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }
  
  async listKeys(prefix: string = ''): Promise<string[]> {
    return Array.from(this.storage.keys())
      .filter(key => key.startsWith(prefix));
  }
}

/**
 * localStorage adapter for browser environments
 */
export class LocalStorageAdapter implements StorageAdapter {
  /**
   * Create a localStorage adapter with an optional namespace
   * @param namespace Optional namespace to prefix all keys
   */
  constructor(private namespace: string = '') {}
  
  private getFullKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }
  
  async save(key: string, data: any): Promise<void> {
    const fullKey = this.getFullKey(key);
    try {
      localStorage.setItem(fullKey, JSON.stringify(data));
    } catch (error) {
      if (error instanceof DOMException && (
        // Everything except Firefox
        error.code === 22 ||
        // Firefox
        error.code === 1014 ||
        // Test name field too, because code might not be present
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        throw new Error('localStorage quota exceeded. Try reducing the amount of data or using a different storage mechanism.');
      } else {
        throw error;
      }
    }
  }
  
  async load<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const data = localStorage.getItem(fullKey);
    
    if (data === null) {
      return null;
    }
    
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error parsing data for key ${key}:`, error);
      return null;
    }
  }
  
  async exists(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    return localStorage.getItem(fullKey) !== null;
  }
  
  async delete(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    localStorage.removeItem(fullKey);
  }
  
  async listKeys(prefix: string = ''): Promise<string[]> {
    const fullPrefix = this.namespace ? `${this.namespace}:${prefix}` : prefix;
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(fullPrefix)) {
        // Remove namespace prefix if one was used
        const resultKey = this.namespace ? key.substring(this.namespace.length + 1) : key;
        keys.push(resultKey);
      }
    }
    
    return keys;
  }
  
  /**
   * Check if localStorage is available in the current environment
   * @returns true if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * IndexedDB adapter for browser environments
 * Provides more storage capacity than localStorage
 */
export class IndexedDBAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private readonly dbName: string;
  private readonly storeName: string = 'spinNetworkStore';
  private readonly dbVersion: number = 1;
  
  /**
   * Create an IndexedDB adapter
   * @param dbName Name of the IndexedDB database
   */
  constructor(dbName: string = 'spinNetworkLibrary') {
    this.dbName = dbName;
  }
  
  /**
   * Initialize the database connection
   * @returns Promise resolving to the database connection
   */
  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          reject(new Error('IndexedDB is not supported in this browser'));
          return;
        }
        
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = (event) => {
          reject(new Error(`Failed to open IndexedDB: ${(event.target as any).error?.message || 'Unknown error'}`));
        };
        
        request.onsuccess = (event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create the object store if it doesn't exist
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
      });
    }
    
    return this.dbPromise;
  }
  
  async save(key: string, data: any): Promise<void> {
    const db = await this.getDB();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data, key);
      
      request.onerror = (event) => {
        reject(new Error(`Failed to save data: ${(event.target as any).error?.message || 'Unknown error'}`));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }
  
  async load<T>(key: string): Promise<T | null> {
    const db = await this.getDB();
    
    return new Promise<T | null>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onerror = (event) => {
        reject(new Error(`Failed to load data: ${(event.target as any).error?.message || 'Unknown error'}`));
      };
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }
  
  async exists(key: string): Promise<boolean> {
    const db = await this.getDB();
    
    return new Promise<boolean>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count(key);
      
      request.onerror = (event) => {
        reject(new Error(`Failed to check if key exists: ${(event.target as any).error?.message || 'Unknown error'}`));
      };
      
      request.onsuccess = () => {
        resolve(request.result > 0);
      };
    });
  }
  
  async delete(key: string): Promise<void> {
    const db = await this.getDB();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onerror = (event) => {
        reject(new Error(`Failed to delete data: ${(event.target as any).error?.message || 'Unknown error'}`));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }
  
  async listKeys(prefix: string = ''): Promise<string[]> {
    const db = await this.getDB();
    
    return new Promise<string[]>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();
      
      request.onerror = (event) => {
        reject(new Error(`Failed to list keys: ${(event.target as any).error?.message || 'Unknown error'}`));
      };
      
      request.onsuccess = () => {
        const keys = Array.from(request.result as IDBValidKey[])
          .filter(key => typeof key === 'string' && key.startsWith(prefix))
          .map(key => key.toString());
        
        resolve(keys);
      };
    });
  }
  
  /**
   * Check if IndexedDB is available in the current environment
   * @returns true if IndexedDB is available
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.indexedDB;
  }
}

/**
 * BrowserFS adapter for browser environments
 * Requires BrowserFS to be loaded and initialized
 */
export class BrowserFSAdapter implements StorageAdapter {
  private fs: any = null;
  private readonly basePath: string;
  
  /**
   * Create a BrowserFS adapter
   * @param basePath Base path for storing files
   */
  constructor(basePath: string = '/spin-network-storage') {
    this.basePath = basePath;
    
    // Check if BrowserFS and window.fs are available
    if (typeof window === 'undefined' || !window.fs) {
      throw new Error('BrowserFS is not available. Make sure it is properly loaded and initialized.');
    }
    
    this.fs = window.fs;
    
    // Create the base directory if it doesn't exist
    this.ensureDirectoryExists(this.basePath);
  }
  
  /**
   * Ensure a directory exists, creating it if necessary
   * @param path Directory path
   */
  private async ensureDirectoryExists(path: string): Promise<void> {
    try {
      // Check if path exists
      await new Promise<void>((resolve, reject) => {
        this.fs.stat(path, (err: any, stats: any) => {
          if (err) {
            if (err.code === 'ENOENT') {
              // Path doesn't exist, create it
              this.fs.mkdir(path, { recursive: true }, (err: any) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            } else {
              reject(err);
            }
          } else if (!stats.isDirectory()) {
            reject(new Error(`Path exists but is not a directory: ${path}`));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`Error ensuring directory exists: ${path}`, error);
      throw error;
    }
  }
  
  /**
   * Get the full path for a key
   * @param key Storage key
   * @returns Full file path
   */
  private getFilePath(key: string): string {
    // Sanitize key to be a valid filename
    const sanitizedKey = key.replace(/[^\w.-]/g, '_');
    return `${this.basePath}/${sanitizedKey}.json`;
  }
  
  async save(key: string, data: any): Promise<void> {
    await this.ensureDirectoryExists(this.basePath);
    
    const filePath = this.getFilePath(key);
    const content = JSON.stringify(data, null, 2);
    
    return new Promise<void>((resolve, reject) => {
      this.fs.writeFile(filePath, content, 'utf8', (err: any) => {
        if (err) {
          reject(new Error(`Failed to save data: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }
  
  async load<T>(key: string): Promise<T | null> {
    const filePath = this.getFilePath(key);
    
    return new Promise<T | null>((resolve, reject) => {
      this.fs.readFile(filePath, 'utf8', (err: any, data: string) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // File doesn't exist
            resolve(null);
          } else {
            reject(new Error(`Failed to load data: ${err.message}`));
          }
        } else {
          try {
            resolve(JSON.parse(data) as T);
          } catch (parseError) {
            reject(new Error(`Failed to parse data: ${parseError.message}`));
          }
        }
      });
    });
  }
  
  async exists(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);
    
    return new Promise<boolean>((resolve) => {
      this.fs.access(filePath, this.fs.constants.F_OK, (err: any) => {
        resolve(!err);
      });
    });
  }
  
  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    
    return new Promise<void>((resolve, reject) => {
      this.fs.unlink(filePath, (err: any) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // File doesn't exist, consider it deleted
            resolve();
          } else {
            reject(new Error(`Failed to delete data: ${err.message}`));
          }
        } else {
          resolve();
        }
      });
    });
  }
  
  async listKeys(prefix: string = ''): Promise<string[]> {
    await this.ensureDirectoryExists(this.basePath);
    
    return new Promise<string[]>((resolve, reject) => {
      this.fs.readdir(this.basePath, (err: any, files: string[]) => {
        if (err) {
          reject(new Error(`Failed to list keys: ${err.message}`));
        } else {
          // Filter for .json files and extract keys
          const keys = files
            .filter(file => file.endsWith('.json'))
            .map(file => file.slice(0, -5)) // Remove .json extension
            .filter(key => key.startsWith(prefix));
          
          resolve(keys);
        }
      });
    });
  }
  
  /**
   * Check if BrowserFS is available in the current environment
   * @returns true if BrowserFS is available
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.fs;
  }
}

/**
 * Node.js filesystem adapter
 * For use in Node.js environments
 * Note: This adapter will only work in Node.js environments, not in browsers
 */
export class NodeFSAdapter implements StorageAdapter {
  private fs: any = null;
  private path: any = null;
  private readonly basePath: string;
  
  /**
   * Create a Node.js filesystem adapter
   * @param basePath Base path for storing files
   */
  constructor(basePath: string) {
    this.basePath = basePath;
    
    // Check if we're in a Node.js environment
    if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
      throw new Error('NodeFSAdapter is only available in Node.js environments');
    }
    
    // Dynamically import Node.js modules
    try {
      // Use dynamic imports for Node.js modules
      // These will be resolved at runtime in Node.js environments
      this.fs = require('fs').promises;
      this.path = require('path');
      
      // Create the base directory if it doesn't exist
      this.ensureDirectoryExists(this.basePath);
    } catch (error) {
      throw new Error(`Failed to initialize NodeFSAdapter: ${error.message}`);
    }
  }
  
  /**
   * Ensure a directory exists, creating it if necessary
   * @param path Directory path
   */
  private async ensureDirectoryExists(path: string): Promise<void> {
    try {
      await this.fs.mkdir(path, { recursive: true });
    } catch (error) {
      console.error(`Error ensuring directory exists: ${path}`, error);
      throw error;
    }
  }
  
  /**
   * Get the full path for a key
   * @param key Storage key
   * @returns Full file path
   */
  private getFilePath(key: string): string {
    // Sanitize key to be a valid filename
    const sanitizedKey = key.replace(/[^\w.-]/g, '_');
    return this.path.join(this.basePath, `${sanitizedKey}.json`);
  }
  
  async save(key: string, data: any): Promise<void> {
    await this.ensureDirectoryExists(this.basePath);
    
    const filePath = this.getFilePath(key);
    const content = JSON.stringify(data, null, 2);
    
    try {
      await this.fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save data: ${error.message}`);
    }
  }
  
  async load<T>(key: string): Promise<T | null> {
    const filePath = this.getFilePath(key);
    
    try {
      const content = await this.fs.readFile(filePath, 'utf8');
      return JSON.parse(content) as T;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist
        return null;
      }
      throw new Error(`Failed to load data: ${error.message}`);
    }
  }
  
  async exists(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);
    
    try {
      await this.fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    
    try {
      await this.fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw new Error(`Failed to delete data: ${error.message}`);
      }
      // File doesn't exist, consider it already deleted
    }
  }
  
  async listKeys(prefix: string = ''): Promise<string[]> {
    await this.ensureDirectoryExists(this.basePath);
    
    try {
      const files = await this.fs.readdir(this.basePath);
      
      // Filter for .json files and extract keys
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.slice(0, -5)) // Remove .json extension
        .filter(key => key.startsWith(prefix));
    } catch (error) {
      throw new Error(`Failed to list keys: ${error.message}`);
    }
  }
  
  /**
   * Check if Node.js filesystem is available in the current environment
   * @returns true if Node.js filesystem is available
   */
  static isAvailable(): boolean {
    return typeof process !== 'undefined' && 
           !!process.versions && 
           !!process.versions.node;
  }
}

/**
 * Get the best available storage adapter for the current environment
 * @param namespace Optional namespace for localStorage
 * @param dbName Optional database name for IndexedDB
 * @param basePath Optional base path for BrowserFS/NodeFS
 * @returns The best available storage adapter
 */
export function getBestAvailableStorageAdapter(
  namespace: string = 'spin-network-library',
  dbName: string = 'spinNetworkLibrary',
  basePath: string = '/spin-network-storage'
): StorageAdapter {
  // Try IndexedDB first (best browser storage)
  if (IndexedDBAdapter.isAvailable()) {
    try {
      return new IndexedDBAdapter(dbName);
    } catch (error) {
      console.warn('IndexedDB is available but failed to initialize:', error);
    }
  }
  
  // Try BrowserFS if available
  if (BrowserFSAdapter.isAvailable()) {
    try {
      return new BrowserFSAdapter(basePath);
    } catch (error) {
      console.warn('BrowserFS is available but failed to initialize:', error);
    }
  }
  
  // Try localStorage
  if (LocalStorageAdapter.isAvailable()) {
    try {
      return new LocalStorageAdapter(namespace);
    } catch (error) {
      console.warn('localStorage is available but failed to initialize:', error);
    }
  }
  
  // Try Node.js filesystem
  if (NodeFSAdapter.isAvailable()) {
    try {
      // Use a default path in the current working directory
      const nodePath = typeof process !== 'undefined' ? 
        require('path').join(process.cwd(), '.spin-network-storage') : 
        './.spin-network-storage';
      
      return new NodeFSAdapter(nodePath);
    } catch (error) {
      console.warn('Node.js filesystem is available but failed to initialize:', error);
    }
  }
  
  // Fallback to in-memory storage
  console.warn('No persistent storage available, falling back to in-memory storage');
  return new MemoryStorageAdapter();
}
