import { useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { setSelectedElement } from '../../../../store/graphSlice';
import { GraphologyAdapter } from '@spin-network/graph-core/src/core/GraphologyAdapter';

export const useGraphManager = () => {
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphInstance = useSelector((state: RootState) => state.graph.graphId);
  const renderMode = useSelector((state: RootState) => state.graph.renderMode);

  const handleNodeClick = useCallback((nodeId: string) => {
    dispatch(setSelectedElement(nodeId));
  }, [dispatch]);

  const handleEdgeClick = useCallback((edgeId: string) => {
    dispatch(setSelectedElement(edgeId));
  }, [dispatch]);

  const handleZoom = useCallback((factor: number) => {
    // Implement zoom logic based on renderer
    if (renderMode === '2d') {
      // Sigma zoom logic will be handled by the renderer
    } else {
      // Three.js zoom logic will be handled by OrbitControls
    }
  }, [renderMode]);

  return {
    containerRef,
    graphInstance,
    handleNodeClick,
    handleEdgeClick,
    handleZoom
  };
};