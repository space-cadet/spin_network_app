import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Home, Settings, Activity, Book } from 'lucide-react';
import { AppLayout, ResizablePanel } from '../../src';

const ExampleApp: React.FC = () => {
  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { path: '/activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { path: '/docs', label: 'Documentation', icon: <Book className="w-4 h-4" /> },
  ];

  const rightContent = (
    <div className="flex items-center">
      <Settings className="w-5 h-5 text-white hover:text-primary-100 cursor-pointer" />
    </div>
  );

  return (
    <Router>
      <AppLayout
        title="Template Demo"
        titleIcon={<Activity className="w-6 h-6" />}
        navItems={navItems}
        rightContent={rightContent}
        version="v1.0.0"
        copyright="© Example Corp, 2025"
      >
        <div className="flex h-full">
          {/* Left Sidebar */}
          <ResizablePanel
            direction="horizontal"
            defaultSize={250}
            minSize={200}
            maxSize={400}
            className="bg-gray-100 p-4"
          >
            <div className="h-full overflow-auto">
              <h2 className="text-lg font-semibold mb-4">Navigation</h2>
              <ul className="space-y-2">
                <li className="p-2 bg-white rounded shadow hover:bg-gray-50 cursor-pointer">
                  Menu Item 1
                </li>
                <li className="p-2 bg-white rounded shadow hover:bg-gray-50 cursor-pointer">
                  Menu Item 2
                </li>
                <li className="p-2 bg-white rounded shadow hover:bg-gray-50 cursor-pointer">
                  Menu Item 3
                </li>
              </ul>
            </div>
          </ResizablePanel>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold mb-4">Welcome to Template Demo</h1>
              <p className="text-gray-600 mb-4">
                This is a demonstration of the core template components:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>AppLayout - Main application layout with header and footer</li>
                <li>ResizablePanel - Resizable panels for sidebars and content areas</li>
                <li>Responsive navigation with icons</li>
                <li>Configurable header and footer content</li>
              </ul>
            </div>

            {/* Additional Content */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-3">Features</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Responsive layout</li>
                  <li>Customizable navigation</li>
                  <li>Resizable panels</li>
                  <li>Dark mode ready</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-3">Getting Started</h2>
                <p className="text-gray-600">
                  Try resizing the left sidebar or adjusting the footer height to see the
                  ResizablePanel component in action.
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <ResizablePanel
            direction="horizontal"
            defaultSize={300}
            minSize={250}
            maxSize={500}
            className="bg-gray-100 p-4"
            handlePosition="start"
          >
            <div className="h-full overflow-auto">
              <h2 className="text-lg font-semibold mb-4">Details</h2>
              <div className="space-y-4">
                <div className="bg-white rounded p-4 shadow">
                  <h3 className="font-medium mb-2">Section 1</h3>
                  <p className="text-sm text-gray-600">
                    Example content for the right sidebar panel.
                  </p>
                </div>
                <div className="bg-white rounded p-4 shadow">
                  <h3 className="font-medium mb-2">Section 2</h3>
                  <p className="text-sm text-gray-600">
                    More example content showing panel scrolling.
                  </p>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </div>
      </AppLayout>
    </Router>
  );
};

export default ExampleApp;