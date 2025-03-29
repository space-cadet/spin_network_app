import { NetworkNode, NetworkEdge, SpinNetwork, NetworkMetadata } from './types';

/**
 * Creates a new empty spin network with basic metadata
 */
export function createEmptyNetwork(name: string = 'New Network'): SpinNetwork {
  const timestamp = Date.now();
  
  return {
    nodes: [],
    edges: [],
    metadata: {
      name,
      created: timestamp,
      modified: timestamp,
      type: 'empty',
    }
  };
}

/**
 * Validates a spin network structure
 * @returns Array of validation errors, empty if valid
 */
export function validateNetwork(network: SpinNetwork): string[] {
  const errors: string[] = [];
  
  // Check for required metadata
  if (!network.metadata?.name) {
    errors.push('Network name is required in metadata');
  }
  
  // Validate nodes have required properties
  network.nodes.forEach(node => {
    if (!node.id) {
      errors.push(`Node is missing an ID`);
    }
    
    if (node.position === undefined || 
        typeof node.position.x !== 'number' || 
        typeof node.position.y !== 'number') {
      errors.push(`Node ${node.id || 'unknown'} has invalid position`);
    }
    
    if (typeof node.intertwiner !== 'number') {
      errors.push(`Node ${node.id || 'unknown'} has invalid intertwiner value`);
    }
  });
  
  // Validate edges have required properties and refer to existing nodes
  const nodeIds = new Set(network.nodes.map(node => node.id));
  
  network.edges.forEach(edge => {
    if (!edge.id) {
      errors.push(`Edge is missing an ID`);
    }
    
    if (!edge.source) {
      errors.push(`Edge ${edge.id || 'unknown'} is missing source node ID`);
    } else if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id || 'unknown'} references non-existent source node ${edge.source}`);
    }
    
    if (!edge.target) {
      errors.push(`Edge ${edge.id || 'unknown'} is missing target node ID`);
    } else if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id || 'unknown'} references non-existent target node ${edge.target}`);
    }
    
    if (typeof edge.spin !== 'number') {
      errors.push(`Edge ${edge.id || 'unknown'} has invalid spin value`);
    }
  });
  
  return errors;
}

/**
 * Checks if a network is empty (no nodes or edges)
 */
export function isNetworkEmpty(network: SpinNetwork): boolean {
  return network.nodes.length === 0 && network.edges.length === 0;
}

/**
 * Updates network metadata
 */
export function updateNetworkMetadata(
  network: SpinNetwork, 
  updates: Partial<NetworkMetadata>
): SpinNetwork {
  return {
    ...network,
    metadata: {
      ...network.metadata,
      ...updates,
      modified: Date.now(),
    }
  };
}

/**
 * Adds a node to the network
 */
export function addNode(network: SpinNetwork, node: NetworkNode): SpinNetwork {
  // Check if node with same ID already exists
  if (network.nodes.some(n => n.id === node.id)) {
    // Node with this ID already exists, create a new ID
    const timestamp = Date.now();
    node = {
      ...node,
      id: `node-${timestamp}-${Math.floor(Math.random() * 1000)}`
    };
  }
  
  return {
    ...network,
    nodes: [...network.nodes, node],
    metadata: {
      ...network.metadata,
      modified: Date.now()
    }
  };
}

/**
 * Updates a node in the network
 */
export function updateNode(
  network: SpinNetwork, 
  nodeId: string, 
  updates: Partial<NetworkNode>
): SpinNetwork {
  const nodeIndex = network.nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) {
    // Node not found, return network unchanged
    return network;
  }
  
  const updatedNodes = [...network.nodes];
  updatedNodes[nodeIndex] = {
    ...updatedNodes[nodeIndex],
    ...updates
  };
  
  return {
    ...network,
    nodes: updatedNodes,
    metadata: {
      ...network.metadata,
      modified: Date.now()
    }
  };
}

/**
 * Removes a node from the network and any connected edges
 */
export function removeNode(network: SpinNetwork, nodeId: string): SpinNetwork {
  const nodeExists = network.nodes.some(n => n.id === nodeId);
  if (!nodeExists) {
    // Node not found, return network unchanged
    return network;
  }
  
  // Remove node
  const updatedNodes = network.nodes.filter(n => n.id !== nodeId);
  
  // Remove any edges connected to this node
  const updatedEdges = network.edges.filter(
    e => e.source !== nodeId && e.target !== nodeId
  );
  
  return {
    ...network,
    nodes: updatedNodes,
    edges: updatedEdges,
    metadata: {
      ...network.metadata,
      modified: Date.now()
    }
  };
}

/**
 * Adds an edge to the network
 */
export function addEdge(network: SpinNetwork, edge: NetworkEdge): SpinNetwork {
  // Check if edge with same ID already exists
  if (network.edges.some(e => e.id === edge.id)) {
    // Edge with this ID already exists, create a new ID
    const timestamp = Date.now();
    edge = {
      ...edge,
      id: `edge-${timestamp}-${Math.floor(Math.random() * 1000)}`
    };
  }
  
  // Check if source and target nodes exist
  const sourceExists = network.nodes.some(n => n.id === edge.source);
  const targetExists = network.nodes.some(n => n.id === edge.target);
  
  if (!sourceExists || !targetExists) {
    // Source or target node doesn't exist, return network unchanged
    return network;
  }
  
  return {
    ...network,
    edges: [...network.edges, edge],
    metadata: {
      ...network.metadata,
      modified: Date.now()
    }
  };
}

/**
 * Updates an edge in the network
 */
export function updateEdge(
  network: SpinNetwork, 
  edgeId: string, 
  updates: Partial<NetworkEdge>
): SpinNetwork {
  const edgeIndex = network.edges.findIndex(e => e.id === edgeId);
  if (edgeIndex === -1) {
    // Edge not found, return network unchanged
    return network;
  }
  
  const updatedEdges = [...network.edges];
  updatedEdges[edgeIndex] = {
    ...updatedEdges[edgeIndex],
    ...updates
  };
  
  return {
    ...network,
    edges: updatedEdges,
    metadata: {
      ...network.metadata,
      modified: Date.now()
    }
  };
}

/**
 * Removes an edge from the network
 */
export function removeEdge(network: SpinNetwork, edgeId: string): SpinNetwork {
  const edgeExists = network.edges.some(e => e.id === edgeId);
  if (!edgeExists) {
    // Edge not found, return network unchanged
    return network;
  }
  
  // Remove edge
  const updatedEdges = network.edges.filter(e => e.id !== edgeId);
  
  return {
    ...network,
    edges: updatedEdges,
    metadata: {
      ...network.metadata,
      modified: Date.now()
    }
  };
}

/**
 * Converts a spin network to the format expected by cytoscape.js
 */
export function networkToCytoscape(network: SpinNetwork): any[] {
  const elements: any[] = [];
  
  // Convert nodes
  network.nodes.forEach(node => {
    elements.push({
      group: 'nodes',
      data: {
        id: node.id,
        label: node.label || `Node ${node.id}`,
        intertwiner: node.intertwiner,
        position: node.position, // Store position in data for later access
        ...node.properties
      },
      position: { // Set position directly for cytoscape
        x: node.position.x,
        y: node.position.y
      }
    });
  });
  
  // Convert edges
  network.edges.forEach(edge => {
    elements.push({
      group: 'edges',
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label || `j=${edge.spin}`,
        spin: edge.spin,
        ...edge.properties
      }
    });
  });
  
  return elements;
}
