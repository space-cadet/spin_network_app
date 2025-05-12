import React from 'react';

export interface ControlPanelProps {
  onLibrarySelect: (lib: 'graphology' | 'cytoscape') => void;
  onOperationSelect: (op: string) => void;
  onGenerateGraph: (params: any) => void; // We'll type this properly later
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onLibrarySelect,
  onOperationSelect,
  onGenerateGraph,
}) => {
  return (
    <div className="h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Graph Controls</h2>
      <div className="space-y-4">
        {/* Library Selection */}
        <div>
          <h3 className="font-medium mb-2">Library</h3>
          <select 
            className="w-full p-2 rounded bg-white dark:bg-gray-700"
            onChange={(e) => onLibrarySelect(e.target.value as 'graphology' | 'cytoscape')}
          >
            <option value="graphology">Graphology</option>
            <option value="cytoscape">Cytoscape</option>
          </select>
        </div>

        {/* Operations */}
        <div>
          <h3 className="font-medium mb-2">Operations</h3>
          {/* We'll add operation controls here */}
        </div>

        {/* Graph Generation */}
        <div>
          <h3 className="font-medium mb-2">Generate Graph</h3>
          {/* We'll add graph generation controls here */}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;