import React, { useState } from 'react';
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaUndo, 
  FaCog,
  FaChartLine,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import CollapsibleSection from '../common/CollapsibleSection';
import { useSimulation } from '../../hooks/useSimulation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  SimulationParameters, 
  StandardWeightFunction 
} from '../../simulation/core/types';

interface TimeSliderProps {
  currentTime: number;
  totalTime: number;
  isRunning: boolean;
  hasHistory: boolean;
  onTimeChange: (time: number) => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ 
  currentTime, 
  totalTime, 
  isRunning, 
  hasHistory, 
  onTimeChange 
}) => {
  return (
    <div className="flex items-center space-x-2 mt-2">
      <input
        type="range"
        min="0"
        max={totalTime}
        step={totalTime / 100}
        value={currentTime}
        onChange={(e) => onTimeChange(parseFloat(e.target.value))}
        disabled={isRunning || !hasHistory}
        className="flex-1"
      />
      <span className="text-sm font-mono w-24">
        {currentTime.toFixed(2)} / {totalTime.toFixed(2)}
      </span>
    </div>
  );
};

interface DiffusionTypeSelectorProps {
  value: SimulationParameters['diffusionType'];
  onChange: (value: SimulationParameters['diffusionType']) => void;
}

const DiffusionTypeSelector: React.FC<DiffusionTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="ordinary-diffusion"
          name="diffusion-type"
          value="ordinary"
          checked={value === 'ordinary'}
          onChange={() => onChange('ordinary')}
          className="form-radio"
        />
        <label htmlFor="ordinary-diffusion" className="text-sm">
          Ordinary Diffusion
          <span className="block text-xs text-gray-500">
            Heat equation model (∂ϕ/∂t = α∇²ϕ)
          </span>
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="telegraph-diffusion"
          name="diffusion-type"
          value="telegraph"
          checked={value === 'telegraph'}
          onChange={() => onChange('telegraph')}
          className="form-radio"
        />
        <label htmlFor="telegraph-diffusion" className="text-sm">
          Telegraph Diffusion
          <span className="block text-xs text-gray-500">
            Wave-like model (∂²ϕ/∂t² + β∂ϕ/∂t = c²∇²ϕ)
          </span>
        </label>
      </div>
    </div>
  );
};

interface NumericalMethodSelectorProps {
  value: SimulationParameters['numericalMethod'];
  onChange: (value: SimulationParameters['numericalMethod']) => void;
}

const NumericalMethodSelector: React.FC<NumericalMethodSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="form-group mt-3">
      <label className="block text-sm font-medium mb-1">Numerical Method</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SimulationParameters['numericalMethod'])}
        className="form-select w-full text-sm"
      >
        <option value="euler">Euler (Fast, Less Accurate)</option>
        <option value="rk4">RK4 (Balanced)</option>
        <option value="adaptive">Adaptive (Slow, Most Accurate)</option>
      </select>
    </div>
  );
};

interface WeightFunctionSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const WeightFunctionSelector: React.FC<WeightFunctionSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="form-group mt-3">
      <label className="block text-sm font-medium mb-1">Edge Weight Function</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select w-full text-sm"
      >
        <option value={StandardWeightFunction.SPIN}>Spin Value (j)</option>
        <option value={StandardWeightFunction.CASIMIR}>Casimir (j(j+1))</option>
        <option value={StandardWeightFunction.DIMENSION}>Dimension (2j+1)</option>
        <option value={StandardWeightFunction.AREA}>Area (√j(j+1))</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">
        Determines how edge spins affect diffusion rates
      </p>
    </div>
  );
};

interface InitialStateSelectorProps {
  type: SimulationParameters['initialStateType'];
  params: SimulationParameters['initialStateParams'];
  onTypeChange: (type: SimulationParameters['initialStateType']) => void;
  onParamsChange: (params: Record<string, any>) => void;
}

const InitialStateSelector: React.FC<InitialStateSelectorProps> = ({ 
  type, 
  params, 
  onTypeChange, 
  onParamsChange 
}) => {
  return (
    <div className="space-y-3">
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Initial State Type</label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as SimulationParameters['initialStateType'])}
          className="form-select w-full text-sm"
        >
          <option value="delta">Delta Function (Single Node)</option>
          <option value="uniform">Uniform Distribution</option>
          <option value="gaussian">Gaussian Distribution</option>
          <option value="custom">Custom State</option>
        </select>
      </div>
      
      {type === 'delta' && (
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Node Value</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={params.value || 1.0}
            onChange={(e) => onParamsChange({ ...params, value: parseFloat(e.target.value) })}
            className="form-input w-full text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select a node on the network to set as the initial peak
          </p>
        </div>
      )}
      
      {type === 'gaussian' && (
        <div className="space-y-2">
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Center Value</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={params.centerValue || 1.0}
              onChange={(e) => onParamsChange({ 
                ...params, 
                centerValue: parseFloat(e.target.value) 
              })}
              className="form-input w-full text-sm"
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Width (σ)</label>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={params.sigma || 1.0}
              onChange={(e) => onParamsChange({ 
                ...params, 
                sigma: parseFloat(e.target.value) 
              })}
              className="form-input w-full text-sm"
            />
          </div>
        </div>
      )}
      
      {type === 'uniform' && (
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Value</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={params.value || 0.1}
            onChange={(e) => onParamsChange({ 
              ...params, 
              value: parseFloat(e.target.value) 
            })}
            className="form-input w-full text-sm"
          />
        </div>
      )}
    </div>
  );
};

