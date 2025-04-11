/**
 * SimulationVisualizationManager component
 * Handles applying simulation state to the graph visualization
 */
import React from 'react';
import cytoscape from 'cytoscape';
import { useSimulationVisualization } from './hooks/useSimulationVisualization';

export interface SimulationVisualizationManagerProps {
  cy: cytoscape.Core | null;
  simulation: {
    isRunning: boolean;
    currentTime: number;
    getVisualizationState: () => any;
  };
  adapter: any; // CytoscapeAdapter instance
  colorScale?: [string, string];
  sizeScale?: [number, number];
  useColor?: boolean;
  useSize?: boolean;
  showValues?: boolean;
  normalizeValues?: boolean;
  onAnimationFrame?: (frame: number) => void;
  onVisualizationReady?: (isReady: boolean) => void;
}

const SimulationVisualizationManager: React.FC<SimulationVisualizationManagerProps> = ({
  cy,
  simulation,
  adapter,
  colorScale = ['#dbeafe', '#3b82f6'],
  sizeScale = [25, 50],
  useColor = true,
  useSize = true,
  showValues = true,
  normalizeValues = true,
  onAnimationFrame,
  onVisualizationReady
}) => {
  // Use the simulation visualization hook
  const { 
    isVisualizationApplied,
    animationFrame,
    animationController
  } = useSimulationVisualization(cy, adapter, {
    isRunning: simulation.isRunning,
    currentTime: simulation.currentTime,
    getVisualizationState: simulation.getVisualizationState,
    colorScale,
    sizeScale,
    useColor,
    useSize,
    showValues,
    normalizeValues
  });
  
  // Notify parent about visualization state changes
  React.useEffect(() => {
    if (onVisualizationReady) {
      onVisualizationReady(isVisualizationApplied);
    }
  }, [isVisualizationApplied, onVisualizationReady]);
  
  // Notify parent about animation frame changes
  React.useEffect(() => {
    if (onAnimationFrame) {
      onAnimationFrame(animationFrame);
    }
  }, [animationFrame, onAnimationFrame]);
  
  // This is a non-visual component that just manages visualization state
  return null;
};

export default SimulationVisualizationManager;
