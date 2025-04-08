import React, { useState, useRef, useEffect } from 'react';
import './HeaderMenu.css';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  FaCog,
  FaEye,
  FaTh,
  FaPalette,
  FaTachometerAlt,
  FaKeyboard,
  FaFileExport,
  FaUndo,
  FaChevronRight,
  FaCheck,
  FaTags
} from 'react-icons/fa';
import { 
  toggleSidebar,
  setSidebarSize,
  setViewSettings,
  setTheme,
  setPerformanceSettings,
  resetAllSettings
} from '../../store/slices/uiSlice';
import { 
  selectTheme, 
  selectViewSettings, 
  selectPerformanceSettings,
  selectLeftSidebarVisible,
  selectRightSidebarVisible,
  selectBottomSidebarVisible
} from '../../store/selectors';

interface SettingsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTypeManagement?: () => void;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ isOpen, onClose, onOpenTypeManagement }) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const viewSettings = useAppSelector(selectViewSettings);
  const performanceSettings = useAppSelector(selectPerformanceSettings);
  const leftSidebarVisible = useAppSelector(selectLeftSidebarVisible);
  const rightSidebarVisible = useAppSelector(selectRightSidebarVisible);
  const bottomSidebarVisible = useAppSelector(selectBottomSidebarVisible);

  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle submenu navigation
  const handleSubmenuClick = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(newTheme));
  };

  // Handle panel layout change
  const handlePanelLayoutChange = (layout: 'default' | 'maximized' | 'analysis' | 'compact') => {
    // Default layout
    if (layout === 'default') {
      dispatch(toggleSidebar({ side: 'left', visible: true }));
      dispatch(toggleSidebar({ side: 'right', visible: true }));
      dispatch(toggleSidebar({ side: 'bottom', visible: true }));
      dispatch(setSidebarSize({ side: 'left', size: 250 }));
      dispatch(setSidebarSize({ side: 'right', size: 300 }));
      dispatch(setSidebarSize({ side: 'bottom', size: 150 }));
    }
    // Maximized visualization
    else if (layout === 'maximized') {
      dispatch(toggleSidebar({ side: 'left', visible: false }));
      dispatch(toggleSidebar({ side: 'right', visible: false }));
      dispatch(toggleSidebar({ side: 'bottom', visible: false }));
    }
    // Analysis focus (larger bottom panel)
    else if (layout === 'analysis') {
      dispatch(toggleSidebar({ side: 'left', visible: true }));
      dispatch(toggleSidebar({ side: 'right', visible: true }));
      dispatch(toggleSidebar({ side: 'bottom', visible: true }));
      dispatch(setSidebarSize({ side: 'bottom', size: 300 }));
    }
    // Compact tools
    else if (layout === 'compact') {
      dispatch(toggleSidebar({ side: 'left', visible: true }));
      dispatch(toggleSidebar({ side: 'right', visible: true }));
      dispatch(toggleSidebar({ side: 'bottom', visible: true }));
      dispatch(setSidebarSize({ side: 'left', size: 200 }));
      dispatch(setSidebarSize({ side: 'right', size: 200 }));
    }
  };

  // Handle view settings change
  const handleViewSettingChange = (setting: string, value: any) => {
    dispatch(setViewSettings({ ...viewSettings, [setting]: value }));
  };

  // Handle performance settings change
  const handlePerformanceSettingChange = (setting: string, value: any) => {
    dispatch(setPerformanceSettings({ ...performanceSettings, [setting]: value }));
  };

  // Handle reset all settings
  const handleResetAllSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to their default values?')) {
      dispatch(resetAllSettings());
      onClose();
    }
  };

  // If the dropdown is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="header-dropdown-menu"
    >
      {/* Main Menu */}
      {activeSubmenu === null && (
        <ul>
          <li>
            <button
              className="menu-item"
              onClick={() => handleSubmenuClick('viewSettings')}
            >
              <FaEye className="icon text-gray-600" />
              <span className="menu-label">View Settings</span>
              <FaChevronRight className="menu-arrow text-gray-500" size={12} />
            </button>
          </li>
          <li>
            <button
              className="menu-item"
              onClick={() => handleSubmenuClick('panelLayout')}
            >
              <FaTh className="icon text-gray-600" />
              <span className="menu-label">Panel Layout</span>
              <FaChevronRight className="menu-arrow text-gray-500" size={12} />
            </button>
          </li>
          <li>
            <button
              className="menu-item"
              onClick={() => handleSubmenuClick('theme')}
            >
              <FaPalette className="icon text-gray-600" />
              <span className="menu-label">Theme</span>
              <FaChevronRight className="menu-arrow text-gray-500" size={12} />
            </button>
          </li>
          <li>
            <button
              className="menu-item"
              onClick={() => handleSubmenuClick('performance')}
            >
              <FaTachometerAlt className="icon text-gray-600" />
              <span className="menu-label">Performance</span>
              <FaChevronRight className="menu-arrow text-gray-500" size={12} />
            </button>
          </li>
          <li>
            <button
              className="menu-item"
              onClick={() => handleSubmenuClick('keyboardShortcuts')}
            >
              <FaKeyboard className="icon text-gray-600" />
              <span className="menu-label">Keyboard Shortcuts</span>
              <FaChevronRight className="menu-arrow text-gray-500" size={12} />
            </button>
          </li>
          <li>
            <button
              className="menu-item"
              onClick={onOpenTypeManagement}
            >
              <FaTags className="icon text-gray-600" />
              <span className="menu-label">Manage Types</span>
              <FaChevronRight className="menu-arrow text-gray-500" size={12} />
            </button>
          </li>
          <li>
            <button
              className="menu-item"
              onClick={() => handleSubmenuClick('exportPreferences')}
            >
              <FaFileExport className="icon text-gray-600" />
              <span className="menu-label">Export Preferences</span>
              <FaChevronRight className="menu-arrow text-gray-500" size={12} />
            </button>
          </li>
          <div className="menu-divider"></div>
          <li>
            <button
              className="menu-item text-red-600"
              onClick={handleResetAllSettings}
            >
              <FaUndo className="icon" />
              <span className="menu-label">Reset All Settings</span>
            </button>
          </li>
        </ul>
      )}

      {/* View Settings Submenu */}
      {activeSubmenu === 'viewSettings' && (
        <div>
          <div className="submenu-header">
            <button
              className="back-button text-gray-600 hover:text-gray-900"
              onClick={() => setActiveSubmenu(null)}
            >
              ←
            </button>
            <h3 className="title">View Settings</h3>
          </div>
          <ul className="submenu-content">
            <li>
              <div className="menu-item">
                <span className="menu-label">Show Node Labels</span>
                <input
                  type="checkbox"
                  checked={viewSettings?.showNodeLabels ?? true}
                  onChange={(e) => handleViewSettingChange('showNodeLabels', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary"
                />
              </div>
            </li>
            <li>
              <div className="menu-item">
                <span className="menu-label">Show Edge Labels</span>
                <input
                  type="checkbox"
                  checked={viewSettings?.showEdgeLabels ?? false}
                  onChange={(e) => handleViewSettingChange('showEdgeLabels', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary"
                />
              </div>
            </li>
            <li>
              <div className="menu-item">
                <span className="menu-label">Show Grid</span>
                <input
                  type="checkbox"
                  checked={viewSettings?.showGrid ?? false}
                  onChange={(e) => handleViewSettingChange('showGrid', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary"
                />
              </div>
            </li>
            <li>
              <div className="menu-item flex-col items-start">
                <span className="menu-label mb-1">Node Size</span>
                <select
                  value={viewSettings?.nodeSize ?? 'medium'}
                  onChange={(e) => handleViewSettingChange('nodeSize', e.target.value)}
                  className="form-select block w-full text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </li>
            <li>
              <div className="menu-item flex-col items-start">
                <span className="menu-label mb-1">Edge Thickness</span>
                <select
                  value={viewSettings?.edgeThickness ?? 'medium'}
                  onChange={(e) => handleViewSettingChange('edgeThickness', e.target.value)}
                  className="form-select block w-full text-sm"
                >
                  <option value="thin">Thin</option>
                  <option value="medium">Medium</option>
                  <option value="thick">Thick</option>
                </select>
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Panel Layout Submenu */}
      {activeSubmenu === 'panelLayout' && (
        <div>
          <div className="submenu-header">
            <button
              className="back-button text-gray-600 hover:text-gray-900"
              onClick={() => setActiveSubmenu(null)}
            >
              ←
            </button>
            <h3 className="title">Panel Layout</h3>
          </div>
          <ul className="submenu-content">
            <li>
              <button
                className="menu-item justify-between"
                onClick={() => handlePanelLayoutChange('default')}
              >
                <span className="menu-label">Default Layout</span>
                {leftSidebarVisible && rightSidebarVisible && bottomSidebarVisible && (
                  <FaCheck className="text-green-500" />
                )}
              </button>
            </li>
            <li>
              <button
                className="menu-item justify-between"
                onClick={() => handlePanelLayoutChange('maximized')}
              >
                <span className="menu-label">Maximized Visualization</span>
                {!leftSidebarVisible && !rightSidebarVisible && !bottomSidebarVisible && (
                  <FaCheck className="text-green-500" />
                )}
              </button>
            </li>
            <li>
              <button
                className="menu-item"
                onClick={() => handlePanelLayoutChange('analysis')}
              >
                <span className="menu-label">Analysis Focus</span>
              </button>
            </li>
            <li>
              <button
                className="menu-item"
                onClick={() => handlePanelLayoutChange('compact')}
              >
                <span className="menu-label">Compact Tools</span>
              </button>
            </li>
            <div className="menu-divider"></div>
            <li>
              <div className="menu-item flex-col items-start">
                <h4 className="font-medium text-sm mb-2 text-gray-900 w-full">Individual Panels</h4>
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span>Left Panel</span>
                    <input
                      type="checkbox"
                      checked={leftSidebarVisible}
                      onChange={() => dispatch(toggleSidebar({ side: 'left', visible: !leftSidebarVisible }))}
                      className="form-checkbox h-4 w-4 text-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span>Right Panel</span>
                    <input
                      type="checkbox"
                      checked={rightSidebarVisible}
                      onChange={() => dispatch(toggleSidebar({ side: 'right', visible: !rightSidebarVisible }))}
                      className="form-checkbox h-4 w-4 text-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span>Bottom Panel</span>
                    <input
                      type="checkbox"
                      checked={bottomSidebarVisible}
                      onChange={() => dispatch(toggleSidebar({ side: 'bottom', visible: !bottomSidebarVisible }))}
                      className="form-checkbox h-4 w-4 text-primary"
                    />
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Theme Submenu */}
      {activeSubmenu === 'theme' && (
        <div>
          <div className="submenu-header">
            <button
              className="back-button text-gray-600 hover:text-gray-900"
              onClick={() => setActiveSubmenu(null)}
            >
              ←
            </button>
            <h3 className="title">Theme</h3>
          </div>
          <ul className="submenu-content">
            <li>
              <button
                className="menu-item justify-between"
                onClick={() => handleThemeChange('light')}
              >
                <span className="menu-label">Light Mode</span>
                {theme === 'light' && <FaCheck className="text-green-500" />}
              </button>
            </li>
            <li>
              <button
                className="menu-item justify-between"
                onClick={() => handleThemeChange('dark')}
              >
                <span className="menu-label">Dark Mode</span>
                {theme === 'dark' && <FaCheck className="text-green-500" />}
              </button>
            </li>
            <li>
              <button
                className="menu-item justify-between"
                onClick={() => handleThemeChange('system')}
              >
                <span className="menu-label">System Default</span>
                {theme === 'system' && <FaCheck className="text-green-500" />}
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Performance Submenu */}
      {activeSubmenu === 'performance' && (
        <div>
          <div className="submenu-header">
            <button
              className="back-button text-gray-600 hover:text-gray-900"
              onClick={() => setActiveSubmenu(null)}
            >
              ←
            </button>
            <h3 className="title">Performance</h3>
          </div>
          <ul className="submenu-content">
            <li>
              <div className="menu-item flex-col items-start">
                <span className="menu-label mb-1">Rendering Quality</span>
                <select
                  value={performanceSettings?.renderingQuality ?? 'high'}
                  onChange={(e) => handlePerformanceSettingChange('renderingQuality', e.target.value)}
                  className="form-select block w-full text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </li>
            <li>
              <div className="menu-item flex-col items-start">
                <span className="menu-label mb-1">Animation Smoothness</span>
                <select
                  value={performanceSettings?.animationSmoothness ?? 'medium'}
                  onChange={(e) => handlePerformanceSettingChange('animationSmoothness', e.target.value)}
                  className="form-select block w-full text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </li>
            <li>
              <div className="menu-item justify-between">
                <span className="menu-label">Auto-Simplify Large Networks</span>
                <input
                  type="checkbox"
                  checked={performanceSettings?.autoSimplify ?? true}
                  onChange={(e) => handlePerformanceSettingChange('autoSimplify', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary"
                />
              </div>
            </li>
            <li>
              <div className="menu-item justify-between">
                <span className="menu-label">Hardware Acceleration</span>
                <input
                  type="checkbox"
                  checked={performanceSettings?.hardwareAcceleration ?? true}
                  onChange={(e) => handlePerformanceSettingChange('hardwareAcceleration', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary"
                />
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Keyboard Shortcuts Submenu */}
      {activeSubmenu === 'keyboardShortcuts' && (
        <div>
          <div className="submenu-header">
            <button
              className="back-button text-gray-600 hover:text-gray-900"
              onClick={() => setActiveSubmenu(null)}
            >
              ←
            </button>
            <h3 className="title">Keyboard Shortcuts</h3>
          </div>
          <div className="submenu-content p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 pr-4 font-medium">Ctrl + Z</td>
                  <td>Undo</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">Ctrl + Y</td>
                  <td>Redo</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">Ctrl + S</td>
                  <td>Save Network</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">Ctrl + O</td>
                  <td>Open Network</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">Delete</td>
                  <td>Delete Selected Element</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">Esc</td>
                  <td>Cancel Current Operation</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">Space</td>
                  <td>Toggle Play/Pause Simulation</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">F</td>
                  <td>Fit Network to Screen</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">1</td>
                  <td>Switch to Select Mode</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">2</td>
                  <td>Switch to Add Node Mode</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">3</td>
                  <td>Switch to Add Edge Mode</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 font-medium">4</td>
                  <td>Switch to Delete Mode</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Preferences Submenu */}
      {activeSubmenu === 'exportPreferences' && (
        <div>
          <div className="submenu-header">
            <button
              className="back-button text-gray-600 hover:text-gray-900"
              onClick={() => setActiveSubmenu(null)}
            >
              ←
            </button>
            <h3 className="title">Export Preferences</h3>
          </div>
          <ul className="submenu-content">
            <li>
              <div className="menu-item flex-col items-start">
                <span className="menu-label mb-1">Default File Format</span>
                <select
                  className="form-select block w-full text-sm"
                >
                  <option value="json">JSON</option>
                  <option value="png">PNG Image</option>
                  <option value="svg">SVG Image</option>
                  <option value="csv">CSV Data</option>
                </select>
              </div>
            </li>
            <li>
              <div className="menu-item justify-between">
                <span className="menu-label">Include Metadata</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="form-checkbox h-4 w-4 text-primary"
                />
              </div>
            </li>
            <li>
              <div className="menu-item justify-between">
                <span className="menu-label">Include History State</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="form-checkbox h-4 w-4 text-primary"
                />
              </div>
            </li>
            <li>
              <div className="menu-item justify-between">
                <span className="menu-label">Pretty Print JSON</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="form-checkbox h-4 w-4 text-primary"
                />
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
