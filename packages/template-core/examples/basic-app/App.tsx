import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Home, Settings, Activity, Book, Sun, Moon, PanelLeft, PanelRight, PanelBottomClose } from 'lucide-react';
import { AppLayout, ResizablePanel } from '../../src';
import { useTheme, usePanel, usePanelLayout, useSettings } from '../../src/state';

const ExampleApp: React.FC = () => {
  const [theme, setTheme] = useTheme();
  const { panel: leftPanel, updatePanel: updateLeftPanel } = usePanel('leftSidebar');
  const { panel: rightPanel, updatePanel: updateRightPanel } = usePanel('rightSidebar');
  const { panel: bottomPanel, updatePanel: updateBottomPanel } = usePanel('bottomPanel');
  const { layout, addPanel } = usePanelLayout();
  const { settings, updateSettings } = useSettings();

  // Initialize panels if they don't exist
  useEffect(() => {
    if (!leftPanel) {
      addPanel({
        id: 'leftSidebar',
        isOpen: true,
        size: 250,
        minSize: 200,
        maxSize: 400,
      });
    }
    if (!rightPanel) {
      addPanel({
        id: 'rightSidebar',
        isOpen: true,
        size: 300,
        minSize: 250,
        maxSize: 500,
      });
    }
    if (!bottomPanel) {
      addPanel({
        id: 'bottomPanel',
        isOpen: true,
        size: 200,
        minSize: 100,
        maxSize: 400,
      });
    }
  }, [leftPanel, rightPanel, bottomPanel, addPanel]);

  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { path: '/activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { path: '/docs', label: 'Documentation', icon: <Book className="w-4 h-4" /> },
  ];

  const rightContent = (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="text-white hover:text-primary-100"
        title="Toggle theme"
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
      <button
        onClick={() => updateSettings({ persistLayout: !settings.persistLayout })}
        className="text-white hover:text-primary-100"
        title={`${settings.persistLayout ? 'Disable' : 'Enable'} layout persistence`}
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );

  const mainClasses = theme === 'dark' 
    ? 'bg-gray-800 text-white' 
    : 'bg-white text-gray-900';

  const sidebarClasses = theme === 'dark'
    ? 'bg-gray-900 text-white'
    : 'bg-gray-100 text-gray-900';

  const cardClasses = theme === 'dark'
    ? 'bg-gray-700 shadow-lg'
    : 'bg-white shadow-sm';

  return (
    <Router>
      <AppLayout
        title="Template Demo"
        titleIcon={<Activity className="w-6 h-6" />}
        navItems={navItems}
        rightContent={rightContent}
        version="v1.0.0"
        copyright="© Example Corp, 2025"
        className={theme === 'dark' ? 'dark' : ''}
        footerSize={bottomPanel?.size}
        minFooterSize={bottomPanel?.minSize}
        maxFooterSize={bottomPanel?.maxSize}
        footerContent={
          <div className={`p-4 ${sidebarClasses}`}>
            <h2 className="text-lg font-semibold mb-4">Bottom Panel Content</h2>
            <div className={`p-4 rounded ${cardClasses}`}>
              <h3 className="font-medium mb-2">Panel Size: {bottomPanel?.size}px</h3>
              <p>Try resizing this panel from the top edge</p>
            </div>
          </div>
        }
      >
        <div className="flex h-full">
          {/* Left Sidebar */}
          {leftPanel?.isOpen && (
            <ResizablePanel
              direction="horizontal"
              defaultSize={leftPanel?.size || 250}
              minSize={leftPanel?.minSize}
              maxSize={leftPanel?.maxSize}
              className={`p-4 ${sidebarClasses}`}
              onResize={(size) => updateLeftPanel({ size })}
            >
              <div className="h-full overflow-auto">
                <h2 className="text-lg font-semibold mb-4">State Management Demo</h2>
                <div className={`p-4 mb-4 rounded ${cardClasses}`}>
                  <h3 className="font-medium mb-2">Current State:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>Theme: {theme}</li>
                    <li>Layout Persistence: {settings.persistLayout ? 'On' : 'Off'}</li>
                    <li>Left Panel: {leftPanel?.isOpen ? 'Visible' : 'Hidden'}</li>
                    <li>Right Panel: {rightPanel?.isOpen ? 'Visible' : 'Hidden'}</li>
                    <li>Bottom Panel Size: {bottomPanel?.size}px</li>
                  </ul>
                </div>
              </div>
            </ResizablePanel>
          )}

          {/* Main Content */}
          <div className={`flex-1 p-6 ${mainClasses}`}>
            <div className={`rounded-lg p-6 ${cardClasses}`}>
              <h1 className="text-2xl font-bold mb-4">State Management Features</h1>
              <p className="mb-4">
                This demo shows the state management system in action:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Theme switching (light/dark)</li>
                <li>Panel size persistence</li>
                <li>Layout state management</li>
                <li>Settings persistence</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className={`rounded-lg p-6 ${cardClasses}`}>
                <h2 className="text-xl font-semibold mb-3">Panel Controls</h2>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateLeftPanel({ isOpen: !leftPanel?.isOpen })}
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <PanelLeft className="w-4 h-4" />
                      <span>{leftPanel?.isOpen ? 'Hide' : 'Show'} Left Panel</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateRightPanel({ isOpen: !rightPanel?.isOpen })}
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <PanelRight className="w-4 h-4" />
                      <span>{rightPanel?.isOpen ? 'Hide' : 'Show'} Right Panel</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className={`rounded-lg p-6 ${cardClasses}`}>
                <h2 className="text-xl font-semibold mb-3">Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span>Layout Persistence:</span>
                    <button
                      onClick={() => updateSettings({ persistLayout: !settings.persistLayout })}
                      className={`px-3 py-1 rounded ${
                        settings.persistLayout 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-red-500 hover:bg-red-600'
                      } text-white`}
                    >
                      {settings.persistLayout ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <p className="text-sm">
                    When enabled, panel sizes and positions will be remembered between page reloads.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          {rightPanel?.isOpen && (
            <ResizablePanel
              direction="horizontal"
              defaultSize={rightPanel?.size || 300}
              minSize={rightPanel?.minSize}
              maxSize={rightPanel?.maxSize}
              className={`p-4 ${sidebarClasses}`}
              handlePosition="start"
              onResize={(size) => updateRightPanel({ size })}
            >
              <div className="h-full overflow-auto">
                <h2 className="text-lg font-semibold mb-4">Instructions</h2>
                <div className={`p-4 rounded ${cardClasses}`}>
                  <h3 className="font-medium mb-2">Try These Features:</h3>
                  <ul className="space-y-2">
                    <li>• Click the moon/sun icon to toggle theme</li>
                    <li>• Use the settings icon to toggle persistence</li>
                    <li>• Resize any panel by dragging its edge</li>
                    <li>• Show/hide panels using the buttons</li>
                    <li>• Refresh the page to test persistence</li>
                  </ul>
                </div>
              </div>
            </ResizablePanel>
          )}
        </div>
      </AppLayout>
    </Router>
  );
};

export default ExampleApp;