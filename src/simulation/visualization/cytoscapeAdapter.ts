/**
 * Cytoscape.js adapter for simulation visualization
 * 
 * This adapter converts simulation states into visualization updates
 * for the current Cytoscape.js-based network view.
 */

import { StateVector, SimulationGraph, VisualizationAdapter } from '../core/types';

/**
 * Type for Cytoscape.js visualization state
 */
export type CytoscapeVisualizationState = {
  nodeValues: Record<string, number>;
  minValue: number;
  maxValue: number;
  options: {
    colorScale: [string, string]; // [minColor, maxColor]
    sizeScale: [number, number]; // [minSize, maxSize]
    useColor: boolean;
    useSize: boolean;
    showValues: boolean;
    normalizeValues: boolean;
  };
};

/**
 * Implementation of the VisualizationAdapter for Cytoscape.js
 */
export class CytoscapeAdapter implements VisualizationAdapter<CytoscapeVisualizationState> {
  
  /**
   * Default visualization options
   */
  private defaultOptions = {
    colorScale: ['#0000ff', '#ff0000'] as [string, string], // Blue to Red
    sizeScale: [10, 50] as [number, number],
    useColor: true,
    useSize: true,
    showValues: false,
    normalizeValues: true
  };
  
  /**
   * Current visualization options
   */
  private options = { ...this.defaultOptions };
  
  /**
   * Constructor with optional options
   */
  constructor(options?: Partial<CytoscapeVisualizationState['options']>) {
    if (options) {
      this.options = { ...this.defaultOptions, ...options };
    }
  }
  
  /**
   * Update options
   */
  setOptions(options: Partial<CytoscapeVisualizationState['options']>): void {
    this.options = { ...this.options, ...options };
  }
  
  /**
   * Convert a simulation state to a Cytoscape visualization state
   */
  stateToVisualization(
    state: StateVector, 
    graph: SimulationGraph
  ): CytoscapeVisualizationState {
    // Extract node values from the state
    const nodeValues: Record<string, number> = {};
    let minValue = Number.POSITIVE_INFINITY;
    let maxValue = Number.NEGATIVE_INFINITY;
    
    for (const nodeId of state.nodeIds) {
      const value = state.getValue(nodeId);
      nodeValues[nodeId] = value;
      
      if (value < minValue) minValue = value;
      if (value > maxValue) maxValue = value;
    }
    
    // Handle the case where all values are the same
    if (minValue === maxValue) {
      if (minValue === 0) {
        maxValue = 1; // Avoid division by zero
      } else {
        // Set a small range around the value
        const range = Math.abs(minValue) * 0.01;
        minValue -= range;
        maxValue += range;
      }
    }
    
    return {
      nodeValues,
      minValue,
      maxValue,
      options: { ...this.options }
    };
  }
  
  /**
   * Update an existing visualization with a new state
   */
  updateVisualization(
    visualization: CytoscapeVisualizationState, 
    state: StateVector, 
    graph: SimulationGraph
  ): void {
    // Extract node values from the state
    const nodeValues: Record<string, number> = {};
    let minValue = Number.POSITIVE_INFINITY;
    let maxValue = Number.NEGATIVE_INFINITY;
    
    for (const nodeId of state.nodeIds) {
      const value = state.getValue(nodeId);
      nodeValues[nodeId] = value;
      
      if (value < minValue) minValue = value;
      if (value > maxValue) maxValue = value;
    }
    
    // Handle the case where all values are the same
    if (minValue === maxValue) {
      if (minValue === 0) {
        maxValue = 1; // Avoid division by zero
      } else {
        // Set a small range around the value
        const range = Math.abs(minValue) * 0.01;
        minValue -= range;
        maxValue += range;
      }
    }
    
    // Update the visualization state
    visualization.nodeValues = nodeValues;
    visualization.minValue = minValue;
    visualization.maxValue = maxValue;
    visualization.options = { ...this.options };
  }
  
  /**
   * Create the initial visualization for a graph
   */
  createVisualization(graph: SimulationGraph): CytoscapeVisualizationState {
    // Create a default visualization with all values set to 0
    const nodeValues: Record<string, number> = {};
    
    for (const node of graph.nodes) {
      nodeValues[node.id] = 0;
    }
    
    return {
      nodeValues,
      minValue: 0,
      maxValue: 1, // Avoid division by zero in normalization
      options: { ...this.options }
    };
  }
  
