import React, { useState } from 'react';
import { FaChartBar, FaChartPie, FaChartLine, FaRuler } from 'react-icons/fa';
import CollapsibleSection from '../common/CollapsibleSection';
import { useSimulation } from '../../hooks/useSimulation';

const SimulationResultsPanel: React.FC = () => {
  const { currentTime, hasHistory } = useSimulation();
  const [activeTab, setActiveTab] = useState<'conservation' | 'geometric' | 'statistics'>('conservation');
  
  // Placeholder data for demonstration
  const conservationData = {
    totalProbability: 0.99,
    positivity: true,
    normVariation: 0.01,
  };
  
  const geometricData = {
    totalVolume: 12.5,
    totalArea: 28.7,
    effectiveDimension: 1.8,
    volumeEntropy: 0.65
  };
  
  const statisticsData = {
    mean: 0.12,
    variance: 0.34,
    skewness: 0.02,
    kurtosis: 2.9
  };

  if (!hasHistory) {
    return (
      <div className="simulation-results-panel p-4 text-center text-gray-500">
        <FaChartLine className="mx-auto mb-3 text-3xl" />
        <p>Run simulation to see results</p>
        <p className="text-sm">Analysis will appear here after simulation starts</p>
      </div>
    );
  }

  return (
    <div className="simulation-results-panel p-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Simulation Results</h3>
        <span className="text-sm font-mono">t={currentTime.toFixed(2)}</span>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          className={`text-xs px-3 py-1 rounded flex items-center ${
            activeTab === 'conservation' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('conservation')}
        >
          <FaChartPie className="mr-1" />
          Conservation
        </button>
        <button
          className={`text-xs px-3 py-1 rounded flex items-center ${
            activeTab === 'geometric' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('geometric')}
        >
          <FaRuler className="mr-1" />
          Geometric
        </button>
        <button
          className={`text-xs px-3 py-1 rounded flex items-center ${
            activeTab === 'statistics' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('statistics')}
        >
          <FaChartBar className="mr-1" />
          Statistics
        </button>
      </div>
      
      {activeTab === 'conservation' && (
        <div className="conservation-tab space-y-3">
          <CollapsibleSection title="Total Probability Conservation" defaultExpanded={true}>
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Current Value:</span>
                <span className={`font-mono text-sm ${
                  Math.abs(conservationData.totalProbability - 1) < 0.01 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {conservationData.totalProbability.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Variation:</span>
                <span className={`font-mono text-sm ${
                  conservationData.normVariation < 0.01 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {conservationData.normVariation.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Positivity:</span>
                <span className={`font-mono text-sm ${
                  conservationData.positivity 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {conservationData.positivity ? 'Preserved' : 'Violated'}
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>Ideal value is 1.0 with minimal variation over time.</p>
              <p>Quantum states should maintain positivity and normalization.</p>
            </div>
          </CollapsibleSection>
          
          <div className="border-t border-gray-200 my-3"></div>
          
          <div className="border border-gray-200 rounded">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium">Conservation Over Time</h4>
            </div>
            <div className="h-40 flex items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-500">Chart will appear here</span>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'geometric' && (
        <div className="geometric-tab space-y-3">
          <CollapsibleSection title="Geometric Properties" defaultExpanded={true}>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Total Volume</h4>
                <div className="text-lg font-mono text-center">
                  {geometricData.totalVolume.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Total Area</h4>
                <div className="text-lg font-mono text-center">
                  {geometricData.totalArea.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Effective Dimension</h4>
                <div className="text-lg font-mono text-center">
                  {geometricData.effectiveDimension.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Volume Entropy</h4>
                <div className="text-lg font-mono text-center">
                  {geometricData.volumeEntropy.toFixed(2)}
                </div>
              </div>
            </div>
          </CollapsibleSection>
          
          <div className="border-t border-gray-200 my-3"></div>
          
          <div className="border border-gray-200 rounded">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium">Dimension Analysis</h4>
            </div>
            <div className="h-40 flex items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-500">Chart will appear here</span>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'statistics' && (
        <div className="statistics-tab space-y-3">
          <CollapsibleSection title="Distribution Statistics" defaultExpanded={true}>
            <div className="bg-gray-50 p-3 rounded">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <h4 className="text-xs text-gray-500">Mean</h4>
                  <div className="font-mono">{statisticsData.mean.toFixed(4)}</div>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500">Variance</h4>
                  <div className="font-mono">{statisticsData.variance.toFixed(4)}</div>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500">Skewness</h4>
                  <div className="font-mono">{statisticsData.skewness.toFixed(4)}</div>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500">Kurtosis</h4>
                  <div className="font-mono">{statisticsData.kurtosis.toFixed(4)}</div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>Statistics describe the distribution of the quantum state across the network.</p>
            </div>
          </CollapsibleSection>
          
          <div className="border-t border-gray-200 my-3"></div>
          
          <div className="border border-gray-200 rounded">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium">State Distribution</h4>
            </div>
            <div className="h-40 flex items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-500">Histogram will appear here</span>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded mt-3">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium">Time Evolution</h4>
            </div>
            <div className="h-40 flex items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-500">Line chart will appear here</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationResultsPanel;