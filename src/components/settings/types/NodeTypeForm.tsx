import React, { useState, useEffect } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { NodeType } from '../../../models/typeModels';
import { useAppDispatch } from '../../../store/hooks';
import { updateNodeType, addNodeType } from '../../../store/slices/typeSlice';

interface NodeTypeFormProps {
  nodeType: NodeType | null;
  isEditing: boolean;
  onSubmit: (nodeType: NodeType) => void;
  onCancel: () => void;
}

const NodeTypeForm: React.FC<NodeTypeFormProps> = ({ nodeType, isEditing, onSubmit, onCancel }) => {
  const dispatch = useAppDispatch();
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
    labelPosition: 'center',
    labelColor: '#ffffff',
    labelSize: 14,
    labelBold: false,
    labelItalic: false
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
    const updatedType = { ...type, [name]: value };
    setType(updatedType);
    
    // For real-time updates, dispatch to Redux if we're editing an existing type
    if (isEditing) {
      dispatch(updateNodeType(updatedType));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : Number(value);
    const updatedType = { ...type, [name]: numValue };
    setType(updatedType);
    
    // For real-time updates, dispatch to Redux if we're editing an existing type
    if (isEditing) {
      dispatch(updateNodeType(updatedType));
    }
  };

  const handleColorChange = (colorName: string, value: string) => {
    const updatedType = { ...type, [colorName]: value };
    setType(updatedType);
    
    // For real-time updates, dispatch to Redux if we're editing an existing type
    if (isEditing) {
      dispatch(updateNodeType(updatedType));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If we're not editing, we need to create a new type
    if (!isEditing) {
      dispatch(addNodeType(type));
    }
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
            
            {/* Label styling section */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Label Styling
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Label Color
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={type.labelColor || '#ffffff'}
                      onChange={(e) => handleColorChange('labelColor', e.target.value)}
                      className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={type.labelColor || '#ffffff'}
                      onChange={(e) => handleColorChange('labelColor', e.target.value)}
                      className="flex-1 ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Label Size
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      name="labelSize"
                      min="8"
                      max="24"
                      value={type.labelSize || 14}
                      onChange={handleNumberChange}
                      className="w-full mr-3"
                    />
                    <input
                      type="number"
                      name="labelSize"
                      value={type.labelSize || 14}
                      onChange={handleNumberChange}
                      min="8"
                      max="24"
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="labelBold"
                      name="labelBold"
                      checked={type.labelBold || false}
                      onChange={(e) => {
                        const updatedType = { ...type, labelBold: e.target.checked };
                        setType(updatedType);
                        if (isEditing) {
                          dispatch(updateNodeType(updatedType));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="labelBold" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Bold
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="labelItalic"
                      name="labelItalic"
                      checked={type.labelItalic || false}
                      onChange={(e) => {
                        const updatedType = { ...type, labelItalic: e.target.checked };
                        setType(updatedType);
                        if (isEditing) {
                          dispatch(updateNodeType(updatedType));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="labelItalic" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Italic
                    </label>
                  </div>
                </div>
              </div>
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
                      style={{
                        transform: type.shape === 'diamond' ? 'rotate(-45deg)' : 'none',
                        color: type.labelColor || '#ffffff',
                        fontSize: `${type.labelSize || 14}px`,
                        fontWeight: type.labelBold ? 'bold' : 'normal',
                        fontStyle: type.labelItalic ? 'italic' : 'normal'
                      }}
                    >
                      Label
                    </span>
                  )}
                </div>
              </div>
              {type.labelPosition === 'top' && (
                <div 
                  className="text-center mt-2" 
                  style={{
                    color: type.labelColor || '#000000',
                    fontSize: `${type.labelSize || 14}px`,
                    fontWeight: type.labelBold ? 'bold' : 'normal',
                    fontStyle: type.labelItalic ? 'italic' : 'normal'
                  }}
                >
                  Label
                </div>
              )}
              {type.labelPosition === 'bottom' && (
                <div 
                  className="text-center mt-1"
                  style={{
                    color: type.labelColor || '#000000',
                    fontSize: `${type.labelSize || 14}px`,
                    fontWeight: type.labelBold ? 'bold' : 'normal',
                    fontStyle: type.labelItalic ? 'italic' : 'normal'
                  }}
                >
                  Label
                </div>
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
            {isEditing ? 'Done' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NodeTypeForm;