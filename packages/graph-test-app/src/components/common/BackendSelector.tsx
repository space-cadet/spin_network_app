import React from 'react';

export const BackendSelector: React.FC = () => {
  const [selectedBackend, setSelectedBackend] = React.useState<'graphology' | 'cytoscape'>('graphology');

  return (
    <div className="flex space-x-2">
      <button
        className={`px-4 py-1 rounded transition-colors ${
          selectedBackend === 'graphology'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={() => setSelectedBackend('graphology')}
      >
        Graphology
      </button>
      <button
        className={`px-4 py-1 rounded transition-colors ${
          selectedBackend === 'cytoscape'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={() => setSelectedBackend('cytoscape')}
      >
        Cytoscape
      </button>
    </div>
  );
};