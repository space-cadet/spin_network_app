import { useSelector } from 'react-redux'
import MainLayout from './components/layouts/MainLayout'
import Workspace from './components/workspace/Workspace'
import NetworkTools from './components/tools/NetworkTools'
import { PropertiesPanel, TypeManagementPanel, SimulationControlPanel } from './components/panels'
import { SimulationResultsPanel, SimulationLogsPanel } from './components/simulation'
import EnergyPlot from './components/visualization/EnergyPlot'
import PersistentResizablePanel from './components/common/PersistentResizablePanel'
import PersistenceStatus from './components/common/PersistenceStatus'
import SidebarToggle from './components/common/SidebarToggle'
import ThemeProvider from './components/settings/ThemeProvider'
import { useState } from 'react'
import { 
  selectLeftSidebarVisible, 
  selectRightSidebarVisible, 
  selectBottomSidebarVisible 
} from './store/selectors'

function App() {
  // Get sidebar visibility state from Redux
  const leftSidebarVisible = useSelector(selectLeftSidebarVisible);
  const rightSidebarVisible = useSelector(selectRightSidebarVisible);
  const bottomSidebarVisible = useSelector(selectBottomSidebarVisible);
  
  // State for bottom panel tabs
  const [bottomPanelTab, setBottomPanelTab] = useState<'results' | 'logs'>('results');
  
  return (
    <ThemeProvider>
      <MainLayout>
        <div className="flex h-full">
        <PersistenceStatus />
          {/* Left Sidebar Toggle (Outside) */}
          {!leftSidebarVisible && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
              <SidebarToggle side="left" isVisible={leftSidebarVisible} />
            </div>
          )}
          
          {/* Left Sidebar - Resizable & Hideable */}
          {leftSidebarVisible && (
            <div className="relative">
              <PersistentResizablePanel 
                direction="horizontal" 
                sidebarKey="left"
                minSize={200} 
                maxSize={400} 
                className="border-r border-gray-200 bg-white overflow-y-auto h-full"
                handlePosition="end"
              >
                <div className="h-full overflow-y-auto">
                  <NetworkTools />
                </div>
              </PersistentResizablePanel>
              <SidebarToggle side="left" isVisible={leftSidebarVisible} />
            </div>
          )}
          
          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            {/* Network Workspace */}
            <div className="flex-1 p-4 overflow-auto">
              <Workspace />
            </div>
            
            {/* Bottom Sidebar Toggle (Outside) */}
            {!bottomSidebarVisible && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
                <SidebarToggle side="bottom" isVisible={bottomSidebarVisible} />
              </div>
            )}
            
            {/* Simulation Results Panel - Resizable & Hideable */}
            {bottomSidebarVisible && (
              <div className="relative">
                <PersistentResizablePanel
                  direction="vertical"
                  sidebarKey="bottom"
                  minSize={150}
                  maxSize={400}
                  className="border-t border-gray-200 bg-white overflow-y-auto h-full"
                  handlePosition="start"
                >
                  <div className="h-full overflow-y-auto">
                    {/* Tabs for Results and Logs */}
                    <div className="border-b border-gray-200">
                      <div className="flex">
                        <button
                          className={`px-4 py-2 text-sm font-medium ${
                            bottomPanelTab === 'results' 
                              ? 'border-b-2 border-blue-500 text-blue-600' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setBottomPanelTab('results')}
                        >
                          Simulation Results
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium ${
                            bottomPanelTab === 'logs' 
                              ? 'border-b-2 border-blue-500 text-blue-600' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setBottomPanelTab('logs')}
                        >
                          Simulation Logs
                        </button>
                      </div>
                    </div>
                    
                    {/* Tab content */}
                    {bottomPanelTab === 'results' ? (
                      <SimulationResultsPanel />
                    ) : (
                      <SimulationLogsPanel />
                    )}
                  </div>
                </PersistentResizablePanel>
                <SidebarToggle side="bottom" isVisible={bottomSidebarVisible} />
              </div>
            )}
          </main>
          
          {/* Right Sidebar Toggle (Outside) */}
          {!rightSidebarVisible && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
              <SidebarToggle side="right" isVisible={rightSidebarVisible} />
            </div>
          )}
          
          {/* Right Sidebar - Resizable & Hideable */}
          {rightSidebarVisible && (
            <div className="relative">
              <PersistentResizablePanel 
                direction="horizontal" 
                sidebarKey="right"
                minSize={250} 
                maxSize={500} 
                className="border-l border-gray-200 bg-white overflow-y-auto h-full"
                handlePosition="start"
              >
                <div className="h-full overflow-y-auto">
                  <PropertiesPanel />
                  <TypeManagementPanel />
                  <SimulationControlPanel />
                </div>
              </PersistentResizablePanel>
              <SidebarToggle side="right" isVisible={rightSidebarVisible} />
            </div>
          )}
        </div>
      </MainLayout>
    </ThemeProvider>
  )
}

export default App
