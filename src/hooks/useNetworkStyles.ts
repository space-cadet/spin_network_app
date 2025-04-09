import { useAppSelector } from '../store/hooks';
import { selectViewSettings } from '../store/selectors';

/**
 * Custom hook that generates Cytoscape style based on view settings
 */
export const useNetworkStyles = () => {
  const viewSettings = useAppSelector(selectViewSettings);
  
  // Map settings to actual size values
  const getNodeSize = () => {
    switch(viewSettings?.nodeSize) {
      case 'small': return 60;
      case 'large': return 100;
      default: return 80; // medium (default)
    }
  };
  
  const getEdgeThickness = () => {
    switch(viewSettings?.edgeThickness) {
      case 'thin': return 2;
      case 'thick': return 4;
      default: return 3; // medium (default)
    }
  };
  
  // Create style array with view settings applied
  const styles = [
    {
      selector: 'node[type="regular"]',
      style: {
        'background-color': '#4f46e5',
        'label': viewSettings?.showNodeLabels ? 'data(label)' : '',
        'color': '#fff',
        'text-outline-color': '#4f46e5',
        'text-outline-width': 2,
        'text-valign': 'center',
        'width': getNodeSize(),
        'height': getNodeSize(),
        'font-size': '14px'
      }
    },
    {
      selector: 'node[type="placeholder"], .placeholder-node',
      style: {
        'background-color': '#f97316',
        'border-width': 2,
        'border-color': '#fb923c',
        'border-style': 'dashed',
        'width': getNodeSize() * 0.4,
        'height': getNodeSize() * 0.4,
        'shape': 'diamond',
        'opacity': 0.7,
        'label': '',
        'text-opacity': 0 // Make any text completely transparent
      }
    },
    {
      selector: 'edge',
      style: {
        'width': getEdgeThickness(),
        'line-color': '#3b82f6',
        'curve-style': 'bezier',
        'label': viewSettings?.showEdgeLabels ? 'data(label)' : '',
        'color': '#334155',
        'text-background-color': '#fff',
        'text-background-opacity': 1,
        'text-background-padding': '2px'
      }
    },
    {
      selector: 'edge[hasDangling]',
      style: {
        'line-style': 'dashed',
        'line-color': '#f97316', // Match placeholder color
        'width': getEdgeThickness() * 0.75,
        'target-arrow-shape': 'none',
        'source-arrow-shape': 'none'
      }
    },
    {
      selector: ':selected',
      style: {
        'background-color': '#ef4444',
        'line-color': '#ef4444',
        'border-width': 2,
        'border-color': '#fef2f2'
      }
    },
    {
      selector: '.source-node',
      style: {
        'border-width': 3,
        'border-color': '#10b981',
        'border-style': 'solid'
      }
    }
  ];
  
  return styles;
};
