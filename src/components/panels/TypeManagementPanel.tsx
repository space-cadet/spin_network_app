import React, { useState } from 'react';
import { FaUndo } from 'react-icons/fa';
import NodeTypeManager from '../settings/types/NodeTypeManager';
import EdgeTypeManager from '../settings/types/EdgeTypeManager';
import { useAppDispatch } from '../../store/hooks';
import { resetAllTypes } from '../../store/slices/typeSlice';
import CollapsibleSection from '../common/CollapsibleSection';

/**
 * Panel version of the type management UI for the right sidebar
 * The entire panel is collapsible
 */
const TypeManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'node' | 'edge'>('node');
  const dispatch = useAppDispatch();

  const handleResetAllTypes = () => {
    if (confirm('Are you sure you want to reset all types to defaults? This action cannot be undone.')) {
      dispatch(resetAllTypes());
    }
  };

  return (
    <CollapsibleSection
      title="Type Management"
      defaultExpanded={false}
      className="border-b border-gray-200"
      contentClassName="p-4"
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`px-3 py-2 text-sm font-medium ${
            activeTab === 'node'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('node')}
        >
          Node Types
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium ${
            activeTab === 'edge'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('edge')}
        >
          Edge Types
        </button>
      </div>
      
      {/* Type Manager Content */}
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
        {activeTab === 'node' ? (
          <NodeTypeManager />
        ) : (
          <EdgeTypeManager />
        )}
      </div>
      
      {/* Reset Button */}
      <div className="mt-4">
        <button
          onClick={handleResetAllTypes}
          className="px-3 py-1.5 flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <FaUndo size={12} />
          Reset All Types
        </button>
      </div>
    </CollapsibleSection>
  );
};

export default TypeManagementPanel;