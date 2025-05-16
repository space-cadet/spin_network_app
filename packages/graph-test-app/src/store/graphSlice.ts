import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IGraphNode, IGraphEdge } from '../../../graph-core/src/core/types';

interface GraphState {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  selectedElementId: string | null;
}

const initialState: GraphState = {
  nodes: [],
  edges: [],
  selectedElementId: null
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
    }
  }
});

export const { 
  addNode, 
  removeNode, 
  addEdge, 
  removeEdge, 
  setSelectedElement,
  clearGraph 
} = graphSlice.actions;

export default graphSlice.reducer;