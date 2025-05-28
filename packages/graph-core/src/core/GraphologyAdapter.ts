import Graphology from 'graphology';
import { IGraph, IGraphNode, IGraphElement, IGraphEdge, IPropertyMap, ITraversalOptions } from './types';
import { Matrix, matrix } from 'mathjs';

export class GraphologyAdapter implements IGraph {
  private graph: Graphology;

  // Expose the internal Graphology instance for Sigma
  getGraphologyInstance(): Graphology {
    return this.graph;
  }

  // Allow setting the internal graph (used by builders)
  setGraph(graph: Graphology): void {
    this.graph = graph;
  }

  constructor() {
    this.graph = new Graphology();
  }

  get isDirected(): boolean {
    return this.graph.type === 'directed';
  }

  get nodeCount(): number {
    return this.graph.order;
  }

  get edgeCount(): number {
    return this.graph.size;
  }

  addNode(node: IGraphNode): IGraph {
    this.graph.addNode(node.id, { 
      ...node.properties,
      type: node.type 
    });
    return this;
  }

  removeNode(nodeId: string): IGraph {
    if (this.graph.hasNode(nodeId)) {
      this.graph.dropNode(nodeId);
    }
    return this;
  }

  addEdge(edge: IGraphEdge): IGraph {
    this.graph.addEdge(edge.sourceId, edge.targetId, {
      id: edge.id,
      ...edge.properties,
      type: edge.type,
      directed: edge.directed
    });
    return this;
  }

  removeEdge(edgeId: string): IGraph {
    if (this.graph.hasEdge(edgeId)) {
      this.graph.dropEdge(edgeId);
    }
    return this;
  }

  getNode(nodeId: string): IGraphNode | undefined {
    if (!this.graph.hasNode(nodeId)) return undefined;
    
    const attributes = this.graph.getNodeAttributes(nodeId);
    return {
      id: nodeId,
      type: attributes.type || 'default',
      properties: this.extractProperties(attributes)
    };
  }

  getEdge(edgeId: string): IGraphEdge | undefined {
    if (!this.graph.hasEdge(edgeId)) return undefined;

    const attributes = this.graph.getEdgeAttributes(edgeId);
    const [sourceId, targetId] = this.graph.extremities(edgeId);
    
    return {
      id: edgeId,
      sourceId,
      targetId,
      type: attributes.type || 'default',
      directed: attributes.directed ?? false,
      properties: this.extractProperties(attributes)
    };
  }

  getNodes(): readonly IGraphNode[] {
    return this.graph.nodes().map(nodeId => this.getNode(nodeId)!);
  }

  getEdges(): readonly IGraphEdge[] {
    return this.graph.edges().map(edgeId => this.getEdge(edgeId)!);
  }

  getAdjacentNodes(nodeId: string, options?: ITraversalOptions): readonly IGraphNode[] {
    const neighbors = this.graph.neighbors(nodeId);
    return neighbors.map(id => this.getNode(id)!);
  }

  getConnectedEdges(nodeId: string, options?: ITraversalOptions): readonly IGraphEdge[] {
    const edges = this.graph.edges(nodeId);
    return edges.map(id => this.getEdge(id)!);
  }

  findPath(fromId: string, toId: string, options?: ITraversalOptions): readonly IGraphElement[] {
    // Basic path finding - can be enhanced with Dijkstra later
    const path: IGraphElement[] = [];
    const visited = new Set<string>();
    const queue: Array<{ id: string; path: IGraphElement[] }> = [{ id: fromId, path: [] }];

    while (queue.length > 0) {
      const { id, path: currentPath } = queue.shift()!;
      if (id === toId) return currentPath;

      if (!visited.has(id)) {
        visited.add(id);
        const node = this.getNode(id)!;
        const newPath = [...currentPath, node];

        for (const neighborId of this.graph.neighbors(id)) {
          if (!visited.has(neighborId)) {
            queue.push({ id: neighborId, path: newPath });
          }
        }
      }
    }

    return [];
  }

  toAdjacencyMatrix(): Matrix {
    const nodes = this.graph.nodes();
    const n = nodes.length;
    const data = Array(n).fill(0).map(() => Array(n).fill(0));
    
    const nodeIndex = new Map(nodes.map((id, index) => [id, index]));
    
    this.graph.forEachEdge((edge, attributes, source, target) => {
      const i = nodeIndex.get(source)!;
      const j = nodeIndex.get(target)!;
      data[i][j] = 1;
      if (!attributes.directed) {
        data[j][i] = 1;
      }
    });

    return matrix(data);
  }

  toLaplacianMatrix(): Matrix {
    const adj = this.toAdjacencyMatrix();
    const n = adj.size()[0];
    
    // Calculate degree matrix (sum of each row)
    const degrees = Array(n).fill(0).map((_, i) => {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += adj.get([i, j]);
      }
      return sum;
    });
    
    // Create Laplacian matrix: L = D - A
    const laplacian = Array(n).fill(0).map((_, i) => 
      Array(n).fill(0).map((_, j) => 
        i === j ? degrees[i] : -adj.get([i, j])
      )
    );
    
    return matrix(laplacian);
  }

  hasNode(nodeId: string): boolean {
    return this.graph.hasNode(nodeId);
  }

  hasEdge(edgeId: string): boolean {
    return this.graph.hasEdge(edgeId);
  }

  areNodesAdjacent(sourceId: string, targetId: string): boolean {
    return this.graph.hasEdge(sourceId, targetId);
  }

  getNodeDegree(nodeId: string): number {
    return this.graph.degree(nodeId);
  }

  clone(): IGraph {
    const newAdapter = new GraphologyAdapter();
    newAdapter.graph = this.graph.copy();
    return newAdapter;
  }

  clear(): IGraph {
    this.graph.clear();
    return this;
  }

  private extractProperties(attributes: any): IPropertyMap {
    const { type, directed, ...properties } = attributes;
    return properties;
  }
}