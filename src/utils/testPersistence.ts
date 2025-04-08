/**
 * This utility can be used to test the state persistence functionality.
 * It's only used during development and debugging.
 */

import { store, persistor } from '../store';
import { createLattice } from '../store/slices/networkSlice';
import { setViewSettings } from '../store/slices/uiSlice';

/**
 * Test the persistence functionality
 */
export const testPersistence = () => {
  console.group('Testing State Persistence');
  
  // Test 1: Create a lattice network and check if it persists after reload
  console.log('Test 1: Creating a lattice network...');
  store.dispatch(createLattice({
    rows: 3,
    columns: 3,
    defaultIntertwiner: 1,
    defaultSpin: 0.5
  }));
  
  // Test 2: Change UI settings and check if they persist
  console.log('Test 2: Changing UI settings...');
  store.dispatch(setViewSettings({
    showLabels: false,
    showProperties: true
  }));
  
  // Ensure all changes are persisted
  persistor.flush().then(() => {
    console.log('Changes persisted. Please reload the page to verify persistence.');
  });
  
  console.groupEnd();
};

/**
 * Verify that state was correctly persisted after reload
 */
export const verifyPersistence = () => {
  console.group('Verifying State Persistence');
  
  const state = store.getState();
  
  // Check if the network was correctly persisted
  const network = state.network.currentNetwork;
  console.log('Network persisted:', {
    name: network.metadata?.name,
    nodeCount: network.nodes.length,
    edgeCount: network.edges.length
  });
  
  // Check if UI settings were correctly persisted
  const uiSettings = state.ui.viewSettings;
  console.log('UI settings persisted:', uiSettings);
  
  console.groupEnd();
};

// This will be exposed to the window object for easy testing in the browser console
(window as any).testStatePeristence = {
  test: testPersistence,
  verify: verifyPersistence
};
