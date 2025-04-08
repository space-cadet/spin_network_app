import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCopy, FaExclamationTriangle } from 'react-icons/fa';
import EdgeTypeForm from './EdgeTypeForm';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  addEdgeType, 
  updateEdgeType, 
  removeEdgeType,
  resetEdgeTypes 
} from '../../../store/slices/typeSlice';
import { selectAllEdgeTypes } from '../../../store/selectors/typeSelectors';
import { EdgeType, DEFAULT_EDGE_TYPES } from '../../../models/typeModels';

const EdgeTypeManager: React.FC = () => {
  // Connect to Redux store
  const dispatch = useAppDispatch();
  const edgeTypesFromStore = useAppSelector(selectAllEdgeTypes);
  const edgeTypeUsage = useAppSelector(state => state.types.edgeTypeUsage);
  
  // Fix for edgeTypes not being an array
  const [edgeTypes, setEdgeTypes] = useState<EdgeType[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Add type checking and safety
    try {
      if (!edgeTypesFromStore) {
        console.error("edgeTypes is undefined or null, resetting to defaults");
        setError("Edge types data was corrupted. Reset to defaults.");
        setEdgeTypes(DEFAULT_EDGE_TYPES);
        // Reset in the store as well
        dispatch(resetEdgeTypes());
      } else if (!Array.isArray(edgeTypesFromStore)) {
        console.error("edgeTypes is not an array, resetting to defaults", edgeTypesFromStore);
        setError("Edge types data was corrupted. Reset to defaults.");
        setEdgeTypes(DEFAULT_EDGE_TYPES);
        // Reset in the store as well
        dispatch(resetEdgeTypes());
      } else {
        setEdgeTypes(edgeTypesFromStore);
        setError(null);
      }
    } catch (err) {
      console.error("Error processing edgeTypes:", err);
      setError("Error processing edge types data. Reset to defaults.");
      setEdgeTypes(DEFAULT_EDGE_TYPES);
      // Reset in the store as well
      dispatch(resetEdgeTypes());
    }
  }, [edgeTypesFromStore, dispatch]);
  
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
      isSystem: false // Duplicates are never system types
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
      // Dispatch delete action to Redux
      dispatch(removeEdgeType(typeToDelete.id));
      setShowDeleteConfirmation(false);
      setTypeToDelete(null);
    }
  };

  const handleFormSubmit = (edgeType: EdgeType) => {
    // Dispatch appropriate action to Redux
    if (isEditing) {
      dispatch(updateEdgeType(edgeType));
    } else {
      dispatch(addEdgeType(edgeType));
    }
    setIsFormVisible(false);
  };

  const handleFormCancel = () => {
    setIsFormVisible(false);
  };

  const isSystemType = (type: EdgeType) => type.isSystem === true;
  
  // Get usage count for a type
  const getTypeUsage = (typeId: string): number => {
    return edgeTypeUsage[typeId] || 0;
  };

  // Reset to default handler
  const handleResetToDefaults = () => {
    dispatch(resetEdgeTypes());
  };

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleResetToDefaults}
          >
            Reset to defaults
          </button>
        </div>
      )}

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
                {Array.isArray(edgeTypes) && edgeTypes.map(edgeType => (
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
                        {isSystemType(edgeType) && (
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
                      {getTypeUsage(edgeType.id)} edges
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
                        {!isSystemType(edgeType) && (
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
            {typeToDelete && getTypeUsage(typeToDelete.id) > 0 && (
              <p className="mt-2 text-red-600 dark:text-red-400">
                This type is currently used by {getTypeUsage(typeToDelete.id)} edges in your network.
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