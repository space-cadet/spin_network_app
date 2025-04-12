import React from 'react';

interface RawDataDisplayProps {
  title: string;
  data: Record<string, number | boolean | string>;
  precision?: number;
}

/**
 * Simple component to display raw data values when visualization fails
 */
const RawDataDisplay: React.FC<RawDataDisplayProps> = ({ 
  title, 
  data, 
  precision = 4 
}) => {
  return (
    <div className="border border-gray-200 rounded p-3 mb-4">
      <h4 className="font-medium text-sm mb-2">{title}</h4>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-xs text-gray-600">{key}:</span>
            <span className="text-xs font-mono">
              {typeof value === 'number' 
                ? value.toFixed(precision)
                : String(value)
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RawDataDisplay;
