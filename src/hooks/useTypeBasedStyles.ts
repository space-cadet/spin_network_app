import { useAppSelector } from '../store/hooks';
import { selectAllNodeTypes, selectAllEdgeTypes } from '../store/selectors/typeSelectors';
import { selectViewSettings } from '../store/selectors';
import { NodeType, EdgeType } from '../models/typeModels';

/**
 * Custom hook that generates Cytoscape style based on node and edge types
 */
export const useTypeBasedStyles = () => {
  const nodeTypes = useAppSelector(selectAllNodeTypes);
  const edgeTypes = useAppSelector(selectAllEdgeTypes);
  const viewSettings = useAppSelector(selectViewSettings);
  
  // Map node sizes based on view settings
  const getNodeSizeMultiplier = () => {
    switch(viewSettings?.nodeSize) {
      case 'small': return 0.75;
      case 'large': return 1.25;
      default: return 1.0; // medium (default)
    }
  };
  
  // Map edge thickness based on view settings
  const getEdgeThicknessMultiplier = () => {
    switch(viewSettings?.edgeThickness) {
      case 'thin': return 0.67;
      case 'thick': return 1.33;
      default: return 1.0; // medium (default)
    }
  };

  // Generate styles for all node types
  const generateNodeTypeStyles = () => {
    return nodeTypes.map((nodeType: NodeType) => ({
      selector: `node[type="${nodeType.id}"]`,
      style: {
        'background-color': nodeType.color,
        'border-color': nodeType.borderColor,
        'border-width': nodeType.borderWidth,
        'border-style': nodeType.borderStyle,
        'width': nodeType.size * getNodeSizeMultiplier(),
        'height': nodeType.size * getNodeSizeMultiplier(),
        'shape': nodeType.shape,
        'text-valign': nodeType.labelPosition,
        'label': viewSettings?.showNodeLabels ? 'data(label)' : '',
        'color': '#fff',
        'text-outline-color': nodeType.borderColor,
        'text-outline-width': 1.5,
        'font-size': '14px'
      }
    }));
  };

  // Generate styles for all edge types
  const generateEdgeTypeStyles = () => {
    return edgeTypes.map((edgeType: EdgeType) => ({
      selector: `edge[type="${edgeType.id}"]`,
      style: {
        'width': edgeType.thickness * getEdgeThicknessMultiplier(),
        'line-color': edgeType.color,
        'line-style': edgeType.lineStyle,
        'curve-style': 'bezier',
        'target-arrow-shape': edgeType.arrow,
        'arrow-scale': edgeType.arrowScale,
        'target-arrow-color': edgeType.color,
        'source-arrow-color': edgeType.color,
        'label': viewSettings?.showEdgeLabels ? 'data(label)' : '',
        'color': '#334155',
        'text-background-color': '#fff',
        'text-background-opacity': 1,
        'text-background-padding': '2px'
      }
    }));
  };

  // Basic styles that apply regardless of type
  const baseStyles = [
    // Default selector for any node without a recognized type
    {
      selector: 'node[type]', // Apply to all nodes with a type attribute
      style: {
        'background-color': '#4f46e5',
        'label': viewSettings?.showNodeLabels ? 'data(label)' : '',
        'color': '#fff',
        'text-outline-color': '#4f46e5',
        'text-outline-width': 2,
        'text-valign': 'center',
        'width': 80 * getNodeSizeMultiplier(),
        'height': 80 * getNodeSizeMultiplier(),
        'font-size': '14px'
      }
    },
    // Default selector for all edges with a type attribute
    {
      selector: 'edge[type]',
      style: {
        'width': 3 * getEdgeThicknessMultiplier(),
        'line-color': '#3b82f6',
        'curve-style': 'bezier',
        'label': viewSettings?.showEdgeLabels ? 'data(label)' : '',
        'color': '#334155',
        'text-background-color': '#fff',
        'text-background-opacity': 1,
        'text-background-padding': '2px'
      }
    },
    // Dangling edges style
    {
      selector: 'edge[hasDangling]',
      style: {
        'line-style': 'dashed',
        'line-color': '#f97316', // Match placeholder color
        'width': 2 * getEdgeThicknessMultiplier(),
        'target-arrow-shape': 'none',
        'source-arrow-shape': 'none'
      }
    },
    // Selection style
    {
      selector: ':selected',
      style: {
        'background-color': '#ef4444',
        'line-color': '#ef4444',
        'border-width': 2,
        'border-color': '#fef2f2'
      }
    },
    // Highlighted source node for edge creation
    {
      selector: '.source-node',
      style: {
        'border-width': 3,
        'border-color': '#10b981',
        'border-style': 'solid'
      }
    }
  ];

  // Combine all styles
  return [
    ...baseStyles,
    ...generateNodeTypeStyles(),
    ...generateEdgeTypeStyles()
  ];
};