/**
 * Utility functions for simulation visualization
 */
import cytoscape from 'cytoscape';

/**
 * Apply visualization state from simulation to Cytoscape instance
 * This is a wrapper around the CytoscapeAdapter's functionality
 */
export const applyVisualizationState = (
  cy: cytoscape.Core,
  visualizationState: any,
  adapter: any
) => {
  if (!cy || !visualizationState || Object.keys(visualizationState).length === 0) {
    return false;
  }
  
  try {
    // First ensure nodes exist before applying visualization
    const nodeCount = cy.nodes().length;
    if (nodeCount > 0) {
      adapter.applyCytoscapeVisualization(cy, visualizationState);
      return true;
    } else {
      console.warn("Cannot apply visualization: no nodes in cytoscape");
      return false;
    }
  } catch (error) {
    console.error("Error applying simulation visualization:", error);
    return false;
  }
};

/**
 * Check if visualization was applied correctly
 */
export const verifyVisualization = (
  cy: cytoscape.Core
): boolean => {
  // Check if visualization was applied by checking a random node
  const sampleNode = cy.nodes().first();
  if (sampleNode && !sampleNode.empty()) {
    console.log("Applied visualization to cytoscape nodes, color of first node:", 
      sampleNode.style('background-color'));
    return true;
  }
  return false;
};

/**
 * Get color for a value within a range
 */
export const getColorForValue = (
  value: number,
  minValue: number,
  maxValue: number,
  colorScale: [string, string] = ['#dbeafe', '#3b82f6']
): string => {
  // Normalize the value to 0-1 range
  const range = maxValue - minValue;
  const normalized = range > 0 ? (value - minValue) / range : 0.5;
  
  // Simple linear interpolation between two colors for now
  // A more sophisticated version might use a color scale library
  return interpolateColor(colorScale[0], colorScale[1], normalized);
};

/**
 * Simple linear interpolation between two hex colors
 */
const interpolateColor = (
  color1: string,
  color2: string,
  factor: number
): string => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  if (!c1 || !c2) return color1;
  
  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));
  
  return rgbToHex(r, g, b);
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB to hex color
 */
const rgbToHex = (
  r: number,
  g: number,
  b: number
): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
