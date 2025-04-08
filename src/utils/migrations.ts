import { createMigrate } from 'redux-persist';
import { DEFAULT_NODE_TYPES, DEFAULT_EDGE_TYPES } from '../models/typeModels';

/**
 * This file contains migrations for redux-persist state versions.
 * When the state structure changes, we can define transformations to migrate from
 * older versions of the state to the current one.
 * 
 * Current version: 2
 */

/**
 * Helper function to ensure types are arrays
 */
const ensureTypesAreArrays = (state: any) => {
  // Make a copy of the state to work with
  const newState = { ...state };
  
  // Fix types slice if it exists
  if (newState.types) {
    // Check and fix nodeTypes
    if (!newState.types.nodeTypes || !Array.isArray(newState.types.nodeTypes)) {
      console.log("Migration: Fixing corrupted nodeTypes");
      newState.types = {
        ...newState.types,
        nodeTypes: [...DEFAULT_NODE_TYPES]
      };
    }
    
    // Check and fix edgeTypes
    if (!newState.types.edgeTypes || !Array.isArray(newState.types.edgeTypes)) {
      console.log("Migration: Fixing corrupted edgeTypes");
      newState.types = {
        ...newState.types,
        edgeTypes: [...DEFAULT_EDGE_TYPES]
      };
    }
    
    // Initialize usage counts if missing
    if (!newState.types.nodeTypeUsage) {
      newState.types.nodeTypeUsage = {};
    }
    
    if (!newState.types.edgeTypeUsage) {
      newState.types.edgeTypeUsage = {};
    }
  }
  
  return newState;
};

/**
 * Migration definitions
 * Each key is the version number (target version), and the value is the migration function
 */
export const migrations = {
  // Migration from version 0 to version 1
  1: (state: any) => {
    // First version of the app, no migration needed yet
    return { ...state };
  },
  
  // Migration to fix potential type corruption issues
  2: (state: any) => {
    // Fix any type array corruption issues
    return ensureTypesAreArrays(state);
  }
  
  // Add future migrations here as needed
};

/**
 * Creates a migration function for redux-persist
 */
export const migrationFunction = createMigrate(migrations, { debug: (import.meta as any).env?.DEV });
