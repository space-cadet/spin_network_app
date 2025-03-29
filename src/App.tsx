import { useState } from 'react'
import MainLayout from './components/layouts/MainLayout'
import Workspace from './components/workspace/Workspace'
import NetworkTools from './components/tools/NetworkTools'
import PropertiesPanel from './components/panels/PropertiesPanel'
import SimulationControls from './components/simulation/SimulationControls'
import EnergyPlot from './components/visualization/EnergyPlot'

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
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-gray-200 bg-white p-4 overflow-y-auto flex-shrink-0">
          <NetworkTools onCreateNetwork={handleCreateNetwork} />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 overflow-auto flex flex-col">
          {/* Network Workspace */}
          <div className="flex-1">
            <Workspace onElementSelect={handleElementSelect} />
          </div>
          
          {/* Energy Visualization */}
          <div className="h-64 mt-4">
            <EnergyPlot />
          </div>
        </main>
        
        {/* Right Sidebar */}
        <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          <PropertiesPanel selectedElement={selectedElement} />
          <SimulationControls onStartSimulation={handleStartSimulation} />
        </aside>
      </div>
    </MainLayout>
  )
}

export default App
