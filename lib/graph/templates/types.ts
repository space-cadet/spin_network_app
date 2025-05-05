/**
 * Type definitions for graph template generation
 */

/**
 * Configuration options for graph templates
 */
export interface GraphTemplateOptions {
  /**
   * Node count for the generated graph
   * @default 5
   */
  nodeCount?: number;
  
  /**
   * How to assign spin values to edges
   * 'fixed' uses a constant spin value, 'random' uses random values
   * @default 'fixed'
   */
  spinType?: 'fixed' | 'random';
  
  /**
   * Fixed spin value to use when spinType is 'fixed'
   * @default 0.5
   */
  fixedSpinValue?: number;
  
  /**
   * Minimum spin value when using random spins
   * @default 0.5
   */
  minSpin?: number;
  
  /**
   * Maximum spin value when using random spins
   * @default 2.0
   */
  maxSpin?: number;
  
  /**
   * Default intertwiner value for nodes
   * @default 2
   */
  defaultIntertwiner?: number;
  
  /**
   * Custom prefix for node IDs
   * @default 'node'
   */
  nodeIdPrefix?: string;
  
  /**
   * Custom prefix for edge IDs
   * @default 'edge'
   */
  edgeIdPrefix?: string;
}

/**
 * Options specific to grid graph generation
 */
export interface GridGraphOptions extends GraphTemplateOptions {
  /**
   * Number of rows in the grid
   * If not specified, will use a square approximation based on nodeCount
   */
  rows?: number;
  
  /**
   * Number of columns in the grid
   * If not specified, will use a square approximation based on nodeCount
   */
  columns?: number;
  
  /**
   * Spacing between nodes in the grid
   * @default 80
   */
  spacing?: number;
}

/**
 * Options specific to ring graph generation
 */
export interface RingGraphOptions extends GraphTemplateOptions {
  /**
   * Radius of the ring
   * @default 150
   */
  radius?: number;
  
  /**
   * Center X position of the ring
   * @default radius
   */
  centerX?: number;
  
  /**
   * Center Y position of the ring
   * @default radius
   */
  centerY?: number;
}

/**
 * Options specific to line graph generation
 */
export interface LineGraphOptions extends GraphTemplateOptions {
  /**
   * Spacing between nodes in the line
   * @default 100
   */
  spacing?: number;
  
  /**
   * Starting X position of the line
   * @default 0
   */
  startX?: number;
  
  /**
   * Starting Y position of the line
   * @default 0
   */
  startY?: number;
}

/**
 * Options specific to random graph generation
 */
export interface RandomGraphOptions extends GraphTemplateOptions {
  /**
   * Width of the area to randomly place nodes
   * @default 300
   */
  width?: number;
  
  /**
   * Height of the area to randomly place nodes
   * @default 300
   */
  height?: number;
  
  /**
   * Edge density factor
   * Higher values create more edges (0-1 range)
   * @default 0.5
   */
  connectivity?: number;
  
  /**
   * Ensure the graph is connected (has no isolated nodes)
   * @default true
   */
  ensureConnected?: boolean;
}
