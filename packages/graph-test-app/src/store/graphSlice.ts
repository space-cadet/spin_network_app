import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Graph, GraphNode, GraphEdge, InteractionMode } from '../types/graph';

interface GraphState {
  graph: Graph;
  selectedElementId: string | null;
  selectedElementType: 'node' | 'edge' | null;
  interactionMode: InteractionMode;
}

const initialState: GraphState = {
  graph: { nodes: [], edges: [] },
  selectedElementId: null,
  selectedElementType: null,
  interactionMode: 'select',
};

export const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    // Reducers will be implemented as needed
  },
});

export default graphSlice.reducer;
