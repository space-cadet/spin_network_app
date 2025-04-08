import React, { useState, useEffect } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { EdgeType } from '../../../models/typeModels';
import { useAppDispatch } from '../../../store/hooks';
import { updateEdgeType, addEdgeType } from '../../../store/slices/typeSlice';

interface EdgeTypeFormProps {
  edgeType: EdgeType | null;
  isEditing: boolean;
  onSubmit: (edgeType: EdgeType) => void;
  onCancel: () => void;
}

const EdgeTypeForm: React.FC<EdgeTypeFormProps> = ({ edgeType, isEditing, onSubmit, onCancel }) => {
  const dispatch = useAppDispatch();
  const [type, setType] = useState<EdgeType>({
    id: '',
    name: '',
    description: '',
    color: '#3b82f6',
    thickness: 3,
    lineStyle: 'solid',
    arrow: 'none',
    arrowScale: 1,
  });

  useEffect(() => {
    if (edgeType) {
      setType(edgeType);
    } else {
      // Generate a unique ID for new edge types
      setType(prev => ({
        ...prev,
        id: `edge-type-${Date.now()}`
      }));
    }
  }, [edgeType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedType = { ...type, [name]: value };
    setType(updatedType);
    
    // For real-time updates, dispatch to Redux if we're editing an existing type
    if (isEditing) {
      dispatch(updateEdgeType(updatedType));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : Number(value);
    const updatedType = { ...type, [name]: numValue };
    setType(updatedType);
    
    // For real-time updates, dispatch to Redux if we're editing an existing type
    if (isEditing) {
      dispatch(updateEdgeType(updatedType));
    }
  };

  const handleColorChange = (value: string) => {
    const updatedType = { ...type, color: value };
    setType(updatedType);
    
    // For real-time updates, dispatch to Redux if we're editing an existing type
    if (isEditing) {
      dispatch(updateEdgeType(updatedType));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If we're not editing, we need to create a new type
    if (!isEditing) {
      dispatch(addEdgeType(type));
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
          {isEditing ? 'Edit Edge Type' : 'Create Edge Type'}
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
                Line Style
              </label>
              <select
                name="lineStyle"
                value={type.lineStyle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Line Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={type.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={type.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thickness
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="thickness"
                  min="1"
                  max="10"
                  value={type.thickness}
                  onChange={handleNumberChange}
                  className="w-full mr-3"
                />
                <input
                  type="number"
                  name="thickness"
                  value={type.thickness}
                  onChange={handleNumberChange}
                  min="1"
                  max="10"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Arrow Style
              </label>
              <select
                name="arrow"
                value={type.arrow}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="none">None</option>
                <option value="triangle">Triangle</option>
                <option value="vee">Vee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Arrow Scale
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="arrowScale"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={type.arrowScale}
                  onChange={handleNumberChange}
                  className="w-full mr-3"
                  disabled={type.arrow === 'none'}
                />
                <input
                  type="number"
                  name="arrowScale"
                  value={type.arrowScale}
                  onChange={handleNumberChange}
                  min="0.5"
                  max="2"
                  step="0.1"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={type.arrow === 'none'}
                />
              </div>
            </div>

            {/* Edge preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preview
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-6 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="w-full flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                  <div
                    className="w-full h-0 relative"
                    style={{
                      borderBottomWidth: `${type.thickness}px`,
                      borderBottomStyle: type.lineStyle as any,
                      borderBottomColor: type.color
                    }}
                  >
                    {type.arrow !== 'none' && (
                      <div
                        className="absolute right-0 top-0"
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: `${6 * type.arrowScale}px solid transparent`,
                          borderBottom: `${6 * type.arrowScale}px solid transparent`,
                          borderLeft: `${12 * type.arrowScale}px solid ${type.color}`,
                          transform: 'translateY(-50%)'
                        }}
                      />
                    )}
                  </div>
                  <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                </div>
              </div>
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

export default EdgeTypeForm;