  /**
   * Generate Cytoscape.js styles from a visualization state
   */
  generateCytoscapeStyles(
    visualization: CytoscapeVisualizationState
  ): Record<string, any>[] {
    const { nodeValues, minValue, maxValue, options } = visualization;
    const { colorScale, sizeScale, useColor, useSize, showValues, normalizeValues } = options;
    
    // Base styles
    const styles: Record<string, any>[] = [
      {
        selector: 'node',
        style: {
          'label': showValues ? (node: any) => {
            const value = nodeValues[node.id()];
            return value !== undefined ? value.toFixed(3) : '';
          } : ''
        }
      }
    ];
    
    // Function to normalize a value between min and max
    const normalize = (value: number): number => {
      if (normalizeValues) {
        if (maxValue === minValue) return 0.5;
        return (value - minValue) / (maxValue - minValue);
      }
      return value;
    };
    
    // Add node-specific styles
    for (const nodeId in nodeValues) {
      const value = nodeValues[nodeId];
      const normalizedValue = normalize(value);
      const style: Record<string, any> = {};
      
      // Apply color mapping if enabled
      if (useColor) {
        // Interpolate between min and max colors
        const r1 = parseInt(colorScale[0].substring(1, 3), 16);
        const g1 = parseInt(colorScale[0].substring(3, 5), 16);
        const b1 = parseInt(colorScale[0].substring(5, 7), 16);
        
        const r2 = parseInt(colorScale[1].substring(1, 3), 16);
        const g2 = parseInt(colorScale[1].substring(3, 5), 16);
        const b2 = parseInt(colorScale[1].substring(5, 7), 16);
        
        const r = Math.round(r1 + normalizedValue * (r2 - r1));
        const g = Math.round(g1 + normalizedValue * (g2 - g1));
        const b = Math.round(b1 + normalizedValue * (b2 - b1));
        
        style['background-color'] = `rgb(${r}, ${g}, ${b})`;
      }
      
      // Apply size mapping if enabled
      if (useSize) {
        const minSize = sizeScale[0];
        const maxSize = sizeScale[1];
        const size = minSize + normalizedValue * (maxSize - minSize);
        
        style['width'] = size;
        style['height'] = size;
      }
      
      // Add the node-specific style to the styles array
      styles.push({
        selector: `#${nodeId}`,
        style
      });
    }
    
    return styles;
  }
  
  /**
   * Apply visualization state directly to a Cytoscape instance
   */
  applyCytoscapeVisualization(
    cy: any, // Cytoscape instance
    visualization: CytoscapeVisualizationState
  ): void {
    const { nodeValues, minValue, maxValue, options } = visualization;
    const { colorScale, sizeScale, useColor, useSize, normalizeValues } = options;
    
    // Function to normalize a value between min and max with safeguards
    const normalize = (value: number): number => {
      // Default to middle value if no range
      if (maxValue === minValue) return 0.5;
      
      if (normalizeValues) {
        // Clamp between 0 and 1
        const norm = (value - minValue) / (maxValue - minValue);
        return Math.max(0, Math.min(1, norm));
      }
      return value;
    };
    
    // Calculate the actual range to detect if we have meaningful variation
    const range = maxValue - minValue;
    const hasSignificantRange = range > 0.0001;
    console.log(`Visualization range: ${range.toFixed(6)}, significant: ${hasSignificantRange}`);
    
    // Batch updates for better performance
    cy.batch(() => {
      // Update each node in the cytoscape instance
      Object.entries(nodeValues).forEach(([nodeId, value]) => {
        const node = cy.getElementById(nodeId);
        if (!node.empty()) {
          const normalizedValue = normalize(value);
          
          // Apply color mapping if enabled
          if (useColor) {
            // Interpolate between min and max colors
            const r1 = parseInt(colorScale[0].substring(1, 3), 16);
            const g1 = parseInt(colorScale[0].substring(3, 5), 16);
            const b1 = parseInt(colorScale[0].substring(5, 7), 16);
            
            const r2 = parseInt(colorScale[1].substring(1, 3), 16);
            const g2 = parseInt(colorScale[1].substring(3, 5), 16);
            const b2 = parseInt(colorScale[1].substring(5, 7), 16);
            
            const r = Math.round(r1 + normalizedValue * (r2 - r1));
            const g = Math.round(g1 + normalizedValue * (g2 - g1));
            const b = Math.round(b1 + normalizedValue * (b2 - b1));
            
            const color = `rgb(${r}, ${g}, ${b})`;
            node.style('background-color', color);
            
            // If non-significant range, make sure we see something
            if (!hasSignificantRange) {
              // Make values more visible by exaggerating differences
              node.style('border-width', 2);
              node.style('border-color', '#000000');
            }
          }
          
          // Apply size mapping if enabled
          if (useSize) {
            const minSize = sizeScale[0];
            const maxSize = sizeScale[1];
            const size = minSize + normalizedValue * (maxSize - minSize);
            
            node.style('width', size);
            node.style('height', size);
          }
          
          // Apply label if showing values
          if (options.showValues) {
            // For zero/tiny values, just show 0.000
            if (Math.abs(value) < 0.0001) {
              node.style('label', '0.000');
            } else {
              node.style('label', value.toFixed(3));
            }
          } else {
            // Always show labels when running simulation
            node.style('label', value.toFixed(3));
          }
        }
      });
    });
    
    // Update stylesheet to ensure changes are applied
    cy.style().update();
  }
}
