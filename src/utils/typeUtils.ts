import { NodeType, EdgeType } from '../models/typeModels';

/**
 * Applies a node type's visual styling to a cytoscape node element
 * @param nodeElement The cytoscape node element
 * @param nodeType The node type to apply
 */
export function applyNodeTypeStyle(nodeElement: any, nodeType: NodeType): void {
  // Apply style to the cytoscape node
  nodeElement.style({
    'background-color': nodeType.color,
    'border-color': nodeType.borderColor,
    'border-width': `${nodeType.borderWidth}px`,
    'border-style': nodeType.borderStyle,
    'width': `${nodeType.size}px`,
    'height': `${nodeType.size}px`,
    'shape': nodeType.shape,
    'text-valign': nodeType.labelPosition === 'center' ? 'center' : 
                   nodeType.labelPosition === 'top' ? 'top' : 'bottom',
  });
}

/**
 * Applies an edge type's visual styling to a cytoscape edge element
 * @param edgeElement The cytoscape edge element
 * @param edgeType The edge type to apply
 */
export function applyEdgeTypeStyle(edgeElement: any, edgeType: EdgeType): void {
  // Apply style to the cytoscape edge
  edgeElement.style({
    'line-color': edgeType.color,
    'width': `${edgeType.thickness}px`,
    'line-style': edgeType.lineStyle,
    'target-arrow-shape': edgeType.arrow === 'none' ? 'none' :
                          edgeType.arrow === 'triangle' ? 'triangle' : 'vee',
    'target-arrow-color': edgeType.color,
    'arrow-scale': edgeType.arrowScale,
  });
}

/**
 * Returns a CSS class name for a node type that can be used in stylesheets
 * @param typeId The node type ID
 */
export function getNodeTypeClassName(typeId: string): string {
  return `node-type-${typeId}`;
}

/**
 * Returns a CSS class name for an edge type that can be used in stylesheets
 * @param typeId The edge type ID
 */
export function getEdgeTypeClassName(typeId: string): string {
  return `edge-type-${typeId}`;
}

/**
 * Generate CSS style rules for all node types
 * @param nodeTypes Array of node types
 */
export function generateNodeTypeStyles(nodeTypes: NodeType[]): string {
  return nodeTypes.map(type => {
    const className = getNodeTypeClassName(type.id);
    return `
      .${className} {
        background-color: ${type.color};
        border-color: ${type.borderColor};
        border-width: ${type.borderWidth}px;
        border-style: ${type.borderStyle};
        width: ${type.size}px;
        height: ${type.size}px;
        shape: ${type.shape};
        text-valign: ${type.labelPosition};
      }
    `;
  }).join('\n');
}

/**
 * Generate CSS style rules for all edge types
 * @param edgeTypes Array of edge types
 */
export function generateEdgeTypeStyles(edgeTypes: EdgeType[]): string {
  return edgeTypes.map(type => {
    const className = getEdgeTypeClassName(type.id);
    return `
      .${className} {
        line-color: ${type.color};
        width: ${type.thickness}px;
        line-style: ${type.lineStyle};
        target-arrow-shape: ${type.arrow === 'none' ? 'none' : 
                             type.arrow === 'triangle' ? 'triangle' : 'vee'};
        target-arrow-color: ${type.color};
        arrow-scale: ${type.arrowScale};
      }
    `;
  }).join('\n');
}
