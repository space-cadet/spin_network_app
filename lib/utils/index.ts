/**
 * Utilities module for the Spin Network simulation library
 * 
 * This module provides utility functions and helpers for
 * working with spin network simulations.
 * 
 * Note: Full utility functionality (logging, serialization, file I/O)
 * will be implemented in a future update. Currently focusing on core
 * simulation capabilities.
 */

// Basic utility functions for core simulation

/**
 * Creates a unique ID string
 * @returns A unique string ID
 */
export function generateId(): string {
  return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Simple deep clone function for JSON-serializable objects
 * @param obj Object to clone
 * @returns Cloned copy of the object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Checks if two arrays contain the same elements (order-independent)
 * @param arr1 First array
 * @param arr2 Second array
 * @returns True if arrays contain the same elements
 */
export function arraysHaveSameElements<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  
  const set1 = new Set(arr1);
  return arr2.every(item => set1.has(item));
}
