import { useEffect, useState } from 'react';
import { GraphologyAdapter } from '../../../../../graph-core/src/core/GraphologyAdapter';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

export const useGraphInstance = () => {
  const [graph, setGraph] = useState<GraphologyAdapter | null>(null);
  const graphState = useSelector((state: RootState) => state.graph);

  useEffect(() => {
    // Initialize graph instance
    const newGraph = new GraphologyAdapter();

    // Load any initial state if needed
    if (graphState.nodes.length > 0) {
      graphState.nodes.forEach(node => newGraph.addNode(node));
    }
    if (graphState.edges.length > 0) {
      graphState.edges.forEach(edge => newGraph.addEdge(edge));
    }

    setGraph(newGraph);

    return () => {
      // Cleanup if needed
      setGraph(null);
    };
  }, []);

  return { graph };
};