import React from 'react';

export const ConsolePanel: React.FC = () => {
  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Console</h2>
      <div className="font-mono text-sm whitespace-pre overflow-auto flex-1 bg-gray-50 dark:bg-gray-800 p-2 rounded">
Welcome to Graph Library Test App
Active backend: graphology
      </div>
    </div>
  );
};