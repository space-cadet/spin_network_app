/**
 * Database module main export
 */

// Database configuration
export { db, initDatabase, resetDatabase, getDatabaseStatus } from './db.config';

// Services
export { LogService } from './services/logService';
export { SimulationService } from './services/simulationService';
export { GraphService } from './services/graphService';

// Models
export * from './models/logModels';
export * from './models/simulationModels';
export * from './models/graphModels';

// Migrations
export * from './migrations/logMigration';
export * from './migrations/simulationMigration';

/**
 * Initialize all database services
 * This can be called during application startup
 */
export async function initDatabaseServices(): Promise<void> {
  try {
    // Initialize the database
    await initDatabase();
    
    // Additional initialization can be added here
    
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to initialize database services:', error);
    return Promise.reject(error);
  }
}

/**
 * Get the status of all database tables
 * @returns Object with counts of records in each table
 */
export async function getDatabaseStats(): Promise<{
  logs: number;
  simulations: number;
  simulationResults: number;
  graphs: number;
  totalRecords: number;
}> {
  try {
    const status = await getDatabaseStatus();
    
    const counts = status.tableCount;
    const totalRecords = 
      (counts.logs || 0) +
      (counts.simulations || 0) +
      (counts.simulationResults || 0) +
      (counts.graphs || 0);
    
    return {
      logs: counts.logs || 0,
      simulations: counts.simulations || 0,
      simulationResults: counts.simulationResults || 0,
      graphs: counts.graphs || 0,
      totalRecords
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    throw error;
  }
}
