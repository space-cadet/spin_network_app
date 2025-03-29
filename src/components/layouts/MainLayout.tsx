import React from 'react';
import { FaNetworkWired, FaChartLine, FaCog } from 'react-icons/fa';
import ResizablePanel from '../common/ResizablePanel';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-2 px-4 shadow-md z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaNetworkWired size={24} />
            <h1 className="text-xl font-bold">Spin Network Visualization</h1>
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              <li className="flex items-center">
                <a href="#" className="flex items-center space-x-1 hover:text-primary-100">
                  <FaNetworkWired />
                  <span>Network</span>
                </a>
              </li>
              <li className="flex items-center">
                <a href="#" className="flex items-center space-x-1 hover:text-primary-100">
                  <FaChartLine />
                  <span>Simulation</span>
                </a>
              </li>
              <li className="flex items-center">
                <a href="#" className="flex items-center space-x-1 hover:text-primary-100">
                  <FaCog />
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      
      {/* Footer - Resizable */}
      <ResizablePanel 
        direction="vertical" 
        defaultSize={30} 
        minSize={25} 
        maxSize={120}
        className="bg-gray-100 border-t border-gray-200 z-10"
        handlePosition="start"
      >
        <div className="px-4 h-full flex items-center">
          <div className="container mx-auto text-sm text-gray-500 flex justify-between">
            <div>Spin Network Visualization App v0.1.0</div>
            <div>© 2023</div>
          </div>
        </div>
      </ResizablePanel>
    </div>
  );
};

export default MainLayout;
