import Graphology from 'graphology';
import { 
  empty as emptyGenerator, 
  path as pathGenerator 
} from 'graphology-generators/classic';
import { erdosRenyi } from 'graphology-generators/random';
import { GraphologyAdapter } from './GraphologyAdapter';

export function empty(nodeCount: number): GraphologyAdapter {
  const adapter = new GraphologyAdapter();
  const generatedGraph = emptyGenerator(Graphology, nodeCount);
  adapter.setGraph(generatedGraph);
  return adapter;
}

export function complete(nodeCount: number): GraphologyAdapter {
  const adapter = new GraphologyAdapter();
  
  // First create all nodes
  for (let i = 0; i < nodeCount; i++) {
    adapter.addNode({
      id: `n${i}`,
      type: 'default',
      properties: {}
    });
  }
  
  // Then create edges between all pairs of nodes
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      adapter.addEdge({
        id: `e${i}-${j}`,
        sourceId: `n${i}`,
        targetId: `n${j}`,
        type: 'default',
        directed: false,
        properties: {}
      });
    }
  }
  
  return adapter;
}

export function path(nodeCount: number): GraphologyAdapter {
  const adapter = new GraphologyAdapter();
  const generatedGraph = pathGenerator(Graphology, nodeCount);
  adapter.setGraph(generatedGraph);
  return adapter;
}

export function random(nodeCount: number, probability: number): GraphologyAdapter {
  const adapter = new GraphologyAdapter();
  const generatedGraph = erdosRenyi(Graphology, {order: nodeCount, probability});
  adapter.setGraph(generatedGraph);
  return adapter;
}

export function randomSparse(nodeCount: number, probability: number): GraphologyAdapter {
  const adapter = new GraphologyAdapter();
  const generatedGraph = erdosRenyi.sparse(Graphology, {order: nodeCount, probability});
  adapter.setGraph(generatedGraph);
  return adapter;
}

// === Lattice Generators ===

export function lattice1D(length: number): GraphologyAdapter {
  // 1D lattice is just a path graph
  return path(length);
}

export function lattice2D(width: number, height: number): GraphologyAdapter {
  const adapter = new GraphologyAdapter();
  const graph = new Graphology();
  
  // Create nodes with logical lattice coordinates
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const nodeId = `${x},${y}`;
      graph.addNode(nodeId, { 
        latticeX: x, 
        latticeY: y, 
        type: 'lattice' 
      });
    }
  }
  
  // Add edges to 4-neighbors (up, down, left, right)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const nodeId = `${x},${y}`;
      
      // Right neighbor
      if (x < width - 1) {
        const rightId = `${x + 1},${y}`;
        graph.addEdge(nodeId, rightId, { type: 'lattice_edge' });
      }
      
      // Down neighbor  
      if (y < height - 1) {
        const downId = `${x},${y + 1}`;
        graph.addEdge(nodeId, downId, { type: 'lattice_edge' });
      }
    }
  }
  
  adapter.setGraph(graph);
  return adapter;
}

export function lattice1DPeriodic(length: number): GraphologyAdapter {
  const adapter = new GraphologyAdapter();
  const graph = new Graphology();
  
  // Create nodes with logical lattice coordinates
  for (let i = 0; i < length; i++) {
    graph.addNode(i.toString(), { 
      latticePosition: i, 
      type: 'lattice' 
    });
  }
  
  // Add edges including wraparound
  for (let i = 0; i < length; i++) {
    const nextI = (i + 1) % length;
    graph.addEdge(i.toString(), nextI.toString(), { type: 'lattice_edge' });
  }
  
  adapter.setGraph(graph);
  return adapter;
}

export function lattice2DPeriodic(width: number, height: number): GraphologyAdapter {
  const adapter = new GraphologyAdapter();
  const graph = new Graphology();
  
  // Create nodes with logical lattice coordinates
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const nodeId = `${x},${y}`;
      graph.addNode(nodeId, { 
        latticeX: x, 
        latticeY: y, 
        type: 'lattice' 
      });
    }
  }
  
  // Add edges with periodic boundary conditions (torus)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const nodeId = `${x},${y}`;
      
      // Right neighbor (with wraparound)
      const rightX = (x + 1) % width;
      const rightId = `${rightX},${y}`;
      graph.addEdge(nodeId, rightId, { type: 'lattice_edge' });
      
      // Down neighbor (with wraparound)
      const downY = (y + 1) % height;
      const downId = `${x},${downY}`;
      graph.addEdge(nodeId, downId, { type: 'lattice_edge' });
    }
  }
  
  adapter.setGraph(graph);
  return adapter;
}

export function triangularLattice(width: number, height: number): GraphologyAdapter {
  const adapter = new GraphologyAdapter();
  const graph = new Graphology();
  
  // Create nodes with logical lattice coordinates
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const nodeId = `${x},${y}`;
      graph.addNode(nodeId, { 
        latticeX: x, 
        latticeY: y, 
        type: 'triangular_lattice' 
      });
    }
  }
  
  // Add edges: 4-neighbors + 2 diagonal neighbors for triangular lattice
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const nodeId = `${x},${y}`;
      
      // Right neighbor
      if (x < width - 1) {
        graph.addEdge(nodeId, `${x + 1},${y}`, { type: 'triangular_edge' });
      }
      
      // Down neighbor
      if (y < height - 1) {
        graph.addEdge(nodeId, `${x},${y + 1}`, { type: 'triangular_edge' });
      }
      
      // Diagonal neighbors for triangular lattice
      if (x < width - 1 && y < height - 1) {
        graph.addEdge(nodeId, `${x + 1},${y + 1}`, { type: 'triangular_edge' });
      }
      
      if (x > 0 && y < height - 1) {
        graph.addEdge(nodeId, `${x - 1},${y + 1}`, { type: 'triangular_edge' });
      }
    }
  }
  
  adapter.setGraph(graph);
  return adapter;
}
