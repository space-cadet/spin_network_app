import React from 'react';
import { FlaskConical, Activity } from 'lucide-react';
import { AppLayout, ResizablePanel } from '@spin-network/template-core';  
import { useTheme, usePanel, usePanelLayout } from '@spin-network/template-core/state';
import { QuantumStatePanel } from '../components/quantum/panels/QuantumStatePanel';
import { QuantumControlPanel } from '../components/quantum/panels/QuantumControlPanel';
import { QuantumInfoPanel } from '../components/quantum/panels/QuantumInfoPanel';

const QuantumPage: React.FC = () => {
  const [theme] = useTheme();
  const { panel: leftPanel, updatePanel: updateLeftPanel } = usePanel('quantumLeftPanel');
  const { panel: rightPanel, updatePanel: updateRightPanel } = usePanel('quantumRightPanel');
  const { panel: bottomPanel, updatePanel: updateBottomPanel } = usePanel('quantumBottomPanel');
  const { addPanel } = usePanelLayout();

  // Initialize panels if they don't exist
  React.useEffect(() => {
    if (!leftPanel) {
      addPanel({
        id: 'quantumLeftPanel',
        isOpen: true,
        size: 250,
        minSize: 200,
        maxSize: 400,
      });
    }
    if (!rightPanel) {
      addPanel({
        id: 'quantumRightPanel',
        isOpen: true,
        size: 300,
        minSize: 250,
        maxSize: 500,
      });
    }
    if (!bottomPanel) {
      addPanel({
        id: 'quantumBottomPanel',
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
      title="Quantum Module Demo"
      titleIcon={<FlaskConical className="w-6 h-6" />}
      version="v0.1.0"
      className={theme === 'dark' ? 'dark' : ''}
      navItems={[
        { path: '/', label: 'Graph Test', icon: <Activity className="w-4 h-4" /> },
        { path: '/quantum', label: 'Quantum Demo', icon: <FlaskConical className="w-4 h-4" /> }
      ]}
      headerContent={
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-blue-600 text-white">
            <Activity className="w-4 h-4" />
            <span>Graph</span>
          </a>
          <a href="/quantum" className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-blue-600 bg-blue-500 text-white">
            <FlaskConical className="w-4 h-4" />
            <span>Quantum</span>
          </a>
        </div>
      }
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
            <QuantumControlPanel />
          </ResizablePanel>
        )}

        {/* Main Content - Quantum State Visualization */}
        <div className={`flex-1 relative ${mainClasses}`}>
          <QuantumStatePanel />
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
            <QuantumInfoPanel />
          </ResizablePanel>
        )}
      </div>
    </AppLayout>
  );
};

export default QuantumPage;