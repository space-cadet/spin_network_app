import React, { useState, ChangeEvent } from 'react';
import { Play } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setGraph } from '../../store/graphSlice';
import * as builders from '../../../../graph-core/src/core/builders';

type BuilderType = 
  | 'empty'
  | 'complete' 
  | 'path'
  | 'random'
  | 'randomSparse'
  | 'lattice1D'
  | 'lattice2D'
  | 'lattice1DPeriodic'
  | 'lattice2DPeriodic'
  | 'triangularLattice';

interface BuilderParams {
  nodeCount: number;
  width: number;
  height: number;
  probability: number;
  length: number;
}

export const GraphBuilderControls: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedBuilder, setSelectedBuilder] = useState<BuilderType>('complete');
  const [params, setParams] = useState<BuilderParams>({
    nodeCount: 5,
    width: 4,
    height: 4,
    probability: 0.3,
    length: 6
  });

  const builderOptions: { value: BuilderType; label: string; description: string }[] = [
    { value: 'empty', label: 'Empty', description: 'Graph with nodes but no edges' },
    { value: 'complete', label: 'Complete', description: 'Every node connected to every other' },
    { value: 'path', label: 'Path', description: 'Linear chain of nodes' },
    { value: 'random', label: 'Random', description: 'Random edges with given probability' },
    { value: 'randomSparse', label: 'Random Sparse', description: 'Sparse random graph' },
    { value: 'lattice1D', label: '1D Lattice', description: 'One-dimensional grid' },
    { value: 'lattice2D', label: '2D Lattice', description: 'Two-dimensional grid' },
    { value: 'lattice1DPeriodic', label: '1D Periodic', description: 'Ring lattice' },
    { value: 'lattice2DPeriodic', label: '2D Periodic', description: 'Torus lattice' },
    { value: 'triangularLattice', label: 'Triangular', description: 'Triangular lattice structure' }
  ];

  const handleGenerate = (): void => {
    console.log('Generate graph:', selectedBuilder, params);
    
    try {
      let generatedGraph;
      
      switch (selectedBuilder) {
        case 'empty':
          generatedGraph = builders.empty(params.nodeCount);
          break;
        case 'complete':
          generatedGraph = builders.complete(params.nodeCount);
          break;
        case 'path':
          generatedGraph = builders.path(params.nodeCount);
          break;
        case 'random':
          generatedGraph = builders.random(params.nodeCount, params.probability);
          break;
        case 'randomSparse':
          generatedGraph = builders.randomSparse(params.nodeCount, params.probability);
          break;
        case 'lattice1D':
          generatedGraph = builders.lattice1D(params.length);
          break;
        case 'lattice2D':
          generatedGraph = builders.lattice2D(params.width, params.height);
          break;
        case 'lattice1DPeriodic':
          generatedGraph = builders.lattice1DPeriodic(params.length);
          break;
        case 'lattice2DPeriodic':
          generatedGraph = builders.lattice2DPeriodic(params.width, params.height);
          break;
        case 'triangularLattice':
          generatedGraph = builders.triangularLattice(params.width, params.height);
          break;
        default:
          console.error('Unknown builder type:', selectedBuilder);
          return;
      }
      
      // Apply some styling and positioning to the generated graph
      const graphInstance = generatedGraph.getGraphologyInstance();
      
      // For lattice graphs, use logical coordinates for positioning
      if (selectedBuilder.includes('lattice') || selectedBuilder === 'triangularLattice') {
        graphInstance.forEachNode((nodeId, attributes) => {
          const latticeX = attributes.latticeX || 0;
          const latticeY = attributes.latticeY || 0;
          const latticePos = attributes.latticePosition || 0;
          
          // Set visualization coordinates based on lattice coordinates
          graphInstance.setNodeAttribute(nodeId, 'x', latticeX * 50 || latticePos * 50);
          graphInstance.setNodeAttribute(nodeId, 'y', latticeY * 50 || 0);
          graphInstance.setNodeAttribute(nodeId, 'size', 8);
          graphInstance.setNodeAttribute(nodeId, 'color', '#3b82f6');
        });
      } else {
        // For non-lattice graphs, apply circular layout
        const nodeCount = graphInstance.order;
        let index = 0;
        graphInstance.forEachNode((nodeId) => {
          const angle = (2 * Math.PI * index) / nodeCount;
          const radius = Math.min(200, nodeCount * 20);
          graphInstance.setNodeAttribute(nodeId, 'x', radius * Math.cos(angle));
          graphInstance.setNodeAttribute(nodeId, 'y', radius * Math.sin(angle));
          graphInstance.setNodeAttribute(nodeId, 'size', 8);
          graphInstance.setNodeAttribute(nodeId, 'color', '#3b82f6');
          index++;
        });
      }
      
      // Style edges
      graphInstance.forEachEdge((edgeId) => {
        graphInstance.setEdgeAttribute(edgeId, 'size', 2);
        graphInstance.setEdgeAttribute(edgeId, 'color', '#94a3b8');
      });
      
      // Dispatch the graph to Redux store
      dispatch(setGraph(generatedGraph));
      
    } catch (error) {
      console.error('Error generating graph:', error);
    }
  };

  const renderParameterInputs = () => {
    const needs1D = ['empty', 'complete', 'path', 'lattice1D', 'lattice1DPeriodic'].includes(selectedBuilder);
    const needs2D = ['lattice2D', 'lattice2DPeriodic', 'triangularLattice'].includes(selectedBuilder);
    const needsProbability = ['random', 'randomSparse'].includes(selectedBuilder);

    return (
      <div className="space-y-3">
        {needs1D && (
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
              {selectedBuilder.includes('lattice') ? 'Length' : 'Node Count'}
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={selectedBuilder.includes('lattice') ? params.length : params.nodeCount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setParams(prev => ({
                ...prev,
                ...(selectedBuilder.includes('lattice') 
                  ? { length: parseInt(e.target.value) || 1 }
                  : { nodeCount: parseInt(e.target.value) || 1 })
              }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
          </div>
        )}

        {needs2D && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                Width
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={params.width}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setParams(prev => ({
                  ...prev,
                  width: parseInt(e.target.value) || 2
                }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                Height
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={params.height}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setParams(prev => ({
                  ...prev,
                  height: parseInt(e.target.value) || 2
                }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
          </>
        )}

        {needsProbability && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                Node Count
              </label>
              <input
                type="number"
                min="2"
                max="50"
                value={params.nodeCount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setParams(prev => ({
                  ...prev,
                  nodeCount: parseInt(e.target.value) || 2
                }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                Edge Probability
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={params.probability}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setParams(prev => ({
                  ...prev,
                  probability: parseFloat(e.target.value) || 0
                }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Builder Selection */}
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
          Graph Type
        </label>
        <select
          value={selectedBuilder}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedBuilder(e.target.value as BuilderType)}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
        >
          {builderOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {builderOptions.find(opt => opt.value === selectedBuilder)?.description}
        </p>
      </div>

      {/* Parameter Inputs */}
      {renderParameterInputs()}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Play className="w-3 h-3" />
        Generate Graph
      </button>
    </div>
  );
};
