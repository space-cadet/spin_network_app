import React, { useState } from 'react';
import { FaCog } from 'react-icons/fa';
import SettingsDropdown from './SettingsDropdown';
import { useTypeManagement } from './types';

/**
 * Main settings component that includes both the dropdown and type management modal
 */
const Settings: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { openTypeManagement, TypeManagementComponent } = useTypeManagement();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleOpenTypeManagement = () => {
    closeDropdown();
    openTypeManagement();
  };

  return (
    <>
      <button
        onClick={toggleDropdown}
        className="flex items-center hover:text-primary-100"
        title="Settings"
      >
        <FaCog className="text-white" />
        <span className="text-white ml-1">Settings</span>
      </button>

      <SettingsDropdown
        isOpen={isDropdownOpen}
        onClose={closeDropdown}
        onOpenTypeManagement={handleOpenTypeManagement}
      />

      <TypeManagementComponent />
    </>
  );
};

export default Settings;