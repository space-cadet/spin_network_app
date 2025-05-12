import React from 'react';

export const PropertiesPanel: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      <div className="text-gray-500 italic">
        Select a node or edge to view properties
      </div>
    </div>
  );
};