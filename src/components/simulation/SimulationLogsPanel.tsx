import React, { useState, useEffect } from 'react';
import { FaList, FaClock, FaDownload, FaTrash, FaSearch } from 'react-icons/fa';
import CollapsibleSection from '../common/CollapsibleSection';
import { simulationLogger, SimulationSessionLog, LogEntry, LogLevel } from '../../simulation/core/simulationLogger';
import { useSimulation } from '../../hooks/useSimulation';

interface LogEntryItemProps {
  entry: LogEntry;
}

const LogEntryItem: React.FC<LogEntryItemProps> = ({ entry }) => {
  const { level, message, timestamp, simTime } = entry;
  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString();
  
  let bgColor = 'bg-gray-50';
  let textColor = 'text-gray-700';
  
  if (level === 'error') {
    bgColor = 'bg-red-50';
    textColor = 'text-red-700';
  } else if (level === 'warning') {
    bgColor = 'bg-yellow-50';
    textColor = 'text-yellow-700';
  } else if (level === 'debug') {
    bgColor = 'bg-purple-50';
    textColor = 'text-purple-700';
  }
  
  return (
    <div className={`${bgColor} p-2 rounded mb-1 text-sm`}>
      <div className="flex justify-between">
        <span className={`font-medium ${textColor}`}>{level.toUpperCase()}</span>
        <div className="space-x-2 text-xs text-gray-500">
          {simTime !== undefined && <span>t={simTime.toFixed(2)}</span>}
          <span>{timeStr}</span>
        </div>
      </div>
      <p className="mt-1">{message}</p>
    </div>
  );
};

