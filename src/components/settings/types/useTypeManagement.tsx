import { useState } from 'react';
import TypeManagementModal from './TypeManagementModal';
import { useAppDispatch } from '../../../store/hooks';
import { resetNodeTypes, resetEdgeTypes } from '../../../store/slices/typeSlice';

/**
 * Hook for integrating the Type Management UI with the main app
 */
export const useTypeManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  
  const openTypeManagement = () => {
    setIsModalOpen(true);
  };
  
  const closeTypeManagement = () => {
    setIsModalOpen(false);
  };
  
  // Reset all types to defaults
  const resetAllTypes = () => {
    dispatch(resetNodeTypes());
    dispatch(resetEdgeTypes());
  };
  
  // Component to render the modal
  const TypeManagementComponent = () => (
    <TypeManagementModal 
      isOpen={isModalOpen} 
      onClose={closeTypeManagement} 
      onReset={resetAllTypes}
    />
  );
  
  return {
    openTypeManagement,
    closeTypeManagement,
    resetAllTypes,
    TypeManagementComponent
  };
};

export default useTypeManagement;