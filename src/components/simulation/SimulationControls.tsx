import React, { useState } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStop, FaCog } from 'react-icons/fa';
import CollapsibleSection from '../common/CollapsibleSection';

interface SimulationControlsProps {
  onStartSimulation: (params: any) => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ onStartSimulation }) => {
  const [simType, setSimType] = useState<'ordinary' | 'finite-velocity'>('ordinary');
  const [alpha, setAlpha] = useState(0.5);
  const [beta, setBeta] = useState(0.5);
  const [c, setC] = useState(1.0);
  const [timeStep, setTimeStep] = useState(0.01);
  const [totalTime, setTotalTime] = useState(10.0);
  const [running, setRunning] = useState(false);
  
  const handleStart = () => {
    const params = {
      type: simType,
      alpha,
      beta,
      c,
      timeStep,
      totalTime
    };
    
    onStartSimulation(params);
    setRunning(true);
  };
  
  const handlePause = () => {
    setRunning(false);
    // This would eventually pause the simulation
  };
  
  const handleStop = () => {
    setRunning(false);
    // This would eventually stop the simulation
  };
  
  const handleStep = () => {
    // This would eventually step through the simulation
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Simulation Controls</h2>
      
      <div className="space-y-4">
        <CollapsibleSection title="Diffusion Type" defaultExpanded={true}>
          <div className="form-group">
            <select 
              className="form-input"
              value={simType}
              onChange={(e) => setSimType(e.target.value as any)}
            >
              <option value="ordinary">Ordinary Diffusion</option>
              <option value="finite-velocity">Finite Velocity Diffusion</option>
            </select>
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Diffusion Parameters" defaultExpanded={true}>
          {/* Damping Coefficients */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Alpha</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={alpha}
                  onChange={(e) => setAlpha(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-center">{alpha.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Beta</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={beta}
                  onChange={(e) => setBeta(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-center">{beta.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          {/* Wave Speed */}
          <div className="form-group mt-3">
            <label className="form-label">Wave Speed (c)</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={c}
                onChange={(e) => setC(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-center">{c.toFixed(1)}</span>
            </div>
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Time Configuration" defaultExpanded={false}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Time Step</label>
              <input
                type="number"
                min="0.001"
                max="0.1"
                step="0.001"
                value={timeStep}
                onChange={(e) => setTimeStep(parseFloat(e.target.value))}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Total Time</label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={totalTime}
                onChange={(e) => setTotalTime(parseFloat(e.target.value))}
                className="form-input"
              />
            </div>
          </div>
        </CollapsibleSection>
        
        {/* Advanced Settings Button */}
        <button className="btn btn-outline w-full flex items-center justify-center space-x-2">
          <FaCog />
          <span>Advanced Settings</span>
        </button>
        
        {/* Simulation Controls */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex space-x-2">
            {!running ? (
              <button 
                className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                onClick={handleStart}
              >
                <FaPlay />
                <span>Start</span>
              </button>
            ) : (
              <button 
                className="btn btn-outline flex-1 flex items-center justify-center space-x-2"
                onClick={handlePause}
              >
                <FaPause />
                <span>Pause</span>
              </button>
            )}
            
            <button 
              className="btn btn-outline flex items-center justify-center px-4"
              onClick={handleStep}
            >
              <FaStepForward />
            </button>
            
            <button 
              className="btn btn-outline flex items-center justify-center px-4"
              onClick={handleStop}
            >
              <FaStop />
            </button>
          </div>
        </div>
        
        {/* Simulation Status */}
        <div className="text-sm text-gray-500 flex justify-between">
          <span>Status: {running ? 'Running' : 'Stopped'}</span>
          <span>Time: 0.00 / {totalTime.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
