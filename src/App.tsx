import { useSelector } from 'react-redux'
import { Routes, Route, useLocation } from 'react-router-dom'
import MainLayout from './components/layouts/MainLayout'
import Workspace from './components/workspace/Workspace'
import { LogExplorerPage } from './components/logs/explorer'
import NetworkTools from './components/tools/NetworkTools'
import { PropertiesPanel, TypeManagementPanel, SimulationControlPanel } from './components/panels'
import { SimulationResultsPanel, SimulationLogsPanel, SimulationDebugPanel } from './components/simulation'
import { LogViewerAdapter } from './components/logs'
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
  const [bottomPanelTab, setBottomPanelTab] = useState<'results' | 'logs' | 'debug' | 'application'>('results');
  
  // Get the current location
  const location = useLocation();
  const isExplorerPage = location.pathname === '/explorer';
  
  return (
    <ThemeProvider>
      <MainLayout>
        <Routes>
          <Route path="/explorer" element={<LogExplorerPage />} />
          <Route path="/" element={
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
                    {/* Tabs for Results, Logs, and Debug */}
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
                        <button
                          className={`px-4 py-2 text-sm font-medium ${
                            bottomPanelTab === 'debug' 
                              ? 'border-b-2 border-blue-500 text-blue-600' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setBottomPanelTab('debug')}
                        >
                          Debug Panel
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium ${
                            bottomPanelTab === 'application' 
                              ? 'border-b-2 border-blue-500 text-blue-600' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setBottomPanelTab('application')}
                        >
                          Application Logs
                        </button>
                      </div>
                    </div>
                    
                    {/* Tab content */}
                    {bottomPanelTab === 'results' ? (
                      <SimulationResultsPanel />
                    ) : bottomPanelTab === 'logs' ? (
                      <SimulationLogsPanel />
                    ) : bottomPanelTab === 'application' ? (
                      <div>
                        <div className="flex items-center justify-between p-2 bg-gray-100 mb-3">
                          <h2 className="text-lg">Application Logs</h2>
                          <button 
                            className="px-3 py-1 bg-blue-500 text-white rounded" 
                            onClick={async () => {
                              const { migrateMarkdownLogs } = await import('./utils/logMigrationUtil');
                              if (window.confirm('Run log migration from Markdown files to database?')) {
                                try {
                                  console.log('Starting migration process from public/memory-bank files...');
                                  const result = await migrateMarkdownLogs();
                                  
                                  if (result.success) {
                                    const message = `Migration completed: 
${result.totalLogsMigrated} logs migrated 
(${result.errorLogsMigrated} errors, ${result.editLogsMigrated} edits)
${result.skippedDuplicates || 0} duplicate entries skipped`;
                                    alert(message);
                                    
                                    if (result.totalLogsMigrated > 0) {
                                      window.location.reload();
                                    }
                                  } else {
                                    alert(`Migration failed: ${result.error || 'Unknown error'}`);
                                    console.error('Migration failed with error:', result.error);
                                  }
                                } catch (err) {
                                  const error = err as Error;
                                  alert(`Migration failed with exception: ${error.message}`);
                                  console.error('Migration exception:', error);
                                }
                              }
                            }}
                          >
                            Migrate Logs from Markdown
                          </button>
                        </div>
                        <LogViewerAdapter 
                          defaultLogType={['error', 'edit']}
                          defaultLimit={50}
                          showFilters={true}
                          allowExport={true}
                          height="calc(100vh - 340px)"
                        />
                      </div>
                    ) : (
                      <SimulationDebugPanel />
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
          } />
        </Routes>
      </MainLayout>
    </ThemeProvider>
  )
}

export default App
