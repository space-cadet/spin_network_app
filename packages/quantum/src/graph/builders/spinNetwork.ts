/**
 * SpinNetworkBuilder provides a fluent API for constructing spin networks -
 * quantum graphs with SU(2) spins on edges and intertwiner vertices.
 */
import { QuantumGraph } from '../../qgraph/QuantumGraph';
import { IGraphNode, IGraphEdge, IGraph } from '@spin-network/graph-core';
import { QuantumObject } from '../../core/types';

export interface SpinNetworkOptions {
  /**
   * Number of vertices in the network
   */
  nodes?: number;

  /**
   * Number of rows for grid/lattice layouts 
   */
  rows?: number;

  /**
   * Number of columns for grid/lattice layouts
   */
  cols?: number;

  /**
   * Probability of edge creation for random graphs
   */
  probability?: number;

  /**
   * Whether to create periodic boundary conditions
   */
  periodic?: boolean;

  /**
   * Default spin value for edges (defaults to 1/2)
   */
  defaultSpin?: number;

  /**
   * Whether to pre-compute and assign valid intertwiners (default true)
   */
  computeIntertwiners?: boolean;
}

/**
 * Builder class for creating spin network quantum graphs
 */
export class SpinNetworkBuilder {
  private options: SpinNetworkOptions;
  private graph: QuantumGraph;

  private constructor(options: SpinNetworkOptions = {}) {
    this.options = {
      defaultSpin: 0.5,
      computeIntertwiners: true,
      ...options
    };
    this.graph = new QuantumGraph();
  }

  /**
   * Create a new SpinNetworkBuilder instance 
   */
  static create(options: SpinNetworkOptions = {}): SpinNetworkBuilder {
    return new SpinNetworkBuilder(options);
  }

  /**
   * Add a vertex with an intertwiner space based on incident edge spins
   */
  addVertex(id: string, position?: { x: number; y: number }): SpinNetworkBuilder {
    this.graph.addNode({
      id,
      type: 'intertwiner',
      properties: {
        position,
        // Will be computed when adding edges
        intertwiners: [],
        // Hilbert space dimension determined by edge spins
        dimension: 0
      }
    } as IGraphNode);
    return this;
  }

  /**
   * Add a quantum edge with specified spin between vertices
   */
  addEdge(sourceId: string, targetId: string, spin?: number): SpinNetworkBuilder {
    const edgeSpin = spin ?? this.options.defaultSpin ?? 0.5;
    if (!Number.isFinite(edgeSpin) || edgeSpin < 0) {
      throw new Error('Spin value must be a non-negative number');
    }

    this.graph.addEdge({
      id: `${sourceId}-${targetId}`,
      sourceId,
      targetId,
      type: 'quantum',
      directed: false,
      properties: {
        spin: edgeSpin,
        // Hilbert space dimension is 2j + 1 for spin j
        dimension: 2 * edgeSpin + 1
      }
    } as IGraphEdge);

    // If enabled, update intertwiner spaces for affected vertices
    if (this.options.computeIntertwiners) {
      this.updateIntertwiners(sourceId);
      this.updateIntertwiners(targetId);
    }

    return this;
  }

  /**
   * Update the intertwiner space for a vertex based on incident edge spins
   */
  private updateIntertwiners(nodeId: string): void {
    const node = this.graph.getNode(nodeId);
    if (!node || node.type !== 'intertwiner') {
      return;
    }

    // Get incident edges and their spins
    const edges = this.graph.getConnectedEdges(nodeId);
    const spins = edges.map((edge: IGraphEdge) => (edge.properties as any).spin);

    // Calculate allowed intertwiner values based on spins
    // TODO: Implement full intertwiner space calculation using packages/quantum tensor and angular momentum
    const intertwiners = this.calculateAllowedIntertwiners(spins);
    this.graph.addNode({
      ...node,
      properties: {
        ...node.properties,
        intertwiners,
        dimension: intertwiners.length
      }
    } as IGraphNode);
  }

  /**
   * Calculate the allowed intertwiner values for a set of spins
   */
  private calculateAllowedIntertwiners(spins: number[]): number[] {
    // TODO: Replace this placeholder with proper calculation
    // For now just return a basic set based on number of edges
    return [0];
  }

  /**
   * Build and return the completed spin network
   */
  build(): QuantumGraph {
    return this.graph;
  }

  // Static factory methods for common network types
  
  /**
   * Create a 2D lattice spin network
   */
  static createLattice2D(options: Pick<SpinNetworkOptions, 'rows' | 'cols' | 'defaultSpin' | 'periodic'>): QuantumGraph {
    const { rows = 2, cols = 2, periodic = false, defaultSpin = 0.5 } = options;
    const builder = SpinNetworkBuilder.create({ defaultSpin });

    // Create vertices
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const id = `${i}-${j}`;
        builder.addVertex(id, { x: j, y: i });

        // Add edges
        if (j > 0) {
          builder.addEdge(`${i}-${j-1}`, id);
        }
        if (i > 0) {
          builder.addEdge(`${i-1}-${j}`, id);
        }
        
        // Add periodic boundary edges if enabled
        if (periodic) {
          if (j === cols - 1) {
            builder.addEdge(id, `${i}-0`);
          }
          if (i === rows - 1) {
            builder.addEdge(id, `0-${j}`);
          }
        }
      }
    }

    return builder.build();
  }

  /**
   * Create a chain of spins with nearest-neighbor coupling
   */
  static createChain(n: number, options: Pick<SpinNetworkOptions, 'defaultSpin' | 'periodic'>): QuantumGraph {
    const { periodic = false, defaultSpin = 0.5 } = options;
    const builder = SpinNetworkBuilder.create({ defaultSpin });

    // Create vertices
    for (let i = 0; i < n; i++) {
      builder.addVertex(`${i}`, { x: i, y: 0 });
      if (i > 0) {
        builder.addEdge(`${i-1}`, `${i}`);
      }
    }

    // Add periodic boundary if enabled
    if (periodic && n > 1) {
      builder.addEdge(`${n-1}`, '0');
    }

    return builder.build();
  }
}
