import { useState } from 'react'
import MainLayout from './components/layouts/MainLayout'
import Workspace from './components/workspace/Workspace'
import NetworkTools from './components/tools/NetworkTools'
import PropertiesPanel from './components/panels/PropertiesPanel'
import SimulationControls from './components/simulation/SimulationControls'
import EnergyPlot from './components/visualization/EnergyPlot'
import ResizablePanel from './components/common/ResizablePanel'

function App() {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  
  // Mock handlers - no real functionality yet
  const handleElementSelect = (element: any) => {
    setSelectedElement(element);
  };
  
  const handleCreateNetwork = (type: string) => {
    console.log(`Creating network of type: ${type}`);
    // This would eventually create a new network
  };
  
  const handleStartSimulation = (params: any) => {
    console.log('Starting simulation with params:', params);
    // This would eventually start a simulation
  };
  
  return (
    <MainLayout>
      <div className="flex h-full">
        {/* Left Sidebar - Resizable */}
        <ResizablePanel 
          direction="horizontal" 
          defaultSize={250} 
          minSize={200} 
          maxSize={400} 
          className="border-r border-gray-200 bg-white overflow-y-auto"
          handlePosition="end"
        >
          <div className="p-4 h-full">
            <NetworkTools onCreateNetwork={handleCreateNetwork} />
          </div>
        </ResizablePanel>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Network Workspace */}
          <div className="flex-1 p-4 overflow-auto">
            <Workspace onElementSelect={handleElementSelect} />
          </div>
          
          {/* Energy Visualization - Resizable */}
          <ResizablePanel
            direction="vertical"
            defaultSize={200}
            minSize={100}
            maxSize={400}
            className="border-t border-gray-200 bg-white overflow-y-auto"
            handlePosition="start"
          >
            <div className="p-4 h-full">
              <EnergyPlot />
            </div>
          </ResizablePanel>
        </main>
        
        {/* Right Sidebar - Resizable */}
        <ResizablePanel 
          direction="horizontal" 
          defaultSize={300} 
          minSize={250} 
          maxSize={500} 
          className="border-l border-gray-200 bg-white overflow-y-auto"
          handlePosition="start"
        >
          <div className="h-full">
            <PropertiesPanel selectedElement={selectedElement} />
            <SimulationControls onStartSimulation={handleStartSimulation} />
          </div>
        </ResizablePanel>
      </div>
    </MainLayout>
  )
}

export default App
