import { useSelector } from 'react-redux'
import MainLayout from './components/layouts/MainLayout'
import Workspace from './components/workspace/Workspace'
import NetworkTools from './components/tools/NetworkTools'
import PropertiesPanel from './components/panels/PropertiesPanel'
import SimulationControls from './components/simulation/SimulationControls'
import EnergyPlot from './components/visualization/EnergyPlot'
import ResizablePanel from './components/common/ResizablePanel'
import PersistenceStatus from './components/common/PersistenceStatus'
import SidebarToggle from './components/common/SidebarToggle'
import { selectLeftSidebarVisible, selectRightSidebarVisible, selectBottomSidebarVisible } from './store/selectors'

function App() {
  const handleStartSimulation = (params: any) => {
    console.log('Starting simulation with params:', params);
    // This would eventually start a simulation
  };
  
  // Get sidebar visibility state from Redux
  const leftSidebarVisible = useSelector(selectLeftSidebarVisible);
  const rightSidebarVisible = useSelector(selectRightSidebarVisible);
  const bottomSidebarVisible = useSelector(selectBottomSidebarVisible);
  
  return (
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
              <ResizablePanel 
                direction="horizontal" 
                defaultSize={250} 
                minSize={200} 
                maxSize={400} 
                className="border-r border-gray-200 bg-white overflow-y-auto h-full"
                handlePosition="end"
              >
                <div className="p-4 h-full overflow-y-auto">
                  <NetworkTools />
                </div>
              </ResizablePanel>
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
            
            {/* Energy Visualization - Resizable & Hideable */}
            {bottomSidebarVisible && (
              <div className="relative">
                <ResizablePanel
                  direction="vertical"
                  defaultSize={200}
                  minSize={100}
                  maxSize={400}
                  className="border-t border-gray-200 bg-white overflow-y-auto h-full"
                  handlePosition="start"
                >
                  <div className="p-4 h-full overflow-y-auto">
                    <EnergyPlot />
                  </div>
                </ResizablePanel>
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
              <ResizablePanel 
                direction="horizontal" 
                defaultSize={300} 
                minSize={250} 
                maxSize={500} 
                className="border-l border-gray-200 bg-white overflow-y-auto h-full"
                handlePosition="start"
              >
                <div className="h-full overflow-y-auto">
                  <PropertiesPanel />
                  <SimulationControls onStartSimulation={handleStartSimulation} />
                </div>
              </ResizablePanel>
              <SidebarToggle side="right" isVisible={rightSidebarVisible} />
            </div>
          )}
        </div>
      </MainLayout>
  )
}

export default App
