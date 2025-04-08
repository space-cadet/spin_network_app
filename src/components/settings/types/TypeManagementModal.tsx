import React, { useState } from 'react';
import { FaChevronLeft, FaTimes, FaUndo } from 'react-icons/fa';
import NodeTypeManager from './NodeTypeManager';
import EdgeTypeManager from './EdgeTypeManager';
import { useAppDispatch } from '../../../store/hooks';
import { resetAllTypes } from '../../../store/slices/typeSlice';

interface TypeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TypeManagementModal: React.FC<TypeManagementModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'node' | 'edge'>('node');
  const dispatch = useAppDispatch();

  const handleResetAllTypes = () => {
    if (confirm('Are you sure you want to reset all types to defaults? This action cannot be undone.')) {
      dispatch(resetAllTypes());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-4/5 max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaChevronLeft />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Type Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'node'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('node')}
          >
            Node Types
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'edge'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('edge')}
          >
            Edge Types
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'node' ? (
            <NodeTypeManager />
          ) : (
            <EdgeTypeManager />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handleResetAllTypes}
            className="px-4 py-2 flex items-center gap-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <FaUndo size={14} />
            Reset All Types
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypeManagementModal;