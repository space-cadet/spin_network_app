import React from 'react';

export interface MetricsPanelProps {
  performanceData: {
    operationTime: number;
    memoryUsage: number;
    frameRate: number;
  };
  graphStats: {
    nodes: number;
    edges: number;
    density: number;
  };
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  performanceData,
  graphStats,
}) => {
  return (
    <div className="h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Metrics</h2>
      
      {/* Performance Metrics */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Performance</h3>
        <div className="space-y-2">
          <div>Operation Time: {performanceData.operationTime}ms</div>
          <div>Memory Usage: {performanceData.memoryUsage}MB</div>
          <div>Frame Rate: {performanceData.frameRate}fps</div>
        </div>
      </div>

      {/* Graph Statistics */}
      <div>
        <h3 className="font-medium mb-2">Graph Statistics</h3>
        <div className="space-y-2">
          <div>Nodes: {graphStats.nodes}</div>
          <div>Edges: {graphStats.edges}</div>
          <div>Density: {graphStats.density}</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;