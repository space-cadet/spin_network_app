import { 
  SpinNetwork, 
  NetworkNode, 
  NetworkEdge, 
  LatticeNetworkParams, 
  CircularNetworkParams, 
  RandomNetworkParams 
} from '../models/types';
import { createEmptyNetwork } from '../models/networkModel';

/**
 * Generates a unique ID for network elements
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Creates a lattice (grid) network with the specified parameters
 */
export function createLatticeNetwork(params: LatticeNetworkParams): SpinNetwork {
  const { 
    rows, 
    columns, 
    defaultIntertwiner = 1, 
    defaultSpin = 0.5,
    defaultNodeType = 'regular',
    defaultEdgeType = 'regular'
  } = params;
  
  // Create empty network with metadata
  const network = createEmptyNetwork('Lattice Network');
  network.metadata.type = 'lattice';
  network.metadata.properties = {
    rows,
    columns,
    defaultIntertwiner,
    defaultSpin,
    defaultNodeType,
    defaultEdgeType
  };
  
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  
  // Create nodes in a grid pattern
  const spacing = 80; // Pixels between nodes
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const nodeId = generateId('node');
      nodes.push({
        id: nodeId,
        position: {
          x: c * spacing + 100, // Offset from left
          y: r * spacing + 100  // Offset from top
        },
        intertwiner: defaultIntertwiner,
        label: `(${r},${c})`,
        type: params.defaultNodeType || 'regular',
      });
      
      // Connect to left neighbor if not first column
      if (c > 0) {
        const leftNodeId = nodes[nodes.length - 2].id;
        edges.push({
          id: generateId('edge'),
          source: leftNodeId,
          target: nodeId,
          spin: defaultSpin,
          label: `j=${defaultSpin}`,
          type: params.defaultEdgeType || 'regular'
        });
      }
      
      // Connect to top neighbor if not first row
      if (r > 0) {
        const topNodeId = nodes[nodes.length - columns - 1].id;
        edges.push({
          id: generateId('edge'),
          source: topNodeId,
          target: nodeId,
          spin: defaultSpin,
          label: `j=${defaultSpin}`,
          type: params.defaultEdgeType || 'regular'
        });
      }
    }
  }
  
  return {
    ...network,
    nodes,
    edges
  };
}

/**
 * Creates a circular network with the specified parameters
 */
export function createCircularNetwork(params: CircularNetworkParams): SpinNetwork {
  const { 
    nodes: nodeCount, 
    radius = 200, 
    defaultIntertwiner = 1, 
    defaultSpin = 0.5, 
    defaultNodeType = 'regular',
    defaultEdgeType = 'regular',
    connectAll = false 
  } = params;
  
  // Create empty network with metadata
  const network = createEmptyNetwork('Circular Network');
  network.metadata.type = 'circular';
  network.metadata.properties = {
    nodes: nodeCount,
    radius,
    defaultIntertwiner,
    defaultSpin,
    defaultNodeType,
    defaultEdgeType,
    connectAll
  };
  
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  
  // Create nodes in a circular pattern
  const centerX = radius + 100; // Center X coordinate
  const centerY = radius + 100; // Center Y coordinate
  
  for (let i = 0; i < nodeCount; i++) {
    // Calculate position on circle
    const angle = (i / nodeCount) * Math.PI * 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    const nodeId = generateId('node');
    nodes.push({
      id: nodeId,
      position: { x, y },
      intertwiner: defaultIntertwiner,
      label: `${i + 1}`,
      type: params.defaultNodeType || 'regular',
    });
    
    // Connect to previous node
    if (i > 0) {
      edges.push({
        id: generateId('edge'),
        source: nodes[i - 1].id,
        target: nodeId,
        spin: defaultSpin,
        label: `j=${defaultSpin}`,
        type: params.defaultEdgeType || 'regular'
      });
    }
  }
  
  // Connect first and last node to complete the circle
  if (nodeCount > 1) {
    edges.push({
      id: generateId('edge'),
      source: nodes[nodes.length - 1].id,
      target: nodes[0].id,
      spin: defaultSpin,
      label: `j=${defaultSpin}`,
      type: params.defaultEdgeType || 'regular'
    });
  }
  
  // If connectAll is true, connect each node to all others
  if (connectAll && nodeCount > 2) {
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 2; j < nodeCount; j++) {
        // Skip adjacent nodes as they are already connected
        if (j === i + 1 || (i === 0 && j === nodeCount - 1)) continue;
        
        edges.push({
          id: generateId('edge'),
          source: nodes[i].id,
          target: nodes[j].id,
          spin: defaultSpin,
          label: `j=${defaultSpin}`,
          type: params.defaultEdgeType || 'regular'
        });
      }
    }
  }
  
  return {
    ...network,
    nodes,
    edges
  };
}

/**
 * Creates a random network with the specified parameters
 */
export function createRandomNetwork(params: RandomNetworkParams): SpinNetwork {
  const { 
    nodes: nodeCount, 
    edgeProbability, 
    defaultIntertwiner = 1, 
    defaultSpin = 0.5,
    defaultNodeType = 'regular',
    defaultEdgeType = 'regular'
  } = params;
  
  // Create empty network with metadata
  const network = createEmptyNetwork('Random Network');
  network.metadata.type = 'random';
  network.metadata.properties = {
    nodes: nodeCount,
    edgeProbability,
    defaultIntertwiner,
    defaultSpin,
    defaultNodeType,
    defaultEdgeType
  };
  
  const nodes: NetworkNode[] = [];
  const edges: NetworkEdge[] = [];
  
  // Create nodes with random positions
  const canvasSize = Math.max(500, nodeCount * 50); // Scale canvas with node count
  const margin = 50; // Margin from canvas edge
  
  for (let i = 0; i < nodeCount; i++) {
    const x = margin + Math.random() * (canvasSize - 2 * margin);
    const y = margin + Math.random() * (canvasSize - 2 * margin);
    
    nodes.push({
      id: generateId('node'),
      position: { x, y },
      intertwiner: defaultIntertwiner,
      label: `${i + 1}`,
      type: params.defaultNodeType || 'regular',
    });
  }
  
  // Create edges with probability
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < edgeProbability) {
        edges.push({
          id: generateId('edge'),
          source: nodes[i].id,
          target: nodes[j].id,
          spin: defaultSpin,
          label: `j=${defaultSpin}`,
          type: params.defaultEdgeType || 'regular'
        });
      }
    }
  }
  
  return {
    ...network,
    nodes,
    edges
  };
}
