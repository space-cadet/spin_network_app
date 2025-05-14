import React from 'react';

export const GraphProperties: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-gray-600">Select a node or edge to view its properties</p>
      </div>
    </div>
  );
};