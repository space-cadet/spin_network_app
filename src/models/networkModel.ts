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
  
  // Validate edges have required properties
  const nodeIds = new Set(network.nodes.map(node => node.id));
  
  network.edges.forEach(edge => {
    if (!edge.id) {
      errors.push(`Edge is missing an ID`);
    }
    
    // Source can be null for dangling edges, but if it's a string, it should refer to a valid node
    if (edge.source !== null && !nodeIds.has(edge.source)) {
      // For dangling edges with source, make sure it has a position
      if (!edge.sourcePosition) {
        errors.push(`Dangling edge ${edge.id || 'unknown'} with invalid source ${edge.source} needs a sourcePosition`);
      }
    }
    
    // Target can be null for dangling edges, but if it's a string, it should refer to a valid node
    if (edge.target !== null && !nodeIds.has(edge.target)) {
      // For dangling edges with target, make sure it has a position
      if (!edge.targetPosition) {
        errors.push(`Dangling edge ${edge.id || 'unknown'} with invalid target ${edge.target} needs a targetPosition`);
      }
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
 * Removes a node from the network while preserving connected edges as dangling
 */
export function removeNode(network: SpinNetwork, nodeId: string): SpinNetwork {
  const nodeExists = network.nodes.some(n => n.id === nodeId);
  if (!nodeExists) {
    // Node not found, return network unchanged
    console.log(`Node ${nodeId} not found for removal`);
    return network;
  }
  
  // Find the node to get its position before removal
  const nodeToRemove = network.nodes.find(n => n.id === nodeId);
  if (!nodeToRemove) {
    console.log(`Node ${nodeId} found in initial check but missing in detailed lookup`);
    return network; // Safety check
  }
  
  console.log(`Removing node ${nodeId} and updating connected edges`);
  const nodePosition = nodeToRemove.position;
  
  // Remove node
  const updatedNodes = network.nodes.filter(n => n.id !== nodeId);
  
  // Update edges connected to this node - make them dangling instead of removing
  const updatedEdges = network.edges.map(edge => {
    // If this edge connects to the node we're removing, update it
    if (edge.source === nodeId) {
      console.log(`Making edge ${edge.id} dangling at source`);
      return {
        ...edge,
        source: null,
        sourcePosition: nodePosition // Save the position where the node was
      };
    }
    if (edge.target === nodeId) {
      console.log(`Making edge ${edge.id} dangling at target`);
      return {
        ...edge,
        target: null,
        targetPosition: nodePosition // Save the position where the node was
      };
    }
    return edge;
  });
  
  // Check the before/after count of nodes and edges for debugging
  console.log(`Nodes: ${network.nodes.length} -> ${updatedNodes.length}`);
  console.log(`Edges: ${network.edges.length} -> ${updatedEdges.length}`);
  
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
  
  // For non-null sources/targets, verify they exist
  if (edge.source !== null) {
    const sourceExists = network.nodes.some(n => n.id === edge.source);
    if (!sourceExists && !edge.sourcePosition) {
      // Source node doesn't exist and no position provided for dangling end
      console.warn(`Adding edge with nonexistent source ${edge.source} but no sourcePosition`);
    }
  }
  
  if (edge.target !== null) {
    const targetExists = network.nodes.some(n => n.id === edge.target);
    if (!targetExists && !edge.targetPosition) {
      // Target node doesn't exist and no position provided for dangling end
      console.warn(`Adding edge with nonexistent target ${edge.target} but no targetPosition`);
    }
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
    console.log(`Edge ${edgeId} not found for removal`);
    return network;
  }
  
  // Get edge details before removal (for logging)
  const edgeToRemove = network.edges.find(e => e.id === edgeId);
  if (edgeToRemove) {
    console.log(`Removing edge ${edgeId} connecting ${edgeToRemove.source || 'null'} to ${edgeToRemove.target || 'null'}`);
  }
  
  // Remove edge
  const updatedEdges = network.edges.filter(e => e.id !== edgeId);
  
  // Also find and remove any placeholder nodes associated with this edge
  // This ensures clean undo/redo behavior
  const placeholderPrefixSource = `placeholder-source-${edgeId}`;
  const placeholderPrefixTarget = `placeholder-target-${edgeId}`;
  
  const updatedNodes = network.nodes.filter(node => {
    // Support both string type IDs and the legacy 'placeholder' string
    const isPlaceholder = node.type === 'placeholder';
    const isPlaceholderForThisEdge = 
      isPlaceholder && 
      (node.id.startsWith(placeholderPrefixSource) || node.id.startsWith(placeholderPrefixTarget));
    
    if (isPlaceholderForThisEdge) {
      console.log(`Also removing placeholder node ${node.id} associated with edge ${edgeId}`);
    }
    
    return !isPlaceholderForThisEdge;
  });
  
  // Log the node count change if any placeholders were removed
  if (network.nodes.length !== updatedNodes.length) {
    console.log(`Nodes: ${network.nodes.length} -> ${updatedNodes.length}`);
  }
  console.log(`Edges: ${network.edges.length} -> ${updatedEdges.length}`);
  
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
 * Converts a spin network to the format expected by cytoscape.js
 */
export function networkToCytoscape(network: SpinNetwork): any[] {
  const elements: any[] = [];
  
  // Convert nodes
  network.nodes.forEach(node => {
    // For regular nodes, use the label or a default
    // For placeholder nodes, ensure no label is shown
    const label = node.type === 'placeholder' ? '' : (node.label || `Node ${node.id}`);
    
    elements.push({
      group: 'nodes',
      data: {
        id: node.id,
        label: label,
        intertwiner: node.intertwiner,
        position: node.position, // Store position in data for later access
        type: node.type || 'regular', // Use node type or default to regular
        ...node.properties
      },
      position: { // Set position directly for cytoscape
        x: node.position.x,
        y: node.position.y
      }
    });
  });
  
  // Create placeholder nodes for dangling edge endpoints
  const placeholderNodes: Set<string> = new Set();
  
  // Convert edges
  network.edges.forEach(edge => {
    // Create placeholder nodes for dangling endpoints
    if (edge.source === null) {
      const placeholderId = `placeholder-source-${edge.id}`;
      if (!placeholderNodes.has(placeholderId)) {
        placeholderNodes.add(placeholderId);
        console.log(`Creating source placeholder node at position:`, edge.sourcePosition);
        elements.push({
          group: 'nodes',
          data: {
            id: placeholderId,
            label: '', // Empty label for placeholder
            type: 'placeholder',
            edgeId: edge.id,
            endpoint: 'source'
          },
          position: edge.sourcePosition || { x: 0, y: 0 },
          classes: 'placeholder-node'
        });
      }
    }
    
    if (edge.target === null) {
      const placeholderId = `placeholder-target-${edge.id}`;
      if (!placeholderNodes.has(placeholderId)) {
        placeholderNodes.add(placeholderId);
        console.log(`Creating target placeholder node at position:`, edge.targetPosition);
        elements.push({
          group: 'nodes',
          data: {
            id: placeholderId,
            label: '', // Empty label for placeholder
            type: 'placeholder',
            edgeId: edge.id,
            endpoint: 'target'
          },
          position: edge.targetPosition || { x: 0, y: 0 },
          classes: 'placeholder-node'
        });
      }
    }
    
    // Create the edge, connecting to placeholder nodes if needed
    elements.push({
      group: 'edges',
      data: {
        id: edge.id,
        source: edge.source === null ? `placeholder-source-${edge.id}` : edge.source,
        target: edge.target === null ? `placeholder-target-${edge.id}` : edge.target,
        label: edge.label || `j=${edge.spin}`,
        spin: edge.spin,
        type: edge.type || 'regular', // Use edge type or default to regular
        hasDangling: edge.source === null || edge.target === null,
        ...edge.properties
      }
    });
  });
  
  return elements;
}
