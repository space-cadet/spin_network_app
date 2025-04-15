/**
 * Visualization types for the Spin Network simulation library
 * 
 * This file defines common types for visualization adapters
 */

import { SimulationGraph, StateVector } from '../core/types';

/**
 * Base interface for all visualization adapters
 */
export interface VisualizationAdapter {
  /**
   * Initialize the visualization with a graph
   */
  initialize(graph: SimulationGraph): void;
  
  /**
   * Update the visualization with a new state
   */
  updateState(state: StateVector): void;
  
  /**
   * Set visualization options
   */
  setOptions(options: VisualizationOptions): void;
  
  /**
   * Get the current visualization options
   */
  getOptions(): VisualizationOptions;
  
  /**
   * Get the visualization container element (if applicable)
   */
  getContainer(): HTMLElement | null;
  
  /**
   * Clean up resources used by the visualization
   */
  destroy(): void;
}

/**
 * Base interface for visualization options
 */
export interface VisualizationOptions {
  /**
   * Width of the visualization in pixels
   */
  width?: number;
  
  /**
   * Height of the visualization in pixels
   */
  height?: number;
  
  /**
   * Whether to automatically fit the visualization to the container
   */
  autoFit?: boolean;
  
  /**
   * Color scheme for nodes and edges
   */
  colorScheme?: ColorScheme;
  
  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;
  
  /**
   * Whether to show labels
   */
  showLabels?: boolean;
  
  /**
   * Custom rendering options
   */
  [key: string]: any;
}

/**
 * Color scheme for visualizations
 */
export interface ColorScheme {
  /**
   * Base color for nodes
   */
  nodeColor?: string;
  
  /**
   * Color mapping function for nodes based on state value
   */
  nodeColorMap?: (value: number) => string;
  
  /**
   * Base color for edges
   */
  edgeColor?: string;
  
  /**
   * Color mapping function for edges based on spin value
   */
  edgeColorMap?: (spin: number) => string;
  
  /**
   * Background color
   */
  backgroundColor?: string;
  
  /**
   * Text color for labels
   */
  textColor?: string;
}

/**
 * Node rendering styles
 */
export enum NodeStyle {
  CIRCLE = 'circle',
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  DIAMOND = 'diamond',
  CUSTOM = 'custom'
}

/**
 * Edge rendering styles
 */
export enum EdgeStyle {
  LINE = 'line',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  CURVED = 'curved',
  CUSTOM = 'custom'
}
