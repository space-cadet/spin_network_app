import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IGraphNode, IGraphEdge } from '../../../graph-core/src/core/types';
import { GraphologyAdapter } from '../../../graph-core/src/core/GraphologyAdapter';

interface GraphState {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  selectedElementId: string | null;
  currentGraph: GraphologyAdapter | null;
}

const initialState: GraphState = {
  nodes: [],
  edges: [],
  selectedElementId: null,
  currentGraph: null
};

export const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<IGraphNode>) => {
      state.nodes.push(action.payload);
    },
    removeNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter(node => node.id !== action.payload);
      state.edges = state.edges.filter(edge => 
        edge.sourceId !== action.payload && edge.targetId !== action.payload
      );
    },
    addEdge: (state, action: PayloadAction<IGraphEdge>) => {
      state.edges.push(action.payload);
    },
    removeEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter(edge => edge.id !== action.payload);
    },
    setSelectedElement: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
    },
    clearGraph: (state) => {
      state.nodes = [];
      state.edges = [];
      state.selectedElementId = null;
      state.currentGraph = null;
    },
    setGraph: (state, action: PayloadAction<GraphologyAdapter>) => {
      state.currentGraph = action.payload;
      // Extract nodes and edges from the graph for Redux store
      const graphInstance = action.payload.getGraphologyInstance();
      
      state.nodes = graphInstance.nodes().map(nodeId => ({
        id: nodeId,
        ...graphInstance.getNodeAttributes(nodeId)
      }));
      
      state.edges = graphInstance.edges().map(edgeId => {
        const edge = graphInstance.edge(edgeId);
        return {
          id: edgeId,
          sourceId: edge.source,
          targetId: edge.target,
          ...graphInstance.getEdgeAttributes(edgeId)
        };
      });
    }
  }
});

export const { 
  addNode, 
  removeNode, 
  addEdge, 
  removeEdge, 
  setSelectedElement,
  clearGraph,
  setGraph 
} = graphSlice.actions;

export default graphSlice.reducer;