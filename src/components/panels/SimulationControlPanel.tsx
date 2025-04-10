import React from 'react';
import { useSimulation } from '../../hooks/useSimulation';

export const SimulationControlPanel: React.FC = () => {
  const {
    isRunning,
    parameters,
    startSimulation,
    pauseSimulation,
    updateParameters
  } = useSimulation();

  return (
    <div className="simulation-control-panel">
      <h3>Simulation Controls</h3>
      
      <div className="parameter-controls">
        <label>
          Diffusion Type:
          <select 
            value={parameters.diffusionType}
            onChange={e => updateParameters({ diffusionType: e.target.value })}
          >
            <option value="ordinary">Ordinary Diffusion</option>
            <option value="telegraph">Telegraph Diffusion</option>
          </select>
        </label>

        <label>
          Alpha:
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={parameters.alpha}
            onChange={e => updateParameters({ alpha: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="simulation-controls">
        <button 
          onClick={isRunning ? pauseSimulation : startSimulation}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
};