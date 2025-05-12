import React from 'react';

export interface GraphCanvasProps {
  selectedLibrary: 'graphology' | 'cytoscape';
  onNodeSelect?: (nodeId: string) => void;
  onEdgeSelect?: (edgeId: string) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  selectedLibrary,
  onNodeSelect,
  onEdgeSelect,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // We'll initialize the selected graph library here
    console.log(`Initializing ${selectedLibrary}`);
  }, [selectedLibrary]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-inner"
    >
      {/* Graph will be rendered here */}
    </div>
  );
};

export default GraphCanvas;