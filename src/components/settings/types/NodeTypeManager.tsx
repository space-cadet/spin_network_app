import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCopy, FaExclamationTriangle } from 'react-icons/fa';
import NodeTypeForm from './NodeTypeForm';
import ConfirmationDialog from '../../common/ConfirmationDialog';

// Temporary type definitions until we implement the actual Redux state
interface NodeType {
  id: string;
  name: string;
  description: string;
  color: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  shape: 'ellipse' | 'rectangle' | 'triangle' | 'diamond' | 'hexagon';
  size: number;
  labelPosition: 'center' | 'top' | 'bottom';
  useCount: number; // Number of nodes using this type in the current network
}

const NodeTypeManager: React.FC = () => {
  // This will be replaced with Redux state in the final implementation
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([
    {
      id: 'regular',
      name: 'Regular Node',
      description: 'Default node style',
      color: '#4f46e5',
      borderColor: '#4338ca',
      borderWidth: 2,
      borderStyle: 'solid',
      shape: 'ellipse',
      size: 80,
      labelPosition: 'center',
      useCount: 12 // Example count
    },
    {
      id: 'placeholder',
      name: 'Placeholder Node',
      description: 'Visual indicator for dangling edge endpoints',
      color: '#f97316',
      borderColor: '#fb923c',
      borderWidth: 2,
      borderStyle: 'dashed',
      shape: 'diamond',
      size: 32,
      labelPosition: 'center',
      useCount: 4 // Example count
    }
  ]);

  const [selectedType, setSelectedType] = useState<NodeType | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<NodeType | null>(null);

  const handleCreateType = () => {
    setSelectedType(null);
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleEditType = (nodeType: NodeType) => {
    setSelectedType(nodeType);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleDuplicateType = (nodeType: NodeType) => {
    const newType: NodeType = {
      ...nodeType,
      id: `${nodeType.id}-copy-${Date.now()}`,
      name: `${nodeType.name} (Copy)`,
      useCount: 0
    };
    setSelectedType(newType);
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleDeleteType = (nodeType: NodeType) => {
    setTypeToDelete(nodeType);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (typeToDelete) {
      // This will be replaced with a Redux action
      setNodeTypes(nodeTypes.filter(t => t.id !== typeToDelete.id));
      setShowDeleteConfirmation(false);
      setTypeToDelete(null);
    }
  };

  const handleFormSubmit = (nodeType: NodeType) => {
    // This will be replaced with Redux actions
    if (isEditing) {
      setNodeTypes(nodeTypes.map(t => (t.id === nodeType.id ? nodeType : t)));
    } else {
      setNodeTypes([...nodeTypes, { ...nodeType, useCount: 0 }]);
    }
    setIsFormVisible(false);
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
  };

  const isSystemType = (id: string) => ['regular', 'placeholder'].includes(id);

  return (
    <div className="h-full flex flex-col">
      {!isFormVisible ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Node Types</h3>
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
                {nodeTypes.map(nodeType => (
                  <tr key={nodeType.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div
                        className="w-8 h-8 flex items-center justify-center"
                        style={{
                          backgroundColor: nodeType.color,
                          borderColor: nodeType.borderColor,
                          borderWidth: `${nodeType.borderWidth}px`,
                          borderStyle: nodeType.borderStyle,
                          borderRadius: nodeType.shape === 'ellipse' ? '50%' : 
                                       nodeType.shape === 'rectangle' ? '0' : '25%',
                          transform: nodeType.shape === 'diamond' ? 'rotate(45deg)' : 'none'
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {nodeType.name}
                        {isSystemType(nodeType.id) && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            System
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {nodeType.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {nodeType.useCount} nodes
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditType(nodeType)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDuplicateType(nodeType)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Duplicate"
                        >
                          <FaCopy />
                        </button>
                        {!isSystemType(nodeType.id) && (
                          <button
                            onClick={() => handleDeleteType(nodeType)}
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
        <NodeTypeForm
          nodeType={selectedType}
          isEditing={isEditing}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        title="Delete Node Type"
        message={
          <>
            <FaExclamationTriangle className="text-yellow-500 text-2xl mb-2" />
            <p>
              Are you sure you want to delete the node type <span className="font-bold">{typeToDelete?.name}</span>?
            </p>
            {(typeToDelete?.useCount || 0) > 0 && (
              <p className="mt-2 text-red-600 dark:text-red-400">
                This type is currently used by {typeToDelete?.useCount} nodes in your network.
                Deleting it will reset these nodes to the default type.
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

export default NodeTypeManager;