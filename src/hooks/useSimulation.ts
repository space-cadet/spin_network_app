import { useState, useCallback } from 'react';
import { MathAdapter } from '../simulation/core/mathAdapter';
import { SimulationParameters } from '../simulation/core/types';

export const useSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [parameters, setParameters] = useState<SimulationParameters>({
    diffusionType: 'ordinary',
    alpha: 0.5,
    beta: 0.1,
    cSquared: 1.0,
    dt: 0.01
  });

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    // Simulation loop logic will be added here
  }, []);

  const pauseSimulation = useCallback(() => {
    setIsRunning(false);
  }, []);

  const updateParameters = useCallback((newParams: Partial<SimulationParameters>) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    isRunning,
    parameters,
    startSimulation,
    pauseSimulation,
    updateParameters
  };
};