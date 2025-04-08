import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCopy, FaExclamationTriangle } from 'react-icons/fa';
import EdgeTypeForm from './EdgeTypeForm';
import ConfirmationDialog from '../../common/ConfirmationDialog';

// Temporary type definitions until we implement the actual Redux state
interface EdgeType {
  id: string;
  name: string;
  description: string;
  color: string;
  thickness: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  arrow: 'none' | 'triangle' | 'vee';
  arrowScale: number;
  useCount: number; // Number of edges using this type in the current network
}

const EdgeTypeManager: React.FC = () => {
  // This will be replaced with Redux state in the final implementation
  const [edgeTypes, setEdgeTypes] = useState<EdgeType[]>([
    {
      id: 'regular',
      name: 'Regular Edge',
      description: 'Default edge style',
      color: '#3b82f6',
      thickness: 3,
      lineStyle: 'solid',
      arrow: 'none',
      arrowScale: 1,
      useCount: 15 // Example count
    },
    {
      id: 'dangling',
      name: 'Dangling Edge',
      description: 'Edge with one or both endpoints missing',
      color: '#f97316',
      thickness: 2,
      lineStyle: 'dashed',
      arrow: 'none',
      arrowScale: 1,
      useCount: 3 // Example count
    }
  ]);

  const [selectedType, setSelectedType] = useState<EdgeType | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<EdgeType | null>(null);

  const handleCreateType = () => {
    setSelectedType(null);
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleEditType = (edgeType: EdgeType) => {
    setSelectedType(edgeType);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleDuplicateType = (edgeType: EdgeType) => {
    const newType: EdgeType = {
      ...edgeType,
      id: `${edgeType.id}-copy-${Date.now()}`,
      name: `${edgeType.name} (Copy)`,
      useCount: 0
    };
    setSelectedType(newType);
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleDeleteType = (edgeType: EdgeType) => {
    setTypeToDelete(edgeType);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (typeToDelete) {
      // This will be replaced with a Redux action
      setEdgeTypes(edgeTypes.filter(t => t.id !== typeToDelete.id));
      setShowDeleteConfirmation(false);
      setTypeToDelete(null);
    }
  };

  const handleFormSubmit = (edgeType: EdgeType) => {
    // This will be replaced with Redux actions
    if (isEditing) {
      setEdgeTypes(edgeTypes.map(t => (t.id === edgeType.id ? edgeType : t)));
    } else {
      setEdgeTypes([...edgeTypes, { ...edgeType, useCount: 0 }]);
    }
    setIsFormVisible(false);
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
  };

  const isSystemType = (id: string) => ['regular', 'dangling'].includes(id);

  return (
    <div className="h-full flex flex-col">
      {!isFormVisible ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Edge Types</h3>
            <button
              onClick={handleCreateType}
              className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1 hover:bg-blue-700"
            >
              <FaPlus size={12} /> Create Type
            </button>
          </div>

          <div className="overflow-auto flex-1">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {edgeTypes.map(edgeType => (
                  <tr key={edgeType.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-12 flex items-center">
                        <div
                          className="w-full h-0"
                          style={{
                            borderBottomWidth: `${edgeType.thickness}px`,
                            borderBottomStyle: edgeType.lineStyle as any,
                            borderBottomColor: edgeType.color
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {edgeType.name}
                        {isSystemType(edgeType.id) && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            System
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {edgeType.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {edgeType.useCount} edges
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditType(edgeType)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDuplicateType(edgeType)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Duplicate"
                        >
                          <FaCopy />
                        </button>
                        {!isSystemType(edgeType.id) && (
                          <button
                            onClick={() => handleDeleteType(edgeType)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <EdgeTypeForm
          edgeType={selectedType}
          isEditing={isEditing}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Edge Type"
        message={
          <>
            <FaExclamationTriangle className="text-yellow-500 text-2xl mb-2" />
            <p>
              Are you sure you want to delete the edge type <span className="font-bold">{typeToDelete?.name}</span>?
            </p>
            {(typeToDelete?.useCount || 0) > 0 && (
              <p className="mt-2 text-red-600 dark:text-red-400">
                This type is currently used by {typeToDelete?.useCount} edges in your network.
                Deleting it will reset these edges to the default type.
              </p>
            )}
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirmation(false)}
        isDangerous={true}
      />
    </div>
  );
};

export default EdgeTypeManager;