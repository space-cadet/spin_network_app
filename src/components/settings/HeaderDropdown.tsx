import React, { useState, useRef, useEffect } from 'react';
import './HeaderMenu.css';

interface HeaderDropdownProps {
  label: string;
  icon: React.ReactNode;
  children: (isOpen: boolean, onClose: () => void) => React.ReactNode;
}

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ label, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <li className="header-dropdown relative" ref={dropdownRef}>
      <button
        className="flex items-center hover:text-primary-100 focus:outline-none"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon}
        <span className="ml-1">{label}</span>
      </button>
      {children(isOpen, handleClose)}
    </li>
  );
};

export default HeaderDropdown;
