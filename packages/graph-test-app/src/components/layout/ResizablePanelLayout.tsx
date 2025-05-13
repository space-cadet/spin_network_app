import React from 'react';
import { ResizablePanel } from '@spin-network/template-core';
import { useTheme, usePanel, usePanelLayout } from '@spin-network/template-core/state';

interface ResizablePanelLayoutProps {
  leftPanel: React.ReactNode;
  mainPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  panelPrefix?: string;
}

export const ResizablePanelLayout: React.FC<ResizablePanelLayoutProps> = ({
  leftPanel,
  mainPanel,
  rightPanel,
  panelPrefix = '',
}) => {
  const [theme] = useTheme();
  const { panel: leftPanelState, updatePanel: updateLeftPanel } = usePanel(`${panelPrefix}LeftPanel`);
  const { panel: rightPanelState, updatePanel: updateRightPanel } = usePanel(`${panelPrefix}RightPanel`);
  const { addPanel } = usePanelLayout();

  // Initialize panels if they don't exist
  React.useEffect(() => {
    if (!leftPanelState) {
      addPanel({
        id: `${panelPrefix}LeftPanel`,
        isOpen: true,
        size: 250,
        minSize: 200,
        maxSize: 400,
      });
    }
    if (!rightPanelState) {
      addPanel({
        id: `${panelPrefix}RightPanel`,
        isOpen: true,
        size: 300,
        minSize: 250,
        maxSize: 500,
      });
    }
  }, [leftPanelState, rightPanelState, addPanel, panelPrefix]);

  const mainClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white' 
    : 'bg-white text-gray-900';

  const sidebarClasses = theme === 'dark'
    ? 'bg-gray-800 text-white'
    : 'bg-gray-50 text-gray-900';

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      {leftPanelState?.isOpen && (
        <ResizablePanel
          direction="horizontal"
          defaultSize={leftPanelState?.size || 250}
          minSize={leftPanelState?.minSize}
          maxSize={leftPanelState?.maxSize}
          className={`${sidebarClasses} border-r border-gray-200`}
          onResize={(size) => updateLeftPanel({ size })}
        >
          {leftPanel}
        </ResizablePanel>
      )}

      {/* Main Content */}
      <div className={`flex-1 relative ${mainClasses}`}>
        {mainPanel}
      </div>

      {/* Right Panel */}
      {rightPanelState?.isOpen && (
        <ResizablePanel
          direction="horizontal"
          defaultSize={rightPanelState?.size || 300}
          minSize={rightPanelState?.minSize}
          maxSize={rightPanelState?.maxSize}
          className={`${sidebarClasses} border-l border-gray-200`}
          handlePosition="start"
          onResize={(size) => updateRightPanel({ size })}
        >
          {rightPanel}
        </ResizablePanel>
      )}
    </div>
  );
};