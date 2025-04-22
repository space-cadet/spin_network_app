import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaNetworkWired, FaChartLine, FaFolder, FaFlask, FaBook } from 'react-icons/fa';
import ResizablePanel from '../common/ResizablePanel';
import { Settings } from '../settings';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
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
                <Link to="/" className={`flex items-center hover:text-primary-100 ${location.pathname === '/' ? 'border-b-2 border-white' : ''}`}>
                  <FaNetworkWired className="text-white" />
                  <span className="text-white ml-1">Network</span>
                </Link>
              </li>

              <li className="flex items-center">
                <Link to="/explorer" className={`flex items-center hover:text-primary-100 ${location.pathname === '/explorer' ? 'border-b-2 border-white' : ''}`}>
                  <FaFolder className="text-white" />
                  <span className="text-white ml-1">Log Explorer</span>
                </Link>
              </li>

              <li className="flex items-center">
                <Link to="/docs" className={`flex items-center hover:text-primary-100 ${location.pathname === '/docs' ? 'border-b-2 border-white' : ''}`}>
                  <FaBook className="text-white" />
                  <span className="text-white ml-1">Documentation</span>
                </Link>
              </li>
              <li className="flex items-center">
                <Link to="/testing" className={`flex items-center hover:text-primary-100 ${location.pathname === '/testing' ? 'border-b-2 border-white' : ''}`}>
                  <FaFlask className="text-white" />
                  <span className="text-white ml-1">Testing</span>
                </Link>
              </li>
              <li className="flex items-center">
                <Settings />
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
            <div>© Deepak Vaid, 2025</div>
          </div>
        </div>
      </ResizablePanel>
    </div>
  );
};

export default MainLayout;
