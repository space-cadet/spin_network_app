import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface PropertiesPanelProps {
  selectedElement: any | null;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElement }) => {
  if (!selectedElement) {
    return (
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Properties</h2>
        <div className="text-gray-500 text-sm">
          Select a node or edge to view its properties
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Properties</h2>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-500 hover:text-primary" title="Edit">
            <FaEdit />
          </button>
          <button className="p-1 text-gray-500 hover:text-red-500" title="Delete">
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Element ID */}
        <div className="form-group">
          <label className="form-label">ID</label>
          <input
            type="text"
            className="form-input bg-gray-50"
            value={selectedElement.id}
            readOnly
          />
        </div>

        {/* Element Type */}
        <div className="form-group">
          <label className="form-label">Type</label>
          <input
            type="text"
            className="form-input bg-gray-50"
            value={selectedElement.type === 'node' ? 'Node' : 'Edge'}
            readOnly
          />
        </div>

        {/* Node-specific properties */}
        {selectedElement.type === 'node' && (
          <>
            <div className="form-group">
              <label className="form-label">Label</label>
              <input
                type="text"
                className="form-input"
                defaultValue={selectedElement.data.label || ''}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Intertwiner</label>
              <select className="form-input">
                <option value="0" selected={selectedElement.data.intertwiner === 0}>0</option>
                <option value="0.5" selected={selectedElement.data.intertwiner === 0.5}>1/2</option>
                <option value="1" selected={selectedElement.data.intertwiner === 1}>1</option>
                <option value="1.5" selected={selectedElement.data.intertwiner === 1.5}>3/2</option>
                <option value="2" selected={selectedElement.data.intertwiner === 2}>2</option>
              </select>
            </div>
          </>
        )}

        {/* Edge-specific properties */}
        {selectedElement.type === 'edge' && (
          <>
            <div className="form-group">
              <label className="form-label">Source</label>
              <input
                type="text"
                className="form-input bg-gray-50"
                value={selectedElement.data.source}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target</label>
              <input
                type="text"
                className="form-input bg-gray-50"
                value={selectedElement.data.target}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Spin</label>
              <select className="form-input">
                <option value="0" selected={selectedElement.data.spin === 0}>0</option>
                <option value="0.5" selected={selectedElement.data.spin === 0.5}>1/2</option>
                <option value="1" selected={selectedElement.data.spin === 1}>1</option>
                <option value="1.5" selected={selectedElement.data.spin === 1.5}>3/2</option>
                <option value="2" selected={selectedElement.data.spin === 2}>2</option>
              </select>
            </div>
          </>
        )}

        {/* Custom properties */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Properties</h3>
          
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                className="form-input flex-1"
                placeholder="Property name"
              />
              <input
                type="text"
                className="form-input flex-1"
                placeholder="Value"
              />
              <button className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded">
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="btn btn-primary">
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
