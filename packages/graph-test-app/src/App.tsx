import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { AppLayout, ResizablePanel } from '@spin-network/template-core';  
import { useTheme, usePanel, usePanelLayout } from '@spin-network/template-core/state';

const GraphTestApp: React.FC = () => {
  const [theme] = useTheme();
  const { panel: leftPanel, updatePanel: updateLeftPanel } = usePanel('leftSidebar');
  const { panel: rightPanel, updatePanel: updateRightPanel } = usePanel('rightSidebar');
  const { panel: bottomPanel, updatePanel: updateBottomPanel } = usePanel('bottomPanel');
  const { addPanel } = usePanelLayout();

  // Initialize panels if they don't exist
  React.useEffect(() => {
    if (!leftPanel) {
      addPanel({
        id: 'leftSidebar',
        isOpen: true,
        size: 300,
        minSize: 200,
        maxSize: 400,
      });
    }
    if (!rightPanel) {
      addPanel({
        id: 'rightSidebar',
        isOpen: true,
        size: 350,
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

  const mainClasses = theme === 'dark' 
    ? 'bg-gray-800 text-white' 
    : 'bg-white text-gray-900';

  const sidebarClasses = theme === 'dark'
    ? 'bg-gray-900 text-white'
    : 'bg-gray-100 text-gray-900';

  return (
    <Router>
      <AppLayout
        title="Graph Library Test"
        titleIcon={<Activity className="w-6 h-6" />}
        version="v0.1.0"
        className={theme === 'dark' ? 'dark' : ''}
      >
        <div className="flex h-full">
          {/* Left Panel - Controls */}
          {leftPanel?.isOpen && (
            <ResizablePanel
              direction="horizontal"
              defaultSize={leftPanel?.size || 300}
              minSize={leftPanel?.minSize}
              maxSize={leftPanel?.maxSize}
              className={`p-4 ${sidebarClasses}`}
              onResize={(size) => updateLeftPanel({ size })}
            >
              {/* ControlPanel will go here */}
              <div>Control Panel</div>
            </ResizablePanel>
          )}

          {/* Main Content - Graph Canvas */}
          <div className={`flex-1 p-6 ${mainClasses}`}>
            {/* GraphCanvas will go here */}
            <div>Graph Canvas</div>
          </div>

          {/* Right Panel - Metrics */}
          {rightPanel?.isOpen && (
            <ResizablePanel
              direction="horizontal"
              defaultSize={rightPanel?.size || 350}
              minSize={rightPanel?.minSize}
              maxSize={rightPanel?.maxSize}
              className={`p-4 ${sidebarClasses}`}
              handlePosition="start"
              onResize={(size) => updateRightPanel({ size })}
            >
              {/* MetricsPanel will go here */}
              <div>Metrics Panel</div>
            </ResizablePanel>
          )}
        </div>
      </AppLayout>
    </Router>
  );
};

export default GraphTestApp;