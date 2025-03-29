import React from 'react';

// This is a placeholder component for future energy plot implementation
// In a real implementation, we would use D3.js or a similar library

interface EnergyPlotProps {
  data?: {
    time: number[];
    gravitational: number[];
    matter: number[];
    total: number[];
  };
}

const EnergyPlot: React.FC<EnergyPlotProps> = ({ data }) => {
  // Placeholder data for visualization
  const mockData = {
    time: Array.from({ length: 50 }, (_, index) => index * 0.2),
    gravitational: Array.from({ length: 50 }, (_, index) => Math.sin(index * 0.2) * 0.5 + 1),
    matter: Array.from({ length: 50 }, (_, index) => Math.cos(index * 0.2) * 0.5 + 1),
    total: Array.from({ length: 50 }, () => 2)
  };

  const plotData = data || mockData;
  
  // Calculate the SVG dimensions
  const svgWidth = 400;
  const svgHeight = 200;
  const padding = 30;
  const plotWidth = svgWidth - 2 * padding;
  const plotHeight = svgHeight - 2 * padding;
  
  // Calculate the x and y scales
  const xScale = (i: number) => (i / (plotData.time.length - 1)) * plotWidth + padding;
  const yScale = (value: number) => plotHeight - (value - 0) / (2.5 - 0) * plotHeight + padding;
  
  // Generate path strings for the lines
  const gravitationalPath = plotData.gravitational.map((value, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(value)}`
  ).join(' ');
  
  const matterPath = plotData.matter.map((value, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(value)}`
  ).join(' ');
  
  const totalPath = plotData.total.map((value, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(value)}`
  ).join(' ');

  return (
    <div className="card">
      <h3 className="text-lg font-medium mb-4">Energy Plot</h3>
      
      <svg width={svgWidth} height={svgHeight}>
        {/* X and Y axes */}
        <line 
          x1={padding} 
          y1={svgHeight - padding} 
          x2={svgWidth - padding} 
          y2={svgHeight - padding} 
          stroke="#666" 
          strokeWidth="1" 
        />
        <line 
          x1={padding} 
          y1={padding} 
          x2={padding} 
          y2={svgHeight - padding} 
          stroke="#666" 
          strokeWidth="1" 
        />
        
        {/* X-axis label */}
        <text 
          x={svgWidth / 2} 
          y={svgHeight - 5} 
          textAnchor="middle" 
          className="text-xs"
        >
          Time
        </text>
        
        {/* Y-axis label */}
        <text 
          x={10} 
          y={svgHeight / 2} 
          textAnchor="middle" 
          transform={`rotate(-90, 10, ${svgHeight / 2})`} 
          className="text-xs"
        >
          Energy
        </text>
        
        {/* Energy lines */}
        <path d={gravitationalPath} fill="none" stroke="#4f46e5" strokeWidth="2" />
        <path d={matterPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
        <path d={totalPath} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
        
        {/* Legend */}
        <rect x={svgWidth - 140} y={10} width={130} height={60} fill="white" stroke="#e5e7eb" />
        
        <line x1={svgWidth - 130} y1={25} x2={svgWidth - 110} y2={25} stroke="#4f46e5" strokeWidth="2" />
        <text x={svgWidth - 105} y={29} className="text-xs">Gravitational</text>
        
        <line x1={svgWidth - 130} y1={45} x2={svgWidth - 110} y2={45} stroke="#3b82f6" strokeWidth="2" />
        <text x={svgWidth - 105} y={49} className="text-xs">Matter</text>
        
        <line x1={svgWidth - 130} y1={65} x2={svgWidth - 110} y2={65} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
        <text x={svgWidth - 105} y={69} className="text-xs">Total</text>
      </svg>
    </div>
  );
};

export default EnergyPlot;
