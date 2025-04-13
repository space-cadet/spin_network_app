/**
 * Database configuration using Dexie.js
 */
import Dexie, { Table } from 'dexie';
import { LogEntry } from './models/logModels';
import { SimulationRecord, SimulationResultRecord } from './models/simulationModels';
import { GraphRecord } from './models/graphModels';

/**
 * SpinNetworkDatabase extends Dexie to provide typed access to our tables
 */
export class SpinNetworkDatabase extends Dexie {
  // Typed tables
  logs!: Table<LogEntry, number>;
  simulations!: Table<SimulationRecord, number>;
  simulationResults!: Table<SimulationResultRecord, number>;
  graphs!: Table<GraphRecord, number>;

  constructor() {
    super('SpinNetworkApp');
    
    // Define database schema with version
    this.version(1).stores({
      // Table schema definitions - each key represents an indexed property
      logs: '++id, timestamp, type, component, fixed',
      simulations: '++id, networkId, timestamp, status, name',
      simulationResults: '++id, simulationId, timePoint',
      graphs: '++id, networkId, timestamp, type, nodes'
    });
  }
}

// Create and export a singleton instance
export const db = new SpinNetworkDatabase();

/**
 * Initialize the database and handle version upgrades
 * @returns A promise that resolves when the database is ready
 */
export async function initDatabase(): Promise<void> {
  try {
    // Open the database - this will trigger version upgrades if needed
    await db.open();
    console.log('Spin Network Database initialized successfully');
    
    // Additional initialization if needed
    // ...
    
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return Promise.reject(error);
  }
}

/**
 * Reset the database (for testing or recovery)
 * @param confirm Must be true to proceed with reset
 */
export async function resetDatabase(confirm: boolean): Promise<void> {
  if (!confirm) {
    return Promise.reject(new Error('Database reset requires confirmation'));
  }
  
  try {
    // Close the database
    await db.close();
    
    // Delete the database
    await Dexie.delete('SpinNetworkApp');
    
    // Recreate the database
    await initDatabase();
    
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to reset database:', error);
    return Promise.reject(error);
  }
}

// Additional functions for database status, size reporting, etc.
export async function getDatabaseStatus(): Promise<{
  isOpen: boolean;
  version: number;
  tableCount: Record<string, number>;
}> {
  const tableCount: Record<string, number> = {};
  
  // Get count of records in each table
  if (db.isOpen()) {
    tableCount.logs = await db.logs.count();
    tableCount.simulations = await db.simulations.count();
    tableCount.simulationResults = await db.simulationResults.count();
    tableCount.graphs = await db.graphs.count();
  }
  
  return {
    isOpen: db.isOpen(),
    version: db.verno,
    tableCount
  };
}

// Initialize database when this module is imported
initDatabase().catch(error => {
  console.error('Database initialization failed:', error);
});
