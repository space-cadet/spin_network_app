import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IGraphNode, IGraphEdge, IGraphMetadata } from '../../../graph-core/src/core/types';

interface SerializableGraphData {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  graphId: string;
  metadata?: IGraphMetadata;
}

interface GraphState {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  selectedElementId: string | null;
  graphId: string | null;
  metadata: IGraphMetadata | null;
  renderMode: '2d' | '3d';
}

const initialState: GraphState = {
  nodes: [],
  edges: [],
  selectedElementId: null,
  graphId: null,
  metadata: null,
  renderMode: '2d'
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
      state.graphId = null;
      state.metadata = null;
    },
    setGraph: (state, action: PayloadAction<SerializableGraphData>) => {
      state.graphId = action.payload.graphId;
      state.nodes = action.payload.nodes;
      state.edges = action.payload.edges;
      state.metadata = action.payload.metadata || null;
    },
    setRenderMode: (state, action: PayloadAction<'2d' | '3d'>) => {
      state.renderMode = action.payload;
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
  setGraph,
  setRenderMode
} = graphSlice.actions;

export default graphSlice.reducer;