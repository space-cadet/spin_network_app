/**
 * Common types and interfaces for visualization adapters
 * 
 * This file defines shared types for both 2D (Cytoscape.js) and
 * future 3D (three.js) visualization adapters to ensure compatibility.
 */

import { VisualizationAdapter } from '../core/types';

/**
 * Common base type for visualization options
 */
export interface BaseVisualizationOptions {
  useColor: boolean;
  useSize: boolean;
  showValues: boolean;
  normalizeValues: boolean;
}

/**
 * Type for color gradient options
 */
export interface ColorGradientOptions {
  minColor: string;
  maxColor: string;
  midColor?: string; // Optional middle color for diverging scales
  midPoint?: number; // Value at which the middle color applies (0-1)
}

/**
 * Type for size mapping options
 */
export interface SizeMappingOptions {
  minSize: number;
  maxSize: number;
  sizeProperty: 'radius' | 'area' | 'volume'; // How to interpret size
}

/**
 * Function to convert between visualization types
 * Useful for switching between 2D and 3D visualizations
 */
export type VisualizationConverter<From, To> = (from: From) => To;

/**
 * Factory to create the appropriate visualization adapter based on settings
 */
export class VisualizationAdapterFactory {
  /**
   * Create a visualization adapter based on visualization type
   */
  static createAdapter(
    visualizationType: 'cytoscape' | '3d',
    options?: any
  ): VisualizationAdapter<any> {
    // Currently, only Cytoscape adapter is implemented
    // In the future, this will handle three.js adapters as well
    
    if (visualizationType === 'cytoscape') {
      // Dynamically import to avoid circular dependencies
      const { CytoscapeAdapter } = require('./cytoscapeAdapter');
      return new CytoscapeAdapter(options);
    }
    
    throw new Error(`Visualization type '${visualizationType}' not implemented yet.`);
  }
}
