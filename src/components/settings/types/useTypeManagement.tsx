import { useState } from 'react';
import TypeManagementModal from './TypeManagementModal';

/**
 * Hook for integrating the Type Management UI with the main app
 */
export const useTypeManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openTypeManagement = () => {
    setIsModalOpen(true);
  };
  
  const closeTypeManagement = () => {
    setIsModalOpen(false);
  };
  
  // Component to render the modal
  const TypeManagementComponent = () => (
    <TypeManagementModal 
      isOpen={isModalOpen} 
      onClose={closeTypeManagement}
    />
  );
  
  return {
    openTypeManagement,
    closeTypeManagement,
    TypeManagementComponent
  };
};

export default useTypeManagement;