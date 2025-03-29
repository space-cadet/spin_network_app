import React from 'react';
import { useNetwork } from '../../context/NetworkContext';

const PropertiesPanel: React.FC = () => {
  const { network, selectedElementId, selectedElementType } = useNetwork();

  // Find the selected element in the network data
  const selectedElement = selectedElementId
    ? selectedElementType === 'node'
      ? network.nodes.find(node => node.id === selectedElementId)
      : network.edges.find(edge => edge.id === selectedElementId)
    : null;

  if (!selectedElement) {
    return (
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium mb-4">Properties</h2>
        <p className="text-gray-500 text-sm">No element selected</p>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 p-4">
      <h2 className="text-lg font-medium mb-4">
        {selectedElementType === 'node' ? 'Node' : 'Edge'} Properties
      </h2>
      
      <div className="space-y-4">
        <div className="form-group">
          <label className="form-label">ID</label>
          <input
            type="text"
            value={selectedElement.id}
            readOnly
            className="form-input bg-gray-50"
          />
        </div>
        
        {selectedElementType === 'node' ? (
          <>
            <div className="form-group">
              <label className="form-label">Label</label>
              <input
                type="text"
                defaultValue={(selectedElement as any).label || ''}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Intertwiner Value</label>
              <input
                type="number"
                step="0.5"
                defaultValue={(selectedElement as any).intertwiner}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  defaultValue={(selectedElement as any).position.x}
                  className="form-input"
                  placeholder="X"
                />
                <input
                  type="number"
                  defaultValue={(selectedElement as any).position.y}
                  className="form-input"
                  placeholder="Y"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Label</label>
              <input
                type="text"
                defaultValue={(selectedElement as any).label || ''}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Spin Value</label>
              <input
                type="number"
                step="0.5"
                defaultValue={(selectedElement as any).spin}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Source</label>
              <input
                type="text"
                value={(selectedElement as any).source}
                readOnly
                className="form-input bg-gray-50"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Target</label>
              <input
                type="text"
                value={(selectedElement as any).target}
                readOnly
                className="form-input bg-gray-50"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