interface SessionItemProps {
  session: SimulationSessionLog;
  isActive: boolean;
  onClick: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({ session, isActive, onClick }) => {
  const startDate = new Date(session.startTime);
  const { networkInfo, parameters } = session;
  
  // Calculate duration
  const endTime = session.endTime || Date.now();
  const durationMs = endTime - session.startTime;
  const durationSec = Math.floor(durationMs / 1000);
  const durationMin = Math.floor(durationSec / 60);
  const durationStr = durationMin > 0 
    ? `${durationMin}m ${durationSec % 60}s`
    : `${durationSec}s`;
  
  return (
    <div 
      className={`border rounded p-3 mb-2 cursor-pointer hover:border-blue-300 transition-colors ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">
            {networkInfo.name || `Network (${networkInfo.nodeCount} nodes)`}
          </h4>
          <p className="text-xs text-gray-500">
            {startDate.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {durationStr}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            {session.logs.length} events
          </p>
        </div>
      </div>
      <div className="mt-2 text-xs">
        <p className="text-gray-600">
          {networkInfo.type && <span>{networkInfo.type} • </span>}
          {parameters.diffusionType === 'ordinary' ? 'Ordinary Diffusion' : 'Telegraph Diffusion'} • 
          α={parameters.alpha?.toFixed(2) || '?'}
          {parameters.diffusionType === 'telegraph' && ` • β=${parameters.beta?.toFixed(2) || '?'}`}
        </p>
      </div>
    </div>
  );
};

const SimulationLogsPanel: React.FC = () => {
  // Access the simulation
  const simulation = useSimulation();
  const isRunning = simulation.isRunning;
  
  // State
  const [sessions, setSessions] = useState<SimulationSessionLog[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SimulationSessionLog | null>(null);
  const [filterText, setFilterText] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | LogLevel>('all');
  
  // Load sessions on mount and when running status changes
  useEffect(() => {
    const loadSessions = () => {
      // Get all the sessions and current session
      const allSessions = simulationLogger.getAllSessions();
      const currentSession = simulationLogger.getCurrentSession();
      
      // Combine current and past sessions
      const combinedSessions = [...(currentSession ? [currentSession] : []), ...allSessions];
      
      // Update the sessions list
      setSessions(combinedSessions);
      
      // Select the current session if available, or keep the currently selected one
      if (currentSession && !selectedSession) {
        setCurrentSessionId(currentSession.id);
        setSelectedSession(currentSession);
      }
    };
    
    // Load sessions initially and when running state changes
    loadSessions();
    
    // Also load sessions when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSessions();
      }
    };
    
    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, selectedSession]);
  
  // Auto-refresh when running
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      const currentSession = simulationLogger.getCurrentSession();
      if (currentSession) {
        // Update sessions list
        setSessions(prev => {
          const newSessions = [...prev];
          const index = newSessions.findIndex(s => s.id === currentSession.id);
          if (index >= 0) {
            newSessions[index] = currentSession;
          } else {
            newSessions.unshift(currentSession);
          }
          return newSessions;
        });
        
        // Update selected session if it's the current one
        if (selectedSession?.id === currentSession.id) {
          setSelectedSession(currentSession);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, selectedSession]);
  
  // Filter logs
  const filteredLogs = selectedSession?.logs.filter(log => {
    // Filter by level
    if (filterLevel !== 'all' && log.level !== filterLevel) {
      return false;
    }
    
    // Filter by text
    if (filterText) {
      return log.message.toLowerCase().includes(filterText.toLowerCase());
    }
    
    return true;
  }) || [];
  
  // Handle session selection
  const handleSelectSession = (session: SimulationSessionLog) => {
    setSelectedSession(session);
    setCurrentSessionId(session.id);
  };
  
  // Handle exporting both configuration and results
  const handleExportData = () => {
    if (!selectedSession) return;
    
    try {
      // Get configuration JSON without results data
      const configJson = simulationLogger.exportSessionConfigToJson(selectedSession.id);
      const configBlob = new Blob([configJson], { type: 'application/json' });
      const configUrl = URL.createObjectURL(configBlob);
      
      // Get results CSV
      const resultsCSV = simulationLogger.exportSessionResultsToCsv(selectedSession.id);
      const csvBlob = new Blob([resultsCSV], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvBlob);
      
      // Create and click temporary links to download both files
      const configLink = document.createElement('a');
      configLink.href = configUrl;
      configLink.download = `simulation-config-${selectedSession.id}.json`;
      
      const csvLink = document.createElement('a');
      csvLink.href = csvUrl;
      csvLink.download = `simulation-results-${selectedSession.id}.csv`;
      
      // Append temporarily to body, click, and remove
      document.body.appendChild(configLink);
      document.body.appendChild(csvLink);
      
      // Download both files
      configLink.click();
      setTimeout(() => csvLink.click(), 100); // Small delay to prevent browser issues
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(configLink);
        document.body.removeChild(csvLink);
        URL.revokeObjectURL(configUrl);
        URL.revokeObjectURL(csvUrl);
      }, 200);
    } catch (error) {
      console.error(`Error exporting simulation data:`, error);
    }
  };
  
  // Handle clear all logs
  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all simulation logs?')) {
      simulationLogger.clearAllSessions();
      setSessions([]);
      setSelectedSession(null);
    }
  };
  
  if (sessions.length === 0) {
    return (
      <div className="simulation-logs-panel p-4 text-center text-gray-500">
        <FaList className="mx-auto mb-3 text-3xl" />
        <p>No simulation logs available</p>
        <p className="text-sm">Run a simulation to generate logs</p>
      </div>
    );
  }

  return (
    <div className="simulation-logs-panel p-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Simulation Logs</h3>
        <div className="flex space-x-2">
          <button
            className="btn btn-sm btn-outline flex items-center space-x-1"
            onClick={handleExportData}
            disabled={!selectedSession}
            title="Export configuration (JSON) and results (CSV)"
          >
            <FaDownload size={12} />
            <span className="text-xs">Export Data</span>
          </button>
          
          <button
            className="btn btn-sm btn-outline flex items-center space-x-1"
            onClick={handleClearLogs}
            title="Clear all logs"
          >
            <FaTrash size={12} />
            <span className="text-xs">Clear All</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Sessions list */}
        <div className="col-span-1 border-r pr-3">
          <h4 className="font-medium mb-2 text-sm">Sessions</h4>
          {sessions.map(session => (
            <SessionItem 
              key={session.id}
              session={session}
              isActive={session.id === currentSessionId}
              onClick={() => handleSelectSession(session)}
            />
          ))}
        </div>
        
        {/* Log details */}
        <div className="col-span-2">
          {selectedSession ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm">
                  Session Logs
                  {selectedSession.endTime ? ' (Completed)' : ' (Active)'}
                </h4>
                <div className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center">
                  <FaClock className="mr-1" size={10} />
                  <span>
                    {new Date(selectedSession.startTime).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex space-x-2 mb-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <FaSearch className="text-gray-400" size={12} />
                  </div>
                  <input
                    type="text"
                    placeholder="Filter logs..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="form-input pl-8 w-full py-1 text-sm"
                  />
                </div>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as any)}
                  className="form-select text-sm py-1"
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              
              {/* Log entries */}
              <div className="mt-3 max-h-96 overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No logs matching your filters
                  </div>
                ) : (
                  <div>
                    {filteredLogs.slice().reverse().map((log, idx) => (
                      <LogEntryItem key={idx} entry={log} />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Parameter changes */}
              {selectedSession.paramChanges.length > 0 && (
                <CollapsibleSection title="Parameter Changes" defaultExpanded={false} className="mt-4">
                  <div className="max-h-64 overflow-y-auto">
                    {selectedSession.paramChanges.slice().reverse().map((change, idx) => (
                      <div key={idx} className="bg-blue-50 p-2 rounded mb-1 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-700">PARAMETERS UPDATED</span>
                          <span className="text-xs text-gray-500">
                            {new Date(change.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-1 text-xs">
                          <p>Changed: {change.changedFields.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}
              
              {/* Results summary */}
              {selectedSession.results.length > 0 && (
                <CollapsibleSection title="Results Summary" defaultExpanded={false} className="mt-4">
                  <div className="max-h-64 overflow-y-auto">
                    {selectedSession.results.slice().reverse().map((result, idx) => (
                      <div key={idx} className="bg-green-50 p-2 rounded mb-1 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-green-700">RESULTS RECORDED</span>
                          <div className="text-xs text-gray-500">
                            <span>t={result.simTime.toFixed(2)}</span>
                            <span className="ml-2">{new Date(result.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="mt-1 text-xs">
                          {result.conservation ? (
                            <>
                              <p>Total Probability: {result.conservation.totalProbability.toFixed(6)}</p>
                              <p>Variation: {result.conservation.normVariation.toFixed(6)}</p>
                              <p>Positivity: {result.conservation.positivity ? 'Preserved' : 'Violated'}</p>
                            </>
                          ) : (
                            <p>No conservation data available</p>
                          )}
                          {result.geometric && (
                            <>
                              <hr className="my-1 border-green-200" />
                              {result.geometric.totalVolume !== undefined && 
                                <p>Volume: {result.geometric.totalVolume.toFixed(6)}</p>}
                              {result.geometric.totalArea !== undefined && 
                                <p>Area: {result.geometric.totalArea.toFixed(6)}</p>}
                              {result.geometric.effectiveDimension !== undefined && 
                                <p>Effective Dimension: {result.geometric.effectiveDimension.toFixed(4)}</p>}
                              {result.geometric.volumeEntropy !== undefined && 
                                <p>Volume Entropy: {result.geometric.volumeEntropy.toFixed(6)}</p>}
                            </>
                          )}
                          {result.statistics && (
                            <>
                              <hr className="my-1 border-green-200" />
                              {result.statistics.mean !== undefined && 
                                <p>Mean: {result.statistics.mean.toFixed(6)}</p>}
                              {result.statistics.variance !== undefined && 
                                <p>Variance: {result.statistics.variance.toFixed(6)}</p>}
                              {result.statistics.skewness !== undefined && 
                                <p>Skewness: {result.statistics.skewness.toFixed(6)}</p>}
                              {result.statistics.kurtosis !== undefined && 
                                <p>Kurtosis: {result.statistics.kurtosis.toFixed(6)}</p>}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Select a session to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationLogsPanel;