import { createMigrate } from 'redux-persist';

/**
 * This file contains migrations for redux-persist state versions.
 * When the state structure changes, we can define transformations to migrate from
 * older versions of the state to the current one.
 * 
 * Current version: 1
 */

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
  
  // Add future migrations here
  // 2: (state: any) => {
  //   // Migrate from version 1 to version 2
  //   return {
  //     ...state,
  //     // Transform state properties as needed
  //   };
  // },
};

/**
 * Creates a migration function for redux-persist
 */
export const migrationFunction = createMigrate(migrations, { debug: (import.meta as any).env?.DEV });
