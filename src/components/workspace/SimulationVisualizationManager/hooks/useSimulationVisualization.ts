/**
 * Hook for managing simulation visualization state and animation
 */
import { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { createAnimationController, AnimationController } from '../utils/animationController';
import { applyVisualizationState, verifyVisualization } from '../utils/visualizationUtils';

export interface SimulationVisualizationOptions {
  isRunning: boolean;
  currentTime: number;
  getVisualizationState: () => any; // Function to get the current simulation visualization state
  colorScale?: [string, string];
  sizeScale?: [number, number];
  useColor?: boolean;
  useSize?: boolean;
  showValues?: boolean;
  normalizeValues?: boolean;
  fps?: number;
}

/**
 * Hook to manage simulation visualization state and animation
 */
export const useSimulationVisualization = (
  cy: cytoscape.Core | null,
  adapter: any, // CytoscapeAdapter instance
  options: SimulationVisualizationOptions
) => {
  const [isVisualizationApplied, setIsVisualizationApplied] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);
  const lastSimulationStateRef = useRef<any>(null);
  const animationControllerRef = useRef<AnimationController | null>(null);
  
  // Create animation controller if needed
  useEffect(() => {
    if (!animationControllerRef.current && options.getVisualizationState) {
      const visualizationState = options.getVisualizationState();
      if (visualizationState && visualizationState.frames) {
        animationControllerRef.current = createAnimationController({
          frames: visualizationState.frames.length,
          fps: options.fps || 30,
          onFrame: (frame) => {
            setAnimationFrame(frame);
          }
        });
      }
    }
    
    return () => {
      // Clean up animation on unmount
      if (animationControllerRef.current?.isRunning) {
        animationControllerRef.current.stop();
      }
    };
  }, [options.fps, options.getVisualizationState]);
  
  // Update adapter settings when options change
  useEffect(() => {
    if (adapter && adapter.setOptions) {
      // Update adapter configuration
      adapter.setOptions({
        colorScale: options.colorScale || ['#dbeafe', '#3b82f6'],
        sizeScale: options.sizeScale || [25, 50],
        useColor: options.useColor !== undefined ? options.useColor : true,
        useSize: options.useSize !== undefined ? options.useSize : true,
        showValues: options.showValues !== undefined ? options.showValues : true,
        normalizeValues: options.normalizeValues !== undefined ? options.normalizeValues : true
      });
    }
  }, [
    adapter,
    options.colorScale,
    options.sizeScale,
    options.useColor,
    options.useSize,
    options.showValues,
    options.normalizeValues
  ]);
  
  // Apply visualization when simulation state changes
  useEffect(() => {
    if (!cy) return;
    
    // Get the visualization state from the simulation
    const visualizationState = options.getVisualizationState();
    
    // Only update if we have meaningful visualization data
    if (visualizationState && Object.keys(visualizationState).length > 0) {
      // Store the last simulation state
      lastSimulationStateRef.current = visualizationState;
      
      console.log("Applying visualization state:", 
        Object.keys(visualizationState.nodeValues || {}).length, 
        "nodes, min:", visualizationState.minValue?.toFixed(4) || 'N/A', 
        "max:", visualizationState.maxValue?.toFixed(4) || 'N/A');
      
      // Apply the visualization to the cytoscape instance
      const applied = applyVisualizationState(cy, visualizationState, adapter);
      setIsVisualizationApplied(applied && verifyVisualization(cy));
    }
  }, [cy, options.currentTime, options.getVisualizationState, adapter]);
  
  // Control animation based on simulation running state
  useEffect(() => {
    if (!animationControllerRef.current) return;
    
    if (options.isRunning) {
      // Start animation if simulation is running
      if (!animationControllerRef.current.isRunning) {
        animationControllerRef.current.play();
      }
    } else {
      // Pause animation if simulation is not running
      if (animationControllerRef.current.isRunning) {
        animationControllerRef.current.pause();
      }
    }
  }, [options.isRunning]);
  
  return {
    isVisualizationApplied,
    animationFrame,
    lastVisualizationState: lastSimulationStateRef.current,
    animationController: animationControllerRef.current
  };
};
