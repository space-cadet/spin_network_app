import React from 'react';

export interface ConsolePanelProps {
  logs: Array<{
    timestamp: number;
    message: string;
    type: 'info' | 'warning' | 'error';
  }>;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  logs = [],
}) => {
  return (
    <div className="h-full overflow-auto font-mono text-sm">
      <h2 className="text-lg font-semibold mb-4">Console</h2>
      <div className="space-y-1">
        {logs.map((log, index) => (
          <div 
            key={index}
            className={`p-1 ${
              log.type === 'error' ? 'text-red-500' :
              log.type === 'warning' ? 'text-yellow-500' :
              'text-gray-300'
            }`}
          >
            [{new Date(log.timestamp).toISOString()}] {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsolePanel;