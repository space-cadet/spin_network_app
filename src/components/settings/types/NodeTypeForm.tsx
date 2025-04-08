import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaInfoCircle } from 'react-icons/fa';
import { NodeType } from '../../../models/typeModels';

interface NodeTypeFormProps {
  nodeType: NodeType | null;
  isEditing: boolean;
  onSubmit: (nodeType: NodeType) => void;
  onCancel: () => void;
}

const NodeTypeForm: React.FC<NodeTypeFormProps> = ({ nodeType, isEditing, onSubmit, onCancel }) => {
  const [type, setType] = useState<NodeType>({
    id: '',
    name: '',
    description: '',
    color: '#4f46e5',
    borderColor: '#4338ca',
    borderWidth: 2,
    borderStyle: 'solid',
    shape: 'ellipse',
    size: 80,
    labelPosition: 'center'
  });

  useEffect(() => {
    if (nodeType) {
      setType(nodeType);
    } else {
      // Generate a unique ID for new node types
      setType(prev => ({
        ...prev,
        id: `node-type-${Date.now()}`
      }));
    }
  }, [nodeType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setType(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : Number(value);
    setType(prev => ({ ...prev, [name]: numValue }));
  };

  const handleColorChange = (colorName: string, value: string) => {
    setType(prev => ({ ...prev, [colorName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(type);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <button
          onClick={onCancel}
          className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FaChevronLeft />
        </button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {isEditing ? 'Edit Node Type' : 'Create Node Type'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type Name*
              </label>
              <input
                type="text"
                name="name"
                value={type.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter type name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={type.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shape
              </label>
              <select
                name="shape"
                value={type.shape}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="ellipse">Circle</option>
                <option value="rectangle">Rectangle</option>
                <option value="triangle">Triangle</option>
                <option value="diamond">Diamond</option>
                <option value="hexagon">Hexagon</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Size
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="size"
                  min="20"
                  max="150"
                  value={type.size}
                  onChange={handleNumberChange}
                  className="w-full mr-3"
                />
                <input
                  type="number"
                  name="size"
                  value={type.size}
                  onChange={handleNumberChange}
                  min="20"
                  max="150"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Label Position
              </label>
              <select
                name="labelPosition"
                value={type.labelPosition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fill Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={type.color}
                  onChange={(e) => handleColorChange('color', e.target.value)}
                  className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={type.color}
                  onChange={(e) => handleColorChange('color', e.target.value)}
                  className="flex-1 ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Border Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={type.borderColor}
                  onChange={(e) => handleColorChange('borderColor', e.target.value)}
                  className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={type.borderColor}
                  onChange={(e) => handleColorChange('borderColor', e.target.value)}
                  className="flex-1 ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Border Width
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="borderWidth"
                  min="0"
                  max="10"
                  value={type.borderWidth}
                  onChange={handleNumberChange}
                  className="w-full mr-3"
                />
                <input
                  type="number"
                  name="borderWidth"
                  value={type.borderWidth}
                  onChange={handleNumberChange}
                  min="0"
                  max="10"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Border Style
              </label>
              <select
                name="borderStyle"
                value={type.borderStyle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>

            {/* Node preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preview
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-6 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: `${type.size}px`,
                    height: `${type.size}px`,
                    backgroundColor: type.color,
                    borderColor: type.borderColor,
                    borderWidth: `${type.borderWidth}px`,
                    borderStyle: type.borderStyle,
                    borderRadius: type.shape === 'ellipse' ? '50%' : 
                                  type.shape === 'rectangle' ? '0' : '25%',
                    transform: type.shape === 'diamond' ? 'rotate(45deg)' : 'none'
                  }}
                >
                  {type.labelPosition === 'center' && (
                    <span
                      className="text-white text-sm font-medium"
                      style={{
                        transform: type.shape === 'diamond' ? 'rotate(-45deg)' : 'none'
                      }}
                    >
                      Label
                    </span>
                  )}
                </div>
              </div>
              {type.labelPosition === 'top' && (
                <div className="text-center mt-2 text-sm font-medium">Label</div>
              )}
              {type.labelPosition === 'bottom' && (
                <div className="text-center mt-1 text-sm font-medium">Label</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NodeTypeForm;