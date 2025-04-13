export { default as SimulationControls } from './SimulationControls';
export { default as SimulationResultsPanel } from './SimulationResultsPanel';
export { default as SimulationLogsPanel } from './EnhancedLogsPanel'; // Updated to use enhanced panel
export { default as SimulationDebugView } from './SimulationDebugView';
export { default as SimulationDebugPanel } from './SimulationDebugPanel';
// Keep original for direct use in the enhanced panel
import OriginalSimulationLogsPanel from './SimulationLogsPanel';
export { OriginalSimulationLogsPanel };