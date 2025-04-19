import React from 'react';
import { Outlet } from 'react-router-dom';
import DocsSidebar from './DocsSidebar';
import './DocsStyles.css';

const DocsLayout: React.FC = () => {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <DocsSidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DocsLayout;