// Tab interface component
interface TabInterface {
  activeTab: 'parameters' | 'analysis';
  onTabChange: (tab: 'parameters' | 'analysis') => void;
}

const TabNav: React.FC<TabInterface> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-1 w-full mb-3">
      <button
        className={`flex-1 text-sm px-3 py-2 rounded-t-md border-b-2 ${
          activeTab === 'parameters' 
            ? 'bg-blue-50 border-blue-500 text-blue-700' 
            : 'bg-gray-50 border-transparent text-gray-600 hover:text-gray-800'
        }`}
        onClick={() => onTabChange('parameters')}
      >
        <div className="flex items-center justify-center space-x-1">
          <FaCog className="text-xs" />
          <span>Parameters</span>
        </div>
      </button>
      <button
        className={`flex-1 text-sm px-3 py-2 rounded-t-md border-b-2 ${
          activeTab === 'analysis' 
            ? 'bg-blue-50 border-blue-500 text-blue-700' 
            : 'bg-gray-50 border-transparent text-gray-600 hover:text-gray-800'
        }`}
        onClick={() => onTabChange('analysis')}
      >
        <div className="flex items-center justify-center space-x-1">
          <FaChartLine className="text-xs" />
          <span>Analysis</span>
        </div>
      </button>
    </div>
  );
};

