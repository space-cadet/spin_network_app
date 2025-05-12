import React from 'react';
import { Activity } from 'lucide-react';
import { AppLayout, ResizablePanel } from '@spin-network/template-core';  
import { useTheme, usePanel, usePanelLayout } from '@spin-network/template-core/state';
import { ControlPanel } from './components/panels/ControlPanel';
import { PropertiesPanel } from './components/panels/PropertiesPanel';
import { ConsolePanel } from './components/panels/ConsolePanel';
import { GraphCanvas } from './components/graph/GraphCanvas';
import { BackendSelector } from './components/common/BackendSelector';

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
        size: 150,
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
    <AppLayout
      title="Graph Library Test"
      titleIcon={<Activity className="w-6 h-6" />}
      version="v0.1.0"
      className={theme === 'dark' ? 'dark' : ''}
      navItems={[
        { path: '/', label: 'Graph Test', icon: <Activity className="w-4 h-4" /> }
      ]}
      rightContent={<BackendSelector />}
    >
      <div className="flex h-full">
        {/* Left Panel - Controls */}
        {leftPanel?.isOpen && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={leftPanel?.size || 250}
            minSize={leftPanel?.minSize}
            maxSize={leftPanel?.maxSize}
            className={`${sidebarClasses} border-r border-gray-200`}
            onResize={(size) => updateLeftPanel({ size })}
          >
            <ControlPanel />
          </ResizablePanel>
        )}

        {/* Main Content - Graph Canvas */}
        <div className={`flex-1 relative ${mainClasses}`}>
          <GraphCanvas />
        </div>

        {/* Right Panel - Properties */}
        {rightPanel?.isOpen && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={rightPanel?.size || 300}
            minSize={rightPanel?.minSize}
            maxSize={rightPanel?.maxSize}
            className={`${sidebarClasses} border-l border-gray-200`}
            handlePosition="start"
            onResize={(size) => updateRightPanel({ size })}
          >
            <PropertiesPanel />
          </ResizablePanel>
        )}
      </div>

      {/* Bottom Panel - Console */}
      {bottomPanel?.isOpen && (
        <ResizablePanel
          direction="vertical"
          defaultSize={bottomPanel?.size || 150}
          minSize={bottomPanel?.minSize}
          maxSize={bottomPanel?.maxSize}
          className={`${sidebarClasses} border-t border-gray-200`}
          handlePosition="start"
        >
          <ConsolePanel />
        </ResizablePanel>
      )}
    </AppLayout>
  );
};

export default GraphTestApp;