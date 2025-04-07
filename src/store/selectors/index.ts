import { RootState } from '../index';

// Network selectors
export const selectNetwork = (state: RootState) => state.network.currentNetwork;
export const selectNodes = (state: RootState) => state.network.currentNetwork.nodes;
export const selectEdges = (state: RootState) => state.network.currentNetwork.edges;
export const selectNetworkMetadata = (state: RootState) => state.network.currentNetwork.metadata;

// History state
export const selectCanUndo = (state: RootState) => state.network.canUndo;
export const selectCanRedo = (state: RootState) => state.network.canRedo;

// Recent networks
export const selectRecentNetworks = (state: RootState) => state.recentNetworks.entries;

// Find specific nodes and edges
export const selectNodeById = (id: string) => (state: RootState) => 
  state.network.currentNetwork.nodes.find(node => node.id === id);

export const selectEdgeById = (id: string) => (state: RootState) => 
  state.network.currentNetwork.edges.find(edge => edge.id === id);

// UI selectors
export const selectSelectedElement = (state: RootState) => state.ui.selectedElement;
export const selectInteractionMode = (state: RootState) => state.ui.interactionMode;
export const selectViewSettings = (state: RootState) => state.ui.viewSettings;
export const selectSidebarVisibility = (state: RootState) => state.ui.sidebarVisibility;
export const selectLeftSidebarVisible = (state: RootState) => state.ui.sidebarVisibility.left;
export const selectRightSidebarVisible = (state: RootState) => state.ui.sidebarVisibility.right;
export const selectBottomSidebarVisible = (state: RootState) => state.ui.sidebarVisibility.bottom;

// Sidebar size selectors
export const selectSidebarSizes = (state: RootState) => state.ui.sidebarSizes;
export const selectLeftSidebarSize = (state: RootState) => state.ui.sidebarSizes.left;
export const selectRightSidebarSize = (state: RootState) => state.ui.sidebarSizes.right;
export const selectBottomSidebarSize = (state: RootState) => state.ui.sidebarSizes.bottom;

// Section collapse state selectors
export const selectCollapsedSections = (state: RootState) => state.ui.collapsedSections;
export const selectSectionCollapsed = (sectionId: string) => (state: RootState) =>
  state.ui.collapsedSections[sectionId] || false;

// Settings selectors
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectPerformanceSettings = (state: RootState) => state.ui.performanceSettings;

// Selected element details
export const selectSelectedNode = (state: RootState) => {
  const { id, type } = state.ui.selectedElement;
  if (type !== 'node' || !id) return null;
  return state.network.currentNetwork.nodes.find(node => node.id === id) || null;
};

export const selectSelectedEdge = (state: RootState) => {
  const { id, type } = state.ui.selectedElement;
  if (type !== 'edge' || !id) return null;
  return state.network.currentNetwork.edges.find(edge => edge.id === id) || null;
};

// Get node or edge by type and id
export const selectElementByTypeAndId = (state: RootState) => {
  const { id, type } = state.ui.selectedElement;
  if (!id || !type) return null;
  
  if (type === 'node') {
    return state.network.currentNetwork.nodes.find(node => node.id === id) || null;
  } else if (type === 'edge') {
    return state.network.currentNetwork.edges.find(edge => edge.id === id) || null;
  }
  
  return null;
};

// Helper to get connected node details for an edge
// Note: This selector is kept for reference but we're now using a useMemo approach 
// in the PropertiesPanel component to avoid conditional hook calls
export const selectEdgeNodeDetails = (edgeId: string) => (state: RootState) => {
  const edge = state.network.currentNetwork.edges.find(edge => edge.id === edgeId);
  if (!edge) return null;
  
  const sourceNode = state.network.currentNetwork.nodes.find(node => node.id === edge.source);
  const targetNode = state.network.currentNetwork.nodes.find(node => node.id === edge.target);
  
  return {
    edge,
    sourceNode,
    targetNode
  };
};