const SimulationControlPanel: React.FC = () => {
  // Check if network exists first - access the current network correctly
  const network = useSelector((state: RootState) => state.network?.currentNetwork);
  const hasNetwork = !!(network && network.nodes && network.nodes.length > 0);
  
  // Safe access to useSimulation
  const {
    isRunning,
    parameters,
    currentTime,
    hasHistory,
    startSimulation,
    pauseSimulation,
    stepSimulation,
    resetSimulation,
    jumpToTime,
    updateParameters,
    updateInitialStateParams
  } = useSimulation();
  
  const [activeTab, setActiveTab] = useState<'parameters' | 'analysis'>('parameters');
  const [isPanelExpanded, setIsPanelExpanded] = useState<boolean>(true);

  return (
    <div className="simulation-control-panel overflow-hidden border rounded-md shadow-sm">
      {/* Collapsible header */}
      <div 
        className="bg-gray-50 p-3 border-b flex items-center justify-between cursor-pointer"
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
      >
        <h3 className="text-lg font-medium flex items-center">
          <span>Simulation Controls</span>
          <button className="ml-2 text-gray-500 focus:outline-none">
            {isPanelExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
          </button>
        </h3>
        
        {/* Status indicator in header */}
        {!isPanelExpanded && (
          <span className={`text-sm ${isRunning ? "text-green-500" : "text-gray-500"}`}>
            {isRunning ? "Running" : "Stopped"} (t={currentTime.toFixed(2)})
          </span>
        )}
      </div>
      
      {/* Collapsible content */}
      {isPanelExpanded && (
        <div className="p-4 overflow-y-auto">
          {/* Tab navigation */}
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      
          {/* Network warning banner */}
          {!hasNetwork && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-700">No network detected</p>
                  <p className="text-yellow-600 text-xs mt-1">
                    Create or load a network to run the simulation. Controls are available for configuration.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Play Controls */}
          <div className="flex space-x-2 mb-4">
            <button
              className="btn flex-1 flex items-center justify-center space-x-2"
              onClick={isRunning ? pauseSimulation : startSimulation}
              disabled={!hasNetwork}
            >
              {isRunning ? <FaPause className="text-sm" /> : <FaPlay className="text-sm" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>
            
            <button
              className="btn flex items-center justify-center px-4"
              onClick={stepSimulation}
              disabled={isRunning || !hasNetwork}
              title="Step forward"
            >
              <FaStepForward className="text-sm" />
            </button>
            
            <button
              className="btn flex items-center justify-center px-4"
              onClick={resetSimulation}
              disabled={!hasNetwork}
              title="Reset simulation"
            >
              <FaUndo className="text-sm" />
            </button>
          </div>
          
          {/* Time Slider */}
          <TimeSlider
            currentTime={currentTime}
            totalTime={parameters.totalTime}
            isRunning={isRunning}
            hasHistory={hasHistory}
            onTimeChange={jumpToTime}
          />
      
      {activeTab === 'parameters' ? (
        <div className="parameters-tab mt-4 space-y-4">
          <CollapsibleSection title="Diffusion Model" defaultExpanded={true}>
            <DiffusionTypeSelector
              value={parameters.diffusionType}
              onChange={(value) => updateParameters({ diffusionType: value })}
            />
            
            <div className="mt-4 space-y-3">
              {/* Alpha parameter */}
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">
                    Diffusion Rate (α)
                  </label>
                  <span className="text-sm font-mono">{parameters.alpha.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={parameters.alpha}
                  onChange={(e) => updateParameters({ alpha: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              {/* Beta parameter (for telegraph diffusion) */}
              {parameters.diffusionType === 'telegraph' && (
                <div className="form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium">
                      Damping (β)
                    </label>
                    <span className="text-sm font-mono">{parameters.beta?.toFixed(2) || "0.00"}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={parameters.beta || 0.5}
                    onChange={(e) => updateParameters({ beta: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
              
              {/* Wave speed (for telegraph diffusion) */}
              {parameters.diffusionType === 'telegraph' && (
                <div className="form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium">
                      Wave Speed (c)
                    </label>
                    <span className="text-sm font-mono">{parameters.c?.toFixed(2) || "1.00"}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={parameters.c || 1.0}
                    onChange={(e) => updateParameters({ c: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
              
              <NumericalMethodSelector
                value={parameters.numericalMethod}
                onChange={(value) => updateParameters({ numericalMethod: value })}
              />
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection title="Initial State" defaultExpanded={true}>
            <InitialStateSelector
              type={parameters.initialStateType}
              params={parameters.initialStateParams}
              onTypeChange={(type) => updateParameters({ initialStateType: type })}
              onParamsChange={updateInitialStateParams}
            />
          </CollapsibleSection>
          
          <CollapsibleSection title="Time Configuration" defaultExpanded={false}>
            <div className="space-y-3">
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">Time Step</label>
                <div className="flex space-x-2 items-center">
                  <input
                    type="number"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={parameters.timeStep}
                    onChange={(e) => updateParameters({ timeStep: parseFloat(e.target.value) })}
                    className="form-input w-full text-sm"
                  />
                  <span className="text-sm font-mono">s</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Smaller values increase accuracy but decrease performance
                </p>
              </div>
              
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">Total Simulation Time</label>
                <div className="flex space-x-2 items-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={parameters.totalTime}
                    onChange={(e) => updateParameters({ totalTime: parseFloat(e.target.value) })}
                    className="form-input w-full text-sm"
                  />
                  <span className="text-sm font-mono">s</span>
                </div>
              </div>
              
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">
                  History Recording Interval
                </label>
                <div className="flex space-x-2 items-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={parameters.historyInterval}
                    onChange={(e) => updateParameters({ 
                      historyInterval: parseInt(e.target.value) 
                    })}
                    className="form-input w-full text-sm"
                  />
                  <span className="text-sm font-mono">steps</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Steps between history recordings (higher values use less memory)
                </p>
              </div>
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection title="Advanced Settings" defaultExpanded={false}>
            <div className="space-y-3">
              <WeightFunctionSelector
                value={parameters.weightFunction}
                onChange={(value) => updateParameters({ weightFunction: value })}
              />
              
              <div className="form-group mt-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="record-history"
                    checked={parameters.recordHistory}
                    onChange={(e) => updateParameters({ 
                      recordHistory: e.target.checked 
                    })}
                    className="form-checkbox"
                  />
                  <label htmlFor="record-history" className="text-sm">
                    Record History
                    <span className="block text-xs text-gray-500">
                      Required for time slider and analysis
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      ) : (
        <div className="analysis-tab mt-4 space-y-4">
          <div className="text-center py-8 text-gray-500">
            <FaChartLine className="mx-auto mb-3 text-3xl" />
            <p>Analysis view will be available when simulation runs</p>
            <p className="text-sm">Conservation laws, geometric properties, and statistics</p>
          </div>
        </div>
      )}
      
          {/* Simulation Status */}
          <div className="mt-4 text-sm border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="font-medium">
              Status: <span className={isRunning ? "text-green-500" : "text-gray-500"}>
                {isRunning ? "Running" : "Stopped"}
              </span>
            </span>
            <span className="font-mono">t={currentTime.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationControlPanel;