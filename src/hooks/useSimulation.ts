import { useState, useCallback } from 'react';
import { SimulationParameters } from '../simulation/core/types';

export const useSimulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [parameters, setParameters] = useState<SimulationParameters>({
    timeStep: 0.01,
    totalTime: 10.0,
    diffusionType: 'ordinary',
    alpha: 0.5,
    beta: 0.1,
    c: 1.0,
    numericalMethod: 'euler',
    weightFunction: 'spin',
    initialStateType: 'delta',
    initialStateParams: {},
    recordHistory: true,
    historyInterval: 10,
    parameters: {}
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