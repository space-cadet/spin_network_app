/**
 * Adapters module for the Spin Network simulation library
 * 
 * This module provides optional adapters for visualizing spin network
 * simulations using various visualization libraries.
 * 
 * Note: Currently minimal implementation for core functionality only.
 */

// Minimal exports for now - visualization adapters will be implemented later
export interface MinimalVisualizationAdapter {
  initialize: (graph: any) => void;
  updateState: (state: any) => void;
}
