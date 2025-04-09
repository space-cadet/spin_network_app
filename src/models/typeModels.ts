/**
 * Type definitions for node and edge types in the Spin Network application
 */

/**
 * Represents a node type and its visual styling
 */
export interface NodeType {
  id: string;
  name: string;
  description: string;
  color: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  shape: 'ellipse' | 'rectangle' | 'triangle' | 'diamond' | 'hexagon';
  size: number;
  labelPosition: 'center' | 'top' | 'bottom';
  // Label style properties
  labelColor?: string;
  labelSize?: number;
  labelBold?: boolean;
  labelItalic?: boolean;
  isSystem?: boolean; // Indicates if this is a system type that cannot be deleted
}

/**
 * Represents an edge type and its visual styling
 */
export interface EdgeType {
  id: string;
  name: string;
  description: string;
  color: string;
  thickness: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  arrow: 'none' | 'triangle' | 'vee';
  arrowScale: number;
  // Label style properties
  labelColor?: string;
  labelSize?: number;
  labelBold?: boolean;
  labelItalic?: boolean;
  labelBackgroundColor?: string;
  labelBackgroundOpacity?: number;
  isSystem?: boolean; // Indicates if this is a system type that cannot be deleted
}

/**
 * Default node types to use when initializing the app
 */
export const DEFAULT_NODE_TYPES: NodeType[] = [
  {
    id: 'regular',
    name: 'Regular Node',
    description: 'Default node style',
    color: '#4f46e5',
    borderColor: '#4338ca',
    borderWidth: 2,
    borderStyle: 'solid',
    shape: 'ellipse',
    size: 80,
    labelPosition: 'center',
    labelColor: '#ffffff',
    labelSize: 14,
    labelBold: false,
    labelItalic: false,
    isSystem: true
  },
  {
    id: 'placeholder',
    name: 'Placeholder Node',
    description: 'Visual indicator for dangling edge endpoints',
    color: '#f97316',
    borderColor: '#fb923c',
    borderWidth: 2,
    borderStyle: 'dashed',
    shape: 'diamond',
    size: 32,
    labelPosition: 'center',
    labelColor: '#ffffff',
    labelSize: 12,
    labelBold: false,
    labelItalic: false,
    isSystem: true
  }
];

/**
 * Default edge types to use when initializing the app
 */
export const DEFAULT_EDGE_TYPES: EdgeType[] = [
  {
    id: 'regular',
    name: 'Regular Edge',
    description: 'Default edge style',
    color: '#3b82f6',
    thickness: 3,
    lineStyle: 'solid',
    arrow: 'none',
    arrowScale: 1,
    labelColor: '#334155',
    labelSize: 14,
    labelBold: false,
    labelItalic: false,
    labelBackgroundColor: '#ffffff',
    labelBackgroundOpacity: 1,
    isSystem: true
  },
  {
    id: 'dangling',
    name: 'Dangling Edge',
    description: 'Edge with one or both endpoints missing',
    color: '#f97316',
    thickness: 2,
    lineStyle: 'dashed',
    arrow: 'none',
    arrowScale: 1,
    labelColor: '#334155',
    labelSize: 14,
    labelBold: false,
    labelItalic: false,
    labelBackgroundColor: '#ffffff',
    labelBackgroundOpacity: 0.8,
    isSystem: true
  }
];
