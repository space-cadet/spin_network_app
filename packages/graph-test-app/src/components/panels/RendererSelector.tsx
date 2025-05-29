import React from 'react';
import { Monitor, Box } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setRenderMode } from '../../store/graphSlice';

export const RendererSelector: React.FC = () => {
  const dispatch = useDispatch();
  const renderMode = useSelector((state: RootState) => state.graph.renderMode);

  const rendererOptions = [
    { value: '2d' as const, label: '2D View', description: 'Sigma.js 2D rendering', icon: Monitor },
    { value: '3d' as const, label: '3D View', description: 'Three.js 3D rendering', icon: Box }
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        Renderer
      </label>
      <div className="grid grid-cols-2 gap-2">
        {rendererOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = renderMode === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => dispatch(setRenderMode(option.value))}
              className={`
                p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <div className="text-center">
                <div className={`text-xs font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {option.label}
                </div>
                <div className={`text-xs ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {option.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Current: <span className="font-medium">{renderMode === '2d' ? 'Sigma.js 2D' : 'Three.js 3D'}</span>
      </div>
    </div>
  );
};
